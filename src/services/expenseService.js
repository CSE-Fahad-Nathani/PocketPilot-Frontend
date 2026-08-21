import api from "./api";

export const createExpense = async (payload) => {
  const response = await api.post("/expenses/create", payload);
  return response.data;
};

export const getExpenses = async (cycleId) => {
  const response = await api.post("/expenses/list", { cycleId });
  return response.data;
};

export const getExpenseById = async (id) => {
  const response = await api.post("/expenses/get", { id });
  return response.data;
};

export const updateExpense = async (payload) => {
  const response = await api.post("/expenses/update", payload);
  return response.data;
};

export const deleteExpense = async (id) => {
  const response = await api.post("/expenses/delete", { id });
  return response.data;
};
