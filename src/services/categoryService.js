import api from "./api";

const createCategory = async (data) => {
  const response = await api.post("/categories/create", data);
  return response.data;
};

const getCategories = async (cycleId) => {
  const response = await api.get(`/categories?cycleId=${cycleId}`);
  return response.data;
};

const updateCategory = async (data) => {
  const response = await api.post("/categories/update", data);
  return response.data;
};

const archiveCategory = async (id) => {
  const response = await api.post("/categories/archive", { id });
  return response.data;
};

const importCategoriesFromCycle = async (payload) => {
  const response = await api.post("/categories/import-from-cycle", payload);
  return response.data;
};

export default {
  createCategory,
  getCategories,
  updateCategory,
  archiveCategory,
  importCategoriesFromCycle,
};
