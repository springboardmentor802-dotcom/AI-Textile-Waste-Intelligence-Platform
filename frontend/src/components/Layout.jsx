import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Layout = ({ children }) => {
  const { notifications, removeNotification } = useAuth();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-3 duration-300">
            {children}
          </div>
        </main>
      </div>

      {/* Floating Dynamic Notifications (Toasts) */}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-3 pointer-events-none max-w-sm w-full">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg flex items-start space-x-3 transition-all duration-300 transform translate-y-0 scale-100 ${
              n.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' :
              n.type === 'error' ? 'bg-rose-50 border border-rose-200 text-rose-800' :
              'bg-blue-50 border border-blue-200 text-blue-800'
            }`}
          >
            {n.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />}
            {n.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />}
            {n.type === 'info' && <Info className="h-5 w-5 text-blue-500 shrink-0" />}

            <div className="flex-1 text-sm font-medium leading-normal">{n.message}</div>
            
            <button
              onClick={() => removeNotification(n.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4 shrink-0" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Layout;
