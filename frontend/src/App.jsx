import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./utils/roleRoutes";

import MaterialRecognitionPage from "./pages/MaterialRecognitionPage";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";

// Shared pages
import InventoryPage from "./pages/InventoryPage";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import DashboardHome from "./pages/DashboardHome";

// Admin pages
import AdminHome from "./pages/admin/AdminHome";
import UserManagement from "./pages/admin/UserManagement";

// Operator pages
import Collections from "./pages/operator/Collections";

// Sustainability pages
import Reports from "./pages/sustainability/Reports";

// Dashboard wrappers
import Layout from "./components/Layout";

// Lazy dashboard wrappers
const AdminDash = () => (
  <Layout title="Dashboard"><DashboardHome dashboardPath="/admin" /></Layout>
);
const OperatorDash = () => (
  <Layout title="Dashboard"><DashboardHome dashboardPath="/operator" /></Layout>
);
const SustainabilityDash = () => (
  <Layout title="Dashboard"><DashboardHome dashboardPath="/sustainability" /></Layout>
);
const ManufacturerDash = () => (
  <Layout title="Dashboard"><DashboardHome dashboardPath="/manufacturer" /></Layout>
);

const AdminHomeWrapped = () => (
  <Layout title="Home"><AdminHome /></Layout>
);
const UserMgmtWrapped = () => (
  <Layout title="User Management"><UserManagement /></Layout>
);
const CollectionsWrapped = () => (
  <Layout title="Collections"><Collections /></Layout>
);
const ReportsWrapped = () => (
  <Layout title="Sustainability Reports"><Reports /></Layout>
);
const ProfileWrapped = () => (
  <Layout title="My Profile"><Profile /></Layout>
);
const ChangePasswordWrapped = () => (
  <Layout title="Change Password"><ChangePassword /></Layout>
);

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

          {/* ADMIN */}
          <Route path="/admin/home" element={<PR roles={["Administrator"]}><AdminHomeWrapped /></PR>} />
          <Route path="/admin/dashboard" element={<PR roles={["Administrator"]}><AdminDash /></PR>} />
          <Route path="/admin/users" element={<PR roles={["Administrator"]}><UserMgmtWrapped /></PR>} />
          <Route path="/admin/inventory" element={<PR roles={["Administrator"]}><InventoryPage /></PR>} />
          <Route path="/admin/profile" element={<PR roles={["Administrator"]}><ProfileWrapped /></PR>} />
          <Route path="/admin/change-password" element={<PR roles={["Administrator"]}><ChangePasswordWrapped /></PR>} />
          <Route
  path="/admin/material-recognition"
  element={
    <PR roles={["Administrator"]}>
      <MaterialRecognitionPage />
    </PR>
  }
/>


          {/* OPERATOR */}
          <Route path="/operator/home" element={<PR roles={["Recycling Facility Operator"]}><Layout title="Home"><DashboardHome dashboardPath="/operator" /></Layout></PR>} />
          <Route path="/operator/dashboard" element={<PR roles={["Recycling Facility Operator"]}><OperatorDash /></PR>} />
          <Route path="/operator/inventory" element={<PR roles={["Recycling Facility Operator"]}><InventoryPage /></PR>} />
          <Route path="/operator/collections" element={<PR roles={["Recycling Facility Operator"]}><CollectionsWrapped /></PR>} />
          <Route path="/operator/profile" element={<PR roles={["Recycling Facility Operator"]}><ProfileWrapped /></PR>} />
          <Route path="/operator/change-password" element={<PR roles={["Recycling Facility Operator"]}><ChangePasswordWrapped /></PR>} />
          <Route
  path="/operator/material-recognition"
  element={
    <PR roles={["Recycling Facility Operator"]}>
      <MaterialRecognitionPage />
    </PR>
  }
/>

          {/* SUSTAINABILITY */}
          <Route path="/sustainability/home" element={<PR roles={["Sustainability Manager"]}><Layout title="Home"><DashboardHome dashboardPath="/sustainability" /></Layout></PR>} />
          <Route path="/sustainability/dashboard" element={<PR roles={["Sustainability Manager"]}><SustainabilityDash /></PR>} />
          <Route path="/sustainability/inventory" element={<PR roles={["Sustainability Manager"]}><InventoryPage /></PR>} />
          <Route path="/sustainability/reports" element={<PR roles={["Sustainability Manager"]}><ReportsWrapped /></PR>} />
          <Route path="/sustainability/profile" element={<PR roles={["Sustainability Manager"]}><ProfileWrapped /></PR>} />
          <Route path="/sustainability/change-password" element={<PR roles={["Sustainability Manager"]}><ChangePasswordWrapped /></PR>} />
          <Route
  path="/sustainability/material-recognition"
  element={
    <PR roles={["Sustainability Manager"]}>
      <MaterialRecognitionPage />
    </PR>
  }
/>

          {/* MANUFACTURER */}
          <Route path="/manufacturer/home" element={<PR roles={["Textile Manufacturer"]}><Layout title="Home"><DashboardHome dashboardPath="/manufacturer" /></Layout></PR>} />
          <Route path="/manufacturer/dashboard" element={<PR roles={["Textile Manufacturer"]}><ManufacturerDash /></PR>} />
          <Route path="/manufacturer/inventory" element={<PR roles={["Textile Manufacturer"]}><InventoryPage /></PR>} />
          <Route path="/manufacturer/profile" element={<PR roles={["Textile Manufacturer"]}><ProfileWrapped /></PR>} />
          <Route path="/manufacturer/change-password" element={<PR roles={["Textile Manufacturer"]}><ChangePasswordWrapped /></PR>} />
          <Route
  path="/manufacturer/material-recognition"
  element={
    <PR roles={["Textile Manufacturer"]}>
      <MaterialRecognitionPage />
    </PR>
  }
/>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}