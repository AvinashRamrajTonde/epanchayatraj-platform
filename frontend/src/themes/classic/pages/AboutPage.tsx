import { useEffect, useState } from "react";
import { publicService } from "../../../services/publicService";
import { useTenant } from "../../../context/TenantContext";
import SeoHead from "../components/SeoHead";
import SectionHero from "../components/SectionHero";
import SectionHeading from "../components/SectionHeading";
import AnimatedSection, { StaggerContainer, StaggerItem } from "../components/AnimatedSection";
import { ImageCollage } from "../sections/AboutSection";

export default function AboutPage() {
  const { village } = useTenant();
  const [about, setAbout] = useState<Record<string, unknown>>({});
  const [vision, setVision] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      publicService.getContentSection("about"),
      publicService.getContentSection("vision_mission"),
    ])
      .then(([a, v]) => {
        setAbout(a || {});
        setVision(v || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const villageName = village?.name || "गाव";

  // About meta
  const population = about?.population ? String(about.population) : "";
  const area = about?.area ? String(about.area) : "";
  const pincode = about?.pincode ? String(about.pincode) : "";
  const established = about?.established ? String(about.established) : "";
  const history = about?.history ? String(about.history) : "";
  const nearestCity = about?.nearestCity ? String(about.nearestCity) : "";
  const nearestRailwayStation = about?.nearestRailwayStation ? String(about.nearestRailwayStation) : "";
  const nearestAirport = about?.nearestAirport ? String(about.nearestAirport) : "";
  const description1 = about?.description1 ? String(about.description1) : "";
  const isHtml = /<[a-z][\s\S]*>/i.test(description1);

  const quickInfo = [
    population && { icon: "👥", label: "लोकसंख्या", value: population },
    area && { icon: "📐", label: "क्षेत्रफळ", value: `${area} चौ. किमी` },
    pincode && { icon: "📮", label: "पिनकोड", value: pincode },
    established && { icon: "📅", label: "स्थापना", value: established },
    nearestCity && { icon: "🏙️", label: "जवळचे शहर", value: nearestCity },
    nearestRailwayStation && { icon: "🚂", label: "जवळचे रेल्वे स्टेशन", value: nearestRailwayStation },
    nearestAirport && { icon: "✈️", label: "जवळचे विमानतळ", value: nearestAirport },
  ].filter(Boolean) as { icon: string; label: string; value: string }[];

  // Resolve images for collage
  const images = (about?.images as string[]) || [];
  const singleImage = (about?.image as string) || "";
  const allImages = images.length > 0 ? images.slice(0, 3) : singleImage ? [singleImage] : [];

  return (
    <>
      <SeoHead title="आमच्याबद्दल" path="/about" />

      <SectionHero
        title="आमच्याबद्दल"
        subtitle="ग्रामपंचायतीच्या विकासाची वाटचाल"
        gradient="from-blue-600 to-blue-500"
      />

      {/* About Content with Image Collage */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <AnimatedSection animation="fadeLeft" duration={0.7}>
              <div>
                <SectionHeading
                  badge="🏘️ आमच्याबद्दल"
                  title={(about.title as string) || `${villageName} बद्दल`}
                  subtitle=""
                  badgeColor="text-orange-600 bg-orange-50 border-orange-200"
                  align="left"
                />
                {description1 ? (
                  isHtml ? (
                    <div
                      className="prose prose-sm sm:prose-base prose-gray max-w-none mb-4 break-words [&_p]:text-gray-600 [&_p]:leading-relaxed [&_p]:break-words [&_p]:whitespace-pre-wrap [&_a]:text-orange-600 [&_a]:underline"
                      style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
                      dangerouslySetInnerHTML={{ __html: description1 }}
                    />
                  ) : (
                    <p className="text-gray-600 leading-relaxed mb-4 text-sm sm:text-base break-words whitespace-pre-wrap">{description1}</p>
                  )
                ) : null}
              </div>
            </AnimatedSection>
            <AnimatedSection animation="fadeRight" duration={0.7} delay={0.15}>
              <div className="relative">
                <ImageCollage images={allImages} villageName={villageName} />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Quick Info Cards */}
      {quickInfo.length > 0 && (
        <section className="py-10 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4">
            <StaggerContainer className={`grid grid-cols-2 ${quickInfo.length >= 4 ? 'md:grid-cols-4' : quickInfo.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`} staggerDelay={0.08}>
              {quickInfo.map((info, i) => (
                <StaggerItem key={i}>
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                    <span className="text-3xl block mb-2">{info.icon}</span>
                    <p className="text-xs text-gray-500 mb-1">{info.label}</p>
                    <p className="text-lg font-bold text-gray-800">{info.value}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* History */}
      {history && (
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <AnimatedSection animation="fadeUp">
              <SectionHeading
                badge="📜 इतिहास"
                title="गावाचा इतिहास"
                subtitle=""
                badgeColor="text-amber-700 bg-amber-50 border-amber-200"
                align="center"
              />
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{history}</p>
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Vision & Mission */}
      {(vision.vision || vision.mission) && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4">
            <SectionHeading
              badge="🎯 दृष्टी आणि ध्येय"
              title="आमची दृष्टी आणि ध्येय"
              subtitle="गावाच्या सर्वांगीण विकासासाठी आमची प्रतिबद्धता"
              badgeColor="text-blue-600 bg-blue-50 border-blue-200"
              align="center"
            />
            <div className="grid md:grid-cols-2 gap-8">
              {vision.vision ? (
                <AnimatedSection animation="fadeLeft">
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                      <span className="text-2xl">🔭</span>
                    </div>
                    <h3 className="text-xl font-bold text-blue-600 mb-4">दृष्टी (Vision)</h3>
                    <p className="text-gray-600 leading-relaxed">{String(vision.vision)}</p>
                  </div>
                </AnimatedSection>
              ) : null}
              {vision.mission ? (
                <AnimatedSection animation="fadeRight">
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full">
                    <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-5">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h3 className="text-xl font-bold text-green-600 mb-4">ध्येय (Mission)</h3>
                    <p className="text-gray-600 leading-relaxed">{String(vision.mission)}</p>
                  </div>
                </AnimatedSection>
              ) : null}
            </div>
          </div>
        </section>
      )}

      {/* Roles & Responsibilities Table */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection animation="fadeUp">
            <SectionHeading
              badge="⚖️ अधिकार व जबाबदाऱ्या"
              title="ग्रामपंचायत पदनिहाय अधिकार व जबाबदाऱ्या"
              subtitle="एकत्रित तक्ता"
              badgeColor="text-orange-600 bg-orange-50 border-orange-200"
              align="center"
            />
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-orange-600 text-white">
                    <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">अ.क्र.</th>
                    <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">पदनाम</th>
                    <th className="px-4 py-3 text-left font-semibold">आर्थिक / प्रशासकीय अधिकार व जबाबदाऱ्या</th>
                    <th className="px-4 py-3 text-left font-semibold">कायदा / नियम / शासन निर्णय</th>
                    <th className="px-4 py-3 text-left font-semibold">अभिप्राय</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    {
                      no: 1,
                      title: "सरपंच",
                      duties: ["बैठकींचे अध्यक्षस्थान भूषवणे","ठराव मंजूर व अंमलबजावणी सुनिश्चित करणे","निधीचा पारदर्शक वापर","शासन योजना प्रसारित करणे","मूलभूत सुविधा विषयक निर्णय घेणे","ग्रामसभेत समस्या सोडवणे","अधिकारी व सदस्यांशी समन्वय ठेवणे"],
                      law: "महाराष्ट्र ग्रामपंचायत अधिनियम 1958 व संबंधित नियम",
                      remarks: "ग्रामपंचायतीचा प्रमुख म्हणून नेतृत्व व विकास साधणे",
                    },
                    {
                      no: 2,
                      title: "उपसरपंच",
                      duties: ["सरपंच अनुपस्थितीत बैठकींचे अध्यक्षस्थान","ठराव व योजनांच्या अंमलबजावणीत सहकार्य","समित्यांवर सदस्य म्हणून कार्य","ग्रामस्थांच्या समस्या सोडवणे","सरपंचास सहाय्य करणे","समन्वय राखणे","निधी व नोंदींची देखरेख"],
                      law: "महाराष्ट्र ग्रामपंचायत अधिनियम 1958 व संबंधित नियम",
                      remarks: "सरपंचाचा सहाय्यक म्हणून कार्यक्षम कामकाज सुनिश्चित करणे",
                    },
                    {
                      no: 3,
                      title: "ग्रामविकास अधिकारी",
                      duties: ["विकासकामांची माहिती देणे","कायदे व नियमांनुसार मार्गदर्शन करणे","मालमत्ता कर आकारणी करणे","कलम 61 अंतर्गत कर्मचाऱ्यांवर नियंत्रण ठेवणे","जि.प. व पं.स. ला धोरणात्मक शिफारसी करणे","शासन निर्णयांची अंमलबजावणी करणे","ग्रामपंचायत अधिनियम अंतर्गत कार्यवाही करणे"],
                      law: "महाराष्ट्र ग्रामपंचायत अधिनियम 1958 व संबंधित शासन निर्णय / परिपत्रके",
                      remarks: "शासन आदेशांचे पालन करून कामकाज करणे",
                    },
                    {
                      no: 4,
                      title: "संगणक परिचालक",
                      duties: ["सर्व संगणकीय नोंदी व अहवाल तयार व संग्रहित करणे","ई-पंचायत, कर वसुली, जनगणना डेटा एंट्री","संकेतस्थळ अद्ययावत ठेवणे","शासकीय फॉर्म व अहवाल तयार करणे","संगणक व नेटवर्क देखभाल","डेटा बॅकअप व सुरक्षितता","ऑनलाइन सेवा देण्यात सहाय्य","MIS व पोर्टलवर डेटा सादर करणे"],
                      law: "शासनाचे आयटी व ई-गव्हर्नन्स संदर्भातील नियम व परिपत्रके",
                      remarks: "डिजिटल प्रणालीद्वारे कामकाज सुलभ व पारदर्शक ठेवणे",
                    },
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-orange-50/40"}>
                      <td className="px-4 py-4 text-center font-bold text-orange-600">{row.no}</td>
                      <td className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap align-top">{row.title}</td>
                      <td className="px-4 py-4 text-gray-600 align-top">
                        <ul className="list-disc list-inside space-y-1">
                          {row.duties.map((d, j) => <li key={j}>{d}</li>)}
                        </ul>
                      </td>
                      <td className="px-4 py-4 text-gray-600 text-xs align-top">{row.law}</td>
                      <td className="px-4 py-4 text-gray-500 text-xs italic align-top">{row.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
