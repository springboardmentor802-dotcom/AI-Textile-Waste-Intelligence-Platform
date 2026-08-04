import API from "../api/axios";


// Get all textile batches
export const getInventory = () => {
    return API.get("/inventory/");
};



// Register new textile batch
export const addInventory = (data) => {
    return API.post("/inventory/", data);
};



// Delete textile batch
export const deleteInventory = (id) => {
    return API.delete(`/inventory/${id}`);
};



// Update textile batch
export const updateInventory = (id, data) => {
    return API.put(`/inventory/${id}`, data);
};