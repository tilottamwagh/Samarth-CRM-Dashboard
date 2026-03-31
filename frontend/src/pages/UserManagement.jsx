import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, ShieldCheck, ShieldOff, Eye, EyeOff } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const ROLES = ['admin', 'manager', 'sales', 'support', 'viewer'];
const ROLE_BADGE = { admin: 'badge-red', manager: 'badge-purple', sales: 'badge-green', support: 'badge-blue', viewer: 'badge-gray' };

export default function UserManagement() {
  const [tab, setTab] = useState('list');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', mobile: '', role: 'sales', password: '', is_active: true });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/leads/users/');
      setUsers(data.results || data);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  };

  const reset = () => { setForm({ first_name: '', last_name: '', email: '', mobile: '', role: 'sales', password: '', is_active: true }); setEditingId(null); };

  const handleSave = async () => {
    if (!form.email) return toast.error('Email is required');
    if (!editingId && !form.password) return toast.error('Password is required for new users');
    setSaving(true);
    try {
      const payload = { ...form };
      if (editingId && !payload.password) delete payload.password;
      if (editingId) {
        await api.patch(`/leads/users/${editingId}/`, payload);
        toast.success('User updated!');
      } else {
        await api.post('/leads/users/', payload);
        toast.success(`User ${form.email} created!`);
      }
      reset(); fetchUsers(); setTab('list');
    } catch (e) { toast.error(e.response?.data?.detail || Object.values(e.response?.data || {}).flat().join(', ') || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleEdit = (u) => { setForm({ first_name: u.first_name, last_name: u.last_name, email: u.email, mobile: u.mobile || '', role: u.role || 'sales', password: '', is_active: u.is_active }); setEditingId(u.id); setTab('create'); };

  const toggleActive = async (u) => {
    try {
      await api.patch(`/leads/users/${u.id}/`, { is_active: !u.is_active });
      toast.success(`User ${u.is_active ? 'deactivated' : 'activated'}!`);
      fetchUsers();
    } catch { toast.error('Failed to update status'); }
  };

  const filtered = users.filter(u =>
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (`${u.first_name} ${u.last_name}`).toLowerCase().includes(search.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(search.toLowerCase())
  );

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>{tab === 'create' ? (editingId ? 'Edit User' : 'Create User') : 'User Management'}</h1>
          <p>{tab === 'list' ? `${users.length} team members` : 'Add or edit CRM user accounts'}</p>
        </div>
        {tab === 'list' && (
          <button className="btn btn-primary" onClick={() => { reset(); setTab('create'); }}><Plus size={14} /> Create User</button>
        )}
      </div>

      <div className="tabs" style={{ marginBottom: 24 }}>
        <div className={`tab ${tab === 'create' ? 'active' : ''}`} onClick={() => { reset(); setTab('create'); }}>
          <Plus size={13} style={{ marginRight: 5 }} />{editingId ? 'Edit User' : 'Create User'}
        </div>
        <div className={`tab ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}>
          User List
        </div>
      </div>

      {/* Create / Edit Form */}
      {tab === 'create' && (
        <div className="card" style={{ maxWidth: 560 }}>
          <div className="card-header"><div className="card-title">User Details</div></div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-control" placeholder="First name" value={form.first_name} onChange={e => set('first_name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-control" placeholder="Last name" value={form.last_name} onChange={e => set('last_name', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input className="form-control" type="email" placeholder="user@company.com" value={form.email} onChange={e => set('email', e.target.value)} disabled={!!editingId} />
            {editingId && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>Email cannot be changed after creation</div>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Mobile</label>
              <input className="form-control" placeholder="10-digit mobile" value={form.mobile} onChange={e => set('mobile', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-control" value={form.role} onChange={e => set('role', e.target.value)}>
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password {editingId && <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>(leave blank to keep current)</span>} {!editingId && <span style={{ color: 'var(--danger)' }}>*</span>}</label>
            <div style={{ position: 'relative' }}>
              <input className="form-control" type={showPass ? 'text' : 'password'} placeholder={editingId ? 'Enter new password to change' : 'Min 8 characters'} value={form.password} onChange={e => set('password', e.target.value)} style={{ paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Active (user can log in)</span>
            </label>
          </div>

          {/* Role Permission Info */}
          <div style={{ padding: '12px 14px', background: 'var(--bg-input)', borderRadius: 10, marginBottom: 16, fontSize: 12, color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Role permissions:</strong>
            <div style={{ marginTop: 6, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
              {[['admin', 'Full access, manage users'], ['manager', 'View all, manage leads'], ['sales', 'Own leads, create/edit'], ['support', 'Tickets, conversations'], ['viewer', 'Read-only access']].map(([r, desc]) => (
                <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className={`badge ${ROLE_BADGE[r]}`} style={{ fontSize: 9, padding: '1px 5px' }}>{r}</span>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={() => { reset(); setTab('list'); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving...</> : <><Plus size={14} /> {editingId ? 'Update' : 'Create'} User</>}
            </button>
          </div>
        </div>
      )}

      {/* User List */}
      {tab === 'list' && (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="search-bar">
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input placeholder="Search by name, email or role..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>#</th><th>Name</th><th>Email</th><th>Mobile</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(4).fill(0).map((_, i) => <tr key={i}>{Array(8).fill(0).map((_, j) => <td key={j}><div style={{ height: 14, background: 'var(--border)', borderRadius: 4 }} /></td>)}</tr>)
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon">👤</div>
                      <h3>No users found</h3>
                      <p>Create the first team member.</p>
                      <button className="btn btn-primary btn-sm" onClick={() => { reset(); setTab('create'); }} style={{ marginTop: 12 }}><Plus size={13} /> Create User</button>
                    </div>
                  </td></tr>
                ) : filtered.map((u, i) => (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                          {(u.first_name?.[0] || u.email?.[0] || '?').toUpperCase()}
                        </div>
                        <div style={{ fontWeight: 600 }}>{`${u.first_name || ''} ${u.last_name || ''}`.trim() || '—'}</div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{u.email}</td>
                    <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{u.mobile || '—'}</td>
                    <td><span className={`badge ${ROLE_BADGE[u.role] || 'badge-gray'}`}>{u.role || 'sales'}</span></td>
                    <td>
                      <span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {u.is_active ? <><ShieldCheck size={10} /> Active</> : <><ShieldOff size={10} /> Inactive</>}
                      </span>
                    </td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {u.date_joined ? new Date(u.date_joined).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleEdit(u)} title="Edit"><Edit2 size={13} /></button>
                        <button className="btn btn-ghost btn-icon btn-sm" style={{ color: u.is_active ? 'var(--warning)' : 'var(--success)' }} onClick={() => toggleActive(u)} title={u.is_active ? 'Deactivate' : 'Activate'}>
                          {u.is_active ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
                        </button>
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
