import { useEffect, useState } from "react";
import { publicService } from "../../../services/publicService";

export default function DeclarationsPage() {
  const [data, setData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicService
      .getContentSection("declarations")
      .then((d) => setData(d || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const declarations = (data?.declarations as { title: string; content: string; date?: string }[]) || [];

  return (
    <>
      <section className="bg-gradient-to-br from-teal-700 to-indigo-800 py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white">स्वयंघोषणापत्रे</h1>
          <p className="text-teal-200 mt-2">ग्रामपंचायत सदस्यांची स्वयंघोषणापत्रे</p>
        </div>
      </section>

      <section className="py-12 bg-slate-50 min-h-[60vh]">
        <div className="max-w-5xl mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : declarations.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-600">स्वयंघोषणापत्रे उपलब्ध नाहीत</h3>
              <p className="text-slate-400 text-sm mt-1">कृपया नंतर भेट द्या</p>
            </div>
          ) : (
            <div className="space-y-4">
              {declarations.map((d, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 text-lg">{d.title}</h3>
                      {d.date && <p className="text-xs text-slate-400 mt-0.5">{new Date(d.date).toLocaleDateString("mr-IN", { day: "numeric", month: "long", year: "numeric" })}</p>}
                      <p className="text-slate-600 text-sm mt-2 leading-relaxed whitespace-pre-wrap">{d.content}</p>
                    </div>
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
