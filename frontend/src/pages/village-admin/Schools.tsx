import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
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

interface School {
  id: string;
  name: string;
  address: string | null;
  principalName: string | null;
  principalPhoto: string | null;
  schoolPhoto: string | null;
  boysCount: number;
  girlsCount: number;
  teachersCount: number;
  establishedYear: number | null;
  phone: string | null;
  email: string | null;
  managementType: string | null;
  medium: string | null;
  isActive: boolean;
  createdAt: string;
}

const MANAGEMENT_OPTIONS = [
  { value: "zp", label: "जिल्हा परिषद" },
  { value: "private", label: "खाजगी" },
  { value: "aided", label: "अनुदानित" },
  { value: "government", label: "शासकीय" },
  { value: "semi-government", label: "अर्ध-शासकीय" },
];

const MEDIUM_OPTIONS = [
  { value: "marathi", label: "मराठी" },
  { value: "english", label: "इंग्रजी" },
  { value: "semi-english", label: "सेमी इंग्रजी" },
  { value: "urdu", label: "उर्दू" },
  { value: "hindi", label: "हिंदी" },
];

const emptyForm = {
  name: "",
  address: "",
  principalName: "",
  principalPhoto: "",
  schoolPhoto: "",
  boysCount: "",
  girlsCount: "",
  teachersCount: "",
  establishedYear: "",
  phone: "",
  email: "",
  managementType: "",
  medium: "",
  isActive: true,
};

export default function SchoolsAdmin() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, openModal, closeModal } = useModal();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await villageAdminService.getSchools();
      setSchools(res.data?.schools || []);
    } catch {
      console.error("Failed to load schools");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    openModal();
  };

  const handleEdit = (s: School) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      address: s.address || "",
      principalName: s.principalName || "",
      principalPhoto: s.principalPhoto || "",
      schoolPhoto: s.schoolPhoto || "",
      boysCount: s.boysCount?.toString() || "",
      girlsCount: s.girlsCount?.toString() || "",
      teachersCount: s.teachersCount?.toString() || "",
      establishedYear: s.establishedYear?.toString() || "",
      phone: s.phone || "",
      email: s.email || "",
      managementType: s.managementType || "",
      medium: s.medium || "",
      isActive: s.isActive,
    });
    setError("");
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ही शाळा हटवायची आहे का?")) return;
    try {
      await villageAdminService.deleteSchool(id);
      fetchSchools();
    } catch {
      alert("शाळा हटवता आली नाही");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("शाळेचे नाव आवश्यक आहे");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        address: form.address || undefined,
        principalName: form.principalName || undefined,
        principalPhoto: form.principalPhoto || undefined,
        schoolPhoto: form.schoolPhoto || undefined,
        boysCount: form.boysCount ? parseInt(form.boysCount) : 0,
        girlsCount: form.girlsCount ? parseInt(form.girlsCount) : 0,
        teachersCount: form.teachersCount ? parseInt(form.teachersCount) : 0,
        establishedYear: form.establishedYear ? parseInt(form.establishedYear) : undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        managementType: form.managementType || undefined,
        medium: form.medium || undefined,
        isActive: form.isActive,
      };
      if (editingId) {
        await villageAdminService.updateSchool(editingId, payload);
      } else {
        await villageAdminService.createSchool(payload);
      }
      closeModal();
      fetchSchools();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "सेव्ह करता आले नाही");
    } finally {
      setSaving(false);
    }
  };

  const managementLabel = (s: string | null) =>
    MANAGEMENT_OPTIONS.find((o) => o.value === s)?.label || s || "-";

  const mediumLabel = (s: string | null) =>
    MEDIUM_OPTIONS.find((o) => o.value === s)?.label || s || "-";

  return (
    <>
      <PageMeta title="शाळा | गाव प्रशासन" />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
            शाळा व्यवस्थापन
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            गावातील शाळांची माहिती जोडा, संपादित करा किंवा काढा.
          </p>
        </div>
        <Button size="sm" onClick={handleAdd}>
          <PlusIcon className="w-4 h-4 mr-1" /> शाळा जोडा
        </Button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-gray-400">लोड होत आहे...</p>
        </div>
      ) : schools.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-gray-400">कोणतीही शाळा जोडलेली नाही.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {schools.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-white/[0.03]"
            >
              {/* School photo banner */}
              {s.schoolPhoto && (
                <div className="h-36 overflow-hidden">
                  <img
                    src={resolveUrl(s.schoolPhoto)}
                    alt={s.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {s.principalPhoto ? (
                      <img
                        src={resolveUrl(s.principalPhoto)}
                        alt={s.principalName || ""}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 dark:bg-gray-800">
                        <span className="text-lg">🏫</span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                        {s.name}
                      </h3>
                      {s.principalName && (
                        <p className="text-xs text-gray-500">मुख्याध्यापक: {s.principalName}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => handleEdit(s)} className="text-blue-500 hover:text-blue-700 p-1">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 p-1">
                      <TrashBinIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {s.address && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">📍 {s.address}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md dark:bg-blue-900/20 dark:text-blue-400">
                    मुले: {s.boysCount}
                  </span>
                  <span className="bg-pink-50 text-pink-700 px-2 py-1 rounded-md dark:bg-pink-900/20 dark:text-pink-400">
                    मुली: {s.girlsCount}
                  </span>
                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md dark:bg-green-900/20 dark:text-green-400">
                    शिक्षक: {s.teachersCount}
                  </span>
                  <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md dark:bg-purple-900/20 dark:text-purple-400">
                    {managementLabel(s.managementType)}
                  </span>
                  <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded-md dark:bg-orange-900/20 dark:text-orange-400">
                    माध्यम: {mediumLabel(s.medium)}
                  </span>
                  {s.establishedYear && (
                    <span className="bg-gray-50 text-gray-600 px-2 py-1 rounded-md dark:bg-gray-800 dark:text-gray-400">
                      स्थापना: {s.establishedYear}
                    </span>
                  )}
                </div>
                {!s.isActive && (
                  <div className="mt-2 text-xs text-red-500 font-medium">🔴 निष्क्रिय</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-2xl">
        <div className="p-6 max-h-[85vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            {editingId ? "शाळा संपादन" : "नवीन शाळा जोडा"}
          </h3>
          {error && (
            <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">शाळेचे नाव *</Label>
              <Input type="text" id="name" name="name" value={form.name} onChange={handleInputChange} placeholder="जिल्हा परिषद प्राथमिक शाळा" />
            </div>
            <div>
              <Label htmlFor="address">पत्ता</Label>
              <Input type="text" id="address" name="address" value={form.address} onChange={handleInputChange} placeholder="मुख्य रस्ता, गाव" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="principalName">मुख्याध्यापक नाव</Label>
                <Input type="text" id="principalName" name="principalName" value={form.principalName} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="establishedYear">स्थापना वर्ष</Label>
                <Input type="number" id="establishedYear" name="establishedYear" value={form.establishedYear} onChange={handleInputChange} placeholder="1985" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <ImageUpload
                  label="मुख्याध्यापक फोटो"
                  section="school-principal"
                  maxFiles={1}
                  value={form.principalPhoto || undefined}
                  onChange={(urls: string[]) => setForm((prev) => ({ ...prev, principalPhoto: urls[0] || "" }))}
                  uploadFn={villageAdminService.uploadImages}
                  deleteFn={villageAdminService.deleteUploadedImage}
                  compact
                />
              </div>
              <div>
                <ImageUpload
                  label="शाळेचा फोटो"
                  section="school-photo"
                  maxFiles={1}
                  value={form.schoolPhoto || undefined}
                  onChange={(urls: string[]) => setForm((prev) => ({ ...prev, schoolPhoto: urls[0] || "" }))}
                  uploadFn={villageAdminService.uploadImages}
                  deleteFn={villageAdminService.deleteUploadedImage}
                  compact
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="boysCount">मुले संख्या</Label>
                <Input type="number" id="boysCount" name="boysCount" value={form.boysCount} onChange={handleInputChange} placeholder="0" />
              </div>
              <div>
                <Label htmlFor="girlsCount">मुली संख्या</Label>
                <Input type="number" id="girlsCount" name="girlsCount" value={form.girlsCount} onChange={handleInputChange} placeholder="0" />
              </div>
              <div>
                <Label htmlFor="teachersCount">शिक्षक संख्या</Label>
                <Input type="number" id="teachersCount" name="teachersCount" value={form.teachersCount} onChange={handleInputChange} placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">दूरध्वनी</Label>
                <Input type="text" id="phone" name="phone" value={form.phone} onChange={handleInputChange} placeholder="9876543210" />
              </div>
              <div>
                <Label htmlFor="email">ईमेल</Label>
                <Input type="email" id="email" name="email" value={form.email} onChange={handleInputChange} placeholder="school@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>व्यवस्थापन प्रकार</Label>
                <Select
                  options={MANAGEMENT_OPTIONS}
                  defaultValue={form.managementType}
                  onChange={(val) => setForm((prev) => ({ ...prev, managementType: val }))}
                  placeholder="निवडा"
                />
              </div>
              <div>
                <Label>माध्यम</Label>
                <Select
                  options={MEDIUM_OPTIONS}
                  defaultValue={form.medium}
                  onChange={(val) => setForm((prev) => ({ ...prev, medium: val }))}
                  placeholder="निवडा"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">शाळा सक्रिय आहे</label>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={closeModal} type="button">रद्द करा</Button>
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
