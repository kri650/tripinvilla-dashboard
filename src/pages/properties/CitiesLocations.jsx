import { useState, useEffect } from 'react';
import { ChevronDown, MoreVertical, Calendar, Search, Filter, Plus } from 'lucide-react';

export default function CitiesLocations() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCity, setNewCity] = useState({ cityName: '', stateName: '' });

  const fetchCities = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/cities');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCities(data);
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleAddCity = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCity)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewCity({ cityName: '', stateName: '' });
        fetchCities();
      }
    } catch (err) {
      console.error('Error adding city:', err);
    }
  };

  const filteredCities = cities.filter(c => {
    const matchQuery = (c.cityName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                       (c.stateName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchState = selectedState ? c.stateName === selectedState : true;
    return matchQuery && matchState;
  });

  const uniqueStates = Array.from(new Set(cities.map(c => c.stateName).filter(Boolean)));

  return (
    <div className="fade-in">
      {/* Breadcrumb */}
      <div className="props-breadcrumb" style={{ margin: '0 39px 12px' }}>
        Property Management &gt; <span>Cities &amp; Locations</span>
      </div>

      {/* Table Section */}
      <div className="dash-section" style={{ marginBottom: 24, gap: 16 }}>
        
        {/* Toolbar */}
        <div className="chart-card" style={{ padding: '16px 20px', borderRadius: 12 }}>
          <div className="props-table-toolbar" style={{ margin: 0, borderBottom: 'none' }}>
            <div className="props-table-title">Cities &amp; Locations</div>
            
            <div className="props-table-actions">
              <div className="props-filter-select" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <select 
                  value={selectedState} 
                  onChange={e => setSelectedState(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', color: '#374151', fontSize: 13, cursor: 'pointer' }}
                >
                  <option value="">All States</option>
                  {uniqueStates.map((st, i) => (
                    <option key={i} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="props-search-wrap">
                <Search size={14} />
                <input 
                  type="text" 
                  placeholder="Search city or state..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <button 
                className="props-btn-add" 
                onClick={() => setShowAddModal(true)}
                style={{ background: '#58A429', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Plus size={16} /> Add New Cities
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
                  <th style={{ color: '#9CA3AF', fontWeight: 500 }}>Cities <ChevronDown size={12} style={{ display: 'inline', marginLeft: 4 }} /></th>
                  <th style={{ color: '#9CA3AF', fontWeight: 500 }}>States <ChevronDown size={12} style={{ display: 'inline', marginLeft: 4 }} /></th>
                  <th style={{ color: '#9CA3AF', fontWeight: 500 }}>Property Numbers <ChevronDown size={12} style={{ display: 'inline', marginLeft: 4 }} /></th>
                  <th style={{ color: '#9CA3AF', fontWeight: 500 }}>Homestays <ChevronDown size={12} style={{ display: 'inline', marginLeft: 4 }} /></th>
                  <th style={{ color: '#9CA3AF', fontWeight: 500 }}>Resorts <ChevronDown size={12} style={{ display: 'inline', marginLeft: 4 }} /></th>
                  <th style={{ color: '#9CA3AF', fontWeight: 500 }}>Villas <ChevronDown size={12} style={{ display: 'inline', marginLeft: 4 }} /></th>
                  <th style={{ color: '#9CA3AF', fontWeight: 500 }}>Apartments <ChevronDown size={12} style={{ display: 'inline', marginLeft: 4 }} /></th>
                  <th style={{ color: '#9CA3AF', fontWeight: 500 }}>Cottages <ChevronDown size={12} style={{ display: 'inline', marginLeft: 4 }} /></th>
                  <th style={{ color: '#9CA3AF', fontWeight: 500 }}>Others <ChevronDown size={12} style={{ display: 'inline', marginLeft: 4 }} /></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="10" style={{ textAlign: 'center', padding: '30px 0', color: '#6B7280' }}>Loading cities...</td></tr>
                ) : filteredCities.length === 0 ? (
                  <tr><td colSpan="10" style={{ textAlign: 'center', padding: '30px 0', color: '#6B7280' }}>No cities found</td></tr>
                ) : (
                  filteredCities.map((c, i) => (
                    <tr key={c._id || i}>
                      <td style={{ color: '#58A429', fontWeight: 600 }}>{c.cityName}</td>
                      <td style={{ color: '#6B7280' }}>{c.stateName}</td>
                      <td style={{ color: '#6B7280', fontWeight: 600 }}>{c.totalProperties} Properties</td>
                      <td style={{ color: '#6B7280' }}>{c.homestays}</td>
                      <td style={{ color: '#6B7280' }}>{c.resorts}</td>
                      <td style={{ color: '#6B7280' }}>{c.villas}</td>
                      <td style={{ color: '#6B7280' }}>{c.apartments}</td>
                      <td style={{ color: '#6B7280' }}>{c.cottages}</td>
                      <td style={{ color: '#6B7280' }}>{c.others}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>
                          <button className="action-dots"><MoreVertical size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Add New City Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 28, borderRadius: 16, width: 400, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 700, color: '#111827' }}>Add New City</h3>
            <form onSubmit={handleAddCity} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>City Name</label>
                <input 
                  type="text" 
                  required 
                  value={newCity.cityName} 
                  onChange={e => setNewCity({...newCity, cityName: e.target.value})} 
                  placeholder="e.g. Pune"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: 8, outline: 'none', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>State Name</label>
                <input 
                  type="text" 
                  required 
                  value={newCity.stateName} 
                  onChange={e => setNewCity({...newCity, stateName: e.target.value})} 
                  placeholder="e.g. Maharashtra"
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
                  Add City
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
