import { useEffect, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

const CollapsibleSection = ({
  id,
  title,
  count,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
  children,
  className = "",
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  useEffect(() => {
    if (!isControlled) {
      setInternalOpen(defaultOpen);
    }
  }, [defaultOpen, isControlled]);

  const toggle = () => {
    if (isControlled) {
      onOpenChange?.(!open);
    } else {
      setInternalOpen((prev) => !prev);
    }
  };

  return (
    <section id={id} className={`mb-4 scroll-mt-24 ${className}`}>
      <button
        type="button"
        onClick={toggle}
        className="mb-2 flex w-full items-center justify-between gap-2 rounded-xl border border-[#e0aaff1f] bg-[#240046]/80 px-3 py-2 text-left transition active:scale-[0.99]"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#e0aaff]">{title}</p>
          {count !== undefined ? (
            <p className="mt-0.5 text-[10px] text-[#9d4edd]">{count}</p>
          ) : null}
        </div>
        <FiChevronDown
          size={16}
          className={`shrink-0 text-[#9d4edd] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? children : null}
    </section>
  );
};

export default CollapsibleSection;
