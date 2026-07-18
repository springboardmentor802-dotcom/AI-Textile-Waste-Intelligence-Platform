import axios from "axios";


const API_URL = "http://127.0.0.1:8000";



export const getUploads = async () => {

    const token = localStorage.getItem("token");


    const response = await axios.get(
        `${API_URL}/uploads/`,
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
    );


    return response.data;

};