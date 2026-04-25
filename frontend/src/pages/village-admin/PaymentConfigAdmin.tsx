import { useEffect, useState, useRef } from "react";
import { villageAdminService } from "../../services/villageAdminService";
import { compressImage, COMPRESS_PRESETS } from "../../utils/imageCompression";

export default function PaymentConfigAdmin() {
  const [form, setForm] = useState({
    bankName: "",
    accountNo: "",
    ifscCode: "",
    accountHolder: "",
    upiId: "",
    qrCodeUrl: "",
    instructions: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // QR upload state
  const [qrPreview, setQrPreview] = useState("");
  const [uploadingQr, setUploadingQr] = useState(false);
  const [qrSizeInfo, setQrSizeInfo] = useState<{ original: number; compressed: number } | null>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await villageAdminService.getPaymentConfig();
      // API returns { success, statusCode, data: <record|null> }
      const c = res.data;
      if (c) {
        setForm({
          bankName: c.bankName || "",
          accountNo: c.accountNo || "",
          ifscCode: c.ifscCode || "",
          accountHolder: c.accountHolder || "",
          upiId: c.upiId || "",
          qrCodeUrl: c.qrCodeUrl || "",
          instructions: c.instructions || "",
          isActive: c.isActive ?? true,
        });
        if (c.qrCodeUrl) setQrPreview(c.qrCodeUrl);
      }
    } catch {
      // Config may not exist yet
    } finally {
      setLoading(false);
    }
  };

  const handleQrUpload = async (file: File | null) => {
    if (!file) {
      setQrPreview("");
      setForm((f) => ({ ...f, qrCodeUrl: "" }));
      setQrSizeInfo(null);
      return;
    }

    setUploadingQr(true);
    try {
      const originalSize = file.size;
      const compressed = await compressImage(file, COMPRESS_PRESETS.qrCode);
      setQrSizeInfo({ original: originalSize, compressed: compressed.size });

      // Show local preview
      const reader = new FileReader();
      reader.onload = (e) => setQrPreview(e.target?.result as string);
      reader.readAsDataURL(compressed);

      // Upload to server
      const urls = await villageAdminService.uploadImages("payment-qr", [compressed]);
      if (urls.length > 0) {
        setForm((f) => ({ ...f, qrCodeUrl: urls[0] }));
      }
    } catch {
      setMessage("QR कोड अपलोड अयशस्वी");
    } finally {
      setUploadingQr(false);
    }
  };

  const handleRemoveQr = async () => {
    if (form.qrCodeUrl && form.qrCodeUrl.startsWith("/uploads/")) {
      try {
        await villageAdminService.deleteUploadedImage(form.qrCodeUrl);
      } catch { /* may already be deleted */ }
    }
    setForm((f) => ({ ...f, qrCodeUrl: "" }));
    setQrPreview("");
    setQrSizeInfo(null);
    if (qrInputRef.current) qrInputRef.current.value = "";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await villageAdminService.upsertPaymentConfig(form);
      setMessage("पेमेंट सेटिंग्ज यशस्वीरित्या जतन केल्या!");
    } catch (err: any) {
      setMessage(err.response?.data?.message || "त्रुटी आली");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">पेमेंट सेटिंग्ज</h1>
        <p className="text-sm text-gray-500">Payment Configuration — नागरिकांना दिसणारी पेमेंट माहिती</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm border ${message.includes("त्रुटी") || message.includes("अयशस्वी") ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 rounded-xl border p-6 space-y-6">
        {/* Bank Details */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">🏦 बँक माहिती</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">बँकेचे नाव</label>
              <input
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                placeholder="उदा. State Bank of India"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">खातेदाराचे नाव</label>
              <input
                value={form.accountHolder}
                onChange={(e) => setForm({ ...form, accountHolder: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                placeholder="उदा. ग्रामपंचायत कोंडवळ"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">खाते क्रमांक</label>
              <input
                value={form.accountNo}
                onChange={(e) => setForm({ ...form, accountNo: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm font-mono"
                placeholder="123456789012345"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">IFSC कोड</label>
              <input
                value={form.ifscCode}
                onChange={(e) => setForm({ ...form, ifscCode: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm font-mono"
                placeholder="SBIN0001234"
              />
            </div>
          </div>
        </div>

        {/* UPI Details */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">📱 UPI माहिती</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">UPI ID</label>
              <input
                value={form.upiId}
                onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm font-mono"
                placeholder="grampanchayat@upi"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-600 mb-1.5 block">QR कोड प्रतिमा</label>
              <input
                ref={qrInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleQrUpload(e.target.files?.[0] || null)}
              />
              {qrPreview ? (
                <div className="flex items-start gap-4">
                  <div className="relative group">
                    <img
                      src={qrPreview}
                      alt="QR Code"
                      className="w-48 h-48 object-contain rounded-xl border border-gray-200 bg-gray-50 p-2"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => qrInputRef.current?.click()}
                        className="bg-white text-gray-700 text-xs px-3 py-1.5 rounded-lg font-semibold"
                      >
                        बदला
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveQr}
                        className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg font-semibold"
                      >
                        काढा
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 pt-1 space-y-1">
                    {uploadingQr && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-orange-500 font-medium">अपलोड होत आहे...</span>
                      </div>
                    )}
                    {qrSizeInfo && !uploadingQr && qrSizeInfo.original !== qrSizeInfo.compressed && (
                      <p className="text-emerald-500 font-medium">
                        ✓ {(qrSizeInfo.original / 1024).toFixed(0)}KB → {(qrSizeInfo.compressed / 1024).toFixed(0)}KB
                        ({Math.round((1 - qrSizeInfo.compressed / qrSizeInfo.original) * 100)}% कमी)
                      </p>
                    )}
                    {form.qrCodeUrl && !uploadingQr && (
                      <p className="text-green-600 font-medium">✓ अपलोड झाले</p>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => qrInputRef.current?.click()}
                  disabled={uploadingQr}
                  className="w-48 h-48 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-orange-300 hover:bg-orange-50/30 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {uploadingQr ? (
                    <>
                      <div className="w-8 h-8 border-3 border-orange-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-orange-500 font-medium">अपलोड होत आहे...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
                      </svg>
                      <span className="text-xs text-gray-400 font-medium">QR कोड अपलोड करा</span>
                      <span className="text-[10px] text-gray-300">JPG, PNG, WebP</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">📝 सूचना</h2>
          <textarea
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            rows={3}
            placeholder="नागरिकांसाठी पेमेंटसंबंधी सूचना..."
          />
        </div>

        {/* Active toggle */}
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-orange-500 after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
          </label>
          <span className="text-sm text-gray-600">पेमेंट सक्रिय</span>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || uploadingQr}
            className="px-6 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
          >
            {saving ? "जतन होत आहे..." : "💾 जतन करा"}
          </button>
        </div>
      </form>
    </div>
  );
}
