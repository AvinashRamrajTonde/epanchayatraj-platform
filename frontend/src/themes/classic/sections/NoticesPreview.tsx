import { useState } from "react";
import { Link } from "react-router-dom";
import type { Notice } from "../../../services/publicService";
import { resolveUrl } from "../../../utils/resolveUrl";
import SectionHeading from "../components/SectionHeading";
import { StaggerContainer, StaggerItem } from "../components/AnimatedSection";

interface Props {
  notices: Notice[];
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  urgent: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  event: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  meeting: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  scheme: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  general: { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-400" },
};

const CATEGORY_LABELS: Record<string, string> = {
  urgent: "तातडीचे",
  event: "कार्यक्रम",
  meeting: "बैठक",
  scheme: "योजना",
  general: "सामान्य",
};

const CATEGORY_ICONS: Record<string, string> = {
  urgent: "🚨",
  event: "🎉",
  meeting: "🤝",
  scheme: "📋",
  general: "📢",
};

const PLACEHOLDER_GRADIENTS: Record<string, string> = {
  urgent: "from-red-400 to-rose-500",
  event: "from-blue-400 to-indigo-500",
  meeting: "from-purple-400 to-violet-500",
  scheme: "from-green-400 to-emerald-500",
  general: "from-gray-400 to-gray-500",
};

function isExpired(notice: Notice): boolean {
  if (!notice.expiresAt) return false;
  return new Date(notice.expiresAt) < new Date();
}

export default function NoticesPreview({ notices }: Props) {
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  // Filter out expired notices
  const activeNotices = notices.filter((n) => !isExpired(n));

  if (activeNotices.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading
          badge="📋 सूचना फलक"
          title="ताज्या सूचना"
          align="center"
          badgeColor="text-blue-600 bg-blue-50 border-blue-200"
          rightAction={
            <Link
              to="/notices"
              className="text-orange-600 font-medium hover:text-orange-700 flex items-center gap-1 text-sm sm:text-base"
            >
              सर्व पहा
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          }
        />

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" staggerDelay={0.1}>
          {activeNotices.map((notice) => {
            const cat = CATEGORY_COLORS[notice.category] || CATEGORY_COLORS.general;
            const icon = CATEGORY_ICONS[notice.category] || "📢";
            const gradient = PLACEHOLDER_GRADIENTS[notice.category] || PLACEHOLDER_GRADIENTS.general;

            return (
              <StaggerItem key={notice.id}>
                <article
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1 cursor-pointer group"
                  onClick={() => setSelectedNotice(notice)}
                >
                  {/* Image or placeholder */}
                  {notice.imageUrl ? (
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={resolveUrl(notice.imageUrl)}
                        alt={notice.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${cat.bg} ${cat.text} shadow-sm`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
                          {CATEGORY_LABELS[notice.category] || notice.category}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className={`relative h-32 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                      <span className="text-4xl opacity-60">{icon}</span>
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-white/90 text-gray-700 shadow-sm">
                          <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
                          {CATEGORY_LABELS[notice.category] || notice.category}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">
                        {new Date(notice.createdAt).toLocaleDateString("mr-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      {notice.priority === "high" && (
                        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">
                          उच्च प्राधान्य
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-800 text-base sm:text-lg mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {notice.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                      {notice.content}
                    </p>
                    <span className="text-orange-600 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      वाचा
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>

      {/* Notice Detail Popup */}
      {selectedNotice && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedNotice(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-4 flex items-center justify-between rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center gap-2 text-white">
                <span className="text-lg">{CATEGORY_ICONS[selectedNotice.category] || "📢"}</span>
                <span className="font-bold text-sm sm:text-base truncate">
                  {CATEGORY_LABELS[selectedNotice.category] || selectedNotice.category}
                </span>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="text-white/80 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 space-y-4">
              {selectedNotice.imageUrl && (
                <img
                  src={resolveUrl(selectedNotice.imageUrl)}
                  alt={selectedNotice.title}
                  className="w-full h-48 object-cover rounded-xl"
                />
              )}
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">{selectedNotice.title}</h3>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>
                  📅 {new Date(selectedNotice.createdAt).toLocaleDateString("mr-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                {selectedNotice.expiresAt && (
                  <span>
                    ⏳ मुदत: {new Date(selectedNotice.expiresAt).toLocaleDateString("mr-IN")}
                  </span>
                )}
              </div>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {selectedNotice.content}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
