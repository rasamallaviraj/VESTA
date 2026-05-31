import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockProperties } from '../services/api';
import { 
  User, Plus, Eye, MessageSquare, Trash2, CheckCircle, 
  Clock, XCircle, ArrowUpRight, BarChart2, ShieldCheck 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardSeller = () => {
  const { user, addNotification } = useAuth();
  const [sellerListings, setSellerListings] = useState([...mockProperties]);

  const handleDeleteListing = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}" listing?`)) {
      setSellerListings(prev => prev.filter(p => p.id !== id));
      addNotification(`Successfully deleted "${title}" property listing.`, 'info');
    }
  };

  const handleToggleSold = (id, title, currentStatus) => {
    setSellerListings(prev => prev.map(p => {
      if (p.id === id) {
        const nextStatus = currentStatus === 'SOLD' ? 'ACTIVE' : 'SOLD';
        addNotification(`Marked "${title}" as ${nextStatus}!`, 'success');
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  // Compute metrics
  const activeCount = sellerListings.filter(p => p.status === 'ACTIVE').length;
  const reviewCount = sellerListings.filter(p => p.status === 'UNDER_REVIEW').length;
  const totalViews = sellerListings.reduce((sum, p) => sum + p.viewsCount, 0);
  const totalInquiries = sellerListings.reduce((sum, p) => sum + p.inquiryCount, 0);

  return (
    <div style={{ minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem' }}>
      <div className="container">
        
        {/* Header Title */}
        <div 
          className="glass" 
          style={{
            padding: '2rem 3rem',
            background: 'linear-gradient(135deg, rgba(20,20,25,0.85), rgba(5,5,5,0.95))',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            marginBottom: '3rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-secondary)' }}>
              <User size={16} />
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Seller Portal</span>
            </div>
            <h2 style={{ fontSize: '2.2rem', margin: '5px 0 0' }}>Seller Console</h2>
            <p style={{ margin: '5px 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Upload lands with zero brokerage fees, track inquiries, and inspect active views.
            </p>
          </div>

          <Link 
            to="/list-property" 
            className="btn btn-secondary" 
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, var(--accent-secondary), #0369a1)', border: 'none' }}
          >
            <Plus size={16} />
            <span>List New Property</span>
          </Link>
        </div>

        {/* Stats strip panels */}
        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          
          {/* Active Listings */}
          <div className="glass accent-glow" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(79,70,229,0.1)', color: 'var(--accent-primary)' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ACTIVE LISTINGS</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{activeCount}</div>
            </div>
          </div>

          {/* Under Review */}
          <div className="glass purple-glow" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(168,85,247,0.1)', color: 'var(--accent-purple)' }}>
              <Clock size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>UNDER REVIEW</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{reviewCount}</div>
            </div>
          </div>

          {/* total views */}
          <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(6,182,212,0.1)', color: 'var(--accent-secondary)' }}>
              <Eye size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>TOTAL VIEWS</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{totalViews.toLocaleString()}</div>
            </div>
          </div>

          {/* inquiries */}
          <div className="glass gold-glow" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(251,191,36,0.1)', color: 'var(--accent-gold)' }}>
              <MessageSquare size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>BUYER INQUIRIES</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{totalInquiries}</div>
            </div>
          </div>

        </div>

        {/* Listings Table Console */}
        <div 
          className="glass accent-glow" 
          style={{
            overflowX: 'auto',
            padding: '2rem',
            background: 'var(--bg-surface)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px'
          }}
        >
          <table 
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              color: 'white',
              fontSize: '0.9rem'
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem' }}>Property</th>
                <th style={{ padding: '1rem' }}>Type</th>
                <th style={{ padding: '1rem' }}>Price</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Views</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Inquiries</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellerListings.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.3s' }}>
                  
                  {/* Photo + Title */}
                  <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={p.images[0]} alt={p.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                    <div>
                      <div style={{ fontWeight: 'bold', color: 'white' }}>{p.title}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.locality}, {p.city}</span>
                    </div>
                  </td>

                  {/* Type */}
                  <td style={{ padding: '1rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{p.propertyType}</td>
                  
                  {/* Price */}
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>₹{(p.askingPrice / 10000000).toFixed(2)} Cr</td>
                  
                  {/* Status Badges */}
                  <td style={{ padding: '1rem' }}>
                    <span 
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        background: p.status === 'ACTIVE' 
                          ? 'rgba(16,185,129,0.1)' 
                          : p.status === 'UNDER_REVIEW' 
                          ? 'rgba(251,191,36,0.1)' 
                          : p.status === 'SOLD' 
                          ? 'rgba(79,70,229,0.1)'
                          : 'rgba(244,63,94,0.1)',
                        color: p.status === 'ACTIVE' 
                          ? '#10b981' 
                          : p.status === 'UNDER_REVIEW' 
                          ? '#fbbf24' 
                          : p.status === 'SOLD' 
                          ? '#818cf8'
                          : '#f43f5e'
                      }}
                    >
                      {p.status}
                    </span>
                  </td>

                  {/* Views */}
                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{p.viewsCount.toLocaleString()}</td>
                  
                  {/* Inquiries */}
                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{p.inquiryCount}</td>

                  {/* Quick Action buttons */}
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <Link to={`/property/${p.id}`} className="btn btn-outline btn-sm" style={{ padding: '6px', borderRadius: '6px' }} title="View Listing Page">
                        <ArrowUpRight size={14} />
                      </Link>
                      <button 
                        className="btn btn-sm btn-outline" 
                        style={{ padding: '6px', borderRadius: '6px', color: p.status === 'SOLD' ? 'var(--accent-secondary)' : '#a1a1aa' }}
                        onClick={() => handleToggleSold(p.id, p.title, p.status)}
                        title={p.status === 'SOLD' ? 'Re-activate Listing' : 'Mark as Sold'}
                      >
                        <CheckCircle size={14} />
                      </button>
                      <button 
                        className="btn btn-sm btn-outline" 
                        style={{ padding: '6px', borderRadius: '6px', color: 'var(--accent-error)' }}
                        onClick={() => handleDeleteListing(p.id, p.title)}
                        title="Delete Listing"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
              {sellerListings.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No properties listed yet. Start by clicking "List New Property"!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default DashboardSeller;
