import { useEffect, useState } from "react";
import { publicService, type School } from "../../../services/publicService";
import { resolveUrl } from "../../../utils/resolveUrl";

const MANAGEMENT_LABELS: Record<string, string> = {
  zp: "जिल्हा परिषद",
  private: "खाजगी",
  aided: "अनुदानित",
  government: "शासकीय",
  "semi-government": "अर्ध-शासकीय",
};

const MEDIUM_LABELS: Record<string, string> = {
  marathi: "मराठी",
  english: "इंग्रजी",
  "semi-english": "सेमी इंग्रजी",
  urdu: "उर्दू",
  hindi: "हिंदी",
};

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicService
      .getSchools()
      .then((data) => setSchools(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalStudents = schools.reduce(
    (sum, s) => sum + s.boysCount + s.girlsCount,
    0
  );
  const totalTeachers = schools.reduce((sum, s) => sum + s.teachersCount, 0);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-700 to-indigo-800 py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white">शाळा</h1>
          <p className="text-teal-200 mt-2">गावातील शैक्षणिक संस्थांची माहिती</p>
        </div>
      </section>

      {/* Stats */}
      {!loading && schools.length > 0 && (
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "एकूण शाळा", value: schools.length, svg: <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg> },
                { label: "एकूण विद्यार्थी", value: totalStudents, svg: <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg> },
                { label: "एकूण शिक्षक", value: totalTeachers, svg: <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg> },
                {
                  label: "विद्यार्थी-शिक्षक गुणोत्तर",
                  value: totalTeachers > 0 ? `${Math.round(totalStudents / totalTeachers)}:1` : "-",
                  svg: <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="bg-slate-50 rounded-2xl border border-slate-100 p-5 text-center"
                >
                  <div className="flex justify-center mb-2">{s.svg}</div>
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Schools Grid */}
      <section className="py-12 bg-slate-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : schools.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-600">शाळांची माहिती उपलब्ध नाही</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {schools.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* School Photo */}
                  {s.schoolPhoto ? (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={resolveUrl(s.schoolPhoto)}
                        alt={s.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-teal-100 to-indigo-50 flex items-center justify-center">
                      <svg className="w-16 h-16 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>
                    </div>
                  )}

                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      {s.principalPhoto ? (
                        <img
                          src={resolveUrl(s.principalPhoto)}
                          alt={s.principalName || ""}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                          <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {s.name}
                        </h3>
                        {s.principalName && (
                          <p className="text-sm text-slate-500">
                            मुख्याध्यापक: {s.principalName}
                          </p>
                        )}
                      </div>
                    </div>

                    {s.address && (
                      <p className="text-sm text-slate-500 mb-3 flex items-start gap-1.5">
                        <svg className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" /></svg>
                        {s.address}
                      </p>
                    )}

                    {/* Counts Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-indigo-50 rounded-xl p-2.5 text-center">
                        <p className="text-lg font-bold text-indigo-700">
                          {s.boysCount}
                        </p>
                        <p className="text-[10px] text-indigo-600 font-medium">
                          मुले
                        </p>
                      </div>
                      <div className="bg-rose-50 rounded-xl p-2.5 text-center">
                        <p className="text-lg font-bold text-rose-700">
                          {s.girlsCount}
                        </p>
                        <p className="text-[10px] text-rose-600 font-medium">
                          मुली
                        </p>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
                        <p className="text-lg font-bold text-emerald-700">
                          {s.teachersCount}
                        </p>
                        <p className="text-[10px] text-emerald-600 font-medium">
                          शिक्षक
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {s.managementType && (
                        <span className="bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-medium">
                          {MANAGEMENT_LABELS[s.managementType] || s.managementType}
                        </span>
                      )}
                      {s.medium && (
                        <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                          माध्यम: {MEDIUM_LABELS[s.medium] || s.medium}
                        </span>
                      )}
                      {s.establishedYear && (
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
                          स्थापना: {s.establishedYear}
                        </span>
                      )}
                    </div>

                    {/* Contact */}
                    {(s.phone || s.email) && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-3 text-xs text-slate-500">
                        {s.phone && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                            {s.phone}
                          </span>
                        )}
                        {s.email && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                            {s.email}
                          </span>
                        )}
                      </div>
                    )}
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
