import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import { createManufacturerProfile } from "../../api/manufacturerApi";

const CreateManufacturerProfile = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        company_name: "",
        gst_number: "",
        industry_type: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        contact_person: "",
        phone: "",
        website: "",
        description: ""
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        try {

            await createManufacturerProfile(formData);

            alert("Manufacturer profile created successfully.");

            navigate("/manufacturer/profile");

        } catch (err) {

            setError(
                err.response?.data?.detail ||
                "Unable to create profile."
            );

        }

    };

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

                    <h2>Create Manufacturer Profile</h2>

                    <hr />

                    <form
                        onSubmit={handleSubmit}
                        style={{
                            maxWidth: "650px"
                        }}
                    >

                        <input
                            type="text"
                            name="company_name"
                            placeholder="Company Name"
                            value={formData.company_name}
                            onChange={handleChange}
                            required
                        />

                        <br /><br />

                        <input
                            type="text"
                            name="gst_number"
                            placeholder="GST Number"
                            value={formData.gst_number}
                            onChange={handleChange}
                        />

                        <br /><br />

                        <input
                            type="text"
                            name="industry_type"
                            placeholder="Industry Type"
                            value={formData.industry_type}
                            onChange={handleChange}
                        />

                        <br /><br />

                        <textarea
                            name="address"
                            placeholder="Address"
                            value={formData.address}
                            onChange={handleChange}
                            rows="3"
                            style={{ width: "100%" }}
                        />

                        <br /><br />

                        <input
                            type="text"
                            name="city"
                            placeholder="City"
                            value={formData.city}
                            onChange={handleChange}
                        />

                        <br /><br />

                        <input
                            type="text"
                            name="state"
                            placeholder="State"
                            value={formData.state}
                            onChange={handleChange}
                        />

                        <br /><br />

                        <input
                            type="text"
                            name="pincode"
                            placeholder="Pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                        />

                        <br /><br />

                        <input
                            type="text"
                            name="contact_person"
                            placeholder="Contact Person"
                            value={formData.contact_person}
                            onChange={handleChange}
                        />

                        <br /><br />

                        <input
                            type="text"
                            name="phone"
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChange={handleChange}
                        />

                        <br /><br />

                        <input
                            type="text"
                            name="website"
                            placeholder="Website"
                            value={formData.website}
                            onChange={handleChange}
                        />

                        <br /><br />

                        <textarea
                            name="description"
                            placeholder="Description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            style={{ width: "100%" }}
                        />

                        <br /><br />

                        <button type="submit">
                            Create Profile
                        </button>

                    </form>

                    {
                        error &&
                        <p style={{ color: "red" }}>
                            {error}
                        </p>
                    }

                </div>

            </div>

        </>

    );

};

export default CreateManufacturerProfile;