import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <div
      style={{
        width: "250px",
        minHeight: "calc(100vh - 70px)",
        background: "#F3F4F6",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <h3>Menu</h3>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
        }}
      >
        <li style={{ marginBottom: "15px" }}>
          <Link to="/dashboard">Dashboard</Link>
        </li>

        <li style={{ marginBottom: "15px" }}>
          <Link to="/profile">My Profile</Link>
        </li>

        <li style={{ marginBottom: "15px" }}>
          <Link to="/profile/edit">Edit Profile</Link>
        </li>

        <li style={{ marginBottom: "15px" }}>
          <Link to="/change-password">
            Change Password
          </Link>
        </li>

        {user?.role === "Admin" && (
          <li style={{ marginBottom: "15px" }}>
            <Link to="/users">
              User Management
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;