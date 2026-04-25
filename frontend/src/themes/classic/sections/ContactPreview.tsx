import { useState } from "react";
import { publicService } from "../../../services/publicService";
import SectionHeading from "../components/SectionHeading";
import AnimatedSection, { StaggerContainer, StaggerItem } from "../components/AnimatedSection";

interface Props {
  contact?: Record<string, unknown>;
  villageName: string;
}

export default function ContactPreview({ contact, villageName }: Props) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSubmitMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.message.trim()) {
      setSubmitMsg({ type: "error", text: "कृपया नाव आणि संदेश भरा" });
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

  const items = [
    {
      icon: "📍",
      title: "पत्ता",
      value: (contact?.address as string) || `ग्रामपंचायत कार्यालय, ${villageName}`,
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      icon: "📞",
      title: "दूरध्वनी",
      value: (contact?.phone as string) || "संपर्क उपलब्ध नाही",
      color: "bg-green-50 text-green-600 border-green-100",
    },
    {
      icon: "✉️",
      title: "ई-मेल",
      value: (contact?.email as string) || "ई-मेल उपलब्ध नाही",
      color: "bg-purple-50 text-purple-600 border-purple-100",
    },
    {
      icon: "🕐",
      title: "कार्यालयीन वेळ",
      value: (contact?.hours as string) || "सोमवार - शनिवार: सकाळी १० ते संध्या. ५",
      color: "bg-orange-50 text-orange-600 border-orange-100",
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading
          badge="📞 संपर्क"
          title="आमच्याशी संपर्क साधा"
          subtitle="आपल्या प्रश्न, सूचना व तक्रारींसाठी आम्हाला संपर्क करा"
          badgeColor="text-green-600 bg-green-50 border-green-200"
          align="center"
        />

        {/* Contact info cards */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10" staggerDelay={0.08}>
          {items.map((item) => (
            <StaggerItem key={item.title} animation="scaleIn">
              <div className={`rounded-xl p-4 sm:p-5 text-center border ${item.color} hover:-translate-y-1 transition-transform`}>
                <span className="text-2xl sm:text-3xl block mb-2">{item.icon}</span>
                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm mb-1">{item.title}</h3>
                <p className="text-gray-500 text-[11px] sm:text-sm leading-snug">{item.value}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Contact form + map side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inline Contact Form */}
          <AnimatedSection animation="fadeLeft">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                ✍️ संदेश पाठवा
              </h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    placeholder="नाव *"
                    required
                  />
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    placeholder="मोबाईल क्रमांक"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    placeholder="ईमेल (पर्यायी)"
                  />
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-500"
                  >
                    <option value="">विषय निवडा</option>
                    <option value="सामान्य चौकशी">सामान्य चौकशी</option>
                    <option value="तक्रार">तक्रार</option>
                    <option value="सूचना">सूचना</option>
                    <option value="माहिती विनंती">माहिती विनंती</option>
                  </select>
                </div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                  placeholder="तुमचा संदेश लिहा... *"
                  required
                />
                {submitMsg && (
                  <div
                    className={`px-3 py-2 rounded-lg text-sm ${
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
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-2.5 rounded-lg hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 transition-all shadow-md shadow-orange-500/20 text-sm sm:text-base"
                >
                  {submitting ? "पाठवत आहे..." : "संदेश पाठवा →"}
                </button>
              </form>
            </div>
          </AnimatedSection>

          {/* Map */}
          <AnimatedSection animation="fadeRight">
            <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm h-full min-h-[320px]">
              {contact?.mapEmbedUrl ? (
                <iframe
                  src={contact.mapEmbedUrl as string}
                  className="w-full h-full min-h-[320px]"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Village Map"
                />
              ) : (
                <div className="w-full h-full min-h-[320px] bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <span className="text-5xl block mb-2">🗺️</span>
                    <p className="text-sm">नकाशा उपलब्ध नाही</p>
                  </div>
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
