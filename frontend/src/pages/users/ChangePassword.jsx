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

        if (formData.new_password !== formData.confirm_password) {

            setError("Passwords do not match.");

            return;

        }

        try {

            await changePassword({
                old_password: formData.old_password,
                new_password: formData.new_password
            });

            setMessage("Password changed successfully.");

            setTimeout(() => {

                navigate("/profile");

            }, 1500);

        }

        catch (err) {

            setError(
                err.response?.data?.detail ||
                "Unable to change password."
            );

        }

    };

    const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    background: "#ffffff",

    color: "#111827",
    caretColor: "#111827",

    marginTop: "8px"
};

    return (
    <>
        <Navbar />

        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                background: "#f8fafc",
            }}
        >

            <Sidebar />

            <div
                style={{
                    flex: 1,
                    padding: "90px 40px",
                }}
            >

                <div
                    style={{
                        maxWidth: "750px",
                        margin: "auto",
                    }}
                >

                    <div
                        style={{
                            marginBottom: "30px",
                        }}
                    >

                        <h1
                            style={{
                                fontSize: "34px",
                                fontWeight: "700",
                                color: "#0f172a",
                                marginBottom: "8px",
                            }}
                        >
                            Change Password
                        </h1>


                        <p
                            style={{
                                color:"#64748b",
                                fontSize:"15px",
                                lineHeight:"24px"
                            }}
                        >
                            Update your account password regularly to keep your account secure.
                        </p>

                    </div>



                    <div
                        style={{
                            background:"#ffffff",
                            border:"1px solid #e5e7eb",
                            borderRadius:"16px",
                            padding:"40px",
                            boxShadow:"0 4px 14px rgba(15,23,42,0.06)"
                        }}
                    >


                        <form onSubmit={handleSubmit}>


                            <div
                                style={{
                                    marginBottom:"25px"
                                }}
                            >

                                <label
                                    style={{
                                        display:"block",
                                        marginBottom:"8px",
                                        fontSize:"14px",
                                        fontWeight:"600",
                                        color:"#334155"
                                    }}
                                >
                                    Current Password
                                </label>


                                <input
                                    type="password"
                                    name="old_password"
                                    value={formData.old_password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter current password"
                                    style={inputStyle}
                                />

                            </div>



                            <div
                                style={{
                                    marginBottom:"25px"
                                }}
                            >

                                <label
                                    style={{
                                        display:"block",
                                        marginBottom:"8px",
                                        fontSize:"14px",
                                        fontWeight:"600",
                                        color:"#334155"
                                    }}
                                >
                                    New Password
                                </label>


                                <input
                                    type="password"
                                    name="new_password"
                                    value={formData.new_password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter new password"
                                    style={inputStyle}
                                />

                            </div>




                            <div
                                style={{
                                    marginBottom:"30px"
                                }}
                            >

                                <label
                                    style={{
                                        display:"block",
                                        marginBottom:"8px",
                                        fontSize:"14px",
                                        fontWeight:"600",
                                        color:"#334155"
                                    }}
                                >
                                    Confirm New Password
                                </label>


                                <input
                                    type="password"
                                    name="confirm_password"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Confirm new password"
                                    style={inputStyle}
                                />

                            </div>




                            <div
                                style={{
                                    display:"flex",
                                    justifyContent:"flex-end"
                                }}
                            >

                                <button
                                    type="submit"
                                    style={{
                                        background:
                                            "linear-gradient(135deg,#2563eb,#1d4ed8)",
                                        color:"#ffffff",
                                        border:"none",
                                        padding:"14px 32px",
                                        borderRadius:"10px",
                                        fontSize:"15px",
                                        fontWeight:"600",
                                        cursor:"pointer",
                                        boxShadow:
                                            "0 5px 15px rgba(37,99,235,0.25)"
                                    }}
                                >
                                    Update Password
                                </button>


                            </div>


                        </form>




                        {
                            message && (

                                <div
                                    style={{
                                        marginTop:"25px",
                                        padding:"15px",
                                        background:"#ecfdf5",
                                        border:"1px solid #a7f3d0",
                                        borderRadius:"10px",
                                        color:"#065f46",
                                        fontSize:"14px",
                                        fontWeight:"500"
                                    }}
                                >
                                    {message}
                                </div>

                            )
                        }




                        {
                            error && (

                                <div
                                    style={{
                                        marginTop:"25px",
                                        padding:"15px",
                                        background:"#fee2e2",
                                        border:"1px solid #fecaca",
                                        borderRadius:"10px",
                                        color:"#991b1b",
                                        fontSize:"14px",
                                        fontWeight:"500"
                                    }}
                                >
                                    {error}
                                </div>

                            )
                        }


                    </div>

                </div>

            </div>

        </div>

    </>
);
};

export default ChangePassword;