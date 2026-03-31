import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Outlet, useLocation } from 'react-router-dom';

const pageTitles = {
  '/': { title: 'Dashboard', subtitle: 'Track your copilot activity here.' },
  '/leads': { title: 'Leads', subtitle: 'Manage your complete lead database.' },
  '/leads/create': { title: 'New Lead', subtitle: 'Add a new contact to your CRM.' },
  '/leads/upload': { title: 'Upload Leads', subtitle: 'Bulk import leads from Excel.' },
  '/leads/search': { title: 'Search Leads', subtitle: 'Find leads with advanced filters.' },
  '/conversations': { title: 'My Conversations', subtitle: 'Manage WhatsApp conversations.' },
  '/marketing/campaigns': { title: 'Initiate Connect', subtitle: 'Run bulk WhatsApp campaigns.' },
  '/marketing/templates': { title: 'Template Studio', subtitle: 'Design WhatsApp message templates.' },
  '/marketing/reports': { title: 'Campaign Reports', subtitle: 'Track your campaign performance.' },
  '/quotations': { title: 'Quotations', subtitle: 'Manage all your quotations.' },
  '/quotations/create': { title: 'Create Quotation', subtitle: 'Generate a professional quotation.' },
  '/reports/pipeline': { title: 'Pipeline Analysis', subtitle: 'Visualize your sales funnel.' },
  '/reports/sentiment': { title: 'Sentiment Analysis', subtitle: 'AI-powered conversation sentiment.' },
  '/reports/sales': { title: 'Sales Performance', subtitle: 'Individual and team sales metrics.' },
  '/reports/team': { title: 'Team Summary', subtitle: 'Advanced team performance report.' },
  '/employees': { title: 'Employees', subtitle: 'Manage your sales team.' },
  '/dealers': { title: 'Dealers', subtitle: 'Manage dealer network.' },
  '/copilots': { title: 'My Copilots', subtitle: 'Configure AI automation bots.' },
  '/billing': { title: 'My Billing', subtitle: 'Subscription and payment history.' },
  '/settings': { title: 'Settings', subtitle: 'Manage your account and integrations.' },
  '/settings/whatsapp': { title: 'WhatsApp Setup', subtitle: 'Link your WhatsApp Business account.' },
};

export default function Layout() {
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname] || { title: 'Samarth CRM', subtitle: '' };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Topbar title={pageInfo.title} subtitle={pageInfo.subtitle} />
        <div className="page-content fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
