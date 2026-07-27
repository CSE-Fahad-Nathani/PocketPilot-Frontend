import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";

const FloatingActionButton = ({ actions = [] }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const handleAction = (action) => {
    setOpen(false);
    action.onClick?.();
  };

  return (
    <div className="fixed bottom-24 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <>
          <button
            type="button"
            aria-label="Close quick actions"
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpen(false)}
          />

          <div className="relative z-50 mb-1 flex flex-col items-end gap-3">
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => handleAction(action)}
                className="flex items-center gap-3 rounded-full bg-[#240046] py-2 pl-4 pr-2 shadow-lg ring-1 ring-[#7b2cbf]/50 transition hover:bg-[#3c096c]"
              >
                <span className="text-sm font-medium text-white">
                  {action.label}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#5a189a] text-white">
                  {typeof action.icon === "string" ? (
                    <span className="text-lg leading-none">{action.icon}</span>
                  ) : (
                    action.icon || <FiPlus size={20} strokeWidth={2.5} />
                  )}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open quick actions"}
        onClick={() => setOpen((prev) => !prev)}
        className={`relative z-50 flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full bg-[#7b2cbf] text-white shadow-xl transition hover:scale-105 active:scale-95 ${
          open ? "rotate-45" : ""
        }`}
      >
        <FiPlus size={32} strokeWidth={2.75} className="shrink-0" />
      </button>
    </div>
  );
};

export default FloatingActionButton;
