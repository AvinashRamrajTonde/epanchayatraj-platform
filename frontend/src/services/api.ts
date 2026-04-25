import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { useCitizenAuthStore } from "../store/citizenAuthStore";

const api = axios.create({
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Request interceptor: attach token + set dynamic baseURL
api.interceptors.request.use((config) => {
  // Use citizen token for citizen API calls, admin token for others
  const isCitizenApi = config.url?.includes('/api/citizen/');
  const token = isCitizenApi
    ? useCitizenAuthStore.getState().accessToken
    : useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Dynamic baseURL: auto-detect environment
  const hostname = window.location.hostname;
  const port = window.location.port;
  // Behind reverse proxy (port 80/443/no port) → use origin (nginx proxies /api/)
  // Dev mode (e.g. port 5173) → route directly to backend port 5000
  if (!port || port === "80" || port === "443") {
    config.baseURL = window.location.origin;
  } else {
    config.baseURL = `http://${hostname}:5000`;
  }
  return config;
});

// Response interceptor: auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const isCitizenApi = originalRequest.url?.includes('/api/citizen/');

      try {
        const hostname = window.location.hostname;
        const port = window.location.port;
        const baseURL =
          !port || port === "80" || port === "443"
            ? window.location.origin
            : `http://${hostname}:5000`;

        if (isCitizenApi) {
          // Citizen token refresh
          const refreshTokenValue = useCitizenAuthStore.getState().refreshToken;
          if (!refreshTokenValue) throw new Error("No refresh token");

          const response = await axios.post(
            `${baseURL}/api/citizen/auth/refresh-token`,
            { refreshToken: refreshTokenValue }
          );

          const { accessToken } = response.data.data;
          useCitizenAuthStore.getState().setAccessToken(accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        } else {
          // Admin token refresh
          const refreshTokenValue = useAuthStore.getState().refreshToken;
          if (!refreshTokenValue) throw new Error("No refresh token");

          const response = await axios.post(
            `${baseURL}/api/auth/refresh-token`,
            { refreshToken: refreshTokenValue }
          );

          const { accessToken } = response.data.data;
          useAuthStore.getState().setAccessToken(accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch {
        if (isCitizenApi) {
          useCitizenAuthStore.getState().logout();
          window.location.href = "/citizen/login";
        } else {
          useAuthStore.getState().logout();
          window.location.href = "/signin";
        }
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
