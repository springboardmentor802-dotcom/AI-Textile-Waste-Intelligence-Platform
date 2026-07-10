import { useAuth } from "../../contexts/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-title">
        AI Textile Waste Intelligence Platform
      </div>

      <div className="navbar-user">
        <div>
          <h4>{user?.username}</h4>
          <span>{user?.role}</span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;