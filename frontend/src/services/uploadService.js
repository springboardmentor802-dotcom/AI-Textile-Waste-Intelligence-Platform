import api from "./api";

export const getUploads = async () => {
  const response =
    await api.get("/uploads/");

  return response.data;
};