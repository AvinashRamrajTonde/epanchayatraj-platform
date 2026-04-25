import api from "./api";

interface CreateVillageData {
  name: string;
  slug: string;
  subdomain?: string;
  customDomain?: string | null;
  tehsilId: string;
  settings?: Record<string, unknown>;
  adminEmail?: string;
  adminName?: string;
  adminPassword?: string;
}

interface UpdateVillageData {
  name?: string;
  slug?: string;
  subdomain?: string;
  tehsilId?: string;
  settings?: Record<string, unknown>;
  customDomain?: string | null;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const superadminService = {
  // Dashboard
  async getStats() {
    const response = await api.get("/api/superadmin/dashboard/stats");
    return response.data;
  },

  // Villages
  async getVillages(params: PaginationParams = {}) {
    const response = await api.get("/api/superadmin/villages", { params });
    return response.data;
  },

  async getVillage(id: string) {
    const response = await api.get(`/api/superadmin/villages/${id}`);
    return response.data;
  },

  async createVillage(data: CreateVillageData) {
    const response = await api.post("/api/superadmin/villages", data);
    return response.data;
  },

  async updateVillage(id: string, data: UpdateVillageData) {
    const response = await api.put(`/api/superadmin/villages/${id}`, data);
    return response.data;
  },

  async updateVillageStatus(id: string, status: string) {
    const response = await api.patch(
      `/api/superadmin/villages/${id}/status`,
      { status }
    );
    return response.data;
  },

  // Tehsils
  async getTehsils() {
    const response = await api.get("/api/superadmin/tehsils");
    return response.data;
  },

  async createTehsil(data: Record<string, string>) {
    const response = await api.post("/api/superadmin/tehsils", data);
    return response.data;
  },

  async bulkImportVillages(rows: Record<string, string>[]) {
    return api.post('/api/superadmin/villages/import', { villages: rows });
  },

  async bulkImportTehsils(rows: Record<string, string>[]) {
    const response = await api.post("/api/superadmin/tehsils/import", { tehsils: rows });
    return response.data;
  },

  async updateTehsil(id: string, data: Record<string, string>) {
    const response = await api.put(`/api/superadmin/tehsils/${id}`, data);
    return response.data;
  },

  async deleteTehsil(id: string) {
    const response = await api.delete(`/api/superadmin/tehsils/${id}`);
    return response.data;
  },

  async deleteVillage(id: string) {
    const response = await api.delete(`/api/superadmin/villages/${id}`);
    return response.data;
  },

  async resetVillageAdminPassword(id: string, newPassword: string) {
    const response = await api.post(`/api/superadmin/villages/${id}/reset-password`, { newPassword });
    return response.data;
  },

  // Theme
  async updateVillageTheme(id: string, theme: string) {
    const response = await api.patch(
      `/api/superadmin/villages/${id}/theme`,
      { theme }
    );
    return response.data;
  },

  // SMTP Configuration
  async getSmtpConfig() {
    const response = await api.get("/api/superadmin/smtp-config");
    return response.data;
  },

  async updateSmtpConfig(data: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
    fromEmail: string;
    fromName: string;
  }) {
    const response = await api.put("/api/superadmin/smtp-config", data);
    return response.data;
  },

  async testSmtpConfig(testEmail: string) {
    const response = await api.post("/api/superadmin/smtp-config/test", { testEmail });
    return response.data;
  },

  // Global Settings
  async getGlobalSettings() {
    const response = await api.get("/api/superadmin/global-settings");
    return response.data;
  },

  async upsertGlobalSetting(key: string, value: unknown) {
    const response = await api.put(`/api/superadmin/global-settings/${key}`, { value });
    return response.data;
  },

  // Village SEO Management
  async getVillageSeo(villageId: string) {
    const response = await api.get(`/api/superadmin/villages/${villageId}/seo`);
    return response.data;
  },

  async upsertVillageSeo(villageId: string, data: Record<string, string>) {
    const response = await api.put(`/api/superadmin/villages/${villageId}/seo`, data);
    return response.data;
  },

  // Subscriptions
  async getSubscriptions(params?: { status?: string; expiring?: string }) {
    return api.get('/api/superadmin/subscriptions', { params });
  },

  async getVillageSubscription(villageId: string) {
    return api.get(`/api/superadmin/villages/${villageId}/subscription`);
  },

  async renewSubscription(villageId: string, data: { amount: number; paymentMethod: string; remarks?: string }) {
    return api.post(`/api/superadmin/villages/${villageId}/subscription/renew`, data);
  },

  async sendRenewalReminders() {
    return api.post('/api/superadmin/subscriptions/send-reminders');
  },

  // Bulk Mail
  async sendBulkMail(data: { subject: string; html: string; villageIds?: string[] }) {
    return api.post('/api/superadmin/mail/bulk', data);
  },

  // Contacts Directory
  async getContacts(params?: { designation?: string; search?: string; district?: string }) {
    return api.get('/api/superadmin/contacts', { params });
  },
};
