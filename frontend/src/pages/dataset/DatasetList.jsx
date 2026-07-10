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
        return <h2>Loading...</h2>;
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

                    <h2>Sustainability Dataset</h2>

                    <table
                        border="1"
                        cellPadding="10"
                        width="100%"
                    >

                        <thead>

                            <tr>

                                <th>ID</th>

                                <th>Brand</th>

                                <th>Country</th>

                                <th>Material</th>

                                <th>Rating</th>

                                <th>Carbon</th>

                                <th>Actions</th>

                            </tr>

                        </thead>

                        <tbody>

                            {
                                dataset.length === 0 ?

                                (
                                    <tr>

                                        <td
                                            colSpan="7"
                                            align="center"
                                        >
                                            No Records Found
                                        </td>

                                    </tr>
                                )

                                :

                                dataset.map(item => (

                                    <tr key={item.id}>

                                        <td>{item.id}</td>

                                        <td>{item.brand_name}</td>

                                        <td>{item.country}</td>

                                        <td>{item.material_type}</td>

                                        <td>{item.sustainability_rating}</td>

                                        <td>{item.carbon_footprint_mt}</td>

                                        <td>

                                            <Link
                                                to={`/dataset/${item.id}`}
                                            >
                                                View
                                            </Link>

                                            {" | "}

                                            <button
                                                onClick={() =>
                                                    handleDelete(item.id)
                                                }
                                            >
                                                Delete
                                            </button>

                                        </td>

                                    </tr>

                                ))
                            }

                        </tbody>

                    </table>

                </div>

            </div>

        </>

    );

};

export default DatasetList;