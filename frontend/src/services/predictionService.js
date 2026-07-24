import axios from "axios";


const API_URL = "http://127.0.0.1:8000/prediction/";



export const predictTextile = async (image)=>{


    const token = localStorage.getItem("token");


    const formData = new FormData();


    formData.append(
        "file",
        image
    );



    const response = await axios.post(

        API_URL,

        formData,

        {

            headers:{

                Authorization:`Bearer ${token}`,

                "Content-Type":"multipart/form-data"

            }

        }

    );


    return response.data;

};