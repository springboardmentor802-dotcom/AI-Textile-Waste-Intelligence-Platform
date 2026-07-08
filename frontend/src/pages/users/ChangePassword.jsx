import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import { changePassword } from "../../api/userApi";

const ChangePassword = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        old_password: "",
        new_password: "",
        confirm_password: ""
    });

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");

        if(formData.new_password !== formData.confirm_password){

            setError("Passwords do not match.");

            return;
        }

        try{

            await changePassword({
                old_password: formData.old_password,
                new_password: formData.new_password
            });

            setMessage("Password changed successfully.");

            setTimeout(()=>{
                navigate("/profile");
            },1500);

        }
        catch(err){

            setError(
                err.response?.data?.detail ||
                "Unable to change password."
            );

        }

    };

    return(

        <>
            <Navbar/>

            <div style={{display:"flex"}}>

                <Sidebar/>

                <div
                    style={{
                        flex:1,
                        padding:"30px"
                    }}
                >

                    <h2>Change Password</h2>

                    <hr/>

                    <form
                        onSubmit={handleSubmit}
                        style={{
                            maxWidth:"450px"
                        }}
                    >

                        <div>

                            <label>Current Password</label>

                            <br/>

                            <input
                                type="password"
                                name="old_password"
                                value={formData.old_password}
                                onChange={handleChange}
                                required
                                style={{
                                    width:"100%",
                                    padding:"10px"
                                }}
                            />

                        </div>

                        <br/>

                        <div>

                            <label>New Password</label>

                            <br/>

                            <input
                                type="password"
                                name="new_password"
                                value={formData.new_password}
                                onChange={handleChange}
                                required
                                style={{
                                    width:"100%",
                                    padding:"10px"
                                }}
                            />

                        </div>

                        <br/>

                        <div>

                            <label>Confirm Password</label>

                            <br/>

                            <input
                                type="password"
                                name="confirm_password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                required
                                style={{
                                    width:"100%",
                                    padding:"10px"
                                }}
                            />

                        </div>

                        <br/>

                        <button
                            type="submit"
                        >
                            Change Password
                        </button>

                    </form>

                    {
                        message &&
                        <p
                            style={{
                                color:"green",
                                marginTop:"20px"
                            }}
                        >
                            {message}
                        </p>
                    }

                    {
                        error &&
                        <p
                            style={{
                                color:"red",
                                marginTop:"20px"
                            }}
                        >
                            {error}
                        </p>
                    }

                </div>

            </div>

        </>

    );

};

export default ChangePassword;