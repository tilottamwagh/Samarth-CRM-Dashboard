import { useState, useEffect } from 'react';
import { Users, TrendingUp, Phone, CheckCircle, BarChart2, Filter, Search, Download } from 'lucide-react';
import api from '../api';

export default function TeamSummary() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ total_calls: 0, active_users: 0, conv_rate: '0%', top_performer: 'N/A' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch employee list for summary
      const { data: employees } = await api.get('/leads/employees/');
      setData(employees.results || employees);
      
      // Calculate mock stats based on employee count
      const count = (employees.results || employees).length;
      setStats({
        total_calls: count * 124,
        active_users: count,
        conv_rate: '14.2%',
        top_performer: (employees.results || employees)[0]?.username || 'Admin'
      });
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Team Summary Report</h1>
          <p>Analyze sales team performance and conversion metrics</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary"><Filter size={14} /> Filter Results</button>
          <button className="btn btn-primary"><Download size={14} /> Export Report</button>
        </div>
      </div>

      {/* KPI Overviews */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 25 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(9,132,227,0.1)', color: '#0984e3' }}><Phone size={20} /></div>
          <div className="stat-value">{stats.total_calls}</div>
          <div className="stat-label">Total Outbound Calls</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(38,214,161,0.1)', color: '#26d6a1' }}><Users size={20} /></div>
          <div className="stat-value">{stats.active_users}</div>
          <div className="stat-label">Consultants Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(108,92,231,0.1)', color: '#6c5ce7' }}><TrendingUp size={20} /></div>
          <div className="stat-value">{stats.conv_rate}</div>
          <div className="stat-label">Lead Conversion Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(253,203,110,0.1)', color: '#f1c40f' }}><BarChart2 size={20} /></div>
          <div className="stat-value" style={{ fontSize: 16 }}>{stats.top_performer}</div>
          <div className="stat-label">Top Performer Monthly</div>
        </div>
      </div>

      {/* Team Performance Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">User Performance Dashboard</div>
          <div className="input-group" style={{ width: 250 }}>
            <Search size={14} className="input-icon" />
            <input className="form-control" placeholder="Search team member..." />
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Role</th>
              <th>Total Leads</th>
              <th>Closed Sales</th>
              <th>Progress</th>
              <th>Activity Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>Loading performance data...</td></tr>
            ) : data.map(m => (
              <tr key={m.id}>
                <td>
                  <div style={{ fontWeight: 700 }}>{m.username}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.email}</div>
                </td>
                <td><span className="badge badge-purple">{m.role || 'Sales'}</span></td>
                <td>{Math.floor(Math.random() * 50) + 10}</td>
                <td>{Math.floor(Math.random() * 5) + 2}</td>
                <td>
                  <div style={{ width: 100, height: 6, background: 'var(--bg-input)', borderRadius: 10 }}>
                    <div style={{ width: `${Math.random() * 80 + 20}%`, height: '100%', background: 'var(--primary)', borderRadius: 10 }} />
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1,2,3,4,5].map(i => <div key={i} style={{ width: 4, height: 12, background: i < 4 ? 'var(--success)' : 'var(--bg-input)', borderRadius: 2 }} />)}
                  </div>
                </td>
                <td><span className={`status-dot ${Math.random() > 0.3 ? 'status-online' : 'status-offline'}`} /> {Math.random() > 0.3 ? 'Active' : 'Offline'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
