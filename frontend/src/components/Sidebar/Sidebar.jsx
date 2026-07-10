import {
  FaTachometerAlt,
  FaBoxes,
  FaUpload,
  FaChartBar,
  FaLightbulb,
  FaUser,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Sidebar.css";


function Sidebar() {

  const { logout } = useAuth();


  return (
    <aside className="sidebar">

      <nav className="sidebar-menu">

        <NavLink to="/dashboard">
          <FaTachometerAlt />
          <span>Dashboard</span>
        </NavLink>


        <NavLink to="/inventory">
          <FaBoxes />
          <span>Inventory</span>
        </NavLink>


        <NavLink to="/upload-waste">
          <FaUpload />
          <span>Upload Waste</span>
        </NavLink>


        <NavLink to="/analytics">
          <FaChartBar />
          <span>Analytics</span>
        </NavLink>


        <NavLink to="/recommendations">
          <FaLightbulb />
          <span>Recommendations</span>
        </NavLink>


        <NavLink to="/profile">
          <FaUser />
          <span>Profile</span>
        </NavLink>


        <NavLink to="/settings">
          <FaCog />
          <span>Settings</span>
        </NavLink>

      </nav>


      <button
        className="logout-btn"
        onClick={logout}
      >
        <FaSignOutAlt />
        <span>Logout</span>
      </button>


    </aside>
  );
}


export default Sidebar;