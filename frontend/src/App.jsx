import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./utils/roleRoutes";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";
import InventoryPage from "./pages/InventoryPage";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import DashboardHome from "./pages/DashboardHome";
import AdminHome from "./pages/admin/AdminHome";
import UserManagement from "./pages/admin/UserManagement";
import Collections from "./pages/operator/Collections";
import Reports from "./pages/sustainability/Reports";
import UploadBatch from "./pages/UploadBatch";
import AnalysisResults from "./pages/AnalysisResults";
import BulkUpload from "./pages/BulkUpload";
import AnalysisDashboard from "./pages/AnalysisDashboard";
import InventoryAnalytics from "./pages/InventoryAnalytics";
import SustainabilityDashboard from "./pages/sustainability/SustainabilityDashboard";
import OperatorDashboard from "./pages/operator/OperatorDashboard";
import ManufacturerDashboard from "./pages/manufacturer/ManufacturerDashboard";
import Layout from "./components/Layout";

const ALL_ROLES = [
  "admin", "recycling_operator",
  "sustainability_manager", "textile_manufacturer",
];

// Layout wrappers
const AdminDash = () => <Layout title="Dashboard"><DashboardHome dashboardPath="/admin" /></Layout>;
const AdminHomeW = () => <Layout title="Home"><AdminHome /></Layout>;
const UserMgmtW = () => <Layout title="User Management"><UserManagement /></Layout>;
const CollectionsW = () => <Layout title="Collections"><Collections /></Layout>;
const ReportsW = () => <Layout title="Sustainability Reports"><Reports /></Layout>;
const ProfileW = () => <Layout title="My Profile"><Profile /></Layout>;
const ChangePassW = () => <Layout title="Change Password"><ChangePassword /></Layout>;

const PR = ({ roles, children }) => (
  <ProtectedRoute allowedRoles={roles}>{children}</ProtectedRoute>
);

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Shared — all roles */}
          <Route path="/analysis-results" element={<PR roles={ALL_ROLES}><AnalysisResults /></PR>} />
          <Route path="/bulk-upload" element={<PR roles={ALL_ROLES}><BulkUpload /></PR>} />

          {/* ADMIN */}
          <Route path="/admin/home" element={<PR roles={["admin"]}><AdminHomeW /></PR>} />
          <Route path="/admin/dashboard" element={<PR roles={["admin"]}><AdminDash /></PR>} />
          <Route path="/admin/users" element={<PR roles={["admin"]}><UserMgmtW /></PR>} />
          <Route path="/admin/inventory" element={<PR roles={["admin"]}><InventoryPage /></PR>} />
          <Route path="/admin/inventory-analytics" element={<PR roles={["admin"]}><InventoryAnalytics /></PR>} />
          <Route path="/admin/profile" element={<PR roles={["admin"]}><ProfileW /></PR>} />
          <Route path="/admin/change-password" element={<PR roles={["admin"]}><ChangePassW /></PR>} />
          <Route path="/admin/analysis" element={<PR roles={ALL_ROLES}><UploadBatch /></PR>} />
          <Route path="/admin/analysis-dashboard" element={<PR roles={ALL_ROLES}><AnalysisDashboard /></PR>} />

          {/* OPERATOR */}
          <Route path="/operator/home" element={<PR roles={["recycling_operator"]}><Layout title="Home"><DashboardHome dashboardPath="/operator" /></Layout></PR>} />
          <Route path="/operator/dashboard" element={<PR roles={["recycling_operator"]}><OperatorDashboard /></PR>} />
          <Route path="/operator/inventory" element={<PR roles={["recycling_operator"]}><InventoryPage /></PR>} />
          <Route path="/operator/inventory-analytics" element={<PR roles={["recycling_operator"]}><InventoryAnalytics /></PR>} />
          <Route path="/operator/collections" element={<PR roles={["recycling_operator"]}><CollectionsW /></PR>} />
          <Route path="/operator/profile" element={<PR roles={["recycling_operator"]}><ProfileW /></PR>} />
          <Route path="/operator/change-password" element={<PR roles={["recycling_operator"]}><ChangePassW /></PR>} />
          <Route path="/operator/analysis" element={<PR roles={ALL_ROLES}><UploadBatch /></PR>} />

          {/* SUSTAINABILITY */}
          <Route path="/sustainability/home" element={<PR roles={["sustainability_manager"]}><Layout title="Home"><DashboardHome dashboardPath="/sustainability" /></Layout></PR>} />
          <Route path="/sustainability/dashboard" element={<PR roles={["sustainability_manager"]}><SustainabilityDashboard /></PR>} />
          <Route path="/sustainability/inventory" element={<PR roles={["sustainability_manager"]}><InventoryPage /></PR>} />
          <Route path="/sustainability/inventory-analytics" element={<PR roles={["sustainability_manager"]}><InventoryAnalytics /></PR>} />
          <Route path="/sustainability/reports" element={<PR roles={["sustainability_manager"]}><ReportsW /></PR>} />
          <Route path="/sustainability/profile" element={<PR roles={["sustainability_manager"]}><ProfileW /></PR>} />
          <Route path="/sustainability/change-password" element={<PR roles={["sustainability_manager"]}><ChangePassW /></PR>} />
          <Route path="/sustainability/analysis" element={<PR roles={ALL_ROLES}><UploadBatch /></PR>} />

          {/* MANUFACTURER */}
          <Route path="/manufacturer/home" element={<PR roles={["textile_manufacturer"]}><Layout title="Home"><DashboardHome dashboardPath="/manufacturer" /></Layout></PR>} />
          <Route path="/manufacturer/dashboard" element={<PR roles={["textile_manufacturer"]}><ManufacturerDashboard /></PR>} />
          <Route path="/manufacturer/inventory" element={<PR roles={["textile_manufacturer"]}><InventoryPage /></PR>} />
          <Route path="/manufacturer/inventory-analytics" element={<PR roles={["textile_manufacturer"]}><InventoryAnalytics /></PR>} />
          <Route path="/manufacturer/profile" element={<PR roles={["textile_manufacturer"]}><ProfileW /></PR>} />
          <Route path="/manufacturer/change-password" element={<PR roles={["textile_manufacturer"]}><ChangePassW /></PR>} />
          <Route path="/manufacturer/analysis" element={<PR roles={ALL_ROLES}><UploadBatch /></PR>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}