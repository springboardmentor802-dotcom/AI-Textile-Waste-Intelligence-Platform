import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./utils/roleRoutes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";
import AdminDashboard from "./pages/AdminDashboard";
import OperatorDashboard from "./pages/OperatorDashboard";
import SustainabilityDashboard from "./pages/SustainabilityDashboard";
import ManufacturerDashboard from "./pages/ManufacturerDashboard";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Administrator"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operator/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Recycling Facility Operator"]}>
                <OperatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sustainability/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Sustainability Manager"]}>
                <SustainabilityDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manufacturer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Textile Manufacturer"]}>
                <ManufacturerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;