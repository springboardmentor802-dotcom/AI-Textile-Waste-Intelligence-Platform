import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import "./MainLayout.css";

function MainLayout() {
  return (
    <div className="layout">

      <Navbar />

      <div className="layout-body">

        <Sidebar />

        <main className="main-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default MainLayout;