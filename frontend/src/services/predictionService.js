import api from "./api";

export const predictFabric = async (imageFiles) => {

    const formData = new FormData();

    imageFiles.forEach((file) => {
        formData.append("files", file);
    });

    const response = await api.post(
        "/predict-multiple",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};