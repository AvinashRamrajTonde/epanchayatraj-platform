import api from "./api";

// ─── Types ─────────────────────────────────────────────────

export interface CitizenUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  mobile: string | null;
  isVerified: boolean;
}

export interface Family {
  id: string;
  familyId: string;
  villageId: string;
  village: { id: string; name: string; slug: string; subdomain: string };
  headName: string;
  headDob: string;
  headAadhar: string;
  headRationCard: string | null;
  headVoterId: string | null;
  members: FamilyMember[];
  _count?: { certificates: number };
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  familyId: string;
  name: string;
  dob: string;
  aadhar: string;
  voterId: string | null;
  relation: string;
  createdAt: string;
}

export interface CertificateType {
  id: string;
  code: string;
  nameMarathi: string;
  nameEnglish: string;
  fee: number;
  processingDays: number;
  requiredDocuments: string[];
  designatedOfficer: string | null;
  firstAppellate: string | null;
  secondAppellate: string | null;
  isActive: boolean;
}

export interface CertificateApplication {
  id: string;
  applicationNo: string;
  villageId: string;
  familyId: string;
  familyMemberId: string | null;
  certificateTypeId: string;
  applicantName: string;
  applicantAadhar: string;
  formData: Record<string, unknown>;
  documents: string[];
  status: string;
  rejectionReason: string | null;
  adminRemarks: string | null;
  certificateNo: string | null;
  certificateUrl: string | null;
  dispatchNo: string | null;
  appliedByAdmin: boolean;
  processedAt: string | null;
  issuedAt: string | null;
  createdAt: string;
  updatedAt: string;
  certificateType: CertificateType;
  payment: CertificatePayment | null;
  village?: { id: string; name: string; slug: string };
  family?: { familyId: string; headName: string };
  familyMember?: FamilyMember | null;
}

export interface CertificatePayment {
  id: string;
  applicationId: string;
  amount: number;
  utrNumber: string | null;
  screenshotUrl: string | null;
  paymentMethod: string | null;
  status: string;
  verifiedAt: string | null;
  receiptNo: string | null;
  receiptUrl: string | null;
  bankName: string | null;
  accountNo: string | null;
  ifscCode: string | null;
  remarks: string | null;
  createdAt: string;
}

export interface PaymentConfig {
  id: string;
  villageId: string;
  bankName: string | null;
  accountNo: string | null;
  ifscCode: string | null;
  accountHolder: string | null;
  upiId: string | null;
  qrCodeUrl: string | null;
  instructions: string | null;
  isActive: boolean;
}

// ─── Service ────────────────────────────────────────────────

export const citizenService = {
  // Auth
  async sendOTP(email: string) {
    const response = await api.post("/api/citizen/auth/send-otp", { email });
    return response.data;
  },

  async verifyOTP(email: string, otp: string) {
    const response = await api.post("/api/citizen/auth/verify-otp", { email, otp });
    return response.data;
  },

  async register(data: { name: string; email: string; phone?: string; password: string }) {
    const response = await api.post("/api/citizen/auth/register", data);
    return response.data;
  },

  async login(identifier: string, password: string) {
    const response = await api.post("/api/citizen/auth/login", { identifier, password });
    return response.data;
  },

  async forgotPassword(identifier: string) {
    const response = await api.post("/api/citizen/auth/forgot-password", { identifier });
    return response.data;
  },

  async resetPassword(identifier: string, otp: string, newPassword: string) {
    const response = await api.post("/api/citizen/auth/reset-password", { identifier, otp, newPassword });
    return response.data;
  },

  async googleAuth(googleId: string, email: string, name: string) {
    const response = await api.post("/api/citizen/auth/google", { googleId, email, name });
    return response.data;
  },

  async refreshToken(refreshToken: string) {
    const response = await api.post("/api/citizen/auth/refresh-token", { refreshToken });
    return response.data;
  },

  // Profile
  async getProfile() {
    const response = await api.get("/api/citizen/profile");
    return response.data;
  },

  async updateProfile(data: { name: string; email?: string; mobile?: string }) {
    const response = await api.put("/api/citizen/profile", data);
    return response.data;
  },

  // Family
  async registerFamily(data: {
    villageId: string;
    headName: string;
    headDob: string;
    headAadhar: string;
    headRationCard?: string;
    headVoterId?: string;
  }) {
    const response = await api.post("/api/citizen/families", data);
    return response.data;
  },

  async getFamilies() {
    const response = await api.get("/api/citizen/families");
    return response.data;
  },

  async getFamily(id: string) {
    const response = await api.get(`/api/citizen/families/${id}`);
    return response.data;
  },

  async addFamilyMember(familyId: string, data: {
    name: string;
    dob: string;
    aadhar: string;
    voterId?: string;
    relation: string;
  }) {
    const response = await api.post(`/api/citizen/families/${familyId}/members`, data);
    return response.data;
  },

  async updateFamilyMember(memberId: string, data: {
    name: string;
    dob: string;
    aadhar: string;
    voterId?: string;
    relation: string;
  }) {
    const response = await api.put(`/api/citizen/families/members/${memberId}`, data);
    return response.data;
  },

  async deleteFamilyMember(memberId: string) {
    const response = await api.delete(`/api/citizen/families/members/${memberId}`);
    return response.data;
  },

  // Certificate types
  async getCertificateTypes(): Promise<{ data: CertificateType[] }> {
    const response = await api.get("/api/citizen/certificate-types");
    return response.data;
  },

  // Applications
  async applyCertificate(data: {
    villageId: string;
    familyId: string;
    familyMemberId?: string;
    certificateTypeId: string;
    applicantName: string;
    applicantAadhar: string;
    formData: Record<string, unknown>;
    documents?: string[];
  }) {
    const response = await api.post("/api/citizen/certificates/apply", data);
    return response.data;
  },

  async getMyApplications(params?: {
    villageId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get("/api/citizen/certificates/applications", { params });
    return response.data;
  },

  async getApplicationDetail(id: string) {
    const response = await api.get(`/api/citizen/certificates/applications/${id}`);
    return response.data;
  },

  // Payment
  async submitPayment(applicationId: string, data: {
    utrNumber: string;
    screenshotUrl?: string;
    paymentMethod?: string;
  }) {
    const response = await api.post(`/api/citizen/certificates/applications/${applicationId}/payment`, data);
    return response.data;
  },

  async getPaymentConfig(villageId: string) {
    const response = await api.get("/api/citizen/payment-config", { params: { villageId } });
    return response.data;
  },

  // Certificate Verification (public)
  async verifyCertificate(certificateNo: string) {
    const response = await api.get(`/api/citizen/verify/${encodeURIComponent(certificateNo)}`);
    return response.data;
  },

  // Image upload for certificates / payment screenshot
  async uploadImages(section: string, files: File[]) {
    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));
    const response = await api.post(`/api/citizen/upload/${section}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // PDF Downloads (on-demand generation)
  async downloadCertificate(applicationId: string) {
    const response = await api.get(`/api/citizen/certificates/applications/${applicationId}/download`, {
      responseType: "blob",
    });
    return response.data;
  },

  async downloadReceipt(applicationId: string) {
    const response = await api.get(`/api/citizen/certificates/applications/${applicationId}/receipt`, {
      responseType: "blob",
    });
    return response.data;
  },
};
