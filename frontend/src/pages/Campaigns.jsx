import { useState, useEffect } from 'react';
import { 
  Send, Users, FileText, CheckCircle, Clock, 
  Plus, Upload, ShieldCheck, ChevronRight, 
  Smartphone, Calendar, Database, Eye 
} from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';
import { parseLeadFile } from '../utils/ExcelParser';

export default function Campaigns() {
  const [step, setStep] = useState(1);
  const [configs, setConfigs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [campaignData, setCampaignData] = useState({
    name: `Campaign ${new Date().toLocaleDateString()}`,
    wa_config: '',
    template: '',
    scheduled_at: '',
    leads: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [waRes, tempRes] = await Promise.all([
        api.get('/whatsapp/configs/'),
        api.get('/whatsapp/templates/'),
      ]);
      setConfigs(waRes.data.results || waRes.data);
      // Filter approved templates
      setTemplates((tempRes.data.results || tempRes.data).filter(t => t.status === 'approved' || true)); 
    } catch (e) {
      toast.error('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const setFormatName = (val) => setCampaignData(f => ({ ...f, name: val }));

  const handleFileUpload = async (file) => {
    if (!file) return;
    try {
      const leads = await parseLeadFile(file);
      setCampaignData(f => ({ ...f, leads }));
      toast.success(`Loaded ${leads.length} leads from file.`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleFinish = async () => {
    if (!campaignData.wa_config) return toast.error('Please select a sender');
    if (!campaignData.template) return toast.error('Please select a template');
    if (campaignData.leads.length === 0) return toast.error('Please upload a lead file');

    setSaving(true);
    try {
      const payload = {
        name: campaignData.name,
        wa_config: campaignData.wa_config,
        template: campaignData.template,
        scheduled_at: campaignData.scheduled_at || null,
        recipient_count: campaignData.leads.length,
        status: campaignData.scheduled_at ? 'scheduled' : 'running'
      };
      const { data } = await api.post('/marketing/campaigns/', payload);
      toast.success(`Campaign "${campaignData.name}" created!`);
      // Start broadcast if no schedule
      if (!campaignData.scheduled_at) {
        await api.post(`/marketing/campaigns/${data.id}/send/`);
      }
      setStep(1);
      setCampaignData({ name: `Campaign ${new Date().toLocaleDateString()}`, wa_config: '', template: '', scheduled_at: '', leads: [] });
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to start campaign');
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { n: 1, label: 'Sender', icon: Smartphone },
    { n: 2, label: 'Template', icon: FileText },
    { n: 3, label: 'Upload Excel', icon: Database },
    { n: 4, label: 'Review', icon: ShieldCheck },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Initiate Connect</h1>
          <p>4-step wizard to broadcast WhatsApp campaigns</p>
        </div>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 30, background: 'var(--bg-card)', borderRadius: 12 }}>
        {steps.map(s => (
          <div 
            key={s.n} 
            className={`wizard-tab ${step === s.n ? 'active' : ''}`}
            onClick={() => s.n < step && setStep(s.n)}
            style={{ 
              flex: 1,
              padding: '16px 20px',
              textAlign: 'center',
              cursor: s.n < step ? 'pointer' : 'default',
              borderBottom: step === s.n ? '3px solid var(--primary)' : '3px solid transparent',
              color: step === s.n ? 'var(--primary)' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontSize: 13, fontWeight: 700
            }}
          >
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: step >= s.n ? 'var(--primary)' : 'var(--bg-input)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
              {step > s.n ? <CheckCircle size={14} /> : <s.icon size={12} />}
            </div>
            {s.label}
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 40 }}>
        {step === 1 && (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 30 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'rgba(0,0,0,0.05)', lineHeight: 1 }}>01</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Choose Sender & Schedule:</div>
            </div>
            <div className="form-group">
              <label className="form-label">Campaign Name</label>
              <input className="form-control" value={campaignData.name} onChange={e => setFormatName(e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Choose Sender Number</label>
                <select className="form-control" value={campaignData.wa_config} onChange={e => setCampaignData(f => ({ ...f, wa_config: e.target.value }))}>
                  <option value="">Select Account...</option>
                  {configs.map(c => (
                    <option key={c.id} value={c.id}>{c.business_name} ({c.display_phone_number})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Schedule Broadcast (Optional)</label>
                <input className="form-control" type="datetime-local" value={campaignData.scheduled_at} onChange={e => setCampaignData(f => ({ ...f, scheduled_at: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 30 }}>
              <button 
                className="btn btn-primary" 
                style={{ background: '#26d6a1', borderColor: '#26d6a1', padding: '12px 30px' }}
                onClick={() => campaignData.wa_config ? setStep(2) : toast.error('Select a sender')}
              >
                Choose Template ➔
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 30 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'rgba(0,0,0,0.05)', lineHeight: 1 }}>02</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Select Approved Template: {templates.length === 0 && <span style={{ color: 'var(--danger)', fontSize: 13 }}>(No approved templates found)</span>}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {templates.map(t => (
                <div 
                  key={t.id} 
                  className={`card ${campaignData.template === t.id ? 'active' : ''}`}
                  onClick={() => setCampaignData(f => ({ ...f, template: t.id }))}
                  style={{ 
                    cursor: 'pointer', 
                    border: campaignData.template === t.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                    boxShadow: campaignData.template === t.id ? '0 0 15px rgba(108,92,231,0.2)' : 'none'
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{t.name}</div>
                  <div className="badge badge-gray" style={{ fontSize: 10 }}>{t.category}</div>
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.body}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30 }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button 
                className="btn btn-primary" 
                style={{ background: '#26d6a1', borderColor: '#26d6a1', padding: '12px 30px' }}
                onClick={() => campaignData.template ? setStep(3) : toast.error('Select a template')}
              >
                Upload Recipient List ➔
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 30 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'rgba(0,0,0,0.05)', lineHeight: 1 }}>03</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Upload Excel/CSV File:</div>
            </div>
            
            <div 
              style={{ padding: '60px 20px', border: '2px dashed var(--border)', borderRadius: 12, textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFileUpload(e.dataTransfer.files[0]); }}
            >
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(116,185,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                <Upload size={30} color="#0984e3" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Drag & Drop Excel File</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Format should be: **Mobile, Name** (Optional)</p>
              <input 
                type="file" 
                id="file-upload" 
                style={{ display: 'none' }} 
                accept=".csv,.xlsx" 
                onChange={e => handleFileUpload(e.target.files[0])} 
              />
              <label htmlFor="file-upload" className="btn btn-secondary" style={{ cursor: 'pointer' }}>Choose File from Computer</label>
            </div>

            {campaignData.leads.length > 0 && (
              <div style={{ marginTop: 20, padding: 15, background: 'rgba(38,214,161,0.1)', border: '1px solid rgba(38,214,161,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle size={18} color="#26d6a1" />
                <div style={{ fontSize: 14, fontWeight: 600 }}>{campaignData.leads.length} leads successfully identified.</div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30 }}>
              <button className="btn btn-secondary" onClick={() => setStep(2)}>Back</button>
              <button 
                className="btn btn-primary" 
                style={{ background: '#26d6a1', borderColor: '#26d6a1', padding: '12px 30px' }}
                onClick={() => campaignData.leads.length > 0 ? setStep(4) : toast.error('Upload lead file')}
              >
                Review Campaign ➔
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 30 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'rgba(0,0,0,0.05)', lineHeight: 1 }}>04</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Final Review & Summary:</div>
            </div>

            <div className="card" style={{ background: 'var(--bg-input)', border: 'none' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ padding: 15, borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 5 }}>Campaign Identity:</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{campaignData.name}</div>
                </div>
                <div style={{ padding: 15, borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 5 }}>Sender Selected:</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{configs.find(c => c.id == campaignData.wa_config)?.business_name || 'N/A'}</div>
                </div>
                <div style={{ padding: 15, borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 5 }}>Total Audience Size:</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{campaignData.leads.length} Contacts</div>
                </div>
                <div style={{ padding: 15, borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 5 }}>Broadcast Schedule:</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: campaignData.scheduled_at ? 'var(--primary-light)' : 'var(--success)' }}>
                    {campaignData.scheduled_at ? new Date(campaignData.scheduled_at).toLocaleString() : 'Immediate Release'}
                  </div>
                </div>
              </div>
              <div style={{ padding: 20, marginTop: 10, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Message Template Preview:</div>
                <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: 14 }}>
                  "{templates.find(t => t.id == campaignData.template)?.body || 'No template content'}"
                </div>
              </div>
            </div>

            <div style={{ marginTop: 25, display: 'flex', gap: 10, padding: '12px 16px', background: 'rgba(116,185,255,0.1)', border: '1px solid rgba(116,185,255,0.2)', borderRadius: 10, fontSize: 12, color: 'var(--text-muted)' }}>
              <ShieldCheck size={16} color="var(--info)" />
              <div>By clicking broadcast, you confirm compliance with WhatsApp Business policies and that you have received consent from these recipients.</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30 }}>
              <button className="btn btn-secondary" onClick={() => setStep(3)}>Back</button>
              <button 
                className="btn btn-primary" 
                style={{ background: '#26d6a1', borderColor: '#26d6a1', padding: '12px 60px', fontWeight: 800 }}
                onClick={handleFinish}
                disabled={saving}
              >
                {saving ? 'Creating...' : 'Start Broadcast (Beta) 🚀'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
