import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import ImageUpload from "../../components/form/ImageUpload";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../icons";
import { villageAdminService } from "../../services/villageAdminService";

interface HeroSlide {
  id: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function HeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, openModal, closeModal } = useModal();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyForm = { imageUrl: "", altText: "", sortOrder: 0, isActive: true };
  const [form, setForm] = useState(emptyForm);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const res = await villageAdminService.getHeroSlides();
      setSlides(res.data);
    } catch {
      console.error("Failed to load hero slides");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    openModal();
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingId(slide.id);
    setForm({
      imageUrl: slide.imageUrl,
      altText: slide.altText || "",
      sortOrder: slide.sortOrder,
      isActive: slide.isActive,
    });
    setError("");
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ही स्लाइड हटवायची आहे का?")) return;
    try {
      await villageAdminService.deleteHeroSlide(id);
      fetchSlides();
    } catch {
      alert("स्लाइड हटवता आली नाही");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl.trim()) {
      setError("Image URL आवश्यक आहे");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await villageAdminService.updateHeroSlide(editingId, form);
      } else {
        await villageAdminService.createHeroSlide(form);
      }
      closeModal();
      fetchSlides();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "सेव्ह करता आले नाही");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta title="हिरो स्लाइड्स | गाव प्रशासन" />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
            हिरो स्लाइड्स
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            मुखपृष्ठावरील स्लाइडशो प्रतिमा व्यवस्थापित करा.
          </p>
        </div>
        <Button size="sm" onClick={handleAdd}>
          <PlusIcon className="w-4 h-4 mr-1" /> नवीन स्लाइड
        </Button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-gray-400">लोड होत आहे...</p>
        </div>
      ) : slides.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-gray-400">कोणतीही स्लाइड उपलब्ध नाही.</p>
          <Button size="sm" className="mt-3" onClick={handleAdd}>
            <PlusIcon className="w-4 h-4 mr-1" /> पहिली स्लाइड जोडा
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden"
            >
              <div className="aspect-video bg-gray-100 relative">
                <img
                  src={slide.imageUrl}
                  alt={slide.altText || "Slide"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "";
                    (e.target as HTMLImageElement).alt = "Image load error";
                  }}
                />
                {!slide.isActive && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                    निष्क्रिय
                  </span>
                )}
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    {slide.altText || "No alt text"}
                  </p>
                  <p className="text-xs text-gray-400">क्रम: {slide.sortOrder}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(slide)}
                    className="text-blue-500 hover:text-blue-700"
                    title="संपादन"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    className="text-red-500 hover:text-red-700"
                    title="हटवा"
                  >
                    <TrashBinIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-lg">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            {editingId ? "स्लाइड संपादन" : "नवीन स्लाइड"}
          </h3>
          {error && (
            <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <ImageUpload
                label="स्लाइड प्रतिमा *"
                section="hero"
                maxFiles={1}
                value={form.imageUrl}
                onChange={(urls) =>
                  setForm((prev) => ({ ...prev, imageUrl: urls[0] || "" }))
                }
                uploadFn={villageAdminService.uploadImages}
                deleteFn={villageAdminService.deleteUploadedImage}
                hint="1920×800 आकाराची प्रतिमा शिफारसीय"
              />
            </div>
            <div>
              <Label htmlFor="altText">Alt Text (वर्णन)</Label>
              <Input
                type="text"
                id="altText"
                name="altText"
                value={form.altText}
                onChange={handleChange}
                placeholder="प्रतिमा वर्णन"
              />
            </div>
            <div>
              <Label htmlFor="sortOrder">क्रम (Sort Order)</Label>
              <Input
                type="number"
                id="sortOrder"
                name="sortOrder"
                value={form.sortOrder.toString()}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
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
