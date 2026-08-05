import api from "./api";

export const getTrackedBalanceSettings = async (cycleId) => {
  const response = await api.get(`/cycles/${cycleId}/tracked-balance`);
  return response.data;
};

export const saveTrackedBalanceSettings = async (cycleId, payload) => {
  const response = await api.put(`/cycles/${cycleId}/tracked-balance`, payload);
  return response.data;
};
