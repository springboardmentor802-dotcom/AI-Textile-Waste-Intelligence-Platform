import api from "./api";

// ── Existing analysis endpoints ────────────────────────────────────

export const uploadForMaterialRecognition = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/analysis/material-recognition", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Alias used by any page that imports recognizeMaterial
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

// ── Milestone 3: Sustainability endpoints ─────────────────────────

export const getSustainabilityOverview = async () => {
  const res = await api.get("/sustainability/overview");
  return res.data;
};

export const getSustainabilityByMaterial = async () => {
  const res = await api.get("/sustainability/by-material");
  return res.data;
};

export const getSustainabilityByCategory = async () => {
  const res = await api.get("/sustainability/by-category");
  return res.data;
};

export const getSustainabilityRecent = async (limit = 10) => {
  const res = await api.get(`/sustainability/recent?limit=${limit}`);
  return res.data;
};

export const getEnvironmentalImpact = async () => {
  const res = await api.get("/sustainability/environmental-impact");
  return res.data;
};

export const getCircularEconomy = async () => {
  const res = await api.get("/sustainability/circular-economy");
  return res.data;
};

export const getRecommendationsSummary = async () => {
  const res = await api.get("/recommendations/summary");
  return res.data;
};

// ── Milestone 3: Inventory analytics ─────────────────────────────

export const getInventoryAnalytics = async () => {
  const res = await api.get("/inventory/analytics");
  return res.data;
};