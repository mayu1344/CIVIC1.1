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
        // Use temporary ID during upload, will be renamed after complaint creation
        const timestamp = Date.now();
        const randomId = Math.round(Math.random() * 1E9);
        const category = req.body.category || 'general';
        
        // Create a temporary filename that will be updated after complaint creation
        const publicId = `temp_${timestamp}_${randomId}`;
        
        return {
            folder: 'civicpath-complaints',
            allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
            public_id: publicId,
            transformation: [
                { width: 1920, height: 1920, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
            ],
            // Add searchable tags (will be updated after complaint creation)
            tags: [
                `category:${category}`,
                'civicpath',
                'complaint-image',
                'temp-upload'
            ],
            // Add structured metadata (will be updated after complaint creation)
            context: {
                category: category,
                upload_date: new Date().toISOString(),
                uploaded_by: 'citizen',
                status: 'pending'
            }
        };
    }
});

// Function to rename uploaded file with complaint details
const renameCloudinaryFile = async (oldPublicId, complaintNumber, complaintId, category) => {
    try {
        const newPublicId = `${complaintNumber}_${complaintId}_${Date.now()}`;
        
        // Rename the file in Cloudinary
        const result = await cloudinary.uploader.rename(
            `civicpath-complaints/${oldPublicId}`,
            `civicpath-complaints/${newPublicId}`,
            {
                overwrite: false,
                invalidate: true
            }
        );
        
        // Update tags and context
        await cloudinary.uploader.update_metadata(
            {
                complaint_number: complaintNumber,
                complaint_id: complaintId.toString(),
                category: category,
                status: 'active'
            },
            [result.public_id]
        );
        
        // Update tags
        await cloudinary.uploader.add_tag(
            [`complaint:${complaintNumber}`, `id:${complaintId}`],
            [result.public_id]
        );
        
        // Remove temp tag
        await cloudinary.uploader.remove_tag('temp-upload', [result.public_id]);
        
        logger.info(`Renamed Cloudinary file: ${oldPublicId} -> ${newPublicId}`);
        
        return result.secure_url;
    } catch (error) {
        logger.error('Error renaming Cloudinary file:', error);
        throw error;
    }
};

module.exports = {
    cloudinary,
    cloudinaryStorage,
    renameCloudinaryFile
};
