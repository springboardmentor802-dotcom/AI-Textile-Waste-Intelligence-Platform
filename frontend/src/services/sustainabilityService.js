import API from "./api";

export const getSustainabilitySummary = async () => {
    const response = await API.get("sustainability/summary/");
    return response.data;
};

export const getSustainabilityTrends = async () => {
    const response = await API.get("sustainability/trends/");
    return response.data;
};

export const getCategoryBreakdown = async () => {
    const response = await API.get("sustainability/category-breakdown/");
    return response.data;
};

export const getMaterialRecovery = async () => {
    const response = await API.get("sustainability/material-recovery/");
    return response.data;
};