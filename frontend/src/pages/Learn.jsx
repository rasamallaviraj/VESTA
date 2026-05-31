import React, { useState } from 'react';
import { 
  Calculator, FileText, CheckSquare, HelpCircle, 
  AlertTriangle, Milestone, Search, Info, Landmark 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Glossary Term Database
const glossaryData = [
  { term: 'Patta', definition: 'A legal document issued by the government in the name of the actual owner of the land, establishing ownership.' },
  { term: 'Khata', definition: 'An account assessment document showing details of a property (size, location, tax history) in municipal registers, needed for tax purposes.' },
  { term: 'Encumbrance Certificate (EC)', definition: 'A document showing whether the property is free from any legal, financial, or bank liability such as pending mortgages or liens.' },
  { term: 'Survey Number', definition: 'A unique number allocated by the survey department to a specific plot of land for identity and revenue records.' },
  { term: 'Mutation (Dakhil Kharij)', definition: 'The official process of recording the transfer of title of a property from one person to another in land revenue records.' },
  { term: 'Sale Deed', definition: 'The primary registered document that seals the transaction, transferring ownership from the seller to the buyer.' },
  { term: 'RTC / Pahani', definition: 'Record of Rights, Tenancy and Crops. Key agricultural document in Karnataka listing owner names, crop types, and soil records.' },
  { term: 'Akarband', definition: 'A land record detailing the survey number, original boundaries, size, and land assessment history.' },
  { term: 'Katha', definition: 'A measurement unit in East India (Bihar, Jharkhand, West Bengal) representing roughly 1,361 sq ft (varies by state).' },
  { term: 'Bigha', definition: 'A traditional unit of land area. One Bigha can range from 14,400 sq ft (Bengal) to 27,000 sq ft (UP/Punjab).' }
];

// Document checklist database
const docChecklist = {
  buy: [
    { name: 'Sale Deed', desc: 'Primary ownership title document.', reason: 'Establishes absolute seller ownership.', issuer: 'Sub-Registrar Office' },
    { name: 'Encumbrance Certificate', desc: 'History of transactions on property.', reason: 'Confirms no pending mortgages/liens exist.', issuer: 'Sub-Registrar Office' },
    { name: 'Khata Certificate & Extract', desc: 'Revenue registration record.', reason: 'Needed to transfer property tax assessment.', issuer: 'BBMP / Local Municipality' },
    { name: 'Property Tax Receipts', desc: 'Records of past municipal tax payments.', reason: 'Confirms no tax debts are active on property.', issuer: 'Revenue Department' },
    { name: 'Mutation Records', desc: 'Transfer history details in revenue charts.', reason: 'Verifies matching revenue record chain.', issuer: 'Tehsildar Office' },
    { name: 'Survey Sketch (Akarband)', desc: 'Official boundary layout blueprint.', reason: 'Validates exact sizes and prevents encroachment.', issuer: 'Survey Department' }
  ],
  register: [
    { name: 'ID Proof (Aadhar/Passport)', desc: 'Identification of buyer & seller.', reason: 'Required by registrar to verify parties.', issuer: 'UIDAI / Govt of India' },
    { name: 'PAN Card', desc: 'Income tax card.', reason: 'Mandatory for transactions above ₹5 Lakhs.', issuer: 'IT Department' },
    { name: 'Stamp Duty Challan', desc: 'Stamp fee payment receipt.', reason: 'Proof that transaction taxes are fully settled.', issuer: 'State Bank / Treasury' },
    { name: 'Address Proof', desc: 'Residence proof document.', reason: 'Confirms permanent residential registry.', issuer: 'Govt Agencies' }
  ],
  sell: [
    { name: 'Title Deed (Original Purchase)', desc: 'Sellers own registration papers.', reason: 'Proves how seller acquired property.', issuer: 'Sub-Registrar Office' },
    { name: 'No Objection Certificate (NOC)', desc: 'Clearance from local bodies.', reason: 'Validates no disputes or utility dues exist.', issuer: 'Panchayat / Municipal Corporation' },
    { name: 'Bank Clearance Certificate', desc: 'Lien release letter.', reason: 'Confirms any past mortgages are closed.', issuer: 'Lending Bank' }
  ]
};

// Unit Conversions constants
const conversionRates = {
  sqft: 1,
  sqyards: 9,
  cents: 435.6,
  acres: 43560,
  guntha: 1089,
  hectare: 107639,
  bigha: 27000,
  marla: 272.25,
  kanal: 5445,
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

// State Stamp Duty Rates mapping
const stateStampDutyRates = {
  Telangana: { stamp: 5.5, registration: 2.0 },
  Karnataka: { stamp: 5.0, registration: 1.6 },
  Maharashtra: { stamp: 5.0, registration: 1.0 },
  Delhi: { stamp: 6.0, registration: 1.0 },
  TamilNadu: { stamp: 7.0, registration: 2.0 },
  AndhraPradesh: { stamp: 5.5, registration: 2.0 },
  UttarPradesh: { stamp: 7.0, registration: 1.0 }
};

const Learn = () => {
  const { addNotification } = useAuth();

  // Unit Converter States
  const [convVal, setConvVal] = useState('1');
  const [convUnit, setConvUnit] = useState('acres');

  // Stamp Duty States
  const [stampState, setStampState] = useState('Telangana');
  const [propertyVal, setPropertyVal] = useState('5000000'); // 50 Lakhs default

  // Glossary States
  const [searchQuery, setSearchQuery] = useState('');

  const handleConvert = (val, unit) => {
    const num = parseFloat(val);
    if (isNaN(num)) return {};
    const baseSqft = num * conversionRates[unit];
    const res = {};
    Object.keys(conversionRates).forEach(k => {
      res[k] = (baseSqft / conversionRates[k]).toFixed(4);
    });
    return res;
  };

  const convResults = handleConvert(convVal, convUnit);

  // Stamp Duty Calculator Calculation
  const calculateFees = () => {
    const val = parseFloat(propertyVal);
    if (isNaN(val) || val <= 0) return { stampDuty: 0, registration: 0, total: 0 };
    const rates = stateStampDutyRates[stampState] || stateStampDutyRates.Telangana;
    const stampDuty = val * (rates.stamp / 100);
    const registration = val * (rates.registration / 100);
    return {
      stampDuty,
      registration,
      total: stampDuty + registration
    };
  };

  const feeResults = calculateFees();

  const filteredGlossary = glossaryData.filter(g => 
    g.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', paddingTop: '8rem', paddingBottom: '6rem' }}>
      <div className="container">
        
        {/* Page Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', margin: 0 }} className="text-gradient">Knowledge Hub</h2>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)' }}>
            Expand your land-buying superpower. Interactive calculations, verified checklists, and legal translations.
          </p>
        </div>

        {/* Section 1: Measurements & Interactive Converter */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1.2fr))', gap: '2rem', marginBottom: '4rem' }}>
          
          {/* Visual Units Guide */}
          <div className="glass accent-glow" style={{ padding: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
              <Info size={20} className="text-secondary" />
              <span>Comparative Scale Guide</span>
            </h3>
            
            <p style={{ fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Land measurements vary extensively by region in India. Here is a clear visual index showing how they scale relative to one another.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>1 ACRE REPRESENTATION</span>
                  <span>43,560 Sq Ft</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginTop: '6px' }}>
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>1 HECTARE REPRESENTATION</span>
                  <span>107,639 Sq Ft (2.47 Acres)</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginTop: '6px' }}>
                  <div style={{ width: '100%', height: '100%', background: 'var(--accent-purple)' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>1 GUNTHA REPRESENTATION</span>
                  <span>1,089 Sq Ft (1/40th of Acre)</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginTop: '6px' }}>
                  <div style={{ width: '2.5%', height: '100%', background: 'var(--accent-gold)' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Converter Widget */}
          <div className="glass" style={{ padding: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
              <Calculator size={20} className="text-gradient" />
              <span>Interactive Unit Converter</span>
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label>Input Area Size</label>
                <input 
                  type="number" 
                  value={convVal} 
                  onChange={(e) => setConvVal(e.target.value)}
                  style={{
                    padding: '0.85rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    outline: 'none'
                  }}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Source Unit</label>
                <select 
                  value={convUnit} 
                  onChange={(e) => setConvUnit(e.target.value)}
                  style={{
                    padding: '0.85rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    outline: 'none'
                  }}
                >
                  {Object.keys(unitLabels).map(k => (
                    <option key={k} value={k}>{unitLabels[k]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid display */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              {Object.keys(unitLabels).map(k => {
                if (k === convUnit) return null;
                return (
                  <div key={k} style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{unitLabels[k].split(' (')[0]}</div>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem', marginTop: '4px', wordBreak: 'break-all' }}>{parseFloat(convResults[k] || 0).toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Section 2: Stamp Duty Calculator */}
        <div 
          className="glass purple-glow" 
          style={{
            padding: '2.5rem',
            background: 'linear-gradient(135deg, rgba(20,20,25,0.8), rgba(5,5,5,0.95))',
            border: '1px solid rgba(168,85,247,0.3)',
            borderRadius: '20px',
            marginBottom: '4rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <Landmark size={24} className="text-purple" />
            <h3 style={{ margin: 0 }}>Stamp Duty & Registration Calculator</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            {/* Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label>Select State</label>
                <select 
                  value={stampState} 
                  onChange={(e) => setStampState(e.target.value)}
                  style={{
                    padding: '0.85rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    outline: 'none'
                  }}
                >
                  <option value="Telangana">Telangana (7.5%)</option>
                  <option value="Karnataka">Karnataka (6.6%)</option>
                  <option value="Maharashtra">Maharashtra (6.0%)</option>
                  <option value="Delhi">Delhi (7.0%)</option>
                  <option value="TamilNadu">Tamil Nadu (9.0%)</option>
                  <option value="AndhraPradesh">Andhra Pradesh (7.5%)</option>
                  <option value="UttarPradesh">Uttar Pradesh (8.0%)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Estimated Property Value (₹)</label>
                <input 
                  type="number" 
                  value={propertyVal} 
                  onChange={(e) => setPropertyVal(e.target.value)}
                  style={{
                    padding: '0.85rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    outline: 'none'
                  }}
                  min="0"
                />
              </div>
            </div>

            {/* Calculations display panel */}
            <div className="glass" style={{ padding: '2rem', background: 'rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Stamp Duty ({stateStampDutyRates[stampState]?.stamp}%)</span>
                <span style={{ fontWeight: 'bold' }}>₹{feeResults.stampDuty.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Registration Charges ({stateStampDutyRates[stampState]?.registration}%)</span>
                <span style={{ fontWeight: 'bold' }}>₹{feeResults.registration.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', paddingTop: '5px' }}>
                <span className="text-gradient">Total Taxes</span>
                <span className="text-gradient">₹{feeResults.total.toLocaleString()}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Section 3: Essential Documents Checklists */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
            <FileText size={24} className="text-secondary" />
            <h3 style={{ margin: 0 }}>Vested Registry Documents Checklists</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Category: To Buy */}
            <div>
              <h4 style={{ color: 'var(--accent-secondary)', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>Essential to BUY Land</h4>
              <div className="grid-3">
                {docChecklist.buy.map((doc, idx) => (
                  <div key={idx} className="card glass accent-glow" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h5 style={{ fontSize: '1.1rem', margin: 0, color: 'white' }}>{doc.name}</h5>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{doc.desc}</p>
                    <div style={{ fontSize: '0.8rem', marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px' }}>
                      <span style={{ color: 'var(--accent-secondary)' }}>WHY NEEDED: </span>
                      <span style={{ color: 'white' }}>{doc.reason}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span>ISSUER: </span>
                      <span style={{ fontWeight: 'bold' }}>{doc.issuer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category: Register & Sell */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              <div>
                <h4 style={{ color: 'var(--accent-purple)', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>Needed to REGISTER Plot</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {docChecklist.register.map((doc, idx) => (
                    <div key={idx} className="glass" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontWeight: 'bold', color: 'white' }}>{doc.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{doc.desc}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Issuer: **{doc.issuer}**</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ color: 'var(--accent-gold)', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>Required by SELLER to List</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {docChecklist.sell.map((doc, idx) => (
                    <div key={idx} className="glass" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontWeight: 'bold', color: 'white' }}>{doc.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{doc.desc}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Issuer: **{doc.issuer}**</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Section 4: Red Flags Warning Cards */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
            <AlertTriangle size={24} className="text-secondary" />
            <h3 style={{ margin: 0 }}>Critical RED FLAGS to Avoid</h3>
          </div>

          <div className="grid-3">
            {/* Red Flag 1 */}
            <div 
              className="card glass" 
              style={{
                border: '1px solid rgba(245, 158, 11, 0.2)',
                boxShadow: '0 0 30px rgba(245, 158, 11, 0.05)',
                padding: '2rem'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⚠️</div>
              <h4 style={{ color: '#f59e0b' }}>1. Missing Encumbrance Records</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Never accept an EC spanning less than 15 years. Disputed loans or boundary mortgages might reside in earlier registries, risking bank foreclosure.
              </p>
            </div>

            {/* Red Flag 2 */}
            <div 
              className="card glass" 
              style={{
                border: '1px solid rgba(245, 158, 11, 0.2)',
                boxShadow: '0 0 30px rgba(245, 158, 11, 0.05)',
                padding: '2rem'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⚠️</div>
              <h4 style={{ color: '#f59e0b' }}>2. Unapproved Lay-Outs</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Verify structural DTCP or HMDA approvals. Unapproved agriculture plots cannot acquire building permits or electricity/municipal water connections.
              </p>
            </div>

            {/* Red Flag 3 */}
            <div 
              className="card glass" 
              style={{
                border: '1px solid rgba(245, 158, 11, 0.2)',
                boxShadow: '0 0 30px rgba(245, 158, 11, 0.05)',
                padding: '2rem'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⚠️</div>
              <h4 style={{ color: '#f59e0b' }}>3. Mismatch in Patta Names</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Proactively match passbook titleholders against Sale Deeds. A mismatch indicates outdated municipal records or potential inheritance disputes.
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: Step-by-Step Buying Guide Timeline */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2.5rem' }}>
            <Milestone size={24} className="text-secondary" />
            <h3 style={{ margin: 0 }}>Step-by-Step Purchasing Journey</h3>
          </div>

          <div style={{ position: 'relative', paddingLeft: '35px', borderLeft: '2px solid rgba(255,255,255,0.05)' }}>
            
            {/* Step 1 */}
            <div style={{ position: 'relative', marginBottom: '2rem' }}>
              <div style={{ position: 'absolute', left: '-44px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent-secondary)', border: '4px solid var(--bg-color)' }}></div>
              <h5 style={{ fontSize: '1.1rem', color: 'white', margin: 0 }}>Step 1: Locate & Survey Plots</h5>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Filter listings on VESTA based on states and types. Inspect geographic markers and boundary dimensions.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ position: 'relative', marginBottom: '2rem' }}>
              <div style={{ position: 'absolute', left: '-44px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent-primary)', border: '4px solid var(--bg-color)' }}></div>
              <h5 style={{ fontSize: '1.1rem', color: 'white', margin: 0 }}>Step 2: Inspect Land DNA Records</h5>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Verify original titles, trace ownership chains, and ensure a NIL Encumbrance Certificate is active.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ position: 'relative', marginBottom: '2rem' }}>
              <div style={{ position: 'absolute', left: '-44px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent-purple)', border: '4px solid var(--bg-color)' }}></div>
              <h5 style={{ fontSize: '1.1rem', color: 'white', margin: 0 }}>Step 3: Consult Vested Experts</h5>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Book detailed video slots with regional land surveyors and real estate attorneys to vet pending clearances.
              </p>
            </div>

            {/* Step 4 */}
            <div style={{ position: 'relative', marginBottom: '2rem' }}>
              <div style={{ position: 'absolute', left: '-44px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent-gold)', border: '4px solid var(--bg-color)' }}></div>
              <h5 style={{ fontSize: '1.1rem', color: 'white', margin: 0 }}>Step 4: Register & File Mutation</h5>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Pay state stamp duty online, register details at sub-registrar desks, and record the mutation transfer in revenue charts.
              </p>
            </div>

          </div>
        </div>

        {/* Section 6: Glossary */}
        <div className="glass" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <HelpCircle size={24} className="text-secondary" />
              <h3 style={{ margin: 0 }}>Real Estate Glossary A-Z</h3>
            </div>
            
            {/* Search glossary */}
            <div style={{ position: 'relative', width: '300px' }}>
              <input 
                type="text" 
                placeholder="Search legal terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filteredGlossary.map((g, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--accent-secondary)' }}>{g.term}</div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.5' }}>{g.definition}</p>
              </div>
            ))}
            {filteredGlossary.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', gridColumn: '1/-1' }}>No results match your search term.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Learn;
