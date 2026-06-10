const express = require('express');
const { submitContactForm, getContactMessages, markMessageRead } = require('../controllers/contactController');
const router = express.Router();

router.post('/', submitContactForm);
router.get('/messages', getContactMessages);
router.put('/messages/:id/read', markMessageRead);

module.exports = router;