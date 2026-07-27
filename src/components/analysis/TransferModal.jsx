import { useEffect, useMemo, useState } from "react";

import TextInput from "../TextInput";
import PremiumSelect from "../PremiumSelect";
import useSavingBucketStore from "../../store/savingBucketStore";
import { showToast } from "../../store/toastStore";
import { formatAmount } from "./bucketMeta";

const TransferModal = ({ open, bucket, buckets = [], onClose, onSuccess }) => {
  const { transfer } = useSavingBucketStore();
  const [toBucketId, setToBucketId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !bucket) return;
    const firstTarget = buckets.find((item) => item.id !== bucket.id);
    setToBucketId(firstTarget ? String(firstTarget.id) : "");
    setAmount("");
    setNote("");
    setSaving(false);
  }, [open, bucket, buckets]);

  const balance = Number(bucket?.balance) || 0;
  const amountValue = Number(amount) || 0;
  const sameBucket = String(toBucketId) === String(bucket?.id);
  const tooMuch = amount && amountValue > balance;
  const options = useMemo(
    () =>
      buckets
        .filter((item) => item.id !== bucket?.id)
        .map((item) => ({
          value: String(item.id),
          label: item.name,
          color: item.color || "#7b2cbf",
        })),
    [buckets, bucket]
  );

  if (!open || !bucket) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!toBucketId) {
      showToast("error", "Select a destination bucket.");
      return;
    }
    if (sameBucket) {
      showToast("error", "Cannot transfer to the same bucket.");
      return;
    }
    if (!amountValue || amountValue <= 0) {
      showToast("error", "Amount must be greater than 0.");
      return;
    }
    if (amountValue > balance) {
      showToast("error", "Amount cannot exceed bucket balance.");
      return;
    }

    try {
      setSaving(true);
      const response = await transfer({
        fromBucketId: bucket.id,
        toBucketId: Number(toBucketId),
        amount: amountValue,
        note: note.trim(),
      });

      if (!response.success) {
        showToast("error", response.message || "Failed to transfer amount.");
        return;
      }

      showToast("success", "Amount transferred successfully.");
      onClose();
      if (onSuccess) await onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={saving ? undefined : onClose} disabled={saving} />
      <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-sm rounded-t-2xl border border-[#7b2cbf]/40 bg-[#240046] p-4 shadow-2xl shadow-black/50 sm:rounded-2xl">
        <h2 className="text-base font-semibold text-white">Transfer Money</h2>
        <p className="mt-1 text-sm text-[#e0aaff]">From {bucket.name}</p>
        <p className="mt-0.5 text-[11px] text-[#9d4edd]">Balance {formatAmount(balance)}</p>

        <form onSubmit={handleSubmit} className="mt-3">
          <PremiumSelect className="mb-2.5" label="To Bucket" value={toBucketId} options={options} onChange={setToBucketId} placeholder="Select bucket" />
          <TextInput compact label="Amount" type="number" name="amount" placeholder="500" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={saving} />
          {(sameBucket || tooMuch) && (
            <p className="-mt-1 mb-2.5 text-[10px] text-[#f87171]">{sameBucket ? "Cannot transfer to same bucket." : "Amount cannot exceed bucket balance."}</p>
          )}
          <TextInput compact label="Note" name="note" placeholder="Changed Priority" value={note} onChange={(e) => setNote(e.target.value)} disabled={saving} />
          <div className="flex gap-2">
            <button type="button" onClick={onClose} disabled={saving} className="flex-1 rounded-xl border border-[#7b2cbf] px-3 py-2.5 text-sm font-medium text-[#e0aaff] transition hover:bg-[#3c096c] disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={saving || !toBucketId || !amountValue || sameBucket || tooMuch} className="flex-1 rounded-xl bg-[#7b2cbf] px-3 py-2.5 text-sm font-medium text-white transition hover:bg-[#9d4edd] disabled:opacity-50">{saving ? "Transferring..." : "Transfer"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;
