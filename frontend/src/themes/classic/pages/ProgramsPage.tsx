import { useEffect, useState } from "react";
import { publicService, type Program } from "../../../services/publicService";
import { resolveUrl } from "../../../utils/resolveUrl";
import SeoHead from "../components/SeoHead";
import SectionHero from "../components/SectionHero";
import { StaggerContainer, StaggerItem } from "../components/AnimatedSection";
import { ImageSlider } from "../sections/ProgramsPreview";

const CATEGORY_ICONS: Record<string, string> = {
  development: "🏗️",
  education: "📚",
  health: "🏥",
  culture: "🎭",
  agriculture: "🌾",
  sports: "⚽",
  environment: "🌿",
  women: "👩",
  other: "📌",
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  development: "from-blue-500 to-indigo-600",
  education: "from-purple-500 to-violet-600",
  health: "from-rose-500 to-pink-600",
  culture: "from-amber-500 to-orange-600",
  agriculture: "from-green-500 to-emerald-600",
  sports: "from-cyan-500 to-blue-600",
  environment: "from-emerald-500 to-green-600",
  women: "from-pink-500 to-rose-600",
  other: "from-gray-500 to-slate-600",
};

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  useEffect(() => {
    setLoading(true);
    publicService
      .getPrograms({ page, limit: 12, category: category || undefined })
      .then((data) => {
        setPrograms(data.programs || []);
        setTotalPages(data.pagination?.totalPages || 1);
        if (page === 1 && !category) {
          const cats = [...new Set((data.programs || []).map((p: Program) => p.category))] as string[];
          setCategories(cats);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, category]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("mr-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <SeoHead title="विकास कामे" path="/programs" />

      <SectionHero
        title="विकास कामे"
        subtitle="गावाच्या विकासासाठी राबवलेले प्रकल्प व उपक्रम"
        gradient="from-green-600 to-teal-500"
      />

      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Category filters */}
          {categories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              <button
                onClick={() => { setCategory(""); setPage(1); }}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  !category
                    ? "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg shadow-green-500/25"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 shadow-sm"
                }`}
              >
                सर्व प्रकल्प
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setPage(1); }}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
                    category === cat
                      ? "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg shadow-green-500/25"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 shadow-sm"
                  }`}
                >
                  <span>{CATEGORY_ICONS[cat] || "📌"}</span>
                  {cat}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-4 border-green-200 animate-spin border-t-green-500" />
                  <span className="absolute inset-0 flex items-center justify-center text-2xl">🏗️</span>
                </div>
                <p className="text-sm text-gray-400 font-medium">विकास कामे लोड होत आहेत...</p>
              </div>
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🏗️</span>
              </div>
              <h3 className="text-lg font-bold text-gray-600 mb-2">कोणताही प्रकल्प उपलब्ध नाही</h3>
              <p className="text-gray-400 text-sm">सध्या कोणताही विकास प्रकल्प उपलब्ध नाही</p>
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {programs.map((program) => {
                const firstImage = program.images?.[0];
                const gradient = CATEGORY_GRADIENTS[program.category] || CATEGORY_GRADIENTS.other;
                return (
                  <StaggerItem key={program.id}>
                    <div
                      onClick={() => setSelectedProgram(program)}
                      className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100/80 hover:-translate-y-1.5 cursor-pointer"
                    >
                      {/* Image / Gradient Header */}
                      {firstImage ? (
                        <div className="relative h-52 overflow-hidden">
                          <img
                            src={resolveUrl(firstImage)}
                            alt={program.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                              {CATEGORY_ICONS[program.category] || "📌"} {program.category}
                            </span>
                          </div>
                          {program.images && program.images.length > 1 && (
                            <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                              🖼️ {program.images.length}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={`relative h-44 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
                          <div className="absolute inset-0 opacity-10">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full" />
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full" />
                          </div>
                          <span className="text-6xl text-white/80 drop-shadow-lg group-hover:scale-110 transition-transform duration-500">
                            {CATEGORY_ICONS[program.category] || "🏗️"}
                          </span>
                          <div className="absolute bottom-4 left-4">
                            <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-white/10">
                              {program.category}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-green-600 transition-colors line-clamp-2 leading-tight">
                          {program.title}
                        </h3>

                        {program.description && (
                          <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                            {program.description}
                          </p>
                        )}

                        {/* Highlights */}
                        {program.highlights && program.highlights.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {program.highlights.slice(0, 3).map((h, i) => (
                              <span key={i} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-md">
                                {h}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Result badge */}
                        {program.result && (
                          <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 mb-4">
                            <p className="text-xs text-emerald-700 font-medium">
                              📊 {program.result}
                            </p>
                          </div>
                        )}

                        {/* Meta */}
                        <div className="flex items-center gap-3 text-xs text-gray-400 pt-3 border-t border-gray-50">
                          {program.location && (
                            <span className="flex items-center gap-1">📍 {program.location}</span>
                          )}
                          {program.date && (
                            <span className="flex items-center gap-1">📅 {formatDate(program.date)}</span>
                          )}
                        </div>

                        {/* Arrow indicator */}
                        <div className="mt-4 flex items-center gap-1 text-green-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          अधिक वाचा
                          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
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
                          ? "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-md"
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

      {/* Program Detail Popup with Image Slider */}
      {selectedProgram && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedProgram(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-teal-500 px-5 py-4 flex items-center justify-between rounded-t-2xl sticky top-0 z-10">
              <h3 className="text-white font-bold text-sm sm:text-base flex items-center gap-2 truncate">
                🏗️ {selectedProgram.title}
              </h3>
              <button
                onClick={() => setSelectedProgram(null)}
                className="text-white/80 hover:text-white text-2xl flex-shrink-0 ml-2"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 space-y-4">
              {/* Image Slider */}
              <ImageSlider
                images={selectedProgram.images || []}
                title={selectedProgram.title}
              />

              {/* Category & Date */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                  {selectedProgram.category}
                </span>
                {selectedProgram.date && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                    📅 {new Date(selectedProgram.date).toLocaleDateString("mr-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
                {selectedProgram.location && (
                  <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                    📍 {selectedProgram.location}
                  </span>
                )}
              </div>

              {/* Description */}
              {selectedProgram.description && (
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                  {selectedProgram.description}
                </p>
              )}

              {/* Highlights */}
              {selectedProgram.highlights && selectedProgram.highlights.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-2">मुख्य मुद्दे:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProgram.highlights.map((h, i) => (
                      <span key={i} className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-md border border-green-100">
                        ✅ {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Result */}
              {selectedProgram.result && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
                  <p className="text-xs text-gray-500 mb-1">निकाल / परिणाम</p>
                  <p className="text-sm text-emerald-700 font-medium">{selectedProgram.result}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
