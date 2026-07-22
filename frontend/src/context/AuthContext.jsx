import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, logoutUser } from "../services/authService";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// These must exactly match the role values returned by the backend
const ROLE_DASHBOARD_MAP = {
  "Administrator": "/admin/home",
  "Recycling Facility Operator": "/operator/home",
  "Sustainability Manager": "/sustainability/home",
  "Textile Manufacturer": "/manufacturer/home",
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
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
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
    if (!access_token || !userData) {
      throw new Error("Invalid response from server.");
    }
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    const dashboardPath = ROLE_DASHBOARD_MAP[userData.role];
    if (!dashboardPath) {
      console.error("Unknown role:", userData.role);
      throw new Error(`Unknown role: ${userData.role}`);
    }
    navigate(dashboardPath, { replace: true });
  };

  const logout = () => {
    try { logoutUser(); } catch { /* ignore */ }
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/login", { replace: true });
  };

  const getDashboardPath = () => {
    if (!user) return "/login";
    return ROLE_DASHBOARD_MAP[user.role] || "/login";
  };

  if (loading) {
    return (
      <div style={{
        display: "flex", justifyContent: "center",
        alignItems: "center", height: "100vh",
        backgroundColor: "#f1f5f9",
        fontFamily: "'Inter','Segoe UI',sans-serif",
        fontSize: 14, color: "#6b7280",
      }}>
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, getDashboardPath }}>
      {children}
    </AuthContext.Provider>
  );
};