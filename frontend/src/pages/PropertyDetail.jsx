import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, mockProperties } from '../services/api';
import L from 'leaflet';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { 
  MapPin, CheckCircle, Sparkles, AlertCircle, Compass, 
  Expand, Phone, Calendar, ArrowLeft, ChevronLeft, ChevronRight, ShieldAlert 
} from 'lucide-react';

// Register ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      const BASE = import.meta.env.VITE_API_URL || '';
      try {
        let data = null;
        if (id && id.startsWith('prop-')) {
          data = mockProperties.find(p => p.id === id);
        } else if (id && /^[0-9a-fA-F]{24}$/.test(id)) {
          const res = await fetch(`${BASE}/api/properties/${id}`);
          if (res.ok) {
            data = await res.json();
          }
        }

        if (data) {
          const priceHistory = data.priceHistory && data.priceHistory.length > 0 
            ? data.priceHistory 
            : [{ year: new Date(data.createdAt || Date.now()).getFullYear().toString(), price: data.askingPrice }];
          
          const documents = data.documents && data.documents.length > 0 
            ? data.documents 
            : [
                { name: 'Sale Deed', status: 'Uploaded ✓', file: 'sale_deed.pdf' },
                { name: 'Encumbrance Certificate', status: 'Uploaded ✓', file: 'ec.pdf' },
                { name: 'Khata/Patta', status: 'Uploaded ✓', file: 'khata.pdf' }
              ];
          
          const images = data.images && data.images.length > 0
            ? data.images
            : ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'];

          const normalizedProperty = {
            ...data,
            id: data.id || data._id,
            priceHistory,
            documents,
            images,
            viewsCount: data.viewsCount !== undefined ? data.viewsCount : 0,
            latitude: data.latitude || 17.4483,
            longitude: data.longitude || 78.3488,
          };

          setProperty(normalizedProperty);
          setActiveImage(normalizedProperty.images[0]);
        } else {
          setProperty(null);
        }
      } catch (err) {
        console.error("Error loading property detail:", err);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  // Leaflet Map Initialization Hook
  useEffect(() => {
    if (loading || !property || !mapRef.current) return;

    // Reset container if already instantiated
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    try {
      const position = [property.latitude, property.longitude];
      
      // Initialize map instance
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: false
      }).setView(position, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);

      // Custom marker icon creation to avoid Leaflet standard image asset fetch glitches
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div style="background-color: var(--accent-primary); width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px var(--accent-primary);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      L.marker(position, { icon: customIcon })
        .addTo(mapInstance.current)
        .bindPopup(`<b>${property.title}</b><br/>${property.locality}`)
        .openPopup();
    } catch (e) {
      console.error("Leaflet Map failed to load:", e);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [loading, property]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div className="loader" style={{ width: '45px', height: '45px', borderWidth: '4px' }}></div>
        <p style={{ color: 'var(--text-secondary)' }}>Retrieving Land Boundaries...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h3>Property Not Found</h3>
        <Link to="/explore" className="btn btn-primary mt-4">Back to Explore</Link>
      </div>
    );
  }

  // ChartJS Configuration Data
  const chartData = {
    labels: property.priceHistory.map(h => h.year),
    datasets: [
      {
        label: 'Asking Price (₹)',
        data: property.priceHistory.map(h => h.price),
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        fill: true,
        tension: 0.3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `₹ ${(ctx.raw / 100000).toFixed(1)} Lakhs`
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: '#a1a1aa'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: '#a1a1aa',
          callback: (value) => `₹ ${(value / 100000).toFixed(0)} L`
        }
      }
    }
  };

  const handleAskAISubmission = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    // Send state payload to chatbot page
    navigate('/vesta-ai', { state: { propertyContext: property, initialPrompt: aiPrompt } });
  };

  const similarProperties = mockProperties.filter(p => p.id !== property.id).slice(0, 3);

  return (
    <div style={{ minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem' }}>
      <div className="container">
        
        {/* Back Link */}
        <Link to="/explore" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '2rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Explorer</span>
        </Link>

        {/* Title Grid */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <span className="badge badge-purple" style={{ textTransform: 'uppercase' }}>{property.propertyType}</span>
            <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>{property.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <MapPin size={16} className="text-secondary" />
              <span>{property.address}</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: '800', textAlign: 'right', color: 'white' }}>
              ₹{(property.askingPrice / 10000000).toFixed(2)} Cr
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', textAlign: 'right' }}>
              ₹{property.pricePerUnit.toLocaleString()}/{property.areaUnit === 'acres' ? 'Acre' : 'sq ft'}
            </div>
          </div>
        </div>

        {/* Grid 1: Gallery & Specifications */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1.3fr))', gap: '2rem', marginBottom: '3rem' }}>
          
          {/* Left Column: Premium Gallery */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div 
              className="glass"
              style={{
                position: 'relative',
                height: '420px',
                borderRadius: '16px',
                overflow: 'hidden',
                padding: 0,
                cursor: 'pointer'
              }}
              onClick={() => setLightboxOpen(true)}
            >
              <img src={activeImage} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{
                position: 'absolute',
                bottom: '15px',
                right: '15px',
                background: 'rgba(0,0,0,0.6)',
                color: 'white',
                padding: '4px 10px',
                borderRadius: '50px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Expand size={12} />
                <span>Zoom Photo</span>
              </div>
            </div>

            {/* Thumbnail Select strip */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {property.images.map((img, idx) => (
                <div 
                  key={idx}
                  className={`glass ${activeImage === img ? 'accent-glow' : ''}`}
                  onClick={() => setActiveImage(img)}
                  style={{
                    width: '80px',
                    height: '60px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    padding: 0,
                    cursor: 'pointer',
                    border: activeImage === img ? '2px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <img src={img} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Specifications Table */}
          <div className="glass accent-glow" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }} className="text-gradient">
              Land DNA & Specifications
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>SURVEY NUMBER</span>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginTop: '4px' }}>{property.surveyNumber}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AREA BOUNDARIES</span>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginTop: '4px' }}>{property.area} {property.areaUnit}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>FACING DIRECTION</span>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Compass size={16} className="text-secondary" />
                  <span>{property.facingDirection}</span>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>SHAPE</span>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginTop: '4px' }}>{property.shape}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ROAD ACCESS</span>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginTop: '4px' }}>{property.roadAccess}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>VERIFIED REGISTRY</span>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginTop: '4px', color: 'var(--accent-gold)' }}>✓ Vetted</div>
              </div>
            </div>

            {property.paymentTerms && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>PREFERRED PAYMENT TERMS</span>
                <p style={{ fontSize: '0.95rem', color: 'white', marginTop: '6px' }}>{property.paymentTerms}</p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: 'auto' }}>
              <Link 
                to="/experts" 
                className="btn btn-secondary text-center" 
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Calendar size={16} />
                <span>Book Legal Consultation</span>
              </Link>
              
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  navigate('/vesta-ai', { state: { propertyContext: property } });
                }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Sparkles size={16} className="text-secondary" />
                <span>Vesta AI Analysis</span>
              </button>
            </div>

          </div>

        </div>

        {/* Grid 2: Interactive Leaflet Map & Price History Chart */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          
          {/* Leaflet Map Card */}
          <div className="glass" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '400px' }}>
            <h4 style={{ margin: 0 }}>Exact Geographic Location</h4>
            <div 
              id="map-container"
              ref={mapRef}
              style={{
                flexGrow: 1,
                width: '100%',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.08)',
                zIndex: 10
              }}
            />
          </div>

          {/* Price History Line Graph */}
          <div className="glass purple-glow" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '400px' }}>
            <h4 style={{ margin: 0 }}>AI Value Appreciation Graph</h4>
            <div style={{ flexGrow: 1, width: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

        </div>

        {/* Grid 3: Vesta AI Inline Prompt & Document checklist */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1.2fr))', gap: '2rem', marginBottom: '4rem' }}>
          
          {/* Inline Prompt Card */}
          <div 
            className="card glass accent-glow" 
            style={{
              padding: '2.5rem',
              background: 'linear-gradient(135deg, rgba(20,20,25,0.85), rgba(10,10,15,0.95))',
              border: '1px solid rgba(79,70,229,0.3)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <Sparkles size={24} className="text-secondary" />
              <h3 style={{ margin: 0 }} className="text-gradient">Ask Vesta AI about this property</h3>
            </div>
            
            <p style={{ fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Ask specific legal boundaries, price trends in {property.city}, or stamp duty calculations for this survey sheet. I am pre-configured with all of its specifications.
            </p>

            <form onSubmit={handleAskAISubmission} style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="e.g. Is this survey number clean? What stamp duty will I pay?"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                style={{
                  flexGrow: 1,
                  padding: '1rem',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }}>Ask</button>
            </form>
          </div>

          {/* Document Verification checklist */}
          <div className="glass" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <ShieldAlert size={20} className="text-secondary" />
              <h4 style={{ margin: 0 }}>Vetted Registry Checklist</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {property.documents.map((doc, idx) => (
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
                  <span style={{ fontSize: '0.9rem', color: 'white' }}>{doc.name}</span>
                  <span 
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      color: 'var(--accent-secondary)'
                    }}
                  >
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '1.5rem', background: 'rgba(251,191,36,0.05)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(251,191,36,0.1)' }}>
              <AlertCircle size={16} className="text-gold" style={{ marginTop: '2px', flexShrink: 0 }} />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                All document uploads are double-vetted by our certified regional land surveyors before listing activation. Check details with experts.
              </p>
            </div>
          </div>

        </div>

        {/* Similar Listings Row */}
        <div>
          <h3 style={{ marginBottom: '1.5rem' }}>Similar Verified Lands</h3>
          <div className="grid-3">
            {similarProperties.map(p => (
              <div 
                key={p.id} 
                className="card glass accent-glow" 
                style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-surface)' }}
              >
                <img src={p.images[0]} alt={p.title} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', fontWeight: 'bold' }}>{p.locality}, {p.city}</div>
                <h4 style={{ fontSize: '1rem', margin: 0, minHeight: '38px' }}>{p.title}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
                  <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>₹{(p.askingPrice / 10000000).toFixed(2)} Cr</span>
                  <Link to={`/property/${p.id}`} className="btn btn-outline btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem', textDecoration: 'none' }}>View</Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Lightbox full-size gallery overlay */}
      {lightboxOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)'
          }}
          onClick={() => setLightboxOpen(false)}
        >
          <button 
            style={{
              position: 'absolute',
              top: '25px',
              right: '25px',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '2.5rem',
              cursor: 'pointer'
            }}
            onClick={() => setLightboxOpen(false)}
          >
            &times;
          </button>
          
          <div style={{ maxWidth: '90%', maxHeight: '80%' }} onClick={(e) => e.stopPropagation()}>
            <img src={activeImage} alt="Large size" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
          </div>
        </div>
      )}

    </div>
  );
};

export default PropertyDetail;
