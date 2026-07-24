import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Inventory from "../pages/Inventory/Inventory";
import UploadWaste from "../pages/UploadWaste/UploadWaste";
import UploadBatch from "../pages/UploadBatch/UploadBatch";
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





            {/* Protected Application Layout */}

            <Route

                element={<MainLayout />}

            >





                {/* Dashboard */}

                <Route

                    path="/dashboard"

                    element={<Dashboard />}

                />







                {/* Inventory */}

                <Route

                    path="/inventory"

                    element={

                        <RoleGuard permission="VIEW_INVENTORY">

                            <Inventory />

                        </RoleGuard>

                    }

                />








                {/* Single Image AI Analysis */}

                <Route

                    path="/upload-waste"

                    element={

                        <RoleGuard permission="UPLOAD_WASTE">

                            <UploadWaste />

                        </RoleGuard>

                    }

                />








                {/* Batch AI Analysis */}

                <Route

                    path="/batch-analysis"

                    element={

                        <RoleGuard permission="UPLOAD_WASTE">

                            <UploadBatch />

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








            {/* Unauthorized */}

            <Route

                path="/unauthorized"

                element={<Unauthorized />}

            />







            {/* Invalid URL */}

            <Route

                path="*"

                element={<Login />}

            />




        </Routes>

    );

}



export default AppRoutes;