import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Configuration du stockage Cloudinary
const storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
        return {
            folder: 'techniciens',
            allowed_formats: ['jpg', 'jpeg', 'png'],
            transformation: [{ width: 500, height: 500, crop: 'limit' }],
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
            resource_type: 'auto'
        };
    }
});

// Filtrage des fichiers
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non supporté. Seuls les JPG, JPEG et PNG sont autorisés.'), false);
    }
};

// Configuration de Multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB
    }
});

export default upload;