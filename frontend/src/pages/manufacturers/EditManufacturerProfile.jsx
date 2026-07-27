import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import {
    getMyManufacturerProfile,
    updateManufacturerProfile
} from "../../api/manufacturerApi";


const grid2 = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "25px",
  marginBottom: "25px",
};

const grid3 = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "25px",
  marginBottom: "25px",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontSize: "14px",
  fontWeight: "600",
  color: "#374151",
};

const inputStyle = {
  width: "100%",
  padding: "13px 14px",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  fontSize: "15px",
  background: "#fff",
  color: "#111827",
  outline: "none",
  boxSizing: "border-box",
};

const sectionStyle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#1e293b",
  marginTop: "40px",
  marginBottom: "20px",
  paddingBottom: "10px",
  borderBottom: "1px solid #e5e7eb",
};

const EditManufacturerProfile = () => {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        company_name: "",
        gst_number: "",
        industry_type: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        contact_person: "",
        phone: "",
        website: "",
        description: ""
    });

    const [error, setError] = useState("");

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {

        try {

            const data = await getMyManufacturerProfile();

            setFormData({
                company_name: data.company_name || "",
                gst_number: data.gst_number || "",
                industry_type: data.industry_type || "",
                address: data.address || "",
                city: data.city || "",
                state: data.state || "",
                pincode: data.pincode || "",
                contact_person: data.contact_person || "",
                phone: data.phone || "",
                website: data.website || "",
                description: data.description || ""
            });

        } catch (err) {

            setError(
                err.response?.data?.detail ||
                "Unable to load profile."
            );

        }

        setLoading(false);

    };

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        try {

            await updateManufacturerProfile(formData);

            alert("Manufacturer profile updated successfully.");

            navigate("/manufacturer/profile");

        } catch (err) {

            setError(
                err.response?.data?.detail ||
                "Unable to update profile."
            );

        }

    };

    if (loading) {
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
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "18px",
                        color: "#64748b",
                    }}
                >
                    Loading profile...
                </div>
            </div>
        </>
    );
}

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
                        maxWidth: "1000px",
                        margin: "auto",
                    }}
                >
                    <div style={{ marginBottom: "30px" }}>
                        <h1
                            style={{
                                fontSize: "34px",
                                fontWeight: "700",
                                color: "#0f172a",
                                marginBottom: "8px",
                            }}
                        >
                            Edit Manufacturer Profile
                        </h1>

                        <p
                            style={{
                                color: "#64748b",
                                fontSize: "15px",
                                lineHeight: "24px",
                            }}
                        >
                            Update your company information whenever necessary.
                        </p>
                    </div>

                    <div
                        style={{
                            background: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "16px",
                            padding: "40px",
                            boxShadow: "0 4px 14px rgba(15,23,42,0.06)",
                        }}
                    >
                        <form onSubmit={handleSubmit}>
                            {/* Company Information */}

                            <h3 style={sectionStyle}>Company Information</h3>

                            <div style={grid2}>
                                {[
                                    ["Company Name", "company_name"],
                                    ["GST Number", "gst_number"],
                                    ["Industry Type", "industry_type"],
                                ].map((item) => (
                                    <div key={item[1]}>
                                        <label style={labelStyle}>{item[0]}</label>

                                        <input
                                            type="text"
                                            name={item[1]}
                                            value={formData[item[1]]}
                                            onChange={handleChange}
                                            style={inputStyle}
                                            required={item[1] === "company_name"}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Address */}

                            <h3 style={sectionStyle}>Address Information</h3>

                            <label style={labelStyle}>Address</label>

                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="4"
                                style={inputStyle}
                            />

                            <br />
                            <br />

                            <div style={grid3}>
                                {[
                                    ["City", "city"],
                                    ["State", "state"],
                                    ["Pincode", "pincode"],
                                ].map((item) => (
                                    <div key={item[1]}>
                                        <label style={labelStyle}>{item[0]}</label>

                                        <input
                                            type="text"
                                            name={item[1]}
                                            value={formData[item[1]]}
                                            onChange={handleChange}
                                            style={inputStyle}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Contact */}

                            <h3 style={sectionStyle}>Contact Information</h3>

                            <div style={grid2}>
                                {[
                                    ["Contact Person", "contact_person"],
                                    ["Phone Number", "phone"],
                                ].map((item) => (
                                    <div key={item[1]}>
                                        <label style={labelStyle}>{item[0]}</label>

                                        <input
                                            type="text"
                                            name={item[1]}
                                            value={formData[item[1]]}
                                            onChange={handleChange}
                                            style={inputStyle}
                                        />
                                    </div>
                                ))}
                            </div>

                            <label style={labelStyle}>Website</label>

                            <input
                                type="text"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                style={inputStyle}
                            />

                            {/* Description */}

                            <h3 style={sectionStyle}>Company Description</h3>

                            <label style={labelStyle}>Description</label>

                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="5"
                                style={inputStyle}
                            />

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    marginTop: "35px",
                                }}
                            >
                                <button
                                    type="submit"
                                    style={{
                                        background: "#2563eb",
                                        color: "#fff",
                                        border: "none",
                                        padding: "14px 32px",
                                        borderRadius: "10px",
                                        fontSize: "15px",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                    }}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>

                        {error && (
                            <div
                                style={{
                                    marginTop: "25px",
                                    padding: "15px",
                                    background: "#fee2e2",
                                    color: "#991b1b",
                                    borderRadius: "10px",
                                }}
                            >
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </>
);
};

export default EditManufacturerProfile;