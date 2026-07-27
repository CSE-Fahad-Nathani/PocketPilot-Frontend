import { create } from "zustand";
import {
  distributeSaving as distributeSavingApi,
  getPendingSavings,
} from "../services/savingAllocationService";

const useSavingAllocationStore = create((set) => ({
  pending: [],
  loading: false,

  getPending: async () => {
    set({ loading: true });

    try {
      const response = await getPendingSavings();

      set({
        pending: response.success ? response.data || [] : [],
        loading: false,
      });

      return response;
    } catch (error) {
      set({ loading: false, pending: [] });
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to load pending savings.",
        data: [],
      };
    }
  },

  distribute: async (payload) => {
    try {
      const response = await distributeSavingApi(payload);

      if (response.success) {
        await useSavingAllocationStore.getState().getPending();
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to distribute saving.",
        data: null,
      };
    }
  },
}));

export default useSavingAllocationStore;
