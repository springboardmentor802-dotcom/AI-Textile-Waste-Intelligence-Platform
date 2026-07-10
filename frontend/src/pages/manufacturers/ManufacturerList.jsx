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

        return <h2>Loading...</h2>;

    }

    return (

        <>
            <Navbar />

            <div style={{ display: "flex" }}>

                <Sidebar />

                <div
                    style={{
                        flex: 1,
                        padding: "30px"
                    }}
                >

                    <h2>Manufacturers</h2>

                    <hr />

                    <table
                        border="1"
                        cellPadding="10"
                        style={{
                            width: "100%",
                            borderCollapse: "collapse"
                        }}
                    >

                        <thead>

                            <tr>

                                <th>ID</th>

                                <th>Company</th>

                                <th>City</th>

                                <th>State</th>

                                <th>Phone</th>

                                <th>Verified</th>

                                <th>Actions</th>

                            </tr>

                        </thead>

                        <tbody>

                            {

                                manufacturers.map((manufacturer) => (

                                    <tr key={manufacturer.id}>

                                        <td>{manufacturer.id}</td>

                                        <td>{manufacturer.company_name}</td>

                                        <td>{manufacturer.city}</td>

                                        <td>{manufacturer.state}</td>

                                        <td>{manufacturer.phone}</td>

                                        <td>

                                            {
                                                manufacturer.is_verified
                                                    ? "Yes"
                                                    : "No"
                                            }

                                        </td>

                                        <td>

                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/manufacturers/${manufacturer.id}`
                                                    )
                                                }
                                            >
                                                View
                                            </button>

                                            {" "}

                                            <button
                                                onClick={() =>
                                                    handleDelete(
                                                        manufacturer.id
                                                    )
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

export default ManufacturerList;