import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Star, Languages, Briefcase, MapPin, CheckCircle, Search, HelpCircle } from 'lucide-react';

const SpecializationsList = [
  'All', 'Land', 'Agricultural', 'Commercial', 'Legal', 'NRI Properties'
];

const Experts = () => {
  const { addNotification } = useAuth();
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [filters, setFilters] = useState({
    specialization: 'All',
    state: '',
    language: '',
    availableNow: false
  });

  const fetchExperts = async () => {
    setLoading(true);
    try {
      const data = await api.getExperts(filters);
      setExperts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperts();
  }, [filters]);

  const handleBookNow = (e, expert) => {
    e.preventDefault();
    e.stopPropagation();
    addNotification(`Initiating booking flow for ${expert.name}. Directing to calendar.`, 'info');
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem' }}>
      <div className="container">
        
        {/* Header Title */}
        <div style={{ marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }} className="text-gradient">Certified Specialists</h2>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)' }}>
            Schedule direct assessments with vetted land surveyors, zoning attorneys, and legal auditors.
          </p>
        </div>

        {/* Filter bar */}
        <div 
          className="glass" 
          style={{
            padding: '2rem',
            background: 'var(--bg-surface)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            marginBottom: '3rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}
        >
          {/* Row 1: Specialization and Location */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
            
            {/* Specialization Tab buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} className="text-secondary" />
                <span>Specialization Area</span>
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {SpecializationsList.map(tab => (
                  <button
                    key={tab}
                    className={`btn btn-sm ${filters.specialization === tab ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFilters({ ...filters, specialization: tab })}
                    style={{
                      borderRadius: '8px',
                      background: filters.specialization === tab ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'transparent'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* State/Location */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} />
                <span>Specialist State</span>
              </label>
              <select 
                value={filters.state} 
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                style={{
                  padding: '0.85rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none'
                }}
              >
                <option value="">All States</option>
                <option value="Telangana">Telangana</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
              </select>
            </div>

            {/* Language filter */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Languages size={14} />
                <span>Spoken Language</span>
              </label>
              <select 
                value={filters.language} 
                onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                style={{
                  padding: '0.85rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none'
                }}
              >
                <option value="">All Languages</option>
                <option value="English">English</option>
                <option value="Telugu">Telugu</option>
                <option value="Kannada">Kannada</option>
                <option value="Hindi">Hindi</option>
                <option value="Marathi">Marathi</option>
              </select>
            </div>

            {/* Available Now */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', height: '100%', paddingTop: '1.5rem' }}>
              <input 
                type="checkbox" 
                id="availToggle" 
                checked={filters.availableNow}
                onChange={(e) => setFilters({ ...filters, availableNow: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent-secondary)' }}
              />
              <label htmlFor="availToggle" style={{ fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none', color: 'white' }}>
                Available Now (Slots Today)
              </label>
            </div>

          </div>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
            <div className="loader" style={{ width: '40px', height: '40px' }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>Securing connections with advisors...</p>
          </div>
        ) : experts.length === 0 ? (
          <div className="glass text-center" style={{ padding: '4rem 2rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <UserCheck size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
            <h3>No Active Experts Fit Your Filters</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
              We could not locate advisors matching these exact specialties. Expand regional parameters to clear query list.
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => setFilters({ specialization: 'All', state: '', language: '', availableNow: false })}>Show All Experts</button>
          </div>
        ) : (
          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '2rem' }}>
            {experts.map(expert => (
              <div 
                key={expert.id} 
                className="card glass accent-glow gs-reveal" 
                style={{
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  background: 'var(--bg-surface)'
                }}
              >
                
                {/* Photo & Identity row */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                    <img src={expert.photo} alt={expert.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'white', fontWeight: 'bold' }}>{expert.name}</h4>
                    <span 
                      style={{
                        display: 'inline-block',
                        background: 'rgba(6,182,212,0.1)',
                        color: 'var(--accent-secondary)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        marginTop: '4px'
                      }}
                    >
                      {expert.specialization}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '0.85rem' }}>
                      <Star size={14} fill="#fbbf24" stroke="none" />
                      <span style={{ fontWeight: 'bold', color: 'white' }}>{expert.rating}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>({expert.pastDealsCount} audits)</span>
                    </div>
                  </div>
                </div>

                {/* Specs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} />
                    <span>Location: **{expert.city}, {expert.state}**</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Briefcase size={14} />
                    <span>Experience: **{expert.experienceYears} Years**</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Languages size={14} />
                    <span>Languages: **{expert.languages.join(', ')}**</span>
                  </div>
                </div>

                {/* Brief bio */}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0 1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                  {expert.bio}
                </p>

                {/* Action buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginTop: 'auto' }}>
                  <Link 
                    to={`/expert/${expert.id}`} 
                    className="btn btn-primary btn-sm text-center" 
                    style={{ textDecoration: 'none', background: 'linear-gradient(135deg, var(--accent-primary), #3730a3)' }}
                  >
                    Book a Call
                  </Link>
                  <Link 
                    to={`/expert/${expert.id}`} 
                    className="btn btn-outline btn-sm text-center" 
                    style={{ textDecoration: 'none' }}
                  >
                    Profile
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Experts;
