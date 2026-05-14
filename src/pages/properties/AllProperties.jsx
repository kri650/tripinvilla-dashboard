import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, ChevronDown, ClipboardList, Clock, XCircle, CheckCircle2, MoreVertical, Plus } from 'lucide-react';

export default function AllProperties() {
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({ totalProperties: 1540, activeProperties: 224, inactiveAdmin: 100 });
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProp, setNewProp] = useState({ name: '', location: '', type: 'Villa', price: 5000, rooms: 3 });

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('search', searchQuery);
      if (propertyType) queryParams.append('type', propertyType);
      if (dateFrom) queryParams.append('date', dateFrom);

      const res = await fetch(`http://localhost:5000/api/properties?${queryParams.toString()}`);
      const data = await res.json();
      if (data && data.properties) {
        setProperties(data.properties);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleFilter = () => {
    fetchProperties();
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      fetchProperties();
    }
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProp.name,
          location: newProp.location,
          type: newProp.type,
          price: Number(newProp.price),
          bedRooms: Number(newProp.rooms),
          status: 'Active',
          rating: 4.8,
          totalBookings: 12
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewProp({ name: '', location: '', type: 'Villa', price: 5000, rooms: 3 });
        fetchProperties();
      }
    } catch (err) {
      console.error('Error adding property:', err);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive Admin' : currentStatus === 'Inactive Admin' ? 'Inactive' : 'Active';
    try {
      const res = await fetch(`http://localhost:5000/api/properties/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        fetchProperties();
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  return (
    <div className="fade-in">
      {/* Breadcrumb */}
      <div className="props-breadcrumb" style={{ margin: '0 39px 12px' }}>
        Property Management &gt; <span>All Properties</span>
      </div>

      {/* Stats Section */}
      <div className="dash-section" style={{ minHeight: 162, boxSizing: 'border-box', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div className="props-stat-card" style={{ margin: 0, borderRadius: 12 }}>
            <div className="props-stat-icon-wrap blue"><ClipboardList strokeWidth={2.5} /></div>
            <div className="props-stat-content">
              <div className="props-stat-label">Total Properties</div>
              <div className="props-stat-value">{stats.totalProperties}</div>
            </div>
          </div>
          <div className="props-stat-card" style={{ margin: 0, borderRadius: 12 }}>
            <div className="props-stat-icon-wrap green"><Clock strokeWidth={2.5} /></div>
            <div className="props-stat-content">
              <div className="props-stat-label">Active Properties</div>
              <div className="props-stat-value">{stats.activeProperties}</div>
            </div>
          </div>
          <div className="props-stat-card" style={{ margin: 0, borderRadius: 12 }}>
            <div className="props-stat-icon-wrap red"><CheckCircle2 strokeWidth={2.5} /></div>
            <div className="props-stat-content">
              <div className="props-stat-label">Inactive Admin</div>
              <div className="props-stat-value">{stats.inactiveAdmin}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar and Table Section */}
      <div className="dash-section" style={{ marginBottom: 24, gap: 16 }}>
        
        {/* Toolbar */}
        <div className="chart-card" style={{ padding: '16px 20px', borderRadius: 12 }}>
          <div className="props-table-toolbar" style={{ margin: 0, borderBottom: 'none' }}>
            <div className="props-table-title">All Properties</div>
            <div className="props-table-actions">
              
              <div className="props-filter-select" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px' }}>
                <Calendar size={14} style={{ color: '#6B7280' }} />
                <input 
                  type="date" 
                  value={dateFrom} 
                  onChange={e => setDateFrom(e.target.value)} 
                  title="Date From"
                  style={{ border: 'none', background: 'transparent', outline: 'none', color: '#374151', fontSize: 13, cursor: 'pointer' }} 
                />
              </div>

              <div className="props-filter-select" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px' }}>
                <Calendar size={14} style={{ color: '#6B7280' }} />
                <input 
                  type="date" 
                  value={dateTo} 
                  onChange={e => setDateTo(e.target.value)} 
                  title="Date To"
                  style={{ border: 'none', background: 'transparent', outline: 'none', color: '#374151', fontSize: 13, cursor: 'pointer' }} 
                />
              </div>

              <div className="props-filter-select" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px' }}>
                <select 
                  value={propertyType} 
                  onChange={e => setPropertyType(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', color: '#374151', fontSize: 13, cursor: 'pointer', paddingRight: 4 }}
                >
                  <option value="">All Types</option>
                  <option value="Villa">Villa</option>
                  <option value="Homestay">Homestay</option>
                  <option value="Resort">Resort</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Cottage">Cottage</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <button className="props-btn-filter" onClick={handleFilter} style={{ cursor: 'pointer' }}>
                <Filter size={14} /> Filter
              </button>

              <div className="props-search-wrap">
                <Search size={14} />
                <input 
                  type="text" 
                  placeholder="Search properties..." 
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                />
              </div>

              <button className="props-btn-add" onClick={() => setShowAddModal(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Plus size={16} /> Add New
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="chart-card" style={{ padding: 0, overflow: 'hidden', borderRadius: 12 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ whiteSpace: 'nowrap' }}>
              <thead>
                <tr>
                  {['Property No','Image','Property Name','Location','Category','Best Room Rate','Rooms','Total Bookings','Cancelled','Rating','Status',''].map((h, i) => (
                    <th key={i} style={{ color: '#9CA3AF', fontWeight: 500 }}>{h}{h && i < 11 && <ChevronDown size={11} style={{ display: 'inline', marginLeft: 3 }} />}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="12" style={{ textAlign: 'center', padding: '30px 0', color: '#6B7280' }}>Loading properties...</td>
                  </tr>
                ) : properties.length === 0 ? (
                  <tr>
                    <td colSpan="12" style={{ textAlign: 'center', padding: '30px 0', color: '#6B7280' }}>No properties found matching criteria</td>
                  </tr>
                ) : (
                  properties.map((p, i) => (
                    <tr key={p._id || i}>
                      <td style={{ color: '#58A429', fontWeight: 600 }}>{p.propertyNo || `PR-${1000 + i}`}</td>
                      <td>
                        <div style={{ width: 40, height: 30, background: '#E5E7EB', borderRadius: 6, overflow: 'hidden' }}>
                          <img src={p.image || "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=100&q=80"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        </div>
                      </td>
                      <td style={{ color: '#111827', fontWeight: 500 }}>{p.propertyName || p.name}</td>
                      <td style={{ color: '#6B7280', whiteSpace: 'pre-line', lineHeight: 1.4 }}>{p.location}</td>
                      <td><span className="category-pill">{p.category || p.type}</span></td>
                      <td style={{ color: '#111827', fontWeight: 600 }}>{typeof p.bestRoomRate === 'number' ? `₹${p.bestRoomRate.toLocaleString()}` : (p.bestRoomRate || `₹12,000`)}</td>
                      <td style={{ color: '#6B7280' }}>{p.rooms || p.bedRooms || 3}</td>
                      <td style={{ color: '#6B7280' }}>{p.totalBookings || 15}</td>
                      <td style={{ color: '#6B7280' }}>{p.cancelled || 0}</td>
                      <td style={{ color: '#6B7280' }}>{p.rating || '4.8 Star'}</td>
                      <td>
                        <button 
                          onClick={() => toggleStatus(p._id, p.status)} 
                          style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
                          title="Click to toggle status"
                        >
                          {p.status === 'Active' ? (
                            <span className="status-pill active"><CheckCircle2 size={11} /> Active</span>
                          ) : p.status === 'Inactive Admin' ? (
                            <span className="status-pill inactive" style={{ background: '#FEE2E2', color: '#EF4444' }}><XCircle size={11} /> Inactive Admin</span>
                          ) : (
                            <span className="status-pill inactive"><XCircle size={11} /> In-Active</span>
                          )}
                        </button>
                      </td>
                      <td><button className="action-dots" onClick={() => toggleStatus(p._id, p.status)}><MoreVertical size={14} /></button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add New Property Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 28, borderRadius: 16, width: 440, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 700, color: '#111827' }}>Add New Property</h3>
            <form onSubmit={handleAddProperty} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Property Name</label>
                <input 
                  type="text" 
                  required 
                  value={newProp.name} 
                  onChange={e => setNewProp({...newProp, name: e.target.value})} 
                  placeholder="e.g. Blue Lagoon Villa"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: 8, outline: 'none', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Location</label>
                <input 
                  type="text" 
                  required 
                  value={newProp.location} 
                  onChange={e => setNewProp({...newProp, location: e.target.value})} 
                  placeholder="e.g. Candolim, Goa"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: 8, outline: 'none', fontSize: 14 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Category</label>
                  <select 
                    value={newProp.type} 
                    onChange={e => setNewProp({...newProp, type: e.target.value})}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: 8, outline: 'none', fontSize: 14, background: '#fff' }}
                  >
                    <option value="Villa">Villa</option>
                    <option value="Homestay">Homestay</option>
                    <option value="Resort">Resort</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Cottage">Cottage</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Rooms</label>
                  <input 
                    type="number" 
                    min="1"
                    required 
                    value={newProp.rooms} 
                    onChange={e => setNewProp({...newProp, rooms: e.target.value})} 
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: 8, outline: 'none', fontSize: 14 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Best Room Rate (₹)</label>
                <input 
                  type="number" 
                  required 
                  value={newProp.price} 
                  onChange={e => setNewProp({...newProp, price: e.target.value})} 
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: 8, outline: 'none', fontSize: 14 }}
                />
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
                  Add Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
