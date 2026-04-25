import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import { useModal } from "../../hooks/useModal";
import { EyeIcon } from "../../icons";
import {
  villageAdminService,
  type Application,
} from "../../services/villageAdminService";

const statusColors: Record<string, "warning" | "info" | "success" | "error"> = {
  pending: "warning",
  "in-review": "info",
  approved: "success",
  rejected: "error",
};

const STATUS_OPTIONS = [
  { value: "", label: "सर्व स्थिती" },
  { value: "pending", label: "प्रलंबित" },
  { value: "in-review", label: "पुनरावलोकनात" },
  { value: "approved", label: "मंजूर" },
  { value: "rejected", label: "नाकारले" },
];

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [statusForm, setStatusForm] = useState({ status: "", remarks: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await villageAdminService.getApplications({
        page,
        limit: 10,
        status: statusFilter,
        search,
      });
      setApplications(res.data.applications);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchApplications();
  };

  const handleView = (app: Application) => {
    setSelectedApp(app);
    setStatusForm({ status: app.status, remarks: app.remarks || "" });
    setError("");
    openModal();
  };

  const handleStatusUpdate = async () => {
    if (!selectedApp) return;
    setSaving(true);
    setError("");
    try {
      await villageAdminService.updateApplicationStatus(selectedApp.id, {
        status: statusForm.status,
        remarks: statusForm.remarks || undefined,
      });
      closeModal();
      fetchApplications();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "अर्ज अपडेट करता आला नाही");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("mr-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <PageMeta title="अर्ज | गाव प्रशासन" description="नागरिक अर्ज व्यवस्थापन" />
      <div className="mb-6">
        <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
          अर्ज
        </h2>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex-1">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="नाव किंवा फोन ने शोधा..."
          />
        </form>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  अर्जदार
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  सेवा प्रकार
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  स्थिती
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  तारीख
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  कृती
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                    लोड होत आहे...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                    अर्ज सापडले नाहीत.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {app.applicantName}
                        </p>
                        <p className="text-xs text-gray-500">{app.applicantPhone}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300 capitalize">
                      {app.serviceType.replace(/-/g, " ")}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        size="sm"
                        color={statusColors[app.status] || "light"}
                      >
                        {app.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {formatDate(app.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleView(app)}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="तपशील पहा"
                      >
                        <EyeIcon className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            मागील
          </Button>
          <span className="text-sm text-gray-500">
            पृष्ठ {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            पुढील
          </Button>
        </div>
      )}

      {/* Application Detail Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] p-6 lg:p-8">
        {selectedApp && (
          <>
            <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
              अर्जाचे तपशील
            </h3>
            {error && (
              <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">अर्जदाराचे नाव</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {selectedApp.applicantName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">फोन</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {selectedApp.applicantPhone}
                  </p>
                </div>
                {selectedApp.applicantEmail && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ईमेल</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {selectedApp.applicantEmail}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">सेवा प्रकार</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90 capitalize">
                    {selectedApp.serviceType.replace(/-/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">अर्ज तारीख</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {formatDate(selectedApp.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">सध्याची स्थिती</p>
                  <Badge size="sm" color={statusColors[selectedApp.status] || "light"}>
                    {selectedApp.status}
                  </Badge>
                </div>
              </div>

              {selectedApp.description && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">वर्णन</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {selectedApp.description}
                  </p>
                </div>
              )}

              {selectedApp.remarks && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">मागील शेरा</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {selectedApp.remarks}
                  </p>
                </div>
              )}

              <hr className="border-gray-200 dark:border-gray-700" />

              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                स्थिती अपडेट करा
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">स्थिती</Label>
                  <select
                    id="status"
                    value={statusForm.status}
                    onChange={(e) =>
                      setStatusForm((prev) => ({ ...prev, status: e.target.value }))
                    }
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option value="pending">प्रलंबित</option>
                    <option value="in-review">पुनरावलोकनात</option>
                    <option value="approved">मंजूर</option>
                    <option value="rejected">नाकारले</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="remarks">शेरा</Label>
                <TextArea
                  value={statusForm.remarks}
                  onChange={(val) =>
                    setStatusForm((prev) => ({ ...prev, remarks: val }))
                  }
                  rows={3}
                  placeholder="शेरा जोडा (ऐच्छिक)"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={closeModal}>
                  बंद करा
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={saving || statusForm.status === selectedApp.status}
                  onClick={handleStatusUpdate}
                >
                  {saving ? "अपडेट करत आहे..." : "स्थिती अपडेट करा"}
                </Button>
              </div>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
