import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000"
});

API.interceptors.request.use((config) => {

    const token = localStorage.getItem("access_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;

});

export const createInventory = async (inventoryData) => {

    const response = await API.post(
        "/inventory",
        inventoryData
    );

    return response.data;

};

export const getMyInventory = async () => {

    const response = await API.get(
        "/inventory/my"
    );

    return response.data;

};

export const getInventoryById = async (id) => {

    const response = await API.get(
        `/inventory/${id}`
    );

    return response.data;

};

export const updateInventory = async (
    id,
    inventoryData
) => {

    const response = await API.put(
        `/inventory/${id}`,
        inventoryData
    );

    return response.data;

};

export const deleteInventory = async (id) => {

    const response = await API.delete(
        `/inventory/${id}`
    );

    return response.data;

};

export const getAllInventory = async () => {

    const response = await API.get(
        "/inventory"
    );

    return response.data;

};