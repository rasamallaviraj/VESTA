import React from 'react';
import { Link } from 'react-router-dom';
import { GitCompare, X, Eye, Sparkles, MapPin, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Compare = ({ compareList, onRemoveCompare, onClear }) => {
  const { addNotification } = useAuth();

  const handleRemove = (e, prop) => {
    e.preventDefault();
    onRemoveCompare(prop);
    addNotification(`Removed "${prop.title}" from comparison sheet.`, 'info');
  };

  if (!compareList || compareList.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <GitCompare size={64} className="text-secondary" style={{ marginBottom: '1.5rem' }} />
        <h2 className="text-gradient">No Properties Selected</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '400px', textAlign: 'center' }}>
          Explore our listings and click the "Compare" check box on property cards to populate this matrix.
        </p>
        <Link to="/explore" className="btn btn-primary mt-4">Start Exploring Lands</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', margin: 0 }} className="text-gradient">Side-by-Side Comparison</h2>
            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)' }}>
              Evaluate parameters, Land DNA, and pricing metrics across your selected properties.
            </p>
          </div>
          <button className="btn btn-outline" onClick={onClear}>Clear Comparison</button>
        </div>

        {/* Comparison Matrix Table */}
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
              fontSize: '0.95rem'
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '1rem 1.5rem', width: '200px', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Parameters</th>
                {compareList.map(p => (
                  <th key={p.id} style={{ padding: '1rem 1.5rem', verticalAlign: 'top', minWidth: '240px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      
                      {/* Image Thumbnail */}
                      <div style={{ position: 'relative', height: '140px', borderRadius: '8px', overflow: 'hidden' }}>
                        <img src={p.images[0]} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                          onClick={(e) => handleRemove(e, p)}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          &times;
                        </button>
                      </div>

                      <div style={{ fontWeight: 'bold', fontSize: '1rem', minHeight: '38px', marginTop: '6px' }}>{p.title}</div>
                      <span className="badge badge-purple" style={{ margin: 0, padding: '2px 8px', fontSize: '0.7rem', width: 'fit-content' }}>{p.propertyType}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              
              {/* Row: Location */}
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Location</td>
                {compareList.map(p => (
                  <td key={p.id} style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} className="text-secondary" />
                      <span>{p.locality}, {p.city} ({p.state})</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row: Price */}
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Asking Price</td>
                {compareList.map(p => (
                  <td key={p.id} style={{ padding: '1.25rem 1.5rem', fontWeight: 'bold', fontSize: '1.2rem', color: 'white' }}>
                    ₹{(p.askingPrice / 10000000).toFixed(2)} Cr
                  </td>
                ))}
              </tr>

              {/* Row: Area */}
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Land Area</td>
                {compareList.map(p => (
                  <td key={p.id} style={{ padding: '1.25rem 1.5rem', color: 'white' }}>
                    {p.area} {p.areaUnit}
                  </td>
                ))}
              </tr>

              {/* Row: Price Per Unit */}
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Price per Unit</td>
                {compareList.map(p => (
                  <td key={p.id} style={{ padding: '1.25rem 1.5rem' }}>
                    ₹{p.pricePerUnit.toLocaleString()}/{p.areaUnit === 'acres' ? 'Acre' : 'sq ft'}
                  </td>
                ))}
              </tr>

              {/* Row: Survey No */}
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Survey Number</td>
                {compareList.map(p => (
                  <td key={p.id} style={{ padding: '1.25rem 1.5rem', fontWeight: '600' }}>
                    {p.surveyNumber}
                  </td>
                ))}
              </tr>

              {/* Row: Facing Direction */}
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Facing Direction</td>
                {compareList.map(p => (
                  <td key={p.id} style={{ padding: '1.25rem 1.5rem' }}>
                    {p.facingDirection}
                  </td>
                ))}
              </tr>

              {/* Row: Shape */}
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Plot Shape</td>
                {compareList.map(p => (
                  <td key={p.id} style={{ padding: '1.25rem 1.5rem' }}>
                    {p.shape}
                  </td>
                ))}
              </tr>

              {/* Row: Road Access */}
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Road Access</td>
                {compareList.map(p => (
                  <td key={p.id} style={{ padding: '1.25rem 1.5rem' }}>
                    {p.roadAccess}
                  </td>
                ))}
              </tr>

              {/* Row: Vetted Papers */}
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Vetted Papers</td>
                {compareList.map(p => (
                  <td key={p.id} style={{ padding: '1.25rem 1.5rem', color: 'var(--accent-secondary)' }}>
                    {p.documents.length} Uploaded ✓
                  </td>
                ))}
              </tr>

              {/* Action triggers */}
              <tr>
                <td style={{ padding: '1.5rem 1.5rem 0.5rem' }}></td>
                {compareList.map(p => (
                  <td key={p.id} style={{ padding: '1.5rem 1.5rem 0.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <Link 
                        to={`/property/${p.id}`} 
                        className="btn btn-sm btn-primary text-center" 
                        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        <Eye size={12} />
                        <span>Inspect Specs</span>
                      </Link>
                      
                      <Link 
                        to="/vesta-ai" 
                        state={{ propertyContext: p }}
                        className="btn btn-sm btn-outline text-center"
                        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', borderColor: 'rgba(255,255,255,0.1)' }}
                      >
                        <Sparkles size={12} className="text-secondary" />
                        <span>AI Value Scan</span>
                      </Link>
                    </div>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default Compare;
