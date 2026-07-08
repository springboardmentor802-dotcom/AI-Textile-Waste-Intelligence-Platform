import API from "./axios";

/* ===========================
   Authentication
=========================== */

export const registerUser = async (userData) => {
    const response = await API.post("/users/register", userData);
    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await API.post("/users/login", credentials);
    return response.data;
};

/* ===========================
   Current User
=========================== */

export const getMyProfile = async () => {
    const response = await API.get("/users/me");
    return response.data;
};


export const getCurrentUser = async () => {
  const response = await API.get("/users/me");
  return response.data;
};

export const updateProfile = async (userData) => {
    const response = await API.put(
        "/users/profile",
        userData
    );

    return response.data;
};

export const changePassword = async (passwordData) => {
    const response = await API.put(
        "/users/change-password",
        passwordData
    );

    return response.data;
};

/* ===========================
   Admin User Management
=========================== */

export const getAllUsers = async () => {
    const response = await API.get("/users");

    return response.data.users;
};

export const getUserById = async (id) => {
    const response = await API.get(`/users/${id}`);

    return response.data;
};

export const deleteUser = async (id) => {
    const response = await API.delete(`/users/${id}`);

    return response.data;
};