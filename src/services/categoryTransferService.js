import api from "./api";

export const createTransfer = async (payload) => {
  const response = await api.post("/category-transfers/create", payload);
  return response.data;
};

export const getTransfers = async (cycleId) => {
  const response = await api.get(
    `/category-transfers?cycleId=${cycleId}`
  );
  return response.data;
};

export const getTransferById = async (id) => {
  const response = await api.get(`/category-transfers/${id}`);
  return response.data;
};

export const updateTransfer = async (payload) => {
  const response = await api.post("/category-transfers/update", payload);
  return response.data;
};

export const deleteTransfer = async (id) => {
  const response = await api.post("/category-transfers/delete", { id });
  return response.data;
};
