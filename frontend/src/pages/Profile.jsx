import { useState, useEffect } from 'react';
import { User, Building, Globe, MapPin, Hash, Briefcase, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    mobile: '',
    business_name: '',
    industry: '',
    gst_number: '',
    website: '',
    address: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        mobile: user.mobile || '',
        business_name: user.tenant?.name || '',
        industry: user.tenant?.industry || '',
        gst_number: user.tenant?.gst_number || '',
        website: user.tenant?.website || '',
        address: user.tenant?.address || '',
      });
    }
  }, [user]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await api.patch('/auth/update-profile/', form);
      await refreshUser();
      toast.success('Profile updated successfully!');
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const industries = ['Automotive', 'Real Estate', 'Healthcare', 'Retail', 'Education', 'Finance', 'Technology', 'Other'];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>New Profile</h1>
          <p>Manage your personal and business identity</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="card-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 15, marginBottom: 25 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 4, height: 20, background: 'var(--primary)', borderRadius: 2 }} />
            <div className="card-title" style={{ fontSize: 16 }}>Update Profile</div>
          </div>
        </div>

        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* First Name */}
          <div className="form-group">
            <label className="form-label">First Name :</label>
            <input 
              className="form-control" 
              placeholder="Enter First Name" 
              value={form.first_name} 
              onChange={e => set('first_name', e.target.value)} 
            />
          </div>

          {/* Last Name */}
          <div className="form-group">
            <label className="form-label">Last Name :</label>
            <input 
              className="form-control" 
              placeholder="Enter Last Name" 
              value={form.last_name} 
              onChange={e => set('last_name', e.target.value)} 
            />
          </div>

          {/* Contact No */}
          <div className="form-group">
            <label className="form-label">Contact No</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 80, padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', textAlign: 'center' }}>
                91
              </div>
              <input 
                className="form-control" 
                placeholder="9850983569" 
                value={form.mobile} 
                onChange={e => set('mobile', e.target.value)} 
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email :</label>
            <input 
              className="form-control" 
              readOnly 
              value={user?.email} 
              style={{ background: 'rgba(255,255,255,0.03)', cursor: 'not-allowed' }} 
            />
          </div>

          {/* GST */}
          <div className="form-group">
            <label className="form-label">GST :</label>
            <input 
              className="form-control" 
              placeholder="GST123456LAS6SB" 
              value={form.gst_number} 
              onChange={e => set('gst_number', e.target.value)} 
            />
          </div>

          {/* Website */}
          <div className="form-group">
            <label className="form-label">Website :</label>
            <input 
              className="form-control" 
              placeholder="Website" 
              value={form.website} 
              onChange={e => set('website', e.target.value)} 
            />
          </div>

          {/* Industry */}
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Industry :</label>
            <select 
              className="form-control" 
              value={form.industry} 
              onChange={e => set('industry', e.target.value)}
            >
              <option value="">---Select Industry---</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 30, color: 'var(--text-muted)', fontSize: 13, borderTop: '1px dotted var(--border)', paddingTop: 15 }}>
          NOTE: You agree that all the Information filled above is correct.
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30 }}>
          <button 
            className="btn btn-primary" 
            style={{ padding: '12px 40px', fontSize: 14, fontWeight: 600, textTransform: 'uppercase' }}
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'UPDATE'}
          </button>
        </div>
      </div>
    </div>
  );
}
