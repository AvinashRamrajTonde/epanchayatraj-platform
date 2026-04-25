import { useEffect, useState } from "react";
import { publicService, type Scheme } from "../../../services/publicService";

export default function SchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    publicService
      .getSchemes({ page, limit: 12 })
      .then((d) => {
        setSchemes(d.schemes || []);
        setTotalPages(d.pagination?.totalPages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <>
      <section className="bg-gradient-to-br from-teal-700 to-indigo-800 py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white">शासकीय योजना</h1>
          <p className="text-teal-200 mt-2">नागरिकांसाठी उपलब्ध शासकीय योजना व लाभ</p>
        </div>
      </section>

      <section className="py-12 bg-slate-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : schemes.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-lg font-bold text-slate-600">योजना उपलब्ध नाहीत</h3>
            </div>
          ) : (
            <div className="space-y-4">
              {schemes.map((s) => {
                const isOpen = expandedId === s.id;
                return (
                  <div key={s.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <button
                      onClick={() => setExpandedId(isOpen ? null : s.id)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">{s.title}</h3>
                          {s.category && <span className="text-xs text-teal-600">{s.category}</span>}
                        </div>
                      </div>
                      <svg className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
                        {s.description && <p className="text-slate-600 text-sm leading-relaxed">{s.description}</p>}
                        {s.benefits && s.benefits.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-slate-700 mb-2">लाभ:</h4>
                            <ul className="space-y-1">
                              {s.benefits.map((b, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                  <svg className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  {b}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {s.eligibility && s.eligibility.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-slate-700 mb-2">पात्रता:</h4>
                            <ul className="space-y-1">{s.eligibility.map((e, i) => <li key={i} className="text-sm text-slate-600 flex items-start gap-2"><span className="text-teal-500 mt-1">•</span>{e}</li>)}</ul>
                          </div>
                        )}
                        {s.documents && s.documents.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-slate-700 mb-2">आवश्यक कागदपत्रे:</h4>
                            <ul className="space-y-1">{s.documents.map((d, i) => <li key={i} className="text-sm text-slate-600 flex items-start gap-2"><span className="text-teal-500 mt-1">•</span>{d}</li>)}</ul>
                          </div>
                        )}
                        {s.contactInfo && <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">संपर्क: {s.contactInfo}</p>}
                      </div>
                    )}
                  </div>
                );
              })}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50">मागील</button>
                  <span className="text-sm text-slate-500">{page} / {totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50">पुढील</button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
