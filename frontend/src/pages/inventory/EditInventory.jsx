import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import {
    getInventoryById,
    updateInventory
} from "../../api/inventoryApi";

const EditInventory = () => {

    const { id } = useParams();

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        textile_name: "",
        textile_type: "",
        material: "",
        color: "",
        quantity: "",
        unit: "",
        waste_type: "",
        quality: "",
        location: "",
        description: ""
    });

    useEffect(() => {

        loadInventory();

    }, []);

    const loadInventory = async () => {

        try {

            const data = await getInventoryById(id);

            setFormData({
                textile_name: data.textile_name,
                textile_type: data.textile_type,
                material: data.material,
                color: data.color || "",
                quantity: data.quantity,
                unit: data.unit,
                waste_type: data.waste_type,
                quality: data.quality || "",
                location: data.location || "",
                description: data.description || ""
            });

        } catch (error) {

            alert(
                error.response?.data?.detail ||
                "Unable to load inventory."
            );

        }

        setLoading(false);

    };

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await updateInventory(id, {
                ...formData,
                quantity: Number(formData.quantity)
            });

            alert("Inventory updated successfully.");

            navigate("/inventory/my");

        } catch (error) {

            alert(
                error.response?.data?.detail ||
                "Update failed."
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

                    <h2>Edit Inventory</h2>

                    <form onSubmit={handleSubmit}>

                        <input
                            name="textile_name"
                            value={formData.textile_name}
                            onChange={handleChange}
                            placeholder="Textile Name"
                            required
                        />

                        <br /><br />

                        <input
                            name="textile_type"
                            value={formData.textile_type}
                            onChange={handleChange}
                            placeholder="Textile Type"
                            required
                        />

                        <br /><br />

                        <input
                            name="material"
                            value={formData.material}
                            onChange={handleChange}
                            placeholder="Material"
                            required
                        />

                        <br /><br />

                        <input
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            placeholder="Color"
                        />

                        <br /><br />

                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            placeholder="Quantity"
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
                            name="waste_type"
                            value={formData.waste_type}
                            onChange={handleChange}
                            placeholder="Waste Type"
                            required
                        />

                        <br /><br />

                        <input
                            name="quality"
                            value={formData.quality}
                            onChange={handleChange}
                            placeholder="Quality"
                        />

                        <br /><br />

                        <input
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Location"
                        />

                        <br /><br />

                        <textarea
                            rows="5"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Description"
                        />

                        <br /><br />

                        <button type="submit">
                            Update Inventory
                        </button>

                    </form>

                </div>

            </div>

        </>

    );

};

export default EditInventory;