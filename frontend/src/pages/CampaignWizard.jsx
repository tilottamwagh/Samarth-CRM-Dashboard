import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Upload, Send, Calendar, MessageSquare, Eye } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const STEPS = ['Sender Setup', 'Select Template', 'Upload Recipients', 'Review & Launch'];

export default function CampaignWizard() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [waConfigs, setWaConfigs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({
    name: '', wa_config: '', scheduled_at: '',
    template: null, excel_file: null, recipient_count_preview: 0,
  });

  useEffect(() => {
    api.get('/whatsapp/configs/').then(({ data }) => setWaConfigs(data.results || data)).catch(() => {});
    api.get('/whatsapp/templates/').then(({ data }) => setTemplates(data.results || data)).catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    set('excel_file', file);
    // Mock count from file name/size
    set('recipient_count_preview', Math.floor(file.size / 50));
    toast.success(`File "${file.name}" uploaded`);
  };

  const handleLaunch = async () => {
    if (!form.name) return toast.error('Campaign name is required');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      if (form.wa_config) fd.append('wa_config', form.wa_config);
      if (form.template) fd.append('template', form.template.id);
      if (form.scheduled_at) fd.append('scheduled_at', form.scheduled_at);
      if (form.excel_file) fd.append('excel_file', form.excel_file);
      const { data } = await api.post('/marketing/campaigns/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Campaign created and launched!');
      setStep(0);
      setForm({ name: '', wa_config: '', scheduled_at: '', template: null, excel_file: null, recipient_count_preview: 0 });
    } catch { toast.error('Failed to create campaign'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Initiate Connect</h1>
          <p>Launch bulk WhatsApp campaigns in 4 simple steps</p>
        </div>
      </div>

      {/* Step Progress */}
      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 24px', marginBottom: 28 }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
                color: i === step ? 'var(--primary-light)' : i < step ? 'var(--success)' : 'var(--text-muted)',
                fontWeight: i === step ? 700 : 500, fontSize: 13,
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0,
                background: i === step ? 'var(--primary)' : i < step ? 'var(--success)' : 'var(--bg-input)',
                color: i <= step ? 'white' : 'var(--text-muted)',
              }}>
                {i < step ? <CheckCircle size={14} /> : i + 1}
              </div>
              {s}
            </div>
            {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? 'var(--success)' : 'var(--border)', margin: '0 12px 0 8px', borderRadius: 1 }} />}
          </div>
        ))}
      </div>

      <div className="card" style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Step 0: Sender Setup */}
        {step === 0 && (
          <div>
            <div className="card-header"><div className="card-title">📱 Sender Setup</div></div>
            <div className="form-group">
              <label className="form-label">Campaign Name <span style={{color:'var(--danger)'}}>*</span></label>
              <input className="form-control" placeholder="e.g. Diwali Offer 2024" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp Sender Number</label>
              {waConfigs.length === 0 ? (
                <div style={{ padding: '12px 16px', background: 'rgba(255,118,117,0.1)', border: '1px solid rgba(255,118,117,0.3)', borderRadius: 8, fontSize: 13, color: 'var(--danger)' }}>
                  ⚠️ No WhatsApp numbers configured. <a href="/settings/whatsapp" style={{ color: 'var(--primary-light)' }}>Setup WhatsApp</a> first.
                </div>
              ) : (
                <select className="form-control" value={form.wa_config} onChange={e => set('wa_config', e.target.value)}>
                  <option value="">Select sender number...</option>
                  {waConfigs.map(c => <option key={c.id} value={c.id}>{c.display_name} ({c.phone_number_id})</option>)}
                </select>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Schedule Date & Time (Optional)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                <input className="form-control" type="datetime-local" value={form.scheduled_at} onChange={e => set('scheduled_at', e.target.value)} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Leave empty to send immediately after review.</div>
            </div>
          </div>
        )}

        {/* Step 1: Template */}
        {step === 1 && (
          <div>
            <div className="card-header"><div className="card-title">📋 Select WhatsApp Template</div></div>
            {templates.length === 0 ? (
              <div className="empty-state" style={{ padding: 40 }}>
                <MessageSquare size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                <h3>No templates available</h3>
                <p>Create WhatsApp templates in Template Studio first.</p>
                <a href="/marketing/templates" className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>Go to Template Studio</a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {templates.map(t => (
                  <div
                    key={t.id}
                    className="card"
                    style={{
                      cursor: 'pointer', padding: '14px 16px',
                      border: form.template?.id === t.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: form.template?.id === t.id ? 'rgba(108,92,231,0.08)' : undefined,
                    }}
                    onClick={() => set('template', t)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{t.body_text?.slice(0, 80)}...</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className={`badge ${t.template_type === 'marketing' ? 'badge-purple' : t.template_type === 'utility' ? 'badge-teal' : 'badge-blue'}`}>
                          {t.template_type}
                        </span>
                        {form.template?.id === t.id && <CheckCircle size={18} color="var(--primary)" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Upload Excel */}
        {step === 2 && (
          <div>
            <div className="card-header">
              <div className="card-title">📤 Upload Recipients</div>
              <a href="/sample_leads_template.xlsx" download className="btn btn-secondary btn-sm">⬇ Download Sample</a>
            </div>
            <div
              style={{
                border: `2px dashed ${form.excel_file ? 'var(--success)' : 'var(--border)'}`,
                borderRadius: 12, padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
                background: form.excel_file ? 'rgba(0,184,148,0.05)' : 'transparent', transition: 'var(--transition)',
              }}
              onClick={() => document.getElementById('excel-upload').click()}
            >
              {form.excel_file ? (
                <>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
                  <div style={{ fontWeight: 700, color: 'var(--success)' }}>{form.excel_file.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>~{form.recipient_count_preview} recipients detected</div>
                </>
              ) : (
                <>
                  <Upload size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Click to upload Excel file</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Columns: Name, Mobile, Variable1, Variable2...</div>
                </>
              )}
            </div>
            <input id="excel-upload" type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleFileUpload} />

            <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(116,185,255,0.1)', border: '1px solid rgba(116,185,255,0.2)', borderRadius: 8, fontSize: 12, color: 'var(--info)' }}>
              💡 <strong>Excel Format:</strong> Column A = Name, Column B = Mobile (10 digits), Column C onwards = Template variables
            </div>
          </div>
        )}

        {/* Step 3: Review & Launch */}
        {step === 3 && (
          <div>
            <div className="card-header"><div className="card-title">🚀 Review & Launch</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Campaign Name', value: form.name || '—' },
                { label: 'Template', value: form.template?.name || '—' },
                { label: 'Recipients', value: form.excel_file ? `~${form.recipient_count_preview} contacts` : 'No file uploaded' },
                { label: 'Schedule', value: form.scheduled_at ? new Date(form.scheduled_at).toLocaleString('en-IN') : 'Send immediately' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-input)', borderRadius: 8 }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{item.label}</div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{item.value}</div>
                </div>
              ))}
            </div>

            {!form.name && (
              <div style={{ padding: '12px 16px', background: 'rgba(255,118,117,0.1)', border: '1px solid rgba(255,118,117,0.3)', borderRadius: 8, fontSize: 13, color: 'var(--danger)', marginBottom: 12 }}>
                ⚠️ Campaign name is required to launch.
              </div>
            )}

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleLaunch}
              disabled={loading || !form.name}
            >
              {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Launching...</> : <><Send size={16} /> Launch Campaign</>}
            </button>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-secondary" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
            <ArrowLeft size={14} /> Previous
          </button>
          {step < STEPS.length - 1 && (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>
              Next <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
