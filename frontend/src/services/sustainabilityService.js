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

export const downloadSustainabilityExcel = async () => {
    const response = await API.get("sustainability/export-excel/", {
        responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sustainability_report.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};