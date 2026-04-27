import Joi from 'joi';

// Custom validator: accepts both full URIs (https://...) and relative paths (/uploads/...)
const imageUrl = () => Joi.string().pattern(/^(https?:\/\/|\/)/)
  .messages({ 'string.pattern.base': '{{#label}} must be a valid URL or relative path starting with /' });

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const createVillageSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  slug: Joi.string().min(2).max(50).pattern(/^[a-z0-9-]+$/).required()
    .messages({ 'string.pattern.base': 'Slug must be lowercase letters, numbers, and hyphens only' }),
  tehsilId: Joi.string().required(),
  settings: Joi.object().optional(),
  adminEmail: Joi.string().email().optional(),
  adminName: Joi.string().min(2).max(100).optional(),
  adminPassword: Joi.string().min(8).optional(),
});

export const updateVillageSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  slug: Joi.string().min(2).max(50).pattern(/^[a-z0-9-]+$/).optional()
    .messages({ 'string.pattern.base': 'Slug must be lowercase letters, numbers, and hyphens only' }),
  tehsilId: Joi.string().optional(),
  settings: Joi.object().optional(),
  customDomain: Joi.string().hostname().allow(null, '').optional(),
});

export const updateVillageStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'inactive').required(),
});

export const createTehsilSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  nameEn: Joi.string().min(2).max(100).allow('').optional(),
  district: Joi.string().min(2).max(100).required(),
  districtEn: Joi.string().min(2).max(100).allow('').optional(),
  state: Joi.string().min(2).max(100).required(),
  stateSlug: Joi.string().min(2).max(100).allow('').optional(),
});

export const updateTehsilSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  nameEn: Joi.string().min(2).max(100).allow('').optional(),
  district: Joi.string().min(2).max(100).optional(),
  districtEn: Joi.string().min(2).max(100).allow('').optional(),
  state: Joi.string().min(2).max(100).optional(),
  stateSlug: Joi.string().min(2).max(100).allow('').optional(),
}).min(1);

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow('').optional(),
  status: Joi.string().valid('active', 'inactive', '').optional(),
});

// ---- Village Admin Validators ----

export const createMemberSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  designation: Joi.string().min(2).max(100).required(),
  phone: Joi.string().max(15).allow('', null).optional(),
  email: Joi.string().email().allow('', null).optional(),
  photoUrl: imageUrl().allow('', null).optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
});

export const updateMemberSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  designation: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().max(15).allow('', null).optional(),
  email: Joi.string().email().allow('', null).optional(),
  photoUrl: imageUrl().allow('', null).optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

export const createNoticeSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  content: Joi.string().min(2).required(),
  category: Joi.string().valid('general', 'urgent', 'event', 'meeting', 'scheme').optional(),
  isPublished: Joi.boolean().optional(),
  expiresAt: Joi.string().isoDate().allow(null, '').optional(),
});

export const updateNoticeSchema = Joi.object({
  title: Joi.string().min(2).max(200).optional(),
  content: Joi.string().min(2).optional(),
  category: Joi.string().valid('general', 'urgent', 'event', 'meeting', 'scheme').optional(),
  isPublished: Joi.boolean().optional(),
  expiresAt: Joi.string().isoDate().allow(null, '').optional(),
});

export const createGalleryImageSchema = Joi.object({
  title: Joi.string().max(200).allow('', null).optional(),
  imageUrl: imageUrl().allow('', null).optional(),
  videoUrl: Joi.string().uri().max(500).allow('', null).optional(),
  caption: Joi.string().max(500).allow('', null).optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
});

export const upsertContentSchema = Joi.object({
  content: Joi.object().required(),
});

export const updateApplicationStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'in-review', 'approved', 'rejected').required(),
  remarks: Joi.string().max(500).allow('', null).optional(),
});

export const applicationFilterSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow('').optional(),
  status: Joi.string().valid('pending', 'in-review', 'approved', 'rejected', '').optional(),
  serviceType: Joi.string().allow('').optional(),
});

export const noticeFilterSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  category: Joi.string().allow('').optional(),
  isPublished: Joi.boolean().optional(),
});

export const updateVillageSettingsSchema = Joi.object({
  settings: Joi.object().required(),
});

// ---- New model validators ----

export const createMemberSchemaExtended = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  designation: Joi.string().min(2).max(100).required(),
  type: Joi.string().valid('sarpanch', 'upsarpanch', 'gramsevak', 'grampanchayat_adhikari', 'leader', 'member', 'staff', 'computer_operator', 'pump_operator', 'safai_kamgar', 'peon', 'other_staff').optional(),
  phone: Joi.string().max(15).allow('', null).optional(),
  email: Joi.string().email().allow('', null).optional(),
  photoUrl: imageUrl().allow('', null).optional(),
  bio: Joi.string().max(1000).allow('', null).optional(),
  backContent: Joi.object().allow(null).optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
});

export const updateMemberSchemaExtended = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  designation: Joi.string().min(2).max(100).optional(),
  type: Joi.string().valid('sarpanch', 'upsarpanch', 'gramsevak', 'grampanchayat_adhikari', 'leader', 'member', 'staff', 'computer_operator', 'pump_operator', 'safai_kamgar', 'peon', 'other_staff').optional(),
  phone: Joi.string().max(15).allow('', null).optional(),
  email: Joi.string().email().allow('', null).optional(),
  photoUrl: imageUrl().allow('', null).optional(),
  bio: Joi.string().max(1000).allow('', null).optional(),
  backContent: Joi.object().allow(null).optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

export const createHeroSlideSchema = Joi.object({
  imageUrl: imageUrl().required(),
  altText: Joi.string().max(200).allow('', null).optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

export const updateHeroSlideSchema = Joi.object({
  imageUrl: imageUrl().optional(),
  altText: Joi.string().max(200).allow('', null).optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

export const createProgramSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow('', null).optional(),
  category: Joi.string().max(50).optional(),
  location: Joi.string().max(200).allow('', null).optional(),
  date: Joi.string().isoDate().allow(null, '').optional(),
  images: Joi.array().items(imageUrl()).optional(),
  highlights: Joi.array().items(Joi.string()).optional(),
  result: Joi.string().allow('', null).optional(),
  isPublished: Joi.boolean().optional(),
});

export const updateProgramSchema = Joi.object({
  title: Joi.string().min(2).max(200).optional(),
  description: Joi.string().allow('', null).optional(),
  category: Joi.string().max(50).optional(),
  location: Joi.string().max(200).allow('', null).optional(),
  date: Joi.string().isoDate().allow(null, '').optional(),
  images: Joi.array().items(imageUrl()).optional(),
  highlights: Joi.array().items(Joi.string()).optional(),
  result: Joi.string().allow('', null).optional(),
  isPublished: Joi.boolean().optional(),
});

export const createSchemeSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow('', null).optional(),
  category: Joi.string().max(50).optional(),
  benefits: Joi.array().items(Joi.string()).optional(),
  eligibility: Joi.array().items(Joi.string()).optional(),
  documents: Joi.array().items(Joi.string()).optional(),
  applicationProcess: Joi.array().items(Joi.string()).optional(),
  contactInfo: Joi.string().allow('', null).optional(),
  budget: Joi.string().allow('', null).optional(),
  beneficiaries: Joi.string().allow('', null).optional(),
  imageUrl: Joi.string().allow('', null).optional(),
  schemeLink: Joi.string().uri().allow('', null).optional(),
  isActive: Joi.boolean().optional(),
});

export const updateSchemeSchema = Joi.object({
  title: Joi.string().min(2).max(200).optional(),
  description: Joi.string().allow('', null).optional(),
  category: Joi.string().max(50).optional(),
  benefits: Joi.array().items(Joi.string()).optional(),
  eligibility: Joi.array().items(Joi.string()).optional(),
  documents: Joi.array().items(Joi.string()).optional(),
  applicationProcess: Joi.array().items(Joi.string()).optional(),
  contactInfo: Joi.string().allow('', null).optional(),
  budget: Joi.string().allow('', null).optional(),
  beneficiaries: Joi.string().allow('', null).optional(),
  imageUrl: Joi.string().allow('', null).optional(),
  schemeLink: Joi.string().uri().allow('', null).optional(),
  isActive: Joi.boolean().optional(),
});

export const contactFormSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  phone: Joi.string().max(15).allow('', null).optional(),
  email: Joi.string().email().allow('', null).optional(),
  subject: Joi.string().max(200).allow('', null).optional(),
  message: Joi.string().min(5).max(2000).required(),
});

export const contactSubmissionFilterSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('new', 'read', 'responded', '').optional(),
});

export const updateContactSubmissionStatusSchema = Joi.object({
  status: Joi.string().valid('new', 'read', 'responded').required(),
});

export const createGalleryImageSchemaExtended = Joi.object({
  title: Joi.string().max(200).allow('', null).optional(),
  imageUrl: imageUrl().allow('', null).optional(),
  videoUrl: Joi.string().uri().max(500).allow('', null).optional(),
  caption: Joi.string().max(500).allow('', null).optional(),
  category: Joi.string().max(50).optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
});

export const createNoticeSchemaExtended = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  content: Joi.string().min(2).required(),
  category: Joi.string().valid('general', 'urgent', 'event', 'meeting', 'scheme').optional(),
  imageUrl: imageUrl().allow('', null).optional(),
  priority: Joi.string().valid('high', 'normal', 'low').optional(),
  isPopup: Joi.boolean().optional(),
  isPublished: Joi.boolean().optional(),
  expiresAt: Joi.string().isoDate().allow(null, '').optional(),
});

export const updateNoticeSchemaExtended = Joi.object({
  title: Joi.string().min(2).max(200).optional(),
  content: Joi.string().min(2).optional(),
  category: Joi.string().valid('general', 'urgent', 'event', 'meeting', 'scheme').optional(),
  imageUrl: imageUrl().allow('', null).optional(),
  priority: Joi.string().valid('high', 'normal', 'low').optional(),
  isPopup: Joi.boolean().optional(),
  isPublished: Joi.boolean().optional(),
  expiresAt: Joi.string().isoDate().allow(null, '').optional(),
});

export const programFilterSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  category: Joi.string().allow('').optional(),
  isPublished: Joi.boolean().optional(),
});

export const schemeFilterSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  category: Joi.string().allow('').optional(),
  isActive: Joi.boolean().optional(),
});

// ---- Award Validators ----

export const createAwardSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow('', null).optional(),
  year: Joi.number().integer().min(1900).max(2100).allow(null).optional(),
  category: Joi.string().max(50).optional(),
  awardedBy: Joi.string().max(200).allow('', null).optional(),
  imageUrl: imageUrl().allow('', null).optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

export const updateAwardSchema = Joi.object({
  title: Joi.string().min(2).max(200).optional(),
  description: Joi.string().allow('', null).optional(),
  year: Joi.number().integer().min(1900).max(2100).allow(null).optional(),
  category: Joi.string().max(50).optional(),
  awardedBy: Joi.string().max(200).allow('', null).optional(),
  imageUrl: imageUrl().allow('', null).optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

export const awardFilterSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  category: Joi.string().allow('').optional(),
  isActive: Joi.boolean().optional(),
});

export const updateVillageThemeSchema = Joi.object({
  theme: Joi.string().valid('classic', 'modern').required(),
});

// ---- Financial Report Validators ----

export const createFinancialReportSchema = Joi.object({
  financialYear: Joi.string().pattern(/^\d{4}-\d{4}$/).required()
    .messages({ 'string.pattern.base': 'आर्थिक वर्ष "2025-2026" या स्वरूपात असावे' }),
  incomeAmount: Joi.number().min(0).required(),
  expenseAmount: Joi.number().min(0).required(),
  balanceAmount: Joi.number().required(),
  pdfUrl: Joi.string().allow('', null).optional(),
  isPublished: Joi.boolean().optional(),
});

export const updateFinancialReportSchema = Joi.object({
  financialYear: Joi.string().pattern(/^\d{4}-\d{4}$/).optional()
    .messages({ 'string.pattern.base': 'आर्थिक वर्ष "2025-2026" या स्वरूपात असावे' }),
  incomeAmount: Joi.number().min(0).optional(),
  expenseAmount: Joi.number().min(0).optional(),
  balanceAmount: Joi.number().optional(),
  pdfUrl: Joi.string().allow('', null).optional(),
  isPublished: Joi.boolean().optional(),
});

// ---- Development Works Validators ----

export const createDevelopmentWorkSchema = Joi.object({
  schemeName: Joi.string().min(2).max(300).required(),
  workName: Joi.string().min(2).max(500).required(),
  financialYear: Joi.string().pattern(/^\d{4}-\d{4}$/).required()
    .messages({ 'string.pattern.base': 'आर्थिक वर्ष "2025-2026" या स्वरूपात असावे' }),
  sanctionedAmount: Joi.number().min(0).required(),
  expendedAmount: Joi.number().min(0).optional(),
  status: Joi.string().valid('in_progress', 'completed').optional(),
  isPublished: Joi.boolean().optional(),
});

export const updateDevelopmentWorkSchema = Joi.object({
  schemeName: Joi.string().min(2).max(300).optional(),
  workName: Joi.string().min(2).max(500).optional(),
  financialYear: Joi.string().pattern(/^\d{4}-\d{4}$/).optional()
    .messages({ 'string.pattern.base': 'आर्थिक वर्ष "2025-2026" या स्वरूपात असावे' }),
  sanctionedAmount: Joi.number().min(0).optional(),
  expendedAmount: Joi.number().min(0).optional(),
  status: Joi.string().valid('in_progress', 'completed').optional(),
  isPublished: Joi.boolean().optional(),
});

export const developmentWorkFilterSchema = Joi.object({
  financialYear: Joi.string().pattern(/^\d{4}-\d{4}$/).optional(),
  status: Joi.string().valid('in_progress', 'completed').optional(),
});

// ---- Gramsabha Validators ----

export const createGramsabhaSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  date: Joi.string().isoDate().required(),
  time: Joi.string().max(50).allow('', null).optional(),
  location: Joi.string().max(300).allow('', null).optional(),
  agenda: Joi.string().allow('', null).optional(),
  status: Joi.string().valid('scheduled', 'completed', 'cancelled').optional(),
});

export const updateGramsabhaSchema = Joi.object({
  title: Joi.string().min(2).max(200).optional(),
  date: Joi.string().isoDate().optional(),
  time: Joi.string().max(50).allow('', null).optional(),
  location: Joi.string().max(300).allow('', null).optional(),
  agenda: Joi.string().allow('', null).optional(),
  status: Joi.string().valid('scheduled', 'completed', 'cancelled').optional(),
  attendeesTotal: Joi.number().integer().min(0).allow(null).optional(),
  attendeesMale: Joi.number().integer().min(0).allow(null).optional(),
  attendeesFemale: Joi.number().integer().min(0).allow(null).optional(),
  minutes: Joi.string().allow('', null).optional(),
  decisions: Joi.array().items(Joi.string()).allow(null).optional(),
  imageUrl: imageUrl().allow('', null).optional(),
  pdfUrl: Joi.string().allow('', null).optional(),
});

export const gramsabhaFilterSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('scheduled', 'completed', 'cancelled', '').optional(),
});

// ---- School Validators ----

export const createSchoolSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  address: Joi.string().max(500).allow('', null).optional(),
  principalName: Joi.string().max(100).allow('', null).optional(),
  principalPhoto: imageUrl().allow('', null).optional(),
  schoolPhoto: imageUrl().allow('', null).optional(),
  boysCount: Joi.number().integer().min(0).optional(),
  girlsCount: Joi.number().integer().min(0).optional(),
  teachersCount: Joi.number().integer().min(0).optional(),
  establishedYear: Joi.number().integer().min(1800).max(2100).allow(null).optional(),
  phone: Joi.string().max(15).allow('', null).optional(),
  email: Joi.string().email().allow('', null).optional(),
  managementType: Joi.string().max(50).allow('', null).optional(),
  medium: Joi.string().max(50).allow('', null).optional(),
  isActive: Joi.boolean().optional(),
});

export const updateSchoolSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  address: Joi.string().max(500).allow('', null).optional(),
  principalName: Joi.string().max(100).allow('', null).optional(),
  principalPhoto: imageUrl().allow('', null).optional(),
  schoolPhoto: imageUrl().allow('', null).optional(),
  boysCount: Joi.number().integer().min(0).optional(),
  girlsCount: Joi.number().integer().min(0).optional(),
  teachersCount: Joi.number().integer().min(0).optional(),
  establishedYear: Joi.number().integer().min(1800).max(2100).allow(null).optional(),
  phone: Joi.string().max(15).allow('', null).optional(),
  email: Joi.string().email().allow('', null).optional(),
  managementType: Joi.string().max(50).allow('', null).optional(),
  medium: Joi.string().max(50).allow('', null).optional(),
  isActive: Joi.boolean().optional(),
});
