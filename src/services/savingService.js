import api from "./api";

export const getAllSavings = async () => {
  const response = await api.get("/savings");
  return response.data;
};

export const getSavingById = async (id) => {
  const response = await api.get(`/savings/${id}`);
  return response.data;
};

export const updateSaving = async (id, payload) => {
  const response = await api.put(`/savings/${id}`, payload);
  return response.data;
};

export const deleteSaving = async (id) => {
  const response = await api.delete(`/savings/${id}`);
  return response.data;
};
