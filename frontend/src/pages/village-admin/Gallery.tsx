import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import ImageUpload from "../../components/form/ImageUpload";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { PlusIcon, TrashBinIcon } from "../../icons";
import {
  villageAdminService,
  type GalleryImage,
} from "../../services/villageAdminService";

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, openModal, closeModal } = useModal();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const emptyForm = {
    title: "",
    imageUrl: "",
    caption: "",
    category: "general",
    sortOrder: 0,
  };
  const [form, setForm] = useState(emptyForm);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await villageAdminService.getGalleryImages();
      setImages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const type = (e.target as HTMLInputElement).type;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const handleAdd = () => {
    setForm(emptyForm);
    setError("");
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("हा फोटो हटवायचा आहे का?")) return;
    try {
      await villageAdminService.deleteGalleryImage(id);
      fetchImages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await villageAdminService.createGalleryImage({
        title: form.title || undefined,
        imageUrl: form.imageUrl,
        caption: form.caption || undefined,
        category: form.category,
        sortOrder: form.sortOrder,
      });
      closeModal();
      fetchImages();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "फोटो जोडता आला नाही");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta title="गॅलरी | गाव प्रशासन" description="गाव गॅलरी व्यवस्थापन" />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
          फोटो गॅलरी
        </h2>
        <Button size="sm" onClick={handleAdd} startIcon={<PlusIcon className="size-4" />}>
          फोटो जोडा
        </Button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-gray-400">लोड होत आहे...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-gray-400">अद्याप फोटो नाहीत. पहिला फोटो जोडा.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={image.imageUrl}
                  alt={image.title || "Gallery image"}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='16'%3EImage not found%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
              <div className="p-3">
                {image.title && (
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">
                    {image.title}
                  </p>
                )}
                {image.caption && (
                  <p className="text-xs text-gray-500 truncate mt-1">{image.caption}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(image.id)}
                className="absolute top-2 right-2 rounded-lg bg-white/90 p-1.5 text-error-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-error-50 dark:bg-gray-900/90"
                title="हटवा"
              >
                <TrashBinIcon className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] p-6 lg:p-8">
        <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
          गॅलरी फोटो जोडा
        </h3>
        {error && (
          <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <ImageUpload
              label="फोटो *"
              section="gallery"
              maxFiles={1}
              value={form.imageUrl}
              onChange={(urls) =>
                setForm((prev) => ({ ...prev, imageUrl: urls[0] || "" }))
              }
              uploadFn={villageAdminService.uploadImages}
              deleteFn={villageAdminService.deleteUploadedImage}
              hint="1200×900 आकाराचा फोटो शिफारसीय"
            />
          </div>
          <div>
            <Label htmlFor="title">शीर्षक</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="फोटोचे शीर्षक"
            />
          </div>
          <div>
            <Label htmlFor="caption">वर्णन</Label>
            <Input
              type="text"
              id="caption"
              name="caption"
              value={form.caption}
              onChange={handleChange}
              placeholder="लहान वर्णन"
            />
          </div>
          <div>
            <Label htmlFor="category">प्रवर्ग</Label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              <option value="general">सामान्य</option>
              <option value="events">कार्यक्रम</option>
              <option value="infrastructure">पायाभूत सुविधा</option>
              <option value="heritage">वारसा</option>
              <option value="nature">निसर्ग</option>
              <option value="development">विकासकामे</option>
            </select>
          </div>
          <div>
            <Label htmlFor="sortOrder">क्रम</Label>
            <Input
              type="number"
              id="sortOrder"
              name="sortOrder"
              value={form.sortOrder}
              onChange={handleChange}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={closeModal}>
              रद्द करा
            </Button>
            <Button size="sm" disabled={saving || !form.imageUrl}>
              {saving ? "जोडत आहे..." : "फोटो जोडा"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
