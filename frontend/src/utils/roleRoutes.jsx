import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children, allowedRoles }) => {
  let auth;
  try { auth = useAuth(); } catch { return <Navigate to="/login" replace />; }

  const { user, loading } = auth;

  if (loading) {
    return (
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        height: "100vh", backgroundColor: "#f1f5f9",
        fontFamily: "'Inter','Segoe UI',sans-serif", fontSize: 14, color: "#6b7280",
      }}>
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role))
    return <Navigate to="/unauthorized" replace />;

  return children;
};