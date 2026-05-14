import { useState, useEffect } from 'react';
import { Star, Edit2, Trash2, Search, AlertTriangle, Wifi, Tv, Wind, Car, HelpCircle, Utensils, Waves, ShieldCheck, Flame, Trees, ChefHat } from 'lucide-react';

const availableIcons = [
  { name: 'Wifi', icon: Wifi },
  { name: 'Tv', icon: Tv },
  { name: 'Wind', icon: Wind },
  { name: 'Car', icon: Car },
  { name: 'Utensils', icon: Utensils },
  { name: 'Waves', icon: Waves },
  { name: 'Trees', icon: Trees },
  { name: 'ShieldCheck', icon: ShieldCheck },
  { name: 'Flame', icon: Flame },
  { name: 'ChefHat', icon: ChefHat }
];

const categories = ['Basic', 'Kitchen', 'Outdoor', 'Safety', 'Luxury', 'View', 'Fine & Dining', 'Recreation', 'Wellness', 'Business'];

export default function AmenitiesMaster() {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    amenitiesName: '',
    amenitiesCategory: 'Basic',
    availabilityScope: 'All',
    checkIn: '12:00 PM',
    checkOut: '11:00 AM',
    offer: 'None',
    status: 'Active'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const fetchAmenities = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/masters/amenities');
      const data = await res.json();
      if (Array.isArray(data)) {
        setAmenities(data);
      }
    } catch (err) {
      console.error('Error fetching amenities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amenitiesName) {
      alert('Please fill out Amenity Name.');
      return;
    }

    try {
      if (isEditing) {
        const res = await fetch(`http://localhost:5000/api/masters/amenities/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) fetchAmenities();
        setIsEditing(false);
      } else {
        const res = await fetch('http://localhost:5000/api/masters/amenities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) fetchAmenities();
      }

      setFormData({
        id: '',
        amenitiesName: '',
        amenitiesCategory: 'Basic',
        availabilityScope: 'All',
        checkIn: '12:00 PM',
        checkOut: '11:00 AM',
        offer: 'None',
        status: 'Active'
      });
    } catch (err) {
      console.error('Error submitting amenity:', err);
    }
  };

  const handleEdit = (amObj) => {
    setFormData({
      id: amObj._id,
      amenitiesName: amObj.amenitiesName,
      amenitiesCategory: amObj.amenitiesCategory || 'Basic',
      availabilityScope: amObj.availabilityScope || 'All',
      checkIn: amObj.checkIn || '12:00 PM',
      checkOut: amObj.checkOut || '11:00 AM',
      offer: amObj.offer || 'None',
      status: amObj.status || 'Active'
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const triggerDelete = (id) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/masters/amenities/${deleteTargetId}`, { method: 'DELETE' });
      if (res.ok) fetchAmenities();
    } catch (err) {
      console.error('Error deleting amenity:', err);
    } finally {
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    }
  };

  const getIconComponent = (cat) => {
    let Comp = Wifi;
    if (cat === 'Recreation' || cat === 'Outdoor') Comp = Waves;
    else if (cat === 'Fine & Dining' || cat === 'Kitchen') Comp = Utensils;
    else if (cat === 'Wellness') Comp = Trees;
    else if (cat === 'Business') Comp = Tv;
    else if (cat === 'Safety') Comp = ShieldCheck;
    return <Comp size={16} className="text-emerald-700" style={{ color: 'var(--primary)' }} />;
  };

  const filteredAmenities = amenities.filter(am => {
    const matchesCategory = activeCategoryFilter === 'All' || am.amenitiesCategory === activeCategoryFilter;
    const matchesSearch = (am.amenitiesName || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fade-in">
      {/* Breadcrumbs */}
      <div className="props-breadcrumb" style={{ margin: '0 39px 12px' }}>
        Masters &gt; <span>Amenities Master</span>
      </div>

      {/* Form Container */}
      <div className="dash-section" style={{ marginBottom: 16 }}>
        <form onSubmit={handleSubmit} className="master-form-card" style={{ margin: 0 }}>
          <div className="master-form-header">
            <div className="master-form-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Star size={18} style={{ color: 'var(--primary)' }} />
              {isEditing ? 'Modify Amenity' : 'Add New Amenity Context'}
            </div>
            <div className="master-form-actions">
              <button type="submit" className="btn-solid-green" style={{ cursor: 'pointer' }}>
                {isEditing ? 'Update Amenity' : 'Add Amenity'}
              </button>
            </div>
          </div>

          <div className="form-grid-4" style={{ marginBottom: 0 }}>
            <div className="form-group">
              <label className="form-label">Amenity Name*</label>
              <input 
                type="text" 
                name="amenitiesName"
                value={formData.amenitiesName}
                onChange={handleChange}
                placeholder="e.g. WiFi / Heated Pool" 
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Amenity Category*</label>
              <select 
                name="amenitiesCategory"
                value={formData.amenitiesCategory}
                onChange={handleChange}
                className="form-select"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Scope / Type*</label>
              <select 
                name="availabilityScope"
                value={formData.availabilityScope}
                onChange={handleChange}
                className="form-select"
              >
                <option value="All">All</option>
                <option value="Villa">Villa</option>
                <option value="Resort">Resort</option>
                <option value="Homestay">Homestay</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status*</label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {isEditing && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button 
                type="button" 
                onClick={() => {
                  setIsEditing(false);
                  setFormData({ id: '', amenitiesName: '', amenitiesCategory: 'Basic', availabilityScope: 'All', checkIn: '12:00 PM', checkOut: '11:00 AM', offer: 'None', status: 'Active' });
                }}
                className="btn-outline-green"
                style={{ cursor: 'pointer', padding: '8px 16px', fontSize: 12 }}
              >
                Cancel Edit
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Category Selection Filter Bar */}
      <div style={{ margin: '24px 39px 12px', display: 'flex', flexWrap: 'wrap', gap: '8px', background: '#FFFFFF', padding: '6px 12px', borderRadius: '12px', border: '1px solid #E5E7EB', width: 'max-content' }}>
        <button 
          onClick={() => setActiveCategoryFilter('All')}
          style={{ padding: '6px 12px', fontSize: '11.5px', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', background: activeCategoryFilter === 'All' ? 'var(--primary)' : 'transparent', color: activeCategoryFilter === 'All' ? '#fff' : '#6B7280' }}
        >
          All Categories
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategoryFilter(cat)}
            style={{ padding: '6px 12px', fontSize: '11.5px', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', background: activeCategoryFilter === cat ? 'var(--primary)' : 'transparent', color: activeCategoryFilter === cat ? '#fff' : '#6B7280' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="table-section">
        <div className="table-header">
          <div className="table-title">Existing Amenities ({filteredAmenities.length})</div>
          <div className="table-header-right">
            <div className="props-search-wrap">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search amenity..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '64px', textAlign: 'center' }}>Icon</th>
                <th>Amenity Name</th>
                <th>Assigned Category</th>
                <th>Scope</th>
                <th>Status</th>
                <th style={{ textAlign: 'right', paddingRight: '24px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#6B7280' }}>Loading amenities...</td></tr>
              ) : filteredAmenities.length > 0 ? (
                filteredAmenities.map((am) => (
                  <tr key={am._id}>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto' }}>
                        {getIconComponent(am.amenitiesCategory)}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#111827' }}>{am.amenitiesName}</td>
                    <td>
                      <span className="category-pill" style={{ textTransform: 'capitalize' }}>
                        {am.amenitiesCategory || 'Basic'}
                      </span>
                    </td>
                    <td style={{ color: '#6B7280' }}>{am.availabilityScope || 'All'}</td>
                    <td>
                      <span className={`status-pill ${am.status ? am.status.toLowerCase() : 'active'}`}>
                        {am.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button 
                          onClick={() => handleEdit(am)}
                          title="Edit Amenity"
                          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 4 }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => triggerDelete(am._id)}
                          title="Delete Amenity"
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 4 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#9CA3AF' }}>
                    No amenities found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', items: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', maxWidth: '400px', width: '100%', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB', margin: 'auto' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ padding: '10px', backgroundColor: '#FEE2E2', borderRadius: '50%', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0 }}>Delete Amenity</h3>
                <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '8px', lineHeight: 1.5 }}>
                  Are you absolutely sure you want to delete this amenity? This may impact active room catalogs.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="btn-outline-green"
                style={{ cursor: 'pointer', padding: '8px 16px', fontSize: 13 }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                style={{ cursor: 'pointer', backgroundColor: '#EF4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: 13, fontWeight: 600 }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
