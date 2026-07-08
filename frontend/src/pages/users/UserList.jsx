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

            <div style={{ display: "flex" }}>

                <Sidebar />

                <div
                    style={{
                        flex: 1,
                        padding: "30px"
                    }}
                >

                    <h2>User Management</h2>

                    <hr />

                    <table
                        border="1"
                        cellPadding="10"
                        style={{
                            width: "100%",
                            borderCollapse: "collapse"
                        }}
                    >

                        <thead>

                            <tr>

                                <th>ID</th>

                                <th>Name</th>

                                <th>Email</th>

                                <th>Role</th>

                                <th>Actions</th>

                            </tr>

                        </thead>

                        <tbody>

                            {

                                users.map(user => (

                                    <tr key={user.id}>

                                        <td>{user.id}</td>

                                        <td>{user.name}</td>

                                        <td>{user.email}</td>

                                        <td>{user.role}</td>

                                        <td>

                                            <button
                                                onClick={() =>
                                                    navigate(`/users/${user.id}`)
                                                }
                                            >
                                                View
                                            </button>

                                            <button
                                                style={{
                                                    marginLeft: "10px"
                                                }}
                                                onClick={() =>
                                                    handleDelete(user.id)
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

export default UserList;