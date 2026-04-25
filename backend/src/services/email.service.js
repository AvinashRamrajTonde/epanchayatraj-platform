import nodemailer from 'nodemailer';
import prisma from '../config/db.js';

/**
 * Email service – reads SMTP config from database (SmtpConfig table).
 * Falls back to console logging in development when no SMTP config is active.
 */

let _transporter = null;
let _configCache = null;
let _cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getSmtpConfig() {
  const now = Date.now();
  if (_configCache && now - _cacheTime < CACHE_TTL) return _configCache;

  const config = await prisma.smtpConfig.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: 'desc' },
  });

  _configCache = config;
  _cacheTime = now;
  return config;
}

async function getTransporter() {
  const config = await getSmtpConfig();
  if (!config) return null;

  // Recreate transporter if config changed
  if (!_transporter || _configCache?.updatedAt?.getTime?.() !== _cacheTime) {
    _transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.username,
        pass: config.password,
      },
    });
  }

  return _transporter;
}

export async function sendOTPEmail(email, otp) {
  const config = await getSmtpConfig();
  if (!config) {
    console.log(`[SMTP NOT CONFIGURED] OTP for ${email}: ${otp}`);
    return { sent: false, reason: 'SMTP not configured' };
  }
  const html = `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #333;">🏛️ ग्रामपंचायत नागरिक पोर्टल</h2>
          </div>
          <div style="background: #f8f9fa; border-radius: 8px; padding: 24px; text-align: center;">
            <p style="color: #555; margin-bottom: 16px;">तुमचा OTP सत्यापन कोड:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #e65100; margin: 16px 0;">
              ${otp}
            </div>
            <p style="color: #888; font-size: 13px; margin-top: 16px;">
              हा कोड १० मिनिटांसाठी वैध आहे.<br/>
              This code is valid for 10 minutes.
            </p>
          </div>
          <p style="color: #aaa; font-size: 11px; text-align: center; margin-top: 20px;">
            तुम्ही हा कोड मागवला नसल्यास, कृपया दुर्लक्ष करा.
          </p>
        </div>
      `;
  return sendEmail(email, 'ग्रामपंचायत पोर्टल - OTP सत्यापन कोड', html);
}

// Clear cached config (call when superadmin updates SMTP settings)
export function clearSmtpCache() {
  _configCache = null;
  _cacheTime = 0;
  _transporter = null;
}

/**
 * Generic email sender — used by all internal notification functions.
 * @param {string|string[]} to
 * @param {string} subject
 * @param {string} html
 * @param {Array} [attachments]
 */
export async function sendEmail(to, subject, html, attachments = []) {
  const config = await getSmtpConfig();
  const transporter = await getTransporter();

  if (!transporter || !config) {
    console.log(`[SMTP NOT CONFIGURED] Would send "${subject}" to ${to}`);
    return { sent: false, reason: 'SMTP not configured' };
  }

  try {
    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      attachments,
    });
    console.log(`[EMAIL] "${subject}" sent to ${to}`);
    return { sent: true };
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send "${subject}" to ${to}:`, err.message);
    return { sent: false, reason: err.message };
  }
}

/**
 * Welcome email sent to village admin on onboarding.
 */
export async function sendWelcomeEmail({ adminEmail, adminName, villageName, loginUrl, defaultPassword }) {
  const subject = `स्वागत! ${villageName} - ग्रामपंचायत पोर्टल तयार आहे`;
  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(135deg, #1a3c5e 0%, #e65100 100%); padding: 32px 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">🏛️ GPMH ग्रामपंचायत पोर्टल</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">ग्राम पंचायत महाराष्ट्र</p>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #1a3c5e; margin-top: 0;">नमस्कार ${adminName},</h2>
        <p style="color: #444; line-height: 1.7;">
          <strong>${villageName}</strong> ग्रामपंचायतीचे डिजिटल पोर्टल यशस्वीरित्या तयार झाले आहे! 
          आपल्या गावासाठी आधुनिक ऑनलाइन सेवा सुरू करण्यास आम्ही उत्सुक आहोत.
        </p>
        <div style="background: #f8f9fa; border-left: 4px solid #e65100; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 12px; color: #333; font-size: 15px;">🔑 लॉगिन माहिती</h3>
          <table style="width: 100%; font-size: 14px; color: #555;">
            <tr><td style="padding: 4px 0; font-weight: bold;">पोर्टल URL:</td><td><a href="${loginUrl}" style="color: #e65100;">${loginUrl}</a></td></tr>
            <tr><td style="padding: 4px 0; font-weight: bold;">Email:</td><td>${adminEmail}</td></tr>
            <tr><td style="padding: 4px 0; font-weight: bold;">पासवर्ड:</td><td style="font-family: monospace; background: #fff; padding: 2px 8px; border-radius: 4px; border: 1px solid #ddd;">${defaultPassword}</td></tr>
          </table>
        </div>
        <div style="background: #fff3e0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0; color: #e65100; font-size: 13px;">
            ⚠️ <strong>महत्त्वाचे:</strong> पहिल्यांदा लॉगिन केल्यानंतर ताबडतोब पासवर्ड बदलावा.
          </p>
        </div>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${loginUrl}" style="display: inline-block; background: #e65100; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: bold;">
            🚀 पोर्टलमध्ये प्रवेश करा
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <h3 style="color: #1a3c5e; font-size: 15px;">📋 पुढील पायऱ्या</h3>
        <ol style="color: #555; line-height: 2; padding-left: 20px; font-size: 14px;">
          <li>पोर्टलमध्ये लॉगिन करा आणि पासवर्ड बदला</li>
          <li>ग्रामपंचायत माहिती व फोटो अपलोड करा</li>
          <li>सदस्यांची (सरपंच, उप-सरपंच) माहिती भरा</li>
          <li>नागरिकांना पोर्टलची माहिती द्या</li>
        </ol>
        <p style="color: #888; font-size: 13px; margin-top: 24px;">
          कोणत्याही मदतीसाठी आमच्या सपोर्ट टीमशी संपर्क करा.<br/>
          <strong>GPMH Support Team</strong>
        </p>
      </div>
      <div style="background: #f8f9fa; padding: 16px 24px; text-align: center;">
        <p style="color: #aaa; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} GPMH — ग्राम पंचायत महाराष्ट्र | हा एक स्वयंचलित ईमेल आहे.</p>
      </div>
    </div>
  `;
  return sendEmail(adminEmail, subject, html);
}

/**
 * Subscription renewal receipt email.
 */
export async function sendRenewalReceiptEmail({ adminEmail, villageName, receiptNo, amount, startDate, endDate, paymentMethod, loginUrl }) {
  const subject = `पावती #${receiptNo} — ${villageName} वार्षिक नूतनीकरण`;
  const fmt = (d) => new Date(d).toLocaleDateString('mr-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(135deg, #1a3c5e 0%, #2e7d32 100%); padding: 28px 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 20px;">🏛️ GPMH ग्रामपंचायत पोर्टल</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px;">नूतनीकरण पावती / Renewal Receipt</p>
      </div>
      <div style="padding: 28px 24px;">
        <div style="background: #e8f5e9; border-radius: 8px; padding: 16px; margin-bottom: 20px; text-align: center;">
          <p style="margin: 0; color: #2e7d32; font-size: 13px; font-weight: bold;">✅ सदस्यता यशस्वीरित्या नूतनीकरण झाली</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="background: #f8f9fa;"><td style="padding: 10px 14px; font-weight: bold; color: #555; border: 1px solid #eee;">गाव (Village)</td><td style="padding: 10px 14px; border: 1px solid #eee;">${villageName}</td></tr>
          <tr><td style="padding: 10px 14px; font-weight: bold; color: #555; border: 1px solid #eee;">पावती क्रमांक</td><td style="padding: 10px 14px; border: 1px solid #eee; font-family: monospace;">${receiptNo}</td></tr>
          <tr style="background: #f8f9fa;"><td style="padding: 10px 14px; font-weight: bold; color: #555; border: 1px solid #eee;">रक्कम (Amount)</td><td style="padding: 10px 14px; border: 1px solid #eee;"><strong style="color: #2e7d32;">₹${amount}</strong></td></tr>
          <tr><td style="padding: 10px 14px; font-weight: bold; color: #555; border: 1px solid #eee;">पेमेंट पद्धत</td><td style="padding: 10px 14px; border: 1px solid #eee;">${paymentMethod || '-'}</td></tr>
          <tr style="background: #f8f9fa;"><td style="padding: 10px 14px; font-weight: bold; color: #555; border: 1px solid #eee;">सेवा सुरुवात</td><td style="padding: 10px 14px; border: 1px solid #eee;">${fmt(startDate)}</td></tr>
          <tr><td style="padding: 10px 14px; font-weight: bold; color: #555; border: 1px solid #eee;">सेवा समाप्ती</td><td style="padding: 10px 14px; border: 1px solid #eee; color: #e65100; font-weight: bold;">${fmt(endDate)}</td></tr>
        </table>
        <div style="text-align: center; margin: 28px 0 8px;">
          <a href="${loginUrl}" style="display: inline-block; background: #1a3c5e; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px;">पोर्टल उघडा</a>
        </div>
      </div>
      <div style="background: #f8f9fa; padding: 14px 24px; text-align: center;">
        <p style="color: #aaa; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} GPMH — ग्राम पंचायत महाराष्ट्र</p>
      </div>
    </div>
  `;
  return sendEmail(adminEmail, subject, html);
}

/**
 * Renewal reminder email — sent when subscription is expiring soon.
 */
export async function sendRenewalReminderEmail({ adminEmail, villageName, daysLeft, endDate, renewUrl }) {
  const urgency = daysLeft <= 7 ? '🔴 तातडीने' : daysLeft <= 15 ? '🟠 लवकरच' : '🟡 आगामी';
  const subject = `${urgency}: ${villageName} सेवा ${daysLeft} दिवसांत संपणार`;
  const fmt = (d) => new Date(d).toLocaleDateString('mr-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const html = `
    <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      <div style="background: ${daysLeft <= 7 ? '#c62828' : daysLeft <= 15 ? '#e65100' : '#f57f17'}; padding: 28px 24px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 20px;">🏛️ GPMH — नूतनीकरण स्मरणपत्र</h1>
      </div>
      <div style="padding: 28px 24px;">
        <p style="color: #444; font-size: 15px; line-height: 1.7;">नमस्कार,<br/>
        <strong>${villageName}</strong> ग्रामपंचायत पोर्टलची सेवा <strong style="color: #c62828;">${fmt(endDate)}</strong> रोजी, म्हणजेच फक्त <strong>${daysLeft} दिवसांत</strong> संपणार आहे.</p>
        <div style="background: #fff3e0; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; color: #e65100; font-size: 14px;">वेळेत नूतनीकरण न केल्यास पोर्टल सेवा बंद होईल आणि नागरिकांना सेवा उपलब्ध होणार नाही.</p>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${renewUrl}" style="display: inline-block; background: #e65100; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: bold;">🔄 आत्ताच नूतनीकरण करा</a>
        </div>
        <p style="color: #888; font-size: 13px;">मदतीसाठी GPMH सपोर्ट टीमशी संपर्क करा.</p>
      </div>
      <div style="background: #f8f9fa; padding: 14px 24px; text-align: center;">
        <p style="color: #aaa; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} GPMH — ग्राम पंचायत महाराष्ट्र</p>
      </div>
    </div>
  `;
  return sendEmail(adminEmail, subject, html);
}

export async function sendPasswordResetEmail(email, otp) {
  const config = await getSmtpConfig();
  const transporter = await getTransporter();

  if (!transporter || !config) {
    console.log(`[SMTP NOT CONFIGURED] Password reset OTP for ${email}: ${otp}`);
    return { sent: false, reason: 'SMTP not configured' };
  }

  try {
    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: email,
      subject: 'ग्रामपंचायत पोर्टल - पासवर्ड रीसेट कोड',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #333;">🏛️ ग्रामपंचायत नागरिक पोर्टल</h2>
          </div>
          <div style="background: #f8f9fa; border-radius: 8px; padding: 24px; text-align: center;">
            <p style="color: #555; margin-bottom: 16px;">तुमचा पासवर्ड रीसेट OTP कोड:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #e65100; margin: 16px 0;">
              ${otp}
            </div>
            <p style="color: #888; font-size: 13px; margin-top: 16px;">
              हा कोड १० मिनिटांसाठी वैध आहे.<br/>
              This code is valid for 10 minutes.
            </p>
          </div>
          <p style="color: #aaa; font-size: 11px; text-align: center; margin-top: 20px;">
            तुम्ही हा कोड मागवला नसल्यास, कृपया दुर्लक्ष करा.
          </p>
        </div>
      `,
    });

    console.log(`[EMAIL] Password reset OTP sent to ${email}`);
    return { sent: true };
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send password reset OTP to ${email}:`, err.message);
    return { sent: false, reason: err.message };
  }
}

// ─── GP Notification Emails ──────────────────────────────────────────────────

/** Fetch village admin email + village name */
export async function getVillageAdminInfo(villageId) {
  const [village, adminUser] = await Promise.all([
    prisma.village.findUnique({ where: { id: villageId }, select: { name: true } }),
    prisma.user.findFirst({ where: { villageId, role: 'admin' }, select: { email: true } }),
  ]);
  return {
    villageName: village?.name || 'ग्रामपंचायत',
    adminEmail: adminUser?.email || null,
  };
}

/** Notify GP admin when a citizen submits the contact form */
export async function sendContactFormNotification({ adminEmail, villageName, name, phone, email, subject, message, submittedAt }) {
  const dateStr = new Date(submittedAt || Date.now()).toLocaleString('mr-IN', { timeZone: 'Asia/Kolkata' });
  const html = `
    <div style="font-family:sans-serif;max-width:580px;margin:0 auto;padding:20px;background:#f9fafb;border-radius:8px;">
      <div style="background:#1a5276;color:#fff;padding:16px 20px;border-radius:6px 6px 0 0;">
        <h2 style="margin:0;font-size:18px;">📩 नवीन संपर्क संदेश</h2>
        <p style="margin:4px 0 0;font-size:13px;opacity:.85;">${villageName} - ग्रामपंचायत पोर्टल</p>
      </div>
      <div style="background:#fff;padding:20px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 6px 6px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 10px;color:#666;width:130px;border-bottom:1px solid #f0f0f0;"><strong>नाव</strong></td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">${name || '-'}</td></tr>
          ${phone ? `<tr><td style="padding:8px 10px;color:#666;border-bottom:1px solid #f0f0f0;"><strong>फोन</strong></td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">${phone}</td></tr>` : ''}
          ${email ? `<tr><td style="padding:8px 10px;color:#666;border-bottom:1px solid #f0f0f0;"><strong>ईमेल</strong></td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">${email}</td></tr>` : ''}
          ${subject ? `<tr><td style="padding:8px 10px;color:#666;border-bottom:1px solid #f0f0f0;"><strong>विषय</strong></td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">${subject}</td></tr>` : ''}
          <tr><td style="padding:8px 10px;color:#666;"><strong>संदेश</strong></td><td style="padding:8px 10px;white-space:pre-wrap;">${message}</td></tr>
        </table>
        <p style="color:#aaa;font-size:11px;margin-top:16px;">📅 ${dateStr}</p>
      </div>
    </div>
  `;
  return sendEmail(adminEmail, `📩 नवीन संपर्क संदेश - ${villageName}`, html);
}

/** Notify GP admin when a citizen submits a certificate application */
export async function sendCertificateApplicationNotification({ adminEmail, villageName, applicationNo, certificateType, applicantName, applicantAadhar, submittedAt, dashboardUrl }) {
  const dateStr = new Date(submittedAt || Date.now()).toLocaleString('mr-IN', { timeZone: 'Asia/Kolkata' });
  const html = `
    <div style="font-family:sans-serif;max-width:580px;margin:0 auto;padding:20px;background:#f9fafb;border-radius:8px;">
      <div style="background:#145a32;color:#fff;padding:16px 20px;border-radius:6px 6px 0 0;">
        <h2 style="margin:0;font-size:18px;">📋 नवीन प्रमाणपत्र अर्ज</h2>
        <p style="margin:4px 0 0;font-size:13px;opacity:.85;">${villageName} - ग्रामपंचायत पोर्टल</p>
      </div>
      <div style="background:#fff;padding:20px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 6px 6px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 10px;color:#666;width:160px;border-bottom:1px solid #f0f0f0;"><strong>अर्ज क्र.</strong></td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;font-weight:bold;color:#145a32;">${applicationNo}</td></tr>
          <tr><td style="padding:8px 10px;color:#666;border-bottom:1px solid #f0f0f0;"><strong>प्रमाणपत्र प्रकार</strong></td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">${certificateType || '-'}</td></tr>
          <tr><td style="padding:8px 10px;color:#666;border-bottom:1px solid #f0f0f0;"><strong>अर्जदार नाव</strong></td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">${applicantName || '-'}</td></tr>
          ${applicantAadhar ? `<tr><td style="padding:8px 10px;color:#666;border-bottom:1px solid #f0f0f0;"><strong>आधार क्र.</strong></td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">${applicantAadhar}</td></tr>` : ''}
          <tr><td style="padding:8px 10px;color:#666;"><strong>दाखल तारीख</strong></td><td style="padding:8px 10px;">${dateStr}</td></tr>
        </table>
        <div style="text-align:center;margin-top:20px;">
          <a href="${dashboardUrl || '#'}" style="background:#145a32;color:#fff;padding:10px 24px;border-radius:5px;text-decoration:none;font-size:14px;">डॅशबोर्डवर पाहा</a>
        </div>
      </div>
    </div>
  `;
  return sendEmail(adminEmail, `📋 नवीन प्रमाणपत्र अर्ज - ${applicationNo} | ${villageName}`, html);
}

/** Notify GP admin when a citizen submits payment for verification */
export async function sendPaymentSubmittedNotification({ adminEmail, villageName, applicationNo, certificateType, applicantName, amount, utrNumber, paymentMethod, submittedAt, dashboardUrl }) {
  const dateStr = new Date(submittedAt || Date.now()).toLocaleString('mr-IN', { timeZone: 'Asia/Kolkata' });
  const methodMap = { upi: 'UPI', cash: 'रोख', bank: 'बँक ट्रान्सफर', cheque: 'चेक', neft: 'NEFT/RTGS', free: 'मोफत' };
  const html = `
    <div style="font-family:sans-serif;max-width:580px;margin:0 auto;padding:20px;background:#f9fafb;border-radius:8px;">
      <div style="background:#7d3c98;color:#fff;padding:16px 20px;border-radius:6px 6px 0 0;">
        <h2 style="margin:0;font-size:18px;">💳 पेमेंट पडताळणीसाठी प्रतीक्षित</h2>
        <p style="margin:4px 0 0;font-size:13px;opacity:.85;">${villageName} - ग्रामपंचायत पोर्टल</p>
      </div>
      <div style="background:#fff;padding:20px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 6px 6px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 10px;color:#666;width:160px;border-bottom:1px solid #f0f0f0;"><strong>अर्ज क्र.</strong></td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;font-weight:bold;color:#7d3c98;">${applicationNo}</td></tr>
          <tr><td style="padding:8px 10px;color:#666;border-bottom:1px solid #f0f0f0;"><strong>प्रमाणपत्र</strong></td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">${certificateType || '-'}</td></tr>
          <tr><td style="padding:8px 10px;color:#666;border-bottom:1px solid #f0f0f0;"><strong>अर्जदार</strong></td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">${applicantName || '-'}</td></tr>
          <tr><td style="padding:8px 10px;color:#666;border-bottom:1px solid #f0f0f0;"><strong>रक्कम</strong></td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;font-weight:bold;">₹${amount}</td></tr>
          <tr><td style="padding:8px 10px;color:#666;border-bottom:1px solid #f0f0f0;"><strong>पेमेंट पद्धत</strong></td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">${methodMap[paymentMethod] || paymentMethod || '-'}</td></tr>
          ${utrNumber ? `<tr><td style="padding:8px 10px;color:#666;border-bottom:1px solid #f0f0f0;"><strong>UTR / Tx ID</strong></td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">${utrNumber}</td></tr>` : ''}
          <tr><td style="padding:8px 10px;color:#666;"><strong>वेळ</strong></td><td style="padding:8px 10px;">${dateStr}</td></tr>
        </table>
        <div style="background:#fff8e1;border:1px solid #ffe082;border-radius:5px;padding:12px;margin-top:16px;font-size:13px;color:#7e5c00;">
          ⚠️ कृपया पेमेंट तपासून डॅशबोर्डवर पडताळणी करा.
        </div>
        <div style="text-align:center;margin-top:16px;">
          <a href="${dashboardUrl || '#'}" style="background:#7d3c98;color:#fff;padding:10px 24px;border-radius:5px;text-decoration:none;font-size:14px;">पेमेंट पडताळा</a>
        </div>
      </div>
    </div>
  `;
  return sendEmail(adminEmail, `💳 पेमेंट पडताळणीसाठी - ${applicationNo} | ${villageName}`, html);
}

/** Notify GP admin when a citizen files a complaint */
export async function sendComplaintNotification({ adminEmail, villageName, name, contact, category, description, imageUrl, submittedAt, dashboardUrl }) {
  const dateStr = new Date(submittedAt || Date.now()).toLocaleString('mr-IN', { timeZone: 'Asia/Kolkata' });
  const categoryMap = { road: 'रस्ता / दुरुस्ती', water: 'पाणी पुरवठा', electricity: 'वीज / दिवाबत्ती', sanitation: 'स्वच्छता / कचरा', corruption: 'भ्रष्टाचार', other: 'इतर' };
  const html = `
    <div style="font-family:sans-serif;max-width:580px;margin:0 auto;padding:20px;background:#f9fafb;border-radius:8px;">
      <div style="background:#c62828;color:#fff;padding:16px 20px;border-radius:6px 6px 0 0;">
        <h2 style="margin:0;font-size:18px;">📣 नवीन तक्रार नोंदवली गेली</h2>
        <p style="margin:4px 0 0;font-size:13px;opacity:.85;">${villageName} - ग्रामपंचायत पोर्टल</p>
      </div>
      <div style="background:#fff;padding:20px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 6px 6px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 10px;color:#666;width:140px;border-bottom:1px solid #f0f0f0;"><strong>नाव</strong></td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">${name}</td></tr>
          <tr><td style="padding:8px 10px;color:#666;border-bottom:1px solid #f0f0f0;"><strong>संपर्क</strong></td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;">${contact}</td></tr>
          <tr><td style="padding:8px 10px;color:#666;border-bottom:1px solid #f0f0f0;"><strong>प्रकार</strong></td><td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;"><strong style="color:#c62828;">${categoryMap[category] || category}</strong></td></tr>
          <tr><td style="padding:8px 10px;color:#666;"><strong>वर्णन</strong></td><td style="padding:8px 10px;white-space:pre-wrap;">${description}</td></tr>
        </table>
        ${imageUrl ? `<div style="margin-top:12px;"><a href="${imageUrl}" target="_blank"><img src="${imageUrl}" alt="complaint" style="max-width:100%;border-radius:8px;border:1px solid #eee;max-height:240px;object-fit:cover;" /></a></div>` : ''}
        <p style="color:#aaa;font-size:11px;margin-top:16px;">📅 ${dateStr}</p>
        <div style="text-align:center;margin-top:16px;">
          <a href="${dashboardUrl || '#'}" style="background:#c62828;color:#fff;padding:10px 24px;border-radius:5px;text-decoration:none;font-size:14px;">तक्रार पाहा व कार्यवाही करा</a>
        </div>
      </div>
    </div>
  `;
  return sendEmail(adminEmail, `📣 नवीन तक्रार - ${categoryMap[category] || category} | ${villageName}`, html);
}
