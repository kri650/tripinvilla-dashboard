import { useState, useEffect } from 'react';
import { Calendar, Filter, Search, MoreVertical, ChevronDown } from 'lucide-react';

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="fade-in">
      <div className="page-header" style={{ margin: '0 40px 12px' }}>
        <div style={{ fontSize: '14px', color: '#6B7280' }}>
          User Access &gt; <span style={{ color: '#111827', fontWeight: 600 }}>Enquiries</span>
        </div>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-header">
          <h2 className="admin-table-title">Enquiries</h2>
          <div className="admin-table-toolbar">
            <button className="admin-toolbar-btn">
              <Calendar size={14} /> Date From <ChevronDown size={14} />
            </button>
            <button className="admin-toolbar-btn">
              <Calendar size={14} /> Date To <ChevronDown size={14} />
            </button>
            <button className="admin-toolbar-btn">
              Property Type <ChevronDown size={14} />
            </button>
            <button className="admin-toolbar-btn">
              Location <ChevronDown size={14} />
            </button>
            <button className="admin-toolbar-btn filter">
              <Filter size={14} /> Filter
            </button>
            <div className="admin-toolbar-search">
              <Search size={14} />
              <input type="text" placeholder="Search" />
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Enquiry No <ChevronDown size={12} /></th>
                <th>Dates &amp; Time <ChevronDown size={12} /></th>
                <th>User Name <ChevronDown size={12} /></th>
                <th>Phone No <ChevronDown size={12} /></th>
                <th>Email Address <ChevronDown size={12} /></th>
                <th>Query <ChevronDown size={12} /></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#6B7280' }}>Loading enquiries...</td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#6B7280' }}>No enquiries found</td>
                </tr>
              ) : (
                enquiries.map((e, idx) => (
                  <tr key={e.enquiryNo || e.id || idx}>
                    <td><span className="admin-id-link">{e.enquiryNo || '1020251'}</span></td>
                    <td>{e.datesAndTime || e.date || '20 May - 12 PM to 1 Jun - 2 PM'}</td>
                    <td style={{ color: '#111827', fontWeight: 500 }}>{e.userName || e.name || 'Rohan Sharma'}</td>
                    <td>{e.phoneNo || e.phone || '993088272'}</td>
                    <td>{e.email || 'rohan@gmail.com'}</td>
                    <td style={{ maxWidth: '200px', whiteSpace: 'normal', lineHeight: '1.4' }}>{e.query || e.message || 'Want to know more about the cancellation policy and the refunds'}</td>
                    <td>
                      <button className="admin-action-dots">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
