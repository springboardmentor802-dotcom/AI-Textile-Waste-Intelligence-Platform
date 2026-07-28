import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, logoutUser } from "../services/authService";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// Keys must match PostgreSQL enum values exactly
const ROLE_DASHBOARD_MAP = {
  "admin": "/admin/home",
  "recycling_operator": "/operator/home",
  "sustainability_manager": "/sustainability/home",
  "textile_manufacturer": "/manufacturer/home",
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
    if (!access_token || !userData) throw new Error("Invalid response from server.");
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    const path = ROLE_DASHBOARD_MAP[userData.role];
    if (!path) throw new Error(`Unknown role: ${userData.role}`);
    navigate(path, { replace: true });
  };

  const logout = () => {
    try { logoutUser(); } catch { }
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/login", { replace: true });
  };

  const getDashboardPath = () =>
    user ? ROLE_DASHBOARD_MAP[user.role] || "/login" : "/login";

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

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, getDashboardPath }}>
      {children}
    </AuthContext.Provider>
  );
};