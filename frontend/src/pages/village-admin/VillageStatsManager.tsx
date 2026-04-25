import { useEffect, useState } from "react";
import { Plus, Trash2, Save, BarChart3, Lock, Eye } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import { villageAdminService } from "../../services/villageAdminService";

/* ─── Types ─── */

interface StatItem {
  key: string;
  icon: string;
  label: string;
  value: string;
}

/* ─── Icon options for the selector ─── */

const ICON_OPTIONS = [
  { value: "👥", label: "👥 लोक" },
  { value: "🗳️", label: "🗳️ मतदार" },
  { value: "📐", label: "📐 क्षेत्रफळ" },
  { value: "📚", label: "📚 साक्षरता" },
  { value: "🏫", label: "🏫 शाळा" },
  { value: "👩‍👩‍👧", label: "👩‍👩‍👧 बचत गट" },
  { value: "🏥", label: "🏥 आरोग्य" },
  { value: "🌾", label: "🌾 शेती" },
  { value: "🏠", label: "🏠 कुटुंब" },
  { value: "🏢", label: "🏢 आस्थापने" },
  { value: "🛕", label: "🛕 मंदिर" },
  { value: "🌳", label: "🌳 वृक्ष" },
  { value: "💧", label: "💧 पाणी" },
  { value: "⚡", label: "⚡ वीज" },
  { value: "🛣️", label: "🛣️ रस्ते" },
  { value: "📱", label: "📱 तंत्रज्ञान" },
  { value: "🏦", label: "🏦 बँक" },
  { value: "📬", label: "📬 पोस्ट" },
  { value: "🚰", label: "🚰 नळ" },
  { value: "🏗️", label: "🏗️ विकास" },
  { value: "👨‍⚕️", label: "👨‍⚕️ डॉक्टर" },
  { value: "🚜", label: "🚜 ट्रॅक्टर" },
  { value: "🐄", label: "🐄 पशुधन" },
  { value: "🔌", label: "🔌 ऊर्जा" },
  { value: "🏘️", label: "🏘️ गाव" },
  { value: "🏭", label: "🏭 उद्योग" },
  { value: "🏟️", label: "🏟️ मैदान" },
  { value: "📖", label: "📖 वाचनालय" },
  { value: "🚌", label: "🚌 वाहतूक" },
  { value: "🔥", label: "🔥 ऊर्जा" },
];

/* ─── Mandatory fields ─── */

const MANDATORY_STATS: StatItem[] = [
  { key: "population", icon: "👥", label: "लोकसंख्या", value: "" },
  { key: "voters", icon: "🗳️", label: "मतदार", value: "" },
  { key: "area", icon: "📐", label: "क्षेत्रफळ (हेक्टर)", value: "" },
  { key: "literacy", icon: "📚", label: "साक्षरता दर (%)", value: "" },
  { key: "schools", icon: "🏫", label: "शाळा", value: "" },
  { key: "shgs", icon: "👩‍👩‍👧", label: "बचत गट (SHGs)", value: "" },
  { key: "phc", icon: "🏥", label: "प्राथमिक आरोग्य केंद्र (PHC)", value: "" },
  { key: "farmer_groups", icon: "🌾", label: "शेतकरी गट", value: "" },
];

const MANDATORY_KEYS = new Set(MANDATORY_STATS.map((s) => s.key));

/* ─── Component ─── */

export default function VillageStatsManager() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    villageAdminService
      .getContent("village_stats")
      .then((res) => {
        const c = (res.data?.content || {}) as Record<string, unknown>;
        const existing = (c.stats as StatItem[]) || [];

        if (existing.length > 0) {
          // Merge: ensure all mandatory keys present
          const existingKeys = new Set(existing.map((s) => s.key));
          const merged = [...existing];
          for (const ms of MANDATORY_STATS) {
            if (!existingKeys.has(ms.key)) {
              merged.push({ ...ms });
            }
          }
          setStats(merged);
        } else {
          // Backward compat: try to read old flat format
          const migrated: StatItem[] = MANDATORY_STATS.map((ms) => {
            const oldKey =
              ms.key === "literacy" ? "literacyRate" : ms.key;
            const oldVal =
              (c[ms.key] as string) || (c[oldKey] as string) || "";
            return { ...ms, value: oldVal };
          });
          // Also migrate old keys that are not mandatory
          const oldExtraKeys = ["families", "establishments"];
          const oldIconMap: Record<string, string> = {
            families: "🏠",
            establishments: "🏢",
          };
          const oldLabelMap: Record<string, string> = {
            families: "कुटुंबे",
            establishments: "आस्थापने",
          };
          for (const ok of oldExtraKeys) {
            if (c[ok]) {
              migrated.push({
                key: ok,
                icon: oldIconMap[ok] || "📊",
                label: oldLabelMap[ok] || ok,
                value: c[ok] as string,
              });
            }
          }
          setStats(migrated);
        }
      })
      .catch(() => setStats(MANDATORY_STATS.map((s) => ({ ...s }))))
      .finally(() => setLoading(false));
  }, []);

  const updateStat = (index: number, field: keyof StatItem, value: string) => {
    setStats((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setSaved(false);
  };

  const addCustomStat = () => {
    setStats((prev) => [
      ...prev,
      {
        key: `custom_${Date.now()}`,
        icon: "📊",
        label: "",
        value: "",
      },
    ]);
    setSaved(false);
  };

  const removeStat = (index: number) => {
    setStats((prev) => prev.filter((_, i) => i !== index));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      // Also save flat keys for backward compat
      const flat: Record<string, unknown> = { stats };
      for (const s of stats) {
        flat[s.key] = s.value;
      }
      // Map literacy → literacyRate for old format compat
      const litStat = stats.find((s) => s.key === "literacy");
      if (litStat) flat.literacyRate = litStat.value;

      await villageAdminService.upsertContent("village_stats", flat);
      setSaved(true);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setError(ax.response?.data?.message || "माहिती सेव्ह करता आली नाही");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta
        title="गाव आकडेवारी | गाव प्रशासन"
        description="मुखपृष्ठावर दर्शविली जाणारी गावाची आकडेवारी."
      />
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={20} className="text-brand-500" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              गाव आकडेवारी
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            मुखपृष्ठावर दर्शविली जाणारी गावाची आकडेवारी व्यवस्थापित करा.
          </p>
        </div>
        <button
          form="stats-form"
          type="submit"
          disabled={saving}
          className="hidden sm:flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 transition-colors shadow-sm shadow-brand-500/30"
        >
          <Save size={15} />
          {saving ? "सेव्ह करत आहे..." : "बदल सेव्ह करा"}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <form id="stats-form" onSubmit={handleSubmit}>
          {/* Stats preview */}
          <div className="mb-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 px-4 py-3">
              <Eye size={15} className="text-gray-400" />
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Live Preview</span>
            </div>
            <div className="p-4 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {stats.filter(s => s.value).map((stat) => (
                <div key={stat.key} className="flex flex-col items-center text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <span className="text-2xl mb-1">{stat.icon}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{stat.value}</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">{stat.label}</span>
                </div>
              ))}
              {stats.filter(s => s.value).length === 0 && (
                <p className="col-span-full text-xs text-gray-400 text-center py-4">
                  मूल्ये भरा म्हणजे preview दिसेल
                </p>
              )}
            </div>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="mb-4 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
              {error}
            </div>
          )}
          {saved && (
            <div className="mb-4 rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-400">
              माहिती यशस्वीरीत्या सेव्ह झाली!
            </div>
          )}

          {/* Edit grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {stats.map((stat, i) => {
              const isMandatory = MANDATORY_KEYS.has(stat.key);
              return (
                <div
                  key={stat.key}
                  className={`relative rounded-xl border p-4 bg-white dark:bg-gray-900 transition-all ${
                    isMandatory
                      ? "border-gray-200 dark:border-gray-700"
                      : "border-dashed border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-500/40"
                  }`}
                >
                  {isMandatory && (
                    <span className="absolute top-2 right-2 flex items-center gap-0.5 rounded-full bg-orange-50 dark:bg-orange-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-orange-500">
                      <Lock size={8} /> अनिवार्य
                    </span>
                  )}
                  {!isMandatory && (
                    <button
                      type="button"
                      onClick={() => removeStat(i)}
                      className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full text-gray-300 hover:bg-red-50 hover:text-red-500 dark:text-gray-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
                      title="हटवा"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}

                  {/* Icon selector + preview */}
                  <div className="flex items-center gap-2 mb-3 pr-7">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-2xl">
                      {stat.icon}
                    </span>
                    <select
                      value={stat.icon}
                      onChange={(e) => updateStat(i, "icon", e.target.value)}
                      className="h-9 flex-1 min-w-0 rounded-lg border border-gray-200 bg-transparent px-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    >
                      {ICON_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Label */}
                  <div className="mb-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">
                      लेबल
                    </label>
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => updateStat(i, "label", e.target.value)}
                      placeholder="उदा. लोकसंख्या"
                      disabled={isMandatory}
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:bg-gray-50 dark:disabled:bg-gray-800/50 disabled:text-gray-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  {/* Value */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">
                      मूल्य
                    </label>
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => updateStat(i, "value", e.target.value)}
                      placeholder="उदा. 5000"
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm font-semibold text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>
              );
            })}

            {/* Add new stat */}
            <button
              type="button"
              onClick={addCustomStat}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 text-sm text-gray-400 hover:border-brand-400 hover:text-brand-500 dark:hover:border-brand-500/50 dark:hover:text-brand-400 transition-colors min-h-[160px]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <Plus size={20} />
              </span>
              नवीन आकडेवारी जोडा
            </button>
          </div>

          {/* Mobile save button */}
          <div className="mt-6 sm:hidden">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 transition-colors"
            >
              <Save size={15} />
              {saving ? "सेव्ह करत आहे..." : "बदल सेव्ह करा"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}
