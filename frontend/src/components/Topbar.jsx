import { Moon, Sun, Bell, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ title, subtitle }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const queriesLeft = user?.tenant?.queries_left ?? 100;

  return (
    <header className="topbar">
      <div style={{ flex: 1 }}>
        <div className="topbar-title">{title}</div>
        {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
      </div>

      <div className="topbar-actions">
        {/* Queries Counter */}
        <div className="queries-pill">
          <span className="dot" />
          {queriesLeft} Queries Left
        </div>

        {/* Theme Toggle */}
        <button className="btn btn-ghost btn-icon" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className="btn btn-ghost btn-icon" style={{ position: 'relative' }} title="Notifications">
          <Bell size={18} />
          <span className="notif-dot" style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6 }} />
        </button>

        {/* User Avatar */}
        <div className="avatar avatar-lg" style={{ cursor: 'pointer' }}>
          {user?.first_name?.[0]}{user?.last_name?.[0]}
        </div>
      </div>
    </header>
  );
}
