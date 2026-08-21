import api from "./api";

export const getPendingSavings = async () => {
  const response = await api.post("/saving-allocations/pending", {});
  return response.data;
};

export const distributeSaving = async (payload) => {
  const response = await api.post("/saving-allocations/distribute", payload);
  return response.data;
};
