import { useEffect, useState } from "react";
import { publicService, type Notice } from "../../../services/publicService";
import { resolveUrl } from "../../../utils/resolveUrl";

const CATEGORIES = [
  { value: "", label: "सर्व" },
  { value: "general", label: "सामान्य" },
  { value: "urgent", label: "तातडीचे" },
  { value: "event", label: "कार्यक्रम" },
  { value: "meeting", label: "बैठक" },
  { value: "scheme", label: "योजना" },
];

const CAT_COLOR: Record<string, string> = {
  general: "bg-teal-100 text-teal-700",
  urgent: "bg-red-100 text-red-700",
  event: "bg-emerald-100 text-emerald-700",
  meeting: "bg-violet-100 text-violet-700",
  scheme: "bg-blue-100 text-blue-700",
};

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    publicService
      .getNotices({ page, limit: 12, category: category || undefined })
      .then((data) => {
        setNotices(data.notices || []);
        setTotalPages(data.pagination?.totalPages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, category]);

  const fmt = (d: string) => new Date(d).toLocaleDateString("mr-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-700 to-indigo-800 py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white">सूचना फलक</h1>
          <p className="text-teal-200 mt-2">ग्रामपंचायतीच्या सर्व महत्वाच्या सूचना</p>
        </div>
      </section>

      <section className="py-12 bg-slate-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4">
          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => { setCategory(c.value); setPage(1); }}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  category === c.value
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notices.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-600">कोणतीही सूचना नाही</h3>
              <p className="text-slate-400 text-sm mt-1">सध्या कोणतीही सूचना उपलब्ध नाही</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notices.map((n) => {
                  const isExpanded = expandedId === n.id;
                  return (
                    <article key={n.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow">
                      {n.imageUrl && (
                        <div className="h-44 overflow-hidden">
                          <img src={resolveUrl(n.imageUrl)} alt={n.title} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CAT_COLOR[n.category] || CAT_COLOR.general}`}>
                            {CATEGORIES.find((c) => c.value === n.category)?.label || n.category}
                          </span>
                          {n.category === "urgent" && (
                            <span className="flex h-2 w-2"><span className="animate-ping absolute h-2 w-2 rounded-full bg-red-400 opacity-75" /><span className="relative rounded-full h-2 w-2 bg-red-500" /></span>
                          )}
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg mb-2 leading-tight">{n.title}</h3>
                        <p className={`text-slate-500 text-sm whitespace-pre-wrap leading-relaxed ${isExpanded ? "" : "line-clamp-3"} mb-3`}>
                          {n.content}
                        </p>
                        {n.content?.length > 150 && (
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : n.id)}
                            className="text-teal-600 hover:text-teal-700 text-xs font-medium mb-3"
                          >
                            {isExpanded ? "कमी दाखवा" : "अधिक वाचा"}
                          </button>
                        )}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <time className="text-xs text-slate-400">{fmt(n.createdAt)}</time>
                          {n.expiresAt && <span className="text-xs text-slate-400">मुदत: {fmt(n.expiresAt)}</span>}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-10">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                  >
                    मागील
                  </button>
                  <span className="text-sm text-slate-500">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                  >
                    पुढील
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
