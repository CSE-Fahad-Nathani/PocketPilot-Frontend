import { create } from "zustand";
import {
  archiveSavingBucket as archiveSavingBucketApi,
  createSavingBucket as createSavingBucketApi,
  getSavingBuckets,
  transferBetweenBuckets as transferBetweenBucketsApi,
  withdrawFromBucket as withdrawFromBucketApi,
} from "../services/savingBucketService";

const bucketError = (error, fallback) => ({
  success: false,
  message: error.response?.data?.message || error.message || fallback,
  data: null,
});

const useSavingBucketStore = create((set) => ({
  buckets: [],
  loading: false,

  getBuckets: async () => {
    set({ loading: true });

    try {
      const response = await getSavingBuckets();

      set({
        buckets: response.success ? response.data || [] : [],
        loading: false,
      });

      return response;
    } catch (error) {
      set({ loading: false, buckets: [] });
      return bucketError(error, "Failed to load saving buckets.");
    }
  },

  createBucket: async (payload) => {
    try {
      const response = await createSavingBucketApi(payload);

      if (response.success) {
        await useSavingBucketStore.getState().getBuckets();
      }

      return response;
    } catch (error) {
      return bucketError(error, "Failed to create saving bucket.");
    }
  },

  withdraw: async (payload) => {
    try {
      const response = await withdrawFromBucketApi(payload);

      if (response.success) {
        await useSavingBucketStore.getState().getBuckets();
      }

      return response;
    } catch (error) {
      return bucketError(error, "Failed to withdraw from bucket.");
    }
  },

  transfer: async (payload) => {
    try {
      const response = await transferBetweenBucketsApi(payload);

      if (response.success) {
        await useSavingBucketStore.getState().getBuckets();
      }

      return response;
    } catch (error) {
      return bucketError(error, "Failed to transfer between buckets.");
    }
  },

  archive: async (id) => {
    try {
      const response = await archiveSavingBucketApi(id);

      if (response.success) {
        await useSavingBucketStore.getState().getBuckets();
      }

      return response;
    } catch (error) {
      return bucketError(error, "Failed to archive bucket.");
    }
  },
}));

export default useSavingBucketStore;
