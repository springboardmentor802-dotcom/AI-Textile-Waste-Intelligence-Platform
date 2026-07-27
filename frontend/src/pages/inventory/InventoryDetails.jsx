import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import { getInventoryById } from "../../api/inventoryApi";



const grid2 = {
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"25px",
marginBottom:"25px"
};


const grid3 = {
display:"grid",
gridTemplateColumns:"1fr 1fr 1fr",
gap:"25px",
marginBottom:"25px"
};


const labelStyle = {

display:"block",
marginBottom:"8px",
fontSize:"14px",
fontWeight:"600",
color:"#334155"

};



const inputStyle = {

width:"100%",
padding:"14px",
border:"1px solid #cbd5e1",
borderRadius:"12px",
fontSize:"15px",
outline:"none",
background:"#ffffff",
color:"#111827",
boxSizing:"border-box"

};



const sectionStyle = {

fontSize:"19px",
color:"#1e293b",
marginTop:"30px",
marginBottom:"20px",
paddingBottom:"12px",
borderBottom:"1px solid #e2e8f0"

};

const InventoryDetails = () => {

    const { id } = useParams();

    const [inventory, setInventory] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadInventory();

    }, []);

    const loadInventory = async () => {

        try {

            const data = await getInventoryById(id);

            setInventory(data);

        } catch (error) {

            alert(
                error.response?.data?.detail ||
                "Unable to load inventory."
            );

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
                    Loading inventory details...
                </div>
            </div>
        </>
    );
}

    if (!inventory) {
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
                        fontSize: "20px",
                        color: "#dc2626",
                        fontWeight: "600",
                    }}
                >
                    Inventory not found.
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
                            Inventory Details
                        </h1>

                        <p
                            style={{
                                color: "#64748b",
                                fontSize: "15px",
                            }}
                        >
                            View complete information about this inventory item.
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
                                    ["ID", inventory.id],
                                    ["Textile Name", inventory.textile_name],
                                    ["Textile Type", inventory.textile_type],
                                    ["Material", inventory.material],
                                    ["Color", inventory.color || "-"],
                                    [
                                        "Quantity",
                                        `${inventory.quantity} ${inventory.unit}`,
                                    ],
                                    ["Waste Type", inventory.waste_type],
                                    ["Quality", inventory.quality || "-"],
                                    ["Location", inventory.location || "-"],
                                    ["Status", inventory.status],
                                    [
                                        "Description",
                                        inventory.description || "-",
                                    ],
                                    [
                                        "Created At",
                                        new Date(
                                            inventory.created_at
                                        ).toLocaleString(),
                                    ],
                                ].map(([label, value], index) => (
                                    <tr
                                        key={label}
                                        style={{
                                            borderBottom:
                                                index !== 11
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
                                gap: "12px",
                                marginTop: "30px",
                            }}
                        >
                            <Link to="/inventory/my">
                                <button
                                    style={{
                                        background: "#6b7280",
                                        color: "#fff",
                                        border: "none",
                                        padding: "14px 28px",
                                        borderRadius: "10px",
                                        fontSize: "15px",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                    }}
                                >
                                    Back
                                </button>
                            </Link>

                            <Link to={`/inventory/edit/${inventory.id}`}>
                                <button
                                    style={{
                                        background: "#2563eb",
                                        color: "#fff",
                                        border: "none",
                                        padding: "14px 28px",
                                        borderRadius: "10px",
                                        fontSize: "15px",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                    }}
                                >
                                    Edit Inventory
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
);
};

export default InventoryDetails;