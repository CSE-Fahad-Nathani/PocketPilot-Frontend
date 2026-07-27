import { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

const FLOW_META = {
  flexible: {
    badge: "Flex",
    badgeClass: "bg-[#4ade80]/15 text-[#86efac] border-[#4ade80]/25",
    dotClass: "bg-[#4ade80]",
  },
  fixed: {
    badge: "Paid",
    badgeClass: "bg-orange-400/15 text-orange-200 border-orange-400/25",
    dotClass: "bg-orange-400",
  },
};

const FlowBadge = ({ flow }) => {
  const meta = FLOW_META[flow] || FLOW_META.flexible;

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded border px-1 py-px text-[8px] font-medium tracking-wide uppercase ${meta.badgeClass}`}
    >
      {meta.badge}
    </span>
  );
};

const CategoryTypeSelect = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const selected =
    options.find((item) => item.value === value) || options[0];

  const flexibleOptions = options.filter((item) => item.flow === "flexible");
  const fixedOptions = options.filter((item) => item.flow === "fixed");

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
    onChange(optionValue);
    setOpen(false);
  };

  const renderGroup = (title, items) => {
    if (items.length === 0) return null;

    return (
      <div>
        <p className="px-2.5 pt-1.5 pb-0.5 text-[9px] font-medium uppercase tracking-wider text-[#9d4edd]">
          {title}
        </p>
        {items.map((item) => {
          const isActive = item.value === value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => handleSelect(item.value)}
              className={`flex w-full items-center justify-between gap-1.5 px-2.5 py-1.5 text-left transition ${
                isActive
                  ? "bg-[#5a189a]/50 text-white"
                  : "text-[#e0aaff] active:bg-[#3c096c]"
              }`}
            >
              <span className="truncate text-xs font-medium">{item.label}</span>
              <FlowBadge flow={item.flow} />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div ref={rootRef} className="relative min-w-0">
      <label className="mb-1 block text-[11px] font-medium text-[#c77dff]">
        Type
      </label>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className={`flex w-full items-center gap-1 rounded-xl bg-[#3c096c] px-2.5 py-2 text-left outline-none transition ${
          open ? "ring-2 ring-[#9d4edd]" : ""
        }`}
      >
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            FLOW_META[selected.flow]?.dotClass || "bg-[#7b2cbf]"
          }`}
        />
        <span className="min-w-0 flex-1 truncate text-sm text-white">
          {selected.label}
        </span>
        <FlowBadge flow={selected.flow} />
        <FiChevronDown
          size={12}
          className={`shrink-0 text-[#c77dff] transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 z-50 mt-1 w-[min(100vw-2rem,16rem)] overflow-hidden rounded-lg border border-[#7b2cbf]/50 bg-[#240046] shadow-xl shadow-black/40">
          <div className="max-h-52 overflow-y-auto py-0.5">
            {renderGroup("Flexible", flexibleOptions)}
            {flexibleOptions.length > 0 && fixedOptions.length > 0 && (
              <div className="mx-2 my-0.5 border-t border-[#3c096c]" />
            )}
            {renderGroup("Fixed", fixedOptions)}
          </div>
        </div>
      )}
    </div>
  );
};

export { FlowBadge, FLOW_META };
export default CategoryTypeSelect;
