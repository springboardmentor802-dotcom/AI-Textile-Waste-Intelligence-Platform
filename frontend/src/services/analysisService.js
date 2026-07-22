import api from "./api";

/**
 * Submit a fabric image for material recognition analysis.
 * Sends as multipart/form-data because we are uploading a file.
 *
 * @param {File} imageFile - The image file selected by the user
 * @returns {Promise<Object>} Prediction result from the backend
 */
export const recognizeMaterial = async (imageFile) => {
  const formData = new FormData();
  formData.append("file", imageFile);

  const res = await api.post("/analysis/material-recognition", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

/**
 * Check if the ML model is loaded and the analysis service is ready.
 *
 * @returns {Promise<Object>} Service status from the backend
 */
export const getAnalysisStatus = async () => {
  const res = await api.get("/analysis/status");
  return res.data;
};