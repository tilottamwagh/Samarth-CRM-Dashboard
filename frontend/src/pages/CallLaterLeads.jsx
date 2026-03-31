import { useState, useEffect } from 'react';
import { Phone, Clock, AlertCircle, ChevronLeft, ChevronRight, Calendar, RefreshCw, MessageSquare } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

export default function CallLaterLeads() {
  const [leads, setLeads] = useState([]);
  const [overdue, setOverdue] = useState(0);
  const [today, setToday] = useState(0);
  const [upcoming, setUpcoming] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // list | calendar
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  useEffect(() => { fetchLeads(); }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/leads/?status=call_later');
      const all = data.results || data;
      setLeads(all);
      const now = new Date();
      setOverdue(all.filter(l => l.callback_date && new Date(l.callback_date) < now).length);
      setToday(all.filter(l => {
        if (!l.callback_date) return false;
        const d = new Date(l.callback_date);
        return d.toDateString() === now.toDateString();
      }).length);
      setUpcoming(all.filter(l => l.callback_date && new Date(l.callback_date) > now).length);
    } catch { toast.error('Failed to load call-later leads'); }
    finally { setLoading(false); }
  };

  const paginated = leads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openWhatsApp = (lead) => {
    window.open(`https://wa.me/${lead.country_code}${lead.mobile}`, '_blank');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Call Later Leads</h1>
          <p>Leads scheduled for callback tracking</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div className="date-filter">
            <button className={`date-chip ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>List View</button>
            <button className={`date-chip ${view === 'calendar' ? 'active' : ''}`} onClick={() => setView('calendar')}>Calendar</button>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={fetchLeads}><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        {[
          { label: 'Total Overdue', value: overdue, icon: AlertCircle, color: 'red', sub: 'missed callbacks' },
          { label: 'Due Today', value: today, icon: Clock, color: 'yellow', sub: 'need to call today' },
          { label: 'Upcoming', value: upcoming, icon: Calendar, color: 'blue', sub: 'scheduled ahead' },
        ].map((k, i) => (
          <div key={i} className={`kpi-card ${k.color}`}>
            <div className={`kpi-icon ${k.color}`}><k.icon size={20} /></div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-change">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="table-container">
          <div className="table-toolbar">
            <div className="card-title">Call Later Schedule</div>
            <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 13 }}>{leads.length} total</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Mobile</th>
                <th>City</th>
                <th>Callback Date</th>
                <th>Stage</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>{Array(9).fill(0).map((_, j) => <td key={j}><div style={{ height: 14, background: 'var(--border)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} /></td>)}</tr>
                ))
              ) : paginated.length === 0 ? (
                <tr><td colSpan={9}>
                  <div className="empty-state">
                    <div className="empty-state-icon">📞</div>
                    <h3>No call-later leads</h3>
                    <p>Leads marked as "Call Later" will appear here with their scheduled callback date.</p>
                  </div>
                </td></tr>
              ) : paginated.map((lead, i) => {
                const callbackDate = lead.callback_date ? new Date(lead.callback_date) : null;
                const isOverdue = callbackDate && callbackDate < new Date();
                const isToday = callbackDate && callbackDate.toDateString() === new Date().toDateString();
                return (
                  <tr key={lead.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{lead.first_name?.[0]}{lead.last_name?.[0]}</div>
                        <span style={{ fontWeight: 600 }}>{lead.first_name} {lead.last_name}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>{lead.mobile}</td>
                    <td>{lead.city || '—'}</td>
                    <td>
                      {callbackDate ? (
                        <span style={{ color: isOverdue ? 'var(--danger)' : isToday ? 'var(--warning)' : 'var(--text-primary)', fontWeight: isOverdue || isToday ? 700 : 400 }}>
                          {isOverdue && '⚠ '}
                          {callbackDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          {isToday && ' (Today)'}
                        </span>
                      ) : <span style={{ color: 'var(--text-muted)' }}>Not set</span>}
                    </td>
                    <td><span className="badge badge-gray">{lead.stage?.toUpperCase()}</span></td>
                    <td style={{ fontSize: 12 }}>{lead.owner_name || '—'}</td>
                    <td>
                      {isOverdue ? <span className="badge badge-red">Overdue</span> :
                        isToday ? <span className="badge badge-yellow">Today</span> :
                          <span className="badge badge-blue">Upcoming</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          style={{ color: '#25D366' }}
                          title="WhatsApp"
                          onClick={() => openWhatsApp(lead)}
                        >
                          <MessageSquare size={13} />
                        </button>
                        <button className="btn btn-ghost btn-icon btn-sm" title="Mark Called">
                          <Phone size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {leads.length > PAGE_SIZE && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, leads.length)} of {leads.length}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft size={14} />
                </button>
                <button className="btn btn-secondary btn-sm" disabled={page * PAGE_SIZE >= leads.length} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="card">
          <div className="card-header"><div className="card-title">Calendar View</div></div>
          <div className="empty-state" style={{ padding: '40px 20px' }}>
            <Calendar size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <h3>Calendar View</h3>
            <p>Interactive calendar view coming soon. Use list view for now.</p>
          </div>
        </div>
      )}
    </div>
  );
}
