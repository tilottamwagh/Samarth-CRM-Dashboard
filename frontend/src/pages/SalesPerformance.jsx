import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, MessageSquare, Target, Calendar, Phone, Zap, Filter } from 'lucide-react';
import api from '../api';

export default function SalesPerformance() {
  const [metrics, setMetrics] = useState(null);
  const [ownerData, setOwnerData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({ owner: '', from_date: '', to_date: '' });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('basic');

  useEffect(() => {
    api.get('/auth/employees/').then(({ data }) => setEmployees(data.results || data)).catch(() => {});
    fetchMetrics();
  }, []);

  useEffect(() => { fetchMetrics(); }, [filters]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const { data } = await api.get(`/analytics/sales-performance/?${params}`);
      setMetrics(data.summary || data);
      setOwnerData(data.by_owner || []);
    } catch {
      setMetrics({ total_customers: 0, total_conversations: 0, conversion_ratio: 0, appointments: 0, contacted: 0, ai_resp_time: '—' });
      setOwnerData([]);
    } finally { setLoading(false); }
  };

  const COLORS = ['#6C5CE7', '#00CEC9', '#00B894', '#FDCB6E', '#FF7675', '#74B9FF', '#FD79A8'];

  const kpis = [
    { label: 'Total Customers', value: metrics?.total_customers || 0, icon: Users, color: 'purple', sub: 'leads this period' },
    { label: 'Total Conversations', value: metrics?.total_conversations || 0, icon: MessageSquare, color: 'teal', sub: 'AI + manual' },
    { label: 'Conversion Ratio', value: `${metrics?.conversion_ratio || 0}x`, icon: Target, color: 'green', sub: '>3 is excellent' },
    { label: 'Appointments', value: metrics?.appointments || 0, icon: Calendar, color: 'yellow', sub: 'scheduled' },
    { label: 'Contact Rate', value: `${metrics?.contact_rate || 0}%`, icon: Phone, color: 'blue', sub: 'leads contacted' },
    { label: 'AI Resp. Time', value: metrics?.ai_resp_time || '< 1 min', icon: Zap, color: 'purple', sub: 'avg response' },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Sales Performance</h1>
          <p>Track individual and team sales metrics</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <div className={`tab ${tab === 'basic' ? 'active' : ''}`} onClick={() => setTab('basic')}>Basic Report</div>
        <div className={`tab ${tab === 'advanced' ? 'active' : ''}`} onClick={() => setTab('advanced')}>Advanced / Team Summary</div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 180 }}>
            <label className="form-label">Owner</label>
            <select className="form-control" value={filters.owner} onChange={e => setFilters(f => ({ ...f, owner: e.target.value }))}>
              <option value="">All Owners</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
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
          <button className="btn btn-primary btn-sm" onClick={fetchMetrics} style={{ marginBottom: 0 }}>
            <Filter size={13} /> Apply
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ owner: '', from_date: '', to_date: '' })} style={{ marginBottom: 0 }}>
            Clear
          </button>
        </div>
      </div>

      {/* BASIC TAB */}
      {tab === 'basic' && (
        <>
          {/* KPI Cards */}
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
            {kpis.map((k, i) => (
              <div key={i} className={`kpi-card ${k.color}`}>
                <div className={`kpi-icon ${k.color}`}><k.icon size={20} /></div>
                <div className="kpi-label">{k.label}</div>
                {loading ? <div style={{ height: 30, width: 80, background: 'var(--border)', borderRadius: 6, marginTop: 8, animation: 'pulse 1.5s infinite' }} /> : (
                  <div className="kpi-value">{k.value}</div>
                )}
                <div className="kpi-change">{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Owner Performance Chart */}
          <div className="chart-container" style={{ marginBottom: 24 }}>
            <div className="card-header"><div className="card-title">Performance by Owner</div></div>
            {ownerData.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <div className="empty-state-icon">📊</div>
                <h3>No data available</h3>
                <p>Add leads and assign owners to see performance metrics.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ownerData} barSize={36}>
                  <XAxis dataKey="owner_name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="total_leads" name="Total Leads" radius={[4, 4, 0, 0]}>
                    {ownerData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Performance Table */}
          <div className="table-container">
            <div className="table-toolbar"><div className="card-title">Owner-wise Breakdown</div></div>
            <table>
              <thead>
                <tr>
                  <th>Owner</th>
                  <th>Total Leads</th>
                  <th>Contacted</th>
                  <th>Appointments</th>
                  <th>Won</th>
                  <th>Lost</th>
                  <th>Conversion %</th>
                  <th>Deal Value</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8}><div className="loader"><div className="spinner" /></div></td></tr>
                ) : ownerData.length === 0 ? (
                  <tr><td colSpan={8}>
                    <div className="empty-state" style={{ padding: '30px 0' }}>
                      <div className="empty-state-icon">👥</div>
                      <h3>No performance data yet</h3>
                    </div>
                  </td></tr>
                ) : ownerData.map((o, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{o.owner_name?.[0]}</div>
                        <span style={{ fontWeight: 600 }}>{o.owner_name}</span>
                      </div>
                    </td>
                    <td>{o.total_leads || 0}</td>
                    <td>{o.contacted || 0}</td>
                    <td>{o.appointments || 0}</td>
                    <td><span style={{ color: 'var(--success)', fontWeight: 700 }}>{o.won || 0}</span></td>
                    <td><span style={{ color: 'var(--danger)', fontWeight: 700 }}>{o.lost || 0}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress" style={{ width: 60 }}>
                          <div className="progress-bar" style={{ width: `${o.conversion_pct || 0}%` }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{o.conversion_pct || 0}%</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                      {o.deal_value > 0 ? `₹${(o.deal_value / 100000).toFixed(1)}L` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ADVANCED/TEAM SUMMARY TAB */}
      {tab === 'advanced' && (
        <div className="table-container">
          <div className="table-toolbar">
            <div className="card-title">Team Summary — Stage Breakdown</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Owner</th>
                <th>New</th>
                <th>MQL</th>
                <th>SQL</th>
                <th>Proposal</th>
                <th>Won ✓</th>
                <th>Lost ✗</th>
                <th>Call Later</th>
                <th>Total</th>
                <th>Deal Value</th>
                <th>Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11}><div className="loader"><div className="spinner" /></div></td></tr>
              ) : ownerData.length === 0 ? (
                <tr><td colSpan={11}>
                  <div className="empty-state" style={{ padding: '30px 0' }}>
                    <div className="empty-state-icon">📋</div>
                    <h3>No team data yet</h3>
                    <p>Assign leads to team members to see their breakdown here.</p>
                  </div>
                </td></tr>
              ) : ownerData.map((o, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{o.owner_name?.[0]}</div>
                      <span style={{ fontWeight: 600 }}>{o.owner_name}</span>
                    </div>
                  </td>
                  <td>{o.new || 0}</td>
                  <td>{o.mql || 0}</td>
                  <td>{o.sql || 0}</td>
                  <td>{o.proposal || 0}</td>
                  <td><span style={{ color: 'var(--success)', fontWeight: 700 }}>{o.won || 0}</span></td>
                  <td><span style={{ color: 'var(--danger)', fontWeight: 700 }}>{o.lost || 0}</span></td>
                  <td><span style={{ color: 'var(--warning)', fontWeight: 700 }}>{o.call_later || 0}</span></td>
                  <td style={{ fontWeight: 700 }}>{o.total_leads || 0}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                    {o.deal_value > 0 ? `₹${(o.deal_value / 100000).toFixed(1)}L` : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div className="progress" style={{ width: 50 }}>
                        <div className="progress-bar" style={{ width: `${o.win_rate || 0}%`, background: 'var(--success)' }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)' }}>{o.win_rate || 0}%</span>
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
