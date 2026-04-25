import { useEffect, useState } from "react";
import { Link } from "react-router";
import { citizenService, type CertificateType } from "../../services/citizenService";
import { motion } from "framer-motion";

const CERT_ICONS: Record<string, string> = {
  birth: "👶", death: "🕊️", marriage: "💍", residence: "🏠",
  bpl: "📑", living: "🧬", no_dues: "🏦", toilet: "🚽",
  niradhar: "🤲", widow: "💐", deserted: "⚖️", nuclear_family: "👨‍👩‍👧",
};

const CERT_COLORS: Record<string, { gradient: string; shadow: string; badge: string }> = {
  birth: { gradient: "from-pink-500 to-rose-500", shadow: "shadow-pink-500/20", badge: "bg-pink-50 text-pink-700" },
  death: { gradient: "from-slate-500 to-gray-600", shadow: "shadow-slate-500/20", badge: "bg-slate-50 text-slate-700" },
  marriage: { gradient: "from-red-500 to-pink-500", shadow: "shadow-red-500/20", badge: "bg-red-50 text-red-700" },
  residence: { gradient: "from-blue-500 to-indigo-500", shadow: "shadow-blue-500/20", badge: "bg-blue-50 text-blue-700" },
  bpl: { gradient: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/20", badge: "bg-amber-50 text-amber-700" },
  living: { gradient: "from-emerald-500 to-green-500", shadow: "shadow-emerald-500/20", badge: "bg-emerald-50 text-emerald-700" },
  no_dues: { gradient: "from-teal-500 to-cyan-500", shadow: "shadow-teal-500/20", badge: "bg-teal-50 text-teal-700" },
  toilet: { gradient: "from-indigo-500 to-violet-500", shadow: "shadow-indigo-500/20", badge: "bg-indigo-50 text-indigo-700" },
  niradhar: { gradient: "from-orange-500 to-amber-500", shadow: "shadow-orange-500/20", badge: "bg-orange-50 text-orange-700" },
  widow: { gradient: "from-purple-500 to-violet-500", shadow: "shadow-purple-500/20", badge: "bg-purple-50 text-purple-700" },
  deserted: { gradient: "from-rose-500 to-red-500", shadow: "shadow-rose-500/20", badge: "bg-rose-50 text-rose-700" },
  nuclear_family: { gradient: "from-sky-500 to-blue-500", shadow: "shadow-sky-500/20", badge: "bg-sky-50 text-sky-700" },
};

const DEFAULT_COLOR = { gradient: "from-gray-500 to-gray-600", shadow: "shadow-gray-500/20", badge: "bg-gray-50 text-gray-700" };

export default function CitizenServices() {
  const [certTypes, setCertTypes] = useState<CertificateType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"services" | "details" | "documents">("services");

  useEffect(() => {
    citizenService.getCertificateTypes()
      .then((res) => setCertTypes(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            नागरिक सेवा
          </h1>
          <p className="text-sm text-gray-400 mt-1">प्रमाणपत्र / दाखला सेवा — {certTypes.length} सेवा उपलब्ध</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100/80 rounded-2xl p-1 mb-6 overflow-x-auto">
        {([
          { key: "services", label: "सेवा", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg> },
          { key: "details", label: "सहपत्र-अ", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
          { key: "documents", label: "कागदपत्रे", icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg> },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === t.key
                ? "bg-white text-orange-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-2/3 mb-2" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Services Grid */}
          {activeTab === "services" && (
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {certTypes.map((ct) => {
                const clr = CERT_COLORS[ct.code] || DEFAULT_COLOR;
                return (
                  <motion.div key={ct.id} variants={item}>
                    <Link
                      to={`/citizen/apply/${ct.id}`}
                      className={`group block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-xl ${clr.shadow} transition-all duration-300 hover:-translate-y-1`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${clr.gradient} rounded-xl flex items-center justify-center shadow-lg ${clr.shadow} text-xl group-hover:scale-110 transition-transform flex-shrink-0`}>
                          {CERT_ICONS[ct.code] || "📋"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 leading-tight text-sm group-hover:text-orange-600 transition-colors">{ct.nameMarathi}</h3>
                          <p className="text-gray-400 text-xs mt-0.5">{ct.nameEnglish}</p>
                          <div className="flex items-center gap-2 mt-3">
                            <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${ct.fee > 0 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                              {ct.fee > 0 ? `₹${ct.fee}/-` : "निशुल्क"}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              {ct.processingDays} दिवस
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-gray-400">{ct.designatedOfficer || "ग्रामपंचायत अधिकारी"}</span>
                        <span className="text-xs text-orange-500 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          अर्ज करा
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* सहपत्र-अ Table */}
          {activeTab === "details" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b bg-gradient-to-r from-orange-50 to-amber-50">
                  <h2 className="font-bold text-gray-900">सहपत्र-अ</h2>
                  <p className="text-xs text-gray-500 mt-1">महाराष्ट्र लोकसेवा हक्क अध्यादेश-२०१५ च्या कलम ३ अन्वये ग्रामपंचायतींमार्फत द्यावयाच्या लोकसेवांचा तपशील</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50/80">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">अ.क्र.</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">सेवेचे नाव</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">कालावधी</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">पद निर्देशित अधिकारी</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">प्रथम अपील</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">द्वितीय अपील</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-600 whitespace-nowrap">फी</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {certTypes.map((ct, idx) => (
                        <tr key={ct.id} className="hover:bg-orange-50/30 transition-colors">
                          <td className="px-4 py-3 text-gray-500 font-medium">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-800">{ct.nameMarathi}</div>
                            <div className="text-xs text-gray-400">{ct.nameEnglish}</div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-lg font-medium">{ct.processingDays} दिवस</span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{ct.designatedOfficer || "ग्रामपंचायत अधिकारी"}</td>
                          <td className="px-4 py-3 text-gray-600 text-xs">{ct.firstAppellate || "सहायक गट विकास अधिकारी"}</td>
                          <td className="px-4 py-3 text-gray-600 text-xs">{ct.secondAppellate || "गट विकास अधिकारी"}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${ct.fee > 0 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-600"}`}>
                              {ct.fee > 0 ? `₹${ct.fee}/-` : "निशुल्क"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Documents Table */}
          {activeTab === "documents" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b bg-gradient-to-r from-emerald-50 to-green-50">
                  <h2 className="font-bold text-gray-900">अर्जासोबत द्यावयाचे कागदपत्र</h2>
                  <p className="text-xs text-gray-500 mt-1">प्रत्येक सेवेसाठी अर्जासोबत सादर करावयाची कागदपत्रे</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {certTypes.map((ct, idx) => {
                    const clr = CERT_COLORS[ct.code] || DEFAULT_COLOR;
                    return (
                      <div key={ct.id} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <span className="text-sm text-gray-400 font-medium mt-0.5">{idx + 1}.</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{CERT_ICONS[ct.code] || "📋"}</span>
                              <span className="font-semibold text-gray-800 text-sm">{ct.nameMarathi}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${clr.badge}`}>{ct.nameEnglish}</span>
                            </div>
                            {ct.requiredDocuments && ct.requiredDocuments.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {ct.requiredDocuments.map((doc, i) => (
                                  <span key={i} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">
                                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                    {doc}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg font-medium">कागदपत्रे आवश्यक नाही</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
