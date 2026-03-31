// Employees page
import { useState, useEffect } from 'react';
import { Plus, Target, Edit2, Trash2 } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', mobile: '', role: 'employee', password: '' });

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/employees/');
      setEmployees(data.results || data);
    } catch { toast.error('Failed to load employees'); }
    finally { setLoading(false); }
  };

  const createEmployee = async () => {
    try {
      await api.post('/auth/employees/', form);
      toast.success('Employee created!');
      setShowModal(false);
      setForm({ first_name: '', last_name: '', email: '', mobile: '', role: 'employee', password: '' });
      fetchEmployees();
    } catch (e) { toast.error(e.response?.data?.email?.[0] || 'Failed to create'); }
  };

  const deleteEmployee = async (id) => {
    if (!confirm('Delete this employee?')) return;
    try { await api.delete(`/auth/employees/${id}/`); toast.success('Deleted'); fetchEmployees(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Employees</h1>
          <p>Manage your sales team members</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> Add Employee</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr><th>#</th><th>Name</th><th>Email</th><th>Mobile</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7}><div className="loader"><div className="spinner" /></div></td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan={7}>
                <div className="empty-state"><div className="empty-state-icon">👥</div><h3>No employees yet</h3><button className="btn btn-primary btn-sm" style={{marginTop:12}} onClick={() => setShowModal(true)}><Plus size={13}/> Add First Employee</button></div>
              </td></tr>
            ) : employees.map((e, i) => (
              <tr key={e.id}>
                <td style={{color:'var(--text-muted)', fontSize:11}}>{i+1}</td>
                <td>
                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                    <div className="avatar" style={{width:30, height:30, fontSize:11}}>{e.first_name?.[0]}{e.last_name?.[0]}</div>
                    <div>
                      <div style={{fontWeight:600}}>{e.first_name} {e.last_name}</div>
                    </div>
                  </div>
                </td>
                <td style={{fontSize:12}}>{e.email}</td>
                <td>{e.mobile || '—'}</td>
                <td><span className={`badge ${e.role === 'admin' ? 'badge-purple' : e.role === 'manager' ? 'badge-teal' : 'badge-gray'}`}>{e.role}</span></td>
                <td style={{fontSize:11, color:'var(--text-muted)'}}>{new Date(e.date_joined).toLocaleDateString('en-IN')}</td>
                <td>
                  <div style={{display:'flex', gap:4}}>
                    <button className="btn btn-ghost btn-icon btn-sm" title="Set Target"><Target size={13} /></button>
                    <button className="btn btn-ghost btn-icon btn-sm" title="Edit"><Edit2 size={13} /></button>
                    <button className="btn btn-ghost btn-icon btn-sm" style={{color:'var(--danger)'}} onClick={() => deleteEmployee(e.id)}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add Employee</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group"><label className="form-label">First Name <span style={{color:'var(--danger)'}}>*</span></label><input className="form-control" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Last Name</label><input className="form-control" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Email <span style={{color:'var(--danger)'}}>*</span></label><input className="form-control" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Mobile</label><input className="form-control" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Role</label>
                  <select className="form-control" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Password <span style={{color:'var(--danger)'}}>*</span></label><input className="form-control" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={createEmployee} disabled={!form.first_name || !form.email || !form.password}>Create Employee</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
