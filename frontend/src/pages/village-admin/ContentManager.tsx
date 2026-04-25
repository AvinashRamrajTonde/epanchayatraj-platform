import { useEffect, useState } from "react";
import { useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import { villageAdminService } from "../../services/villageAdminService";
import AboutManager from "./AboutManager";
import VillageStatsManager from "./VillageStatsManager";
import ContactManager from "./ContactManager";
import HeroContentManager from "./HeroContentManager";

interface ContentData {
  [key: string]: string;
}

const SECTION_CONFIG: Record<
  string,
  { title: string; description: string; fields: { key: string; label: string; type: "text" | "textarea" }[] }
> = {
  vision_mission: {
    title: "दृष्टी व ध्येय",
    description: "'आमच्याबद्दल' पेजवरील दृष्टी (Vision) आणि ध्येय (Mission) माहिती.",
    fields: [
      { key: "vision", label: "दृष्टी (Vision)", type: "textarea" },
      { key: "mission", label: "ध्येय (Mission)", type: "textarea" },
    ],
  },

  services: {
    title: "सेवा माहिती",
    description: "नागरिक सेवा पेजची माहिती. JSON array format: [{\"name\":\"...\",\"description\":\"...\",\"icon\":\"...\",\"link\":\"...\"}]",
    fields: [
      { key: "services", label: "सेवा (JSON Array)", type: "textarea" },
    ],
  },
  important: {
    title: "महत्त्वाची माहिती",
    description: "महत्त्वाची माहिती पेजचा डेटा. आपत्कालीन क्रमांक आणि उपयुक्त दुवे सुपरअडमिन पॅनलमधून व्यवस्थापित केले जातात (सर्व गावांसाठी समान).",
    fields: [
      { key: "farmingInfo", label: "शेती व कृषी माहिती", type: "textarea" },
      { key: "additionalInfo", label: "अतिरिक्त माहिती", type: "textarea" },
    ],
  },
  seo: {
    title: "SEO सेटिंग्ज",
    description: "सर्च इंजिन ऑप्टिमायझेशन (SEO) सेटिंग्ज. Google वर रँकिंगसाठी महत्त्वाचे.",
    fields: [
      { key: "title", label: "SEO Title (शीर्षक)", type: "text" },
      { key: "description", label: "Meta Description", type: "textarea" },
      { key: "keywords", label: "Keywords (comma separated)", type: "text" },
      { key: "ogImage", label: "Open Graph Image URL", type: "text" },
      { key: "canonicalUrl", label: "Canonical URL", type: "text" },
      { key: "geoLatitude", label: "Geo Latitude", type: "text" },
      { key: "geoLongitude", label: "Geo Longitude", type: "text" },
    ],
  },
};

export default function ContentManager() {
  const { section = "about" } = useParams<{ section: string }>();

  // Delegate to specialized managers for complex sections
  if (section === "about") return <AboutManager />;
  if (section === "village_stats") return <VillageStatsManager />;
  if (section === "contact") return <ContactManager />;
  if (section === "hero") return <HeroContentManager />;

  return <GenericContentManager section={section} />;
}

/* ─── Generic content manager for simple text/textarea sections ─── */

function GenericContentManager({ section }: { section: string }) {
  const config = SECTION_CONFIG[section];
  const [form, setForm] = useState<ContentData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setSaved(false);
    setError("");
    villageAdminService
      .getContent(section)
      .then((res) => {
        if (res.data?.content) {
          setForm(res.data.content as ContentData);
        } else {
          setForm({});
        }
      })
      .catch(() => {
        setForm({});
      })
      .finally(() => setLoading(false));
  }, [section]);

  if (!config) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-gray-400">अज्ञात माहिती विभाग.</p>
      </div>
    );
  }

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
      await villageAdminService.upsertContent(section, form);
      setSaved(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "माहिती सेव्ह करता आली नाही");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta
        title={`${config.title} | गाव प्रशासन`}
        description={`${config.title} व्यवस्थापित करा`}
      />
      <div className="mb-6">
        <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
          {config.title}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {config.description}
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
          <form onSubmit={handleSubmit} className="space-y-5">
            {config.fields.map((field) => (
              <div key={field.key}>
                <Label htmlFor={field.key}>{field.label}</Label>
                {field.type === "textarea" ? (
                  <TextArea
                    value={form[field.key] || ""}
                    onChange={(val) => {
                      setForm((prev) => ({ ...prev, [field.key]: val }));
                      setSaved(false);
                    }}
                    rows={4}
                    placeholder={`${field.label} प्रविष्ट करा`}
                  />
                ) : (
                  <Input
                    type="text"
                    id={field.key}
                    name={field.key}
                    value={form[field.key] || ""}
                    onChange={handleChange}
                    placeholder={`${field.label} प्रविष्ट करा`}
                  />
                )}
              </div>
            ))}
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
