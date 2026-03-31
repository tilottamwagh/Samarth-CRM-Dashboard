import { useState } from 'react';
import { Plus, Upload, UserPlus, Download } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

export default function CreateContacts() {
  const [tab, setTab] = useState('single');
  const [form, setForm] = useState({ name: '', mobile: '', country_code: '91', tags: '', notes: '' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  const save = async () => {
    if (!form.mobile || form.mobile.length < 10) return toast.error('Enter a valid 10-digit mobile');
    if (!form.name) return toast.error('Name is required');
    setSaving(true);
    try {
      await api.post('/marketing/contacts/', { ...form });
      toast.success('Contact added!');
      setForm({ name: '', mobile: '', country_code: '91', tags: '', notes: '' });
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to add contact'); }
    finally { setSaving(false); }
  };

  const handleBulkUpload = async () => {
    if (!file) return toast.error('Select a file first');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/marketing/contacts/bulk-upload/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(data);
      toast.success(`${data.created || 0} contacts imported!`);
    } catch { toast.error('Upload failed'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Create Contacts</h1>
          <p>Add individual contacts or bulk upload from Excel</p>
        </div>
        <a
          href="data:text/csv;charset=utf-8,Name,Mobile,Country Code,Tags,Notes\nJohn Doe,9876543210,91,vip customer,Interested in SUV"
          download="contacts_template.csv"
          className="btn btn-secondary"
        >
          <Download size={14} /> Download Template
        </a>
      </div>

      <div className="tabs">
        <div className={`tab ${tab === 'single' ? 'active' : ''}`} onClick={() => setTab('single')}>
          <UserPlus size={13} style={{ marginRight: 5 }} />Add Single Contact
        </div>
        <div className={`tab ${tab === 'bulk' ? 'active' : ''}`} onClick={() => setTab('bulk')}>
          <Upload size={13} style={{ marginRight: 5 }} />Bulk Upload
        </div>
      </div>

      {tab === 'single' && (
        <div className="card" style={{ maxWidth: 580 }}>
          <div className="card-header"><div className="card-title">New Contact</div></div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input className="form-control" placeholder="John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile <span style={{ color: 'var(--danger)' }}>*</span></label>
              <div style={{ display: 'flex', gap: 6 }}>
                <select className="form-control" style={{ width: 90 }} value={form.country_code} onChange={e => setForm(f => ({ ...f, country_code: e.target.value }))}>
                  <option value="91">🇮🇳 +91</option>
                  <option value="1">🇺🇸 +1</option>
                  <option value="44">🇬🇧 +44</option>
                  <option value="971">🇦🇪 +971</option>
                </select>
                <input className="form-control" placeholder="10-digit mobile" value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input className="form-control" placeholder="e.g. vip, hot-lead, automotive" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-control" rows={2} placeholder="Any notes about this contact..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: 'vertical' }} />
          </div>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Adding...</> : <><Plus size={14} /> Add Contact</>}
          </button>
        </div>
      )}

      {tab === 'bulk' && (
        <div className="card" style={{ maxWidth: 580 }}>
          <div className="card-header"><div className="card-title">Bulk Upload Contacts</div></div>
          <div
            style={{ border: `2px dashed ${file ? 'var(--success)' : 'var(--border)'}`, borderRadius: 12, padding: '48px 24px', textAlign: 'center', cursor: 'pointer', marginBottom: 16 }}
            onClick={() => document.getElementById('contacts-upload').click()}
          >
            {file ? (
              <>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📊</div>
                <div style={{ fontWeight: 700, color: 'var(--success)' }}>{file.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB</div>
              </>
            ) : (
              <>
                <Upload size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Click to upload Excel or CSV</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Columns: Name, Mobile, Country Code, Tags, Notes</div>
              </>
            )}
          </div>
          <input id="contacts-upload" type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />

          {result && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
              {[['Total', result.total || 0], ['Imported', result.created || 0], ['Skipped', result.skipped || 0]].map(([k, v]) => (
                <div key={k} style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{v}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{k}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            {file && <button className="btn btn-secondary btn-sm" onClick={() => { setFile(null); setResult(null); }}>Clear</button>}
            <button className="btn btn-primary" onClick={handleBulkUpload} disabled={!file || saving}>
              {saving ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Uploading...</> : <><Upload size={14} /> Upload Contacts</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
