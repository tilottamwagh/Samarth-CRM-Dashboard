import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, Phone, Mail, Building, Search } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

export default function CreateDealer() {
  const [tab, setTab] = useState('create');
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '', email: '', mobile: '', address: '', city: '', state: '', pincode: '', gst_number: '', contact_person: '',
  });

  useEffect(() => { fetchDealers(); }, []);

  const fetchDealers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/leads/dealers/');
      setDealers(data.results || data);
    } catch { setDealers([]); }
    finally { setLoading(false); }
  };

  const reset = () => { setForm({ name: '', email: '', mobile: '', address: '', city: '', state: '', pincode: '', gst_number: '', contact_person: '' }); setEditingId(null); };

  const handleSave = async () => {
    if (!form.name) return toast.error('Dealer name is required');
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/leads/dealers/${editingId}/`, form);
        toast.success('Dealer updated!');
      } else {
        await api.post('/leads/dealers/', form);
        toast.success('Dealer created!');
      }
      reset(); fetchDealers(); setTab('list');
    } catch (e) { toast.error(e.response?.data?.detail || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleEdit = (d) => { setForm({ ...d }); setEditingId(d.id); setTab('create'); };
  const handleDelete = async (id) => {
    if (!confirm('Delete this dealer?')) return;
    try { await api.delete(`/leads/dealers/${id}/`); toast.success('Deleted'); fetchDealers(); }
    catch { toast.error('Delete failed'); }
  };

  const filtered = dealers.filter(d => (d.name || '').toLowerCase().includes(search.toLowerCase()) || (d.city || '').toLowerCase().includes(search.toLowerCase()));

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>{tab === 'create' ? (editingId ? 'Edit Dealer' : 'Create Dealer') : 'Dealer List'}</h1>
          <p>{tab === 'create' ? 'Add dealer/partner details' : `${dealers.length} dealers registered`}</p>
        </div>
        {tab === 'list' && <button className="btn btn-primary" onClick={() => { reset(); setTab('create'); }}><Plus size={14} /> Add Dealer</button>}
      </div>

      <div className="tabs" style={{ marginBottom: 24 }}>
        <div className={`tab ${tab === 'create' ? 'active' : ''}`} onClick={() => { reset(); setTab('create'); }}>
          <Plus size={13} style={{ marginRight: 5 }} />{editingId ? 'Edit Dealer' : 'Create Dealer'}
        </div>
        <div className={`tab ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}>
          <Building size={13} style={{ marginRight: 5 }} />Dealer List
        </div>
      </div>

      {tab === 'create' && (
        <div className="card" style={{ maxWidth: 640 }}>
          <div className="card-header"><div className="card-title">Dealer Information</div></div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Dealer Name <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input className="form-control" placeholder="e.g. Shree Motors Pvt Ltd" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Person</label>
              <input className="form-control" placeholder="Primary contact name" value={form.contact_person} onChange={e => set('contact_person', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label"><Phone size={11} style={{ marginRight: 4 }} />Mobile</label>
              <input className="form-control" placeholder="10-digit mobile" value={form.mobile} onChange={e => set('mobile', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label"><Mail size={11} style={{ marginRight: 4 }} />Email</label>
              <input className="form-control" type="email" placeholder="dealer@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label"><MapPin size={11} style={{ marginRight: 4 }} />Address</label>
            <textarea className="form-control" rows={2} placeholder="Street address" value={form.address} onChange={e => set('address', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-control" placeholder="City" value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <select className="form-control" value={form.state} onChange={e => set('state', e.target.value)}>
                <option value="">Select State</option>
                {['Maharashtra', 'Gujarat', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Punjab', 'Haryana', 'Telangana', 'Andhra Pradesh', 'West Bengal', 'Kerala', 'Bihar'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input className="form-control" placeholder="400001" value={form.pincode} onChange={e => set('pincode', e.target.value)} maxLength={6} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">GST Number</label>
            <input className="form-control" placeholder="22AAAAA0000A1Z5" value={form.gst_number} onChange={e => set('gst_number', e.target.value.toUpperCase())} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button className="btn btn-secondary" onClick={() => { reset(); setTab('list'); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving...</> : <><Plus size={14} /> {editingId ? 'Update' : 'Create'} Dealer</>}
            </button>
          </div>
        </div>
      )}

      {tab === 'list' && (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="search-bar">
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input placeholder="Search dealers by name or city..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>#</th><th>Dealer Name</th><th>Contact Person</th><th>Mobile</th><th>City</th><th>State</th><th>GST</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(4).fill(0).map((_, i) => <tr key={i}>{Array(8).fill(0).map((_, j) => <td key={j}><div style={{ height: 14, background: 'var(--border)', borderRadius: 4 }} /></td>)}</tr>)
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon">🤝</div>
                      <h3>No dealers yet</h3>
                      <p>Add your first dealer partner.</p>
                      <button className="btn btn-primary btn-sm" onClick={() => { reset(); setTab('create'); }} style={{ marginTop: 12 }}><Plus size={13} /> Add Dealer</button>
                    </div>
                  </td></tr>
                ) : filtered.map((d, i) => (
                  <tr key={d.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{i + 1}</td>
                    <td style={{ fontWeight: 700 }}>{d.name}</td>
                    <td>{d.contact_person || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{d.mobile || '—'}</td>
                    <td>{d.city || '—'}</td>
                    <td>{d.state || '—'}</td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{d.gst_number || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleEdit(d)}><Edit2 size={13} /></button>
                        <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(d.id)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
