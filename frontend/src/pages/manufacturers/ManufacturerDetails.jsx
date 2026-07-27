import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import { getManufacturerById } from "../../api/manufacturerApi";

const ManufacturerDetails = () => {

    const { id } = useParams();

    const navigate = useNavigate();

    const [manufacturer, setManufacturer] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadManufacturer();
    }, []);

    const loadManufacturer = async () => {

        try {

            const data = await getManufacturerById(id);

            setManufacturer(data);

        } catch (error) {

            console.log(error);

        }

        setLoading(false);

    };

    if (loading) {

        return <h2>Loading...</h2>;

    }

    if (!manufacturer) {

        return <h2>Manufacturer Not Found</h2>;

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
                            Manufacturer Details
                        </h1>

                        <p
                            style={{
                                color: "#64748b",
                                fontSize: "15px",
                            }}
                        >
                            View complete manufacturer information.
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
                                    ["ID", manufacturer.id],
                                    ["User ID", manufacturer.user_id],
                                    ["Company Name", manufacturer.company_name],
                                    ["GST Number", manufacturer.gst_number || "-"],
                                    ["Industry Type", manufacturer.industry_type || "-"],
                                    ["Address", manufacturer.address || "-"],
                                    ["City", manufacturer.city || "-"],
                                    ["State", manufacturer.state || "-"],
                                    ["Pincode", manufacturer.pincode || "-"],
                                    ["Contact Person", manufacturer.contact_person || "-"],
                                    ["Phone", manufacturer.phone || "-"],
                                    ["Website", manufacturer.website || "-"],
                                    ["Description", manufacturer.description || "-"],
                                    [
                                        "Verified",
                                        manufacturer.is_verified ? "Yes" : "No",
                                    ],
                                    [
                                        "Created At",
                                        new Date(
                                            manufacturer.created_at
                                        ).toLocaleString(),
                                    ],
                                ].map(([label, value], index) => (
                                    <tr
                                        key={label}
                                        style={{
                                            borderBottom:
                                                index !== 14
                                                    ? "1px solid #e5e7eb"
                                                    : "none",
                                        }}
                                    >
                                        <td
                                            style={{
                                                padding: "16px",
                                                fontWeight: "600",
                                                color: "#374151",
                                                width: "30%",
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
                                onClick={() => navigate("/manufacturers")}
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
                                Back to Manufacturers
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
);
};

export default ManufacturerDetails;