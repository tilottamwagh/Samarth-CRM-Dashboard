import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Copy, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

export default function TemplateStudio() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    name: '', template_type: 'marketing', language: 'en',
    header_type: 'text', header_text: '',
    body_text: '', footer_text: '',
    button_type: 'none', button_texts: [''],
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchTemplates(); }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/whatsapp/templates/');
      setTemplates(data.results || data);
    } catch { setTemplates([]); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (t) => { setEditing(t); setForm({ ...t }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name) return toast.error('Template name is required');
    if (!form.body_text) return toast.error('Body text is required');
    setSaving(true);
    try {
      if (editing) {
        await api.patch(`/whatsapp/templates/${editing.id}/`, form);
        toast.success('Template updated!');
      } else {
        await api.post('/whatsapp/templates/', form);
        toast.success('Template created!');
      }
      setShowForm(false);
      fetchTemplates();
    } catch (e) { toast.error(e.response?.data?.detail || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this template?')) return;
    try { await api.delete(`/whatsapp/templates/${id}/`); toast.success('Deleted'); fetchTemplates(); }
    catch { toast.error('Delete failed'); }
  };

  const statusIcon = { approved: <CheckCircle size={13} />, pending: <Clock size={13} />, rejected: <XCircle size={13} /> };
  const statusBadge = { approved: 'badge-green', pending: 'badge-yellow', rejected: 'badge-red', draft: 'badge-gray' };

  // Body text preview with variables highlighted
  const previewBody = (text) => text?.replace(/\{\{(\d+)\}\}/g, (_, n) => `<span style="background:rgba(108,92,231,0.2);color:var(--primary-light);padding:1px 4px;border-radius:3px">{{${n}}}</span>`) || '';

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Template Studio <span style={{ fontSize: 12, background: 'rgba(108,92,231,0.2)', color: 'var(--primary-light)', padding: '2px 8px', borderRadius: 20, marginLeft: 8, fontWeight: 600 }}>Beta</span></h1>
          <p>Create and manage WhatsApp message templates</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> New Template</button>
      </div>

      {/* Info Bar */}
      <div style={{ padding: '12px 16px', background: 'rgba(116,185,255,0.08)', border: '1px solid rgba(116,185,255,0.2)', borderRadius: 10, marginBottom: 20, fontSize: 13, color: 'var(--text-muted)' }}>
        💡 Templates must be approved by Meta before use. Use <strong>{'{{1}}'}</strong>, <strong>{'{{2}}'}</strong> etc. for dynamic variables in the body.
        Templates are categorized as <strong>Marketing</strong>, <strong>Utility</strong>, or <strong>Authentication</strong>.
      </div>

      {/* Template Grid */}
      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : templates.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No templates yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Create your first WhatsApp message template.</p>
          <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> Create Template</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {templates.map(t => (
            <div key={t.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
                    <span className={`badge ${t.template_type === 'marketing' ? 'badge-purple' : t.template_type === 'utility' ? 'badge-teal' : 'badge-blue'}`}>
                      {t.template_type}
                    </span>
                    <span className="badge badge-gray">{t.language}</span>
                    <span className={`badge ${statusBadge[t.status] || 'badge-gray'}`} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      {statusIcon[t.status]} {t.status || 'draft'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(t)} title="Edit"><Edit2 size={13} /></button>
                  <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(t.id)} title="Delete"><Trash2 size={13} /></button>
                </div>
              </div>

              {/* Phone Preview mockup */}
              <div style={{ background: 'var(--bg-input)', borderRadius: 12, padding: '12px 14px', flex: 1, border: '1px solid var(--border-light)' }}>
                {t.header_text && (
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: 'var(--text-primary)' }}>{t.header_text}</div>
                )}
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: previewBody(t.body_text) }} />
                {t.footer_text && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>{t.footer_text}</div>
                )}
                {t.button_texts?.filter(Boolean).length > 0 && (
                  <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {t.button_texts.filter(Boolean).map((btn, i) => (
                      <div key={i} style={{ padding: '5px 14px', border: '1px solid rgba(116,185,255,0.4)', borderRadius: 20, fontSize: 12, color: 'var(--info)', fontWeight: 600 }}>{btn}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Template' : 'Create New Template'}</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
              {/* Form */}
              <div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Template Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input className="form-control" placeholder="e.g. welcome_message" value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value.toLowerCase().replace(/ /g, '_') }))} />
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>Lowercase, underscores only</div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-control" value={form.template_type} onChange={e => setForm(f => ({ ...f, template_type: e.target.value }))}>
                      <option value="marketing">Marketing</option>
                      <option value="utility">Utility</option>
                      <option value="authentication">Authentication</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Language</label>
                  <select className="form-control" value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}>
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="mr">Marathi</option>
                    <option value="gu">Gujarati</option>
                    <option value="ta">Tamil</option>
                    <option value="te">Telugu</option>
                    <option value="kn">Kannada</option>
                    <option value="bn">Bengali</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Header Type</label>
                    <select className="form-control" value={form.header_type} onChange={e => setForm(f => ({ ...f, header_type: e.target.value }))}>
                      <option value="none">None</option>
                      <option value="text">Text</option>
                      <option value="image">Image</option>
                      <option value="document">Document</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                  {form.header_type === 'text' && (
                    <div className="form-group">
                      <label className="form-label">Header Text</label>
                      <input className="form-control" placeholder="Bold header line" value={form.header_text}
                        onChange={e => setForm(f => ({ ...f, header_text: e.target.value }))} />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Body <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <textarea className="form-control" rows={5} placeholder="Hello {{1}}, your appointment is on {{2}} at {{3}}." value={form.body_text}
                    onChange={e => setForm(f => ({ ...f, body_text: e.target.value }))} style={{ resize: 'vertical' }} />
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>Use {'{{1}}'}, {'{{2}}'} etc. for dynamic variables</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Footer (Optional)</label>
                  <input className="form-control" placeholder="e.g. Reply STOP to unsubscribe" value={form.footer_text}
                    onChange={e => setForm(f => ({ ...f, footer_text: e.target.value }))} />
                </div>

                <div className="form-group">
                  <label className="form-label">Buttons (Optional)</label>
                  <div style={{ marginBottom: 8 }}>
                    <select className="form-control" value={form.button_type} onChange={e => setForm(f => ({ ...f, button_type: e.target.value }))}>
                      <option value="none">No Buttons</option>
                      <option value="quick_reply">Quick Reply</option>
                      <option value="call_to_action">Call to Action</option>
                    </select>
                  </div>
                  {form.button_type !== 'none' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(form.button_texts || ['']).map((btn, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8 }}>
                          <input className="form-control" placeholder={`Button ${i + 1} label`} value={btn}
                            onChange={e => { const b = [...form.button_texts]; b[i] = e.target.value; setForm(f => ({ ...f, button_texts: b })); }} />
                          {i > 0 && (
                            <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }}
                              onClick={() => setForm(f => ({ ...f, button_texts: f.button_texts.filter((_, j) => j !== i) }))}>✕</button>
                          )}
                        </div>
                      ))}
                      {form.button_texts?.length < 3 && (
                        <button className="btn btn-secondary btn-sm" onClick={() => setForm(f => ({ ...f, button_texts: [...f.button_texts, ''] }))}>
                          <Plus size={12} /> Add Button
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Phone Preview */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textAlign: 'center' }}>📱 Preview</div>
                <div style={{ background: '#128C7E', borderRadius: '20px 20px 0 0', padding: '8px 16px', textAlign: 'center', fontSize: 11, color: 'white', fontWeight: 700 }}>WhatsApp</div>
                <div style={{ background: '#ECE5DD', borderRadius: '0 0 20px 20px', padding: '20px 12px', minHeight: 300 }}>
                  <div style={{ background: 'white', borderRadius: '0 12px 12px 12px', padding: '10px 12px', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', maxWidth: '85%' }}>
                    {form.header_text && (
                      <div style={{ fontWeight: 900, fontSize: 13, marginBottom: 6, color: '#1a1a1a' }}>{form.header_text}</div>
                    )}
                    {form.body_text ? (
                      <div style={{ fontSize: 12.5, color: '#303030', lineHeight: 1.6 }}
                        dangerouslySetInnerHTML={{ __html: previewBody(form.body_text) }} />
                    ) : (
                      <div style={{ fontSize: 12, color: '#aaa', fontStyle: 'italic' }}>Body text will appear here...</div>
                    )}
                    {form.footer_text && (
                      <div style={{ fontSize: 10.5, color: '#888', marginTop: 6 }}>{form.footer_text}</div>
                    )}
                    <div style={{ fontSize: 9.5, color: '#999', textAlign: 'right', marginTop: 6 }}>10:30 AM ✓✓</div>
                  </div>
                  {form.button_texts?.filter(Boolean).length > 0 && (
                    <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '85%' }}>
                      {form.button_texts.filter(Boolean).map((btn, i) => (
                        <div key={i} style={{ background: 'white', borderRadius: 8, padding: '8px 12px', textAlign: 'center', fontSize: 13, color: '#128C7E', fontWeight: 700, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                          {btn}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving...</> : `${editing ? 'Update' : 'Create'} Template`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
