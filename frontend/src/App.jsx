import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Dashboard from "./pages/dashboard/Dashboard";

import UserProfile from "./pages/users/UserProfile";
import EditProfile from "./pages/users/EditProfile";
import ChangePassword from "./pages/users/ChangePassword";
import UserList from "./pages/users/UserList";
import UserDetails from "./pages/users/UserDetails";
import CreateManufacturerProfile from "./pages/manufacturers/CreateManufacturerProfile";
import ManufacturerProfile from "./pages/manufacturers/ManufacturerProfile";
import EditManufacturerProfile from "./pages/manufacturers/EditManufacturerProfile";
import ManufacturerList from "./pages/manufacturers/ManufacturerList";
import ManufacturerDetails from "./pages/manufacturers/ManufacturerDetails";

import AddInventory from "./pages/inventory/AddInventory";
import MyInventory from "./pages/inventory/MyInventory";
import EditInventory from "./pages/inventory/EditInventory";
import InventoryDetails from "./pages/inventory/InventoryDetails";
import InventoryList from "./pages/inventory/InventoryList";

import DatasetList from "./pages/dataset/DatasetList";
import DatasetDetails from "./pages/dataset/DatasetDetails";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* Default Route */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* Public Routes */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
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

      {/* User Profile */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />

      {/* Edit Profile */}
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />

      {/* Change Password */}
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      {/* Admin - User List */}
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UserList />
          </ProtectedRoute>
        }
      />

      {/* Admin - User Details */}
      <Route
        path="/users/:id"
        element={
          <ProtectedRoute>
            <UserDetails />
          </ProtectedRoute>
        }
      />
      {/* Manufacturer Routes */}

<Route
    path="/manufacturer/create"
    element={
        <ProtectedRoute>
            <CreateManufacturerProfile />
        </ProtectedRoute>
    }
/>

<Route
    path="/manufacturer/profile"
    element={
        <ProtectedRoute>
            <ManufacturerProfile />
        </ProtectedRoute>
    }
/>

<Route
    path="/manufacturer/edit"
    element={
        <ProtectedRoute>
            <EditManufacturerProfile />
        </ProtectedRoute>
    }
/>

<Route
    path="/manufacturers"
    element={
        <ProtectedRoute>
            <ManufacturerList />
        </ProtectedRoute>
    }
/>

<Route
    path="/manufacturers/:id"
    element={
        <ProtectedRoute>
            <ManufacturerDetails />
        </ProtectedRoute>
    }
/>
<Route
    path="/inventory/add"
    element={
        <ProtectedRoute>
            <AddInventory />
        </ProtectedRoute>
    }
/>

<Route
    path="/inventory/my"
    element={
        <ProtectedRoute>
            <MyInventory />
        </ProtectedRoute>
    }
/>

<Route
    path="/inventory/edit/:id"
    element={
        <ProtectedRoute>
            <EditInventory />
        </ProtectedRoute>
    }
/>

<Route
    path="/inventory/:id"
    element={
        <ProtectedRoute>
            <InventoryDetails />
        </ProtectedRoute>
    }
/>

<Route
    path="/inventory"
    element={
        <ProtectedRoute>
            <InventoryList />
        </ProtectedRoute>
    }
/>
<Route
    path="/dataset"
    element={
        <ProtectedRoute>
            <DatasetList />
        </ProtectedRoute>
    }
/>

<Route
    path="/dataset/:id"
    element={
        <ProtectedRoute>
            <DatasetDetails />
        </ProtectedRoute>
    }
/>

      {/* 404 */}
      <Route
        path="*"
        element={
          <h2
            style={{
              textAlign: "center",
              marginTop: "100px"
            }}
          >
            404 - Page Not Found
          </h2>
        }
      />

    </Routes>
  );
}

export default App;