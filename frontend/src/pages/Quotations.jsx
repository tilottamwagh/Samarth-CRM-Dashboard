import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Share2, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const statusBadge = { draft: 'badge-gray', sent: 'badge-blue', accepted: 'badge-green', rejected: 'badge-red', expired: 'badge-yellow' };

export default function Quotations() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchQuotations(); }, []);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/quotations/');
      setQuotations(data.results || data);
    } catch { toast.error('Failed to load quotations'); }
    finally { setLoading(false); }
  };

  const shareOnWhatsApp = async (q) => {
    const msg = `*Quotation #${q.quote_number}*\n${q.title}\n\nTotal: ₹${Number(q.final_value).toLocaleString('en-IN')}\n\nGenerated via Samarth CRM`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Quotation List</h1>
          <p>Manage all generated quotations</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/quotations/create')}>
          <Plus size={15} /> Create Quotation
        </button>
      </div>

      {/* Stats */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        {[
          { label: 'Total Quotations', value: quotations.length, color: 'purple', icon: FileText },
          { label: 'Accepted', value: quotations.filter(q => q.status === 'accepted').length, color: 'green', icon: CheckCircle },
          { label: 'Pending', value: quotations.filter(q => q.status === 'sent').length, color: 'yellow', icon: Clock },
          { label: 'Rejected', value: quotations.filter(q => q.status === 'rejected').length, color: 'red', icon: XCircle },
        ].map((k, i) => (
          <div key={i} className={`kpi-card ${k.color}`}>
            <div className={`kpi-icon ${k.color}`}><k.icon size={20} /></div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="card-title">All Quotations</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Quote #</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Vehicle / Property</th>
              <th>Final Value</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8}><div className="loader"><div className="spinner" /></div></td></tr>
            ) : quotations.length === 0 ? (
              <tr><td colSpan={8}>
                <div className="empty-state">
                  <div className="empty-state-icon">📄</div>
                  <h3>No quotations yet</h3>
                  <p>Create your first quotation for a customer</p>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => navigate('/quotations/create')}>
                    <Plus size={13} /> Create Quotation
                  </button>
                </div>
              </td></tr>
            ) : (
              quotations.map(q => (
                <tr key={q.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-light)' }}>#{q.quote_number}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{q.lead_name}</div>
                  </td>
                  <td>
                    <span className={`badge ${q.quote_type === 'automotive' ? 'badge-purple' : 'badge-teal'}`}>
                      {q.quote_type === 'automotive' ? '🚗 Auto' : '🏠 Realty'}
                    </span>
                  </td>
                  <td>{q.title}</td>
                  <td style={{ fontWeight: 700, color: 'var(--success)' }}>₹{Number(q.final_value).toLocaleString('en-IN')}</td>
                  <td><span className={`badge ${statusBadge[q.status] || 'badge-gray'}`}>{q.status}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(q.created_at).toLocaleDateString('en-IN')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" title="View"><Eye size={13} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" title="Share on WhatsApp" style={{ color: '#25D366' }} onClick={() => shareOnWhatsApp(q)}>
                        <Share2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
