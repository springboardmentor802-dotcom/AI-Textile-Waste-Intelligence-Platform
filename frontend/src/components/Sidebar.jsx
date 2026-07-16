import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  Database, 
  Users, 
  User, 
  Recycle,
  Layers,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Administrator', 'Recycling Facility Operator', 'Sustainability Manager', 'Textile Manufacturer']
    },
    {
      title: 'Waste Inventory',
      path: '/inventory',
      icon: Package,
      roles: ['Administrator', 'Recycling Facility Operator', 'Sustainability Manager', 'Textile Manufacturer']
    },
    {
      title: 'Register Batch',
      path: '/inventory/new',
      icon: PlusCircle,
      roles: ['Administrator', 'Textile Manufacturer']
    },
    {
      title: 'Datasets Integration',
      path: '/datasets',
      icon: Database,
      roles: ['Administrator', 'Recycling Facility Operator', 'Sustainability Manager', 'Textile Manufacturer']
    },
    {
      title: 'User Roles',
      path: '/users',
      icon: Users,
      roles: ['Administrator']
    },
    {
      title: 'My Profile',
      path: '/profile',
      icon: User,
      roles: ['Administrator', 'Recycling Facility Operator', 'Sustainability Manager', 'Textile Manufacturer']
    }
  ];

  return (
    <aside className="w-64 bg-forest-900 text-slate-100 flex flex-col h-full border-r border-forest-800">
      {/* Platform Title Banner */}
      <div className="p-6 border-b border-forest-800 flex items-center space-x-3">
        <div className="bg-earth-500 p-2 rounded-lg text-forest-950">
          <Recycle className="h-6 w-6 animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-wide font-sans">TEXWASTE</h1>
          <span className="text-xs text-forest-400 font-medium font-sans">INTELLIGENCE HUB</span>
        </div>
      </div>

      {/* Role Badge Indicator */}
      <div className="px-6 py-4 border-b border-forest-800/50 bg-forest-950/30">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-forest-400 font-bold">Current Role</span>
          <span className="text-sm font-semibold text-earth-200 truncate">{user.role}</span>
          <span className="text-[11px] text-forest-300 truncate">{user.organization || 'No Organization'}</span>
        </div>
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems
          .filter((item) => item.roles.includes(user.role))
          .map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all-300 ${
                  active
                    ? 'bg-earth-500 text-forest-950 font-semibold shadow-md shadow-earth-500/10'
                    : 'text-slate-300 hover:bg-forest-800/60 hover:text-slate-100'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-forest-950' : 'text-forest-300'}`} />
                <span className="text-sm font-sans">{item.title}</span>
              </Link>
            );
          })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-forest-800 flex items-center space-x-2 text-xs text-forest-400">
        <Layers className="h-4 w-4" />
        <span>Version 1.0.0 (Milestone 1)</span>
      </div>
    </aside>
  );
};

export default Sidebar;
