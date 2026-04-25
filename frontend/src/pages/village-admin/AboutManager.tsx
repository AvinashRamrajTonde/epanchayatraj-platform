import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import ImageUpload from "../../components/form/ImageUpload";
import RichTextEditor from "../../components/form/RichTextEditor";
import { villageAdminService } from "../../services/villageAdminService";

interface AboutData {
  title: string;
  description1: string;
  images: string[];
  population: string;
  area: string;
  pincode: string;
  established: string;
  history: string;
  nearestRailwayStation: string;
  nearestAirport: string;
  nearestCity: string;
}

const EMPTY: AboutData = {
  title: "",
  description1: "",
  images: [],
  population: "",
  area: "",
  pincode: "",
  established: "",
  history: "",
  nearestRailwayStation: "",
  nearestAirport: "",
  nearestCity: "",
};

export default function AboutManager() {
  const [form, setForm] = useState<AboutData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    villageAdminService
      .getContent("about")
      .then((res) => {
        const c = (res.data?.content || {}) as Record<string, unknown>;
        // Backward compat: map old keys to new
        const existingImages = (c.images as string[]) || [];
        const singleImage = (c.imageUrl as string) || (c.image as string) || "";
        const images =
          existingImages.length > 0
            ? existingImages
            : singleImage
            ? [singleImage]
            : [];

        setForm({
          title: (c.title as string) || (c.heading as string) || "",
          description1:
            (c.description1 as string) || (c.description as string) || "",
          images,
          population: (c.population as string) || "",
          area: (c.area as string) || "",
          pincode: (c.pincode as string) || "",
          established: (c.established as string) || "",
          history: (c.history as string) || "",
          nearestRailwayStation: (c.nearestRailwayStation as string) || "",
          nearestAirport: (c.nearestAirport as string) || "",
          nearestCity: (c.nearestCity as string) || "",
        });
      })
      .catch(() => setForm(EMPTY))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setSaved(false);
  };

  const handleTextArea = (key: keyof AboutData, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await villageAdminService.upsertContent("about", form as unknown as Record<string, unknown>);
      setSaved(true);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setError(ax.response?.data?.message || "माहिती सेव्ह करता आली नाही");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta
        title="गावाबद्दल माहिती | गाव प्रशासन"
        description="गाव वेबसाइटच्या 'आमच्याबद्दल' विभागात दर्शविली जाणारी माहिती व्यवस्थापित करा."
      />
      <div className="mb-6">
        <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
          गावाबद्दल माहिती
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          गाव वेबसाइटच्या 'आमच्याबद्दल' विभागात दर्शविली जाणारी माहिती
          व्यवस्थापित करा.
        </p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-gray-400">लोड होत आहे...</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:p-8">
          {error && (
            <div className="mb-6 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
              {error}
            </div>
          )}
          {saved && (
            <div className="mb-6 rounded-lg bg-success-50 p-3 text-sm text-success-600 dark:bg-success-500/15 dark:text-success-500">
              माहिती यशस्वीरीत्या सेव्ह झाली!
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">शीर्षक</Label>
              <Input
                type="text"
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="गावाबद्दल शीर्षक (उदा. आमच्या गावाबद्दल)"
              />
            </div>

            {/* Description 1 - Rich Text Editor */}
            <div>
              <Label>वर्णन</Label>
              <RichTextEditor
                value={form.description1}
                onChange={(v) => {
                  setForm((p) => ({ ...p, description1: v }));
                  setSaved(false);
                }}
                placeholder="गावाबद्दल वर्णन लिहा..."
                height={200}
              />
            </div>

            {/* Image Upload - 4 images (compact) */}
            <div>
              <ImageUpload
                label="गावाचे फोटो (कमाल ४)"
                section="about"
                maxFiles={4}
                value={form.images}
                onChange={(urls) => {
                  setForm((p) => ({ ...p, images: urls }));
                  setSaved(false);
                }}
                uploadFn={villageAdminService.uploadImages}
                deleteFn={villageAdminService.deleteUploadedImage}
                hint="वेबसाइटवर 'आमच्याबद्दल' विभागात फोटो कोलाज दिसतो. ४ फोटो अपलोड केल्यास सर्वोत्तम दिसतो."
                compact
              />
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              अतिरिक्त माहिती
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="population">लोकसंख्या</Label>
                <Input
                  type="text"
                  id="population"
                  name="population"
                  value={form.population}
                  onChange={handleChange}
                  placeholder="उदा. 5000"
                />
              </div>
              <div>
                <Label htmlFor="area">क्षेत्रफळ (चौ. किमी)</Label>
                <Input
                  type="text"
                  id="area"
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  placeholder="उदा. 15.5"
                />
              </div>
              <div>
                <Label htmlFor="pincode">पिनकोड</Label>
                <Input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="उदा. 413001"
                />
              </div>
              <div>
                <Label htmlFor="established">स्थापना वर्ष</Label>
                <Input
                  type="text"
                  id="established"
                  name="established"
                  value={form.established}
                  onChange={handleChange}
                  placeholder="उदा. 1960"
                />
              </div>
              <div>
                <Label htmlFor="nearestCity">जवळचे शहर</Label>
                <Input
                  type="text"
                  id="nearestCity"
                  name="nearestCity"
                  value={form.nearestCity}
                  onChange={handleChange}
                  placeholder="उदा. पुणे"
                />
              </div>
              <div>
                <Label htmlFor="nearestRailwayStation">जवळचे रेल्वे स्टेशन</Label>
                <Input
                  type="text"
                  id="nearestRailwayStation"
                  name="nearestRailwayStation"
                  value={form.nearestRailwayStation}
                  onChange={handleChange}
                  placeholder="उदा. पुणे जंक्शन"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="nearestAirport">जवळचे विमानतळ</Label>
                <Input
                  type="text"
                  id="nearestAirport"
                  name="nearestAirport"
                  value={form.nearestAirport}
                  onChange={handleChange}
                  placeholder="उदा. पुणे विमानतळ (लोहगाव)"
                />
              </div>
            </div>

            <div>
              <Label>इतिहास</Label>
              <TextArea
                value={form.history}
                onChange={(v) => handleTextArea("history", v)}
                rows={4}
                placeholder="गावाचा इतिहास (पर्यायी)"
              />
            </div>

            <div className="pt-2">
              <Button size="sm" disabled={saving}>
                {saving ? "सेव्ह करत आहे..." : "बदल सेव्ह करा"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
