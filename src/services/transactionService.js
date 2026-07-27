import api from "./api";

export const getTransactions = async () => {
  const response = await api.get("/transactions");
  return response.data;
};
