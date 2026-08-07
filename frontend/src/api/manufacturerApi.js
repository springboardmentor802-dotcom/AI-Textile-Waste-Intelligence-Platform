import API from "./axios";

/* ===========================
   Manufacturer Profile
=========================== */

export const createManufacturerProfile = async (data) => {

    const response = await API.post(
        "/manufacturers",
        data
    );

    return response.data;
};

export const getMyManufacturerProfile = async () => {

    const response = await API.get(
        "/manufacturers/me"
    );

    return response.data;
};

export const updateManufacturerProfile = async (data) => {

    const response = await API.put(
        "/manufacturers/me",
        data
    );

    return response.data;
};

/* ===========================
   Admin
=========================== */

export const getAllManufacturers = async () => {

    const response = await API.get(
        "/manufacturers"
    );

    return response.data.manufacturers;
};

export const getManufacturerById = async (id) => {

    const response = await API.get(
        `/manufacturers/${id}`
    );

    return response.data;
};

export const deleteManufacturer = async (id) => {

    const response = await API.delete(
        `/manufacturers/${id}`
    );

    return response.data;
};


