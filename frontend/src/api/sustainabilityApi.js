import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000"
});

API.interceptors.request.use((config) => {

    const token = localStorage.getItem("access_token");

    if (token) {

        config.headers.Authorization =
            `Bearer ${token}`;

    }

    return config;

});

export const getAllDataset = async () => {

    const response = await API.get(
        "/dataset"
    );

    return response.data;

};

export const getDatasetById = async (id) => {

    const response = await API.get(
        `/dataset/${id}`
    );

    return response.data;

};

export const deleteDatasetRecord = async (id) => {

    const response = await API.delete(
        `/dataset/${id}`
    );

    return response.data;

};

export const clearDataset = async () => {

    const response = await API.delete(
        "/dataset"
    );

    return response.data;

};