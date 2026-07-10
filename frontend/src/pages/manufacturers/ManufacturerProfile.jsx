import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import { getMyManufacturerProfile } from "../../api/manufacturerApi";

const ManufacturerProfile = () => {

    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {

        try {

            const data = await getMyManufacturerProfile();

            setProfile(data);

        } catch (err) {

            console.log(err);

        }

        setLoading(false);

    };

    if (loading) {

        return <h2>Loading...</h2>;

    }

    if (!profile) {

        return (
            <>
                <Navbar />

                <div style={{ display: "flex" }}>

                    <Sidebar />

                    <div style={{ padding: "30px", flex: 1 }}>

                        <h2>Manufacturer Profile</h2>

                        <hr />

                        <p>No manufacturer profile found.</p>

                        <button
                            onClick={() => navigate("/manufacturer/create")}
                        >
                            Create Profile
                        </button>

                    </div>

                </div>

            </>
        );

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

                    <h2>Manufacturer Profile</h2>

                    <hr />

                    <table cellPadding="10">

                        <tbody>

                            <tr>
                                <td><b>Company</b></td>
                                <td>{profile.company_name}</td>
                            </tr>

                            <tr>
                                <td><b>GST</b></td>
                                <td>{profile.gst_number || "-"}</td>
                            </tr>

                            <tr>
                                <td><b>Industry</b></td>
                                <td>{profile.industry_type || "-"}</td>
                            </tr>

                            <tr>
                                <td><b>Address</b></td>
                                <td>{profile.address || "-"}</td>
                            </tr>

                            <tr>
                                <td><b>City</b></td>
                                <td>{profile.city || "-"}</td>
                            </tr>

                            <tr>
                                <td><b>State</b></td>
                                <td>{profile.state || "-"}</td>
                            </tr>

                            <tr>
                                <td><b>Pincode</b></td>
                                <td>{profile.pincode || "-"}</td>
                            </tr>

                            <tr>
                                <td><b>Contact Person</b></td>
                                <td>{profile.contact_person || "-"}</td>
                            </tr>

                            <tr>
                                <td><b>Phone</b></td>
                                <td>{profile.phone || "-"}</td>
                            </tr>

                            <tr>
                                <td><b>Website</b></td>
                                <td>{profile.website || "-"}</td>
                            </tr>

                            <tr>
                                <td><b>Description</b></td>
                                <td>{profile.description || "-"}</td>
                            </tr>

                            <tr>
                                <td><b>Verified</b></td>
                                <td>
                                    {profile.is_verified ? "Yes" : "No"}
                                </td>
                            </tr>

                            <tr>
                                <td><b>Created At</b></td>
                                <td>
                                    {new Date(profile.created_at).toLocaleString()}
                                </td>
                            </tr>

                        </tbody>

                    </table>

                    <br />

                    <button
                        onClick={() => navigate("/manufacturer/edit")}
                    >
                        Edit Profile
                    </button>

                </div>

            </div>

        </>

    );

};

export default ManufacturerProfile;