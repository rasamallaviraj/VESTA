import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck, CheckCircle, AlertOctagon, XCircle,
  FileText, ShieldAlert, Mail, MessageSquare, LogOut, ShieldOff
} from 'lucide-react';

const BASE = import.meta.env.VITE_API_URL || '';


// ─── Main Dashboard ────────────────────────────────────────────────────────────
const AdminListings = () => {
  const { user, logout, addNotification } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'concerns'

  // Listings tab state
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [activeListing, setActiveListing] = useState(null);
  const [rejectOverlay, setRejectOverlay] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Concerns tab state
  const [concerns, setConcerns] = useState([]);
  const [loadingConcerns, setLoadingConcerns] = useState(false);

  // ── Data fetching ─────────────────────────────────────────────────────────

  const loadPending = async () => {
    setLoadingListings(true);
    try {
      const res = await fetch(`${BASE}/api/properties/pending`);
      if (!res.ok) throw new Error('Failed to fetch pending listings');
      const data = await res.json();
      setListings(data);
      if (data.length > 0) setActiveListing(data[0]);
      else setActiveListing(null);
    } catch (e) {
      console.error(e);
      addNotification('Could not load pending listings.', 'error');
    } finally {
      setLoadingListings(false);
    }
  };

  const loadConcerns = async () => {
    setLoadingConcerns(true);
    try {
      const res = await fetch(`${BASE}/api/contact/messages`);
      if (!res.ok) throw new Error('Failed to fetch contact messages');
      const data = await res.json();
      setConcerns(data);
    } catch (e) {
      console.error(e);
      addNotification('Could not load contact messages.', 'error');
    } finally {
      setLoadingConcerns(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    loadPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    if (activeTab === 'concerns' && concerns.length === 0) {
      loadConcerns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user]);

  // ── Actions ───────────────────────────────────────────────────────────────


  const updateListingStatus = async (id, status, reason = '') => {
    const res = await fetch(`${BASE}/api/properties/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reason })
    });
    if (!res.ok) throw new Error('Status update failed');
    return res.json();
  };

  const handleApprove = async (id, title) => {
    if (!window.confirm(`Approve "${title}"?`)) return;
    try {
      await updateListingStatus(id, 'ACTIVE');
      addNotification(`Approved "${title}" — listing is now live.`, 'success');
      loadPending();
    } catch {
      addNotification('Approval failed.', 'error');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;
    try {
      await updateListingStatus(activeListing._id || activeListing.id, 'REJECTED', rejectReason);
      addNotification(`Rejected "${activeListing.title}" — seller notified.`, 'info');
      setRejectOverlay(false);
      setRejectReason('');
      loadPending();
    } catch {
      addNotification('Rejection failed.', 'error');
    }
  };

  const handleRequestInfo = (title) => {
    addNotification(`Requested supplementary documents for "${title}".`, 'success');
  };

  // ── Role Gate ─────────────────────────────────────────────────────────────

  if (!user || user.role !== 'ADMIN') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass text-center" style={{ padding: '4rem 3rem', maxWidth: '420px', borderRadius: '16px' }}>
          <ShieldOff size={52} style={{ color: 'var(--accent-error)', marginBottom: '1.25rem' }} />
          <h2 style={{ color: 'var(--accent-error)', marginBottom: '0.5rem' }}>Access Denied</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            You do not have permission to access this page. Please log in with an admin account.
          </p>
        </div>
      </div>
    );
  }

  // ── Tab: Shared tab bar ───────────────────────────────────────────────────

  const tabBar = (
    <div style={{ display: 'flex', gap: '0', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      {[
        { key: 'listings', label: 'Pending Listings', icon: <ShieldCheck size={15} /> },
        { key: 'concerns', label: 'User Concerns',    icon: <MessageSquare size={15} /> }
      ].map(tab => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '0.75rem 1.5rem',
            fontSize: '0.9rem', fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
            borderBottom: activeTab === tab.key
              ? '2px solid var(--accent-primary)'
              : '2px solid transparent',
            marginBottom: '-1px',
            transition: 'all 0.2s ease'
          }}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );

  // ── Tab: Pending Listings ─────────────────────────────────────────────────

  const listingsTab = (
    <>
      {loadingListings ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
          <div className="loader" style={{ width: '40px', height: '40px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Retrieving pending audit registers...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="glass text-center" style={{ padding: '5rem 2rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <ShieldCheck size={56} className="text-secondary" style={{ marginBottom: '1rem' }} />
          <h3>All Pending Audits Completed</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            No property listings are currently under compliance review.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1.2fr))', gap: '2rem' }}>

          {/* Left: Queue */}
          <div className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h4 style={{ margin: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
              Pending Audit Queue ({listings.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {listings.map(p => {
                const pid = p._id || p.id;
                const aid = activeListing?._id || activeListing?.id;
                const isActive = pid === aid;
                return (
                  <div
                    key={pid}
                    className={`glass ${isActive ? 'accent-glow' : ''}`}
                    onClick={() => setActiveListing(p)}
                    style={{
                      padding: '1.25rem',
                      background: isActive ? 'rgba(79,70,229,0.05)' : 'rgba(255,255,255,0.01)',
                      border: isActive ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '10px', cursor: 'pointer',
                      display: 'flex', gap: '12px', alignItems: 'center'
                    }}
                  >
                    {p.images?.[0] && (
                      <img src={p.images[0]} alt={p.title} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} />
                    )}
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <h5 style={{ margin: 0, fontSize: '0.95rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.title}
                      </h5>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {p.propertyType} | {p.city}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Detail */}
          {activeListing && (
            <div className="glass accent-glow" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '1.3rem', color: 'white' }}>{activeListing.title}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Survey No: <strong>{activeListing.surveyNumber}</strong> | Area: <strong>{activeListing.area} {activeListing.areaUnit}</strong> | <strong>{activeListing.locality}, {activeListing.city}</strong>
                </div>
              </div>

              {activeListing.documents?.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>UPLOADED DEED PASSBOOKS</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activeListing.documents.map((doc, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={16} className="text-secondary" />
                          <span style={{ fontSize: '0.85rem' }}>{doc.name}</span>
                        </div>
                        <a href="#" onClick={(e) => { e.preventDefault(); addNotification(`Simulating PDF viewer for: "${doc.file}"`, 'info'); }} style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', textDecoration: 'none' }}>
                          View Scan
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: 'rgba(79,70,229,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(79,70,229,0.1)' }}>
                <ShieldAlert size={18} className="text-secondary" style={{ marginTop: '2px', flexShrink: 0 }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Verify stamp values, registrar signatures, and boundary coordinates match physical plot descriptions before activating.
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: 'auto' }}>
                <button className="btn btn-primary btn-sm" onClick={() => handleApprove(activeListing._id || activeListing.id, activeListing.title)} style={{ flexGrow: 1, background: 'linear-gradient(135deg, #10b981, #047857)', border: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <CheckCircle size={14} /> Approve Listing
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => handleRequestInfo(activeListing.title)} style={{ flexGrow: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Mail size={14} /> Request Docs
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => setRejectOverlay(true)} style={{ flexGrow: 1, color: 'var(--accent-error)', borderColor: 'rgba(244,63,94,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <XCircle size={14} /> Reject
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );

  // ── Tab: User Concerns ────────────────────────────────────────────────────

  const concernsTab = (
    <>
      {loadingConcerns ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
          <div className="loader" style={{ width: '40px', height: '40px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading user messages...</p>
        </div>
      ) : concerns.length === 0 ? (
        <div className="glass text-center" style={{ padding: '5rem 2rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <MessageSquare size={56} className="text-secondary" style={{ marginBottom: '1rem' }} />
          <h3>No User Concerns</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>No contact messages have been submitted yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {concerns.map((msg, idx) => {
            const date = msg.createdAt
              ? new Date(msg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—';
            const mailtoLink = `mailto:${msg.email}?subject=Re: Your VESTA Query`;
            return (
              <div key={msg._id || idx} className="glass" style={{ padding: '1.75rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid rgba(255,255,255,0.07)' }}>
                {/* Sender info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(79,70,229,0.4), rgba(139,92,246,0.4))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>
                    {(msg.name || 'U')[0].toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: 'white', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.name || 'Unknown'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--accent-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.email}</div>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-secondary)', flexShrink: 0 }}>{date}</span>
                </div>

                {/* Message body */}
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.9rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, border: '1px solid rgba(255,255,255,0.05)' }}>
                  {msg.message}
                </div>

                {/* Reply button */}
                <a
                  href={mailtoLink}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px', textDecoration: 'none' }}
                >
                  <Mail size={14} />
                  Reply via Email
                </a>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem' }}>
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', margin: 0 }} className="text-gradient">Compliance Audit Console</h2>
            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)' }}>
              Examine deed passbooks, verify boundary coordinates, and manage user concerns.
            </p>
          </div>
          <button
            onClick={logout}
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', alignSelf: 'center' }}
          >
            <LogOut size={14} />
            Admin Logout
          </button>
        </div>

        {/* Tab bar */}
        {tabBar}

        {/* Tab content */}
        {activeTab === 'listings' ? listingsTab : concernsTab}

      </div>

      {/* Reject modal */}
      {rejectOverlay && activeListing && (
        <div className="modal-overlay active" onClick={() => setRejectOverlay(false)}>
          <div className="modal-content glass auth-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px', background: 'rgba(15,15,20,0.95)' }}>
            <button className="modal-close" onClick={() => setRejectOverlay(false)}>&times;</button>
            <h3 style={{ color: 'var(--accent-error)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertOctagon size={20} /> Reject Submission
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              State the exact discrepancy. The seller will be notified to correct these details.
            </p>
            <form onSubmit={handleRejectSubmit}>
              <div className="form-group">
                <label>Rejection Reason</label>
                <textarea
                  rows="4"
                  placeholder="e.g. Encumbrance Certificate displays a pending mortgage lien..."
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
    </div>
  );
};

export default AdminListings;
