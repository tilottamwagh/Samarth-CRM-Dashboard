import { useState, useEffect } from 'react';
import { RefreshCw, Users, MessageSquare, Clock } from 'lucide-react';
import api from '../api';

export default function ReEngaged() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hours, setHours] = useState(36);

  useEffect(() => { fetchLeads(); }, [hours]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/leads/?re_engaged=true&hours=${hours}`);
      setLeads(data.results || data);
    } catch { setLeads([]); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Re-engaged Customers</h1>
          <p>Customers who came back and started a conversation again</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Last</span>
            <input
              type="number"
              className="form-control"
              value={hours}
              onChange={e => setHours(Number(e.target.value))}
              style={{ width: 70, textAlign: 'center' }}
              min={1}
            />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>hours</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={fetchLeads}><RefreshCw size={14} /></button>
        </div>
      </div>

      {/* KPI */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        {[
          { label: `Re-engaged in ${hours}h`, value: leads.length, icon: Users, color: 'purple' },
          { label: 'With Conversations', value: leads.filter(l => l.has_conversation).length, icon: MessageSquare, color: 'teal' },
          { label: 'Avg Hours Since Engage', value: hours, icon: Clock, color: 'yellow' },
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
          <div className="card-title">Re-engaged Leads</div>
          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 13 }}>
            {leads.length} leads re-engaged in last {hours} hours
          </span>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Name</th><th>Mobile</th><th>City</th><th>Stage</th>
              <th>Last Activity</th><th>Owner</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <tr key={i}>{Array(8).fill(0).map((_, j) => <td key={j}><div style={{ height: 14, background: 'var(--border)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} /></td>)}</tr>
              ))
            ) : leads.length === 0 ? (
              <tr><td colSpan={8}>
                <div className="empty-state">
                  <div className="empty-state-icon">🔄</div>
                  <h3>No re-engaged leads in the last {hours} hours</h3>
                  <p>Try increasing the hours filter to see more data.</p>
                </div>
              </td></tr>
            ) : leads.map((lead, i) => (
              <tr key={lead.id}>
                <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{i + 1}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{lead.first_name?.[0]}{lead.last_name?.[0]}</div>
                    <span style={{ fontWeight: 600 }}>{lead.first_name} {lead.last_name}</span>
                  </div>
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{lead.mobile}</td>
                <td>{lead.city || '—'}</td>
                <td><span className="badge badge-purple">{lead.stage?.toUpperCase()}</span></td>
                <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {lead.last_activity_at ? new Date(lead.last_activity_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                </td>
                <td style={{ fontSize: 12 }}>{lead.owner_name || '—'}</td>
                <td>
                  <button className="btn btn-ghost btn-icon btn-sm" style={{ color: '#25D366' }}
                    onClick={() => window.open(`https://wa.me/${lead.country_code}${lead.mobile}`, '_blank')}>
                    <MessageSquare size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
