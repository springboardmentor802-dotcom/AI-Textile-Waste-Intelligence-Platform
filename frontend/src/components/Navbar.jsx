import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Navbar = () => {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        height: "70px",
        backgroundColor: "#1E3A8A",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 30px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontSize: "22px",
          fontWeight: "bold",
        }}
      >
        Textile Waste Intelligence Platform
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div>
          <div style={{ fontWeight: "bold" }}>
            {user?.name}
          </div>

          <div
            style={{
              fontSize: "13px",
            }}
          >
            {user?.role}
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: "#EF4444",
            color: "white",
            border: "none",
            padding: "10px 18px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;