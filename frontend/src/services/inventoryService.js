import API from "../api/axios";


export const getInventory = () => {
    return API.get("/inventory/");
};



export const addInventory = (data) => {
    return API.post("/inventory/", data);
};



export const deleteInventory = (id) => {
    return API.delete(`/inventory/${id}`);
};
export const updateInventory = (id, data) => {
    return API.put(`/inventory/${id}`, data);
};