import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Target, Award, Filter, Search, Star } from 'lucide-react';
import api from '../api';

// Matches exactly what Vaayushop shows: Deal funnel with all stages in order
const DEAL_STAGES = [
  { key: 'new', label: 'Initial' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'lost', label: 'Lost' },
  { key: 'mql', label: 'MQL-Mixing Qualified' },
  { key: 'sql', label: 'SQL-Sales Qualified' },
  { key: 'scheduled', label: 'Meet/Visit Scheduled' },
  { key: 'completed', label: 'Meet/Visit Completed' },
  { key: 'won', label: 'Won' },
];

const DEAL_STATUSES = [
  { key: 'initial', label: 'Initial' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'lost', label: 'Lost' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'hold', label: 'Hold' },
  { key: 'call_later', label: 'Call-later' },
  { key: 'duplicate', label: 'Duplicate' },
  { key: 'won', label: 'Won' },
];

export default function PipelineAnalysis() {
  const [pipeline, setPipeline] = useState({ stages: [], statuses: [], funnel: [] });
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    owner: '', source: '', lead_type: '', min_amount: '', max_amount: '',
    date_range: 'Custom', from_date: '', to_date: '', star_lead: false,
  });
  const [showVisual, setShowVisual] = useState(false);

  useEffect(() => {
    api.get('/auth/employees/').then(({ data }) => setEmployees(data.results || data)).catch(() => {});
    fetchPipeline();
  }, []);

  const fetchPipeline = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== false))
      );
      const { data } = await api.get(`/analytics/pipeline/?${params}`);
      setPipeline({
        stages: data.stages || DEAL_STAGES.map(s => ({ ...s, count: 0, amount: 0, pct: 0 })),
        statuses: data.statuses || DEAL_STATUSES.map(s => ({ ...s, count: 0, amount: 0, pct: 0 })),
        funnel: data.funnel || [],
      });
    } catch {
      setPipeline({
        stages: DEAL_STAGES.map(s => ({ ...s, count: 0, amount: 0.0, pct: 0 })),
        statuses: DEAL_STATUSES.map(s => ({ ...s, count: 0, amount: 0.0, pct: 0 })),
        funnel: [],
      });
    } finally { setLoading(false); }
  };

  const FUNNEL_COLORS = {
    Initial: '#74B9FF', Contacted: '#6C5CE7', Lost: '#FF7675',
    'MQL-Mixing Qualified': '#A29BFE', 'SQL-Sales Qualified': '#00CEC9',
    'Meet/Visit Scheduled': '#FDCB6E', 'Meet/Visit Completed': '#FD79A8', Won: '#00B894',
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Pipeline Analysis</h1>
          <p>Deal funnel with all stages in order</p>
        </div>
      </div>

      {/* Filters — exact match to Vaayushop */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 160 }}>
            <label className="form-label">Owner</label>
            <input className="form-control" placeholder="type Owner name" value={filters.owner}
              onChange={e => setFilters(f => ({ ...f, owner: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 140 }}>
            <label className="form-label">Source</label>
            <input className="form-control" placeholder="type Source" value={filters.source}
              onChange={e => setFilters(f => ({ ...f, source: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 130 }}>
            <label className="form-label">Lead Type</label>
            <select className="form-control" value={filters.lead_type} onChange={e => setFilters(f => ({ ...f, lead_type: e.target.value }))}>
              <option value="">---</option>
              <option value="hot">Hot</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 160 }}>
            <label className="form-label">Lead Amount (≥)</label>
            <input className="form-control" type="number" placeholder="Add Minimum Amount" value={filters.min_amount}
              onChange={e => setFilters(f => ({ ...f, min_amount: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 160 }}>
            <label className="form-label">Lead Amount (≤)</label>
            <input className="form-control" type="number" placeholder="Add Maximum Amount" value={filters.max_amount}
              onChange={e => setFilters(f => ({ ...f, max_amount: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 120 }}>
            <label className="form-label">Select Date</label>
            <select className="form-control" value={filters.date_range} onChange={e => setFilters(f => ({ ...f, date_range: e.target.value }))}>
              <option>Custom</option>
              <option>Last 7 Days</option>
              <option>Last Month</option>
              <option>Last 3 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">From Date</label>
            <input className="form-control" type="date" value={filters.from_date} onChange={e => setFilters(f => ({ ...f, from_date: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">To Date</label>
            <input className="form-control" type="date" value={filters.to_date} onChange={e => setFilters(f => ({ ...f, to_date: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: 14, height: 14 }} checked={filters.star_lead}
              onChange={e => setFilters(f => ({ ...f, star_lead: e.target.checked }))} />
            <Star size={13} color={filters.star_lead ? 'var(--warning)' : 'var(--text-muted)'} fill={filters.star_lead ? 'var(--warning)' : 'none'} />
            Star Leads
          </label>
          <button className="btn btn-primary btn-sm" onClick={fetchPipeline}>
            <Search size={13} /> Search
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ owner: '', source: '', lead_type: '', min_amount: '', max_amount: '', date_range: 'Custom', from_date: '', to_date: '', star_lead: false })}>
            Clear
          </button>
        </div>
      </div>

      {/* All Stages In Order header — matches Vaayushop exactly */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>All Stages In Order</span>
        <button
          className={`btn btn-sm ${showVisual ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setShowVisual(v => !v)}
        >
          Visualize
        </button>
      </div>

      {/* Funnel bar chart (when Visualize clicked) */}
      {showVisual && pipeline.stages.length > 0 && (
        <div className="chart-container" style={{ marginBottom: 20 }}>
          <div className="card-header"><div className="card-title">Funnel Visualization</div></div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pipeline.stages} layout="vertical" barSize={24}>
              <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} />
              <YAxis type="category" dataKey="label" width={160} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" name="Leads" radius={[0, 4, 4, 0]}>
                {pipeline.stages.map((s, i) => <Cell key={i} fill={FUNNEL_COLORS[s.label] || '#6C5CE7'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Dual Table Layout — matches Vaayushop exactly */}
      <div className="grid-2" style={{ gap: 20 }}>
        {/* Stages Table */}
        <div className="table-container">
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', padding: '12px 16px', textAlign: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>
            Stages
          </div>
          <table>
            <thead>
              <tr>
                <th>Deal Stage</th>
                <th>Lead Count ↕</th>
                <th>Amt(L) ↕</th>
                <th>%age ↕</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={4}><div style={{ height: 14, background: 'var(--border)', borderRadius: 4, margin: '8px 0', animation: 'pulse 1.5s infinite' }} /></td></tr>
                ))
              ) : pipeline.stages.map((s, i) => (
                <tr key={i}>
                  <td>
                    <span style={{ color: s.label === 'Won' ? 'var(--success)' : s.label === 'Lost' ? 'var(--danger)' : ['MQL-Mixing Qualified','SQL-Sales Qualified'].includes(s.label) ? 'var(--primary-light)' : 'var(--text-primary)', fontWeight: s.label === 'Won' ? 700 : 400 }}>
                      {s.label}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>{s.count || 0}</td>
                  <td style={{ textAlign: 'center' }}>{s.amount ? (s.amount / 100000).toFixed(1) : '0.0'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div className="progress" style={{ flex: 1, height: 4 }}>
                        <div className="progress-bar" style={{ width: `${s.pct || 0}%`, background: FUNNEL_COLORS[s.label] || 'var(--primary)' }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 28 }}>{s.pct || 0}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Status Table */}
        <div className="table-container">
          <div style={{ background: 'linear-gradient(135deg, var(--accent), #a29bfe)', padding: '12px 16px', textAlign: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>
            Status
          </div>
          <table>
            <thead>
              <tr>
                <th>Deal Status</th>
                <th>Lead count ↕</th>
                <th>Amt(L) ↕</th>
                <th>%age ↕</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={4}><div style={{ height: 14, background: 'var(--border)', borderRadius: 4, margin: '8px 0', animation: 'pulse 1.5s infinite' }} /></td></tr>
                ))
              ) : pipeline.statuses.map((s, i) => (
                <tr key={i}>
                  <td>
                    <span style={{
                      color: s.label === 'Won' ? 'var(--success)' : s.label === 'Lost' ? 'var(--danger)' : s.label === 'Assigned' ? 'var(--accent)' : s.label === 'In Progress' ? 'var(--primary-light)' : s.label === 'Call-later' ? 'var(--warning)' : 'var(--text-primary)',
                      fontWeight: ['Won', 'Lost'].includes(s.label) ? 700 : 400,
                    }}>
                      {s.label}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>{s.count || 0}</td>
                  <td style={{ textAlign: 'center' }}>{s.amount ? (s.amount / 100000).toFixed(1) : '0.0'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div className="progress" style={{ flex: 1, height: 4 }}>
                        <div className="progress-bar" style={{ width: `${s.pct || 0}%` }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 28 }}>{s.pct || 0}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
