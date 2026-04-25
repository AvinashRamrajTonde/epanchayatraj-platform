import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import { superadminService } from "../../services/superadminService";

interface Tehsil {
  id: string;
  name: string;
  district: string;
  state: string;
}

export default function VillageOnboard() {
  const navigate = useNavigate();
  const [tehsils, setTehsils] = useState<Tehsil[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    subdomain: "",
    customDomain: "",
    tehsilId: "",
    adminEmail: "",
    adminName: "",
    adminPassword: "",
  });
  // Track whether subdomain was manually edited (stop auto-sync with slug if so)
  const [subdomainManual, setSubdomainManual] = useState(false);

  const PLATFORM_DOMAIN = import.meta.env.VITE_PLATFORM_DOMAIN || "gpmh.local";

  useEffect(() => {
    superadminService
      .getTehsils()
      .then((res) => setTehsils(res.data))
      .catch(console.error);
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = generateSlug(name);
    setForm((prev) => ({
      ...prev,
      name,
      slug,
      // Keep subdomain in sync with slug unless user has manually changed it
      subdomain: subdomainManual ? prev.subdomain : slug,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "slug") {
      setForm((prev) => ({
        ...prev,
        slug: value,
        subdomain: subdomainManual ? prev.subdomain : value,
      }));
    } else if (name === "subdomain") {
      setSubdomainManual(true);
      setForm((prev) => ({ ...prev, subdomain: value }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const data: any = {
        name: form.name,
        slug: form.slug,
        subdomain: form.subdomain || form.slug,
        customDomain: form.customDomain.trim() || null,
        tehsilId: form.tehsilId,
      };

      if (form.adminEmail && form.adminName && form.adminPassword) {
        data.adminEmail = form.adminEmail;
        data.adminName = form.adminName;
        data.adminPassword = form.adminPassword;
      }

      await superadminService.createVillage(data);
      setSuccess("गाव यशस्वीरीत्या जोडले!");
      setTimeout(() => navigate("/villages"), 1500);
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Failed to create village";
      const errors = err.response?.data?.errors;
      if (errors && errors.length > 0) {
        setError(errors.map((e: any) => e.message).join(", "));
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="नवीन गाव जोडा | GPMH Admin"
        description="नवीन गाव नोंदणी"
      />
      <div className="mb-6">
        <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
          नवीन गाव जोडा
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          प्लॅटफॉर्मवर नवीन गाव नोंदणी करा
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:p-8">
        {error && (
          <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg bg-success-50 p-3 text-sm text-success-600 dark:bg-success-500/15 dark:text-success-400">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Village Info */}
            <div>
              <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
                गावाची माहिती
              </h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label>
                    गावाचे नाव <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder="उदा. कुंभारी"
                    value={form.name}
                    onChange={handleNameChange}
                    name="name"
                  />
                </div>
                <div>
                  <Label>
                    Slug <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    placeholder="उदा. kumbhari"
                    value={form.slug}
                    onChange={handleChange}
                    name="slug"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    URL: {form.slug || "village-slug"}.{PLATFORM_DOMAIN}
                  </p>
                </div>
                <div>
                  <Label>
                    तहसील <span className="text-error-500">*</span>
                  </Label>
                  <select
                    name="tehsilId"
                    value={form.tehsilId}
                    onChange={handleChange}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option value="">तहसील निवडा</option>
                    {tehsils.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} - {t.district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Domain & URL Configuration */}
            <div>
              <h3 className="mb-1 text-lg font-medium text-gray-800 dark:text-white/90">
                Domain & URL Configuration
              </h3>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Subdomain आपोआप Slug वरून सेट होतो. Custom Domain ऊच्छिक आहे — नंतर सेट करता येतो.
              </p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label>Subdomain</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="उदा. kumbhari"
                      value={form.subdomain}
                      onChange={handleChange}
                      name="subdomain"
                    />
                    <span className="shrink-0 text-sm text-gray-400">.{PLATFORM_DOMAIN}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    Platform URL: http://{form.subdomain || form.slug || "…"}.{PLATFORM_DOMAIN}
                  </p>
                </div>
                <div>
                  <Label>Custom Domain <span className="text-gray-400 text-xs">(ऐच्छिक)</span></Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="उदा. village2.in"
                      value={form.customDomain}
                      onChange={handleChange}
                      name="customDomain"
                    />
                    {form.customDomain && (
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, customDomain: "" }))}
                        className="shrink-0 text-xs text-error-500 hover:text-error-700"
                      >
                        ✕ काढा
                      </button>
                    )}
                  </div>
                  {form.customDomain && (
                    <p className="mt-1 text-xs text-blue-500">
                      Custom URL: http://{form.customDomain}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Credentials */}
            <div>
              <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
                गाव Admin (ऐच्छिक)
              </h3>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                या गावासाठी admin तयार करा
              </p>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label>Admin नाव</Label>
                  <Input
                    placeholder="Admin पूर्ण नाव"
                    value={form.adminName}
                    onChange={handleChange}
                    name="adminName"
                  />
                </div>
                <div>
                  <Label>Admin ईमेल</Label>
                  <Input
                    placeholder="admin@village.com"
                    value={form.adminEmail}
                    onChange={handleChange}
                    name="adminEmail"
                    type="email"
                  />
                </div>
                <div>
                  <Label>Admin पासवर्ड</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="किमान ८ अक्षरे"
                      value={form.adminPassword}
                      onChange={handleChange}
                      name="adminPassword"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button size="sm" disabled={isLoading}>
                {isLoading ? "तयार करत आहे..." : "गाव जोडा"}
              </Button>
              <button
                type="button"
                onClick={() => navigate("/villages")}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                रद्द करा
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
