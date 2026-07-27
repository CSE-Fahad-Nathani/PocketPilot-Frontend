import { create } from "zustand";

import {
  createIncome as createIncomeApi,
  getIncome as getIncomeApi,
  updateIncome as updateIncomeApi,
  deleteIncome as deleteIncomeApi,
} from "../services/incomeService";

const useIncomeStore = create((set) => ({
  income: [],
  loading: false,

  getIncome: async (cycleId) => {
    set({ loading: true });

    try {
      const response = await getIncomeApi(cycleId);

      set({
        income: response.data,
        loading: false,
      });

      return response;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  createIncome: async (payload) => {
    const response = await createIncomeApi(payload);

    await useIncomeStore.getState().getIncome(payload.cycleId);

    return response;
  },

  updateIncome: async (payload) => {
    const response = await updateIncomeApi(payload);

    await useIncomeStore.getState().getIncome(payload.cycleId);

    return response;
  },

  deleteIncome: async (id, cycleId) => {
    const response = await deleteIncomeApi(id);

    await useIncomeStore.getState().getIncome(cycleId);

    return response;
  },
}));

export default useIncomeStore;