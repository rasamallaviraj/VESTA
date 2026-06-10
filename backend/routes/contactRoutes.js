const express = require('express');
const { submitContactForm, getContactMessages } = require('../controllers/contactController');
const router = express.Router();

router.post('/', submitContactForm);
router.get('/messages', getContactMessages);

module.exports = router;