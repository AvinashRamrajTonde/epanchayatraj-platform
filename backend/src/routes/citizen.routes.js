import { Router } from 'express';
import { authenticateCitizen } from '../middleware/citizenAuth.js';
import { uploadMultiple, handleMulterError, validateFileSignature } from '../middleware/upload.js';
import { imageService } from '../services/image.service.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import {
  sendOTP,
  verifyOTP,
  googleAuth,
  citizenRefreshToken,
  citizenRegister,
  citizenLogin,
  citizenForgotPassword,
  citizenResetPassword,
  getCitizenProfile,
  updateCitizenProfile,
  registerFamily,
  getFamilies,
  getFamily,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  getCertificateTypes,
  applyCertificate,
  getMyApplications,
  getApplicationDetail,
  submitPayment,
  getPaymentConfig,
  verifyCertificate,
  downloadCertificatePDF,
  downloadReceiptPDF,
} from '../controllers/citizen.controller.js';

const router = Router();

// ─── Public (no auth) ──────────────────────────────────────
router.post('/auth/send-otp', sendOTP);
router.post('/auth/verify-otp', verifyOTP);
router.post('/auth/register', citizenRegister);
router.post('/auth/login', citizenLogin);
router.post('/auth/forgot-password', citizenForgotPassword);
router.post('/auth/reset-password', citizenResetPassword);
router.post('/auth/google', googleAuth);
router.post('/auth/refresh-token', citizenRefreshToken);

// Public data
router.get('/certificate-types', getCertificateTypes);
router.get('/payment-config', getPaymentConfig);
router.get('/verify/:certificateNo', verifyCertificate);

// ─── Protected (citizen auth) ──────────────────────────────
router.use(authenticateCitizen);

// Profile
router.get('/profile', getCitizenProfile);
router.put('/profile', updateCitizenProfile);

// Family management
router.post('/families', registerFamily);
router.get('/families', getFamilies);
router.get('/families/:id', getFamily);
router.post('/families/:familyId/members', addFamilyMember);
router.put('/families/members/:memberId', updateFamilyMember);
router.delete('/families/members/:memberId', deleteFamilyMember);

// Certificate applications
router.post('/certificates/apply', applyCertificate);
router.get('/certificates/applications', getMyApplications);
router.get('/certificates/applications/:id', getApplicationDetail);

// PDF Downloads (on-demand generation)
router.get('/certificates/applications/:applicationId/download', downloadCertificatePDF);
router.get('/certificates/applications/:applicationId/receipt', downloadReceiptPDF);

// Payment
router.post('/certificates/applications/:applicationId/payment', submitPayment);

// ─── Image Upload (citizen) ────────────────────────────────
// POST /api/citizen/upload/:section  (certificate-docs, certificate-photo, payment-screenshot)
router.post('/upload/:section', (req, res, next) => {
  const section = req.params.section;
  const config = imageService.SECTION_CONFIGS[section];
  if (!config) return next(new ApiError(400, `'${section}' हा अवैध विभाग आहे`));
  uploadMultiple('images', config.maxFiles)(req, res, (err) => {
    if (err) return next(err);
    next();
  });
}, validateFileSignature, catchAsync(async (req, res) => {
  const { section } = req.params;
  const villageSlug = req.tenant?.slug || 'citizen';

  let files = [];
  if (req.file) files = [req.file];
  else if (req.files && Array.isArray(req.files)) files = req.files;

  if (files.length === 0) {
    throw new ApiError(400, 'कृपया किमान एक प्रतिमा अपलोड करा');
  }

  const results = await imageService.processImages(files, villageSlug, section);
  sendResponse(res, 200, { images: results, count: results.length }, 'प्रतिमा यशस्वीरित्या अपलोड झाल्या');
}));

export default router;
