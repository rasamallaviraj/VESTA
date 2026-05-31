import React from 'react';
import { useAuth } from '../context/AuthContext';
import { mockProperties, mockExperts } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { 
  User, Bookmark, Calendar, FileText, CheckCircle, 
  MapPin, Clock, MessageSquare, AlertCircle, TrendingUp 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardBuyer = () => {
  const { user } = useAuth();
  
  // Buyer-specific mock metrics
  const savedProperties = mockProperties.slice(0, 2);
  const activeConsultations = [
    {
      id: 'book-1',
      expert: mockExperts[0],
      day: 'Monday',
      time: '2:00 PM',
      queryType: 'Legal DNA Vetting',
      queryText: 'Need to verify if Gachibowli survey sketch 124 has clear title transitions.',
      reference: 'VST-889124',
      status: 'CONFIRMED',
      link: 'https://zoom.us/j/mock-meeting-id'
    }
  ];

  const pursuedProperties = [
    {
      property: mockProperties[1], // Devanahalli Agri
      progress: 66, // 66% done
      steps: [
        { name: 'Sale Deed Vetted', status: 'COMPLETED' },
        { name: 'Encumbrance Certificate Nil Verified', status: 'COMPLETED' },
        { name: 'RTC / Pahani Vetted', status: 'COMPLETED' },
        { name: 'Stamp Duty Paid', status: 'PENDING' },
        { name: 'Sub-Registrar Execution', status: 'PENDING' }
      ]
    }
  ];

  return (
    <div style={{ minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem' }}>
      <div className="container">
        
        {/* Header welcome banner */}
        <div 
          className="glass accent-glow" 
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
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Buyer Console</span>
            </div>
            <h2 style={{ fontSize: '2.2rem', margin: '5px 0 0' }}>Welcome, {user ? user.name : 'Vesta User'}!</h2>
            <p style={{ margin: '5px 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Track saved boundaries, scheduled audits, and mutation progress.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 24px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SAVED LANDS</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{savedProperties.length}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 24px', borderRadius: '8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>VIDEO AUDITS</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{activeConsultations.length}</div>
            </div>
          </div>
        </div>

        {/* Dash Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1.3fr))', gap: '2rem' }}>
          
          {/* Left Column: Property purchase progress & booked slot lists */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Document Clearance tracker */}
            <div className="glass purple-glow" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <TrendingUp size={18} className="text-purple" />
                <h4 style={{ margin: 0 }}>Active Land DNAs Pursued</h4>
              </div>

              {pursuedProperties.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h5 style={{ margin: 0, fontSize: '1.05rem', color: 'white' }}>{item.property.title}</h5>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Survey No: {item.property.surveyNumber} ({item.property.city})</span>
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--accent-purple)' }}>{item.progress}% Clear</span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${item.progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-secondary))' }}></div>
                  </div>

                  {/* Vetting steps list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    {item.steps.map((step, sIdx) => (
                      <div key={sIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                        <span style={{ color: step.status === 'COMPLETED' ? 'white' : 'var(--text-secondary)' }}>{step.name}</span>
                        <span style={{ fontWeight: 'bold', color: step.status === 'COMPLETED' ? 'var(--accent-secondary)' : 'var(--accent-gold)' }}>
                          {step.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Video Audits slots card */}
            <div className="glass" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <Calendar size={18} className="text-secondary" />
                <h4 style={{ margin: 0 }}>Vetted Audits Calendar</h4>
              </div>

              {activeConsultations.map(consult => (
                <div 
                  key={consult.id} 
                  className="glass" 
                  style={{
                    padding: '1.25rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '50%', overflow: 'hidden' }}>
                      <img src={consult.expert.photo} alt={consult.expert.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <h5 style={{ margin: 0, fontSize: '0.95rem', color: 'white' }}>{consult.expert.name}</h5>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Specialty: {consult.expert.specialization} Law</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'white', background: 'rgba(0,0,0,0.2)', padding: '6px 12px', borderRadius: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} className="text-secondary" />
                      <span>{consult.day} at {consult.time}</span>
                    </span>
                    <span>REF: {consult.reference}</span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span>TOPIC: </span>
                    <span>{consult.queryText}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px', marginTop: '5px' }}>
                    <a 
                      href={consult.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-primary btn-sm text-center"
                      style={{ textDecoration: 'none', background: 'linear-gradient(135deg, var(--accent-secondary), #0369a1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <span>Join Zoom</span>
                    </a>
                    <Link to="/vesta-ai" className="btn btn-outline btn-sm text-center" style={{ textDecoration: 'none' }}>
                      Ask AI Pre-Call
                    </Link>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Column: Bookmarks Grid */}
          <div className="glass accent-glow" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
              <Bookmark size={18} className="text-gradient" />
              <h4 style={{ margin: 0 }} className="text-gradient">Bookmarked Lands DNA</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {savedProperties.map(property => (
                <div 
                  key={property.id} 
                  className="glass" 
                  style={{
                    padding: '1rem',
                    background: 'rgba(255,255,255,0.02)',
                    display: 'flex',
                    gap: '12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <img src={property.images[0]} alt={property.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1 }}>
                    <h5 style={{ margin: 0, fontSize: '0.95rem', color: 'white', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{property.title}</h5>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <MapPin size={10} />
                      <span>{property.locality}, {property.city}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'white' }}>₹{(property.askingPrice / 10000000).toFixed(2)} Cr</span>
                      <Link to={`/property/${property.id}`} className="btn btn-outline btn-sm" style={{ padding: '2px 8px', fontSize: '0.7rem', textDecoration: 'none' }}>Vette Specs</Link>
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                <Link to="/explore" className="btn btn-outline btn-sm w-100 text-center" style={{ textDecoration: 'none' }}>
                  Explore More Lands
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DashboardBuyer;
