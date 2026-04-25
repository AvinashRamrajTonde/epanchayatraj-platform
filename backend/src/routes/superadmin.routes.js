import { Router } from 'express';
import {
  createVillage, getVillages, getVillageById,
  updateVillage, updateVillageStatus, deleteVillage,
  getDashboardStats, createTehsil, getTehsils, updateTehsil, deleteTehsil,
  updateVillageTheme, resetVillageAdminPassword, bulkImportTehsils, bulkImportVillages,
  getSmtpConfig, upsertSmtpConfig, testSmtpConfig,
  getGlobalSettings, upsertGlobalSetting,
  getVillageSeo, upsertVillageSeo,
  getSubscriptions, getVillageSubscription, renewSubscription, sendRenewalReminders,
  sendBulkMail,
  getContactsDirectory,
} from '../controllers/superadmin.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize, requireSuperadminTenant } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import {
  createVillageSchema, updateVillageSchema,
  updateVillageStatusSchema, createTehsilSchema, updateTehsilSchema,
  paginationSchema, updateVillageThemeSchema,
} from '../utils/validators.js';
import { ROLES } from '../config/constants.js';

const router = Router();

// All superadmin routes require: admin subdomain + auth + superadmin role
router.use(requireSuperadminTenant);
router.use(authenticate);
router.use(authorize(ROLES.SUPERADMIN));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Villages
router.post('/villages/import', bulkImportVillages);
router.post('/villages', validate(createVillageSchema), createVillage);
router.get('/villages', validate(paginationSchema, 'query'), getVillages);
router.get('/villages/:id', getVillageById);
router.put('/villages/:id', validate(updateVillageSchema), updateVillage);
router.patch('/villages/:id/status', validate(updateVillageStatusSchema), updateVillageStatus);
router.patch('/villages/:id/theme', validate(updateVillageThemeSchema), updateVillageTheme);
router.delete('/villages/:id', deleteVillage);
router.post('/villages/:id/reset-password', resetVillageAdminPassword);

// Tehsils
router.post('/tehsils/import', bulkImportTehsils);
router.post('/tehsils', validate(createTehsilSchema), createTehsil);
router.get('/tehsils', getTehsils);
router.put('/tehsils/:id', validate(updateTehsilSchema), updateTehsil);
router.delete('/tehsils/:id', deleteTehsil);

// SMTP Configuration
router.get('/smtp-config', getSmtpConfig);
router.put('/smtp-config', upsertSmtpConfig);
router.post('/smtp-config/test', testSmtpConfig);

// Global Settings
router.get('/global-settings', getGlobalSettings);
router.put('/global-settings/:key', upsertGlobalSetting);

// Village SEO Management
router.get('/villages/:id/seo', getVillageSeo);
router.put('/villages/:id/seo', upsertVillageSeo);

// ---- Subscriptions ----
router.get('/subscriptions', getSubscriptions);
router.get('/villages/:id/subscription', getVillageSubscription);
router.post('/villages/:id/subscription/renew', renewSubscription);
router.post('/subscriptions/send-reminders', sendRenewalReminders);

// ---- Bulk Mail ----
router.post('/mail/bulk', sendBulkMail);

// ---- Contacts Directory ----
router.get('/contacts', getContactsDirectory);

export default router;
