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

            <div style={{ display: "flex" }}>

                <Sidebar />

                <div
                    style={{
                        flex: 1,
                        padding: "30px"
                    }}
                >

                    <h2>Manufacturer Details</h2>

                    <hr />

                    <table
                        cellPadding="10"
                        style={{
                            width: "60%"
                        }}
                    >

                        <tbody>

                            <tr>
                                <td><b>ID</b></td>
                                <td>{manufacturer.id}</td>
                            </tr>

                            <tr>
                                <td><b>User ID</b></td>
                                <td>{manufacturer.user_id}</td>
                            </tr>

                            <tr>
                                <td><b>Company Name</b></td>
                                <td>{manufacturer.company_name}</td>
                            </tr>

                            <tr>
                                <td><b>GST Number</b></td>
                                <td>{manufacturer.gst_number || "-"}</td>
                            </tr>

                            <tr>
                                <td><b>Industry Type</b></td>
                                <td>{manufacturer.industry_type || "-"}</td>
                            </tr>

                            <tr>
                                <td><b>Address</b></td>
                                <td>{manufacturer.address || "-"}</td>
                            </tr>

                            <tr>
                                <td><b>City</b></td>
                                <td>{manufacturer.city || "-"}</td>
                            </tr>

                            <tr>
                                <td><b>State</b></td>
                                <td>{manufacturer.state || "-"}</td>
                            </tr>

                            <tr>
                                <td><b>Pincode</b></td>
                                <td>{manufacturer.pincode || "-"}</td>
                            </tr>

                            <tr>
                                <td><b>Contact Person</b></td>
                                <td>{manufacturer.contact_person || "-"}</td>
                            </tr>

                            <tr>
                                <td><b>Phone</b></td>
                                <td>{manufacturer.phone || "-"}</td>
                            </tr>

                            <tr>
                                <td><b>Website</b></td>
                                <td>{manufacturer.website || "-"}</td>
                            </tr>

                            <tr>
                                <td><b>Description</b></td>
                                <td>{manufacturer.description || "-"}</td>
                            </tr>

                            <tr>
                                <td><b>Verified</b></td>
                                <td>
                                    {manufacturer.is_verified ? "Yes" : "No"}
                                </td>
                            </tr>

                            <tr>
                                <td><b>Created At</b></td>
                                <td>
                                    {new Date(
                                        manufacturer.created_at
                                    ).toLocaleString()}
                                </td>
                            </tr>

                        </tbody>

                    </table>

                    <br />

                    <button
                        onClick={() => navigate("/manufacturers")}
                    >
                        Back
                    </button>

                </div>

            </div>

        </>

    );

};

export default ManufacturerDetails;