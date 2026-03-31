import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, Users, MessageSquare, BarChart2, Megaphone,
  FileText, Settings, LogOut, ChevronRight, Zap, Moon, Sun,
  ShoppingCart, BookOpen, CreditCard, Bot, Target, Bell, Search,
  TrendingUp, UserCheck, Ticket, Phone, RotateCcw, List,
  Send, Layers, UserPlus, Plug, BarChart, Building, PlayCircle, UserCog
} from 'lucide-react';

const navConfig = [
  { type: 'label', label: 'MAIN' },
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/copilots', icon: Bot, label: 'My Copilots' },

  { type: 'label', label: 'REPORTS' },
  {
    icon: BarChart2, label: 'My Reports', children: [
      { path: '/reports/sales', icon: TrendingUp, label: 'Sales Performance' },
      { path: '/reports/team', icon: UserCheck, label: 'Team Summary' },
      { path: '/reports/pipeline', icon: Target, label: 'Pipeline Analysis' },
      { path: '/reports/sentiment', icon: MessageSquare, label: 'Sentiment Analysis' },
      { path: '/reports/actions', icon: List, label: 'Action List' },
      { path: '/leads/search', icon: Search, label: 'Search Leads' },
      { path: '/reports/tickets', icon: Ticket, label: 'Service Tickets' },
      { path: '/reports/call-later', icon: Phone, label: 'Call Later Leads' },
      { path: '/reports/re-engaged', icon: RotateCcw, label: 'Re-engaged' },
    ]
  },

  { type: 'label', label: 'SALES' },
  {
    icon: FileText, label: 'Quotation Tool', children: [
      { path: '/quotations/create', icon: FileText, label: 'Create Quotation' },
      { path: '/quotations', icon: List, label: 'Quotation List' },
    ]
  },

  { type: 'label', label: 'MARKETING' },
  {
    icon: Megaphone, label: 'Marketing', children: [
      { path: '/marketing/campaigns', icon: Send, label: 'Initiate Connect' },
      { path: '/marketing/report', icon: BarChart, label: 'Campaign Report' },
      { path: '/marketing/engagement', icon: Layers, label: 'Engagement List' },
      { path: '/conversations', icon: MessageSquare, label: 'My Conversations' },
      { path: '/marketing/contacts', icon: UserPlus, label: 'Create Contacts' },
      { path: '/marketing/templates', icon: FileText, label: 'Template Studio(Beta)' },
      { path: '/marketing/template-list', icon: List, label: 'Template List' },
      { path: '/settings', icon: Plug, label: 'WhatsApp Plugin' },
    ]
  },

  { type: 'label', label: 'SETUP' },
  {
    icon: ShoppingCart, label: 'AI-Powered Ecomm', children: [
      { path: '/ecomm/products', icon: ShoppingCart, label: 'Products' },
    ]
  },
  {
    icon: Users, label: 'Master Data', children: [
      { path: '/leads/create', icon: UserPlus, label: 'Create single Lead' },
      { path: '/leads/upload', icon: Users, label: 'Upload Mass leads' },
      { path: '/dealers/create', icon: Building, label: 'Create Dealer' },
      { path: '/dealers/list', icon: Building, label: 'Dealer List' },
      { path: '/users/create', icon: UserCog, label: 'Create User' },
      { path: '/users/list', icon: UserCog, label: 'User List' },
    ]
  },

  { type: 'label', label: 'LEARNING' },
  {
    icon: PlayCircle, label: 'Learning Videos', children: [
      { path: '/learning/crm-basics', icon: PlayCircle, label: 'CRM Basics' },
      { path: '/learning/whatsapp-setup', icon: PlayCircle, label: 'WhatsApp Setup' },
      { path: '/learning/campaigns', icon: PlayCircle, label: 'Campaigns Guide' },
      { path: '/learning/reports', icon: PlayCircle, label: 'Reports Guide' },
    ]
  },

  { path: '/settings', icon: Settings, label: 'Settings' },
  { path: '/billing', icon: CreditCard, label: 'My Billing' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({ 'My Reports': true });

  const toggleMenu = (label) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isChildActive = (children) =>
    children?.some(c => location.pathname === c.path || location.pathname.startsWith(c.path + '/'));

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">S</div>
        <div className="sidebar-logo-text">
          Samarth CRM
          <span>SaaS Platform</span>
        </div>
      </div>

      {/* WhatsApp Banner */}
      <div className="wa-banner" onClick={() => navigate('/settings/whatsapp')}>
        📱 Link your WhatsApp
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navConfig.map((item, i) => {
          if (item.type === 'label') {
            return <div key={i} className="nav-section-label">{item.label}</div>;
          }

          if (item.children) {
            const isOpen = openMenus[item.label] || isChildActive(item.children);
            return (
              <div key={i}>
                <div
                  className={`nav-item ${isChildActive(item.children) ? 'active' : ''}`}
                  onClick={() => toggleMenu(item.label)}
                >
                  <span className="nav-icon"><item.icon size={17} /></span>
                  {item.label}
                  <ChevronRight size={14} className={`nav-chevron ${isOpen ? 'open' : ''}`} />
                </div>
                <div className={`nav-submenu ${isOpen ? 'open' : ''}`}>
                  {item.children.map((child, j) => (
                    <NavLink
                      key={j}
                      to={child.path}
                      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                      <span className="nav-icon"><child.icon size={15} /></span>
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <NavLink
              key={i}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon"><item.icon size={17} /></span>
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div className="user-info" style={{ flex: 1 }}>
            <div className="user-name">{user?.first_name} {user?.last_name}</div>
            <div className="user-role">{user?.role || 'admin'}</div>
          </div>
          <button
            className="btn btn-ghost btn-icon"
            onClick={logout}
            title="Logout"
            style={{ padding: '4px' }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
