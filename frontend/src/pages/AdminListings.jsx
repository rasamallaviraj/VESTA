import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, Eye, CheckCircle, AlertOctagon, XCircle, 
  FileText, User, ArrowUpRight, ShieldAlert, Mail 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminListings = () => {
  const { user, addNotification } = useAuth();
  
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeListing, setActiveListing] = useState(null);
  
  // Rejection states
  const [rejectOverlay, setRejectOverlay] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const loadPending = async () => {
    setLoading(true);
    try {
      if (user) {
        const data = await api.getPendingListings(user.token);
        setListings(data);
        if (data.length > 0) setActiveListing(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, [user]);

  const handleApprove = async (id, title) => {
    if (!window.confirm(`Are you sure you want to approve "${title}" listing?`)) return;
    try {
      await api.updateListingStatus(id, 'ACTIVE', '', user.token);
      addNotification(`Approved "${title}" successfully! Listing is now live.`, 'success');
      loadPending();
      setActiveListing(null);
    } catch (e) {
      addNotification("Approval transaction failed.", "error");
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;

    try {
      await api.updateListingStatus(activeListing.id, 'REJECTED', rejectReason, user.token);
      addNotification(`Rejected "${activeListing.title}" successfully. Seller has been notified.`, 'info');
      setRejectOverlay(false);
      setRejectReason('');
      loadPending();
      setActiveListing(null);
    } catch (e) {
      addNotification("Rejection transaction failed.", "error");
    }
  };

  const handleRequestInfo = (title) => {
    addNotification(`Requested supplementary documents for "${title}". Notification logged.`, 'success');
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }} className="text-gradient">Compliance Audit Console</h2>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)' }}>
            Examine uploaded deed passbooks, verify boundary survey coordinates, and activate land listings.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
            <div className="loader" style={{ width: '40px', height: '40px' }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>Retrieving pending audit registers...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="glass text-center" style={{ padding: '5rem 2rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <ShieldCheck size={56} className="text-secondary" style={{ marginBottom: '1rem' }} />
            <h3>All Pending Audits Completed</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              No property listings are currently under compliance review. Verified listings are active.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1.2fr))', gap: '2rem' }}>
            
            {/* Left Column: Pending review list */}
            <div className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h4 style={{ margin: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>Pending Audit Queue ({listings.length})</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {listings.map(p => (
                  <div 
                    key={p.id} 
                    className={`glass ${activeListing?.id === p.id ? 'accent-glow' : ''}`}
                    onClick={() => setActiveListing(p)}
                    style={{
                      padding: '1.25rem',
                      background: activeListing?.id === p.id ? 'rgba(79,70,229,0.05)' : 'rgba(255,255,255,0.01)',
                      border: activeListing?.id === p.id ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center'
                    }}
                  >
                    <img src={p.images[0]} alt={p.title} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} />
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <h5 style={{ margin: 0, fontSize: '0.95rem', color: 'white', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title}</h5>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Type: {p.propertyType} | {p.city}</span>
                    </div>
                    <ChevronRight size={16} style={{ flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Detailed inspection & Actions */}
            {activeListing && (
              <div className="glass accent-glow" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Header */}
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '1.3rem', color: 'white' }}>{activeListing.title}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Survey No: **{activeListing.surveyNumber}** | Area: **{activeListing.area} {activeListing.areaUnit}** | Locality: **{activeListing.locality}, {activeListing.city}**
                  </div>
                </div>

                {/* File checklist inspect */}
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>UPLOADED DEED PASSBOOKS</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activeListing.documents.map((doc, idx) => (
                      <div 
                        key={idx} 
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: 'rgba(255,255,255,0.02)',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.04)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={16} className="text-secondary" />
                          <span style={{ fontSize: '0.85rem' }}>{doc.name}</span>
                        </div>
                        <a 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); addNotification(`Simulating PDF viewer for original scan: "${doc.file}"`, 'info'); }}
                          style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', textDecoration: 'none' }}
                        >
                          View Scan File
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit notes warn box */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: 'rgba(79,70,229,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(79,70,229,0.1)' }}>
                  <ShieldAlert size={18} className="text-secondary" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Inspect that original stamp values, registrar signatures, and border survey coordinates match the physical plot shape descriptions exactly before activating the listing.
                  </p>
                </div>

                {/* Actions row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: 'auto' }}>
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => handleApprove(activeListing.id, activeListing.title)}
                    style={{ flexGrow: 1, background: 'linear-gradient(135deg, #10b981, #047857)', border: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <CheckCircle size={14} />
                    <span>Approve Listing</span>
                  </button>

                  <button 
                    className="btn btn-outline btn-sm" 
                    onClick={() => handleRequestInfo(activeListing.title)}
                    style={{ flexGrow: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Mail size={14} />
                    <span>Request Docs</span>
                  </button>

                  <button 
                    className="btn btn-outline btn-sm" 
                    onClick={() => setRejectOverlay(true)}
                    style={{ flexGrow: 1, color: 'var(--accent-error)', borderColor: 'rgba(244,63,94,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <XCircle size={14} />
                    <span>Reject</span>
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

      </div>

      {/* Reject Overlay modal */}
      {rejectOverlay && activeListing && (
        <div className="modal-overlay active" onClick={() => setRejectOverlay(false)}>
          <div className="modal-content glass auth-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px', background: 'rgba(15,15,20,0.95)' }}>
            <button className="modal-close" onClick={() => setRejectOverlay(false)}>&times;</button>
            
            <h3 style={{ color: 'var(--accent-error)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertOctagon size={20} />
              <span>Reject Submission</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              State the exact structural discrepancy or boundary issue. The seller will be notified to correct these details.
            </p>

            <form onSubmit={handleRejectSubmit}>
              <div className="form-group">
                <label>Rejection Reason Description</label>
                <textarea 
                  rows="4" 
                  placeholder="e.g. Uploaded Encumbrance Certificate displays a pending mortgage lien under Telangana Cooperative Bank. Please upload bank release receipts..."
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-100 mt-4" 
                style={{ background: 'linear-gradient(135deg, var(--accent-error), #be123c)', border: 'none' }}
              >
                Confirm Rejection Dispatch
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminListings;
