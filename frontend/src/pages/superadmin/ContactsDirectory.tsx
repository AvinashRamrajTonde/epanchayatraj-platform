import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import PageMeta from "../../components/common/PageMeta";
import { superadminService } from "../../services/superadminService";

interface Contact {
  id: string;
  name: string;
  designation: string;
  phone: string | null;
  email: string | null;
  photoUrl: string | null;
  village: {
    name: string;
    slug: string;
    tehsil: { name: string; district: string; state: string };
  };
}

const DESIGNATION_COLORS: Record<string, string> = {
  सरपंच: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300",
  "उप-सरपंच": "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300",
  ग्रामसेवक: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
};

function getDesignationColor(d: string) {
  for (const key of Object.keys(DESIGNATION_COLORS)) {
    if (d.includes(key)) return DESIGNATION_COLORS[key];
  }
  return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
}

function Avatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  if (photoUrl) {
    return <img src={photoUrl} alt={name} className="w-12 h-12 rounded-full object-cover" />;
  }
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
      {initials}
    </div>
  );
}

export default function ContactsDirectory() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (designationFilter) params.designation = designationFilter;
      if (search) params.search = search;
      if (districtFilter) params.district = districtFilter;
      const res = await superadminService.getContacts(params);
      setContacts(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchContacts, 400);
    return () => clearTimeout(t);
  }, [search, designationFilter, districtFilter]);

  // Get unique districts from loaded contacts
  const districts = [...new Set(contacts.map((c) => c.village.tehsil.district))].sort();

  const handleExportExcel = () => {
    const rows = contacts.map((c) => ({
      नाव: c.name,
      पदनाम: c.designation,
      दूरध्वनी: c.phone || "",
      ईमेल: c.email || "",
      गाव: c.village.name,
      तहसील: c.village.tehsil.name,
      जिल्हा: c.village.tehsil.district,
      राज्य: c.village.tehsil.state,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contacts");
    XLSX.writeFile(wb, "village_contacts.xlsx");
  };

  const handleExportVCard = () => {
    const lines: string[] = [];
    for (const c of contacts) {
      if (!c.phone && !c.email) continue;
      lines.push("BEGIN:VCARD");
      lines.push("VERSION:3.0");
      lines.push(`FN:${c.name} (${c.designation} - ${c.village.name})`);
      lines.push(`ORG:${c.village.name} ग्रामपंचायत`);
      lines.push(`TITLE:${c.designation}`);
      if (c.phone) lines.push(`TEL;TYPE=CELL:+91${c.phone.replace(/\D/g, "")}`);
      if (c.email) lines.push(`EMAIL:${c.email}`);
      lines.push(`NOTE:तहसील: ${c.village.tehsil.name} | जिल्हा: ${c.village.tehsil.district}`);
      lines.push("END:VCARD");
      lines.push("");
    }
    const blob = new Blob([lines.join("\n")], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "village_contacts.vcf";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageMeta title="संपर्क निर्देशिका | GPMH Admin" description="Village Officials Directory" />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">📋 संपर्क निर्देशिका</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">सर्व गावांचे सरपंच, उप-सरपंच, ग्रामसेवक</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            ↓ Excel
          </button>
          <button
            onClick={handleExportVCard}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            ↓ vCard (.vcf)
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="नाव किंवा गाव शोधा..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white sm:max-w-xs w-full"
        />
        <select
          value={designationFilter}
          onChange={(e) => setDesignationFilter(e.target.value)}
          className="h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
          <option value="">सर्व पदनाम</option>
          <option value="सरपंच">सरपंच</option>
          <option value="उप-सरपंच">उप-सरपंच</option>
          <option value="ग्रामसेवक">ग्रामसेवक</option>
        </select>
        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="h-10 rounded-lg border border-gray-300 bg-transparent px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        >
          <option value="">सर्व जिल्हे</option>
          {districts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {(search || designationFilter || districtFilter) && (
          <button
            onClick={() => { setSearch(""); setDesignationFilter(""); setDistrictFilter(""); }}
            className="h-10 rounded-lg border border-gray-300 px-3 text-sm text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            फिल्टर साफ करा
          </button>
        )}
      </div>

      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {loading ? "लोड होत आहे..." : `${contacts.length} संपर्क सापडले`}
      </p>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl border border-gray-200 bg-gray-50 animate-pulse dark:border-gray-800 dark:bg-gray-800" />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-gray-500">कोणतेही संपर्क सापडले नाहीत.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={c.name} photoUrl={c.photoUrl} />
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-800 dark:text-white/90 truncate">{c.name}</p>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getDesignationColor(c.designation)}`}>
                    {c.designation}
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                <p className="truncate">🏘️ {c.village.name}</p>
                <p className="truncate">📍 {c.village.tehsil.name}, {c.village.tehsil.district}</p>
                {c.email && <p className="truncate">✉️ {c.email}</p>}
              </div>

              {c.phone ? (
                <div className="flex gap-2">
                  <a
                    href={`tel:${c.phone}`}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-blue-50 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400"
                  >
                    📞 कॉल
                  </a>
                  <a
                    href={`https://wa.me/91${c.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-green-50 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center">📵 फोन उपलब्ध नाही</p>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
