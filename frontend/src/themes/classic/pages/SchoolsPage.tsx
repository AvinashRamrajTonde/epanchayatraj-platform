import { useEffect, useState } from "react";
import { publicService, type School } from "../../../services/publicService";
import { resolveUrl } from "../../../utils/resolveUrl";
import SeoHead from "../components/SeoHead";
import SectionHero from "../components/SectionHero";
import AnimatedSection, { StaggerContainer, StaggerItem } from "../components/AnimatedSection";

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
      .then(setSchools)
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
      <SeoHead title="शाळा" path="/schools" />

      <SectionHero
        title="शाळा"
        subtitle="गावातील शैक्षणिक संस्थांची माहिती"
        gradient="from-blue-700 to-cyan-600"
      />

      {/* Stats */}
      {!loading && schools.length > 0 && (
        <section className="py-8 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="max-w-7xl mx-auto px-4">
            <AnimatedSection animation="fadeUp">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "एकूण शाळा", value: schools.length, icon: "🏫", color: "from-blue-500 to-cyan-500" },
                  { label: "एकूण विद्यार्थी", value: totalStudents, icon: "👨‍🎓", color: "from-green-500 to-emerald-500" },
                  { label: "एकूण शिक्षक", value: totalTeachers, icon: "👩‍🏫", color: "from-purple-500 to-violet-500" },
                  {
                    label: "विद्यार्थी-शिक्षक गुणोत्तर",
                    value: totalTeachers > 0 ? `${Math.round(totalStudents / totalTeachers)}:1` : "-",
                    icon: "📊",
                    color: "from-amber-500 to-orange-500",
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="relative overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm p-5"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-5`}
                    />
                    <div className="relative z-10 text-center">
                      <span className="text-3xl">{s.icon}</span>
                      <p className="mt-2 text-2xl font-bold text-gray-900">
                        {s.value}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Schools List */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection animation="fadeUp">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              गावातील शाळा
            </h2>
          </AnimatedSection>

          {loading ? (
            <AnimatedSection animation="fadeUp">
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
                <p className="mt-4 text-gray-500">लोड होत आहे...</p>
              </div>
            </AnimatedSection>
          ) : schools.length === 0 ? (
            <AnimatedSection animation="fadeUp">
              <div className="text-center py-12 bg-white rounded-xl border">
                <span className="text-4xl">🏫</span>
                <p className="mt-3 text-gray-500">
                  अद्याप शाळांची माहिती जोडलेली नाही.
                </p>
              </div>
            </AnimatedSection>
          ) : (
            <StaggerContainer>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {schools.map((s) => (
                  <StaggerItem key={s.id}>
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      {/* School Photo */}
                      {s.schoolPhoto ? (
                        <div className="h-44 overflow-hidden">
                          <img
                            src={resolveUrl(s.schoolPhoto)}
                            alt={s.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-44 bg-gradient-to-br from-blue-100 to-cyan-50 flex items-center justify-center">
                          <span className="text-6xl opacity-40">🏫</span>
                        </div>
                      )}

                      <div className="p-5">
                        {/* Header */}
                        <div className="flex items-start gap-3 mb-3">
                          {s.principalPhoto ? (
                            <img
                              src={resolveUrl(s.principalPhoto)}
                              alt={s.principalName || ""}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-xl">👤</span>
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {s.name}
                            </h3>
                            {s.principalName && (
                              <p className="text-sm text-gray-500">
                                मुख्याध्यापक: {s.principalName}
                              </p>
                            )}
                          </div>
                        </div>

                        {s.address && (
                          <p className="text-sm text-gray-500 mb-3">
                            📍 {s.address}
                          </p>
                        )}

                        {/* Counts Grid */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="bg-blue-50 rounded-lg p-2 text-center">
                            <p className="text-lg font-bold text-blue-700">
                              {s.boysCount}
                            </p>
                            <p className="text-[10px] text-blue-600">मुले</p>
                          </div>
                          <div className="bg-pink-50 rounded-lg p-2 text-center">
                            <p className="text-lg font-bold text-pink-700">
                              {s.girlsCount}
                            </p>
                            <p className="text-[10px] text-pink-600">मुली</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-2 text-center">
                            <p className="text-lg font-bold text-green-700">
                              {s.teachersCount}
                            </p>
                            <p className="text-[10px] text-green-600">शिक्षक</p>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 text-xs">
                          {s.managementType && (
                            <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-medium">
                              {MANAGEMENT_LABELS[s.managementType] || s.managementType}
                            </span>
                          )}
                          {s.medium && (
                            <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full font-medium">
                              माध्यम: {MEDIUM_LABELS[s.medium] || s.medium}
                            </span>
                          )}
                          {s.establishedYear && (
                            <span className="bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                              स्थापना: {s.establishedYear}
                            </span>
                          )}
                        </div>

                        {/* Contact */}
                        {(s.phone || s.email) && (
                          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-3 text-xs text-gray-500">
                            {s.phone && <span>📞 {s.phone}</span>}
                            {s.email && <span>✉️ {s.email}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
          )}
        </div>
      </section>
    </>
  );
}
