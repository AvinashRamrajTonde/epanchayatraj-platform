import { useEffect, useState } from "react";
import { publicService, type Award } from "../../../services/publicService";
import { resolveUrl } from "../../../utils/resolveUrl";
import SeoHead from "../components/SeoHead";
import SectionHero from "../components/SectionHero";
import AnimatedSection, { StaggerContainer, StaggerItem } from "../components/AnimatedSection";

const CATEGORIES = [
  { value: "", label: "सर्व" },
  { value: "राज्य पुरस्कार", label: "राज्य पुरस्कार" },
  { value: "राष्ट्रीय पुरस्कार", label: "राष्ट्रीय पुरस्कार" },
  { value: "जिल्हा पुरस्कार", label: "जिल्हा पुरस्कार" },
  { value: "स्वच्छता पुरस्कार", label: "स्वच्छता पुरस्कार" },
  { value: "डिजिटल पुरस्कार", label: "डिजिटल पुरस्कार" },
  { value: "कृषी पुरस्कार", label: "कृषी पुरस्कार" },
  { value: "शिक्षण पुरस्कार", label: "शिक्षण पुरस्कार" },
  { value: "इतर", label: "इतर" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "राज्य पुरस्कार": "from-amber-400 to-yellow-500",
  "राष्ट्रीय पुरस्कार": "from-orange-500 to-red-500",
  "जिल्हा पुरस्कार": "from-blue-500 to-indigo-500",
  "स्वच्छता पुरस्कार": "from-green-500 to-emerald-500",
  "डिजिटल पुरस्कार": "from-purple-500 to-violet-500",
  "कृषी पुरस्कार": "from-lime-500 to-green-500",
  "शिक्षण पुरस्कार": "from-cyan-500 to-blue-500",
  "इतर": "from-gray-500 to-gray-600",
};

export default function AwardsPage() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [selectedAward, setSelectedAward] = useState<Award | null>(null);

  useEffect(() => {
    publicService
      .getAwards()
      .then(setAwards)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = category
    ? awards.filter((a) => a.category === category)
    : awards;

  return (
    <>
      <SeoHead title="पुरस्कार" path="/awards" />

      <SectionHero
        title="पुरस्कार व सन्मान"
        subtitle="गावाच्या उत्कृष्ट कार्यासाठी मिळालेले विविध पुरस्कार"
        gradient="from-amber-600 to-orange-500"
      />

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Category Filters */}
          <AnimatedSection animation="fadeUp">
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    category === cat.value
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </AnimatedSection>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <span className="text-5xl block mb-4">🏆</span>
              या प्रवर्गात पुरस्कार उपलब्ध नाहीत
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.08}>
              {filtered.map((award) => {
                const gradient = CATEGORY_COLORS[award.category] || "from-orange-500 to-amber-500";
                return (
                  <StaggerItem key={award.id}>
                    <div
                      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1 cursor-pointer group"
                      onClick={() => setSelectedAward(award)}
                    >
                      {award.imageUrl ? (
                        <div className="relative h-52 overflow-hidden">
                          <img
                            src={resolveUrl(award.imageUrl)}
                            alt={award.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                            <span className={`bg-gradient-to-r ${gradient} text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm`}>
                              {award.category}
                            </span>
                            {award.year && (
                              <span className="bg-white/20 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full">
                                {award.year}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className={`h-52 bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                          <div className="text-center relative z-10">
                            <span className="text-6xl block mb-2">🏆</span>
                            {award.year && (
                              <span className="bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">
                                {award.year}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                          {award.title}
                        </h3>
                        {award.description && (
                          <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                            {award.description}
                          </p>
                        )}
                        {award.awardedBy && (
                          <p className="text-amber-600 text-sm font-medium">
                            — {award.awardedBy}
                          </p>
                        )}
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* Award Detail Modal */}
      {selectedAward && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedAward(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between rounded-t-2xl sticky top-0 z-10">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                🏆 {selectedAward.title}
              </h3>
              <button onClick={() => setSelectedAward(null)} className="text-white/80 hover:text-white text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              {selectedAward.imageUrl && (
                <img
                  src={resolveUrl(selectedAward.imageUrl)}
                  alt={selectedAward.title}
                  className="w-full h-56 object-cover rounded-xl"
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
                <p className="text-gray-600 leading-relaxed">{selectedAward.description}</p>
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
    </>
  );
}
