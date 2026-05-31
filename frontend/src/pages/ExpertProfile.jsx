import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, Star, MapPin, Briefcase, Languages, Calendar, 
  CheckCircle, FileText, UserPlus, Clock, MessageSquare, AlertCircle 
} from 'lucide-react';

const ExpertProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, addNotification } = useAuth();
  
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Booking states
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingOverlay, setBookingOverlay] = useState(false);
  const [bookingForm, setBookingForm] = useState({ queryType: 'Legal DNA Vetting', queryText: '' });
  const [bookingReceipt, setBookingReceipt] = useState(null);

  // Become an Expert states
  const [expertForm, setExpertForm] = useState({
    name: '', specialization: 'Legal', city: '', state: '', languages: '', bio: '', certifications: ''
  });
  const [expertApplied, setExpertApplied] = useState(false);

  useEffect(() => {
    const fetchExpert = async () => {
      setLoading(true);
      try {
        const data = await api.getExpertById(id);
        if (data) {
          setExpert(data);
          // Set initial day
          const days = Object.keys(data.availabilityCalendar);
          if (days.length > 0) setSelectedDay(days[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpert();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div className="loader" style={{ width: '40px', height: '40px' }}></div>
        <p style={{ color: 'var(--text-secondary)' }}>Securing encrypted details...</p>
      </div>
    );
  }

  if (!expert) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h3>Expert Not Found</h3>
        <Link to="/experts" className="btn btn-primary mt-4">Back to Directory</Link>
      </div>
    );
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to book a consultation slot.");
      return;
    }
    if (!selectedSlot) {
      alert("Please select an active time slot.");
      return;
    }

    try {
      const payload = {
        expertId: expert.id,
        day: selectedDay,
        time: selectedSlot,
        queryType: bookingForm.queryType,
        queryText: bookingForm.queryText
      };
      
      const receipt = await api.bookConsultation(payload, user.token);
      setBookingReceipt(receipt);
      setBookingOverlay(false);
      addNotification(`Consultation booked! Reference: ${receipt.bookingReference}`, 'success');
    } catch (err) {
      addNotification("Booking transaction failed. Please retry.", "error");
    }
  };

  const handleApplyExpert = (e) => {
    e.preventDefault();
    setExpertApplied(true);
    addNotification("Become an Expert application submitted successfully! Our administrators will contact you.", "success");
    setExpertForm({ name: '', specialization: 'Legal', city: '', state: '', languages: '', bio: '', certifications: '' });
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* Back Link */}
        <Link to="/experts" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '2rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Directory</span>
        </Link>

        {/* Profile Card Summary */}
        <div 
          className="glass accent-glow" 
          style={{
            padding: '2.5rem',
            background: 'var(--bg-surface)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            marginBottom: '3rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2rem',
            alignItems: 'center'
          }}
        >
          {/* Avatar photo */}
          <div style={{ width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
            <img src={expert.photo} alt={expert.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ flexGrow: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ fontSize: '2.2rem', margin: 0 }}>{expert.name}</h2>
                <span style={{ display: 'inline-block', background: 'rgba(6,182,212,0.1)', color: 'var(--accent-secondary)', padding: '2px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '6px' }}>
                  {expert.specialization} Consultant
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.2rem', padding: '4px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <Star size={18} fill="#fbbf24" stroke="none" />
                <span style={{ fontWeight: 'bold', color: 'white' }}>{expert.rating}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>({expert.pastDealsCount} audits completed)</span>
              </div>
            </div>

            {/* Profile statistics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} className="text-secondary" />
                <span>Based in: **{expert.city}, {expert.state}**</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={16} />
                <span>Experience: **{expert.experienceYears} Years**</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Languages size={16} />
                <span>Linguistic: **{expert.languages.join(', ')}**</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic calendar slot selection & bio descriptions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1.2fr))', gap: '2rem', marginBottom: '4rem' }}>
          
          {/* Left Column: Bio & Certifications */}
          <div className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h4 style={{ margin: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>Professional Biography</h4>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>{expert.bio}</p>

            <h4 style={{ margin: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', marginTop: '10px' }}>License & Certifications</h4>
            <ul className="power-list" style={{ margin: 0 }}>
              {expert.certifications.map((cert, idx) => (
                <li key={idx} style={{ fontSize: '0.9rem' }}>
                  <span className="check">✓</span>
                  <span>{cert}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Availability Calendar component */}
          <div className="glass purple-glow" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h4 style={{ margin: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>Schedule Virtual Call Slot</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
              Select a suitable week day and active time bracket to schedule a unmediated consultation.
            </p>

            {/* Choose Day */}
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>STEP 1: SELECT DAY</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {Object.keys(expert.availabilityCalendar).map(day => (
                  <button 
                    key={day}
                    className={`btn btn-sm ${selectedDay === day ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setSelectedDay(day); setSelectedSlot(''); }}
                    style={{ borderRadius: '8px' }}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Choose Slot Hour */}
            {selectedDay && (
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>STEP 2: CHOOSE TIME SLOT</span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {expert.availabilityCalendar[selectedDay].map(slot => (
                    <button 
                      key={slot}
                      className={`btn btn-sm ${selectedSlot === slot ? 'btn-secondary' : 'btn-outline'}`}
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        borderRadius: '8px',
                        background: selectedSlot === slot ? 'linear-gradient(135deg, var(--accent-secondary), #0369a1)' : 'transparent'
                      }}
                    >
                      <Clock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      <span>{slot}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Book */}
            <button 
              className="btn btn-primary w-100" 
              style={{ marginTop: 'auto', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', border: 'none' }}
              disabled={!selectedSlot}
              onClick={() => setBookingOverlay(true)}
            >
              Confirm Booking Details
            </button>
          </div>

        </div>

        {/* Receipt Screen (Show after booking successfully) */}
        {bookingReceipt && (
          <div 
            className="glass"
            style={{
              padding: '2.5rem',
              border: '2px solid var(--accent-secondary)',
              background: 'rgba(6,182,212,0.05)',
              borderRadius: '16px',
              marginBottom: '3rem',
              textAlign: 'center'
            }}
          >
            <CheckCircle size={48} className="text-secondary" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: 'white', margin: 0 }}>Consultation Successfully Registered!</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Your calendar slot has been locked. Check your email inbox for confirmation details.
            </p>
            <div 
              style={{
                display: 'inline-block',
                background: 'rgba(255,255,255,0.05)',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                color: 'white',
                marginTop: '1rem',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              REFERENCE ID: {bookingReceipt.bookingReference}
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/dashboard/buyer" className="btn btn-outline btn-sm">Go to Dashboard</Link>
            </div>
          </div>
        )}

        {/* Section 6: Become an Expert Application Form */}
        <div 
          className="glass accent-glow" 
          style={{
            padding: '3rem',
            background: 'linear-gradient(135deg, rgba(20,20,25,0.85), rgba(5,5,5,0.95))',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <UserPlus size={24} className="text-gradient" />
            <h3 style={{ margin: 0 }} className="text-gradient">Become an Expert Advisor</h3>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem', maxWidth: '700px' }}>
            Are you a certified boundary surveyor, real estate attorney, or experienced zoning planner? Join India's most transparent property portal to provide vetted reviews to active buyers.
          </p>

          {expertApplied ? (
            <div className="glass text-center" style={{ padding: '2rem', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <CheckCircle size={32} style={{ color: '#10b981', marginBottom: '8px' }} />
              <h4>Application Submitted Under Vetting Review</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, marginTop: '4px' }}>
                Our compliance audit agents will review your certificates and contact you on your registered email address.
              </p>
            </div>
          ) : (
            <form onSubmit={handleApplyExpert}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Adv. Rajesh..." 
                    required
                    value={expertForm.name}
                    onChange={(e) => setExpertForm({ ...expertForm, name: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label>Specialization Track</label>
                  <select 
                    value={expertForm.specialization}
                    onChange={(e) => setExpertForm({ ...expertForm, specialization: e.target.value })}
                    style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                  >
                    <option value="Legal">Legal Auditor</option>
                    <option value="Agricultural">Agricultural Land Expert</option>
                    <option value="Land">General Land Surveyor</option>
                    <option value="Commercial">Commercial Zoning Consultant</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Languages (Comma-Separated)</label>
                  <input 
                    type="text" 
                    placeholder="English, Hindi, Telugu" 
                    required
                    value={expertForm.languages}
                    onChange={(e) => setExpertForm({ ...expertForm, languages: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>City & State</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Hyderabad, Telangana" 
                    required
                    value={expertForm.city}
                    onChange={(e) => setExpertForm({ ...expertForm, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group mt-4">
                <label>List License / Certifications</label>
                <input 
                  type="text" 
                  placeholder="e.g. Bar Council Registration No. TS/XXXX/2012" 
                  required
                  value={expertForm.certifications}
                  onChange={(e) => setExpertForm({ ...expertForm, certifications: e.target.value })}
                />
              </div>

              <div className="form-group mt-4">
                <label>Brief Professional Bio</label>
                <textarea 
                  rows="3" 
                  placeholder="Tell buyers about your years of experience, types of zoning deals vetted, and regional specialties..." 
                  required
                  value={expertForm.bio}
                  onChange={(e) => setExpertForm({ ...expertForm, bio: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary mt-4">Submit Vetting Form</button>
            </form>
          )}

        </div>

      </div>

      {/* Booking Form Dialog Overlay */}
      {bookingOverlay && (
        <div className="modal-overlay active" onClick={() => setBookingOverlay(false)}>
          <div className="modal-content glass auth-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', background: 'rgba(15,15,20,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button className="modal-close" onClick={() => setBookingOverlay(false)}>&times;</button>
            
            <h3 className="text-gradient mb-2">Audit Details Registration</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Provide brief details about your inquiry to help **{expert.name}** prepare for the video slots call.
            </p>

            <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label>Type of Audit Query</label>
                <select 
                  value={bookingForm.queryType}
                  onChange={(e) => setBookingForm({ ...bookingForm, queryType: e.target.value })}
                  style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                >
                  <option value="Legal DNA Vetting">Vetting Title Papers & Original Deeds</option>
                  <option value="Encumbrance Loops Check">Double Checking Mortgages & EC Loops</option>
                  <option value="Zoning & Layout Auditing">DTCP / NA layout clearances</option>
                  <option value="Boundary Boundary Surveying">Resolving geographic boundary queries</option>
                </select>
              </div>

              <div className="form-group">
                <label>Audit Case Summary (Optional)</label>
                <textarea 
                  rows="3" 
                  placeholder="Provide survey number details or explain any suspected ownership irregularities..."
                  value={bookingForm.queryText}
                  onChange={(e) => setBookingForm({ ...bookingForm, queryText: e.target.value })}
                  style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: 'rgba(79,70,229,0.05)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(79,70,229,0.1)', marginBottom: '5px' }}>
                <Clock size={16} className="text-secondary" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Slot scheduled: **{selectedDay} at {selectedSlot}** with Rajesh Sen. A matching conference zoom link will be emailed.
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100">Schedule Video Slot Now</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExpertProfile;
