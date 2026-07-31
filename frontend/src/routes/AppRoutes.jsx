import { BrowserRouter, Routes, Route } from "react-router-dom";

import Profile from "../pages/Profile";
import Reports from "../pages/Reports";
import Upload from "../pages/Upload";
import DefectAnalysis from "../pages/DefectAnalysis";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Inventory from "../pages/Inventory";

import ProtectedRoute from "./ProtectedRoute";
import WasteClassification from "../pages/WasteClassification";
import Sustainability from "../pages/Sustainability";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />

        {/* ADD THESE 3 ROUTES HERE */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          }
        />

        <Route
          path="/defect-analysis"
          element={
            <ProtectedRoute>
              <DefectAnalysis />
            </ProtectedRoute>
          }
        />

        <Route
          path="/waste-classification"
          element={
            <ProtectedRoute>
              <WasteClassification />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sustainability"
          element={
            <ProtectedRoute>
              <Sustainability />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;