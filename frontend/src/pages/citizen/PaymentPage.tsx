import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { citizenService, type CertificateApplication, type PaymentConfig } from "../../services/citizenService";
import { useTenant } from "../../context/TenantContext";
import { motion, AnimatePresence } from "framer-motion";
import { compressImage, COMPRESS_PRESETS } from "../../utils/imageCompression";

export default function PaymentPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { village } = useTenant();

  const [application, setApplication] = useState<CertificateApplication | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [utrNumber, setUtrNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");

  // Screenshot upload
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState("");
  const screenshotRef = useRef<HTMLInputElement>(null);

  const [compressingScreenshot, setCompressingScreenshot] = useState(false);
  const [screenshotSizeInfo, setScreenshotSizeInfo] = useState<{ original: number; compressed: number } | null>(null);

  const handleScreenshotChange = async (file: File | null) => {
    if (file) {
      setCompressingScreenshot(true);
      const originalSize = file.size;
      const compressed = await compressImage(file, COMPRESS_PRESETS.screenshot);
      setScreenshotFile(compressed);
      setScreenshotSizeInfo({ original: originalSize, compressed: compressed.size });
      const reader = new FileReader();
      reader.onload = (e) => setScreenshotPreview(e.target?.result as string);
      reader.readAsDataURL(compressed);
      setCompressingScreenshot(false);
    } else {
      setScreenshotFile(null);
      setScreenshotPreview("");
      setScreenshotSizeInfo(null);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [appRes, cfgRes] = await Promise.all([
          citizenService.getApplicationDetail(applicationId!),
          village ? citizenService.getPaymentConfig(village.id) : Promise.resolve({ data: null }),
        ]);
        setApplication(appRes.data);
        setPaymentConfig(cfgRes.data);
      } catch {
        setError("माहिती लोड करता आली नाही");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [applicationId, village]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationId) return;
    setSubmitting(true);
    setError("");
    try {
      // Upload screenshot if provided
      let screenshotUrl: string | undefined;
      if (screenshotFile) {
        const uploadRes = await citizenService.uploadImages("payment-screenshot", [screenshotFile]);
        const images = uploadRes.data?.images || [];
        if (images.length > 0) screenshotUrl = images[0].url;
      }

      await citizenService.submitPayment(applicationId, {
        utrNumber,
        paymentMethod,
        screenshotUrl,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || "पेमेंट सबमिट अयशस्वी");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded-xl w-1/3" />
        <div className="h-48 bg-gray-100 rounded-2xl" />
        <div className="h-36 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl shadow-emerald-500/30"
        >
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </motion.div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">पेमेंट माहिती सबमिट झाली!</h2>
        <p className="text-sm text-gray-400 mb-6">तुमची UTR / संदर्भ क्रमांक तपासणीसाठी सादर करण्यात आली आहे. प्रशासन पडताळणी करेल.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(`/citizen/applications/${applicationId}`)} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-orange-500/25">
            अर्ज पहा
          </button>
          <button onClick={() => navigate("/citizen/applications")} className="border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50">
            सर्व अर्ज
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">पेमेंट करा</h1>
          <p className="text-sm text-gray-400">अर्ज: {application?.applicationNo}</p>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Amount Card */}
      <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white mb-5 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/10 rounded-full blur-xl" />
        <div className="relative">
          <p className="text-violet-200 text-sm">भरावयाची रक्कम</p>
          <p className="text-3xl font-extrabold mt-1">₹{application?.certificateType?.fee || 0}/-</p>
          <p className="text-violet-200 text-xs mt-2">{application?.certificateType?.nameMarathi}</p>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-5">
        <div className="px-5 py-4 border-b">
          <h3 className="font-bold text-gray-900 text-sm">पेमेंट पद्धत</h3>
        </div>
        <div className="p-5 grid grid-cols-2 gap-3">
          {([
            { key: "upi", label: "UPI / PhonePe / GPay", icon: "📱" },
            { key: "bank", label: "बँक ट्रान्सफर", icon: "🏦" },
          ] as const).map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setPaymentMethod(m.key)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                paymentMethod === m.key
                  ? "border-violet-400 bg-violet-50 shadow-md shadow-violet-500/10"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <span className="text-2xl block mb-1">{m.icon}</span>
              <span className="text-sm font-semibold text-gray-800">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-5">
        <div className="px-5 py-4 border-b">
          <h3 className="font-bold text-gray-900 text-sm">
            {paymentMethod === "upi" ? "UPI माहिती" : "बँक तपशील"}
          </h3>
        </div>
        <div className="p-5 space-y-3">
          {paymentMethod === "upi" && paymentConfig?.upiId && (
            <div className="bg-violet-50 rounded-xl px-4 py-3">
              <p className="text-xs text-violet-500 font-medium">UPI ID</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="font-bold text-violet-800 text-lg">{paymentConfig.upiId}</p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(paymentConfig.upiId as string);
                    alert("UPI ID कॉपी झाले!");
                  }}
                  className="inline-flex items-center gap-1 bg-violet-200 hover:bg-violet-300 text-violet-800 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
                >
                  📋 कॉपी करा
                </button>
              </div>
            </div>
          )}
          {paymentMethod === "upi" && paymentConfig?.qrCodeUrl && (
            <div className="flex justify-center">
              <img src={paymentConfig.qrCodeUrl} alt="QR Code" className="w-48 h-48 rounded-xl border border-gray-200" />
            </div>
          )}
          {paymentMethod === "bank" && paymentConfig && (
            <div className="space-y-2">
              {[
                { label: "बँक नाव", value: paymentConfig.bankName },
                { label: "खाते क्रमांक", value: paymentConfig.accountNo },
                { label: "IFSC कोड", value: paymentConfig.ifscCode },
                { label: "खातेधारक", value: paymentConfig.accountHolder },
              ].filter(d => d.value).map((d) => (
                <div key={d.label} className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between">
                  <span className="text-xs text-gray-500">{d.label}</span>
                  <span className="font-semibold text-gray-800 text-sm">{d.value}</span>
                </div>
              ))}
            </div>
          )}
          {paymentConfig?.instructions && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700">
              <strong>सूचना:</strong> {paymentConfig.instructions}
            </div>
          )}
          {!paymentConfig && (
            <p className="text-sm text-gray-400 text-center py-4">पेमेंट माहिती उपलब्ध नाही. कृपया ग्रामपंचायतीशी संपर्क साधा.</p>
          )}
        </div>
      </div>

      {/* UTR Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <h3 className="font-bold text-gray-900 text-sm mb-3">पेमेंट पुष्टी</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">UTR / Transaction / संदर्भ क्रमांक *</label>
              <input
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                required
                placeholder="उदा. 423956789012"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 outline-none text-sm"
              />
            </div>

            {/* Screenshot Upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                पेमेंट स्क्रीनशॉट (पर्यायी)
              </label>
              <input
                ref={screenshotRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleScreenshotChange(e.target.files?.[0] || null)}
              />
              {screenshotPreview ? (
                <div className="relative group">
                  <img
                    src={screenshotPreview}
                    alt="Payment screenshot"
                    className="w-full max-h-48 object-contain rounded-xl border border-gray-200 bg-gray-50"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => screenshotRef.current?.click()}
                      className="bg-white text-gray-700 text-xs px-3 py-1.5 rounded-lg font-semibold"
                    >
                      बदला
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleScreenshotChange(null);
                        if (screenshotRef.current) screenshotRef.current.value = "";
                      }}
                      className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg font-semibold"
                    >
                      काढा
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => screenshotRef.current?.click()}
                  className="w-full h-28 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-violet-300 hover:bg-violet-50/30 transition-colors cursor-pointer"
                >
                  <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="text-xs text-gray-400 font-medium">स्क्रीनशॉट अपलोड करा</span>
                </button>
              )}
              {screenshotFile && (
                <div className="mt-1 space-y-0.5">
                  <p className="text-[10px] text-gray-400 truncate">{screenshotFile.name}</p>
                  {compressingScreenshot && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] text-violet-500 font-medium">संकुचन होत आहे...</span>
                    </div>
                  )}
                  {screenshotSizeInfo && !compressingScreenshot && screenshotSizeInfo.original !== screenshotSizeInfo.compressed && (
                    <p className="text-[10px] text-emerald-500 font-medium">
                      ✓ {(screenshotSizeInfo.original / 1024).toFixed(0)}KB → {(screenshotSizeInfo.compressed / 1024).toFixed(0)}KB
                      ({Math.round((1 - screenshotSizeInfo.compressed / screenshotSizeInfo.original) * 100)}% कमी)
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !utrNumber.trim()}
          className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {submitting ? "सबमिट होत आहे..." : "पेमेंट सबमिट करा"}
        </button>
      </form>
    </div>
  );
}
