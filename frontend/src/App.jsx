import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // App load hone par checking localStorage for tokens
  useEffect(() => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
    }
  }, []);

  // Safe Login Success Handler
  const handleLoginSuccess = (data) => {
    if (data?.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('token', data.access_token); // Fallback for api.js
      if (data.role) {
        localStorage.setItem('role', data.role);
      }
    }
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.clear(); // Clear all tokens & roles
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {!isAuthenticated ? (
        currentPage === 'login' ? (
          <Login 
            onSwitchToRegister={() => setCurrentPage('register')} 
            onLoginSuccess={handleLoginSuccess} 
          />
        ) : (
          <Register 
            onSwitchToLogin={() => setCurrentPage('login')} 
          />
        )
      ) : (
        <Dashboard onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;