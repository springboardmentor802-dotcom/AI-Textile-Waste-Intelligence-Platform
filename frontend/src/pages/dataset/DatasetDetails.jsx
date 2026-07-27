import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import { getDatasetById } from "../../api/sustainabilityApi";

const DatasetDetails = () => {

    const { id } = useParams();

    const [dataset, setDataset] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadDataset();

    }, []);

    const loadDataset = async () => {

        try {

            const data = await getDatasetById(id);

            setDataset(data);

        } catch (error) {

            alert(
                error.response?.data?.detail ||
                "Unable to load record."
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
                    Loading dataset details...
                </div>
            </div>
        </>
    );
}

    if (!dataset) {
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
                        color: "#dc2626",
                        fontSize: "20px",
                        fontWeight: "600",
                    }}
                >
                    Record not found.
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

                    <div
                        style={{
                            marginBottom: "30px",
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
                            Sustainability Dataset Details
                        </h1>


                        <p
                            style={{
                                color:"#64748b",
                                fontSize:"15px"
                            }}
                        >
                            View complete sustainability information for this dataset.
                        </p>

                    </div>



                    <div
                        style={{
                            background:"#ffffff",
                            border:"1px solid #e5e7eb",
                            borderRadius:"16px",
                            padding:"35px",
                            boxShadow:"0 4px 14px rgba(15,23,42,0.06)"
                        }}
                    >

                        <table
                            style={{
                                width:"100%",
                                borderCollapse:"collapse"
                            }}
                        >

                            <tbody>

                                {[
                                    ["Brand ID", dataset.brand_id],
                                    ["Brand Name", dataset.brand_name],
                                    ["Country", dataset.country],
                                    ["Year", dataset.year],
                                    [
                                        "Sustainability Rating",
                                        dataset.sustainability_rating
                                    ],
                                    [
                                        "Material Type",
                                        dataset.material_type
                                    ],
                                    [
                                        "Eco-Friendly Manufacturing",
                                        dataset.eco_friendly_manufacturing
                                    ],
                                    [
                                        "Carbon Footprint (MT)",
                                        dataset.carbon_footprint_mt
                                    ],
                                    [
                                        "Water Usage (Liters)",
                                        dataset.water_usage_liters
                                    ],
                                    [
                                        "Waste Production (KG)",
                                        dataset.waste_production_kg
                                    ],
                                    [
                                        "Recycling Programs",
                                        dataset.recycling_programs
                                    ],
                                    [
                                        "Product Lines",
                                        dataset.product_lines
                                    ],
                                    [
                                        "Average Price (USD)",
                                        `$${dataset.average_price_usd}`
                                    ],
                                    [
                                        "Market Trend",
                                        dataset.market_trend
                                    ],
                                    [
                                        "Certifications",
                                        dataset.certifications
                                    ],
                                ].map(([label,value],index)=>(

                                    <tr
                                        key={label}
                                        style={{
                                            borderBottom:
                                                index !== 14
                                                    ? "1px solid #e5e7eb"
                                                    : "none"
                                        }}
                                    >

                                        <td
                                            style={{
                                                padding:"16px",
                                                width:"35%",
                                                fontWeight:"600",
                                                color:"#374151",
                                                verticalAlign:"top"
                                            }}
                                        >
                                            {label}
                                        </td>


                                        <td
                                            style={{
                                                padding:"16px",
                                                color:"#111827"
                                            }}
                                        >
                                            {value || "-"}
                                        </td>


                                    </tr>

                                ))}


                            </tbody>

                        </table>


                    </div>

                </div>

            </div>

        </div>

    </>
);
};

export default DatasetDetails;