const BASE = import.meta.env.VITE_API_URL || '';
// Rich Seed Data for Offline Fallbacks
export const mockProperties = [
  {
    id: 'prop-1',
    title: 'Gachibowli High-Growth IT Plot',
    propertyType: 'PLOT',
    state: 'Telangana',
    district: 'Rangareddy',
    city: 'Hyderabad',
    locality: 'Gachibowli',
    address: 'Survey No. 124, Gachibowli Main Rd, Near DLF Cyber City, Hyderabad, 500032',
    surveyNumber: '124/A/2',
    area: 4800,
    areaUnit: 'sq ft',
    roadAccess: 'Yes',
    facingDirection: 'East',
    shape: 'Rectangular',
    askingPrice: 85000000,
    pricePerUnit: 17708,
    openToNegotiation: true,
    paymentTerms: '45-day closing period, bank transfer preferred',
    status: 'ACTIVE',
    viewsCount: 1420,
    inquiryCount: 45,
    ownerId: 'owner-1',
    verified: true,
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1444653389962-8149286c578a?auto=format&fit=crop&w=600&q=80'
    ],
    videoLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    latitude: 17.4483,
    longitude: 78.3488,
    documents: [
      { name: 'Sale Deed', status: 'Uploaded ✓', file: 'sale_deed.pdf' },
      { name: 'Encumbrance Certificate', status: 'Uploaded ✓', file: 'ec.pdf' },
      { name: 'Khata/Patta', status: 'Uploaded ✓', file: 'khata.pdf' },
      { name: 'Property Tax Receipts', status: 'Uploaded ✓', file: 'tax.pdf' },
      { name: 'Mutation Records', status: 'Uploaded ✓', file: 'mutation.pdf' },
      { name: 'Survey Sketch', status: 'Uploaded ✓', file: 'sketch.pdf' }
    ],
    priceHistory: [
      { year: '2022', price: 68000000 },
      { year: '2023', price: 72000000 },
      { year: '2024', price: 79000000 },
      { year: '2025', price: 82000000 },
      { year: '2026', price: 85000000 }
    ],
    createdAt: new Date('2026-01-15')
  },
  {
    id: 'prop-2',
    title: 'Devanahalli Organic Agri Farmland',
    propertyType: 'AGRICULTURAL',
    state: 'Karnataka',
    district: 'Bangalore Rural',
    city: 'Devanahalli',
    locality: 'Avathi',
    address: 'Sy No. 411, Avathi Village, Near Kempegowda Intl Airport, Devanahalli, 562110',
    surveyNumber: '411/3',
    area: 2.5,
    areaUnit: 'acres',
    roadAccess: 'Yes',
    facingDirection: 'North',
    shape: 'Square',
    askingPrice: 32000000,
    pricePerUnit: 12800000,
    openToNegotiation: true,
    paymentTerms: 'Lump-sum, agricultural buyer certificate mandatory',
    status: 'ACTIVE',
    viewsCount: 980,
    inquiryCount: 22,
    ownerId: 'owner-2',
    verified: true,
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500937386664-56d159062255?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1599839446255-a0cf6d183d29?auto=format&fit=crop&w=600&q=80'
    ],
    videoLink: '',
    latitude: 13.2505,
    longitude: 77.7126,
    documents: [
      { name: 'Title Deed', status: 'Uploaded ✓', file: 'title_deed.pdf' },
      { name: 'RTC / Pahani', status: 'Uploaded ✓', file: 'rtc.pdf' },
      { name: 'NOC from Tehsildar', status: 'Uploaded ✓', file: 'noc.pdf' },
      { name: 'Survey Sketch (Akarband)', status: 'Uploaded ✓', file: 'akarband.pdf' }
    ],
    priceHistory: [
      { year: '2022', price: 24000000 },
      { year: '2023', price: 26000000 },
      { year: '2024', price: 29000000 },
      { year: '2025', price: 30000000 },
      { year: '2026', price: 32000000 }
    ],
    createdAt: new Date('2026-02-10')
  },
  {
    id: 'prop-3',
    title: 'Hinjewadi Premium Commercial Corner Plot',
    propertyType: 'COMMERCIAL',
    state: 'Maharashtra',
    district: 'Pune',
    city: 'Pune',
    locality: 'Hinjewadi Phase 2',
    address: 'Plot 45-B, Hinjewadi Phase II Industrial Area, near Wipro Circle, Pune, 411057',
    surveyNumber: '45/B/II',
    area: 12000,
    areaUnit: 'sq ft',
    roadAccess: 'Yes',
    facingDirection: 'West',
    shape: 'L-Shape',
    askingPrice: 145000000,
    pricePerUnit: 12083,
    openToNegotiation: false,
    paymentTerms: 'Bank guarantee, immediate deed transfer',
    status: 'ACTIVE',
    viewsCount: 2200,
    inquiryCount: 68,
    ownerId: 'owner-3',
    verified: true,
    images: [
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'
    ],
    videoLink: '',
    latitude: 18.5913,
    longitude: 73.7191,
    documents: [
      { name: 'MIDC Lease Agreement', status: 'Uploaded ✓', file: 'lease.pdf' },
      { name: 'NOC from MPCB', status: 'Uploaded ✓', file: 'mpcb.pdf' },
      { name: 'Sanctioned Layout Plan', status: 'Uploaded ✓', file: 'layout.pdf' }
    ],
    priceHistory: [
      { year: '2022', price: 110000000 },
      { year: '2023', price: 122000000 },
      { year: '2024', price: 130000000 },
      { year: '2025', price: 138000000 },
      { year: '2026', price: 145000000 }
    ],
    createdAt: new Date('2026-03-01')
  },
  {
    id: 'prop-4',
    title: 'Devi Lal Sector 150 Investment Land',
    propertyType: 'PLOT',
    state: 'Uttar Pradesh',
    district: 'Gautam Buddha Nagar',
    city: 'Noida',
    locality: 'Sector 150',
    address: 'Plot A-33, Noida Expressway, Sector 150, Noida, 201310',
    surveyNumber: '891/4',
    area: 5400,
    areaUnit: 'sq ft',
    roadAccess: 'Yes',
    facingDirection: 'South',
    shape: 'Rectangular',
    askingPrice: 42000000,
    pricePerUnit: 7777,
    openToNegotiation: true,
    paymentTerms: '30% upfront, balance in 3 equal monthly installments',
    status: 'ACTIVE',
    viewsCount: 1650,
    inquiryCount: 39,
    ownerId: 'owner-4',
    verified: true,
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80'
    ],
    videoLink: '',
    latitude: 28.4357,
    longitude: 77.4912,
    documents: [
      { name: 'Noida Authority Allotment Letter', status: 'Uploaded ✓', file: 'allotment.pdf' },
      { name: 'Possession Certificate', status: 'Uploaded ✓', file: 'possession.pdf' },
      { name: 'Transfer Memorandum', status: 'Uploaded ✓', file: 'transfer.pdf' }
    ],
    priceHistory: [
      { year: '2022', price: 31000000 },
      { year: '2023', price: 33500000 },
      { year: '2024', price: 36000000 },
      { year: '2025', price: 39500000 },
      { year: '2026', price: 42000000 }
    ],
    createdAt: new Date('2026-03-20')
  },
  {
    id: 'prop-5',
    title: 'Guntur Cultivation Farmland',
    propertyType: 'AGRICULTURAL',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    city: 'Guntur',
    locality: 'Amaravati Region',
    address: 'Survey No. 78, Amaravati Outer Ring Rd, Guntur, 522001',
    surveyNumber: '78/2-C',
    area: 4.5,
    areaUnit: 'acres',
    roadAccess: 'Yes',
    facingDirection: 'East',
    shape: 'Trapezoidal',
    askingPrice: 58000000,
    pricePerUnit: 12888888,
    openToNegotiation: true,
    paymentTerms: 'Direct bank transfer, crop clearances available',
    status: 'ACTIVE',
    viewsCount: 780,
    inquiryCount: 15,
    ownerId: 'owner-5',
    verified: true,
    images: [
      'https://images.unsplash.com/photo-1599839446255-a0cf6d183d29?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500937386664-56d159062255?auto=format&fit=crop&w=600&q=80'
    ],
    videoLink: '',
    latitude: 16.3067,
    longitude: 80.4365,
    documents: [
      { name: 'Pattadar Passbook', status: 'Uploaded ✓', file: 'passbook.pdf' },
      { name: '1-B Adangal Record', status: 'Uploaded ✓', file: 'adangal.pdf' },
      { name: 'No Lien Certificate', status: 'Uploaded ✓', file: 'nolien.pdf' }
    ],
    priceHistory: [
      { year: '2022', price: 42000000 },
      { year: '2023', price: 46000000 },
      { year: '2024', price: 51000000 },
      { year: '2025', price: 55000000 },
      { year: '2026', price: 58000000 }
    ],
    createdAt: new Date('2026-04-05')
  }
];

export const mockExperts = [
  {
    id: 'exp-1',
    name: 'Advocate Rajesh Sen',
    photo: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=300&q=80',
    specialization: 'Legal',
    city: 'Hyderabad',
    state: 'Telangana',
    languages: ['English', 'Telugu', 'Hindi'],
    experienceYears: 14,
    rating: 4.9,
    bio: 'Specialist in land title clearance, land disputes resolution, stamp duty regulations, and state legislation. Ex-advisor to national builders.',
    pastDealsCount: 240,
    certifications: ['Bar Council of Telangana', 'PG Diploma in Cyber & Land Laws'],
    availabilityCalendar: {
      'Monday': ['10:00 AM', '2:00 PM', '4:30 PM'],
      'Wednesday': ['11:00 AM', '3:00 PM', '5:00 PM'],
      'Friday': ['10:00 AM', '1:00 PM', '4:00 PM']
    }
  },
  {
    id: 'exp-2',
    name: 'Harish R. Gowda',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    specialization: 'Agricultural',
    city: 'Bangalore',
    state: 'Karnataka',
    languages: ['English', 'Kannada'],
    experienceYears: 18,
    rating: 4.8,
    bio: 'Dedicated agricultural zoning consultant. Assisting buyers with RTC/Pahani paperwork, soil viability assessments, and mutation records.',
    pastDealsCount: 310,
    certifications: ['Karnataka Agrarian Association member', 'M.Sc. Agricultural Sciences'],
    availabilityCalendar: {
      'Tuesday': ['9:00 AM', '12:00 PM', '3:30 PM'],
      'Thursday': ['10:00 AM', '2:00 PM', '4:00 PM'],
      'Saturday': ['10:00 AM', '1:00 PM']
    }
  },
  {
    id: 'exp-3',
    name: 'Priyanka Sharma',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    specialization: 'Land',
    city: 'Pune',
    state: 'Maharashtra',
    languages: ['English', 'Marathi', 'Hindi'],
    experienceYears: 10,
    rating: 4.7,
    bio: 'Expert in commercial zoning layout planning, NA conversions, industrial acquisitions, and fast-track municipal development sanctions.',
    pastDealsCount: 165,
    certifications: ['Maharashtra Real Estate Valuer Board', 'Architectural Survey Council'],
    availabilityCalendar: {
      'Monday': ['11:00 AM', '3:30 PM'],
      'Thursday': ['11:00 AM', '3:00 PM', '5:00 PM'],
      'Friday': ['9:30 AM', '2:00 PM']
    }
  },
  {
    id: 'exp-4',
    name: 'Amitabh Bajpai',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    specialization: 'NRI Properties',
    city: 'Noida',
    state: 'Uttar Pradesh',
    languages: ['English', 'Hindi'],
    experienceYears: 12,
    rating: 4.9,
    bio: 'Helps NRIs seamlessly inspect land, manage documentation power-of-attorney, coordinate secure remittance, and vet land boundary surveys.',
    pastDealsCount: 190,
    certifications: ['REIA-India NRI Consultant Lead', 'FEMA regulations certified advisor'],
    availabilityCalendar: {
      'Wednesday': ['2:00 PM', '4:00 PM', '6:00 PM'],
      'Saturday': ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM']
    }
  }
];

// Core API Interfaces with Local fallback hooks
export const api = {
  // Property Listings APIs
  getProperties: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const res = await fetch(`${BASE}/api/properties?${queryParams}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend offline. Running property filters locally.");
    }
    
    // Apply filters in mock data local fallback
    let result = [...mockProperties];
    
    if (filters.state) {
      result = result.filter(p => p.state.toLowerCase() === filters.state.toLowerCase());
    }
    if (filters.propertyType && filters.propertyType !== 'All') {
      result = result.filter(p => p.propertyType.toLowerCase() === filters.propertyType.toLowerCase());
    }
    if (filters.priceMax) {
      result = result.filter(p => p.askingPrice <= Number(filters.priceMax));
    }
    if (filters.city) {
      result = result.filter(p => p.city.toLowerCase().includes(filters.city.toLowerCase()));
    }
    
    // Sort
    if (filters.sort) {
      if (filters.sort === 'price_asc') {
        result.sort((a, b) => a.askingPrice - b.askingPrice);
      } else if (filters.sort === 'price_desc') {
        result.sort((a, b) => b.askingPrice - a.askingPrice);
      } else if (filters.sort === 'newest') {
        result.sort((a, b) => b.createdAt - a.createdAt);
      }
    }
    
    return result;
  },

  getPropertyById: async (id) => {
    try {
      const res = await fetch(`${BASE}/api/properties/${id}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend offline. Resolving single property locally.");
    }
    return mockProperties.find(p => p.id === id) || mockProperties[0];
  },

  createProperty: async (propertyData, token) => {
    try {
      const res = await fetch(`${BASE}/api/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(propertyData)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend listing submission offline. Saving locally for session.");
    }
    const newProp = {
      ...propertyData,
      id: 'prop-dyn-' + Date.now(),
      status: 'UNDER_REVIEW',
      viewsCount: 0,
      inquiryCount: 0,
      verified: false,
      priceHistory: [
        { year: '2026', price: propertyData.askingPrice }
      ],
      createdAt: new Date()
    };
    mockProperties.unshift(newProp);
    return newProp;
  },

  // Expert Consultations APIs
  getExperts: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const res = await fetch(`${BASE}/api/experts?${queryParams}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend experts search offline. Resolving mock experts.");
    }
    
    let result = [...mockExperts];
    if (filters.specialization && filters.specialization !== 'All') {
      result = result.filter(e => e.specialization.toLowerCase() === filters.specialization.toLowerCase());
    }
    if (filters.state) {
      result = result.filter(e => e.state.toLowerCase() === filters.state.toLowerCase());
    }
    return result;
  },

  getExpertById: async (id) => {
    try {
      const res = await fetch(`${BASE}/api/experts/${id}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend expert lookup offline. Resolving mock expert.");
    }
    return mockExperts.find(e => e.id === id) || mockExperts[0];
  },

  bookConsultation: async (bookingData, token) => {
    try {
      const res = await fetch(`${BASE}/api/experts/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend booking offline. Returning successful mock booking.");
    }
    
    return {
      success: true,
      bookingReference: 'VST-' + Math.floor(100000 + Math.random() * 900000),
      message: 'Consultation successfully scheduled! Confirmation email has been sent.'
    };
  },

  // Contacts submissions
  submitContactForm: async (formData) => {
    try {
      const res = await fetch(`${BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend contact form offline. Submitting local contact request.");
    }
    return { success: true, message: 'Message sent!' };
  },

  // Admin Pending Panel
  getPendingListings: async (token) => {
    try {
      const res = await fetch(`${BASE}/api/admin/listings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend admin listings offline. Resolving mock under review items.");
    }
    return mockProperties.filter(p => p.status === 'UNDER_REVIEW');
  },

  updateListingStatus: async (id, status, reason = '', token) => {
    try {
      const res = await fetch(`${BASE}/api/admin/listings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, reason })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend status update offline. Mutating local memory cache.");
    }
    const prop = mockProperties.find(p => p.id === id);
    if (prop) {
      prop.status = status;
      if (status === 'ACTIVE') prop.verified = true;
    }
    return { success: true, status };
  }
};
