import React, { useState, useEffect } from 'react';
import { api, mockProperties } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { Search, SlidersHorizontal, MapPin, IndianRupee, Layers, Grid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const IndianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const filterPropertiesLocally = (list, filters) => {
  let result = [...list];

  if (filters.state) {
    result = result.filter(p => p.state && p.state.toLowerCase() === filters.state.toLowerCase());
  }
  if (filters.city) {
    result = result.filter(p => p.city && p.city.toLowerCase().includes(filters.city.toLowerCase()));
  }
  if (filters.propertyType && filters.propertyType !== 'All') {
    result = result.filter(p => {
      const pType = p.propertyType || '';
      return pType.toLowerCase() === filters.propertyType.toLowerCase();
    });
  }
  if (filters.priceMax) {
    result = result.filter(p => p.askingPrice <= Number(filters.priceMax));
  }
  if (filters.areaMin) {
    const fMin = Number(filters.areaMin);
    result = result.filter(p => {
      if (!p.area) return false;
      let pAreaSqFt = p.area;
      if (p.areaUnit === 'acres') pAreaSqFt = p.area * 43560;
      else if (p.areaUnit === 'cents') pAreaSqFt = p.area * 435.6;
      else if (p.areaUnit === 'guntha') pAreaSqFt = p.area * 1089;

      let fAreaSqFt = fMin;
      if (filters.areaUnit === 'acres') fAreaSqFt = fMin * 43560;
      else if (filters.areaUnit === 'cents') fAreaSqFt = fMin * 435.6;
      else if (filters.areaUnit === 'guntha') fAreaSqFt = fMin * 1089;

      return pAreaSqFt >= fAreaSqFt;
    });
  }

  // Sort
  if (filters.sort) {
    if (filters.sort === 'price_asc') {
      result.sort((a, b) => a.askingPrice - b.askingPrice);
    } else if (filters.sort === 'price_desc') {
      result.sort((a, b) => b.askingPrice - a.askingPrice);
    } else if (filters.sort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
    } else if (filters.sort === 'ai_recommended') {
      result.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
    }
  }

  return result;
};

const Explore = ({ compareList, onToggleCompare }) => {
  const { addNotification } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [filters, setFilters] = useState({
    state: '',
    city: '',
    propertyType: 'All',
    priceMax: 150000000, // ₹15 Cr default max
    areaMin: '',
    areaUnit: 'sq ft',
    sort: 'ai_recommended'
  });

  // State-specific district hints (dynamic cities helper)
  const getCityPlaceholder = () => {
    if (filters.state === 'Telangana') return 'e.g. Hyderabad, Secunderabad, Warangal';
    if (filters.state === 'Karnataka') return 'e.g. Bangalore, Devanahalli, Mysore';
    if (filters.state === 'Maharashtra') return 'e.g. Pune, Mumbai, Nagpur';
    if (filters.state === 'Uttar Pradesh') return 'e.g. Noida, Ghaziabad, Lucknow';
    return 'Enter city or district';
  };

  const fetchListings = async () => {
    setLoading(true);
    const BASE = import.meta.env.VITE_API_URL || '';
    let realProperties = [];
    try {
      const res = await fetch(`${BASE}/api/properties`);
      if (res.ok) {
        realProperties = await res.json();
      }
    } catch (e) {
      console.warn("Backend offline or error loading properties. Using mock properties only.", e);
    }

    const combined = [...realProperties, ...mockProperties];
    const filtered = filterPropertiesLocally(combined, filters);
    setProperties(filtered);
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      state: '',
      city: '',
      propertyType: 'All',
      priceMax: 150000000,
      areaMin: '',
      areaUnit: 'sq ft',
      sort: 'ai_recommended'
    });
    addNotification("Filters reset. Showing all verified lands.");
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem' }}>
      <div className="container">
        
        {/* Top Header Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }} className="text-gradient">Explore Properties</h2>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)' }}>
            Search and check verified Land DNA of listings directly from owners.
          </p>
        </div>

        {/* Filter Bar */}
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
          {/* Row 1: State & City & Type Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
            
            {/* State Select */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} className="text-gradient" />
                <span>State</span>
              </label>
              <select 
                value={filters.state} 
                onChange={(e) => setFilters({ ...filters, state: e.target.value, city: '' })}
                style={{
                  padding: '0.85rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none'
                }}
              >
                <option value="">All Indian States</option>
                {IndianStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {/* City Input */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Search size={14} className="text-secondary" />
                <span>City / District</span>
              </label>
              <input 
                type="text" 
                placeholder={getCityPlaceholder()}
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                style={{
                  padding: '0.85rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none'
                }}
              />
            </div>

            {/* Sorting */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <SlidersHorizontal size={14} />
                <span>Sort By</span>
              </label>
              <select 
                value={filters.sort} 
                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                style={{
                  padding: '0.85rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none'
                }}
              >
                <option value="ai_recommended">🔮 AI Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest Listings</option>
              </select>
            </div>

          </div>

          {/* Row 2: Property Type Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} />
              <span>Property Type</span>
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['All', 'Land', 'Agricultural', 'Plot', 'Commercial'].map(tab => (
                <button
                  key={tab}
                  className={`btn btn-sm ${filters.propertyType === tab ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setFilters({ ...filters, propertyType: tab })}
                  style={{
                    borderRadius: '8px',
                    background: filters.propertyType === tab ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'transparent'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Price Range Slider & Area Filter */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
            
            {/* Price Max Slider */}
            <div className="form-group">
              <label style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IndianRupee size={14} className="text-secondary" />
                  <span>Max Budget</span>
                </span>
                <span style={{ fontWeight: 'bold', color: 'white' }}>
                  ₹{(filters.priceMax / 10000000).toFixed(2)} Cr
                </span>
              </label>
              <input 
                type="range" 
                min="500000" 
                max="200000000" 
                step="500000"
                value={filters.priceMax} 
                onChange={(e) => setFilters({ ...filters, priceMax: Number(e.target.value) })}
                style={{
                  width: '100%',
                  accentColor: 'var(--accent-secondary)',
                  cursor: 'pointer',
                  height: '6px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '3px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Minimum Area Input */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Grid size={14} />
                <span>Min Area Size</span>
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="number" 
                  placeholder="e.g. 1000"
                  value={filters.areaMin}
                  onChange={(e) => setFilters({ ...filters, areaMin: e.target.value })}
                  style={{
                    padding: '0.85rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    outline: 'none',
                    flexGrow: 1
                  }}
                />
                <select
                  value={filters.areaUnit}
                  onChange={(e) => setFilters({ ...filters, areaUnit: e.target.value })}
                  style={{
                    padding: '0.85rem',
                    background: 'var(--bg-color)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    outline: 'none',
                    width: '100px'
                  }}
                >
                  <option value="sq ft">sq ft</option>
                  <option value="acres">acres</option>
                  <option value="cents">cents</option>
                  <option value="guntha">guntha</option>
                </select>
              </div>
            </div>

          </div>

          {/* Reset Filters Panel */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button className="btn btn-sm btn-outline" onClick={handleResetFilters}>
              Reset Filters
            </button>
          </div>

        </div>

        {/* Property Grid Renders */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
            <div className="loader" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>Scanning Land DNAs...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="glass text-center" style={{ padding: '4rem 2rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <MapPin size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }} />
            <h3>No Verified Lands Match Your Criteria</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
              We could not find any listings fitting these exact boundaries. Try raising your budget or selecting general states.
            </p>
            <button className="btn btn-primary btn-sm" onClick={handleResetFilters}>Show All Lands</button>
          </div>
        ) : (
          <div>
            <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              {properties.map(property => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  onToggleCompare={onToggleCompare}
                  isCompared={!!compareList.find(c => c.id === property.id)}
                />
              ))}
            </div>
            <p style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Showing {properties.length} active, verified properties. Double check specs with Vesta AI.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Explore;
