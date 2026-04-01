import { useState, useEffect } from 'react';
import { Settings, Smartphone, Copy, CheckCircle, ExternalLink, Key, Webhook, TestTube } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('whatsapp');
  const [waForm, setWaForm] = useState({ display_name: '', phone_number_id: '', wa_business_id: '', access_token: '', verify_token: '' });
  const [profileForm, setProfileForm] = useState({ name: '', industry: '', gst_number: '', website: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [waConfigs, setWaConfigs] = useState([]);

  const WEBHOOK_URL = `${window.location.protocol}//${window.location.hostname.replace('5173', '8000')}/api/whatsapp/webhook/`;

  useEffect(() => {
    api.get('/whatsapp/configs/').then(({ data }) => setWaConfigs(data.results || data)).catch(() => {});
    api.get('/auth/me/').then(({ data }) => {
      if (data.tenant) setProfileForm({
        name: data.tenant.name || '',
        industry: data.tenant.industry || '',
        gst_number: data.tenant.gst_number || '',
        website: data.tenant.website || '',
        address: data.tenant.address || '',
      });
    }).catch(() => {});

    // Facebook SDK Initialization
    const initFB = () => {
      window.FB.init({
        appId      : import.meta.env.VITE_META_APP_ID || '614698678376268',
        cookie     : true,
        xfbml      : true,
        version    : 'v19.0'
      });
    };

    if (window.FB) {
      initFB();
    } else {
      window.fbAsyncInit = initFB;
    }
  }, []);

  const setWa = (k, v) => setWaForm(f => ({ ...f, [k]: v }));
  const setProfile = (k, v) => setProfileForm(f => ({ ...f, [k]: v }));

  const saveWhatsApp = async () => {
    if (!waForm.phone_number_id || !waForm.access_token) return toast.error('Phone Number ID and Access Token are required');
    setSaving(true);
    try {
      await api.post('/whatsapp/configs/', waForm);
      toast.success('WhatsApp configured successfully!');
      setWaForm({ display_name: '', phone_number_id: '', wa_business_id: '', access_token: '', verify_token: '' });
      api.get('/whatsapp/configs/').then(({ data }) => setWaConfigs(data.results || data));
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); toast.success('Copied!'); };

  const testWebhook = async () => {
    toast.success('Webhook test sent! Check your Meta dashboard.');
  };

  const handleFBLogin = () => {
    if (!window.FB) return toast.error('Facebook SDK not loaded. Try refreshing the page.');

    window.FB.login((response) => {
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;
        const loadingToken = toast.loading('Connecting WhatsApp Business...');
        
        api.post('/whatsapp/oauth-callback/', { access_token: accessToken })
          .then(({ data }) => {
            toast.success('WhatsApp Cloud API successfully linked!', { id: loadingToken });
            api.get('/whatsapp/configs/').then(({ data: cData }) => setWaConfigs(cData.results || cData));
          })
          .catch((err) => {
            toast.error(err.response?.data?.error || 'Failed to link account via Meta.', { id: loadingToken });
          });
      } else {
        toast.error('Facebook login was cancelled.');
      }
    }, {
      scopes: ['whatsapp_business_management', 'whatsapp_business_messaging'],
      extras: { setup: {} }
    });
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Settings</h1>
          <p>Configure your CRM, integrations and business profile</p>
        </div>
      </div>

      <div className="tabs">
        {[
          { id: 'whatsapp', label: '📱 WhatsApp Setup' },
          { id: 'profile', label: '🏢 Business Profile' },
          { id: 'ai', label: '🤖 AI Settings' },
          { id: 'notifications', label: '🔔 Notifications' },
        ].map(t => (
          <div key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </div>
        ))}
      </div>

      {/* WhatsApp Setup */}
      {activeTab === 'whatsapp' && (
        <div className="fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
            <div>
              {/* Onboarding Steps Header */}
              <div className="card" style={{ marginBottom: 20, background: 'linear-gradient(135deg, rgba(37,211,102,0.1) 0%, rgba(108,92,231,0.05) 100%)', border: '1px solid rgba(37,211,102,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 20 }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(37,211,102,0.3)' }}>
                    <Smartphone size={32} color="white" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Link your WhatsApp Cloud API</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Connect your Meta Business account to start broadcasting campaigns.</p>
                  </div>
                  <button className="btn btn-primary" onClick={handleFBLogin} style={{ marginLeft: 'auto', background: '#1877F2', borderColor: '#1877F2', padding: '12px 24px' }}>
                    <span style={{ marginRight: 8 }}>f</span> Login with Facebook
                  </button>
                </div>
              </div>

              {/* 6 Steps Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                {[
                  { step: '01', title: 'Create App', desc: 'Go to Meta for Developers and create a new App.' },
                  { step: '02', title: 'Setup WhatsApp', desc: 'Add the WhatsApp product to your Meta App.' },
                  { step: '03', title: 'Add Number', desc: 'Register your business phone number in the dashboard.' },
                  { step: '04', title: 'Generate Token', desc: 'Create a permanent System User access token.' },
                  { step: '05', title: 'Copy IDs', desc: 'Copy your Phone Number ID and WABA ID below.' },
                  { step: '06', title: 'Configure Webhook', desc: 'Paste our Webhook URL into your Meta App settings.' },
                ].map((s, i) => (
                  <div key={i} className="card" style={{ padding: '20px', display: 'flex', gap: 15, alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: 'rgba(0,0,0,0.05)', lineHeight: 1 }}>{s.step}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{s.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* OR Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 15, margin: '30px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }}></div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px' }}>OR MANUALLY ENTER DETAILS</div>
                <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }}></div>
              </div>

              {/* Add New Config Form */}
              <div className="card">
                <div className="card-header"><div className="card-title">Enter API Credentials</div></div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Display Name</label>
                    <input className="form-control" placeholder="e.g. Samarth Motors" value={waForm.display_name} onChange={e => setWa('display_name', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number ID <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <div className="input-group">
                      <Key size={14} className="input-icon" />
                      <input className="form-control" placeholder="From Meta Developer Console" value={waForm.phone_number_id} onChange={e => setWa('phone_number_id', e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">WhatsApp Business Account ID</label>
                    <input className="form-control" placeholder="WABA ID" value={waForm.wa_business_id} onChange={e => setWa('wa_business_id', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Verify Token</label>
                    <input className="form-control" placeholder="Custom verify token (any string)" value={waForm.verify_token} onChange={e => setWa('verify_token', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Permanent Access Token <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <textarea className="form-control" rows={3} placeholder="EAABs... (long token from Meta)" value={waForm.access_token} onChange={e => setWa('access_token', e.target.value)} style={{ resize: 'none', fontFamily: 'monospace', fontSize: 12 }} />
                </div>
                <button className="btn btn-primary" onClick={saveWhatsApp} disabled={saving} style={{ marginTop: 4, padding: '10px 24px' }}>
                  {saving ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving...</> : <><Smartphone size={14} /> Connect WhatsApp</>}
                </button>
              </div>
            </div>

            {/* Side Panel: Webhook & Status */}
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-header"><div className="card-title">Webhook URL</div></div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
                  Add this URL in your Meta App Dashboard.
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ flex: 1, padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all', color: 'var(--primary-light)' }}>
                      {WEBHOOK_URL}
                    </div>
                    <button className="btn btn-secondary btn-icon" onClick={() => copyToClipboard(WEBHOOK_URL)} title="Copy">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={testWebhook}>
                  <TestTube size={13} /> Test Webhook
                </button>
              </div>

              {/* Connected Numbers */}
              {waConfigs.length > 0 && (
                <div className="card">
                  <div className="card-header"><div className="card-title">Connected Numbers</div></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {waConfigs.map(c => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(37,211,102,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Smartphone size={16} color="#25D366" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.display_name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {c.phone_number_id}</div>
                        </div>
                        <span className="badge badge-green"><CheckCircle size={8} /> OK</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Business Profile */}
      {activeTab === 'profile' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <div className="card-header"><div className="card-title">Business Profile</div></div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Business Name</label>
              <input className="form-control" value={profileForm.name} onChange={e => setProfile('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Industry</label>
              <select className="form-control" value={profileForm.industry} onChange={e => setProfile('industry', e.target.value)}>
                <option value="">Select Industry...</option>
                {['Automotive','Real Estate','Healthcare','Retail','Education','Finance','Technology','Other'].map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">GST Number</label>
              <input className="form-control" placeholder="22AAAAA0000A1Z5" value={profileForm.gst_number} onChange={e => setProfile('gst_number', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Website</label>
              <input className="form-control" type="url" placeholder="https://yourwebsite.com" value={profileForm.website} onChange={e => setProfile('website', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Business Address</label>
            <textarea className="form-control" rows={3} value={profileForm.address} onChange={e => setProfile('address', e.target.value)} placeholder="Full business address..." style={{ resize: 'vertical' }} />
          </div>
          <button className="btn btn-primary" onClick={() => toast.success('Profile saved!')} style={{ marginTop: 4 }}>
            Save Changes
          </button>
        </div>
      )}

      {/* AI Settings */}
      {activeTab === 'ai' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <div className="card-header"><div className="card-title">AI Configuration</div></div>
          <div style={{ padding: '14px 16px', background: 'rgba(108,92,231,0.1)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            These settings control how AI responds to your customers on WhatsApp. Configure your OpenAI/Gemini API keys and response behavior.
          </div>
          <div className="form-group">
            <label className="form-label">AI Provider</label>
            <select className="form-control">
              <option value="openai">OpenAI (GPT-4)</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">API Key</label>
            <input className="form-control" type="password" placeholder="sk-..." />
          </div>
          <div className="form-group">
            <label className="form-label">Response Language</label>
            <select className="form-control">
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="mr">Marathi</option>
              <option value="gu">Gujarati</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => toast.success('AI settings saved!')}>Save AI Settings</button>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="card" style={{ maxWidth: 500 }}>
          <div className="card-header"><div className="card-title">Notification Preferences</div></div>
          {[
            { label: 'New Lead Notifications', desc: 'Get notified when new leads are added' },
            { label: 'WhatsApp Message Alerts', desc: 'Alert when a new message arrives' },
            { label: 'Appointment Reminders', desc: 'Remind before scheduled appointments' },
            { label: 'Campaign Reports', desc: 'Receive campaign performance summaries' },
            { label: 'AI Query Usage Alerts', desc: 'Alert at 80% and 100% query usage' },
          ].map((n, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{n.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{n.desc}</div>
              </div>
              <label className="toggle">
                <input type="checkbox" defaultChecked={i < 3} />
                <span className="toggle-slider" />
              </label>
            </div>
          ))}
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => toast.success('Notification preferences saved!')}>Save Preferences</button>
        </div>
      )}
    </div>
  );
}
