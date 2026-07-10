import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import { getInventoryById } from "../../api/inventoryApi";

const InventoryDetails = () => {

    const { id } = useParams();

    const [inventory, setInventory] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadInventory();

    }, []);

    const loadInventory = async () => {

        try {

            const data = await getInventoryById(id);

            setInventory(data);

        } catch (error) {

            alert(
                error.response?.data?.detail ||
                "Unable to load inventory."
            );

        }

        setLoading(false);

    };

    if (loading) {
        return <h2>Loading...</h2>;
    }

    if (!inventory) {
        return <h2>Inventory not found.</h2>;
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

                    <h2>Inventory Details</h2>

                    <hr />

                    <p><strong>ID:</strong> {inventory.id}</p>

                    <p><strong>Textile Name:</strong> {inventory.textile_name}</p>

                    <p><strong>Textile Type:</strong> {inventory.textile_type}</p>

                    <p><strong>Material:</strong> {inventory.material}</p>

                    <p><strong>Color:</strong> {inventory.color || "-"}</p>

                    <p>
                        <strong>Quantity:</strong>{" "}
                        {inventory.quantity} {inventory.unit}
                    </p>

                    <p><strong>Waste Type:</strong> {inventory.waste_type}</p>

                    <p><strong>Quality:</strong> {inventory.quality || "-"}</p>

                    <p><strong>Location:</strong> {inventory.location || "-"}</p>

                    <p><strong>Status:</strong> {inventory.status}</p>

                    <p>
                        <strong>Description:</strong><br />
                        {inventory.description || "-"}
                    </p>

                    <p>
                        <strong>Created At:</strong>{" "}
                        {new Date(inventory.created_at).toLocaleString()}
                    </p>

                    <br />

                    <Link to="/inventory/my">
                        <button>
                            Back
                        </button>
                    </Link>

                    {" "}

                    <Link to={`/inventory/edit/${inventory.id}`}>
                        <button>
                            Edit
                        </button>
                    </Link>

                </div>

            </div>

        </>

    );

};

export default InventoryDetails;