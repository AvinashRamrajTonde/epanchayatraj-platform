import { useEffect, useState } from "react";
import { publicService, type Notice } from "../../../services/publicService";
import { resolveUrl } from "../../../utils/resolveUrl";
import SeoHead from "../components/SeoHead";
import SectionHero from "../components/SectionHero";
import AnimatedSection, { StaggerContainer, StaggerItem } from "../components/AnimatedSection";

const CATEGORIES = [
  { value: "", label: "सर्व" },
  { value: "general", label: "सामान्य" },
  { value: "urgent", label: "तातडीचे" },
  { value: "event", label: "कार्यक्रम" },
  { value: "meeting", label: "बैठक" },
  { value: "scheme", label: "योजना" },
];

const CATEGORY_ICONS: Record<string, string> = {
  general: "📢",
  urgent: "🚨",
  event: "🎉",
  meeting: "🏛️",
  scheme: "📋",
};

const CATEGORY_BG: Record<string, string> = {
  general: "bg-blue-50 text-blue-700 border-blue-200",
  urgent: "bg-red-50 text-red-700 border-red-200",
  event: "bg-emerald-50 text-emerald-700 border-emerald-200",
  meeting: "bg-purple-50 text-purple-700 border-purple-200",
  scheme: "bg-green-50 text-green-700 border-green-200",
};

const CATEGORY_ACCENT: Record<string, string> = {
  general: "from-blue-500 to-blue-600",
  urgent: "from-red-500 to-red-600",
  event: "from-emerald-500 to-emerald-600",
  meeting: "from-purple-500 to-purple-600",
  scheme: "from-green-500 to-green-600",
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

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("mr-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <>
      <SeoHead title="सूचना" path="/notices" />

      <SectionHero
        title="सूचना फलक"
        subtitle="ग्रामपंचायतीच्या सर्व महत्वाच्या सूचना"
        gradient="from-orange-600 to-red-500"
      />

      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Category filters */}
          <AnimatedSection animation="fadeUp">
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => { setCategory(cat.value); setPage(1); }}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
                    category === cat.value
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 shadow-sm"
                  }`}
                >
                  {cat.value && <span>{CATEGORY_ICONS[cat.value] || "📌"}</span>}
                  {cat.label}
                </button>
              ))}
            </div>
          </AnimatedSection>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-4 border-orange-200 animate-spin border-t-orange-500" />
                  <span className="absolute inset-0 flex items-center justify-center text-2xl">📢</span>
                </div>
                <p className="text-sm text-gray-400 font-medium">सूचना लोड होत आहेत...</p>
              </div>
            </div>
          ) : notices.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="text-lg font-bold text-gray-600 mb-2">कोणतीही सूचना नाही</h3>
              <p className="text-gray-400 text-sm">सध्या कोणतीही सूचना उपलब्ध नाही</p>
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7" staggerDelay={0.08}>
              {notices.map((notice) => {
                const isUrgent = notice.category === "urgent";
                const isExpanded = expandedId === notice.id;
                return (
                  <StaggerItem key={notice.id}>
                    <article
                      className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border hover:-translate-y-1.5 ${
                        isUrgent
                          ? "border-red-200 ring-1 ring-red-100"
                          : "border-gray-100/80"
                      }`}
                    >
                      {/* Color accent bar */}
                      <div className={`h-1.5 bg-gradient-to-r ${CATEGORY_ACCENT[notice.category] || CATEGORY_ACCENT.general}`} />

                      {/* Urgent badge */}
                      {isUrgent && (
                        <div className="mx-4 mt-3">
                          <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100 animate-pulse">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                            </span>
                            तातडीचे
                          </span>
                        </div>
                      )}

                      {notice.imageUrl && (
                        <div className="relative h-48 overflow-hidden mx-4 mt-3 rounded-xl">
                          <img
                            src={resolveUrl(notice.imageUrl)}
                            alt={notice.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                              CATEGORY_BG[notice.category] || CATEGORY_BG.general
                            }`}
                          >
                            {CATEGORY_ICONS[notice.category] || "📢"}{" "}
                            {CATEGORIES.find((c) => c.value === notice.category)?.label || notice.category}
                          </span>
                          {notice.priority === "high" && !isUrgent && (
                            <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-200">
                              ⭐ प्राधान्य
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-orange-600 transition-colors leading-tight">
                          {notice.title}
                        </h3>

                        <p
                          className={`text-gray-500 text-sm whitespace-pre-wrap leading-relaxed ${
                            isExpanded ? "" : "line-clamp-3"
                          } mb-3`}
                        >
                          {notice.content}
                        </p>

                        {notice.content?.length > 150 && (
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : notice.id)}
                            className="text-orange-500 hover:text-orange-600 text-xs font-medium mb-3 transition-colors"
                          >
                            {isExpanded ? "कमी दाखवा ↑" : "अधिक वाचा ↓"}
                          </button>
                        )}

                        {/* Date footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="flex items-center gap-1.5 text-xs text-gray-400">
                            📅 {formatDate(notice.createdAt)}
                          </span>
                          {notice.expiresAt && (
                            <span className={`text-xs ${
                              new Date(notice.expiresAt) < new Date()
                                ? "text-red-400"
                                : "text-gray-400"
                            }`}>
                              ⏰ {formatDate(notice.expiresAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-12">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
              >
                ← मागे
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        page === p
                          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                {totalPages > 5 && <span className="px-2 text-gray-400">...</span>}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
              >
                पुढे →
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
