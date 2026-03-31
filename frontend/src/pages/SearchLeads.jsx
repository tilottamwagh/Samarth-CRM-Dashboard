import { useState, useEffect } from 'react';
import { Search, Star, Phone, Mail, MapPin, Calendar, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';

const STAGES = ['new','mql','sql','proposal','negotiation','won','lost'];
const STATUSES = ['hot','warm','cold','very_hot'];
const stageBadge = { new:'badge-blue', mql:'badge-purple', sql:'badge-teal', proposal:'badge-yellow', negotiation:'badge-yellow', won:'badge-green', lost:'badge-red' };

export default function SearchLeads() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    q: '', mobile: '', email: '', stage: '', status: '', lead_source: '',
    from_date: '', to_date: '', star_lead: false, owner: '',
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => { api.get('/auth/employees/').then(({ data }) => setEmployees(data.results || data)).catch(() => {}); }, []);

  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const { data } = await api.get(`/leads/?${params}`);
      setResults(data.results || data);
    } catch { toast.error('Search failed'); }
    finally { setLoading(false); }
  };

  const handleClear = () => { setFilters({ q: '', mobile: '', email: '', stage: '', status: '', lead_source: '', from_date: '', to_date: '', star_lead: false, owner: '' }); setResults([]); setSearched(false); };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Search Leads</h1>
          <p>Advanced search with multiple filters</p>
        </div>
      </div>

      {/* Search Filters */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><div className="card-title">Search Criteria</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Name / Keyword</label>
            <div className="input-group">
              <Search size={14} className="input-icon" />
              <input className="form-control" placeholder="Search by name..." value={filters.q} onChange={e => set('q', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Mobile</label>
            <div className="input-group">
              <Phone size={14} className="input-icon" />
              <input className="form-control" placeholder="10-digit mobile" value={filters.mobile} onChange={e => set('mobile', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-group">
              <Mail size={14} className="input-icon" />
              <input className="form-control" type="email" placeholder="customer@email.com" value={filters.email} onChange={e => set('email', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Stage</label>
            <select className="form-control" value={filters.stage} onChange={e => set('stage', e.target.value)}>
              <option value="">All Stages</option>
              {STAGES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Lead Status</label>
            <select className="form-control" value={filters.status} onChange={e => set('status', e.target.value)}>
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ').toUpperCase()}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Assigned To</label>
            <select className="form-control" value={filters.owner} onChange={e => set('owner', e.target.value)}>
              <option value="">All Owners</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">From Date</label>
            <div className="input-group">
              <Calendar size={14} className="input-icon" />
              <input className="form-control" type="date" value={filters.from_date} onChange={e => set('from_date', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">To Date</label>
            <div className="input-group">
              <Calendar size={14} className="input-icon" />
              <input className="form-control" type="date" value={filters.to_date} onChange={e => set('to_date', e.target.value)} />
            </div>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 24 }}>
            <label className="toggle">
              <input type="checkbox" checked={filters.star_lead} onChange={e => set('star_lead', e.target.checked)} />
              <span className="toggle-slider" />
            </label>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Star size={14} color="var(--warning)" fill="var(--warning)" /> Star Leads Only
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn btn-secondary" onClick={handleClear}>Clear All</button>
          <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
            {loading ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Searching...</> : <><Search size={14} /> Search Leads</>}
          </button>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div className="table-container">
          <div className="table-toolbar">
            <div className="card-title">Search Results</div>
            <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 13 }}>
              {results.length} leads found
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>City</th>
                <th>Stage</th>
                <th>Deal Value</th>
                <th>Owner</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8}><div className="loader"><div className="spinner" /></div></td></tr>
              ) : results.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <Search size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                    <h3>No results found</h3>
                    <p>Try adjusting your search criteria</p>
                  </div>
                </td></tr>
              ) : results.map(lead => (
                <tr key={lead.id} onClick={() => navigate(`/leads/${lead.id}`)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {lead.is_star && <Star size={12} color="var(--warning)" fill="var(--warning)" />}
                      <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{lead.first_name?.[0]}{lead.last_name?.[0]}</div>
                      <span style={{ fontWeight: 600 }}>{lead.first_name} {lead.last_name}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>{lead.mobile}</td>
                  <td>{lead.city || '—'}</td>
                  <td><span className={`badge ${stageBadge[lead.stage] || 'badge-gray'}`}>{lead.stage?.toUpperCase()}</span></td>
                  <td style={{ color: 'var(--success)', fontWeight: 600 }}>{lead.deal_value > 0 ? `₹${Number(lead.deal_value).toLocaleString('en-IN')}` : '—'}</td>
                  <td style={{ fontSize: 12 }}>{lead.owner_name || '—'}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(lead.created_at).toLocaleDateString('en-IN')}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" title="WhatsApp" style={{ color: '#25D366' }}
                        onClick={() => window.open(`https://wa.me/${lead.country_code}${lead.mobile}`, '_blank')}>
                        <MessageSquare size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
