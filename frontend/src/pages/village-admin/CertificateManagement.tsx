import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { villageAdminService } from "../../services/villageAdminService";
import { citizenService } from "../../services/citizenService";
import type { CertificateApplication, CertificateType, Family, FamilyMember } from "../../services/citizenService";
import { useTenant } from "../../context/TenantContext";
import { getCertificateFields, type FieldDef } from "../../utils/certificateFields";

/* ─── Helpers ──────────────────────────────────────────── */
function getBackendBase() {
  const port = window.location.port;
  return !port || port === "80" || port === "443"
    ? window.location.origin
    : `http://${window.location.hostname}:5000`;
}

const STATUS_LABELS: Record<string, { label: string; bg: string; dot: string }> = {
  under_review: { label: "पुनरावलोकनात", bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-400" },
  approved:     { label: "मंजूर",          bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
  rejected:     { label: "नाकारले",        bg: "bg-red-50 text-red-700 border-red-200",        dot: "bg-red-400" },
  issued:       { label: "जारी",           bg: "bg-blue-50 text-blue-700 border-blue-200",      dot: "bg-blue-400" },
};

const PAY_LABELS: Record<string, { label: string; bg: string }> = {
  pending:   { label: "बाकी",     bg: "bg-amber-50 text-amber-700" },
  submitted: { label: "सबमिट",    bg: "bg-blue-50 text-blue-700" },
  verified:  { label: "पडताळले",   bg: "bg-emerald-50 text-emerald-700" },
  rejected:  { label: "नाकारले",   bg: "bg-red-50 text-red-700" },
};

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("mr-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function financialYears(): string[] {
  const now = new Date();
  const y = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return Array.from({ length: 5 }, (_, i) => {
    const s = y - i;
    return `${s}-${String(s + 1).slice(2)}`;
  });
}

/* ─── Dynamic Form Field renderer ─────────────────────── */
function DynField({ f, value, onChange, disabled }: { f: FieldDef; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const cls = "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed";
  if (f.type === "select")
    return (
      <select value={value} onChange={e => onChange(e.target.value)} required={f.required} disabled={disabled} className={cls}>
        <option value="">— निवडा —</option>
        {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  if (f.type === "textarea")
    return <textarea value={value} onChange={e => onChange(e.target.value)} required={f.required} placeholder={f.placeholder} rows={2} disabled={disabled} className={cls + " resize-none"} />;
  return <input type={f.type} value={value} onChange={e => onChange(e.target.value)} required={f.required} placeholder={f.placeholder} disabled={disabled} className={cls} />;
}

/* ═══════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════ */
export default function CertificateManagement() {
  const { village } = useTenant();

  /* ── Tab state ───────────────────────────────── */
  const [tab, setTab] = useState<"applications" | "apply" | "register" | "sahpatra">("applications");

  /* ── Cert types (shared across tabs) ─────────── */
  const [certTypes, setCertTypes] = useState<CertificateType[]>([]);

  useEffect(() => {
    citizenService.getCertificateTypes().then(r => setCertTypes(r.data || [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">प्रमाणपत्र व्यवस्थापन</h1>
          <p className="text-sm text-gray-500">अर्ज, पेमेंट, मंजूरी — सर्व एकाच ठिकाणी</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {([
          { key: "applications", label: "📋 अर्ज" },
          { key: "apply",        label: "➕ नवीन अर्ज" },
          { key: "register",     label: "👤 नागरिक नोंदणी" },
          { key: "sahpatra",     label: "📖 सहपत्र-ब रजिस्टर" },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${tab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "applications" && <ApplicationsTab certTypes={certTypes} />}
      {tab === "apply"        && <ApplyOnBehalfTab certTypes={certTypes} village={village} onDone={() => setTab("applications")} />}
      {tab === "register"     && <RegisterCitizenTab village={village} />}
      {tab === "sahpatra"     && <RegisterTab certTypes={certTypes} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB 1 — Applications List + View/Edit/Verify
   ═══════════════════════════════════════════════════════════ */
function ApplicationsTab({ certTypes }: { certTypes: CertificateType[] }) {
  const [apps, setApps] = useState<CertificateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState({ status: "", certTypeId: "", search: "" });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  /* Modal state */
  const [selectedApp, setSelectedApp] = useState<CertificateApplication | null>(null);
  const [modal, setModal] = useState<"" | "view" | "edit" | "verify" | "update">("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [appRes, statsRes] = await Promise.all([
        villageAdminService.getCertificateApplications({ ...filter, page, limit, status: filter.status || undefined, certificateTypeId: filter.certTypeId || undefined, search: filter.search || undefined }),
        villageAdminService.getCertificateStats(),
      ]);
      const d = appRes.data;
      setApps(d?.applications || d || []);
      setTotal(d?.pagination?.total || 0);
      setStats(statsRes.data);
    } catch { /* ignore */ }
    setLoading(false);
  }, [filter, page]);

  useEffect(() => { load(); }, [load]);

  const openModal = async (app: CertificateApplication, action: typeof modal) => {
    // Re-fetch full detail
    try {
      const r = await villageAdminService.getCertificateApplication(app.id);
      setSelectedApp(r.data);
    } catch {
      setSelectedApp(app);
    }
    setModal(action);
    setMsg("");
  };

  const closeModal = () => { setModal(""); setSelectedApp(null); setMsg(""); };

  /* ── Verify / Reject Payment ───────── */
  const [verifyRemarks, setVerifyRemarks] = useState("");
  const handleVerifyPayment = async (verified: boolean) => {
    if (!selectedApp) return;
    setBusy(true);
    try {
      await villageAdminService.verifyCertificatePayment(selectedApp.id, { verified, remarks: verifyRemarks });
      setMsg(verified ? "✅ पेमेंट पडताळले!" : "❌ पेमेंट नाकारले!");
      load();
      setTimeout(closeModal, 1200);
    } catch { setMsg("⚠️ त्रुटी"); }
    setBusy(false);
  };

  /* ── Cash / Offline Payment ──────── */
  const handleCash = async (app: CertificateApplication) => {
    if (!confirm("रोख पेमेंट म्हणून नोंद करायची?")) return;
    try {
      await villageAdminService.markOfflinePayment(app.id, { remarks: "Cash collected by admin" });
      load();
    } catch { alert("त्रुटी"); }
  };

  /* ── Approve / Reject ──────────── */
  const [updateRemarks, setUpdateRemarks] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const handleApprove = async () => {
    if (!selectedApp) return;
    setBusy(true);
    try {
      await villageAdminService.updateCertificateApplication(selectedApp.id, { status: "approved", adminRemarks: updateRemarks || undefined });
      setMsg("✅ अर्ज मंजूर! प्रमाणपत्र PDF तयार झाले.");
      load();
      setTimeout(closeModal, 1500);
    } catch { setMsg("⚠️ त्रुटी"); }
    setBusy(false);
  };
  const handleReject = async () => {
    if (!selectedApp || !rejectReason.trim()) { setMsg("कारण लिहा!"); return; }
    setBusy(true);
    try {
      await villageAdminService.updateCertificateApplication(selectedApp.id, { status: "rejected", rejectionReason: rejectReason, adminRemarks: updateRemarks || undefined });
      setMsg("❌ अर्ज नाकारला.");
      load();
      setTimeout(closeModal, 1200);
    } catch { setMsg("⚠️ त्रुटी"); }
    setBusy(false);
  };

  /* ── Edit form data (under_review only) ── */
  const [editFormData, setEditFormData] = useState<Record<string, string>>({});
  const [editName, setEditName] = useState("");
  const [editAadhar, setEditAadhar] = useState("");
  const [editDocs, setEditDocs] = useState<string[]>([]);
  const editFields = useMemo(() => {
    if (!selectedApp) return [] as FieldDef[];
    return getCertificateFields(selectedApp.certificateType?.code || "");
  }, [selectedApp]);

  const openEdit = (app: CertificateApplication) => {
    const fd = (app.formData || {}) as Record<string, string>;
    setEditFormData({ ...fd });
    setEditName(app.applicantName);
    setEditAadhar(app.applicantAadhar);
    setEditDocs(Array.isArray(app.documents) ? [...app.documents as string[]] : []);
    openModal(app, "edit");
  };

  const handleSaveEdit = async () => {
    if (!selectedApp) return;
    setBusy(true);
    try {
      await villageAdminService.updateCertificateApplication(selectedApp.id, {
        formData: editFormData,
        applicantName: editName,
        applicantAadhar: editAadhar,
        documents: editDocs,
        adminRemarks: updateRemarks || undefined,
      });
      setMsg("✅ बदल जतन!");
      load();
      setTimeout(closeModal, 1000);
    } catch { setMsg("⚠️ जतन अयशस्वी"); }
    setBusy(false);
  };

  /* ── Stats cards ─────────────── */
  const statCards = stats ? [
    { label: "एकूण अर्ज",   value: stats.total,           color: "bg-blue-50 text-blue-700" },
    { label: "पुनरावलोकनात", value: stats.byStatus?.under_review,     color: "bg-amber-50 text-amber-700" },
    { label: "मंजूर",        value: stats.byStatus?.approved,         color: "bg-emerald-50 text-emerald-700" },
    { label: "नाकारले",      value: stats.byStatus?.rejected,         color: "bg-red-50 text-red-700" },
    { label: "पेमेंट बाकी",  value: stats.byPayment?.pending,   color: "bg-violet-50 text-violet-700" },
    { label: "पेमेंट पडताळले", value: stats.byPayment?.verified, color: "bg-teal-50 text-teal-700" },
  ] : [];

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-4">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statCards.map(s => (
            <div key={s.label} className={`rounded-xl px-4 py-3 ${s.color}`}>
              <p className="text-2xl font-extrabold">{s.value}</p>
              <p className="text-xs font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 flex flex-wrap gap-3">
        <select value={filter.status} onChange={e => { setFilter(f => ({ ...f, status: e.target.value })); setPage(1); }}
          className="px-3 py-2 rounded-lg border text-sm">
          <option value="">सर्व स्थिती</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filter.certTypeId} onChange={e => { setFilter(f => ({ ...f, certTypeId: e.target.value })); setPage(1); }}
          className="px-3 py-2 rounded-lg border text-sm">
          <option value="">सर्व प्रमाणपत्रे</option>
          {certTypes.map(c => <option key={c.id} value={c.id}>{c.nameMarathi}</option>)}
        </select>
        <input placeholder="🔍 शोधा — अर्ज क्र. / नाव / आधार"
          value={filter.search} onChange={e => { setFilter(f => ({ ...f, search: e.target.value })); setPage(1); }}
          className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border text-sm" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">अर्ज क्र.</th>
              <th className="px-4 py-3 font-semibold text-gray-600">प्रमाणपत्र</th>
              <th className="px-4 py-3 font-semibold text-gray-600">अर्जदार</th>
              <th className="px-4 py-3 font-semibold text-gray-600">तारीख</th>
              <th className="px-4 py-3 font-semibold text-gray-600">स्थिती</th>
              <th className="px-4 py-3 font-semibold text-gray-600">पेमेंट</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-right">क्रिया</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse"><td colSpan={7} className="px-4 py-4"><div className="h-4 bg-gray-100 rounded w-full" /></td></tr>
              ))
            ) : apps.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">अर्ज सापडले नाहीत</td></tr>
            ) : apps.map(a => {
              const st = STATUS_LABELS[a.status] || STATUS_LABELS.under_review;
              const pt = a.payment ? (PAY_LABELS[a.payment.status] || PAY_LABELS.pending) : null;
              return (
                <tr key={a.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{a.applicationNo}{a.appliedByAdmin && <span className="ml-1 text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">Admin</span>}</td>
                  <td className="px-4 py-3">{a.certificateType?.nameMarathi}</td>
                  <td className="px-4 py-3"><div className="font-medium">{a.applicantName}</div><div className="text-xs text-gray-400">{a.applicantAadhar}</div></td>
                  <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(a.createdAt)}</td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border font-semibold ${st.bg}`}><span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{st.label}</span></td>
                  <td className="px-4 py-3">
                    {!pt ? <span className="text-xs text-gray-400">निशुल्क</span> :
                      <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${pt.bg}`}>{pt.label} ₹{a.payment?.amount}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1 flex-wrap">
                      <Btn title="पहा" icon="👁️" onClick={() => openModal(a, "view")} />
                      {a.status === "under_review" && <Btn title="संपादन" icon="✏️" onClick={() => openEdit(a)} />}
                      {a.payment && (a.payment.status === "submitted" || a.payment.status === "pending") && (
                        <>
                          <Btn title="पेमेंट सत्यापित" icon="✓" cls="bg-emerald-50 text-emerald-600 hover:bg-emerald-100" onClick={() => openModal(a, "verify")} />
                          {a.payment.status === "pending" && <Btn title="रोख" icon="💵" cls="bg-violet-50 text-violet-600 hover:bg-violet-100" onClick={() => handleCash(a)} />}
                        </>
                      )}
                      {a.status === "under_review" && (!a.payment || a.payment.status === "verified" || a.certificateType?.fee === 0) && (
                        <Btn title="मंजूरी / नकार" icon="⚖️" cls="bg-blue-50 text-blue-600 hover:bg-blue-100" onClick={() => openModal(a, "update")} />
                      )}
                      {a.certificateUrl && <Btn title="📥 PDF डाउनलोड" icon="📥" onClick={() => window.open(`${getBackendBase()}${a.certificateUrl}`, "_blank")} showLabel />}
                      {a.payment?.receiptUrl && <Btn title="पावती" icon="🧾" onClick={() => window.open(`${getBackendBase()}${a.payment!.receiptUrl}`, "_blank")} />}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-30">← Prev</button>
          <span className="text-sm text-gray-500 px-3 py-1.5">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-30">Next →</button>
        </div>
      )}

      {/* ───── MODALS ────────────────────────────────────── */}
      {modal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* ──── VIEW MODAL ────── */}
            {modal === "view" && <ViewModal app={selectedApp} onClose={closeModal} />}

            {/* ──── VERIFY PAYMENT ──── */}
            {modal === "verify" && (
              <div className="p-6 space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2">💳 पेमेंट पडताळणी — {selectedApp.applicationNo}</h2>
                {selectedApp.payment && (
                  <div className="grid grid-cols-2 gap-3">
                    <Info label="रक्कम" value={`₹${selectedApp.payment.amount}/-`} />
                    <Info label="UTR" value={selectedApp.payment.utrNumber || "—"} />
                    <Info label="पद्धत" value={selectedApp.payment.paymentMethod || "—"} />
                    <Info label="स्थिती" value={PAY_LABELS[selectedApp.payment.status]?.label || selectedApp.payment.status} />
                  </div>
                )}
                {selectedApp.payment?.screenshotUrl && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">स्क्रीनशॉट</p>
                    <a href={`${getBackendBase()}${selectedApp.payment.screenshotUrl}`} target="_blank" rel="noopener noreferrer">
                      <img src={`${getBackendBase()}${selectedApp.payment.screenshotUrl}`} alt="Payment SS" className="h-48 rounded-xl border object-contain" />
                    </a>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">शेरा</label>
                  <input value={verifyRemarks} onChange={e => setVerifyRemarks(e.target.value)} placeholder="पडताळणी शेरा" className="w-full px-3 py-2 rounded-lg border text-sm" />
                </div>
                {msg && <p className="text-sm font-semibold">{msg}</p>}
                <div className="flex gap-3">
                  <button disabled={busy} onClick={() => handleVerifyPayment(true)} className="flex-1 bg-emerald-500 text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50">✅ पडताळा</button>
                  <button disabled={busy} onClick={() => handleVerifyPayment(false)} className="flex-1 bg-red-500 text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50">❌ नाकारा</button>
                  <button onClick={closeModal} className="px-4 py-2.5 rounded-lg border text-sm">बंद</button>
                </div>
              </div>
            )}

            {/* ──── APPROVE / REJECT ──── */}
            {modal === "update" && (
              <div className="p-6 space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2">⚖️ मंजूरी / नकार — {selectedApp.applicationNo}</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Info label="प्रमाणपत्र" value={selectedApp.certificateType?.nameMarathi} />
                  <Info label="अर्जदार" value={selectedApp.applicantName} />
                  <Info label="आधार" value={selectedApp.applicantAadhar} />
                  <Info label="सध्याची स्थिती" value={STATUS_LABELS[selectedApp.status]?.label || selectedApp.status} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">प्रशासन शेरा (अंतर्गत)</label>
                  <textarea value={updateRemarks} onChange={e => setUpdateRemarks(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border text-sm resize-none" placeholder="अंतर्गत शेरा (नागरिकाला दिसणार नाही)" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">नकाराचे कारण (नकार असल्यास अनिवार्य)</label>
                  <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border text-sm resize-none" placeholder="नकार कारण लिहा..." />
                </div>
                {msg && <p className="text-sm font-semibold">{msg}</p>}
                <div className="flex gap-3">
                  <button disabled={busy} onClick={handleApprove} className="flex-1 bg-emerald-500 text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50">✅ मंजूर करा</button>
                  <button disabled={busy} onClick={handleReject} className="flex-1 bg-red-500 text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50">❌ नाकारा</button>
                  <button onClick={closeModal} className="px-4 py-2.5 rounded-lg border text-sm">बंद</button>
                </div>
              </div>
            )}

            {/* ──── EDIT FORM DATA ──── */}
            {modal === "edit" && (
              <div className="p-6 space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2">✏️ अर्ज संपादन — {selectedApp.applicationNo}</h2>
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">⚠️ संपादन फक्त "पुनरावलोकनात" स्थितीत शक्य आहे</p>

                {/* Applicant details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">अर्जदाराचे नाव *</label>
                    <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">आधार क्र. *</label>
                    <input value={editAadhar} onChange={e => setEditAadhar(e.target.value)} maxLength={12} className="w-full px-3 py-2 rounded-lg border text-sm" />
                  </div>
                </div>

                {/* Dynamic form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {editFields.map(f => (
                    <div key={f.name} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">{f.label}{f.required && " *"}</label>
                      <DynField f={f} value={editFormData[f.name] || ""} onChange={v => setEditFormData(p => ({ ...p, [f.name]: v }))} />
                    </div>
                  ))}
                </div>

                {/* Documents */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">दस्तावेज URLs</p>
                  {editDocs.map((d, i) => (
                    <div key={i} className="flex gap-2 mb-1">
                      <input value={d} onChange={e => { const arr = [...editDocs]; arr[i] = e.target.value; setEditDocs(arr); }} className="flex-1 px-3 py-1.5 rounded-lg border text-xs" />
                      <button type="button" onClick={() => setEditDocs(editDocs.filter((_, j) => j !== i))} className="text-red-500 text-xs font-bold px-2">✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setEditDocs([...editDocs, ""])} className="text-xs text-blue-500 font-semibold mt-1">+ URL जोडा</button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">शेरा</label>
                  <input value={updateRemarks} onChange={e => setUpdateRemarks(e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" placeholder="संपादन शेरा" />
                </div>

                {msg && <p className="text-sm font-semibold">{msg}</p>}
                <div className="flex gap-3">
                  <button disabled={busy} onClick={handleSaveEdit} className="flex-1 bg-blue-500 text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50">💾 जतन करा</button>
                  <button onClick={closeModal} className="px-4 py-2.5 rounded-lg border text-sm">बंद</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── View Modal (full application detail) ──────────── */
function ViewModal({ app, onClose }: { app: CertificateApplication; onClose: () => void }) {
  const formEntries = Object.entries((app.formData || {}) as Record<string, unknown>);
  const docs = Array.isArray(app.documents) ? app.documents as string[] : [];
  const st = STATUS_LABELS[app.status] || STATUS_LABELS.under_review;
  const [downloading, setDownloading] = useState<{ certificate?: boolean; receipt?: boolean }>({});

  const handleDownloadCertificate = async () => {
    setDownloading((prev) => ({ ...prev, certificate: true }));
    try {
      const blob = await villageAdminService.downloadCertificate(app.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Certificate_${app.applicationNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("प्रमाणपत्र डाउनलोड अयशस्वी");
    } finally {
      setDownloading((prev) => ({ ...prev, certificate: false }));
    }
  };

  const handleDownloadReceipt = async () => {
    setDownloading((prev) => ({ ...prev, receipt: true }));
    try {
      const blob = await villageAdminService.downloadReceipt(app.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Receipt_${app.applicationNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("पावती डाउनलोड अयशस्वी");
    } finally {
      setDownloading((prev) => ({ ...prev, receipt: false }));
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">अर्ज तपशील / Application Details — {app.applicationNo}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
      </div>

      {/* Status badge */}
      <div className={`inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border font-bold ${st.bg}`}>
        <span className={`w-2 h-2 rounded-full ${st.dot}`} /> {st.label}
        {app.appliedByAdmin && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded ml-2">Admin द्वारे</span>}
      </div>

      {/* App info grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Info label="प्रमाणपत्र / Certificate" value={app.certificateType?.nameMarathi} />
        <Info label="अर्जदार / Applicant" value={app.applicantName} />
        <Info label="आधार / Aadhar" value={app.applicantAadhar} />
        <Info label="कुटुंब / Family" value={app.family ? `${app.family.headName} (${app.family.familyId})` : "—"} />
        <Info label="अर्ज तारीख / Application Date" value={fmtDate(app.createdAt)} />
        <Info label="शुल्क / Fee" value={app.certificateType?.fee > 0 ? `₹${app.certificateType.fee}/-` : "निशुल्क"} />
        {app.certificateNo && <Info label="प्रमाणपत्र क्र. / Certificate No." value={app.certificateNo} />}
        {app.dispatchNo && <Info label="डिस्पॅच क्र. / Dispatch No." value={app.dispatchNo} />}
      </div>

      {/* Rejection reason */}
      {app.rejectionReason && (
        <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-2 text-sm text-red-700">
          <strong>नकार कारण:</strong> {app.rejectionReason}
        </div>
      )}
      {app.adminRemarks && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 text-sm text-blue-700">
          <strong>प्रशासन शेरा:</strong> {app.adminRemarks}
        </div>
      )}

      {/* Form data */}
      {formEntries.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2">भरलेला डेटा / Form Data</h3>
          <div className="grid grid-cols-2 gap-2">
            {formEntries.map(([k, v]) => <Info key={k} label={k} value={String(v)} />)}
          </div>
        </div>
      )}

      {/* Documents / Photos */}
      {docs.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2">अपलोड दस्तावेज / Uploaded Documents</h3>
          <div className="flex gap-3 flex-wrap">
            {docs.map((d, i) => (
              <a key={i} href={`${getBackendBase()}${d}`} target="_blank" rel="noopener noreferrer" className="block">
                <img src={`${getBackendBase()}${d}`} alt={`Doc ${i + 1}`} className="w-24 h-24 object-cover rounded-lg border hover:border-blue-400 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Payment info */}
      {app.payment && (
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2">पेमेंट माहिती / Payment Info</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Info label="रक्कम / Amount" value={`₹${app.payment.amount}/-`} />
            <Info label="UTR" value={app.payment.utrNumber || "—"} />
            <Info label="पद्धत / Method" value={app.payment.paymentMethod || "—"} />
            <Info label="स्थिती / Status" value={PAY_LABELS[app.payment.status]?.label || app.payment.status} />
            {app.payment.receiptNo && <Info label="पावती क्र. / Receipt No." value={app.payment.receiptNo} />}
            {app.payment.verifiedAt && <Info label="पडताळणी / Verified" value={fmtDate(app.payment.verifiedAt)} />}
            {app.payment.remarks && <Info label="शेरा / Remarks" value={app.payment.remarks} />}
          </div>
          {app.payment.screenshotUrl && (
            <a href={`${getBackendBase()}${app.payment.screenshotUrl}`} target="_blank" rel="noopener noreferrer" className="inline-block mt-2">
              <img src={`${getBackendBase()}${app.payment.screenshotUrl}`} alt="Screenshot" className="h-32 rounded-lg border" />
            </a>
          )}
        </div>
      )}

      {/* Download actions */}
      <div className="flex flex-wrap gap-2 pt-2 border-t">
        {(app.status === "approved" || app.status === "issued") && (
          <button
            onClick={handleDownloadCertificate}
            disabled={downloading.certificate}
            className="inline-flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading.certificate ? "⏳ डाउनलोड करत आहे..." : "📥 प्रमाणपत्र PDF"}
          </button>
        )}
        {app.payment?.status === "verified" && (
          <button
            onClick={handleDownloadReceipt}
            disabled={downloading.receipt}
            className="inline-flex items-center gap-1.5 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading.receipt ? "⏳ डाउनलोड करत आहे..." : "🧾 पावती PDF"}
          </button>
        )}
        <button onClick={onClose} className="ml-auto px-4 py-2 rounded-lg border text-sm font-semibold text-gray-600">बंद</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB 2 — Apply on Behalf of Citizen
   ═══════════════════════════════════════════════════════════ */
function ApplyOnBehalfTab({ certTypes, village, onDone }: { certTypes: CertificateType[]; village: any; onDone: () => void }) {
  const [step, setStep] = useState(1); // 1: select family, 2: cert form, 3: confirm

  /* Family search state */
  const [searchQ, setSearchQ] = useState("");
  const [families, setFamilies] = useState<Family[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState("");

  /* Cert form state */
  const [certTypeId, setCertTypeId] = useState("");
  const [applicantName, setApplicantName] = useState("");
  const [applicantAadhar, setApplicantAadhar] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [paymentCollected, setPaymentCollected] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState("");

  const selectedCertType = useMemo(() => certTypes.find(c => c.id === certTypeId), [certTypes, certTypeId]);
  const fields = useMemo(() => selectedCertType ? getCertificateFields(selectedCertType.code) : [], [selectedCertType]);

  const searchFamilies = useCallback(async () => {
    if (!searchQ.trim()) return;
    setSearchLoading(true);
    try {
      const r = await villageAdminService.searchFamilies({ search: searchQ });
      setFamilies(r.data || []);
    } catch { /* noop */ }
    setSearchLoading(false);
  }, [searchQ]);

  const selectFamily = (fam: Family) => {
    setSelectedFamily(fam);
    setApplicantName(fam.headName);
    setApplicantAadhar(fam.headAadhar);
    setSelectedMemberId("");
  };

  const selectMember = (memberId: string) => {
    setSelectedMemberId(memberId);
    if (!selectedFamily) return;
    if (!memberId || memberId === "__head__") {
      setApplicantName(selectedFamily.headName);
      setApplicantAadhar(selectedFamily.headAadhar);
    } else {
      const m = selectedFamily.members?.find((x: FamilyMember) => x.id === memberId);
      if (m) { setApplicantName(m.name); setApplicantAadhar(m.aadhar); }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFamily || !certTypeId) return;
    setSubmitting(true);
    setError("");
    try {
      const r = await villageAdminService.applyOnBehalf({
        familyId: selectedFamily.id,
        familyMemberId: selectedMemberId && selectedMemberId !== "__head__" ? selectedMemberId : undefined,
        certificateTypeId: certTypeId,
        applicantName,
        applicantAadhar,
        formData,
        paymentCollected,
      });
      setResult(`✅ अर्ज सादर! क्रमांक: ${r.data?.applicationNo || "—"}`);
      setStep(3);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || "अर्ज सादर अयशस्वी");
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {["कुटुंब निवडा", "अर्ज भरा", "यशस्वी"].map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step > i + 1 ? "bg-emerald-500 text-white" : step === i + 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-400"}`}>{i + 1}</div>
            <span className={`text-xs font-medium hidden sm:block ${step >= i + 1 ? "text-gray-800" : "text-gray-400"}`}>{s}</span>
            {i < 2 && <div className={`flex-1 h-0.5 rounded ${step > i + 1 ? "bg-emerald-400" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {/* Step 3: Success */}
      {step === 3 && (
        <div className="bg-white rounded-xl border p-8 text-center space-y-4">
          <div className="text-5xl">🎉</div>
          <h2 className="text-lg font-bold text-gray-900">{result}</h2>
          <button onClick={onDone} className="bg-blue-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm">अर्ज यादी पहा</button>
        </div>
      )}

      {/* Step 1: Family search */}
      {step === 1 && (
        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h2 className="font-bold text-gray-900">1️⃣ कुटुंब शोधा व निवडा</h2>
          <div className="flex gap-2">
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="नाव / आधार / कुटुंब ID" onKeyDown={e => e.key === "Enter" && searchFamilies()}
              className="flex-1 px-3 py-2 rounded-lg border text-sm" />
            <button onClick={searchFamilies} disabled={searchLoading} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
              {searchLoading ? "..." : "शोधा"}
            </button>
          </div>

          {/* Results */}
          {families.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {families.map(f => (
                <button key={f.id} onClick={() => selectFamily(f)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${selectedFamily?.id === f.id ? "border-blue-400 bg-blue-50" : "hover:bg-gray-50"}`}>
                  <div className="font-medium text-sm">{f.headName}</div>
                  <div className="text-xs text-gray-400">कु. ID: {f.familyId} | आधार: {f.headAadhar} | सदस्य: {f.members?.length || 0}</div>
                </button>
              ))}
            </div>
          )}

          {/* Selected family — member selection */}
          {selectedFamily && (
            <div className="bg-blue-50/60 rounded-lg p-4 space-y-3">
              <p className="text-sm font-bold text-blue-800">निवडलेले कुटुंब: {selectedFamily.headName} ({selectedFamily.familyId})</p>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">अर्जदार सदस्य निवडा</label>
                <select value={selectedMemberId} onChange={e => selectMember(e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm">
                  <option value="__head__">{selectedFamily.headName} (कुटुंब प्रमुख)</option>
                  {selectedFamily.members?.map((m: FamilyMember) => <option key={m.id} value={m.id}>{m.name} ({m.relation})</option>)}
                </select>
              </div>
              <div className="bg-white rounded-lg px-3 py-2 text-sm">
                <strong>अर्जदार:</strong> {applicantName} | <strong>आधार:</strong> {applicantAadhar}
              </div>
              <button onClick={() => setStep(2)} className="bg-blue-500 text-white w-full py-2.5 rounded-lg font-semibold text-sm">पुढे जा →</button>
            </div>
          )}

          <p className="text-xs text-gray-400">कुटुंब सापडत नसल्यास "नागरिक नोंदणी" टॅबवरून नवीन कुटुंब नोंदणी करा.</p>
        </div>
      )}

      {/* Step 2: Certificate form */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-xl border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">2️⃣ प्रमाणपत्र अर्ज भरा</h2>
              <button type="button" onClick={() => setStep(1)} className="text-xs text-blue-500 font-semibold">← मागे</button>
            </div>

            {/* Applicant info card */}
            <div className="bg-gray-50 rounded-lg px-4 py-3">
              <p className="text-xs text-gray-500">अर्जदार</p>
              <p className="font-semibold text-sm">{applicantName} — {applicantAadhar}</p>
            </div>

            {/* Cert type select */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">प्रमाणपत्र प्रकार *</label>
              <select value={certTypeId} onChange={e => { setCertTypeId(e.target.value); setFormData({}); }} required className="w-full px-3 py-2 rounded-lg border text-sm">
                <option value="">— प्रकार निवडा —</option>
                {certTypes.filter(c => c.isActive).map(c => (
                  <option key={c.id} value={c.id}>{c.nameMarathi} ({c.nameEnglish}) {c.fee > 0 ? `₹${c.fee}` : "निशुल्क"}</option>
                ))}
              </select>
            </div>

            {/* Dynamic form */}
            {selectedCertType && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {fields.map(f => (
                    <div key={f.name} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">{f.label}{f.required && " *"}</label>
                      <DynField f={f} value={formData[f.name] || ""} onChange={v => setFormData(p => ({ ...p, [f.name]: v }))} />
                    </div>
                  ))}
                </div>

                {/* Payment handling */}
                {selectedCertType.fee > 0 && (
                  <div className="bg-violet-50 rounded-lg px-4 py-3 space-y-2">
                    <p className="text-sm font-semibold text-violet-800">💳 शुल्क: ₹{selectedCertType.fee}/-</p>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={paymentCollected} onChange={e => setPaymentCollected(e.target.checked)} className="rounded" />
                      <span className="text-sm text-violet-700">रोख पैसे गोळा केले (Cash collected) — ऑटो-सत्यापित</span>
                    </label>
                    {!paymentCollected && <p className="text-xs text-violet-500">✦ चेक नसल्यास पेमेंट "बाकी" म्हणून राहील</p>}
                  </div>
                )}
              </>
            )}
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="px-5 py-2.5 rounded-lg border text-sm font-semibold">← मागे</button>
            <button type="submit" disabled={submitting || !certTypeId} className="flex-1 bg-blue-500 text-white py-2.5 rounded-lg font-bold text-sm disabled:opacity-50">
              {submitting ? "सादर होत आहे..." : "अर्ज सादर करा"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB 3 — Register Citizen (Family + Members)
   ═══════════════════════════════════════════════════════════ */
function RegisterCitizenTab({ village }: { village: any }) {
  const [headName, setHeadName] = useState("");
  const [headDob, setHeadDob] = useState("");
  const [headAadhar, setHeadAadhar] = useState("");
  const [phone, setPhone] = useState("");
  const [headRationCard, setHeadRationCard] = useState("");
  const [headVoterId, setHeadVoterId] = useState("");

  const [members, setMembers] = useState<{ name: string; dob: string; aadhar: string; relation: string; voterId: string }[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const addMember = () => setMembers([...members, { name: "", dob: "", aadhar: "", relation: "", voterId: "" }]);
  const removeMember = (i: number) => setMembers(members.filter((_, j) => j !== i));
  const updateMember = (i: number, k: string, v: string) => {
    const arr = [...members];
    (arr[i] as any)[k] = v;
    setMembers(arr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setResult("");
    try {
      const r = await villageAdminService.addFamily({ headName, headDob, headAadhar, phone: phone || undefined, headRationCard: headRationCard || undefined, headVoterId: headVoterId || undefined });
      const familyId = r.data?.id;
      let membersAdded = 0;
      if (familyId && members.length > 0) {
        for (const m of members) {
          if (m.name && m.aadhar) {
            try {
              await villageAdminService.addFamilyMember(familyId, { name: m.name, dob: m.dob, aadhar: m.aadhar, relation: m.relation, voterId: m.voterId || undefined });
              membersAdded++;
            } catch { /* skip */ }
          }
        }
      }
      setResult(`✅ कुटुंब नोंदणी यशस्वी! ID: ${r.data?.familyId || "—"}${membersAdded > 0 ? ` | ${membersAdded} सदस्य जोडले` : ""}`);
      // Reset
      setHeadName(""); setHeadDob(""); setHeadAadhar(""); setPhone(""); setHeadRationCard(""); setHeadVoterId(""); setMembers([]);
    } catch (err: any) {
      setError(err?.response?.data?.message || "नोंदणी अयशस्वी");
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
      {/* Head details */}
      <div className="bg-white rounded-xl border p-5 space-y-4">
        <h2 className="font-bold text-gray-900">👤 कुटुंब प्रमुख माहिती</h2>
        <p className="text-xs text-gray-400">गाव: <strong>{village?.name || "—"}</strong> (ऑटो)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">पूर्ण नाव *</label>
            <input value={headName} onChange={e => setHeadName(e.target.value)} required className="w-full px-3 py-2 rounded-lg border text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">जन्मतारीख *</label>
            <input type="date" value={headDob} onChange={e => setHeadDob(e.target.value)} required className="w-full px-3 py-2 rounded-lg border text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">आधार क्र. * (12 अंक)</label>
            <input value={headAadhar} onChange={e => setHeadAadhar(e.target.value)} required maxLength={12} pattern="\d{12}" className="w-full px-3 py-2 rounded-lg border text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">मोबाईल</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} maxLength={10} className="w-full px-3 py-2 rounded-lg border text-sm" placeholder="ऐच्छिक" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">रेशन कार्ड क्र.</label>
            <input value={headRationCard} onChange={e => setHeadRationCard(e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">मतदार ओळखपत्र</label>
            <input value={headVoterId} onChange={e => setHeadVoterId(e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="bg-white rounded-xl border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900">👨‍👩‍👧‍👦 कुटुंब सदस्य (ऐच्छिक)</h2>
          <button type="button" onClick={addMember} className="text-sm text-blue-500 font-semibold">+ सदस्य जोडा</button>
        </div>

        {members.length === 0 && <p className="text-sm text-gray-400 text-center py-4">सदस्य जोडले नाहीत. "सदस्य जोडा" बटणावर क्लिक करा.</p>}

        {members.map((m, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-4 space-y-3 relative">
            <button type="button" onClick={() => removeMember(i)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 text-lg">&times;</button>
            <p className="text-xs font-bold text-gray-500">सदस्य {i + 1}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">नाव *</label>
                <input value={m.name} onChange={e => updateMember(i, "name", e.target.value)} required className="w-full px-3 py-2 rounded-lg border text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">जन्मतारीख *</label>
                <input type="date" value={m.dob} onChange={e => updateMember(i, "dob", e.target.value)} required className="w-full px-3 py-2 rounded-lg border text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">आधार *</label>
                <input value={m.aadhar} onChange={e => updateMember(i, "aadhar", e.target.value)} required maxLength={12} className="w-full px-3 py-2 rounded-lg border text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">नाते *</label>
                <select value={m.relation} onChange={e => updateMember(i, "relation", e.target.value)} required className="w-full px-3 py-2 rounded-lg border text-sm">
                  <option value="">— निवडा —</option>
                  {["पत्नी / Wife", "पती / Husband", "मुलगा / Son", "मुलगी / Daughter", "वडील / Father", "आई / Mother", "भाऊ / Brother", "बहीण / Sister", "सासू / Mother-in-law", "सासरा / Father-in-law", "इतर / Other"].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">मतदार ओळखपत्र</label>
                <input value={m.voterId} onChange={e => updateMember(i, "voterId", e.target.value)} className="w-full px-3 py-2 rounded-lg border text-sm" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {result && <p className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-4 py-3 rounded-lg">{result}</p>}
      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}

      <button type="submit" disabled={submitting} className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold text-sm disabled:opacity-50">
        {submitting ? "नोंदणी होत आहे..." : "कुटुंब नोंदणी करा"}
      </button>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════
   TAB 4 — Certificate Register (सहपत्र-ब)
   ═══════════════════════════════════════════════════════════ */
function RegisterTab({ certTypes }: { certTypes: CertificateType[] }) {
  const [fy, setFy] = useState(financialYears()[0]);
  const [ctId, setCtId] = useState("");
  const [data, setData] = useState<CertificateApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await villageAdminService.getCertificateRegister({ financialYear: fy, certificateTypeId: ctId || undefined });
      setData(r.data?.register || []);
    } catch { /* */ }
    setLoading(false);
  }, [fy, ctId]);

  useEffect(() => { load(); }, [load]);

  const handlePrint = () => {
    if (!tableRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>सहपत्र-ब रजिस्टर ${fy}</title>
      <style>body{font-family:sans-serif;font-size:12px;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #333;padding:6px 8px;text-align:left}th{background:#f0f0f0}h2{text-align:center}</style>
      </head><body>
      <h2>सहपत्र-ब रजिस्टर — ${fy}</h2>
      ${tableRef.current.innerHTML}
      <script>window.print();<\/script>
      </body></html>
    `);
    w.document.close();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border p-4 flex flex-wrap gap-3 items-center">
        <select value={fy} onChange={e => setFy(e.target.value)} className="px-3 py-2 rounded-lg border text-sm">
          {financialYears().map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={ctId} onChange={e => setCtId(e.target.value)} className="px-3 py-2 rounded-lg border text-sm">
          <option value="">सर्व प्रमाणपत्रे</option>
          {certTypes.map(c => <option key={c.id} value={c.id}>{c.nameMarathi}</option>)}
        </select>
        <button onClick={handlePrint} className="ml-auto bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">🖨️ प्रिंट</button>
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto" ref={tableRef}>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-3 py-2 font-semibold text-gray-600">अ.क्र.</th>
              <th className="px-3 py-2 font-semibold text-gray-600">डिस्पॅच क्र.</th>
              <th className="px-3 py-2 font-semibold text-gray-600">प्रमाणपत्र क्र.</th>
              <th className="px-3 py-2 font-semibold text-gray-600">प्रकार</th>
              <th className="px-3 py-2 font-semibold text-gray-600">अर्जदार</th>
              <th className="px-3 py-2 font-semibold text-gray-600">अर्ज तारीख</th>
              <th className="px-3 py-2 font-semibold text-gray-600">जारी तारीख</th>
              <th className="px-3 py-2 font-semibold text-gray-600">स्थिती</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">लोड होत आहे...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">नोंदी सापडल्या नाहीत</td></tr>
            ) : data.map((a, i) => {
              const st = STATUS_LABELS[a.status] || STATUS_LABELS.under_review;
              return (
                <tr key={a.id} className="hover:bg-gray-50/60">
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2 font-mono text-xs">{a.dispatchNo || "—"}</td>
                  <td className="px-3 py-2 font-mono text-xs">{a.certificateNo || "—"}</td>
                  <td className="px-3 py-2">{a.certificateType?.nameMarathi}</td>
                  <td className="px-3 py-2">{a.applicantName}</td>
                  <td className="px-3 py-2 text-xs">{fmtDate(a.createdAt)}</td>
                  <td className="px-3 py-2 text-xs">{fmtDate(a.issuedAt)}</td>
                  <td className="px-3 py-2"><span className={`text-xs px-2 py-0.5 rounded font-semibold ${st.bg}`}>{st.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Small reusable components ────────────────────────── */
function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{label}</p>
      <p className="text-sm font-semibold text-gray-800 mt-0.5 break-all">{value || "—"}</p>
    </div>
  );
}

function Btn({ title, icon, onClick, cls = "", showLabel = false }: { title: string; icon: string; onClick: () => void; cls?: string; showLabel?: boolean }) {
  return (
    <button onClick={onClick} title={title}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${cls || "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}>
      {icon}{showLabel && <span className="ml-1">{title}</span>}
    </button>
  );
}
