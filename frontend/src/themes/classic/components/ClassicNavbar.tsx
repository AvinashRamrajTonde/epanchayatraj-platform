import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTenant } from "../../../context/TenantContext";
import { useGoogleTranslate } from "../../../hooks/useGoogleTranslate";
import { publicService } from "../../../services/publicService";

const MAIN_NAV = [
  { path: "/", label: "मुख्यपृष्ठ", icon: "🏠" },
  { path: "/about", label: "आमच्याबद्दल", icon: "ℹ️" },
  { path: "/administration", label: "प्रशासन", icon: "👥" },
  { path: "/notices", label: "सूचना", icon: "📋" },
  { path: "/programs", label: "विकासकामे", icon: "🏗️" },
  { path: "/schemes", label: "योजना", icon: "📜" },
  { path: "/gallery", label: "गॅलरी", icon: "📷" },
  { path: "/awards", label: "पुरस्कार", icon: "🏆" },
  { path: "/gramsabha", label: "ग्रामसभा", icon: "🏛️" },
  { path: "/contact", label: "संपर्क", icon: "📞" },
  { path: "/complaint", label: "तक्रार", icon: "📣" },
  { path: "/tax-payment", label: "कर भरणा", icon: "💳" },
];

const MORE_NAV = [
  { path: "/financial-reports", label: "जमा खर्च", icon: "💰" },
  { path: "/declarations", label: "स्वयंघोषणापत्रे", icon: "📄" },
  { path: "/schools", label: "शाळा", icon: "🏫" },
  { path: "/services", label: "सेवा", icon: "🛎️" },
  { path: "/important", label: "महत्त्वाचे", icon: "⚡" },
];

const ALL_NAV = [...MAIN_NAV, ...MORE_NAV];

export default function ClassicNavbar() {
  const { village } = useTenant();
  const location = useLocation();
  const { lang, toggleLang } = useGoogleTranslate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [contact, setContact] = useState<Record<string, string>>({});
  const lastScroll = useRef(0);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    publicService.getContentSection("contact")
      .then((c) => setContact((c as Record<string, string>) || {}))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setHidden(y > 200 && y > lastScroll.current);
      lastScroll.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setMobileOpen(false); setMoreOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isMoreActive = MORE_NAV.some((item) => location.pathname.startsWith(item.path));
  const phone = contact.phone || "";
  const email = contact.email || "";
  const pincode = contact.pincode || "";

  return (
    <>
      {/* ── Top Bar ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-700 via-orange-600 to-amber-500 text-white text-xs">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgMGw0MCA0ME0wIDQwTDQwIDAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] opacity-30" />
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between relative z-10">
          <span className="flex items-center gap-2 font-medium">
            <span className="w-5 h-5 bg-white/20 rounded flex items-center justify-center text-[10px]">🏛️</span>
            <span className="hidden sm:inline">Government of Maharashtra | महाराष्ट्र शासन</span>
            <span className="sm:hidden">महाराष्ट्र शासन</span>
          </span>
          <div className="flex items-center gap-3 text-white/85">
            {phone && (
              <a href={`tel:${phone}`} className="hidden md:flex items-center gap-1 hover:text-white transition-colors">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {phone}
              </a>
            )}
            {phone && email && <span className="hidden md:block w-px h-3 bg-white/30" />}
            {email && (
              <a href={`mailto:${email}`} className="hidden md:flex items-center gap-1 hover:text-white transition-colors">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="max-w-[140px] truncate">{email}</span>
              </a>
            )}
            {pincode && (
              <>
                <span className="hidden md:block w-px h-3 bg-white/30" />
                <span className="hidden md:flex items-center gap-1">
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {pincode}
                </span>
              </>
            )}
            <span className="hidden sm:block w-px h-3 bg-white/30" />
            <button
              onClick={toggleLang}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/15 hover:bg-white/25 text-white text-[11px] font-medium transition-all hover:scale-105 active:scale-95"
              title={lang === "mr" ? "Switch to English" : "मराठीत पहा"}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              {lang === "mr" ? "English" : "मराठी"}
            </button>
            <span className="hidden sm:block w-px h-3 bg-white/30" />
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold transition-all hover:scale-105 active:scale-95 border border-white/30"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">Admin Login</span>
              <span className="sm:hidden">Admin</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <motion.header
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/90 backdrop-blur-2xl shadow-lg shadow-black/5 border-b border-orange-100/60"
            : "bg-white shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 group-hover:shadow-xl group-hover:shadow-orange-500/35 transition-all group-hover:scale-105 text-xl">
                  🏛️
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-gray-800 text-sm leading-tight group-hover:text-orange-600 transition-colors" style={{ fontFamily: "var(--font-logo)" }}>
                  ग्रामपंचायत {village?.name || ""}
                </h1>
                <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
                  ता. {village?.tehsil?.name || ""}, जि. {village?.tehsil?.district || ""}
                </p>
              </div>
            </Link>

            {/* Desktop Nav (xl+) */}
            <nav className="hidden xl:flex items-center gap-0.5">
              {MAIN_NAV.map((item) => {
                const isActive =
                  item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className="relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                  >
                    <span className={`${isActive ? "text-orange-600" : "text-gray-600 hover:text-orange-500"} transition-colors`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-pill"
                        className="absolute inset-0 bg-orange-50 rounded-lg -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </NavLink>
                );
              })}

              {/* More dropdown */}
              <div ref={moreRef} className="relative">
                <button
                  onClick={() => setMoreOpen((o) => !o)}
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isMoreActive ? "text-orange-600 bg-orange-50" : "text-gray-600 hover:text-orange-500 hover:bg-orange-50/50"
                  }`}
                >
                  अधिक
                  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {moreOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-1 w-52 bg-white rounded-xl shadow-xl shadow-black/10 border border-gray-100 overflow-hidden z-50 py-1"
                    >
                      {MORE_NAV.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                              isActive ? "text-orange-600 bg-orange-50" : "text-gray-700 hover:text-orange-600 hover:bg-orange-50/60"
                            }`}
                          >
                            <span>{item.icon}</span>
                            {item.label}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Right: Citizen login + hamburger */}
            <div className="flex items-center gap-2">
              <Link
                to="/citizen/login"
                className="hidden xl:flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-md shadow-orange-500/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                नागरिक लॉगिन
              </Link>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="xl:hidden relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-orange-50 active:bg-orange-100 transition-colors"
                aria-label="मेनू"
              >
                <div className="flex flex-col gap-1.5 w-5">
                  <motion.span animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} className="block h-0.5 bg-gray-700 rounded-full origin-center" />
                  <motion.span animate={mobileOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }} className="block h-0.5 bg-gray-700 rounded-full" />
                  <motion.span animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} className="block h-0.5 bg-gray-700 rounded-full origin-center" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 xl:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-white shadow-2xl z-50 xl:hidden flex flex-col"
            >
              {/* Mobile Header */}
              <div className="bg-gradient-to-r from-orange-600 to-amber-500 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-xl">
                    🏛️
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-sm leading-tight" style={{ fontFamily: "var(--font-logo)" }}>
                      ग्रामपंचायत {village?.name}
                    </h2>
                    <p className="text-white/70 text-[10px] mt-0.5">
                      ता. {village?.tehsil?.name || ""}, जि. {village?.tehsil?.district || ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Login Buttons */}
              <div className="px-3 pt-3 pb-2 grid grid-cols-2 gap-2">
                <Link
                  to="/citizen/login"
                  className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors shadow"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  नागरिक लॉगिन
                </Link>
                <Link
                  to="/admin"
                  className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-800 hover:bg-gray-900 text-white text-xs font-semibold transition-colors shadow"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Admin Login
                </Link>
              </div>

              {/* Mobile Nav Items */}
              <nav className="flex-1 overflow-y-auto p-3">
                <div className="space-y-0.5">
                  {ALL_NAV.map((item, i) => {
                    const isActive =
                      item.path === "/"
                        ? location.pathname === "/"
                        : location.pathname.startsWith(item.path);
                    return (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.2 }}
                      >
                        <Link
                          to={item.path}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            isActive
                              ? "bg-orange-50 text-orange-600 shadow-sm shadow-orange-500/10"
                              : "text-gray-600 hover:bg-gray-50 hover:text-orange-500"
                          }`}
                        >
                          <span className="text-base w-6 text-center">{item.icon}</span>
                          {item.label}
                          {isActive && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </nav>

              {/* Translate Toggle (mobile — sidebar only) */}
              <div className="px-4 py-3 border-t border-gray-100">
                <button
                  onClick={toggleLang}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  {lang === "mr" ? "Switch to English" : "मराठीत पहा"}
                </button>
              </div>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                {(phone || email) && (
                  <div className="flex flex-col gap-1 mb-2">
                    {phone && (
                      <a href={`tel:${phone}`} className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-orange-600 transition-colors">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {phone}
                      </a>
                    )}
                    {email && (
                      <a href={`mailto:${email}`} className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-orange-600 transition-colors">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{email}</span>
                      </a>
                    )}
                  </div>
                )}
                <p className="text-[10px] text-gray-400 text-center">
                  © {new Date().getFullYear()} ग्रामपंचायत {village?.name}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
