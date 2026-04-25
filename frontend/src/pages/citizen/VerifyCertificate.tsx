import { useState } from "react";
import { useParams } from "react-router";
import { citizenService } from "../../services/citizenService";
import { motion, AnimatePresence } from "framer-motion";

interface VerifyResult {
  valid: boolean;
  certificate?: {
    certificateNo: string;
    applicantName: string;
    certificateType: string;
    villageName: string;
    issuedAt: string;
    status: string;
    dispatchNo?: string;
  };
}

export default function VerifyCertificate() {
  const { certificateNo: routeNo } = useParams();
  const [certNo, setCertNo] = useState(routeNo || "");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!certNo.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await citizenService.verifyCertificate(certNo.trim());
      setResult(res);
    } catch {
      setResult({ valid: false });
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  // Auto-verify if route param exists
  useState(() => {
    if (routeNo) handleVerify();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 flex items-start justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl shadow-blue-500/25">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">प्रमाणपत्र पडताळणी</h1>
          <p className="text-sm text-gray-400 mt-1">Certificate Verification</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleVerify} className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 p-6 shadow-xl shadow-blue-500/5 mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">प्रमाणपत्र क्रमांक / Certificate Number</label>
          <div className="flex gap-2">
            <input
              value={certNo}
              onChange={(e) => setCertNo(e.target.value)}
              placeholder="उदा. CERT-2025-001"
              required
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none text-sm"
            />
            <button
              type="submit"
              disabled={loading || !certNo.trim()}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              )}
            </button>
          </div>
        </form>

        {/* Result */}
        <AnimatePresence mode="wait">
          {searched && result && (
            <motion.div
              key={result.valid ? "valid" : "invalid"}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            >
              {result.valid && result.certificate ? (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-emerald-100 shadow-xl shadow-emerald-500/10 overflow-hidden">
                  {/* Valid banner */}
                  <div className="bg-gradient-to-br from-emerald-500 to-green-600 px-6 py-5 text-white text-center relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                    <div className="relative">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-3 flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <h2 className="text-lg font-bold">वैध प्रमाणपत्र ✓</h2>
                      <p className="text-emerald-100 text-sm">Valid Certificate</p>
                    </div>
                  </div>
                  {/* Details */}
                  <div className="p-5 space-y-3">
                    {[
                      { label: "प्रमाणपत्र क्रमांक", value: result.certificate.certificateNo },
                      { label: "अर्जदाराचे नाव", value: result.certificate.applicantName },
                      { label: "प्रमाणपत्र प्रकार", value: result.certificate.certificateType },
                      { label: "ग्रामपंचायत", value: result.certificate.villageName },
                      { label: "जारी तारीख", value: result.certificate.issuedAt ? new Date(result.certificate.issuedAt).toLocaleDateString("mr-IN") : "—" },
                      ...(result.certificate.dispatchNo ? [{ label: "डिस्पॅच क्र.", value: result.certificate.dispatchNo }] : []),
                    ].map((info) => (
                      <div key={info.label} className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-medium">{info.label}</span>
                        <span className="text-sm font-semibold text-gray-800">{info.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-red-100 shadow-xl shadow-red-500/10 overflow-hidden">
                  <div className="bg-gradient-to-br from-red-500 to-rose-600 px-6 py-5 text-white text-center relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                    <div className="relative">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-3 flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </div>
                      <h2 className="text-lg font-bold">अवैध प्रमाणपत्र ✗</h2>
                      <p className="text-red-100 text-sm">Invalid Certificate</p>
                    </div>
                  </div>
                  <div className="p-5 text-center">
                    <p className="text-sm text-gray-500">हा प्रमाणपत्र क्रमांक आमच्या नोंदीत सापडला नाही.</p>
                    <p className="text-xs text-gray-400 mt-2">कृपया क्रमांक तपासून पुन्हा प्रयत्न करा किंवा संबंधित ग्रामपंचायतीशी संपर्क साधा.</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            ग्रामपंचायत व्यवस्थापन प्रणाली (GPMH) — सार्वजनिक पडताळणी सेवा
          </p>
        </div>
      </div>
    </div>
  );
}
