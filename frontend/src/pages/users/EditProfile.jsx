import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import {
  getMyProfile,
  updateProfile,
} from "../../api/userApi";

const EditProfile = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getMyProfile();

      setFormData({
        name: data.name,
        email: data.email,
      });
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateProfile(formData);

      setMessage("Profile updated successfully.");

      setTimeout(() => {
        navigate("/profile");
      }, 1200);

    } catch (error) {
      setMessage(
        error.response?.data?.detail ||
        "Something went wrong."
      );
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <>

        <Navbar />

        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                background: "#f8fafc"
            }}
        >

            <Sidebar />

            <div
                style={{
                    flex: 1,
                    padding: "100px 50px 40px"
                }}
            >

                <div
                    style={{
                        maxWidth: "700px"
                    }}
                >

                    <h1
                        style={{
                            margin: 0,
                            color: "#111827",
                            fontSize: "30px",
                            fontWeight: "700"
                        }}
                    >
                        Edit Profile
                    </h1>

                    <p
                        style={{
                            marginTop: "8px",
                            color: "#6b7280",
                            marginBottom: "30px",
                            fontSize: "15px"
                        }}
                    >
                        Update your account information. Your changes will be reflected across the platform.
                    </p>

                    <div
                        style={{
                            background: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "12px",
                            padding: "30px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                        }}
                    >

                        <form onSubmit={handleSubmit}>

                            <div
                                style={{
                                    marginBottom: "24px"
                                }}
                            >

                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: "8px",
                                        fontWeight: "600",
                                        color: "#374151"
                                    }}
                                >
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "13px 14px",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "8px",
                                        fontSize: "15px",
                                        boxSizing: "border-box",
                                        color: "#111827",
                                        background: "#ffffff",
                                        outline: "none"
                                    }}
                                />

                            </div>

                            <div
                                style={{
                                    marginBottom: "30px"
                                }}
                            >

                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: "8px",
                                        fontWeight: "600",
                                        color: "#374151"
                                    }}
                                >
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "13px 14px",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "8px",
                                        fontSize: "15px",
                                        boxSizing: "border-box",
                                        color: "#111827",
                                        background: "#ffffff",
                                        outline: "none"
                                    }}
                                />
                                                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "12px",
                                    marginTop: "10px"
                                }}
                            >

                                <button
                                    type="button"
                                    onClick={() => navigate("/profile")}
                                    style={{
                                        padding: "12px 22px",
                                        background: "#ffffff",
                                        color: "#374151",
                                        border: "1px solid #d1d5db",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontSize: "15px",
                                        fontWeight: "500",
                                        transition: "0.2s ease"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = "#f9fafb";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = "#ffffff";
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    style={{
                                        padding: "12px 22px",
                                        background: "#2563eb",
                                        color: "#ffffff",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontSize: "15px",
                                        fontWeight: "600",
                                        transition: "0.2s ease"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = "#1d4ed8";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = "#2563eb";
                                    }}
                                >
                                    Update Profile
                                </button>

                            </div>

                        </form>

                        {
                            message && (

                                <div
                                    style={{
                                        marginTop: "24px",
                                        padding: "14px 16px",
                                        background: "#ecfdf5",
                                        color: "#065f46",
                                        border: "1px solid #a7f3d0",
                                        borderRadius: "8px",
                                        fontSize: "14px"
                                    }}
                                >
                                    {message}
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

export default EditProfile;
