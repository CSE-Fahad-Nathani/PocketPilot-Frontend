import api from "./api";

export const getTransactions = async () => {
  const response = await api.post("/transactions/list", {});
  return response.data;
};
