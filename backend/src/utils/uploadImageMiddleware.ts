import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../middleware/authMiddleware';

// Pastikan direktori upload ada
const uploadDir = path.join(__dirname, '../../uploads/reimbursements');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req: AuthRequest, file, cb) => {
    // Format: TIMESTAMP_NAMA USER_REIMBURSEMENT TYPE
    const timestamp = Date.now();
    
    const fullName = req.user?.fullName ? req.user.fullName.replace(/\s+/g, '_') : 'Unknown_User';
    
    const type = 'Reimbursement';
    const ext = path.extname(file.originalname);
    
    const newFilename = `${timestamp}_${fullName}_${type}${ext}`;
    cb(null, newFilename);
  },
});

export const uploadReimbursement = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit 5MB
  fileFilter: (req, file, cb) => {
    // Hanya izinkan gambar
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak didukung. Harap upload gambar (JPG/PNG).'));
    }
  }
});
