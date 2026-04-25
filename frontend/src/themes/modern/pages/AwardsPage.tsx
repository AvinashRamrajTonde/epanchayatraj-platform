import { useEffect, useState } from "react";
import { publicService, type Award } from "../../../services/publicService";
import { resolveUrl } from "../../../utils/resolveUrl";

export default function AwardsPage() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicService
      .getAwards()
      .then((data) => setAwards(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="bg-gradient-to-br from-teal-700 to-indigo-800 py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white">पुरस्कार</h1>
          <p className="text-teal-200 mt-2">ग्रामपंचायतीला मिळालेले पुरस्कार व सन्मान</p>
        </div>
      </section>

      <section className="py-12 bg-slate-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : awards.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0012.75 11h-.75V7.5m0-4.5h3.375c.621 0 1.125.504 1.125 1.125v3.026a2.999 2.999 0 010 5.198v.401c0 .621-.504 1.125-1.125 1.125H9.375c-.621 0-1.125-.504-1.125-1.125v-.401a2.999 2.999 0 010-5.198V4.125c0-.621.504-1.125 1.125-1.125H12m0 0V1.5" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-600">पुरस्कार उपलब्ध नाहीत</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {awards.map((a) => (
                <div key={a.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow">
                  {a.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img src={resolveUrl(a.imageUrl)} alt={a.title} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                      </div>
                      {a.year && <span className="text-xs text-slate-400 font-medium">{a.year}</span>}
                      {a.category && <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded">{a.category}</span>}
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1">{a.title}</h3>
                    {a.awardedBy && <p className="text-sm text-slate-500 mb-1">प्रदाता: {a.awardedBy}</p>}
                    {a.description && <p className="text-slate-500 text-sm line-clamp-3 mt-2">{a.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
