import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorize, requireVillageTenant } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../config/constants.js';
import {
  adminGetCertApplications,
  adminGetCertApplication,
  adminVerifyPayment,
  adminUpdateCertApplication,
  adminApplyOnBehalf,
  adminMarkOfflinePayment,
  adminSearchFamilies,
  adminAddFamily,
  adminAddFamilyMember,
  adminGetCertStats,
  adminGetPaymentConfig,
  adminUpsertPaymentConfig,
  adminGetRegister,
} from '../controllers/citizen.controller.js';
import {
  createMemberSchemaExtended,
  updateMemberSchemaExtended,
  createNoticeSchemaExtended,
  updateNoticeSchemaExtended,
  createGalleryImageSchemaExtended,
  upsertContentSchema,
  updateApplicationStatusSchema,
  applicationFilterSchema,
  noticeFilterSchema,
  updateVillageSettingsSchema,
  createHeroSlideSchema,
  updateHeroSlideSchema,
  createProgramSchema,
  updateProgramSchema,
  programFilterSchema,
  createSchemeSchema,
  updateSchemeSchema,
  schemeFilterSchema,
  contactSubmissionFilterSchema,
  updateContactSubmissionStatusSchema,
  createAwardSchema,
  updateAwardSchema,
  awardFilterSchema,
  createFinancialReportSchema,
  updateFinancialReportSchema,
  createGramsabhaSchema,
  updateGramsabhaSchema,
  gramsabhaFilterSchema,
  createSchoolSchema,
  updateSchoolSchema,
  createDevelopmentWorkSchema,
  updateDevelopmentWorkSchema,
  developmentWorkFilterSchema,
} from '../utils/validators.js';
import { uploadImages, deleteUploadedImage, getUploadConfig, uploadPdfFile } from '../controllers/upload.controller.js';
import { uploadMultiple, handleMulterError, validateFileSignature, uploadPdf, validatePdfSignature } from '../middleware/upload.js';
import { imageService } from '../services/image.service.js';
import {
  getDashboardStats,
  getMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
  getNotices,
  getNotice,
  createNotice,
  updateNotice,
  deleteNotice,
  getGalleryImages,
  createGalleryImage,
  deleteGalleryImage,
  getAllContent,
  getContent,
  upsertContent,
  getApplications,
  getApplication,
  updateApplicationStatus,
  getVillageSettings,
  updateVillageSettings,
  getHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  getPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
  getSchemes,
  getScheme,
  createScheme,
  updateScheme,
  deleteScheme,
  getContactSubmissions,
  updateContactSubmissionStatus,
  deleteContactSubmission,
  getAwards,
  getAward,
  createAward,
  updateAward,
  deleteAward,
  getFinancialReports,
  getFinancialReport,
  createFinancialReport,
  updateFinancialReport,
  deleteFinancialReport,
  getGramsabhas,
  getGramsabha,
  createGramsabha,
  updateGramsabha,
  deleteGramsabha,
  getSchools,
  getSchool,
  createSchool,
  updateSchool,
  deleteSchool,
  getDevelopmentWorks,
  getDevelopmentWork,
  createDevelopmentWork,
  updateDevelopmentWork,
  deleteDevelopmentWork,
  getComplaints,
  getComplaint,
  updateComplaint,
  deleteComplaint,
  getComplaintStats,
  getTaxPayments,
  getTaxPayment,
  updateTaxPayment,
  deleteTaxPayment,
  getTaxStats,
  getTaxYears,
} from '../controllers/village.admin.controller.js';

const router = Router();

// All village admin routes require: village tenant + auth + admin role
router.use(requireVillageTenant);
router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Members
router.get('/members', getMembers);
router.get('/members/:id', getMember);
router.post('/members', validate(createMemberSchemaExtended), createMember);
router.put('/members/:id', validate(updateMemberSchemaExtended), updateMember);
router.delete('/members/:id', deleteMember);

// Notices
router.get('/notices', validate(noticeFilterSchema, 'query'), getNotices);
router.get('/notices/:id', getNotice);
router.post('/notices', validate(createNoticeSchemaExtended), createNotice);
router.put('/notices/:id', validate(updateNoticeSchemaExtended), updateNotice);
router.delete('/notices/:id', deleteNotice);

// Gallery
router.get('/gallery', getGalleryImages);
router.post('/gallery', validate(createGalleryImageSchemaExtended), createGalleryImage);
router.delete('/gallery/:id', deleteGalleryImage);

// Content sections (about, contact, hero, footer, stats, seo, etc.)
router.get('/content', getAllContent);
router.get('/content/:section', getContent);
router.put('/content/:section', validate(upsertContentSchema), upsertContent);

// Applications
router.get('/applications', validate(applicationFilterSchema, 'query'), getApplications);
router.get('/applications/:id', getApplication);
router.patch('/applications/:id/status', validate(updateApplicationStatusSchema), updateApplicationStatus);

// Village Settings
router.get('/settings', getVillageSettings);
router.put('/settings', validate(updateVillageSettingsSchema), updateVillageSettings);

// Hero Slides
router.get('/hero-slides', getHeroSlides);
router.post('/hero-slides', validate(createHeroSlideSchema), createHeroSlide);
router.put('/hero-slides/:id', validate(updateHeroSlideSchema), updateHeroSlide);
router.delete('/hero-slides/:id', deleteHeroSlide);

// Programs
router.get('/programs', validate(programFilterSchema, 'query'), getPrograms);
router.get('/programs/:id', getProgram);
router.post('/programs', validate(createProgramSchema), createProgram);
router.put('/programs/:id', validate(updateProgramSchema), updateProgram);
router.delete('/programs/:id', deleteProgram);

// Schemes
router.get('/schemes', validate(schemeFilterSchema, 'query'), getSchemes);
router.get('/schemes/:id', getScheme);
router.post('/schemes', validate(createSchemeSchema), createScheme);
router.put('/schemes/:id', validate(updateSchemeSchema), updateScheme);
router.delete('/schemes/:id', deleteScheme);

// Contact Submissions
router.get('/contact-submissions', validate(contactSubmissionFilterSchema, 'query'), getContactSubmissions);
router.patch('/contact-submissions/:id/status', validate(updateContactSubmissionStatusSchema), updateContactSubmissionStatus);
router.delete('/contact-submissions/:id', deleteContactSubmission);

// Awards
router.get('/awards', validate(awardFilterSchema, 'query'), getAwards);
router.get('/awards/:id', getAward);
router.post('/awards', validate(createAwardSchema), createAward);
router.put('/awards/:id', validate(updateAwardSchema), updateAward);
router.delete('/awards/:id', deleteAward);

// Financial Reports
router.get('/financial-reports', getFinancialReports);
router.get('/financial-reports/:id', getFinancialReport);
router.post('/financial-reports', validate(createFinancialReportSchema), createFinancialReport);
router.put('/financial-reports/:id', validate(updateFinancialReportSchema), updateFinancialReport);
router.delete('/financial-reports/:id', deleteFinancialReport);

// Gramsabha
router.get('/gramsabhas', validate(gramsabhaFilterSchema, 'query'), getGramsabhas);
router.get('/gramsabhas/:id', getGramsabha);
router.post('/gramsabhas', validate(createGramsabhaSchema), createGramsabha);
router.put('/gramsabhas/:id', validate(updateGramsabhaSchema), updateGramsabha);
router.delete('/gramsabhas/:id', deleteGramsabha);

// Schools
router.get('/schools', getSchools);
router.get('/schools/:id', getSchool);
router.post('/schools', validate(createSchoolSchema), createSchool);
router.put('/schools/:id', validate(updateSchoolSchema), updateSchool);
router.delete('/schools/:id', deleteSchool);

// Development Works
router.get('/development-works', validate(developmentWorkFilterSchema, 'query'), getDevelopmentWorks);
router.get('/development-works/:id', getDevelopmentWork);
router.post('/development-works', validate(createDevelopmentWorkSchema), createDevelopmentWork);
router.put('/development-works/:id', validate(updateDevelopmentWorkSchema), updateDevelopmentWork);
router.delete('/development-works/:id', deleteDevelopmentWork);

// Image Upload
router.post('/upload/:section', (req, res, next) => {
  const section = req.params.section;
  const config = imageService.SECTION_CONFIGS[section] || imageService.SECTION_CONFIGS.general;
  uploadMultiple('images', config.maxFiles)(req, res, (err) => {
    if (err) return handleMulterError(err, req, res, next);
    next();
  });
}, validateFileSignature, uploadImages);
router.delete('/upload/image', deleteUploadedImage);
router.get('/upload/config/:section', getUploadConfig);

// PDF Upload
router.post('/upload/pdf/:section', (req, res, next) => {
  uploadPdf('pdf')(req, res, (err) => {
    if (err) return handleMulterError(err, req, res, next);
    next();
  });
}, validatePdfSignature, uploadPdfFile);

// ─── Certificate Management (Admin) ───────────────────────────────
router.get('/certificates/stats', adminGetCertStats);
router.get('/certificates/applications', adminGetCertApplications);
router.get('/certificates/applications/:id', adminGetCertApplication);
router.patch('/certificates/applications/:id', adminUpdateCertApplication);
router.post('/certificates/applications/:id/verify-payment', adminVerifyPayment);
router.post('/certificates/applications/:id/offline-payment', adminMarkOfflinePayment);
router.post('/certificates/apply-on-behalf', adminApplyOnBehalf);

// Family management (admin)
router.get('/certificates/families', adminSearchFamilies);
router.post('/certificates/families', adminAddFamily);
router.post('/certificates/families/:familyId/members', adminAddFamilyMember);

// Payment Config
router.get('/certificates/payment-config', adminGetPaymentConfig);
router.put('/certificates/payment-config', adminUpsertPaymentConfig);

// सहपत्र-ब Register
router.get('/certificates/register', adminGetRegister);

// Complaints
router.get('/complaints/stats', getComplaintStats);
router.get('/complaints', getComplaints);
router.get('/complaints/:id', getComplaint);
router.patch('/complaints/:id', updateComplaint);
router.delete('/complaints/:id', deleteComplaint);

// ---- Tax Payments ----
router.get('/tax-payments/stats', getTaxStats);
router.get('/tax-payments/years', getTaxYears);
router.get('/tax-payments', getTaxPayments);
router.get('/tax-payments/:id', getTaxPayment);
router.patch('/tax-payments/:id', updateTaxPayment);
router.delete('/tax-payments/:id', deleteTaxPayment);

export default router;
