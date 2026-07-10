import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // App load hote hi check karo ki kya user pehle se logged-in hai
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.clear(); // Saare tokens aur roles clear karne ke liye
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  return (
    <div>
      {currentPage === 'dashboard' && isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : currentPage === 'login' ? (
        <Login 
          onSwitchToRegister={() => setCurrentPage('register')} 
          onLoginSuccess={handleLoginSuccess} 
        />
      ) : (
        <Register onSwitchToLogin={() => setCurrentPage('login')} />
      )}
    </div>
  );
}

export default App;