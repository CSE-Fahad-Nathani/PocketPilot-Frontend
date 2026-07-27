import { create } from "zustand";

import {
  createExpense as createExpenseApi,
  getExpenses as getExpensesApi,
  getExpenseById as getExpenseByIdApi,
  updateExpense as updateExpenseApi,
  deleteExpense as deleteExpenseApi,
} from "../services/expenseService";

const useExpenseStore = create((set) => ({
  expenses: [],
  loading: false,

  getExpenses: async (cycleId) => {
    set({ loading: true });

    try {
      const response = await getExpensesApi(cycleId);

      set({
        expenses: response.data || [],
        loading: false,
      });

      return response;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  getExpenseById: async (id) => {
    return getExpenseByIdApi(id);
  },

  createExpense: async (payload) => {
    const response = await createExpenseApi(payload);

    if (response.success) {
      await useExpenseStore.getState().getExpenses(payload.cycleId);
    }

    return response;
  },

  updateExpense: async (payload, cycleId) => {
    const response = await updateExpenseApi(payload);

    if (response.success) {
      await useExpenseStore.getState().getExpenses(cycleId);
    }

    return response;
  },

  deleteExpense: async (id, cycleId) => {
    const response = await deleteExpenseApi(id);

    if (response.success) {
      await useExpenseStore.getState().getExpenses(cycleId);
    }

    return response;
  },
}));

export default useExpenseStore;
