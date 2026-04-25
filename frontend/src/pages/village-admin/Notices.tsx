import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import ImageUpload from "../../components/form/ImageUpload";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../icons";
import {
  villageAdminService,
  type Notice,
} from "../../services/villageAdminService";
import { resolveUrl } from "../../utils/resolveUrl";

const CATEGORIES = [
  { value: "general", label: "सामान्य" },
  { value: "urgent", label: "तातडीचे" },
  { value: "event", label: "कार्यक्रम" },
  { value: "meeting", label: "सभा" },
  { value: "scheme", label: "योजना" },
];

const CATEGORY_ICONS: Record<string, string> = {
  general: "📢",
  urgent: "🚨",
  event: "🎉",
  meeting: "🏛️",
  scheme: "📋",
};

const CATEGORY_COLORS: Record<string, string> = {
  general: "from-blue-500 to-blue-600",
  urgent: "from-red-500 to-red-600",
  event: "from-emerald-500 to-emerald-600",
  meeting: "from-amber-500 to-amber-600",
  scheme: "from-purple-500 to-purple-600",
};

const CATEGORY_BG: Record<string, string> = {
  general: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  urgent: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  event: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  meeting: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  scheme: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
};

export default function Notices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeFilter, setActiveFilter] = useState("all");
  const { isOpen, openModal, closeModal } = useModal();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const emptyForm = {
    title: "",
    content: "",
    category: "general",
    imageUrl: "",
    isPublished: true,
    expiresAt: "",
  };
  const [form, setForm] = useState(emptyForm);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await villageAdminService.getNotices({ page, limit: 10 });
      const data = res.data || res;
      const list = data.notices || data;
      setNotices(Array.isArray(list) ? list : []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch {
      console.error("Failed to load notices");
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [page]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, isPublished: e.target.checked }));
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    openModal();
  };

  const handleEdit = (notice: Notice) => {
    setEditingId(notice.id);
    setForm({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      imageUrl: notice.imageUrl || "",
      isPublished: notice.isPublished,
      expiresAt: notice.expiresAt ? notice.expiresAt.split("T")[0] : "",
    });
    setError("");
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ही सूचना हटवायची आहे का?")) return;
    try {
      await villageAdminService.deleteNotice(id);
      fetchNotices();
    } catch {
      alert("सूचना हटवता आली नाही");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError("शीर्षक आणि मजकूर आवश्यक आहे");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title,
        content: form.content,
        category: form.category,
        imageUrl: form.imageUrl || null,
        isPublished: form.isPublished,
        expiresAt: form.expiresAt || null,
      };
      if (editingId) {
        await villageAdminService.updateNotice(editingId, payload);
      } else {
        await villageAdminService.createNotice(payload);
      }
      closeModal();
      fetchNotices();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "सूचना सेव्ह करता आली नाही");
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

  const categoryLabel = (key: string) =>
    CATEGORIES.find((c) => c.value === key)?.label || key;

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const filteredNotices =
    activeFilter === "all"
      ? notices
      : notices.filter((n) => n.category === activeFilter);

  return (
    <>
      <PageMeta title="सूचना | गाव प्रशासन" />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            📢 सूचना व घोषणा
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            एकूण {total} सूचना • ग्रामपंचायत सूचना, घोषणा आणि जाहिराती
          </p>
        </div>
        <Button size="sm" onClick={handleAdd}>
          <PlusIcon className="w-4 h-4 mr-1.5" /> नवीन सूचना
        </Button>
      </div>

      {/* Category Filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter("all")}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
            activeFilter === "all"
              ? "bg-gray-800 text-white dark:bg-white dark:text-gray-900"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          सर्व
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveFilter(cat.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeFilter === cat.value
                ? "bg-gray-800 text-white dark:bg-white dark:text-gray-900"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {CATEGORY_ICONS[cat.value]} {cat.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="text-sm text-gray-400">सूचना लोड होत आहेत...</p>
          </div>
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center dark:border-gray-700 dark:bg-gray-900/30">
          <span className="text-5xl block mb-4">📢</span>
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
            कोणतीही सूचना नाही
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            पहिली सूचना जोडून सुरूवात करा
          </p>
          <Button size="sm" onClick={handleAdd}>
            <PlusIcon className="w-4 h-4 mr-1.5" /> सूचना जोडा
          </Button>
        </div>
      ) : (
        <>
          {/* Notice Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredNotices.map((notice) => {
              const expired = isExpired(notice.expiresAt);
              const expanded = expandedId === notice.id;
              return (
                <div
                  key={notice.id}
                  className={`group relative rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 dark:bg-white/[0.03] overflow-hidden ${
                    expired
                      ? "border-red-200 dark:border-red-800/50 opacity-75"
                      : notice.category === "urgent"
                      ? "border-red-200 dark:border-red-800/50"
                      : "border-gray-200 dark:border-gray-800"
                  }`}
                >
                  {/* Colored top bar */}
                  <div
                    className={`h-1.5 bg-gradient-to-r ${
                      CATEGORY_COLORS[notice.category] || CATEGORY_COLORS.general
                    }`}
                  />

                  {/* Urgent pulse indicator */}
                  {notice.category === "urgent" && !expired && (
                    <div className="absolute top-4 right-4">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                      </span>
                    </div>
                  )}

                  {/* Image */}
                  {notice.imageUrl && (
                    <div className="relative h-36 overflow-hidden">
                      <img
                        src={resolveUrl(notice.imageUrl)}
                        alt={notice.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            CATEGORY_BG[notice.category] || CATEGORY_BG.general
                          }`}
                        >
                          {CATEGORY_ICONS[notice.category] || "📢"}{" "}
                          {categoryLabel(notice.category)}
                        </span>
                        {!notice.isPublished && (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                            मसुदा
                          </span>
                        )}
                        {expired && (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600 dark:bg-red-500/15 dark:text-red-400">
                            मुदत संपली
                          </span>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          notice.isPublished
                            ? "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
                            : "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            notice.isPublished ? "bg-green-500" : "bg-yellow-500"
                          }`}
                        />
                        {notice.isPublished ? "प्रकाशित" : "ड्राफ्ट"}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-800 dark:text-white/90 text-base mb-2 line-clamp-2">
                      {notice.title}
                    </h3>

                    <p
                      className={`text-sm text-gray-500 dark:text-gray-400 ${
                        expanded ? "" : "line-clamp-3"
                      } mb-3`}
                    >
                      {notice.content}
                    </p>

                    {notice.content?.length > 120 && (
                      <button
                        onClick={() =>
                          setExpandedId(expanded ? null : notice.id)
                        }
                        className="text-xs text-blue-500 hover:text-blue-600 mb-3"
                      >
                        {expanded ? "कमी दाखवा ↑" : "अधिक वाचा ↓"}
                      </button>
                    )}

                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        📅 {formatDate(notice.createdAt)}
                      </span>
                      {notice.expiresAt && (
                        <span
                          className={`flex items-center gap-1 ${
                            expired ? "text-red-400" : ""
                          }`}
                        >
                          ⏰ मुदत: {formatDate(notice.expiresAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-end pt-3 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(notice)}
                          className="rounded-lg p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                          title="संपादन"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(notice.id)}
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
              {editingId ? "✏️" : "📢"}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
                {editingId ? "सूचना संपादन" : "नवीन सूचना"}
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
                onChange={handleChange}
                placeholder="सूचनेचे शीर्षक प्रविष्ट करा"
              />
            </div>
            <div>
              <Label htmlFor="content">मजकूर *</Label>
              <TextArea
                value={form.content}
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, content: val }))
                }
                rows={4}
                placeholder="सूचनेचा सविस्तर मजकूर लिहा..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">वर्ग</Label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {CATEGORY_ICONS[cat.value]} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="expiresAt">मुदत संपण्याची तारीख</Label>
                <Input
                  type="date"
                  id="expiresAt"
                  name="expiresAt"
                  value={form.expiresAt}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={form.isPublished}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <Label htmlFor="isPublished">लगेच प्रकाशित करा</Label>
            </div>
            <div>
              <ImageUpload
                label="सूचना प्रतिमा"
                section="notices"
                maxFiles={1}
                value={form.imageUrl}
                onChange={(urls) =>
                  setForm((prev) => ({ ...prev, imageUrl: urls[0] || "" }))
                }
                uploadFn={villageAdminService.uploadImages}
                deleteFn={villageAdminService.deleteUploadedImage}
                hint="ऐच्छिक • 800×600 आकार शिफारसित"
              />
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
                  : "सूचना तयार करा"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
