import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Authentication/AuthContext";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinkClass = (path) =>
    `text-sm font-medium transition px-3 py-2 rounded-lg ${
      location.pathname === path
        ? "text-blue-600 bg-blue-50 font-semibold"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-18">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              TI
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight">
                Textile<span className="text-blue-600">Intel</span>
              </span>
              <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Waste Intelligence
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/" className={navLinkClass("/")}>
              Home
            </Link>
            <Link to="/analysis" className={navLinkClass("/analysis")}>
              Image Analysis
            </Link>
            <Link to="/inventory" className={navLinkClass("/inventory")}>
              Inventory Portal
            </Link>
            <Link to="/dashboard" className={navLinkClass("/dashboard")}>
              Analytics Dashboard
            </Link>
            <Link to="/history" className={navLinkClass("/history")}>
              History
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-800">
                      {user?.name}
                    </p>
                    <p className="text-[10px] text-blue-600 font-medium">
                      {user?.role}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
