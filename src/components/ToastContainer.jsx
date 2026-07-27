import useToastStore from "../store/toastStore";

const STYLES = {
  success: {
    border: "border-emerald-400/50",
    bg: "bg-emerald-500/15",
    text: "text-emerald-200",
    accent: "bg-emerald-400",
  },
  error: {
    border: "border-red-400/50",
    bg: "bg-red-500/15",
    text: "text-red-200",
    accent: "bg-red-400",
  },
  info: {
    border: "border-[#9d4edd]/50",
    bg: "bg-[#3c096c]/80",
    text: "text-[#e0aaff]",
    accent: "bg-[#9d4edd]",
  },
};

const ToastContainer = () => {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed top-3 right-3 left-3 z-[100] mx-auto flex max-w-md flex-col gap-2">
      {toasts.map((toast) => {
        const style = STYLES[toast.type] || STYLES.info;

        return (
          <div
            key={toast.id}
            className={`toast-enter pointer-events-auto flex items-start gap-3 rounded-2xl border px-3 py-2.5 shadow-lg backdrop-blur-md ${style.border} ${style.bg}`}
          >
            <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.accent}`}
            />
            <p className={`min-w-0 flex-1 text-sm leading-snug ${style.text}`}>
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 text-xs text-white/50 transition hover:text-white"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
