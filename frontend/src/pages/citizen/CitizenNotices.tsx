import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { publicService, type Notice } from "../../services/publicService";

const CATEGORIES = [
  { key: "", label: "सर्व" },
  { key: "general", label: "सामान्य" },
  { key: "urgent", label: "तातडी" },
  { key: "important", label: "महत्वाचे" },
  { key: "tender", label: "निविदा" },
];

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

const PRIORITY_LABELS: Record<string, string> = {
  high: "तातडी",
  medium: "मध्यम",
  low: "सामान्य",
};

const CATEGORY_COLORS: Record<string, string> = {
  urgent: "bg-red-50 text-red-600",
  important: "bg-orange-50 text-orange-600",
  general: "bg-blue-50 text-blue-600",
  tender: "bg-purple-50 text-purple-600",
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat("mr-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

export default function CitizenNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    publicService
      .getNotices({ page, limit: 10, ...(category ? { category } : {}) })
      .then((data: { notices: Notice[]; total: number; totalPages: number }) => {
        setNotices(data.notices ?? []);
        setTotalPages(data.totalPages ?? 1);
      })
      .catch(() => setNotices([]))
      .finally(() => setLoading(false));
  }, [page, category]);

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-500 px-4 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">ग्रामपंचायत सूचना</h1>
            <p className="text-orange-100 text-xs">अधिकृत सूचना व घोषणा</p>
          </div>
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => handleCategoryChange(cat.key)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                category === cat.key
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notice list */}
      <div className="px-4 pt-4 space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))
        ) : notices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">कोणत्याही सूचना नाहीत</p>
            <p className="text-gray-400 text-sm mt-1">सध्या या श्रेणीत कोणत्याही सूचना नाहीत</p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {notices.map((notice, i) => {
              const isOpen = expanded === notice.id;
              return (
                <motion.div
                  key={notice.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${
                    notice.priority === "high"
                      ? "border-red-100"
                      : "border-gray-100"
                  }`}
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : notice.id)}
                    className="w-full text-left p-4"
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${
                          notice.priority === "high"
                            ? "bg-red-50"
                            : "bg-orange-50"
                        }`}
                      >
                        {notice.isPopup ? (
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className={`font-semibold text-gray-800 text-sm leading-snug ${!isOpen ? "line-clamp-2" : ""}`}>
                            {notice.title}
                          </p>
                          <svg
                            className={`w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>

                        {/* Badges + Date */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {notice.category && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[notice.category] ?? "bg-gray-100 text-gray-600"}`}>
                              {notice.category}
                            </span>
                          )}
                          {notice.priority && notice.priority !== "low" && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PRIORITY_COLORS[notice.priority] ?? ""}`}>
                              {PRIORITY_LABELS[notice.priority] ?? notice.priority}
                            </span>
                          )}
                          {notice.isPopup && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium border border-red-100">
                              तातडी
                            </span>
                          )}
                          <span className="text-xs text-gray-400 ml-auto">
                            {formatDate(notice.publishedAt ?? notice.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-0 border-t border-gray-50">
                          {notice.imageUrl && (
                            <img
                              src={notice.imageUrl}
                              alt={notice.title}
                              className="w-full rounded-xl object-cover max-h-48 mb-3 mt-3"
                            />
                          )}
                          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line mt-3">
                            {notice.content}
                          </p>
                          {notice.expiresAt && (
                            <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              मुदत: {formatDate(notice.expiresAt)}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2 pb-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center disabled:opacity-40"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm text-gray-500 font-medium">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center disabled:opacity-40"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
