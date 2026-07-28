import api from "./api";

export const getCycleAnalysis = async (cycleId) => {
  const response = await api.get(`/analysis/cycles/${cycleId}`);
  return response.data;
};

export const getCurrentMonthFuelAnalysis = async () => {
  const response = await api.get("/analysis/fuel/current-month");
  return response.data;
};
