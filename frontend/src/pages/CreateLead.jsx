import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, Mail, Tag, Camera, Upload, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

export default function CreateLead() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [form, setForm] = useState({
    first_name: '', last_name: '', mobile: '', country_code: '91',
    city: '', email: '', lead_source: '', industry: '',
    deal_value: '', notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [cardFile, setCardFile] = useState(null);
  const [cardPreview, setCardPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [step, setStep] = useState('form'); // form | success

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCardUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCardFile(file);
    setCardPreview(URL.createObjectURL(file));
  };

  const scanCard = async () => {
    if (!cardFile) return;
    setScanning(true);
    try {
      const fd = new FormData();
      fd.append('image', cardFile);
      const { data } = await api.post('/leads/scan-card/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data.first_name) set('first_name', data.first_name);
      if (data.last_name) set('last_name', data.last_name);
      if (data.mobile) set('mobile', data.mobile);
      if (data.email) set('email', data.email);
      if (data.city) set('city', data.city);
      toast.success('Card scanned! Please verify details.');
    } catch { toast.error('Scan failed. Please fill manually.'); }
    finally { setScanning(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.mobile) return toast.error('Name and Mobile are required');
    setLoading(true);
    try {
      await api.post('/leads/', form);
      setStep('success');
    } catch (err) {
      toast.error(err.response?.data?.mobile?.[0] || 'Failed to create lead');
    } finally { setLoading(false); }
  };

  if (step === 'success') {
    return (
      <div style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, background: 'rgba(0,184,148,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle size={40} color="var(--success)" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Lead Created!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
          {form.first_name} {form.last_name} has been added to your CRM.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => navigate('/leads')}>View All Leads</button>
          <button className="btn btn-secondary" onClick={() => { setForm({ first_name: '', last_name: '', mobile: '', country_code: '91', city: '', email: '', lead_source: '', industry: '', deal_value: '', notes: '' }); setStep('form'); setCardPreview(null); }}>
            Add Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leads')} style={{ marginBottom: 8 }}>
            <ArrowLeft size={14} /> Back to Leads
          </button>
          <h1>Create New Lead</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Main Form */}
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <div className="card-title">Lead Information</div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name <span>*</span></label>
                <div className="input-group">
                  <User size={14} className="input-icon" />
                  <input className="form-control" placeholder="Enter first name" value={form.first_name} onChange={e => set('first_name', e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-control" placeholder="Enter last name" value={form.last_name} onChange={e => set('last_name', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Mobile <span>*</span></label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select className="form-control" style={{ width: 100 }} value={form.country_code} onChange={e => set('country_code', e.target.value)}>
                    <option value="91">+91 🇮🇳</option>
                    <option value="1">+1 🇺🇸</option>
                    <option value="44">+44 🇬🇧</option>
                    <option value="971">+971 🇦🇪</option>
                  </select>
                  <div className="input-group" style={{ flex: 1 }}>
                    <Phone size={14} className="input-icon" />
                    <input className="form-control" placeholder="Enter mobile" value={form.mobile} onChange={e => set('mobile', e.target.value)} required />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <div className="input-group">
                  <MapPin size={14} className="input-icon" />
                  <input className="form-control" placeholder="Enter city" value={form.city} onChange={e => set('city', e.target.value)} />
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="input-group">
                  <Mail size={14} className="input-icon" />
                  <input className="form-control" type="email" placeholder="Enter email" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Lead Source</label>
                <select className="form-control" value={form.lead_source} onChange={e => set('lead_source', e.target.value)}>
                  <option value="">Select source...</option>
                  {['whatsapp','website','referral','cold_call','social_media','exhibition','walk_in','other'].map(s => (
                    <option key={s} value={s}>{s.replace('_',' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Industry</label>
                <select className="form-control" value={form.industry} onChange={e => set('industry', e.target.value)}>
                  <option value="">Select industry...</option>
                  {['Automotive','Real Estate','Healthcare','Retail','Education','Finance','Other'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Deal Value (₹)</label>
                <input className="form-control" type="number" placeholder="0" value={form.deal_value} onChange={e => set('deal_value', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-control" rows={3} placeholder="Any additional notes..." value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize: 'vertical' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/leads')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Creating...</> : 'Create Lead'}
            </button>
          </div>
        </form>

        {/* Visiting Card Scanner */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Scan / Upload Card</div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            Upload a visiting card photo to auto-fill lead details using OCR.
          </p>

          <div
            style={{
              border: `2px dashed ${cardPreview ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '24px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'var(--transition)',
              marginBottom: 12,
              background: cardPreview ? 'rgba(108,92,231,0.05)' : 'transparent',
            }}
            onClick={() => fileRef.current?.click()}
          >
            {cardPreview ? (
              <img src={cardPreview} alt="Card" style={{ maxWidth: '100%', borderRadius: 8, maxHeight: 160, objectFit: 'contain' }} />
            ) : (
              <>
                <Camera size={32} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Click to upload visiting card</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>JPG, PNG up to 5MB</div>
              </>
            )}
          </div>

          <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} onChange={handleCardUpload} />

          <button
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={scanCard}
            disabled={!cardFile || scanning}
          >
            {scanning ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Scanning...</> : <><Camera size={14} /> Scan Card (Beta)</>}
          </button>

          <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(253,203,110,0.1)', border: '1px solid rgba(253,203,110,0.2)', borderRadius: 8, fontSize: 11, color: 'var(--warning)' }}>
            ⚠️ Beta feature. Please verify extracted details before saving.
          </div>
        </div>
      </div>
    </div>
  );
}
