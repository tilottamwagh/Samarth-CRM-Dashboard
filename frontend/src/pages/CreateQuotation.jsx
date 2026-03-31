import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Car, Home, Send, Plus, Trash2, GripVertical, Share2 } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const STEPS = ['Customer', 'Vehicle Info', 'Additional Info', 'Price Breakdown', 'Images'];

const DEFAULT_ITEMS = [
  { name: 'Ex-Showroom Price', amount: '', editable: true },
  { name: 'Registration Charges', amount: '', editable: true },
  { name: 'Insurance', amount: '', editable: true },
  { name: 'Extended Warranty', amount: '', editable: true },
  { name: 'MCD / Road Tax', amount: '', editable: true },
  { name: 'Hypothecation Charges', amount: '', editable: true },
  { name: 'Auto Card / Accessories', amount: '', editable: true },
  { name: 'Fast Tag', amount: '', editable: true },
  { name: 'Discount', amount: '', editable: true, isDiscount: true },
];

export default function CreateQuotation() {
  const navigate = useNavigate();
  const [quoteType, setQuoteType] = useState('');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);

  const [form, setForm] = useState({
    mobile: '',
    lead: null,
    // Vehicle
    brand: '', model: '', variant: '',
    // Additional
    transmission: '', fuel: '', vehicle_type: '', color: '',
    // Pricing
    items: DEFAULT_ITEMS.map(i => ({ ...i })),
    notes: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Search lead by mobile
  const searchLead = async () => {
    if (!form.mobile || form.mobile.length < 10) return toast.error('Enter valid mobile number');
    try {
      const { data } = await api.get(`/leads/?q=${form.mobile}`);
      const lead = (data.results || data)[0];
      if (lead) { set('lead', lead); toast.success(`Found: ${lead.first_name} ${lead.last_name}`); }
      else toast.error('Lead not found. A new lead will be created.');
    } catch { toast.error('Search failed'); }
  };

  const updateItem = (i, field, val) => {
    const updated = [...form.items];
    updated[i] = { ...updated[i], [field]: val };
    set('items', updated);
  };

  const addItem = () => set('items', [...form.items, { name: '', amount: '', editable: true }]);

  const removeItem = (i) => set('items', form.items.filter((_, idx) => idx !== i));

  const totalAmount = form.items.reduce((acc, item) => {
    const amt = parseFloat(item.amount) || 0;
    return item.isDiscount ? acc - amt : acc + amt;
  }, 0);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        lead: form.lead?.id,
        quote_type: quoteType,
        title: `${form.brand} ${form.model} Quote`,
        details: {
          brand: form.brand, model: form.model, variant: form.variant,
          transmission: form.transmission, fuel: form.fuel,
          vehicle_type: form.vehicle_type, color: form.color,
        },
        total_value: totalAmount,
        final_value: totalAmount,
        notes: form.notes,
        items: form.items.filter(i => i.amount).map(i => ({
          name: i.name,
          quantity: 1,
          unit_price: parseFloat(i.amount) || 0,
          total_price: parseFloat(i.amount) || 0,
        })),
      };
      await api.post('/quotations/', payload);
      toast.success('Quotation created!');
      navigate('/quotations');
    } catch (e) { toast.error('Failed to create quotation'); }
    finally { setLoading(false); }
  };

  // Type selection screen
  if (!quoteType) {
    return (
      <div>
        <div className="page-header">
          <div className="page-header-left">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/quotations')} style={{ marginBottom: 8 }}>
              <ArrowLeft size={14} /> Back
            </button>
            <h1>Create Quotation</h1>
            <p>Select the type of quotation to generate</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 700, margin: '40px auto' }}>
          {[
            { type: 'automotive', icon: Car, label: 'Automotive Quotation', desc: 'Generate vehicle price quotations for car deals', color: '#6C5CE7' },
            { type: 'real_estate', icon: Home, label: 'Real Estate Quotation', desc: 'Generate property cost estimates for real estate', color: '#00CEC9' },
          ].map(opt => (
            <div
              key={opt.type}
              className="card"
              style={{ cursor: 'pointer', textAlign: 'center', padding: '40px 24px', border: '2px solid var(--border)', transition: 'var(--transition)' }}
              onClick={() => setQuoteType(opt.type)}
              onMouseEnter={e => e.currentTarget.style.borderColor = opt.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ width: 64, height: 64, borderRadius: 16, background: `${opt.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <opt.icon size={32} color={opt.color} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{opt.label}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{opt.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn btn-ghost btn-sm" onClick={() => { setQuoteType(''); setStep(0); }} style={{ marginBottom: 8 }}>
            <ArrowLeft size={14} /> Change Type
          </button>
          <h1>{quoteType === 'automotive' ? '🚗 Automotive' : '🏠 Real Estate'} Quotation</h1>
        </div>
      </div>

      {/* Step Progress Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 24px' }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 8, cursor: i < step ? 'pointer' : 'default',
                color: i === step ? 'var(--primary-light)' : i < step ? 'var(--success)' : 'var(--text-muted)',
                fontWeight: i === step ? 700 : 500, fontSize: 13, whiteSpace: 'nowrap',
              }}
              onClick={() => i < step && setStep(i)}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0,
                background: i === step ? 'var(--primary)' : i < step ? 'var(--success)' : 'var(--bg-input)',
                color: i <= step ? 'white' : 'var(--text-muted)',
                border: i === step ? '2px solid var(--primary)' : i < step ? '2px solid var(--success)' : '2px solid var(--border)',
              }}>
                {i < step ? <CheckCircle size={14} /> : i + 1}
              </div>
              {s}
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < step ? 'var(--success)' : 'var(--border)', margin: '0 12px', borderRadius: 1 }} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="card" style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Step 0: Customer */}
        {step === 0 && (
          <div>
            <div className="card-header"><div className="card-title">Customer Details</div></div>
            <div className="form-group">
              <label className="form-label">Customer Mobile Number <span style={{color:'var(--danger)'}}>*</span></label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  className="form-control"
                  placeholder="Enter 10-digit mobile number"
                  value={form.mobile}
                  onChange={e => set('mobile', e.target.value)}
                  style={{ flex: 1 }}
                />
                <button className="btn btn-primary" onClick={searchLead}>Search</button>
              </div>
            </div>
            {form.lead && (
              <div style={{ padding: '14px 16px', background: 'rgba(0,184,148,0.1)', border: '1px solid rgba(0,184,148,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar">{form.lead.first_name?.[0]}{form.lead.last_name?.[0]}</div>
                <div>
                  <div style={{ fontWeight: 700 }}>{form.lead.first_name} {form.lead.last_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>+{form.lead.country_code} {form.lead.mobile} · {form.lead.city || 'Location N/A'}</div>
                </div>
                <span className="badge badge-green" style={{ marginLeft: 'auto' }}>✓ Found</span>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Vehicle Info */}
        {step === 1 && (
          <div>
            <div className="card-header"><div className="card-title">Vehicle Information</div></div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Brand <span style={{color:'var(--danger)'}}>*</span></label>
                <select className="form-control" value={form.brand} onChange={e => set('brand', e.target.value)}>
                  <option value="">Select Brand...</option>
                  {['Maruti Suzuki','Hyundai','Tata','Mahindra','Kia','Toyota','Honda','Ford','MG','Nissan','BMW','Mercedes','Audi','Volkswagen','Jeep'].map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Model <span style={{color:'var(--danger)'}}>*</span></label>
                <input className="form-control" placeholder="e.g. Swift Dzire" value={form.model} onChange={e => set('model', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Variant</label>
                <input className="form-control" placeholder="e.g. VXi, ZXi+" value={form.variant} onChange={e => set('variant', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <input className="form-control" placeholder="e.g. Pearl White" value={form.color} onChange={e => set('color', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Additional Info */}
        {step === 2 && (
          <div>
            <div className="card-header"><div className="card-title">Additional Information</div></div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Transmission</label>
                <select className="form-control" value={form.transmission} onChange={e => set('transmission', e.target.value)}>
                  <option value="">Select...</option>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                  <option value="amt">AMT</option>
                  <option value="cvt">CVT</option>
                  <option value="dct">DCT</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Fuel Type</label>
                <select className="form-control" value={form.fuel} onChange={e => set('fuel', e.target.value)}>
                  <option value="">Select...</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="cng">CNG</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Vehicle Type</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {['Hatchback','Sedan','SUV','MUV','Luxury','Commercial'].map(t => (
                  <button
                    key={t} type="button"
                    className={`btn ${form.vehicle_type === t ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    onClick={() => set('vehicle_type', t)}
                  >{t}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Price Breakdown */}
        {step === 3 && (
          <div>
            <div className="card-header">
              <div className="card-title">Price Breakdown</div>
              <button className="btn btn-secondary btn-sm" onClick={addItem}><Plus size={13} /> Add Item</button>
            </div>
            <table style={{ width: '100%', marginBottom: 12 }}>
              <thead>
                <tr>
                  <th style={{ width: 30 }}></th>
                  <th>Item</th>
                  <th style={{ width: 180 }}>Amount (₹)</th>
                  <th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((item, i) => (
                  <tr key={i}>
                    <td><GripVertical size={14} style={{ color: 'var(--text-muted)', cursor: 'grab' }} /></td>
                    <td>
                      <input
                        className="form-control"
                        value={item.name}
                        onChange={e => updateItem(i, 'name', e.target.value)}
                        style={{ fontSize: 13 }}
                      />
                    </td>
                    <td>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: item.isDiscount ? 'var(--danger)' : 'var(--success)', fontWeight: 700 }}>
                          {item.isDiscount ? '-₹' : '₹'}
                        </span>
                        <input
                          className="form-control"
                          type="number"
                          value={item.amount}
                          onChange={e => updateItem(i, 'amount', e.target.value)}
                          style={{ paddingLeft: 30, fontSize: 13, color: item.isDiscount ? 'var(--danger)' : undefined }}
                          placeholder="0"
                        />
                      </div>
                    </td>
                    <td>
                      {!item.editable ? null : (
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeItem(i)} style={{ color: 'var(--danger)' }}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Total */}
            <div style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.15), rgba(0,206,201,0.1))', border: '1px solid var(--primary)', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Final On-Road Price</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary-light)' }}>
                ₹{totalAmount.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label">Notes / Terms</label>
              <textarea className="form-control" rows={2} placeholder="Any special terms or notes for this quotation..." value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize: 'vertical' }} />
            </div>
          </div>
        )}

        {/* Step 4: Images */}
        {step === 4 && (
          <div>
            <div className="card-header"><div className="card-title">Add Images (Optional)</div></div>
            <div
              style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: '40px 24px', textAlign: 'center', cursor: 'pointer' }}
              onClick={() => document.getElementById('img-upload').click()}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Click to upload vehicle images</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>PNG, JPG up to 5MB each</div>
            </div>
            <input id="img-upload" type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => setImages(Array.from(e.target.files))} />
            {images.length > 0 && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                {images.map((f, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={URL.createObjectURL(f)} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                    <button onClick={() => setImages(imgs => imgs.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: -6, right: -6, background: 'var(--danger)', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', color: 'white', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <button
            className="btn btn-secondary"
            onClick={() => step === 0 ? navigate('/quotations') : setStep(s => s - 1)}
          >
            <ArrowLeft size={14} /> {step === 0 ? 'Cancel' : 'Previous'}
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>
              Next <ArrowRight size={14} />
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Creating...</> : <><CheckCircle size={14} /> Create Quotation</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
