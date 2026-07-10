import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, logoutUser } from "../services/authService";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const ROLE_DASHBOARD_MAP = {
  Administrator: "/admin/dashboard",
  "Recycling Facility Operator": "/operator/dashboard",
  "Sustainability Manager": "/sustainability/dashboard",
  "Textile Manufacturer": "/manufacturer/dashboard",
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    const { access_token, user: userData } = data;
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    const dashboardPath = ROLE_DASHBOARD_MAP[userData.role] || "/login";
    navigate(dashboardPath);
  };

  const logout = () => {
    try {
      logoutUser();
    } catch {
      // ignore
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  const getDashboardPath = () => {
    if (!user) return "/login";
    return ROLE_DASHBOARD_MAP[user.role] || "/login";
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f0fdf4",
          fontSize: "16px",
          color: "#059669",
          fontFamily: "Segoe UI, sans-serif",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, getDashboardPath }}
    >
      {children}
    </AuthContext.Provider>
  );
};