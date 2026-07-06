import { useState, useEffect } from 'react';
import { getUsers, createUser, deleteUser } from '../services/api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tab, setTab] = useState('list');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });

  const fetchUsers = async () => {
    try {
      const { data } = await getUsers();
      setUsers(data.users);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSubmitting(true);
    try {
      await createUser(form);
      setSuccess('User created successfully!');
      setForm({ name: '', email: '', password: '', role: 'user' });
      setTab('list');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user "${name}"?`)) return;
    try {
      await deleteUser(id);
      setSuccess('User deleted');
      fetchUsers();
    } catch {
      setError('Failed to delete user');
    }
  };

  return (
    <>
      <h1>User Management</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="tabs">
        <button className={`tab ${tab === 'list' ? 'active' : ''}`} onClick={() => setTab('list')}>
          All Users {users.length > 0 && `(${users.length})`}
        </button>
        <button className={`tab ${tab === 'create' ? 'active' : ''}`} onClick={() => setTab('create')}>
          + Add User
        </button>
      </div>

      {tab === 'list' && (
        loading ? <p className="empty">Loading users…</p> :
        users.length === 0 ? <p className="empty">No users yet. Add one above.</p> :
        <div className="grid">
          {users.map(u => (
            <div className="item-card" key={u.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3>{u.name}</h3>
                  <p className="meta">{u.email}</p>
                  <p className="meta">ID: {u.id}</p>
                </div>
                <span className="badge">{u.role}</span>
              </div>
              <p className="meta" style={{ marginTop: 4 }}>
                Joined {new Date(u.created_at).toLocaleDateString()}
              </p>
              <button className="btn btn-danger" style={{ marginTop: 8, alignSelf: 'flex-start' }}
                onClick={() => handleDelete(u.id, u.name)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'create' && (
        <div className="card">
          <h2>Create New User</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field">
                <label>Full Name</label>
                <input name="name" value={form.name} onChange={handleChange}
                  placeholder="Jean Dupont" required />
              </div>
              <div className="field">
                <label>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="jean@example.com" required />
              </div>
              <div className="field">
                <label>Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange}
                  placeholder="Min 6 characters" required />
              </div>
              <div className="field">
                <label>Role</label>
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: '1.2rem' }}>
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
