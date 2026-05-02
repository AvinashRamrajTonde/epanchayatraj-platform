import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import prisma from '../config/db.js';
import { contentService } from '../services/content.service.js';
import { contactSubmissionService } from '../services/contactSubmission.service.js';
import { awardService } from '../services/award.service.js';
import { financialReportService } from '../services/financialReport.service.js';
import { gramsabhaService } from '../services/gramsabha.service.js';
import { schoolService } from '../services/school.service.js';
import { developmentWorkService } from '../services/developmentWork.service.js';
import { complaintService } from '../services/complaint.service.js';
import { taxService } from '../services/tax.service.js';

// Helper to ensure village tenant
function ensureVillageTenant(req) {
  if (req.tenantType !== 'village' || !req.tenant) {
    throw new ApiError(404, 'Village not found for this domain');
  }
  return req.tenant.id;
}

export const getVillageInfo = catchAsync(async (req, res) => {
  ensureVillageTenant(req);
  const { id, name, slug, subdomain, customDomain, status, theme, settings, tehsil, createdAt } = req.tenant;
  sendResponse(res, 200, { id, name, slug, subdomain, customDomain, status, theme, settings, tehsil, createdAt }, 'Village info retrieved');
});

export const getVillageFullData = catchAsync(async (req, res) => {
  const villageId = ensureVillageTenant(req);

  const [
    contents,
    heroSlides,
    members,
    notices,
    programs,
    schemes,
    gallery,
    awards,
    financialReports,
  ] = await Promise.all([
    prisma.villageContent.findMany({ where: { villageId } }),
    prisma.heroSlide.findMany({ where: { villageId, isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.member.findMany({ where: { villageId, isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.notice.findMany({
      where: {
        villageId,
        isPublished: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } },
        ],
      },
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
      take: 10,
    }),
    prisma.program.findMany({
      where: { villageId, isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    prisma.scheme.findMany({
      where: { villageId, isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    prisma.galleryImage.findMany({ where: { villageId }, orderBy: { sortOrder: 'asc' }, take: 12 }),
    prisma.award.findMany({ where: { villageId, isActive: true }, orderBy: [{ sortOrder: 'asc' }, { year: 'desc' }] }),
    prisma.financialReport.findMany({ where: { villageId, isPublished: true }, orderBy: { financialYear: 'desc' } }),
  ]);

  const contentMap = {};
  contents.forEach((c) => { contentMap[c.section] = c.content; });

  const { id, name, slug, subdomain, status, theme, settings, tehsil } = req.tenant;

  sendResponse(res, 200, {
    village: { id, name, slug, subdomain, status, theme, settings, tehsil },
    content: contentMap,
    heroSlides,
    members,
    notices,
    programs,
    schemes,
    gallery,
    awards,
    financialReports,
  }, 'Village full data retrieved');
});

export const getHeroSlides = catchAsync(async (req, res) => {
  const villageId = ensureVillageTenant(req);
  const slides = await prisma.heroSlide.findMany({
    where: { villageId, isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
  sendResponse(res, 200, slides, 'Hero slides retrieved');
});

export const getContentSection = catchAsync(async (req, res) => {
  const villageId = ensureVillageTenant(req);
  const content = await contentService.findBySection(villageId, req.params.section);
  sendResponse(res, 200, content?.content || {}, 'Content retrieved');
});

export const getMembers = catchAsync(async (req, res) => {
  const villageId = ensureVillageTenant(req);
  const { type } = req.query;
  const where = { villageId, isActive: true };
  if (type) where.type = type;

  const members = await prisma.member.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  });
  sendResponse(res, 200, members, 'Members retrieved');
});

export const getNotices = catchAsync(async (req, res) => {
  const villageId = ensureVillageTenant(req);
  const { page = 1, limit = 10, category } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where = { villageId, isPublished: true };
  if (category) where.category = category;

  where.OR = [
    { expiresAt: null },
    { expiresAt: { gte: new Date() } },
  ];

  const [notices, total] = await Promise.all([
    prisma.notice.findMany({
      where,
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
      skip,
      take: parseInt(limit),
    }),
    prisma.notice.count({ where }),
  ]);

  sendResponse(res, 200, {
    notices,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  }, 'Notices retrieved');
});

export const getPopupNotices = catchAsync(async (req, res) => {
  const villageId = ensureVillageTenant(req);
  const popups = await prisma.notice.findMany({
    where: {
      villageId,
      isPublished: true,
      isPopup: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  sendResponse(res, 200, popups, 'Popup notices retrieved');
});

export const getPrograms = catchAsync(async (req, res) => {
  const villageId = ensureVillageTenant(req);
  const { page = 1, limit = 10, category } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where = { villageId, isPublished: true };
  if (category) where.category = category;

  const [programs, total] = await Promise.all([
    prisma.program.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.program.count({ where }),
  ]);

  sendResponse(res, 200, {
    programs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  }, 'Programs retrieved');
});

export const getProgramById = catchAsync(async (req, res) => {
  const villageId = ensureVillageTenant(req);
  const program = await prisma.program.findFirst({
    where: { id: req.params.id, villageId, isPublished: true },
  });
  if (!program) throw new ApiError(404, 'Program not found');
  sendResponse(res, 200, program, 'Program retrieved');
});

export const getSchemes = catchAsync(async (req, res) => {
  const villageId = ensureVillageTenant(req);
  const { page = 1, limit = 10, category } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where = { villageId, isActive: true };
  if (category) where.category = category;

  const [schemes, total] = await Promise.all([
    prisma.scheme.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.scheme.count({ where }),
  ]);

  sendResponse(res, 200, {
    schemes,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  }, 'Schemes retrieved');
});

export const getSchemeById = catchAsync(async (req, res) => {
  const villageId = ensureVillageTenant(req);
  const scheme = await prisma.scheme.findFirst({
    where: { id: req.params.id, villageId, isActive: true },
  });
  if (!scheme) throw new ApiError(404, 'Scheme not found');
  sendResponse(res, 200, scheme, 'Scheme retrieved');
});

export const getGallery = catchAsync(async (req, res) => {
  const villageId = ensureVillageTenant(req);
  const { category } = req.query;
  const where = { villageId };
  if (category) where.category = category;

  const images = await prisma.galleryImage.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
  });

  const categories = await prisma.galleryImage.findMany({
    where: { villageId },
    select: { category: true },
    distinct: ['category'],
  });

  sendResponse(res, 200, {
    images,
    categories: categories.map((c) => c.category),
  }, 'Gallery retrieved');
});

export const submitContactForm = catchAsync(async (req, res) => {
  const villageId = ensureVillageTenant(req);
  const submission = await contactSubmissionService.create(villageId, req.body);
  sendResponse(res, 201, submission, 'Message sent successfully');
});

export const submitComplaint = catchAsync(async (req, res) => {
  const villageId = ensureVillageTenant(req);
  const complaint = await complaintService.create(villageId, req.body);
  sendResponse(res, 201, complaint, 'Complaint submitted successfully');
});

export const submitTaxPayment = catchAsync(async (req, res) => {
  const villageId = ensureVillageTenant(req);
  const payment = await taxService.create(villageId, req.body);
  sendResponse(res, 201, payment, 'Tax payment submitted successfully');
});

export const getSeoData = catchAsync(async (req, res) => {
  const villageId = ensureVillageTenant(req);
  const seoContent = await contentService.findBySection(villageId, 'seo');
  const { name, slug, subdomain, tehsil } = req.tenant;

  sendResponse(res, 200, {
    village: { name, slug, subdomain, tehsil },
    seo: seoContent?.content || {},
    pages: [
      { path: '/', title: `${name} - मुख्यपृष्ठ`, priority: 1.0, changeFreq: 'daily' },
      { path: '/about', title: `आमच्याबद्दल - ${name}`, priority: 0.8, changeFreq: 'monthly' },
      { path: '/notices', title: `सूचना - ${name}`, priority: 0.8, changeFreq: 'daily' },
      { path: '/programs', title: `विकास कामे - ${name}`, priority: 0.7, changeFreq: 'weekly' },
      { path: '/schemes', title: `शासकीय योजना - ${name}`, priority: 0.7, changeFreq: 'monthly' },
      { path: '/administration', title: `ग्रामपंचायत प्रशासन - ${name}`, priority: 0.6, changeFreq: 'monthly' },
      { path: '/gallery', title: `फोटो गॅलरी - ${name}`, priority: 0.6, changeFreq: 'weekly' },
      { path: '/services', title: `नागरिक सेवा - ${name}`, priority: 0.7, changeFreq: 'monthly' },
      { path: '/important', title: `महत्वाचे - ${name}`, priority: 0.5, changeFreq: 'monthly' },
      { path: '/contact', title: `संपर्क - ${name}`, priority: 0.6, changeFreq: 'monthly' },
      { path: '/awards', title: `पुरस्कार - ${name}`, priority: 0.6, changeFreq: 'monthly' },
    ],
  }, 'SEO data retrieved');
});

export const getAwards = catchAsync(async (req, res) => {
  const villageId = ensureVillageTenant(req);
  const awards = await awardService.findAllPublic(villageId);
  sendResponse(res, 200, awards, 'Awards retrieved');
});

export const getFinancialReports = catchAsync(async (req, res) => {
  const villageId = ensureVillageTenant(req);
  const reports = await financialReportService.findAllPublic(villageId);
  sendResponse(res, 200, reports, 'Financial reports retrieved');
});

export const getGramsabhas = catchAsync(async (req, res) => {
  const villageId = ensureVillageTenant(req);
  const gramsabhas = await gramsabhaService.findAllPublic(villageId);
  sendResponse(res, 200, gramsabhas, 'Gramsabhas retrieved');
});

export const getSchools = catchAsync(async (req, res) => {
  const villageId = ensureVillageTenant(req);
  const schools = await schoolService.findAllPublic(villageId);
  sendResponse(res, 200, schools, 'Schools retrieved');
});

export const getDevelopmentWorks = catchAsync(async (req, res) => {
  const villageId = ensureVillageTenant(req);
  const works = await developmentWorkService.findAllPublic(villageId, req.query);
  sendResponse(res, 200, works, 'Development works retrieved');
});

// Global settings (shared across all villages - managed by superadmin)
export const getPublicGlobalSettings = catchAsync(async (req, res) => {
  const settings = await prisma.globalSetting.findMany();
  const map = {};
  for (const s of settings) map[s.key] = s.value;
  sendResponse(res, 200, map, 'Global settings retrieved');
});

// OG/SEO HTML for crawlers (Googlebot, Bingbot, WhatsApp, Facebook, etc.)
// Returns a fully-rendered HTML page with all meta tags; humans are redirected to the SPA.
export const getOgPreview = catchAsync(async (req, res) => {
  const villageId = ensureVillageTenant(req);

  const { name, settings, tehsil } = req.tenant;
  const protocol = (req.headers['x-forwarded-proto'] || req.protocol || 'https').split(',')[0].trim();
  const host = req.headers['x-forwarded-host'] || req.headers.host || '';
  const siteUrl = `${protocol}://${host}`;

  // Try to load custom SEO content saved in the village admin panel
  const seoContent = await contentService.findBySection(villageId, 'seo').catch(() => null);
  const seo = seoContent?.content || {};

  // Logo URL
  const rawLogo = settings?.logoUrl || null;
  const logoUrl = rawLogo
    ? (rawLogo.startsWith('http') ? rawLogo : `${siteUrl}${rawLogo}`)
    : null;

  const tehsilName = tehsil?.name || '';
  const districtName = tehsil?.district || '';
  const stateName = tehsil?.state || 'महाराष्ट्र';
  const locationParts = [tehsilName, districtName].filter(Boolean).join(', ');

  // Title & description — prefer admin-configured values, else auto-generate
  const title = seo.title
    ? String(seo.title)
    : `ग्रामपंचायत ${name}${locationParts ? ` - ${locationParts}` : ''}`;
  const description = seo.description
    ? String(seo.description)
    : `${name} ग्रामपंचायतीची अधिकृत वेबसाईट. ता. ${tehsilName}, जि. ${districtName}, ${stateName}. नागरिक सेवा, शासकीय योजना, सूचना, विकासकामे आणि बरेच काही.`;
  const keywords = seo.keywords
    ? String(seo.keywords)
    : `ग्रामपंचायत ${name}, ${name}, ${tehsilName}, ${districtName}, grampanchayat, maharashtra, village, ${req.tenant.slug || ''}`;

  const canonicalUrl = `${siteUrl}/`;

  // JSON-LD structured data (GovernmentOrganization)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: `ग्रामपंचायत ${name}`,
    url: canonicalUrl,
    logo: logoUrl || undefined,
    description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: name,
      addressRegion: districtName || 'Maharashtra',
      addressCountry: 'IN',
    },
    areaServed: { '@type': 'Place', name },
    sameAs: [],
  };

  // Safely encode values for HTML attributes
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const html = `<!DOCTYPE html>
<html lang="mr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <meta name="keywords" content="${esc(keywords)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${esc(canonicalUrl)}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${esc(canonicalUrl)}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:locale" content="mr_IN" />
  <meta property="og:site_name" content="${esc(`ग्रामपंचायत ${name}`)}" />${logoUrl ? `\n  <meta property="og:image" content="${esc(logoUrl)}" />\n  <meta property="og:image:alt" content="${esc(`ग्रामपंचायत ${name} - Logo`)}" />` : ''}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="${logoUrl ? 'summary_large_image' : 'summary'}" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />${logoUrl ? `\n  <meta name="twitter:image" content="${esc(logoUrl)}" />` : ''}

  <!-- Geographic meta -->
  <meta name="geo.region" content="IN-MH" />
  <meta name="geo.placename" content="${esc(name)}" />
  <meta http-equiv="content-language" content="mr" />

  <!-- Sitemap -->
  <link rel="sitemap" type="application/xml" href="${esc(siteUrl)}/sitemap.xml" />

  <!-- JSON-LD structured data -->
  <script type="application/ld+json">${JSON.stringify(structuredData)}</script>

  <!-- Redirect human visitors to the React SPA -->
  <meta http-equiv="refresh" content="0;url=/" />
</head>
<body>
  <p>Redirecting to <a href="${esc(canonicalUrl)}">${esc(title)}</a>…</p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  res.status(200).send(html);
});

// Dynamic XML sitemap — served at /sitemap.xml (proxied by nginx)
export const getSitemap = catchAsync(async (req, res) => {
  ensureVillageTenant(req);

  const { name } = req.tenant;
  const protocol = (req.headers['x-forwarded-proto'] || req.protocol || 'https').split(',')[0].trim();
  const host = req.headers['x-forwarded-host'] || req.headers.host || '';
  const siteUrl = `${protocol}://${host}`;
  const now = new Date().toISOString().split('T')[0];

  const pages = [
    { path: '/',               priority: '1.0', changefreq: 'daily'   },
    { path: '/about',          priority: '0.8', changefreq: 'monthly' },
    { path: '/notices',        priority: '0.8', changefreq: 'daily'   },
    { path: '/programs',       priority: '0.7', changefreq: 'weekly'  },
    { path: '/schemes',        priority: '0.7', changefreq: 'monthly' },
    { path: '/administration', priority: '0.6', changefreq: 'monthly' },
    { path: '/gallery',        priority: '0.6', changefreq: 'weekly'  },
    { path: '/services',       priority: '0.7', changefreq: 'monthly' },
    { path: '/contact',        priority: '0.6', changefreq: 'monthly' },
    { path: '/awards',         priority: '0.5', changefreq: 'monthly' },
  ];

  const urlTags = pages
    .map(
      ({ path, priority, changefreq }) =>
        `  <url>\n    <loc>${siteUrl}${path}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urlTags}\n</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.status(200).send(xml);
});

// Dynamic robots.txt — served at /robots.txt (proxied by nginx)
export const getRobotsTxt = catchAsync(async (req, res) => {
  ensureVillageTenant(req);

  const protocol = (req.headers['x-forwarded-proto'] || req.protocol || 'https').split(',')[0].trim();
  const host = req.headers['x-forwarded-host'] || req.headers.host || '';
  const siteUrl = `${protocol}://${host}`;

  const txt = `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nDisallow: /citizen/\n\nSitemap: ${siteUrl}/sitemap.xml\n`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.status(200).send(txt);
});
