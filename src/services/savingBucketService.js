import api from "./api";

export const getSavingBuckets = async () => {
  const response = await api.get("/saving-buckets");
  return response.data;
};

export const createSavingBucket = async (payload) => {
  const response = await api.post("/saving-buckets/create", payload);
  return response.data;
};

export const withdrawFromBucket = async (payload) => {
  const response = await api.post("/saving-buckets/withdraw", payload);
  return response.data;
};

export const transferBetweenBuckets = async (payload) => {
  const response = await api.post("/saving-buckets/transfer", payload);
  return response.data;
};

export const archiveSavingBucket = async (id) => {
  const response = await api.patch(`/saving-buckets/archive/${id}`);
  return response.data;
};
