import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import { createInventory } from "../../api/inventoryApi";


const grid2 = {
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"25px",
marginBottom:"25px"
};


const grid3 = {
display:"grid",
gridTemplateColumns:"1fr 1fr 1fr",
gap:"25px",
marginBottom:"25px"
};


const labelStyle = {

display:"block",
marginBottom:"8px",
fontSize:"14px",
fontWeight:"600",
color:"#334155"

};



const inputStyle = {

width:"100%",
padding:"14px",
border:"1px solid #cbd5e1",
borderRadius:"12px",
fontSize:"15px",
outline:"none",
background:"#ffffff",
color:"#111827",
boxSizing:"border-box"

};



const sectionStyle = {

fontSize:"19px",
color:"#1e293b",
marginTop:"30px",
marginBottom:"20px",
paddingBottom:"12px",
borderBottom:"1px solid #e2e8f0"

};

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
                        maxWidth: "1000px",
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
                                fontSize: "34px",
                                fontWeight: "700",
                                color: "#0f172a",
                                marginBottom: "8px",
                            }}
                        >
                            Add Inventory
                        </h1>

                        <p
                            style={{
                                color: "#64748b",
                                fontSize: "15px",
                                lineHeight: "24px",
                            }}
                        >
                            Add textile inventory details that will be available
                            for buyers and recycling partners.
                        </p>
                    </div>

                    <div
                        style={{
                            background: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "16px",
                            padding: "40px",
                            boxShadow: "0 4px 14px rgba(15,23,42,0.06)",
                        }}
                    >
                        <form onSubmit={handleSubmit}>
                            <h3 style={sectionStyle}>
                                Textile Information
                            </h3>

                            <div style={grid2}>
                                {[
                                    ["Textile Name", "textile_name"],
                                    ["Textile Type", "textile_type"],
                                    ["Material", "material"],
                                    ["Color", "color"],
                                ].map((item) => (
                                    <div key={item[1]}>
                                        <label style={labelStyle}>
                                            {item[0]}
                                        </label>

                                        <input
                                            type="text"
                                            name={item[1]}
                                            value={formData[item[1]]}
                                            onChange={handleChange}
                                            style={inputStyle}
                                            required={
                                                item[1] === "textile_name" ||
                                                item[1] === "textile_type" ||
                                                item[1] === "material"
                                            }
                                        />
                                    </div>
                                ))}
                            </div>

                            <h3 style={sectionStyle}>
                                Inventory Information
                            </h3>

                            <div style={grid3}>
                                <div>
                                    <label style={labelStyle}>
                                        Quantity
                                    </label>

                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        style={inputStyle}
                                        required
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>
                                        Unit
                                    </label>

                                    <select
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleChange}
                                        style={inputStyle}
                                    >
                                        <option value="kg">kg</option>
                                        <option value="tons">tons</option>
                                        <option value="pieces">pieces</option>
                                        <option value="meters">meters</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={labelStyle}>
                                        Waste Type
                                    </label>

                                    <input
                                        type="text"
                                        name="waste_type"
                                        value={formData.waste_type}
                                        onChange={handleChange}
                                        style={inputStyle}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={grid2}>
                                <div>
                                    <label style={labelStyle}>
                                        Quality
                                    </label>

                                    <input
                                        type="text"
                                        name="quality"
                                        value={formData.quality}
                                        onChange={handleChange}
                                        style={inputStyle}
                                    />
                                </div>

                                <div>
                                    <label style={labelStyle}>
                                        Storage Location
                                    </label>

                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <h3 style={sectionStyle}>
                                Additional Information
                            </h3>

                            <label style={labelStyle}>
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="5"
                                style={inputStyle}
                                placeholder="Provide additional details about this inventory..."
                            />

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    marginTop: "35px",
                                }}
                            >
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        background: loading
                                            ? "#94a3b8"
                                            : "#2563eb",
                                        color: "#fff",
                                        border: "none",
                                        padding: "14px 32px",
                                        borderRadius: "10px",
                                        fontSize: "15px",
                                        fontWeight: "600",
                                        cursor: loading
                                            ? "not-allowed"
                                            : "pointer",
                                    }}
                                >
                                    {loading
                                        ? "Saving..."
                                        : "Add Inventory"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </>
);
};

export default AddInventory;