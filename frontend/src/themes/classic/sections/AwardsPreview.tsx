import { useState } from "react";
import { Link } from "react-router-dom";
import type { Award } from "../../../services/publicService";
import { resolveUrl } from "../../../utils/resolveUrl";
import SectionHeading from "../components/SectionHeading";
import { StaggerContainer, StaggerItem } from "../components/AnimatedSection";
import AnimatedSection from "../components/AnimatedSection";

interface Props {
  awards: Award[];
}

const CATEGORY_COLORS: Record<string, string> = {
  "राज्य पुरस्कार": "from-amber-400 to-yellow-500",
  "राष्ट्रीय पुरस्कार": "from-orange-500 to-red-500",
  "जिल्हा पुरस्कार": "from-blue-500 to-indigo-500",
  "स्वच्छता पुरस्कार": "from-green-500 to-emerald-500",
  "डिजिटल पुरस्कार": "from-purple-500 to-violet-500",
};

export default function AwardsPreview({ awards }: Props) {
  const [selectedAward, setSelectedAward] = useState<Award | null>(null);

  if (awards.length === 0) return null;

  const displayAwards = awards.slice(0, 4);

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-amber-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-orange-200/30 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 relative">
        <SectionHeading
          badge="🏆 सन्मान आणि पुरस्कार"
          title="गावाचे पुरस्कार"
          subtitle="गावाच्या उत्कृष्ट कार्यासाठी मिळालेले सन्मान"
          badgeColor="text-amber-700 bg-amber-100 border-amber-300"
          align="center"
        />

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" staggerDelay={0.1}>
          {displayAwards.map((award) => {
            const gradient = CATEGORY_COLORS[award.category] || "from-orange-500 to-amber-500";
            return (
              <StaggerItem key={award.id} animation="scaleIn">
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-amber-100/50 hover:-translate-y-2 group flex flex-col">
                  {award.imageUrl ? (
                    <div className="relative h-40 sm:h-44 overflow-hidden">
                      <img
                        src={resolveUrl(award.imageUrl)}
                        alt={award.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center"><span class="text-5xl opacity-80">🏆</span></div>`;
                          }
                        }}
                      />
                      <div className={`absolute top-3 right-3 bg-gradient-to-r ${gradient} text-white text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-medium shadow-sm`}>
                        🏆 {award.year || ""}
                      </div>
                    </div>
                  ) : (
                    <div className={`h-40 sm:h-44 bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                      <span className="text-5xl opacity-80">🏆</span>
                      {award.year && (
                        <span className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium">
                          {award.year}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <span className="text-[10px] sm:text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full inline-block w-fit mb-2">
                      {award.category}
                    </span>
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base line-clamp-2 mb-1 flex-1">
                      {award.title}
                    </h3>
                    {award.awardedBy && (
                      <p className="text-gray-400 text-xs mt-1 mb-2">
                        — {award.awardedBy}
                      </p>
                    )}
                    <button
                      onClick={() => setSelectedAward(award)}
                      className="mt-auto text-amber-600 text-xs sm:text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all hover:text-amber-700"
                    >
                      पहा
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {awards.length > 4 && (
          <AnimatedSection animation="fadeUp" delay={0.4} className="text-center mt-8 sm:mt-10">
            <Link
              to="/awards"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-amber-500/20 hover:shadow-lg text-sm sm:text-base"
            >
              सर्व पुरस्कार पहा
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </AnimatedSection>
        )}
      </div>

      {/* Award Detail Modal */}
      {selectedAward && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedAward(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4 flex items-center justify-between rounded-t-2xl sticky top-0 z-10">
              <h3 className="text-white font-bold text-sm sm:text-base flex items-center gap-2 truncate">
                🏆 {selectedAward.title}
              </h3>
              <button onClick={() => setSelectedAward(null)} className="text-white/80 hover:text-white text-2xl flex-shrink-0 ml-2">×</button>
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              {selectedAward.imageUrl && (
                <img
                  src={resolveUrl(selectedAward.imageUrl)}
                  alt={selectedAward.title}
                  className="w-full h-48 sm:h-56 object-cover rounded-xl"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
                  {selectedAward.category}
                </span>
                {selectedAward.year && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                    वर्ष: {selectedAward.year}
                  </span>
                )}
              </div>
              {selectedAward.description && (
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{selectedAward.description}</p>
              )}
              {selectedAward.awardedBy && (
                <div className="bg-amber-50 rounded-lg px-4 py-3">
                  <p className="text-xs text-gray-500">पुरस्कार देणारी संस्था</p>
                  <p className="font-semibold text-gray-800">{selectedAward.awardedBy}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
