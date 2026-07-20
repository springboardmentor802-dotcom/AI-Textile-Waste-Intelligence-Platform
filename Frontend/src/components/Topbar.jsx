import { Bell } from 'lucide-react';
import { getCurrentUser } from '../services/api';
import './Topbar.css';

function Topbar({ title }) {
  const user = getCurrentUser();

  return (
    <header className="topbar">
      <h1>{title}</h1>
      <div className="topbar-right">
        <Bell size={19} color="#5a6157" />
        <div className="topbar-user">
          <div className="topbar-avatar">{user?.full_name?.[0]?.toUpperCase() || 'U'}</div>
          <div>
            <div className="topbar-name">{user?.full_name}</div>
            <div className="topbar-role">{user?.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;