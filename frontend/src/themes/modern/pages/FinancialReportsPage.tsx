import { useEffect, useState } from "react";
import { publicService, type FinancialReport, type DevelopmentWork } from "../../../services/publicService";
import { resolveUrl } from "../../../utils/resolveUrl";

export default function FinancialReportsPage() {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [works, setWorks] = useState<DevelopmentWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [worksLoading, setWorksLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "in_progress" | "completed">("all");

  useEffect(() => {
    publicService
      .getFinancialReports()
      .then((data) => setReports(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
    publicService
      .getDevelopmentWorks()
      .then((data) => setWorks(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setWorksLoading(false));
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat("mr-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  const filteredWorks = activeTab === "all" ? works : works.filter((w) => w.status === activeTab);

  return (
    <>
      <section className="bg-gradient-to-br from-teal-700 to-indigo-800 py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white">जमा खर्च</h1>
          <p className="text-teal-200 mt-2">ग्रामपंचायतीचा आर्थिक अहवाल</p>
        </div>
      </section>

      <section className="py-12 bg-slate-50 min-h-[60vh]">
        <div className="max-w-5xl mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : reports.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-lg font-bold text-slate-600">आर्थिक अहवाल उपलब्ध नाहीत</h3>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-black text-slate-800 text-lg">
                        आर्थिक वर्ष {r.financialYear}
                      </h3>
                      <div className="flex flex-wrap gap-4 mt-3">
                        <div>
                          <p className="text-xs text-slate-400">जमा (उत्पन्न)</p>
                          <p className="text-lg font-bold text-teal-700">{fmt(r.incomeAmount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">खर्च</p>
                          <p className="text-lg font-bold text-red-600">{fmt(r.expenseAmount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">शिल्लक</p>
                          <p className={`text-lg font-bold ${r.balanceAmount >= 0 ? "text-teal-700" : "text-red-600"}`}>{fmt(r.balanceAmount)}</p>
                        </div>
                      </div>
                    </div>
                    {r.pdfUrl && (
                      <a
                        href={resolveUrl(r.pdfUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                        PDF डाउनलोड
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Development Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-teal-600 bg-teal-50 border border-teal-200 rounded-full px-3 py-1 mb-3">🏗️ विकास कामे</span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800">ग्रामपंचायत विकास कामे</h2>
            <p className="text-slate-500 mt-2">हाती घेतलेली व पूर्ण केलेली कामे (Works Undertaken & Completed)</p>
          </div>

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
                    ? "bg-teal-700 text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {worksLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : works.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-5xl mb-3">🏗️</p>
              <p className="text-slate-500">अद्याप कोणतीही विकास कामे उपलब्ध नाहीत.</p>
            </div>
          ) : filteredWorks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">या प्रवर्गात कोणतीही कामे उपलब्ध नाहीत.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-teal-700 text-white">
                      <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">अ.क्र.<br/><span className="font-normal text-xs">Sr.No</span></th>
                      <th className="px-4 py-3 text-left font-semibold">योजनेचे नाव / आर्थिक वर्ष<br/><span className="font-normal text-xs">Scheme Name</span></th>
                      <th className="px-4 py-3 text-left font-semibold">कामाचे नाव<br/><span className="font-normal text-xs">Work Name</span></th>
                      <th className="px-4 py-3 text-right font-semibold">मंजूर निधी<br/><span className="font-normal text-xs">Sanctioned (₹)</span></th>
                      <th className="px-4 py-3 text-right font-semibold">खर्च निधी<br/><span className="font-normal text-xs">Expended (₹)</span></th>
                      <th className="px-4 py-3 text-center font-semibold">स्थिती<br/><span className="font-normal text-xs">Status</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredWorks.map((w, i) => (
                      <tr key={w.id} className={i % 2 === 0 ? "bg-white" : "bg-teal-50/40"}>
                        <td className="px-4 py-4 text-center font-bold text-teal-700">{i + 1}</td>
                        <td className="px-4 py-4 text-slate-800">
                          <span className="font-semibold">{w.schemeName}</span>
                          <span className="block text-xs text-slate-400 mt-0.5">({w.financialYear})</span>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{w.workName}</td>
                        <td className="px-4 py-4 text-right font-semibold text-teal-700">{fmt(w.sanctionedAmount)}</td>
                        <td className="px-4 py-4 text-right font-semibold text-red-600">{fmt(w.expendedAmount)}</td>
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
                {filteredWorks.map((w, i) => (
                  <div key={w.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between bg-teal-50 px-4 py-2.5 border-b border-teal-100">
                      <span className="text-sm font-bold text-teal-700">#{i + 1}</span>
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
                        <p className="text-xs text-slate-400">योजना / आर्थिक वर्ष</p>
                        <p className="font-semibold text-slate-800">{w.schemeName} <span className="text-xs text-slate-400">({w.financialYear})</span></p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">कामाचे नाव</p>
                        <p className="text-slate-700">{w.workName}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                        <div>
                          <p className="text-xs text-slate-400">मंजूर निधी</p>
                          <p className="font-bold text-teal-700">{fmt(w.sanctionedAmount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">खर्च निधी</p>
                          <p className="font-bold text-red-600">{fmt(w.expendedAmount)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-400 text-center mt-6 italic">
                * सदर माहिती ग्रामपंचायत स्तरावरून वेळोवेळी अद्ययावत केली जाते.
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
