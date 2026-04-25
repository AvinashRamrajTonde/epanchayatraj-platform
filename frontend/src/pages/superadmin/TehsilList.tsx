import { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { Modal } from "../../components/ui/modal";
import { superadminService } from "../../services/superadminService";
import { useModal } from "../../hooks/useModal";

interface Tehsil {
  id: string;
  name: string;
  nameEn?: string;
  district: string;
  districtEn?: string;
  state: string;
  stateSlug?: string;
  _count: { villages: number };
}

const emptyForm = { name: "", nameEn: "", district: "", districtEn: "", state: "", stateSlug: "" };

export default function TehsilList() {
  const [tehsils, setTehsils] = useState<Tehsil[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, openModal, closeModal } = useModal();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingTehsil, setEditingTehsil] = useState<Tehsil | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Tehsil | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ created: number; skipped: number; errors: string[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  // ── Excel export ────────────────────────────────────────────────────────────
  const handleExport = () => {
    const rows = tehsils.map((t) => ({
      "नाव": t.name,
      "Name EN": t.nameEn || "",
      "जिल्हा": t.district,
      "District EN": t.districtEn || "",
      "राज्य": t.state,
      "State Slug": t.stateSlug || "",
      "गावे": t._count.villages,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tehsils");
    XLSX.writeFile(wb, `tehsils_export_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // ── Excel import ────────────────────────────────────────────────────────────
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportStatus(null);
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws);
      const res = await superadminService.bulkImportTehsils(rows);
      setImportStatus(res.data);
      fetchTehsils();
    } catch (err: any) {
      setImportStatus({ created: 0, skipped: 0, errors: [err.response?.data?.message || err.message || "Import failed"] });
    } finally {
      setImporting(false);
      if (importInputRef.current) importInputRef.current.value = "";
    }
  };

  const [form, setForm] = useState({ ...emptyForm });

  const fetchTehsils = async () => {
    setLoading(true);
    try {
      const res = await superadminService.getTehsils();
      setTehsils(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTehsils();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openCreate = () => {
    setEditingTehsil(null);
    setForm({ ...emptyForm });
    setError("");
    openModal();
  };

  const openEdit = (tehsil: Tehsil) => {
    setEditingTehsil(tehsil);
    setForm({
      name: tehsil.name,
      nameEn: tehsil.nameEn || "",
      district: tehsil.district,
      districtEn: tehsil.districtEn || "",
      state: tehsil.state,
      stateSlug: tehsil.stateSlug || "",
    });
    setError("");
    openModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingTehsil) {
        await superadminService.updateTehsil(editingTehsil.id, form);
      } else {
        await superadminService.createTehsil(form);
      }
      setForm({ ...emptyForm });
      setEditingTehsil(null);
      closeModal();
      fetchTehsils();
    } catch (err: any) {
      setError(err.response?.data?.message || "तहसील जतन करता आली नाही");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await superadminService.deleteTehsil(deleteConfirm.id);
      setDeleteConfirm(null);
      fetchTehsils();
    } catch (err: any) {
      alert(err.response?.data?.message || "तहसील हटवता आली नाही");
    } finally {
      setDeleting(false);
    }
  };

  // ── Download import template ────────────────────────────────────────────────
  const handleDownloadTemplate = () => {
    const template = [
      { "नाव": "उदा. हुजूर", "Name EN": "Huzur", "जिल्हा": "भोपाळ", "District EN": "Bhopal", "राज्य": "महाराष्ट्र", "State Slug": "Maharashtra" },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "tehsil_import_template.xlsx");
  };

  return (
    <>
      <PageMeta title="तहसील | GPMH Admin" description="तहसील व्यवस्थापन" />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
          तहसील यादी
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden file input for import */}
          <input
            ref={importInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleImportFile}
          />
          <button
            onClick={() => importInputRef.current?.click()}
            disabled={importing}
            className="rounded-lg border border-green-300 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-500/10"
          >
            {importing ? "इम्पोर्ट होत आहे..." : "↑ Excel इम्पोर्ट"}
          </button>
          <button
            onClick={handleDownloadTemplate}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            title="Import साठी Excel template डाउनलोड करा"
          >
            Template
          </button>
          <button
            onClick={handleExport}
            disabled={tehsils.length === 0}
            className="rounded-lg border border-blue-300 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-500/10"
          >
            ↓ Excel एक्सपोर्ट
          </button>
          <Button size="sm" onClick={openCreate}>
            तहसील जोडा
          </Button>
        </div>
      </div>

      {/* Import status banner */}
      {importStatus && (
        <div className={`mb-4 rounded-lg p-3 text-sm ${
          importStatus.errors.length > 0
            ? "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400"
            : "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400"
        }`}>
          <span className="font-medium">इम्पोर्ट पूर्ण: </span>
          {importStatus.created} तहसीली तयार केल्या, {importStatus.skipped} स्किप केल्या.
          {importStatus.errors.length > 0 && (
            <ul className="mt-1 list-disc pl-4 text-xs">
              {importStatus.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
          <button className="ml-3 text-xs underline" onClick={() => setImportStatus(null)}>निगद करा</button>
        </div>
      )}

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
                  Name (EN)
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  जिल्हा
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  District (EN)
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  राज्य
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  गावे
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  क्रिया
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-8 text-center text-sm text-gray-500"
                  >
                    लोड होत आहे...
                  </td>
                </tr>
              ) : tehsils.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-8 text-center text-sm text-gray-500"
                  >
                    तहसील सापडल्या नाहीत. पहिली तहसील जोडा!
                  </td>
                </tr>
              ) : (
                tehsils.map((tehsil) => (
                  <tr
                    key={tehsil.id}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                      {tehsil.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {tehsil.nameEn || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {tehsil.district}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {tehsil.districtEn || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {tehsil.state}{tehsil.stateSlug ? ` (${tehsil.stateSlug})` : ""}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {tehsil._count.villages}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(tehsil)}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-brand-500 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10"
                        >
                          संपादन
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(tehsil)}
                          disabled={tehsil._count.villages > 0}
                          title={tehsil._count.villages > 0 ? "गावे असलेली तहसील हटवता येत नाही" : "तहसील हटवा"}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-error-500 hover:bg-error-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-error-400 dark:hover:bg-error-500/10"
                        >
                          हटवा
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

      {/* Create / Edit Tehsil Modal */}
      <Modal isOpen={isOpen} onClose={closeModal}>
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            {editingTehsil ? "तहसील संपादन करा" : "नवीन तहसील जोडा"}
          </h3>
          {error && (
            <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>
                    तहसील नाव (मराठी) <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder="उदा. हुजूर"
                    value={form.name}
                    onChange={handleChange}
                    name="name"
                  />
                </div>
                <div>
                  <Label>
                    Tehsil Name (English)
                  </Label>
                  <Input
                    placeholder="e.g. Hujur"
                    value={form.nameEn}
                    onChange={handleChange}
                    name="nameEn"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>
                    जिल्हा (मराठी) <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder="उदा. भोपाल"
                    value={form.district}
                    onChange={handleChange}
                    name="district"
                  />
                </div>
                <div>
                  <Label>
                    District (English)
                  </Label>
                  <Input
                    placeholder="e.g. Bhopal"
                    value={form.districtEn}
                    onChange={handleChange}
                    name="districtEn"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>
                    राज्य (मराठी) <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder="उदा. महाराष्ट्र"
                    value={form.state}
                    onChange={handleChange}
                    name="state"
                  />
                </div>
                <div>
                  <Label>
                    State Slug (English)
                  </Label>
                  <Input
                    placeholder="e.g. Maharashtra"
                    value={form.stateSlug}
                    onChange={handleChange}
                    name="stateSlug"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400">
                English names are used for weather API geocoding. Fill them for accurate weather data.
              </p>
              <div className="flex gap-3 pt-2">
                <Button size="sm" disabled={saving}>
                  {saving
                    ? "जतन करत आहे..."
                    : editingTehsil
                    ? "बदल जतन करा"
                    : "तहसील तयार करा"}
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingTehsil(null);
                    closeModal();
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  रद्द करा
                </button>
              </div>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-50 dark:bg-error-500/15">
            <svg className="h-7 w-7 text-error-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
            तहसील हटवायची आहे?
          </h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            <strong>{deleteConfirm?.name}</strong> ({deleteConfirm?.district}) ही तहसील कायमची हटवली जाईल. ही क्रिया पूर्ववत करता येणार नाही.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-error-500 px-5 py-2 text-sm font-medium text-white hover:bg-error-600 disabled:opacity-50"
            >
              {deleting ? "हटवत आहे..." : "होय, हटवा"}
            </button>
            <button
              onClick={() => setDeleteConfirm(null)}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              रद्द करा
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
