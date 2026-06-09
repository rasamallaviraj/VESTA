const express = require('express');
const { upload, uploadToCloudinary } = require('../services/cloudinaryUpload');
const router = express.Router();

// Upload multiple images/videos
router.post('/', upload.array('files', 15), async (req, res) => {
    try {
        const uploadPromises = req.files.map(file =>
            uploadToCloudinary(file.buffer, file.mimetype, 'vesta/properties')
        );
        const urls = await Promise.all(uploadPromises);
        res.json({ urls });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload failed' });
    }
});

module.exports = router;