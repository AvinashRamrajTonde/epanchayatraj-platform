import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { citizenService } from "../../services/citizenService";
import { motion, AnimatePresence } from "framer-motion";

type Step = "identifier" | "otp" | "done";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("identifier");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [devOtp, setDevOtp] = useState("");

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) { setError("कृपया ईमेल किंवा फोन नंबर टाका"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await citizenService.forgotPassword(identifier.trim());
      setMaskedEmail(res.data?.email || "");
      if (res.data?.otp) setDevOtp(res.data.otp);
      setStep("otp");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "OTP पाठविण्यात अडचण आली");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { setError("कृपया 6 अंकी OTP टाका"); return; }
    if (newPassword.length < 6) { setError("पासवर्ड कमीत कमी 6 अक्षरांचा असावा"); return; }
    if (newPassword !== confirmPassword) { setError("पासवर्ड जुळत नाही"); return; }
    setLoading(true);
    setError("");
    try {
      await citizenService.resetPassword(identifier.trim(), otp, newPassword);
      setStep("done");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "पासवर्ड रीसेट अयशस्वी");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-xl shadow-blue-500/25">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">पासवर्ड रीसेट</h1>
            <p className="text-gray-400 text-sm mt-1.5 font-medium">Reset Password</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/[0.04] border border-white/80 p-7"
          >
            {/* Step Progress */}
            <div className="flex items-center justify-center gap-2 mb-7">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${s <= (step === "identifier" ? 1 : step === "otp" ? 2 : 3) ? "bg-blue-500 w-10" : "bg-gray-200 w-6"}`} />
              ))}
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
              {step === "identifier" && (
                <motion.form key="id" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={handleSendOTP} className="space-y-5">
                  <p className="text-sm text-gray-600 leading-relaxed">तुमचा नोंदणीकृत ईमेल किंवा फोन नंबर टाका. आम्ही तुमच्या ईमेलवर OTP पाठवू.</p>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ईमेल / फोन</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                      </div>
                      <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                        placeholder="example@email.com / 9876543210" autoFocus />
                    </div>
                  </div>

                  <button type="submit" disabled={loading || !identifier.trim()}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 active:scale-[0.98] transform">
                    {loading ? "OTP पाठवित आहे..." : "OTP पाठवा"}
                  </button>
                </motion.form>
              )}

              {step === "otp" && (
                <motion.form key="otp" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={handleResetPassword} className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500"><span className="font-semibold text-gray-700">{maskedEmail}</span> वर OTP पाठविला</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">OTP कोड</label>
                    <input type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none text-center text-2xl tracking-[0.5em] font-mono"
                      placeholder="● ● ● ● ● ●" autoFocus />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">नवीन पासवर्ड</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none placeholder:text-gray-400"
                      placeholder="कमीत कमी 6 अक्षरे" minLength={6} />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">पासवर्ड पुष्टी</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none placeholder:text-gray-400"
                      placeholder="पासवर्ड पुन्हा टाका" minLength={6} />
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 active:scale-[0.98] transform">
                    {loading ? "रीसेट करत आहे..." : "पासवर्ड रीसेट करा"}
                  </button>

                  <button type="button" onClick={() => { setStep("identifier"); setOtp(""); setError(""); setDevOtp(""); }}
                    className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 font-medium">← मागे जा</button>
                </motion.form>
              )}

              {step === "done" && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5 py-4">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full mx-auto flex items-center justify-center">
                    <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">पासवर्ड बदलला!</h3>
                    <p className="text-sm text-gray-500 mt-1">नवीन पासवर्ड सेट झाला आहे</p>
                  </div>
                  <button onClick={() => navigate("/citizen/login")}
                    className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/20 active:scale-[0.98] transform">
                    लॉगिन करा
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {step !== "done" && (
              <div className="mt-7 pt-6 border-t border-gray-100 text-center">
                <Link to="/citizen/login" className="text-sm text-orange-600 hover:text-orange-700 font-semibold">← लॉगिन पेजवर परत</Link>
              </div>
            )}
          </motion.div>

          <p className="text-center text-xs text-gray-400 mt-8">महाराष्ट्र लोकसेवा हक्क अध्यादेश-२०१५ अंतर्गत सेवा</p>
        </div>
      </div>
    </div>
  );
}
