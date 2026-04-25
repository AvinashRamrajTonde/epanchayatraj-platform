import { useEffect, useState } from "react";
import { publicService } from "../../../services/publicService";

interface ContactInfo {
  address?: string;
  phone?: string;
  email?: string;
  mapEmbedUrl?: string;
  workingHours?: string;
  taluka?: string;
  district?: string;
  state?: string;
  pincode?: string;
}

export default function ContactPage() {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({});
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    publicService
      .getContentSection("contact")
      .then((d) => { if (d) setContactInfo(d as ContactInfo); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSubmitMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setSubmitMsg({ type: "error", text: "कृपया सर्व आवश्यक फील्ड भरा" });
      return;
    }
    setSubmitting(true);
    try {
      await publicService.submitContactForm(formData);
      setSubmitMsg({ type: "success", text: "तुमचा संदेश यशस्वीरित्या पाठवला गेला!" });
      setFormData({ name: "", phone: "", email: "", subject: "", message: "" });
    } catch {
      setSubmitMsg({ type: "error", text: "संदेश पाठवण्यात अडचण आली. पुन्हा प्रयत्न करा." });
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white";

  return (
    <>
      <section className="bg-gradient-to-br from-teal-700 to-indigo-800 py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white">संपर्क करा</h1>
          <p className="text-teal-200 mt-2">आपल्या प्रश्न, सूचना व तक्रारींसाठी</p>
        </div>
      </section>

      {loading ? (
        <div className="py-16 flex justify-center"><div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
          {/* Info Cards */}
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { icon: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z", title: "पत्ता", content: `${contactInfo.address || "ग्रामपंचायत कार्यालय"}${contactInfo.taluka ? `\nता. ${contactInfo.taluka}` : ""}${contactInfo.district ? `, जि. ${contactInfo.district}` : ""}${contactInfo.pincode ? `\nपिनकोड: ${contactInfo.pincode}` : ""}` },
                  { icon: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z", title: "फोन", content: contactInfo.phone || "उपलब्ध नाही", isPhone: true },
                  { icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75", title: "ईमेल", content: contactInfo.email || "उपलब्ध नाही", isEmail: true },
                  { icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z", title: "कार्यालयीन वेळ", content: contactInfo.workingHours || "सोमवार - शनिवार\nसकाळी १० ते संध्या ५" },
                ].map((c, i) => (
                  <div key={i} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-teal-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={c.icon} /></svg>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1">{c.title}</h3>
                    <p className="text-slate-500 text-sm whitespace-pre-line">{c.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Form + Map */}
          <section className="pb-16 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h2 className="text-xl font-black text-slate-800 mb-6">संदेश पाठवा</h2>
                  {submitMsg && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${submitMsg.type === "success" ? "bg-teal-50 text-teal-700 border border-teal-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                      {submitMsg.text}
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">नाव <span className="text-red-500">*</span></label>
                      <input name="name" value={formData.name} onChange={handleChange} className={inputCls} placeholder="तुमचे संपूर्ण नाव" required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">फोन <span className="text-red-500">*</span></label>
                        <input name="phone" value={formData.phone} onChange={handleChange} className={inputCls} placeholder="मोबाईल क्रमांक" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ईमेल</label>
                        <input name="email" type="email" value={formData.email} onChange={handleChange} className={inputCls} placeholder="ईमेल (पर्यायी)" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">विषय</label>
                      <select name="subject" value={formData.subject} onChange={handleChange} className={inputCls}>
                        <option value="">विषय निवडा</option>
                        <option value="complaint">तक्रार</option>
                        <option value="suggestion">सूचना</option>
                        <option value="inquiry">चौकशी</option>
                        <option value="other">इतर</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">संदेश <span className="text-red-500">*</span></label>
                      <textarea name="message" value={formData.message} onChange={handleChange} rows={4} className={inputCls} placeholder="तुमचा संदेश लिहा" required />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-60"
                    >
                      {submitting ? "पाठवत आहे..." : "संदेश पाठवा"}
                    </button>
                  </form>
                </div>
                <div className="rounded-2xl overflow-hidden border border-slate-100 min-h-[400px]">
                  {contactInfo.mapEmbedUrl ? (
                    <iframe src={contactInfo.mapEmbedUrl} className="w-full h-full min-h-[400px]" loading="lazy" title="Map" />
                  ) : (
                    <div className="w-full h-full min-h-[400px] bg-slate-100 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-12 h-12 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" /></svg>
                        <p className="text-slate-400 text-sm">नकाशा उपलब्ध नाही</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
