const Property = require('../models/Property');

// GET all active properties
const getProperties = async (req, res) => {
    try {
        const { state, city, propertyType, sort } = req.query;
        let query = { status: 'ACTIVE' };

        if (state) query.state = state;
        if (city) query.city = new RegExp(city, 'i');
        if (propertyType && propertyType !== 'All') query.propertyType = propertyType;

        let properties = await Property.find(query);

        if (sort === 'price_asc') properties.sort((a, b) => a.askingPrice - b.askingPrice);
        if (sort === 'price_desc') properties.sort((a, b) => b.askingPrice - a.askingPrice);
        if (sort === 'newest') properties.sort((a, b) => b.createdAt - a.createdAt);

        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET single property
const getPropertyById = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ message: 'Property not found' });
        res.json(property);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST create property
const createProperty = async (req, res) => {
    try {
        const property = await Property.create({
            ...req.body,
            status: 'PENDING',
            verified: false,
            priceHistory: [{ year: '2026', price: req.body.askingPrice }]
        });
        res.status(201).json(property);
    } catch (error) {
        console.error('Create property error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT update property status (admin)
const updatePropertyStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const property = await Property.findByIdAndUpdate(
            req.params.id,
            { status, verified: status === 'ACTIVE' },
            { new: true }
        );
        res.json(property);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getProperties, getPropertyById, createProperty, updatePropertyStatus };