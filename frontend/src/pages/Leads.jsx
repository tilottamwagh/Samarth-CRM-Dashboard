import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Upload, Filter, MoreVertical, Edit2, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const STAGES = ['new','mql','sql','proposal','negotiation','won','lost'];
const SOURCES = ['whatsapp','website','referral','cold_call','social_media','exhibition','walk_in','bulk_upload','other'];

const stageBadge = { new:'badge-blue', mql:'badge-purple', sql:'badge-teal', proposal:'badge-yellow', negotiation:'badge-yellow', won:'badge-green', lost:'badge-red' };

export default function Leads() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ stage: '', source: '', status: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const PAGE_SIZE = 20;

  useEffect(() => { fetchLeads(); }, [search, filters, page]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, ...(search && { q: search }), ...filters });
      const { data } = await api.get(`/leads/?${params}`);
      setLeads(data.results || data);
      setTotal(data.count || (data.results ? data.count : data.length));
    } catch { toast.error('Failed to load leads'); }
    finally { setLoading(false); }
  };

  const deleteLead = async (id) => {
    if (!confirm('Delete this lead?')) return;
    try {
      await api.delete(`/leads/${id}/`);
      toast.success('Lead deleted');
      fetchLeads();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Leads</h1>
          <p>Manage your complete lead database • {total} total</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/leads/upload')}>
            <Upload size={14} /> Bulk Upload
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/leads/create')}>
            <Plus size={15} /> New Lead
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="table-container">
        <div className="table-toolbar">
          <div className="search-bar" style={{ flex: 1, maxWidth: 360 }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              placeholder="Search by name, mobile, city..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <button className={`btn btn-secondary btn-sm ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
            <Filter size={13} /> Filters
          </button>
        </div>

        {/* Filters Row */}
        {showFilters && (
          <div style={{ display: 'flex', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-base)', flexWrap: 'wrap' }}>
            {['stage', 'source'].map(f => (
              <select key={f} className="form-control" style={{ width: 180 }}
                value={filters[f]} onChange={e => setFilters({ ...filters, [f]: e.target.value })}>
                <option value="">All {f === 'stage' ? 'Stages' : 'Sources'}</option>
                {(f === 'stage' ? STAGES : SOURCES).map(v => (
                  <option key={v} value={v}>{v.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                ))}
              </select>
            ))}
            <button className="btn btn-ghost btn-sm" onClick={() => { setFilters({ stage: '', source: '', status: '' }); setSearch(''); }}>
              Clear
            </button>
          </div>
        )}

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>City</th>
              <th>Source</th>
              <th>Stage</th>
              <th>Deal Value</th>
              <th>Owner</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <tr key={i}>
                  {Array(10).fill(0).map((_, j) => (
                    <td key={j}><div style={{ height: 14, background: 'var(--border)', borderRadius: 4, animation: 'pulse 1.5s infinite', width: j === 0 ? 20 : '80%' }} /></td>
                  ))}
                </tr>
              ))
            ) : leads.length === 0 ? (
              <tr><td colSpan={10}>
                <div className="empty-state">
                  <div className="empty-state-icon">👥</div>
                  <h3>No leads found</h3>
                  <p>Add your first lead or import from Excel.</p>
                  <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/leads/create')}><Plus size={14} /> Add Lead</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/leads/upload')}><Upload size={14} /> Import</button>
                  </div>
                </div>
              </td></tr>
            ) : (
              leads.map((lead, i) => (
                <tr key={lead.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/leads/${lead.id}`)}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                        {lead.first_name?.[0]}{lead.last_name?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{lead.first_name} {lead.last_name}</div>
                        {lead.email && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>+{lead.country_code} {lead.mobile}</td>
                  <td>{lead.city || '—'}</td>
                  <td>
                    <span className="badge badge-gray">
                      {(lead.lead_source || 'Other').replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${stageBadge[lead.stage] || 'badge-gray'}`}>
                      {lead.stage?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                    {lead.deal_value > 0 ? `₹${Number(lead.deal_value).toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td style={{ fontSize: 12 }}>{lead.owner_name || 'Unassigned'}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {new Date(lead.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => navigate(`/leads/${lead.id}`)} title="View">
                        <Eye size={13} />
                      </button>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => navigate(`/leads/${lead.id}/edit`)} title="Edit">
                        <Edit2 size={13} />
                      </button>
                      <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => deleteLead(lead.id)} title="Delete">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={14} />
              </button>
              <button className="btn btn-secondary btn-sm" disabled={page * PAGE_SIZE >= total} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
