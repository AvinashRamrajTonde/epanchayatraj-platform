import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_ROOT = path.resolve(__dirname, '../../uploads');

// Section-specific image processing configs
// width/height = max dimensions (aspect ratio preserved)
// quality = WebP quality (1-100)
// maxSizeKB = target max file size
const SECTION_CONFIGS = {
  hero: {
    maxFiles: 5,
    variants: [
      { suffix: '', width: 1920, height: 800, quality: 80 },
    ],
  },
  team: {
    maxFiles: 1,
    variants: [
      { suffix: '', width: 400, height: 400, quality: 80 },
    ],
  },
  leadership: {
    maxFiles: 1,
    variants: [
      { suffix: '', width: 400, height: 400, quality: 80 },
    ],
  },
  gallery: {
    maxFiles: 10,
    variants: [
      { suffix: '_thumb', width: 400, height: 300, quality: 75 },
      { suffix: '_full', width: 1200, height: 900, quality: 82 },
    ],
  },
  programs: {
    maxFiles: 5,
    variants: [
      { suffix: '', width: 800, height: 600, quality: 78 },
    ],
  },
  notices: {
    maxFiles: 1,
    variants: [
      { suffix: '', width: 800, height: 600, quality: 78 },
    ],
  },
  about: {
    maxFiles: 4,
    variants: [
      { suffix: '', width: 800, height: 600, quality: 80 },
    ],
  },
  logo: {
    maxFiles: 1,
    variants: [
      { suffix: '', width: 200, height: 200, quality: 85 },
    ],
  },
  footer: {
    maxFiles: 1,
    variants: [
      { suffix: '', width: 300, height: 100, quality: 80 },
    ],
  },
  general: {
    maxFiles: 5,
    variants: [
      { suffix: '', width: 800, height: 600, quality: 78 },
    ],
  },
  awards: {
    maxFiles: 1,
    variants: [
      { suffix: '', width: 800, height: 600, quality: 80 },
    ],
  },
  schemes: {
    maxFiles: 1,
    variants: [
      { suffix: '', width: 800, height: 600, quality: 78 },
    ],
  },
  'school-photo': {
    maxFiles: 1,
    variants: [
      { suffix: '', width: 1200, height: 800, quality: 80 },
    ],
  },
  'school-principal': {
    maxFiles: 1,
    variants: [
      { suffix: '', width: 400, height: 400, quality: 82 },
    ],
  },
  gramsabha: {
    maxFiles: 1,
    variants: [
      { suffix: '', width: 1200, height: 800, quality: 80 },
    ],
  },
  'certificate-docs': {
    maxFiles: 5,
    variants: [
      { suffix: '', width: 800, height: 600, quality: 78 },
    ],
  },
  'certificate-photo': {
    maxFiles: 2,
    variants: [
      { suffix: '', width: 400, height: 500, quality: 82 },
    ],
  },
  'payment-screenshot': {
    maxFiles: 1,
    variants: [
      { suffix: '', width: 800, height: 1200, quality: 75 },
    ],
  },
  'payment-qr': {
    maxFiles: 1,
    variants: [
      { suffix: '', width: 600, height: 600, quality: 90 },
    ],
  },
  complaint: {
    maxFiles: 1,
    variants: [
      { suffix: '', width: 1200, height: 900, quality: 78 },
    ],
  },
};

/**
 * Get the upload directory for a village + section
 */
function getUploadDir(villageSlug, section) {
  return path.join(UPLOADS_ROOT, villageSlug, section);
}

/**
 * Ensure a directory exists
 */
async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Generate a unique filename
 */
function generateFilename(section, suffix = '') {
  const timestamp = Date.now();
  const hex = crypto.randomBytes(8).toString('hex');
  return `${section}${suffix}_${timestamp}_${hex}.webp`;
}

/**
 * Process and save a single image buffer
 * Returns an object with URLs for each variant
 */
async function processAndSave(buffer, villageSlug, section) {
  const config = SECTION_CONFIGS[section] || SECTION_CONFIGS.general;
  const uploadDir = getUploadDir(villageSlug, section);
  await ensureDir(uploadDir);

  const results = {};

  for (const variant of config.variants) {
    const filename = generateFilename(section, variant.suffix);
    const filePath = path.join(uploadDir, filename);

    // Process with sharp: resize + convert to WebP + compress
    let pipeline = sharp(buffer)
      .rotate() // auto-orient based on EXIF
      .resize(variant.width, variant.height, {
        fit: 'inside',       // maintain aspect ratio, fit within bounds
        withoutEnlargement: true, // don't upscale small images
      })
      .webp({
        quality: variant.quality,
        effort: 6,           // higher = smaller file, slower encode
        smartSubsample: true,
      });

    await pipeline.toFile(filePath);

    // Get final file stats
    const stat = await fs.stat(filePath);
    
    // If file is still too large (>300KB for non-hero, >500KB for hero), 
    // re-compress with lower quality
    const maxKB = section === 'hero' ? 500 : 300;
    if (stat.size > maxKB * 1024) {
      const lowerQuality = Math.max(variant.quality - 20, 40);
      await sharp(buffer)
        .rotate()
        .resize(variant.width, variant.height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({
          quality: lowerQuality,
          effort: 6,
          smartSubsample: true,
        })
        .toFile(filePath);
    }

    const variantKey = variant.suffix ? variant.suffix.replace('_', '') : 'url';
    results[variantKey] = `/uploads/${villageSlug}/${section}/${filename}`;
  }

  return results;
}

/**
 * Process multiple image buffers for a section
 * @param {Array<{buffer: Buffer, originalname: string}>} files - Multer file objects
 * @param {string} villageSlug - Village slug for folder
 * @param {string} section - Section name (hero, team, gallery, etc.)
 * @returns {Promise<Array>} Array of result objects with URLs
 */
async function processImages(files, villageSlug, section) {
  const config = SECTION_CONFIGS[section] || SECTION_CONFIGS.general;
  
  if (files.length > config.maxFiles) {
    throw new Error(`या विभागासाठी जास्तीत जास्त ${config.maxFiles} प्रतिमा अपलोड करता येतात`);
  }

  const results = [];
  for (const file of files) {
    const result = await processAndSave(file.buffer, villageSlug, section);
    results.push(result);
  }

  return results;
}

/**
 * Delete an uploaded file by its URL path
 */
async function deleteImage(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith('/uploads/')) return;
  
  // Security: block path traversal
  if (imageUrl.includes('..') || imageUrl.includes('\0')) {
    throw new Error('Invalid image path — path traversal blocked');
  }

  // Resolve relative to uploads root safely
  // imageUrl format: /uploads/{slug}/{section}/{filename}.webp
  const relativePath = imageUrl.replace(/^\/uploads\//, '');
  const filePath = path.resolve(UPLOADS_ROOT, relativePath);

  // Final safety check: resolved path must be inside UPLOADS_ROOT
  if (!filePath.startsWith(UPLOADS_ROOT)) {
    throw new Error('Invalid image path — outside uploads directory');
  }

  try {
    await fs.unlink(filePath);
  } catch {
    // File may already be deleted, ignore
  }
}

/**
 * Delete all files in a village+section directory
 * (Useful when clearing all hero slides, etc.)
 */
async function deleteAllInSection(villageSlug, section) {
  const dir = getUploadDir(villageSlug, section);
  try {
    const files = await fs.readdir(dir);
    await Promise.all(files.map(f => fs.unlink(path.join(dir, f))));
  } catch {
    // Directory may not exist
  }
}

export const imageService = {
  SECTION_CONFIGS,
  processImages,
  processAndSave,
  deleteImage,
  deleteAllInSection,
  getUploadDir,
  UPLOADS_ROOT,
};
