import api from "./api";

// ---- Types ----

export interface Member {
  id: string;
  villageId: string;
  name: string;
  designation: string;
  type: string;
  phone: string | null;
  email: string | null;
  photoUrl: string | null;
  bio: string | null;
  backContent: Record<string, unknown> | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notice {
  id: string;
  villageId: string;
  title: string;
  content: string;
  category: string;
  imageUrl: string | null;
  priority: string;
  isPopup: boolean;
  isPublished: boolean;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryImage {
  id: string;
  villageId: string;
  title: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  caption: string | null;
  category: string;
  sortOrder: number;
  createdAt: string;
}

export interface VillageContent {
  id: string;
  villageId: string;
  section: string;
  content: Record<string, unknown>;
  updatedAt: string;
}

export interface Application {
  id: string;
  villageId: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail: string | null;
  serviceType: string;
  description: string | null;
  status: string;
  remarks: string | null;
  attachmentUrl: string | null;
  certificateUrl: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  village: {
    id: string;
    name: string;
    slug: string;
    subdomain: string;
    settings: Record<string, unknown>;
    tehsil: { id: string; name: string; district: string; state: string };
  };
  stats: {
    members: number;
    notices: number;
    applications: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    };
    galleryImages: number;
  };
}

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  serviceType?: string;
  category?: string;
}

// ---- Service ----

export const villageAdminService = {
  // Dashboard
  async getDashboardStats() {
    const response = await api.get("/api/village/dashboard/stats");
    return response.data;
  },

  // Members
  async getMembers() {
    const response = await api.get("/api/village/members");
    return response.data;
  },

  async getMember(id: string) {
    const response = await api.get(`/api/village/members/${id}`);
    return response.data;
  },

  async createMember(data: {
    name: string;
    designation: string;
    type?: string;
    phone?: string;
    email?: string;
    photoUrl?: string;
    bio?: string;
    sortOrder?: number;
  }) {
    const response = await api.post("/api/village/members", data);
    return response.data;
  },

  async updateMember(
    id: string,
    data: {
      name?: string;
      designation?: string;
      type?: string;
      phone?: string;
      email?: string;
      photoUrl?: string;
      bio?: string;
      sortOrder?: number;
      isActive?: boolean;
    }
  ) {
    const response = await api.put(`/api/village/members/${id}`, data);
    return response.data;
  },

  async deleteMember(id: string) {
    const response = await api.delete(`/api/village/members/${id}`);
    return response.data;
  },

  // Notices
  async getNotices(params: PaginationParams = {}) {
    const response = await api.get("/api/village/notices", { params });
    return response.data;
  },

  async getNotice(id: string) {
    const response = await api.get(`/api/village/notices/${id}`);
    return response.data;
  },

  async createNotice(data: {
    title: string;
    content: string;
    category?: string;
    isPublished?: boolean;
    expiresAt?: string | null;
  }) {
    const response = await api.post("/api/village/notices", data);
    return response.data;
  },

  async updateNotice(
    id: string,
    data: {
      title?: string;
      content?: string;
      category?: string;
      isPublished?: boolean;
      expiresAt?: string | null;
    }
  ) {
    const response = await api.put(`/api/village/notices/${id}`, data);
    return response.data;
  },

  async deleteNotice(id: string) {
    const response = await api.delete(`/api/village/notices/${id}`);
    return response.data;
  },

  // Gallery
  async getGalleryImages() {
    const response = await api.get("/api/village/gallery");
    return response.data;
  },

  async createGalleryImage(data: {
    title?: string;
    imageUrl?: string;
    videoUrl?: string;
    caption?: string;
    category?: string;
    sortOrder?: number;
  }) {
    const response = await api.post("/api/village/gallery", data);
    return response.data;
  },

  async deleteGalleryImage(id: string) {
    const response = await api.delete(`/api/village/gallery/${id}`);
    return response.data;
  },

  // Content
  async getAllContent() {
    const response = await api.get("/api/village/content");
    return response.data;
  },

  async getContent(section: string) {
    const response = await api.get(`/api/village/content/${section}`);
    return response.data;
  },

  async upsertContent(section: string, content: Record<string, unknown>) {
    const response = await api.put(`/api/village/content/${section}`, {
      content,
    });
    return response.data;
  },

  // Applications
  async getApplications(params: PaginationParams = {}) {
    const response = await api.get("/api/village/applications", { params });
    return response.data;
  },

  async getApplication(id: string) {
    const response = await api.get(`/api/village/applications/${id}`);
    return response.data;
  },

  async updateApplicationStatus(
    id: string,
    data: { status: string; remarks?: string }
  ) {
    const response = await api.patch(
      `/api/village/applications/${id}/status`,
      data
    );
    return response.data;
  },

  // Settings
  async getSettings() {
    const response = await api.get("/api/village/settings");
    return response.data;
  },

  async updateSettings(settings: Record<string, unknown>) {
    const response = await api.put("/api/village/settings", { settings });
    return response.data;
  },

  // Hero Slides
  async getHeroSlides() {
    const response = await api.get("/api/village/hero-slides");
    return response.data;
  },

  async createHeroSlide(data: {
    imageUrl: string;
    altText?: string;
    sortOrder?: number;
    isActive?: boolean;
  }) {
    const response = await api.post("/api/village/hero-slides", data);
    return response.data;
  },

  async updateHeroSlide(
    id: string,
    data: {
      imageUrl?: string;
      altText?: string;
      sortOrder?: number;
      isActive?: boolean;
    }
  ) {
    const response = await api.put(`/api/village/hero-slides/${id}`, data);
    return response.data;
  },

  async deleteHeroSlide(id: string) {
    const response = await api.delete(`/api/village/hero-slides/${id}`);
    return response.data;
  },

  // Programs
  async getPrograms(params: PaginationParams = {}) {
    const response = await api.get("/api/village/programs", { params });
    return response.data;
  },

  async getProgram(id: string) {
    const response = await api.get(`/api/village/programs/${id}`);
    return response.data;
  },

  async createProgram(data: {
    title: string;
    description?: string;
    category?: string;
    location?: string;
    date?: string;
    images?: string[];
    highlights?: string[];
    result?: string;
    isPublished?: boolean;
  }) {
    const response = await api.post("/api/village/programs", data);
    return response.data;
  },

  async updateProgram(
    id: string,
    data: {
      title?: string;
      description?: string;
      category?: string;
      location?: string;
      date?: string;
      images?: string[];
      highlights?: string[];
      result?: string;
      isPublished?: boolean;
    }
  ) {
    const response = await api.put(`/api/village/programs/${id}`, data);
    return response.data;
  },

  async deleteProgram(id: string) {
    const response = await api.delete(`/api/village/programs/${id}`);
    return response.data;
  },

  // Schemes
  async getSchemes(params: PaginationParams = {}) {
    const response = await api.get("/api/village/schemes", { params });
    return response.data;
  },

  async getScheme(id: string) {
    const response = await api.get(`/api/village/schemes/${id}`);
    return response.data;
  },

  async createScheme(data: {
    title: string;
    description?: string;
    category?: string;
    benefits?: string[];
    eligibility?: string[];
    documents?: string[];
    applicationProcess?: string[];
    contactInfo?: string;
    budget?: string;
    beneficiaries?: string;
    imageUrl?: string | null;
    schemeLink?: string | null;
    isActive?: boolean;
  }) {
    const response = await api.post("/api/village/schemes", data);
    return response.data;
  },

  async updateScheme(
    id: string,
    data: {
      title?: string;
      description?: string;
      category?: string;
      benefits?: string[];
      eligibility?: string[];
      documents?: string[];
      applicationProcess?: string[];
      contactInfo?: string;
      budget?: string;
      beneficiaries?: string;
      imageUrl?: string | null;
      schemeLink?: string | null;
      isActive?: boolean;
    }
  ) {
    const response = await api.put(`/api/village/schemes/${id}`, data);
    return response.data;
  },

  async deleteScheme(id: string) {
    const response = await api.delete(`/api/village/schemes/${id}`);
    return response.data;
  },

  // Contact Submissions
  async getContactSubmissions(params: PaginationParams = {}) {
    const response = await api.get("/api/village/contact-submissions", {
      params,
    });
    return response.data;
  },

  async updateContactSubmissionStatus(id: string, status: string) {
    const response = await api.patch(
      `/api/village/contact-submissions/${id}/status`,
      { status }
    );
    return response.data;
  },

  async deleteContactSubmission(id: string) {
    const response = await api.delete(
      `/api/village/contact-submissions/${id}`
    );
    return response.data;
  },

  // Image Upload
  async uploadImages(section: string, files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    const response = await api.post(
      `/api/village/upload/${section}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data.data.images.map(
      (img: Record<string, string>) => img.url || img.full || Object.values(img)[0] || ""
    );
  },

  async deleteUploadedImage(imageUrl: string): Promise<void> {
    await api.delete("/api/village/upload/image", {
      data: { imageUrl },
    });
  },

  // Awards
  async getAwards(params: PaginationParams = {}) {
    const response = await api.get("/api/village/awards", { params });
    return response.data;
  },
  async getAward(id: string) {
    const response = await api.get(`/api/village/awards/${id}`);
    return response.data;
  },
  async createAward(data: {
    title: string;
    description?: string;
    year?: number;
    category?: string;
    awardedBy?: string;
    imageUrl?: string;
    sortOrder?: number;
    isActive?: boolean;
  }) {
    const response = await api.post("/api/village/awards", data);
    return response.data;
  },
  async updateAward(
    id: string,
    data: {
      title?: string;
      description?: string;
      year?: number;
      category?: string;
      awardedBy?: string;
      imageUrl?: string;
      sortOrder?: number;
      isActive?: boolean;
    }
  ) {
    const response = await api.put(`/api/village/awards/${id}`, data);
    return response.data;
  },
  async deleteAward(id: string) {
    const response = await api.delete(`/api/village/awards/${id}`);
    return response.data;
  },

  // Financial Reports
  async getFinancialReports() {
    const response = await api.get("/api/village/financial-reports");
    return response.data;
  },
  async getFinancialReport(id: string) {
    const response = await api.get(`/api/village/financial-reports/${id}`);
    return response.data;
  },
  async createFinancialReport(data: {
    financialYear: string;
    incomeAmount: number;
    expenseAmount: number;
    balanceAmount: number;
    pdfUrl?: string;
    isPublished?: boolean;
  }) {
    const response = await api.post("/api/village/financial-reports", data);
    return response.data;
  },
  async updateFinancialReport(
    id: string,
    data: {
      financialYear?: string;
      incomeAmount?: number;
      expenseAmount?: number;
      balanceAmount?: number;
      pdfUrl?: string;
      isPublished?: boolean;
    }
  ) {
    const response = await api.put(`/api/village/financial-reports/${id}`, data);
    return response.data;
  },
  async deleteFinancialReport(id: string) {
    const response = await api.delete(`/api/village/financial-reports/${id}`);
    return response.data;
  },

  // Gramsabha
  async getGramsabhas(params: PaginationParams = {}) {
    const response = await api.get("/api/village/gramsabhas", { params });
    return response.data;
  },
  async getGramsabha(id: string) {
    const response = await api.get(`/api/village/gramsabhas/${id}`);
    return response.data;
  },
  async createGramsabha(data: {
    title: string;
    date: string;
    time?: string;
    location?: string;
    agenda?: string;
    status?: string;
  }) {
    const response = await api.post("/api/village/gramsabhas", data);
    return response.data;
  },
  async updateGramsabha(
    id: string,
    data: {
      title?: string;
      date?: string;
      time?: string;
      location?: string;
      agenda?: string;
      status?: string;
      attendeesTotal?: number | null;
      attendeesMale?: number | null;
      attendeesFemale?: number | null;
      minutes?: string;
      decisions?: string[];
      imageUrl?: string;
      pdfUrl?: string;
    }
  ) {
    const response = await api.put(`/api/village/gramsabhas/${id}`, data);
    return response.data;
  },
  async deleteGramsabha(id: string) {
    const response = await api.delete(`/api/village/gramsabhas/${id}`);
    return response.data;
  },

  // Schools
  async getSchools() {
    const response = await api.get("/api/village/schools");
    return response.data;
  },
  async getSchool(id: string) {
    const response = await api.get(`/api/village/schools/${id}`);
    return response.data;
  },
  async createSchool(data: {
    name: string;
    address?: string;
    principalName?: string;
    principalPhoto?: string;
    schoolPhoto?: string;
    boysCount?: number;
    girlsCount?: number;
    teachersCount?: number;
    establishedYear?: number;
    phone?: string;
    email?: string;
    managementType?: string;
    medium?: string;
    isActive?: boolean;
  }) {
    const response = await api.post("/api/village/schools", data);
    return response.data;
  },
  async updateSchool(
    id: string,
    data: {
      name?: string;
      address?: string;
      principalName?: string;
      principalPhoto?: string;
      schoolPhoto?: string;
      boysCount?: number;
      girlsCount?: number;
      teachersCount?: number;
      establishedYear?: number;
      phone?: string;
      email?: string;
      managementType?: string;
      medium?: string;
      isActive?: boolean;
    }
  ) {
    const response = await api.put(`/api/village/schools/${id}`, data);
    return response.data;
  },
  async deleteSchool(id: string) {
    const response = await api.delete(`/api/village/schools/${id}`);
    return response.data;
  },

  // Development Works
  async getDevelopmentWorks(params?: { financialYear?: string; status?: string }) {
    const response = await api.get("/api/village/development-works", { params });
    return response.data;
  },
  async getDevelopmentWork(id: string) {
    const response = await api.get(`/api/village/development-works/${id}`);
    return response.data;
  },
  async createDevelopmentWork(data: {
    schemeName: string;
    workName: string;
    financialYear: string;
    sanctionedAmount: number;
    expendedAmount?: number;
    status?: string;
    isPublished?: boolean;
  }) {
    const response = await api.post("/api/village/development-works", data);
    return response.data;
  },
  async updateDevelopmentWork(
    id: string,
    data: {
      schemeName?: string;
      workName?: string;
      financialYear?: string;
      sanctionedAmount?: number;
      expendedAmount?: number;
      status?: string;
      isPublished?: boolean;
    }
  ) {
    const response = await api.put(`/api/village/development-works/${id}`, data);
    return response.data;
  },
  async deleteDevelopmentWork(id: string) {
    const response = await api.delete(`/api/village/development-works/${id}`);
    return response.data;
  },

  async uploadPdf(section: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("pdf", file);
    const response = await api.post(
      `/api/village/upload/pdf/${section}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data.data.url;
  },

  // ─── Certificate Management (Admin) ───────────────────────

  async getCertificateStats() {
    const response = await api.get("/api/village/certificates/stats");
    return response.data;
  },

  async getCertificateApplications(params?: {
    status?: string;
    certificateTypeId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get("/api/village/certificates/applications", { params });
    return response.data;
  },

  async getCertificateApplication(id: string) {
    const response = await api.get(`/api/village/certificates/applications/${id}`);
    return response.data;
  },

  async updateCertificateApplication(id: string, data: {
    status?: string;
    adminRemarks?: string;
    rejectionReason?: string;
    certificateUrl?: string;
    dispatchNo?: string;
    formData?: Record<string, unknown>;
    applicantName?: string;
    applicantAadhar?: string;
    documents?: string[];
  }) {
    const response = await api.patch(`/api/village/certificates/applications/${id}`, data);
    return response.data;
  },

  async verifyCertificatePayment(applicationId: string, data: {
    verified: boolean;
    remarks?: string;
  }) {
    const response = await api.post(`/api/village/certificates/applications/${applicationId}/verify-payment`, data);
    return response.data;
  },

  async applyOnBehalf(data: {
    familyId?: string;
    familyMemberId?: string;
    certificateTypeId: string;
    applicantName: string;
    applicantAadhar: string;
    applicantMobile?: string;
    dob?: string;
    formData?: Record<string, unknown>;
    documents?: string[];
    paymentCollected?: boolean;
  }) {
    const response = await api.post("/api/village/certificates/apply-on-behalf", data);
    return response.data;
  },

  async getPaymentConfig() {
    const response = await api.get("/api/village/certificates/payment-config");
    return response.data;
  },

  async upsertPaymentConfig(data: {
    bankName?: string;
    accountNo?: string;
    ifscCode?: string;
    accountHolder?: string;
    upiId?: string;
    qrCodeUrl?: string;
    instructions?: string;
    isActive?: boolean;
  }) {
    const response = await api.put("/api/village/certificates/payment-config", data);
    return response.data;
  },

  async getCertificateRegister(params?: {
    financialYear?: string;
    certificateTypeId?: string;
  }) {
    const response = await api.get("/api/village/certificates/register", { params });
    return response.data;
  },

  // ── Offline Payment ──────────────────────────────────────
  async markOfflinePayment(applicationId: string, data?: { remarks?: string }) {
    const response = await api.post(`/api/village/certificates/applications/${applicationId}/offline-payment`, data || {});
    return response.data;
  },

  // ── Family Management ────────────────────────────────────
  async searchFamilies(params?: { search?: string }) {
    const response = await api.get("/api/village/certificates/families", { params });
    return response.data;
  },

  async addFamily(data: {
    headName: string;
    headDob: string;
    headAadhar: string;
    phone?: string;
    headRationCard?: string;
    headVoterId?: string;
  }) {
    const response = await api.post("/api/village/certificates/families", data);
    return response.data;
  },

  async addFamilyMember(familyId: string, data: {
    name: string;
    dob: string;
    aadhar: string;
    relation: string;
    voterId?: string;
  }) {
    const response = await api.post(`/api/village/certificates/families/${familyId}/members`, data);
    return response.data;
  },

  // ── PDF Downloads (on-demand generation) ─────────────────
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

  // ── Complaints ────────────────────────────────────────────
  async getComplaints(params?: { page?: number; limit?: number; status?: string; category?: string; search?: string }) {
    const response = await api.get("/api/village/complaints", { params });
    return response.data;
  },
  async getComplaint(id: string) {
    const response = await api.get(`/api/village/complaints/${id}`);
    return response.data;
  },
  async updateComplaint(id: string, data: { status: string; response?: string }) {
    const response = await api.patch(`/api/village/complaints/${id}`, data);
    return response.data;
  },
  async deleteComplaint(id: string) {
    const response = await api.delete(`/api/village/complaints/${id}`);
    return response.data;
  },
  async getComplaintStats() {
    const response = await api.get("/api/village/complaints/stats");
    return response.data;
  },

  // ── Tax Payments ────────────────────────────────────────────
  async getTaxPayments(params?: { page?: number; limit?: number; status?: string; taxType?: string; search?: string; year?: string; from?: string; to?: string }) {
    const response = await api.get("/api/village/tax-payments", { params });
    return response.data;
  },
  async getTaxPayment(id: string) {
    const response = await api.get(`/api/village/tax-payments/${id}`);
    return response.data;
  },
  async updateTaxPayment(id: string, data: { status: string; adminNote?: string }) {
    const response = await api.patch(`/api/village/tax-payments/${id}`, data);
    return response.data;
  },
  async deleteTaxPayment(id: string) {
    const response = await api.delete(`/api/village/tax-payments/${id}`);
    return response.data;
  },
  async getTaxStats(params?: { from?: string; to?: string; year?: string }) {
    const response = await api.get("/api/village/tax-payments/stats", { params });
    return response.data;
  },
  async getTaxYears() {
    const response = await api.get("/api/village/tax-payments/years");
    return response.data;
  },
};
