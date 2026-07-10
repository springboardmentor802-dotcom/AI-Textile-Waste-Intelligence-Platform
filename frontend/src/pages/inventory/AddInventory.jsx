import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import { createInventory } from "../../api/inventoryApi";

const AddInventory = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        textile_name: "",
        textile_type: "",
        material: "",
        color: "",
        quantity: "",
        unit: "kg",
        waste_type: "",
        quality: "",
        location: "",
        description: ""
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        try {

            await createInventory({
                ...formData,
                quantity: Number(formData.quantity)
            });

            alert("Inventory added successfully!");

            navigate("/inventory/my");

        } catch (error) {

            alert(
                error.response?.data?.detail ||
                "Failed to create inventory."
            );

        }

        setLoading(false);

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

                    <h2>Add Inventory</h2>

                    <form onSubmit={handleSubmit}>

                        <input
                            type="text"
                            name="textile_name"
                            placeholder="Textile Name"
                            value={formData.textile_name}
                            onChange={handleChange}
                            required
                        />

                        <br /><br />

                        <input
                            type="text"
                            name="textile_type"
                            placeholder="Textile Type"
                            value={formData.textile_type}
                            onChange={handleChange}
                            required
                        />

                        <br /><br />

                        <input
                            type="text"
                            name="material"
                            placeholder="Material"
                            value={formData.material}
                            onChange={handleChange}
                            required
                        />

                        <br /><br />

                        <input
                            type="text"
                            name="color"
                            placeholder="Color"
                            value={formData.color}
                            onChange={handleChange}
                        />

                        <br /><br />

                        <input
                            type="number"
                            name="quantity"
                            placeholder="Quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            required
                        />

                        <br /><br />

                        <select
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                        >
                            <option value="kg">kg</option>
                            <option value="tons">tons</option>
                            <option value="pieces">pieces</option>
                            <option value="meters">meters</option>
                        </select>

                        <br /><br />

                        <input
                            type="text"
                            name="waste_type"
                            placeholder="Waste Type"
                            value={formData.waste_type}
                            onChange={handleChange}
                            required
                        />

                        <br /><br />

                        <input
                            type="text"
                            name="quality"
                            placeholder="Quality"
                            value={formData.quality}
                            onChange={handleChange}
                        />

                        <br /><br />

                        <input
                            type="text"
                            name="location"
                            placeholder="Location"
                            value={formData.location}
                            onChange={handleChange}
                        />

                        <br /><br />

                        <textarea
                            name="description"
                            placeholder="Description"
                            rows="4"
                            value={formData.description}
                            onChange={handleChange}
                        />

                        <br /><br />

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Add Inventory"}
                        </button>

                    </form>

                </div>

            </div>

        </>

    );

};

export default AddInventory;