import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { TrashBinIcon, EyeIcon } from "../../icons";
import { villageAdminService } from "../../services/villageAdminService";

interface Complaint {
  id: string;
  name: string;
  contact: string;
  category: string;
  description: string;
  imageUrl: string | null;
  status: string;
  response: string | null;
  respondedAt: string | null;
  createdAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  road: "रस्ता",
  water: "पाणी",
  electricity: "वीज",
  sanitation: "स्वच्छता",
  corruption: "भ्रष्टाचार",
  other: "इतर",
};

const STATUS_COLORS: Record<string, "warning" | "primary" | "success" | "error"> = {
  pending: "warning",
  in_progress: "primary",
  resolved: "success",
  rejected: "error",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "प्रलंबित",
  in_progress: "प्रक्रियात",
  resolved: "निराकरण",
  rejected: "नाकारले",
};

export default function ComplaintManagement() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState<Record<string, number>>({});

  // Update form
  const [updStatus, setUpdStatus] = useState("");
  const [updResponse, setUpdResponse] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await villageAdminService.getComplaints({
        page,
        limit: 15,
        status: filterStatus || undefined,
        category: filterCategory || undefined,
        search: search || undefined,
      });
      setComplaints(res.data?.complaints || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch {
      console.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await villageAdminService.getComplaintStats();
      setStats(res.data || {});
    } catch {}
  };

  useEffect(() => { fetchComplaints(); }, [page, filterStatus, filterCategory, search]);
  useEffect(() => { fetchStats(); }, []);

  const openDetail = (c: Complaint) => {
    setSelected(c);
    setUpdStatus(c.status);
    setUpdResponse(c.response || "");
    setSaveMsg("");
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setSaveMsg("");
    try {
      await villageAdminService.updateComplaint(selected.id, {
        status: updStatus,
        response: updResponse,
      });
      setSaveMsg("यशस्वीरित्या अपडेट केले ✓");
      fetchComplaints();
      fetchStats();
      setSelected((prev) => prev ? { ...prev, status: updStatus, response: updResponse } : prev);
    } catch {
      setSaveMsg("अपडेट अयशस्वी");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ही तक्रार कायमची हटवायची आहे का?")) return;
    try {
      await villageAdminService.deleteComplaint(id);
      if (selected?.id === id) setSelected(null);
      fetchComplaints();
      fetchStats();
    } catch {
      alert("हटवणे अयशस्वी");
    }
  };

  return (
    <>
      <PageMeta title="तक्रार व्यवस्थापन | गाव प्रशासन" />

      <div className="mb-6">
        <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
          तक्रार व्यवस्थापन
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          नागरिकांनी दाखल केलेल्या तक्रारी पहा, स्थिती अपडेट करा आणि प्रतिसाद द्या.
        </p>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { key: "total", label: "एकूण", color: "bg-gray-100 dark:bg-white/[0.05]" },
          { key: "pending", label: "प्रलंबित", color: "bg-yellow-50 dark:bg-yellow-900/20" },
          { key: "in_progress", label: "प्रक्रियात", color: "bg-blue-50 dark:bg-blue-900/20" },
          { key: "resolved", label: "निराकरण", color: "bg-green-50 dark:bg-green-900/20" },
          { key: "rejected", label: "नाकारले", color: "bg-red-50 dark:bg-red-900/20" },
        ].map((s) => (
          <div key={s.key} className={`rounded-xl p-3 text-center ${s.color} border border-gray-200 dark:border-white/10`}>
            <div className="text-2xl font-bold text-gray-800 dark:text-white">{stats[s.key] ?? 0}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="नाव / संपर्क / विषय शोधा..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm w-56 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
        />
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
        >
          <option value="">सर्व स्थिती</option>
          <option value="pending">प्रलंबित</option>
          <option value="in_progress">प्रक्रियात</option>
          <option value="resolved">निराकरण</option>
          <option value="rejected">नाकारले</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
          className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
        >
          <option value="">सर्व प्रकार</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* List — 3 cols */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-8 text-center">
              <p className="text-gray-400">लोड होत आहे...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-8 text-center">
              <p className="text-gray-400">कोणत्याही तक्रारी उपलब्ध नाहीत.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map((c) => (
                <div
                  key={c.id}
                  onClick={() => openDetail(c)}
                  className={`rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                    selected?.id === c.id
                      ? "border-brand-500 bg-brand-50/60 dark:bg-brand-900/20"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-800 dark:text-white text-sm">{c.name}</span>
                        <Badge size="sm" color={STATUS_COLORS[c.status] || "warning"}>
                          {STATUS_LABELS[c.status] || c.status}
                        </Badge>
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                          {CATEGORY_LABELS[c.category] || c.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{c.contact}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{c.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(c.createdAt).toLocaleDateString("mr-IN")}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 shrink-0"
                    >
                      <TrashBinIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                मागे
              </Button>
              <span className="flex items-center text-sm text-gray-500">{page} / {totalPages}</span>
              <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                पुढे
              </Button>
            </div>
          )}
        </div>

        {/* Detail Panel — 2 cols */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-white/[0.03] p-5 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-white">तक्रार तपशील</h3>
                <Badge size="sm" color={STATUS_COLORS[selected.status] || "warning"}>
                  {STATUS_LABELS[selected.status] || selected.status}
                </Badge>
              </div>

              <dl className="space-y-2 text-sm mb-4">
                <div className="flex gap-2">
                  <dt className="text-gray-500 w-24 shrink-0">नाव</dt>
                  <dd className="text-gray-800 dark:text-white font-medium">{selected.name}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-gray-500 w-24 shrink-0">संपर्क</dt>
                  <dd className="text-gray-800 dark:text-white">{selected.contact}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-gray-500 w-24 shrink-0">प्रकार</dt>
                  <dd className="text-gray-800 dark:text-white">{CATEGORY_LABELS[selected.category] || selected.category}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-gray-500 w-24 shrink-0">तारीख</dt>
                  <dd className="text-gray-800 dark:text-white">{new Date(selected.createdAt).toLocaleString("mr-IN")}</dd>
                </div>
              </dl>

              <div className="mb-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">तक्रार</p>
                <p className="text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 whitespace-pre-wrap">
                  {selected.description}
                </p>
              </div>

              {selected.imageUrl && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">फोटो पुरावा</p>
                  <a href={selected.imageUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={selected.imageUrl}
                      alt="complaint"
                      className="rounded-lg w-full object-cover max-h-48 hover:opacity-90 transition"
                    />
                  </a>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">स्थिती बदला</label>
                  <select
                    value={updStatus}
                    onChange={(e) => setUpdStatus(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                  >
                    <option value="pending">प्रलंबित</option>
                    <option value="in_progress">प्रक्रियात</option>
                    <option value="resolved">निराकरण झाले</option>
                    <option value="rejected">नाकारले</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">प्रतिसाद / टिप्पणी</label>
                  <textarea
                    rows={3}
                    value={updResponse}
                    onChange={(e) => setUpdResponse(e.target.value)}
                    placeholder="तक्रारदाराला प्रतिसाद लिहा..."
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 resize-none"
                  />
                </div>
                {saveMsg && (
                  <p className={`text-sm ${saveMsg.includes("✓") ? "text-green-600" : "text-red-500"}`}>{saveMsg}</p>
                )}
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? "जतन होत आहे..." : "अपडेट जतन करा"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center text-gray-400">
              <EyeIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">तक्रार निवडा</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
