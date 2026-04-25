import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import { villageAdminService } from "../../services/villageAdminService";

/* ─── Types ─── */

interface StatItem {
  key: string;
  icon: string;
  label: string;
  value: string;
}

interface HeroData {
  badge: string;
  title: string;
  description: string;
  heroStatKeys: string[];
}

const EMPTY: HeroData = {
  badge: "",
  title: "",
  description: "",
  heroStatKeys: [],
};

const MAX_HERO_STATS = 2;

/* ─── Component ─── */

export default function HeroContentManager() {
  const [form, setForm] = useState<HeroData>(EMPTY);
  const [availableStats, setAvailableStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      villageAdminService.getContent("hero"),
      villageAdminService.getContent("village_stats"),
    ])
      .then(([heroRes, statsRes]) => {
        const h = (heroRes.data?.content || {}) as Record<string, unknown>;
        setForm({
          badge: (h.badge as string) || "",
          title: (h.title as string) || "",
          description: (h.description as string) || "",
          heroStatKeys: (h.heroStatKeys as string[]) || [],
        });

        // Parse village stats
        const sc = (statsRes.data?.content || {}) as Record<string, unknown>;
        const statsArr = (sc.stats as StatItem[]) || [];
        if (statsArr.length > 0) {
          setAvailableStats(statsArr.filter((s) => s.value));
        }
      })
      .catch(() => {
        setForm(EMPTY);
        setAvailableStats([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setSaved(false);
  };

  const toggleStatKey = (key: string) => {
    setForm((prev) => {
      const current = prev.heroStatKeys;
      if (current.includes(key)) {
        return { ...prev, heroStatKeys: current.filter((k) => k !== key) };
      }
      if (current.length >= MAX_HERO_STATS) return prev;
      return { ...prev, heroStatKeys: [...current, key] };
    });
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await villageAdminService.upsertContent(
        "hero",
        form as unknown as Record<string, unknown>
      );
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
        title="हिरो माहिती | गाव प्रशासन"
        description="मुखपृष्ठावरील हिरो विभागाची माहिती व्यवस्थापित करा."
      />
      <div className="mb-6">
        <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
          हिरो विभाग माहिती
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          मुखपृष्ठावरील हिरो बॅनरवर दर्शविली जाणारी माहिती. बॅज, शीर्षक,
          ओळख परिच्छेद आणि आकडेवारी निवडा.
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
            {/* Badge */}
            <div>
              <Label htmlFor="badge">बॅज</Label>
              <Input
                type="text"
                id="badge"
                name="badge"
                value={form.badge}
                onChange={handleChange}
                placeholder="उदा. 🏛️ अधिकृत वेबसाइट"
              />
              <p className="mt-1 text-xs text-gray-400">
                हिरो बॅनरवर शीर्षकाच्या वर दिसणारा लहान मजकूर (पर्यायी)
              </p>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title">शीर्षक</Label>
              <Input
                type="text"
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="उदा. ग्रामपंचायत अमुक गाव"
              />
              <p className="mt-1 text-xs text-gray-400">
                रिक्त ठेवल्यास "ग्रामपंचायत [गावाचे नाव]" आपोआप दिसेल
              </p>
            </div>

            {/* Description / Intro Paragraph */}
            <div>
              <Label>ओळख परिच्छेद (Intro)</Label>
              <TextArea
                value={form.description}
                onChange={(v) => {
                  setForm((p) => ({ ...p, description: v }));
                  setSaved(false);
                }}
                rows={3}
                placeholder="गावाबद्दल ओळख 2-3 वाक्यांमध्ये लिहा..."
              />
              <p className="mt-1 text-xs text-gray-400">
                हिरो बॅनरवर शीर्षकाखाली हा मजकूर दर्शविला जाईल
              </p>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Hero Stats Selection */}
            <div>
              <Label>
                हिरो बॅनरवर दर्शवायची आकडेवारी (कमाल {MAX_HERO_STATS})
              </Label>
              <p className="mb-3 text-xs text-gray-400">
                गाव आकडेवारी मधून कमाल {MAX_HERO_STATS} आयटम निवडा. हे हिरो
                बॅनरवर दर्शविले जातील.{" "}
                {availableStats.length === 0 && (
                  <span className="text-orange-500">
                    प्रथम "गाव आकडेवारी" पेजवर डेटा भरा.
                  </span>
                )}
              </p>

              {availableStats.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableStats.map((stat) => {
                    const isSelected = form.heroStatKeys.includes(stat.key);
                    const isDisabled =
                      !isSelected &&
                      form.heroStatKeys.length >= MAX_HERO_STATS;
                    return (
                      <button
                        key={stat.key}
                        type="button"
                        onClick={() => toggleStatKey(stat.key)}
                        disabled={isDisabled}
                        className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${
                          isSelected
                            ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10 ring-1 ring-brand-500/30"
                            : isDisabled
                            ? "border-gray-200 dark:border-gray-700 opacity-40 cursor-not-allowed"
                            : "border-gray-200 dark:border-gray-700 hover:border-brand-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        }`}
                      >
                        <span className="text-2xl flex-shrink-0">
                          {stat.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-gray-800 dark:text-white/90 truncate">
                            {stat.value}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {stat.label}
                          </p>
                        </div>
                        {isSelected && (
                          <span className="ml-auto text-brand-500 text-lg flex-shrink-0">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-6 text-center text-gray-400">
                  <span className="text-3xl block mb-2">📊</span>
                  गाव आकडेवारी उपलब्ध नाही. कृपया प्रथम "गाव आकडेवारी"
                  विभागात डेटा जोडा.
                </div>
              )}
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
