import { useEffect, useState } from "react";
import { publicService, type Member } from "../../../services/publicService";
import { resolveUrl } from "../../../utils/resolveUrl";
import SeoHead from "../components/SeoHead";
import SectionHero from "../components/SectionHero";
import SectionHeading from "../components/SectionHeading";
import FlipCard from "../components/FlipCard";
import { StaggerContainer, StaggerItem } from "../components/AnimatedSection";

export default function AdministrationPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicService
      .getMembers()
      .then(setMembers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const LEADER_TYPES = ["sarpanch", "upsarpanch", "grampanchayat_adhikari", "gramsevak", "leader"];
  const STAFF_TYPES = ["staff", "computer_operator", "pump_operator", "safai_kamgar", "peon", "other_staff"];

  const leaders = members.filter((m) => LEADER_TYPES.includes(m.type));
  const staff = members.filter((m) => STAFF_TYPES.includes(m.type));
  const teamMembers = members.filter((m) => m.type === "member");

  return (
    <>
      <SeoHead title="ग्रामपंचायत प्रशासन" path="/administration" />

      <SectionHero
        title="ग्रामपंचायत प्रशासन"
        subtitle="गावाच्या विकासासाठी कार्यरत असलेले पदाधिकारी व कर्मचारी"
        gradient="from-blue-700 to-indigo-600"
      />

      {loading ? (
        <div className="py-16 text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <span className="text-5xl block mb-4">👥</span>
          लोकप्रतिनिधी / पदाधिकारी / सदस्य माहिती उपलब्ध नाही
        </div>
      ) : (
        <>
          {/* Leaders */}
          {leaders.length > 0 && (
            <section className="py-16">
              <div className="max-w-7xl mx-auto px-4">
                <SectionHeading
                  badge="👥 पदाधिकारी"
                  title="लोकप्रतिनिधी / पदाधिकारी"
                  subtitle="गावाच्या विकासासाठी कार्यरत असलेले आमचे पदाधिकारी"
                  badgeColor="text-blue-600 bg-blue-50 border-blue-200"
                  align="center"
                />
                <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
                  {leaders.map((m) => (
                    <StaggerItem key={m.id} animation="scaleIn">
                    <FlipCard member={m} />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            </section>
          )}

          {/* Staff */}
          {staff.length > 0 && (
            <section className="py-16 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4">
                <SectionHeading
                  badge="🏛️ कर्मचारी"
                  title="प्रशासकीय कर्मचारी"
                  subtitle="ग्रामपंचायत कार्यालयातील कर्मचारीवर्ग"
                  badgeColor="text-indigo-600 bg-indigo-50 border-indigo-200"
                  align="center"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {staff.map((m) => (
                    <div key={m.id} className="bg-white rounded-xl shadow-sm p-5 text-center hover:shadow-md transition-shadow border border-gray-100">
                      {m.photoUrl ? (
                        <img
                          src={resolveUrl(m.photoUrl)}
                          alt={m.name}
                          className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">👤</span>
                        </div>
                      )}
                      <h3 className="font-bold text-gray-800">{m.name}</h3>
                      <p className="text-blue-600 text-sm">{m.designation}</p>
                      {m.phone && <p className="text-gray-400 text-xs mt-1">📞 {m.phone}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Team Members */}
          {teamMembers.length > 0 && (
            <section className="py-16">
              <div className="max-w-7xl mx-auto px-4">
                <SectionHeading
                  badge="🤝 सदस्य"
                  title="ग्रामपंचायत सदस्य"
                  subtitle="गावाचे निवडून आलेले प्रतिनिधी"
                  badgeColor="text-orange-600 bg-orange-50 border-orange-200"
                  align="center"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {teamMembers.map((m) => (
                    <div key={m.id} className="bg-white rounded-xl shadow-sm p-5 text-center hover:shadow-md transition-shadow border border-gray-100">
                      {m.photoUrl ? (
                        <img
                          src={resolveUrl(m.photoUrl)}
                          alt={m.name}
                          className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">👤</span>
                        </div>
                      )}
                      <h3 className="font-bold text-gray-800">{m.name}</h3>
                      <p className="text-orange-600 text-sm">{m.designation}</p>
                      {m.phone && <p className="text-gray-400 text-xs mt-1">📞 {m.phone}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
