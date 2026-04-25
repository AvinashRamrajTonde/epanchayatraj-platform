import { useEffect, useState } from "react";
import { publicService } from "../../../services/publicService";

export default function ServicesPage() {
  const [services, setServices] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicService
      .getContentSection("services")
      .then((d) => setServices(d || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const servicesList = (services?.services as { name: string; description?: string; documents?: string[]; timing?: string }[]) || [];

  return (
    <>
      <section className="bg-gradient-to-br from-teal-700 to-indigo-800 py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white">नागरिक सेवा</h1>
          <p className="text-teal-200 mt-2">ग्रामपंचायतीद्वारे उपलब्ध नागरिक सेवा</p>
        </div>
      </section>

      <section className="py-12 bg-slate-50 min-h-[60vh]">
        <div className="max-w-5xl mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : servicesList.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-lg font-bold text-slate-600">सेवा माहिती उपलब्ध नाही</h3>
              <p className="text-slate-400 text-sm mt-1">कृपया नंतर भेट द्या</p>
            </div>
          ) : (
            <div className="space-y-4">
              {servicesList.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                      <span className="text-teal-700 font-bold text-sm">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 text-lg">{s.name}</h3>
                      {s.description && <p className="text-slate-500 text-sm mt-1">{s.description}</p>}
                      {s.documents && s.documents.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-slate-500 mb-1">आवश्यक कागदपत्रे:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {s.documents.map((d, j) => (
                              <span key={j} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded">{d}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {s.timing && <p className="text-xs text-slate-400 mt-2">वेळ: {s.timing}</p>}
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
