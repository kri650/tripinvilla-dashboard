import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, ChevronDown, Calendar, MoreVertical, ChevronsUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CAT_COLORS = ['#9DC8B0', '#E8D5A0', '#2D6A6A', '#F09565', '#F0A0B0', '#C8C8C8'];

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, padding: '7px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }}>
      <p style={{ color: '#9CA3AF', marginBottom: 2 }}>{label}</p>
      <p style={{ fontWeight: 700, color: '#111827' }}>{payload[0].value} bookings</p>
    </div>
  );
}

function Th({ children }) {
  return (
    <th>
      <span className="th-inner">
        {children}
        <ChevronsUpDown className="sort-icon" style={{ width: 10, height: 10 }} />
      </span>
    </th>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEnquiriesToday: 128,
    activeProperties: 342,
    occupancyRate: 76,
    compareYesterday: { enquiries: "+4.6", properties: "-16.6", occupancy: "+16.6" }
  });
  const [bookingsData, setBookingsData] = useState([
    { month: 'Jan', v: 42 }, { month: 'Feb', v: 67 }, { month: 'Mar', v: 55 },
    { month: 'Apr', v: 89 }, { month: 'May', v: 74 }, { month: 'Jun', v: 98 },
    { month: 'Jul', v: 112 }, { month: 'Aug', v: 128 }, { month: 'Sep', v: 95 },
    { month: 'Oct', v: 108 }, { month: 'Nov', v: 87 }, { month: 'Dec', v: 120 }
  ]);
  const [categoryData, setCategoryData] = useState({
    total: 14324,
    categories: [
      { name: 'Apartments', count: 5820 },
      { name: 'Resorts',    count: 3104 },
      { name: 'Villas',     count: 2300 },
      { name: 'Homestays',  count: 1600 },
      { name: 'Cottages',   count: 900  },
      { name: 'Others',     count: 600  }
    ]
  });
  const [topProperties, setTopProperties] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('2026');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartRes, catRes, topRes, enqRes] = await Promise.all([
          fetch('http://localhost:5000/api/dashboard/stats').then(r => r.json()),
          fetch('http://localhost:5000/api/dashboard/enquiries-chart').then(r => r.json()),
          fetch('http://localhost:5000/api/dashboard/property-categories').then(r => r.json()),
          fetch('http://localhost:5000/api/dashboard/top-properties').then(r => r.json()),
          fetch('http://localhost:5000/api/dashboard/recent-enquiries').then(r => r.json())
        ]);

        if (statsRes && statsRes.activeProperties) setStats(statsRes);
        if (chartRes && Array.isArray(chartRes)) {
          setBookingsData(chartRes.map(item => ({ month: item.month, v: item.count })));
        }
        if (catRes && catRes.categories) setCategoryData(catRes);
        if (topRes && Array.isArray(topRes)) setTopProperties(topRes);
        if (enqRes && Array.isArray(enqRes)) setEnquiries(enqRes);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchData();
  }, []);

  const handleFilterClick = () => {
    const m = prompt('Enter Filter Year (e.g. 2026):', selectedMonth);
    if (m) setSelectedMonth(m);
  };

  return (
    <div className="fade-in">

      {/* ══ Section 1: Stat Cards ════════ */}
      <div className="dash-section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <div className="stat-card">
            <div className="stat-card-label">Total Bookings (Today)</div>
            <div className="stat-card-value">{stats.totalEnquiriesToday}</div>
            <div className="stat-card-meta">
              <span className={`stat-badge ${stats.compareYesterday.enquiries.startsWith('-') ? 'down' : 'up'}`}>
                {stats.compareYesterday.enquiries.startsWith('-') ? <TrendingDown size={10} /> : <TrendingUp size={10} />} {stats.compareYesterday.enquiries}%
              </span>
              <span className="stat-card-sub">Compared to yesterday</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Active Properties</div>
            <div className="stat-card-value">{stats.activeProperties}</div>
            <div className="stat-card-meta">
              <span className={`stat-badge ${stats.compareYesterday.properties.startsWith('-') ? 'down' : 'up'}`}>
                {stats.compareYesterday.properties.startsWith('-') ? <TrendingDown size={10} /> : <TrendingUp size={10} />} {stats.compareYesterday.properties}%
              </span>
              <span className="stat-card-sub">Compared to yesterday</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Occupancy Rate</div>
            <div className="stat-card-value">{stats.occupancyRate}%</div>
            <div className="stat-card-meta">
              <span className={`stat-badge ${stats.compareYesterday.occupancy.startsWith('-') ? 'down' : 'up'}`}>
                {stats.compareYesterday.occupancy.startsWith('-') ? <TrendingDown size={10} /> : <TrendingUp size={10} />} {stats.compareYesterday.occupancy}%
              </span>
              <span className="stat-card-sub">Compared to yesterday</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ Section 2: Charts ════════════ */}
      <div className="dash-section">
        <div className="charts-row">

          {/* Bar chart */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div className="chart-card-title">Bookings Over Time</div>
              <button className="chart-filter" onClick={handleFilterClick} style={{ cursor: 'pointer' }}>
                <Calendar size={12} /> {selectedMonth} <ChevronDown size={11} />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={bookingsData} barSize={36} margin={{ top: 12, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(37,99,235,0.04)' }} />
                <Bar dataKey="v" fill="#2563EB" radius={[8, 8, 0, 0]} background={{ fill: '#F3F4F6', radius: [8, 8, 0, 0] }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Donut chart */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div className="chart-card-title">Property Category</div>
            </div>
            <div style={{ position: 'relative', marginTop: 8 }}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={categoryData.categories}
                    cx="50%" cy="50%"
                    innerRadius={74} outerRadius={110}
                    dataKey="count" strokeWidth={3} stroke="#fff"
                  >
                    {categoryData.categories.map((_, i) => (
                      <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: '#111827', lineHeight: 1 }}>
                  {categoryData.total.toLocaleString()}
                </span>
                <span style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Properties</span>
              </div>
            </div>
            {/* Legend */}
            <div className="donut-legend" style={{ marginTop: 20 }}>
              {categoryData.categories.map((d, i) => (
                <div className="legend-item" key={d.name}>
                  <div className="legend-dot" style={{ background: CAT_COLORS[i % CAT_COLORS.length] }} />
                  <span className="legend-label">{d.name} ({d.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ Section 3: Property List ══════ */}
      <div className="dash-section">
        <div className="chart-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-header" style={{ padding: '14px 20px' }}>
            <span className="table-title">Property List Top 10</span>
            <div className="table-header-right">
              <button className="table-view-all" onClick={() => navigate('/admin/properties/all')} style={{ cursor: 'pointer' }}>View All</button>
              <button className="chart-filter" onClick={handleFilterClick} style={{ cursor: 'pointer' }}>
                <Calendar size={12} /> {selectedMonth} <ChevronDown size={11} />
              </button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <Th>Property No</Th>
                  <th style={{ color: '#9CA3AF', fontWeight: 500, fontSize: 11 }}>Image</th>
                  <Th>Property Name</Th>
                  <Th>Location</Th>
                  <Th>Category</Th>
                  <Th>Best Room Rate</Th>
                  <Th>Rooms</Th>
                  <Th>Total Bookings</Th>
                  <Th>Cancelled</Th>
                  <Th>Rating</Th>
                  <Th>Status</Th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {topProperties.map((p) => (
                  <tr key={p.id || p.propertyNo}>
                    <td><span className="prop-id-link" onClick={() => navigate('/admin/properties/all')} style={{ cursor: 'pointer' }}>{p.propertyNo}</span></td>
                    <td>
                      <div className="prop-thumb-placeholder">
                        <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    </td>
                    <td style={{ fontWeight: 500, color: '#111827' }}>{p.name}</td>
                    <td><div className="location-text">{p.location}</div></td>
                    <td><span className="category-pill">{p.category}</span></td>
                    <td style={{ fontWeight: 600, color: '#111827' }}>{typeof p.bestRoomRate === 'number' ? `₹${p.bestRoomRate.toLocaleString()}` : p.bestRoomRate}</td>
                    <td>{p.rooms}</td>
                    <td>{p.totalBookings}</td>
                    <td>{p.cancelled}</td>
                    <td style={{ color: '#374151' }}>{p.rating}</td>
                    <td>
                      <span className={`status-pill ${p.status === 'Active' ? 'active' : 'inactive'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <button className="action-dots" onClick={() => navigate('/admin/properties/all')} style={{ cursor: 'pointer' }}><MoreVertical size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ══ Section 4: Enquiries ══════════ */}
      <div className="dash-section" style={{ marginBottom: 24 }}>
        <div className="chart-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-header" style={{ padding: '14px 20px' }}>
            <span className="table-title">Enquires</span>
            <div className="table-header-right">
              <button className="table-view-all" onClick={() => navigate('/admin/enquiries')} style={{ cursor: 'pointer' }}>View All</button>
              <button className="chart-filter" onClick={handleFilterClick} style={{ cursor: 'pointer' }}>
                <Calendar size={12} /> {selectedMonth} <ChevronDown size={11} />
              </button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <Th>Enquiry No</Th>
                  <Th>Dates &amp; Time</Th>
                  <Th>User Name</Th>
                  <Th>Phone No</Th>
                  <Th>Email Address</Th>
                  <Th>Query</Th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((e) => (
                  <tr key={e.enquiryNo || e.id}>
                    <td><span className="prop-id-link" onClick={() => navigate('/admin/enquiries')} style={{ cursor: 'pointer' }}>{e.enquiryNo || e.id}</span></td>
                    <td style={{ fontSize: 11, color: '#6B7280' }}>{e.datesAndTime || e.datetime}</td>
                    <td style={{ fontWeight: 500, color: '#111827' }}>{e.userName || e.user}</td>
                    <td>{e.phoneNo || e.phone}</td>
                    <td style={{ color: '#2563EB' }}>{e.email}</td>
                    <td style={{ maxWidth: 220, whiteSpace: 'normal', fontSize: 11, color: '#6B7280', lineHeight: 1.4 }}>{e.query}</td>
                    <td>
                      <button className="action-dots" onClick={() => navigate('/admin/enquiries')} style={{ cursor: 'pointer' }}><MoreVertical size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
