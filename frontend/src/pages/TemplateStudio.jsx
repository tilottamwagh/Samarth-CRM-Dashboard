import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, Clock, XCircle, FileText, Smartphone, ChevronRight } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

export default function TemplateStudio() {
  const [templates, setTemplates] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    name: '', category: 'marketing', language: 'en',
    wa_config: '', description: '',
    header_type: 'none', header_content: '',
    body: '', footer: '',
    buttons: [],
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchTemplates();
    fetchConfigs();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/whatsapp/templates/');
      setTemplates(data.results || data);
    } catch { setTemplates([]); }
    finally { setLoading(false); }
  };

  const fetchConfigs = async () => {
    try {
      const { data } = await api.get('/whatsapp/configs/');
      setConfigs(data.results || data);
    } catch {}
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setStep(1);
    setShowWizard(true);
  };

  const openEdit = (t) => {
    setEditingId(t.id);
    setForm({
      ...t,
      wa_config: t.wa_config || '',
    });
    setStep(1);
    setShowWizard(true);
  };

  const handleSave = async () => {
    if (!form.name) return toast.error('Template code is required');
    if (!form.body) return toast.error('Body text is required');
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/whatsapp/templates/${editingId}/`, form);
        toast.success('Template updated!');
      } else {
        await api.post('/whatsapp/templates/', form);
        toast.success('Template created!');
      }
      setShowWizard(false);
      fetchTemplates();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this template?')) return;
    try {
      await api.delete(`/whatsapp/templates/${id}/`);
      toast.success('Deleted');
      fetchTemplates();
    } catch {
      toast.error('Delete failed');
    }
  };

  const setFormatName = (val) => {
    const formatted = val.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/g, '');
    setForm(f => ({ ...f, name: formatted }));
  };

  // Status mapping
  const statusIcon = { approved: <CheckCircle size={13} />, submitted: <Clock size={13} />, rejected: <XCircle size={13} /> };
  const statusBadge = { approved: 'badge-green', submitted: 'badge-yellow', rejected: 'badge-red', draft: 'badge-gray' };

  // Preview highlighting
  const previewBody = (text) => text?.replace(/\{\{(\d+)\}\}/g, (_, n) => `<span style="background:rgba(108,92,231,0.2);color:var(--primary-light);padding:1px 4px;border-radius:3px">{{${n}}}</span>`) || '';

  if (showWizard) {
    return (
      <div className="fade-in">
        <div className="page-header" style={{ marginBottom: 20 }}>
          <div className="page-header-left">
            <h1>Template Studio: {editingId ? 'Edit Template' : 'Create Template'}</h1>
          </div>
        </div>

        {/* Wizard Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 30, background: 'var(--bg-card)', borderRadius: '12px 12px 0 0' }}>
          <div 
            className={`wizard-tab ${step === 1 ? 'active' : ''}`}
            onClick={() => setStep(1)}
            style={{ 
              padding: '15px 30px', 
              cursor: 'pointer', 
              fontSize: 14, 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              borderBottom: step === 1 ? '3px solid var(--primary)' : '3px solid transparent',
              color: step === 1 ? 'var(--primary)' : 'var(--text-muted)'
            }}
          >
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: step === 1 ? 'var(--primary)' : 'var(--bg-input)', color: step === 1 ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
              <FileText size={12} />
            </div>
            Template Type
          </div>
          <div 
            className={`wizard-tab ${step === 2 ? 'active' : ''}`}
            onClick={() => { if(form.name) setStep(2); else toast.error('Fill Step 1 first'); }}
            style={{ 
              padding: '15px 30px', 
              cursor: 'pointer', 
              fontSize: 14, 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              borderBottom: step === 2 ? '3px solid var(--primary)' : '3px solid transparent',
              color: step === 2 ? 'var(--primary)' : 'var(--text-muted)'
            }}
          >
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: step === 2 ? 'var(--primary)' : 'var(--bg-input)', color: step === 2 ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
              <Smartphone size={12} />
            </div>
            Create Template
          </div>
        </div>

        <div className="card" style={{ padding: 40, position: 'relative' }}>
          {step === 1 ? (
            <div className="fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 30 }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'rgba(0,0,0,0.05)', lineHeight: 1 }}>01</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Template Type:</div>
              </div>

              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px 40px' }}>
                <div className="form-group">
                  <label className="form-label">Template Type:</label>
                  <select className="form-control" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="marketing">Marketing</option>
                    <option value="utility">Utility</option>
                    <option value="authentication">Authentication</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Template Code:</label>
                  <input 
                    className="form-control" 
                    placeholder="Without space. Use _ instead..." 
                    value={form.name}
                    onChange={e => setFormatName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Template Language:</label>
                  <select className="form-control" value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}>
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="mr">Marathi</option>
                    <option value="gu">Gujarati</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Choose Business No.</label>
                  <select className="form-control" value={form.wa_config} onChange={e => setForm(f => ({ ...f, wa_config: e.target.value }))}>
                    <option value="">Type Business No.</option>
                    {configs.map(c => (
                      <option key={c.id} value={c.id}>{c.business_name} ({c.display_phone_number})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Template Description:</label>
                  <input 
                    className="form-control" 
                    placeholder="Enter template description..." 
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 50, gap: 15 }}>
                <button className="btn btn-secondary" onClick={() => setShowWizard(false)}>Cancel</button>
                <button className="btn btn-primary" style={{ background: '#26d6a1', borderColor: '#26d6a1', padding: '12px 30px' }} onClick={() => setStep(2)}>
                  Continue To Create template <FileText size={15} style={{ marginLeft: 8 }} />
                </button>
              </div>
            </div>
          ) : (
            <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40 }}>
              {/* Step 2 Content */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 30 }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: 'rgba(0,0,0,0.05)', lineHeight: 1 }}>02</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>Template Content:</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Header Type</label>
                  <select className="form-control" value={form.header_type} onChange={e => setForm(f => ({ ...f, header_type: e.target.value }))}>
                    <option value="none">None</option>
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="document">Document</option>
                  </select>
                </div>

                {form.header_type === 'text' && (
                  <div className="form-group">
                    <label className="form-label">Header Text</label>
                    <input className="form-control" placeholder="Bold header line" value={form.header_content}
                      onChange={e => setForm(f => ({ ...f, header_content: e.target.value }))} />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Body Text <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <textarea 
                    className="form-control" 
                    rows={6} 
                    placeholder="Hello {{1}}, welcome to our shop!" 
                    value={form.body}
                    onChange={e => setForm(f => ({ ...f, body: e.target.value }))} 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Footer Text</label>
                  <input className="form-control" placeholder="Reply STOP to opt out" value={form.footer}
                    onChange={e => setForm(f => ({ ...f, footer: e.target.value }))} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 50, gap: 15 }}>
                  <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                  <button className="btn btn-primary" style={{ background: '#26d6a1', borderColor: '#26d6a1', padding: '12px 30px' }} onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : (editingId ? 'Update Template' : 'Finish & Create')}
                  </button>
                </div>
              </div>

              {/* Step 2 Preview */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 }}>Preview</div>
                <div style={{ background: '#ECE5DD', borderRadius: 20, padding: 20, minHeight: 400, border: '8px solid #222', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                  <div style={{ background: 'white', borderRadius: '0 12px 12px 12px', padding: '12px 15px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', maxWidth: '90%' }}>
                    {form.header_content && (
                      <div style={{ fontWeight: 900, fontSize: 13, marginBottom: 6, color: '#1a1a1a' }}>{form.header_content}</div>
                    )}
                    {form.body ? (
                      <div style={{ fontSize: 13, color: '#303030', lineHeight: 1.6 }}
                        dangerouslySetInnerHTML={{ __html: previewBody(form.body) }} />
                    ) : (
                      <div style={{ fontSize: 12, color: '#aaa', fontStyle: 'italic' }}>Your message will appear here...</div>
                    )}
                    {form.footer && (
                      <div style={{ fontSize: 11, color: '#888', marginTop: 8 }}>{form.footer}</div>
                    )}
                    <div style={{ fontSize: 10, color: '#999', textAlign: 'right', marginTop: 5 }}>12:45 PM</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Template Studio <span style={{ fontSize: 11, background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: 20, marginLeft: 8 }}>BETA</span></h1>
          <p>Create high-conversion WhatsApp message templates</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Create Template</button>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : templates.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(108,92,231,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <FileText size={32} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>No Templates Found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 25, maxWidth: 400, margin: '0 auto 25px' }}>Start creating WhatsApp templates to use in your marketing campaigns and automation flows.</p>
          <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> Create Your First Template</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 25 }}>
          {templates.map(t => (
            <div key={t.id} className="card template-card" style={{ transition: 'all 0.3s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{t.name}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className={`badge ${statusBadge[t.status] || 'badge-gray'}`} style={{ fontSize: 10 }}>
                      {t.status || 'draft'}
                    </span>
                    <span className="badge badge-gray" style={{ fontSize: 10, textTransform: 'uppercase' }}>{t.language}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(t)}><Edit2 size={14} /></button>
                  <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(t.id)}><Trash2 size={14} /></button>
                </div>
              </div>

              <div style={{ background: 'var(--bg-input)', borderRadius: 12, padding: 15, fontSize: 13, color: 'var(--text-secondary)', border: '1px solid var(--border-light)', minHeight: 120 }}>
                {t.header_content && <div style={{ fontWeight: 700, marginBottom: 5 }}>{t.header_content}</div>}
                <div style={{ whiteSpace: 'pre-wrap' }}>{t.body?.substring(0, 150)}{t.body?.length > 150 ? '...' : ''}</div>
              </div>

              <div style={{ marginTop: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Cat: <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{t.category}</span>
                </div>
                <button className="btn btn-secondary btn-sm" style={{ padding: '4px 12px', fontSize: 11 }} onClick={() => openEdit(t)}>View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
