import { NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Sidebar = () => {

    const { user } = useAuth();

    const role = user?.role;

    const sidebarStyle = {
        width: "260px",
        minHeight: "100vh",
        background: "#fafafa",
        borderRight: "1px solid #e5e7eb",
        padding: "24px 18px",
        boxSizing: "border-box"
    };

    const titleStyle = {
        fontSize: "24px",
        fontWeight: "700",
        color: "#1f2937",
        marginBottom: "4px"
    };

    const subtitleStyle = {
        fontSize: "13px",
        color: "#6b7280",
        marginBottom: "28px"
    };

    const sectionTitle = {
        fontSize: "12px",
        color: "#6b7280",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "1px",
        margin: "24px 0 10px"
    };

    const itemStyle = {
        marginBottom: "4px"
    };

    const getLinkStyle = ({ isActive }) => ({
        display: "block",
        padding: "12px 16px",
        textDecoration: "none",
        borderRadius: "8px",
        fontSize: "15px",
        fontWeight: isActive ? "600" : "500",
        color: isActive ? "#1d4ed8" : "#374151",
        background: isActive ? "#eff6ff" : "transparent",
        borderLeft: isActive
            ? "4px solid #2563eb"
            : "4px solid transparent",
        transition: "all 0.2s ease"
    });

    const handleEnter = (e) => {

        if (e.target.style.background === "transparent") {

            e.target.style.background = "#f3f4f6";

        }

    };

    const handleLeave = (e) => {

        if (e.target.style.borderLeftColor === "transparent") {

            e.target.style.background = "transparent";

        }

    };

    return (

        <div style={sidebarStyle}>

            <div style={titleStyle}>
                Dashboard
            </div>

            <div style={subtitleStyle}>
                Textile Waste Intelligence Platform
            </div>

            <ul
                style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0
                }}
            >

                <li style={itemStyle}>
                    <NavLink
                        to="/dashboard"
                        end
                        style={getLinkStyle}
                        onMouseEnter={handleEnter}
                        onMouseLeave={handleLeave}
                    >
                        Home
                    </NavLink>
                </li>

                <li style={itemStyle}>
                    <NavLink
                        to="/profile"
                        end
                        style={getLinkStyle}
                        onMouseEnter={handleEnter}
                        onMouseLeave={handleLeave}
                    >
                        User Profile
                    </NavLink>
                </li>

                <li style={itemStyle}>
                    <NavLink
                        to="/profile/edit"
                        style={getLinkStyle}
                        onMouseEnter={handleEnter}
                        onMouseLeave={handleLeave}
                    >
                        Edit User Profile
                    </NavLink>
                </li>

                <li style={itemStyle}>
                    <NavLink
                        to="/change-password"
                        style={getLinkStyle}
                        onMouseEnter={handleEnter}
                        onMouseLeave={handleLeave}
                    >
                        Change Password
                    </NavLink>
                </li>

                {
                    role === "Manufacturer" && (
                        <>

                            <div style={sectionTitle}>
                                Manufacturer
                            </div>

                            <li style={itemStyle}>
                                <NavLink
                                    to="/manufacturer/create"
                                    end
                                    style={getLinkStyle}
                                    onMouseEnter={handleEnter}
                                    onMouseLeave={handleLeave}
                                >
                                    Create Profile
                                </NavLink>
                            </li>

                            <li style={itemStyle}>
                                <NavLink
                                    to="/manufacturer/profile"
                                    end
                                    style={getLinkStyle}
                                    onMouseEnter={handleEnter}
                                    onMouseLeave={handleLeave}
                                >
                                    View Profile
                                </NavLink>
                            </li>

                            <li style={itemStyle}>
                                <NavLink
                                    to="/manufacturer/edit"
                                    style={getLinkStyle}
                                    onMouseEnter={handleEnter}
                                    onMouseLeave={handleLeave}
                                >
                                    Edit Profile
                                </NavLink>
                            </li>

                            <li style={itemStyle}>
                                <NavLink
                                    to="/inventory/add"
                                    style={getLinkStyle}
                                    onMouseEnter={handleEnter}
                                    onMouseLeave={handleLeave}
                                >
                                    Add Inventory
                                </NavLink>
                            </li>

                            <li style={itemStyle}>
                                <NavLink
                                    to="/inventory/my"
                                    end
                                    style={getLinkStyle}
                                    onMouseEnter={handleEnter}
                                    onMouseLeave={handleLeave}
                                >
                                    My Inventory
                                </NavLink>
                            </li>

                            <li style={itemStyle}>
                                <NavLink
                                    to="/dataset"
                                    style={getLinkStyle}
                                    onMouseEnter={handleEnter}
                                    onMouseLeave={handleLeave}
                                >
                                    Sustainability Dataset
                                </NavLink>
                            </li>

                        </>
                    )
                }

                {/* Admin Section Starts Below */}
                                {/* Admin Section */}

                {
                    role === "Admin" && (
                        <>

                            <div style={sectionTitle}>
                                Administration
                            </div>

                            <li style={itemStyle}>
                                <NavLink
                                    to="/users"
                                    end
                                    style={getLinkStyle}
                                    onMouseEnter={handleEnter}
                                    onMouseLeave={handleLeave}
                                >
                                    User Management
                                </NavLink>
                            </li>

                            <li style={itemStyle}>
                                <NavLink
                                    to="/manufacturers"
                                    end
                                    style={getLinkStyle}
                                    onMouseEnter={handleEnter}
                                    onMouseLeave={handleLeave}
                                >
                                    Manufacturer Management
                                </NavLink>
                            </li>

                            <li style={itemStyle}>
                                <NavLink
                                    to="/dataset"
                                    style={getLinkStyle}
                                    onMouseEnter={handleEnter}
                                    onMouseLeave={handleLeave}
                                >
                                    Manage Sustainability Dataset
                                </NavLink>
                            </li>

                        </>
                    )
                }

                {/* Recycler Section */}

                {
                    role === "Recycler" && (
                        <>

                            <div style={sectionTitle}>
                                Recycler
                            </div>

                            <li style={itemStyle}>
                                <NavLink
                                    to="/dashboard"
                                    end
                                    style={getLinkStyle}
                                    onMouseEnter={handleEnter}
                                    onMouseLeave={handleLeave}
                                >
                                    Recycler Dashboard
                                </NavLink>
                            </li>

                        </>
                    )
                }

            </ul>

        </div>

    );

};

export default Sidebar;