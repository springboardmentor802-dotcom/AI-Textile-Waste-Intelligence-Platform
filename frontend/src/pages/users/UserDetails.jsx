import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import { getUserById } from "../../api/userApi";

const UserDetails = () => {

    const { id } = useParams();

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        fetchUser();

    }, []);

    const fetchUser = async () => {

        try {

            const data = await getUserById(id);

            setUser(data);

        }
        catch(error){

            console.log(error);

        }

        setLoading(false);

    };

    if(loading){

        return <h2>Loading...</h2>;

    }

    if(!user){

        return <h2>User Not Found</h2>;

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
                    padding: "100px 50px 40px"
                }}
            >

                <div
                    style={{
                        maxWidth: "800px"
                    }}
                >

                    <h1
                        style={{
                            margin: 0,
                            fontSize: "30px",
                            color: "#111827",
                            fontWeight: "700"
                        }}
                    >
                        User Details
                    </h1>

                    <p
                        style={{
                            marginTop: "8px",
                            marginBottom: "30px",
                            color: "#6b7280",
                            fontSize: "15px"
                        }}
                    >
                        View complete information about the selected user.
                    </p>

                    <div
                        style={{
                            background: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "12px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                            overflow: "hidden"
                        }}
                    >

                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse"
                            }}
                        >

                            <tbody>

                                <tr>

                                    <td
                                        style={{
                                            padding: "18px 24px",
                                            fontWeight: "600",
                                            width: "220px",
                                            background: "#f9fafb",
                                            borderBottom: "1px solid #e5e7eb",
                                            color: "#374151"
                                        }}
                                    >
                                        User ID
                                    </td>

                                    <td
                                        style={{
                                            padding: "18px 24px",
                                            borderBottom: "1px solid #e5e7eb",
                                            color: "#111827"
                                        }}
                                    >
                                        {user.id}
                                    </td>

                                </tr>

                                <tr>

                                    <td
                                        style={{
                                            padding: "18px 24px",
                                            fontWeight: "600",
                                            background: "#f9fafb",
                                            borderBottom: "1px solid #e5e7eb"
                                        }}
                                    >
                                        Full Name
                                    </td>

                                    <td
                                        style={{
                                            padding: "18px 24px",
                                            borderBottom: "1px solid #e5e7eb"
                                        }}
                                    >
                                        {user.name}
                                    </td>

                                </tr>

                                <tr>

                                    <td
                                        style={{
                                            padding: "18px 24px",
                                            fontWeight: "600",
                                            background: "#f9fafb",
                                            borderBottom: "1px solid #e5e7eb"
                                        }}
                                    >
                                        Email Address
                                    </td>

                                    <td
                                        style={{
                                            padding: "18px 24px",
                                            borderBottom: "1px solid #e5e7eb"
                                        }}
                                    >
                                        {user.email}
                                    </td>

                                </tr>

                                <tr>

                                    <td
                                        style={{
                                            padding: "18px 24px",
                                            fontWeight: "600",
                                            background: "#f9fafb",
                                            borderBottom: "1px solid #e5e7eb"
                                        }}
                                    >
                                        Role
                                    </td>

                                    <td
                                        style={{
                                            padding: "18px 24px",
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
                                                fontWeight: "600",
                                                fontSize: "14px"
                                            }}
                                        >
                                            {user.role}
                                        </span>
                                    </td>

                                </tr>

                                <tr>

                                    <td
                                        style={{
                                            padding: "18px 24px",
                                            fontWeight: "600",
                                            background: "#f9fafb"
                                        }}
                                    >
                                        Created At
                                    </td>

                                    <td
                                        style={{
                                            padding: "18px 24px"
                                        }}
                                    >
                                        {
                                            user.created_at
                                                ? new Date(user.created_at).toLocaleString()
                                                : "-"
                                        }
                                    </td>

                                </tr>

                            </tbody>

                        </table>

                    </div>

                    <div
                        style={{
                            marginTop: "30px",
                            display: "flex",
                            justifyContent: "flex-end"
                        }}
                    >
                                                <button
                            onClick={() => navigate("/users")}
                            style={{
                                padding: "12px 24px",
                                background: "#2563eb",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "15px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = "#1d4ed8";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = "#2563eb";
                            }}
                        >
                            Back to Users
                        </button>

                    </div>

                </div>

            </div>

        </div>

    </>

);

};

export default UserDetails;
