import { create } from "zustand";

import {
  createTransfer as createTransferApi,
  getTransfers as getTransfersApi,
  getTransferById as getTransferByIdApi,
  updateTransfer as updateTransferApi,
  deleteTransfer as deleteTransferApi,
} from "../services/categoryTransferService";
import useCategoryStore from "./categoryStore";

const refreshAfterTransfer = async (cycleId) => {
  await Promise.all([
    useCategoryTransferStore.getState().getTransfers(cycleId),
    useCategoryStore.getState().getCategories(cycleId),
  ]);
};

const useCategoryTransferStore = create((set) => ({
  transfers: [],
  loading: false,

  getTransfers: async (cycleId) => {
    set({ loading: true });

    try {
      const response = await getTransfersApi(cycleId);

      set({
        transfers: response.data || [],
        loading: false,
      });

      return response;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  getTransferById: async (id) => {
    return getTransferByIdApi(id);
  },

  createTransfer: async (payload) => {
    const response = await createTransferApi(payload);

    if (response.success) {
      await refreshAfterTransfer(payload.cycleId);
    }

    return response;
  },

  updateTransfer: async (payload, cycleId) => {
    const response = await updateTransferApi(payload);

    if (response.success) {
      await refreshAfterTransfer(cycleId);
    }

    return response;
  },

  deleteTransfer: async (id, cycleId) => {
    const response = await deleteTransferApi(id);

    if (response.success) {
      await refreshAfterTransfer(cycleId);
    }

    return response;
  },
}));

export default useCategoryTransferStore;
