import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import {
    getAllUsers,
    deleteUser
} from "../../api/userApi";

const UserList = () => {

    const navigate = useNavigate();

    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {

        try {

            const data = await getAllUsers();

            setUsers(data);

        } catch (err) {

            console.log(err);

        }

        setLoading(false);

    };

    useEffect(() => {

        fetchUsers();

    }, []);

    const handleDelete = async (id) => {

        const confirmDelete = window.confirm(
            "Delete this user?"
        );

        if (!confirmDelete) return;

        try {

            await deleteUser(id);

            fetchUsers();

        } catch (err) {

            alert(
                err.response?.data?.detail ||
                "Unable to delete user."
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
                display: "flex",
                minHeight: "100vh",
                background: "#f8fafc"
            }}
        >

            <Sidebar />

            <div
                style={{
                    flex: 1,
                    padding: "100px 45px 40px"
                }}
            >

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "30px"
                    }}
                >

                    <div>

                        <h1
                            style={{
                                margin: 0,
                                color: "#111827",
                                fontSize: "30px"
                            }}
                        >
                            User Management
                        </h1>

                        <p
                            style={{
                                marginTop: "8px",
                                color: "#6b7280"
                            }}
                        >
                            View and manage all registered users.
                        </p>

                    </div>

                </div>

                <div
                    style={{
                        background: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        overflow: "hidden",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                    }}
                >

                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse"
                        }}
                    >

                        <thead>

                            <tr
                                style={{
                                    background: "#f9fafb"
                                }}
                            >

                                <th
                                    style={{
                                        padding: "16px",
                                        textAlign: "left",
                                        borderBottom: "1px solid #e5e7eb"
                                    }}
                                >
                                    ID
                                </th>

                                <th
                                    style={{
                                        padding: "16px",
                                        textAlign: "left",
                                        borderBottom: "1px solid #e5e7eb"
                                    }}
                                >
                                    Name
                                </th>

                                <th
                                    style={{
                                        padding: "16px",
                                        textAlign: "left",
                                        borderBottom: "1px solid #e5e7eb"
                                    }}
                                >
                                    Email
                                </th>

                                <th
                                    style={{
                                        padding: "16px",
                                        textAlign: "left",
                                        borderBottom: "1px solid #e5e7eb"
                                    }}
                                >
                                    Role
                                </th>

                                <th
                                    style={{
                                        padding: "16px",
                                        textAlign: "center",
                                        borderBottom: "1px solid #e5e7eb"
                                    }}
                                >
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        <tbody>
                                                        {

                                users.map((user, index) => (

                                    <tr
                                        key={user.id}
                                        style={{
                                            background: index % 2 === 0 ? "#ffffff" : "#fcfcfd",
                                            transition: "background 0.2s ease"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "#f9fafb";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background =
                                                index % 2 === 0 ? "#ffffff" : "#fcfcfd";
                                        }}
                                    >

                                        <td
                                            style={{
                                                padding: "16px",
                                                borderBottom: "1px solid #e5e7eb",
                                                color: "#374151"
                                            }}
                                        >
                                            {user.id}
                                        </td>

                                        <td
                                            style={{
                                                padding: "16px",
                                                borderBottom: "1px solid #e5e7eb",
                                                fontWeight: "600",
                                                color: "#111827"
                                            }}
                                        >
                                            {user.name}
                                        </td>

                                        <td
                                            style={{
                                                padding: "16px",
                                                borderBottom: "1px solid #e5e7eb",
                                                color: "#4b5563"
                                            }}
                                        >
                                            {user.email}
                                        </td>

                                        <td
                                            style={{
                                                padding: "16px",
                                                borderBottom: "1px solid #e5e7eb"
                                            }}
                                        >

                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    padding: "6px 14px",
                                                    borderRadius: "20px",
                                                    background: "#eff6ff",
                                                    color: "#2563eb",
                                                    fontSize: "13px",
                                                    fontWeight: "600"
                                                }}
                                            >
                                                {user.role}
                                            </span>

                                        </td>

                                        <td
                                            style={{
                                                padding: "16px",
                                                borderBottom: "1px solid #e5e7eb",
                                                textAlign: "center"
                                            }}
                                        >

                                            <button
                                                onClick={() =>
                                                    navigate(`/users/${user.id}`)
                                                }
                                                style={{
                                                    padding: "8px 16px",
                                                    background: "#2563eb",
                                                    color: "#ffffff",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    cursor: "pointer",
                                                    fontSize: "14px",
                                                    fontWeight: "500",
                                                    marginRight: "10px",
                                                    transition: "0.2s ease"
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.background = "#1d4ed8";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.background = "#2563eb";
                                                }}
                                            >
                                                View
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleDelete(user.id)
                                                }
                                                style={{
                                                    padding: "8px 16px",
                                                    background: "#dc2626",
                                                    color: "#ffffff",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    cursor: "pointer",
                                                    fontSize: "14px",
                                                    fontWeight: "500",
                                                    transition: "0.2s ease"
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.background = "#b91c1c";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.background = "#dc2626";
                                                }}
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

        </div>

    </>

);

};

export default UserList;