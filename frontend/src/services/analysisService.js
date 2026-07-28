import api from "./api";

export const uploadForMaterialRecognition = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/analysis/material-recognition", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Alias used by MaterialRecognition.jsx
export const recognizeMaterial = uploadForMaterialRecognition;

export const uploadForFullAnalysis = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/analysis/full-analysis", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const uploadBulkFiles = async (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const res = await api.post("/analysis/bulk-upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const downloadPdfReport = async (sessionId) => {
  const res = await api.get(`/analysis/report/${sessionId}/pdf`, {
    responseType: "blob",
  });
  return res.data;
};

export const getAnalysisStatus = async () => {
  const res = await api.get("/analysis/status");
  return res.data;
};

export const getDashboardStats = async () => {
  const res = await api.get("/analysis/dashboard-stats");
  return res.data;
};