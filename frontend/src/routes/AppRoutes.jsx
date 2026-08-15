import { BrowserRouter, Routes, Route } from "react-router-dom";

import Profile from "../pages/Profile";
import Reports from "../pages/Reports";
import Upload from "../pages/Upload";
import DefectAnalysis from "../pages/DefectAnalysis";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Inventory from "../pages/Inventory";
import Analytics from "../pages/Analytics";

import ProtectedRoute from "./ProtectedRoute";
import WasteClassification from "../pages/WasteClassification";
import TextileIntelligence from "../pages/TextileIntelligence";
import ForgotPassword from "../pages/ForgotPassword";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Authentication */}

        <Route path="/" element={<Login />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />


        {/* Dashboard */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* Inventory */}

        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />


        {/* Analytics */}

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />


        {/* Profile */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />


        {/* Reports */}

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />


        {/* Upload */}

        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />


        {/* Defect Analysis */}

        <Route
          path="/defect-analysis"
          element={
            <ProtectedRoute>
              <DefectAnalysis />
            </ProtectedRoute>
          }
        />


        {/* Waste Classification */}

        <Route
          path="/waste-classification"
          element={
            <ProtectedRoute>
              <WasteClassification />
            </ProtectedRoute>
          }
        />


        {/* AI Textile Intelligence */}

        <Route
          path="/textile-intelligence"
          element={
            <ProtectedRoute>
              <TextileIntelligence />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;