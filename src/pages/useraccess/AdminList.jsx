import { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Trash2 } from 'lucide-react';

export default function AdminList() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Admin'
  });

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/admins');
      const data = await res.json();
      if (Array.isArray(data)) setAdmins(data);
    } catch (err) {
      console.error('Error fetching admins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin)
      });
      if (res.ok) {
        fetchAdmins();
        setShowAddModal(false);
        setNewAdmin({ name: '', email: '', password: '', role: 'Admin' });
      } else {
        const err = await res.json();
        alert(err.message || 'Error registering admin');
      }
    } catch (err) {
      console.error('Error adding admin:', err);
    }
  };

  const handleRemove = async (id) => {
    if (!confirm('Are you sure you want to remove this admin?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/auth/admins/${id}`, { method: 'DELETE' });
      if (res.ok) fetchAdmins();
    } catch (err) {
      console.error('Error deleting admin:', err);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header" style={{ margin: '0 39px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="page-title" style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>Admin Directory</div>
          <div className="page-subtitle" style={{ fontSize: 13, color: '#6B7280' }}>{admins.length} active administrators</div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)} 
          className="btn-solid-green" 
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', cursor: 'pointer' }}
        >
          <Plus size={16} /> Add Admin
        </button>
      </div>

      <div className="dash-section" style={{ margin: '0 39px 32px' }}>
        <div className="chart-card" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Last Login</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: 24 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#6B7280' }}>Loading administrators...</td>
                  </tr>
                ) : admins.map((a, i) => (
                  <tr key={a._id || a.id}>
                    <td style={{ fontWeight: 600, color: '#6B7280' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600, color: '#111827' }}>{a.name}</td>
                    <td style={{ color: '#2563EB', fontWeight: 500 }}>{a.email}</td>
                    <td>
                      <span style={{ background: 'var(--info-light)', color: 'var(--info)', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                        {a.role || 'Admin'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: '#6B7280' }}>
                      {a.lastLogin ? new Date(a.lastLogin).toLocaleDateString() : 'Active Today'}
                    </td>
                    <td>
                      <span className="status-pill active">
                        {a.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: 24 }}>
                      <button 
                        onClick={() => handleRemove(a._id || a.id)} 
                        style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 28, borderRadius: 16, width: 400, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 700, color: '#111827' }}>Register Administrator</h3>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={newAdmin.name} 
                  onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} 
                  placeholder="e.g. Rajesh Kumar"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: 8, outline: 'none', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={newAdmin.email} 
                  onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} 
                  placeholder="e.g. rajesh@tripinvilla.com"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: 8, outline: 'none', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Temporary Password</label>
                <input 
                  type="password" 
                  required 
                  value={newAdmin.password} 
                  onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} 
                  placeholder="••••••••"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: 8, outline: 'none', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Role</label>
                <select 
                  value={newAdmin.role} 
                  onChange={e => setNewAdmin({...newAdmin, role: e.target.value})} 
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: 8, outline: 'none', fontSize: 14, background: '#fff' }}
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                  <option value="Moderator">Moderator</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '10px 18px', border: '1px solid #D1D5DB', background: '#fff', color: '#374151', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '10px 18px', border: 'none', background: '#58A429', color: '#fff', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
