import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Authentication/AuthContext";
import ProtectedRoute from "./Authentication/ProtectedRoute";

import LandingPage from "./Home/LandingPage";
import Login from "./Authentication/Login";
import Register from "./Authentication/Register";
import Profile from "./Authentication/Profile";
import InventoryDashboard from "./Inventory/InventoryDashboard";
import ImageAnalysisPage from "./Analysis/ImageAnalysisPage";
import HistoryPage from "./Analysis/HistoryPage";
import Dashboard from "./Dashboard/Dashboard";
import RecyclingFacilityDashboard from "./Dashboard/RecyclingFacilityDashboard";
import SustainabilityManagerDashboard from "./Dashboard/SustainabilityManagerDashboard";
import ManufacturerDashboard from "./Dashboard/ManufacturerDashboard";
import AdminDashboard from "./Dashboard/AdminDashboard";
import AnalysisReport from "./Analysis/AnalysisReport";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <InventoryDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis"
            element={
              <ProtectedRoute>
                <ImageAnalysisPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/recycling"
            element={
              <ProtectedRoute>
                <RecyclingFacilityDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/sustainability"
            element={
              <ProtectedRoute>
                <SustainabilityManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/manufacturer"
            element={
              <ProtectedRoute>
                <ManufacturerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report/:id"
            element={
              <ProtectedRoute>
                <AnalysisReport />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}