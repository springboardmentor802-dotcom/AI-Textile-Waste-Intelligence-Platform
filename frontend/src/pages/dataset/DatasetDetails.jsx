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
        return <h2>Loading...</h2>;
    }

    if (!dataset) {
        return <h2>Record not found.</h2>;
    }

    return (

        <>
            <Navbar />

            <div
                style={{
                    display: "flex"
                }}
            >

                <Sidebar />

                <div
                    style={{
                        flex: 1,
                        padding: "30px"
                    }}
                >

                    <h2>
                        Sustainability Dataset Details
                    </h2>

                    <hr />

                    <p>
                        <strong>Brand ID:</strong> {dataset.brand_id}
                    </p>

                    <p>
                        <strong>Brand Name:</strong> {dataset.brand_name}
                    </p>

                    <p>
                        <strong>Country:</strong> {dataset.country}
                    </p>

                    <p>
                        <strong>Year:</strong> {dataset.year}
                    </p>

                    <p>
                        <strong>Sustainability Rating:</strong> {dataset.sustainability_rating}
                    </p>

                    <p>
                        <strong>Material Type:</strong> {dataset.material_type}
                    </p>

                    <p>
                        <strong>Eco-Friendly Manufacturing:</strong> {dataset.eco_friendly_manufacturing}
                    </p>

                    <p>
                        <strong>Carbon Footprint (MT):</strong> {dataset.carbon_footprint_mt}
                    </p>

                    <p>
                        <strong>Water Usage (Liters):</strong> {dataset.water_usage_liters}
                    </p>

                    <p>
                        <strong>Waste Production (KG):</strong> {dataset.waste_production_kg}
                    </p>

                    <p>
                        <strong>Recycling Programs:</strong> {dataset.recycling_programs}
                    </p>

                    <p>
                        <strong>Product Lines:</strong> {dataset.product_lines}
                    </p>

                    <p>
                        <strong>Average Price (USD):</strong> ${dataset.average_price_usd}
                    </p>

                    <p>
                        <strong>Market Trend:</strong> {dataset.market_trend}
                    </p>

                    <p>
                        <strong>Certifications:</strong> {dataset.certifications}
                    </p>

                </div>

            </div>

        </>

    );

};

export default DatasetDetails;