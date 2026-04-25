import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_ROOT = path.resolve(__dirname, '../../uploads');

/**
 * Save a PDF buffer to disk under the village/section directory.
 * Returns the public URL path.
 */
async function savePdf(buffer, villageSlug, section, originalName = 'document.pdf') {
  const uploadDir = path.join(UPLOADS_ROOT, villageSlug, section);
  await fs.mkdir(uploadDir, { recursive: true });

  const timestamp = Date.now();
  const hex = crypto.randomBytes(6).toString('hex');
  // Clean original name but keep .pdf extension
  const safeName = originalName
    .replace(/[^a-zA-Z0-9_\-.]/g, '_')
    .replace(/\.pdf$/i, '');
  const filename = `${section}_${safeName}_${timestamp}_${hex}.pdf`;
  const filePath = path.join(uploadDir, filename);

  await fs.writeFile(filePath, buffer);

  const stat = await fs.stat(filePath);

  return {
    url: `/uploads/${villageSlug}/${section}/${filename}`,
    size: stat.size,
    filename,
  };
}

/**
 * Delete a PDF file by its URL path.
 */
async function deletePdf(pdfUrl) {
  if (!pdfUrl || !pdfUrl.startsWith('/uploads/')) return;

  if (pdfUrl.includes('..') || pdfUrl.includes('\0')) {
    throw new Error('Invalid PDF path — path traversal blocked');
  }

  const relativePath = pdfUrl.replace(/^\/uploads\//, '');
  const filePath = path.resolve(UPLOADS_ROOT, relativePath);

  if (!filePath.startsWith(UPLOADS_ROOT)) {
    throw new Error('Invalid PDF path — outside uploads directory');
  }

  try {
    await fs.unlink(filePath);
  } catch {
    // File may already be deleted
  }
}

export const pdfService = {
  savePdf,
  deletePdf,
  UPLOADS_ROOT,
};
