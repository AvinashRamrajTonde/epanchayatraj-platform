import api from "./api";

// ---- Types ----

export interface VillageInfo {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  status: string;
  theme: string;
  settings: Record<string, unknown>;
  tehsil: { id: string; name: string; district: string; state: string };
  createdAt: string;
}

export interface HeroSlide {
  id: string;
  villageId: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

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
}

export interface Program {
  id: string;
  villageId: string;
  title: string;
  description: string | null;
  category: string;
  location: string | null;
  date: string | null;
  images: string[];
  highlights: string[];
  result: string | null;
  isPublished: boolean;
  createdAt: string;
}

export interface Scheme {
  id: string;
  villageId: string;
  title: string;
  description: string | null;
  category: string;
  benefits: string[];
  eligibility: string[];
  documents: string[];
  applicationProcess: string[];
  contactInfo: string | null;
  budget: string | null;
  beneficiaries: string | null;
  imageUrl: string | null;
  schemeLink: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface GalleryImage {
  id: string;
  villageId: string;
  title: string | null;
  imageUrl: string;
  caption: string | null;
  category: string;
  sortOrder: number;
  createdAt: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  subject: string | null;
  message: string;
  status: string;
  createdAt: string;
}

export interface Award {
  id: string;
  villageId: string;
  title: string;
  description: string | null;
  year: number | null;
  category: string;
  awardedBy: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface FinancialReport {
  id: string;
  villageId: string;
  financialYear: string;
  incomeAmount: number;
  expenseAmount: number;
  balanceAmount: number;
  pdfUrl: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Gramsabha {
  id: string;
  villageId: string;
  title: string;
  date: string;
  time: string | null;
  location: string | null;
  agenda: string | null;
  status: string;
  attendeesTotal: number | null;
  attendeesMale: number | null;
  attendeesFemale: number | null;
  minutes: string | null;
  decisions: string[] | null;
  imageUrl: string | null;
  pdfUrl: string | null;
  noticeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DevelopmentWork {
  id: string;
  villageId: string;
  schemeName: string;
  workName: string;
  financialYear: string;
  sanctionedAmount: number;
  expendedAmount: number;
  status: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface School {
  id: string;
  villageId: string;
  name: string;
  address: string | null;
  principalName: string | null;
  principalPhoto: string | null;
  schoolPhoto: string | null;
  boysCount: number;
  girlsCount: number;
  teachersCount: number;
  establishedYear: number | null;
  phone: string | null;
  email: string | null;
  managementType: string | null;
  medium: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VillageFullData {
  village: VillageInfo;
  content: Record<string, Record<string, unknown>>;
  heroSlides: HeroSlide[];
  members: Member[];
  notices: Notice[];
  programs: Program[];
  schemes: Scheme[];
  gallery: GalleryImage[];
  awards: Award[];
  financialReports: FinancialReport[];
}

export interface SeoData {
  village: { name: string; slug: string; subdomain: string; tehsil: { name: string; district: string; state: string } };
  seo: Record<string, unknown>;
  pages: { path: string; title: string; priority: number; changeFreq: string }[];
}

interface PaginatedResponse<T> {
  [key: string]: T[] | { page: number; limit: number; total: number; totalPages: number };
}

// ---- Service ----

export const publicService = {
  // Village info
  async getVillageInfo(): Promise<VillageInfo> {
    const response = await api.get("/api/public/village");
    return response.data.data;
  },

  // Full homepage data (single request)
  async getVillageFullData(): Promise<VillageFullData> {
    const response = await api.get("/api/public/village/full");
    return response.data.data;
  },

  // Hero slides
  async getHeroSlides(): Promise<HeroSlide[]> {
    const response = await api.get("/api/public/hero-slides");
    return response.data.data;
  },

  // Content section
  async getContentSection(section: string): Promise<Record<string, unknown>> {
    const response = await api.get(`/api/public/content/${section}`);
    return response.data.data;
  },

  // Members
  async getMembers(type?: string): Promise<Member[]> {
    const params = type ? { type } : {};
    const response = await api.get("/api/public/members", { params });
    return response.data.data;
  },

  // Notices
  async getNotices(params: { page?: number; limit?: number; category?: string } = {}) {
    const response = await api.get("/api/public/notices", { params });
    return response.data.data;
  },

  // Popup notices
  async getPopupNotices(): Promise<Notice[]> {
    const response = await api.get("/api/public/notices/popups");
    return response.data.data;
  },

  // Programs
  async getPrograms(params: { page?: number; limit?: number; category?: string } = {}) {
    const response = await api.get("/api/public/programs", { params });
    return response.data.data;
  },

  async getProgramById(id: string): Promise<Program> {
    const response = await api.get(`/api/public/programs/${id}`);
    return response.data.data;
  },

  // Schemes
  async getSchemes(params: { page?: number; limit?: number; category?: string } = {}) {
    const response = await api.get("/api/public/schemes", { params });
    return response.data.data;
  },

  async getSchemeById(id: string): Promise<Scheme> {
    const response = await api.get(`/api/public/schemes/${id}`);
    return response.data.data;
  },

  // Gallery
  async getGallery(category?: string) {
    const params = category ? { category } : {};
    const response = await api.get("/api/public/gallery", { params });
    const data = response.data.data;
    // API returns { images, categories } wrapper
    return Array.isArray(data) ? data : (data.images || []);
  },

  // Contact form
  async submitContactForm(data: { name: string; phone?: string; email?: string; subject?: string; message: string }) {
    const response = await api.post("/api/public/contact", data);
    return response.data.data;
  },

  // SEO data
  async getSeoData(): Promise<SeoData> {
    const response = await api.get("/api/public/seo");
    return response.data.data;
  },

  // Awards
  async getAwards(): Promise<Award[]> {
    const response = await api.get("/api/public/awards");
    return response.data.data;
  },

  // Financial Reports
  async getFinancialReports(): Promise<FinancialReport[]> {
    const response = await api.get("/api/public/financial-reports");
    return response.data.data;
  },

  // Gramsabha
  async getGramsabhas(): Promise<Gramsabha[]> {
    const response = await api.get("/api/public/gramsabhas");
    return response.data.data;
  },

  // Schools
  async getSchools(): Promise<School[]> {
    const response = await api.get("/api/public/schools");
    return response.data.data;
  },

  // Development Works
  async getDevelopmentWorks(params?: { financialYear?: string; status?: string }): Promise<DevelopmentWork[]> {
    const response = await api.get("/api/public/development-works", { params });
    return response.data.data;
  },

  // Global settings (shared across all villages, managed by superadmin)
  async getGlobalSettings(): Promise<Record<string, unknown>> {
    const response = await api.get("/api/public/global-settings");
    return response.data.data;
  },

  async submitComplaint(data: { name: string; contact: string; category: string; description: string; imageUrl?: string }) {
    const response = await api.post("/api/public/complaints", data);
    return response.data;
  },

  async submitTaxPayment(data: { name: string; contact: string; address: string; taxType: string; amount: number | string; year: string; utrNumber?: string; screenshotUrl?: string; paymentMethod?: string }) {
    const response = await api.post("/api/public/tax-payments", data);
    return response.data;
  },
};
