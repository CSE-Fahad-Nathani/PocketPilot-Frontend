import api from "./api";

export const getTrackedBalanceSettings = async (cycleId) => {
  const response = await api.post("/cycles/tracked-balance", { cycleId });
  return response.data;
};

export const saveTrackedBalanceSettings = async (cycleId, payload) => {
  const response = await api.post("/cycles/tracked-balance/save", {
    cycleId,
    ...payload,
  });
  return response.data;
};
