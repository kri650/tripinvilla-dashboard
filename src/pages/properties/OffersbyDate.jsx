import { useState, useEffect } from 'react';
import { ChevronDown, Edit2, Trash2, MoreVertical, Calendar, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OffersbyDate() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/offers');
      const data = await res.json();
      if (Array.isArray(data)) {
        setOffers(data);
      }
    } catch (err) {
      console.error('Error fetching offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/offers/${id}`, { method: 'DELETE' });
      if (res.ok) fetchOffers();
    } catch (err) {
      console.error('Error deleting offer:', err);
    }
  };

  const filteredOffers = offers.filter(o => {
    const matchQuery = (o.propertyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (o.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (o.offerId || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory ? o.category === selectedCategory : true;
    return matchQuery && matchCat;
  });

  return (
    <div className="fade-in">
      {/* Breadcrumb & Action */}
      <div className="props-breadcrumb" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 39px 12px' }}>
        <div>
          Property Management &gt; <span>Offers by Date</span>
        </div>
        <button className="btn-solid-green" onClick={() => navigate('/admin/properties/offers/add')} style={{ cursor: 'pointer' }}>Add Offer</button>
      </div>

      {/* Toolbar & Table Section */}
      <div className="dash-section" style={{ marginBottom: 24, gap: 16 }}>
        
        {/* Toolbar */}
        <div className="chart-card" style={{ padding: '16px 20px', borderRadius: 12 }}>
          <div className="props-table-toolbar" style={{ margin: 0, borderBottom: 'none' }}>
            <div className="props-table-title">Offers by Date</div>
            
            <div className="props-table-actions">
              <div className="props-filter-select" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <select 
                  value={selectedCategory} 
                  onChange={e => setSelectedCategory(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', color: '#374151', fontSize: 13, cursor: 'pointer' }}
                >
                  <option value="">All Categories</option>
                  <option value="Villa">Villa</option>
                  <option value="Homestay">Homestay</option>
                  <option value="Resort">Resort</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Hotel">Hotel</option>
                </select>
              </div>

              <div className="props-search-wrap" style={{ width: 240 }}>
                <Search size={14} />
                <input 
                  type="text" 
                  placeholder="Search property or location..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="chart-card" style={{ padding: 0, overflow: 'hidden', borderRadius: 12 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ whiteSpace: 'nowrap' }}>
              <thead>
                <tr>
                  <th style={{ color: '#9CA3AF', fontWeight: 500 }}>Offer ID <ChevronDown size={12} style={{ display: 'inline', marginLeft: 4 }} /></th>
                  <th style={{ color: '#9CA3AF', fontWeight: 500 }}>Dates &amp; <br/>Time <ChevronDown size={12} style={{ display: 'inline', marginLeft: 4 }} /></th>
                  <th style={{ color: '#9CA3AF', fontWeight: 500 }}>Property <br/>Name <ChevronDown size={12} style={{ display: 'inline', marginLeft: 4 }} /></th>
                  <th style={{ color: '#9CA3AF', fontWeight: 500 }}>Location <ChevronDown size={12} style={{ display: 'inline', marginLeft: 4 }} /></th>
                  <th style={{ color: '#9CA3AF', fontWeight: 500 }}>Category <ChevronDown size={12} style={{ display: 'inline', marginLeft: 4 }} /></th>
                  <th style={{ color: '#9CA3AF', fontWeight: 500 }}>Room <ChevronDown size={12} style={{ display: 'inline', marginLeft: 4 }} /></th>
                  <th style={{ color: '#9CA3AF', fontWeight: 500 }}>Foods <ChevronDown size={12} style={{ display: 'inline', marginLeft: 4 }} /></th>
                  <th style={{ color: '#9CA3AF', fontWeight: 500 }}>Amenities <ChevronDown size={12} style={{ display: 'inline', marginLeft: 4 }} /></th>
                  <th style={{ color: '#9CA3AF', fontWeight: 500 }}>Offer <ChevronDown size={12} style={{ display: 'inline', marginLeft: 4 }} /></th>
                  <th style={{ color: '#9CA3AF', fontWeight: 500 }}>Description <ChevronDown size={12} style={{ display: 'inline', marginLeft: 4 }} /></th>
                  <th style={{ color: '#9CA3AF', fontWeight: 500 }}>Status <ChevronDown size={12} style={{ display: 'inline', marginLeft: 4 }} /></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="12" style={{ textAlign: 'center', padding: '30px 0', color: '#6B7280' }}>Loading offers...</td></tr>
                ) : filteredOffers.length === 0 ? (
                  <tr><td colSpan="12" style={{ textAlign: 'center', padding: '30px 0', color: '#6B7280' }}>No offers found</td></tr>
                ) : (
                  filteredOffers.map((o, i) => (
                    <tr key={o._id || i}>
                      <td style={{ color: '#58A429', fontWeight: 600 }}>{o.offerId || `OFF-700${1+i}`}</td>
                      <td style={{ color: '#9CA3AF', whiteSpace: 'pre-line', lineHeight: 1.4, fontSize: 13 }}>{o.datesAndTime}</td>
                      <td style={{ color: '#111827', fontWeight: 500 }}>{o.propertyName}</td>
                      <td style={{ color: '#9CA3AF', whiteSpace: 'pre-line', lineHeight: 1.4, fontSize: 13 }}>{o.location}</td>
                      <td><span className="category-pill">{o.category}</span></td>
                      <td style={{ color: '#9CA3AF', whiteSpace: 'pre-line', lineHeight: 1.4, fontSize: 13 }}>{o.room}</td>
                      <td style={{ color: '#6B7280' }}>{o.foods}</td>
                      <td style={{ color: '#6B7280' }}>{Array.isArray(o.amenities) ? o.amenities.join(', ') : o.amenities}</td>
                      <td style={{ color: '#111827', fontWeight: 600 }}>{o.offerPercent ? `${o.offerPercent}% Off` : o.offer || '20% Off'}</td>
                      <td style={{ color: '#9CA3AF', whiteSpace: 'pre-line', lineHeight: 1.4, fontSize: 13 }}>{o.description}</td>
                      <td>
                        {o.status === 'Active' ? (
                          <span className="status-pill active">{o.status}</span>
                        ) : (
                          <span className="status-pill inactive">{o.status}</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button onClick={() => handleDelete(o._id)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}><Trash2 size={15} strokeWidth={2} /></button>
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
    </div>
  );
}
