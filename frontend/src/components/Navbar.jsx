import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, ChevronDown, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!user) return null;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Search Bar Placeholder or Page Title */}
      <div className="flex items-center">
        <span className="text-slate-500 font-medium text-sm hidden md:inline-block">
          Circular Economy Management System
        </span>
      </div>

      {/* Action Bar */}
      <div className="flex items-center space-x-6">
        {/* Notifications Icon (Mock) */}
        <button className="text-slate-400 hover:text-slate-600 transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-emerald-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
            2
          </span>
        </button>

        {/* User Menu Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 text-slate-700 hover:text-slate-900 focus:outline-none transition-colors"
          >
            <div className="h-9 w-9 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-bold border border-forest-200 shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</span>
              <span className="text-[11px] text-slate-400 font-medium leading-none">{user.role}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {dropdownOpen && (
            <>
              {/* Overlay click catcher */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setDropdownOpen(false)}
              ></div>

              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-slate-100 flex flex-col">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Logged in as</span>
                  <span className="text-xs font-bold text-slate-700 truncate">{user.email}</span>
                </div>
                
                <Link 
                  to="/profile" 
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center space-x-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  <span>My Profile</span>
                </Link>

                <button 
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50/50 transition-colors text-left"
                >
                  <LogOut className="h-4 w-4 text-rose-400" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
