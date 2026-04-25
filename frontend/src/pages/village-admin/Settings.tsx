import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import { villageAdminService } from "../../services/villageAdminService";

interface VillageSettings {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  settings: {
    upiId?: string;
    contactPhone?: string;
    contactEmail?: string;
    bannerTitle?: string;
    bannerSubtitle?: string;
    welcomeMessage?: string;
    themeColor?: string;
    [key: string]: string | undefined;
  };
}

export default function VillageSettings() {
  const [village, setVillage] = useState<VillageSettings | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    villageAdminService
      .getSettings()
      .then((res) => {
        setVillage(res.data);
        setForm(res.data.settings || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await villageAdminService.updateSettings(form);
      setVillage(res.data);
      setSaved(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "सेटिंग्ज सेव्ह करता आल्या नाहीत");
    } finally {
      setSaving(false);
    }
  };

  const settingsFields = [
    { key: "bannerTitle", label: "बॅनर शीर्षक", type: "text" as const, placeholder: "आमच्या गावात स्वागत" },
    { key: "bannerSubtitle", label: "बॅनर उपशीर्षक", type: "text" as const, placeholder: "ग्रामपंचायत" },
    { key: "welcomeMessage", label: "स्वागत संदेश", type: "textarea" as const, placeholder: "मुख्यपृष्ठावर दर्शविला जाणारा संदेश" },
    { key: "themeColor", label: "थीम रंग", type: "text" as const, placeholder: "#3b82f6" },
  ];

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-gray-400">लोड होत आहे...</p>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="सेटिंग्ज | गाव प्रशासन" description="गाव सेटिंग्ज" />
      <div className="mb-6">
        <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
          गाव सेटिंग्ज
        </h2>
        {village && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {village.name} (slug: {village.slug})
          </p>
        )}
      </div>

      {/* Village Info Card */}
      {village && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white/90">
            गावाची माहिती
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">नाव</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{village.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">सबडोमेन</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {village.subdomain}.gpmh.local
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">स्लग</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{village.slug}</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:p-8">
        {error && (
          <div className="mb-6 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
            {error}
          </div>
        )}
        {saved && (
          <div className="mb-6 rounded-lg bg-success-50 p-3 text-sm text-success-600 dark:bg-success-500/15 dark:text-success-500">
            सेटिंग्ज यशस्वीरीत्या सेव्ह झाल्या!
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          {settingsFields.map((field) => (
            <div key={field.key}>
              <Label htmlFor={field.key}>{field.label}</Label>
              {field.type === "textarea" ? (
                <TextArea
                  value={form[field.key] || ""}
                  onChange={(val) => {
                    setForm((prev) => ({ ...prev, [field.key]: val }));
                    setSaved(false);
                  }}
                  rows={3}
                  placeholder={field.placeholder}
                />
              ) : (
                <Input
                  type="text"
                  id={field.key}
                  name={field.key}
                  value={form[field.key] || ""}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}
          <div className="pt-2">
            <Button size="sm" disabled={saving}>
                {saving ? "सेव्ह करत आहे..." : "सेटिंग्ज सेव्ह करा"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
