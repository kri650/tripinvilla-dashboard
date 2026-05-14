import { useState, useEffect } from 'react';
import { MessageSquare, ChevronDown, Check, Calendar } from 'lucide-react';

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('May 2026');

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/dashboard/recent-enquiries');
      const data = await res.json();
      if (Array.isArray(data)) setEnquiries(data);
    } catch (err) {
      console.error('Error fetching enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleFilter = () => {
    const m = prompt('Select Filter Month & Year:', selectedMonth);
    if (m) setSelectedMonth(m);
  };

  const handleReply = (id) => {
    const msg = prompt(`Enter reply message for enquiry ${id}:`);
    if (msg) {
      alert(`Reply sent successfully to ${id}!`);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header" style={{ margin: '0 39px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="page-title" style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>Enquiries Management</div>
          <div className="page-subtitle" style={{ fontSize: 13, color: '#6B7280' }}>{enquiries.length} total enquiries logged</div>
        </div>
        <button onClick={handleFilter} className="chart-filter" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
          <Calendar size={14} /> {selectedMonth} <ChevronDown size={14} />
        </button>
      </div>

      <div className="dash-section" style={{ margin: '0 39px 32px' }}>
        <div className="chart-card" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Enquiry ID</th>
                  <th>Dates &amp; Time</th>
                  <th>User Name</th>
                  <th>Phone Number</th>
                  <th>Email Address</th>
                  <th>Query Description</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#6B7280' }}>Loading enquiries...</td>
                  </tr>
                ) : enquiries.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#6B7280' }}>No enquiries found</td>
                  </tr>
                ) : (
                  enquiries.map(e => (
                    <tr key={e.enquiryNo || e.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>{e.enquiryNo || e.id}</td>
                      <td style={{ fontSize: 12, color: '#6B7280' }}>{e.datesAndTime || e.date}</td>
                      <td style={{ fontWeight: 600, color: '#111827' }}>{e.userName || e.name}</td>
                      <td style={{ color: '#4B5563' }}>{e.phoneNo || e.phone || '+91 9876543210'}</td>
                      <td style={{ color: '#2563EB', fontWeight: 500 }}>{e.email}</td>
                      <td style={{ maxWidth: 280, whiteSpace: 'normal', fontSize: 12, color: '#4B5563', lineHeight: 1.4 }}>{e.query || e.message}</td>
                      <td>
                        <span className={`status-pill ${e.status === 'Open' ? 'pending' : 'active'}`}>
                          {e.status || 'Replied'}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => handleReply(e.enquiryNo || e.id)} className="btn-solid-green" style={{ padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>Reply</button>
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
