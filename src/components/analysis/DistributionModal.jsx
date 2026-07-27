import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

import TextInput from "../TextInput";
import PremiumSelect from "../PremiumSelect";
import useSavingAllocationStore from "../../store/savingAllocationStore";
import useSavingBucketStore from "../../store/savingBucketStore";
import { showToast } from "../../store/toastStore";
import { formatAmount } from "./bucketMeta";

const emptyRow = () => ({
  key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  bucketId: "",
  amount: "",
});

/**
 * Distribute a pending saving across one or more buckets.
 * Bottom sheet on mobile, centered modal on larger screens.
 */
const DistributionModal = ({ open, saving, onClose, onDistributed }) => {
  const { buckets } = useSavingBucketStore();
  const { distribute } = useSavingAllocationStore();

  const [rows, setRows] = useState([emptyRow()]);
  const [savingSubmit, setSavingSubmit] = useState(false);

  const remainingTotal = Number(saving?.remaining_amount) || 0;

  useEffect(() => {
    if (!open || !saving) return;

    const firstBucket = buckets[0];
    setRows([
      {
        ...emptyRow(),
        bucketId: firstBucket ? String(firstBucket.id) : "",
        amount: "",
      },
    ]);
    setSavingSubmit(false);
  }, [open, saving, buckets]);

  const allocated = useMemo(() => {
    return rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  }, [rows]);

  const leftover = remainingTotal - allocated;

  const selectedBucketIds = useMemo(() => {
    return rows.map((row) => String(row.bucketId)).filter(Boolean);
  }, [rows]);

  const rowErrors = useMemo(() => {
    return rows.map((row, index) => {
      const amount = Number(row.amount);
      const errors = [];

      if (!row.bucketId) {
        errors.push("Select a bucket.");
      } else {
        const duplicate = rows.some(
          (other, otherIndex) =>
            otherIndex !== index &&
            String(other.bucketId) === String(row.bucketId)
        );
        if (duplicate) errors.push("Bucket already selected.");
      }

      if (!row.amount || amount <= 0) {
        errors.push("Amount must be greater than 0.");
      }

      return errors;
    });
  }, [rows]);

  const hasRowErrors = rowErrors.some((errors) => errors.length > 0);
  const overAllocated = leftover < -0.001;
  const canSave =
    rows.length > 0 &&
    !hasRowErrors &&
    !overAllocated &&
    allocated > 0 &&
    !savingSubmit;

  if (!open || !saving) return null;

  const updateRow = (key, patch) => {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row))
    );
  };

  const addRow = () => {
    const nextBucket = buckets.find(
      (bucket) => !selectedBucketIds.includes(String(bucket.id))
    );

    setRows((prev) => [
      ...prev,
      {
        ...emptyRow(),
        bucketId: nextBucket ? String(nextBucket.id) : "",
      },
    ]);
  };

  const removeRow = (key) => {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((row) => row.key !== key);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;

    try {
      setSavingSubmit(true);

      const response = await distribute({
        savingId: saving.id,
        allocations: rows.map((row) => ({
          bucketId: Number(row.bucketId),
          amount: Number(row.amount),
        })),
      });

      if (!response.success) {
        showToast("error", response.message || "Failed to distribute saving.");
        return;
      }

      showToast("success", "Saving distributed successfully.");
      onClose();
      if (onDistributed) await onDistributed();
    } finally {
      setSavingSubmit(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={savingSubmit ? undefined : onClose}
        disabled={savingSubmit}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 flex max-h-[88vh] w-full max-w-sm flex-col rounded-t-2xl border border-[#7b2cbf]/40 bg-[#240046] shadow-2xl shadow-black/50 sm:rounded-2xl"
      >
        <div className="border-b border-[#3c096c] px-4 pt-4 pb-3">
          <h2 className="text-base font-semibold text-white">
            Distribute Savings
          </h2>
          <p className="mt-1 truncate text-sm text-[#e0aaff]">{saving.title}</p>
          <p className="mt-0.5 text-[11px] text-[#9d4edd]">
            Remaining {formatAmount(saving.remaining_amount)}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {rows.map((row, index) => {
              const options = buckets.map((bucket) => {
                const taken =
                  selectedBucketIds.includes(String(bucket.id)) &&
                  String(bucket.id) !== String(row.bucketId);

                return {
                  value: String(bucket.id),
                  label: taken
                    ? `${bucket.name} (used)`
                    : bucket.name,
                  color: bucket.color || "#7b2cbf",
                  disabled: taken,
                };
              });

              return (
                <div
                  key={row.key}
                  className="rounded-xl border border-[#3c096c] bg-[#3c096c]/30 p-2.5"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[11px] font-medium text-[#c77dff]">
                      Bucket {index + 1}
                    </p>
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(row.key)}
                        disabled={savingSubmit}
                        className="rounded-lg p-1 text-[#ff7b7b] transition hover:bg-[#3c096c]"
                        aria-label="Remove bucket"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>

                  <PremiumSelect
                    className="mb-2"
                    label="Bucket"
                    value={row.bucketId}
                    options={options.filter((item) => !item.disabled || item.value === row.bucketId)}
                    onChange={(bucketId) => updateRow(row.key, { bucketId })}
                    placeholder="Select bucket"
                  />

                  <TextInput
                    compact
                    label="Amount"
                    type="number"
                    name={`amount-${row.key}`}
                    placeholder="1000"
                    value={row.amount}
                    onChange={(e) =>
                      updateRow(row.key, { amount: e.target.value })
                    }
                    disabled={savingSubmit}
                  />

                  {rowErrors[index]?.length > 0 && (
                    <p className="mt-1 text-[10px] text-[#f87171]">
                      {rowErrors[index][0]}
                    </p>
                  )}
                </div>
              );
            })}

            {buckets.length > rows.length && (
              <button
                type="button"
                onClick={addRow}
                disabled={savingSubmit}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#7b2cbf]/60 px-3 py-2 text-xs font-medium text-[#e0aaff] transition hover:bg-[#3c096c] disabled:opacity-50"
              >
                <FiPlus size={14} />
                Add Another Bucket
              </button>
            )}

            {buckets.length === 0 && (
              <p className="rounded-xl border border-[#e0aaff1f] px-3 py-3 text-center text-[11px] text-[#c77dff]">
                Create a saving bucket first before distributing.
              </p>
            )}
          </div>

          <div className="border-t border-[#3c096c] px-4 py-3">
            <div className="mb-3 flex items-center justify-between text-xs">
              <span className="text-[#c77dff]">Allocated</span>
              <span className="font-semibold text-white">
                {formatAmount(allocated)}
              </span>
            </div>
            <div className="mb-3 flex items-center justify-between text-xs">
              <span className="text-[#c77dff]">Remaining</span>
              <span
                className={`font-semibold ${
                  leftover < 0 ? "text-[#f87171]" : "text-[#4ade80]"
                }`}
              >
                {formatAmount(leftover)}
              </span>
            </div>

            {overAllocated && (
              <p className="mb-2 text-[10px] text-[#f87171]">
                Cannot allocate more than remaining amount.
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={savingSubmit}
                className="flex-1 rounded-xl border border-[#7b2cbf] px-3 py-2.5 text-sm font-medium text-[#e0aaff] transition hover:bg-[#3c096c] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSave}
                className="flex-1 rounded-xl bg-[#7b2cbf] px-3 py-2.5 text-sm font-medium text-white transition hover:bg-[#9d4edd] disabled:opacity-50"
              >
                {savingSubmit ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DistributionModal;
