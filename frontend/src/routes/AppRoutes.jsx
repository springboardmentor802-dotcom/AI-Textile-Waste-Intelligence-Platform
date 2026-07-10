import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Inventory from "../pages/Inventory/Inventory";
import UploadWaste from "../pages/UploadWaste/UploadWaste";
import Analytics from "../pages/Analytics/Analytics";
import Recommendations from "../pages/Recommendations/Recommendations";
import Profile from "../pages/Profile/Profile";
import Settings from "../pages/Settings/Settings";

import MainLayout from "../layouts/MainLayout";


function AppRoutes() {
  return (
    <Routes>

      <Route path="/" element={<Login />} />


      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/inventory" element={<Inventory />} />

        <Route path="/upload-waste" element={<UploadWaste />} />

        <Route path="/analytics" element={<Analytics />} />

        <Route path="/recommendations" element={<Recommendations />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/settings" element={<Settings />} />

      </Route>

    </Routes>
  );
}

export default AppRoutes;