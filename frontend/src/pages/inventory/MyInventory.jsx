import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import {
    getMyInventory,
    deleteInventory
} from "../../api/inventoryApi";

const MyInventory = () => {

    const [inventory, setInventory] = useState([]);

    const [loading, setLoading] = useState(true);

    const loadInventory = async () => {

        try {

            const data = await getMyInventory();

            setInventory(data.inventory);

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.detail ||
                "Failed to load inventory."
            );

        }

        setLoading(false);

    };

    useEffect(() => {

        loadInventory();

    }, []);

    const handleDelete = async (id) => {

        const confirmDelete = window.confirm(
            "Delete this inventory item?"
        );

        if (!confirmDelete) return;

        try {

            await deleteInventory(id);

            alert("Inventory deleted successfully.");

            loadInventory();

        } catch (error) {

            alert(
                error.response?.data?.detail ||
                "Unable to delete inventory."
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

                    <h2>My Inventory</h2>

                    <br />

                    <Link to="/inventory/add">
                        <button>
                            Add Inventory
                        </button>
                    </Link>

                    <br />
                    <br />

                    <table
                        border="1"
                        cellPadding="10"
                        width="100%"
                    >

                        <thead>

                            <tr>

                                <th>ID</th>

                                <th>Textile</th>

                                <th>Material</th>

                                <th>Quantity</th>

                                <th>Waste Type</th>

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

                                            <td>{item.textile_name}</td>

                                            <td>{item.material}</td>

                                            <td>
                                                {item.quantity} {item.unit}
                                            </td>

                                            <td>{item.waste_type}</td>

                                            <td>{item.status}</td>

                                            <td>

                                                <Link
                                                    to={`/inventory/${item.id}`}
                                                >
                                                    View
                                                </Link>

                                                {" | "}

                                                <Link
                                                    to={`/inventory/edit/${item.id}`}
                                                >
                                                    Edit
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

export default MyInventory;