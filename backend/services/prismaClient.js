const dotenv = require('dotenv');
dotenv.config();

const memoryDb = {
  users: [],
  properties: [
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
      documents: [
        { name: 'Sale Deed', status: 'Uploaded', file: 'sale_deed.pdf' },
        { name: 'Encumbrance Certificate', status: 'Uploaded', file: 'ec.pdf' }
      ],
      priceHistory: [
        { year: '2024', price: 79000000 },
        { year: '2026', price: 85000000 }
      ],
      latitude: 17.4483,
      longitude: 78.3488,
      videoLink: '',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  experts: [
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
      bio: 'Specialist in land title clearance, land disputes resolution, and stamp duty regulations.',
      pastDealsCount: 240,
      certifications: ['Bar Council of Telangana'],
      availabilityCalendar: { Monday: ['10:00 AM', '2:00 PM'], Wednesday: ['11:00 AM', '3:00 PM'] },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  consultations: [],
  contactMessages: []
};

const db = {
  user: {
    findUnique: async ({ where }) =>
      memoryDb.users.find(u => u.email === where.email || u.id === where.id) || null,
    findFirst: async ({ where }) =>
      memoryDb.users.find(u => u.email === where.email) || null,
    create: async ({ data }) => {
      const newUser = { id: 'usr-' + Date.now(), role: 'BUYER', ...data, createdAt: new Date() };
      memoryDb.users.push(newUser);
      return newUser;
    }
  },
  property: {
    findMany: async (args = {}) => {
      let list = [...memoryDb.properties];
      if (args.where?.status) list = list.filter(p => p.status === args.where.status);
      return list;
    },
    findUnique: async ({ where }) =>
      memoryDb.properties.find(p => p.id === where.id) || null,
    create: async ({ data }) => {
      const newProp = {
        id: 'prop-' + Date.now(),
        viewsCount: 0,
        inquiryCount: 0,
        verified: false,
        priceHistory: [{ year: '2026', price: data.askingPrice }],
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryDb.properties.unshift(newProp);
      return newProp;
    },
    update: async ({ where, data }) => {
      const idx = memoryDb.properties.findIndex(p => p.id === where.id);
      if (idx !== -1) {
        memoryDb.properties[idx] = { ...memoryDb.properties[idx], ...data, updatedAt: new Date() };
        return memoryDb.properties[idx];
      }
      return null;
    },
    delete: async ({ where }) => {
      const idx = memoryDb.properties.findIndex(p => p.id === where.id);
      if (idx !== -1) return memoryDb.properties.splice(idx, 1)[0];
      return null;
    }
  },
  expert: {
    findMany: async () => memoryDb.experts,
    findUnique: async ({ where }) =>
      memoryDb.experts.find(e => e.id === where.id) || null
  },
  consultation: {
    create: async ({ data }) => {
      const newConsult = { id: 'con-' + Date.now(), ...data, createdAt: new Date() };
      memoryDb.consultations.push(newConsult);
      return newConsult;
    },
    findMany: async () => memoryDb.consultations
  },
  contactMessage: {
    create: async ({ data }) => {
      const newMsg = { id: 'msg-' + Date.now(), ...data, createdAt: new Date() };
      memoryDb.contactMessages.push(newMsg);
      return newMsg;
    }
  }
};

console.log('In-memory database active');
module.exports = db;