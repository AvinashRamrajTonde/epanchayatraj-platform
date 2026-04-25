import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { citizenService, type CertificateApplication } from "../../services/citizenService";
import { motion } from "framer-motion";

const STATUS_MAP: Record<string, { label: string; labelMr: string; bg: string; dot: string; icon: string }> = {
  under_review: { label: "Under Review", labelMr: "पुनरावलोकनात", bg: "bg-amber-50 text-amber-700", dot: "bg-amber-400", icon: "🔍" },
  approved: { label: "Approved", labelMr: "मंजूर", bg: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-400", icon: "✅" },
  rejected: { label: "Rejected", labelMr: "नाकारले", bg: "bg-red-50 text-red-700", dot: "bg-red-400", icon: "❌" },
  pending_payment: { label: "Pending Payment", labelMr: "पेमेंट बाकी", bg: "bg-violet-50 text-violet-700", dot: "bg-violet-400", icon: "💳" },
  issued: { label: "Issued", labelMr: "जारी", bg: "bg-blue-50 text-blue-700", dot: "bg-blue-400", icon: "📜" },
};

function getBackendBase() {
  const hostname = window.location.hostname;
  return `http://${hostname}:5000`;
}

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState<CertificateApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<{ certificate?: boolean; receipt?: boolean }>({});

  useEffect(() => {
    citizenService.getApplicationDetail(id!)
      .then((res) => setApp(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownloadCertificate = async () => {
    if (!id) return;
    setDownloading((prev) => ({ ...prev, certificate: true }));
    try {
      const blob = await citizenService.downloadCertificate(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Certificate_${app?.applicationNo || "download"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("प्रमाणपत्र डाउनलोड अयशस्वी. कृपया पुन्हा प्रयत्न करा.");
    } finally {
      setDownloading((prev) => ({ ...prev, certificate: false }));
    }
  };

  const handleDownloadReceipt = async () => {
    if (!id) return;
    setDownloading((prev) => ({ ...prev, receipt: true }));
    try {
      const blob = await citizenService.downloadReceipt(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Receipt_${app?.applicationNo || "download"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("पावती डाउनलोड अयशस्वी. कृपया पुन्हा प्रयत्न करा.");
    } finally {
      setDownloading((prev) => ({ ...prev, receipt: false }));
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded-xl w-1/3" />
        <div className="h-48 bg-gray-100 rounded-2xl" />
        <div className="h-36 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h2 className="font-bold text-gray-700 mb-2">अर्ज सापडला नाही</h2>
        <Link to="/citizen/applications" className="text-orange-500 font-semibold text-sm">सर्व अर्ज पहा</Link>
      </div>
    );
  }

  const st = STATUS_MAP[app.status] || STATUS_MAP.under_review;
  const formEntries = Object.entries(app.formData || {});

  // Timeline
  const timeline = [
    { label: "अर्ज सादर", date: app.createdAt, done: true },
    ...(app.payment
      ? [{ label: "पेमेंट सबमिट", date: app.payment.createdAt, done: true }]
      : (app.certificateType?.fee > 0 ? [{ label: "पेमेंट बाकी", date: null, done: false }] : [])),
    ...(app.payment?.verifiedAt ? [{ label: "पेमेंट पडताळणी", date: app.payment.verifiedAt, done: true }] : []),
    { label: "प्रक्रिया", date: app.processedAt, done: !!app.processedAt },
    { label: "प्रमाणपत्र जारी", date: app.issuedAt, done: !!app.issuedAt },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/citizen/applications")} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex-1">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">अर्ज तपशील</h1>
          <p className="text-sm text-gray-400">{app.applicationNo}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-bold ${st.bg}`}>
          <span className={`w-2 h-2 rounded-full ${st.dot}`} />
          {st.labelMr}
        </span>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Status Hero */}
        <div className={`rounded-2xl p-6 text-center ${
          app.status === "approved" || app.status === "issued" ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white"
          : app.status === "rejected" ? "bg-gradient-to-br from-red-500 to-rose-600 text-white"
          : "bg-gradient-to-br from-amber-500 to-orange-500 text-white"
        } relative overflow-hidden`}>
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          <span className="text-4xl block mb-2">{st.icon}</span>
          <h2 className="text-lg font-bold">{st.labelMr}</h2>
          <p className="text-sm opacity-80 mt-1">{app.certificateType?.nameMarathi}</p>
          {app.rejectionReason && (
            <div className="mt-3 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-sm">
              <strong>कारण:</strong> {app.rejectionReason}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 text-sm mb-4">प्रगती</h3>
          <div className="relative">
            {timeline.map((t, idx) => (
              <div key={idx} className="flex gap-3 mb-4 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${t.done ? "bg-emerald-400" : "bg-gray-200"}`} />
                  {idx < timeline.length - 1 && <div className={`w-0.5 flex-1 ${t.done ? "bg-emerald-200" : "bg-gray-100"}`} />}
                </div>
                <div className="pb-4">
                  <p className={`text-sm font-semibold ${t.done ? "text-gray-800" : "text-gray-400"}`}>{t.label}</p>
                  {t.date && <p className="text-xs text-gray-400 mt-0.5">{new Date(t.date).toLocaleString("mr-IN")}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 text-sm mb-4">अर्ज माहिती</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "अर्ज क्रमांक", value: app.applicationNo },
              { label: "प्रमाणपत्र प्रकार", value: app.certificateType?.nameMarathi },
              { label: "अर्जदार", value: app.applicantName },
              { label: "आधार", value: app.applicantAadhar },
              { label: "कुटुंब", value: app.family?.headName ? `${app.family.headName} (${app.family.familyId})` : "—" },
              { label: "गाव", value: app.village?.name || "—" },
              { label: "अर्ज तारीख", value: new Date(app.createdAt).toLocaleDateString("mr-IN") },
              { label: "शुल्क", value: app.certificateType?.fee > 0 ? `₹${app.certificateType.fee}/-` : "निशुल्क" },
              ...(app.certificateNo ? [{ label: "प्रमाणपत्र क्र.", value: app.certificateNo }] : []),
              ...(app.dispatchNo ? [{ label: "डिस्पॅच क्र.", value: app.dispatchNo }] : []),
            ].map((info) => (
              <div key={info.label} className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{info.label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{info.value}</p>
              </div>
            ))}
          </div>
          {app.adminRemarks && (
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <p className="text-xs text-blue-500 font-medium">प्रशासन शेरा</p>
              <p className="text-sm text-blue-800 mt-0.5">{app.adminRemarks}</p>
            </div>
          )}
        </div>

        {/* Form Data */}
        {formEntries.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-4">अर्ज तपशील (भरलेला डेटा)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formEntries.map(([key, val]) => (
                <div key={key} className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{key}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{String(val)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded Documents/Photos */}
        {app.documents && app.documents.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              अपलोड केलेले फोटो / कागदपत्रे
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {app.documents.map((docUrl, i) => (
                <a
                  key={i}
                  href={`${getBackendBase()}${docUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <img
                    src={`${getBackendBase()}${docUrl}`}
                    alt={`Document ${i + 1}`}
                    className="w-full h-32 object-cover rounded-xl border border-gray-200 group-hover:border-orange-300 transition-colors"
                  />
                  <p className="text-[10px] text-gray-400 mt-1 text-center">फोटो {i + 1}</p>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Payment Info */}
        {app.payment && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-4">पेमेंट माहिती</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "रक्कम", value: `₹${app.payment.amount}/-` },
                { label: "UTR क्रमांक", value: app.payment.utrNumber || "—" },
                { label: "पद्धत", value: app.payment.paymentMethod || "—" },
                { label: "स्थिती", value: (() => { const s = app.payment?.status; return s === "verified" ? "पडताळले ✅" : s === "rejected" ? "नाकारले ❌" : "बाकी ⏳"; })() },
                ...(app.payment.receiptNo ? [{ label: "पावती क्र.", value: app.payment.receiptNo }] : []),
                ...(app.payment.remarks ? [{ label: "शेरा", value: app.payment.remarks }] : []),
              ].map((info) => (
                <div key={info.label} className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{info.label}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{info.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {/* Payment button if fee > 0 and no payment */}
          {app.certificateType?.fee > 0 && !app.payment && app.status !== "rejected" && (
            <Link
              to={`/citizen/payment/${app.id}`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white px-5 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-violet-500/25"
            >
              💳 पेमेंट करा
            </Link>
          )}
          {/* Certificate download - Show when approved or issued */}
          {(app.status === "approved" || app.status === "issued") && (
            <button
              onClick={handleDownloadCertificate}
              disabled={downloading.certificate}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-5 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading.certificate ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                  डाउनलोड करत आहे...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  प्रमाणपत्र डाउनलोड
                </>
              )}
            </button>
          )}
          {/* Receipt download - Show when payment is verified */}
          {app.payment?.status === "verified" && (
            <button
              onClick={handleDownloadReceipt}
              disabled={downloading.receipt}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading.receipt ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                  डाउनलोड करत आहे...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  पावती डाउनलोड
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
