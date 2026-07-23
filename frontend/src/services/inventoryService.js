import api from "./api";

export const getInventory = async () => {
  const response = await api.get("/inventory/");
  return response.data;
};

export const createInventory = async (data) => {
  const response = await api.post("/inventory/", data);
  return response.data;
};

export const updateInventory = async (id, data) => {
  const response = await api.put(`/inventory/${id}`, data);
  return response.data;
};

export const deleteInventory = async (id) => {
  const response = await api.delete(`/inventory/${id}`);
  return response.data;
};