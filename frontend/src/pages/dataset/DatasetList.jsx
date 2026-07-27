import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import {
    getAllDataset,
    deleteDatasetRecord
} from "../../api/sustainabilityApi";

const DatasetList = () => {

    const [dataset, setDataset] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDataset();
    }, []);

    const loadDataset = async () => {

        try {

            const data = await getAllDataset();

            setDataset(data.dataset);

        } catch (error) {

            alert(
                error.response?.data?.detail ||
                "Unable to load dataset."
            );

        }

        setLoading(false);

    };

    const handleDelete = async (id) => {

        const confirmDelete = window.confirm(
            "Delete this record?"
        );

        if (!confirmDelete) return;

        try {

            await deleteDatasetRecord(id);

            loadDataset();

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
                    Loading dataset...
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
                            marginBottom:"30px"
                        }}
                    >

                        <h1
                            style={{
                                fontSize:"34px",
                                fontWeight:"700",
                                color:"#0f172a",
                                marginBottom:"8px"
                            }}
                        >
                            Sustainability Dataset
                        </h1>


                        <p
                            style={{
                                color:"#64748b",
                                fontSize:"15px"
                            }}
                        >
                            Manage sustainability records and environmental data.
                        </p>

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
                                        "Brand",
                                        "Country",
                                        "Material",
                                        "Rating",
                                        "Carbon",
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
                                    dataset.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="7"
                                                style={{
                                                    padding:"40px",
                                                    textAlign:"center",
                                                    color:"#64748b"
                                                }}
                                            >
                                                No records found.
                                            </td>

                                        </tr>

                                    )

                                    :

                                    dataset.map((item)=>(

                                        <tr
                                            key={item.id}
                                            style={{
                                                borderBottom:
                                                    "1px solid #e5e7eb"
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
                                                    padding:"16px",
                                                    fontWeight:"500"
                                                }}
                                            >
                                                {item.brand_name}
                                            </td>


                                            <td
                                                style={{
                                                    padding:"16px"
                                                }}
                                            >
                                                {item.country}
                                            </td>


                                            <td
                                                style={{
                                                    padding:"16px"
                                                }}
                                            >
                                                {item.material_type}
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
                                                        background:"#dcfce7",
                                                        color:"#166534",
                                                        fontSize:"13px",
                                                        fontWeight:"600"
                                                    }}
                                                >
                                                    {item.sustainability_rating}
                                                </span>

                                            </td>


                                            <td
                                                style={{
                                                    padding:"16px"
                                                }}
                                            >
                                                {item.carbon_footprint_mt}
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
                                                        to={`/dataset/${item.id}`}
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

export default DatasetList;