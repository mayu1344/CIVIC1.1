const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const logger = require('../utils/logger');

// Configure Cloudinary
if (process.env.USE_CLOUDINARY === 'true') {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    logger.info('☁️  Cloudinary configured successfully');
}

// Create Cloudinary storage for multer with dynamic params
const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Get citizen info from request body
        const citizenName = req.body.citizenName || 'unknown';
        const citizenMobile = req.body.citizenMobile || 'unknown';
        const complaintTitle = req.body.title || 'complaint';
        const category = req.body.category || 'general';
        const timestamp = Date.now();
        
        // Create a clean filename with citizen name
        const cleanName = citizenName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const publicId = `${cleanName}_${citizenMobile}_${timestamp}`;
        
        return {
            folder: 'civicpath-complaints',
            allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
            public_id: publicId,
            transformation: [
                { width: 1920, height: 1920, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ],
            // Add searchable tags
            tags: [
                `citizen:${cleanName}`,
                `mobile:${citizenMobile}`,
                `category:${category}`,
                'civicpath',
                'complaint-image'
            ],
            // Add structured metadata (searchable in Cloudinary)
            context: {
                citizen_name: citizenName,
                citizen_mobile: citizenMobile,
                complaint_title: complaintTitle,
                category: category,
                upload_date: new Date().toISOString(),
                uploaded_by: 'citizen'
            }
        };
    }
});

module.exports = {
    cloudinary,
    cloudinaryStorage
};
