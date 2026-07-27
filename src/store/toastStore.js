import { create } from "zustand";

let toastId = 0;

const useToastStore = create((set, get) => ({
  toasts: [],

  showToast: (type, message) => {
    const id = ++toastId;
    const toast = {
      id,
      type: type || "info",
      message: message || "",
    };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    window.setTimeout(() => {
      get().dismissToast(id);
    }, 3200);
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));

export const showToast = (type, message) => {
  useToastStore.getState().showToast(type, message);
};

export default useToastStore;
