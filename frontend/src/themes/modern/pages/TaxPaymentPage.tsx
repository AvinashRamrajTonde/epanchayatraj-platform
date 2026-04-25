import { useState, useRef, useEffect } from "react";
import { publicService } from "../../../services/publicService";
import api from "../../../services/api";

interface PaymentConfig {
  bankName?: string;
  accountNo?: string;
  ifscCode?: string;
  accountHolder?: string;
  upiId?: string;
  qrCodeUrl?: string;
  instructions?: string;
  isActive?: boolean;
}

const TAX_TYPES = [
  { value: "house", label: "घरपट्टी (House Tax)", icon: "🏠" },
  { value: "water", label: "पाणीपट्टी (Water Tax)", icon: "💧" },
  { value: "other", label: "इतर कर (Other Tax)", icon: "📋" },
];

const YEARS = ["2025-26", "2024-25", "2023-24", "2022-23", "2021-22"];

type Step = "form" | "payment" | "confirm" | "done";

export default function TaxPaymentPage() {
  const [step, setStep] = useState<Step>("form");
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    contact: "",
    address: "",
    taxType: "",
    amount: "",
    year: YEARS[0],
  });

  const [utrNumber, setUtrNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [receiptNo, setReceiptNo] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get("/api/citizen/payment-config")
      .then((res) => setConfig(res.data?.data || null))
      .catch(() => setConfig(null))
      .finally(() => setConfigLoading(false));
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.contact.trim() || !form.address.trim() || !form.taxType || !form.amount || !form.year) {
      setResult({ type: "error", text: "कृपया सर्व आवश्यक माहिती भरा." });
      return;
    }
    if (isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) {
      setResult({ type: "error", text: "कृपया योग्य रक्कम टाका." });
      return;
    }
    setResult(null);
    setStep("payment");
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const removeScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch { /* ignore */ }
  };

  const handleSubmitConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      setResult({ type: "error", text: "कृपया UTR / Transaction ID टाका." });
      return;
    }
    setSubmitting(true);
    setResult(null);
    let screenshotUrl: string | undefined;

    try {
      if (screenshotFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("image", screenshotFile);
        const res = await api.post("/api/public/upload/tax-payment", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        screenshotUrl = res.data?.data?.url;
        setUploading(false);
      }

      const res = await publicService.submitTaxPayment({
        ...form,
        utrNumber,
        screenshotUrl,
        paymentMethod,
      });

      setReceiptNo(res?.data?.receiptNo || res?.receiptNo || "");
      setStep("done");
    } catch {
      setResult({ type: "error", text: "माहिती सादर करताना अडचण आली. कृपया पुन्हा प्रयत्न करा." });
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const resetAll = () => {
    setStep("form");
    setForm({ name: "", contact: "", address: "", taxType: "", amount: "", year: YEARS[0] });
    setUtrNumber("");
    setPaymentMethod("upi");
    removeScreenshot();
    setResult(null);
    setReceiptNo("");
  };

  const selectedTax = TAX_TYPES.find((t) => t.value === form.taxType);

  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-700 to-teal-600 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">कर भरणा (Tax Payment)</h1>
          <p className="text-green-100 text-sm">घरपट्टी, पाणीपट्टी व इतर ग्रामपंचायत कर ऑनलाईन भरा</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Step Indicator */}
        {step !== "done" && (
          <div className="flex items-center justify-center gap-0 mb-8">
            {[{ id: "form", label: "माहिती" }, { id: "payment", label: "पेमेंट" }, { id: "confirm", label: "पुष्टी" }].map((s, idx) => {
              const steps: Step[] = ["form", "payment", "confirm"];
              const current = steps.indexOf(step);
              const mine = steps.indexOf(s.id as Step);
              const done = mine < current;
              const active = mine === current;
              return (
                <div key={s.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 ${active ? "bg-green-600 text-white border-green-600" : done ? "bg-green-100 text-green-700 border-green-400" : "bg-gray-100 text-gray-400 border-gray-300"}`}>
                      {done ? "✓" : idx + 1}
                    </div>
                    <span className={`text-xs mt-1 font-medium ${active ? "text-green-700" : done ? "text-green-600" : "text-gray-400"}`}>{s.label}</span>
                  </div>
                  {idx < 2 && <div className={`w-16 h-0.5 mb-5 mx-1 ${mine < current ? "bg-green-400" : "bg-gray-200"}`} />}
                </div>
              );
            })}
          </div>
        )}

        {/* STEP 1: Form */}
        {step === "form" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">करदात्याची माहिती</h2>
            <form onSubmit={handleFormNext} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>मालकाचे नाव <span className="text-red-500">*</span></label>
                  <input name="name" value={form.name} onChange={handleFormChange} className={inputCls} placeholder="संपूर्ण नाव" />
                </div>
                <div>
                  <label className={labelCls}>मोबाईल क्रमांक <span className="text-red-500">*</span></label>
                  <input name="contact" value={form.contact} onChange={handleFormChange} className={inputCls} placeholder="10 अंकी क्रमांक" />
                </div>
              </div>
              <div>
                <label className={labelCls}>पत्ता / घर क्रमांक <span className="text-red-500">*</span></label>
                <input name="address" value={form.address} onChange={handleFormChange} className={inputCls} placeholder="घर क्रमांक, गल्ली, वार्ड" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className={labelCls}>कराचा प्रकार <span className="text-red-500">*</span></label>
                  <select name="taxType" value={form.taxType} onChange={handleFormChange} className={inputCls}>
                    <option value="">— निवडा —</option>
                    {TAX_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>आर्थिक वर्ष <span className="text-red-500">*</span></label>
                  <select name="year" value={form.year} onChange={handleFormChange} className={inputCls}>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>रक्कम (₹) <span className="text-red-500">*</span></label>
                  <input name="amount" value={form.amount} onChange={handleFormChange} type="number" min="1" step="0.01" className={inputCls} placeholder="0.00" />
                </div>
              </div>
              {result && <div className="px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">{result.text}</div>}
              <button type="submit" className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition-colors text-sm">पुढे जा →</button>
            </form>

            <div className="mt-8 grid grid-cols-3 gap-4">
              {[{ icon: "📋", title: "माहिती भरा", desc: "नाव, पत्ता, कर प्रकार" }, { icon: "💳", title: "पेमेंट करा", desc: "UPI / बँक ट्रान्सफर" }, { icon: "📄", title: "पावती मिळवा", desc: "पडताळणीनंतर पावती" }].map((c, i) => (
                <div key={i} className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-2xl mb-2">{c.icon}</div>
                  <div className="text-sm font-semibold text-gray-800">{c.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Payment */}
        {step === "payment" && (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-5">
              <h3 className="font-bold text-green-800 mb-3">{selectedTax?.icon} पेमेंट सारांश</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div><span className="text-gray-500 text-xs">करदाता</span><br /><strong>{form.name}</strong></div>
                <div><span className="text-gray-500 text-xs">प्रकार</span><br /><strong>{selectedTax?.label}</strong></div>
                <div><span className="text-gray-500 text-xs">वर्ष</span><br /><strong>{form.year}</strong></div>
                <div><span className="text-gray-500 text-xs">रक्कम</span><br /><strong className="text-green-700 text-base">₹ {form.amount}</strong></div>
              </div>
            </div>

            {configLoading ? (
              <div className="text-center py-10 text-gray-400 bg-white rounded-2xl shadow border border-gray-200">पेमेंट माहिती लोड होत आहे...</div>
            ) : !config ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-sm text-yellow-800">पेमेंट कॉन्फिगरेशन उपलब्ध नाही.</div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-5 text-center">पेमेंट करा</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(config.upiId || config.qrCodeUrl) && (
                    <div className="border border-gray-100 rounded-xl p-5">
                      <h4 className="font-semibold text-gray-700 mb-4">📱 UPI / QR कोड</h4>
                      {config.qrCodeUrl && (
                        <div className="flex flex-col items-center mb-4">
                          <div className="border-4 border-green-600 rounded-xl p-2 shadow-md">
                            <img src={config.qrCodeUrl} alt="QR" className="w-44 h-44 object-contain" />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">PhonePe / GPay / Paytm / BHIM</p>
                        </div>
                      )}
                      {config.upiId && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs text-gray-500">UPI ID</p>
                            <p className="font-mono font-semibold text-sm">{config.upiId}</p>
                          </div>
                          <button type="button" onClick={() => copyToClipboard(config.upiId!, "upi")}
                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200">
                            {copied === "upi" ? "✓ कॉपी" : "कॉपी"}
                          </button>
                        </div>
                      )}
                      <p className="mt-2 text-xs text-blue-700 bg-blue-50 rounded-lg p-2">रक्कम ₹{form.amount} पाठवा. UTR नंबर नोंदवा.</p>
                    </div>
                  )}
                  {(config.accountNo || config.bankName) && (
                    <div className="border border-gray-100 rounded-xl p-5">
                      <h4 className="font-semibold text-gray-700 mb-4">🏦 बँक ट्रान्सफर</h4>
                      <div className="space-y-2 text-sm">
                        {[
                          { label: "खातेदार", value: config.accountHolder, key: "" },
                          { label: "बँक", value: config.bankName, key: "" },
                          { label: "खाते क्रमांक", value: config.accountNo, key: "acc" },
                          { label: "IFSC", value: config.ifscCode, key: "ifsc" },
                        ].filter(r => r.value).map((r) => (
                          <div key={r.label} className="flex justify-between items-center py-1.5 border-b border-gray-100">
                            <span className="text-gray-500">{r.label}:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-semibold">{r.value}</span>
                              {r.key && (
                                <button type="button" onClick={() => copyToClipboard(r.value!, r.key)}
                                  className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200">
                                  {copied === r.key ? "✓" : "कॉपी"}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {config.instructions && (
                  <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 whitespace-pre-line">{config.instructions}</div>
                )}
                <div className="mt-5 flex gap-3">
                  <button type="button" onClick={() => setStep("form")} className="flex-1 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">← मागे</button>
                  <button type="button" onClick={() => setStep("confirm")} className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 text-sm">पेमेंट केले — पुढे →</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Confirm */}
        {step === "confirm" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-2">पेमेंट पुष्टी</h2>
            <p className="text-sm text-gray-500 mb-6">Transaction ID व स्क्रीनशॉट द्या.</p>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-sm font-medium">{selectedTax?.icon} {selectedTax?.label}</span>
              <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-sm font-medium">₹ {form.amount}</span>
              <span className="bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1 rounded-full text-sm">{form.year}</span>
            </div>
            <form onSubmit={handleSubmitConfirm} className="space-y-5">
              <div>
                <label className={labelCls}>पेमेंट पद्धत</label>
                <div className="flex flex-wrap gap-2">
                  {[{ v: "upi", l: "UPI" }, { v: "online", l: "Net Banking" }, { v: "cash", l: "रोख" }, { v: "cheque", l: "चेक" }].map((m) => (
                    <button key={m.v} type="button" onClick={() => setPaymentMethod(m.v)}
                      className={`px-4 py-2 rounded-lg text-sm border ${paymentMethod === m.v ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-300 hover:border-green-400"}`}>
                      {m.l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>UTR / Transaction ID <span className="text-red-500">*</span></label>
                <input value={utrNumber} onChange={(e) => setUtrNumber(e.target.value)} className={`${inputCls} font-mono`} placeholder="UTR Reference Number" />
                <p className="text-xs text-gray-400 mt-1">UPI / NEFT / IMPS नंतर मिळालेला नंबर</p>
              </div>
              <div>
                <label className={labelCls}>स्क्रीनशॉट (पर्यायी)</label>
                {screenshotPreview ? (
                  <div className="relative inline-block">
                    <img src={screenshotPreview} alt="ss" className="h-36 w-auto rounded-lg border object-cover" />
                    <button type="button" onClick={removeScreenshot} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">✕</button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors">
                    <span className="text-3xl mb-2">📸</span>
                    <span className="text-sm text-gray-500">स्क्रीनशॉट अपलोड करा</span>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleScreenshotChange} className="hidden" />
                  </label>
                )}
              </div>
              {result && <div className={`px-4 py-3 rounded-lg text-sm ${result.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>{result.text}</div>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep("payment")} className="flex-1 py-3 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50">← मागे</button>
                <button type="submit" disabled={submitting || uploading} className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 disabled:opacity-50 text-sm">
                  {uploading ? "अपलोड..." : submitting ? "सादर होत आहे..." : "✓ पुष्टी करा"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: Done */}
        {step === "done" && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5"><span className="text-4xl">✅</span></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">पेमेंट यशस्वीरित्या नोंदवले!</h2>
            <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">तुमचे पेमेंट ग्रामपंचायतीकडे पोहोचले आहे. पडताळणी झाल्यावर पावती दिली जाईल.</p>
            {receiptNo && (
              <div className="inline-block bg-green-50 border border-green-300 rounded-xl px-6 py-4 mb-6">
                <p className="text-xs text-green-600 mb-1">संदर्भ क्रमांक</p>
                <p className="font-mono font-bold text-green-700 text-lg">{receiptNo}</p>
              </div>
            )}
            <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-sm mx-auto mb-6 text-sm text-left space-y-2 text-gray-700">
              <div className="flex justify-between"><span className="text-gray-500">करदाता:</span><strong>{form.name}</strong></div>
              <div className="flex justify-between"><span className="text-gray-500">प्रकार:</span><strong>{selectedTax?.label}</strong></div>
              <div className="flex justify-between"><span className="text-gray-500">वर्ष:</span><strong>{form.year}</strong></div>
              <div className="flex justify-between"><span className="text-gray-500">रक्कम:</span><strong className="text-green-700">₹ {form.amount}</strong></div>
              <div className="flex justify-between"><span className="text-gray-500">UTR:</span><strong className="font-mono">{utrNumber}</strong></div>
            </div>
            <button onClick={resetAll} className="px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 text-sm">आणखी एक कर भरा</button>
          </div>
        )}
      </div>
    </div>
  );
}
