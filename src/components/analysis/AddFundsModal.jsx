import { useEffect, useState } from "react";

import TextInput from "../TextInput";
import { addManualFunds } from "../../services/savingService";
import { showToast } from "../../store/toastStore";

const today = () => new Date().toISOString().split("T")[0];

const AddFundsModal = ({ open, onClose, onCreated }) => {
  const [amount, setAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState(today());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAmount("");
    setTransactionDate(today());
    setNote("");
    setSaving(false);
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      showToast("error", "Enter a valid amount greater than 0.");
      return;
    }

    if (!transactionDate) {
      showToast("error", "Date is required.");
      return;
    }

    try {
      setSaving(true);

      const response = await addManualFunds({
        amount: numericAmount,
        transactionDate,
        note: note.trim() || undefined,
        title: "Manual top-up",
      });

      if (!response.success) {
        showToast("error", response.message || "Failed to add funds.");
        return;
      }

      showToast("success", "Added to Pending Savings. Distribute when ready.");
      onClose();
      if (onCreated) await onCreated();
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message ||
          error.message ||
          "Failed to add funds."
      );
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
        <h2 className="text-base font-semibold text-white">Add funds</h2>
        <p className="mt-0.5 text-[11px] text-[#9d4edd]">
          Goes to Pending Savings as Manual top-up. Distribute to buckets next.
        </p>

        <form onSubmit={handleSubmit} className="mt-3">
          <TextInput
            compact
            label="Amount"
            type="number"
            name="amount"
            value={amount}
            placeholder="5000"
            onChange={(e) => setAmount(e.target.value)}
          />

          <TextInput
            compact
            label="Date"
            type="date"
            name="transactionDate"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
          />

          <TextInput
            compact
            label="Note (optional)"
            name="note"
            value={note}
            placeholder="Bonus / gift / extra cash"
            onChange={(e) => setNote(e.target.value)}
          />

          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-xl border border-[#7b2cbf] px-3 py-2.5 text-sm text-[#e0aaff] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-[#7b2cbf] px-3 py-2.5 text-sm font-medium text-white transition hover:bg-[#9d4edd] disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add to Pending"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFundsModal;
