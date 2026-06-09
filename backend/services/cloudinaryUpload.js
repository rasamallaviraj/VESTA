const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for videos
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Only images and videos allowed'));
    }
});

const uploadToCloudinary = (buffer, mimetype, folder = 'vesta') => {
    return new Promise((resolve, reject) => {
        const resourceType = mimetype.startsWith('video') ? 'video' : 'image';
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder, resource_type: resourceType },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );
        uploadStream.end(buffer);
    });
};

module.exports = { upload, uploadToCloudinary };