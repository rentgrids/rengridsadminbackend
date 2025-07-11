import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../uploads');
const propertyImagesDir = path.join(uploadDir, 'properties/images');
const propertyDocsDir = path.join(uploadDir, 'properties/documents');

[uploadDir, propertyImagesDir, propertyDocsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration for property images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, propertyImagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `property-${req.params.id || 'new'}-${uniqueSuffix}${ext}`);
  }
});

// Storage configuration for property documents
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, propertyDocsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `doc-${req.params.id || 'new'}-${uniqueSuffix}${ext}`);
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
  }
};

// File filter for documents
const documentFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|txt|rtf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)|text\/(plain|rtf)/.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only document files (pdf, doc, docx, txt, rtf) are allowed!'));
  }
};

// Multer configurations
export const uploadPropertyImages = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
}).array('images', 10); // Allow up to 10 images

export const uploadPropertyDocuments = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
}).single('document');

// For property creation with mixed fields
export const uploadPropertyData = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'images') {
        cb(null, propertyImagesDir);
      } else if (file.fieldname === 'documents') {
        cb(null, propertyDocsDir);
      } else {
        cb(null, uploadDir);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const prefix = file.fieldname === 'images' ? 'img' : 'doc';
      cb(null, `${prefix}-${uniqueSuffix}${ext}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'images') {
      imageFilter(req, file, cb);
    } else if (file.fieldname === 'documents') {
      documentFilter(req, file, cb);
    } else {
      cb(null, true);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
}).fields([
  { name: 'images', maxCount: 10 },
  { name: 'documents', maxCount: 5 }
]);