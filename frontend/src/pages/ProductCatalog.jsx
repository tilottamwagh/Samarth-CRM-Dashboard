import { useState } from 'react';
import { Package, Search, Plus, Filter, Tag, DollarSign, CheckCircle, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductCatalog() {
  const [products, setProducts] = useState([
    { id: 1, name: 'Maruti Dzire LXI', category: 'Cars', price: '6,44,000', stock: 12, status: 'In Stock', ai_tags: ['Budget', 'Sedan', 'Silver'] },
    { id: 2, name: 'Maruti Brezza VXI', category: 'Cars', price: '8,34,000', stock: 8, status: 'In Stock', ai_tags: ['SUV', 'Family', 'White'] },
    { id: 3, name: 'Extended Warranty', category: 'Service', price: '12,500', stock: 999, status: 'Active', ai_tags: ['Protection', 'Digital'] },
    { id: 4, name: 'Roadside Assistance', category: 'Service', price: '2,900', stock: 999, status: 'Active', ai_tags: ['Utility', '24/7'] },
  ]);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Product Catalog</h1>
          <p>Manage your inventory and AI-tagged product listings</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary"><Filter size={14} /> View Categories</button>
          <button className="btn btn-primary" onClick={() => toast.success('New product wizard arriving soon!')}><Plus size={15} /> Add Product</button>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 25 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(9,132,227,0.1)', color: '#0984e3' }}><Package size={20} /></div>
          <div className="stat-value">{products.length}</div>
          <div className="stat-label">Active Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(38,214,161,0.1)', color: '#26d6a1' }}><Tag size={20} /></div>
          <div className="stat-value">14</div>
          <div className="stat-label">AI Smart Tags</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(108,92,231,0.1)', color: '#6c5ce7' }}><Smartphone size={20} /></div>
          <div className="stat-value">4.8k</div>
          <div className="stat-label">WhatsApp Store Visits</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Inventory Master List</div>
          <div className="input-group" style={{ width: 250 }}>
            <Search size={14} className="input-icon" />
            <input className="form-control" placeholder="Search products..." />
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Product Details</th>
              <th>Category</th>
              <th>Price (₹)</th>
              <th>Stock</th>
              <th>AI Smart Tags</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ID: {p.id}99232</div>
                </td>
                <td><span className="badge badge-purple">{p.category}</span></td>
                <td><span style={{ fontWeight: 700 }}>₹{p.price}</span></td>
                <td>{p.stock}</td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {p.ai_tags.map(t => (
                      <span key={t} style={{ fontSize: 9, padding: '2px 6px', background: 'rgba(108,92,231,0.1)', color: 'var(--primary-light)', borderRadius: 4 }}>{t}</span>
                    ))}
                  </div>
                </td>
                <td><span className="badge badge-green"><CheckCircle size={10} /> {p.status}</span></td>
                <td>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--primary-light)' }}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
