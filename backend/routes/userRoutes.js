const express = require('express');
const { getUserProfile, getDynamicData } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.get('/data', protect, getDynamicData);

module.exports = router;
