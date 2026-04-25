import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import * as XLSX from "xlsx";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { superadminService } from "../../services/superadminService";

interface Village {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  status: string;
  tehsil: { name: string };
  _count: { users: number };
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function VillageList() {
  const [villages, setVillages] = useState<Village[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["name", "slug", "subdomain", "customDomain", "tehsilName", "adminEmail", "adminName", "adminPassword"],
      ["उदाहरण गाव", "udaharan-gav", "udaharan-gav", "", "इगतपुरी", "admin@example.com", "Admin User", "Password123"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Villages");
    XLSX.writeFile(wb, "villages_template.xlsx");
  };

  const handleExport = async () => {
    try {
      // Fetch all villages by paginating (backend max limit is 100)
      let allVillages: any[] = [];
      let page = 1;
      let totalPages = 1;
      do {
        const res = await superadminService.getVillages({ page, limit: 100, search: "", status: "" });
        allVillages = allVillages.concat(res.data.villages);
        totalPages = res.data.pagination.totalPages;
        page++;
      } while (page <= totalPages);

      const rows = allVillages.map((v: any) => ({
        name: v.name,
        slug: v.slug,
        subdomain: v.subdomain,
        customDomain: v.customDomain || "",
        tehsilName: v.tehsil?.name || "",
        status: v.status,
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Villages");
      XLSX.writeFile(wb, "villages_export.xlsx");
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImportStatus(null);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws);
        if (rows.length === 0) {
          setImportStatus({ type: "error", msg: "फाईलमध्ये कोणतेही रेकॉर्ड नाहीत." });
          return;
        }
        const res = await superadminService.bulkImportVillages(rows);
        const { created, skipped, errors } = res.data.data;
        const parts = [`${created} गावे तयार झाली`];
        if (skipped?.length) parts.push(`${skipped.length} वगळली (डुप्लिकेट)`);
        if (errors?.length) parts.push(`${errors.length} त्रुटी`);
        setImportStatus({ type: created > 0 ? "success" : "error", msg: parts.join(" | ") });
        if (created > 0) fetchVillages(1);
      } catch (err: any) {
        setImportStatus({ type: "error", msg: err?.response?.data?.message || "Import अयशस्वी" });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const fetchVillages = async (page = 1) => {
    setLoading(true);
    try {
      const res = await superadminService.getVillages({
        page,
        limit: 10,
        search,
        status: statusFilter,
      });
      setVillages(res.data.villages);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVillages(1);
  }, [search, statusFilter]);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await superadminService.updateVillageStatus(id, newStatus);
      fetchVillages(pagination.page);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" गाव आणि त्याचा सर्व डेटा कायमचा हटवायचा आहे का?`)) return;
    setDeletingId(id);
    try {
      await superadminService.deleteVillage(id);
      fetchVillages(pagination.page);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <PageMeta title="गावे | GPMH Admin" description="गावे व्यवस्थापन" />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
          गावे
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={downloadTemplate}>
            Template
          </Button>
          <Button size="sm" variant="outline" onClick={() => importInputRef.current?.click()}>
            ↑ Import
          </Button>
          <input
            ref={importInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleImportFile}
          />
          <Button size="sm" variant="outline" onClick={handleExport}>
            ↓ Export
          </Button>
          <Link to="/villages/new">
            <Button size="sm">नवीन गाव जोडा</Button>
          </Link>
        </div>
      </div>

      {importStatus && (
        <div
          className={`mb-4 rounded-lg px-4 py-3 text-sm ${
            importStatus.type === "success"
              ? "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400"
              : "bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-400"
          }`}
        >
          {importStatus.msg}
          <button
            onClick={() => setImportStatus(null)}
            className="ml-3 font-bold opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="नावाने किंवा slug ने शोधा..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 sm:max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          <option value="">सर्व Status</option>
          <option value="active">सक्रिय</option>
          <option value="inactive">निष्क्रिय</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  नाव
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Slug
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  तहसील
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  वापरकर्ते
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  कृती
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-sm text-gray-500"
                  >
                    लोड होत आहे...
                  </td>
                </tr>
              ) : villages.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-sm text-gray-500"
                  >
                    गावे सापडली नाहीत. पहिले गाव जोडा!
                  </td>
                </tr>
              ) : (
                villages.map((village) => (
                  <tr
                    key={village.id}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                      {village.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">
                        {village.slug}
                      </code>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {village.tehsil.name}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        color={
                          village.status === "active" ? "success" : "error"
                        }
                      >
                        {village.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {village._count.users}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <Link to={`/villages/${village.id}`}>
                          <button className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400">
                            पहा
                          </button>
                        </Link>
                        <button
                          onClick={() =>
                            handleToggleStatus(village.id, village.status)
                          }
                          className={`text-sm ${
                            village.status === "active"
                              ? "text-error-500 hover:text-error-600"
                              : "text-success-500 hover:text-success-600"
                          }`}
                        >
                          {village.status === "active"
                            ? "निष्क्रिय करा"
                            : "सक्रिय करा"}
                        </button>
                        <button
                          onClick={() => handleDelete(village.id, village.name)}
                          disabled={deletingId === village.id}
                          className="text-sm text-error-500 hover:text-error-600 disabled:opacity-50"
                        >
                          {deletingId === village.id ? "..." : "डिलीट"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 dark:border-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {pagination.page} of {pagination.totalPages} (एकूण {pagination.total})
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => fetchVillages(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                मागील
              </button>
              <button
                onClick={() => fetchVillages(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                पुढील
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
