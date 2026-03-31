import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Bell, User, LogOut, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Topbar({ title, subtitle }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const notifRef = useRef();
  const profileRef = useRef();

  useEffect(() => {
    if (showNotifs) fetchNotifs();
  }, [showNotifs]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifs = async () => {
    try {
      const { data } = await api.get('/leads/recent-activity/');
      setNotifs(data.results || data);
    } catch { setNotifs([]); }
  };

  const queriesLeft = user?.tenant?.queries_left ?? 100;

  return (
    <header className="topbar">
      <div style={{ flex: 1 }}>
        <div className="topbar-title">{title}</div>
        {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
      </div>

      <div className="topbar-actions">
        <div className="queries-pill">
          <span className="dot" />
          {queriesLeft} Queries Left
        </div>

        <button className="btn btn-ghost btn-icon" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Dropdown */}
        <div className="dropdown-wrapper" ref={notifRef}>
          <button 
            className={`btn btn-ghost btn-icon ${showNotifs ? 'active' : ''}`} 
            onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
            title="Notifications"
          >
            <Bell size={18} />
            <span className="notif-dot" />
          </button>
          
          <div className={`dropdown-menu ${showNotifs ? 'show' : ''}`} style={{ width: 320 }}>
            <div className="dropdown-header">Recent Activity</div>
            <div style={{ maxHeight: 400, overflowY: 'auto', padding: 4 }}>
              {notifs.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No recent activities
                </div>
              ) : notifs.map(n => (
                <div key={n.id} className="notif-item">
                  <div className="notif-title">{n.description}</div>
                  <div className="notif-time">{new Date(n.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Dropdown */}
        <div className="dropdown-wrapper" ref={profileRef}>
          <div 
            className="avatar avatar-md" 
            style={{ cursor: 'pointer', border: showProfile ? '2px solid var(--primary)' : 'none' }}
            onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
          >
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>

          <div className={`dropdown-menu ${showProfile ? 'show' : ''}`} style={{ width: 220 }}>
            <div className="dropdown-header" style={{ borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
              <div style={{ fontSize: 14 }}>{user?.first_name} {user?.last_name}</div>
              <div style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}>{user?.email}</div>
            </div>
            
            <div className="dropdown-item" onClick={() => { setShowProfile(false); navigate('/profile'); }}>
              <User size={14} /> My Profile
            </div>
            <div className="dropdown-item" onClick={() => { setShowProfile(false); navigate('/settings'); }}>
              <Settings size={14} /> Settings
            </div>
            <div 
              className="dropdown-item" 
              style={{ color: 'var(--danger)', marginTop: 8, borderTop: '1px solid var(--border-light)' }} 
              onClick={logout}
            >
              <LogOut size={14} /> Logout
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
