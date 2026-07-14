import api from "./api";

export const createBatch = async (data) => {
  const res = await api.post("/inventory/", data);
  return res.data;
};

export const getAllBatches = async (search = "", skip = 0, limit = 100) => {
  const params = { skip, limit };
  if (search) params.search = search;
  const res = await api.get("/inventory/", { params });
  return res.data;
};

export const getBatch = async (batchId) => {
  const res = await api.get(`/inventory/${batchId}`);
  return res.data;
};

export const updateBatch = async (batchId, data) => {
  const res = await api.put(`/inventory/${batchId}`, data);
  return res.data;
};

export const deleteBatch = async (batchId) => {
  const res = await api.delete(`/inventory/${batchId}`);
  return res.data;
};