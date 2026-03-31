import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import CreateLead from './pages/CreateLead';
import UploadLeads from './pages/UploadLeads';
import SearchLeads from './pages/SearchLeads';
import Conversations from './pages/Conversations';
import CampaignWizard from './pages/CampaignWizard';
import Campaigns from './pages/Campaigns';
import CampaignReport from './pages/CampaignReport';
import TemplateStudio from './pages/TemplateStudio';
import EngagementList from './pages/EngagementList';
import CreateContacts from './pages/CreateContacts';
import Pipeline from './pages/Pipeline';
import SentimentAnalysis from './pages/SentimentAnalysis';
import SalesPerformance from './pages/SalesPerformance';
import ActionList from './pages/ActionList';
import CallLaterLeads from './pages/CallLaterLeads';
import ServiceTickets from './pages/ServiceTickets';
import ReEngaged from './pages/ReEngaged';
import Employees from './pages/Employees';
import Dealers from './pages/Dealers';
import UserManagement from './pages/UserManagement';
import Billing from './pages/Billing';
import CreateQuotation from './pages/CreateQuotation';
import Quotations from './pages/Quotations';
import Settings from './pages/Settings';

// Placeholder for not-yet-fully-built pages
const Placeholder = ({ title, emoji = '🚧' }) => (
  <div>
    <div className="page-header">
      <div className="page-header-left">
        <h1>{title}</h1>
        <p>This module is coming soon.</p>
      </div>
    </div>
    <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>{emoji}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{title}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>This module is under active development and will be available soon.</div>
    </div>
  </div>
);

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading Samarth CRM...</div>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                fontSize: '13px',
              },
              duration: 3000,
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />

              {/* Leads */}
              <Route path="leads" element={<Leads />} />
              <Route path="leads/create" element={<CreateLead />} />
              <Route path="leads/upload" element={<UploadLeads />} />
              <Route path="leads/search" element={<SearchLeads />} />
              <Route path="leads/:id" element={<Placeholder title="Lead Detail" emoji="👤" />} />

              {/* Conversations */}
              <Route path="conversations" element={<Conversations />} />

              {/* Reports */}
              <Route path="reports/pipeline" element={<Pipeline />} />
              <Route path="reports/sentiment" element={<SentimentAnalysis />} />
              <Route path="reports/sales" element={<SalesPerformance />} />
              <Route path="reports/team" element={<SalesPerformance />} />
              <Route path="reports/actions" element={<ActionList />} />
              <Route path="reports/tickets" element={<ServiceTickets />} />
              <Route path="reports/call-later" element={<CallLaterLeads />} />
              <Route path="reports/re-engaged" element={<ReEngaged />} />

              {/* Marketing */}
              <Route path="marketing/campaigns" element={<CampaignWizard />} />
              <Route path="marketing/campaign-list" element={<Campaigns />} />
              <Route path="marketing/report" element={<CampaignReport />} />
              <Route path="marketing/reports" element={<CampaignReport />} />
              <Route path="marketing/engagement" element={<EngagementList />} />
              <Route path="marketing/contacts" element={<CreateContacts />} />
              <Route path="marketing/templates" element={<TemplateStudio />} />
              <Route path="marketing/template-list" element={<Placeholder title="Template List" emoji="📋" />} />

              {/* Quotations */}
              <Route path="quotations" element={<Quotations />} />
              <Route path="quotations/create" element={<CreateQuotation />} />

              {/* Master Data */}
              <Route path="employees" element={<Employees />} />
              <Route path="dealers" element={<Dealers />} />
              <Route path="dealers/create" element={<Dealers />} />
              <Route path="dealers/list" element={<Dealers />} />
              <Route path="users/create" element={<UserManagement />} />
              <Route path="users/list" element={<UserManagement />} />

              {/* Learning Videos */}
              <Route path="learning/crm-basics" element={<Placeholder title="CRM Basics" emoji="🎓" />} />
              <Route path="learning/whatsapp-setup" element={<Placeholder title="WhatsApp Setup Guide" emoji="📱" />} />
              <Route path="learning/campaigns" element={<Placeholder title="Campaigns Guide" emoji="📢" />} />
              <Route path="learning/reports" element={<Placeholder title="Reports Guide" emoji="📊" />} />

              {/* Etc */}
              <Route path="copilots" element={<Placeholder title="My Copilots" emoji="🤖" />} />
              <Route path="ecomm/products" element={<Placeholder title="AI-Powered Ecommerce" emoji="🛒" />} />
              <Route path="settings" element={<Settings />} />
              <Route path="settings/whatsapp" element={<Settings />} />
              <Route path="billing" element={<Billing />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
