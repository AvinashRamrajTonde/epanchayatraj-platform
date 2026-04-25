import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { imageService } from '../services/image.service.js';

/**
 * Upload images for a specific section
 * POST /api/village/upload/:section
 * Accepts: multipart/form-data with field "images" (single or multiple)
 */
export const uploadImages = catchAsync(async (req, res) => {
  const { section } = req.params;
  const villageSlug = req.tenant?.slug;

  if (!villageSlug) {
    throw new ApiError(400, 'Village tenant not found');
  }

  // Sanitize section param — allow only alphanumeric and hyphen
  if (!/^[a-zA-Z0-9-]+$/.test(section)) {
    throw new ApiError(400, 'अमान्य विभाग नाव');
  }

  const config = imageService.SECTION_CONFIGS[section];
  if (!config) {
    throw new ApiError(400, `'${section}' हा अमान्य विभाग आहे`);
  }

  // Collect files from req.file (single) or req.files (multiple)
  let files = [];
  if (req.file) {
    files = [req.file];
  } else if (req.files && Array.isArray(req.files)) {
    files = req.files;
  } else if (req.files) {
    // req.files is an object when using .fields()
    files = Object.values(req.files).flat();
  }

  if (files.length === 0) {
    throw new ApiError(400, 'कृपया किमान एक प्रतिमा अपलोड करा');
  }

  const results = await imageService.processImages(files, villageSlug, section);

  sendResponse(res, 200, {
    images: results,
    count: results.length,
  }, 'प्रतिमा यशस्वीरित्या अपलोड झाल्या');
});

/**
 * Delete a specific uploaded image
 * DELETE /api/village/upload/image
 * Body: { imageUrl: "/uploads/village-slug/section/filename.webp" }
 */
export const deleteUploadedImage = catchAsync(async (req, res) => {
  const { imageUrl } = req.body;
  const villageSlug = req.tenant?.slug;

  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new ApiError(400, 'imageUrl आवश्यक आहे');
  }

  // Security: block path traversal attempts
  if (imageUrl.includes('..') || imageUrl.includes('\0')) {
    throw new ApiError(400, 'अमान्य प्रतिमा URL');
  }

  // Security: ensure the URL belongs to this village
  if (!imageUrl.startsWith(`/uploads/${villageSlug}/`)) {
    throw new ApiError(403, 'या प्रतिमेवर तुमचा अधिकार नाही');
  }

  await imageService.deleteImage(imageUrl);

  sendResponse(res, 200, null, 'प्रतिमा यशस्वीरित्या हटवली');
});

/**
 * Get upload configuration for a section
 * GET /api/village/upload/config/:section
 */
export const getUploadConfig = catchAsync(async (req, res) => {
  const { section } = req.params;
  const config = imageService.SECTION_CONFIGS[section] || imageService.SECTION_CONFIGS.general;

  sendResponse(res, 200, {
    section,
    maxFiles: config.maxFiles,
    variants: config.variants.map(v => ({
      suffix: v.suffix,
      maxWidth: v.width,
      maxHeight: v.height,
    })),
    acceptedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFileSizeMB: 5,
  }, 'Upload config');
});

/**
 * Upload a PDF file for a specific section (e.g., financial reports)
 * POST /api/village/upload/pdf/:section
 * Accepts: multipart/form-data with field "pdf"
 */
export const uploadPdfFile = catchAsync(async (req, res) => {
  const { section } = req.params;
  const villageSlug = req.tenant?.slug;

  if (!villageSlug) {
    throw new ApiError(400, 'Village tenant not found');
  }

  if (!/^[a-zA-Z0-9-]+$/.test(section)) {
    throw new ApiError(400, 'अमान्य विभाग नाव');
  }

  if (!req.file) {
    throw new ApiError(400, 'कृपया PDF फाइल अपलोड करा');
  }

  // Save PDF to disk
  const { pdfService } = await import('../services/pdf.service.js');
  const result = await pdfService.savePdf(req.file.buffer, villageSlug, section, req.file.originalname);

  sendResponse(res, 200, result, 'PDF यशस्वीरित्या अपलोड झाली');
});
