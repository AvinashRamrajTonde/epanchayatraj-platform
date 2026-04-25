import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CitizenUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  mobile: string | null;
  isVerified: boolean;
}

interface CitizenAuthState {
  citizen: CitizenUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  needsRegistration: boolean;
  setCitizenAuth: (citizen: CitizenUser, accessToken: string, refreshToken: string, needsRegistration?: boolean) => void;
  setAccessToken: (token: string) => void;
  updateCitizen: (data: Partial<CitizenUser>) => void;
  logout: () => void;
}

export const useCitizenAuthStore = create<CitizenAuthState>()(
  persist(
    (set) => ({
      citizen: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      needsRegistration: false,

      setCitizenAuth: (citizen, accessToken, refreshToken, needsRegistration = false) =>
        set({ citizen, accessToken, refreshToken, isAuthenticated: true, needsRegistration }),

      setAccessToken: (accessToken) => set({ accessToken }),

      updateCitizen: (data) =>
        set((state) => ({
          citizen: state.citizen ? { ...state.citizen, ...data } : null,
          needsRegistration: data.name ? false : state.needsRegistration,
        })),

      logout: () =>
        set({
          citizen: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          needsRegistration: false,
        }),
    }),
    {
      name: "gpmh-citizen-auth",
      partialize: (state) => ({
        citizen: state.citizen,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        needsRegistration: state.needsRegistration,
      }),
    }
  )
);
