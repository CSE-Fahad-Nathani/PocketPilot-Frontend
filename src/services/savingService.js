import api from "./api";

export const getAllSavings = async () => {
  const response = await api.post("/savings/list", {});
  return response.data;
};

export const getSavingById = async (id) => {
  const response = await api.post("/savings/get", { id });
  return response.data;
};

export const addManualFunds = async (payload) => {
  const response = await api.post("/savings/add-funds", payload);
  return response.data;
};

export const updateSaving = async (id, payload) => {
  const response = await api.post("/savings/update", { id, ...payload });
  return response.data;
};

export const deleteSaving = async (id) => {
  const response = await api.post("/savings/delete", { id });
  return response.data;
};
