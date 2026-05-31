import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Heart, Eye, ArrowRight, Check } from 'lucide-react';

const PropertyCard = ({ property, onToggleCompare, isCompared }) => {
  const { user, addNotification } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert("Please login to save properties.");
      return;
    }
    setIsSaved(!isSaved);
    addNotification(
      isSaved 
        ? `Removed "${property.title}" from saved properties.`
        : `Successfully saved "${property.title}" to your Buyer Dashboard!`,
      'info'
    );
  };

  const handleAskAI = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to AI page carrying property data in state
    navigate('/vesta-ai', { state: { propertyContext: property } });
  };

  return (
    <div 
      className="card glass accent-glow gs-reveal" 
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: 0,
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        background: 'var(--bg-surface)'
      }}
    >
      {/* Property Image Zone */}
      <div 
        style={{
          position: 'relative',
          height: '220px',
          width: '100%',
          overflow: 'hidden',
          background: '#15151f'
        }}
      >
        <img 
          src={property.images[currentImageIndex]} 
          alt={property.title} 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
        />

        {/* Carousel Hover Bars */}
        {property.images.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '6px',
            zIndex: 10
          }}>
            {property.images.map((img, idx) => (
              <span 
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(idx);
                }}
                style={{
                  width: '12px',
                  height: '4px',
                  borderRadius: '2px',
                  background: idx === currentImageIndex ? 'white' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  transition: 'background 0.3s'
                }}
              />
            ))}
          </div>
        )}

        {/* 100% Verified Badge */}
        {property.verified && (
          <span 
            className="badge badge-gold" 
            style={{
              position: 'absolute',
              top: '15px',
              left: '15px',
              background: 'rgba(251, 191, 36, 0.15)',
              color: 'var(--accent-gold)',
              border: '1px solid var(--accent-gold)',
              backdropFilter: 'blur(4px)',
              margin: 0,
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>✓ 100% Verified</span>
          </span>
        )}

        {/* Save Toggle */}
        <button 
          onClick={handleSave}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: isSaved ? 'var(--accent-error)' : 'rgba(0,0,0,0.5)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            cursor: 'pointer',
            zIndex: 10,
            backdropFilter: 'blur(4px)',
            transition: 'background 0.3s'
          }}
        >
          <Heart size={16} fill={isSaved ? 'white' : 'none'} />
        </button>

        {/* Property Type Badge */}
        <span 
          style={{
            position: 'absolute',
            bottom: '15px',
            left: '15px',
            background: 'rgba(79, 70, 229, 0.7)',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}
        >
          {property.propertyType}
        </span>
      </div>

      {/* Property Details zone */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '10px' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', fontWeight: 'bold' }}>
          {property.locality}, {property.city}
        </div>
        
        <h4 style={{ fontSize: '1.2rem', margin: 0, color: 'white', fontWeight: 'bold', minHeight: '48px', lineBreak: 'strict' }}>
          {property.title}
        </h4>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', marginBottom: '5px' }}>
          <span>Area: **{property.area} {property.areaUnit}**</span>
          <span>Facing: **{property.facingDirection}**</span>
        </div>

        {/* Pricing */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white' }}>
            ₹{(property.askingPrice / 10000000).toFixed(2)} Cr
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 'normal' }}>
              ₹{property.pricePerUnit.toLocaleString()}/{property.areaUnit === 'acres' ? 'Acre' : 'sq ft'}
            </span>
          </div>
          
          {/* Comparison checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={isCompared} 
              onChange={() => onToggleCompare(property)}
              style={{ accentColor: 'var(--accent-secondary)' }}
            />
            <span>Compare</span>
          </label>
        </div>

        {/* Interactive Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '1rem' }}>
          <Link 
            to={`/property/${property.id}`} 
            className="btn btn-outline btn-sm text-center" 
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
          >
            <Eye size={12} />
            <span>Details</span>
          </Link>
          <button 
            onClick={handleAskAI}
            className="btn btn-primary btn-sm"
            style={{ 
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '4px',
              border: 'none'
            }}
          >
            <Sparkles size={12} />
            <span>Ask Vesta AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
