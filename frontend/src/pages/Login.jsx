import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Zap, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate('/'); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password, form.rememberMe);
      
      // Festive Confetti Burst (Blue, Pink, Yellow squares)
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999, shapes: ['square'], colors: ['#60a5fa', '#f472b6', '#fbbf24'] };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="bg-shapes">
          <div className="bg-shape" style={{ width: 400, height: 400, top: '10%', left: '5%', opacity: 0.4 }} />
          <div className="bg-shape" style={{ width: 200, height: 200, bottom: '15%', right: '10%', opacity: 0.3 }} />
          <div className="bg-shape" style={{ width: 150, height: 150, top: '60%', left: '20%', opacity: 0.2 }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20, margin: '0 auto 24px',
            background: 'linear-gradient(135deg, #6C5CE7, #00CEC9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 800, boxShadow: '0 8px 32px rgba(108,92,231,0.4)'
          }}>S</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, background: 'linear-gradient(135deg, #fff, #a29bfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Samarth CRM
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, maxWidth: 320, margin: '0 auto 40px' }}>
            WhatsApp-first AI CRM for modern businesses. Automate, engage, and grow.
          </p>

          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: '🤖', label: 'AI Copilot' },
              { icon: '📱', label: 'WhatsApp API' },
              { icon: '📊', label: 'Analytics' },
              { icon: '🎯', label: 'Lead CRM' },
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
      <div className="auth-right">
        <div className="auth-form">
          <div className="auth-logo">
            <div className="sidebar-logo-icon" style={{ width: 44, height: 44, fontSize: 18 }}>S</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>Samarth CRM</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>SaaS Platform</div>
            </div>
          </div>

          <h2 className="auth-headline">Welcome back 👋</h2>
          <p className="auth-sub">Sign in to your CRM dashboard</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-group">
                <Mail size={15} className="input-icon" />
                <input
                  className="form-control"
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-group" style={{ position: 'relative' }}>
                <Lock size={15} className="input-icon" />
                <input
                  className="form-control"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ paddingRight: 40 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: -8, marginBottom: 16 }}>
              <input 
                type="checkbox" 
                id="rememberMe" 
                checked={form.rememberMe}
                onChange={e => setForm({ ...form, rememberMe: e.target.checked })}
                style={{ cursor: 'pointer', width: 14, height: 14 }}
              />
              <label htmlFor="rememberMe" style={{ fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>
                Remember me (30-min timeout disabled)
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Signing in...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account? <Link to="/register">Get started free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
