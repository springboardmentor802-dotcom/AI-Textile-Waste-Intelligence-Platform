import API from "../api/axios";

export const getUsers = () => {
  return API.get("/users/");
};