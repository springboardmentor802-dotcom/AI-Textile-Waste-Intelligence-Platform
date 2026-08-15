import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutGrid, Boxes, UploadCloud, ScanEye, History, BarChart3, Sprout, Settings as SettingsIcon, User, LogOut, Leaf } from 'lucide-react'
import NotificationBell from './NotificationBell.jsx'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/upload', label: 'Upload Waste', icon: UploadCloud },
  { to: '/history', label: 'History', icon: History },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/sustainability', label: 'AI Analytics', icon: Sprout },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const fullName = localStorage.getItem('full_name')
  const role = localStorage.getItem('role')

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="w-64 shrink-0 h-screen sticky top-0 flex flex-col glass-card m-3 p-4 rounded-2xl">
      <div className="flex items-center gap-2 mb-8 px-1">
        <div className="w-9 h-9 rounded-xl bg-mint-600/20 flex items-center justify-center border border-mint-500/30">
          <Leaf size={18} className="text-mint-400" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold leading-tight">🧵 Textile Waste</div>
          <div className="text-[10px] text-white/50 leading-tight">Intelligence Platform</div>
        </div>
        <NotificationBell />
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                isActive ? 'bg-mint-600/20 text-mint-400 border border-mint-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white/90'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 pt-3 mt-3">
        <div className="px-3 mb-2">
          <div className="text-sm font-medium">👤 {fullName || 'User'}</div>
          <div className="text-[10px] text-mint-400/80 uppercase tracking-wide">{role?.replace('_', ' ')}</div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:bg-red-500/10 hover:text-red-400 transition"
        >
          <LogOut size={17} /> Logout
        </button>
      </div>
    </div>
  )
}
