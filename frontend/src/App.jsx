import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InventoryList from './pages/InventoryList';
import InventoryDetail from './pages/InventoryDetail';
import InventoryForm from './pages/InventoryForm';
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';
import DatasetIntegration from './pages/DatasetIntegration';
import ClassificationReports from './pages/ClassificationReports';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Dashboard Routes (Wrapped in Layout & ProtectedRoute) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/inventory" 
            element={
              <ProtectedRoute>
                <Layout>
                  <InventoryList />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/inventory/new" 
            element={
              <ProtectedRoute allowedRoles={['Administrator', 'Textile Manufacturer']}>
                <Layout>
                  <InventoryForm />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/inventory/:batch_id" 
            element={
              <ProtectedRoute>
                <Layout>
                  <InventoryDetail />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/inventory/:batch_id/edit" 
            element={
              <ProtectedRoute allowedRoles={['Administrator', 'Textile Manufacturer', 'Recycling Facility Operator']}>
                <Layout>
                  <InventoryForm />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/datasets" 
            element={
              <ProtectedRoute>
                <Layout>
                  <DatasetIntegration />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <Layout>
                  <ClassificationReports />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/users" 
            element={
              <ProtectedRoute allowedRoles={['Administrator']}>
                <Layout>
                  <UserManagement />
                </Layout>
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
