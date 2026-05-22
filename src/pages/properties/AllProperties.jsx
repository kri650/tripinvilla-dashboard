import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, ChevronDown, ClipboardList, Clock, XCircle, CheckCircle2, MoreVertical, Plus, X } from 'lucide-react';

const API = 'http://localhost:5000/api';

export default function AllProperties() {
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({ totalProperties: 0, activeProperties: 0, inactiveAdmin: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [loading, setLoading] = useState(false);

  // Add Panel State
  const [showPanel, setShowPanel] = useState(false);
  const [owners, setOwners] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [experiencesList, setExperiencesList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '', type: 'Villa', price: '', bedRooms: '', bathRooms: '',
    ownerId: '', countryId: '', stateId: '', cityId: '',
    location: '', about: '', checkIn: '11:00', checkOut: '10:00',
    rules: '', amenities: [], experiences: [], images: []
  });

  // Dropdown menus
  const [actionMenu, setActionMenu] = useState(null); // propertyId

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (propertyType) params.append('type', propertyType);
      if (dateFrom) params.append('date', dateFrom);
      const res = await fetch(`${API}/properties?${params.toString()}`);
      const data = await res.json();
      if (data?.properties) {
        setProperties(data.properties);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchPanelData = async () => {
    try {
      const [ownersRes, countriesRes, amenRes, expRes] = await Promise.all([
        fetch(`${API}/owners`).then(r => r.json()),
        fetch(`${API}/admin/countries/active`).then(r => r.json()),
        fetch(`${API}/admin/amenities/active`).then(r => r.json()),
        fetch(`${API}/master/experiences`).then(r => r.json())
      ]);
      if (Array.isArray(ownersRes)) setOwners(ownersRes);
      if (Array.isArray(countriesRes)) setCountries(countriesRes);
      if (Array.isArray(amenRes)) setAmenitiesList(amenRes);
      if (Array.isArray(expRes)) setExperiencesList(expRes);
    } catch (err) { console.error('Panel data error:', err); }
  };

  const fetchStates = async (countryId) => {
    try {
      const res = await fetch(`${API}/admin/states/active?country=${countryId}`);
      const data = await res.json();
      if (Array.isArray(data)) { setStates(data); setCities([]); }
    } catch (err) { console.error(err); }
  };

  const fetchCities = async (stateId) => {
    try {
      const res = await fetch(`${API}/admin/cities/active?state=${stateId}`);
      const data = await res.json();
      if (Array.isArray(data)) setCities(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchProperties(); }, []);

  const openPanel = () => { fetchPanelData(); setShowPanel(true); };
  const closePanel = () => { setShowPanel(false); resetForm(); };

  const resetForm = () => setForm({
    name: '', type: 'Villa', price: '', bedRooms: '', bathRooms: '',
    ownerId: '', countryId: '', stateId: '', cityId: '',
    location: '', about: '', checkIn: '11:00', checkOut: '10:00',
    rules: '', amenities: [], experiences: [], images: []
  });

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'countryId') fetchStates(value);
    if (field === 'stateId') fetchCities(value);
  };

  const toggleCheckbox = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const handleImageAdd = (e) => {
    const url = e.target.value.trim();
    if (url && form.images.length < 10) {
      setForm(prev => ({ ...prev, images: [...prev.images, url] }));
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.ownerId) { alert('Property name and owner are required.'); return; }
    setSubmitting(true);
    try {
      const selectedCity = cities.find(c => c._id === form.cityId);
      const selectedState = states.find(s => s._id === form.stateId);
      const payload = {
        name: form.name, type: form.type,
        price: Number(form.price), bedRooms: Number(form.bedRooms),
        bathRooms: Number(form.bathRooms), owner: form.ownerId,
        city: selectedCity?.cityName || '', state: selectedState?.stateName || '',
        location: form.location, about: form.about,
        checkIn: form.checkIn, checkOut: form.checkOut,
        rules: form.rules, amenities: form.amenities,
        experiences: form.experiences, images: form.images,
        status: 'Active'
      };
      const res = await fetch(`${API}/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) { closePanel(); fetchProperties(); }
      else { const d = await res.json(); alert(d.message || 'Failed to add property'); }
    } catch (err) { alert('Error adding property'); }
    finally { setSubmitting(false); }
  };

  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive Admin' : 'Active';
    try {
      await fetch(`${API}/properties/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      fetchProperties();
    } catch (err) { console.error(err); }
    setActionMenu(null);
  };

  return (
    <div className="fade-in" onClick={() => setActionMenu(null)}>
      {/* Breadcrumb */}
      <div className="props-breadcrumb" style={{ margin: '0 39px 12px' }}>
        Property Management &gt; <span>All Properties</span>
      </div>

      {/* Stats */}
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
            <div className="props-stat-icon-wrap red"><XCircle strokeWidth={2.5} /></div>
            <div className="props-stat-content">
              <div className="props-stat-label">Inactive (Admin)</div>
              <div className="props-stat-value">{stats.inactiveAdmin}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar + Table */}
      <div className="dash-section" style={{ marginBottom: 24, gap: 16 }}>
        <div className="chart-card" style={{ padding: '16px 20px', borderRadius: 12 }}>
          <div className="props-table-toolbar" style={{ margin: 0, borderBottom: 'none' }}>
            <div className="props-table-title">All Properties</div>
            <div className="props-table-actions">
              <div className="props-filter-select" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px' }}>
                <Calendar size={14} style={{ color: '#6B7280' }} />
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', color: '#374151', fontSize: 13, cursor: 'pointer' }} />
              </div>
              <div className="props-filter-select" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px' }}>
                <select value={propertyType} onChange={e => setPropertyType(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', color: '#374151', fontSize: 13, cursor: 'pointer' }}>
                  <option value="">All Types</option>
                  {['Villa','Homestay','Resort','Apartment','Cottage','Others'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button className="props-btn-filter" onClick={fetchProperties} style={{ cursor: 'pointer' }}>
                <Filter size={14} /> Filter
              </button>
              <div className="props-search-wrap">
                <Search size={14} />
                <input type="text" placeholder="Search properties..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchProperties()} />
              </div>
              <button className="props-btn-add" onClick={openPanel} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Plus size={16} /> Add Property
              </button>
            </div>
          </div>
        </div>

        <div className="chart-card" style={{ padding: 0, overflow: 'hidden', borderRadius: 12 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ whiteSpace: 'nowrap' }}>
              <thead>
                <tr>
                  {['Property No','Image','Property Name','Location','Category','Best Room Rate','Rooms','Total Enquiries','Rating','Status',''].map((h, i) => (
                    <th key={i} style={{ color: '#9CA3AF', fontWeight: 500 }}>{h}{h && i < 10 && <ChevronDown size={11} style={{ display: 'inline', marginLeft: 3 }} />}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="11" style={{ textAlign: 'center', padding: '30px 0', color: '#6B7280' }}>Loading properties...</td></tr>
                ) : properties.length === 0 ? (
                  <tr><td colSpan="11" style={{ textAlign: 'center', padding: '30px 0', color: '#6B7280' }}>No properties found</td></tr>
                ) : (
                  properties.map((p, i) => (
                    <tr key={p._id || i}>
                      <td style={{ color: '#58A429', fontWeight: 600 }}>{p.propertyNo || `PR-${1000 + i}`}</td>
                      <td>
                        <div style={{ width: 40, height: 30, background: '#E5E7EB', borderRadius: 6, overflow: 'hidden' }}>
                          <img src={p.image || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=100&q=80'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        </div>
                      </td>
                      <td style={{ color: '#111827', fontWeight: 500 }}>{p.propertyName || p.name}</td>
                      <td style={{ color: '#6B7280' }}>{p.city}{p.state ? `, ${p.state}` : ''}</td>
                      <td><span className="category-pill">{p.category || p.type}</span></td>
                      <td style={{ color: '#111827', fontWeight: 600 }}>₹{(p.bestRoomRate || p.price || 0).toLocaleString()}</td>
                      <td style={{ color: '#6B7280' }}>{p.rooms || p.bedRooms || '—'}</td>
                      <td style={{ color: '#6B7280' }}>{p.totalEnquiries ?? 0}</td>
                      <td style={{ color: '#6B7280' }}>{p.rating || '—'}</td>
                      <td>
                        <button onClick={() => toggleStatus(p._id, p.status)} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}>
                          {p.status === 'Active'
                            ? <span className="status-pill active"><CheckCircle2 size={11} /> Active</span>
                            : <span className="status-pill inactive"><XCircle size={11} /> Inactive</span>}
                        </button>
                      </td>
                      <td style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <button className="action-dots" onClick={() => setActionMenu(actionMenu === p._id ? null : p._id)}>
                          <MoreVertical size={14} />
                        </button>
                        {actionMenu === p._id && (
                          <div style={{ position: 'absolute', right: 8, top: 32, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 100, minWidth: 140 }}>
                            <button onClick={() => toggleStatus(p._id, p.status)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 16px', fontSize: 13, color: p.status === 'Active' ? '#EF4444' : '#58A429', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid #F3F4F6' }}>
                              {p.status === 'Active' ? '⊘ Deactivate' : '✓ Activate'}
                            </button>
                            <button onClick={() => setActionMenu(null)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 16px', fontSize: 13, color: '#374151', background: 'none', border: 'none', cursor: 'pointer' }}>
                              👁 View Details
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Property Side Panel */}
      {showPanel && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex' }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)' }} onClick={closePanel} />
          <div style={{ width: 680, background: '#fff', height: '100vh', overflowY: 'auto', boxShadow: '-8px 0 40px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
            {/* Panel Header */}
            <div style={{ padding: '20px 28px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>Add New Property</h2>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280' }}>Fill all details to list a property under an owner</p>
              </div>
              <button onClick={closePanel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={22} color="#6B7280" /></button>
            </div>

            {/* Panel Form */}
            <form onSubmit={handleSubmit} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>

              {/* Basic Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="form-label">Property Name *</label>
                  <input className="form-input" required placeholder="e.g. Whispering Palms Villa" value={form.name} onChange={e => handleFormChange('name', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Property Type *</label>
                  <select className="form-select" value={form.type} onChange={e => handleFormChange('type', e.target.value)}>
                    {['Villa','Homestay','Resort','Apartment','Cottage','Hotel'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label className="form-label">Price per Night (₹) *</label>
                  <input className="form-input" type="number" required placeholder="e.g. 8000" value={form.price} onChange={e => handleFormChange('price', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Bedrooms</label>
                  <input className="form-input" type="number" placeholder="e.g. 3" value={form.bedRooms} onChange={e => handleFormChange('bedRooms', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Bathrooms</label>
                  <input className="form-input" type="number" placeholder="e.g. 2" value={form.bathRooms} onChange={e => handleFormChange('bathRooms', e.target.value)} />
                </div>
              </div>

              {/* Owner Selection */}
              <div>
                <label className="form-label">Assign to Owner *</label>
                <select className="form-select" required value={form.ownerId} onChange={e => handleFormChange('ownerId', e.target.value)}>
                  <option value="">— Select Owner —</option>
                  {owners.map(o => <option key={o._id} value={o._id}>{o.ownerName || o.name} ({o.email})</option>)}
                </select>
              </div>

              {/* Location Cascade */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label className="form-label">Country</label>
                  <select className="form-select" value={form.countryId} onChange={e => handleFormChange('countryId', e.target.value)}>
                    <option value="">— Country —</option>
                    {countries.map(c => <option key={c._id} value={c._id}>{c.countryName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">State</label>
                  <select className="form-select" value={form.stateId} onChange={e => handleFormChange('stateId', e.target.value)}>
                    <option value="">— State —</option>
                    {states.map(s => <option key={s._id} value={s._id}>{s.stateName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">City</label>
                  <select className="form-select" value={form.cityId} onChange={e => handleFormChange('cityId', e.target.value)}>
                    <option value="">— City —</option>
                    {cities.map(c => <option key={c._id} value={c._id}>{c.cityName}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Specific Location / Area</label>
                <input className="form-input" placeholder="e.g. Calangute Beach Road" value={form.location} onChange={e => handleFormChange('location', e.target.value)} />
              </div>

              {/* Check-in/out */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="form-label">Check-in Time</label>
                  <input className="form-input" type="time" value={form.checkIn} onChange={e => handleFormChange('checkIn', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Check-out Time</label>
                  <input className="form-input" type="time" value={form.checkOut} onChange={e => handleFormChange('checkOut', e.target.value)} />
                </div>
              </div>

              {/* About */}
              <div>
                <label className="form-label">About Property</label>
                <textarea className="form-input" rows={3} placeholder="Describe this property..." value={form.about} onChange={e => handleFormChange('about', e.target.value)} style={{ resize: 'vertical' }} />
              </div>

              {/* Rules */}
              <div>
                <label className="form-label">House Rules</label>
                <textarea className="form-input" rows={2} placeholder="e.g. No smoking, Pets allowed..." value={form.rules} onChange={e => handleFormChange('rules', e.target.value)} style={{ resize: 'vertical' }} />
              </div>

              {/* Amenities */}
              {amenitiesList.length > 0 && (
                <div>
                  <label className="form-label">Amenities</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#F9FAFB', borderRadius: 8, padding: '12px 14px', border: '1px solid #E5E7EB' }}>
                    {amenitiesList.map(a => (
                      <label key={a._id} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, cursor: 'pointer', background: form.amenities.includes(a._id) ? '#DCFCE7' : '#fff', border: '1px solid', borderColor: form.amenities.includes(a._id) ? '#58A429' : '#E5E7EB', borderRadius: 6, padding: '4px 10px', transition: 'all 0.15s' }}>
                        <input type="checkbox" checked={form.amenities.includes(a._id)} onChange={() => toggleCheckbox('amenities', a._id)} style={{ accentColor: '#58A429' }} />
                        {a.amenitiesName}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Experiences */}
              {experiencesList.length > 0 && (
                <div>
                  <label className="form-label">Unique Experiences</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#F9FAFB', borderRadius: 8, padding: '12px 14px', border: '1px solid #E5E7EB' }}>
                    {experiencesList.map(ex => (
                      <label key={ex._id} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, cursor: 'pointer', background: form.experiences.includes(ex._id) ? '#EDE9FE' : '#fff', border: '1px solid', borderColor: form.experiences.includes(ex._id) ? '#7C3AED' : '#E5E7EB', borderRadius: 6, padding: '4px 10px', transition: 'all 0.15s' }}>
                        <input type="checkbox" checked={form.experiences.includes(ex._id)} onChange={() => toggleCheckbox('experiences', ex._id)} style={{ accentColor: '#7C3AED' }} />
                        {ex.experienceName || ex.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Images */}
              <div>
                <label className="form-label">Property Images (paste URL, up to 10)</label>
                <input className="form-input" type="url" placeholder="Paste image URL and press Enter" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleImageAdd(e); } }} onBlur={handleImageAdd} />
                {form.images.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    {form.images.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', width: 72, height: 52, borderRadius: 6, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button type="button" onClick={() => setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                          style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 16, height: 16, color: '#fff', cursor: 'pointer', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 12, borderTop: '1px solid #E5E7EB' }}>
                <button type="button" onClick={closePanel} style={{ padding: '10px 20px', border: '1px solid #D1D5DB', background: '#fff', color: '#374151', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} style={{ padding: '10px 24px', border: 'none', background: '#58A429', color: '#fff', borderRadius: 8, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 14, opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Saving...' : 'Save Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
