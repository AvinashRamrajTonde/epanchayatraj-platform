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

interface Scheme {
  id: string;
  title: string;
  description: string;
  category: string;
  benefits: string[];
  eligibility: string[];
  documents: string[];
  applicationProcess: string[];
  contactInfo: string | null;
  budget: string | null;
  beneficiaries: number | null;
  imageUrl: string | null;
  schemeLink: string | null;
  isActive: boolean;
  createdAt: string;
}

const CATEGORY_OPTIONS = [
  { value: "housing", label: "गृहनिर्माण" },
  { value: "agriculture", label: "कृषी" },
  { value: "education", label: "शिक्षण" },
  { value: "health", label: "आरोग्य" },
  { value: "women", label: "महिला" },
  { value: "employment", label: "रोजगार" },
  { value: "social", label: "सामाजिक" },
  { value: "infrastructure", label: "पायाभूत सुविधा" },
  { value: "other", label: "इतर" },
];

export default function Schemes() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
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
    category: "social",
    benefits: "",
    eligibility: "",
    documents: "",
    applicationProcess: "",
    contactInfo: "",
    budget: "",
    beneficiaries: "",
    imageUrl: "",
    schemeLink: "",
    isActive: true,
  };
  const [form, setForm] = useState(emptyForm);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const res = await villageAdminService.getSchemes({ page, limit: 10 });
      setSchemes(res.data?.schemes || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch {
      console.error("Failed to load schemes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [page]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleEdit = (scheme: Scheme) => {
    setEditingId(scheme.id);
    setForm({
      title: scheme.title,
      description: scheme.description,
      category: scheme.category,
      benefits: (scheme.benefits || []).join("\n"),
      eligibility: (scheme.eligibility || []).join("\n"),
      documents: (scheme.documents || []).join("\n"),
      applicationProcess: (scheme.applicationProcess || []).join("\n"),
      contactInfo: scheme.contactInfo || "",
      budget: scheme.budget || "",
      beneficiaries: scheme.beneficiaries?.toString() || "",
      imageUrl: scheme.imageUrl || "",
      schemeLink: scheme.schemeLink || "",
      isActive: scheme.isActive,
    });
    setError("");
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ही योजना हटवायची आहे का?")) return;
    try {
      await villageAdminService.deleteScheme(id);
      fetchSchemes();
    } catch {
      alert("योजना हटवता आली नाही");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError("शीर्षक आणि वर्णन आवश्यक आहे");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        benefits: form.benefits
          ? form.benefits.split("\n").map((s) => s.trim()).filter(Boolean)
          : [],
        eligibility: form.eligibility
          ? form.eligibility.split("\n").map((s) => s.trim()).filter(Boolean)
          : [],
        documents: form.documents
          ? form.documents.split("\n").map((s) => s.trim()).filter(Boolean)
          : [],
        applicationProcess: form.applicationProcess
          ? form.applicationProcess.split("\n").map((s) => s.trim()).filter(Boolean)
          : [],
        contactInfo: form.contactInfo || undefined,
        budget: form.budget || undefined,
        beneficiaries: form.beneficiaries || undefined,
        imageUrl: form.imageUrl || null,
        schemeLink: form.schemeLink || null,
        isActive: form.isActive,
      };
      if (editingId) {
        await villageAdminService.updateScheme(editingId, payload);
      } else {
        await villageAdminService.createScheme(payload);
      }
      closeModal();
      fetchSchemes();
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
      <PageMeta title="योजना | गाव प्रशासन" />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
            योजना व्यवस्थापन
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            शासकीय व ग्रामपंचायत योजना व्यवस्थापित करा.
          </p>
        </div>
        <Button size="sm" onClick={handleAdd}>
          <PlusIcon className="w-4 h-4 mr-1" /> नवीन योजना
        </Button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-gray-400">लोड होत आहे...</p>
        </div>
      ) : schemes.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-gray-400">कोणतीही योजना उपलब्ध नाही.</p>
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
                    लाभार्थी
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
                {schemes.map((scheme) => (
                  <tr key={scheme.id}>
                    <td className="px-4 py-3">
                      {scheme.imageUrl ? (
                        <img
                          src={resolveUrl(scheme.imageUrl)}
                          alt={scheme.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-xl">
                          📋
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-white/80">
                      {scheme.title}
                      {scheme.schemeLink && (
                        <a
                          href={scheme.schemeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-xs text-purple-500 hover:text-purple-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          🔗
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge color="primary">{categoryLabel(scheme.category)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {scheme.beneficiaries || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge color={scheme.isActive ? "success" : "warning"}>
                        {scheme.isActive ? "सक्रिय" : "निष्क्रिय"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(scheme)}
                          className="text-blue-500 hover:text-blue-700"
                          title="संपादन"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(scheme.id)}
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
            {editingId ? "योजना संपादन" : "नवीन योजना"}
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
                placeholder="योजनेचे शीर्षक"
              />
            </div>
            <div>
              <Label htmlFor="description">वर्णन *</Label>
              <TextArea
                value={form.description}
                onChange={(val) => setForm((prev) => ({ ...prev, description: val }))}
                rows={3}
                placeholder="योजनेचे सविस्तर वर्णन"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">प्रवर्ग</Label>
                <Select
                  options={CATEGORY_OPTIONS}
                  defaultValue={form.category}
                  onChange={(val) => setForm((prev) => ({ ...prev, category: val }))}
                />
              </div>
              <div>
                <Label htmlFor="budget">अंदाजपत्रक / बजेट</Label>
                <Input
                  type="text"
                  id="budget"
                  name="budget"
                  value={form.budget}
                  onChange={handleInputChange}
                  placeholder="रु. 10,00,000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="beneficiaries">लाभार्थी संख्या</Label>
                <Input
                  type="text"
                  id="beneficiaries"
                  name="beneficiaries"
                  value={form.beneficiaries}
                  onChange={handleInputChange}
                  placeholder="100"
                />
              </div>
              <div>
                <Label htmlFor="contactInfo">संपर्क माहिती</Label>
                <Input
                  type="text"
                  id="contactInfo"
                  name="contactInfo"
                  value={form.contactInfo}
                  onChange={handleInputChange}
                  placeholder="संपर्क क्रमांक / कार्यालय"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="schemeLink">योजना लिंक (URL)</Label>
              <Input
                type="url"
                id="schemeLink"
                name="schemeLink"
                value={form.schemeLink}
                onChange={handleInputChange}
                placeholder="https://mahadbt.maharashtra.gov.in/..."
              />
            </div>
            <div>
              <ImageUpload
                section="schemes"
                label="योजना फोटो"
                value={form.imageUrl}
                onChange={(urls) => setForm((prev) => ({ ...prev, imageUrl: urls[0] || "" }))}
                uploadFn={villageAdminService.uploadImages.bind(villageAdminService)}
                deleteFn={villageAdminService.deleteUploadedImage.bind(villageAdminService)}
                hint="योजनेसाठी प्रातिनिधिक प्रतिमा अपलोड करा"
              />
            </div>
            <div>
              <Label htmlFor="benefits">लाभ / फायदे (प्रत्येक ओळीत एक)</Label>
              <TextArea
                value={form.benefits}
                onChange={(val) => setForm((prev) => ({ ...prev, benefits: val }))}
                rows={3}
                placeholder="लाभ १&#10;लाभ २&#10;लाभ ३"
              />
            </div>
            <div>
              <Label htmlFor="eligibility">पात्रता निकष (प्रत्येक ओळीत एक)</Label>
              <TextArea
                value={form.eligibility}
                onChange={(val) => setForm((prev) => ({ ...prev, eligibility: val }))}
                rows={3}
                placeholder="निकष १&#10;निकष २"
              />
            </div>
            <div>
              <Label htmlFor="documents">आवश्यक कागदपत्रे (प्रत्येक ओळीत एक)</Label>
              <TextArea
                value={form.documents}
                onChange={(val) => setForm((prev) => ({ ...prev, documents: val }))}
                rows={3}
                placeholder="आधार कार्ड&#10;रहिवासी दाखला"
              />
            </div>
            <div>
              <Label htmlFor="applicationProcess">अर्ज प्रक्रिया (प्रत्येक ओळीत एक टप्पा)</Label>
              <TextArea
                value={form.applicationProcess}
                onChange={(val) => setForm((prev) => ({ ...prev, applicationProcess: val }))}
                rows={3}
                placeholder="टप्पा १: अर्ज भरा&#10;टप्पा २: कागदपत्रे जोडा"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={form.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isActive">सक्रिय (Active)</Label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button size="sm" disabled={saving}>
                {saving ? "सेव्ह करत आहे..." : editingId ? "अपडेट करा" : "जोडा"}
              </Button>
              <Button size="sm" variant="outline" onClick={closeModal} type="button">
                रद्द करा
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
