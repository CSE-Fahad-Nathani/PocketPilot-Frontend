import { useState } from "react";

import useSavingBucketStore from "../../store/savingBucketStore";
import { showToast } from "../../store/toastStore";
import { formatAmount } from "./bucketMeta";

const ArchiveBucketDialog = ({ open, bucket, onClose, onSuccess }) => {
  const { archive } = useSavingBucketStore();
  const [saving, setSaving] = useState(false);

  if (!open || !bucket) return null;

  const handleArchive = async () => {
    try {
      setSaving(true);
      const response = await archive(bucket.id);

      if (!response.success) {
        showToast("error", response.message || "Failed to archive bucket.");
        return;
      }

      showToast("success", "Bucket archived successfully.");
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
        <h2 className="text-base font-semibold text-white">Archive Bucket?</h2>
        <p className="mt-1 text-sm text-[#e0aaff]">{bucket.name}</p>
        <p className="mt-0.5 text-[11px] text-[#9d4edd]">Current balance {formatAmount(bucket.balance)}</p>
        <p className="mt-3 text-[11px] leading-snug text-[#c77dff]">This bucket will no longer appear in your bucket list.</p>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} disabled={saving} className="flex-1 rounded-xl border border-[#7b2cbf] px-3 py-2.5 text-sm font-medium text-[#e0aaff] transition hover:bg-[#3c096c] disabled:opacity-50">Cancel</button>
          <button type="button" onClick={handleArchive} disabled={saving} className="flex-1 rounded-xl bg-[#7b2cbf] px-3 py-2.5 text-sm font-medium text-white transition hover:bg-[#9d4edd] disabled:opacity-50">{saving ? "Archiving..." : "Archive"}</button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveBucketDialog;
