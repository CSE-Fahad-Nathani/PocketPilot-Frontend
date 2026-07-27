import { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

/**
 * Compact phone-friendly select.
 * options: [{ value, label, color?, badge? }]
 * badge is optional — only pass when it fits the layout.
 */
const PremiumSelect = ({
  label,
  value,
  options = [],
  onChange,
  placeholder = "Select",
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const selected =
    options.find((item) => String(item.value) === String(value)) || null;

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleSelect = (optionValue) => {
    onChange(String(optionValue));
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      {label && (
        <label className="mb-1 block text-[11px] font-medium text-[#c77dff]">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className={`flex w-full items-center gap-1.5 rounded-xl bg-[#3c096c] px-2.5 py-2 text-left outline-none transition ${
          open ? "ring-2 ring-[#9d4edd]" : ""
        }`}
      >
        {selected?.color && (
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: selected.color }}
          />
        )}
        <span className="min-w-0 flex-1 truncate text-sm text-white">
          {selected?.label || placeholder}
        </span>
        {selected?.badge && (
          <span className="inline-flex shrink-0 items-center rounded border border-[#7b2cbf]/40 bg-[#5a189a]/40 px-1 py-px text-[8px] font-medium tracking-wide uppercase text-[#e0aaff]">
            {selected.badge}
          </span>
        )}
        <FiChevronDown
          size={12}
          className={`shrink-0 text-[#c77dff] transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-lg border border-[#7b2cbf]/50 bg-[#240046] shadow-xl shadow-black/40">
          <div className="max-h-52 overflow-y-auto py-0.5">
            {options.length === 0 ? (
              <p className="px-2.5 py-2 text-xs text-[#9d4edd]">No options</p>
            ) : (
              options.map((item) => {
                const isActive = String(item.value) === String(value);

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleSelect(item.value)}
                    className={`flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left transition ${
                      isActive
                        ? "bg-[#5a189a]/50 text-white"
                        : "text-[#e0aaff] active:bg-[#3c096c]"
                    }`}
                  >
                    {item.color && (
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: item.color }}
                      />
                    )}
                    <span className="min-w-0 flex-1 truncate text-xs font-medium">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="inline-flex shrink-0 items-center rounded border border-[#7b2cbf]/40 px-1 py-px text-[8px] font-medium tracking-wide uppercase text-[#c77dff]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumSelect;
