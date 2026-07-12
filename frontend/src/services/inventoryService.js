import api from "./api";

export const getInventory = async () => {
  const response = await api.get("/inventory/all");
  return response.data;
};

export const addInventory = async (data) => {
  const response = await api.post("/inventory/add", data);
  return response.data;
};

export const updateInventory = async (id, data) => {
  const response = await api.put(`/inventory/update/${id}`, data);
  return response.data;
};

export const deleteInventory = async (id) => {
  const response = await api.delete(`/inventory/delete/${id}`);
  return response.data;
};