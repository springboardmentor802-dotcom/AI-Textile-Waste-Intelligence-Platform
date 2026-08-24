import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, BrainCircuit, FileBarChart, History,
  Users as UsersIcon, User, Settings as SettingsIcon, LogOut, Recycle
} from 'lucide-react';
import { logoutUser, getCurrentUser } from '../services/api';
import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const isAdministrator = user?.role === 'administrator';

  function handleLogout() {
    logoutUser();
    navigate('/login');
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Recycle size={20} color="#2e7d32" />
        <div>
          <div className="sidebar-title">Textile Waste</div>
          <div className="sidebar-subtitle">Intelligence Platform</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="sidebar-link">
          <LayoutDashboard size={19} strokeWidth={1.8} /> Dashboard
        </NavLink>
        <NavLink to="/inventory" className="sidebar-link">
          <Package size={19} strokeWidth={1.8} /> Inventory
        </NavLink>
        <NavLink to="/predictions" className="sidebar-link">
          <BrainCircuit size={19} strokeWidth={1.8} /> AI Prediction
        </NavLink>
        <NavLink to="/history" className="sidebar-link">
          <History size={19} strokeWidth={1.8} /> History
        </NavLink>
        <NavLink to="/reports" className="sidebar-link">
          <FileBarChart size={19} strokeWidth={1.8} /> Reports
        </NavLink>
        {isAdministrator && (
          <NavLink to="/users" className="sidebar-link">
            <UsersIcon size={19} strokeWidth={1.8} /> Users
          </NavLink>
        )}
        <NavLink to="/profile" className="sidebar-link">
          <User size={19} strokeWidth={1.8} /> Profile
        </NavLink>
        <NavLink to="/setting" className="sidebar-link">
          <SettingsIcon size={19} strokeWidth={1.8} /> Settings
        </NavLink>
      </nav>

      <button className="sidebar-logout" onClick={handleLogout}>
        <LogOut size={19} strokeWidth={1.8} /> Logout
      </button>
    </aside>
  );
}

export default Sidebar;