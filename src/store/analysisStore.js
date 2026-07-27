import { create } from "zustand";
import { getCycleAnalysis } from "../services/analysisService";
import { getCycleHistory } from "../services/cycleService";

const useAnalysisStore = create((set) => ({
  history: [],
  selectedCycleId: null,
  analysis: null,
  loadingHistory: false,
  loadingAnalysis: false,

  getHistory: async () => {
    set({ loadingHistory: true });

    try {
      const response = await getCycleHistory();

      if (response.success) {
        const history = response.data || [];
        set({
          history,
          loadingHistory: false,
        });
        return { ...response, data: history };
      }

      set({ loadingHistory: false });
      return response;
    } catch (error) {
      set({ loadingHistory: false });
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to load cycle history.",
        data: [],
      };
    }
  },

  getAnalysis: async (cycleId) => {
    if (!cycleId) {
      set({ selectedCycleId: null, analysis: null });
      return { success: false, message: "Cycle ID is required.", data: null };
    }

    set({ loadingAnalysis: true, selectedCycleId: cycleId });

    try {
      const response = await getCycleAnalysis(cycleId);

      if (response.success) {
        set({
          analysis: response.data || null,
          loadingAnalysis: false,
        });
      } else {
        set({ loadingAnalysis: false });
      }

      return response;
    } catch (error) {
      set({ loadingAnalysis: false });
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to load cycle analysis.",
        data: null,
      };
    }
  },

  clearAnalysis: () => {
    set({ selectedCycleId: null, analysis: null });
  },
}));

export default useAnalysisStore;
