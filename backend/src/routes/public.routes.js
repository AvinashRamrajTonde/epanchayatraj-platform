import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { contactFormSchema } from '../utils/validators.js';
import { uploadSingle, handleMulterError, validateFileSignature } from '../middleware/upload.js';
import { imageService } from '../services/image.service.js';
import {
  getVillageInfo,
  getVillageFullData,
  getHeroSlides,
  getContentSection,
  getMembers,
  getNotices,
  getPopupNotices,
  getPrograms,
  getProgramById,
  getSchemes,
  getSchemeById,
  getGallery,
  submitContactForm,
  getSeoData,
  getAwards,
  getFinancialReports,
  getGramsabhas,
  getSchools,
  getDevelopmentWorks,
  getPublicGlobalSettings,
  getOgPreview,
  getSitemap,
  getRobotsTxt,
} from '../controllers/public.controller.js';
import { submitComplaint } from '../controllers/public.controller.js';
import { submitTaxPayment } from '../controllers/public.controller.js';

const router = Router();

// OG/SEO preview HTML (for ALL crawlers: Googlebot, Bingbot, WhatsApp, etc.)
router.get('/og', getOgPreview);

// Dynamic sitemap.xml (proxied from /sitemap.xml by nginx)
router.get('/sitemap.xml', getSitemap);

// Dynamic robots.txt (proxied from /robots.txt by nginx)
router.get('/robots.txt', getRobotsTxt);

// Village info
router.get('/village', getVillageInfo);

// Full page data (homepage pre-fetch)
router.get('/village/full', getVillageFullData);

// Hero carousel
router.get('/hero-slides', getHeroSlides);

// Content sections (about, contact, footer, etc.)
router.get('/content/:section', getContentSection);

// Administration / Members
router.get('/members', getMembers);

// Notices
router.get('/notices', getNotices);
router.get('/notices/popups', getPopupNotices);

// Programs
router.get('/programs', getPrograms);
router.get('/programs/:id', getProgramById);

// Schemes
router.get('/schemes', getSchemes);
router.get('/schemes/:id', getSchemeById);

// Gallery
router.get('/gallery', getGallery);

// Contact form
router.post('/contact', validate(contactFormSchema), submitContactForm);

// Complaint form (public submission)
router.post('/complaints', submitComplaint);
router.post('/tax-payments', submitTaxPayment);

// Public complaint image upload (no auth required)
router.post('/upload/complaint', (req, res, next) => {
  uploadSingle('image')(req, res, (err) => {
    if (err) return handleMulterError(err, req, res, next);
    next();
  });
}, validateFileSignature, async (req, res) => {
  try {
    const villageSlug = req.tenant?.slug || 'public';
    if (!req.file) return res.status(400).json({ message: 'कोणतीही प्रतिमा मिळाली नाही' });
    const results = await imageService.processImages([req.file], villageSlug, 'complaint');
    res.json({ success: true, data: { url: results[0]?.url } });
  } catch (err) {
    res.status(500).json({ message: 'अपलोड अयशस्वी: ' + err.message });
  }
});

// Public tax payment screenshot upload (no auth required)
router.post('/upload/tax-payment', (req, res, next) => {
  uploadSingle('image')(req, res, (err) => {
    if (err) return handleMulterError(err, req, res, next);
    next();
  });
}, validateFileSignature, async (req, res) => {
  try {
    const villageSlug = req.tenant?.slug || 'public';
    if (!req.file) return res.status(400).json({ message: 'कोणतीही प्रतिमा मिळाली नाही' });
    const results = await imageService.processImages([req.file], villageSlug, 'complaint');
    res.json({ success: true, data: { url: results[0]?.url } });
  } catch (err) {
    res.status(500).json({ message: 'अपलोड अयशस्वी: ' + err.message });
  }
});

// SEO data
router.get('/seo', getSeoData);

// Awards
router.get('/awards', getAwards);

// Financial Reports (जमा खर्च)
router.get('/financial-reports', getFinancialReports);

// Gramsabha
router.get('/gramsabhas', getGramsabhas);

// Schools
router.get('/schools', getSchools);

// Development Works (विकास कामे)
router.get('/development-works', getDevelopmentWorks);

// Global settings (shared — no village tenant required)
router.get('/global-settings', getPublicGlobalSettings);

export default router;
