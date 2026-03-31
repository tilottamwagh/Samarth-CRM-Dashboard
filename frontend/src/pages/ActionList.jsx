import { useState, useEffect } from 'react';
import { Search, User, Phone, Star, Tag, ArrowRight, MessageSquare } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const INTENTS = ['interested', 'not_interested', 'price_query', 'test_drive', 'exchange', 'finance', 'follow_up', 'complaint'];

export default function ActionList() {
  const [leads, setLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ intent: '', owner: '', q: '' });
  const [assignModal, setAssignModal] = useState(null);
  const [assignTo, setAssignTo] = useState('');

  useEffect(() => {
    api.get('/auth/employees/').then(({ data }) => setEmployees(data.results || data)).catch(() => {});
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)));
      const { data } = await api.get(`/leads/?${params}&action_required=true`);
      setLeads(data.results || data);
    } catch { setLeads([]); }
    finally { setLoading(false); }
  };

  const handleAssign = async () => {
    if (!assignTo) return toast.error('Select an owner');
    try {
      await api.patch(`/leads/${assignModal.id}/`, { owner: assignTo });
      toast.success(`Assigned to ${employees.find(e => e.id === Number(assignTo))?.first_name}`);
      setAssignModal(null);
      setAssignTo('');
      fetchLeads();
    } catch { toast.error('Assignment failed'); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Action List</h1>
          <p>Intent-based lead search and assignment</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
            <label className="form-label">Search Customer</label>
            <div className="input-group">
              <Search size={14} className="input-icon" />
              <input className="form-control" placeholder="Name or mobile..." value={filters.q} onChange={e => setFilters(f => ({ ...f, q: e.target.value }))} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 170 }}>
            <label className="form-label">Intent / Tag</label>
            <select className="form-control" value={filters.intent} onChange={e => setFilters(f => ({ ...f, intent: e.target.value }))}>
              <option value="">All Intents</option>
              {INTENTS.map(i => <option key={i} value={i}>{i.replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 170 }}>
            <label className="form-label">Assigned To</label>
            <select className="form-control" value={filters.owner} onChange={e => setFilters(f => ({ ...f, owner: e.target.value }))}>
              <option value="">All Owners</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={fetchLeads} style={{ marginBottom: 0 }}>
            <Search size={14} /> Search
          </button>
        </div>

        {/* Intent quick-filter chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>Quick Filter:</span>
          {INTENTS.map(intent => (
            <button
              key={intent}
              className={`date-chip ${filters.intent === intent ? 'active' : ''}`}
              onClick={() => { setFilters(f => ({ ...f, intent: f.intent === intent ? '' : intent })); }}
            >
              {intent.replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Action Cards */}
      <div className="table-container">
        <div className="table-toolbar">
          <div className="card-title">Action Required</div>
          <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 13 }}>{leads.length} leads</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Customer</th>
              <th>Mobile</th>
              <th>Last Message</th>
              <th>Intent</th>
              <th>Stage</th>
              <th>Owner</th>
              <th>Actions</th>
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
                  <div className="empty-state-icon">✅</div>
                  <h3>All caught up!</h3>
                  <p>No leads currently require immediate action. Search by intent to find specific leads.</p>
                </div>
              </td></tr>
            ) : leads.map((lead, i) => (
              <tr key={lead.id}>
                <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{i + 1}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {lead.is_star && <Star size={11} color="var(--warning)" fill="var(--warning)" />}
                    <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{lead.first_name?.[0]}{lead.last_name?.[0]}</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{lead.first_name} {lead.last_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.city || ''}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{lead.mobile}</td>
                <td style={{ maxWidth: 200 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lead.last_message || '—'}
                  </div>
                </td>
                <td>
                  {lead.intent ? (
                    <span className="badge badge-purple">
                      <Tag size={9} /> {lead.intent.replaceAll('_', ' ')}
                    </span>
                  ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                </td>
                <td><span className="badge badge-teal">{lead.stage?.toUpperCase()}</span></td>
                <td style={{ fontSize: 12 }}>{lead.owner_name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ color: '#25D366' }}
                      onClick={() => window.open(`https://wa.me/${lead.country_code}${lead.mobile}`, '_blank')}
                      title="WhatsApp"
                    >
                      <MessageSquare size={13} />
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setAssignModal(lead)}
                      title="Assign"
                    >
                      <ArrowRight size={12} /> Assign
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign Modal */}
      {assignModal && (
        <div className="modal-overlay" onClick={() => setAssignModal(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Assign Lead</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setAssignModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--bg-input)', borderRadius: 10, marginBottom: 16 }}>
                <div className="avatar">{assignModal.first_name?.[0]}{assignModal.last_name?.[0]}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{assignModal.first_name} {assignModal.last_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{assignModal.mobile}</div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select className="form-control" value={assignTo} onChange={e => setAssignTo(e.target.value)}>
                  <option value="">Select team member...</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setAssignModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAssign} disabled={!assignTo}>Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
