import { useEffect, useState, useMemo } from "react";
import { publicService, type Gramsabha } from "../../../services/publicService";
import { resolveUrl } from "../../../utils/resolveUrl";

const STATUS_LABELS: Record<string, string> = {
  scheduled: "नियोजित",
  completed: "पूर्ण",
  cancelled: "रद्द",
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("mr-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function GramsabhaPage() {
  const [gramsabhas, setGramsabhas] = useState<Gramsabha[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    publicService
      .getGramsabhas()
      .then((data) => setGramsabhas(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const nextMeeting = useMemo(() => {
    const now = new Date();
    return gramsabhas.find(
      (g) => g.status === "scheduled" && new Date(g.date) >= now
    );
  }, [gramsabhas]);

  const completedMeetings = useMemo(
    () => gramsabhas.filter((g) => g.status === "completed"),
    [gramsabhas]
  );

  const stats = useMemo(() => {
    const total = completedMeetings.length;
    const totalAttendees = completedMeetings.reduce(
      (sum, g) => sum + (g.attendeesTotal || 0),
      0
    );
    const totalDecisions = completedMeetings.reduce(
      (sum, g) => sum + (g.decisions?.length || 0),
      0
    );
    const totalFemale = completedMeetings.reduce(
      (sum, g) => sum + (g.attendeesFemale || 0),
      0
    );
    const avgAttendance = total > 0 ? Math.round(totalAttendees / total) : 0;
    const womenPct =
      totalAttendees > 0 ? Math.round((totalFemale / totalAttendees) * 100) : 0;
    return { total, avgAttendance, totalDecisions, womenPct };
  }, [completedMeetings]);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-700 to-indigo-800 py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white">ग्रामसभा</h1>
          <p className="text-teal-200 mt-2">
            ग्रामपंचायतीच्या बैठकांचे तपशील, कार्यवृत्त आणि ठराव
          </p>
        </div>
      </section>

      {/* Next Meeting */}
      {nextMeeting && (
        <section className="bg-gradient-to-r from-teal-50 to-indigo-50 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-white rounded-2xl border border-teal-100 shadow-md p-6 md:p-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="animate-pulse w-3 h-3 bg-emerald-500 rounded-full" />
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                  पुढील ग्रामसभा
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
                {nextMeeting.title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-3 bg-teal-50 rounded-xl p-3">
                  <svg className="w-5 h-5 text-teal-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                  <div>
                    <p className="text-[10px] text-slate-500">दिनांक</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {fmtDate(nextMeeting.date)}
                    </p>
                  </div>
                </div>
                {nextMeeting.time && (
                  <div className="flex items-center gap-3 bg-teal-50 rounded-xl p-3">
                    <svg className="w-5 h-5 text-teal-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div>
                      <p className="text-[10px] text-slate-500">वेळ</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {nextMeeting.time}
                      </p>
                    </div>
                  </div>
                )}
                {nextMeeting.location && (
                  <div className="flex items-center gap-3 bg-teal-50 rounded-xl p-3">
                    <svg className="w-5 h-5 text-teal-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" /></svg>
                    <div>
                      <p className="text-[10px] text-slate-500">स्थळ</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {nextMeeting.location}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {nextMeeting.agenda && (
                <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-500 mb-1">कार्यसूची</p>
                  <p className="text-sm text-slate-700 whitespace-pre-line">
                    {nextMeeting.agenda}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "एकूण बैठका", value: stats.total, svg: <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" /></svg> },
              { label: "सरासरी उपस्थिती", value: stats.avgAttendance, svg: <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg> },
              { label: "एकूण ठराव", value: stats.totalDecisions, svg: <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
              { label: "महिला सहभाग", value: `${stats.womenPct}%`, svg: <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg> },
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

      {/* Meetings List */}
      <section className="py-12 bg-slate-50 min-h-[40vh]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            ग्रामसभा बैठका
          </h2>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : gramsabhas.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-600">
                कोणतीही ग्रामसभा बैठक नाही
              </h3>
            </div>
          ) : (
            <div className="space-y-4">
              {gramsabhas.map((g) => (
                <div
                  key={g.id}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() =>
                      setExpandedId(expandedId === g.id ? null : g.id)
                    }
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-base font-bold text-slate-900">
                            {g.title}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              STATUS_COLORS[g.status] || ""
                            }`}
                          >
                            {STATUS_LABELS[g.status] || g.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                          <span>{fmtDate(g.date)}</span>
                          {g.time && <span>{g.time}</span>}
                          {g.location && <span>{g.location}</span>}
                          {g.attendeesTotal != null && (
                            <span>उपस्थिती: {g.attendeesTotal}</span>
                          )}
                        </div>
                      </div>
                      <svg
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          expandedId === g.id ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>

                  {expandedId === g.id && (
                    <div className="border-t border-slate-100 p-5 bg-slate-50/50">
                      {g.agenda && (
                        <div className="mb-4">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                            कार्यसूची
                          </h4>
                          <p className="text-sm text-slate-700 whitespace-pre-line">
                            {g.agenda}
                          </p>
                        </div>
                      )}
                      {g.attendeesTotal != null && (
                        <div className="mb-4">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                            उपस्थिती तपशील
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            <span className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                              एकूण: {g.attendeesTotal}
                            </span>
                            {g.attendeesMale != null && (
                              <span className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                                पुरुष: {g.attendeesMale}
                              </span>
                            )}
                            {g.attendeesFemale != null && (
                              <span className="bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                                महिला: {g.attendeesFemale}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {g.minutes && (
                        <div className="mb-4">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                            कार्यवृत्त
                          </h4>
                          <p className="text-sm text-slate-700 whitespace-pre-line bg-white p-3 rounded-xl border border-slate-100">
                            {g.minutes}
                          </p>
                        </div>
                      )}
                      {g.decisions && g.decisions.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                            ठराव / निर्णय
                          </h4>
                          <ol className="space-y-1.5">
                            {g.decisions.map((d, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-sm text-slate-700"
                              >
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold shrink-0 mt-0.5">
                                  {i + 1}
                                </span>
                                {d}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-4">
                        {g.imageUrl && (
                          <a
                            href={resolveUrl(g.imageUrl)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img
                              src={resolveUrl(g.imageUrl)}
                              alt={g.title}
                              className="w-64 h-40 object-cover rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                            />
                          </a>
                        )}
                        {g.pdfUrl && (
                          <a
                            href={resolveUrl(g.pdfUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2.5 rounded-xl hover:bg-teal-100 transition-colors font-medium text-sm self-start"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                            कार्यवृत्त PDF डाउनलोड करा
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" /></svg>
                ग्रामसभा म्हणजे काय?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                ग्रामसभा ही गावातील मतदार यादीतील सर्व व्यक्तींची सभा आहे.
                महाराष्ट्र ग्रामपंचायत अधिनियम अंतर्गत ग्रामसभा भरविणे बंधनकारक आहे.
                ग्रामसभेत गावच्या विकासाशी संबंधित सर्व महत्वाचे निर्णय घेतले जातात.
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                कार्ये व अधिकार
              </h3>
              <ul className="text-sm text-slate-600 space-y-1.5">
                <li>• वार्षिक अंदाजपत्रकाला मंजुरी देणे</li>
                <li>• लाभार्थी निवडीला मंजुरी देणे</li>
                <li>• लेखापरीक्षण अहवालावर चर्चा करणे</li>
                <li>• विकास कामांच्या प्राधान्यक्रम ठरवणे</li>
                <li>• ग्रामपंचायतीच्या कामकाजाचा आढावा घेणे</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
