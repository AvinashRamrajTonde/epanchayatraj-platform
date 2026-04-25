import { useEffect, useState, useMemo } from "react";
import { publicService, type Gramsabha } from "../../../services/publicService";
import { resolveUrl } from "../../../utils/resolveUrl";
import SeoHead from "../components/SeoHead";
import SectionHero from "../components/SectionHero";
import AnimatedSection, { StaggerContainer, StaggerItem } from "../components/AnimatedSection";

const STATUS_LABELS: Record<string, string> = {
  scheduled: "नियोजित",
  completed: "पूर्ण",
  cancelled: "रद्द",
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
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
      .then(setGramsabhas)
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
      <SeoHead title="ग्रामसभा" path="/gramsabha" />

      <SectionHero
        title="ग्रामसभा"
        subtitle="ग्रामपंचायतीच्या बैठकांचे तपशील, कार्यवृत्त आणि ठराव"
        gradient="from-amber-700 to-orange-600"
      />

      {/* Next Meeting Banner */}
      {nextMeeting && (
        <section className="py-8 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4">
            <AnimatedSection animation="fadeUp">
              <div className="relative overflow-hidden rounded-2xl bg-white border border-amber-200 shadow-lg p-6 md:p-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100 to-orange-100 rounded-bl-[80px] opacity-50" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="animate-pulse w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm font-semibold text-green-600 uppercase tracking-wide">
                      पुढील ग्रामसभा
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                    {nextMeeting.title}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 bg-amber-50 rounded-xl p-3">
                      <span className="text-2xl">📅</span>
                      <div>
                        <p className="text-xs text-gray-500">दिनांक</p>
                        <p className="font-semibold text-gray-800">
                          {fmtDate(nextMeeting.date)}
                        </p>
                      </div>
                    </div>
                    {nextMeeting.time && (
                      <div className="flex items-center gap-3 bg-amber-50 rounded-xl p-3">
                        <span className="text-2xl">🕐</span>
                        <div>
                          <p className="text-xs text-gray-500">वेळ</p>
                          <p className="font-semibold text-gray-800">
                            {nextMeeting.time}
                          </p>
                        </div>
                      </div>
                    )}
                    {nextMeeting.location && (
                      <div className="flex items-center gap-3 bg-amber-50 rounded-xl p-3">
                        <span className="text-2xl">📍</span>
                        <div>
                          <p className="text-xs text-gray-500">स्थळ</p>
                          <p className="font-semibold text-gray-800">
                            {nextMeeting.location}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {nextMeeting.agenda && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">कार्यसूची</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {nextMeeting.agenda}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Stats Bar */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection animation="fadeUp">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "एकूण बैठका", value: stats.total, icon: "🏛️", color: "from-amber-500 to-orange-500" },
                { label: "सरासरी उपस्थिती", value: stats.avgAttendance, icon: "👥", color: "from-blue-500 to-cyan-500" },
                { label: "एकूण ठराव", value: stats.totalDecisions, icon: "📋", color: "from-green-500 to-emerald-500" },
                { label: "महिला सहभाग", value: `${stats.womenPct}%`, icon: "👩", color: "from-pink-500 to-rose-500" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm p-5"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-5`} />
                  <div className="relative z-10 text-center">
                    <span className="text-3xl">{s.icon}</span>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{s.value}</p>
                    <p className="mt-1 text-xs text-gray-500">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Meetings List */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection animation="fadeUp">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              ग्रामसभा बैठका
            </h2>
          </AnimatedSection>

          {loading ? (
            <AnimatedSection animation="fadeUp">
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto" />
                <p className="mt-4 text-gray-500">लोड होत आहे...</p>
              </div>
            </AnimatedSection>
          ) : gramsabhas.length === 0 ? (
            <AnimatedSection animation="fadeUp">
              <div className="text-center py-12 bg-white rounded-xl border">
                <span className="text-4xl">🏛️</span>
                <p className="mt-3 text-gray-500">अद्याप कोणतीही ग्रामसभा बैठक जोडलेली नाही.</p>
              </div>
            </AnimatedSection>
          ) : (
            <StaggerContainer>
              <div className="space-y-4">
                {gramsabhas.map((g) => (
                  <StaggerItem key={g.id}>
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                      <div
                        className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() =>
                          setExpandedId(expandedId === g.id ? null : g.id)
                        }
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {g.title}
                              </h3>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  STATUS_COLORS[g.status] || ""
                                }`}
                              >
                                {STATUS_LABELS[g.status] || g.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                              <span>📅 {fmtDate(g.date)}</span>
                              {g.time && <span>🕐 {g.time}</span>}
                              {g.location && <span>📍 {g.location}</span>}
                              {g.attendeesTotal != null && (
                                <span>👥 उपस्थिती: {g.attendeesTotal}</span>
                              )}
                            </div>
                          </div>
                          <span
                            className={`text-gray-400 transition-transform ${
                              expandedId === g.id ? "rotate-180" : ""
                            }`}
                          >
                            ▼
                          </span>
                        </div>
                      </div>

                      {expandedId === g.id && (
                        <div className="border-t border-gray-100 p-5 bg-gray-50/50">
                          {g.agenda && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                                📋 कार्यसूची
                              </h4>
                              <p className="text-sm text-gray-600 whitespace-pre-line">
                                {g.agenda}
                              </p>
                            </div>
                          )}
                          {/* Attendance Breakdown */}
                          {g.attendeesTotal != null && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                👥 उपस्थिती तपशील
                              </h4>
                              <div className="flex flex-wrap gap-3">
                                <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm">
                                  एकूण: {g.attendeesTotal}
                                </span>
                                {g.attendeesMale != null && (
                                  <span className="bg-cyan-50 text-cyan-700 px-3 py-1.5 rounded-lg text-sm">
                                    पुरुष: {g.attendeesMale}
                                  </span>
                                )}
                                {g.attendeesFemale != null && (
                                  <span className="bg-pink-50 text-pink-700 px-3 py-1.5 rounded-lg text-sm">
                                    महिला: {g.attendeesFemale}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          {/* Minutes */}
                          {g.minutes && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                                📄 कार्यवृत्त
                              </h4>
                              <p className="text-sm text-gray-600 whitespace-pre-line bg-white p-3 rounded-lg border">
                                {g.minutes}
                              </p>
                            </div>
                          )}
                          {/* Decisions */}
                          {g.decisions && g.decisions.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                ✅ ठराव / निर्णय
                              </h4>
                              <ol className="space-y-1.5">
                                {g.decisions.map((d, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2 text-sm text-gray-600"
                                  >
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex-shrink-0 mt-0.5">
                                      {i + 1}
                                    </span>
                                    {d}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                          {/* Image & PDF */}
                          <div className="flex flex-wrap gap-4">
                            {g.imageUrl && (
                              <a
                                href={resolveUrl(g.imageUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="block"
                              >
                                <img
                                  src={resolveUrl(g.imageUrl)}
                                  alt={g.title}
                                  className="w-64 h-40 object-cover rounded-xl border shadow-sm hover:shadow-md transition-shadow"
                                />
                              </a>
                            )}
                            {g.pdfUrl && (
                              <a
                                href={resolveUrl(g.pdfUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2.5 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm self-start"
                              >
                                📄 कार्यवृत्त PDF डाउनलोड करा
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* Gramsabha Info Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection animation="fadeUp">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  🏛️ ग्रामसभा म्हणजे काय?
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  ग्रामसभा ही गावातील मतदार यादीतील सर्व व्यक्तींची सभा आहे.
                  महाराष्ट्र ग्रामपंचायत अधिनियम अंतर्गत ग्रामसभा भरविणे बंधनकारक आहे.
                  ग्रामसभेत गावच्या विकासाशी संबंधित सर्व महत्वाचे निर्णय घेतले जातात.
                  प्रत्येक व्यक्तीला आपले मत मांडण्याचा अधिकार ग्रामसभेत आहे.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  📋 ग्रामसभेची कार्ये व अधिकार
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">●</span>
                    वार्षिक अंदाजपत्रकाला मंजुरी देणे
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">●</span>
                    लाभार्थी निवडीला मंजुरी देणे
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">●</span>
                    लेखापरीक्षण अहवालावर चर्चा करणे
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">●</span>
                    विकास कामांच्या प्राधान्यक्रम ठरवणे
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">●</span>
                    ग्रामपंचायतीच्या कामकाजाचा आढावा घेणे
                  </li>
                </ul>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fadeUp" delay={0.2}>
            <div className="mt-8 bg-amber-50 rounded-xl border border-amber-100 p-6 text-center">
              <h3 className="text-lg font-bold text-amber-800 mb-2">
                📅 ग्रामसभा वेळापत्रक
              </h3>
              <p className="text-sm text-amber-700">
                वर्षातून किमान ४ ग्रामसभा भरविणे बंधनकारक आहे — 26 जानेवारी,
                15 ऑगस्ट, 2 ऑक्टोबर आणि एक अतिरिक्त बैठक.
                सर्व मतदारांनी ग्रामसभेला उपस्थित राहावे.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
