import { useEffect, useState } from "react";
import { publicService } from "../../../services/publicService";
import { useTenant } from "../../../context/TenantContext";
import { resolveUrl } from "../../../utils/resolveUrl";

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
      .then(([a, v]) => { setAbout(a || {}); setVision(v || {}); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const villageName = village?.name || "गाव";
  const description1 = about?.description1 ? String(about.description1) : "";
  const isHtml = /<[a-z][\s\S]*>/i.test(description1);
  const history = about?.history ? String(about.history) : "";
  const images = (about?.images as string[]) || [];
  const singleImage = (about?.image as string) || "";
  const allImages = images.length > 0 ? images.slice(0, 3) : singleImage ? [singleImage] : [];

  const quickInfo = [
    about?.population && { label: "लोकसंख्या", value: String(about.population) },
    about?.area && { label: "क्षेत्रफळ", value: `${about.area} चौ. किमी` },
    about?.pincode && { label: "पिनकोड", value: String(about.pincode) },
    about?.established && { label: "स्थापना", value: String(about.established) },
    about?.nearestCity && { label: "जवळचे शहर", value: String(about.nearestCity) },
    about?.nearestRailwayStation && { label: "जवळचे रेल्वे स्टेशन", value: String(about.nearestRailwayStation) },
    about?.nearestAirport && { label: "जवळचे विमानतळ", value: String(about.nearestAirport) },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-700 to-indigo-800 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="inline-block text-teal-200 text-sm font-semibold tracking-wide uppercase mb-2">आमच्याबद्दल</span>
          <h1 className="text-3xl md:text-5xl font-black text-white">{(about.title as string) || `${villageName} बद्दल`}</h1>
          <p className="text-teal-200 mt-3 max-w-xl mx-auto">ग्रामपंचायतीच्या विकासाची वाटचाल</p>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              {description1 ? (
                isHtml ? (
                  <div
                    className="prose prose-slate max-w-none [&_a]:text-teal-600"
                    style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
                    dangerouslySetInnerHTML={{ __html: description1 }}
                  />
                ) : (
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{description1}</p>
                )
              ) : (
                <p className="text-slate-500">गावाबद्दल माहिती उपलब्ध नाही.</p>
              )}
            </div>
            <div>
              {allImages.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {allImages.map((img, i) => (
                    <div key={i} className={`rounded-xl overflow-hidden ${i === 0 && allImages.length > 1 ? "col-span-2 h-56" : "h-40"}`}>
                      <img src={resolveUrl(img)} alt={`${villageName} ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info */}
      {quickInfo.length > 0 && (
        <section className="py-12 bg-slate-50">
          <div className="max-w-5xl mx-auto px-4">
            <div className={`grid grid-cols-2 ${quickInfo.length >= 4 ? "md:grid-cols-4" : quickInfo.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"} gap-5`}>
              {quickInfo.map((info, i) => (
                <div key={i} className="bg-white rounded-xl p-5 border border-slate-100 text-center shadow-sm">
                  <p className="text-sm text-slate-400 mb-1">{info.label}</p>
                  <p className="text-xl font-bold text-teal-700">{info.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* History */}
      {history && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-black text-slate-800 mb-6 text-center">गावाचा इतिहास</h2>
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{history}</p>
            </div>
          </div>
        </section>
      )}

      {/* Vision & Mission */}
      {(vision.vision || vision.mission) && (
        <section className="py-16 bg-gradient-to-br from-teal-50 to-indigo-50">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-black text-slate-800 mb-10 text-center">आमची दृष्टी आणि ध्येय</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {!!vision.vision && (
                <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-teal-700 mb-3">दृष्टी (Vision)</h3>
                  <p className="text-slate-600 leading-relaxed">{String(vision.vision)}</p>
                </div>
              )}
              {!!vision.mission && (
                <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-indigo-700 mb-3">ध्येय (Mission)</h3>
                  <p className="text-slate-600 leading-relaxed">{String(vision.mission)}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Roles & Responsibilities Table */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-teal-600 bg-teal-50 border border-teal-200 rounded-full px-3 py-1 mb-3">⚖️ अधिकार व जबाबदाऱ्या</span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800">ग्रामपंचायत पदनिहाय अधिकार व जबाबदाऱ्या</h2>
            <p className="text-slate-500 mt-2">एकत्रित तक्ता</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-teal-700 text-white">
                  <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">अ.क्र.</th>
                  <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">पदनाम</th>
                  <th className="px-4 py-3 text-left font-semibold">आर्थिक / प्रशासकीय अधिकार व जबाबदाऱ्या</th>
                  <th className="px-4 py-3 text-left font-semibold">कायदा / नियम / शासन निर्णय</th>
                  <th className="px-4 py-3 text-left font-semibold">अभिप्राय</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
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
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-teal-50/40"}>
                    <td className="px-4 py-4 text-center font-bold text-teal-700">{row.no}</td>
                    <td className="px-4 py-4 font-semibold text-slate-800 whitespace-nowrap align-top">{row.title}</td>
                    <td className="px-4 py-4 text-slate-600 align-top">
                      <ul className="list-disc list-inside space-y-1">
                        {row.duties.map((d, j) => <li key={j}>{d}</li>)}
                      </ul>
                    </td>
                    <td className="px-4 py-4 text-slate-600 text-xs align-top">{row.law}</td>
                    <td className="px-4 py-4 text-slate-500 text-xs italic align-top">{row.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
