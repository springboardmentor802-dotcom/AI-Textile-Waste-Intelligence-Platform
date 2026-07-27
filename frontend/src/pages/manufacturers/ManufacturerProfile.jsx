import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import { getMyManufacturerProfile } from "../../api/manufacturerApi";

const ManufacturerProfile = () => {

    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {

        try {

            const data = await getMyManufacturerProfile();

            setProfile(data);

        } catch (err) {

            console.log(err);

        }

        setLoading(false);

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

    if (!profile) {

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
                        maxWidth: "800px",
                        margin: "auto",
                    }}
                >
                    <div
                        style={{
                            background: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "16px",
                            padding: "45px",
                            textAlign: "center",
                            boxShadow: "0 4px 14px rgba(15,23,42,0.06)",
                        }}
                    >
                        <h1
                            style={{
                                fontSize: "32px",
                                color: "#0f172a",
                                marginBottom: "12px",
                            }}
                        >
                            Manufacturer Profile
                        </h1>

                        <p
                            style={{
                                color: "#64748b",
                                marginBottom: "35px",
                                fontSize: "16px",
                            }}
                        >
                            No manufacturer profile has been created yet.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/manufacturer/create")
                            }
                            style={{
                                background: "#2563eb",
                                color: "#fff",
                                border: "none",
                                padding: "14px 30px",
                                borderRadius: "10px",
                                fontSize: "15px",
                                fontWeight: "600",
                                cursor: "pointer",
                            }}
                        >
                            Create Profile
                        </button>
                    </div>
                </div>
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
                        maxWidth: "950px",
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
                            Manufacturer Profile
                        </h1>

                        <p
                            style={{
                                color: "#64748b",
                                fontSize: "15px",
                            }}
                        >
                            View and manage your manufacturer profile.
                        </p>
                    </div>

                    <div
                        style={{
                            background: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "16px",
                            padding: "35px",
                            boxShadow: "0 4px 14px rgba(15,23,42,0.06)",
                        }}
                    >
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                            }}
                        >
                            <tbody>
                                {[
                                    ["Company", profile.company_name],
                                    ["GST Number", profile.gst_number || "-"],
                                    ["Industry Type", profile.industry_type || "-"],
                                    ["Address", profile.address || "-"],
                                    ["City", profile.city || "-"],
                                    ["State", profile.state || "-"],
                                    ["Pincode", profile.pincode || "-"],
                                    ["Contact Person", profile.contact_person || "-"],
                                    ["Phone", profile.phone || "-"],
                                    ["Website", profile.website || "-"],
                                    ["Description", profile.description || "-"],
                                    [
                                        "Verified",
                                        profile.is_verified ? "Yes" : "No",
                                    ],
                                    [
                                        "Created At",
                                        new Date(
                                            profile.created_at
                                        ).toLocaleString(),
                                    ],
                                ].map(([label, value], index) => (
                                    <tr
                                        key={label}
                                        style={{
                                            borderBottom:
                                                index !== 12
                                                    ? "1px solid #e5e7eb"
                                                    : "none",
                                        }}
                                    >
                                        <td
                                            style={{
                                                padding: "16px",
                                                width: "30%",
                                                fontWeight: "600",
                                                color: "#374151",
                                                verticalAlign: "top",
                                            }}
                                        >
                                            {label}
                                        </td>

                                        <td
                                            style={{
                                                padding: "16px",
                                                color: "#111827",
                                            }}
                                        >
                                            {value}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                marginTop: "30px",
                            }}
                        >
                            <button
                                onClick={() =>
                                    navigate("/manufacturer/edit")
                                }
                                style={{
                                    background: "#2563eb",
                                    color: "#fff",
                                    border: "none",
                                    padding: "14px 30px",
                                    borderRadius: "10px",
                                    fontSize: "15px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                }}
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
);
};

export default ManufacturerProfile;