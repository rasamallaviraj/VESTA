const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Property = require('../models/Property');
const Contact = require('../models/Contact');

// Get all stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeListings = await Property.countDocuments({ status: 'ACTIVE' });
    const pendingListings = await Property.countDocuments({ status: 'PENDING' });
    const totalMessages = await Contact.countDocuments();
    const soldListings = await Property.countDocuments({ status: 'SOLD' });
    const allProperties = await Property.find();
    const totalViews = allProperties.reduce((sum, p) => sum + (p.viewsCount || 0), 0);
    res.json({ totalUsers, activeListings, pendingListings, totalMessages, soldListings, totalViews });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
