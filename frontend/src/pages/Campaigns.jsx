import { useState, useEffect } from 'react';
import { Plus, Send, Megaphone, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const statusBadge = { draft:'badge-gray', scheduled:'badge-blue', running:'badge-yellow', completed:'badge-green', failed:'badge-red', paused:'badge-yellow' };

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '' });

  useEffect(() => { fetchCampaigns(); }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/marketing/campaigns/');
      setCampaigns(data.results || data);
    } catch { toast.error('Failed to load campaigns'); }
    finally { setLoading(false); }
  };

  const createCampaign = async () => {
    try {
      await api.post('/marketing/campaigns/', form);
      toast.success('Campaign created!');
      setShowModal(false);
      fetchCampaigns();
    } catch { toast.error('Failed to create campaign'); }
  };

  const launchCampaign = async (id) => {
    try {
      await api.post(`/marketing/campaigns/${id}/send/`);
      toast.success('Campaign launched!');
      fetchCampaigns();
    } catch { toast.error('Failed to launch'); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Initiate Connect</h1>
          <p>Launch bulk WhatsApp marketing campaigns</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={15} /> New Campaign
        </button>
      </div>

      {/* Stats Row */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        {[
          { label: 'Total Campaigns', value: campaigns.length, color: 'purple', icon: Megaphone },
          { label: 'Running', value: campaigns.filter(c=>c.status==='running').length, color: 'green', icon: Send },
          { label: 'Completed', value: campaigns.filter(c=>c.status==='completed').length, color: 'teal', icon: CheckCircle },
          { label: 'Scheduled', value: campaigns.filter(c=>c.status==='scheduled').length, color: 'yellow', icon: Clock },
        ].map((k, i) => (
          <div key={i} className={`kpi-card ${k.color}`}>
            <div className={`kpi-icon ${k.color}`}><k.icon size={20} /></div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Campaigns Table */}
      <div className="table-container">
        <div className="table-toolbar">
          <div className="card-title">All Campaigns</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Campaign Name</th>
              <th>Status</th>
              <th>Recipients</th>
              <th>Delivered</th>
              <th>Read</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7}><div className="loader"><div className="spinner" /></div></td></tr>
            ) : campaigns.length === 0 ? (
              <tr><td colSpan={7}>
                <div className="empty-state">
                  <Megaphone size={40} className="empty-state-icon" style={{ opacity: 0.3 }} />
                  <h3>No campaigns yet</h3>
                  <p>Create your first bulk WhatsApp campaign</p>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>
                    <Plus size={13} /> Create Campaign
                  </button>
                </div>
              </td></tr>
            ) : (
              campaigns.map(c => (
                <tr key={c.id}>
                  <td><div style={{ fontWeight: 600 }}>{c.name}</div></td>
                  <td><span className={`badge ${statusBadge[c.status]}`}>{c.status}</span></td>
                  <td>{c.recipient_count}</td>
                  <td>
                    {c.delivered_count > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {c.delivered_count}
                        <div className="progress" style={{ width: 60 }}>
                          <div className="progress-bar" style={{ width: `${Math.min((c.delivered_count / Math.max(c.recipient_count,1))*100, 100)}%` }} />
                        </div>
                      </div>
                    )}
                    {!c.delivered_count && '—'}
                  </td>
                  <td>{c.read_count || '—'}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {c.status === 'draft' && (
                        <button className="btn btn-primary btn-sm" onClick={() => launchCampaign(c.id)}>
                          <Send size={12} /> Launch
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Campaign Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">New Campaign</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Campaign Name <span style={{color:'var(--danger)'}}>*</span></label>
                <input className="form-control" placeholder="e.g. Diwali Offer 2024" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div style={{ padding: '12px 16px', background: 'rgba(116,185,255,0.1)', border: '1px solid rgba(116,185,255,0.2)', borderRadius: 8, fontSize: 12, color: 'var(--info)' }}>
                💡 After creating, attach a WhatsApp template and upload recipient Excel to send.
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={createCampaign} disabled={!form.name}>Create Campaign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
