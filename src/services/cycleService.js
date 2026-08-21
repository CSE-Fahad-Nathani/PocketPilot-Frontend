import api from "./api";

export const createCycle = async (payload) => {
  const response = await api.post("/cycles/create", payload);
  return response.data;
};

export const getActiveCycle = async () => {
  const response = await api.post("/cycles/active", {});
  return response.data;
};

export const getCycleHistory = async () => {
  const response = await api.post("/cycles/history", {});
  return response.data;
};

export const verifyEndCycle = async (payload) => {
  const response = await api.post("/cycles/verify-end", payload);
  return response.data;
};

export const endCycle = async (payload) => {
  const response = await api.post("/cycles/end", payload);
  return response.data;
};
