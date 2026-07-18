import {
  FaTachometerAlt,
  FaBoxes,
  FaUpload,
  FaLightbulb,
  FaChartBar,
  FaUser,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { hasPermission } from "../../utils/permissions";

import "./Sidebar.css";


function Sidebar() {

  const { logout, user } = useAuth();

  const role = user?.role;


  return (

    <aside className="sidebar">


      <nav className="sidebar-menu">


        <NavLink to="/dashboard">
          <FaTachometerAlt/>
          <span>Dashboard</span>
        </NavLink>



        {hasPermission(role,"VIEW_INVENTORY") && (

          <NavLink to="/inventory">
            <FaBoxes/>
            <span>Inventory</span>
          </NavLink>

        )}




        {hasPermission(role,"UPLOAD_WASTE") && (

          <NavLink to="/upload-waste">
            <FaUpload/>
            <span>Upload Waste</span>
          </NavLink>

        )}




        {hasPermission(role,"VIEW_ANALYTICS") && (

          <NavLink to="/analytics">
            <FaChartBar/>
            <span>Analytics</span>
          </NavLink>

        )}




        {hasPermission(role,"VIEW_RECOMMENDATIONS") && (

          <NavLink to="/recommendations">

            <FaLightbulb/>
            <span>Recommendations</span>

          </NavLink>

        )}




        <NavLink to="/profile">

          <FaUser/>
          <span>Profile</span>

        </NavLink>




        {hasPermission(role,"VIEW_SETTINGS") && (

          <NavLink to="/settings">

            <FaCog/>
            <span>Settings</span>

          </NavLink>

        )}



      </nav>



      <button
        className="logout-btn"
        onClick={logout}
      >

        <FaSignOutAlt/>
        <span>Logout</span>

      </button>



    </aside>

  );

}


export default Sidebar;