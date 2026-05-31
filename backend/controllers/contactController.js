const Contact = require('../models/Contact');

// @desc    Submit contact message
// @route   POST /api/contact
const submitContactForm = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        const contact = await Contact.create({
            name,
            email,
            message,
        });

        if (contact) {
            res.status(201).json({ message: 'Message sent successfully!' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { submitContactForm };
