import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Select from "../../components/form/Select";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../icons";
import { villageAdminService } from "../../services/villageAdminService";
import ImageUpload from "../../components/form/ImageUpload";
import { resolveUrl } from "../../utils/resolveUrl";

interface Award {
  id: string;
  title: string;
  description: string | null;
  year: number | null;
  category: string;
  awardedBy: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

const CATEGORY_OPTIONS = [
  { value: "general", label: "सामान्य" },
  { value: "governance", label: "प्रशासन" },
  { value: "sanitation", label: "स्वच्छता" },
  { value: "development", label: "विकास" },
  { value: "education", label: "शिक्षण" },
  { value: "health", label: "आरोग्य" },
  { value: "environment", label: "पर्यावरण" },
  { value: "digital", label: "डिजिटल" },
  { value: "other", label: "इतर" },
];

export default function Awards() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { isOpen, openModal, closeModal } = useModal();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyForm = {
    title: "",
    description: "",
    year: "",
    category: "general",
    awardedBy: "",
    imageUrl: "",
    sortOrder: "0",
    isActive: true,
  };
  const [form, setForm] = useState(emptyForm);

  const fetchAwards = async () => {
    setLoading(true);
    try {
      const res = await villageAdminService.getAwards({ page, limit: 10 });
      setAwards(res.data?.awards || res.data || []);
      setTotalPages(res.data?.pagination?.totalPages || res.pagination?.totalPages || 1);
    } catch {
      console.error("Failed to load awards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAwards();
  }, [page]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    openModal();
  };

  const handleEdit = (award: Award) => {
    setEditingId(award.id);
    setForm({
      title: award.title,
      description: award.description || "",
      year: award.year?.toString() || "",
      category: award.category,
      awardedBy: award.awardedBy || "",
      imageUrl: award.imageUrl || "",
      sortOrder: award.sortOrder.toString(),
      isActive: award.isActive,
    });
    setError("");
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("हा पुरस्कार हटवायचा आहे का?")) return;
    try {
      await villageAdminService.deleteAward(id);
      fetchAwards();
    } catch {
      alert("पुरस्कार हटवता आला नाही");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("शीर्षक आवश्यक आहे");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        year: form.year ? parseInt(form.year) : undefined,
        category: form.category,
        awardedBy: form.awardedBy || undefined,
        imageUrl: form.imageUrl || undefined,
        sortOrder: parseInt(form.sortOrder) || 0,
        isActive: form.isActive,
      };
      if (editingId) {
        await villageAdminService.updateAward(editingId, payload);
      } else {
        await villageAdminService.createAward(payload);
      }
      closeModal();
      fetchAwards();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "सेव्ह करता आले नाही");
    } finally {
      setSaving(false);
    }
  };

  const categoryLabel = (key: string) =>
    CATEGORY_OPTIONS.find((c) => c.value === key)?.label || key;

  return (
    <>
      <PageMeta title="पुरस्कार | गाव प्रशासन" />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
            पुरस्कार व्यवस्थापन
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            गावाला मिळालेल्या पुरस्कारांची माहिती व्यवस्थापित करा.
          </p>
        </div>
        <Button size="sm" onClick={handleAdd}>
          <PlusIcon className="w-4 h-4 mr-1" /> नवीन पुरस्कार
        </Button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-gray-400">लोड होत आहे...</p>
        </div>
      ) : awards.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-gray-400">कोणताही पुरस्कार जोडलेला नाही.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    फोटो
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    शीर्षक
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    प्रवर्ग
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    वर्ष
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    द्वारे
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    स्थिती
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    क्रिया
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {awards.map((award) => (
                  <tr key={award.id}>
                    <td className="px-4 py-3">
                      {award.imageUrl ? (
                        <img
                          src={resolveUrl(award.imageUrl)}
                          alt={award.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-xl">
                          🏆
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-white/80 font-medium">
                      {award.title}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge color="primary">
                        {categoryLabel(award.category)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {award.year || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {award.awardedBy || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge color={award.isActive ? "success" : "warning"}>
                        {award.isActive ? "सक्रिय" : "निष्क्रिय"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(award)}
                          className="text-blue-500 hover:text-blue-700"
                          title="संपादन"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(award.id)}
                          className="text-red-500 hover:text-red-700"
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

          {totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                मागील
              </Button>
              <span className="px-3 py-2 text-sm text-gray-500">
                {page} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                पुढील
              </Button>
            </div>
          )}
        </>
      )}

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-2xl">
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            {editingId ? "पुरस्कार संपादन" : "नवीन पुरस्कार"}
          </h3>
          {error && (
            <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">शीर्षक *</Label>
              <Input
                type="text"
                id="title"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                placeholder="पुरस्काराचे नाव"
              />
            </div>
            <div>
              <Label htmlFor="description">वर्णन</Label>
              <TextArea
                value={form.description}
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, description: val }))
                }
                rows={3}
                placeholder="पुरस्काराचे सविस्तर वर्णन"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">प्रवर्ग</Label>
                <Select
                  options={CATEGORY_OPTIONS}
                  defaultValue={form.category}
                  onChange={(val) =>
                    setForm((prev) => ({ ...prev, category: val }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="year">वर्ष</Label>
                <Input
                  type="number"
                  id="year"
                  name="year"
                  value={form.year}
                  onChange={handleInputChange}
                  placeholder="2024"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="awardedBy">पुरस्कार देणारा</Label>
                <Input
                  type="text"
                  id="awardedBy"
                  name="awardedBy"
                  value={form.awardedBy}
                  onChange={handleInputChange}
                  placeholder="शासन / संस्था"
                />
              </div>
              <div>
                <Label htmlFor="sortOrder">क्रमांक</Label>
                <Input
                  type="number"
                  id="sortOrder"
                  name="sortOrder"
                  value={form.sortOrder}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <ImageUpload
                label="पुरस्कार फोटो"
                section="awards"
                maxFiles={1}
                value={form.imageUrl || undefined}
                onChange={(urls: string[]) =>
                  setForm((prev) => ({ ...prev, imageUrl: urls[0] || "" }))
                }
                uploadFn={villageAdminService.uploadImages}
                deleteFn={villageAdminService.deleteUploadedImage}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={form.isActive}
                onChange={handleInputChange}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive">सक्रिय</Label>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={closeModal} type="button">
                रद्द करा
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "सेव्ह होत आहे..." : editingId ? "अपडेट करा" : "जोडा"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
