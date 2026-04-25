import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

// Security: removed image/svg+xml (XSS/XXE risk) and image/avif (limited support)
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

// Magic byte signatures for validation
const MAGIC_BYTES = {
  'image/jpeg': [Buffer.from([0xFF, 0xD8, 0xFF])],
  'image/jpg': [Buffer.from([0xFF, 0xD8, 0xFF])],
  'image/png': [Buffer.from([0x89, 0x50, 0x4E, 0x47])],
  'image/gif': [Buffer.from('GIF87a'), Buffer.from('GIF89a')],
  'image/webp': [Buffer.from('RIFF')],
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file (reduced from 10MB)

// Use memory storage - we process with sharp before saving
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(new ApiError(400, 'फक्त JPEG, PNG, GIF, WebP प्रतिमा अपलोड करता येतात'), false);
  }
  cb(null, true);
};

/**
 * Validate file magic bytes match claimed MIME type.
 * Call after multer stores buffer to req.file/req.files.
 */
export const validateFileSignature = (req, res, next) => {
  const files = [];
  if (req.file) files.push(req.file);
  if (req.files && Array.isArray(req.files)) files.push(...req.files);

  for (const file of files) {
    if (!file.buffer || file.buffer.length < 8) {
      return next(new ApiError(400, 'अमान्य फाइल — रिकामी किंवा खराब फाइल'));
    }
    const expected = MAGIC_BYTES[file.mimetype];
    if (expected) {
      const header = file.buffer.subarray(0, 8);
      const matches = expected.some((sig) => header.subarray(0, sig.length).equals(sig));
      if (!matches) {
        return next(new ApiError(400, 'फाइलचा प्रकार अवैध आहे — कृपया वेगळी प्रतिमा वापरा'));
      }
    }
  }
  next();
};

// Single image upload
export const uploadSingle = (fieldName = 'image') =>
  multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
  }).single(fieldName);

// Multiple images upload
export const uploadMultiple = (fieldName = 'images', maxCount = 10) =>
  multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
  }).array(fieldName, maxCount);

// Multiple fields with different limits
export const uploadFields = (fields) =>
  multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
  }).fields(fields);

// Handle multer errors gracefully
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'फाइल आकार जास्तीत जास्त 5MB पर्यंत असावा',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'एकावेळी जास्तीत जास्त परवानगी असलेल्या प्रतिमा अपलोड करता येतात',
      });
    }
    return res.status(400).json({
      success: false,
      message: `अपलोड त्रुटी: ${err.message}`,
    });
  }
  next(err);
};

// ---- PDF Upload ----
const PDF_MAX_SIZE = 10 * 1024 * 1024; // 10MB for PDFs

const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype !== 'application/pdf') {
    return cb(new ApiError(400, 'फक्त PDF फाइल अपलोड करता येतात'), false);
  }
  cb(null, true);
};

// Validate PDF magic bytes (%PDF-)
export const validatePdfSignature = (req, res, next) => {
  const file = req.file;
  if (!file || !file.buffer || file.buffer.length < 5) {
    return next(new ApiError(400, 'अमान्य PDF फाइल'));
  }
  const header = file.buffer.subarray(0, 5).toString('ascii');
  if (!header.startsWith('%PDF-')) {
    return next(new ApiError(400, 'अमान्य PDF फाइल — कृपया खरी PDF फाइल अपलोड करा'));
  }
  next();
};

export const uploadPdf = (fieldName = 'pdf') =>
  multer({
    storage,
    fileFilter: pdfFileFilter,
    limits: { fileSize: PDF_MAX_SIZE },
  }).single(fieldName);
