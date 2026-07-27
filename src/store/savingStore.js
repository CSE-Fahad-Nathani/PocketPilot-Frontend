import { create } from "zustand";
import {
  deleteSaving as deleteSavingApi,
  getAllSavings,
  getSavingById,
  updateSaving as updateSavingApi,
} from "../services/savingService";

const useSavingStore = create((set) => ({
  savings: [],
  loading: false,

  getSavings: async () => {
    set({ loading: true });

    try {
      const response = await getAllSavings();

      set({
        savings: response.success ? response.data || [] : [],
        loading: false,
      });

      return response;
    } catch (error) {
      set({ loading: false, savings: [] });
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to load savings.",
        data: [],
      };
    }
  },

  getSavingById: async (id) => {
    try {
      return await getSavingById(id);
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to load saving.",
        data: null,
      };
    }
  },

  updateSaving: async (id, payload) => {
    try {
      const response = await updateSavingApi(id, payload);

      if (response.success) {
        await useSavingStore.getState().getSavings();
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to update saving.",
        data: null,
      };
    }
  },

  deleteSaving: async (id) => {
    try {
      const response = await deleteSavingApi(id);

      if (response.success) {
        set((state) => ({
          savings: state.savings.filter((item) => item.id !== id),
        }));
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete saving.",
        data: null,
      };
    }
  },
}));

export default useSavingStore;
