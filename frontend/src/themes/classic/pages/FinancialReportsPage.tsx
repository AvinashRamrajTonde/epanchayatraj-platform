import { useEffect, useState } from "react";
import { publicService, type FinancialReport, type DevelopmentWork } from "../../../services/publicService";
import SeoHead from "../components/SeoHead";
import SectionHero from "../components/SectionHero";
import SectionHeading from "../components/SectionHeading";
import AnimatedSection, { StaggerContainer, StaggerItem } from "../components/AnimatedSection";

export default function FinancialReportsPage() {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [works, setWorks] = useState<DevelopmentWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [worksLoading, setWorksLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "in_progress" | "completed">("all");

  useEffect(() => {
    publicService
      .getFinancialReports()
      .then(setReports)
      .catch(console.error)
      .finally(() => setLoading(false));
    publicService
      .getDevelopmentWorks()
      .then(setWorks)
      .catch(console.error)
      .finally(() => setWorksLoading(false));
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("mr-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);

  return (
    <>
      <SeoHead title="जमा खर्च" path="/financial-reports" />

      <SectionHero
        title="वार्षिक जमा खर्च अहवाल"
        subtitle="ग्रामपंचायतीचा आर्थिक वर्षनिहाय जमा-खर्च तपशील"
        gradient="from-emerald-700 to-teal-600"
      />

      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-72 rounded-2xl bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <AnimatedSection>
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-600">
                  अद्याप कोणताही जमा खर्च अहवाल उपलब्ध नाही
                </h3>
                <p className="text-gray-400 mt-2">लवकरच अहवाल प्रकाशित केले जातील.</p>
              </div>
            </AnimatedSection>
          ) : (
            <StaggerContainer className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {reports.map((report) => (
                <StaggerItem key={report.id}>
                  <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                    {/* Header */}
                    <div className="relative bg-gradient-to-br from-emerald-600 to-teal-500 px-6 py-5 text-white">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
                      <div className="relative">
                        <p className="text-emerald-100 text-sm font-medium">वार्षिक जमा खर्च अहवाल</p>
                        <h3 className="text-2xl font-bold mt-1">
                          सन {report.financialYear}
                        </h3>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5 space-y-4">
                      {/* Income */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-500 font-medium">जमा रक्कम (₹)</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(report.incomeAmount)}
                        </span>
                      </div>

                      {/* Expense */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-500 font-medium">खर्च रक्कम (₹)</span>
                        </div>
                        <span className="text-lg font-bold text-red-500">
                          {formatCurrency(report.expenseAmount)}
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-dashed border-gray-200" />

                      {/* Balance */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-600 font-semibold">शिल्लक रक्कम (₹)</span>
                        </div>
                        <span className="text-xl font-extrabold text-blue-700">
                          {formatCurrency(report.balanceAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Footer - PDF Download */}
                    {report.pdfUrl && (
                      <div className="px-6 pb-5">
                        <a
                          href={report.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold text-sm hover:from-emerald-700 hover:to-teal-600 transition-all duration-300 shadow-md hover:shadow-lg group-hover:scale-[1.02]"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          PDF डाउनलोड करा
                        </a>
                      </div>
                    )}
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* Development Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection animation="fadeUp">
            <SectionHeading
              badge="🏗️ विकास कामे"
              title="ग्रामपंचायत विकास कामे"
              subtitle="हाती घेतलेली व पूर्ण केलेली कामे (Works Undertaken & Completed)"
              badgeColor="text-orange-600 bg-orange-50 border-orange-200"
              align="center"
            />
          </AnimatedSection>

          {/* Tab Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {([
              { key: "all", label: "सर्व कामे (All)" },
              { key: "in_progress", label: "चालू (In Progress)" },
              { key: "completed", label: "पूर्ण (Completed)" },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.key
                    ? "bg-orange-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {worksLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
            </div>
          ) : works.length === 0 ? (
            <AnimatedSection>
              <div className="text-center py-12">
                <div className="text-5xl mb-3">🏗️</div>
                <p className="text-gray-500">अद्याप कोणतीही विकास कामे उपलब्ध नाहीत.</p>
              </div>
            </AnimatedSection>
          ) : (() => {
            const filtered = activeTab === "all" ? works : works.filter((w) => w.status === activeTab);
            return filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">या प्रवर्गात कोणतीही कामे उपलब्ध नाहीत.</p>
              </div>
            ) : (
              <AnimatedSection animation="fadeUp" delay={0.1}>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-orange-600 text-white">
                        <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">अ.क्र.<br/><span className="font-normal text-xs">Sr.No</span></th>
                        <th className="px-4 py-3 text-left font-semibold">योजनेचे नाव / आर्थिक वर्ष<br/><span className="font-normal text-xs">Scheme Name</span></th>
                        <th className="px-4 py-3 text-left font-semibold">कामाचे नाव<br/><span className="font-normal text-xs">Work Name</span></th>
                        <th className="px-4 py-3 text-right font-semibold">मंजूर निधी<br/><span className="font-normal text-xs">Sanctioned (₹)</span></th>
                        <th className="px-4 py-3 text-right font-semibold">खर्च निधी<br/><span className="font-normal text-xs">Expended (₹)</span></th>
                        <th className="px-4 py-3 text-center font-semibold">स्थिती<br/><span className="font-normal text-xs">Status</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filtered.map((w, i) => (
                        <tr key={w.id} className={i % 2 === 0 ? "bg-white" : "bg-orange-50/40"}>
                          <td className="px-4 py-4 text-center font-bold text-orange-600">{i + 1}</td>
                          <td className="px-4 py-4 text-gray-800">
                            <span className="font-semibold">{w.schemeName}</span>
                            <span className="block text-xs text-gray-400 mt-0.5">({w.financialYear})</span>
                          </td>
                          <td className="px-4 py-4 text-gray-600">{w.workName}</td>
                          <td className="px-4 py-4 text-right font-semibold text-green-700">{formatCurrency(w.sanctionedAmount)}</td>
                          <td className="px-4 py-4 text-right font-semibold text-red-600">{formatCurrency(w.expendedAmount)}</td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                              w.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}>
                              {w.status === "completed" ? "✅ पूर्ण" : "🔄 चालू"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {filtered.map((w, i) => (
                    <div key={w.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between bg-orange-50 px-4 py-2.5 border-b border-orange-100">
                        <span className="text-sm font-bold text-orange-700">#{i + 1}</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          w.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {w.status === "completed" ? "✅ पूर्ण" : "🔄 चालू"}
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <div>
                          <p className="text-xs text-gray-400">योजना / आर्थिक वर्ष</p>
                          <p className="font-semibold text-gray-800">{w.schemeName} <span className="text-xs text-gray-400">({w.financialYear})</span></p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">कामाचे नाव</p>
                          <p className="text-gray-700">{w.workName}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                          <div>
                            <p className="text-xs text-gray-400">मंजूर निधी</p>
                            <p className="font-bold text-green-700">{formatCurrency(w.sanctionedAmount)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">खर्च निधी</p>
                            <p className="font-bold text-red-600">{formatCurrency(w.expendedAmount)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-400 text-center mt-6 italic">
                  * सदर माहिती ग्रामपंचायत स्तरावरून वेळोवेळी अद्ययावत केली जाते.
                </p>
              </AnimatedSection>
            );
          })()}
        </div>
      </section>
    </>
  );
}
