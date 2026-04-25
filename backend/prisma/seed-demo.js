/**
 * Demo data seed for Sonimoha village
 * Processes images from demo-images folder, populates all tables
 * Usage: node prisma/seed-demo.js
 */
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const VILLAGE_SLUG = 'sonimoha';
const UPLOADS_ROOT = path.resolve(__dirname, '../uploads');
const DEMO_IMAGES = path.resolve(__dirname, '../../../demo-images');

// ── Image Processing Helpers ──────────────────────────────────

function hex() { return crypto.randomBytes(8).toString('hex'); }

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function processImage(inputPath, section, options = {}) {
  const { width = 800, height = 600, quality = 78 } = options;
  const outDir = path.join(UPLOADS_ROOT, VILLAGE_SLUG, section);
  await ensureDir(outDir);
  const filename = `${section}_${Date.now()}_${hex()}.webp`;
  const outPath = path.join(outDir, filename);

  await sharp(inputPath)
    .rotate()
    .resize(width, height, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toFile(outPath);

  return `/uploads/${VILLAGE_SLUG}/${section}/${filename}`;
}

async function processGalleryImage(inputPath) {
  const outDir = path.join(UPLOADS_ROOT, VILLAGE_SLUG, 'gallery');
  await ensureDir(outDir);

  const thumbName = `gallery_thumb_${Date.now()}_${hex()}.webp`;
  const fullName = `gallery_full_${Date.now() + 1}_${hex()}.webp`;

  await sharp(inputPath).rotate()
    .resize(400, 300, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 75 }).toFile(path.join(outDir, thumbName));

  // small delay to get unique timestamp
  await new Promise(r => setTimeout(r, 5));

  await sharp(inputPath).rotate()
    .resize(1200, 900, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 }).toFile(path.join(outDir, fullName));

  return {
    thumb: `/uploads/${VILLAGE_SLUG}/gallery/${thumbName}`,
    full: `/uploads/${VILLAGE_SLUG}/gallery/${fullName}`,
  };
}

// ── Main Seed Function ──────────────────────────────────────

async function main() {
  // Find village
  const village = await prisma.village.findUnique({ where: { slug: VILLAGE_SLUG } });
  if (!village) {
    console.error(`Village '${VILLAGE_SLUG}' not found! Create it first via SuperAdmin.`);
    process.exit(1);
  }
  const villageId = village.id;
  console.log(`🏘️  Seeding demo data for: ${village.name} (${villageId})`);

  // ── 1. Process Hero Images ──────────────────────────────
  console.log('📸 Processing hero slides...');
  const heroImages = [
    { file: 'igatpuri-kasara-ghat-monsoon.avif', alt: 'इगतपुरी - कसारा घाट पावसाळा' },
    { file: 'mahabaleshwar.webp', alt: 'महाबळेश्वर - निसर्गसौंदर्य' },
    { file: 'city/nashik.webp', alt: 'नाशिक - गोदावरी तीर' },
    { file: 'city/pune.webp', alt: 'पुणे - ऐतिहासिक शहर' },
  ];

  const heroUrls = [];
  for (const h of heroImages) {
    const inputPath = path.join(DEMO_IMAGES, h.file);
    try {
      await fs.access(inputPath);
      const url = await processImage(inputPath, 'hero', { width: 1920, height: 800, quality: 80 });
      heroUrls.push({ url, alt: h.alt });
    } catch (e) {
      console.warn(`  ⚠ Hero image not found: ${h.file}`);
    }
  }

  // ── 2. Process Team/Member Photos ──────────────────────
  console.log('👥 Processing member photos...');
  const memberPhotos = {};
  const memberFiles = {
    sarpanch: 'operator shinde.jpeg',
    upsarpanch: 'ajayWhatsApp Image 2026-01-01 at 1.27.05 PM.jpeg',
  };
  for (const [key, file] of Object.entries(memberFiles)) {
    const inputPath = path.join(DEMO_IMAGES, file);
    try {
      await fs.access(inputPath);
      memberPhotos[key] = await processImage(inputPath, 'team', { width: 400, height: 400, quality: 80 });
    } catch (e) {
      console.warn(`  ⚠ Member photo not found: ${file}`);
    }
  }

  // ── 3. Process Gallery Images ──────────────────────────
  console.log('🖼️  Processing gallery images...');
  const galleryFiles = [
    { file: 'DSC_5354[1].jpg', title: 'गाव मंदिर परिसर', caption: 'ग्रामदेवता मंदिर', category: 'heritage' },
    { file: 'DSC_5354[1] (1).jpg', title: 'मंदिर सभोवतालचा परिसर', caption: 'सुशोभित मंदिर क्षेत्र', category: 'heritage' },
    { file: 'Shirdi_Saibaba.jpg', title: 'साईबाबा मंदिर', caption: 'शिर्डी साईबाबा', category: 'heritage' },
    { file: 'WhatsApp Image 2025-12-27 at 5.00.57 PM.jpeg', title: 'ग्रामसभा बैठक', caption: 'ग्रामपंचायत बैठक', category: 'events' },
    { file: 'WhatsApp Image 2025-12-27 at 5.02.47 PM.jpeg', title: 'विकास कामे', caption: 'रस्ता बांधकाम', category: 'development' },
    { file: 'WhatsApp Image 2025-12-27 at 5.04.09 PM.jpeg', title: 'शाळा परिसर', caption: 'जिल्हा परिषद शाळा', category: 'infrastructure' },
    { file: 'WhatsApp Image 2025-12-27 at 5.04.48 PM.jpeg', title: 'गावाचे दृश्य', caption: 'गावाचा विहंगम दृश्य', category: 'nature' },
    { file: 'nashik.jpeg', title: 'नाशिक शहर दृश्य', caption: 'जवळचे जिल्हा मुख्यालय', category: 'general' },
    { file: 'pune.jpg', title: 'पुणे शहर', caption: 'विभागीय मुख्यालय', category: 'general' },
    { file: 'mumbai.jpg', title: 'मुंबई शहर', caption: 'राज्याची राजधानी', category: 'general' },
  ];

  const galleryData = [];
  for (const g of galleryFiles) {
    const inputPath = path.join(DEMO_IMAGES, g.file);
    try {
      await fs.access(inputPath);
      const urls = await processGalleryImage(inputPath);
      galleryData.push({ ...g, ...urls });
    } catch (e) {
      console.warn(`  ⚠ Gallery image not found: ${g.file}`);
    }
  }

  // ── 4. Process Program Images ──────────────────────────
  console.log('🏗️  Processing program images...');
  const programImages = {};
  const programFiles = {
    road: 'WhatsApp Image 2025-12-27 at 5.02.47 PM.jpeg',
    school: 'WhatsApp Image 2025-12-27 at 5.04.09 PM.jpeg',
    water: 'WhatsApp Image 2025-12-27 at 5.04.48 PM.jpeg',
  };
  for (const [key, file] of Object.entries(programFiles)) {
    const inputPath = path.join(DEMO_IMAGES, file);
    try {
      await fs.access(inputPath);
      programImages[key] = await processImage(inputPath, 'programs', { width: 800, height: 600 });
    } catch {
      console.warn(`  ⚠ Program image not found: ${file}`);
    }
  }

  // ── 5. Clear existing data ──────────────────────────────
  console.log('🧹 Clearing existing demo data...');
  await prisma.award.deleteMany({ where: { villageId } });
  await prisma.contactSubmission.deleteMany({ where: { villageId } });
  await prisma.application.deleteMany({ where: { villageId } });
  await prisma.galleryImage.deleteMany({ where: { villageId } });
  await prisma.heroSlide.deleteMany({ where: { villageId } });
  await prisma.program.deleteMany({ where: { villageId } });
  await prisma.scheme.deleteMany({ where: { villageId } });
  await prisma.notice.deleteMany({ where: { villageId } });
  await prisma.member.deleteMany({ where: { villageId } });
  await prisma.villageContent.deleteMany({ where: { villageId } });

  // ── 6. Insert Hero Slides ──────────────────────────────
  console.log('🎠 Creating hero slides...');
  for (let i = 0; i < heroUrls.length; i++) {
    await prisma.heroSlide.create({
      data: {
        villageId,
        imageUrl: heroUrls[i].url,
        altText: heroUrls[i].alt,
        sortOrder: i,
        isActive: true,
      },
    });
  }
  console.log(`  ✓ ${heroUrls.length} hero slides created`);

  // ── 7. Insert Members ──────────────────────────────────
  console.log('👥 Creating members...');
  const members = [
    {
      name: 'श्री. शिंदे बाळासाहेब',
      designation: 'सरपंच',
      type: 'sarpanch',
      phone: '9876543210',
      email: 'sarpanch@sonimoha.gpmh.local',
      photoUrl: memberPhotos.sarpanch || null,
      bio: 'सोनीमोहा ग्रामपंचायतीचे नियमित सरपंच. गावाच्या विकासासाठी अथक प्रयत्नशील.',
      backContent: { qualification: 'बी.ए.', experience: '10 वर्षे', vision: 'स्वच्छ व विकसित गाव' },
      sortOrder: 0,
    },
    {
      name: 'श्री. अजय पाटील',
      designation: 'उपसरपंच',
      type: 'upsarpanch',
      phone: '9876543211',
      email: null,
      photoUrl: memberPhotos.upsarpanch || null,
      bio: 'ग्रामपंचायत उपसरपंच. शिक्षण व पायाभूत सुविधांच्या विकासात रस.',
      backContent: { qualification: 'बी.कॉम.', experience: '5 वर्षे', vision: 'शिक्षणात प्रगती' },
      sortOrder: 1,
    },
    {
      name: 'श्री. राजेश देशमुख',
      designation: 'ग्रामसेवक',
      type: 'gramsevak',
      phone: '9876543212',
      email: 'gramsevak@sonimoha.gpmh.local',
      photoUrl: null,
      bio: 'सरकारी नियुक्त ग्रामसेवक. प्रशासकीय कामकाजाचा दीर्घ अनुभव.',
      backContent: { qualification: 'एम.ए., बी.एड.', experience: '15 वर्षे' },
      sortOrder: 2,
    },
    {
      name: 'श्रीमती. सुनीता जाधव',
      designation: 'सदस्य',
      type: 'member',
      phone: '9876543213',
      photoUrl: null,
      bio: 'महिला व बालकल्याण समिती सदस्य.',
      sortOrder: 3,
    },
    {
      name: 'श्री. विनोद गायकवाड',
      designation: 'सदस्य',
      type: 'member',
      phone: '9876543214',
      photoUrl: null,
      bio: 'पाणीपुरवठा व स्वच्छता समिती सदस्य.',
      sortOrder: 4,
    },
    {
      name: 'श्रीमती. लता शिरसाट',
      designation: 'सदस्य',
      type: 'member',
      phone: '9876543215',
      photoUrl: null,
      bio: 'शिक्षण समिती सदस्य.',
      sortOrder: 5,
    },
    {
      name: 'श्री. प्रकाश भोसले',
      designation: 'सदस्य',
      type: 'member',
      phone: '9876543216',
      photoUrl: null,
      bio: 'रस्ते व बांधकाम समिती सदस्य.',
      sortOrder: 6,
    },
  ];

  for (const m of members) {
    await prisma.member.create({ data: { villageId, ...m, isActive: true } });
  }
  console.log(`  ✓ ${members.length} members created`);

  // ── 8. Insert Notices ──────────────────────────────────
  console.log('📋 Creating notices...');
  const notices = [
    {
      title: 'ग्रामसभा बैठक सूचना',
      content: 'सर्व ग्रामस्थांना कळविण्यात येते की, ग्रामपंचायत सोनीमोहा अंतर्गत ग्रामसभा बैठक दि. १५/०४/२०२६ रोजी सकाळी ११ वाजता ग्रामपंचायत कार्यालयात आयोजित करण्यात आली आहे. सर्वांनी उपस्थित राहावे.',
      category: 'general',
      priority: 'high',
      isPopup: true,
      isPublished: true,
    },
    {
      title: 'पाणीपुरवठा वेळापत्रक बदल',
      content: 'सोनीमोहा गावाच्या पाणीपुरवठा वेळापत्रकात बदल करण्यात आला आहे. सकाळी ६ ते ८ व संध्याकाळी ५ ते ७ या वेळेत पाणीपुरवठा होईल.',
      category: 'general',
      priority: 'normal',
      isPopup: false,
      isPublished: true,
    },
    {
      title: 'स्वच्छता अभियान',
      content: 'दि. २०/०४/२०२६ रोजी गावात स्वच्छता अभियान राबवण्यात येणार आहे. सर्व ग्रामस्थांनी सहभागी व्हावे. सकाळी ७ वाजता ग्रामपंचायत कार्यालयासमोर जमा व्हावे.',
      category: 'events',
      priority: 'normal',
      isPopup: false,
      isPublished: true,
    },
    {
      title: 'जन्म-मृत्यू नोंदणी शिबीर',
      content: 'गावातील प्रलंबित जन्म-मृत्यू नोंदणीसाठी विशेष शिबीर आयोजित करण्यात आले आहे. दि. २२/०४/२०२६ रोजी ग्रामपंचायत कार्यालयात. आवश्यक कागदपत्रे आणावीत.',
      category: 'services',
      priority: 'normal',
      isPopup: false,
      isPublished: true,
    },
    {
      title: 'विजेचे बिल भरणा',
      content: 'सर्व ग्रामस्थांनी त्यांचे प्रलंबित विजेचे बिल भरावे. देय तारखेनंतर दंड आकारला जाईल.',
      category: 'general',
      priority: 'low',
      isPopup: false,
      isPublished: true,
    },
    {
      title: '१५ ऑगस्ट स्वातंत्र्यदिन कार्यक्रम',
      content: 'स्वातंत्र्यदिनी ध्वजवंदन कार्यक्रम सकाळी ८ वाजता शाळा मैदानात होईल. सर्व ग्रामस्थांनी उपस्थित राहावे.',
      category: 'events',
      priority: 'high',
      isPopup: true,
      isPublished: true,
    },
  ];

  for (const n of notices) {
    await prisma.notice.create({
      data: { villageId, ...n, publishedAt: new Date() },
    });
  }
  console.log(`  ✓ ${notices.length} notices created`);

  // ── 9. Insert Gallery Images ───────────────────────────
  console.log('🖼️  Creating gallery records...');
  for (let i = 0; i < galleryData.length; i++) {
    const g = galleryData[i];
    await prisma.galleryImage.create({
      data: {
        villageId,
        title: g.title,
        imageUrl: g.full, // Use full-size image as primary URL
        caption: g.caption,
        category: g.category,
        sortOrder: i,
      },
    });
  }
  console.log(`  ✓ ${galleryData.length} gallery images created`);

  // ── 10. Insert Programs ────────────────────────────────
  console.log('🏗️  Creating programs...');
  const programs = [
    {
      title: 'ग्रामीण रस्ता सुधारणा',
      description: 'गावातील मुख्य रस्त्यांचे डांबरीकरण व दुरुस्ती. प्रधानमंत्री ग्रामसडक योजना अंतर्गत ३ किमी रस्ता बांधकाम पूर्ण.',
      category: 'पायाभूत सुविधा',
      location: 'सोनीमोहा मुख्य रस्ता',
      date: new Date('2026-01-15'),
      images: programImages.road ? [programImages.road] : [],
      highlights: ['३ किमी रस्ता डांबरीकरण', 'गटर बांधकाम', 'रस्ता रुंदीकरण'],
      result: 'रस्ता बांधकाम यशस्वीरित्या पूर्ण. ग्रामस्थांना दळणवळणात सुधारणा.',
      isPublished: true,
    },
    {
      title: 'शाळा दुरुस्ती व रंगरंगोटी',
      description: 'जिल्हा परिषद प्राथमिक शाळेची दुरुस्ती, नवीन रंगरंगोटी व फर्निचर. विद्यार्थ्यांसाठी स्वच्छ व सुंदर वातावरण.',
      category: 'शिक्षण',
      location: 'जि.प. शाळा, सोनीमोहा',
      date: new Date('2025-11-20'),
      images: programImages.school ? [programImages.school] : [],
      highlights: ['शाळा रंगोटी', 'नवीन बेंच व डेस्क', 'स्वच्छतागृह बांधकाम'],
      result: '१५० विद्यार्थ्यांना सुधारित शिक्षण सुविधा.',
      isPublished: true,
    },
    {
      title: 'पाणी पुरवठा योजना',
      description: 'जल जीवन मिशन अंतर्गत गावात नळ पाणी पुरवठा योजना. प्रत्येक घरात शुद्ध पिण्याचे पाणी.',
      category: 'पाणीपुरवठा',
      location: 'संपूर्ण गाव',
      date: new Date('2026-02-10'),
      images: programImages.water ? [programImages.water] : [],
      highlights: ['पाण्याची टाकी बांधकाम', 'पाइपलाइन अंथरुण', 'प्रत्येक घरात नळ कनेक्शन'],
      result: '३५० कुटुंबांना नळ पाणी पुरवठा सुरू.',
      isPublished: true,
    },
    {
      title: 'LED पथदिवे बसवणे',
      description: 'गावातील सर्व रस्त्यांवर ऊर्जा बचत LED पथदिवे बसवणे. स्मार्ट गाव उपक्रमाचा भाग.',
      category: 'पायाभूत सुविधा',
      location: 'सर्व गावठाण रस्ते',
      date: new Date('2025-09-05'),
      images: [],
      highlights: ['५० LED पथदिवे', '६०% ऊर्जा बचत', 'सोलर पॅनल'],
      result: 'गावातील सर्व रस्ते प्रकाशित. रात्रीच्या सुरक्षिततेत वाढ.',
      isPublished: true,
    },
    {
      title: 'सामुदायिक शौचालय बांधकाम',
      description: 'स्वच्छ भारत मिशन अंतर्गत गावात २ सामुदायिक शौचालय बांधकाम.',
      category: 'स्वच्छता',
      location: 'गावचौक व बस स्टॅण्ड',
      date: new Date('2025-07-20'),
      images: [],
      highlights: ['२ सामुदायिक शौचालय', 'मुला-मुलींसाठी स्वतंत्र', 'नियमित स्वच्छता'],
      result: 'हागणदारीमुक्त गाव दर्जा प्राप्त.',
      isPublished: true,
    },
  ];

  for (const p of programs) {
    await prisma.program.create({ data: { villageId, ...p } });
  }
  console.log(`  ✓ ${programs.length} programs created`);

  // ── 11. Insert Schemes ─────────────────────────────────
  console.log('📜 Creating schemes...');
  const schemes = [
    {
      title: 'प्रधानमंत्री आवास योजना (ग्रामीण)',
      description: 'गरीब कुटुंबांना पक्के घर बांधण्यासाठी आर्थिक मदत. प्रत्येक लाभार्थीला १.२० लाख रुपये अनुदान.',
      category: 'गृहनिर्माण',
      benefits: ['१.२० लाख रुपये अनुदान', 'शौचालय बांधकामासाठी अतिरिक्त १२,००० रुपये', 'मनरेगा अंतर्गत ९० दिवसांचे रोजगार'],
      eligibility: ['बेघर कुटुंब', 'कच्चे घर असलेले कुटुंब', 'बीपीएल यादीत नाव', 'आधार कार्ड अनिवार्य'],
      documents: ['आधार कार्ड', 'रेशन कार्ड', 'जमिनीचा ७/१२ उतारा', 'बँक पासबुक', 'फोटो'],
      applicationProcess: ['ग्रामपंचायत कार्यालयात अर्ज करा', 'ग्रामसभेत मंजुरी', 'तहसील कार्यालयात सत्यापन', 'बँक खात्यात अनुदान जमा'],
      contactInfo: 'ग्रामसेवक - 9876543212',
      budget: '₹ १.२० लाख प्रति घर',
      beneficiaries: '२५ कुटुंबे',
      isActive: true,
    },
    {
      title: 'महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार हमी योजना',
      description: 'ग्रामीण भागातील कुटुंबांना वर्षातून १०० दिवसांचे हमी रोजगार. कुशल व अकुशल कामगारांसाठी.',
      category: 'रोजगार',
      benefits: ['१०० दिवसांचे रोजगार हमी', 'किमान वेतन दर ₹ ३४८ प्रतिदिन', 'बेरोजगारी भत्ता'],
      eligibility: ['ग्रामीण कुटुंब', 'जॉब कार्ड आवश्यक', 'शारीरिक काम करण्यास तयार'],
      documents: ['जॉब कार्ड', 'आधार कार्ड', 'बँक पासबुक'],
      applicationProcess: ['ग्रामपंचायत कार्यालयात जॉब कार्ड काढा', 'कामासाठी अर्ज करा', '१५ दिवसात काम मिळेल'],
      contactInfo: 'ग्रामसेवक - 9876543212',
      budget: '₹ ५ लाख वार्षिक',
      beneficiaries: '१५० कुटुंबे',
      isActive: true,
    },
    {
      title: 'निर्मल भारत अभियान',
      description: 'वैयक्तिक शौचालय बांधकामासाठी अनुदान. स्वच्छ भारत मिशन अंतर्गत प्रत्येक घरात शौचालय.',
      category: 'स्वच्छता',
      benefits: ['₹ १२,००० अनुदान', 'तांत्रिक मार्गदर्शन', 'बांधकाम साहित्य'],
      eligibility: ['शौचालय नसलेले कुटुंब', 'बीपीएल कुटुंब प्राधान्य'],
      documents: ['आधार कार्ड', 'रेशन कार्ड', 'फोटो'],
      applicationProcess: ['ग्रामपंचायतीत अर्ज करा', 'तपासणी व सत्यापन', 'अनुदान मंजूर'],
      contactInfo: 'ग्रामसेवक - 9876543212',
      budget: '₹ १२,००० प्रति शौचालय',
      beneficiaries: '५० कुटुंबे',
      isActive: true,
    },
    {
      title: 'शेतकरी सन्मान निधी योजना',
      description: 'प्रधानमंत्री किसान सन्मान निधी योजना - प्रत्येक शेतकऱ्याला वार्षिक ₹ ६,००० आर्थिक मदत.',
      category: 'शेती',
      benefits: ['वार्षिक ₹ ६,००० (३ हप्त्यांत)', 'थेट बँक खात्यात जमा', 'कोणताही खर्च नाही'],
      eligibility: ['शेतजमीन असलेले शेतकरी', '२ हेक्टरपर्यंत जमीन', 'आधार कार्ड लिंक बँक खाते'],
      documents: ['आधार कार्ड', '७/१२ उतारा', 'बँक पासबुक', 'मोबाइल नंबर'],
      applicationProcess: ['ग्रामपंचायतीत अर्ज करा', 'तलाठ्याकडे सत्यापन', 'ऑनलाइन नोंदणी'],
      contactInfo: 'तलाठी कार्यालय',
      budget: '₹ ६,००० प्रति शेतकरी',
      beneficiaries: '२०० शेतकरी',
      isActive: true,
    },
  ];

  for (const s of schemes) {
    await prisma.scheme.create({ data: { villageId, ...s } });
  }
  console.log(`  ✓ ${schemes.length} schemes created`);

  // ── 12. Insert Awards ──────────────────────────────────
  console.log('🏆 Creating awards...');
  const awards = [
    {
      title: 'निर्मल ग्राम पुरस्कार',
      description: 'संपूर्ण स्वच्छता अभियानात उत्कृष्ट कामगिरी बद्दल राष्ट्रपतींच्या हस्ते प्रदान.',
      year: 2024,
      category: 'स्वच्छता',
      awardedBy: 'भारत सरकार',
      sortOrder: 0,
      isActive: true,
    },
    {
      title: 'तंटामुक्त गाव पुरस्कार',
      description: 'गावातील शांतता व सलोखा राखल्याबद्दल जिल्हा स्तरीय पुरस्कार.',
      year: 2025,
      category: 'प्रशासन',
      awardedBy: 'जिल्हाधिकारी कार्यालय',
      sortOrder: 1,
      isActive: true,
    },
    {
      title: 'राष्ट्रीय पंचायत पुरस्कार',
      description: 'सर्वोत्तम ग्रामपंचायत म्हणून मान्यता. विकासकामे, पारदर्शकता व लोकसहभाग.',
      year: 2025,
      category: 'विकास',
      awardedBy: 'पंचायत राज मंत्रालय',
      sortOrder: 2,
      isActive: true,
    },
    {
      title: 'आदर्श गाव पुरस्कार',
      description: 'शिक्षण, आरोग्य, स्वच्छता व पायाभूत सुविधांमध्ये उत्कृष्ट कामगिरी.',
      year: 2023,
      category: 'सामाजिक',
      awardedBy: 'महाराष्ट्र शासन',
      sortOrder: 3,
      isActive: true,
    },
  ];

  for (const a of awards) {
    await prisma.award.create({ data: { villageId, ...a } });
  }
  console.log(`  ✓ ${awards.length} awards created`);

  // ── 13. Insert Content Sections ────────────────────────
  console.log('📄 Creating content sections...');

  const contentSections = {
    about: {
      title: 'सोनीमोहा गावाबद्दल',
      description: 'सोनीमोहा हे महाराष्ट्रातील एक सुंदर व विकसित गाव आहे. निसर्गरम्य परिसर, समृद्ध वारसा आणि प्रगतीशील विचारधारा यामुळे गाव सर्वत्र प्रसिद्ध आहे.',
      vision: 'स्वच्छ, सुंदर, शिक्षित आणि आत्मनिर्भर गाव बनवणे हे आमचे ध्येय आहे.',
      mission: 'प्रत्येक नागरिकाचे जीवनमान उंचावण्यासाठी, शिक्षण, आरोग्य, रोजगार व पायाभूत सुविधांचा विकास करणे.',
      history: 'सोनीमोहा गावाला समृद्ध ऐतिहासिक वारसा लाभला आहे. गावात अनेक प्राचीन मंदिरे व ऐतिहासिक वास्तू आहेत.',
      values: ['सामुदायिक सहभाग', 'पारदर्शकता', 'शाश्वत विकास', 'सामाजिक समता', 'पर्यावरण रक्षण'],
      population: '२,५००',
      area: '१५ चौ. किमी.',
      pincode: '422101',
    },
    contact: {
      address: 'ग्रामपंचायत कार्यालय, सोनीमोहा',
      phone: '0253-2345678',
      email: 'gp.sonimoha@maharashtra.gov.in',
      taluka: 'इगतपुरी',
      district: 'नाशिक',
      state: 'महाराष्ट्र',
      pincode: '422101',
      workingHours: 'सोमवार - शनिवार\nसकाळी १०:०० ते संध्या ५:००',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3768.0!2d73.5!3d19.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0!2s0x0!5e0!3m2!1smr!2sin!4v1700000000000!5m2!1smr!2sin',
    },
    stats: {
      population: '2500',
      area: '15',
      schools: '3',
      temples: '5',
      literacy: '88',
      households: '350',
    },
    services: {
      services: [
        {
          title: 'जन्म प्रमाणपत्र',
          description: 'जन्म नोंदणी व प्रमाणपत्र वितरण',
          icon: '📄',
          documents: ['जन्माचा दाखला', 'आई-वडिलांचे आधार', 'रुग्णालय दाखला'],
          timeline: '७ दिवस',
          fee: 'निशुल्क',
        },
        {
          title: 'मृत्यू प्रमाणपत्र',
          description: 'मृत्यू नोंदणी व प्रमाणपत्र',
          icon: '📄',
          documents: ['मृत्यूचा दाखला', 'आधार कार्ड', 'रुग्णालय दाखला'],
          timeline: '७ दिवस',
          fee: 'निशुल्क',
        },
        {
          title: 'रहिवासी दाखला',
          description: 'ग्रामपंचायतीचा रहिवासी दाखला',
          icon: '🏠',
          documents: ['आधार कार्ड', 'रेशन कार्ड', 'वीज बिल'],
          timeline: '३ दिवस',
          fee: '₹ ५०',
        },
        {
          title: 'उत्पन्नाचा दाखला',
          description: 'वार्षिक उत्पन्नाचा दाखला',
          icon: '💰',
          documents: ['आधार कार्ड', 'रेशन कार्ड', 'तलाठी प्रमाणपत्र'],
          timeline: '५ दिवस',
          fee: '₹ ५०',
        },
        {
          title: 'ना-हरकत प्रमाणपत्र',
          description: 'बांधकाम ना-हरकत प्रमाणपत्र',
          icon: '🏗️',
          documents: ['जमीन ७/१२ उतारा', 'नकाशा', 'आधार कार्ड'],
          timeline: '१५ दिवस',
          fee: '₹ २००',
        },
      ],
    },
    important: {
      emergencyNumbers: [
        { label: 'पोलीस', number: '100', icon: '🚔' },
        { label: 'अग्निशमन', number: '101', icon: '🚒' },
        { label: 'रुग्णवाहिका', number: '108', icon: '🚑' },
        { label: 'महिला हेल्पलाइन', number: '181', icon: '👩' },
        { label: 'ग्रामपंचायत', number: '0253-2345678', icon: '🏛️' },
        { label: 'तहसील कार्यालय', number: '0253-2345000', icon: '📞' },
        { label: 'जिल्हा रुग्णालय', number: '0253-2345999', icon: '🏥' },
        { label: 'कृषी विभाग', number: '0253-2346000', icon: '🌾' },
      ],
      usefulLinks: [
        { label: 'महाराष्ट्र शासन', url: 'https://maharashtra.gov.in' },
        { label: 'डिजिटल इंडिया', url: 'https://digitalindia.gov.in' },
        { label: 'पंचायत राज', url: 'https://panchayat.gov.in' },
        { label: 'महा-ऑनलाइन', url: 'https://aaplesarkar.mahaonline.gov.in' },
      ],
    },
    seo: {
      title: 'ग्रामपंचायत सोनीमोहा | Sonimoha Village',
      description: 'ग्रामपंचायत सोनीमोहा - अधिकृत वेबसाइट. गावाची माहिती, सूचना, विकासकामे, शासकीय योजना.',
      keywords: 'सोनीमोहा, ग्रामपंचायत, Sonimoha, village, महाराष्ट्र',
    },
  };

  for (const [section, content] of Object.entries(contentSections)) {
    await prisma.villageContent.upsert({
      where: { villageId_section: { villageId, section } },
      update: { content },
      create: { villageId, section, content },
    });
  }
  console.log(`  ✓ ${Object.keys(contentSections).length} content sections created`);

  // ── Done ───────────────────────────────────────────────
  console.log('\n🎉 Demo data seeding complete!');
  console.log(`   Village: ${village.name} (${VILLAGE_SLUG})`);
  console.log(`   Hero slides: ${heroUrls.length}`);
  console.log(`   Members: ${members.length}`);
  console.log(`   Notices: ${notices.length}`);
  console.log(`   Gallery images: ${galleryData.length}`);
  console.log(`   Programs: ${programs.length}`);
  console.log(`   Schemes: ${schemes.length}`);
  console.log(`   Awards: ${awards.length}`);
  console.log(`   Content sections: ${Object.keys(contentSections).length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
