import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "@/pages/auth/Login/Login";
import Register from "@/pages/auth/Register/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword/ForgotPassword";

import AdminDashboard from "@/pages/Dashboard/Admin/AdminDashboard";
import ManufacturerDashboard from "@/pages/Dashboard/Manufacturer/ManufacturerDashboard";
import RecyclerDashboard from "@/pages/Dashboard/Recycler/RecyclerDashboard";
import ManagerDashboard from "@/pages/Dashboard/Manager/ManagerDashboard";

import Users from "@/pages/Users/Users";
import Inventory from "@/pages/Inventory/Inventory";
import Analytics from "@/pages/Analytics/Analytics";
import Reports from "@/pages/Reports/Reports";
import Settings from "@/pages/Settings/Settings";

import ProtectedRoute from "@/routes/ProtectedRoute";
function App() {
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

        {/* Dashboards */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute
              allowedRoles={["administrator"]}
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manufacturer"
          element={
            <ProtectedRoute
              allowedRoles={["manufacturer"]}
            >
              <ManufacturerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recycler"
          element={
            <ProtectedRoute
              allowedRoles={["recycler"]}
            >
              <RecyclerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager"
          element={
            <ProtectedRoute
              allowedRoles={["manager"]}
            >
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
  path="/users"
  element={
    <ProtectedRoute allowedRoles={["administrator"]}>
      <Users />
    </ProtectedRoute>
  }
/>

<Route
  path="/inventory"
  element={
    <ProtectedRoute allowedRoles={["administrator" ,"manufacturer"]}>
      <Inventory />
    </ProtectedRoute>
  }
/>

<Route
  path="/analytics"
  element={
    <ProtectedRoute
      allowedRoles={["administrator", "manager"]}
    >
      <Analytics />
    </ProtectedRoute>
  }
/>

<Route
  path="/reports"
  element={
    <ProtectedRoute
      allowedRoles={[
        "administrator",
        "manufacturer",
        "recycler",
        "manager",
      ]}
    >
      <Reports />
    </ProtectedRoute>
  }
/>

<Route
  path="/settings"
  element={
    <ProtectedRoute
      allowedRoles={["administrator", "manager"]}
    >
      <Settings />
    </ProtectedRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;