import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Select from "../../components/form/Select";
import ImageUpload from "../../components/form/ImageUpload";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../icons";
import { villageAdminService } from "../../services/villageAdminService";

interface Program {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string | null;
  date: string | null;
  images: string[];
  highlights: string[];
  result: string | null;
  isPublished: boolean;
  createdAt: string;
}

const CATEGORY_OPTIONS = [
  { value: "development", label: "विकासकामे" },
  { value: "education", label: "शिक्षण" },
  { value: "health", label: "आरोग्य" },
  { value: "culture", label: "सांस्कृतिक" },
  { value: "agriculture", label: "कृषी" },
  { value: "sports", label: "क्रीडा" },
  { value: "environment", label: "पर्यावरण" },
  { value: "women", label: "महिला" },
  { value: "other", label: "इतर" },
];

const CATEGORY_ICONS: Record<string, string> = {
  development: "🏗️",
  education: "📚",
  health: "🏥",
  culture: "🎭",
  agriculture: "🌾",
  sports: "⚽",
  environment: "🌿",
  women: "👩",
  other: "📌",
};

const CATEGORY_COLORS: Record<string, string> = {
  development: "from-blue-500 to-blue-600",
  education: "from-purple-500 to-purple-600",
  health: "from-rose-500 to-rose-600",
  culture: "from-amber-500 to-amber-600",
  agriculture: "from-green-500 to-green-600",
  sports: "from-cyan-500 to-cyan-600",
  environment: "from-emerald-500 to-emerald-600",
  women: "from-pink-500 to-pink-600",
  other: "from-gray-500 to-gray-600",
};

export default function Programs() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { isOpen, openModal, closeModal } = useModal();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const emptyForm = {
    title: "",
    description: "",
    category: "development",
    location: "",
    date: "",
    images: [] as string[],
    highlights: "",
    result: "",
    isPublished: true,
  };
  const [form, setForm] = useState(emptyForm);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await villageAdminService.getPrograms({ page, limit: 10 });
      // API returns { success, data: { programs: [...], pagination } }
      const data = res.data || res;
      const list = data.programs || data;
      setPrograms(Array.isArray(list) ? list : []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch {
      console.error("Failed to load programs");
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
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

  const handleEdit = (program: Program) => {
    setEditingId(program.id);
    setForm({
      title: program.title,
      description: program.description,
      category: program.category,
      location: program.location || "",
      date: program.date ? program.date.split("T")[0] : "",
      images: program.images || [],
      highlights: (program.highlights || []).join(", "),
      result: program.result || "",
      isPublished: program.isPublished,
    });
    setError("");
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("हा कार्यक्रम हटवायचा आहे का?")) return;
    try {
      await villageAdminService.deleteProgram(id);
      fetchPrograms();
    } catch {
      alert("कार्यक्रम हटवता आला नाही");
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
        location: form.location || undefined,
        date: form.date ? new Date(form.date).toISOString() : undefined,
        images: form.images,
        highlights: form.highlights
          ? form.highlights.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        result: form.result || undefined,
        isPublished: form.isPublished,
      };
      if (editingId) {
        await villageAdminService.updateProgram(editingId, payload);
      } else {
        await villageAdminService.createProgram(payload);
      }
      closeModal();
      fetchPrograms();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "सेव्ह करता आले नाही");
    } finally {
      setSaving(false);
    }
  };

  const categoryLabel = (key: string) =>
    CATEGORY_OPTIONS.find((c) => c.value === key)?.label || key;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("mr-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <PageMeta title="कार्यक्रम | गाव प्रशासन" />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            🏗️ कार्यक्रम व्यवस्थापन
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            एकूण {total} कार्यक्रम • ग्रामपंचायत कार्यक्रम, उपक्रम व विकासकामे
          </p>
        </div>
        <Button size="sm" onClick={handleAdd}>
          <PlusIcon className="w-4 h-4 mr-1.5" /> नवीन कार्यक्रम
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="text-sm text-gray-400">कार्यक्रम लोड होत आहेत...</p>
          </div>
        </div>
      ) : programs.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center dark:border-gray-700 dark:bg-gray-900/30">
          <span className="text-5xl block mb-4">🏗️</span>
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
            कोणताही कार्यक्रम नाही
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            पहिला कार्यक्रम जोडून सुरूवात करा
          </p>
          <Button size="sm" onClick={handleAdd}>
            <PlusIcon className="w-4 h-4 mr-1.5" /> कार्यक्रम जोडा
          </Button>
        </div>
      ) : (
        <>
          {/* Program Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {programs.map((prog) => {
              const firstImage = prog.images?.[0];
              const isExpanded = expandedId === prog.id;
              return (
                <div
                  key={prog.id}
                  className="group relative rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden"
                >
                  {/* Image / Gradient Header */}
                  {firstImage ? (
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={firstImage}
                        alt={prog.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-white">
                          {CATEGORY_ICONS[prog.category] || "📌"}{" "}
                          {categoryLabel(prog.category)}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            prog.isPublished
                              ? "bg-green-500/90 text-white"
                              : "bg-yellow-500/90 text-white"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              prog.isPublished ? "bg-green-200" : "bg-yellow-200"
                            }`}
                          />
                          {prog.isPublished ? "प्रकाशित" : "ड्राफ्ट"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`h-24 bg-gradient-to-r ${
                        CATEGORY_COLORS[prog.category] || CATEGORY_COLORS.other
                      } flex items-center justify-between px-4`}
                    >
                      <span className="text-3xl opacity-80">
                        {CATEGORY_ICONS[prog.category] || "📌"}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full font-medium">
                          {categoryLabel(prog.category)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            prog.isPublished
                              ? "bg-green-500/80 text-white"
                              : "bg-yellow-500/80 text-white"
                          }`}
                        >
                          {prog.isPublished ? "प्रकाशित" : "ड्राफ्ट"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 dark:text-white/90 text-base mb-1.5 line-clamp-2">
                      {prog.title}
                    </h3>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 mb-3">
                      {prog.date && (
                        <span className="flex items-center gap-1">
                          📅 {formatDate(prog.date)}
                        </span>
                      )}
                      {prog.location && (
                        <span className="flex items-center gap-1">
                          📍 {prog.location}
                        </span>
                      )}
                      {prog.images?.length > 0 && (
                        <span className="flex items-center gap-1">
                          🖼️ {prog.images.length} फोटो
                        </span>
                      )}
                    </div>

                    <p
                      className={`text-sm text-gray-500 dark:text-gray-400 ${
                        isExpanded ? "" : "line-clamp-2"
                      } mb-3`}
                    >
                      {prog.description}
                    </p>

                    {prog.description?.length > 100 && (
                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : prog.id)
                        }
                        className="text-xs text-blue-500 hover:text-blue-600 mb-3"
                      >
                        {isExpanded ? "कमी दाखवा ↑" : "अधिक वाचा ↓"}
                      </button>
                    )}

                    {prog.highlights?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {prog.highlights.slice(0, 3).map((h, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                          >
                            {h}
                          </span>
                        ))}
                        {prog.highlights.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{prog.highlights.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {prog.result && (
                      <div className="rounded-lg bg-green-50 p-2 mb-3 dark:bg-green-500/10">
                        <p className="text-xs text-green-700 dark:text-green-400">
                          📊 <strong>निकाल:</strong> {prog.result}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-xs text-gray-400">
                        {formatDate(prog.createdAt)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(prog)}
                          className="rounded-lg p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                          title="संपादन"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prog.id)}
                          className="rounded-lg p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="हटवा"
                        >
                          <TrashBinIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 transition-colors"
              >
                ← मागील
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        page === p
                          ? "bg-blue-500 text-white shadow-sm"
                          : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                {totalPages > 5 && (
                  <span className="px-2 text-gray-400">...</span>
                )}
              </div>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 transition-colors"
              >
                पुढील →
              </button>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-2xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg">
              {editingId ? "✏️" : "➕"}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
                {editingId ? "कार्यक्रम संपादन" : "नवीन कार्यक्रम"}
              </h3>
              <p className="text-xs text-gray-400">सर्व आवश्यक माहिती भरा</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/15 dark:text-red-400">
              <span>⚠️</span> {error}
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
                placeholder="कार्यक्रमाचे शीर्षक प्रविष्ट करा"
              />
            </div>
            <div>
              <Label htmlFor="description">वर्णन *</Label>
              <TextArea
                value={form.description}
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, description: val }))
                }
                rows={4}
                placeholder="कार्यक्रमाचे सविस्तर वर्णन लिहा..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <Label htmlFor="location">ठिकाण</Label>
                <Input
                  type="text"
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleInputChange}
                  placeholder="📍 कार्यक्रमाचे ठिकाण"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">तारीख</Label>
                <Input
                  type="date"
                  id="date"
                  name="date"
                  value={form.date}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="result">निकाल / परिणाम</Label>
                <Input
                  type="text"
                  id="result"
                  name="result"
                  value={form.result}
                  onChange={handleInputChange}
                  placeholder="कार्यक्रमाचा निकाल"
                />
              </div>
            </div>
            <div>
              <ImageUpload
                label="कार्यक्रम प्रतिमा"
                section="programs"
                maxFiles={5}
                value={form.images}
                onChange={(urls) =>
                  setForm((prev) => ({ ...prev, images: urls }))
                }
                uploadFn={villageAdminService.uploadImages}
                deleteFn={villageAdminService.deleteUploadedImage}
                hint="कमाल ५ प्रतिमा • 800×600 आकार शिफारसित"
              />
            </div>
            <div>
              <Label htmlFor="highlights">ठळक मुद्दे (comma separated)</Label>
              <Input
                type="text"
                id="highlights"
                name="highlights"
                value={form.highlights}
                onChange={handleInputChange}
                placeholder="मुद्दा १, मुद्दा २, मुद्दा ३"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                checked={form.isPublished}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <Label htmlFor="isPublished">प्रकाशित (Published)</Label>
            </div>
            <div className="flex gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <Button
                size="sm"
                variant="outline"
                onClick={closeModal}
                type="button"
              >
                रद्द करा
              </Button>
              <Button size="sm" disabled={saving}>
                {saving
                  ? "सेव्ह करत आहे..."
                  : editingId
                  ? "अपडेट करा"
                  : "कार्यक्रम जोडा"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
