import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import {
  Users, Layers, Clock, Eye, Mail, DollarSign,
  TrendingUp, Activity, ShieldAlert, LogOut, CheckCircle2,
  XCircle, FileText, ExternalLink, Calendar, MessageSquare, AlertCircle
} from 'lucide-react';

// Register ChartJS components for Pie chart
ChartJS.register(ArcElement, Tooltip, Legend);

const BASE = import.meta.env.VITE_API_URL || '';

const AdminListings = () => {
  const { user, logout, addNotification } = useAuth();

  // Tab State: 'overview' | 'properties' | 'users' | 'messages'
  const [activeTab, setActiveTab] = useState('overview');

  // Loading & Data States
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeListings: 0,
    pendingListings: 0,
    totalViews: 0,
    totalMessages: 0,
    soldListings: 0
  });
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);

  // Filter States
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals & Action overlays
  const [rejectOverlay, setRejectOverlay] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [activeListing, setActiveListing] = useState(null);
  const [viewDetailsOverlay, setViewDetailsOverlay] = useState(false);

  // ── Data Loading ───────────────────────────────────────────────────────────

  const loadStats = async () => {
    try {
      const res = await fetch(`${BASE}/api/admin/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Failed to load admin stats:', e);
    }
  };

  const loadProperties = async () => {
    try {
      const res = await fetch(`${BASE}/api/properties/all`);
      if (res.ok) {
        const data = await res.json();
        setProperties(data);
      }
    } catch (e) {
      console.error('Failed to load admin properties:', e);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch(`${BASE}/api/admin/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error('Failed to load admin users:', e);
    }
  };

  const loadMessages = async () => {
    try {
      const res = await fetch(`${BASE}/api/contact/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error('Failed to load admin messages:', e);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([loadStats(), loadProperties(), loadUsers(), loadMessages()]);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadAllData();
    }
  }, [user]);

  // ── Action Handlers ────────────────────────────────────────────────────────

  const handleApprove = async (id, title) => {
    if (!window.confirm(`Approve property: "${title}"?`)) return;
    try {
      const res = await fetch(`${BASE}/api/properties/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' })
      });
      if (res.ok) {
        addNotification(`Approved "${title}" successfully!`, 'success');
        loadAllData();
      } else {
        addNotification('Failed to approve property.', 'error');
      }
    } catch (err) {
      console.error(err);
      addNotification('Error approving property.', 'error');
    }
  };

  const handleMarkAsSold = async (id, title) => {
    if (!window.confirm(`Mark property "${title}" as sold?`)) return;
    try {
      const res = await fetch(`${BASE}/api/properties/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SOLD' })
      });
      if (res.ok) {
        addNotification(`Marked "${title}" as SOLD!`, 'success');
        loadAllData();
      } else {
        addNotification('Failed to mark property as sold.', 'error');
      }
    } catch (err) {
      console.error(err);
      addNotification('Error marking property as sold.', 'error');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim() || !activeListing) return;
    const id = activeListing._id || activeListing.id;
    try {
      const res = await fetch(`${BASE}/api/properties/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', reason: rejectReason })
      });
      if (res.ok) {
        addNotification(`Rejected "${activeListing.title}" — discrepancy submitted.`, 'info');
        setRejectOverlay(false);
        setRejectReason('');
        loadAllData();
      } else {
        addNotification('Failed to reject property.', 'error');
      }
    } catch (err) {
      console.error(err);
      addNotification('Error rejecting property.', 'error');
    }
  };

  const handleMarkMessageRead = async (id) => {
    try {
      const res = await fetch(`${BASE}/api/contact/messages/${id}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true })
      });
      if (res.ok) {
        addNotification('Message marked as read.', 'success');
        loadAllData();
      }
    } catch (err) {
      console.error('Failed to mark message read:', err);
    }
  };

  // ── Role Gate ─────────────────────────────────────────────────────────────

  if (!user || user.role !== 'ADMIN') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass text-center" style={{ padding: '4rem 3rem', maxWidth: '440px', borderRadius: '16px' }}>
          <ShieldAlert size={52} style={{ color: 'var(--accent-error)', marginBottom: '1.25rem' }} />
          <h2 style={{ color: 'var(--accent-error)', marginBottom: '0.5rem' }}>Access Denied</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            You do not have credentials to access the VESTA compliance panel. Please sign in with an administrator role.
          </p>
        </div>
      </div>
    );
  }

  // ── Pie Chart Configuration ───────────────────────────────────────────────

  const typeCounts = properties.reduce((acc, p) => {
    const type = p.propertyType || 'PLOT';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const typeLabels = Object.keys(typeCounts);
  const typeData = Object.values(typeCounts);

  const pieData = {
    labels: typeLabels.length > 0 ? typeLabels : ['PLOT', 'AGRICULTURAL', 'COMMERCIAL'],
    datasets: [
      {
        data: typeData.length > 0 ? typeData : [5, 2, 3],
        backgroundColor: [
          'rgba(79, 70, 229, 0.75)',  // indigo
          'rgba(6, 182, 212, 0.75)',  // cyan
          'rgba(139, 92, 246, 0.75)', // violet
          'rgba(245, 158, 11, 0.75)',  // amber
          'rgba(239, 68, 68, 0.75)'    // rose
        ],
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1
      }
    ]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#e4e4e7',
          font: { size: 11 }
        }
      }
    }
  };

  // Filter properties by status
  const filteredProperties = properties.filter(p => {
    if (statusFilter === 'All') return true;
    return p.status === statusFilter;
  });

  return (
    <div style={{ minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem' }}>
      <div className="container">

        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', margin: 0 }} className="text-gradient">VESTA Admin Control Panel</h2>
            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)' }}>
              Evaluate deed logs, survey files, registered users, and system compliance messages.
            </p>
          </div>
          <button onClick={logout} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', alignSelf: 'center' }}>
            <LogOut size={14} />
            <span>Admin Logout</span>
          </button>
        </div>

        {/* 6 Stats Bar Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {/* Card 1 */}
          <div className="glass" style={{ padding: '1.25rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>TOTAL USERS</span>
              <Users size={16} style={{ color: 'var(--accent-secondary)' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{stats.totalUsers}</div>
          </div>
          {/* Card 2 */}
          <div className="glass" style={{ padding: '1.25rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>ACTIVE LISTINGS</span>
              <Layers size={16} style={{ color: 'var(--accent-secondary)' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{stats.activeListings}</div>
          </div>
          {/* Card 3 */}
          <div className="glass" style={{ padding: '1.25rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>PENDING REVIEW</span>
              <Clock size={16} style={{ color: 'var(--accent-gold)' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{stats.pendingListings}</div>
          </div>
          {/* Card 4 */}
          <div className="glass" style={{ padding: '1.25rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>TOTAL VIEWS</span>
              <Eye size={16} style={{ color: 'var(--accent-secondary)' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{stats.totalViews}</div>
          </div>
          {/* Card 5 */}
          <div className="glass" style={{ padding: '1.25rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>MESSAGES</span>
              <Mail size={16} style={{ color: 'var(--accent-secondary)' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{stats.totalMessages}</div>
          </div>
          {/* Card 6 */}
          <div className="glass" style={{ padding: '1.25rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>PROPERTIES SOLD</span>
              <DollarSign size={16} style={{ color: '#10b981' }} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{stats.soldListings}</div>
          </div>
        </div>

        {/* Tab Headers */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'properties', label: 'Properties' },
            { key: 'users', label: 'Users' },
            { key: 'messages', label: 'Messages' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '0.75rem 1.5rem',
                fontSize: '0.95rem', fontWeight: 500,
                color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.key ? '2px solid var(--accent-primary)' : '2px solid transparent',
                marginBottom: '-1px',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
            <div className="loader" style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Synchronizing compliance records...</p>
          </div>
        ) : (
          <>
            {/* ── OVERVIEW TAB ────────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                {/* Left Panel: Recent Activity */}
                <div className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                    Recent Activity
                  </h3>
                  
                  {/* Latest listings */}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '10px' }}>
                      Latest Property Listings
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {properties.slice(0, 5).map(p => (
                        <div key={p._id || p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <div style={{ minWidth: 0, flexGrow: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'white' }}>{p.title}</div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{p.locality}, {p.city}</span>
                          </div>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: p.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : p.status === 'PENDING' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                            color: p.status === 'ACTIVE' ? '#10b981' : p.status === 'PENDING' ? '#f59e0b' : '#ef4444'
                          }}>
                            {p.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Latest users */}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '10px' }}>
                      Newly Joined Users
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {users.slice(0, 5).map(u => (
                        <div key={u._id || u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'white' }}>{u.name}</div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{u.email}</span>
                          </div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--accent-secondary)' }}>{u.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Panel: Chart */}
                <div className="glass purple-glow" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '400px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', marginBottom: '1.5rem' }}>
                    Properties by Type
                  </h3>
                  <div style={{ flexGrow: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Pie data={pieData} options={pieOptions} />
                  </div>
                </div>
              </div>
            )}

            {/* ── PROPERTIES TAB ──────────────────────────────────────────────── */}
            {activeTab === 'properties' && (
              <div className="glass" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Properties Table</h3>
                  {/* Filter Status */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['All', 'PENDING', 'ACTIVE', 'REJECTED', 'SOLD'].map(st => (
                      <button
                        key={st}
                        className={`btn btn-xs ${statusFilter === st ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setStatusFilter(st)}
                        style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', background: statusFilter === st ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'transparent' }}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>IMAGE</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>TITLE</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>LOCATION</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>PRICE</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>TYPE</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>STATUS</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>VIEWS</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProperties.map(p => {
                        const price = p.askingPrice ? `₹${(p.askingPrice / 10000000).toFixed(2)} Cr` : '—';
                        const thumbnail = p.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=150&q=80';
                        return (
                          <tr key={p._id || p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'middle' }}>
                            <td style={{ padding: '12px 8px' }}>
                              <img src={thumbnail} alt="prop" style={{ width: '45px', height: '35px', objectFit: 'cover', borderRadius: '4px' }} />
                            </td>
                            <td style={{ padding: '12px 8px', fontWeight: 600, color: 'white' }}>{p.title}</td>
                            <td style={{ padding: '12px 8px', fontSize: '0.85rem' }}>{p.city}, {p.state}</td>
                            <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{price}</td>
                            <td style={{ padding: '12px 8px' }}>
                              <span style={{ fontSize: '0.72rem', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                {p.propertyType}
                              </span>
                            </td>
                            <td style={{ padding: '12px 8px' }}>
                              <span style={{
                                fontSize: '0.72rem',
                                padding: '3px 8px',
                                borderRadius: '50px',
                                display: 'inline-block',
                                background: p.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : p.status === 'PENDING' ? 'rgba(245,158,11,0.1)' : p.status === 'SOLD' ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.1)',
                                color: p.status === 'ACTIVE' ? '#10b981' : p.status === 'PENDING' ? '#f59e0b' : p.status === 'SOLD' ? '#3b82f6' : '#ef4444'
                              }}>
                                {p.status}
                              </span>
                            </td>
                            <td style={{ padding: '12px 8px', fontSize: '0.85rem' }}>{p.viewsCount || 0}</td>
                            <td style={{ padding: '12px 8px', display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                              <button
                                className="btn btn-outline"
                                style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                                onClick={() => {
                                  setActiveListing(p);
                                  setViewDetailsOverlay(true);
                                }}
                              >
                                View Specs
                              </button>
                              {(p.status === 'PENDING' || p.status === 'REJECTED') && (
                                <button
                                  className="btn"
                                  style={{ padding: '4px 8px', fontSize: '0.72rem', background: '#10b981', color: 'white', border: 'none' }}
                                  onClick={() => handleApprove(p._id || p.id, p.title)}
                                >
                                  Approve
                                </button>
                              )}
                              {(p.status === 'PENDING' || p.status === 'ACTIVE') && (
                                <button
                                  className="btn"
                                  style={{ padding: '4px 8px', fontSize: '0.72rem', background: '#ef4444', color: 'white', border: 'none' }}
                                  onClick={() => {
                                    setActiveListing(p);
                                    setRejectOverlay(true);
                                  }}
                                >
                                  Reject
                                </button>
                              )}
                              {p.status === 'ACTIVE' && (
                                <button
                                  className="btn"
                                  style={{ padding: '4px 8px', fontSize: '0.72rem', background: 'var(--accent-secondary)', color: 'black', border: 'none' }}
                                  onClick={() => handleMarkAsSold(p._id || p.id, p.title)}
                                >
                                  Mark Sold
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── USERS TAB ──────────────────────────────────────────────────── */}
            {activeTab === 'users' && (
              <div className="glass" style={{ padding: '2rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', marginBottom: '1.5rem' }}>Registered Users Table</h3>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>NAME</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>EMAIL</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ROLE</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>JOINED DATE</th>
                        <th style={{ padding: '12px 8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => {
                        const date = u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—';
                        return (
                          <tr key={u._id || u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '12px 8px', fontWeight: 600, color: 'white' }}>{u.name}</td>
                            <td style={{ padding: '12px 8px' }}>{u.email}</td>
                            <td style={{ padding: '12px 8px' }}>
                              <span style={{ fontSize: '0.72rem', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                {u.role}
                              </span>
                            </td>
                            <td style={{ padding: '12px 8px', fontSize: '0.85rem' }}>{date}</td>
                            <td style={{ padding: '12px 8px' }}>
                              <span style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle2 size={12} /> Active
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── MESSAGES TAB ───────────────────────────────────────────────── */}
            {activeTab === 'messages' && (
              <>
                {messages.length === 0 ? (
                  <div className="glass text-center" style={{ padding: '5rem 2rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <MessageSquare size={56} className="text-secondary" style={{ marginBottom: '1rem' }} />
                    <h3>No User Messages Found</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      All clean. No contact enquiries have been submitted.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                    {messages.map((msg, idx) => {
                      const date = msg.createdAt
                        ? new Date(msg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—';
                      const mailtoLink = `mailto:${msg.email}?subject=Re: Your VESTA Query`;
                      return (
                        <div
                          key={msg._id || idx}
                          className="glass"
                          style={{
                            padding: '1.75rem',
                            borderRadius: '14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            border: msg.read ? '1px solid rgba(255,255,255,0.04)' : '1px solid var(--accent-primary)',
                            background: msg.read ? 'rgba(255,255,255,0.01)' : 'rgba(79,70,229,0.03)'
                          }}
                        >
                          {/* Sender details */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(79,70,229,0.4), rgba(139,92,246,0.4))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>
                              {(msg.name || 'U')[0].toUpperCase()}
                            </div>
                            <div style={{ minWidth: 0, flexGrow: 1 }}>
                              <div style={{ fontWeight: 600, color: 'white', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.name || 'Unknown'}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--accent-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.email}</div>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{date}</span>
                          </div>

                          {/* Message bubble */}
                          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.9rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, border: '1px solid rgba(255,255,255,0.05)' }}>
                            {msg.message}
                          </div>

                          {/* Action panel */}
                          <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                            <a
                              href={mailtoLink}
                              className="btn btn-outline btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px', textDecoration: 'none', flexGrow: 1 }}
                            >
                              <Mail size={14} />
                              Reply
                            </a>
                            {!msg.read && (
                              <button
                                className="btn btn-sm btn-primary"
                                style={{ flexGrow: 1, background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', border: 'none' }}
                                onClick={() => handleMarkMessageRead(msg._id || msg.id)}
                              >
                                Mark Read
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}

      </div>

      {/* Rejection Modal overlay */}
      {rejectOverlay && activeListing && (
        <div className="modal-overlay active" onClick={() => setRejectOverlay(false)}>
          <div className="modal-content glass auth-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px', background: 'rgba(15,15,20,0.95)' }}>
            <button className="modal-close" onClick={() => setRejectOverlay(false)}>&times;</button>
            <h3 style={{ color: 'var(--accent-error)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <XCircle size={20} /> Reject Listing Submission
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Submit compliance discrepancies to notify the seller for correction.
            </p>
            <form onSubmit={handleRejectSubmit}>
              <div className="form-group">
                <label>Rejection Audit Notes</label>
                <textarea
                  rows="4"
                  placeholder="State details e.g. Encumbrance Certificate mismatch..."
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}
                />
              </div>
              <button type="submit" className="btn btn-primary w-100 mt-4" style={{ background: 'linear-gradient(135deg, var(--accent-error), #be123c)', border: 'none' }}>
                Confirm Rejection
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal overlay */}
      {viewDetailsOverlay && activeListing && (
        <div className="modal-overlay active" onClick={() => setViewDetailsOverlay(false)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', background: 'rgba(15,15,20,0.95)', overflowY: 'auto', maxHeight: '90vh' }}>
            <button className="modal-close" onClick={() => setViewDetailsOverlay(false)}>&times;</button>
            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }} className="text-gradient">
              {activeListing.title} Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SURVEY NUMBER</span>
                <div style={{ fontWeight: 'bold' }}>{activeListing.surveyNumber || 'N/A'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AREA / BOUNDARIES</span>
                <div style={{ fontWeight: 'bold' }}>{activeListing.area} {activeListing.areaUnit}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>LOCATION</span>
                <div style={{ fontWeight: 'bold' }}>{activeListing.locality}, {activeListing.city}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TYPE</span>
                <div style={{ fontWeight: 'bold' }}>{activeListing.propertyType}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>PRICE</span>
                <div style={{ fontWeight: 'bold' }}>₹{(activeListing.askingPrice / 10000000).toFixed(2)} Cr</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>STATUS</span>
                <div style={{ fontWeight: 'bold' }}>{activeListing.status}</div>
              </div>
            </div>

            {/* Document Verification checklist */}
            {activeListing.documents?.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>UPLOADED DEED PASSBOOKS</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {activeListing.documents.map((doc, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontSize: '0.85rem' }}>{doc.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', fontWeight: 'bold' }}>{doc.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline w-100" onClick={() => setViewDetailsOverlay(false)}>Close</button>
              <a href={`/property/${activeListing._id || activeListing.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-100 text-center" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>
                <span>Public Listing Page</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminListings;
