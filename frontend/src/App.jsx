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
import Layout from "./components/Layout";

// All roles that can access image analysis
const ANALYSIS_ROLES = ["admin", "recycling_operator", "sustainability_manager", "textile_manufacturer"];

const AdminDash = () => <Layout title="Dashboard"><DashboardHome dashboardPath="/admin" /></Layout>;
const OperatorDash = () => <Layout title="Dashboard"><DashboardHome dashboardPath="/operator" /></Layout>;
const SustainabilityDash = () => <Layout title="Dashboard"><DashboardHome dashboardPath="/sustainability" /></Layout>;
const ManufacturerDash = () => <Layout title="Dashboard"><DashboardHome dashboardPath="/manufacturer" /></Layout>;
const AdminHomeWrapped = () => <Layout title="Home"><AdminHome /></Layout>;
const UserMgmtWrapped = () => <Layout title="User Management"><UserManagement /></Layout>;
const CollectionsWrapped = () => <Layout title="Collections"><Collections /></Layout>;
const ReportsWrapped = () => <Layout title="Sustainability Reports"><Reports /></Layout>;
const ProfileWrapped = () => <Layout title="My Profile"><Profile /></Layout>;
const ChangePasswordWrapped = () => <Layout title="Change Password"><ChangePassword /></Layout>;
const UploadBatchWrapped = () => <UploadBatch />;
const AnalysisResultsWrapped = () => <AnalysisResults />;
const BulkUploadWrapped = () => <BulkUpload />;
const AnalysisDashboardWrapped = () => <AnalysisDashboard />;

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

          {/* ADMIN — role: "admin" */}
          <Route path="/admin/home" element={<PR roles={["admin"]}><AdminHomeWrapped /></PR>} />
          <Route path="/admin/dashboard" element={<PR roles={["admin"]}><AdminDash /></PR>} />
          <Route path="/admin/users" element={<PR roles={["admin"]}><UserMgmtWrapped /></PR>} />
          <Route path="/admin/inventory" element={<PR roles={["admin"]}><InventoryPage /></PR>} />
          <Route path="/admin/profile" element={<PR roles={["admin"]}><ProfileWrapped /></PR>} />
          <Route path="/admin/change-password" element={<PR roles={["admin"]}><ChangePasswordWrapped /></PR>} />
          <Route path="/admin/analysis" element={<PR roles={ANALYSIS_ROLES}><UploadBatchWrapped /></PR>} />
          <Route path="/admin/analysis-results" element={<PR roles={ANALYSIS_ROLES}><AnalysisResultsWrapped /></PR>} />
          <Route path="/admin/bulk-upload" element={<PR roles={ANALYSIS_ROLES}><BulkUploadWrapped /></PR>} />
          <Route path="/admin/analysis-dashboard" element={<PR roles={ANALYSIS_ROLES}><AnalysisDashboardWrapped /></PR>} />

          {/* OPERATOR — role: "recycling_operator" */}
          <Route path="/operator/home" element={<PR roles={["recycling_operator"]}><Layout title="Home"><DashboardHome dashboardPath="/operator" /></Layout></PR>} />
          <Route path="/operator/dashboard" element={<PR roles={["recycling_operator"]}><OperatorDash /></PR>} />
          <Route path="/operator/inventory" element={<PR roles={["recycling_operator"]}><InventoryPage /></PR>} />
          <Route path="/operator/collections" element={<PR roles={["recycling_operator"]}><CollectionsWrapped /></PR>} />
          <Route path="/operator/profile" element={<PR roles={["recycling_operator"]}><ProfileWrapped /></PR>} />
          <Route path="/operator/change-password" element={<PR roles={["recycling_operator"]}><ChangePasswordWrapped /></PR>} />
          <Route path="/operator/analysis" element={<PR roles={ANALYSIS_ROLES}><UploadBatchWrapped /></PR>} />

          {/* SUSTAINABILITY — role: "sustainability_manager" */}
          <Route path="/sustainability/home" element={<PR roles={["sustainability_manager"]}><Layout title="Home"><DashboardHome dashboardPath="/sustainability" /></Layout></PR>} />
          <Route path="/sustainability/dashboard" element={<PR roles={["sustainability_manager"]}><SustainabilityDash /></PR>} />
          <Route path="/sustainability/inventory" element={<PR roles={["sustainability_manager"]}><InventoryPage /></PR>} />
          <Route path="/sustainability/reports" element={<PR roles={["sustainability_manager"]}><ReportsWrapped /></PR>} />
          <Route path="/sustainability/profile" element={<PR roles={["sustainability_manager"]}><ProfileWrapped /></PR>} />
          <Route path="/sustainability/change-password" element={<PR roles={["sustainability_manager"]}><ChangePasswordWrapped /></PR>} />
          <Route path="/sustainability/analysis" element={<PR roles={ANALYSIS_ROLES}><UploadBatchWrapped /></PR>} />

          {/* MANUFACTURER — role: "textile_manufacturer" */}
          <Route path="/manufacturer/home" element={<PR roles={["textile_manufacturer"]}><Layout title="Home"><DashboardHome dashboardPath="/manufacturer" /></Layout></PR>} />
          <Route path="/manufacturer/dashboard" element={<PR roles={["textile_manufacturer"]}><ManufacturerDash /></PR>} />
          <Route path="/manufacturer/inventory" element={<PR roles={["textile_manufacturer"]}><InventoryPage /></PR>} />
          <Route path="/manufacturer/profile" element={<PR roles={["textile_manufacturer"]}><ProfileWrapped /></PR>} />
          <Route path="/manufacturer/change-password" element={<PR roles={["textile_manufacturer"]}><ChangePasswordWrapped /></PR>} />
          <Route path="/manufacturer/analysis" element={<PR roles={ANALYSIS_ROLES}><UploadBatchWrapped /></PR>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}