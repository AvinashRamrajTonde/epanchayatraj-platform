import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { citizenService } from "../../services/citizenService";
import { useCitizenAuthStore } from "../../store/citizenAuthStore";
import { motion, AnimatePresence } from "framer-motion";

export default function CitizenRegister() {
  const navigate = useNavigate();
  const { setCitizenAuth } = useCitizenAuthStore();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "",
  });

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const isValidPhone = (p: string) => !p || /^[6-9]\d{9}$/.test(p);
  const passwordStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setForm({ ...form, phone: value.replace(/\D/g, "").slice(0, 10) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("कृपया पूर्ण नाव टाका"); return; }
    if (!isValidEmail(form.email)) { setError("कृपया वैध ईमेल पत्ता टाका"); return; }
    if (form.phone && !isValidPhone(form.phone)) { setError("कृपया 10 अंकी मोबाइल नंबर टाका"); return; }
    if (form.password.length < 6) { setError("पासवर्ड कमीत कमी 6 अक्षरांचा असावा"); return; }
    if (form.password !== form.confirmPassword) { setError("पासवर्ड जुळत नाही"); return; }

    setLoading(true);
    try {
      const res = await citizenService.register({
        name: form.name.trim(), email: form.email.trim(),
        phone: form.phone || undefined, password: form.password,
      });
      if (res.data?.otp) setDevOtp(res.data.otp);
      setStep("otp");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "नोंदणी अयशस्वी");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { setError("कृपया 6 अंकी OTP टाका"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await citizenService.verifyOTP(form.email, otp);
      const { user, accessToken, refreshToken, needsRegistration } = res.data;
      setCitizenAuth(user, accessToken, refreshToken, needsRegistration);
      navigate("/citizen/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "OTP सत्यापन अयशस्वी");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-xl shadow-emerald-500/25 -rotate-3 hover:rotate-0 transition-transform">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">नवीन नोंदणी</h1>
            <p className="text-gray-400 text-sm mt-1.5 font-medium">Create Your Account</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/[0.04] border border-white/80 p-7"
          >
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-3 mb-7">
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${step === "form" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-[10px]">1</span>
                माहिती भरा
              </div>
              <div className="w-6 h-px bg-gray-200" />
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${step === "otp" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-[10px]">2</span>
                ईमेल सत्यापन
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-2.5">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {devOtp && step === "otp" && (
              <div className="mb-5 p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 text-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                [Dev] OTP: <code className="font-mono font-bold bg-blue-100 px-1.5 py-0.5 rounded">{devOtp}</code>
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === "form" ? (
                <motion.form key="form" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">पूर्ण नाव <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      <input type="text" name="name" value={form.name} onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all placeholder:text-gray-400"
                        placeholder="तुमचे पूर्ण नाव" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ईमेल <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                      <input type="email" name="email" value={form.email} onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all placeholder:text-gray-400"
                        placeholder="example@email.com" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">मोबाइल <span className="text-gray-400 font-normal text-xs">(ऐच्छिक)</span></label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3.5 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm font-medium">+91</span>
                      <input type="tel" name="phone" value={form.phone} onChange={handleChange} maxLength={10}
                        className="flex-1 px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all placeholder:text-gray-400"
                        placeholder="10 अंकी मोबाइल नंबर" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">पासवर्ड <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </div>
                      <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange}
                        className="w-full pl-11 pr-12 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all placeholder:text-gray-400"
                        placeholder="कमीत कमी 6 अक्षरे" minLength={6} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                      </button>
                    </div>
                    {form.password && (
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= passwordStrength ? (passwordStrength === 1 ? "bg-red-400" : passwordStrength === 2 ? "bg-amber-400" : "bg-emerald-400") : "bg-gray-200"}`} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">पासवर्ड पुष्टी <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      </div>
                      <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all placeholder:text-gray-400"
                        placeholder="पासवर्ड पुन्हा टाका" minLength={6} required />
                    </div>
                    {form.confirmPassword && form.password !== form.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">पासवर्ड जुळत नाही</p>
                    )}
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transform mt-2">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        नोंदणी करत आहे...
                      </span>
                    ) : "नोंदणी करा"}
                  </button>
                </motion.form>
              ) : (
                <motion.form key="otp" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={handleVerifyOTP} className="space-y-5">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                      <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">ईमेल सत्यापन</h2>
                    <p className="text-sm text-gray-500 mt-1"><span className="font-semibold text-gray-700">{form.email}</span> वर OTP पाठविला</p>
                  </div>

                  <input type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none text-center text-2xl tracking-[0.5em] font-mono text-gray-800"
                    placeholder="● ● ● ● ● ●" autoFocus />

                  <button type="submit" disabled={loading || otp.length !== 6}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transform">
                    {loading ? "सत्यापित करत आहे..." : "सत्यापित करा"}
                  </button>

                  <button type="button" onClick={() => { setStep("form"); setOtp(""); setError(""); setDevOtp(""); }}
                    className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 font-medium">← मागे जा</button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-7 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                आधीच खाते आहे?{" "}
                <Link to="/citizen/login" className="text-orange-600 hover:text-orange-700 font-semibold">लॉगिन करा</Link>
              </p>
            </div>
          </motion.div>

          <p className="text-center text-xs text-gray-400 mt-8">महाराष्ट्र लोकसेवा हक्क अध्यादेश-२०१५ अंतर्गत सेवा</p>
        </div>
      </div>
    </div>
  );
}
