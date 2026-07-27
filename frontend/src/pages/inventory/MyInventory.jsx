import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import {
    getMyInventory,
    deleteInventory
} from "../../api/inventoryApi";

const MyInventory = () => {

    const [inventory, setInventory] = useState([]);

    const [loading, setLoading] = useState(true);

    const loadInventory = async () => {

        try {

            const data = await getMyInventory();

            setInventory(data.inventory);

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.detail ||
                "Failed to load inventory."
            );

        }

        setLoading(false);

    };

    useEffect(() => {

        loadInventory();

    }, []);

    const handleDelete = async (id) => {

        const confirmDelete = window.confirm(
            "Delete this inventory item?"
        );

        if (!confirmDelete) return;

        try {

            await deleteInventory(id);

            alert("Inventory deleted successfully.");

            loadInventory();

        } catch (error) {

            alert(
                error.response?.data?.detail ||
                "Unable to delete inventory."
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
                            display:"flex",
                            justifyContent:"space-between",
                            alignItems:"center",
                            marginBottom:"30px"
                        }}
                    >

                        <div>
                            <h1
                                style={{
                                    fontSize:"34px",
                                    fontWeight:"700",
                                    color:"#0f172a",
                                    marginBottom:"8px"
                                }}
                            >
                                My Inventory
                            </h1>

                            <p
                                style={{
                                    color:"#64748b",
                                    fontSize:"15px"
                                }}
                            >
                                Manage your uploaded textile inventory.
                            </p>
                        </div>


                        <Link to="/inventory/add">

                            <button
                                style={{
                                    background:"#2563eb",
                                    color:"#fff",
                                    border:"none",
                                    padding:"14px 25px",
                                    borderRadius:"10px",
                                    fontSize:"15px",
                                    fontWeight:"600",
                                    cursor:"pointer"
                                }}
                            >
                                Add Inventory
                            </button>

                        </Link>

                    </div>


                    <div
                        style={{
                            background:"#ffffff",
                            border:"1px solid #e5e7eb",
                            borderRadius:"16px",
                            overflow:"hidden",
                            boxShadow:"0 4px 14px rgba(15,23,42,0.06)"
                        }}
                    >

                        <table
                            style={{
                                width:"100%",
                                borderCollapse:"collapse"
                            }}
                        >

                            <thead
                                style={{
                                    background:"#f8fafc"
                                }}
                            >

                                <tr>

                                    {[
                                        "ID",
                                        "Textile",
                                        "Material",
                                        "Quantity",
                                        "Waste Type",
                                        "Status",
                                        "Actions"
                                    ].map((heading)=>(
                                        <th
                                            key={heading}
                                            style={{
                                                padding:"16px",
                                                textAlign:"left",
                                                fontWeight:"600",
                                                color:"#374151",
                                                borderBottom:
                                                    "1px solid #e5e7eb"
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

                                    inventory.map((item)=>(

                                        <tr
                                            key={item.id}
                                            style={{
                                                borderBottom:
                                                    "1px solid #e5e7eb"
                                            }}
                                        >

                                            <td style={{padding:"16px"}}>
                                                {item.id}
                                            </td>


                                            <td
                                                style={{
                                                    padding:"16px",
                                                    fontWeight:"500"
                                                }}
                                            >
                                                {item.textile_name}
                                            </td>


                                            <td style={{padding:"16px"}}>
                                                {item.material}
                                            </td>


                                            <td style={{padding:"16px"}}>
                                                {item.quantity} {item.unit}
                                            </td>


                                            <td style={{padding:"16px"}}>
                                                {item.waste_type}
                                            </td>


                                            <td style={{padding:"16px"}}>

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
                                                                : "#991b1b"
                                                    }}
                                                >
                                                    {item.status}
                                                </span>

                                            </td>


                                            <td style={{padding:"16px"}}>

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


                                                    <Link
                                                        to={`/inventory/edit/${item.id}`}
                                                    >

                                                        <button
                                                            style={{
                                                                background:"#16a34a",
                                                                color:"#fff",
                                                                border:"none",
                                                                padding:"8px 16px",
                                                                borderRadius:"8px",
                                                                cursor:"pointer",
                                                                fontWeight:"600"
                                                            }}
                                                        >
                                                            Edit
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

export default MyInventory;