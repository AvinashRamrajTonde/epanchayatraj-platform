import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../icons";
import { villageAdminService } from "../../services/villageAdminService";

interface DevelopmentWork {
  id: string;
  schemeName: string;
  workName: string;
  financialYear: string;
  sanctionedAmount: number;
  expendedAmount: number;
  status: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const currentYear = new Date().getFullYear();

// Generate financial year options for the last 10 years and next 2 years
const financialYearOptions = Array.from({ length: 12 }, (_, i) => {
  const y = currentYear + 2 - i;
  return { value: `${y - 1}-${y}`, label: `${y - 1}-${y}` };
});

const statusOptions = [
  { value: "in_progress", label: "चालू (In Progress)" },
  { value: "completed", label: "पूर्ण (Completed)" },
];

export default function DevelopmentWorks() {
  const [works, setWorks] = useState<DevelopmentWork[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, openModal, closeModal } = useModal();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const emptyForm = {
    schemeName: "",
    workName: "",
    financialYear: `${currentYear - 1}-${currentYear}`,
    sanctionedAmount: "",
    expendedAmount: "",
    status: "in_progress",
    isPublished: true,
  };
  const [form, setForm] = useState(emptyForm);

  const fetchWorks = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterYear) params.financialYear = filterYear;
      if (filterStatus) params.status = filterStatus;
      const res = await villageAdminService.getDevelopmentWorks(params);
      setWorks(res.data || []);
    } catch {
      console.error("Failed to load development works");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, [filterYear, filterStatus]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    openModal();
  };

  const handleEdit = (w: DevelopmentWork) => {
    setEditingId(w.id);
    setForm({
      schemeName: w.schemeName,
      workName: w.workName,
      financialYear: w.financialYear,
      sanctionedAmount: String(w.sanctionedAmount),
      expendedAmount: String(w.expendedAmount),
      status: w.status,
      isPublished: w.isPublished,
    });
    setError("");
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("हे काम खरोखर हटवायचे आहे का?")) return;
    try {
      await villageAdminService.deleteDevelopmentWork(id);
      fetchWorks();
    } catch {
      alert("हटवताना त्रुटी आली");
    }
  };

  const handleSubmit = async () => {
    if (!form.schemeName.trim()) {
      setError("योजनेचे नाव आवश्यक आहे");
      return;
    }
    if (!form.workName.trim()) {
      setError("कामाचे नाव आवश्यक आहे");
      return;
    }
    if (!form.sanctionedAmount || parseFloat(form.sanctionedAmount) < 0) {
      setError("मंजूर निधी आवश्यक आहे");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        schemeName: form.schemeName.trim(),
        workName: form.workName.trim(),
        financialYear: form.financialYear,
        sanctionedAmount: parseFloat(form.sanctionedAmount),
        expendedAmount: parseFloat(form.expendedAmount) || 0,
        status: form.status,
        isPublished: form.isPublished,
      };
      if (editingId) {
        await villageAdminService.updateDevelopmentWork(editingId, payload);
      } else {
        await villageAdminService.createDevelopmentWork(payload);
      }
      closeModal();
      fetchWorks();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "जतन करताना त्रुटी आली";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("mr-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <>
      <PageMeta title="विकास कामे | व्यवस्थापन" />
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              🏗️ विकास कामे
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              हाती घेतलेली व पूर्ण केलेली कामे व्यवस्थापित करा
            </p>
          </div>
          <Button onClick={handleAdd} size="md">
            <PlusIcon className="w-4 h-4 mr-1.5" />
            नवीन काम जोडा
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-700 dark:text-gray-300"
          >
            <option value="">सर्व आर्थिक वर्षे</option>
            {financialYearOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-700 dark:text-gray-300"
          >
            <option value="">सर्व स्थिती</option>
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
          </div>
        ) : works.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-4xl mb-3">🏗️</p>
            <p className="text-gray-500 dark:text-gray-400">
              अद्याप कोणतेही विकास कामे जोडलेले नाहीत
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                  <th className="px-4 py-3 text-left font-semibold">#</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    योजनेचे नाव
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    कामाचे नाव
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    आर्थिक वर्ष
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    मंजूर निधी
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    खर्च निधी
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    स्थिती
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    प्रकाशित
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    कृती
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {works.map((w, i) => (
                  <tr
                    key={w.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">
                      {w.schemeName}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {w.workName}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {w.financialYear}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-700 dark:text-green-400">
                      {formatCurrency(w.sanctionedAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(w.expendedAmount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        color={
                          w.status === "completed" ? "success" : "warning"
                        }
                      >
                        {w.status === "completed" ? "पूर्ण" : "चालू"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge color={w.isPublished ? "success" : "error"}>
                        {w.isPublished ? "हो" : "नाही"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(w)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                          title="संपादन"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(w.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                          title="हटवा"
                        >
                          <TrashBinIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-xl p-6 lg:p-8"
      >
        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
          {editingId ? "काम संपादित करा" : "नवीन काम जोडा"}
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Financial Year Select */}
          <div>
            <Label>आर्थिक वर्ष *</Label>
            <Select
              options={financialYearOptions}
              defaultValue={form.financialYear}
              onChange={(v) => setForm((p) => ({ ...p, financialYear: v }))}
              className="mt-1"
            />
          </div>

          {/* Scheme Name */}
          <div>
            <Label>योजनेचे नाव *</Label>
            <Input
              name="schemeName"
              value={form.schemeName}
              onChange={handleInputChange}
              placeholder="उदा. १५ वा वित्त आयोग"
            />
          </div>

          {/* Work Name */}
          <div>
            <Label>कामाचे नाव *</Label>
            <Input
              name="workName"
              value={form.workName}
              onChange={handleInputChange}
              placeholder="उदा. गावातील मुख्य रस्ता काँक्रीटीकरण"
            />
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>मंजूर निधी (₹) *</Label>
              <Input
                name="sanctionedAmount"
                type="number"
                value={form.sanctionedAmount}
                onChange={handleInputChange}
                placeholder="उदा. 35000"
              />
            </div>
            <div>
              <Label>खर्च निधी (₹)</Label>
              <Input
                name="expendedAmount"
                type="number"
                value={form.expendedAmount}
                onChange={handleInputChange}
                placeholder="उदा. 10000"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <Label>स्थिती</Label>
            <Select
              options={statusOptions}
              defaultValue={form.status}
              onChange={(v) => setForm((p) => ({ ...p, status: v }))}
              className="mt-1"
            />
          </div>

          {/* Published */}
          <div className="flex items-center gap-2">
            <input
              id="isPublished"
              type="checkbox"
              name="isPublished"
              checked={form.isPublished}
              onChange={handleInputChange}
              className="rounded border-gray-300"
            />
            <label
              htmlFor="isPublished"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              वेबसाइटवर प्रकाशित करा
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={closeModal}>
            रद्द करा
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "जतन होत आहे..." : editingId ? "अपडेट करा" : "जोडा"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
