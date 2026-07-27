import { create } from "zustand";
import { getTransactions } from "../services/transactionService";

const useTransactionStore = create((set) => ({
  transactions: [],
  loading: false,
  error: null,

  fetchTransactions: async () => {
    set({ loading: true, error: null });

    try {
      const response = await getTransactions();

      if (response.success) {
        set({
          transactions: response.data || [],
          loading: false,
          error: null,
        });
      } else {
        set({
          loading: false,
          error: response.message || "Failed to load transactions.",
        });
      }

      return response;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load transactions.";

      set({ loading: false, error: message, transactions: [] });

      return { success: false, message, data: [] };
    }
  },
}));

export default useTransactionStore;
