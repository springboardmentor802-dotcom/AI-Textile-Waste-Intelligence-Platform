import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory'; // Naya page import kiya

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
      {/* Top Navbar / Layout Wrapper jab user authenticated ho */}
      {isAuthenticated && (
        <nav className="bg-teal-700 text-white p-4 flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-6">
            <span className="font-bold text-lg tracking-wide">Textile Waste Intelligence</span>
            <button 
              onClick={() => setCurrentPage('dashboard')} 
              className={`hover:text-teal-200 transition font-medium ${currentPage === 'dashboard' ? 'underline underline-offset-4' : ''}`}
            >
              📊 Dashboard
            </button>
            <button 
              onClick={() => setCurrentPage('inventory')} 
              className={`hover:text-teal-200 transition font-medium ${currentPage === 'inventory' ? 'underline underline-offset-4' : ''}`}
            >
              📦 Waste Inventory
            </button>
          </div>
          <button 
            onClick={handleLogout} 
            className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded text-sm font-medium transition shadow-sm"
          >
            Logout
          </button>
        </nav>
      )}

      {/* Main Page Rendering Engine */}
      <main className="min-h-[calc(100vh-60px)] bg-gray-50">
        {!isAuthenticated ? (
          currentPage === 'login' ? (
            <Login 
              onSwitchToRegister={() => setCurrentPage('register')} 
              onLoginSuccess={handleLoginSuccess} 
            />
          ) : (
            <Register onSwitchToLogin={() => setCurrentPage('login')} />
          )
        ) : (
          <>
            {currentPage === 'dashboard' && <Dashboard onLogout={handleLogout} />}
            {currentPage === 'inventory' && <Inventory />}
          </>
        )}
      </main>
    </div>
  );
}

export default App;