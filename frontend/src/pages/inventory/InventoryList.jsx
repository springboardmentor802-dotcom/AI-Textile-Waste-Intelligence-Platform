import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import {
    getAllInventory,
    deleteInventory
} from "../../api/inventoryApi";

const InventoryList = () => {

    const [inventory, setInventory] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {

        try {

            const data = await getAllInventory();

            setInventory(data.inventory);

        } catch (error) {

            alert(
                error.response?.data?.detail ||
                "Unable to load inventory."
            );

        }

        setLoading(false);

    };

    const handleDelete = async (id) => {

        const confirmDelete = window.confirm(
            "Delete this inventory item?"
        );

        if (!confirmDelete) return;

        try {

            await deleteInventory(id);

            alert("Inventory deleted.");

            loadInventory();

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

            <div style={{ display: "flex" }}>

                <Sidebar />

                <div
                    style={{
                        flex: 1,
                        padding: "30px"
                    }}
                >

                    <h2>All Inventory</h2>

                    <table
                        border="1"
                        cellPadding="10"
                        width="100%"
                    >

                        <thead>

                            <tr>

                                <th>ID</th>

                                <th>Manufacturer ID</th>

                                <th>Textile</th>

                                <th>Material</th>

                                <th>Quantity</th>

                                <th>Status</th>

                                <th>Actions</th>

                            </tr>

                        </thead>

                        <tbody>

                            {
                                inventory.length === 0 ?

                                    (
                                        <tr>

                                            <td
                                                colSpan="7"
                                                align="center"
                                            >
                                                No Inventory Found
                                            </td>

                                        </tr>
                                    )

                                    :

                                    inventory.map(item => (

                                        <tr key={item.id}>

                                            <td>{item.id}</td>

                                            <td>{item.manufacturer_id}</td>

                                            <td>{item.textile_name}</td>

                                            <td>{item.material}</td>

                                            <td>
                                                {item.quantity} {item.unit}
                                            </td>

                                            <td>{item.status}</td>

                                            <td>

                                                <Link
                                                    to={`/inventory/${item.id}`}
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

export default InventoryList;