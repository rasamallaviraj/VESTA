const express = require('express');
const { getProperties, getPropertyById, createProperty, updatePropertyStatus } = require('../controllers/propertyController');
const router = express.Router();

router.get('/', getProperties);
router.get('/:id', getPropertyById);
router.post('/', createProperty);
router.put('/:id/status', updatePropertyStatus);

module.exports = router;