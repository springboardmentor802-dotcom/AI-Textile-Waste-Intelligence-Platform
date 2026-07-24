import axios from "axios";


const API_URL="http://127.0.0.1:8000";



export const getDashboardData = async()=>{

    const analytics =
    await axios.get(
        `${API_URL}/analytics/`
    );


    const users =
    await axios.get(
        `${API_URL}/users/`
    );


    const inventory =
    await axios.get(
        `${API_URL}/inventory/`
    );


    const recommendations =
    await axios.get(
        `${API_URL}/recommendations/`
    );


    return {

        analytics: analytics.data,

        users: users.data,

        inventory: inventory.data,

        recommendations: recommendations.data

    };

};