import { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCheck, Eye, Download, Search, Filter } from 'lucide-react';
import api from '../api';

export default function EngagementList() {
  const [engagements, setEngagements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchEngagements(); }, []);

  const fetchEngagements = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/marketing/engagements/');
      setEngagements(data.results || data);
    } catch { setEngagements([]); }
    finally { setLoading(false); }
  };

  const filtered = engagements.filter(e =>
    (e.contact_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.mobile || '').includes(search) ||
    (e.campaign_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const statusIcon = {
    sent: <MessageSquare size={12} style={{ color: 'var(--text-muted)' }} />,
    delivered: <CheckCheck size={12} style={{ color: 'var(--info)' }} />,
    read: <CheckCheck size={12} style={{ color: 'var(--success)' }} />,
    failed: <MessageSquare size={12} style={{ color: 'var(--danger)' }} />,
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Engagement List</h1>
          <p>Per-contact campaign message delivery history</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-sm"><Download size={13} /> Export</button>
        </div>
      </div>

      {/* Stats */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        {[
          { label: 'Total Messages', value: engagements.length, color: 'purple', icon: MessageSquare },
          { label: 'Delivered', value: engagements.filter(e => ['delivered', 'read'].includes(e.status)).length, color: 'blue', icon: CheckCheck },
          { label: 'Read', value: engagements.filter(e => e.status === 'read').length, color: 'green', icon: Eye },
          { label: 'Failed', value: engagements.filter(e => e.status === 'failed').length, color: 'red', icon: Clock },
        ].map((k, i) => (
          <div key={i} className={`kpi-card ${k.color}`}>
            <div className={`kpi-icon ${k.color}`}><k.icon size={20} /></div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input placeholder="Search by name, mobile or campaign..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
          </div>
          <button className="btn btn-secondary btn-sm"><Filter size={13} /> Filter</button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-toolbar">
          <div className="card-title">Message Delivery Log</div>
          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 13 }}>{filtered.length} records</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Contact Name</th>
              <th>Mobile</th>
              <th>Campaign</th>
              <th>Template</th>
              <th>Sent At</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i}>{Array(8).fill(0).map((_, j) => <td key={j}><div style={{ height: 14, background: 'var(--border)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} /></td>)}</tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8}>
                <div className="empty-state">
                  <div className="empty-state-icon">📬</div>
                  <h3>No engagement data yet</h3>
                  <p>Launch a campaign to see per-contact delivery status here.</p>
                </div>
              </td></tr>
            ) : filtered.map((e, i) => (
              <tr key={e.id || i}>
                <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{i + 1}</td>
                <td style={{ fontWeight: 600 }}>{e.contact_name || '—'}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{e.mobile}</td>
                <td style={{ fontSize: 12, color: 'var(--primary-light)' }}>{e.campaign_name || '—'}</td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.template_name || '—'}</td>
                <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {e.sent_at ? new Date(e.sent_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                </td>
                <td>
                  <span className={`badge ${e.status === 'delivered' || e.status === 'read' ? 'badge-green' : e.status === 'failed' ? 'badge-red' : e.status === 'read' ? 'badge-teal' : 'badge-blue'}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {statusIcon[e.status]} {e.status}
                  </span>
                </td>
                <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {e.updated_at ? new Date(e.updated_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
