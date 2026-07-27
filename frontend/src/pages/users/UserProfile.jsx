import { useEffect, useState } from "react";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import { getMyProfile } from "../../api/userApi";

const UserProfile = () => {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {

        try {

            const data = await getMyProfile();

            setUser(data);

        } catch (error) {

            console.log(error);

        }

        setLoading(false);
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
                    padding: "100px 50px 40px"
                }}
            >

                <div
                    style={{
                        maxWidth: "850px"
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
                        My Profile
                    </h1>

                    <p
                        style={{
                            marginTop: "8px",
                            marginBottom: "30px",
                            color: "#6b7280",
                            fontSize: "15px"
                        }}
                    >
                        View your account information and manage your profile settings.
                    </p>

                    <div
                        style={{
                            background: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "12px",
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

                            <tbody>

                                <tr>

                                    <td
                                        style={{
                                            width: "220px",
                                            padding: "18px 24px",
                                            background: "#f9fafb",
                                            fontWeight: "600",
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
                                            background: "#f9fafb",
                                            fontWeight: "600",
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
                                            background: "#f9fafb",
                                            fontWeight: "600",
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
                                            background: "#f9fafb",
                                            fontWeight: "600"
                                        }}
                                    >
                                        Joined On
                                    </td>

                                    <td
                                        style={{
                                            padding: "18px 24px",
                                            color: "#374151"
                                        }}
                                    >
                                        {
                                            new Date(
                                                user.created_at
                                            ).toLocaleString()
                                        }
                                    </td>

                                </tr>

                            </tbody>

                        </table>

                    </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "15px",
                            marginTop: "30px"
                        }}
                    >

                        <button
                            onClick={() => window.location.href = "/profile/edit"}
                            style={{
                                padding: "12px 22px",
                                background: "#ffffff",
                                color: "#374151",
                                border: "1px solid #d1d5db",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "15px",
                                fontWeight: "500",
                                transition: "0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = "#f3f4f6";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = "#ffffff";
                            }}
                        >
                            Edit Profile
                        </button>

                        <button
                            onClick={() => window.location.href = "/change-password"}
                            style={{
                                padding: "12px 22px",
                                background: "#2563eb",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "15px",
                                fontWeight: "600",
                                transition: "0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = "#1d4ed8";
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = "#2563eb";
                            }}
                        >
                            Change Password
                        </button>

                    </div>

                </div>

            </div>

        </div>

    </>

);

};

export default UserProfile;