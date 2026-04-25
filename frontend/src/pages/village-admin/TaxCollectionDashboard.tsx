import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import { TrashBinIcon } from "../../icons";
import { villageAdminService } from "../../services/villageAdminService";

interface TaxPayment {
  id: string;
  name: string;
  contact: string;
  address: string;
  taxType: string;
  amount: number;
  year: string;
  utrNumber: string | null;
  screenshotUrl: string | null;
  paymentMethod: string | null;
  status: string;
  adminNote: string | null;
  verifiedAt: string | null;
  receiptNo: string | null;
  createdAt: string;
}

const TAX_TYPE_LABELS: Record<string, string> = { house: "घरपट्टी", water: "पाणीपट्टी", other: "इतर" };
const STATUS_COLORS: Record<string, "warning" | "primary" | "success" | "error"> = {
  pending: "warning", verified: "success", rejected: "error",
};
const STATUS_LABELS: Record<string, string> = { pending: "प्रलंबित", verified: "पडताळले", rejected: "नाकारले" };

const YEARS = ["", "2025-26", "2024-25", "2023-24", "2022-23", "2021-22"];

interface Stats {
  all: { count: number; amount: number };
  verified: { count: number; amount: number };
  pending: { count: number; amount: number };
  rejected: { count: number; amount: number };
  byType: {
    house: { count: number; amount: number };
    water: { count: number; amount: number };
    other: { count: number; amount: number };
  };
  monthly: Array<{ month: string; tax_type: string; count: number; total: number }>;
}

export default function TaxCollectionDashboard() {
  const [payments, setPayments] = useState<TaxPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<TaxPayment | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTaxType, setFilterTaxType] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [search, setSearch] = useState("");

  // Update form
  const [updStatus, setUpdStatus] = useState("");
  const [updNote, setUpdNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Active tab
  const [activeTab, setActiveTab] = useState<"list" | "dashboard">("list");

  const loadData = async () => {
    setLoading(true);
    try {
      const [payRes, statsRes] = await Promise.all([
        villageAdminService.getTaxPayments({ page, limit: 20, status: filterStatus, taxType: filterTaxType, year: filterYear, from: filterFrom, to: filterTo, search }),
        villageAdminService.getTaxStats({ from: filterFrom, to: filterTo, year: filterYear }),
      ]);
      setPayments(payRes.data?.data || []);
      setTotalPages(payRes.data?.pagination?.totalPages || 1);
      setStats(statsRes.data || null);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [page, filterStatus, filterTaxType, filterYear, filterFrom, filterTo]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); loadData(); };

  const handleSelect = (p: TaxPayment) => {
    setSelected(p);
    setUpdStatus(p.status);
    setUpdNote(p.adminNote || "");
    setSaveMsg("");
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await villageAdminService.updateTaxPayment(selected.id, { status: updStatus, adminNote: updNote });
      setSaveMsg("✅ जतन झाले");
      const updated = res.data || res;
      setSelected(updated);
      setPayments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      loadData(); // refresh stats
    } catch {
      setSaveMsg("❌ अडचण आली");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("हे नोंद कायमची काढायची का?")) return;
    try {
      await villageAdminService.deleteTaxPayment(id);
      setPayments((prev) => prev.filter((p) => p.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch { /* ignore */ }
  };

  const fmt = (n: number) => `₹ ${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  // Build monthly chart data
  const monthlyData = (() => {
    if (!stats?.monthly?.length) return [];
    const map: Record<string, { month: string; house: number; water: number; other: number }> = {};
    stats.monthly.forEach((r) => {
      if (!map[r.month]) map[r.month] = { month: r.month, house: 0, water: 0, other: 0 };
      const t = r.tax_type as "house" | "water" | "other";
      map[r.month][t] = Number(r.total) || 0;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  })();
  const maxBar = Math.max(...monthlyData.map((r) => r.house + r.water + r.other), 1);

  return (
    <>
      <PageMeta title="कर संकलन" description="Tax Collection Dashboard" />

      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">कर संकलन (Tax Collection)</h1>
            <p className="text-sm text-gray-500 mt-0.5">घरपट्टी, पाणीपट्टी व इतर कर पेमेंट व्यवस्थापन</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab("list")}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${activeTab === "list" ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-300 hover:border-green-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"}`}>
              📋 नोंदी
            </button>
            <button onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${activeTab === "dashboard" ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-300 hover:border-green-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"}`}>
              📊 आढावा
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "एकूण", count: stats.all.count, amount: stats.all.amount, color: "bg-gray-50 border-gray-200" },
              { label: "पडताळले", count: stats.verified.count, amount: stats.verified.amount, color: "bg-green-50 border-green-200" },
              { label: "प्रलंबित", count: stats.pending.count, amount: stats.pending.amount, color: "bg-yellow-50 border-yellow-200" },
              { label: "नाकारले", count: stats.rejected.count, amount: stats.rejected.amount, color: "bg-red-50 border-red-200" },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
                <p className="text-xs font-medium text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{s.count}</p>
                <p className="text-xs text-gray-500 mt-0.5">{fmt(s.amount)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none w-48"
              placeholder="नाव / UTR / पावती शोधा" />
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none">
              <option value="">सर्व स्थिती</option>
              <option value="pending">प्रलंबित</option>
              <option value="verified">पडताळले</option>
              <option value="rejected">नाकारले</option>
            </select>
            <select value={filterTaxType} onChange={(e) => { setFilterTaxType(e.target.value); setPage(1); }}
              className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none">
              <option value="">सर्व प्रकार</option>
              <option value="house">घरपट्टी</option>
              <option value="water">पाणीपट्टी</option>
              <option value="other">इतर</option>
            </select>
            <select value={filterYear} onChange={(e) => { setFilterYear(e.target.value); setPage(1); }}
              className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 outline-none">
              {YEARS.map((y) => <option key={y} value={y}>{y || "सर्व वर्षे"}</option>)}
            </select>
            <div className="flex gap-2 items-center text-sm text-gray-500">
              <span>पासून:</span>
              <input type="date" value={filterFrom} onChange={(e) => { setFilterFrom(e.target.value); setPage(1); }}
                className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-2 text-sm outline-none" />
              <span>पर्यंत:</span>
              <input type="date" value={filterTo} onChange={(e) => { setFilterTo(e.target.value); setPage(1); }}
                className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-2 text-sm outline-none" />
            </div>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">शोधा</button>
            <button type="button" onClick={() => { setSearch(""); setFilterStatus(""); setFilterTaxType(""); setFilterYear(""); setFilterFrom(""); setFilterTo(""); setPage(1); setTimeout(loadData, 0); }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              रीसेट
            </button>
          </form>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && stats && (
          <div className="space-y-5">
            {/* By Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(["house", "water", "other"] as const).map((t) => (
                <div key={t} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <div className="text-2xl mb-2">{t === "house" ? "🏠" : t === "water" ? "💧" : "📋"}</div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">{TAX_TYPE_LABELS[t]}</h3>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{fmt(stats.byType[t].amount)}</p>
                  <p className="text-xs text-gray-500">{stats.byType[t].count} पडताळलेले पेमेंट</p>
                </div>
              ))}
            </div>

            {/* Monthly Bar Chart */}
            {monthlyData.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-bold text-gray-800 dark:text-white mb-5">मासिक संकलन (पडताळलेले)</h3>
                <div className="flex items-end gap-4 h-40">
                  {monthlyData.map((m) => {
                    const total = m.house + m.water + m.other;
                    const height = Math.max((total / maxBar) * 140, 4);
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-500">₹{(total / 1000).toFixed(0)}k</span>
                        <div className="w-full rounded-t-lg overflow-hidden flex flex-col-reverse" style={{ height: `${height}px` }}>
                          <div style={{ height: `${(m.house / maxBar) * 140}px` }} className="bg-blue-500 w-full" title={`घरपट्टी: ₹${m.house}`} />
                          <div style={{ height: `${(m.water / maxBar) * 140}px` }} className="bg-teal-400 w-full" title={`पाणीपट्टी: ₹${m.water}`} />
                          <div style={{ height: `${(m.other / maxBar) * 140}px` }} className="bg-purple-400 w-full" title={`इतर: ₹${m.other}`} />
                        </div>
                        <span className="text-xs text-gray-500">{m.month.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded-sm inline-block" /> घरपट्टी</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-teal-400 rounded-sm inline-block" /> पाणीपट्टी</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-400 rounded-sm inline-block" /> इतर</span>
                </div>
              </div>
            )}

            {/* Total verified summary */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 dark:bg-green-900/20 dark:border-green-800">
              <h3 className="font-bold text-green-800 dark:text-green-300 mb-2">एकूण पडताळलेले संकलन</h3>
              <p className="text-3xl font-bold text-green-700 dark:text-green-400">{fmt(stats.verified.amount)}</p>
              <p className="text-sm text-green-600 dark:text-green-500 mt-1">{stats.verified.count} पेमेंट पडताळलेले</p>
            </div>
          </div>
        )}

        {/* List Tab */}
        {activeTab === "list" && (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
            {/* Left: List */}
            <div className="xl:col-span-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              {loading ? (
                <div className="py-10 text-center text-gray-400 text-sm">लोड होत आहे...</div>
              ) : payments.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-sm">कोणतेही पेमेंट सापडले नाही.</div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {payments.map((p) => (
                    <li key={p.id}
                      onClick={() => handleSelect(p)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selected?.id === p.id ? "bg-green-50 dark:bg-green-900/30" : ""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">{p.name}</p>
                          <p className="text-xs text-gray-500 truncate">{p.address}</p>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <Badge color={STATUS_COLORS[p.status] || "primary"} size="sm">{STATUS_LABELS[p.status] || p.status}</Badge>
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                              {TAX_TYPE_LABELS[p.taxType] || p.taxType}
                            </span>
                            <span className="text-xs text-gray-500">{p.year}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-green-700 dark:text-green-400 text-sm">₹{p.amount.toLocaleString("en-IN")}</p>
                          <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString("mr-IN")}</p>
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                            className="mt-1 text-red-400 hover:text-red-600 transition-colors">
                            <TrashBinIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 p-4 border-t border-gray-100 dark:border-gray-700">
                  <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-40">‹</button>
                  <span className="px-3 py-1 text-sm">{page} / {totalPages}</span>
                  <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded text-sm disabled:opacity-40">›</button>
                </div>
              )}
            </div>

            {/* Right: Detail */}
            <div className="xl:col-span-2">
              {selected ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sticky top-5">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-4">📄 पेमेंट तपशील</h3>
                  <div className="space-y-2 text-sm mb-5">
                    {[
                      { l: "नाव", v: selected.name },
                      { l: "संपर्क", v: selected.contact },
                      { l: "पत्ता", v: selected.address },
                      { l: "प्रकार", v: TAX_TYPE_LABELS[selected.taxType] || selected.taxType },
                      { l: "वर्ष", v: selected.year },
                      { l: "रक्कम", v: `₹ ${selected.amount.toLocaleString("en-IN")}` },
                      { l: "UTR", v: selected.utrNumber || "—" },
                      { l: "पद्धत", v: selected.paymentMethod || "—" },
                      { l: "पावती क्रमांक", v: selected.receiptNo || "—" },
                      { l: "नोंदणी", v: new Date(selected.createdAt).toLocaleString("mr-IN") },
                    ].map((row) => (
                      <div key={row.l} className="flex gap-2 text-gray-700 dark:text-gray-300">
                        <span className="text-gray-400 w-28 shrink-0">{row.l}:</span>
                        <span className="font-medium break-all">{row.v}</span>
                      </div>
                    ))}
                  </div>

                  {selected.screenshotUrl && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">स्क्रीनशॉट:</p>
                      <a href={selected.screenshotUrl} target="_blank" rel="noreferrer">
                        <img src={selected.screenshotUrl} alt="screenshot" className="h-32 w-full object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity" />
                      </a>
                    </div>
                  )}

                  {/* Status + Note Update */}
                  <div className="space-y-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">स्थिती बदला</label>
                      <div className="flex gap-2">
                        {[{ v: "pending", l: "प्रलंबित" }, { v: "verified", l: "पडताळले" }, { v: "rejected", l: "नाकारले" }].map((s) => (
                          <button key={s.v} type="button" onClick={() => setUpdStatus(s.v)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${updStatus === s.v ? "bg-green-600 text-white border-green-600" : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-green-400"}`}>
                            {s.l}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">प्रशासकीय नोट</label>
                      <textarea value={updNote} onChange={(e) => setUpdNote(e.target.value)} rows={2}
                        className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-green-400 outline-none" />
                    </div>
                    {saveMsg && (
                      <p className={`text-xs ${saveMsg.includes("✅") ? "text-green-600" : "text-red-500"}`}>{saveMsg}</p>
                    )}
                    <button onClick={handleSave} disabled={saving}
                      className="w-full bg-green-600 text-white font-semibold py-2.5 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors text-sm">
                      {saving ? "जतन होत आहे..." : "जतन करा"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-400 text-sm">
                  पेमेंट निवडा
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
