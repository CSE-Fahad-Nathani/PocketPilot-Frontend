import { useEffect, useState } from "react";

import TextInput from "../TextInput";
import useSavingBucketStore from "../../store/savingBucketStore";
import { showToast } from "../../store/toastStore";
import { formatAmount } from "./bucketMeta";

const WithdrawModal = ({ open, bucket, onClose, onSuccess }) => {
  const { withdraw } = useSavingBucketStore();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setAmount("");
    setNote("");
    setSaving(false);
  }, [open]);

  if (!open || !bucket) return null;

  const balance = Number(bucket.balance) || 0;
  const amountValue = Number(amount) || 0;
  const tooMuch = amount && amountValue > balance;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast("error", "Title is required.");
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
      const response = await withdraw({
        bucketId: bucket.id,
        amount: amountValue,
        title: title.trim(),
        note: note.trim(),
      });

      if (!response.success) {
        showToast("error", response.message || "Failed to withdraw amount.");
        return;
      }

      showToast("success", "Amount withdrawn successfully.");
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
        <h2 className="text-base font-semibold text-white">Withdraw Money</h2>
        <p className="mt-1 text-sm text-[#e0aaff]">{bucket.name}</p>
        <p className="mt-0.5 text-[11px] text-[#9d4edd]">Current Balance {formatAmount(balance)}</p>

        <form onSubmit={handleSubmit} className="mt-3">
          <TextInput compact label="Title" name="title" placeholder="Flight Booking" value={title} onChange={(e) => setTitle(e.target.value)} disabled={saving} />
          <TextInput compact label="Amount" type="number" name="amount" placeholder="1200" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={saving} />
          {tooMuch && <p className="-mt-1 mb-2.5 text-[10px] text-[#f87171]">Amount cannot exceed bucket balance.</p>}
          <TextInput compact label="Note" name="note" placeholder="Goa Vacation" value={note} onChange={(e) => setNote(e.target.value)} disabled={saving} />
          <div className="flex gap-2">
            <button type="button" onClick={onClose} disabled={saving} className="flex-1 rounded-xl border border-[#7b2cbf] px-3 py-2.5 text-sm font-medium text-[#e0aaff] transition hover:bg-[#3c096c] disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={saving || !title.trim() || !amountValue || tooMuch} className="flex-1 rounded-xl bg-[#7b2cbf] px-3 py-2.5 text-sm font-medium text-white transition hover:bg-[#9d4edd] disabled:opacity-50">{saving ? "Withdrawing..." : "Withdraw"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawModal;
