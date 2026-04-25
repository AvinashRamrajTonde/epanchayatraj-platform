import { useEffect, useState, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../icons";
import { villageAdminService } from "../../services/villageAdminService";

interface FinancialReport {
  id: string;
  financialYear: string;
  incomeAmount: number;
  expenseAmount: number;
  balanceAmount: number;
  pdfUrl: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function FinancialReports() {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, openModal, closeModal } = useModal();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentYear = new Date().getFullYear();
  const emptyForm = {
    financialYear: `${currentYear - 1}-${currentYear}`,
    incomeAmount: "",
    expenseAmount: "",
    balanceAmount: "",
    pdfUrl: "",
    isPublished: true,
  };
  const [form, setForm] = useState(emptyForm);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await villageAdminService.getFinancialReports();
      setReports(res.data || []);
    } catch {
      console.error("Failed to load financial reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Auto-calculate balance
  useEffect(() => {
    const income = parseFloat(form.incomeAmount) || 0;
    const expense = parseFloat(form.expenseAmount) || 0;
    setForm((prev) => ({
      ...prev,
      balanceAmount: (income - expense).toFixed(2),
    }));
  }, [form.incomeAmount, form.expenseAmount]);

  const handleAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    openModal();
  };

  const handleEdit = (report: FinancialReport) => {
    setEditingId(report.id);
    setForm({
      financialYear: report.financialYear,
      incomeAmount: String(report.incomeAmount),
      expenseAmount: String(report.expenseAmount),
      balanceAmount: String(report.balanceAmount),
      pdfUrl: report.pdfUrl || "",
      isPublished: report.isPublished,
    });
    setError("");
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("हा आर्थिक अहवाल हटवायचा आहे का?")) return;
    try {
      await villageAdminService.deleteFinancialReport(id);
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("फक्त PDF फाइल अपलोड करता येते");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("PDF फाइल 10MB पेक्षा मोठी असू शकत नाही");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const url = await villageAdminService.uploadPdf("financial", file);
      setForm((prev) => ({ ...prev, pdfUrl: url }));
    } catch {
      setError("PDF अपलोड करता आला नाही");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const fy = form.financialYear.trim();
    if (!/^\d{4}-\d{4}$/.test(fy)) {
      setError("आर्थिक वर्ष '2024-2025' या स्वरूपात असावे");
      setSaving(false);
      return;
    }

    const income = parseFloat(form.incomeAmount);
    const expense = parseFloat(form.expenseAmount);
    if (isNaN(income) || income < 0) {
      setError("जमा रक्कम वैध असावी");
      setSaving(false);
      return;
    }
    if (isNaN(expense) || expense < 0) {
      setError("खर्च रक्कम वैध असावी");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        financialYear: fy,
        incomeAmount: income,
        expenseAmount: expense,
        balanceAmount: income - expense,
        pdfUrl: form.pdfUrl || undefined,
        isPublished: form.isPublished,
      };

      if (editingId) {
        await villageAdminService.updateFinancialReport(editingId, payload);
      } else {
        await villageAdminService.createFinancialReport(payload);
      }
      closeModal();
      fetchReports();
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string; errors?: Array<{ field?: string; message?: string }> } };
      };
      const data = axiosErr.response?.data;
      if (data?.errors && data.errors.length > 0) {
        setError(data.errors.map((e) => e.message).join(", "));
      } else {
        setError(data?.message || "अहवाल सेव्ह करता आला नाही");
      }
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("mr-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <>
      <PageMeta title="जमा खर्च | गाव प्रशासन" description="आर्थिक अहवाल व्यवस्थापन" />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
          जमा खर्च अहवाल
        </h2>
        <Button size="sm" onClick={handleAdd} startIcon={<PlusIcon className="size-4" />}>
          अहवाल जोडा
        </Button>
      </div>

      {/* Reports Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  आर्थिक वर्ष
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  जमा (₹)
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  खर्च (₹)
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  शिल्लक (₹)
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  PDF
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  स्थिती
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  कृती
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                    लोड होत आहे...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                    अद्याप अहवाल नाहीत. पहिला अहवाल जोडा.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <td className="px-5 py-4 text-sm font-semibold text-gray-800 dark:text-white/90">
                      सन {report.financialYear}
                    </td>
                    <td className="px-5 py-4 text-sm text-right font-medium text-green-600">
                      ₹{formatCurrency(report.incomeAmount)}
                    </td>
                    <td className="px-5 py-4 text-sm text-right font-medium text-red-500">
                      ₹{formatCurrency(report.expenseAmount)}
                    </td>
                    <td className="px-5 py-4 text-sm text-right font-bold text-blue-600">
                      ₹{formatCurrency(report.balanceAmount)}
                    </td>
                    <td className="px-5 py-4">
                      {report.pdfUrl ? (
                        <a
                          href={report.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-brand-500 hover:underline"
                        >
                          📄 PDF
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Badge size="sm" color={report.isPublished ? "success" : "warning"}>
                        {report.isPublished ? "प्रकाशित" : "ड्राफ्ट"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(report)}
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="संपादित करा"
                        >
                          <PencilIcon className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="rounded-lg p-1.5 text-error-500 hover:bg-error-50 dark:hover:bg-error-500/15"
                          title="हटवा"
                        >
                          <TrashBinIcon className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] p-6 lg:p-8">
        <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
          {editingId ? "अहवाल संपादित करा" : "जमा खर्च अहवाल जोडा"}
        </h3>
        {error && (
          <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="financialYear">आर्थिक वर्ष *</Label>
            <Input
              type="text"
              id="financialYear"
              name="financialYear"
              value={form.financialYear}
              onChange={handleInputChange}
              placeholder="उदा. 2025-2026"
            />
            <p className="text-xs text-gray-400 mt-1">स्वरूप: 2024-2025</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="incomeAmount">जमा रक्कम (₹) *</Label>
              <Input
                type="number"
                id="incomeAmount"
                name="incomeAmount"
                value={form.incomeAmount}
                onChange={handleInputChange}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="expenseAmount">खर्च रक्कम (₹) *</Label>
              <Input
                type="number"
                id="expenseAmount"
                name="expenseAmount"
                value={form.expenseAmount}
                onChange={handleInputChange}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="balanceAmount">शिल्लक रक्कम (₹)</Label>
            <Input
              type="number"
              id="balanceAmount"
              name="balanceAmount"
              value={form.balanceAmount}
              onChange={handleInputChange}
              disabled
            />
            <p className="text-xs text-gray-400 mt-1">स्वयंचलित गणना: जमा - खर्च</p>
          </div>

          {/* PDF Upload */}
          <div>
            <Label htmlFor="pdfUpload">PDF अहवाल अपलोड करा</Label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                id="pdfUpload"
                accept=".pdf"
                onChange={handlePdfUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-brand-500" />
                    अपलोड होत आहे...
                  </>
                ) : (
                  <>📄 PDF निवडा</>
                )}
              </button>
              {form.pdfUrl && (
                <div className="flex items-center gap-2">
                  <a
                    href={form.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-500 hover:underline"
                  >
                    PDF पहा
                  </a>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, pdfUrl: "" }))}
                    className="text-xs text-red-500 hover:underline"
                  >
                    काढा
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">जास्तीत जास्त 10MB</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublished"
              name="isPublished"
              checked={form.isPublished}
              onChange={handleInputChange}
              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
            />
            <Label htmlFor="isPublished">वेबसाइटवर प्रकाशित करा</Label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={closeModal}>
              रद्द करा
            </Button>
            <Button
              size="sm"
              disabled={saving || !form.financialYear || !form.incomeAmount || !form.expenseAmount}
            >
              {saving ? "सेव्ह करत आहे..." : editingId ? "अपडेट करा" : "अहवाल जोडा"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
