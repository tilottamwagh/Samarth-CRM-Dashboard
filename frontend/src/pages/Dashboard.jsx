import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, TrendingUp, MessageSquare, Calendar, ArrowUpRight, ArrowDownRight, Plus, ExternalLink } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const COLORS = ['#6C5CE7', '#00CEC9', '#FD79A8', '#FDCB6E'];

const mockTrend = [
  { day: 'Mon', leads: 12, conversations: 8 },
  { day: 'Tue', leads: 19, conversations: 14 },
  { day: 'Wed', leads: 8, conversations: 6 },
  { day: 'Thu', leads: 24, conversations: 18 },
  { day: 'Fri', leads: 31, conversations: 22 },
  { day: 'Sat', leads: 15, conversations: 11 },
  { day: 'Sun', leads: 9, conversations: 7 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [period, setPeriod] = useState('last_3_months');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [metricsRes, apptRes] = await Promise.all([
        api.get(`/analytics/dashboard/?period=${period}`),
        api.get('/analytics/appointments/'),
      ]);
      setMetrics(metricsRes.data);
      setAppointments(apptRes.data);
    } catch (err) {
      // Use mock data if backend not connected
      setMetrics({
        total_leads: 0, total_deal_value: 0,
        ai_conversations: 0, interaction_pct: 0,
        appointment_pct: 0, leads_change: 0, queries_left: 100,
      });
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      label: 'Total Customers',
      value: metrics?.total_leads ?? 0,
      icon: Users, color: 'purple',
      change: metrics?.leads_change ?? 0,
      suffix: '',
    },
    {
      label: 'Total Deal Value',
      value: `₹${((metrics?.total_deal_value ?? 0) / 100000).toFixed(1)}L`,
      icon: TrendingUp, color: 'green',
      change: 0, suffix: '',
    },
    {
      label: 'AI Conversations',
      value: metrics?.ai_conversations ?? 0,
      icon: MessageSquare, color: 'teal',
      change: 0, suffix: '',
    },
    {
      label: 'Interaction %',
      value: `${metrics?.interaction_pct ?? 0}%`,
      icon: TrendingUp, color: 'yellow',
      change: 0, suffix: 'this month',
    },
    {
      label: 'Appointments',
      value: `${metrics?.appointment_pct ?? 0}%`,
      icon: Calendar, color: 'blue',
      change: 0, suffix: 'this month',
    },
  ];

  const stageData = [
    { name: 'New', value: 35 },
    { name: 'MQL', value: 25 },
    { name: 'SQL', value: 20 },
    { name: 'Won', value: 20 },
  ];

  return (
    <div>
      {/* Period Filter */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Welcome back,</h1>
          <p>Track your copilot activity here.</p>
        </div>
        <div className="page-header-actions">
          <div className="date-filter">
            {['last_month', 'last_3_months', 'last_6_months', 'this_year'].map(p => (
              <button
                key={p}
                className={`date-chip ${period === p ? 'active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p === 'last_month' ? 'Last Month' :
                  p === 'last_3_months' ? 'Last 3 Months' :
                    p === 'last_6_months' ? 'Last 6 Months' : 'This Year'}
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/leads/create')}>
            <Plus size={14} /> New Lead
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpiCards.map((kpi, i) => (
          <div key={i} className={`kpi-card ${kpi.color}`}>
            <div className={`kpi-icon ${kpi.color}`}>
              <kpi.icon size={20} />
            </div>
            <div className="kpi-label">{kpi.label}</div>
            {loading ? (
              <div style={{ height: 32, width: 80, background: 'var(--border)', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
            ) : (
              <div className="kpi-value">{kpi.value}</div>
            )}
            <div className={`kpi-change ${kpi.change > 0 ? 'up' : kpi.change < 0 ? 'down' : ''}`}>
              {kpi.change !== 0 && (kpi.change > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />)}
              {kpi.change !== 0 ? `${Math.abs(kpi.change)}%` : kpi.suffix || 'No change'}
              {kpi.suffix && kpi.change !== 0 && ' · ' + kpi.suffix}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Lead Trend Chart */}
        <div className="chart-container">
          <div className="card-header">
            <div className="card-title">Weekly Lead Activity</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/reports/sales')}>
              View All <ExternalLink size={12} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockTrend}>
              <defs>
                <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C5CE7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6C5CE7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00CEC9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00CEC9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Area type="monotone" dataKey="leads" name="Leads" stroke="#6C5CE7" fill="url(#leadGrad)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="conversations" name="Conversations" stroke="#00CEC9" fill="url(#convGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
              <div style={{ width: 10, height: 2, borderRadius: 1, background: '#6C5CE7' }} /> Leads
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
              <div style={{ width: 10, height: 2, borderRadius: 1, background: '#00CEC9' }} /> Conversations
            </div>
          </div>
        </div>

        {/* Pipeline Donut */}
        <div className="chart-container">
          <div className="card-header">
            <div className="card-title">Pipeline Stages</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/reports/pipeline')}>
              View All <ExternalLink size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={stageData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {stageData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {stageData.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i], flexShrink: 0 }} />
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{s.name}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="table-container">
        <div className="table-toolbar">
          <div className="card-title">Recent Appointments</div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
            <div className="search-bar">
              <input placeholder="Search appointments..." />
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/leads')}>
              <ExternalLink size={13} /> View All Leads
            </button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Mobile</th>
              <th>Product</th>
              <th>Location</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state" style={{ padding: '40px 20px' }}>
                    <div className="empty-state-icon">📅</div>
                    <h3>No appointments yet</h3>
                    <p>Create leads and set appointments to see them here.</p>
                  </div>
                </td>
              </tr>
            ) : (
              appointments.map((a, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{a.lead_name}</div>
                  </td>
                  <td>{a.mobile}</td>
                  <td>{a.product}</td>
                  <td>{a.location || '—'}</td>
                  <td>{a.date}</td>
                  <td>
                    <span className={`badge ${a.status === 'completed' ? 'badge-green' : a.status === 'cancelled' ? 'badge-red' : 'badge-yellow'}`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
