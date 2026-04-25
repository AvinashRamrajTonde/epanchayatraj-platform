/**
 * seed-all.js - Comprehensive seed script for Docker setup
 * Creates: superadmin, tehsil, village "sonimoha", village admin, certificate types, demo data
 * 
 * CREDENTIALS:
 *   SuperAdmin:   admin@platform.com / Admin@123
 *   Village Admin: admin@sonimoha.gpmh.local / Village@123
 *   Citizen Login: Use email OTP (any email → OTP shown in backend logs)
 * 
 * Usage: node prisma/seed-all.js
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════
// Certificate Types (all 12)
// ═══════════════════════════════════════════════════════════════
const certificateTypes = [
  { code: 'birth', nameMarathi: 'जन्म नोंद दाखला', nameEnglish: 'Birth Certificate', fee: 20, processingDays: 5, requiredDocuments: [], designatedOfficer: 'ग्रामसेवक', firstAppellate: 'सहायक गट विकास अधिकारी', secondAppellate: 'गट विकास अधिकारी' },
  { code: 'death', nameMarathi: 'मृत्यू नोंद दाखला', nameEnglish: 'Death Certificate', fee: 20, processingDays: 5, requiredDocuments: [], designatedOfficer: 'ग्रामसेवक', firstAppellate: 'सहायक गट विकास अधिकारी', secondAppellate: 'गट विकास अधिकारी' },
  { code: 'marriage', nameMarathi: 'विवाह नोंद दाखला', nameEnglish: 'Marriage Certificate', fee: 20, processingDays: 5, requiredDocuments: ['वराचा फोटो / Groom Photo', 'वधूचा फोटो / Bride Photo'], designatedOfficer: 'ग्रामसेवक', firstAppellate: 'सहायक गट विकास अधिकारी', secondAppellate: 'गट विकास अधिकारी' },
  { code: 'residence', nameMarathi: 'रहिवाशी दाखला', nameEnglish: 'Residence Certificate', fee: 20, processingDays: 5, requiredDocuments: ['वीज देयक / Electricity Bill', 'आधार कार्ड / Aadhar Card', 'मतदार ओळखपत्र / Voter ID', 'रेशनकार्ड / Ration Card', 'घरपट्टी / House Tax Receipt', 'भाडे करार / Rent Agreement', '(वरील पैकी कोणताही एक / Any one of above)'], designatedOfficer: 'ग्रामसेवक', firstAppellate: 'सहायक गट विकास अधिकारी', secondAppellate: 'गट विकास अधिकारी' },
  { code: 'bpl', nameMarathi: 'दारिद्र्य रेषेखाली (BPL) असल्याचा दाखला', nameEnglish: 'Below Poverty Line Certificate', fee: 0, processingDays: 5, requiredDocuments: [], designatedOfficer: 'ग्रामसेवक', firstAppellate: 'सहायक गट विकास अधिकारी', secondAppellate: 'गट विकास अधिकारी' },
  { code: 'living', nameMarathi: 'हयातीचा दाखला', nameEnglish: 'Living Certificate', fee: 0, processingDays: 5, requiredDocuments: ['आधार कार्ड / Aadhar Card', 'मतदार ओळखपत्र / Voter ID', 'वाहन चालविण्याचा परवाना / Driving License', 'पासपोर्ट / Passport', 'पॅनकार्ड / PAN Card', '(वरील पैकी कोणताही एक / Any one of above)'], designatedOfficer: 'ग्रामसेवक', firstAppellate: 'सहायक गट विकास अधिकारी', secondAppellate: 'गट विकास अधिकारी' },
  { code: 'no_dues', nameMarathi: 'ग्रामपंचायत येणे बाकी दाखला', nameEnglish: 'No Dues Certificate', fee: 20, processingDays: 5, requiredDocuments: [], designatedOfficer: 'ग्रामसेवक', firstAppellate: 'सहायक गट विकास अधिकारी', secondAppellate: 'गट विकास अधिकारी' },
  { code: 'toilet', nameMarathi: 'शौचालयाचा दाखला', nameEnglish: 'Toilet Certificate', fee: 20, processingDays: 5, requiredDocuments: [], designatedOfficer: 'ग्रामसेवक', firstAppellate: 'सहायक गट विकास अधिकारी', secondAppellate: 'गट विकास अधिकारी' },
  { code: 'niradhar', nameMarathi: 'निराधार असल्याचा दाखला', nameEnglish: 'Destitute Certificate', fee: 0, processingDays: 20, requiredDocuments: ['कुटुंब प्रमुखाचा मृत्यू दाखला / Death certificate of family head'], designatedOfficer: 'ग्रामसेवक', firstAppellate: 'सहायक गट विकास अधिकारी', secondAppellate: 'गट विकास अधिकारी' },
  { code: 'widow', nameMarathi: 'विधवा असल्याचा दाखला', nameEnglish: 'Widow Certificate', fee: 20, processingDays: 20, requiredDocuments: ['पतीच्या मृत्यूचा दाखला / Death certificate of husband'], designatedOfficer: 'ग्रामसेवक', firstAppellate: 'सहायक गट विकास अधिकारी', secondAppellate: 'गट विकास अधिकारी' },
  { code: 'deserted', nameMarathi: 'परित्यक्ता असल्याचा दाखला', nameEnglish: 'Deserted Woman Certificate', fee: 20, processingDays: 20, requiredDocuments: ['मा. न्यायालयाचे आदेशाची प्रत (असल्यास) / Court order copy (if available)'], designatedOfficer: 'ग्रामसेवक', firstAppellate: 'सहायक गट विकास अधिकारी', secondAppellate: 'गट विकास अधिकारी' },
  { code: 'nuclear_family', nameMarathi: 'विभक्त कुटुंबाचा दाखला', nameEnglish: 'Nuclear Family Certificate', fee: 20, processingDays: 20, requiredDocuments: [], designatedOfficer: 'ग्रामसेवक', firstAppellate: 'सहायक गट विकास अधिकारी', secondAppellate: 'गट विकास अधिकारी' },
];

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  GPMH Platform - Complete Seed');
  console.log('═══════════════════════════════════════════════\n');

  // ───────────────────────────────────────────────────────────
  // 1. SuperAdmin User
  // ───────────────────────────────────────────────────────────
  console.log('👤 Creating SuperAdmin...');
  const superadminEmail = process.env.SUPERADMIN_EMAIL || 'admin@platform.com';
  const superadminPassword = process.env.SUPERADMIN_PASSWORD || 'Admin@123';

  const existingSA = await prisma.user.findUnique({ where: { email: superadminEmail } });
  if (!existingSA) {
    const hash = await bcrypt.hash(superadminPassword, 12);
    await prisma.user.create({
      data: { email: superadminEmail, password: hash, name: 'Super Admin', role: 'superadmin', villageId: null },
    });
    console.log(`  ✓ SuperAdmin created: ${superadminEmail} / ${superadminPassword}`);
  } else {
    console.log(`  ✓ SuperAdmin already exists: ${superadminEmail}`);
  }

  // ───────────────────────────────────────────────────────────
  // 2. Tehsil
  // ───────────────────────────────────────────────────────────
  console.log('🏛️  Creating Tehsil...');
  let tehsil = await prisma.tehsil.findFirst({ where: { name: 'इगतपुरी' } });
  if (!tehsil) {
    tehsil = await prisma.tehsil.create({
      data: { name: 'इगतपुरी', district: 'नाशिक', state: 'महाराष्ट्र' },
    });
    console.log('  ✓ Tehsil created: इगतपुरी, नाशिक, महाराष्ट्र');
  } else {
    console.log('  ✓ Tehsil already exists: इगतपुरी');
  }

  // ───────────────────────────────────────────────────────────
  // 3. Village: Sonimoha
  // ───────────────────────────────────────────────────────────
  console.log('🏘️  Creating Village: सोनीमोहा...');
  let village = await prisma.village.findUnique({ where: { slug: 'sonimoha' } });
  if (!village) {
    village = await prisma.village.create({
      data: {
        name: 'सोनीमोहा',
        slug: 'sonimoha',
        subdomain: 'sonimoha',
        status: 'active',
        theme: 'classic',
        settings: {
          primaryColor: '#FF6B00',
          villageName: 'सोनीमोहा',
          villageNameEn: 'Sonimoha',
          taluka: 'इगतपुरी',
          district: 'नाशिक',
          state: 'महाराष्ट्र',
        },
        tehsilId: tehsil.id,
      },
    });
    console.log('  ✓ Village created: सोनीमोहा (sonimoha.gpmh.local)');
  } else {
    console.log('  ✓ Village already exists: सोनीमोहा');
  }

  // ───────────────────────────────────────────────────────────
  // 4. Village Admin User
  // ───────────────────────────────────────────────────────────
  console.log('👤 Creating Village Admin...');
  const villageAdminEmail = 'admin@sonimoha.com';
  const villageAdminPassword = 'Village@123';

  const existingVA = await prisma.user.findUnique({ where: { email: villageAdminEmail } });
  if (!existingVA) {
    const hash = await bcrypt.hash(villageAdminPassword, 12);
    await prisma.user.create({
      data: { email: villageAdminEmail, password: hash, name: 'सोनीमोहा ग्रामसेवक', role: 'admin', villageId: village.id },
    });
    console.log(`  ✓ Village Admin created: ${villageAdminEmail} / ${villageAdminPassword}`);
  } else {
    console.log(`  ✓ Village Admin already exists: ${villageAdminEmail}`);
  }

  // ───────────────────────────────────────────────────────────
  // 5. Certificate Types
  // ───────────────────────────────────────────────────────────
  console.log('📜 Seeding certificate types...');
  for (const cert of certificateTypes) {
    await prisma.certificateType.upsert({
      where: { code: cert.code },
      update: cert,
      create: cert,
    });
  }
  console.log(`  ✓ ${certificateTypes.length} certificate types seeded`);

  // ───────────────────────────────────────────────────────────
  // 6. Payment Config for Sonimoha
  // ───────────────────────────────────────────────────────────
  console.log('💳 Creating payment config...');
  const existingPC = await prisma.villagePaymentConfig.findUnique({ where: { villageId: village.id } });
  if (!existingPC) {
    await prisma.villagePaymentConfig.create({
      data: {
        villageId: village.id,
        upiId: 'gp.sonimoha@sbi',
        bankName: 'State Bank of India',
        accountHolder: 'ग्रामपंचायत सोनीमोहा',
        accountNo: '12345678901234',
        ifscCode: 'SBIN0012345',
        instructions: 'UPI किंवा बँक ट्रान्सफर द्वारे पेमेंट करा. UTR क्रमांक आणि स्क्रीनशॉट अपलोड करा.',
        isActive: true,
      },
    });
    console.log('  ✓ Payment config created for सोनीमोहा');
  } else {
    console.log('  ✓ Payment config already exists');
  }

  // ───────────────────────────────────────────────────────────
  // 7. Members (Grampanchayat team)
  // ───────────────────────────────────────────────────────────
  console.log('👥 Creating GP members...');
  const membersExist = await prisma.member.count({ where: { villageId: village.id } });
  if (membersExist === 0) {
    const members = [
      { name: 'श्री. शिंदे बाळासाहेब', designation: 'सरपंच', type: 'sarpanch', phone: '9876543210', email: 'sarpanch@sonimoha.com', bio: 'सोनीमोहा ग्रामपंचायतीचे सरपंच. गावाच्या विकासासाठी अथक प्रयत्नशील.', backContent: { qualification: 'बी.ए.', experience: '10 वर्षे' }, sortOrder: 0 },
      { name: 'श्री. अजय पाटील', designation: 'उपसरपंच', type: 'upsarpanch', phone: '9876543211', bio: 'ग्रामपंचायत उपसरपंच. शिक्षण व पायाभूत सुविधांच्या विकासात रस.', backContent: { qualification: 'बी.कॉम.', experience: '5 वर्षे' }, sortOrder: 1 },
      { name: 'श्री. राजेश देशमुख', designation: 'ग्रामसेवक', type: 'gramsevak', phone: '9876543212', email: 'gramsevak@sonimoha.com', bio: 'सरकारी नियुक्त ग्रामसेवक. प्रशासकीय कामकाजाचा दीर्घ अनुभव.', backContent: { qualification: 'एम.ए., बी.एड.', experience: '15 वर्षे' }, sortOrder: 2 },
      { name: 'श्रीमती. सुनीता जाधव', designation: 'सदस्य', type: 'member', phone: '9876543213', bio: 'महिला व बालकल्याण समिती सदस्य.', sortOrder: 3 },
      { name: 'श्री. विनोद गायकवाड', designation: 'सदस्य', type: 'member', phone: '9876543214', bio: 'पाणीपुरवठा व स्वच्छता समिती सदस्य.', sortOrder: 4 },
      { name: 'श्रीमती. लता शिरसाट', designation: 'सदस्य', type: 'member', phone: '9876543215', bio: 'शिक्षण समिती सदस्य.', sortOrder: 5 },
      { name: 'श्री. प्रकाश भोसले', designation: 'सदस्य', type: 'member', phone: '9876543216', bio: 'रस्ते व बांधकाम समिती सदस्य.', sortOrder: 6 },
    ];
    for (const m of members) {
      await prisma.member.create({ data: { villageId: village.id, ...m, isActive: true } });
    }
    console.log(`  ✓ ${members.length} members created`);
  } else {
    console.log(`  ✓ Members already exist (${membersExist})`);
  }

  // ───────────────────────────────────────────────────────────
  // 8. Notices
  // ───────────────────────────────────────────────────────────
  console.log('📋 Creating notices...');
  const noticesExist = await prisma.notice.count({ where: { villageId: village.id } });
  if (noticesExist === 0) {
    const notices = [
      { title: 'ग्रामसभा बैठक सूचना', content: 'सर्व ग्रामस्थांना कळविण्यात येते की, ग्रामपंचायत सोनीमोहा अंतर्गत ग्रामसभा बैठक दि. १५/०४/२०२६ रोजी सकाळी ११ वाजता ग्रामपंचायत कार्यालयात आयोजित करण्यात आली आहे. सर्वांनी उपस्थित राहावे.', category: 'general', priority: 'high', isPopup: true, isPublished: true },
      { title: 'पाणीपुरवठा वेळापत्रक बदल', content: 'सोनीमोहा गावाच्या पाणीपुरवठा वेळापत्रकात बदल करण्यात आला आहे. सकाळी ६ ते ८ व संध्याकाळी ५ ते ७ या वेळेत पाणीपुरवठा होईल.', category: 'general', priority: 'normal', isPopup: false, isPublished: true },
      { title: 'स्वच्छता अभियान', content: 'दि. २०/०४/२०२६ रोजी गावात स्वच्छता अभियान राबवण्यात येणार आहे. सर्व ग्रामस्थांनी सहभागी व्हावे.', category: 'events', priority: 'normal', isPopup: false, isPublished: true },
      { title: 'जन्म-मृत्यू नोंदणी शिबीर', content: 'गावातील प्रलंबित जन्म-मृत्यू नोंदणीसाठी विशेष शिबीर. दि. २२/०४/२०२६ ग्रामपंचायत कार्यालयात.', category: 'services', priority: 'normal', isPopup: false, isPublished: true },
      { title: 'विजेचे बिल भरणा', content: 'सर्व ग्रामस्थांनी त्यांचे प्रलंबित विजेचे बिल भरावे. देय तारखेनंतर दंड आकारला जाईल.', category: 'general', priority: 'low', isPopup: false, isPublished: true },
      { title: '१५ ऑगस्ट स्वातंत्र्यदिन कार्यक्रम', content: 'स्वातंत्र्यदिनी ध्वजवंदन कार्यक्रम सकाळी ८ वाजता शाळा मैदानात. सर्व ग्रामस्थांनी उपस्थित राहावे.', category: 'events', priority: 'high', isPopup: true, isPublished: true },
    ];
    for (const n of notices) {
      await prisma.notice.create({ data: { villageId: village.id, ...n, publishedAt: new Date() } });
    }
    console.log(`  ✓ ${notices.length} notices created`);
  } else {
    console.log(`  ✓ Notices already exist (${noticesExist})`);
  }

  // ───────────────────────────────────────────────────────────
  // 9. Programs
  // ───────────────────────────────────────────────────────────
  console.log('🏗️  Creating programs...');
  const programsExist = await prisma.program.count({ where: { villageId: village.id } });
  if (programsExist === 0) {
    const programs = [
      { title: 'ग्रामीण रस्ता सुधारणा', description: 'गावातील मुख्य रस्त्यांचे डांबरीकरण व दुरुस्ती. प्रधानमंत्री ग्रामसडक योजना अंतर्गत ३ किमी रस्ता बांधकाम पूर्ण.', category: 'पायाभूत सुविधा', location: 'सोनीमोहा मुख्य रस्ता', date: new Date('2026-01-15'), images: [], highlights: ['३ किमी रस्ता डांबरीकरण', 'गटर बांधकाम', 'रस्ता रुंदीकरण'], result: 'रस्ता बांधकाम यशस्वीरित्या पूर्ण.', isPublished: true },
      { title: 'शाळा दुरुस्ती व रंगरंगोटी', description: 'जिल्हा परिषद प्राथमिक शाळेची दुरुस्ती, नवीन रंगरंगोटी व फर्निचर.', category: 'शिक्षण', location: 'जि.प. शाळा, सोनीमोहा', date: new Date('2025-11-20'), images: [], highlights: ['शाळा रंगोटी', 'नवीन बेंच व डेस्क', 'स्वच्छतागृह बांधकाम'], result: '१५० विद्यार्थ्यांना सुधारित शिक्षण सुविधा.', isPublished: true },
      { title: 'पाणी पुरवठा योजना', description: 'जल जीवन मिशन अंतर्गत गावात नळ पाणी पुरवठा योजना.', category: 'पाणीपुरवठा', location: 'संपूर्ण गाव', date: new Date('2026-02-10'), images: [], highlights: ['पाण्याची टाकी बांधकाम', 'पाइपलाइन अंथरुण', 'प्रत्येक घरात नळ'], result: '३५० कुटुंबांना नळ पाणी पुरवठा सुरू.', isPublished: true },
      { title: 'LED पथदिवे बसवणे', description: 'गावातील सर्व रस्त्यांवर ऊर्जा बचत LED पथदिवे बसवणे.', category: 'पायाभूत सुविधा', location: 'सर्व गावठाण रस्ते', date: new Date('2025-09-05'), images: [], highlights: ['५० LED पथदिवे', '६०% ऊर्जा बचत', 'सोलर पॅनल'], result: 'गावातील सर्व रस्ते प्रकाशित.', isPublished: true },
      { title: 'सामुदायिक शौचालय बांधकाम', description: 'स्वच्छ भारत मिशन अंतर्गत गावात २ सामुदायिक शौचालय बांधकाम.', category: 'स्वच्छता', location: 'गावचौक व बस स्टॅण्ड', date: new Date('2025-07-20'), images: [], highlights: ['२ सामुदायिक शौचालय', 'मुला-मुलींसाठी स्वतंत्र'], result: 'हागणदारीमुक्त गाव दर्जा प्राप्त.', isPublished: true },
    ];
    for (const p of programs) {
      await prisma.program.create({ data: { villageId: village.id, ...p } });
    }
    console.log(`  ✓ ${programs.length} programs created`);
  } else {
    console.log(`  ✓ Programs already exist (${programsExist})`);
  }

  // ───────────────────────────────────────────────────────────
  // 10. Schemes
  // ───────────────────────────────────────────────────────────
  console.log('📜 Creating schemes...');
  const schemesExist = await prisma.scheme.count({ where: { villageId: village.id } });
  if (schemesExist === 0) {
    const schemes = [
      { title: 'प्रधानमंत्री आवास योजना (ग्रामीण)', description: 'गरीब कुटुंबांना पक्के घर बांधण्यासाठी आर्थिक मदत. प्रत्येक लाभार्थीला १.२० लाख रुपये अनुदान.', category: 'गृहनिर्माण', benefits: ['१.२० लाख रुपये अनुदान', 'शौचालय बांधकामासाठी अतिरिक्त १२,००० रुपये'], eligibility: ['बेघर कुटुंब', 'कच्चे घर असलेले कुटुंब', 'बीपीएल यादीत नाव'], documents: ['आधार कार्ड', 'रेशन कार्ड', 'जमिनीचा ७/१२ उतारा', 'बँक पासबुक'], applicationProcess: ['ग्रामपंचायत कार्यालयात अर्ज करा', 'ग्रामसभेत मंजुरी', 'बँक खात्यात अनुदान जमा'], contactInfo: 'ग्रामसेवक - 9876543212', budget: '₹ १.२० लाख प्रति घर', beneficiaries: '२५ कुटुंबे', isActive: true },
      { title: 'महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार हमी योजना', description: 'ग्रामीण भागातील कुटुंबांना वर्षातून १०० दिवसांचे हमी रोजगार.', category: 'रोजगार', benefits: ['१०० दिवसांचे रोजगार हमी', 'किमान वेतन दर ₹ ३४८ प्रतिदिन'], eligibility: ['ग्रामीण कुटुंब', 'जॉब कार्ड आवश्यक'], documents: ['जॉब कार्ड', 'आधार कार्ड', 'बँक पासबुक'], applicationProcess: ['ग्रामपंचायत कार्यालयात जॉब कार्ड काढा', 'कामासाठी अर्ज करा'], contactInfo: 'ग्रामसेवक - 9876543212', budget: '₹ ५ लाख वार्षिक', beneficiaries: '१५० कुटुंबे', isActive: true },
      { title: 'शेतकरी सन्मान निधी योजना', description: 'प्रधानमंत्री किसान सन्मान निधी - प्रत्येक शेतकऱ्याला वार्षिक ₹ ६,०००.', category: 'शेती', benefits: ['वार्षिक ₹ ६,००० (३ हप्त्यांत)', 'थेट बँक खात्यात जमा'], eligibility: ['शेतजमीन असलेले शेतकरी', '२ हेक्टरपर्यंत जमीन'], documents: ['आधार कार्ड', '७/१२ उतारा', 'बँक पासबुक'], applicationProcess: ['ग्रामपंचायतीत अर्ज करा', 'तलाठ्याकडे सत्यापन'], contactInfo: 'तलाठी कार्यालय', budget: '₹ ६,००० प्रति शेतकरी', beneficiaries: '२०० शेतकरी', isActive: true },
    ];
    for (const s of schemes) {
      await prisma.scheme.create({ data: { villageId: village.id, ...s } });
    }
    console.log(`  ✓ ${schemes.length} schemes created`);
  } else {
    console.log(`  ✓ Schemes already exist (${schemesExist})`);
  }

  // ───────────────────────────────────────────────────────────
  // 11. Awards
  // ───────────────────────────────────────────────────────────
  console.log('🏆 Creating awards...');
  const awardsExist = await prisma.award.count({ where: { villageId: village.id } });
  if (awardsExist === 0) {
    const awards = [
      { title: 'निर्मल ग्राम पुरस्कार', description: 'स्वच्छता अभियानात उत्कृष्ट कामगिरी बद्दल.', year: 2024, category: 'स्वच्छता', awardedBy: 'भारत सरकार', sortOrder: 0, isActive: true },
      { title: 'तंटामुक्त गाव पुरस्कार', description: 'गावातील शांतता व सलोखा राखल्याबद्दल.', year: 2025, category: 'प्रशासन', awardedBy: 'जिल्हाधिकारी कार्यालय', sortOrder: 1, isActive: true },
      { title: 'राष्ट्रीय पंचायत पुरस्कार', description: 'सर्वोत्तम ग्रामपंचायत म्हणून मान्यता.', year: 2025, category: 'विकास', awardedBy: 'पंचायत राज मंत्रालय', sortOrder: 2, isActive: true },
    ];
    for (const a of awards) {
      await prisma.award.create({ data: { villageId: village.id, ...a } });
    }
    console.log(`  ✓ ${awards.length} awards created`);
  } else {
    console.log(`  ✓ Awards already exist (${awardsExist})`);
  }

  // ───────────────────────────────────────────────────────────
  // 12. Content Sections
  // ───────────────────────────────────────────────────────────
  console.log('📄 Creating content sections...');
  const contentSections = {
    about: {
      title: 'सोनीमोहा गावाबद्दल',
      description: 'सोनीमोहा हे महाराष्ट्रातील एक सुंदर व विकसित गाव आहे. निसर्गरम्य परिसर, समृद्ध वारसा आणि प्रगतीशील विचारधारा यामुळे गाव सर्वत्र प्रसिद्ध आहे.',
      vision: 'स्वच्छ, सुंदर, शिक्षित आणि आत्मनिर्भर गाव बनवणे.',
      mission: 'प्रत्येक नागरिकाचे जीवनमान उंचावण्यासाठी शिक्षण, आरोग्य, रोजगार व पायाभूत सुविधांचा विकास करणे.',
      history: 'सोनीमोहा गावाला समृद्ध ऐतिहासिक वारसा लाभला आहे.',
      values: ['सामुदायिक सहभाग', 'पारदर्शकता', 'शाश्वत विकास', 'सामाजिक समता', 'पर्यावरण रक्षण'],
      population: '२,५००', area: '१५ चौ. किमी.', pincode: '422101',
    },
    contact: {
      address: 'ग्रामपंचायत कार्यालय, सोनीमोहा',
      phone: '0253-2345678', email: 'gp.sonimoha@maharashtra.gov.in',
      taluka: 'इगतपुरी', district: 'नाशिक', state: 'महाराष्ट्र', pincode: '422101',
      workingHours: 'सोमवार - शनिवार\nसकाळी १०:०० ते संध्या ५:००',
    },
    stats: { population: '2500', area: '15', schools: '3', temples: '5', literacy: '88', households: '350' },
    important: {
      emergencyNumbers: [
        { label: 'पोलीस', number: '100', icon: '🚔' },
        { label: 'अग्निशमन', number: '101', icon: '🚒' },
        { label: 'रुग्णवाहिका', number: '108', icon: '🚑' },
        { label: 'महिला हेल्पलाइन', number: '181', icon: '👩' },
        { label: 'ग्रामपंचायत', number: '0253-2345678', icon: '🏛️' },
      ],
    },
    seo: {
      title: 'ग्रामपंचायत सोनीमोहा | Sonimoha Village',
      description: 'ग्रामपंचायत सोनीमोहा - अधिकृत वेबसाइट.',
      keywords: 'सोनीमोहा, ग्रामपंचायत, Sonimoha, village, महाराष्ट्र',
    },
  };
  for (const [section, content] of Object.entries(contentSections)) {
    await prisma.villageContent.upsert({
      where: { villageId_section: { villageId: village.id, section } },
      update: { content },
      create: { villageId: village.id, section, content },
    });
  }
  console.log(`  ✓ ${Object.keys(contentSections).length} content sections created`);

  // ───────────────────────────────────────────────────────────
  // 13. Demo Citizen User + Family
  // ───────────────────────────────────────────────────────────
  console.log('👨‍👩‍👧‍👦 Creating demo citizen...');
  const citizenEmail = 'citizen@demo.com';
  const citizenPassword = 'Citizen@123';
  let citizen = await prisma.citizenUser.findUnique({ where: { email: citizenEmail } });
  if (!citizen) {
    const citizenHash = await bcrypt.hash(citizenPassword, 12);
    citizen = await prisma.citizenUser.create({
      data: { email: citizenEmail, name: 'रामदास पाटील', phone: '9876543220', passwordHash: citizenHash, isVerified: true },
    });
    console.log(`  ✓ Citizen user: ${citizenEmail} / ${citizenPassword} (or login via email OTP)`);

    // Create family
    const family = await prisma.family.create({
      data: {
        familyId: 'FAM-SONI-0001',
        villageId: village.id,
        citizenUserId: citizen.id,
        headName: 'रामदास पाटील',
        headDob: new Date('1980-05-15'),
        headAadhar: '123456789012',
        headRationCard: 'MH-1234567',
        headVoterId: 'XYZ1234567',
      },
    });
    console.log('  ✓ Family FAM-SONI-0001 created');

    // Add family members
    const familyMembers = [
      { name: 'सुमन पाटील', dob: new Date('1983-08-20'), aadhar: '123456789013', relation: 'wife' },
      { name: 'आदित्य पाटील', dob: new Date('2005-03-10'), aadhar: '123456789014', voterId: 'XYZ1234568', relation: 'son' },
      { name: 'प्राची पाटील', dob: new Date('2008-11-25'), aadhar: '123456789015', relation: 'daughter' },
    ];
    for (const fm of familyMembers) {
      await prisma.familyMember.create({ data: { familyId: family.id, ...fm } });
    }
    console.log(`  ✓ ${familyMembers.length} family members added`);
  } else {
    console.log(`  ✓ Citizen already exists: ${citizenEmail}`);
  }

  // ───────────────────────────────────────────────────────────
  // Done!
  // ───────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════');
  console.log('  ✅ Seeding complete!');
  console.log('═══════════════════════════════════════════════');
  console.log('\n📌 Login Credentials:');
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│ Role            │ URL                        │ Credentials  │');
  console.log('├─────────────────────────────────────────────────────────────┤');
  console.log('│ SuperAdmin      │ http://admin.gpmh.local    │ admin@platform.com / Admin@123     │');
  console.log('│ Village Admin   │ http://sonimoha.gpmh.local │ admin@sonimoha.com / Village@123         │');
  console.log('│ Citizen (demo)  │ http://sonimoha.gpmh.local │ citizen@demo.com / Citizen@123     │');
  console.log('└─────────────────────────────────────────────────────────────┘');
  console.log('\n📌 Add to /etc/hosts:');
  console.log('  127.0.0.1  gpmh.local admin.gpmh.local sonimoha.gpmh.local\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
