const ImportBudgetsModal = ({
  open,
  sourceCycleName,
  categories,
  selectedIds,
  loading = false,
  saving = false,
  onClose,
  onToggle,
  onSelectAll,
  onClearAll,
  onConfirm,
  confirmLabel = "Import",
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={saving ? undefined : onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 max-h-[85vh] w-full max-w-sm overflow-hidden rounded-t-2xl border border-[#7b2cbf]/40 bg-[#240046] shadow-2xl shadow-black/50 sm:rounded-2xl"
      >
        <div className="border-b border-[#3c096c] px-4 py-3">
          <h2 className="text-base font-semibold text-white">
            Import Budgets
          </h2>
          <p className="mt-0.5 text-[11px] text-[#9d4edd]">
            {sourceCycleName
              ? `From ${sourceCycleName} · uncheck any you don't need`
              : "Choose budgets to copy"}
          </p>
        </div>

        <div className="max-h-[58vh] overflow-y-auto px-4 py-3">
          {loading ? (
            <p className="py-8 text-center text-xs text-[#9d4edd]">
              Loading budgets...
            </p>
          ) : categories.length === 0 ? (
            <p className="py-8 text-center text-xs text-[#9d4edd]">
              No budgets found in the previous cycle.
            </p>
          ) : (
            <>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-[#e0aaff]">
                  {selectedIds.length} of {categories.length} selected
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onSelectAll}
                    className="text-[10px] text-[#22d3ee] transition hover:text-[#67e8f9]"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={onClearAll}
                    className="text-[10px] text-[#9d4edd] transition hover:text-[#c77dff]"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                {categories.map((category) => {
                  const checked = selectedIds.includes(category.id);

                  return (
                    <label
                      key={category.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                        checked
                          ? "border-[#22d3ee]/30 bg-[#22d3ee]/10"
                          : "border-[#3c096c] bg-[#3c096c]/20 hover:bg-[#3c096c]/35"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggle(category.id)}
                        className="h-4 w-4 rounded border-[#3c096c] bg-[#240046] accent-[#22d3ee]"
                      />
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: category.color || "#7b2cbf" }}
                      />
                      <span className="min-w-0 flex-1 truncate text-sm text-white">
                        {category.name}
                      </span>
                      <span className="shrink-0 text-xs font-medium text-[#c77dff]">
                        ₹{Number(category.budget || 0).toLocaleString()}
                      </span>
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2 border-t border-[#3c096c] px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-xl border border-[#7b2cbf] px-3 py-2.5 text-sm font-medium text-[#e0aaff] transition hover:bg-[#3c096c] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={
              saving || loading || categories.length === 0 || selectedIds.length === 0
            }
            className="flex-1 rounded-xl bg-[#0891b2] px-3 py-2.5 text-sm font-medium text-white transition hover:bg-[#06b6d4] disabled:opacity-50"
          >
            {saving ? "Importing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportBudgetsModal;
