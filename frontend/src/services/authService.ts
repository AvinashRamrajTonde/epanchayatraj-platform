import api from "./api";

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data;
  },

  async refreshToken(refreshToken: string) {
    const response = await api.post("/api/auth/refresh-token", {
      refreshToken,
    });
    return response.data;
  },

  async getProfile() {
    const response = await api.get("/api/auth/profile");
    return response.data;
  },
};
