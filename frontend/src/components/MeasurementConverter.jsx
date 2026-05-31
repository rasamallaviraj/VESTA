import React, { useState } from 'react';
import { Calculator, X, RefreshCw } from 'lucide-react';

const conversionRates = {
  sqft: 1,
  sqyards: 9,      // 1 sq yard = 9 sq ft
  cents: 435.6,    // 1 cent = 435.6 sq ft
  acres: 43560,    // 1 acre = 43560 sq ft
  guntha: 1089,    // 1 guntha = 1089 sq ft
  hectare: 107639, // 1 hectare = 107639 sq ft
  bigha: 27000,    // 1 bigha (standard North) = 27000 sq ft
  marla: 272.25,   // 1 marla = 272.25 sq ft
  kanal: 5445,     // 1 kanal = 5445 sq ft
};

const unitLabels = {
  sqft: 'Square Feet (sq ft)',
  sqyards: 'Square Yards (Gaj)',
  cents: 'Cents',
  acres: 'Acres',
  guntha: 'Guntha',
  hectare: 'Hectare',
  bigha: 'Bigha (Standard)',
  marla: 'Marla',
  kanal: 'Kanal',
};

const MeasurementConverter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState('1');
  const [unit, setUnit] = useState('acres');

  const handleConvert = (inputVal, inputUnit) => {
    const num = parseFloat(inputVal);
    if (isNaN(num)) return {};

    // Convert input unit to sqft (base unit)
    const baseSqft = num * conversionRates[inputUnit];

    // Convert from base to all other units
    const results = {};
    Object.keys(conversionRates).forEach(k => {
      results[k] = (baseSqft / conversionRates[k]).toLocaleString(undefined, {
        maximumFractionDigits: 4,
        minimumFractionDigits: 0
      });
    });
    return results;
  };

  const results = handleConvert(value, unit);

  return (
    <div style={{ position: 'fixed', bottom: '25px', right: '25px', zIndex: 999 }}>
      {/* Trigger Button */}
      {!isOpen && (
        <button 
          className="btn btn-primary" 
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.5)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
          onClick={() => setIsOpen(true)}
        >
          <Calculator size={24} />
        </button>
      )}

      {/* Floating Panel */}
      {isOpen && (
        <div 
          className="glass accent-glow" 
          style={{
            width: '320px',
            padding: '1.5rem',
            background: 'rgba(10, 10, 15, 0.95)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
            borderRadius: '16px',
            animation: 'float 6s ease-in-out infinite'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
              <Calculator size={18} className="text-gradient" />
              <span>Land Converter</span>
            </h4>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Input fields */}
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Enter Land Value</label>
              <input 
                type="number" 
                value={value} 
                onChange={(e) => setValue(e.target.value)}
                style={{
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  width: '100%',
                  outline: 'none'
                }}
                min="0"
                step="any"
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Source Unit</label>
              <select 
                value={unit} 
                onChange={(e) => setUnit(e.target.value)}
                style={{
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  width: '100%',
                  outline: 'none'
                }}
              >
                {Object.keys(unitLabels).map(k => (
                  <option key={k} value={k}>{unitLabels[k]}</option>
                ))}
              </select>
            </div>

            {/* Results Grid */}
            <div style={{
              marginTop: '1rem',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingTop: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              maxHeight: '180px',
              overflowY: 'auto',
              paddingRight: '4px'
            }}>
              {Object.keys(unitLabels).map(k => {
                if (k === unit) return null;
                return (
                  <div key={k} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.825rem',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '6px 10px',
                    borderRadius: '6px'
                  }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{unitLabels[k].split(' (')[0]}</span>
                    <span style={{ fontWeight: 'bold', color: 'white' }}>{results[k] || '0'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeasurementConverter;
