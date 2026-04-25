import { useEffect, useState } from "react";
import { publicService, type Program } from "../../../services/publicService";
import { resolveUrl } from "../../../utils/resolveUrl";

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Program | null>(null);

  useEffect(() => {
    setLoading(true);
    publicService
      .getPrograms({ page, limit: 12 })
      .then((d) => {
        setPrograms(d.programs || []);
        setTotalPages(d.pagination?.totalPages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("mr-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

  return (
    <>
      <section className="bg-gradient-to-br from-teal-700 to-indigo-800 py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white">विकासकामे</h1>
          <p className="text-teal-200 mt-2">ग्रामपंचायतीने शासनाच्या व लोकसहभागातून केलेली कामे</p>
        </div>
      </section>

      <section className="py-12 bg-slate-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.645 3.152a.5.5 0 01-.735-.445V5.023a.5.5 0 01.735-.445l5.645 3.152a.5.5 0 010 .89zM15.75 7.5h-3.75m3.75 3h-3.75m3.75 3h-3.75" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-600">विकासकामे उपलब्ध नाहीत</h3>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map((p) => (
                  <article
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg cursor-pointer transition-all group"
                  >
                    {p.images?.[0] && (
                      <div className="h-48 overflow-hidden">
                        <img src={resolveUrl(p.images[0])} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium bg-teal-50 text-teal-700 px-2 py-0.5 rounded">{p.category || "सामान्य"}</span>
                        {p.date && <span className="text-xs text-slate-400">{fmt(p.date)}</span>}
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg mb-1 line-clamp-2 group-hover:text-teal-700 transition-colors">{p.title}</h3>
                      {p.description && <p className="text-slate-500 text-sm line-clamp-2">{p.description}</p>}
                    </div>
                  </article>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-10">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50">मागील</button>
                  <span className="text-sm text-slate-500">{page} / {totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50">पुढील</button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Program Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            {selected.images && selected.images.length > 0 && (
              <div className="h-64 overflow-hidden rounded-t-2xl">
                <img src={resolveUrl(selected.images[0])} alt={selected.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium bg-teal-50 text-teal-700 px-2 py-0.5 rounded">{selected.category || "सामान्य"}</span>
                {selected.date && <span className="text-xs text-slate-400">{fmt(selected.date)}</span>}
                {selected.location && <span className="text-xs text-slate-400">{selected.location}</span>}
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-3">{selected.title}</h2>
              {selected.description && <p className="text-slate-600 leading-relaxed whitespace-pre-wrap mb-4">{selected.description}</p>}
              {selected.highlights && selected.highlights.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-bold text-slate-700 text-sm mb-2">ठळक मुद्दे:</h4>
                  <ul className="space-y-1">
                    {selected.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <svg className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selected.result && (
                <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                  <h4 className="font-bold text-teal-700 text-sm mb-1">निष्कर्ष:</h4>
                  <p className="text-slate-600 text-sm">{selected.result}</p>
                </div>
              )}
              {/* Image gallery */}
              {selected.images && selected.images.length > 1 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {selected.images.slice(1).map((img, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden">
                      <img src={resolveUrl(img)} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
