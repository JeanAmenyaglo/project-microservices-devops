import { useState, useEffect } from 'react';
import { getProducts, createProduct, deleteProduct, getUsers } from '../services/api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tab, setTab] = useState('list');
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', owner_id: '' });

  const fetchData = async () => {
    try {
      const [prodRes, userRes] = await Promise.all([getProducts(), getUsers()]);
      setProducts(prodRes.data.products);
      setUsers(userRes.data.users);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      await createProduct({
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
        owner_id: parseInt(form.owner_id),
      });
      setSuccess('Product created successfully!');
      setForm({ name: '', description: '', price: '', stock: '', owner_id: '' });
      setTab('list');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete product "${name}"?`)) return;
    try {
      await deleteProduct(id);
      setSuccess('Product deleted');
      fetchData();
    } catch {
      setError('Failed to delete product');
    }
  };

  const ownerName = (owner_id) => {
    const u = users.find(u => u.id === owner_id);
    return u ? u.name : `User #${owner_id}`;
  };

  return (
    <>
      <h1>Product Catalogue</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="tabs">
        <button className={`tab ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}>
          All Products {products.length > 0 && `(${products.length})`}
        </button>
        <button className={`tab ${tab === 'create' ? 'active' : ''}`} onClick={() => setTab('create')}>
          + Add Product
        </button>
      </div>

      {tab === 'list' && (
        loading ? <p className="empty">Loading products…</p> :
        products.length === 0 ? <p className="empty">No products yet. Add one above.</p> :
        <div className="grid">
          {products.map(p => (
            <div className="item-card" key={p.id}>
              <h3>{p.name}</h3>
              {p.description && <p className="meta">{p.description}</p>}
              <p className="price">${parseFloat(p.price).toFixed(2)}</p>
              <p className="meta">Stock: {p.stock} units</p>
              <p className="meta">Owner: {ownerName(p.owner_id)}</p>
              <button className="btn btn-danger" style={{ marginTop: 8, alignSelf: 'flex-start' }}
                onClick={() => handleDelete(p.id, p.name)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'create' && (
        <div className="card">
          <h2>Add New Product</h2>
          {users.length === 0 && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              You need to create a user first before adding products.
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field">
                <label>Product Name</label>
                <input name="name" value={form.name} onChange={handleChange}
                  placeholder="MacBook Pro" required />
              </div>
              <div className="field">
                <label>Price ($)</label>
                <input name="price" type="number" step="0.01" min="0" value={form.price}
                  onChange={handleChange} placeholder="999.99" required />
              </div>
              <div className="field">
                <label>Stock</label>
                <input name="stock" type="number" min="0" value={form.stock}
                  onChange={handleChange} placeholder="10" />
              </div>
              <div className="field">
                <label>Owner (User)</label>
                <select name="owner_id" value={form.owner_id} onChange={handleChange} required>
                  <option value="">— Select a user —</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div className="field full">
                <label>Description (optional)</label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  placeholder="Brief description of the product…" />
              </div>
            </div>
            <div style={{ marginTop: '1.2rem' }}>
              <button className="btn btn-primary" type="submit"
                disabled={submitting || users.length === 0}>
                {submitting ? 'Creating…' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
