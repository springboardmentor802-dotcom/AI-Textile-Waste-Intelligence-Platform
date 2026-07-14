import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display:"flex", justifyContent:"center",
        alignItems:"center", height:"100vh", backgroundColor:"#f0fdf4" }}>
        <div style={{ width:40, height:40, border:"4px solid #d1fae5",
          borderTop:"4px solid #059669", borderRadius:"50%" }} />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/unauthorized" replace />;
  return children;
};