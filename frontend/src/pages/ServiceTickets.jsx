import { useState, useEffect } from 'react';
import { Ticket, CheckCircle, Clock, AlertCircle, MessageSquare, Plus, RefreshCw } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const statusBadge = { open: 'badge-red', in_progress: 'badge-yellow', resolved: 'badge-green', closed: 'badge-gray' };
const statusLabel = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed' };

export default function ServiceTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ lead_mobile: '', product_id: '', description: '', priority: 'normal' });

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/leads/service-tickets/');
      setTickets(data.results || data);
    } catch { setTickets([]); }
    finally { setLoading(false); }
  };

  const createTicket = async () => {
    try {
      await api.post('/leads/service-tickets/', form);
      toast.success('Ticket created!');
      setShowModal(false);
      setForm({ lead_mobile: '', product_id: '', description: '', priority: 'normal' });
      fetchTickets();
    } catch { toast.error('Failed to create ticket'); }
  };

  const shareOnWhatsApp = (ticket) => {
    const msg = `*Service Ticket Update*\n\nTicket ID: ${ticket.ticket_number}\nProduct: ${ticket.product_id || 'N/A'}\nStatus: ${ticket.status}\n\n${ticket.description}\n\nFor queries, reply to this message.`;
    window.open(`https://wa.me/${ticket.mobile}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const stats = [
    { label: 'Total Tickets', value: tickets.length, icon: Ticket, color: 'purple' },
    { label: 'Open', value: tickets.filter(t => t.status === 'open').length, icon: AlertCircle, color: 'red' },
    { label: 'In Progress', value: tickets.filter(t => t.status === 'in_progress').length, icon: Clock, color: 'yellow' },
    { label: 'Resolved', value: tickets.filter(t => t.status === 'resolved').length, icon: CheckCircle, color: 'green' },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Service Ticket List</h1>
          <p>Manage and track customer support tickets</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={fetchTickets}><RefreshCw size={14} /> Refresh</button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> New Ticket</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        {stats.map((k, i) => (
          <div key={i} className={`kpi-card ${k.color}`}>
            <div className={`kpi-icon ${k.color}`}><k.icon size={20} /></div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Tickets Table */}
      <div className="table-container">
        <div className="table-toolbar">
          <div className="card-title">All Service Tickets</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Customer</th>
              <th>Mobile</th>
              <th>Product ID</th>
              <th>Description</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <tr key={i}>{Array(9).fill(0).map((_, j) => <td key={j}><div style={{ height: 14, background: 'var(--border)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} /></td>)}</tr>
              ))
            ) : tickets.length === 0 ? (
              <tr><td colSpan={9}>
                <div className="empty-state">
                  <div className="empty-state-icon">🎫</div>
                  <h3>No service tickets</h3>
                  <p>Create a ticket when a customer needs support after purchase.</p>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>
                    <Plus size={13} /> Create First Ticket
                  </button>
                </div>
              </td></tr>
            ) : tickets.map(ticket => (
              <tr key={ticket.id}>
                <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-light)' }}>
                  #{ticket.ticket_number}
                </td>
                <td style={{ fontWeight: 600 }}>{ticket.lead_name || '—'}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{ticket.mobile || '—'}</td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ticket.product_id || '—'}</td>
                <td style={{ maxWidth: 200 }}>
                  <div style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ticket.description}
                  </div>
                </td>
                <td>
                  <span className={`badge ${ticket.priority === 'high' ? 'badge-red' : ticket.priority === 'urgent' ? 'badge-red' : ticket.priority === 'low' ? 'badge-gray' : 'badge-blue'}`}>
                    {ticket.priority || 'normal'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${statusBadge[ticket.status] || 'badge-gray'}`}>
                    {statusLabel[ticket.status] || ticket.status}
                  </span>
                </td>
                <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {new Date(ticket.created_at).toLocaleDateString('en-IN')}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-secondary"
                    style={{ color: '#25D366', borderColor: '#25D366', display: 'flex', alignItems: 'center', gap: 4 }}
                    onClick={() => shareOnWhatsApp(ticket)}
                  >
                    <MessageSquare size={12} /> Share Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Ticket Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Create Service Ticket</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Customer Mobile <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input className="form-control" placeholder="10-digit mobile" value={form.lead_mobile} onChange={e => setForm(f => ({ ...f, lead_mobile: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Product ID / Name</label>
                  <input className="form-control" placeholder="e.g. Swift-Dzire-VXi" value={form.product_id} onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-control" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Short Description <span style={{ color: 'var(--danger)' }}>*</span></label>
                <textarea className="form-control" rows={3} placeholder="Describe the customer's issue..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={createTicket} disabled={!form.lead_mobile || !form.description}>
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
