import { useState, useRef } from "react";
import { publicService } from "../../../services/publicService";
import SeoHead from "../components/SeoHead";
import SectionHero from "../components/SectionHero";
import AnimatedSection from "../components/AnimatedSection";
import api from "../../../services/api";

const CATEGORIES = [
  { value: "road", label: "रस्ता / दुरुस्ती" },
  { value: "water", label: "पाणी पुरवठा" },
  { value: "electricity", label: "वीज / दिवाबत्ती" },
  { value: "sanitation", label: "स्वच्छता / कचरा" },
  { value: "corruption", label: "भ्रष्टाचार" },
  { value: "other", label: "इतर" },
];

export default function ComplaintPage() {
  const [form, setForm] = useState({
    name: "",
    contact: "",
    category: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setResult(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.contact.trim() || !form.category || !form.description.trim()) {
      setResult({ type: "error", text: "कृपया सर्व आवश्यक (*) माहिती भरा." });
      return;
    }

    setSubmitting(true);
    let imageUrl: string | undefined;

    try {
      // Upload image first if selected
      if (imageFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("image", imageFile);
        const res = await api.post("/api/public/upload/complaint", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = res.data?.data?.url;
        setUploading(false);
      }

      await publicService.submitComplaint({ ...form, imageUrl });
      setResult({ type: "success", text: "तुमची तक्रार यशस्वीरित्या नोंदवली गेली! ग्रामपंचायत लवकरच कार्यवाही करेल." });
      setForm({ name: "", contact: "", category: "", description: "" });
      removeImage();
    } catch {
      setResult({ type: "error", text: "तक्रार नोंदवताना अडचण आली. कृपया पुन्हा प्रयत्न करा." });
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <>
      <SeoHead title="तक्रार नोंदवा" description="ग्रामपंचायतीकडे तुमची तक्रार नोंदवा" path="/complaint" />

      <SectionHero
        title="तक्रार नोंदवा"
        subtitle="ग्रामपंचायत क्षेत्रातील समस्यांसाठी तुमची तक्रार येथे नोंदवा"
        gradient="from-red-700 to-orange-600"
      />

      <section className="py-14">
        <div className="max-w-3xl mx-auto px-4">
          {/* Info Banner */}
          <AnimatedSection animation="fadeUp" className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8 flex gap-3">
            <span className="text-2xl shrink-0">ℹ️</span>
            <div className="text-sm text-orange-800">
              <p className="font-semibold mb-1">तक्रार नोंदणी प्रक्रिया</p>
              <p>खालील फॉर्म भरून तुमची तक्रार नोंदवा. ग्रामपंचायत प्रशासन तुमच्या तक्रारीची दखल घेईल आणि लवकरात लवकर कार्यवाही करेल.</p>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fadeUp" delay={0.1} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">तक्रार फॉर्म</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name + Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    नाव <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none"
                    placeholder="तुमचे संपूर्ण नाव"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    संपर्क क्रमांक <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="contact"
                    value={form.contact}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none"
                    placeholder="मोबाईल / फोन क्रमांक"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  तक्रारीचा प्रकार <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none bg-white"
                >
                  <option value="">— प्रकार निवडा —</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  तक्रारीचे वर्णन <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none resize-none"
                  placeholder="समस्येचे सविस्तर वर्णन लिहा — ठिकाण, स्वरूप, किती दिवसांपासून आहे इ."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  फोटो पुरावा (पर्यायी)
                </label>
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="preview" className="h-36 w-auto rounded-lg border border-gray-200 object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-red-400 hover:bg-red-50 transition-colors">
                    <span className="text-3xl mb-2">📷</span>
                    <span className="text-sm text-gray-500">समस्येचा फोटो अपलोड करा</span>
                    <span className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP — जास्तीत जास्त 5MB</span>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Feedback */}
              {result && (
                <div className={`px-4 py-3 rounded-lg text-sm ${
                  result.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {result.text}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || uploading}
                className="w-full bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
              >
                {uploading ? "फोटो अपलोड होत आहे..." : submitting ? "तक्रार नोंदवत आहे..." : "तक्रार सादर करा"}
              </button>
            </form>
          </AnimatedSection>

          {/* Steps */}
          <AnimatedSection animation="fadeUp" delay={0.2} className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: "📝", step: "१", title: "फॉर्म भरा", desc: "नाव, संपर्क, प्रकार व वर्णन भरून फॉर्म सादर करा." },
              { icon: "📨", step: "२", title: "नोंद होते", desc: "तुमची तक्रार ग्रामपंचायत प्रशासनाकडे पोहोचते." },
              { icon: "✅", step: "३", title: "कार्यवाही", desc: "प्रशासन तुमच्या समस्येवर कार्यवाही करून प्रतिसाद देते." },
            ].map((s) => (
              <div key={s.step} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
                <span className="text-3xl block mb-2">{s.icon}</span>
                <div className="text-xs font-bold text-red-600 mb-1">पायरी {s.step}</div>
                <div className="font-semibold text-gray-800 text-sm mb-1">{s.title}</div>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </div>
            ))}
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
