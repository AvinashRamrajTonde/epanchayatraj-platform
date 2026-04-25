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

interface Gramsabha {
  id: string;
  title: string;
  date: string;
  time: string | null;
  location: string | null;
  agenda: string | null;
  status: string;
  attendeesTotal: number | null;
  attendeesMale: number | null;
  attendeesFemale: number | null;
  minutes: string | null;
  decisions: string[] | null;
  imageUrl: string | null;
  pdfUrl: string | null;
  noticeId: string | null;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: "scheduled", label: "नियोजित" },
  { value: "completed", label: "पूर्ण" },
  { value: "cancelled", label: "रद्द" },
];

const STATUS_COLORS: Record<string, "warning" | "success" | "error"> = {
  scheduled: "warning",
  completed: "success",
  cancelled: "error",
};

export default function GramsabhaAdmin() {
  const [gramsabhas, setGramsabhas] = useState<Gramsabha[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const { isOpen, openModal, closeModal } = useModal();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showMinutesFor, setShowMinutesFor] = useState<Gramsabha | null>(null);

  const emptyForm = {
    title: "",
    date: "",
    time: "",
    location: "",
    agenda: "",
    status: "scheduled",
  };

  const emptyMinutesForm = {
    status: "completed",
    attendeesTotal: "",
    attendeesMale: "",
    attendeesFemale: "",
    minutes: "",
    decisions: [""],
    imageUrl: "",
    pdfUrl: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [minutesForm, setMinutesForm] = useState(emptyMinutesForm);

  const fetchGramsabhas = async () => {
    setLoading(true);
    try {
      const res = await villageAdminService.getGramsabhas({ page, limit: 10, status: statusFilter });
      setGramsabhas(res.data?.gramsabhas || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch {
      console.error("Failed to load gramsabhas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGramsabhas();
  }, [page, statusFilter]);

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

  const handleEdit = (g: Gramsabha) => {
    setEditingId(g.id);
    setForm({
      title: g.title,
      date: g.date ? g.date.split("T")[0] : "",
      time: g.time || "",
      location: g.location || "",
      agenda: g.agenda || "",
      status: g.status,
    });
    setError("");
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ही ग्रामसभा हटवायची आहे का?")) return;
    try {
      await villageAdminService.deleteGramsabha(id);
      fetchGramsabhas();
    } catch {
      alert("ग्रामसभा हटवता आली नाही");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date) {
      setError("शीर्षक आणि दिनांक आवश्यक आहे");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title,
        date: new Date(form.date).toISOString(),
        time: form.time || undefined,
        location: form.location || undefined,
        agenda: form.agenda || undefined,
        status: form.status,
      };
      if (editingId) {
        await villageAdminService.updateGramsabha(editingId, payload);
      } else {
        await villageAdminService.createGramsabha(payload);
      }
      closeModal();
      fetchGramsabhas();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "सेव्ह करता आले नाही");
    } finally {
      setSaving(false);
    }
  };

  const openMinutesModal = (g: Gramsabha) => {
    setShowMinutesFor(g);
    setMinutesForm({
      status: g.status === "completed" ? "completed" : "completed",
      attendeesTotal: g.attendeesTotal?.toString() || "",
      attendeesMale: g.attendeesMale?.toString() || "",
      attendeesFemale: g.attendeesFemale?.toString() || "",
      minutes: g.minutes || "",
      decisions: g.decisions && g.decisions.length > 0 ? g.decisions : [""],
      imageUrl: g.imageUrl || "",
      pdfUrl: g.pdfUrl || "",
    });
    setError("");
  };

  const handleMinutesSave = async () => {
    if (!showMinutesFor) return;
    setSaving(true);
    setError("");
    try {
      await villageAdminService.updateGramsabha(showMinutesFor.id, {
        status: minutesForm.status,
        attendeesTotal: minutesForm.attendeesTotal ? parseInt(minutesForm.attendeesTotal) : null,
        attendeesMale: minutesForm.attendeesMale ? parseInt(minutesForm.attendeesMale) : null,
        attendeesFemale: minutesForm.attendeesFemale ? parseInt(minutesForm.attendeesFemale) : null,
        minutes: minutesForm.minutes || undefined,
        decisions: minutesForm.decisions.filter((d) => d.trim()),
        imageUrl: minutesForm.imageUrl || undefined,
        pdfUrl: minutesForm.pdfUrl || undefined,
      });
      setShowMinutesFor(null);
      fetchGramsabhas();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "सेव्ह करता आले नाही");
    } finally {
      setSaving(false);
    }
  };

  const addDecision = () => {
    setMinutesForm((prev) => ({ ...prev, decisions: [...prev.decisions, ""] }));
  };

  const updateDecision = (idx: number, val: string) => {
    setMinutesForm((prev) => {
      const decisions = [...prev.decisions];
      decisions[idx] = val;
      return { ...prev, decisions };
    });
  };

  const removeDecision = (idx: number) => {
    setMinutesForm((prev) => ({
      ...prev,
      decisions: prev.decisions.filter((_, i) => i !== idx),
    }));
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await villageAdminService.uploadPdf("gramsabha", file);
      setMinutesForm((prev) => ({ ...prev, pdfUrl: url }));
    } catch {
      alert("PDF अपलोड करता आले नाही");
    }
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("mr-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const statusLabel = (s: string) =>
    STATUS_OPTIONS.find((o) => o.value === s)?.label || s;

  return (
    <>
      <PageMeta title="ग्रामसभा | गाव प्रशासन" />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
            ग्रामसभा व्यवस्थापन
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            ग्रामसभा बैठका नियोजन, कार्यवृत्त आणि निर्णय व्यवस्थापित करा.
          </p>
        </div>
        <Button size="sm" onClick={handleAdd}>
          <PlusIcon className="w-4 h-4 mr-1" /> नवीन ग्रामसभा
        </Button>
      </div>

      {/* Status Filter */}
      <div className="mb-4 flex gap-2">
        {[{ value: "", label: "सर्व" }, ...STATUS_OPTIONS].map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setStatusFilter(opt.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              statusFilter === opt.value
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-gray-400">लोड होत आहे...</p>
        </div>
      ) : gramsabhas.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-gray-400">कोणतीही ग्रामसभा बैठक जोडलेली नाही.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {gramsabhas.map((g) => (
              <div
                key={g.id}
                className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                        {g.title}
                      </h3>
                      <Badge color={STATUS_COLORS[g.status] || "primary"}>
                        {statusLabel(g.status)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>📅 {fmtDate(g.date)}</span>
                      {g.time && <span>🕐 {g.time}</span>}
                      {g.location && <span>📍 {g.location}</span>}
                    </div>
                    {g.agenda && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        <strong>कार्यसूची:</strong> {g.agenda}
                      </p>
                    )}
                    {g.status === "completed" && (
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                        {g.attendeesTotal != null && (
                          <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md dark:bg-green-900/20 dark:text-green-400">
                            उपस्थिती: {g.attendeesTotal}
                          </span>
                        )}
                        {g.decisions && g.decisions.length > 0 && (
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md dark:bg-blue-900/20 dark:text-blue-400">
                            ठराव: {g.decisions.length}
                          </span>
                        )}
                        {g.imageUrl && (
                          <a
                            href={resolveUrl(g.imageUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md hover:underline dark:bg-purple-900/20 dark:text-purple-400"
                          >
                            📷 फोटो
                          </a>
                        )}
                        {g.pdfUrl && (
                          <a
                            href={resolveUrl(g.pdfUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-red-50 text-red-700 px-2 py-1 rounded-md hover:underline dark:bg-red-900/20 dark:text-red-400"
                          >
                            📄 PDF
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {g.status === "scheduled" && (
                      <button
                        onClick={() => openMinutesModal(g)}
                        className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 font-medium dark:bg-green-900/20 dark:text-green-400"
                      >
                        पूर्ण करा
                      </button>
                    )}
                    {g.status === "completed" && (
                      <button
                        onClick={() => openMinutesModal(g)}
                        className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 font-medium dark:bg-blue-900/20 dark:text-blue-400"
                      >
                        कार्यवृत्त
                      </button>
                    )}
                    <button onClick={() => handleEdit(g)} className="text-blue-500 hover:text-blue-700 p-1" title="संपादन">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(g.id)} className="text-red-500 hover:text-red-700 p-1" title="हटवा">
                      <TrashBinIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                मागील
              </Button>
              <span className="px-3 py-2 text-sm text-gray-500">{page} / {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                पुढील
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-xl">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            {editingId ? "ग्रामसभा संपादन" : "नवीन ग्रामसभा नियोजन"}
          </h3>
          {error && (
            <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">बैठकीचे शीर्षक *</Label>
              <Input type="text" id="title" name="title" value={form.title} onChange={handleInputChange} placeholder="ग्रामसभा बैठक — प्रजासत्ताक दिन" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">दिनांक *</Label>
                <Input type="date" id="date" name="date" value={form.date} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="time">वेळ</Label>
                <Input type="text" id="time" name="time" value={form.time} onChange={handleInputChange} placeholder="सकाळी 10:00 वाजता" />
              </div>
            </div>
            <div>
              <Label htmlFor="location">स्थळ</Label>
              <Input type="text" id="location" name="location" value={form.location} onChange={handleInputChange} placeholder="समुदाय सभागृह" />
            </div>
            <div>
              <Label htmlFor="agenda">कार्यसूची</Label>
              <TextArea
                value={form.agenda}
                onChange={(val) => setForm((prev) => ({ ...prev, agenda: val }))}
                rows={3}
                placeholder="बैठकीची कार्यसूची लिहा..."
              />
            </div>
            {editingId && (
              <div>
                <Label htmlFor="status">स्थिती</Label>
                <Select
                  options={STATUS_OPTIONS}
                  defaultValue={form.status}
                  onChange={(val) => setForm((prev) => ({ ...prev, status: val }))}
                />
              </div>
            )}
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={closeModal} type="button">रद्द करा</Button>
              <Button type="submit" disabled={saving}>
                {saving ? "सेव्ह होत आहे..." : editingId ? "अपडेट करा" : "नियोजन करा"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Minutes/Complete Modal */}
      {showMinutesFor && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  कार्यवृत्त — {showMinutesFor.title}
                </h3>
                <button onClick={() => setShowMinutesFor(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
              </div>
              {error && (
                <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-600">{error}</div>
              )}
              <div className="space-y-4">
                <div>
                  <Label>स्थिती</Label>
                  <Select
                    options={STATUS_OPTIONS}
                    defaultValue={minutesForm.status}
                    onChange={(val) => setMinutesForm((prev) => ({ ...prev, status: val }))}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>एकूण उपस्थिती</Label>
                    <Input
                      type="number"
                      value={minutesForm.attendeesTotal}
                      onChange={(e) => setMinutesForm((prev) => ({ ...prev, attendeesTotal: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>पुरुष</Label>
                    <Input
                      type="number"
                      value={minutesForm.attendeesMale}
                      onChange={(e) => setMinutesForm((prev) => ({ ...prev, attendeesMale: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>महिला</Label>
                    <Input
                      type="number"
                      value={minutesForm.attendeesFemale}
                      onChange={(e) => setMinutesForm((prev) => ({ ...prev, attendeesFemale: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <Label>कार्यवृत्त (Minutes)</Label>
                  <TextArea
                    value={minutesForm.minutes}
                    onChange={(val) => setMinutesForm((prev) => ({ ...prev, minutes: val }))}
                    rows={4}
                    placeholder="बैठकीचे कार्यवृत्त लिहा..."
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>महत्वाचे निर्णय / ठराव</Label>
                    <button type="button" onClick={addDecision} className="text-xs text-brand-500 hover:text-brand-600 font-medium">+ निर्णय जोडा</button>
                  </div>
                  <div className="space-y-2">
                    {minutesForm.decisions.map((d, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          type="text"
                          value={d}
                          onChange={(e) => updateDecision(i, e.target.value)}
                          placeholder={`निर्णय ${i + 1}`}
                        />
                        {minutesForm.decisions.length > 1 && (
                          <button type="button" onClick={() => removeDecision(i)} className="text-red-500 hover:text-red-700 px-2">×</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <ImageUpload
                    label="ग्रामसभा फोटो"
                    section="gramsabha"
                    maxFiles={1}
                    value={minutesForm.imageUrl || undefined}
                    onChange={(urls: string[]) => setMinutesForm((prev) => ({ ...prev, imageUrl: urls[0] || "" }))}
                    uploadFn={villageAdminService.uploadImages}
                    deleteFn={villageAdminService.deleteUploadedImage}
                  />
                </div>
                <div>
                  <Label>कार्यवृत्त PDF</Label>
                  {minutesForm.pdfUrl ? (
                    <div className="flex items-center gap-3">
                      <a href={resolveUrl(minutesForm.pdfUrl)} target="_blank" rel="noreferrer" className="text-sm text-brand-500 hover:underline">
                        📄 PDF पहा
                      </a>
                      <button type="button" onClick={() => setMinutesForm((prev) => ({ ...prev, pdfUrl: "" }))} className="text-xs text-red-500">काढा</button>
                    </div>
                  ) : (
                    <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-500 hover:file:bg-brand-100" />
                  )}
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <Button variant="outline" onClick={() => setShowMinutesFor(null)}>रद्द करा</Button>
                  <Button onClick={handleMinutesSave} disabled={saving}>
                    {saving ? "सेव्ह होत आहे..." : "सेव्ह करा"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
