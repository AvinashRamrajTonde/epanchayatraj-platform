import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import prisma from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Asset paths ──────────────────────────────────────────────────────────────
const LOGO_PATH   = path.join(__dirname, '../assets/pdf_logo.png');
// Use static fonts only — PDFKit does NOT correctly shape variable fonts ([wght].ttf)
const FONT_LOHIT  = '/usr/share/fonts/lohit-devanagari-fonts/Lohit-Devanagari.ttf';
const FONT_DROID  = '/usr/share/fonts/google-droid-sans-fonts/DroidSansDevanagari-Regular.ttf';

// Lohit Devanagari is preferred — well-tested static TTF with correct shaping in PDFKit
function pickFont() {
  if (fs.existsSync(FONT_LOHIT)) return FONT_LOHIT;
  if (fs.existsSync(FONT_DROID)) return FONT_DROID;
  return 'Helvetica';
}
const DEVA_FONT = pickFont();

const UPLOAD_DIR = path.join(__dirname, '../../uploads/certificates');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ─── Page constants ───────────────────────────────────────────────────────────
const A4_W = 595.28;
const A4_H = 841.89;
const M    = 38;          // margin
const INN  = M + 14;      // inner indent for paragraphs
const TW   = A4_W - INN - M - 10;  // text width

// ─── Helpers ──────────────────────────────────────────────────────────────────
function f(doc, size) { doc.font(DEVA_FONT).fontSize(size); return doc; }
function formatDate(d) {
  if (!d) return '_______________';
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`;
}
function formatTime(d) {
  if (!d) return '';
  const dt = new Date(d);
  return `${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
}
function blank(v) { return v || '______________________________'; }
function getVI(app) {
  return {
    name: app.village?.name || '___________',
    taluka: app.village?.tehsil?.name || '___________',
    district: app.village?.tehsil?.district || '___________',
  };
}
function getOfficers(app) {
  const mems = app.village?.members || [];
  const s = mems.find(m => m.type === 'sarpanch');
  const a = mems.find(m => m.type === 'grampanchayat_adhikari' || m.type === 'gramsevak');
  return { sarpanch: s?.name || null, adhikari: a?.name || null };
}
function numberToMarathiWords(num) {
  const ones = ['', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नऊ', 'दहा', 'अकरा', 'बारा', 'तेरा', 'चौदा', 'पंधरा', 'सोळा', 'सतरा', 'अठरा', 'एकोणवीस', 'वीस', 'एकवीस', 'बावीस', 'तेवीस', 'चोवीस', 'पंचवीस', 'सव्वीस', 'सत्तावीस', 'अठ्ठावीस', 'एकोणतीस', 'तीस', 'एकतीस', 'बत्तीस', 'तेहतीस', 'चौतीस', 'पस्तीस', 'छत्तीस', 'सदतीस', 'अडतीस', 'एकोणचाळीस', 'चाळीस', 'एक्केचाळीस', 'बेचाळीस', 'त्रेचाळीस', 'चव्वेचाळीस', 'पंचेचाळीस', 'सेहेचाळीस', 'सत्तेचाळीस', 'अठ्ठेचाळीस', 'एकोणपन्नास', 'पन्नास', 'एक्कावन्न', 'बावन्न', 'त्रेपन्न', 'चौपन्न', 'पंचावन्न', 'छप्पन्न', 'सत्तावन्न', 'अठ्ठावन्न', 'एकोणसाठ', 'साठ', 'एकसष्ट', 'बासष्ट', 'त्रेसष्ट', 'चौसष्ट', 'पासष्ट', 'सहासष्ट', 'सदुसष्ट', 'अडुसष्ट', 'एकोणसत्तर', 'सत्तर', 'एकाहत्तर', 'बाहत्तर', 'त्र्याहत्तर', 'चौर्याहत्तर', 'पंच्याहत्तर', 'शहात्तर', 'सत्त्याहत्तर', 'अठ्ठ्याहत्तर', 'एकोणऐंशी', 'ऐंशी', 'एक्क्याऐंशी', 'ब्याऐंशी', 'त्र्याऐंशी', 'चौऱ्याऐंशी', 'पंच्याऐंशी', 'शहाऐंशी', 'सत्त्याऐंशी', 'अठ्ठ्याऐंशी', 'एकोणनव्वद', 'नव्वद', 'एक्क्याण्णव', 'ब्याण्णव', 'त्र्याण्णव', 'चौर्याण्णव', 'पंच्याण्णव', 'शहाण्णव', 'सत्त्याण्णव', 'अठ्ठ्याण्णव', 'नव्व्याण्णव'];
  if (num === 0) return 'शून्य रुपये फक्त';
  if (num < 100) return (ones[num] || String(num)) + ' रुपये फक्त';
  let r = '';
  if (num >= 1000) { r += (ones[Math.floor(num/1000)] || String(Math.floor(num/1000))) + ' हजार '; num %= 1000; }
  if (num >= 100)  { r += ones[Math.floor(num/100)] + 'शे '; num %= 100; }
  if (num > 0) r += ones[num];
  return r.trim() + ' रुपये फक्त';
}

// ─── QR buffer ────────────────────────────────────────────────────────────────
async function makeQR(certNo) {
  const url = `https://gpmh.in/citizen/verify/${encodeURIComponent(certNo || 'NA')}`;
  return QRCode.toBuffer(url, { width: 100, margin: 1, errorCorrectionLevel: 'M' });
}

// ═══════════════════════════════════════════════════════════════════════════════
// LETTERHEAD — draws border, logo (abs), QR (abs top-right), centered GP info
// Returns { bodyY } — first usable Y for content
// ═══════════════════════════════════════════════════════════════════════════════
async function drawLetterhead(doc, app, titleMr, titleEn, qrBuf, opts = {}) {
  const v = getVI(app);
  const FOOTER_H = 110;     // reserved for footer
  const HEADER_H = opts.headerH || 120; // letterhead block height

  // ── Borders ──────────────────────────────────────────────────────────────
  doc.lineWidth(2.2).rect(M, M, A4_W - M*2, A4_H - M*2).stroke('#1a3a5c');
  doc.lineWidth(0.7).rect(M+5, M+5, A4_W-(M+5)*2, A4_H-(M+5)*2).stroke('#4a7fa5');

  // ── Logo — absolute top-left ──────────────────────────────────────────────
  const LOGO_SZ = 72;
  const LOGO_X  = M + 10;
  const LOGO_Y  = M + 12;
  if (fs.existsSync(LOGO_PATH)) {
    try { doc.image(LOGO_PATH, LOGO_X, LOGO_Y, { width: LOGO_SZ, height: LOGO_SZ, fit: [LOGO_SZ, LOGO_SZ] }); }
    catch (e) { doc.circle(LOGO_X + LOGO_SZ/2, LOGO_Y + LOGO_SZ/2, LOGO_SZ/2 - 2).lineWidth(0.8).stroke('#bbb'); }
  } else {
    doc.circle(LOGO_X + LOGO_SZ/2, LOGO_Y + LOGO_SZ/2, LOGO_SZ/2 - 2).lineWidth(0.8).stroke('#bbb');
  }

  // ── QR — absolute top-right (unless marriage which puts it at bottom) ─────
  const QR_SZ = 60;
  const QR_X  = A4_W - M - 10 - QR_SZ;
  const QR_Y  = M + 14;
  if (qrBuf && !opts.qrAtBottom) {
    doc.image(qrBuf, QR_X, QR_Y, { width: QR_SZ, height: QR_SZ });
    f(doc, 5.5).fillColor('#888').text('Scan to verify', QR_X, QR_Y + QR_SZ + 1, { width: QR_SZ, align: 'center' });
  }

  // ── Centered GP info (full width, text only, logo/QR are floating) ────────
  const CY = M + 16;
  f(doc, 9).fillColor('#555').text('महाराष्ट्र शासन  |  Government of Maharashtra', M, CY, { width: A4_W - M*2, align: 'center' });
  f(doc, 19).fillColor('#1a3a5c').text(`ग्रामपंचायत ${v.name}`, M, doc.y + 1, { width: A4_W - M*2, align: 'center' });
  // f(doc, 10).fillColor('#444').text(`Gram Panchayat ${v.name}`, M, doc.y + 1, { width: A4_W - M*2, align: 'center' });
  f(doc, 9).fillColor('#666').text(`ता. ${v.taluka}  |  जि. ${v.district}  |  महाराष्ट्र`, M, doc.y + 1, { width: A4_W - M*2, align: 'center' });

  // ── Divider under GP info ─────────────────────────────────────────────────
  const D1 = Math.max(doc.y + 6, LOGO_Y + LOGO_SZ + 6);
  doc.lineWidth(1.8).moveTo(M+7, D1).lineTo(A4_W-M-7, D1).stroke('#1a3a5c');
  doc.lineWidth(0.5).moveTo(M+7, D1+3).lineTo(A4_W-M-7, D1+3).stroke('#4a7fa5');

  // ── Certificate title — centered ──────────────────────────────────────────
  const T1 = D1 + 9;
  f(doc, 19).fillColor('#1a3a5c').text(titleMr, M+7, T1, { width: A4_W-(M+7)*2, align: 'center' });
  f(doc, 10).fillColor('#666').text(titleEn, M+7, doc.y + 1, { width: A4_W-(M+7)*2, align: 'center' });

  // ── Divider under title ───────────────────────────────────────────────────
  doc.moveDown(0.5);
  const D2 = doc.y + 5;
  // doc.lineWidth(0.5).moveTo(M+7, D2).lineTo(A4_W-M-7, D2).stroke('#9ab');
  
  // ── Meta row: जा.क्र.  |  प्रमाणपत्र क्र.  |  दिनांक ──────────────────────
  const META_Y = D2 + 4;
  f(doc, 11).fillColor('#444');
  doc.text(`जा.क्र.: ${blank(app.dispatchNo)}`, M+10, META_Y);
  doc.text(`प्रमाणपत्र क्र.: ${blank(app.certificateNo)}`, M+10, META_Y, { width: A4_W-(M+10)*2, align: 'center' });
  doc.text(`दिनांक: ${formatDate(app.issuedAt || new Date())}`, M+10, META_Y, { width: A4_W-(M+10)*2, align: 'right' });

  // ── Final thin divider ────────────────────────────────────────────────────
  const D3 = META_Y + 13;
  // doc.lineWidth(0.3).moveTo(M+7, D3).lineTo(A4_W-M-7, D3).stroke('#dde');

  doc.fillColor('#111');
  doc.y = D3 + 7;
  return { bodyY: D3 + 7, footerY: A4_H - M - FOOTER_H };
}

// ═══════════════════════════════════════════════════════════════════════════════
// FOOTER — official footer with issuer info, date/time, verify note
// ═══════════════════════════════════════════════════════════════════════════════
function drawFooter(doc, app, qrBuf, opts = {}) {
  const v = getVI(app);
  const { sarpanch, adhikari } = getOfficers(app);

  // Add spacing before footer (4-5 line spaces)
  doc.moveDown(4.5);
  const FOOT_Y = doc.y;

  // ── Signature block: Sarpanch LEFT, GP Adhikari RIGHT ─────────────────────
  const SIG_W = 175;
  const SIG_L = M + 10;
  const SIG_R = A4_W - M - 10 - SIG_W;
  const SIG_Y = FOOT_Y;

  // Left: Sarpanch
  f(doc, 11).fillColor('#333').text('सरपंच / Sarpanch', SIG_L, SIG_Y, { width: SIG_W, align: 'center' });
  if (sarpanch) f(doc, 11).fillColor('#111').text(sarpanch, SIG_L, doc.y + 1, { width: SIG_W, align: 'center' });
  f(doc, 9).fillColor('#555').text(`ग्रामपंचायत ${v.name}`, SIG_L, doc.y + 1, { width: SIG_W, align: 'center' });
  const SEAL_Y = doc.y + 2;

  // Right: GP Adhikari (mirror same rows)
  doc.y = SIG_Y;
  f(doc, 11).fillColor('#333').text('ग्रामपंचायत अधिकारी / GP Adhikari', SIG_R, SIG_Y, { width: SIG_W, align: 'center' });
  if (adhikari) f(doc, 11).fillColor('#111').text(adhikari, SIG_R, doc.y + 1, { width: SIG_W, align: 'center' });
  f(doc, 9).fillColor('#555').text(`ग्रामपंचायत ${v.name}`, SIG_R, doc.y + 1, { width: SIG_W, align: 'center' });

  // Seal text — placed right after the last name row, no extra moveDown
  f(doc, 9).fillColor('#888').text('(सही व शिक्का)', SIG_L, SEAL_Y, { width: SIG_W, align: 'center' });
  doc.y = SEAL_Y;
  f(doc, 9).fillColor('#888').text('(सही व शिक्का)', SIG_R, SEAL_Y, { width: SIG_W, align: 'center' });

  // ── QR + verify note (if QR at bottom, used for marriage) ─────────────────
  const now = new Date();
  const issueDate = formatDate(app.issuedAt || now);
  const issueTime = formatTime(app.issuedAt || now);

  if (qrBuf && opts.qrAtBottom) {
    const QR_SZ = 52;
    const QR_X = A4_W - M - 10 - QR_SZ;
    const QR_Y2 = A4_H - M - 68;
    doc.image(qrBuf, QR_X, QR_Y2, { width: QR_SZ, height: QR_SZ });
    f(doc, 5.5).fillColor('#888').text('Scan to verify', QR_X, QR_Y2 + QR_SZ + 1, { width: QR_SZ, align: 'center' });
  }

  // ── Footer bar — raised high enough for 2 wrapped lines to clear the inner border
  const BOT_Y = A4_H - M - 32;   // inner border bottom ≈ 799 pt; 2 lines ≈ 20 pt → divider at ~767 pt
  doc.lineWidth(0.3).moveTo(M + 7, BOT_Y - 2).lineTo(A4_W - M - 7, BOT_Y - 2).stroke('#ccd');
  f(doc, 7.5).fillColor('#888');
  doc.text(
    `हे प्रमाणपत्र ग्रामपंचायत कार्यालय, ${v.name}, ता. ${v.taluka}, जि. ${v.district} यांच्याद्वारे जारी केले आहे.  |  This certificate is officially issued by the Gram Panchayat ${v.name}.  |  Verify this certificate at: https://epanchayatraj.in/citizen/verify  |  ${issueDate}  ${issueTime}`,
    M + 7, BOT_Y + 1, { width: A4_W - (M + 7) * 2, align: 'center', lineGap: 1 }
  );
  doc.fillColor('#111');
}

// ─── para / label / labelRow helpers ─────────────────────────────────────────
function para(doc, text, opts = {}) {
  f(doc, opts.size || 11).fillColor(opts.color || '#111');
  doc.text(text, INN, doc.y, { width: TW, lineGap: 2, align: opts.align || 'justify', ...(opts.extra||{}) });
  doc.moveDown(opts.gap !== undefined ? opts.gap : 0.35);
}
function lbl(doc, key, val) {
  f(doc, 11).fillColor('#666').text(key + ' ', INN, doc.y, { continued: true, width: TW });
  f(doc, 10.5).fillColor('#111').text(val, { lineGap: 1 });
  doc.moveDown(0.2);
}
function lblRow(doc, pairs) {
  const HW = TW / 2 - 4;
  const YY = doc.y;
  pairs.forEach(([k, v], i) => {
    const x = INN + i * (HW + 8);
    // Write label in gray at fontSize 11
    f(doc, 11).fillColor('#666');
    const labelWidth = doc.widthOfString(k + ' ');
    doc.text(k + ' ', x, YY, { width: HW, continued: false });
    // Write value in black at fontSize 10.5, positioned right after the label on the same line
    f(doc, 10.5).fillColor('#111');
    doc.text(v, x + labelWidth, YY, { width: HW - labelWidth, continued: false });
  });
  // Advance Y position after both pairs are rendered
  doc.y = YY + 14;
  doc.moveDown(0.2);
}

// ═══════════════════════════════════════════════════════════════════════════════
// INDIVIDUAL CERTIFICATE GENERATORS
// ═══════════════════════════════════════════════════════════════════════════════

async function genBirth(doc, app) {
  const fd = app.formData || {};
  const v = getVI(app);
  const qr = await makeQR(app.certificateNo);
  await drawLetterhead(doc, app, 'जन्म प्रमाणपत्र', 'Birth Certificate (Form 5)', qr);
  f(doc, 10).fillColor('#666');
  doc.text('(जन्म व मृत्यू नोंदणी अधिनियम, १९६९ — कलम १२/१७ व महाराष्ट्र नियम २०००, नियम ८/१३ अन्वये)', INN, doc.y, { width: TW, align: 'center' });
  doc.moveDown(0.4);
  para(doc, `प्रमाणित करण्यात येत आहे की, खालील माहिती जन्माच्या मूळ अभिलेखाच्या नोंदवहीतून घेण्यात आली असून ग्रामपंचायत ${v.name}, ता. ${v.taluka}, जि. ${v.district}, महाराष्ट्र राज्याच्या नोंदवहीत अंतर्भूत आहे.`);
  lbl(doc, 'आधार कार्ड क्रमांक :', blank(app.applicantAadhar));
  lblRow(doc, [['बाळाचे पूर्ण नाव :', blank(fd.childName)], ['लिंग :', blank(fd.gender)]]);
  lblRow(doc, [['जन्म ठिकाण :', blank(fd.placeOfBirth || fd.birthPlace)], ['जन्म तारीख :', formatDate(fd.dateOfBirth || fd.birthDate)]]);
  lblRow(doc, [['आईचे पूर्ण नाव :', blank(fd.motherName)], ['वडिलांचे पूर्ण नाव :', blank(fd.fatherName)]]);
  lbl(doc, 'कायमचा पत्ता :', blank(fd.permanentAddress || fd.address));
  lblRow(doc, [['नोंदणी क्रमांक :', blank(app.certificateNo)], ['नोंदणी दिनांक :', formatDate(app.createdAt)]]);
  if (app.adminRemarks) lbl(doc, 'शेरा :', app.adminRemarks);
  doc.moveDown(0.3);
  para(doc, 'निबंधक, जन्म-मृत्यू नोंदणी अधिकारी यांच्या अधिकाराने हे प्रमाणपत्र दिले जात आहे.', { size: 8, color: '#555', gap: 0 });
  drawFooter(doc, app, qr);
}

async function genDeath(doc, app) {
  const fd = app.formData || {};
  const v = getVI(app);
  const qr = await makeQR(app.certificateNo);
  await drawLetterhead(doc, app, 'मृत्यू प्रमाणपत्र', 'Death Certificate (Form 5)', qr);
  f(doc, 10).fillColor('#666');
  doc.text('(जन्म व मृत्यू नोंदणी अधिनियम, १९६९ — कलम १२/१७ व महाराष्ट्र नियम २०००, नियम ८/१३ अन्वये)', INN, doc.y, { width: TW, align: 'center' });
  doc.moveDown(0.4);
  para(doc, `प्रमाणित करण्यात येत आहे की, खालील माहिती मृत्यूच्या मूळ अभिलेखाच्या नोंदवहीतून घेण्यात आली असून ग्रामपंचायत ${v.name}, ता. ${v.taluka}, जि. ${v.district}, महाराष्ट्र राज्याच्या नोंदवहीत अंतर्भूत आहे.`);
  lbl(doc, 'आधार कार्ड क्रमांक :', blank(app.applicantAadhar));
  lbl(doc, 'मृताचे पूर्ण नाव :', blank(fd.deceasedName));
  lblRow(doc, [['लिंग :', blank(fd.gender || '')], ['मृत्यू तारीख :', formatDate(fd.dateOfDeath || fd.deathDate)]]);
  lbl(doc, 'मृत्यू ठिकाण :', blank(fd.placeOfDeath || fd.deathPlace));
  lblRow(doc, [['आईचे नाव :', blank(fd.motherName || '')], ['वडिलांचे नाव :', blank(fd.fatherName || '')]]);
  lbl(doc, 'कायमचा पत्ता :', blank(fd.permanentAddress || fd.address || ''));
  lblRow(doc, [['नोंदणी क्रमांक :', blank(app.certificateNo)], ['नोंदणी दिनांक :', formatDate(app.createdAt)]]);
  if (app.adminRemarks) lbl(doc, 'शेरा :', app.adminRemarks);
  doc.moveDown(0.3);
  para(doc, 'निबंधक, जन्म-मृत्यू नोंदणी अधिकारी यांच्या अधिकाराने हे प्रमाणपत्र दिले जात आहे.', { size: 8, color: '#555', gap: 0 });
  drawFooter(doc, app, qr);
}

// ── Marriage — photos in top corners, QR at bottom ────────────────────────────
async function genMarriage(doc, app) {
  const fd = app.formData || {};
  const v = getVI(app);
  const qr = await makeQR(app.certificateNo);
  // opts.qrAtBottom = true => no QR at top in letterhead; footer gets QR
  await drawLetterhead(doc, app, 'विवाह नोंदणी प्रमाणपत्र', 'Certificate of Registration of Marriage (Form-E)', null, { qrAtBottom: true });

  // Photo placeholders in corners (after letterhead drawn)
  const PHOTO_W = 58; const PHOTO_H = 68;
  const PH_Y = M + 16;
  const PH_L = M + 10;    // groom — left corner
  const PH_R = A4_W - M - 10 - PHOTO_W;  // bride — right corner

  const drawPhotoBox = (x, y, label, photoPath) => {
    if (photoPath && fs.existsSync(photoPath)) {
      try { doc.image(photoPath, x, y, { width: PHOTO_W, height: PHOTO_H, fit: [PHOTO_W, PHOTO_H] }); }
      catch (e) { doc.rect(x, y, PHOTO_W, PHOTO_H).lineWidth(0.5).stroke('#bbb'); }
    } else {
      doc.rect(x, y, PHOTO_W, PHOTO_H).fillAndStroke('#f8f8f8', '#bbb');
      f(doc, 7).fillColor('#aaa').text(label, x, y + PHOTO_H/2 - 6, { width: PHOTO_W, align: 'center' });
    }
    f(doc, 7).fillColor('#555').text(label, x, y + PHOTO_H + 2, { width: PHOTO_W, align: 'center' });
  };
  drawPhotoBox(PH_L, PH_Y, 'वर (Groom)', fd.groomPhotoPath || null);
  drawPhotoBox(PH_R, PH_Y, 'वधू (Bride)', fd.bridePhotoPath || null);

  f(doc, 10).fillColor('#666');
  doc.text('म.वि.मं.वि.न.अ., १९९८ — कलम ६(४) व नियम ५ अन्वये', INN, doc.y, { width: TW, align: 'center' });
  doc.moveDown(0.3);
  para(doc, 'प्रमाणित करण्यात येते की,', { gap: 0.2 });

  f(doc, 10).fillColor('#1a3a5c').text('▸ वरास संबंधित माहिती — Groom Details', INN, doc.y, { width: TW });
  doc.moveDown(0.15);
  lbl(doc, 'वराचे नाव :', blank(fd.groomName));
  lbl(doc, 'आधार क्रमांक :', blank(fd.groomAadhar || ''));
  lbl(doc, 'रा. :', blank(fd.groomAddress || ''));
  doc.moveDown(0.2);
  f(doc, 10).fillColor('#1a3a5c').text('▸ वधूस संबंधित माहिती — Bride Details', INN, doc.y, { width: TW });
  doc.moveDown(0.15);
  lbl(doc, 'वधूचे नाव :', blank(fd.brideName));
  lbl(doc, 'आधार क्रमांक :', blank(fd.brideAadhar || ''));
  doc.moveDown(0.2);
  para(doc, `उभयतांचा विवाह दिनांक ${formatDate(fd.marriageDate)} रोजी ${blank(fd.marriagePlace)} येथे संपन्न झाला असून, सदर विवाह महाराष्ट्र विवाह नोंदणी अधिनियम, १९९८ नुसार नोंदविण्यात आला आहे.`);
  para(doc, `नोंदवहीत खंड क्र. ${blank(fd.volumeNo || '')} च्या अनुक्रमांक ${blank(fd.serialNo || app.certificateNo)} वर नोंद करण्यात आलेली आहे.`, { gap: 0.2 });
  if (app.adminRemarks) lbl(doc, 'शेरा :', app.adminRemarks);
  doc.moveDown(0.2);
  para(doc, 'सदर नोंदणी माझ्याकडून करण्यात आली असून हे अधिकृत प्रमाणपत्र देण्यात येत आहे.', { size: 9.5, color: '#555', gap: 0 });
  drawFooter(doc, app, qr, { qrAtBottom: true });
}

async function genResidence(doc, app) {
  const v = getVI(app);
  const qr = await makeQR(app.certificateNo);
  await drawLetterhead(doc, app, 'रहिवासी दाखला', 'Residence Certificate', qr);
  para(doc, `ग्रामपंचायत ${v.name}, ता. ${v.taluka}, जि. ${v.district} यांजकडून हे प्रमाणपत्र प्रदान केले जात आहे की,`);
  lbl(doc, 'अर्जदाराचे नाव :', `श्री/श्रीमती ${blank(app.applicantName)}`);
  lbl(doc, 'आधार कार्ड क्रमांक :', blank(app.applicantAadhar));
  lbl(doc, 'राहणार :', `${v.name}, ता. ${v.taluka}, जि. ${v.district}, महाराष्ट्र`);
  para(doc, `हे/ह्या ग्रामपंचायत ${v.name} हद्दीतील मौजे ${v.name}, ता. ${v.taluka}, जि. ${v.district}, महाराष्ट्र येथील कायम रहिवासी आहेत.`);
  para(doc, 'सदर दाखला अर्जदाराच्या विनंती अर्जानुसार, रहिवासी पुराव्याची पडताळणी व स्थानिक चौकशीच्या आधारे देण्यात येत आहे.', { size: 10, color: '#555', gap: 0 });
  if (app.adminRemarks) lbl(doc, 'शेरा :', app.adminRemarks);
  drawFooter(doc, app, qr);
}

async function genBPL(doc, app) {
  const fd = app.formData || {};
  const v = getVI(app);
  const qr = await makeQR(app.certificateNo);
  await drawLetterhead(doc, app, 'दारिद्रय रेषेखालील कुटुंबाचा दाखला', 'Below Poverty Line (BPL) Certificate', qr);
  para(doc, `ग्रामपंचायत ${v.name}, ता. ${v.taluka}, जि. ${v.district} यांजकडून दाखला देण्यात येतो की,`);
  lbl(doc, 'अर्जदाराचे नाव :', `श्री/श्रीमती ${blank(app.applicantName)}`);
  lbl(doc, 'आधार कार्ड क्रमांक :', blank(app.applicantAadhar));
  lbl(doc, 'राहणार :', `${v.name}, ता. ${v.taluka}, जि. ${v.district}, महाराष्ट्र`);
  const bplYear = fd.bplYear || new Date().getFullYear();
  const bplNo   = fd.bplListNo || fd.rationCardNo || '________________';
  para(doc, `यांचा सन ${bplYear} या वर्षातील दारिद्रय रेषेखालील यादीतील क्रमांक ${bplNo} आहे.`);
  if (fd.relation) para(doc, `श्री/श्रीमती ${blank(app.applicantName)} यांचा/यांची ${blank(fd.relation)} आहे.`);
  para(doc, 'सदर दाखला अर्जदाराच्या विनंती अर्जानुसार, अधिकृत BPL यादीच्या आधारे देण्यात येत आहे.', { size: 10, color: '#555', gap: 0 });
  if (app.adminRemarks) lbl(doc, 'शेरा :', app.adminRemarks);
  drawFooter(doc, app, qr);
}

async function genLiving(doc, app) {
  const v = getVI(app);
  const qr = await makeQR(app.certificateNo);
  await drawLetterhead(doc, app, 'हयातीचा दाखला', 'Living Certificate', qr);
  para(doc, `ग्रामपंचायत ${v.name}, ता. ${v.taluka}, जि. ${v.district} यांजकडून दाखला देण्यात येतो की,`);
  lbl(doc, 'अर्जदाराचे नाव :', `श्री/श्रीमती ${blank(app.applicantName)}`);
  lbl(doc, 'आधार कार्ड क्रमांक :', blank(app.applicantAadhar));
  lbl(doc, 'राहणार :', `${v.name}, ता. ${v.taluka}, जि. ${v.district}`);
  para(doc, `सदर व्यक्ती अद्याप दिनांक ${formatDate(app.issuedAt || new Date())} रोजी हयात असून त्यांनी माझ्या समक्ष सही/अंगठा केला आहे.`);
  doc.moveDown(0.6);
  f(doc, 10).fillColor('#555').text('अर्जदाराची सही / अंगठा', INN, doc.y, { width: 150, align: 'center' });
  doc.moveDown(0.15);
  para(doc, 'सदर दाखला अर्जदाराच्या मागणीनुसार देण्यात येत आहे.', { size: 10, color: '#555', gap: 0 });
  if (app.adminRemarks) lbl(doc, 'शेरा :', app.adminRemarks);
  drawFooter(doc, app, qr);
}

async function genNoDues(doc, app) {
  const v = getVI(app);
  const qr = await makeQR(app.certificateNo);
  await drawLetterhead(doc, app, 'थकबाकी नसल्याचे प्रमाणपत्र', 'No Dues Certificate', qr);
  para(doc, `ग्रामपंचायत ${v.name}, ता. ${v.taluka}, जि. ${v.district} यांजकडून प्रमाणित करण्यात येते की,`);
  lbl(doc, 'अर्जदाराचे नाव :', `श्री/श्रीमती ${blank(app.applicantName)}`);
  lbl(doc, 'आधार कार्ड क्रमांक :', blank(app.applicantAadhar));
  lbl(doc, 'राहणार :', `${v.name}, ता. ${v.taluka}, जि. ${v.district}, महाराष्ट्र`);
  para(doc, `हे/ह्या मौजे ${v.name}, ता. ${v.taluka}, जि. ${v.district}, महाराष्ट्र येथील कायमचे रहिवासी असून त्यांच्याकडे ग्रामपंचायतीची कोणत्याही प्रकारची थकबाकी नाही.`);
  para(doc, 'सदर दाखला अर्जदाराच्या विनंती अर्जानुसार, ग्रामपंचायत अभिलेखाच्या आधारे देण्यात येत आहे.', { size: 10, color: '#555', gap: 0 });
  if (app.adminRemarks) lbl(doc, 'शेरा :', app.adminRemarks);
  drawFooter(doc, app, qr);
}

async function genToilet(doc, app) {
  const fd = app.formData || {};
  const v = getVI(app);
  const qr = await makeQR(app.certificateNo);
  await drawLetterhead(doc, app, 'शौचालय दाखला', 'Toilet / Sanitation Certificate', qr);
  para(doc, `ग्रामपंचायत ${v.name}, ता. ${v.taluka}, जि. ${v.district} यांजकडून दाखला देण्यात येतो की,`);
  lbl(doc, 'अर्जदाराचे नाव :', `श्री/श्रीमती ${blank(app.applicantName)}`);
  lbl(doc, 'आधार कार्ड क्रमांक :', blank(app.applicantAadhar));
  lbl(doc, 'राहणार :', `${v.name}, ता. ${v.taluka}, जि. ${v.district}, महाराष्ट्र`);
  const prop = fd.propertyNo || fd.address || '______________________________';
  para(doc, `त्यांच्या ग्रामपंचायत मिळकत क्र. ${prop} मध्ये शौचालय असून ते त्याचा वापर करीत आहेत.`);
  para(doc, 'सदर दाखला अर्जदाराच्या मागणीनुसार देण्यात येत आहे.', { size: 10, color: '#555', gap: 0 });
  if (app.adminRemarks) lbl(doc, 'शेरा :', app.adminRemarks);
  drawFooter(doc, app, qr);
}

async function genNiradhar(doc, app) {
  const v = getVI(app);
  const qr = await makeQR(app.certificateNo);
  await drawLetterhead(doc, app, 'निराधार असल्याचा दाखला', 'Certificate of Niradhar (Destitute)', qr);
  para(doc, `ग्रामपंचायत ${v.name}, ता. ${v.taluka}, जि. ${v.district} यांजकडून दाखला देण्यात येतो की,`);
  lbl(doc, 'अर्जदाराचे नाव :', `श्री/श्रीमती ${blank(app.applicantName)}`);
  lbl(doc, 'आधार कार्ड क्रमांक :', blank(app.applicantAadhar));
  lbl(doc, 'राहणार :', `${v.name}, ता. ${v.taluka}, जि. ${v.district}, महाराष्ट्र`);
  para(doc, 'सदर व्यक्ती निराधार असून त्यांना उदरनिर्वाहासाठी कोणाचाही आधार नाही.');
  para(doc, 'सदर दाखला अर्जदाराच्या विनंती अर्जानुसार स्थानिक चौकशीच्या आधारे देण्यात येत आहे.', { size: 10, color: '#555', gap: 0 });
  if (app.adminRemarks) lbl(doc, 'शेरा :', app.adminRemarks);
  drawFooter(doc, app, qr);
}

async function genWidow(doc, app) {
  const fd = app.formData || {};
  const v = getVI(app);
  const qr = await makeQR(app.certificateNo);
  await drawLetterhead(doc, app, 'विधवा असल्याचा दाखला', 'Widow Certificate', qr);
  para(doc, `ग्रामपंचायत ${v.name}, ता. ${v.taluka}, जि. ${v.district} यांजकडून दाखला देण्यात येतो की,`);
  lbl(doc, 'अर्जदाराचे नाव :', `श्रीमती ${blank(app.applicantName)}`);
  lbl(doc, 'आधार कार्ड क्रमांक :', blank(app.applicantAadhar));
  lbl(doc, 'राहणार :', `${v.name}, ता. ${v.taluka}, जि. ${v.district}, महाराष्ट्र`);
  para(doc, `श्रीमती ${blank(app.applicantName)} यांचे पती कै. श्री. ${blank(fd.husbandName)} हे मयत असून त्या विधवा आहेत.`);
  para(doc, 'सदरचा दाखला अर्जदाराच्या मागणीनुसार, पतीच्या मृत्यूच्या दाखल्यावरून व स्थानिक चौकशी करून देण्यात येत आहे.', { size: 10, color: '#555', gap: 0 });
  if (app.adminRemarks) lbl(doc, 'शेरा :', app.adminRemarks);
  drawFooter(doc, app, qr);
}

async function genDeserted(doc, app) {
  const v = getVI(app);
  const qr = await makeQR(app.certificateNo);
  await drawLetterhead(doc, app, 'परित्यक्त्या प्रमाणपत्र', 'Certificate of Deserted Woman', qr);
  para(doc, `ग्रामपंचायत ${v.name}, ता. ${v.taluka}, जि. ${v.district} यांजकडून दाखला देण्यात येतो की,`);
  lbl(doc, 'अर्जदाराचे नाव :', `श्रीमती ${blank(app.applicantName)}`);
  lbl(doc, 'आधार कार्ड क्रमांक :', blank(app.applicantAadhar));
  lbl(doc, 'राहणार :', `${v.name}, ता. ${v.taluka}, जि. ${v.district}, महाराष्ट्र`);
  para(doc, `श्रीमती ${blank(app.applicantName)} या परित्यक्त्या असून त्यांनी आजपर्यंत पुनर्विवाह केलेला नाही.`);
  para(doc, 'सदरचे प्रमाणपत्र अर्जदाराच्या मागणीनुसार, प्रतिज्ञापत्र व स्थानिक चौकशी करून देण्यात येत आहे.', { size: 10, color: '#555', gap: 0 });
  if (app.adminRemarks) lbl(doc, 'शेरа :', app.adminRemarks);
  drawFooter(doc, app, qr);
}

async function genNuclearFamily(doc, app) {
  const fd = app.formData || {};
  const v = getVI(app);
  const qr = await makeQR(app.certificateNo);
  await drawLetterhead(doc, app, 'विभक्त कुटुंब प्रमाणपत्र', 'Nuclear Family Certificate', qr);
  para(doc, `ग्रामपंचायत ${v.name}, ता. ${v.taluka}, जि. ${v.district} यांजकडून दाखला देण्यात येतो की,`);
  lbl(doc, 'अर्जदाराचे नाव :', `श्री/श्रीमती ${blank(app.applicantName)}`);
  lbl(doc, 'आधार कार्ड क्रमांक :', blank(app.applicantAadhar));
  lbl(doc, 'राहणार :', `${v.name}, ता. ${v.taluka}, जि. ${v.district}, महाराष्ट्र`);
  para(doc, 'सदर व्यक्ती त्यांच्या कुटुंबातील पुढील सदस्यांसह स्वतंत्र कुटुंबधारक आहेत:', { gap: 0.15 });
  const mNums = ['१', '२', '३', '४', '५', '६', '७', '८', '९', '१०'];
  const members = (fd.familyMembers || '').split(/[,\n]/).map(m => m.trim()).filter(m => m);
  f(doc, 10.5).fillColor('#111');
  if (members.length > 0) {
    members.forEach((m, i) => { doc.text(`  ${mNums[i] || (i+1)})  ${m}`, INN+10, doc.y, { width: TW-10 }); doc.moveDown(0.2); });
  } else {
    for (let i = 0; i < 4; i++) { doc.text(`  ${mNums[i]})  ____________________________`, INN+10, doc.y, { width: TW-10 }); doc.moveDown(0.2); }
  }
  doc.moveDown(0.2);
  para(doc, 'स्थानिक चौकशीच्या आधारे विभक्त कुटुंब प्रमाणपत्र अर्जदाराच्या विनंती अर्जानुसार देण्यात येत आहे.', { size: 10, color: '#555', gap: 0 });
  if (app.adminRemarks) lbl(doc, 'शेरा :', app.adminRemarks);
  drawFooter(doc, app, qr);
}

async function genGeneric(doc, app) {
  const fd = app.formData || {};
  const v = getVI(app);
  const qr = await makeQR(app.certificateNo);
  const nameMr = app.certificateType?.nameMarathi || 'प्रमाणपत्र';
  const nameEn = app.certificateType?.nameEnglish || 'Certificate';
  await drawLetterhead(doc, app, nameMr, nameEn, qr);
  para(doc, `ग्रामपंचायत ${v.name}, ता. ${v.taluka}, जि. ${v.district} यांजकडून दाखला देण्यात येतो की,`);
  lbl(doc, 'अर्जदाराचे नाव :', `श्री/श्रीमती ${blank(app.applicantName)}`);
  lbl(doc, 'आधार कार्ड क्रमांक :', blank(app.applicantAadhar));
  lbl(doc, 'राहणार :', `${v.name}, ता. ${v.taluka}, जि. ${v.district}, महाराष्ट्र`);
  Object.entries(fd).forEach(([k, val]) => { if (val) lbl(doc, `${k} :`, String(val)); });
  doc.moveDown(0.2);
  para(doc, 'सदर दाखला अर्जदाराच्या विनंती अर्जानुसार देण्यात येत आहे.', { size: 10, color: '#555', gap: 0 });
  if (app.adminRemarks) lbl(doc, 'शेरा :', app.adminRemarks);
  drawFooter(doc, app, qr);
}

// ═══════════════════════════════════════════════════════════════════════════════
// RECEIPT
// ═══════════════════════════════════════════════════════════════════════════════
async function genReceipt(doc, app) {
  const v = getVI(app);
  const { sarpanch, adhikari } = getOfficers(app);
  const payment = app.payment;
  const qr = await makeQR(app.certificateNo);
  const now = new Date();

  // Border
  doc.lineWidth(2.2).rect(M, M, A4_W-M*2, A4_H-M*2).stroke('#1a3a5c');
  doc.lineWidth(0.7).rect(M+5, M+5, A4_W-(M+5)*2, A4_H-(M+5)*2).stroke('#4a7fa5');

  // Logo absolute top-left
  const LSZ = 65; const LX = M+10; const LY = M+12;
  if (fs.existsSync(LOGO_PATH)) {
    try { doc.image(LOGO_PATH, LX, LY, { width: LSZ, height: LSZ, fit: [LSZ, LSZ] }); }
    catch (e) { doc.circle(LX+LSZ/2, LY+LSZ/2, LSZ/2-2).lineWidth(0.8).stroke('#bbb'); }
  }

  // QR absolute top-right
  const QSZ = 55; const QX = A4_W-M-10-QSZ; const QY = M+14;
  doc.image(qr, QX, QY, { width: QSZ, height: QSZ });
  f(doc, 5.5).fillColor('#888').text('Scan to verify', QX, QY+QSZ+1, { width: QSZ, align: 'center' });

  // Centered header
  f(doc, 9).fillColor('#555').text('महाराष्ट्र शासन  |  Government of Maharashtra', M, M+16, { width: A4_W-M*2, align: 'center' });
  f(doc, 19).fillColor('#1a3a5c').text(`ग्रामपंचायत ${v.name}`, M, doc.y+1, { width: A4_W-M*2, align: 'center' });
  f(doc, 11).fillColor('#444').text(`Gram Panchayat ${v.name}  |  ता. ${v.taluka}  |  जि. ${v.district}`, M, doc.y+1, { width: A4_W-M*2, align: 'center' });

  const D1 = Math.max(doc.y+7, LY+LSZ+6);
  doc.lineWidth(1.8).moveTo(M+7, D1).lineTo(A4_W-M-7, D1).stroke('#1a3a5c');
  f(doc, 16).fillColor('#1a3a5c').text('दाखल्याबद्दल पावती', M+7, D1+8, { width: A4_W-(M+7)*2, align: 'center' });
  f(doc, 10.5).fillColor('#666').text('Payment Receipt', M+7, doc.y+1, { width: A4_W-(M+7)*2, align: 'center' });
  doc.lineWidth(0.4).moveTo(M+7, doc.y+5).lineTo(A4_W-M-7, doc.y+5).stroke('#dde');
  doc.y = doc.y + 10;

  const IY = doc.y; const RW = TW;
  f(doc, 10.5).fillColor('#333').text(`पावती क्रमांक: ${blank(payment?.receiptNo)}`, INN, IY, { width: RW });
  f(doc, 10.5).fillColor('#333').text(`दिनांक: ${formatDate(payment?.verifiedAt || now)}  वेळ: ${formatTime(payment?.verifiedAt || now)}`, INN, IY, { width: RW, align: 'right' });
  doc.y = IY + 16;
  doc.moveDown(0.3);

  f(doc, 11).fillColor('#111').text(`श्री./श्रीमती: ${blank(app.applicantName)}`, INN, doc.y, { width: RW });
  f(doc, 10.5).fillColor('#555').text(`रा. ${v.name}, ता. ${v.taluka}, जि. ${v.district}`, INN, doc.y, { width: RW });
  doc.moveDown(0.5);

  const certName = app.certificateType?.nameMarathi || 'दाखला';
  const amount   = payment?.amount || app.certificateType?.fee || 0;

  f(doc, 11).fillColor('#111').text(`"${certName}" साठी जमा रक्कम: `, INN, doc.y, { width: RW, continued: true });
  f(doc, 13.5).fillColor('#1a3a5c').text(`₹${amount}/-`, { continued: false });
  f(doc, 10.5).fillColor('#555').text(`अक्षरी: ${numberToMarathiWords(amount)}`, INN, doc.y+1, { width: RW });
  doc.moveDown(0.3);

  if (payment?.paymentMethod) {
    const ml = { cash: 'रोख (Cash)', upi: 'UPI', free: 'निशुल्क (Free)' }[payment.paymentMethod] || payment.paymentMethod;
    f(doc, 10.5).fillColor('#444').text(`पेमेंट पद्धत: ${ml}`, INN, doc.y, { width: RW });
    if (payment.utrNumber) f(doc, 10.5).fillColor('#444').text(`UTR/व्यवहार क्र.: ${payment.utrNumber}`, INN, doc.y, { width: RW });
  }

  // Signature block — Sarpanch left, Adhikari right
  doc.moveDown(4.5);
  const SIG_TOP = doc.y;
  const SW = 175; const SL = M + 10; const SR = A4_W - M - 10 - SW;

  f(doc, 11).fillColor('#333').text('सरपंच / Sarpanch', SL, SIG_TOP, { width: SW, align: 'center' });
  if (sarpanch) f(doc, 11).fillColor('#111').text(sarpanch, SL, doc.y + 1, { width: SW, align: 'center' });
  f(doc, 9).fillColor('#555').text(`ग्रामपंचायत ${v.name}`, SL, doc.y + 1, { width: SW, align: 'center' });
  const RSEAL_Y = doc.y + 2;

  doc.y = SIG_TOP;
  f(doc, 11).fillColor('#333').text('ग्रामपंचायत अधिकारी / GP Adhikari', SR, SIG_TOP, { width: SW, align: 'center' });
  if (adhikari) f(doc, 11).fillColor('#111').text(adhikari, SR, doc.y + 1, { width: SW, align: 'center' });
  f(doc, 9).fillColor('#555').text(`ग्रामपंचायत ${v.name}`, SR, doc.y + 1, { width: SW, align: 'center' });

  // Seal text — flush after name rows, no overlap
  f(doc, 9).fillColor('#888').text('(सही व शिक्का)', SL, RSEAL_Y, { width: SW, align: 'center' });
  doc.y = RSEAL_Y;
  f(doc, 9).fillColor('#888').text('(सही व शिक्का)', SR, RSEAL_Y, { width: SW, align: 'center' });

  // ── Footer bar — raised enough for 2 wrapped lines to stay inside the border
  const receiptDate = formatDate(payment?.verifiedAt || now);
  const receiptTime = formatTime(payment?.verifiedAt || now);
  const BOT_Y = A4_H - M - 32;
  doc.lineWidth(0.3).moveTo(M + 7, BOT_Y - 2).lineTo(A4_W - M - 7, BOT_Y - 2).stroke('#ccd');
  f(doc, 7.5).fillColor('#888').text(
    `ही पावती ग्रामपंचायत कार्यालय, ${v.name}, ता. ${v.taluka}, जि. ${v.district} यांच्याद्वारे जारी केली आहे.  |  This receipt is officially issued by the Gram Panchayat ${v.name}.  |  Verify: https://epanchayatraj.in/citizen/verify  |  ${receiptDate}  ${receiptTime}`,
    M + 7, BOT_Y + 1, { width: A4_W - (M + 7) * 2, align: 'center', lineGap: 1 }
  );
  doc.fillColor('#111');
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
export async function generateCertificatePDF(applicationId) {
  const application = await prisma.certificateApplication.findUnique({
    where: { id: applicationId },
    include: {
      certificateType: true,
      village: { include: { tehsil: true, members: { where: { isActive: true }, select: { name: true, type: true } } } },
      family: { select: { familyId: true, headName: true, headAadhar: true } },
      familyMember: { select: { name: true, aadhar: true } },
      payment: true,
    },
  });
  if (!application) throw new Error('Application not found');

  // Update DB to store only the generation timestamp (no file storage)
  await prisma.certificateApplication.update({
    where: { id: applicationId },
    data: { pdfGeneratedAt: new Date() }
  }).catch(() => {});

  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true });
    const chunks = [];
    
    // Collect PDF data in memory instead of writing to file
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    
    try {
      doc.registerFont('deva', DEVA_FONT);
      doc.font('deva');
      const code = application.certificateType?.code || '';
      switch (code) {
        case 'birth':          await genBirth(doc, application);         break;
        case 'death':          await genDeath(doc, application);         break;
        case 'marriage':       await genMarriage(doc, application);      break;
        case 'residence':      await genResidence(doc, application);     break;
        case 'bpl':            await genBPL(doc, application);           break;
        case 'living':         await genLiving(doc, application);        break;
        case 'no_dues':        await genNoDues(doc, application);        break;
        case 'toilet':         await genToilet(doc, application);        break;
        case 'niradhar':       await genNiradhar(doc, application);      break;
        case 'widow':          await genWidow(doc, application);         break;
        case 'deserted':       await genDeserted(doc, application);      break;
        case 'nuclear_family': await genNuclearFamily(doc, application); break;
        default:               await genGeneric(doc, application);
      }
      doc.end();
    } catch (err) { doc.end(); reject(err); }
  });
}

export async function generateReceiptPDF(applicationId) {
  const application = await prisma.certificateApplication.findUnique({
    where: { id: applicationId },
    include: {
      certificateType: true,
      village: { include: { tehsil: true, members: { where: { isActive: true }, select: { name: true, type: true } } } },
      family: { select: { familyId: true, headName: true } },
      payment: true,
    },
  });
  if (!application) throw new Error('Application not found');

  // Update DB to store only the generation timestamp (no file storage)
  await prisma.certificatePayment.update({
    where: { applicationId },
    data: { receiptGeneratedAt: new Date() }
  }).catch(() => {});

  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true });
    const chunks = [];
    
    // Collect PDF data in memory instead of writing to file
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    
    try {
      doc.registerFont('deva', DEVA_FONT);
      doc.font('deva');
      await genReceipt(doc, application);
      doc.end();
    } catch (err) { doc.end(); reject(err); }
  });
}
