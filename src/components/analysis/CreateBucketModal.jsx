import { useEffect, useState } from "react";

import TextInput from "../TextInput";
import useSavingBucketStore from "../../store/savingBucketStore";
import { showToast } from "../../store/toastStore";
import {
  BUCKET_COLOR_OPTIONS,
  BUCKET_ICON_OPTIONS,
  BucketIcon,
} from "./bucketMeta";

const CreateBucketModal = ({ open, onClose, onCreated }) => {
  const { createBucket } = useSavingBucketStore();

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("star");
  const [color, setColor] = useState(BUCKET_COLOR_OPTIONS[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName("");
    setIcon("star");
    setColor(BUCKET_COLOR_OPTIONS[0]);
    setSaving(false);
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast("error", "Bucket name is required.");
      return;
    }

    try {
      setSaving(true);

      const response = await createBucket({
        name: name.trim(),
        icon,
        color,
      });

      if (!response.success) {
        showToast("error", response.message || "Failed to create bucket.");
        return;
      }

      showToast("success", "Saving bucket created successfully.");
      onClose();
      if (onCreated) await onCreated();
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
        <h2 className="text-base font-semibold text-white">Create Bucket</h2>
        <p className="mt-0.5 text-[11px] text-[#9d4edd]">
          Organize savings into goals.
        </p>

        <form onSubmit={handleSubmit} className="mt-3">
          <TextInput
            compact
            label="Bucket Name"
            name="name"
            placeholder="Trip"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
          />

          <div className="mb-2.5">
            <p className="mb-1 text-[11px] font-medium text-[#c77dff]">Icon</p>
            <div className="flex flex-wrap gap-1.5">
              {BUCKET_ICON_OPTIONS.map((item) => {
                const active = item.value === icon;

                return (
                  <button
                    key={item.value}
                    type="button"
                    disabled={saving}
                    onClick={() => setIcon(item.value)}
                    className={`rounded-lg border p-1 transition ${
                      active
                        ? "border-[#9d4edd] bg-[#5a189a]/40"
                        : "border-[#3c096c] bg-[#3c096c]/40"
                    }`}
                    title={item.label}
                  >
                    <BucketIcon icon={item.value} color={color} size={14} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-3">
            <p className="mb-1 text-[11px] font-medium text-[#c77dff]">Color</p>
            <div className="flex flex-wrap gap-2">
              {BUCKET_COLOR_OPTIONS.map((swatch) => {
                const active = swatch === color;

                return (
                  <button
                    key={swatch}
                    type="button"
                    disabled={saving}
                    onClick={() => setColor(swatch)}
                    className={`h-7 w-7 rounded-full transition ${
                      active ? "ring-2 ring-white ring-offset-2 ring-offset-[#240046]" : ""
                    }`}
                    style={{ background: swatch }}
                    aria-label={swatch}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex gap-2">
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
              disabled={saving || !name.trim()}
              className="flex-1 rounded-xl bg-[#7b2cbf] px-3 py-2.5 text-sm font-medium text-white transition hover:bg-[#9d4edd] disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBucketModal;
