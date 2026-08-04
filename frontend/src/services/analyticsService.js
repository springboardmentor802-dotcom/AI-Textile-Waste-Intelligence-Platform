import api from "./api";

export const getAnalytics = async () => {
  const response = await api.get("/analytics/");
  return response.data;
};

export const getDatasetAnalytics = async () => {
  const response = await api.get("/analytics/dataset");
  return response.data;
};