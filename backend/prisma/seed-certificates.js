import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const certificateTypes = [
  {
    code: 'birth',
    nameMarathi: 'जन्म नोंद दाखला',
    nameEnglish: 'Birth Certificate',
    fee: 20,
    processingDays: 5,
    requiredDocuments: [],
    designatedOfficer: 'ग्रामसेवक',
    firstAppellate: 'सहायक गट विकास अधिकारी',
    secondAppellate: 'गट विकास अधिकारी',
  },
  {
    code: 'death',
    nameMarathi: 'मृत्यू नोंद दाखला',
    nameEnglish: 'Death Certificate',
    fee: 20,
    processingDays: 5,
    requiredDocuments: [],
    designatedOfficer: 'ग्रामसेवक',
    firstAppellate: 'सहायक गट विकास अधिकारी',
    secondAppellate: 'गट विकास अधिकारी',
  },
  {
    code: 'marriage',
    nameMarathi: 'विवाह नोंद दाखला',
    nameEnglish: 'Marriage Certificate',
    fee: 20,
    processingDays: 5,
    requiredDocuments: ['वराचा फोटो / Groom Photo', 'वधूचा फोटो / Bride Photo'],
    designatedOfficer: 'ग्रामसेवक',
    firstAppellate: 'सहायक गट विकास अधिकारी',
    secondAppellate: 'गट विकास अधिकारी',
  },
  {
    code: 'residence',
    nameMarathi: 'रहिवाशी दाखला',
    nameEnglish: 'Residence Certificate',
    fee: 20,
    processingDays: 5,
    requiredDocuments: [
      'वीज देयक / Electricity Bill',
      'आधार कार्ड / Aadhar Card',
      'मतदार ओळखपत्र / Voter ID',
      'रेशनकार्ड / Ration Card',
      'घरपट्टी / House Tax Receipt',
      'भाडे करार / Rent Agreement',
      '(वरील पैकी कोणताही एक पुरावा सादर करावा / Submit any one of above)',
    ],
    designatedOfficer: 'ग्रामसेवक',
    firstAppellate: 'सहायक गट विकास अधिकारी',
    secondAppellate: 'गट विकास अधिकारी',
  },
  {
    code: 'bpl',
    nameMarathi: 'दारिद्र्य रेषेखाली (BPL) असल्याचा दाखला',
    nameEnglish: 'Below Poverty Line Certificate',
    fee: 0,
    processingDays: 5,
    requiredDocuments: [],
    designatedOfficer: 'ग्रामसेवक',
    firstAppellate: 'सहायक गट विकास अधिकारी',
    secondAppellate: 'गट विकास अधिकारी',
  },
  {
    code: 'living',
    nameMarathi: 'हयातीचा दाखला',
    nameEnglish: 'Living Certificate',
    fee: 0,
    processingDays: 5,
    requiredDocuments: [
      'आधार कार्ड / Aadhar Card',
      'मतदार ओळखपत्र / Voter ID',
      'वाहन चालविण्याचा परवाना / Driving License',
      'पासपोर्ट / Passport',
      'पॅनकार्ड / PAN Card',
      'छायाचित्र असलेले कोणतेही शासकीय ओळखपत्र / Any Govt. Photo ID',
      '(वरील पैकी कोणताही एक पुरावा सादर करावा / Submit any one of above)',
    ],
    designatedOfficer: 'ग्रामसेवक',
    firstAppellate: 'सहायक गट विकास अधिकारी',
    secondAppellate: 'गट विकास अधिकारी',
  },
  {
    code: 'no_dues',
    nameMarathi: 'ग्रामपंचायत येणे बाकी दाखला',
    nameEnglish: 'No Dues Certificate',
    fee: 20,
    processingDays: 5,
    requiredDocuments: [],
    designatedOfficer: 'ग्रामसेवक',
    firstAppellate: 'सहायक गट विकास अधिकारी',
    secondAppellate: 'गट विकास अधिकारी',
  },
  {
    code: 'toilet',
    nameMarathi: 'शौचालयाचा दाखला',
    nameEnglish: 'Toilet Certificate',
    fee: 20,
    processingDays: 5,
    requiredDocuments: [],
    designatedOfficer: 'ग्रामसेवक',
    firstAppellate: 'सहायक गट विकास अधिकारी',
    secondAppellate: 'गट विकास अधिकारी',
  },
  {
    code: 'niradhar',
    nameMarathi: 'निराधार असल्याचा दाखला',
    nameEnglish: 'Destitute Certificate',
    fee: 0,
    processingDays: 20,
    requiredDocuments: ['कुटुंब प्रमुखाचा मृत्यू दाखला / Death certificate of family head'],
    designatedOfficer: 'ग्रामसेवक',
    firstAppellate: 'सहायक गट विकास अधिकारी',
    secondAppellate: 'गट विकास अधिकारी',
  },
  {
    code: 'widow',
    nameMarathi: 'विधवा असल्याचा दाखला',
    nameEnglish: 'Widow Certificate',
    fee: 20,
    processingDays: 20,
    requiredDocuments: ['पतीच्या मृत्यूचा दाखला / Death certificate of husband'],
    designatedOfficer: 'ग्रामसेवक',
    firstAppellate: 'सहायक गट विकास अधिकारी',
    secondAppellate: 'गट विकास अधिकारी',
  },
  {
    code: 'deserted',
    nameMarathi: 'परित्यक्ता असल्याचा दाखला',
    nameEnglish: 'Deserted Woman Certificate',
    fee: 20,
    processingDays: 20,
    requiredDocuments: ['मा. न्यायालयाचे आदेशाची प्रत (असल्यास उपलब्ध करावी) / Court order copy (if available)'],
    designatedOfficer: 'ग्रामसेवक',
    firstAppellate: 'सहायक गट विकास अधिकारी',
    secondAppellate: 'गट विकास अधिकारी',
  },
  {
    code: 'nuclear_family',
    nameMarathi: 'विभक्त कुटुंबाचा दाखला',
    nameEnglish: 'Nuclear Family Certificate',
    fee: 20,
    processingDays: 20,
    requiredDocuments: [],
    designatedOfficer: 'ग्रामसेवक',
    firstAppellate: 'सहायक गट विकास अधिकारी',
    secondAppellate: 'गट विकास अधिकारी',
  },
];

async function main() {
  console.log('Seeding certificate types...');
  for (const cert of certificateTypes) {
    await prisma.certificateType.upsert({
      where: { code: cert.code },
      update: cert,
      create: cert,
    });
    console.log(`  ✓ ${cert.code}: ${cert.nameMarathi}`);
  }
  console.log('Done seeding certificate types.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
