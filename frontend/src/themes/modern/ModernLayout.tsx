import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ModernNavbar from "./components/ModernNavbar";
import ModernFooter from "./components/ModernFooter";
import SeoHead from "./components/SeoHead";
import PopupNotice from "../classic/components/PopupNotice";
import ScrollToTop from "../classic/components/ScrollToTop";
import FontInjector from "../FontInjector";
import { modernFonts } from "../fontConfig";
import { useTenant } from "../../context/TenantContext";

export default function ModernLayout() {
  const location = useLocation();
  const { village } = useTenant();

  return (
    <div
      className="min-h-screen flex flex-col bg-slate-50"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <FontInjector fonts={modernFonts} />
      {/* Default SEO head — individual pages override title/description via their own <SeoHead> */}
      <SeoHead
        title={`मुख्यपृष्ठ`}
        path="/"
        image={village?.settings?.logoUrl as string | undefined}
      />
      <ModernNavbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <ModernFooter />
      <PopupNotice />
      <ScrollToTop />
    </div>
  );
}
