import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import useAuth from "../../hooks/useAuth";

const Dashboard = () => {

    const { user } = useAuth();

    const cardStyle = {
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
    };

    const infoCard = {
        flex: "1",
        minWidth: "220px",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        padding: "20px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.04)"
    };

    const buttonStyle = {
        background: "#ffffff",
        color: "#374151",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        padding: "14px 18px",
        width: "230px",
        cursor: "pointer",
        fontSize: "15px",
        fontWeight: "500",
        transition: "0.25s"
    };

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
                        padding: "40px"
                    }}
                >

                    {/* Header */}

                    <div
                        style={{
                            marginBottom: "35px"
                        }}
                    >

                        <h1
                            style={{
                                margin: 0,
                                fontSize: "32px",
                                color: "#111827"
                            }}
                        >
                            Dashboard
                        </h1>

                        <p
                            style={{
                                color: "#6b7280",
                                marginTop: "10px",
                                fontSize: "16px"
                            }}
                        >
                            Welcome back, {user?.name}. Manage your account and platform activities from one place.
                        </p>

                    </div>

                    {/* User Summary */}

                    <div
                        style={{
                            display: "flex",
                            gap: "20px",
                            flexWrap: "wrap",
                            marginBottom: "30px"
                        }}
                    >

                        <div style={infoCard}>

                            <div
                                style={{
                                    fontSize: "13px",
                                    color: "#6b7280",
                                    marginBottom: "10px"
                                }}
                            >
                                Name
                            </div>

                            <div
                                style={{
                                    fontSize: "18px",
                                    fontWeight: "600",
                                    color: "#111827"
                                }}
                            >
                                {user?.name}
                            </div>

                        </div>

                        <div style={infoCard}>

                            <div
                                style={{
                                    fontSize: "13px",
                                    color: "#6b7280",
                                    marginBottom: "10px"
                                }}
                            >
                                Email
                            </div>

                            <div
                                style={{
                                    fontSize: "17px",
                                    fontWeight: "600",
                                    color: "#111827",
                                    wordBreak: "break-word"
                                }}
                            >
                                {user?.email}
                            </div>

                        </div>

                        <div style={infoCard}>

                            <div
                                style={{
                                    fontSize: "13px",
                                    color: "#6b7280",
                                    marginBottom: "10px"
                                }}
                            >
                                Role
                            </div>

                            <div
                                style={{
                                    fontSize: "18px",
                                    fontWeight: "600",
                                    color: "#2563eb"
                                }}
                            >
                                {user?.role}
                            </div>

                        </div>

                    </div>

                    {/* Quick Actions */}

                    <div style={cardStyle}>

                        <h2
                            style={{
                                marginTop: 0,
                                marginBottom: "24px",
                                color: "#111827",
                                fontSize: "22px"
                            }}
                        >
                            Quick Actions
                        </h2>

                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "18px"
                            }}
                        >

                            <Link to="/profile">
                                <button
                                    style={buttonStyle}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = "#eff6ff";
                                        e.target.style.borderColor = "#2563eb";
                                        e.target.style.color = "#2563eb";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = "#ffffff";
                                        e.target.style.borderColor = "#d1d5db";
                                        e.target.style.color = "#374151";
                                    }}
                                >
                                    My Profile
                                </button>
                            </Link>

                            {
                                user?.role === "Manufacturer" && (
                                    <>
                                                                            <Link to="/manufacturer/profile">
                                            <button
                                                style={buttonStyle}
                                                onMouseEnter={(e) => {
                                                    e.target.style.background = "#eff6ff";
                                                    e.target.style.borderColor = "#2563eb";
                                                    e.target.style.color = "#2563eb";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.background = "#ffffff";
                                                    e.target.style.borderColor = "#d1d5db";
                                                    e.target.style.color = "#374151";
                                                }}
                                            >
                                                Manufacturer Profile
                                            </button>
                                        </Link>

                                        <Link to="/inventory/add">
                                            <button
                                                style={buttonStyle}
                                                onMouseEnter={(e) => {
                                                    e.target.style.background = "#eff6ff";
                                                    e.target.style.borderColor = "#2563eb";
                                                    e.target.style.color = "#2563eb";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.background = "#ffffff";
                                                    e.target.style.borderColor = "#d1d5db";
                                                    e.target.style.color = "#374151";
                                                }}
                                            >
                                                Add Inventory
                                            </button>
                                        </Link>

                                        <Link to="/inventory/my">
                                            <button
                                                style={buttonStyle}
                                                onMouseEnter={(e) => {
                                                    e.target.style.background = "#eff6ff";
                                                    e.target.style.borderColor = "#2563eb";
                                                    e.target.style.color = "#2563eb";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.background = "#ffffff";
                                                    e.target.style.borderColor = "#d1d5db";
                                                    e.target.style.color = "#374151";
                                                }}
                                            >
                                                My Inventory
                                            </button>
                                        </Link>

                                        <Link to="/dataset">
                                            <button
                                                style={buttonStyle}
                                                onMouseEnter={(e) => {
                                                    e.target.style.background = "#eff6ff";
                                                    e.target.style.borderColor = "#2563eb";
                                                    e.target.style.color = "#2563eb";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.background = "#ffffff";
                                                    e.target.style.borderColor = "#d1d5db";
                                                    e.target.style.color = "#374151";
                                                }}
                                            >
                                                Sustainability Dataset
                                            </button>
                                        </Link>

                                    </>
                                )
                            }

                            {
                                user?.role === "Admin" && (
                                    <>

                                        <Link to="/users">
                                            <button
                                                style={buttonStyle}
                                                onMouseEnter={(e) => {
                                                    e.target.style.background = "#eff6ff";
                                                    e.target.style.borderColor = "#2563eb";
                                                    e.target.style.color = "#2563eb";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.background = "#ffffff";
                                                    e.target.style.borderColor = "#d1d5db";
                                                    e.target.style.color = "#374151";
                                                }}
                                            >
                                                Manage Users
                                            </button>
                                        </Link>

                                        <Link to="/manufacturers">
                                            <button
                                                style={buttonStyle}
                                                onMouseEnter={(e) => {
                                                    e.target.style.background = "#eff6ff";
                                                    e.target.style.borderColor = "#2563eb";
                                                    e.target.style.color = "#2563eb";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.background = "#ffffff";
                                                    e.target.style.borderColor = "#d1d5db";
                                                    e.target.style.color = "#374151";
                                                }}
                                            >
                                                Manage Manufacturers
                                            </button>
                                        </Link>

                                        <Link to="/inventory">
                                            <button
                                                style={buttonStyle}
                                                onMouseEnter={(e) => {
                                                    e.target.style.background = "#eff6ff";
                                                    e.target.style.borderColor = "#2563eb";
                                                    e.target.style.color = "#2563eb";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.background = "#ffffff";
                                                    e.target.style.borderColor = "#d1d5db";
                                                    e.target.style.color = "#374151";
                                                }}
                                            >
                                                View All Inventory
                                            </button>
                                        </Link>

                                        <Link to="/dataset">
                                            <button
                                                style={buttonStyle}
                                                onMouseEnter={(e) => {
                                                    e.target.style.background = "#eff6ff";
                                                    e.target.style.borderColor = "#2563eb";
                                                    e.target.style.color = "#2563eb";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.background = "#ffffff";
                                                    e.target.style.borderColor = "#d1d5db";
                                                    e.target.style.color = "#374151";
                                                }}
                                            >
                                                Manage Sustainability Dataset
                                            </button>
                                        </Link>

                                    </>
                                )
                            }

                        </div>

                        {
                            user?.role === "Recycler" && (
                                <div
                                    style={{
                                        marginTop: "24px",
                                        padding: "18px",
                                        borderRadius: "10px",
                                        border: "1px solid #e5e7eb",
                                        background: "#f9fafb",
                                        color: "#4b5563",
                                        lineHeight: "1.6"
                                    }}
                                >
                                    Recycler dashboard features will be available in the next milestone.
                                </div>
                            )
                        }

                    </div>

                </div>

            </div>

        </>

    );

};

export default Dashboard;