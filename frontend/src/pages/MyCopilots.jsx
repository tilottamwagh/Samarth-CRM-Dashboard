import { useState } from 'react';
import { 
  Bot, ShieldCheck, Zap, MessageCircle, 
  Settings, Play, Pause, Plus, RefreshCw,
  Cpu, Trash2, Edit2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyCopilots() {
  const [copilots, setCopilots] = useState([
    { id: 1, name: 'Sales Assistant AI', type: 'Sales Helper', status: 'Running', queries: '1,240', lastRun: '2 mins ago', icon: <Bot size={24} /> },
    { id: 2, name: 'Support Copilot', type: 'Customer Support', status: 'Running', queries: '850', lastRun: '15 mins ago', icon: <Cpu size={24} /> },
    { id: 3, name: 'Lead Qualifier Bot', type: 'Lead Generation', status: 'Paused', queries: '3.1k', lastRun: '1 day ago', icon: <Zap size={24} /> },
  ]);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Copilots HUB</h1>
          <p>Manage your AI agents and their real-time WhatsApp conversion performance</p>
        </div>
        <button className="btn btn-primary"><Plus size={15} /> Create New Copilot</button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 25 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(9,132,227,0.1)', color: '#0984e3' }}><MessageCircle size={20} /></div>
          <div className="stat-value">5.2k</div>
          <div className="stat-label">AI Handled Conversations</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(38,214,161,0.1)', color: '#26d6a1' }}><ShieldCheck size={20} /></div>
          <div className="stat-value">98.2%</div>
          <div className="stat-label">Response Accuracy</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(108,92,231,0.1)', color: '#6c5ce7' }}><Zap size={20} /></div>
          <div className="stat-value">1.4s</div>
          <div className="stat-label">Avg. Response Time</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(253,203,110,0.1)', color: '#f1c40f' }}><RefreshCw size={20} /></div>
          <div className="stat-value">24%</div>
          <div className="stat-label">Human Takeover Rate</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
        {copilots.map(c => (
          <div key={c.id} className="card copilot-card" style={{ transition: 'all 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(108,92,231,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {c.icon}
              </div>
              <div style={{ display: 'flex', gap: 5 }}>
                <button className="btn btn-ghost btn-icon btn-sm"><Edit2 size={14} /></button>
                <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
              </div>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 5 }}>{c.name}</h3>
            <div className="badge badge-purple" style={{ marginBottom: 15 }}>{c.type}</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <span style={{ color: c.status === 'Running' ? 'var(--success)' : 'var(--danger)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {c.status === 'Running' ? <Play size={10} fill="currentColor" /> : <Pause size={10} fill="currentColor" />} {c.status}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Queries Handled:</span>
                <span style={{ fontWeight: 700 }}>{c.queries}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Last Activity:</span>
                <span style={{ color: 'var(--text-secondary)' }}>{c.lastRun}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, background: c.status === 'Running' ? '#f53b57' : '#26d6a1', borderColor: c.status === 'Running' ? '#f53b57' : '#26d6a1', color: 'white' }}
                onClick={() => toast.success(`${c.name} status updated!`)}
              >
                {c.status === 'Running' ? <Pause size={14} /> : <Play size={14} />} {c.status === 'Running' ? 'Pause Bot' : 'Resume Bot'}
              </button>
              <button className="btn btn-secondary" title="Settings"><Settings size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
