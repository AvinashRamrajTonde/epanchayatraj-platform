import { citizenService } from '../services/citizen.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { generateCertificatePDF, generateReceiptPDF } from '../services/certificate-pdf.service.js';

// ─── Auth ──────────────────────────────────────────────────

export const sendOTP = catchAsync(async (req, res) => {
  const result = await citizenService.sendOTP(req.body.email);
  res.json(new ApiResponse(200, result, 'OTP sent'));
});

export const verifyOTP = catchAsync(async (req, res) => {
  const result = await citizenService.verifyOTP(req.body.email, req.body.otp);
  res.json(new ApiResponse(200, result, 'Login successful'));
});

export const citizenRegister = catchAsync(async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json(new ApiResponse(400, null, 'Name, email and password are required'));
  }
  if (password.length < 6) {
    return res.status(400).json(new ApiResponse(400, null, 'Password must be at least 6 characters'));
  }
  const result = await citizenService.register({ name, email, phone, password });
  res.status(201).json(new ApiResponse(201, result, 'Registration initiated'));
});

export const citizenLogin = catchAsync(async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json(new ApiResponse(400, null, 'Email/phone and password are required'));
  }
  const result = await citizenService.login(identifier, password);
  res.json(new ApiResponse(200, result, 'Login successful'));
});

export const citizenForgotPassword = catchAsync(async (req, res) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json(new ApiResponse(400, null, 'Email or phone is required'));
  }
  const result = await citizenService.forgotPassword(identifier);
  res.json(new ApiResponse(200, result, 'OTP sent'));
});

export const citizenResetPassword = catchAsync(async (req, res) => {
  const { identifier, otp, newPassword } = req.body;
  if (!identifier || !otp || !newPassword) {
    return res.status(400).json(new ApiResponse(400, null, 'All fields are required'));
  }
  if (newPassword.length < 6) {
    return res.status(400).json(new ApiResponse(400, null, 'Password must be at least 6 characters'));
  }
  const result = await citizenService.resetPassword(identifier, otp, newPassword);
  res.json(new ApiResponse(200, result, 'Password reset successful'));
});

export const googleAuth = catchAsync(async (req, res) => {
  const { googleId, email, name } = req.body;
  const result = await citizenService.googleAuth(googleId, email, name);
  res.json(new ApiResponse(200, result, 'Login successful'));
});

export const citizenRefreshToken = catchAsync(async (req, res) => {
  const result = await citizenService.refreshToken(req.body.refreshToken);
  res.json(new ApiResponse(200, result, 'Token refreshed'));
});

export const getCitizenProfile = catchAsync(async (req, res) => {
  const result = await citizenService.getProfile(req.citizen.id);
  res.json(new ApiResponse(200, result));
});

export const updateCitizenProfile = catchAsync(async (req, res) => {
  const result = await citizenService.updateProfile(req.citizen.id, req.body);
  res.json(new ApiResponse(200, result, 'Profile updated'));
});

// ─── Family ────────────────────────────────────────────────

export const registerFamily = catchAsync(async (req, res) => {
  const villageId = req.body.villageId || req.tenant?.id;
  if (!villageId) {
    return res.status(400).json(new ApiResponse(400, null, 'Village ID required'));
  }
  const result = await citizenService.registerFamily(req.citizen.id, villageId, req.body);
  res.status(201).json(new ApiResponse(201, result, 'Family registered'));
});

export const getFamilies = catchAsync(async (req, res) => {
  const result = await citizenService.getFamilies(req.citizen.id);
  res.json(new ApiResponse(200, result));
});

export const getFamily = catchAsync(async (req, res) => {
  const result = await citizenService.getFamily(req.citizen.id, req.params.id);
  res.json(new ApiResponse(200, result));
});

export const addFamilyMember = catchAsync(async (req, res) => {
  const result = await citizenService.addFamilyMember(req.citizen.id, req.params.familyId, req.body);
  res.status(201).json(new ApiResponse(201, result, 'Family member added'));
});

export const updateFamilyMember = catchAsync(async (req, res) => {
  const result = await citizenService.updateFamilyMember(req.citizen.id, req.params.memberId, req.body);
  res.json(new ApiResponse(200, result, 'Family member updated'));
});

export const deleteFamilyMember = catchAsync(async (req, res) => {
  const result = await citizenService.deleteFamilyMember(req.citizen.id, req.params.memberId);
  res.json(new ApiResponse(200, result));
});

// ─── Certificate Types ─────────────────────────────────────

export const getCertificateTypes = catchAsync(async (req, res) => {
  const result = await citizenService.getCertificateTypes();
  res.json(new ApiResponse(200, result));
});

// ─── Certificate Applications (Citizen) ────────────────────

export const applyCertificate = catchAsync(async (req, res) => {
  const villageId = req.body.villageId || req.tenant?.id;
  if (!villageId) {
    return res.status(400).json(new ApiResponse(400, null, 'Village ID required'));
  }
  const result = await citizenService.applyCertificate(req.citizen.id, villageId, req.body);
  res.status(201).json(new ApiResponse(201, result, 'Application submitted'));
});

export const getMyApplications = catchAsync(async (req, res) => {
  const villageId = req.query.villageId || req.tenant?.id || null;
  const result = await citizenService.getMyApplications(req.citizen.id, villageId, req.query);
  res.json(new ApiResponse(200, result));
});

export const getApplicationDetail = catchAsync(async (req, res) => {
  const result = await citizenService.getApplicationDetail(req.citizen.id, req.params.id);
  res.json(new ApiResponse(200, result));
});

// ─── Payment (Citizen) ─────────────────────────────────────

export const submitPayment = catchAsync(async (req, res) => {
  const result = await citizenService.submitPayment(req.citizen.id, req.params.applicationId, req.body);
  res.json(new ApiResponse(200, result, 'Payment submitted for verification'));
});

export const getPaymentConfig = catchAsync(async (req, res) => {
  const villageId = req.query.villageId || req.tenant?.id;
  if (!villageId) {
    return res.status(400).json(new ApiResponse(400, null, 'Village ID required'));
  }
  const result = await citizenService.getPaymentConfig(villageId);
  res.json(new ApiResponse(200, result));
});

// ─── Admin Certificate Operations ──────────────────────────

export const adminGetCertApplications = catchAsync(async (req, res) => {
  const villageId = req.user.villageId || req.tenant?.id;
  const result = await citizenService.adminGetApplications(villageId, req.query);
  res.json(new ApiResponse(200, result));
});

export const adminGetCertApplication = catchAsync(async (req, res) => {
  const villageId = req.user.villageId || req.tenant?.id;
  const result = await citizenService.adminGetApplication(villageId, req.params.id);
  res.json(new ApiResponse(200, result));
});

export const adminVerifyPayment = catchAsync(async (req, res) => {
  const villageId = req.user.villageId || req.tenant?.id;
  const result = await citizenService.adminVerifyPayment(
    villageId, req.params.id, req.user.id, req.body.verified, req.body.remarks
  );
  res.json(new ApiResponse(200, result));
});

export const adminUpdateCertApplication = catchAsync(async (req, res) => {
  const villageId = req.user.villageId || req.tenant?.id;
  const result = await citizenService.adminUpdateApplication(villageId, req.params.id, req.body);
  res.json(new ApiResponse(200, result));
});

export const adminApplyOnBehalf = catchAsync(async (req, res) => {
  const villageId = req.user.villageId || req.tenant?.id;
  const result = await citizenService.adminApplyOnBehalf(villageId, req.user.id, req.body);
  res.status(201).json(new ApiResponse(201, result, 'Application created'));
});

export const adminMarkOfflinePayment = catchAsync(async (req, res) => {
  const villageId = req.user.villageId || req.tenant?.id;
  const result = await citizenService.adminMarkOfflinePayment(
    villageId, req.params.id, req.user.id, req.body.remarks
  );
  res.json(new ApiResponse(200, result));
});

export const adminSearchFamilies = catchAsync(async (req, res) => {
  const villageId = req.user.villageId || req.tenant?.id;
  const result = await citizenService.adminSearchFamilies(villageId, req.query.search);
  res.json(new ApiResponse(200, result));
});

export const adminAddFamily = catchAsync(async (req, res) => {
  const villageId = req.user.villageId || req.tenant?.id;
  const result = await citizenService.adminAddFamily(villageId, req.body);
  res.status(201).json(new ApiResponse(201, result, 'Family created'));
});

export const adminAddFamilyMember = catchAsync(async (req, res) => {
  const villageId = req.user.villageId || req.tenant?.id;
  const result = await citizenService.adminAddFamilyMember(villageId, req.params.familyId, req.body);
  res.status(201).json(new ApiResponse(201, result, 'Member added'));
});

export const adminGetCertStats = catchAsync(async (req, res) => {
  const villageId = req.user.villageId || req.tenant?.id;
  const result = await citizenService.adminGetStats(villageId);
  res.json(new ApiResponse(200, result));
});

// ─── Admin Payment Config ──────────────────────────────────

export const adminGetPaymentConfig = catchAsync(async (req, res) => {
  const villageId = req.user.villageId || req.tenant?.id;
  const result = await citizenService.adminGetPaymentConfig(villageId);
  res.json(new ApiResponse(200, result));
});

export const adminUpsertPaymentConfig = catchAsync(async (req, res) => {
  const villageId = req.user.villageId || req.tenant?.id;
  const result = await citizenService.adminUpsertPaymentConfig(villageId, req.body);
  res.json(new ApiResponse(200, result, 'Payment config updated'));
});

// ─── सहपत्र-ब Register ────────────────────────────────────

export const adminGetRegister = catchAsync(async (req, res) => {
  const villageId = req.user.villageId || req.tenant?.id;
  let { financialYear, certificateTypeId } = req.query;
  if (!financialYear) {
    // Default to current financial year (Apr-Mar)
    const now = new Date();
    const y = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    financialYear = `${y}-${y + 1}`;
  }
  const result = await citizenService.adminGetRegister(villageId, financialYear, certificateTypeId);
  res.json(new ApiResponse(200, { register: result, financialYear }));
});

// ─── Public Certificate Verification ───────────────────────

export const verifyCertificate = catchAsync(async (req, res) => {
  const result = await citizenService.verifyCertificate(req.params.certificateNo);
  res.json(new ApiResponse(200, result));
});

// ─── PDF Downloads (On-Demand Generation) ──────────────────

export const downloadCertificatePDF = catchAsync(async (req, res) => {
  const applicationId = req.params.applicationId;
  
  // Verify user has access to this application
  const application = await citizenService.getApplicationDetail(req.citizen.id, applicationId);
  if (!application) {
    return res.status(404).json(new ApiResponse(404, null, 'Application not found'));
  }
  
  if (application.status !== 'approved' && application.status !== 'issued') {
    return res.status(400).json(new ApiResponse(400, null, 'Certificate not yet approved'));
  }
  
  // Generate PDF buffer
  const pdfBuffer = await generateCertificatePDF(applicationId);
  
  // Set headers for download
  const fileName = `Certificate_${application.applicationNo}_${Date.now()}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Length', pdfBuffer.length);
  
  // Send PDF
  res.send(pdfBuffer);
});

export const downloadReceiptPDF = catchAsync(async (req, res) => {
  const applicationId = req.params.applicationId;
  
  // Verify user has access to this application
  const application = await citizenService.getApplicationDetail(req.citizen.id, applicationId);
  if (!application || !application.payment) {
    return res.status(404).json(new ApiResponse(404, null, 'Payment not found'));
  }
  
  if (application.payment.status !== 'verified') {
    return res.status(400).json(new ApiResponse(400, null, 'Payment not yet verified'));
  }
  
  // Generate PDF buffer
  const pdfBuffer = await generateReceiptPDF(applicationId);
  
  // Set headers for download
  const fileName = `Receipt_${application.applicationNo}_${Date.now()}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Length', pdfBuffer.length);
  
  // Send PDF
  res.send(pdfBuffer);
});
