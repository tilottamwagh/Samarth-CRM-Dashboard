import { useState, useEffect } from 'react';
import { CreditCard, Zap, CheckCircle, ArrowUpRight } from 'lucide-react';
import api from '../api';

const plans = [
  { slug: 'starter', name: 'Starter', price: 499, features: ['3 Users', '1 WhatsApp Number', '100 AI Queries/mo', '500 Leads', 'Basic Analytics'], popular: false },
  { slug: 'pro', name: 'Pro', price: 999, features: ['10 Users', '2 WhatsApp Numbers', '500 AI Queries/mo', 'Unlimited Leads', 'Advanced Analytics', 'Bulk Campaigns', 'Priority Support'], popular: true },
  { slug: 'enterprise', name: 'Enterprise', price: 2499, features: ['Unlimited Users', '5 WhatsApp Numbers', 'Unlimited AI Queries', 'Unlimited Leads', 'Custom Reports', 'Dedicated Support', 'API Access', 'White Label'], popular: false },
];

export default function Billing() {
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBilling(); }, []);

  const fetchBilling = async () => {
    setLoading(true);
    try {
      const [sub, hist] = await Promise.all([
        api.get('/billing/subscription/'),
        api.get('/billing/history/'),
      ]);
      setSubscription(sub.data);
      setPayments(hist.data);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Billing</h1>
          <p>Manage your subscription and payment history</p>
        </div>
      </div>

      <div className="tabs">
        {['overview','plans','history'].map(t => (
          <div key={t} className={`tab ${tab===t?'active':''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          {/* Current Plan */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Current Plan</div>
              <span className="badge badge-green"><CheckCircle size={10} /> Active</span>
            </div>
            {loading ? <div className="loader"><div className="spinner" /></div> : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <div className="kpi-icon purple"><CreditCard size={24} /></div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>{subscription?.plan || 'STD-CRM'}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>₹499/month</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div className="kpi-label">Queries Used</div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{subscription?.ai_queries_used || 0}</div>
                    <div className="progress" style={{ marginTop: 6 }}>
                      <div className="progress-bar" style={{ width: `${Math.min(((subscription?.ai_queries_used||0) / Math.max(subscription?.max_queries||100, 1))*100, 100)}%` }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="kpi-label">Queries Left</div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--success)' }}>{subscription?.queries_left || 100}</div>
                  </div>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setTab('plans')}>
                  <ArrowUpRight size={14} /> Upgrade Plan
                </button>
              </>
            )}
          </div>

          {/* Quick Stats */}
          <div className="card">
            <div className="card-header"><div className="card-title">Plan Features</div></div>
            {plans.find(p => p.slug === subscription?.plan_slug || p.slug === 'starter')?.features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                <CheckCircle size={14} color="var(--success)" />
                <span style={{ fontSize: 13 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plans Tab */}
      {tab === 'plans' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {plans.map(plan => (
            <div key={plan.slug} className="card" style={{
              position: 'relative', overflow: 'hidden',
              border: plan.popular ? '2px solid var(--primary)' : '1px solid var(--border)',
              boxShadow: plan.popular ? 'var(--shadow-glow)' : 'none',
            }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--primary)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>
                  POPULAR
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
                  <span style={{ fontSize: 30, fontWeight: 800, color: plan.popular ? 'var(--primary-light)' : 'var(--text-primary)' }}>₹{plan.price}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>/month</span>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 12.5 }}>
                    <CheckCircle size={13} color="var(--success)" />
                    {f}
                  </div>
                ))}
              </div>
              <button className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'}`} style={{ width: '100%', justifyContent: 'center' }}>
                {plan.slug === 'enterprise' ? 'Contact Sales' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Payment ID</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan={5}>
                  <div className="empty-state"><div className="empty-state-icon">💳</div><h3>No payment history</h3></div>
                </td></tr>
              ) : (
                payments.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.razorpay_payment_id}</td>
                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>₹{p.amount}</td>
                    <td>{p.method || '—'}</td>
                    <td><span className={`badge ${p.status==='captured'?'badge-green':'badge-red'}`}>{p.status}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
