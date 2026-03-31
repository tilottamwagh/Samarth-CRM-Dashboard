import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Send, CheckCheck, Eye, TrendingUp, RefreshCw, Download, Filter, Calendar } from 'lucide-react';
import api from '../api';

export default function CampaignReport() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from_date: '', to_date: '' });
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchCampaigns(); }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)));
      const { data } = await api.get(`/marketing/campaigns/?${params}`);
      setCampaigns(data.results || data);
    } catch { setCampaigns([]); }
    finally { setLoading(false); }
  };

  const totalSent = campaigns.reduce((a, c) => a + (c.sent_count || 0), 0);
  const totalDelivered = campaigns.reduce((a, c) => a + (c.delivered_count || 0), 0);
  const totalRead = campaigns.reduce((a, c) => a + (c.read_count || 0), 0);
  const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;
  const readRate = totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 100) : 0;

  const chartData = campaigns.slice(0, 8).map(c => ({
    name: c.name?.slice(0, 12) + (c.name?.length > 12 ? '…' : ''),
    Sent: c.sent_count || 0,
    Delivered: c.delivered_count || 0,
    Read: c.read_count || 0,
  }));

  const statusBadge = { draft: 'badge-gray', running: 'badge-yellow', completed: 'badge-green', failed: 'badge-red', scheduled: 'badge-blue' };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Campaign Report</h1>
          <p>Track WhatsApp campaign delivery and engagement</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={fetchCampaigns}><RefreshCw size={14} /> Refresh</button>
          <button className="btn btn-secondary btn-sm"><Download size={14} /> Export</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 24 }}>
        {[
          { label: 'Total Campaigns', value: campaigns.length, icon: TrendingUp, color: 'purple', sub: 'all time' },
          { label: 'Total Sent', value: totalSent, icon: Send, color: 'blue', sub: 'messages sent' },
          { label: 'Delivered', value: totalDelivered, icon: CheckCheck, color: 'green', sub: `${deliveryRate}% rate` },
          { label: 'Read', value: totalRead, icon: Eye, color: 'teal', sub: `${readRate}% of delivered` },
          { label: 'Failed', value: campaigns.reduce((a, c) => a + (c.failed_count || 0), 0), icon: TrendingUp, color: 'red', sub: 'not delivered' },
        ].map((k, i) => (
          <div key={i} className={`kpi-card ${k.color}`}>
            <div className={`kpi-icon ${k.color}`}><k.icon size={20} /></div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value.toLocaleString()}</div>
            <div className="kpi-change">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label"><Calendar size={11} style={{ marginRight: 4 }} />From Date</label>
            <input className="form-control" type="date" value={filters.from_date} onChange={e => setFilters(f => ({ ...f, from_date: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label"><Calendar size={11} style={{ marginRight: 4 }} />To Date</label>
            <input className="form-control" type="date" value={filters.to_date} onChange={e => setFilters(f => ({ ...f, to_date: e.target.value }))} />
          </div>
          <button className="btn btn-primary btn-sm" onClick={fetchCampaigns}><Filter size={13} /> Apply</button>
          <button className="btn btn-secondary btn-sm" onClick={() => { setFilters({ from_date: '', to_date: '' }); fetchCampaigns(); }}>Clear</button>
        </div>
      </div>

      {/* Bar Chart */}
      {chartData.length > 0 && (
        <div className="chart-container" style={{ marginBottom: 24 }}>
          <div className="card-header"><div className="card-title">Campaign Performance</div></div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barSize={20} barGap={4}>
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="Sent" fill="#74B9FF" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Delivered" fill="#00B894" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Read" fill="#6C5CE7" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 8 }}>
            {[['Sent', '#74B9FF'], ['Delivered', '#00B894'], ['Read', '#6C5CE7']].map(([l, c]) => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: 'inline-block' }} />{l}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Campaign Table */}
      <div className="table-container">
        <div className="table-toolbar">
          <div className="card-title">All Campaigns</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Campaign Name</th>
              <th>Template</th>
              <th>Scheduled</th>
              <th>Sent</th>
              <th>Delivered</th>
              <th>Read</th>
              <th>Failed</th>
              <th>Delivery %</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <tr key={i}>{Array(9).fill(0).map((_, j) => <td key={j}><div style={{ height: 14, background: 'var(--border)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} /></td>)}</tr>
              ))
            ) : campaigns.length === 0 ? (
              <tr><td colSpan={9}>
                <div className="empty-state">
                  <div className="empty-state-icon">📊</div>
                  <h3>No campaigns yet</h3>
                  <p>Create your first campaign using Initiate Connect.</p>
                  <a href="/marketing/campaigns" className="btn btn-primary btn-sm" style={{ marginTop: 16, textDecoration: 'none' }}>Launch Campaign</a>
                </div>
              </td></tr>
            ) : campaigns.map(c => {
              const dRate = c.sent_count > 0 ? Math.round((c.delivered_count || 0) / c.sent_count * 100) : 0;
              return (
                <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(c)}>
                  <td style={{ fontWeight: 700 }}>{c.name}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.template_name || '—'}</td>
                  <td style={{ fontSize: 12 }}>{c.scheduled_at ? new Date(c.scheduled_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Immediate'}</td>
                  <td><span style={{ fontWeight: 700, color: 'var(--info)' }}>{c.sent_count || 0}</span></td>
                  <td><span style={{ fontWeight: 700, color: 'var(--success)' }}>{c.delivered_count || 0}</span></td>
                  <td><span style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{c.read_count || 0}</span></td>
                  <td><span style={{ fontWeight: 700, color: 'var(--danger)' }}>{c.failed_count || 0}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div className="progress" style={{ width: 60 }}>
                        <div className="progress-bar" style={{ width: `${dRate}%` }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{dRate}%</span>
                    </div>
                  </td>
                  <td><span className={`badge ${statusBadge[c.status] || 'badge-gray'}`}>{c.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">📊 {selected.name}</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {[
                  ['Total Recipients', selected.total_recipients || 0],
                  ['Sent', selected.sent_count || 0],
                  ['Delivered', selected.delivered_count || 0],
                  ['Read', selected.read_count || 0],
                  ['Failed', selected.failed_count || 0],
                  ['Template', selected.template_name || '—'],
                ].map(([k, v]) => (
                  <div key={k} style={{ padding: '12px 14px', background: 'var(--bg-input)', borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{k}</div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
