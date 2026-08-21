import { create } from "zustand";
import * as cycleService from "../services/cycleService";
import useCategoryStore from "./categoryStore";
import useIncomeStore from "./incomeStore";
import useExpenseStore from "./expenseStore";
import useCategoryTransferStore from "./categoryTransferStore";

const useCycleStore = create((set) => ({
  activeCycle: null,
  loading: false,

  getActiveCycle: async () => {
    set({ loading: true });

    try {
      const response = await cycleService.getActiveCycle();
      const cycle = response.data || null;

      set({
        activeCycle: cycle,
        loading: false,
      });

      return response;
    } catch (error) {
      set({
        activeCycle: null,
        loading: false,
      });

      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  },

  createCycle: async (payload) => {
    const response = await cycleService.createCycle(payload);

    if (response.success) {
      await useCycleStore.getState().getActiveCycle();
      return response;
    }

    await useCycleStore.getState().getActiveCycle();
    return response;
  },

  verifyEndCycle: async (payload) => {
    try {
      return await cycleService.verifyEndCycle(payload);
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to verify cycle summary.",
        data: null,
      };
    }
  },

  endCycle: async (payload) => {
    try {
      const response = await cycleService.endCycle(payload);

      if (response.success) {
        useCategoryStore.setState({ categories: [] });
        useIncomeStore.setState({ income: [] });
        useExpenseStore.setState({ expenses: [] });
        useCategoryTransferStore.setState({ transfers: [] });
        await useCycleStore.getState().getActiveCycle();
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to end cycle.",
        data: null,
      };
    }
  },
}));

export default useCycleStore;
