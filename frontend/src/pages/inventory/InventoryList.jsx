import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import {
    getAllInventory,
    deleteInventory
} from "../../api/inventoryApi";



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

const InventoryList = () => {

    const [inventory, setInventory] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {

        try {

            const data = await getAllInventory();

            setInventory(data.inventory);

        } catch (error) {

            alert(
                error.response?.data?.detail ||
                "Unable to load inventory."
            );

        }

        setLoading(false);

    };

    const handleDelete = async (id) => {

        const confirmDelete = window.confirm(
            "Delete this inventory item?"
        );

        if (!confirmDelete) return;

        try {

            await deleteInventory(id);

            alert("Inventory deleted.");

            loadInventory();

        } catch (error) {

            alert(
                error.response?.data?.detail ||
                "Delete failed."
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
                    Loading inventory...
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
                            All Inventory
                        </h1>

                        <p
                            style={{
                                color: "#64748b",
                                fontSize: "15px",
                            }}
                        >
                            Manage and monitor all available textile inventory.
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
                                        "Manufacturer ID",
                                        "Textile",
                                        "Material",
                                        "Quantity",
                                        "Status",
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

                                {
                                    inventory.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="7"
                                                style={{
                                                    padding:"40px",
                                                    textAlign:"center",
                                                    color:"#64748b"
                                                }}
                                            >
                                                No inventory found.
                                            </td>

                                        </tr>

                                    )

                                    :

                                    inventory.map((item) => (

                                        <tr
                                            key={item.id}
                                            style={{
                                                borderBottom:
                                                    "1px solid #e5e7eb",
                                            }}
                                        >

                                            <td
                                                style={{
                                                    padding:"16px"
                                                }}
                                            >
                                                {item.id}
                                            </td>


                                            <td
                                                style={{
                                                    padding:"16px"
                                                }}
                                            >
                                                {item.manufacturer_id}
                                            </td>


                                            <td
                                                style={{
                                                    padding:"16px",
                                                    fontWeight:"500"
                                                }}
                                            >
                                                {item.textile_name}
                                            </td>


                                            <td
                                                style={{
                                                    padding:"16px"
                                                }}
                                            >
                                                {item.material}
                                            </td>


                                            <td
                                                style={{
                                                    padding:"16px"
                                                }}
                                            >
                                                {item.quantity} {item.unit}
                                            </td>


                                            <td
                                                style={{
                                                    padding:"16px"
                                                }}
                                            >

                                                <span
                                                    style={{
                                                        padding:"5px 12px",
                                                        borderRadius:"999px",
                                                        fontSize:"13px",
                                                        fontWeight:"600",
                                                        background:
                                                            item.status === "AVAILABLE"
                                                                ? "#dcfce7"
                                                                : "#fee2e2",
                                                        color:
                                                            item.status === "AVAILABLE"
                                                                ? "#166534"
                                                                : "#991b1b",
                                                    }}
                                                >
                                                    {item.status}
                                                </span>

                                            </td>


                                            <td
                                                style={{
                                                    padding:"16px"
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        display:"flex",
                                                        gap:"10px"
                                                    }}
                                                >

                                                    <Link
                                                        to={`/inventory/${item.id}`}
                                                    >

                                                        <button
                                                            style={{
                                                                background:"#2563eb",
                                                                color:"#fff",
                                                                border:"none",
                                                                padding:"8px 16px",
                                                                borderRadius:"8px",
                                                                cursor:"pointer",
                                                                fontWeight:"600"
                                                            }}
                                                        >
                                                            View
                                                        </button>

                                                    </Link>


                                                    <button
                                                        onClick={() =>
                                                            handleDelete(item.id)
                                                        }
                                                        style={{
                                                            background:"#dc2626",
                                                            color:"#fff",
                                                            border:"none",
                                                            padding:"8px 16px",
                                                            borderRadius:"8px",
                                                            cursor:"pointer",
                                                            fontWeight:"600"
                                                        }}
                                                    >
                                                        Delete
                                                    </button>

                                                </div>

                                            </td>


                                        </tr>

                                    ))

                                }

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>

    </>
);
};

export default InventoryList;