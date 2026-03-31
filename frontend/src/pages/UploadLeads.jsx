import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileSpreadsheet, ArrowLeft, CheckCircle, Download, AlertCircle } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const STAGES = [
  { step: 1, label: 'Upload File', icon: Upload },
  { step: 2, label: 'Map Columns', icon: FileSpreadsheet },
  { step: 3, label: 'Review & Import', icon: CheckCircle },
];

export default function UploadLeads() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setStep(2);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (!f) return;
    setFile(f);
    setStep(2);
  };

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file first');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/leads/bulk-upload/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(data);
      setStep(3);
      toast.success(`Upload complete! ${data.created || 0} leads imported.`);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Upload failed');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/leads')} style={{ marginBottom: 8 }}>
            <ArrowLeft size={14} /> Back to Leads
          </button>
          <h1>Upload Leads</h1>
          <p>Bulk import leads from Excel or CSV file</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a
            href="data:text/csv;charset=utf-8,First Name,Last Name,Mobile,Country Code,City,Email,Lead Source,Deal Value,Notes\nJohn,Doe,9876543210,91,Mumbai,john@example.com,website,50000,Sample lead"
            download="sample_leads_template.csv"
            className="btn btn-secondary"
          >
            <Download size={14} /> Download Template
          </a>
        </div>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 24px', marginBottom: 28 }}>
        {STAGES.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              color: step === s.step ? 'var(--primary-light)' : step > s.step ? 'var(--success)' : 'var(--text-muted)',
              fontWeight: step === s.step ? 700 : 500, fontSize: 13,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0,
                background: step === s.step ? 'var(--primary)' : step > s.step ? 'var(--success)' : 'var(--bg-input)',
                color: step >= s.step ? 'white' : 'var(--text-muted)',
              }}>
                {step > s.step ? <CheckCircle size={14} /> : s.step}
              </div>
              {s.label}
            </div>
            {i < 2 && <div style={{ flex: 1, height: 2, background: step > s.step ? 'var(--success)' : 'var(--border)', margin: '0 12px', borderRadius: 1 }} />}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="card" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '40px 32px' }}>
          <div
            style={{
              border: '2px dashed var(--border)', borderRadius: 16, padding: '48px 24px', cursor: 'pointer', transition: 'var(--transition)',
            }}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => document.getElementById('lead-file-upload').click()}
          >
            <FileSpreadsheet size={52} style={{ color: 'var(--primary)', opacity: 0.6, marginBottom: 16 }} />
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Drop your Excel or CSV file here</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>or click to browser</div>
            <button className="btn btn-primary">Select File</button>
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>Supports .xlsx, .xls, .csv</div>
          </div>
          <input id="lead-file-upload" type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleFile} />

          {/* Column Info */}
          <div style={{ marginTop: 24, textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Expected Column Format:</div>
            <div style={{ background: 'var(--bg-input)', borderRadius: 8, padding: '10px 14px', fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
              First Name | Last Name | Mobile | City | Email | Lead Source | Deal Value | Notes
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Map (simplified) */}
      {step === 2 && file && (
        <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="card-header">
            <div className="card-title">Column Mapping</div>
          </div>
          <div style={{ padding: '14px 16px', background: 'rgba(0,184,148,0.1)', border: '1px solid rgba(0,184,148,0.3)', borderRadius: 8, marginBottom: 16, display: 'flex', gap: 10 }}>
            <CheckCircle size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>File Ready: {file.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Size: {(file.size / 1024).toFixed(1)} KB</div>
            </div>
          </div>

          <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--text-muted)', padding: '12px 16px', background: 'var(--bg-input)', borderRadius: 8 }}>
            <AlertCircle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Auto-mapping will be applied. Make sure your file follows the standard template for best results. Duplicate mobile numbers will be skipped.
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-secondary" onClick={() => { setFile(null); setStep(1); }}>Change File</button>
            <button className="btn btn-primary" onClick={handleUpload} disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Uploading...</> : <><Upload size={14} /> Import Leads</>}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Result */}
      {step === 3 && result && (
        <div className="card" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '40px 32px' }}>
          <CheckCircle size={64} color="var(--success)" style={{ marginBottom: 20 }} />
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Import Complete!</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, margin: '24px 0' }}>
            {[
              { label: 'Total Rows', value: result.total || 0, color: 'var(--text-primary)' },
              { label: 'Imported', value: result.created || 0, color: 'var(--success)' },
              { label: 'Skipped', value: result.skipped || 0, color: 'var(--warning)' },
            ].map((s, i) => (
              <div key={i} style={{ padding: 16, background: 'var(--bg-input)', borderRadius: 10 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/leads')}>View Leads</button>
            <button className="btn btn-secondary" onClick={() => { setStep(1); setFile(null); setResult(null); }}>Upload More</button>
          </div>
        </div>
      )}
    </div>
  );
}
