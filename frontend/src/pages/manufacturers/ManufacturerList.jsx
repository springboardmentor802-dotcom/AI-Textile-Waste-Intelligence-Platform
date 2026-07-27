import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import {
    getAllManufacturers,
    deleteManufacturer
} from "../../api/manufacturerApi";

const ManufacturerList = () => {

    const navigate = useNavigate();

    const [manufacturers, setManufacturers] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadManufacturers();
    }, []);

    const loadManufacturers = async () => {

        try {

            const data = await getAllManufacturers();

            setManufacturers(data);

        } catch (error) {

            console.log(error);

        }

        setLoading(false);

    };

    const handleDelete = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this manufacturer?"
        );

        if (!confirmDelete) return;

        try {

            await deleteManufacturer(id);

            alert("Manufacturer deleted successfully.");

            loadManufacturers();

        } catch (error) {

            alert(
                error.response?.data?.detail ||
                "Unable to delete manufacturer."
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
                    Loading manufacturers...
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
                        maxWidth: "1200px",
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
                            Manufacturers
                        </h1>

                        <p
                            style={{
                                color: "#64748b",
                                fontSize: "15px",
                            }}
                        >
                            Browse and manage all registered manufacturers.
                        </p>
                    </div>

                    <div
                        style={{
                            background: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "16px",
                            overflow: "hidden",
                            boxShadow: "0 4px 14px rgba(15,23,42,0.06)",
                        }}
                    >
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                            }}
                        >
                            <thead
                                style={{
                                    background: "#f8fafc",
                                }}
                            >
                                <tr>
                                    {[
                                        "ID",
                                        "Company",
                                        "City",
                                        "State",
                                        "Phone",
                                        "Verified",
                                        "Actions",
                                    ].map((heading) => (
                                        <th
                                            key={heading}
                                            style={{
                                                padding: "16px",
                                                textAlign: "left",
                                                fontWeight: "600",
                                                color: "#374151",
                                                borderBottom:
                                                    "1px solid #e5e7eb",
                                            }}
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {manufacturers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            style={{
                                                padding: "40px",
                                                textAlign: "center",
                                                color: "#6b7280",
                                            }}
                                        >
                                            No manufacturers found.
                                        </td>
                                    </tr>
                                ) : (
                                    manufacturers.map((manufacturer) => (
                                        <tr
                                            key={manufacturer.id}
                                            style={{
                                                borderBottom:
                                                    "1px solid #e5e7eb",
                                            }}
                                        >
                                            <td style={{ padding: "16px" }}>
                                                {manufacturer.id}
                                            </td>

                                            <td style={{ padding: "16px" }}>
                                                {manufacturer.company_name}
                                            </td>

                                            <td style={{ padding: "16px" }}>
                                                {manufacturer.city || "-"}
                                            </td>

                                            <td style={{ padding: "16px" }}>
                                                {manufacturer.state || "-"}
                                            </td>

                                            <td style={{ padding: "16px" }}>
                                                {manufacturer.phone || "-"}
                                            </td>

                                            <td style={{ padding: "16px" }}>
                                                <span
                                                    style={{
                                                        padding:
                                                            "5px 12px",
                                                        borderRadius: "999px",
                                                        fontSize: "13px",
                                                        fontWeight: "600",
                                                        background:
                                                            manufacturer.is_verified
                                                                ? "#dcfce7"
                                                                : "#fee2e2",
                                                        color:
                                                            manufacturer.is_verified
                                                                ? "#166534"
                                                                : "#991b1b",
                                                    }}
                                                >
                                                    {manufacturer.is_verified
                                                        ? "Verified"
                                                        : "Pending"}
                                                </span>
                                            </td>

                                            <td
                                                style={{
                                                    padding: "16px",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: "10px",
                                                    }}
                                                >
                                                    <button
                                                        onClick={() =>
                                                            navigate(
                                                                `/manufacturers/${manufacturer.id}`
                                                            )
                                                        }
                                                        style={{
                                                            background:
                                                                "#2563eb",
                                                            color: "#fff",
                                                            border: "none",
                                                            padding:
                                                                "8px 16px",
                                                            borderRadius:
                                                                "8px",
                                                            cursor: "pointer",
                                                            fontWeight: "600",
                                                        }}
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                manufacturer.id
                                                            )
                                                        }
                                                        style={{
                                                            background:
                                                                "#dc2626",
                                                            color: "#fff",
                                                            border: "none",
                                                            padding:
                                                                "8px 16px",
                                                            borderRadius:
                                                                "8px",
                                                            cursor: "pointer",
                                                            fontWeight: "600",
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </>
);
};

export default ManufacturerList;