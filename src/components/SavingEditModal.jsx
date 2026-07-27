import { useEffect, useState } from "react";

import TextInput from "./TextInput";
import PremiumSelect from "./PremiumSelect";
import useSavingStore from "../store/savingStore";
import { showToast } from "../store/toastStore";

const TYPE_OPTIONS = [
  { value: "DEPOSIT", label: "Deposit" },
  { value: "WITHDRAWAL", label: "Withdrawal" },
];

const toDateInput = (value) => {
  if (!value) return new Date().toISOString().split("T")[0];
  return String(value).slice(0, 10);
};

const emptyForm = () => ({
  type: "DEPOSIT",
  title: "",
  amount: "",
  transactionDate: toDateInput(),
  note: "",
  bucketId: null,
});

/**
 * View / edit a saving transaction.
 * Create is intentionally not supported — savings are auto-created on cycle end.
 */
const SavingEditModal = ({ open, savingId, onClose, onSaved }) => {
  const { getSavingById, updateSaving } = useSavingStore();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !savingId) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);

      const response = await getSavingById(savingId);

      if (cancelled) return;

      if (!response.success || !response.data) {
        showToast("error", response.message || "Failed to load saving.");
        onClose();
        return;
      }

      const data = response.data;
      setForm({
        type: data.type || "DEPOSIT",
        title: data.title || "",
        amount: String(Number(data.amount) || ""),
        transactionDate: toDateInput(data.transaction_date),
        note: data.note || "",
        bucketId: data.bucket_id ?? null,
      });
      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [open, savingId]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      showToast("error", "Title is required.");
      return;
    }

    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      showToast("error", "Enter a valid amount.");
      return;
    }

    try {
      setSaving(true);

      const response = await updateSaving(savingId, {
        bucketId: form.bucketId,
        type: form.type,
        title: form.title.trim(),
        amount,
        transactionDate: form.transactionDate,
        note: form.note.trim(),
      });

      if (!response.success) {
        showToast("error", response.message || "Failed to update saving.");
        return;
      }

      showToast("success", "Saving updated successfully.");
      onClose();
      if (onSaved) await onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={saving ? undefined : onClose}
        disabled={saving}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-sm rounded-t-2xl border border-[#7b2cbf]/40 bg-[#240046] p-4 shadow-2xl shadow-black/50 sm:rounded-2xl"
      >
        <h2 className="text-base font-semibold text-white">Edit Saving</h2>
        <p className="mt-0.5 text-[11px] text-[#9d4edd]">
          Adjust deposits or record withdrawals from savings.
        </p>

        {loading ? (
          <p className="mt-4 py-6 text-center text-sm text-[#c77dff]">
            Loading...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-3">
            <PremiumSelect
              className="mb-2.5"
              label="Type"
              value={form.type}
              options={TYPE_OPTIONS}
              onChange={(type) => setForm((prev) => ({ ...prev, type }))}
            />

            <TextInput
              compact
              label="Title"
              name="title"
              placeholder="Bought earphones"
              value={form.title}
              onChange={handleChange}
              disabled={saving}
            />

            <div className="grid grid-cols-2 gap-2">
              <TextInput
                compact
                label="Amount"
                type="number"
                name="amount"
                placeholder="5000"
                value={form.amount}
                onChange={handleChange}
                disabled={saving}
              />
              <TextInput
                compact
                label="Date"
                type="date"
                name="transactionDate"
                value={form.transactionDate}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <TextInput
              compact
              label="Note"
              name="note"
              placeholder="Optional"
              value={form.note}
              onChange={handleChange}
              disabled={saving}
            />

            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 rounded-xl border border-[#7b2cbf] px-3 py-2.5 text-sm font-medium text-[#e0aaff] transition hover:bg-[#3c096c] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-xl bg-[#7b2cbf] px-3 py-2.5 text-sm font-medium text-white transition hover:bg-[#9d4edd] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Update"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SavingEditModal;
