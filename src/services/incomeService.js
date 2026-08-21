import api from "./api";

export const createIncome = async (payload) => {
  const response = await api.post("/income/create", payload);
  return response.data;
};

export const getIncome = async (cycleId) => {
  const response = await api.post("/income/list", { cycleId });
  return response.data;
};

export const updateIncome = async (payload) => {
  const response = await api.post("/income/update", payload);
  return response.data;
};

export const deleteIncome = async (id) => {
  const response = await api.post("/income/delete", { id });
  return response.data;
};
