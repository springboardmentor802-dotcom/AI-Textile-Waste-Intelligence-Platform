

import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Inventory from "../pages/Inventory/Inventory";
import UploadWaste from "../pages/UploadWaste/UploadWaste";
import Analytics from "../pages/Analytics/Analytics";
import Recommendations from "../pages/Recommendations/Recommendations";
import Profile from "../pages/Profile/Profile";
import Settings from "../pages/Settings/Settings";
import Unauthorized from "../pages/Unauthorized";

import MainLayout from "../layouts/MainLayout";
import RoleGuard from "../components/RoleGuard";


function AppRoutes() {

    return (
        <Routes>

            {/* Public Route */}
            <Route 
                path="/" 
                element={<Login />} 
            />


            <Route
    element={<MainLayout />}
>

                {/* Dashboard - all logged users */}
                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />


                {/* Inventory - Admin and Industry */}
                <Route
                    path="/inventory"
                    element={
                        <RoleGuard permission="VIEW_INVENTORY">
                            <Inventory />
                        </RoleGuard>
                    }
                />


                {/* Upload Waste - Industry and NGO */}
                <Route
                    path="/upload-waste"
                    element={
                        <RoleGuard permission="UPLOAD_WASTE">
                            <UploadWaste />
                        </RoleGuard>
                    }
                />


                {/* Analytics */}
                <Route
                    path="/analytics"
                    element={
                        <RoleGuard permission="VIEW_ANALYTICS">
                            <Analytics />
                        </RoleGuard>
                    }
                />


                {/* Recommendations */}
                <Route
                    path="/recommendations"
                    element={
                        <RoleGuard permission="VIEW_RECOMMENDATIONS">
                            <Recommendations />
                        </RoleGuard>
                    }
                />


                {/* Profile */}
                <Route
                    path="/profile"
                    element={<Profile />}
                />


                {/* Settings */}
                <Route
                    path="/settings"
                    element={<Settings />}
                />

            </Route>


            {/* Unauthorized Page */}
            <Route
                path="/unauthorized"
                element={<Unauthorized />}
            />


            {/* Unknown URL */}
            <Route
                path="*"
                element={<Login />}
            />

        </Routes>
    );
}


export default AppRoutes;