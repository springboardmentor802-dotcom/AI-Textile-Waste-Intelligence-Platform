import api from "./api";

export const registerUser = async (userData) => {
  const res = await api.post("/auth/register", userData);
  return res.data;
};

export const loginUser = async (credentials) => {
  const res = await api.post("/auth/login", credentials);
  return res.data;
};

export const logoutUser = async () => {
  try { await api.post("/auth/logout"); } catch { /* ignore */ }
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
};

export const getCurrentUser = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

export const getAllUsers = async () => {
  const res = await api.get("/users/");
  return res.data;
};