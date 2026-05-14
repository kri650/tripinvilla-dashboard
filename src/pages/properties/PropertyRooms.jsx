import { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ClipboardList, Clock, CheckCircle2, Search, Filter, Edit2, Trash2, MoreVertical, Check, X, Eye } from 'lucide-react';

export default function PropertyRooms() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ totalProperties: 1540, pendingRequests: 224, rejectedRequests: 100 });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/property-requests');
      const data = await res.json();
      if (data && data.requests) {
        setRequests(data.requests);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching property requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/property-requests/${id}/accept`, { method: 'PUT' });
      if (res.ok) {
        fetchRequests();
        if (selectedRequest && selectedRequest._id === id) {
          setSelectedRequest(prev => ({ ...prev, status: 'Accepted' }));
        }
      }
    } catch (err) {
      console.error('Error accepting request:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/property-requests/${id}/reject`, { method: 'PUT' });
      if (res.ok) {
        fetchRequests();
        if (selectedRequest && selectedRequest._id === id) {
          setSelectedRequest(prev => ({ ...prev, status: 'Rejected' }));
        }
      }
    } catch (err) {
      console.error('Error rejecting request:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property request?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/property-requests/${id}`, { method: 'DELETE' });
      if (res.ok) fetchRequests();
    } catch (err) {
      console.error('Error deleting request:', err);
    }
  };

  const filteredRequests = requests.filter(r => 
    (r.propertyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.ownerName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fade-in">
      {/* Breadcrumb */}
      <div className="props-breadcrumb" style={{ margin: '0 39px 12px' }}>
        Property Management &gt; <span>Property Requests</span>
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
              <div className="props-stat-label">Property Request</div>
              <div className="props-stat-value">{stats.pendingRequests}</div>
            </div>
          </div>
          <div className="props-stat-card" style={{ margin: 0, borderRadius: 12 }}>
            <div className="props-stat-icon-wrap red"><CheckCircle2 strokeWidth={2.5} /></div>
            <div className="props-stat-content">
              <div className="props-stat-label">Rejected</div>
              <div className="props-stat-value">{stats.rejectedRequests}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="dash-section" style={{ marginBottom: 24, gap: 16 }}>
        
        {/* Toolbar */}
        <div className="chart-card" style={{ padding: '16px 20px', borderRadius: 12 }}>
          <div className="props-table-toolbar" style={{ margin: 0, borderBottom: 'none' }}>
            <div className="props-table-title">Property Requests</div>
            <div className="props-table-actions">
              <div className="props-search-wrap" style={{ width: 260 }}>
                <Search size={14} />
                <input 
                  type="text" 
                  placeholder="Search requests..." 
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
                  {['Request No','Image','Property Name','Location','Category','Owner Name','Owner Contact','Price by Owner','Status','Actions'].map((h, i) => (
                    <th key={i} style={{ color: '#9CA3AF', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="10" style={{ textAlign: 'center', padding: '30px 0', color: '#6B7280' }}>Loading requests...</td></tr>
                ) : filteredRequests.length === 0 ? (
                  <tr><td colSpan="10" style={{ textAlign: 'center', padding: '30px 0', color: '#6B7280' }}>No requests found</td></tr>
                ) : (
                  filteredRequests.map((p, i) => (
                    <tr key={p._id || i}>
                      <td style={{ color: '#58A429', fontWeight: 600, cursor: 'pointer' }} onClick={() => setSelectedRequest(p)}>{p.requestNo || `REQ-${3000 + i}`}</td>
                      <td onClick={() => setSelectedRequest(p)} style={{ cursor: 'pointer' }}>
                        <div style={{ width: 40, height: 30, background: '#E5E7EB', borderRadius: 6, overflow: 'hidden' }}>
                          <img src={p.image || "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=100&q=80"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        </div>
                      </td>
                      <td style={{ color: '#111827', fontWeight: 500, cursor: 'pointer' }} onClick={() => setSelectedRequest(p)}>{p.propertyName}</td>
                      <td style={{ color: '#6B7280', whiteSpace: 'pre-line', lineHeight: 1.4 }}>{p.location}</td>
                      <td><span className="category-pill">{p.category}</span></td>
                      <td style={{ color: '#6B7280' }}>{p.ownerName}</td>
                      <td style={{ color: '#6B7280' }}>{p.ownerContact}</td>
                      <td style={{ color: '#111827', fontWeight: 600 }}>{typeof p.priceByOwner === 'number' ? `₹${p.priceByOwner.toLocaleString()}` : `₹${p.priceByOwner}`}</td>
                      <td>
                        <span style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', 
                          background: p.status === 'Accepted' ? '#DCFCE7' : p.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7', 
                          color: p.status === 'Accepted' ? '#16A34A' : p.status === 'Rejected' ? '#EF4444' : '#D97706', 
                          borderRadius: 20, fontSize: 12, fontWeight: 600 
                        }}>
                          {p.status || 'NotAccepted'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button onClick={() => setSelectedRequest(p)} title="View Details" style={{ color: '#2563EB', background: '#DBEAFE', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex' }}>
                            <Eye size={15} strokeWidth={2.5} />
                          </button>
                          {p.status !== 'Accepted' && (
                            <button onClick={() => handleAccept(p._id)} title="Accept Request" style={{ color: '#16A34A', background: '#DCFCE7', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex' }}>
                              <Check size={15} strokeWidth={2.5} />
                            </button>
                          )}
                          {p.status !== 'Rejected' && (
                            <button onClick={() => handleReject(p._id)} title="Reject Request" style={{ color: '#EF4444', background: '#FEE2E2', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex' }}>
                              <X size={15} strokeWidth={2.5} />
                            </button>
                          )}
                          <button onClick={() => handleDelete(p._id)} title="Delete Request" style={{ color: '#6B7280', background: '#F3F4F6', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex' }}>
                            <Trash2 size={15} strokeWidth={2} />
                          </button>
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

      {/* Requested Property Details Modal (Matches Screenshot 1 exactly) */}
      {selectedRequest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 20, width: 860, maxWidth: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
            <button 
              onClick={() => setSelectedRequest(null)}
              style={{ position: 'absolute', top: 20, right: 20, background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E5E7EB', paddingBottom: 20, marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Requested Property Details</h3>
                <p style={{ fontSize: 13, color: '#6B7280', margin: '4px 0 0 0' }}>The property details of requested property</p>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button 
                  onClick={() => handleAccept(selectedRequest._id)}
                  style={{ background: '#58A429', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Check size={16} /> Accept Request
                </button>
                <button 
                  onClick={() => handleReject(selectedRequest._id)}
                  style={{ background: '#fff', color: '#EF4444', border: '1px solid #EF4444', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <X size={16} /> Reject
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 28, alignItems: 'flex-start' }}>
              <div style={{ width: '100%', height: 260, borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                <img src={selectedRequest.image || "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80"} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 }}>{selectedRequest.propertyName || "Aparthotel Stare Miasto, Deluxe"}</h2>
                  <p style={{ fontSize: 13, color: '#58A429', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#58A429' }}></span>
                    {selectedRequest.location || "Kasol, Himachal Pradesh, India"}
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>About Property</h4>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
                    {selectedRequest.about || "Experience a comfortable and refined stay at Azure Bay Hotel, located in the heart of the city and designed for both leisure and business travelers. The hotel offers thoughtfully designed rooms, modern amenities, and warm hospitality to ensure a relaxing and memorable stay. With easy access to popular attractions, dining spots, and transport hubs, Azure Bay Hotel is an ideal choice for a seamless travel."}
                  </p>
                </div>

                <div style={{ paddingTop: 12, borderTop: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>Price By Owner</span>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#58A429', marginTop: 2 }}>
                    {typeof selectedRequest.priceByOwner === 'number' ? `₹${selectedRequest.priceByOwner.toLocaleString()}` : `₹${selectedRequest.priceByOwner || '1,400'}`}/night
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
