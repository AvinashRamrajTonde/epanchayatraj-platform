import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { villageService } from '../services/village.service.js';
import { tehsilService } from '../services/tehsil.service.js';
import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import { clearSmtpCache } from '../services/email.service.js';
import { sendEmail, sendRenewalReceiptEmail, sendRenewalReminderEmail } from '../services/email.service.js';
import { contentService } from '../services/content.service.js';
import { ApiError } from '../utils/ApiError.js';

// ---- Village CRUD ----

export const createVillage = catchAsync(async (req, res) => {
  const result = await villageService.create(req.body);
  sendResponse(res, 201, result, 'Village created successfully');
});

export const getVillages = catchAsync(async (req, res) => {
  const result = await villageService.findAll(req.query);
  sendResponse(res, 200, result, 'Villages retrieved');
});

export const getVillageById = catchAsync(async (req, res) => {
  const village = await villageService.findById(req.params.id);
  sendResponse(res, 200, village, 'Village retrieved');
});

export const updateVillage = catchAsync(async (req, res) => {
  const village = await villageService.update(req.params.id, req.body);
  sendResponse(res, 200, village, 'Village updated');
});

export const updateVillageStatus = catchAsync(async (req, res) => {
  const village = await villageService.updateStatus(req.params.id, req.body.status);
  sendResponse(res, 200, village, 'Village status updated');
});

export const getDashboardStats = catchAsync(async (req, res) => {
  const now = new Date();
  const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const [total, active, inactive, expiringCount, expiredCount, revenueAgg] = await Promise.all([
    prisma.village.count(),
    prisma.village.count({ where: { status: 'active' } }),
    prisma.village.count({ where: { status: 'inactive' } }),
    prisma.villageSubscription.count({ where: { status: 'active', endDate: { lte: in30 } } }),
    prisma.villageSubscription.count({ where: { status: 'expired' } }),
    prisma.villageSubscription.aggregate({ _sum: { amount: true } }),
  ]);

  sendResponse(res, 200, {
    total, active, inactive,
    expiringCount, expiredCount,
    totalRevenue: revenueAgg._sum.amount || 0,
  }, 'Stats retrieved');
});

// ---- Tehsil CRUD ----

export const createTehsil = catchAsync(async (req, res) => {
  const tehsil = await tehsilService.create(req.body);
  sendResponse(res, 201, tehsil, 'Tehsil created successfully');
});

export const getTehsils = catchAsync(async (req, res) => {
  const tehsils = await tehsilService.findAll();
  sendResponse(res, 200, tehsils, 'Tehsils retrieved');
});

export const updateTehsil = catchAsync(async (req, res) => {
  const tehsil = await tehsilService.update(req.params.id, req.body);
  sendResponse(res, 200, tehsil, 'Tehsil updated successfully');
});

export const deleteTehsil = catchAsync(async (req, res) => {
  const result = await tehsilService.delete(req.params.id);
  sendResponse(res, 200, result, 'Tehsil deleted successfully');
});

export const bulkImportTehsils = catchAsync(async (req, res) => {
  const rows = req.body.tehsils;
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new ApiError(400, 'No tehsil rows provided');
  }
  const results = { created: 0, skipped: 0, errors: [] };
  for (const row of rows) {
    const name = (row.name || row['नाव'] || '').trim();
    const district = (row.district || row['जिल्हा'] || '').trim();
    const state = (row.state || row['राज्य'] || '').trim();
    if (!name || !district || !state) { results.skipped++; continue; }
    try {
      await prisma.tehsil.create({
        data: {
          name,
          nameEn: (row.nameEn || row['Name EN'] || '').trim() || null,
          district,
          districtEn: (row.districtEn || row['District EN'] || '').trim() || null,
          state,
          stateSlug: (row.stateSlug || row['State Slug'] || '').trim() || null,
        },
      });
      results.created++;
    } catch (e) {
      results.errors.push(`${name}: ${e.message}`);
      results.skipped++;
    }
  }
  sendResponse(res, 200, results, `Import complete: ${results.created} created, ${results.skipped} skipped`);
});

export const deleteVillage = catchAsync(async (req, res) => {
  const result = await villageService.delete(req.params.id);
  sendResponse(res, 200, result, 'Village deleted successfully');
});

export const resetVillageAdminPassword = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters');
  }
  // Find the admin user of this village
  const adminUser = await prisma.user.findFirst({
    where: { villageId: id, role: 'admin' },
  });
  if (!adminUser) throw new ApiError(404, 'No admin user found for this village');
  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: adminUser.id }, data: { password: hashed } });
  sendResponse(res, 200, { userId: adminUser.id, email: adminUser.email }, 'Password reset successfully');
});

// ---- Village Theme ----
export const updateVillageTheme = catchAsync(async (req, res) => {
  const village = await prisma.village.update({
    where: { id: req.params.id },
    data: { theme: req.body.theme },
    select: { id: true, name: true, slug: true, theme: true },
  });
  sendResponse(res, 200, village, 'Village theme updated');
});

// ---- SMTP Configuration ----
export const getSmtpConfig = catchAsync(async (req, res) => {
  const config = await prisma.smtpConfig.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: 'desc' },
  });
  // Mask password for security
  if (config && config.password) {
    config.password = '••••••••';
  }
  sendResponse(res, 200, config, 'SMTP config retrieved');
});

export const upsertSmtpConfig = catchAsync(async (req, res) => {
  const { host, port, secure, username, password, fromEmail, fromName } = req.body;

  // Check if config exists
  const existing = await prisma.smtpConfig.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: 'desc' },
  });

  let config;
  const data = {
    host,
    port: parseInt(port, 10) || 587,
    secure: !!secure,
    username,
    fromEmail,
    fromName: fromName || 'ग्रामपंचायत पोर्टल',
    isActive: true,
  };

  // Only update password if provided (not the masked placeholder)
  if (password && password !== '••••••••') {
    data.password = password;
  }

  if (existing) {
    config = await prisma.smtpConfig.update({
      where: { id: existing.id },
      data,
    });
  } else {
    if (!password || password === '••••••••') {
      return sendResponse(res, 400, null, 'Password is required for new SMTP configuration');
    }
    data.password = password;
    config = await prisma.smtpConfig.create({ data });
  }

  // Clear cached transporter
  clearSmtpCache();

  // Mask password in response
  config.password = '••••••••';
  sendResponse(res, 200, config, 'SMTP config updated');
});

export const testSmtpConfig = catchAsync(async (req, res) => {
  const { testEmail } = req.body;
  if (!testEmail) {
    return sendResponse(res, 400, null, 'Test email address is required');
  }

  const { sendOTPEmail } = await import('../services/email.service.js');
  const result = await sendOTPEmail(testEmail, '123456');

  if (result.sent) {
    sendResponse(res, 200, null, 'Test email sent successfully');
  } else {
    sendResponse(res, 400, { reason: result.reason }, 'Failed to send test email: ' + (result.reason || 'SMTP not configured'));
  }
});

// ---- Global Settings ----

export const getGlobalSettings = catchAsync(async (req, res) => {
  const settings = await prisma.globalSetting.findMany();
  const map = {};
  for (const s of settings) map[s.key] = s.value;
  sendResponse(res, 200, map, 'Global settings retrieved');
});

export const upsertGlobalSetting = catchAsync(async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  const setting = await prisma.globalSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  sendResponse(res, 200, setting, 'Global setting saved');
});

// ---- Village SEO Management ----

export const getVillageSeo = catchAsync(async (req, res) => {
  const { id } = req.params;
  const seoContent = await contentService.findBySection(id, 'seo');
  sendResponse(res, 200, seoContent?.content || {}, 'SEO data retrieved');
});

export const upsertVillageSeo = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await contentService.upsert(id, 'seo', req.body);
  sendResponse(res, 200, result, 'SEO data saved');
});

// ---- Village Bulk Import ----

export const bulkImportVillages = catchAsync(async (req, res) => {
  const rows = req.body.villages;
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new ApiError(400, 'villages array is required');
  }

  let created = 0;
  const skipped = [];
  const errors = [];

  for (const row of rows) {
    // Normalise column names (Marathi or English headers)
    const name = String(row['नाव'] || row['name'] || '').trim();
    const slug = String(row['slug'] || row['Slug'] || '').trim().toLowerCase();
    const subdomain = String(row['subdomain'] || row['Subdomain'] || slug).trim().toLowerCase();
    const customDomain = String(row['customDomain'] || row['custom_domain'] || row['Custom Domain'] || '').trim() || null;
    const tehsilName = String(row['tehsilName'] || row['tehsil'] || row['तहसील'] || '').trim();
    const adminEmail = String(row['adminEmail'] || row['admin_email'] || row['Admin Email'] || '').trim();
    const adminName = String(row['adminName'] || row['admin_name'] || row['Admin Name'] || '').trim();
    const adminPassword = String(row['adminPassword'] || row['admin_password'] || row['Password'] || '').trim();

    if (!name || !slug) {
      errors.push({ row: name || slug || JSON.stringify(row), reason: 'नाव आणि slug आवश्यक आहेत' });
      continue;
    }

    // Duplicate checks
    const [slugExists, subdomainExists, customDomainExists] = await Promise.all([
      prisma.village.findUnique({ where: { slug } }),
      prisma.village.findUnique({ where: { subdomain } }),
      customDomain ? prisma.village.findFirst({ where: { customDomain } }) : Promise.resolve(null),
    ]);

    if (slugExists) { skipped.push({ name, reason: `Slug '${slug}' आधीच वापरात आहे` }); continue; }
    if (subdomainExists) { skipped.push({ name, reason: `Subdomain '${subdomain}' आधीच वापरात आहे` }); continue; }
    if (customDomainExists) { skipped.push({ name, reason: `Custom domain '${customDomain}' आधीच वापरात आहे` }); continue; }

    // Resolve tehsil
    let tehsilId = null;
    if (tehsilName) {
      const tehsil = await prisma.tehsil.findFirst({
        where: { OR: [{ name: { equals: tehsilName, mode: 'insensitive' } }, { nameEn: { equals: tehsilName, mode: 'insensitive' } }] },
      });
      if (!tehsil) { errors.push({ row: name, reason: `तहसील '${tehsilName}' सापडली नाही` }); continue; }
      tehsilId = tehsil.id;
    } else {
      errors.push({ row: name, reason: 'tehsilName आवश्यक आहे' }); continue;
    }

    try {
      await villageService.create({ name, slug, subdomain, customDomain, tehsilId, adminEmail, adminName, adminPassword });
      created++;
    } catch (e) {
      errors.push({ row: name, reason: e.message });
    }
  }

  sendResponse(res, 200, { created, skipped, errors }, `${created} गावे तयार केली`);
});

// ---- Subscriptions ----

function generateReceiptNo() {
  const yr = new Date().getFullYear();
  const rand = String(Math.floor(10000 + Math.random() * 90000));
  return `REC-${yr}-${rand}`;
}

export const getSubscriptions = catchAsync(async (req, res) => {
  const { status, expiring } = req.query;
  const where = {};
  if (status) where.status = status;
  if (expiring === 'soon') {
    const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    where.endDate = { lte: in30 };
    where.status = 'active';
  }
  const subscriptions = await prisma.villageSubscription.findMany({
    where,
    include: { village: { include: { tehsil: true } } },
    orderBy: { endDate: 'asc' },
  });
  const now = new Date();
  const data = subscriptions.map(s => ({
    ...s,
    daysLeft: Math.ceil((new Date(s.endDate) - now) / (1000 * 60 * 60 * 24)),
  }));
  sendResponse(res, 200, data, 'Subscriptions retrieved');
});

export const getVillageSubscription = catchAsync(async (req, res) => {
  const { id } = req.params;
  const sub = await prisma.villageSubscription.findUnique({
    where: { villageId: id },
    include: { village: { include: { tehsil: true } } },
  });
  const now = new Date();
  const data = sub ? { ...sub, daysLeft: Math.ceil((new Date(sub.endDate) - now) / (1000 * 60 * 60 * 24)) } : null;
  sendResponse(res, 200, data, 'Subscription retrieved');
});

export const renewSubscription = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { amount = 0, paymentMethod, remarks } = req.body;

  const village = await prisma.village.findUnique({
    where: { id },
    include: { tehsil: true },
  });
  if (!village) throw new ApiError(404, 'Village not found');

  const now = new Date();
  const startDate = now;
  const endDate = new Date(now);
  endDate.setFullYear(endDate.getFullYear() + 1);
  const receiptNo = generateReceiptNo();

  const sub = await prisma.villageSubscription.upsert({
    where: { villageId: id },
    update: { startDate, endDate, amount, paymentMethod, remarks, receiptNo, paidAt: now, status: 'active', reminderSentAt: null },
    create: { villageId: id, plan: 'annual', startDate, endDate, amount, paymentMethod, remarks, receiptNo, paidAt: now, status: 'active' },
  });

  // Email receipt to village admin
  const adminUser = await prisma.user.findFirst({ where: { villageId: id, role: 'admin' } });
  if (adminUser?.email) {
    const loginUrl = `http://${village.subdomain}.${process.env.PLATFORM_DOMAIN || 'gpmh.local'}:5173`;
    sendRenewalReceiptEmail({
      adminEmail: adminUser.email,
      villageName: village.name,
      receiptNo,
      amount,
      startDate,
      endDate,
      paymentMethod,
      loginUrl,
    }).catch(err => console.error('[RENEWAL EMAIL]', err.message));
  }

  sendResponse(res, 200, { ...sub, daysLeft: 365 }, 'Subscription renewed');
});

export const sendRenewalReminders = catchAsync(async (req, res) => {
  const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const expiring = await prisma.villageSubscription.findMany({
    where: {
      status: 'active',
      endDate: { lte: in30 },
      OR: [{ reminderSentAt: null }, { reminderSentAt: { lte: sevenDaysAgo } }],
    },
    include: { village: true },
  });

  let sent = 0, failed = 0;
  const renewUrl = `http://${process.env.PLATFORM_DOMAIN || 'gpmh.local'}:5173/subscriptions`;

  for (const sub of expiring) {
    const adminUser = await prisma.user.findFirst({ where: { villageId: sub.villageId, role: 'admin' } });
    if (!adminUser?.email) { failed++; continue; }
    const daysLeft = Math.ceil((new Date(sub.endDate) - new Date()) / (1000 * 60 * 60 * 24));
    const result = await sendRenewalReminderEmail({
      adminEmail: adminUser.email,
      villageName: sub.village.name,
      daysLeft,
      endDate: sub.endDate,
      renewUrl,
    });
    if (result.sent) {
      await prisma.villageSubscription.update({ where: { id: sub.id }, data: { reminderSentAt: new Date() } });
      sent++;
    } else {
      failed++;
    }
  }

  sendResponse(res, 200, { sent, failed, total: expiring.length }, 'Reminders processed');
});

// ---- Bulk Mail ----

export const sendBulkMail = catchAsync(async (req, res) => {
  const { subject, html, villageIds } = req.body;
  if (!subject || !html) throw new ApiError(400, 'subject and html are required');

  const where = { role: 'admin' };
  if (villageIds?.length) where.villageId = { in: villageIds };
  else where.villageId = { not: null }; // all village admins

  const admins = await prisma.user.findMany({ where, select: { email: true, name: true } });
  let sent = 0, failed = 0;

  for (const admin of admins) {
    if (!admin.email) { failed++; continue; }
    const result = await sendEmail(admin.email, subject, html);
    result.sent ? sent++ : failed++;
  }

  sendResponse(res, 200, { sent, failed, total: admins.length }, 'Bulk mail sent');
});

// ---- Contacts Directory ----

export const getContactsDirectory = catchAsync(async (req, res) => {
  const { designation, search, district } = req.query;
  const where = { isActive: true };
  if (designation) where.designation = { contains: designation, mode: 'insensitive' };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { village: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }
  if (district) where.village = { tehsil: { district: { contains: district, mode: 'insensitive' } } };

  const contacts = await prisma.member.findMany({
    where,
    include: { village: { include: { tehsil: true } } },
    orderBy: [{ designation: 'asc' }, { name: 'asc' }],
  });

  sendResponse(res, 200, contacts, 'Contacts retrieved');
});
