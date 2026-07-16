import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Add toast notification
  const addNotification = (message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Fetch current user details
  const fetchMe = async (currentToken) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        // Token invalid/expired
        logout();
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMe(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    try {
      // Use OAuth2 standard Form Data request
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      addNotification(`Welcome back, ${data.user.name}!`, 'success');
      return data.user;
    } catch (err) {
      addNotification(err.message || 'Login failed', 'error');
      throw err;
    }
  };

  // Registration handler
  const register = async (name, email, organization, password, role) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, organization, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      addNotification('Registration successful! Please login.', 'success');
      return data;
    } catch (err) {
      addNotification(err.message || 'Registration failed', 'error');
      throw err;
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (e) {
      console.warn("Server logout request failed", e);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      addNotification('Logged out successfully', 'success');
    }
  };

  // Update profile
  const updateProfile = async (name, organization, password = null) => {
    try {
      const body = { name, organization };
      if (password) body.password = password;

      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Failed to update profile');
      }

      setUser(data);
      addNotification('Profile updated successfully!', 'success');
      return data;
    } catch (err) {
      addNotification(err.message || 'Failed to update profile', 'error');
      throw err;
    }
  };

  // Helper function for API requests
  const apiRequest = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      logout();
      throw new Error('Session expired. Please log in again.');
    }

    return response;
  };

  const value = {
    user,
    token,
    loading,
    notifications,
    addNotification,
    removeNotification,
    login,
    register,
    logout,
    updateProfile,
    apiRequest,
    API_URL,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
