import { useEffect, useState } from "react";
import { Link } from "react-router";
import { citizenService, type CertificateApplication } from "../../services/citizenService";
import { motion } from "framer-motion";

const STATUS_MAP: Record<string, { label: string; labelMr: string; bg: string; dot: string }> = {
  under_review: { label: "Under Review", labelMr: "पुनरावलोकनात", bg: "bg-amber-50 text-amber-700", dot: "bg-amber-400" },
  approved: { label: "Approved", labelMr: "मंजूर", bg: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-400" },
  rejected: { label: "Rejected", labelMr: "नाकारले", bg: "bg-red-50 text-red-700", dot: "bg-red-400" },
  pending_payment: { label: "Pending Payment", labelMr: "पेमेंट बाकी", bg: "bg-violet-50 text-violet-700", dot: "bg-violet-400" },
  issued: { label: "Issued", labelMr: "जारी", bg: "bg-blue-50 text-blue-700", dot: "bg-blue-400" },
};

const PAYMENT_STATUS: Record<string, { label: string; bg: string }> = {
  pending: { label: "बाकी", bg: "bg-amber-50 text-amber-600" },
  verified: { label: "पडताळले", bg: "bg-emerald-50 text-emerald-600" },
  rejected: { label: "नाकारले", bg: "bg-red-50 text-red-600" },
};

function getBackendBase() {
  const hostname = window.location.hostname;
  const port = 5000;
  return `http://${hostname}:${port}`;
}

export default function MyApplications() {
  const [applications, setApplications] = useState<CertificateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    setLoading(true);
    const params: any = { page, limit };
    if (filter !== "all") params.status = filter;
    citizenService.getMyApplications(params)
      .then((res) => {
        setApplications(res.data?.applications || res.data || []);
        setTotal(res.data?.pagination?.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter, page]);

  const totalPages = Math.ceil(total / limit);

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
  const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            माझे अर्ज
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">एकूण {total} अर्ज</p>
        </div>
        <Link
          to="/citizen/services"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 active:scale-95 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          नवीन अर्ज
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 bg-gray-100/80 rounded-2xl p-1 mb-5 overflow-x-auto">
        {[
          { key: "all", label: "सर्व" },
          { key: "under_review", label: "पुनरावलोकनात" },
          { key: "approved", label: "मंजूर" },
          { key: "rejected", label: "नाकारले" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              filter === f.key ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Applications list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-1/2 mb-2" /><div className="h-3 bg-gray-100 rounded w-1/3" /></div>
              </div>
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <h3 className="font-bold text-gray-700 mb-1">कोणतेही अर्ज नाहीत</h3>
          <p className="text-sm text-gray-400 mb-4">सेवा पृष्ठावरून नवीन अर्ज करा</p>
          <Link to="/citizen/services" className="bg-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">अर्ज करा</Link>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {applications.map((app) => {
            const st = STATUS_MAP[app.status] || STATUS_MAP.under_review;
            const ps = app.payment ? PAYMENT_STATUS[app.payment.status] || null : null;
            return (
              <motion.div key={app.id} variants={item}>
                <Link
                  to={`/citizen/applications/${app.id}`}
                  className="block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-blue-500/5 transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-lg shadow-lg shadow-blue-500/20 flex-shrink-0">
                      📄
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">{app.certificateType?.nameMarathi}</h3>
                          <p className="text-xs text-gray-400">{app.applicationNo}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap ${st.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.labelMr}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-1">
                        <span>{app.applicantName}</span>
                        <span>•</span>
                        <span>{new Date(app.createdAt).toLocaleDateString("mr-IN")}</span>
                        {app.certificateType?.fee > 0 && ps && (
                          <>
                            <span>•</span>
                            <span className={`px-2 py-0.5 rounded-md font-medium ${ps.bg}`}>₹{app.certificateType.fee} {ps.label}</span>
                          </>
                        )}
                        {app.certificateNo && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 font-medium">प्रमाणपत्र: {app.certificateNo}</span>
                          </>
                        )}
                      </div>
                      {/* Download links */}
                      <div className="flex gap-2 mt-2">
                        {app.certificateUrl && (
                          <a
                            href={`${getBackendBase()}${app.certificateUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg font-semibold hover:bg-emerald-100 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            प्रमाणपत्र
                          </a>
                        )}
                        {app.payment?.receiptUrl && (
                          <a
                            href={`${getBackendBase()}${app.payment.receiptUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] bg-violet-50 text-violet-600 px-2.5 py-1 rounded-lg font-semibold hover:bg-violet-100 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            पावती
                          </a>
                        )}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-300 flex-shrink-0 mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-sm font-semibold text-gray-600 px-3">{page} / {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
