import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

interface Village {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  customDomain: string | null;
  status: string;
  theme: string;
  settings: Record<string, unknown>;
  tehsil: { id: string; name: string; nameEn?: string; district: string; districtEn?: string; state: string; stateSlug?: string };
  createdAt: string;
}

type TenantType = "superadmin" | "village" | "unknown" | "loading";

interface TenantContextType {
  tenantType: TenantType;
  village: Village | null;
  subdomain: string | null;
  isCustomDomain: boolean;
  isLoading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const SUPERADMIN_SUBDOMAINS = ["admin", "superadmin"];
const PLATFORM_DOMAIN = import.meta.env.VITE_PLATFORM_DOMAIN || "gpmh.local";
// Bare hosts that are NOT custom domains
const BARE_PLATFORM_HOSTS = ["localhost", "127.0.0.1", PLATFORM_DOMAIN, `www.${PLATFORM_DOMAIN}`];

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tenantType, setTenantType] = useState<TenantType>("loading");
  const [village, setVillage] = useState<Village | null>(null);
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detectTenant = async () => {
      const hostname = window.location.hostname;
      let sub: string | null = null;
      let customDomain = false;

      if (hostname.endsWith(`.${PLATFORM_DOMAIN}`)) {
        // e.g. village1.gpmh.local → sub = "village1"
        sub = hostname.replace(`.${PLATFORM_DOMAIN}`, "");
      } else if (!BARE_PLATFORM_HOSTS.includes(hostname)) {
        // Not a known bare host and not a *.platform subdomain
        // → custom domain; backend resolves via Host header
        customDomain = true;
        sub = hostname;
      }

      setSubdomain(sub);
      setIsCustomDomain(customDomain);

      if (!sub || sub === "www") {
        setTenantType("unknown");
        setIsLoading(false);
        return;
      }

      // Superadmin subdomains only valid on platform domain
      if (!customDomain && SUPERADMIN_SUBDOMAINS.includes(sub)) {
        setTenantType("superadmin");
        setIsLoading(false);
        return;
      }

      // Village subdomain OR custom domain: backend resolves via Host header
      try {
        const response = await api.get("/api/public/village");
        if (response.data.success && response.data.data) {
          const v = response.data.data;
          setVillage(v);
          setTenantType("village");
          // Set document title immediately so browser tab and SPA share the real village name
          const tehsil = v.tehsil;
          const location = [tehsil?.name, tehsil?.district].filter(Boolean).join(", ");
          const newTitle = `ग्रामपंचायत ${v.name}${location ? ` - ${location}` : ""}`;
          document.title = newTitle;
          // Cache so the correct title shows instantly on the next visit (no flash)
          try { localStorage.setItem('gp_title_' + window.location.hostname, newTitle); } catch (_) {}
        } else {
          setTenantType("unknown");
          setError("Village not found");
        }
      } catch {
        setTenantType("unknown");
        setError("Failed to load village information");
      } finally {
        setIsLoading(false);
      }
    };

    detectTenant();
  }, []);

  return (
    <TenantContext.Provider
      value={{ tenantType, village, subdomain, isCustomDomain, isLoading, error }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
};
