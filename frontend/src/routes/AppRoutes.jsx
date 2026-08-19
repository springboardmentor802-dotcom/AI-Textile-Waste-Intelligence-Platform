import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";

import Dashboard from "../pages/Dashboard/Dashboard";
import Inventory from "../pages/Inventory/Inventory";
import UploadWaste from "../pages/UploadWaste/UploadWaste";
import UploadBatch from "../pages/UploadBatch/UploadBatch";
import Analytics from "../pages/Analytics/Analytics";
import Recommendations from "../pages/Recommendations/Recommendations";
import Notifications from "../pages/Notifications/Notifications";
import Profile from "../pages/Profile/Profile";
import Settings from "../pages/Settings/Settings";
import Unauthorized from "../pages/Unauthorized";

import MainLayout from "../layouts/MainLayout";

import ProtectedRoute from "./ProtectedRoute";
import RoleGuard from "../components/RoleGuard";

import {
  PERMISSIONS,
} from "../utils/permissions";

function AppRoutes() {
  return (
    <Routes>
      {/* ======================================== */}
      {/* PUBLIC */}
      {/* ======================================== */}

      <Route
        path="/"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* ======================================== */}
      {/* AUTHENTICATED APPLICATION */}
      {/* ======================================== */}

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* ====================================== */}
        {/* DASHBOARD */}
        {/* ====================================== */}

        <Route
          path="/dashboard"
          element={
            <RoleGuard
              permission={
                PERMISSIONS
                  .VIEW_DASHBOARD
              }
            >
              <Dashboard />
            </RoleGuard>
          }
        />

        {/* ====================================== */}
        {/* INVENTORY */}
        {/* ====================================== */}

        <Route
          path="/inventory"
          element={
            <RoleGuard
              permission={
                PERMISSIONS
                  .VIEW_INVENTORY
              }
            >
              <Inventory />
            </RoleGuard>
          }
        />

        {/* ====================================== */}
        {/* SINGLE WASTE ANALYSIS */}
        {/* ====================================== */}

        <Route
          path="/upload-waste"
          element={
            <RoleGuard
              permission={
                PERMISSIONS
                  .UPLOAD_WASTE
              }
            >
              <UploadWaste />
            </RoleGuard>
          }
        />

        {/* ====================================== */}
        {/* BATCH ANALYSIS */}
        {/* ====================================== */}

        <Route
          path="/batch-analysis"
          element={
            <RoleGuard
              permission={
                PERMISSIONS
                  .UPLOAD_WASTE
              }
            >
              <UploadBatch />
            </RoleGuard>
          }
        />

        {/* ====================================== */}
        {/* ANALYTICS */}
        {/* ====================================== */}

        <Route
          path="/analytics"
          element={
            <RoleGuard
              permission={
                PERMISSIONS
                  .VIEW_ANALYTICS
              }
            >
              <Analytics />
            </RoleGuard>
          }
        />

        {/* ====================================== */}
        {/* RECOMMENDATIONS */}
        {/* ====================================== */}

        <Route
          path="/recommendations"
          element={
            <RoleGuard
              permission={
                PERMISSIONS
                  .VIEW_RECOMMENDATIONS
              }
            >
              <Recommendations />
            </RoleGuard>
          }
        />

        {/* ====================================== */}
        {/* NOTIFICATIONS */}
        {/* ====================================== */}

        <Route
          path="/notifications"
          element={
            <RoleGuard
              permission={
                PERMISSIONS
                  .VIEW_NOTIFICATIONS
              }
            >
              <Notifications />
            </RoleGuard>
          }
        />

        {/* ====================================== */}
        {/* PROFILE */}
        {/* ====================================== */}

        <Route
          path="/profile"
          element={
            <RoleGuard
              permission={
                PERMISSIONS
                  .VIEW_PROFILE
              }
            >
              <Profile />
            </RoleGuard>
          }
        />

        {/* ====================================== */}
        {/* SETTINGS */}
        {/* ====================================== */}

        <Route
          path="/settings"
          element={
            <RoleGuard
              permission={
                PERMISSIONS
                  .VIEW_SETTINGS
              }
            >
              <Settings />
            </RoleGuard>
          }
        />
      </Route>

      {/* ======================================== */}
      {/* AUTHENTICATED BUT NOT AUTHORIZED */}
      {/* ======================================== */}

      <Route
        path="/unauthorized"
        element={
          <ProtectedRoute>
            <Unauthorized />
          </ProtectedRoute>
        }
      />

      {/* ======================================== */}
      {/* INVALID URL */}
      {/* ======================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}

export default AppRoutes;
