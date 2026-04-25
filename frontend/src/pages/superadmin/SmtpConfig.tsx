import { useState, useEffect } from "react";
import { superadminService } from "../../services/superadminService";

interface SmtpConfigData {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
}

const initialData: SmtpConfigData = {
  host: "",
  port: 587,
  secure: false,
  username: "",
  password: "",
  fromEmail: "",
  fromName: "ग्रामपंचायत पोर्टल",
};

export default function SmtpConfig() {
  const [form, setForm] = useState<SmtpConfigData>(initialData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [hasExisting, setHasExisting] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await superadminService.getSmtpConfig();
      if (res.data) {
        setForm({
          host: res.data.host || "",
          port: res.data.port || 587,
          secure: res.data.secure || false,
          username: res.data.username || "",
          password: res.data.password || "",
          fromEmail: res.data.fromEmail || "",
          fromName: res.data.fromName || "ग्रामपंचायत पोर्टल",
        });
        setHasExisting(true);
      }
    } catch {
      // No config yet
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.host || !form.username || !form.fromEmail) {
      setMsg({ type: "error", text: "कृपया सर्व आवश्यक फील्ड भरा" });
      return;
    }
    if (!hasExisting && !form.password) {
      setMsg({ type: "error", text: "नवीन कॉन्फिगरेशनसाठी पासवर्ड आवश्यक आहे" });
      return;
    }

    setSaving(true);
    setMsg(null);
    try {
      await superadminService.updateSmtpConfig(form);
      setMsg({ type: "success", text: "SMTP कॉन्फिगरेशन जतन केले!" });
      setHasExisting(true);
    } catch (err: unknown) {
      const m = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setMsg({ type: "error", text: m || "जतन अयशस्वी" });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail) {
      setMsg({ type: "error", text: "कृपया टेस्ट ईमेल पत्ता टाका" });
      return;
    }
    setTesting(true);
    setMsg(null);
    try {
      await superadminService.testSmtpConfig(testEmail);
      setMsg({ type: "success", text: `टेस्ट ईमेल ${testEmail} वर पाठविला!` });
    } catch (err: unknown) {
      const m = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setMsg({ type: "error", text: m || "टेस्ट ईमेल अयशस्वी" });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">SMTP कॉन्फिगरेशन</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          ईमेल OTP पाठविण्यासाठी SMTP सेटिंग्ज सेट करा
        </p>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          msg.type === "success"
            ? "bg-green-50 border border-green-200 text-green-700"
            : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              SMTP Host <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.host}
              onChange={(e) => setForm({ ...form, host: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
              placeholder="smtp.gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Port
            </label>
            <input
              type="number"
              value={form.port}
              onChange={(e) => setForm({ ...form, port: parseInt(e.target.value) || 587 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
              placeholder="587"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="secure"
            checked={form.secure}
            onChange={(e) => setForm({ ...form, secure: e.target.checked })}
            className="w-4 h-4 text-brand-500 rounded focus:ring-brand-500"
          />
          <label htmlFor="secure" className="text-sm text-gray-700 dark:text-gray-300">
            SSL/TLS (Secure) - Port 465 साठी ON ठेवा
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
              placeholder="your-email@gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password {!hasExisting && <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
              placeholder={hasExisting ? "बदलण्यासाठी नवीन पासवर्ड टाका" : "App password"}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              From Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.fromEmail}
              onChange={(e) => setForm({ ...form, fromEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
              placeholder="noreply@grampanchayat.in"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              From Name
            </label>
            <input
              type="text"
              value={form.fromName}
              onChange={(e) => setForm({ ...form, fromName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
              placeholder="ग्रामपंचायत पोर्टल"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2.5 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 transition disabled:opacity-50"
        >
          {saving ? "जतन करत आहे..." : "SMTP सेटिंग्ज जतन करा"}
        </button>
      </form>

      {/* Test Section */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">टेस्ट ईमेल पाठवा</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          SMTP कॉन्फिगरेशन योग्य काम करत आहे का ते तपासा
        </p>
        <div className="flex gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:text-white"
            placeholder="test@example.com"
          />
          <button
            type="button"
            onClick={handleTest}
            disabled={testing || !testEmail}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 whitespace-nowrap"
          >
            {testing ? "पाठवत आहे..." : "टेस्ट ईमेल पाठवा"}
          </button>
        </div>
      </div>

      {/* Info section */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-5">
        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Gmail SMTP सेटअप</h4>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
          <li>Host: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">smtp.gmail.com</code></li>
          <li>Port: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">587</code> (TLS off) किंवा <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">465</code> (SSL on)</li>
          <li>Username: तुमचा Gmail address</li>
          <li>Password: App Password तयार करा (Google Account → Security → 2-Step Verification → App passwords)</li>
        </ul>
      </div>
    </div>
  );
}
