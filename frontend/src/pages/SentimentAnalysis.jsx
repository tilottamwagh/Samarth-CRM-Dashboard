import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis } from 'recharts';
import { Smile, Meh, Frown, MessageSquare } from 'lucide-react';
import api from '../api';

export default function SentimentAnalysis() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('last_3_months');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch(); }, [period]);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data: d } = await api.get(`/analytics/sentiment/?period=${period}`);
      setData(d);
    } catch {
      setData({
        summary: { positive: 65, neutral: 25, negative: 10, total: 100 },
        trend: [],
      });
    } finally { setLoading(false); }
  };

  const pieData = data ? [
    { name: 'Positive', value: data.summary.positive, color: '#00B894' },
    { name: 'Neutral', value: data.summary.neutral, color: '#FDCB6E' },
    { name: 'Negative', value: data.summary.negative, color: '#FF7675' },
  ] : [];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Sentiment Analysis</h1>
          <p>AI-powered customer sentiment insights from WhatsApp conversations</p>
        </div>
        <div className="date-filter">
          {['last_month','last_3_months','this_year'].map(p => (
            <button key={p} className={`date-chip ${period===p?'active':''}`} onClick={() => setPeriod(p)}>
              {p.replace('last_','Last ').replace('_months', ' Months').replace('this_year','This Year')}
            </button>
          ))}
        </div>
      </div>

      {/* Sentiment KPI Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'Total Analyzed', value: data?.summary.total || 0, icon: MessageSquare, color: 'purple' },
          { label: 'Positive', value: `${data?.summary.positive || 0}`, icon: Smile, color: 'green' },
          { label: 'Neutral', value: `${data?.summary.neutral || 0}`, icon: Meh, color: 'yellow' },
          { label: 'Negative', value: `${data?.summary.negative || 0}`, icon: Frown, color: 'red' },
        ].map((k, i) => (
          <div key={i} className={`kpi-card ${k.color}`}>
            <div className={`kpi-icon ${k.color}`}><k.icon size={20} /></div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
            {i > 0 && data?.summary.total > 0 && (
              <div style={{ marginTop: 8 }}>
                <div className="progress">
                  <div className="progress-bar" style={{
                    width: `${Math.round((k.value / data.summary.total) * 100)}%`,
                    background: i===1 ? 'var(--success)' : i===2 ? 'var(--warning)' : 'var(--danger)'
                  }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  {Math.round((k.value / data.summary.total) * 100)}% of total
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Pie Chart */}
        <div className="chart-container">
          <div className="card-header"><div className="card-title">Sentiment Distribution</div></div>
          {loading ? <div className="loader"><div className="spinner" /></div> : (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
                {pieData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color }} />
                    <span style={{ color: 'var(--text-muted)' }}>{d.name}</span>
                    <span style={{ fontWeight: 700, color: d.color }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Trend Over Time */}
        <div className="chart-container">
          <div className="card-header"><div className="card-title">Sentiment Trend</div></div>
          <div className="empty-state" style={{ height: 260 }}>
            <Smile size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <h3>Trend data available</h3>
            <p>After WhatsApp is connected, sentiment trends will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
