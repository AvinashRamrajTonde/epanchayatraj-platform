import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { config } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { generateCertificatePDF, generateReceiptPDF } from './certificate-pdf.service.js';
import { sendOTPEmail, sendPasswordResetEmail, sendCertificateApplicationNotification, sendPaymentSubmittedNotification, getVillageAdminInfo } from './email.service.js';

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate a human-readable family ID
function generateFamilyId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'FAM-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate application number
function generateApplicationNo() {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `CERT-${year}-${rand}`;
}

// Generate receipt number
function generateReceiptNo() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RCP-${year}-${rand}`;
}

// Generate certificate number
function generateCertificateNo(certCode) {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${certCode.toUpperCase()}-${year}-${rand}`;
}

// Generate auto-increment dispatch number per village per FY
async function generateDispatchNo(villageId) {
  const village = await prisma.village.findUnique({
    where: { id: villageId },
    select: { slug: true, name: true },
  });
  const prefix = (village.slug || village.name).toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6);
  const now = new Date();
  const fy = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const fyStart = new Date(`${fy}-04-01`);
  const fyEnd = new Date(`${fy + 1}-03-31T23:59:59.999Z`);

  const count = await prisma.certificateApplication.count({
    where: {
      villageId,
      status: 'approved',
      issuedAt: { gte: fyStart, lte: fyEnd },
    },
  });

  const serial = String(count + 1).padStart(4, '0');
  return `${prefix}/${fy}-${String(fy + 1).slice(2)}/${serial}`;
}

export const citizenService = {
  // ─── Auth ──────────────────────────────────────────────────

  async sendOTP(email) {
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user = await prisma.citizenUser.findUnique({ where: { email } });

    if (user) {
      user = await prisma.citizenUser.update({
        where: { email },
        data: { otp, otpExpiresAt },
      });
    } else {
      // Will complete registration later
      user = await prisma.citizenUser.create({
        data: {
          email,
          name: '',
          otp,
          otpExpiresAt,
        },
      });
    }

    // Send OTP via email (falls back to console in dev)
    await sendOTPEmail(email, otp);
    console.log(`[DEV] OTP for ${email}: ${otp}`);
    return { message: 'OTP sent successfully', ...(config.nodeEnv === 'development' ? { otp } : {}) };
  },

  async verifyOTP(email, otp) {
    const user = await prisma.citizenUser.findUnique({ where: { email } });
    if (!user) throw new ApiError(404, 'User not found. Please register first.');

    if (!user.otp || user.otp !== otp) {
      throw new ApiError(400, 'Invalid OTP');
    }
    if (new Date() > user.otpExpiresAt) {
      throw new ApiError(400, 'OTP has expired. Please request a new one.');
    }

    // Clear OTP and mark verified
    await prisma.citizenUser.update({
      where: { email },
      data: { otp: null, otpExpiresAt: null, isVerified: true },
    });

    const accessToken = jwt.sign(
      { citizenId: user.id, role: 'citizen', email: user.email },
      config.jwt.accessSecret,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { citizenId: user.id },
      config.jwt.refreshSecret,
      { expiresIn: '30d' }
    );

    return {
      user: { id: user.id, email: user.email, name: user.name, mobile: user.mobile, phone: user.phone, isVerified: true },
      accessToken,
      refreshToken,
      needsRegistration: !user.name,
    };
  },

  async googleAuth(googleId, email, name) {
    let user = await prisma.citizenUser.findUnique({ where: { googleId } });

    if (!user) {
      // Check if user exists with email
      user = await prisma.citizenUser.findUnique({ where: { email } });
      if (user) {
        // Link Google account
        user = await prisma.citizenUser.update({
          where: { id: user.id },
          data: { googleId, name: user.name || name, isVerified: true },
        });
      } else {
        // Create new user
        user = await prisma.citizenUser.create({
          data: {
            email,
            googleId,
            name,
            isVerified: true,
          },
        });
      }
    }

    const accessToken = jwt.sign(
      { citizenId: user.id, role: 'citizen', email: user.email },
      config.jwt.accessSecret,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { citizenId: user.id },
      config.jwt.refreshSecret,
      { expiresIn: '30d' }
    );

    return {
      user: { id: user.id, email: user.email, name: user.name, mobile: user.mobile, isVerified: true },
      accessToken,
      refreshToken,
      needsRegistration: !user.name,
    };
  },

  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret);
      const user = await prisma.citizenUser.findUnique({ where: { id: decoded.citizenId } });
      if (!user) throw new ApiError(401, 'User not found');

      const accessToken = jwt.sign(
        { citizenId: user.id, role: 'citizen', email: user.email },
        config.jwt.accessSecret,
        { expiresIn: '24h' }
      );

      return { accessToken };
    } catch {
      throw new ApiError(401, 'Invalid refresh token');
    }
  },

  // ─── Register (with password + email OTP verification) ────

  async register({ name, email, phone, password }) {
    // Check if email already exists
    const existingByEmail = await prisma.citizenUser.findUnique({ where: { email } });
    if (existingByEmail && existingByEmail.isVerified) {
      throw new ApiError(400, 'या ईमेलने आधीच नोंदणी केली आहे / Email already registered');
    }

    // Check if phone already exists
    if (phone) {
      const existingByPhone = await prisma.citizenUser.findFirst({ where: { phone } });
      if (existingByPhone && existingByPhone.id !== existingByEmail?.id) {
        throw new ApiError(400, 'या फोन नंबरने आधीच नोंदणी केली आहे / Phone number already registered');
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    let user;
    if (existingByEmail && !existingByEmail.isVerified) {
      // Update existing unverified user
      user = await prisma.citizenUser.update({
        where: { email },
        data: { name, phone: phone || null, passwordHash, otp, otpExpiresAt },
      });
    } else {
      // Create new user
      user = await prisma.citizenUser.create({
        data: { email, name, phone: phone || null, passwordHash, otp, otpExpiresAt },
      });
    }

    await sendOTPEmail(email, otp);
    console.log(`[DEV] Registration OTP for ${email}: ${otp}`);

    return {
      message: 'OTP sent to your email for verification',
      userId: user.id,
      ...(config.nodeEnv === 'development' ? { otp } : {}),
    };
  },

  // ─── Login (email/phone + password) ───────────────────────

  async login(identifier, password) {
    // Find by email or phone
    const isEmail = identifier.includes('@');
    let user;

    if (isEmail) {
      user = await prisma.citizenUser.findUnique({ where: { email: identifier } });
    } else {
      // Try phone number
      user = await prisma.citizenUser.findFirst({ where: { phone: identifier } });
    }

    if (!user) {
      throw new ApiError(404, 'खाते सापडले नाही / Account not found');
    }

    if (!user.passwordHash) {
      throw new ApiError(400, 'कृपया OTP लॉगिन वापरा किंवा पासवर्ड सेट करा / Please use OTP login or set a password');
    }

    if (!user.isVerified) {
      throw new ApiError(403, 'कृपया प्रथम ईमेल सत्यापित करा / Please verify your email first');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new ApiError(401, 'चुकीचा पासवर्ड / Incorrect password');
    }

    const accessToken = jwt.sign(
      { citizenId: user.id, role: 'citizen', email: user.email },
      config.jwt.accessSecret,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { citizenId: user.id },
      config.jwt.refreshSecret,
      { expiresIn: '30d' }
    );

    return {
      user: { id: user.id, email: user.email, name: user.name, mobile: user.mobile, phone: user.phone, isVerified: true },
      accessToken,
      refreshToken,
      needsRegistration: !user.name,
    };
  },

  // ─── Forgot Password (send OTP) ──────────────────────────

  async forgotPassword(identifier) {
    const isEmail = identifier.includes('@');
    let user;

    if (isEmail) {
      user = await prisma.citizenUser.findUnique({ where: { email: identifier } });
    } else {
      user = await prisma.citizenUser.findFirst({ where: { phone: identifier } });
    }

    if (!user) {
      throw new ApiError(404, 'खाते सापडले नाही / Account not found');
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.citizenUser.update({
      where: { id: user.id },
      data: { otp, otpExpiresAt },
    });

    // Always send OTP to the user's email
    await sendPasswordResetEmail(user.email, otp);
    console.log(`[DEV] Password reset OTP for ${user.email}: ${otp}`);

    // Mask the email for security
    const [local, domain] = user.email.split('@');
    const maskedEmail = local.slice(0, 2) + '***@' + domain;

    return {
      message: `OTP sent to ${maskedEmail}`,
      email: maskedEmail,
      ...(config.nodeEnv === 'development' ? { otp } : {}),
    };
  },

  // ─── Reset Password (verify OTP + set new password) ──────

  async resetPassword(identifier, otp, newPassword) {
    const isEmail = identifier.includes('@');
    let user;

    if (isEmail) {
      user = await prisma.citizenUser.findUnique({ where: { email: identifier } });
    } else {
      user = await prisma.citizenUser.findFirst({ where: { phone: identifier } });
    }

    if (!user) throw new ApiError(404, 'Account not found');
    if (!user.otp || user.otp !== otp) throw new ApiError(400, 'Invalid OTP');
    if (new Date() > user.otpExpiresAt) throw new ApiError(400, 'OTP expired. Please request a new one.');

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.citizenUser.update({
      where: { id: user.id },
      data: { passwordHash, otp: null, otpExpiresAt: null, isVerified: true },
    });

    return { message: 'पासवर्ड यशस्वीरित्या बदलला / Password reset successfully' };
  },

  async getProfile(citizenId) {
    const user = await prisma.citizenUser.findUnique({
      where: { id: citizenId },
      select: { id: true, email: true, phone: true, mobile: true, name: true, isVerified: true, createdAt: true },
    });
    if (!user) throw new ApiError(404, 'User not found');
    return user;
  },

  async updateProfile(citizenId, data) {
    const user = await prisma.citizenUser.update({
      where: { id: citizenId },
      data: {
        name: data.name,
        email: data.email || undefined,
        mobile: data.mobile || undefined,
        phone: data.phone || undefined,
      },
      select: { id: true, email: true, phone: true, mobile: true, name: true, isVerified: true },
    });
    return user;
  },

  // ─── Family Management ────────────────────────────────────

  async registerFamily(citizenId, villageId, data) {
    // Check if citizen already has a family in this village
    const existingFamily = await prisma.family.findFirst({
      where: { citizenUserId: citizenId, villageId },
    });
    if (existingFamily) {
      throw new ApiError(400, 'You already have a family registered in this village');
    }

    const familyIdStr = generateFamilyId();
    const family = await prisma.family.create({
      data: {
        familyId: familyIdStr,
        villageId,
        citizenUserId: citizenId,
        headName: data.headName,
        headDob: new Date(data.headDob),
        headAadhar: data.headAadhar,
        headRationCard: data.headRationCard || null,
        headVoterId: data.headVoterId || null,
      },
      include: { village: { select: { name: true, slug: true } } },
    });

    // Update citizen name if empty
    const citizen = await prisma.citizenUser.findUnique({ where: { id: citizenId } });
    if (!citizen.name) {
      await prisma.citizenUser.update({
        where: { id: citizenId },
        data: { name: data.headName },
      });
    }

    return family;
  },

  async getFamilies(citizenId) {
    const families = await prisma.family.findMany({
      where: { citizenUserId: citizenId },
      include: {
        village: { select: { id: true, name: true, slug: true, subdomain: true } },
        members: { orderBy: { createdAt: 'asc' } },
        _count: { select: { certificates: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return families;
  },

  async getFamily(citizenId, familyId) {
    const family = await prisma.family.findFirst({
      where: { id: familyId, citizenUserId: citizenId },
      include: {
        village: { select: { id: true, name: true, slug: true, subdomain: true } },
        members: { orderBy: { createdAt: 'asc' } },
        certificates: {
          include: {
            certificateType: true,
            payment: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!family) throw new ApiError(404, 'Family not found');
    return family;
  },

  async addFamilyMember(citizenId, familyId, data) {
    // Verify ownership
    const family = await prisma.family.findFirst({
      where: { id: familyId, citizenUserId: citizenId },
    });
    if (!family) throw new ApiError(404, 'Family not found');

    // Validate DOB
    if (!data.dob) throw new ApiError(400, 'जन्म तारीख आवश्यक आहे');
    const dob = new Date(data.dob);
    if (isNaN(dob.getTime())) throw new ApiError(400, 'अवैध जन्म तारीख');
    const year = dob.getFullYear();
    if (year < 1900 || year > new Date().getFullYear()) {
      throw new ApiError(400, 'जन्म तारीख 1900 ते चालू वर्षात असावी');
    }

    // Validate name
    if (!data.name || data.name.trim().length < 2) throw new ApiError(400, 'कृपया वैध नाव टाका');

    // Validate aadhar
    if (!data.aadhar || data.aadhar.length !== 12) throw new ApiError(400, 'कृपया 12 अंकी आधार क्रमांक टाका');

    const member = await prisma.familyMember.create({
      data: {
        familyId,
        name: data.name.trim(),
        dob,
        aadhar: data.aadhar,
        voterId: data.voterId || null,
        relation: data.relation,
      },
    });
    return member;
  },

  async updateFamilyMember(citizenId, memberId, data) {
    const member = await prisma.familyMember.findUnique({
      where: { id: memberId },
      include: { family: true },
    });
    if (!member || member.family.citizenUserId !== citizenId) {
      throw new ApiError(404, 'Family member not found');
    }

    const updated = await prisma.familyMember.update({
      where: { id: memberId },
      data: {
        name: data.name,
        dob: data.dob ? new Date(data.dob) : undefined,
        aadhar: data.aadhar,
        voterId: data.voterId || null,
        relation: data.relation,
      },
    });
    return updated;
  },

  async deleteFamilyMember(citizenId, memberId) {
    const member = await prisma.familyMember.findUnique({
      where: { id: memberId },
      include: { family: true },
    });
    if (!member || member.family.citizenUserId !== citizenId) {
      throw new ApiError(404, 'Family member not found');
    }

    await prisma.familyMember.delete({ where: { id: memberId } });
    return { message: 'Member removed successfully' };
  },

  // ─── Certificate Applications ─────────────────────────────

  async getCertificateTypes() {
    return prisma.certificateType.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });
  },

  async applyCertificate(citizenId, villageId, data) {
    // Verify family ownership
    const family = await prisma.family.findFirst({
      where: { id: data.familyId, citizenUserId: citizenId, villageId },
    });
    if (!family) throw new ApiError(404, 'Family not found in this village');

    // Verify certificate type
    const certType = await prisma.certificateType.findUnique({
      where: { id: data.certificateTypeId },
    });
    if (!certType || !certType.isActive) {
      throw new ApiError(400, 'Invalid or inactive certificate type');
    }

    // If family member specified, verify it
    if (data.familyMemberId) {
      const member = await prisma.familyMember.findFirst({
        where: { id: data.familyMemberId, familyId: data.familyId },
      });
      if (!member) throw new ApiError(404, 'Family member not found');
    }

    const applicationNo = generateApplicationNo();

    const application = await prisma.certificateApplication.create({
      data: {
        applicationNo,
        villageId,
        familyId: data.familyId,
        familyMemberId: data.familyMemberId || null,
        certificateTypeId: data.certificateTypeId,
        applicantName: data.applicantName,
        applicantAadhar: data.applicantAadhar,
        formData: data.formData || {},
        documents: data.documents || [],
        status: 'under_review',
      },
      include: {
        certificateType: true,
        family: { select: { familyId: true, headName: true } },
      },
    });

    // Create payment record
    if (certType.fee > 0) {
      await prisma.certificatePayment.create({
        data: {
          applicationId: application.id,
          amount: certType.fee,
          status: 'pending',
        },
      });
    } else {
      await prisma.certificatePayment.create({
        data: {
          applicationId: application.id,
          amount: 0,
          status: 'verified',
          paymentMethod: 'free',
          verifiedAt: new Date(),
          receiptNo: generateReceiptNo(),
        },
      });
    }

    // Notify GP admin (non-blocking)
    getVillageAdminInfo(villageId).then(({ adminEmail, villageName }) => {
      if (adminEmail) {
        const domain = process.env.PLATFORM_DOMAIN || 'localhost:5173';
        sendCertificateApplicationNotification({
          adminEmail,
          villageName,
          applicationNo: application.applicationNo,
          certificateType: application.certificateType?.name,
          applicantName: application.applicantName,
          applicantAadhar: application.applicantAadhar,
          submittedAt: application.createdAt,
          dashboardUrl: `http://${domain}/admin/certificates`,
        }).catch((err) => console.error('[EMAIL] cert application notification failed:', err.message));
      }
    }).catch(() => {});

    return application;
  },

  async getMyApplications(citizenId, villageId, filters = {}) {
    // Get all families for this citizen
    const families = await prisma.family.findMany({
      where: { citizenUserId: citizenId, ...(villageId ? { villageId } : {}) },
      select: { id: true },
    });
    const familyIds = families.map((f) => f.id);

    const where = {
      familyId: { in: familyIds },
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.certificateTypeId ? { certificateTypeId: filters.certificateTypeId } : {}),
    };

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      prisma.certificateApplication.findMany({
        where,
        include: {
          certificateType: true,
          payment: true,
          village: { select: { name: true, slug: true } },
          family: { select: { familyId: true, headName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.certificateApplication.count({ where }),
    ]);

    return {
      applications,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async getApplicationDetail(citizenId, applicationId) {
    const application = await prisma.certificateApplication.findUnique({
      where: { id: applicationId },
      include: {
        certificateType: true,
        payment: true,
        village: { select: { id: true, name: true, slug: true, subdomain: true } },
        family: {
          select: { familyId: true, headName: true, citizenUserId: true },
        },
        familyMember: true,
      },
    });

    if (!application) throw new ApiError(404, 'Application not found');
    if (application.family.citizenUserId !== citizenId) {
      throw new ApiError(403, 'Access denied');
    }

    return application;
  },

  // ─── Payment ──────────────────────────────────────────────

  async submitPayment(citizenId, applicationId, data) {
    const application = await prisma.certificateApplication.findUnique({
      where: { id: applicationId },
      include: {
        family: true,
        certificateType: true,
        payment: true,
      },
    });

    if (!application) throw new ApiError(404, 'Application not found');
    if (application.family.citizenUserId !== citizenId) {
      throw new ApiError(403, 'Access denied');
    }
    if (application.payment && application.payment.status === 'verified') {
      throw new ApiError(400, 'Payment already verified');
    }

    // Create or update payment
    const payment = await prisma.certificatePayment.upsert({
      where: { applicationId },
      create: {
        applicationId,
        amount: application.certificateType.fee,
        utrNumber: data.utrNumber,
        screenshotUrl: data.screenshotUrl || null,
        paymentMethod: data.paymentMethod || 'upi',
        status: 'submitted',
      },
      update: {
        utrNumber: data.utrNumber,
        screenshotUrl: data.screenshotUrl || null,
        paymentMethod: data.paymentMethod || 'upi',
        status: 'submitted',
      },
    });

    // Notify GP admin (non-blocking)
    getVillageAdminInfo(application.villageId).then(({ adminEmail, villageName }) => {
      if (adminEmail) {
        const domain = process.env.PLATFORM_DOMAIN || 'localhost:5173';
        sendPaymentSubmittedNotification({
          adminEmail,
          villageName,
          applicationNo: application.applicationNo,
          certificateType: application.certificateType?.name,
          applicantName: application.applicantName,
          amount: application.certificateType.fee,
          utrNumber: data.utrNumber,
          paymentMethod: data.paymentMethod || 'upi',
          submittedAt: new Date(),
          dashboardUrl: `http://${domain}/admin/certificates`,
        }).catch((err) => console.error('[EMAIL] payment notification failed:', err.message));
      }
    }).catch(() => {});

    return payment;
  },

  async getPaymentConfig(villageId) {
    const config = await prisma.villagePaymentConfig.findUnique({
      where: { villageId },
    });
    return config;
  },

  // ─── Admin Operations ─────────────────────────────────────

  async adminGetApplications(villageId, filters = {}) {
    const where = { villageId };

    if (filters.status) where.status = filters.status;
    if (filters.certificateTypeId) where.certificateTypeId = filters.certificateTypeId;
    if (filters.search) {
      where.OR = [
        { applicantName: { contains: filters.search, mode: 'insensitive' } },
        { applicationNo: { contains: filters.search, mode: 'insensitive' } },
        { applicantAadhar: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      prisma.certificateApplication.findMany({
        where,
        include: {
          certificateType: true,
          payment: true,
          family: { select: { familyId: true, headName: true } },
          familyMember: { select: { name: true, relation: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.certificateApplication.count({ where }),
    ]);

    return {
      applications,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async adminGetApplication(villageId, applicationId) {
    const application = await prisma.certificateApplication.findFirst({
      where: { id: applicationId, villageId },
      include: {
        certificateType: true,
        payment: true,
        family: {
          include: {
            members: true,
            citizenUser: { select: { mobile: true, email: true } },
          },
        },
        familyMember: true,
        village: { include: { tehsil: true } },
      },
    });
    if (!application) throw new ApiError(404, 'Application not found');
    return application;
  },

  async adminVerifyPayment(villageId, applicationId, adminUserId, verified, remarks) {
    const application = await prisma.certificateApplication.findFirst({
      where: { id: applicationId, villageId },
      include: { payment: true },
    });
    if (!application) throw new ApiError(404, 'Application not found');
    if (!application.payment) throw new ApiError(400, 'No payment found for this application');

    const receiptNo = verified ? generateReceiptNo() : null;

    await prisma.certificatePayment.update({
      where: { applicationId },
      data: {
        status: verified ? 'verified' : 'rejected',
        verifiedAt: verified ? new Date() : null,
        verifiedBy: adminUserId,
        receiptNo,
        remarks: remarks || null,
      },
    });

    // Auto-generate receipt PDF when payment is verified
    if (verified) {
      try {
        await generateReceiptPDF(applicationId);
      } catch (err) {
        console.error('Receipt PDF generation failed:', err.message);
      }
    }

    return { message: verified ? 'Payment verified' : 'Payment rejected', receiptNo };
  },

  // Admin marks offline/cash payment
  async adminMarkOfflinePayment(villageId, applicationId, adminUserId, remarks) {
    const application = await prisma.certificateApplication.findFirst({
      where: { id: applicationId, villageId },
      include: { payment: true, certificateType: true },
    });
    if (!application) throw new ApiError(404, 'Application not found');

    const receiptNo = generateReceiptNo();

    if (application.payment) {
      // Update existing payment to verified/cash
      await prisma.certificatePayment.update({
        where: { applicationId },
        data: {
          status: 'verified',
          paymentMethod: 'cash',
          verifiedAt: new Date(),
          verifiedBy: adminUserId,
          receiptNo,
          remarks: remarks || 'ऑफलाइन पेमेंट (रोख)',
        },
      });
    } else {
      // Create new payment record
      await prisma.certificatePayment.create({
        data: {
          applicationId,
          amount: application.certificateType.fee,
          status: 'verified',
          paymentMethod: 'cash',
          verifiedAt: new Date(),
          verifiedBy: adminUserId,
          receiptNo,
          remarks: remarks || 'ऑफलाइन पेमेंट (रोख)',
        },
      });
    }

    // Generate receipt PDF
    try {
      await generateReceiptPDF(applicationId);
    } catch (err) {
      console.error('Receipt PDF generation failed:', err.message);
    }

    return { message: 'Offline payment recorded', receiptNo };
  },

  async adminUpdateApplication(villageId, applicationId, data) {
    const application = await prisma.certificateApplication.findFirst({
      where: { id: applicationId, villageId },
      include: { certificateType: true },
    });
    if (!application) throw new ApiError(404, 'Application not found');

    const updateData = {};

    // Allow editing formData, applicant details, and documents ONLY when under_review
    if (application.status === 'under_review') {
      if (data.formData !== undefined) updateData.formData = data.formData;
      if (data.applicantName !== undefined) updateData.applicantName = data.applicantName;
      if (data.applicantAadhar !== undefined) updateData.applicantAadhar = data.applicantAadhar;
      if (data.documents !== undefined) updateData.documents = data.documents;
    }

    if (data.adminRemarks !== undefined) updateData.adminRemarks = data.adminRemarks;
    if (data.status) {
      updateData.status = data.status;
      if (data.status === 'approved') {
        updateData.processedAt = new Date();
        updateData.issuedAt = new Date();
        // Auto-generate certificate number using cert type code
        const certCode = application.certificateType?.code || 'CERT';
        updateData.certificateNo = generateCertificateNo(certCode);
        // Auto-generate dispatch number
        updateData.dispatchNo = await generateDispatchNo(villageId);
      }
      if (data.status === 'rejected') {
        updateData.processedAt = new Date();
        updateData.rejectionReason = data.rejectionReason || '';
      }
    }

    const updated = await prisma.certificateApplication.update({
      where: { id: applicationId },
      data: updateData,
      include: {
        certificateType: true,
        payment: true,
        family: { select: { familyId: true, headName: true } },
      },
    });

    // Auto-generate certificate PDF when approved
    if (data.status === 'approved') {
      try {
        // Note: PDFs are now generated on-demand for download, not stored
        // Just trigger the generation to verify it works (timestamp is stored in generateCertificatePDF)
        await generateCertificatePDF(applicationId);
      } catch (pdfErr) {
        console.error('PDF generation test failed:', pdfErr.message);
      }
    }

    return updated;
  },

  async adminApplyOnBehalf(villageId, adminUserId, data) {
    const certType = await prisma.certificateType.findUnique({
      where: { id: data.certificateTypeId },
    });
    if (!certType || !certType.isActive) {
      throw new ApiError(400, 'Invalid or inactive certificate type');
    }

    // Find or create family for walk-in applicant
    let family;
    if (data.familyId) {
      family = await prisma.family.findFirst({ where: { id: data.familyId, villageId } });
      if (!family) throw new ApiError(404, 'Family not found');
    } else {
      // Create a temporary family for walk-in
      const familyIdStr = generateFamilyId();

      // Find or create citizen user for walk-in
      let citizenUser = await prisma.citizenUser.findFirst({
        where: { mobile: data.applicantMobile || `walkin_${Date.now()}` },
      });
      if (!citizenUser) {
        citizenUser = await prisma.citizenUser.create({
          data: {
            mobile: data.applicantMobile || `walkin_${Date.now()}`,
            name: data.applicantName,
            isVerified: false,
          },
        });
      }

      family = await prisma.family.create({
        data: {
          familyId: familyIdStr,
          villageId,
          citizenUserId: citizenUser.id,
          headName: data.applicantName,
          headDob: new Date(data.dob || '2000-01-01'),
          headAadhar: data.applicantAadhar,
        },
      });
    }

    const applicationNo = generateApplicationNo();
    const isFree = certType.fee === 0;

    const application = await prisma.certificateApplication.create({
      data: {
        applicationNo,
        villageId,
        familyId: family.id,
        familyMemberId: data.familyMemberId || null,
        certificateTypeId: data.certificateTypeId,
        applicantName: data.applicantName,
        applicantAadhar: data.applicantAadhar,
        formData: data.formData || {},
        documents: data.documents || [],
        status: 'under_review',
        appliedByAdmin: true,
      },
      include: { certificateType: true },
    });

    // Create payment record
    if (isFree || data.paymentCollected) {
      await prisma.certificatePayment.create({
        data: {
          applicationId: application.id,
          amount: certType.fee,
          status: 'verified',
          paymentMethod: data.paymentCollected ? 'cash' : 'free',
          verifiedAt: new Date(),
          verifiedBy: adminUserId,
          receiptNo: generateReceiptNo(),
        },
      });
    } else if (certType.fee > 0) {
      await prisma.certificatePayment.create({
        data: {
          applicationId: application.id,
          amount: certType.fee,
          status: 'pending',
        },
      });
    }

    return application;
  },

  async adminGetStats(villageId) {
    const [total, underReview, approved, rejected, paymentPending, paymentVerified] = await Promise.all([
      prisma.certificateApplication.count({ where: { villageId } }),
      prisma.certificateApplication.count({ where: { villageId, status: 'under_review' } }),
      prisma.certificateApplication.count({ where: { villageId, status: 'approved' } }),
      prisma.certificateApplication.count({ where: { villageId, status: 'rejected' } }),
      prisma.certificatePayment.count({ where: { application: { villageId }, status: { in: ['pending', 'submitted'] } } }),
      prisma.certificatePayment.count({ where: { application: { villageId }, status: 'verified' } }),
    ]);
    return {
      total,
      byStatus: { under_review: underReview, approved, rejected },
      byPayment: { pending: paymentPending, verified: paymentVerified },
    };
  },

  // ─── Payment Config (Admin) ───────────────────────────────

  async adminGetPaymentConfig(villageId) {
    return prisma.villagePaymentConfig.findUnique({ where: { villageId } });
  },

  async adminUpsertPaymentConfig(villageId, data) {
    return prisma.villagePaymentConfig.upsert({
      where: { villageId },
      create: {
        villageId,
        bankName: data.bankName || null,
        accountNo: data.accountNo || null,
        ifscCode: data.ifscCode || null,
        accountHolder: data.accountHolder || null,
        upiId: data.upiId || null,
        qrCodeUrl: data.qrCodeUrl || null,
        instructions: data.instructions || null,
        isActive: data.isActive !== false,
      },
      update: {
        bankName: data.bankName || null,
        accountNo: data.accountNo || null,
        ifscCode: data.ifscCode || null,
        accountHolder: data.accountHolder || null,
        upiId: data.upiId || null,
        qrCodeUrl: data.qrCodeUrl || null,
        instructions: data.instructions || null,
        isActive: data.isActive !== false,
      },
    });
  },

  // ─── सहपत्र-ब Register ────────────────────────────────────

  async adminGetRegister(villageId, financialYear, certificateTypeId) {
    // Financial year format: "2024-25" or "2025-2026"
    const [startYear] = financialYear.split('-').map(Number);
    const startDate = new Date(`${startYear}-04-01`);
    const endDate = new Date(`${startYear + 1}-03-31T23:59:59`);

    const where = {
      villageId,
      createdAt: { gte: startDate, lte: endDate },
      status: 'approved',
    };
    if (certificateTypeId) where.certificateTypeId = certificateTypeId;

    const applications = await prisma.certificateApplication.findMany({
      where,
      include: {
        certificateType: true,
        payment: true,
        family: { select: { headName: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return applications;
  },

  // ─── Public Certificate Verification ──────────────────────

  async verifyCertificate(certificateNo) {
    const application = await prisma.certificateApplication.findFirst({
      where: { certificateNo },
      include: {
        certificateType: true,
        village: { select: { name: true, slug: true }, },
        payment: { select: { amount: true, receiptNo: true, paymentMethod: true, verifiedAt: true } },
      },
    });
    if (!application) throw new ApiError(404, 'Certificate not found / प्रमाणपत्र सापडले नाही');
    return {
      valid: application.status === 'approved',
      certificateNo: application.certificateNo,
      applicationNo: application.applicationNo,
      applicantName: application.applicantName,
      certificateType: application.certificateType?.nameMarathi,
      certificateTypeEnglish: application.certificateType?.nameEnglish,
      village: application.village?.name,
      dispatchNo: application.dispatchNo,
      issuedAt: application.issuedAt,
      status: application.status,
    };
  },

  // ─── Admin: Search Families ─────────────────────────────────

  async adminSearchFamilies(villageId, search) {
    const where = { villageId };
    if (search) {
      where.OR = [
        { headName: { contains: search, mode: 'insensitive' } },
        { headAadhar: { contains: search, mode: 'insensitive' } },
        { familyId: { contains: search, mode: 'insensitive' } },
      ];
    }
    const families = await prisma.family.findMany({
      where,
      include: {
        members: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return families;
  },

  // ─── Admin: Add Family for walk-in ─────────────────────────

  async adminAddFamily(villageId, data) {
    const familyIdStr = generateFamilyId();

    // Find or create citizen user
    let citizenUser;
    if (data.phone) {
      citizenUser = await prisma.citizenUser.findFirst({ where: { phone: data.phone } });
    }
    if (!citizenUser) {
      citizenUser = await prisma.citizenUser.create({
        data: {
          phone: data.phone || null,
          mobile: data.phone || `walkin_${Date.now()}`,
          name: data.headName,
          isVerified: false,
        },
      });
    }

    const family = await prisma.family.create({
      data: {
        familyId: familyIdStr,
        villageId,
        citizenUserId: citizenUser.id,
        headName: data.headName,
        headDob: new Date(data.headDob || '2000-01-01'),
        headAadhar: data.headAadhar,
        headRationCard: data.headRationCard || null,
        headVoterId: data.headVoterId || null,
      },
      include: { members: true },
    });
    return family;
  },

  // ─── Admin: Add Member to Family ───────────────────────────

  async adminAddFamilyMember(villageId, familyId, data) {
    const family = await prisma.family.findFirst({ where: { id: familyId, villageId } });
    if (!family) throw new ApiError(404, 'Family not found');

    const member = await prisma.familyMember.create({
      data: {
        familyId,
        name: data.name,
        dob: new Date(data.dob || '2000-01-01'),
        aadhar: data.aadhar,
        voterId: data.voterId || null,
        relation: data.relation,
      },
    });
    return member;
  },

  generateFamilyId,
  generateApplicationNo,
  generateReceiptNo,
  generateCertificateNo,
};
