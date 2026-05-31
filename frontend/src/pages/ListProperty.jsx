import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import L from 'leaflet';
import { 
  Building, UploadCloud, MapPin, IndianRupee, FileCheck, 
  Eye, Check, ChevronRight, ChevronLeft, ShieldAlert, AlertTriangle 
} from 'lucide-react';

const IndianStates = ['Telangana', 'Karnataka', 'Maharashtra', 'Uttar Pradesh'];

const districtMapping = {
  Telangana: ['Rangareddy', 'Medchal', 'Hyderabad'],
  Karnataka: ['Bangalore Rural', 'Bangalore Urban', 'Mysore'],
  Maharashtra: ['Pune', 'Mumbai Suburban', 'Thane'],
  'Uttar Pradesh': ['Gautam Buddha Nagar', 'Ghaziabad', 'Lucknow']
};

const ListProperty = () => {
  const navigate = useNavigate();
  const { user, addNotification } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form payload states
  const [formData, setFormData] = useState({
    propertyType: 'PLOT',
    title: '',
    state: 'Telangana',
    district: 'Rangareddy',
    city: '',
    locality: '',
    address: '',
    surveyNumber: '',
    area: '1000',
    areaUnit: 'sq ft',
    roadAccess: 'Yes',
    facingDirection: 'East',
    shape: 'Rectangular',
    images: [],
    videoLink: '',
    latitude: 17.44,
    longitude: 78.34,
    askingPrice: '2500000',
    openToNegotiation: true,
    paymentTerms: '',
    documents: []
  });

  const [uploadedImages, setUploadedImages] = useState([
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80'
  ]); // Default mock images pre-loaded

  const [uploadedDocs, setUploadedDocs] = useState({});

  const mapContainerRef = useRef(null);
  const pinMapInstance = useRef(null);
  const pinMarker = useRef(null);

  // Update district when state changes
  useEffect(() => {
    const districts = districtMapping[formData.state] || [];
    if (districts.length > 0) {
      setFormData(prev => ({ ...prev, district: districts[0] }));
    }
  }, [formData.state]);

  // Set up document checklist dynamically based on type selected
  useEffect(() => {
    let checklist = [];
    if (formData.propertyType === 'AGRICULTURAL') {
      checklist = [
        { name: 'Title Deed', required: true, status: 'Required' },
        { name: 'RTC / Pahani Passbook', required: true, status: 'Required' },
        { name: 'Survey Sketch (Akarband)', required: true, status: 'Required' },
        { name: 'NOC from Tehsildar', required: false, status: 'Required' }
      ];
    } else {
      checklist = [
        { name: 'Sale Deed', required: true, status: 'Required' },
        { name: 'Encumbrance Certificate (EC)', required: true, status: 'Required' },
        { name: 'Khata Certificate', required: true, status: 'Required' },
        { name: 'Survey Sketch', required: true, status: 'Required' }
      ];
    }
    setFormData(prev => ({ ...prev, documents: checklist }));
    setUploadedDocs({});
  }, [formData.propertyType]);

  // Leaflet Pin Drop Map Setup hook
  useEffect(() => {
    if (currentStep !== 2 || !mapContainerRef.current) return;

    if (pinMapInstance.current) {
      pinMapInstance.current.remove();
      pinMapInstance.current = null;
    }

    try {
      const initPos = [formData.latitude, formData.longitude];
      pinMapInstance.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true
      }).setView(initPos, 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(pinMapInstance.current);

      const customIcon = L.divIcon({
        className: 'custom-pin-marker',
        html: `<div style="background-color: var(--accent-secondary); width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px var(--accent-secondary);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      pinMarker.current = L.marker(initPos, { icon: customIcon, draggable: true }).addTo(pinMapInstance.current);

      // Handle Pin drag
      pinMarker.current.on('dragend', () => {
        const pos = pinMarker.current.getLatLng();
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(pos.lat.toFixed(6)),
          longitude: parseFloat(pos.lng.toFixed(6))
        }));
      });

      // Handle Map Click pin drop
      pinMapInstance.current.on('click', (e) => {
        pinMarker.current.setLatLng(e.latlng);
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(e.latlng.lat.toFixed(6)),
          longitude: parseFloat(e.latlng.lng.toFixed(6))
        }));
      });
    } catch (e) {
      console.error(e);
    }

    return () => {
      if (pinMapInstance.current) {
        pinMapInstance.current.remove();
        pinMapInstance.current = null;
      }
    };
  }, [currentStep]);

  const handleDocumentMockUpload = (docName) => {
    setUploadedDocs(prev => ({ ...prev, [docName]: true }));
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map(d => d.name === docName ? { ...d, status: 'Uploaded ✓' } : d)
    }));
    addNotification(`Document "${docName}" secure verification loaded successfully!`, 'success');
  };

  const handleFormSubmission = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login as seller to register listings.");
      return;
    }
    
    // Check files uploaded count
    const filesVettedCount = Object.keys(uploadedDocs).length;
    const requiredDocs = formData.documents.filter(d => d.required);
    const requiredUploaded = requiredDocs.every(d => uploadedDocs[d.name]);

    if (!requiredUploaded) {
      alert("Please upload all required land ownership registry papers for vetting audit.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        askingPrice: parseFloat(formData.askingPrice),
        area: parseFloat(formData.area),
        pricePerUnit: Math.round(parseFloat(formData.askingPrice) / parseFloat(formData.area)),
        images: uploadedImages,
        ownerId: user.id
      };

      await api.createProperty(payload, user.token);
      addNotification("Listing submitted successfully! Our regional surveyors will inspect boundary sketches.", "success");
      navigate('/dashboard/seller');
    } catch (err) {
      addNotification("Submission error. Please verify input formats.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', margin: 0 }} className="text-gradient">List Your Property</h2>
            <p style={{ margin: '5px 0 0', color: 'var(--text-secondary)' }}>Zero commissions. Vetted transparency. Connect directly.</p>
          </div>
          
          {/* Stepper Status Indicators */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map(step => (
              <span 
                key={step}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  background: currentStep >= step ? 'var(--accent-secondary)' : 'rgba(255,255,255,0.05)',
                  color: currentStep >= step ? 'black' : 'var(--text-secondary)',
                  border: currentStep === step ? '2px solid white' : 'none'
                }}
              >
                {step}
              </span>
            ))}
          </div>
        </div>

        {/* Stepper Panel */}
        <div 
          className="glass accent-glow" 
          style={{
            padding: '2.5rem',
            background: 'var(--bg-surface)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px'
          }}
        >

          {/* STEP 1: Property Details */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ margin: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }} className="text-gradient">Step 1: Property Specs</h3>
              
              {/* Type Select buttons */}
              <div className="form-group">
                <label>Select Land Type Category</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  {['PLOT', 'AGRICULTURAL', 'COMMERCIAL', 'RESIDENTIAL'].map(t => (
                    <button
                      key={t}
                      type="button"
                      className={`btn ${formData.propertyType === t ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => setFormData({ ...formData, propertyType: t })}
                      style={{ padding: '1rem', borderRadius: '8px', fontSize: '0.85rem' }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title input */}
              <div className="form-group">
                <label>Listing Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. High-Growth Plot near Outer Ring Road"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Location selection cascade */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>State</label>
                  <select 
                    value={formData.state} 
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                  >
                    {IndianStates.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>District / Zone</label>
                  <select 
                    value={formData.district} 
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                  >
                    {(districtMapping[formData.state] || []).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>City / Mandi</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Devanahalli" 
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label>Locality / Village</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Sector 12, Avathi" 
                    required
                    value={formData.locality}
                    onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                  />
                </div>
              </div>

              {/* Physical specifications */}
              <div className="form-group">
                <label>Full Address Details</label>
                <input 
                  type="text" 
                  placeholder="Plot A-44, near Landmark circle..." 
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Survey/Khasra No</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 124/3-A" 
                    required
                    value={formData.surveyNumber}
                    onChange={(e) => setFormData({ ...formData, surveyNumber: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Area Size</label>
                  <input 
                    type="number" 
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Area Unit</label>
                  <select 
                    value={formData.areaUnit} 
                    onChange={(e) => setFormData({ ...formData, areaUnit: e.target.value })}
                    style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                  >
                    <option value="sq ft">sq ft</option>
                    <option value="sq yards">sq yards</option>
                    <option value="acres">acres</option>
                    <option value="cents">cents</option>
                    <option value="guntha">guntha</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Road Access</label>
                  <select 
                    value={formData.roadAccess} 
                    onChange={(e) => setFormData({ ...formData, roadAccess: e.target.value })}
                    style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                  >
                    <option value="Yes">Yes (Direct tar road)</option>
                    <option value="No">No (Approach field track)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Facing Direction</label>
                  <select 
                    value={formData.facingDirection} 
                    onChange={(e) => setFormData({ ...formData, facingDirection: e.target.value })}
                    style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                  >
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Plot Shape</label>
                  <select 
                    value={formData.shape} 
                    onChange={(e) => setFormData({ ...formData, shape: e.target.value })}
                    style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }}
                  >
                    <option value="Rectangular">Rectangular</option>
                    <option value="Square">Square</option>
                    <option value="Trapezoidal">Trapezoidal</option>
                    <option value="Irregular">Irregular</option>
                  </select>
                </div>
              </div>

            </div>
          )}

          {/* STEP 2: Photos & Map coordinates */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ margin: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }} className="text-gradient">Step 2: Media & Geographic Boundaries</h3>
              
              {/* Drag n drop media mock zone */}
              <div className="form-group">
                <label>Upload Land Images (Min 3 required)</label>
                <div 
                  style={{
                    border: '2px dashed rgba(255,255,255,0.15)',
                    padding: '2rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    cursor: 'pointer'
                  }}
                  onClick={() => addNotification("Simulated upload zone: 3 mock land photographs have been loaded successfully for your listing.", 'success')}
                >
                  <UploadCloud size={32} style={{ color: 'var(--text-secondary)', marginBottom: '8px' }} />
                  <div style={{ fontWeight: 'bold' }}>Drag and Drop Photos Here</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>PNG or JPEG formats up to 10MB sizes</div>
                </div>
              </div>

              {/* Display loaded photo thumbnails */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {uploadedImages.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '90px', height: '70px', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img src={img} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', bottom: '2px', left: '2px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.65rem', padding: '0 4px', borderRadius: '2px' }}>#{idx+1}</span>
                  </div>
                ))}
              </div>

              {/* Video URL */}
              <div className="form-group">
                <label>Video Walkthrough Link (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. YouTube or Google Drive walkthrough link"
                  value={formData.videoLink}
                  onChange={(e) => setFormData({ ...formData, videoLink: e.target.value })}
                />
              </div>

              {/* Map pin coordinates selector */}
              <div className="form-group" style={{ height: '350px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span>Drop Pin on Geographic Boundaries</span>
                  <span style={{ color: 'var(--accent-secondary)' }}>LAT: {formData.latitude} | LNG: {formData.longitude}</span>
                </label>
                
                <div 
                  id="pin-map-container"
                  ref={mapContainerRef}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    zIndex: 10
                  }}
                />
              </div>

            </div>
          )}

          {/* STEP 3: Pricing calculations */}
          {currentStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ margin: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }} className="text-gradient">Step 3: Pricing Specifications</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>Asking Price (₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 5000000"
                    required
                    value={formData.askingPrice}
                    onChange={(e) => setFormData({ ...formData, askingPrice: e.target.value })}
                  />
                </div>
                
                <div className="form-group">
                  <label>Auto-Calculated Rate</label>
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontWeight: 'bold' }}>
                    ₹{Math.round(parseFloat(formData.askingPrice || 0) / parseFloat(formData.area || 1)).toLocaleString()}/{formData.areaUnit === 'acres' ? 'Acre' : 'sq ft'}
                  </div>
                </div>
              </div>

              {/* Open to negotiation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                <input 
                  type="checkbox" 
                  id="negoToggle"
                  checked={formData.openToNegotiation}
                  onChange={(e) => setFormData({ ...formData, openToNegotiation: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-secondary)' }}
                />
                <label htmlFor="negoToggle" style={{ fontSize: '0.9rem', cursor: 'pointer', color: 'white' }}>
                  Property asking price is open to structural negotiation
                </label>
              </div>

              <div className="form-group">
                <label>Preferred Payment & Closing Terms</label>
                <textarea 
                  rows="3" 
                  placeholder="e.g. 30% advance deposit during Sale Agreement execution, remainder within 45 days through direct bank remittance..."
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                />
              </div>

            </div>
          )}

          {/* STEP 4: Document checklist upload secure */}
          {currentStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ margin: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }} className="text-gradient">Step 4: Secure Vetted Auditing Checklist</h3>
              
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                To earn our gold **"100% Verified"** trust badge, please upload clear scans of original land ownership papers.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {formData.documents.map((doc, idx) => (
                  <div 
                    key={idx}
                    className="glass"
                    style={{
                      padding: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{doc.name}</span>
                        {doc.required && <span style={{ color: 'var(--accent-error)', fontSize: '0.75rem' }}>*Required</span>}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Secured registry checklist review</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: uploadedDocs[doc.name] ? 'var(--accent-secondary)' : 'var(--text-secondary)' }}>
                        {uploadedDocs[doc.name] ? 'Uploaded ✓' : 'Required'}
                      </span>
                      <button 
                        type="button" 
                        className={`btn btn-sm ${uploadedDocs[doc.name] ? 'btn-outline' : 'btn-primary'}`}
                        onClick={() => handleDocumentMockUpload(doc.name)}
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      >
                        {uploadedDocs[doc.name] ? 'Re-upload' : 'Select PDF Scan'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: 'rgba(251,191,36,0.05)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(251,191,36,0.1)' }}>
                <ShieldAlert size={16} className="text-gold" style={{ marginTop: '2px', flexShrink: 0 }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Vesta uses advanced end-to-end encrypted storage pipelines. Uploaded land titles will remain protected and only accessible to compliance audit surveyors.
                </p>
              </div>

            </div>
          )}

          {/* STEP 5: Final Review */}
          {currentStep === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ margin: 0, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }} className="text-gradient">Step 5: Review & Submit Verification</h3>
              
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                Please review your boundary layout dimensions and pricing structures carefully before submitting to audit registries.
              </p>

              {/* Specs Summary List */}
              <div className="glass" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                <div><span style={{ color: 'var(--text-secondary)' }}>Listing Title: </span>**{formData.title}**</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Zoning Category: </span>**{formData.propertyType}**</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>State/Locality: </span>**{formData.locality}, {formData.city} ({formData.state})**</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Asking Price: </span>**₹{(parseFloat(formData.askingPrice) / 100000).toFixed(1)} Lakhs**</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Survey Number: </span>**{formData.surveyNumber}**</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Area Dimensions: </span>**{formData.area} {formData.areaUnit}**</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Facing / Shape: </span>**{formData.facingDirection} / {formData.shape}**</div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Vetted Papers: </span>**{Object.keys(uploadedDocs).length} Scans Uploaded**</div>
              </div>

              {/* Visual preview card element */}
              <h4 style={{ margin: '1rem 0 0' }}>Live Explorer Grid Card Preview</h4>
              <div style={{ maxWidth: '360px', alignSelf: 'center', width: '100%' }}>
                <div className="card glass" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <img src={uploadedImages[0]} alt="preview" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-secondary)', fontWeight: 'bold' }}>{formData.locality || 'Locality'}, {formData.city || 'City'}</div>
                    <h5 style={{ fontSize: '1rem', margin: 0, color: 'white' }}>{formData.title || 'Property Title'}</h5>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span>Area: **{formData.area} {formData.areaUnit}**</span>
                      <span>Facing: **{formData.facingDirection}**</span>
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'white', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px', marginTop: '4px' }}>
                      ₹{(parseFloat(formData.askingPrice || 0) / 10000000).toFixed(2)} Cr
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Stepper Navigation buttons row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem', marginTop: '2.5rem' }}>
            
            {/* Back button */}
            <button 
              type="button" 
              className="btn btn-outline" 
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              disabled={currentStep === 1 || loading}
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>

            {/* Next / Submit button */}
            {currentStep < 5 ? (
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                <span>Continue</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ background: 'linear-gradient(135deg, var(--accent-secondary), #0369a1)', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                disabled={loading}
                onClick={handleFormSubmission}
              >
                <span>Submit to Audit Vetting</span>
                <ChevronRight size={16} />
              </button>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default ListProperty;
