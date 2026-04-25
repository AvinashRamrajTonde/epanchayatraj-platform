import { useEffect, useState } from "react";
import { superadminService } from "../../services/superadminService";

interface Village {
  id: string;
  name: string;
  slug: string;
  subdomain?: string;
}

interface SeoData {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

export default function VillageSEO() {
  const [villages, setVillages] = useState<Village[]>([]);
  const [loadingVillages, setLoadingVillages] = useState(true);
  const [selectedVillageId, setSelectedVillageId] = useState("");
  const [seo, setSeo] = useState<SeoData>({});
  const [loadingSeo, setLoadingSeo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    superadminService.getVillages().then((r) => {
      setVillages(r.data?.villages || r.data || []);
      setLoadingVillages(false);
    }).catch(() => setLoadingVillages(false));
  }, []);

  const loadSeo = async (villageId: string) => {
    if (!villageId) return;
    setLoadingSeo(true);
    setMsg("");
    try {
      const r = await superadminService.getVillageSeo(villageId);
      setSeo(r.data || {});
    } catch {
      setSeo({});
    }
    setLoadingSeo(false);
  };

  const handleSelectVillage = (id: string) => {
    setSelectedVillageId(id);
    loadSeo(id);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVillageId) return;
    setSaving(true);
    setMsg("");
    try {
      await superadminService.upsertVillageSeo(selectedVillageId, seo as Record<string, string>);
      setMsg("✅ SEO माहिती सेव्ह झाली!");
    } catch {
      setMsg("⚠️ सेव्ह अयशस्वी");
    }
    setSaving(false);
  };

  const selectedVillage = villages.find((v) => v.id === selectedVillageId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white/90">🔍 गाव SEO सेटिंग्ज</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          प्रत्येक गावासाठी Search Engine Optimization (SEO) माहिती व्यवस्थापित करा.
        </p>
      </div>

      {/* Village Selector */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <label className="block text-sm font-semibold text-gray-700 dark:text-white/80 mb-2">
          गाव निवडा *
        </label>
        {loadingVillages ? (
          <p className="text-sm text-gray-400">गावे लोड होत आहेत...</p>
        ) : (
          <select
            value={selectedVillageId}
            onChange={(e) => handleSelectVillage(e.target.value)}
            className="w-full max-w-sm px-3 py-2.5 rounded-lg border border-gray-300 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="">— गाव निवडा —</option>
            {villages.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.slug})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* SEO Form */}
      {selectedVillageId && (
        <form onSubmit={handleSave} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white/90">
              {selectedVillage?.name} — SEO सेटिंग्ज
            </h3>
            {loadingSeo && <span className="text-xs text-gray-400">लोड होत आहे...</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Meta Title" placeholder="गाव - ग्रामपंचायत" value={seo.metaTitle || ""} onChange={(v) => setSeo((p) => ({ ...p, metaTitle: v }))} />
            <Field label="Meta Keywords" placeholder="village, panchayat, ..." value={seo.metaKeywords || ""} onChange={(v) => setSeo((p) => ({ ...p, metaKeywords: v }))} />
            <div className="sm:col-span-2">
              <Field label="Meta Description" placeholder="गाव विषयी थोडक्यात माहिती..." value={seo.metaDescription || ""} onChange={(v) => setSeo((p) => ({ ...p, metaDescription: v }))} textarea />
            </div>
            <Field label="OG Title (Social Share)" placeholder="Facebook / Whatsapp शीर्षक" value={seo.ogTitle || ""} onChange={(v) => setSeo((p) => ({ ...p, ogTitle: v }))} />
            <Field label="OG Image URL" placeholder="https://..." value={seo.ogImage || ""} onChange={(v) => setSeo((p) => ({ ...p, ogImage: v }))} />
            <div className="sm:col-span-2">
              <Field label="OG Description (Social Share)" placeholder="सोशल मीडिया शेअरसाठी वर्णन" value={seo.ogDescription || ""} onChange={(v) => setSeo((p) => ({ ...p, ogDescription: v }))} textarea />
            </div>
            <Field label="Canonical URL" placeholder="https://village.gpmh.in" value={seo.canonicalUrl || ""} onChange={(v) => setSeo((p) => ({ ...p, canonicalUrl: v }))} />
          </div>

          {msg && (
            <p className={`text-sm px-4 py-2 rounded-lg ${msg.startsWith("✅") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg}</p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {saving ? "सेव्ह होत आहे..." : "💾 SEO सेव्ह करा"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({
  label, placeholder, value, onChange, textarea,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm resize-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      )}
    </div>
  );
}
