import { useEffect, useState } from "react";
import { publicService, type Scheme } from "../../../services/publicService";
import { resolveUrl } from "../../../utils/resolveUrl";
import SeoHead from "../components/SeoHead";
import SectionHero from "../components/SectionHero";
import { StaggerContainer, StaggerItem } from "../components/AnimatedSection";

export default function SchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);

  useEffect(() => {
    setLoading(true);
    publicService
      .getSchemes({ page, limit: 12, category: category || undefined })
      .then((data) => {
        setSchemes(data.schemes || []);
        setTotalPages(data.pagination?.totalPages || 1);
        if (page === 1 && !category) {
          const cats = [...new Set((data.schemes || []).map((s: Scheme) => s.category))] as string[];
          setCategories(cats);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, category]);

  return (
    <>
      <SeoHead title="शासकीय योजना" path="/schemes" />

      <SectionHero
        title="शासकीय योजना"
        subtitle="नागरिकांसाठी उपलब्ध सरकारी योजना व लाभ"
        gradient="from-purple-600 to-indigo-500"
      />

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => { setCategory(""); setPage(1); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !category ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                सर्व
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setPage(1); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    category === cat ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : schemes.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <span className="text-5xl block mb-4">📋</span>
              सध्या कोणतीही योजना उपलब्ध नाही
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schemes.map((scheme) => (
                <StaggerItem
                  key={scheme.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all border border-gray-100 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedScheme(scheme)}
                >
                  {scheme.imageUrl ? (
                    <div className="relative h-36 overflow-hidden">
                      <img
                        src={resolveUrl(scheme.imageUrl)}
                        alt={scheme.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                  ) : (
                    <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500" />
                  )}
                  <div className="p-6">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                      {scheme.category}
                    </span>
                    <h3 className="font-bold text-gray-800 text-lg mt-3 mb-2">{scheme.title}</h3>
                    {scheme.description && (
                      <p className="text-gray-500 text-sm line-clamp-3 mb-3">{scheme.description}</p>
                    )}
                    {scheme.benefits && scheme.benefits.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-600 mb-1">फायदे:</p>
                        <ul className="text-xs text-gray-500 space-y-0.5">
                          {scheme.benefits.slice(0, 3).map((b, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-green-500">✓</span> {b}
                            </li>
                          ))}
                          {scheme.benefits.length > 3 && (
                            <li className="text-purple-500">+ {scheme.benefits.length - 3} अधिक...</li>
                          )}
                        </ul>
                      </div>
                    )}
                    <div className="mt-4 flex items-center gap-3">
                      <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                        अधिक माहिती →
                      </button>
                      {scheme.schemeLink && (
                        <a
                          href={scheme.schemeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1"
                        >
                          🔗 अर्ज करा
                        </a>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
              >
                ← मागे
              </button>
              <span className="px-4 py-2 text-sm text-gray-500">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
              >
                पुढे →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4 flex items-center justify-between rounded-t-2xl sticky top-0 z-10">
              <h3 className="text-white font-bold text-lg">{selectedScheme.title}</h3>
              <button onClick={() => setSelectedScheme(null)} className="text-white/80 hover:text-white text-2xl">×</button>
            </div>
            {selectedScheme.imageUrl && (
              <div className="h-48 overflow-hidden">
                <img
                  src={resolveUrl(selectedScheme.imageUrl)}
                  alt={selectedScheme.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6 space-y-5">
              {selectedScheme.description && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">वर्णन</h4>
                  <p className="text-gray-600 text-sm">{selectedScheme.description}</p>
                </div>
              )}
              {selectedScheme.benefits && selectedScheme.benefits.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">फायदे</h4>
                  <ul className="space-y-1">
                    {selectedScheme.benefits.map((b, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedScheme.eligibility && selectedScheme.eligibility.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">पात्रता</h4>
                  <ul className="space-y-1">
                    {selectedScheme.eligibility.map((e, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">●</span> {e}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedScheme.documents && selectedScheme.documents.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">आवश्यक कागदपत्रे</h4>
                  <ul className="space-y-1">
                    {selectedScheme.documents.map((d, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-orange-500 mt-0.5">📄</span> {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedScheme.applicationProcess && selectedScheme.applicationProcess.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">अर्ज प्रक्रिया</h4>
                  <ol className="space-y-1">
                    {selectedScheme.applicationProcess.map((step, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="bg-purple-100 text-purple-700 w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              <div className="flex flex-wrap gap-4 pt-2">
                {selectedScheme.budget && (
                  <div className="bg-gray-50 rounded-lg px-4 py-2">
                    <p className="text-xs text-gray-500">अंदाजपत्रक</p>
                    <p className="font-semibold text-gray-800">{selectedScheme.budget}</p>
                  </div>
                )}
                {selectedScheme.beneficiaries && (
                  <div className="bg-gray-50 rounded-lg px-4 py-2">
                    <p className="text-xs text-gray-500">लाभार्थी</p>
                    <p className="font-semibold text-gray-800">{selectedScheme.beneficiaries}</p>
                  </div>
                )}
                {selectedScheme.contactInfo && (
                  <div className="bg-gray-50 rounded-lg px-4 py-2">
                    <p className="text-xs text-gray-500">संपर्क</p>
                    <p className="font-semibold text-gray-800">{selectedScheme.contactInfo}</p>
                  </div>
                )}
              </div>
              {selectedScheme.schemeLink && (
                <div className="pt-2">
                  <a
                    href={selectedScheme.schemeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
                  >
                    🔗 ऑनलाईन अर्ज करा
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
