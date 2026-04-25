import { useEffect, useState, useCallback, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import { villageAdminService } from "../../services/villageAdminService";
import { MAHARASHTRA_TEHSILS } from "../../utils/maharashtraTehsils";

/* ─── Maharashtra Districts (Marathi) ─── */

const MAHARASHTRA_DISTRICTS = [
  "अहमदनगर",
  "अकोला",
  "अमरावती",
  "छत्रपती संभाजीनगर",
  "बीड",
  "भंडारा",
  "बुलढाणा",
  "चंद्रपूर",
  "धाराशिव",
  "धुळे",
  "गडचिरोली",
  "गोंदिया",
  "हिंगोली",
  "जळगाव",
  "जालना",
  "कोल्हापूर",
  "लातूर",
  "मुंबई शहर",
  "मुंबई उपनगर",
  "नागपूर",
  "नांदेड",
  "नंदुरबार",
  "नाशिक",
  "पालघर",
  "परभणी",
  "पुणे",
  "रायगड",
  "रत्नागिरी",
  "सांगली",
  "सातारा",
  "सिंधुदुर्ग",
  "सोलापूर",
  "ठाणे",
  "वर्धा",
  "वाशिम",
  "यवतमाळ",
];

const STATES = [
  "महाराष्ट्र",
  "गोवा",
  "कर्नाटक",
  "गुजरात",
  "मध्य प्रदेश",
  "तेलंगणा",
  "छत्तीसगड",
  "आंध्र प्रदेश",
  "राजस्थान",
];

/* ─── Types ─── */

interface ContactData {
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  district: string;
  taluka: string;
  state: string;
  pincode: string;
  latitude: string;
  longitude: string;
  mapEmbedUrl: string;
  emergencyPhone: string;
  facebookUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
}

const EMPTY: ContactData = {
  address: "",
  phone: "",
  email: "",
  workingHours: "",
  district: "",
  taluka: "",
  state: "महाराष्ट्र",
  pincode: "",
  latitude: "",
  longitude: "",
  mapEmbedUrl: "",
  emergencyPhone: "",
  facebookUrl: "",
  twitterUrl: "",
  youtubeUrl: "",
  instagramUrl: "",
};

/* ─── Helper: Generate Google Maps embed URL from lat/lng ─── */

function generateMapEmbedUrl(lat: string, lng: string): string {
  if (!lat || !lng) return "";
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (isNaN(latNum) || isNaN(lngNum)) return "";
  return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3000!2d${lngNum}!3d${latNum}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1`;
}

/* ─── Component ─── */

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export default function ContactManager() {
  const [form, setForm] = useState<ContactData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  /* Map search state */
  const [mapQuery, setMapQuery] = useState("");
  const [mapResults, setMapResults] = useState<NominatimResult[]>([]);
  const [mapSearching, setMapSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    villageAdminService
      .getContent("contact")
      .then((res) => {
        const c = (res.data?.content || {}) as Record<string, unknown>;
        setForm({
          address: (c.address as string) || "",
          phone: (c.phone as string) || "",
          email: (c.email as string) || "",
          workingHours: (c.workingHours as string) || "",
          district: (c.district as string) || "",
          taluka: (c.taluka as string) || "",
          state: (c.state as string) || "महाराष्ट्र",
          pincode: (c.pincode as string) || "",
          latitude: (c.latitude as string) || "",
          longitude: (c.longitude as string) || "",
          mapEmbedUrl: (c.mapEmbedUrl as string) || "",
          emergencyPhone: (c.emergencyPhone as string) || "",
          facebookUrl: (c.facebookUrl as string) || "",
          twitterUrl: (c.twitterUrl as string) || "",
          youtubeUrl: (c.youtubeUrl as string) || "",
          instagramUrl: (c.instagramUrl as string) || "",
        });
      })
      .catch(() => setForm(EMPTY))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setSaved(false);
  };

  const handleLatLngChange = (field: "latitude" | "longitude", value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-generate embed URL from lat/lng
      const lat = field === "latitude" ? value : prev.latitude;
      const lng = field === "longitude" ? value : prev.longitude;
      next.mapEmbedUrl = generateMapEmbedUrl(lat, lng) || prev.mapEmbedUrl;
      return next;
    });
    setSaved(false);
  };

  /* ─── Map location search (Nominatim) ─── */

  const searchLocation = useCallback(async (query: string) => {
    if (query.trim().length < 3) {
      setMapResults([]);
      setShowResults(false);
      return;
    }
    setMapSearching(true);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&limit=6&countrycodes=in`
      );
      const data: NominatimResult[] = await resp.json();
      setMapResults(data);
      setShowResults(data.length > 0);
    } catch {
      setMapResults([]);
    } finally {
      setMapSearching(false);
    }
  }, []);

  const handleMapQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMapQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchLocation(value), 500);
  };

  const selectLocation = (result: NominatimResult) => {
    const lat = result.lat;
    const lng = result.lon;
    setForm((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      mapEmbedUrl: generateMapEmbedUrl(lat, lng),
    }));
    setMapQuery(result.display_name);
    setShowResults(false);
    setSaved(false);
  };

  /* Close results dropdown on outside click */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await villageAdminService.upsertContent(
        "contact",
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

  const selectClasses =
    "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

  return (
    <>
      <PageMeta
        title="संपर्क माहिती | गाव प्रशासन"
        description="गाव वेबसाइटवर दर्शविल्या जाणाऱ्या संपर्क तपशील व्यवस्थापित करा."
      />
      <div className="mb-6">
        <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
          संपर्क माहिती
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          गाव वेबसाइटवर दर्शविल्या जाणाऱ्या संपर्क तपशील व्यवस्थापित करा.
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
            {/* Address */}
            <div>
              <Label>कार्यालय पत्ता</Label>
              <TextArea
                value={form.address}
                onChange={(v) => {
                  setForm((p) => ({ ...p, address: v }));
                  setSaved(false);
                }}
                rows={3}
                placeholder="ग्रामपंचायत कार्यालय, गाव नाव..."
              />
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">फोन नंबर</Label>
                <Input
                  type="text"
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="उदा. 02112-123456"
                />
              </div>
              <div>
                <Label htmlFor="email">ईमेल</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="उदा. grampanchayat@gmail.com"
                />
              </div>
            </div>

            {/* Working Hours & Emergency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workingHours">कार्यालयीन वेळ</Label>
                <Input
                  type="text"
                  id="workingHours"
                  name="workingHours"
                  value={form.workingHours}
                  onChange={handleChange}
                  placeholder="सोमवार - शनिवार: सकाळी १० ते संध्या. ५"
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">आपत्कालीन संपर्क</Label>
                <Input
                  type="text"
                  id="emergencyPhone"
                  name="emergencyPhone"
                  value={form.emergencyPhone}
                  onChange={handleChange}
                  placeholder="उदा. 112"
                />
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              📍 स्थान माहिती
            </h3>

            {/* District & Taluka (Select dropdowns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="district">जिल्हा</Label>
                <select
                  id="district"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  className={selectClasses}
                >
                  <option value="">जिल्हा निवडा</option>
                  {MAHARASHTRA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="taluka">तालुका / तहसील</Label>
                {form.district && MAHARASHTRA_TEHSILS[form.district] ? (
                  <select
                    id="taluka"
                    name="taluka"
                    value={form.taluka}
                    onChange={handleChange}
                    className={selectClasses}
                  >
                    <option value="">तालुका निवडा</option>
                    {MAHARASHTRA_TEHSILS[form.district].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    type="text"
                    id="taluka"
                    name="taluka"
                    value={form.taluka}
                    onChange={handleChange}
                    placeholder="प्रथम जिल्हा निवडा किंवा तालुक्याचे नाव टाइप करा"
                  />
                )}
              </div>
            </div>

            {/* State & Pincode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">राज्य</Label>
                <select
                  id="state"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className={selectClasses}
                >
                  {STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
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
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              🗺️ नकाशा (Map) सेटिंग्ज
            </h3>

            {/* Location Search */}
            <div className="relative" ref={resultsRef}>
              <Label>📍 स्थान शोधा</Label>
              <div className="relative">
                <Input
                  type="text"
                  value={mapQuery}
                  onChange={handleMapQueryChange}
                  placeholder="गावाचे नाव टाइप करा (उदा. बारामती, पुणे)"
                />
                {mapSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                गावाचे नाव टाइप करा आणि खाली दिसणाऱ्या यादीतून निवडा.
              </p>

              {/* Search results dropdown */}
              {showResults && mapResults.length > 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 max-h-60 overflow-y-auto">
                  {mapResults.map((r) => (
                    <button
                      key={r.place_id}
                      type="button"
                      onClick={() => selectLocation(r)}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-brand-500/10 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                    >
                      <span className="mr-2">📍</span>
                      {r.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 hidden" >
              <div>
                <Label htmlFor="latitude">अक्षांश (Latitude)</Label>
                <Input
                  type="text"
                  id="latitude"
                  name="latitude"
                  value={form.latitude}
                  onChange={(e) =>
                    handleLatLngChange("latitude", e.target.value)
                  }
                  placeholder="उदा. 18.5204"
                />
              </div>
              <div>
                <Label htmlFor="longitude">रेखांश (Longitude)</Label>
                <Input
                  type="text"
                  id="longitude"
                  name="longitude"
                  value={form.longitude}
                  onChange={(e) =>
                    handleLatLngChange("longitude", e.target.value)
                  }
                  placeholder="उदा. 73.8567"
                />
              </div>
            </div>

            {/* Map Embed URL (auto-generated or manual) */}
            <div className="hidden">
              <Label htmlFor="mapEmbedUrl">
                Google Maps Embed URL{" "}
                <span className="text-gray-400 font-normal">
                  (स्वयं-उत्पन्न किंवा मॅन्युअल)
                </span>
              </Label>
              <Input
                type="text"
                id="mapEmbedUrl"
                name="mapEmbedUrl"
                value={form.mapEmbedUrl}
                onChange={handleChange}
                placeholder="https://www.google.com/maps/embed?..."
              />
              <p className="mt-1 text-xs text-gray-400">
                अक्षांश व रेखांश टाकल्यावर आपोआप भरले जाते. तुम्ही
                मॅन्युअल URL देखील देऊ शकता.
              </p>
            </div>

            {/* Map Preview */}
            {form.mapEmbedUrl && (
              <div>
                <Label>नकाशा पूर्वावलोकन</Label>
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  <iframe
                    src={form.mapEmbedUrl}
                    className="w-full h-[300px]"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Map Preview"
                  />
                </div>
              </div>
            )}

            {/* Quick open Google Maps to find location */}
            {form.latitude && form.longitude && (
              <a
                href={`https://www.google.com/maps?q=${form.latitude},${form.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-brand-500 hover:text-brand-600"
              >
                🗺️ Google Maps वर स्थान पहा →
              </a>
            )}

            <hr className="border-gray-200 dark:border-gray-700" />

            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              📱 सोशल मीडिया
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facebookUrl">Facebook URL</Label>
                <Input
                  type="text"
                  id="facebookUrl"
                  name="facebookUrl"
                  value={form.facebookUrl}
                  onChange={handleChange}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <Label htmlFor="instagramUrl">Instagram URL</Label>
                <Input
                  type="text"
                  id="instagramUrl"
                  name="instagramUrl"
                  value={form.instagramUrl}
                  onChange={handleChange}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <Label htmlFor="twitterUrl">Twitter / X URL</Label>
                <Input
                  type="text"
                  id="twitterUrl"
                  name="twitterUrl"
                  value={form.twitterUrl}
                  onChange={handleChange}
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div>
                <Label htmlFor="youtubeUrl">YouTube URL</Label>
                <Input
                  type="text"
                  id="youtubeUrl"
                  name="youtubeUrl"
                  value={form.youtubeUrl}
                  onChange={handleChange}
                  placeholder="https://youtube.com/..."
                />
              </div>
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
