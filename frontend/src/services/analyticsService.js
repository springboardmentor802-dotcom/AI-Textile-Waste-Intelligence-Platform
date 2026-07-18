import axios from "axios";


const API_URL = "http://127.0.0.1:8000";


export const getAnalytics = async () => {

    const response = await axios.get(
        `${API_URL}/analytics/`
    );

    return response.data;

};