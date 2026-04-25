import { useEffect, useState } from "react";
import { Link } from "react-router";
import { citizenService, type Family, type CertificateApplication } from "../../services/citizenService";
import { publicService } from "../../services/publicService";
import { useCitizenAuthStore } from "../../store/citizenAuthStore";
import { useTenant } from "../../context/TenantContext";
import { motion } from "framer-motion";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  under_review: { label: "तपासणीत", color: "text-violet-700", bg: "bg-violet-50 border-violet-100", dot: "bg-violet-400" },
  approved: { label: "मंजूर", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100", dot: "bg-emerald-400" },
  rejected: { label: "नाकारले", color: "text-red-700", bg: "bg-red-50 border-red-100", dot: "bg-red-400" },
  pending_payment: { label: "पेमेंट बाकी", color: "text-amber-700", bg: "bg-amber-50 border-amber-100", dot: "bg-amber-400" },
};

interface Notice { id: string; title: string; titleMarathi?: string; category?: string; createdAt: string; }

const QUICK_ACTIONS = [
  {
    to: "/citizen/services",
    label: "प्रमाणपत्र",
    sub: "नवीन अर्ज",
    gradient: "from-orange-500 to-amber-500",
    glow: "shadow-orange-400/40",
    bg: "bg-orange-50",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    to: "/citizen/applications",
    label: "माझे अर्ज",
    sub: "स्थिती पहा",
    gradient: "from-blue-500 to-indigo-500",
    glow: "shadow-blue-400/40",
    bg: "bg-blue-50",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    to: "/citizen/family",
    label: "कुटुंब",
    sub: "व्यवस्थापन",
    gradient: "from-emerald-500 to-green-500",
    glow: "shadow-emerald-400/40",
    bg: "bg-emerald-50",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    to: "#tax",
    label: "कर भरणा",
    sub: "घर / पाणी कर",
    gradient: "from-rose-500 to-pink-500",
    glow: "shadow-rose-400/40",
    bg: "bg-rose-50",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    to: "/citizen/notices",
    label: "सूचना",
    sub: "GP नोटिस",
    gradient: "from-violet-500 to-purple-500",
    glow: "shadow-violet-400/40",
    bg: "bg-violet-50",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    to: "/citizen/verify",
    label: "सत्यापन",
    sub: "दस्त तपासा",
    gradient: "from-teal-500 to-cyan-500",
    glow: "shadow-teal-400/40",
    bg: "bg-teal-50",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

function StatCard({ n, label, color, loading }: { n: number; label: string; color: string; loading: boolean }) {
  return (
    <div className={`rounded-2xl p-4 text-center ${color}`}>
      <div className="text-3xl font-black text-white leading-none">
        {loading ? <span className="inline-block w-6 h-7 bg-white/30 rounded animate-pulse" /> : n}
      </div>
      <p className="text-[11px] text-white/80 font-semibold mt-1.5 leading-tight">{label}</p>
    </div>
  );
}

export default function CitizenDashboard() {
  const { citizen } = useCitizenAuthStore();
  const { village } = useTenant();
  const [families, setFamilies] = useState<Family[]>([]);
  const [applications, setApplications] = useState<CertificateApplication[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installDismissed, setInstallDismissed] = useState(false);

  const firstName = (citizen?.name || "").split(" ")[0] || "नागरिक";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "सुप्रभात" : hour < 17 ? "नमस्कार" : "शुभ संध्या";

  useEffect(() => {
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    (installPrompt as any).prompt();
    const { outcome } = await (installPrompt as any).userChoice;
    if (outcome === 'accepted') setInstallPrompt(null);
  };

  useEffect(() => {
    (async () => {
      try {
        const [fam, app, ntc] = await Promise.all([
          citizenService.getFamilies(),
          citizenService.getMyApplications({ limit: 10 }),
          publicService.getNotices({ limit: 4 }),
        ]);
        setFamilies(fam.data || []);
        setApplications(app.data?.applications || []);
        setNotices(ntc.data?.notices || []);
      } catch { /* noop */ } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = {
    families: families.length,
    total: applications.length,
    approved: applications.filter((a) => a.status === "approved").length,
    pending: applications.filter((a) => a.status === "under_review").length,
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-5 pb-6 space-y-5">

      {/* ── PWA Install Banner ── */}
      {installPrompt && !isInstalled && !installDismissed && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white shadow-lg shadow-orange-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex-shrink-0 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm leading-tight">माझी ग्रामपंचायत</p>
              <p className="text-orange-100 text-xs mt-0.5">मोबाइलवर अ‍ॅप इन्स्टॉल करा</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleInstall}
                className="bg-white text-orange-600 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm hover:bg-orange-50 transition-colors"
              >
                इन्स्टॉल
              </button>
              <button
                onClick={() => setInstallDismissed(true)}
                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-400 p-6 text-white"
      >
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute top-1/2 right-12 w-20 h-20 bg-white/5 rounded-full" />

        <div className="relative z-10 text-center">
          {/* Greeting */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-3">
            <span className="text-lg">🙏</span>
            <span className="text-xs font-semibold text-white/90">{greeting}!</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black leading-tight">
            {firstName}
          </h1>
          <p className="text-white/75 text-sm mt-1 font-medium">
            {village?.name || "ग्रामपंचायत"} — नागरिक पोर्टल
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-2 mt-5">
            <StatCard n={stats.families} label="कुटुंब" color="bg-white/20 backdrop-blur-sm" loading={loading} />
            <StatCard n={stats.total} label="एकूण अर्ज" color="bg-white/20 backdrop-blur-sm" loading={loading} />
            <StatCard n={stats.approved} label="मंजूर" color="bg-emerald-500/40 backdrop-blur-sm" loading={loading} />
            <StatCard n={stats.pending} label="प्रलंबित" color="bg-amber-500/40 backdrop-blur-sm" loading={loading} />
          </div>
        </div>
      </motion.div>

      {/* ── Quick Actions Grid ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">जलद सेवा</h2>
        <div className="grid grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className="group flex flex-col items-center text-center p-3.5 bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:shadow-black/[0.06] active:scale-[0.97] transition-all duration-200"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${a.gradient} rounded-2xl flex items-center justify-center shadow-md ${a.glow} mb-2.5 group-hover:scale-105 transition-transform`}>
                {a.icon}
              </div>
              <p className="text-xs font-bold text-gray-800 leading-tight">{a.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{a.sub}</p>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── Tax Payment Banner ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <div id="tax" className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 p-4 flex items-center justify-between gap-3">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
          <div>
            <p className="text-white font-bold text-sm">घर कर / पाणी कर भरणा</p>
            <p className="text-white/70 text-xs mt-0.5">थकबाकी तपासा आणि ऑनलाइन भरा</p>
          </div>
          <Link
            to="/services"
            className="relative flex-shrink-0 bg-white text-rose-600 text-xs font-bold px-4 py-2 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all"
          >
            आता भरा
          </Link>
        </div>
      </motion.div>

      {/* ── Notices ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-400 rounded-full inline-block" />
            GP सूचना
          </h2>
          <Link to="/citizen/notices" className="text-xs text-orange-500 font-bold hover:text-orange-600">
            सर्व पहा →
          </Link>
        </div>
        <div className="space-y-2">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                <div className="h-3.5 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            ))
          ) : notices.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-5 text-center text-gray-400 text-sm">
              कोणत्याही सूचना नाहीत
            </div>
          ) : (
            notices.map((n) => (
              <Link
                key={n.id}
                to="/citizen/notices"
                className="flex items-start gap-3 bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:shadow-orange-500/5 active:scale-[0.99] transition-all group"
              >
                <div className="w-9 h-9 bg-orange-50 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
                    {n.titleMarathi || n.title}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleDateString("mr-IN")}
                    {n.category && <span className="ml-2 bg-orange-50 text-orange-500 px-1.5 py-0.5 rounded-md font-medium">{n.category}</span>}
                  </p>
                </div>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-orange-400 flex-shrink-0 mt-1 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))
          )}
        </div>
      </motion.div>

      {/* ── Recent Applications ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full inline-block" />
            अलीकडील अर्ज
          </h2>
          <Link to="/citizen/applications" className="text-xs text-orange-500 font-bold hover:text-orange-600">
            सर्व पहा →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
                <div className="h-3.5 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-6 text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <p className="text-gray-500 text-sm font-medium">अद्याप कोणताही अर्ज नाही</p>
            <Link to="/citizen/services" className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-orange-400/30 active:scale-[0.98] transition-all">
              📋 अर्ज करा
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {applications.slice(0, 4).map((app) => {
              const st = STATUS_CONFIG[app.status] || { label: app.status, color: "text-gray-700", bg: "bg-gray-50 border-gray-100", dot: "bg-gray-400" };
              return (
                <Link
                  key={app.id}
                  to={`/citizen/applications/${app.id}`}
                  className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:shadow-blue-500/5 active:scale-[0.99] transition-all group"
                >
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {app.certificateType?.nameMarathi}
                      </p>
                      <span className={`flex-shrink-0 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold border ${st.bg} ${st.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                      <span className="font-mono">{app.applicationNo}</span>
                      <span>•</span>
                      <span>{new Date(app.createdAt).toLocaleDateString("mr-IN")}</span>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-orange-400 flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ── Family Section ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block" />
            माझे कुटुंब
          </h2>
          <Link to="/citizen/family" className="text-xs text-orange-500 font-bold hover:text-orange-600">
            + नवीन
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
            <div className="h-3.5 bg-gray-200 rounded w-1/2" />
          </div>
        ) : families.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-5 text-center">
            <p className="text-gray-400 text-sm">कोणतेही कुटुंब नोंदवलेले नाही</p>
            <Link to="/citizen/family" className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 active:scale-[0.98] transition-all">
              कुटुंब नोंदणी करा
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {families.map((fam) => (
              <Link
                key={fam.id}
                to={`/citizen/family/${fam.id}`}
                className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:shadow-emerald-500/5 active:scale-[0.99] transition-all group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                  {fam.headName?.[0] || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-sm truncate">{fam.headName}</p>
                    <span className="text-[10px] font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-400 flex-shrink-0">{fam.familyId}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{fam.members?.length || 0} सदस्य</p>
                </div>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-emerald-400 flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
