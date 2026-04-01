import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Zap, Mail, Lock, Building, Briefcase, Phone, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    company_name: '', industry: '', first_name: '', last_name: '', 
    email: '', mobile: '', password: '' 
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate('/'); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Your workspace is ready!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || Object.values(err.response?.data || {}).flat().join(', ') || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="bg-shapes">
          <div className="bg-shape" style={{ width: 400, height: 400, top: '10%', left: '5%', opacity: 0.4 }} />
          <div className="bg-shape" style={{ width: 200, height: 200, bottom: '15%', right: '10%', opacity: 0.3 }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20, margin: '0 auto 24px',
            background: 'linear-gradient(135deg, #6C5CE7, #00CEC9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 800, boxShadow: '0 8px 32px rgba(108,92,231,0.4)'
          }}>S</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, background: 'linear-gradient(135deg, #fff, #a29bfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Join Samarth CRM
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, maxWidth: 320, margin: '0 auto 40px' }}>
            Set up your organization's workspace in seconds.
          </p>

          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: '🚀', label: 'Instant Setup' },
              { icon: '🔒', label: 'Isolated Data' },
              { icon: '👥', label: 'Unlimited Team' },
            ].map((f, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: '14px 20px',
                backdropFilter: 'blur(10px)', minWidth: 100,
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{f.icon}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right" style={{ overflowY: 'auto', padding: '40px 0' }}>
        <div className="auth-form" style={{ marginTop: 'auto', marginBottom: 'auto' }}>
          <h2 className="auth-headline" style={{ fontSize: 24 }}>Create your workspace</h2>
          <p className="auth-sub">Enter your details to get started.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-row" style={{ display: 'flex', gap: 12 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">First Name</label>
                <div className="input-group">
                  <UserIcon size={15} className="input-icon" />
                  <input className="form-control" placeholder="John" value={form.first_name} onChange={e => set('first_name', e.target.value)} required />
                </div>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Last Name</label>
                <input className="form-control" style={{ paddingLeft: 12 }} placeholder="Doe" value={form.last_name} onChange={e => set('last_name', e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Company Name</label>
              <div className="input-group">
                <Building size={15} className="input-icon" />
                <input className="form-control" placeholder="Acme Corp" value={form.company_name} onChange={e => set('company_name', e.target.value)} required />
              </div>
            </div>

            <div className="form-row" style={{ display: 'flex', gap: 12 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Mobile</label>
                <div className="input-group">
                  <Phone size={15} className="input-icon" />
                  <input className="form-control" placeholder="Mobile" value={form.mobile} onChange={e => set('mobile', e.target.value)} required />
                </div>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Industry</label>
                <div className="input-group">
                  <Briefcase size={15} className="input-icon" />
                  <input className="form-control" placeholder="E.g. Real Estate" value={form.industry} onChange={e => set('industry', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Work Email</label>
              <div className="input-group">
                <Mail size={15} className="input-icon" />
                <input className="form-control" type="email" placeholder="you@company.com" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-group" style={{ position: 'relative' }}>
                <Lock size={15} className="input-icon" />
                <input className="form-control" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} style={{ paddingRight: 40 }} required />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} disabled={loading}>
              {loading ? (
                <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating Workspace...</>
              ) : (
                <><Zap size={16} /> Get Started Free</>
              )}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: 24 }}>
            Already have an account? <Link to="/login">Sign in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
