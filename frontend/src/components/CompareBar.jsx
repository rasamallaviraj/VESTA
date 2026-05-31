import React from 'react';
import { Link } from 'react-router-dom';
import { GitCompare, X } from 'lucide-react';

const CompareBar = ({ compareList, onClear }) => {
  if (!compareList || compareList.length === 0) return null;

  return (
    <div 
      className="glass" 
      style={{
        position: 'fixed',
        bottom: '25px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '800px',
        padding: '1rem 2rem',
        background: 'rgba(10, 10, 15, 0.95)',
        border: '1px solid rgba(79, 70, 229, 0.3)',
        boxShadow: '0 15px 35px rgba(0,0,0,0.7)',
        borderRadius: '50px',
        zIndex: 998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        animation: 'bounce 2s infinite'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-secondary)' }}>
          <GitCompare size={20} />
          <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Compare Properties ({compareList.length}/3)</span>
        </div>
        
        {/* Selected List Thumbnails */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {compareList.map(p => (
            <div 
              key={p.id} 
              style={{
                position: 'relative',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid rgba(255,255,255,0.2)'
              }}
              title={p.title}
            >
              <img src={p.images[0]} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={onClear}
          className="btn btn-sm btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <X size={12} />
          <span>Clear</span>
        </button>
        
        <Link 
          to="/compare" 
          className="btn btn-sm btn-primary"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <span>Compare Now</span>
        </Link>
      </div>
    </div>
  );
};

export default CompareBar;
