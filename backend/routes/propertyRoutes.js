const express = require('express');
const { getProperties, getPropertyById, createProperty, updatePropertyStatus } = require('../controllers/propertyController');
const router = express.Router();

router.get('/', getProperties);
router.get('/pending', async (req, res) => {
    try {
        const Property = require('../models/Property');
        const properties = await Property.find({ status: 'PENDING' });
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
router.get('/:id', getPropertyById);
router.post('/', createProperty);
router.put('/:id/status', updatePropertyStatus);

module.exports = router;