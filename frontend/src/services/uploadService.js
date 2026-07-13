import API from "../api/axios";

export const getUploads = () => {
  return API.get("/uploads/");
};

export const createUpload = (data) => {
  return API.post("/uploads/", data);
};