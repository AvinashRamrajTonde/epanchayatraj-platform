import { useEffect, useState } from "react";
import { publicService } from "../../../services/publicService";
import SeoHead from "../components/SeoHead";
import SectionHero from "../components/SectionHero";
import AnimatedSection, { StaggerContainer, StaggerItem } from "../components/AnimatedSection";

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
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    publicService
      .getContentSection("contact")
      .then((data) => {
        if (data) setContactInfo(data as ContactInfo);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSubmitMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setSubmitMsg({ type: "error", text: "कृपया सर्व आवश्यक (*) फील्ड भरा" });
      return;
    }
    setSubmitting(true);
    try {
      await publicService.submitContactForm(formData);
      setSubmitMsg({ type: "success", text: "तुमचा संदेश यशस्वीरित्या पाठवला गेला!" });
      setFormData({ name: "", phone: "", email: "", subject: "", message: "" });
    } catch {
      setSubmitMsg({ type: "error", text: "संदेश पाठवण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SeoHead
        title="संपर्क"
        description="ग्रामपंचायतीशी संपर्क साधा - पत्ता, फोन, ईमेल"
        path="/contact"
      />

      <SectionHero
        title="संपर्क करा"
        subtitle="आपल्या प्रश्न, सूचना व तक्रारींसाठी आम्हाला संपर्क करा"
        gradient="from-green-700 to-emerald-600"
      />

      {loading ? (
        <div className="py-16 text-center">
          <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <>
          {/* Contact Info Cards */}
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4">
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StaggerItem className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center hover:-translate-y-1 transition-transform">
                  <span className="text-3xl block mb-3">📍</span>
                  <h3 className="font-bold text-gray-800 mb-1">पत्ता</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {contactInfo.address || "ग्रामपंचायत कार्यालय"}
                    {contactInfo.taluka && <><br />ता. {contactInfo.taluka}</>}
                    {contactInfo.district && <>, जि. {contactInfo.district}</>}
                    {contactInfo.pincode && <><br />पिनकोड: {contactInfo.pincode}</>}
                  </p>
                </StaggerItem>
                <StaggerItem className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center hover:-translate-y-1 transition-transform">
                  <span className="text-3xl block mb-3">📞</span>
                  <h3 className="font-bold text-gray-800 mb-1">फोन</h3>
                  <p className="text-gray-500 text-sm">
                    {contactInfo.phone ? (
                      <a href={`tel:${contactInfo.phone}`} className="hover:text-green-600">
                        {contactInfo.phone}
                      </a>
                    ) : (
                      "उपलब्ध नाही"
                    )}
                  </p>
                </StaggerItem>
                <StaggerItem className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center hover:-translate-y-1 transition-transform">
                  <span className="text-3xl block mb-3">✉️</span>
                  <h3 className="font-bold text-gray-800 mb-1">ईमेल</h3>
                  <p className="text-gray-500 text-sm break-all">
                    {contactInfo.email ? (
                      <a href={`mailto:${contactInfo.email}`} className="hover:text-green-600">
                        {contactInfo.email}
                      </a>
                    ) : (
                      "उपलब्ध नाही"
                    )}
                  </p>
                </StaggerItem>
                <StaggerItem className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center hover:-translate-y-1 transition-transform">
                  <span className="text-3xl block mb-3">🕐</span>
                  <h3 className="font-bold text-gray-800 mb-1">कार्यालयीन वेळ</h3>
                  <p className="text-gray-500 text-sm">
                    {contactInfo.workingHours || "सोमवार - शनिवार\nसकाळी १० ते संध्या ५"}
                  </p>
                </StaggerItem>
              </StaggerContainer>
            </div>
          </section>

          {/* Form + Map */}
          <section className="pb-16">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Contact Form */}
                <AnimatedSection animation="fadeLeft" className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">
                    संदेश पाठवा
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        नाव <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        placeholder="तुमचे संपूर्ण नाव"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          फोन <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                          placeholder="मोबाईल क्रमांक"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ईमेल
                        </label>
                        <input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                          placeholder="ईमेल (पर्यायी)"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        विषय
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      >
                        <option value="">विषय निवडा</option>
                        <option value="सामान्य चौकशी">सामान्य चौकशी</option>
                        <option value="तक्रार">तक्रार</option>
                        <option value="सूचना">सूचना</option>
                        <option value="माहिती विनंती">माहिती विनंती</option>
                        <option value="इतर">इतर</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        संदेश <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                        placeholder="तुमचा संदेश लिहा..."
                        required
                      />
                    </div>

                    {submitMsg && (
                      <div
                        className={`px-4 py-2.5 rounded-lg text-sm ${
                          submitMsg.type === "success"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {submitMsg.text}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-green-600 text-white font-semibold py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {submitting ? "पाठवत आहे..." : "संदेश पाठवा"}
                    </button>
                  </form>
                </AnimatedSection>

                {/* Map */}
                <AnimatedSection animation="fadeRight" className="rounded-xl overflow-hidden border border-gray-100 shadow-sm min-h-[400px]">
                  {contactInfo.mapEmbedUrl ? (
                    <iframe
                      src={contactInfo.mapEmbedUrl}
                      className="w-full h-full min-h-[400px]"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="ग्रामपंचायत स्थान"
                    />
                  ) : (
                    <div className="w-full h-full min-h-[400px] bg-gray-100 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <span className="text-5xl block mb-2">🗺️</span>
                        <p>नकाशा उपलब्ध नाही</p>
                      </div>
                    </div>
                  )}
                </AnimatedSection>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
