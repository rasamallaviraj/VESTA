const Contact = require('../models/Contact');

const submitContactForm = async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const contact = await Contact.create({ name, email, message });
        if (contact) res.status(201).json({ message: 'Message sent successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getContactMessages = async (req, res) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const markMessageRead = async (req, res) => {
    try {
        const { id } = req.params;
        const { read } = req.body;
        const message = await Contact.findByIdAndUpdate(
            id,
            { read: read !== undefined ? read : true },
            { new: true }
        );
        if (!message) return res.status(404).json({ message: 'Message not found' });
        res.json(message);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { submitContactForm, getContactMessages, markMessageRead };