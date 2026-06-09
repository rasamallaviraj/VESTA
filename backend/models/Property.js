const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: { type: String, required: true },
    propertyType: { type: String, default: 'PLOT' },
    state: { type: String, required: true },
    district: { type: String },
    city: { type: String, required: true },
    locality: { type: String },
    address: { type: String },
    surveyNumber: { type: String },
    area: { type: Number },
    areaUnit: { type: String, default: 'sq ft' },
    roadAccess: { type: String },
    facingDirection: { type: String },
    shape: { type: String },
    images: [String],
    videoLink: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    askingPrice: { type: Number, required: true },
    pricePerUnit: { type: Number },
    openToNegotiation: { type: Boolean, default: true },
    paymentTerms: { type: String },
    documents: [{ name: String, status: String, file: String }],
    priceHistory: [{ year: String, price: Number }],
    status: { type: String, default: 'PENDING' },
    verified: { type: Boolean, default: false },
    viewsCount: { type: Number, default: 0 },
    inquiryCount: { type: Number, default: 0 },
    ownerId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const Property = mongoose.model('Property', propertySchema);
module.exports = Property;