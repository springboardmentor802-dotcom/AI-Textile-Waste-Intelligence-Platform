import api from "./api";

export const getMyProfile = async () => {
  const res = await api.get("/users/me/profile");
  return res.data;
};

export const updateMyProfile = async (data) => {
  const res = await api.put("/users/me/profile", data);
  return res.data;
};

export const changeMyPassword = async (data) => {
  const res = await api.put("/users/me/change-password", data);
  return res.data;
};

export const getAllUsers = async () => {
  const res = await api.get("/users/");
  return res.data;
};

export const deactivateUser = async (userId) => {
  const res = await api.patch(`/users/${userId}/deactivate`);
  return res.data;
};

export const activateUser = async (userId) => {
  const res = await api.patch(`/users/${userId}/activate`);
  return res.data;
};

export const deleteUser = async (userId) => {
  const res = await api.delete(`/users/${userId}`);
  return res.data;
};