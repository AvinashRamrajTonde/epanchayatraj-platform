import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { superadminService } from "../../services/superadminService";

interface Village {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  customDomain: string | null;
  status: string;
  theme: string;
  settings: Record<string, unknown>;
  tehsilId: string;
  tehsil: { id: string; name: string; district: string; state: string };
  _count: { users: number };
  createdAt: string;
  updatedAt: string;
}

interface Tehsil {
  id: string;
  name: string;
  district: string;
  state: string;
}

export default function VillageDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [village, setVillage] = useState<Village | null>(null);
  const [tehsils, setTehsils] = useState<Tehsil[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Password reset state
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetPw, setResetPw] = useState("");
  const [resetPwConfirm, setResetPwConfirm] = useState("");
  const [resettingPw, setResettingPw] = useState(false);
  const [showResetPw, setShowResetPw] = useState(false);

  const handleResetPassword = async () => {
    if (!id) return;
    if (resetPw.length < 6) { setError("पासवर्ड किमान ६ अक्षरांचा असावा"); return; }
    if (resetPw !== resetPwConfirm) { setError("पासवर्ड जुळत नाही"); return; }
    setResettingPw(true); setError(""); setSuccess("");
    try {
      await superadminService.resetVillageAdminPassword(id, resetPw);
      setSuccess("Admin पासवर्ड यशस्वीरीत्या रीसेट झाला");
      setShowResetPassword(false);
      setResetPw(""); setResetPwConfirm("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "पासवर्ड रीसेट करता आला नाही");
    } finally {
      setResettingPw(false);
    }
  };

  const [form, setForm] = useState({
    name: "",
    slug: "",
    tehsilId: "",
  });

  // Domain config state
  const [domainForm, setDomainForm] = useState({
    subdomain: "",
    customDomain: "",
  });
  const [savingDomain, setSavingDomain] = useState(false);

  // Subscription state
  const [subscription, setSubscription] = useState<any>(null);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewForm, setRenewForm] = useState({ amount: "", paymentMethod: "cash", remarks: "" });
  const [renewing, setRenewing] = useState(false);
  const [subSuccess, setSubSuccess] = useState("");

  const PLATFORM_DOMAIN = import.meta.env.VITE_PLATFORM_DOMAIN || "gpmh.local";

  useEffect(() => {
    if (!id) return;
    Promise.all([
      superadminService.getVillage(id),
      superadminService.getTehsils(),
      superadminService.getVillageSubscription(id).catch(() => ({ data: null })),
    ])
      .then(([villageRes, tehsilRes, subRes]) => {
        const v = villageRes.data;
        setVillage(v);
        setForm({ name: v.name, slug: v.slug, tehsilId: v.tehsilId });
        setDomainForm({
          subdomain: v.subdomain || "",
          customDomain: v.customDomain || "",
        });
        setTehsils(tehsilRes.data || []);
        setSubscription(subRes.data?.data ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await superadminService.updateVillage(id, form);
      setVillage({ ...village!, ...res.data });
      setEditing(false);
      setSuccess("गाव यशस्वीरीत्या अपडेट झाले");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "अपडेट करता आले नाही");
    } finally {
      setSaving(false);
    }
  };

  const handleDomainSave = async () => {
    if (!id) return;
    setSavingDomain(true);
    setError("");
    setSuccess("");
    try {
      const payload: { subdomain: string; customDomain: string | null } = {
        subdomain: domainForm.subdomain.trim(),
        customDomain: domainForm.customDomain.trim() || null,
      };
      const res = await superadminService.updateVillage(id, payload);
      setVillage({ ...village!, ...res.data });
      setDomainForm({
        subdomain: res.data.subdomain || "",
        customDomain: res.data.customDomain || "",
      });
      setSuccess("डोमेन कॉन्फिगरेशन यशस्वीरीत्या सेव्ह झाले");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "डोमेन अपडेट करता आले नाही");
    } finally {
      setSavingDomain(false);
    }
  };

  const handleRenew = async () => {
    if (!id) return;
    setRenewing(true);
    try {
      const res = await superadminService.renewSubscription(id, {
        amount: parseFloat(renewForm.amount) || 0,
        paymentMethod: renewForm.paymentMethod,
        remarks: renewForm.remarks,
      });
      setSubscription(res.data.data);
      setSubSuccess("सदस्यता यशस्वीरीत्या नूतनीकरण झाली! पावती ईमेलवर पाठवली आहे.");
      setShowRenewModal(false);
      setRenewForm({ amount: "", paymentMethod: "cash", remarks: "" });
      setTimeout(() => setSubSuccess(""), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || "नूतनीकरण करता आले नाही");
    } finally {
      setRenewing(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!village || !id) return;
    const newStatus = village.status === "active" ? "inactive" : "active";
    try {
      const res = await superadminService.updateVillageStatus(id, newStatus);
      setVillage({ ...village, ...res.data });
    } catch (err) {
      console.error(err);
    }
  };

  const handleThemeChange = async (newTheme: string) => {
    if (!village || !id) return;
    setSavingTheme(true);
    try {
      const res = await superadminService.updateVillageTheme(id, newTheme);
      setVillage({ ...village, theme: res.data.theme });
      setSuccess("थीम यशस्वीरीत्या अपडेट झाली");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "थीम अपडेट करता आली नाही");
    } finally {
      setSavingTheme(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    setError("");
    try {
      await superadminService.deleteVillage(id);
      navigate("/villages");
    } catch (err: any) {
      setError(err.response?.data?.message || "गाव डिलीट करता आले नाही");
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">लोड होत आहे...</p>
      </div>
    );
  }

  if (!village) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">गाव सापडले नाही</p>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`${village.name} | GPMH Admin`}
        description={`Village details for ${village.name}`}
      />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
            {village.name}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {village.subdomain}.{PLATFORM_DOMAIN}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/villages")}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            यादीवर परत
          </button>
          {!editing && (
            <Button size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
          <button
            onClick={() => { setShowResetPassword(true); setError(""); setResetPw(""); setResetPwConfirm(""); }}
            className="rounded-lg border border-orange-300 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-500/10"
          >
            पासवर्ड रीसेट
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-lg bg-error-500 px-4 py-2 text-sm font-medium text-white hover:bg-error-600"
          >
            डिलीट करा
          </button>
        </div>
      </div>

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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Info Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
            गावाचे तपशील
          </h3>
          {editing ? (
            <div className="space-y-4">
              <div>
                <Label>नाव</Label>
                <Input
                  value={form.name}
                  onChange={handleChange}
                  name="name"
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={handleChange}
                  name="slug"
                />
              </div>
              <div>
                <Label>तहसील</Label>
                <select
                  name="tehsilId"
                  value={form.tehsilId}
                  onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  {tehsils.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} - {t.district}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? "सेव्ह करत आहे..." : "सेव्ह करा"}
                </Button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setForm({
                      name: village.name,
                      slug: village.slug,
                      tehsilId: village.tehsilId,
                    });
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  रद्द करा
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">नाव</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {village.name}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">Slug</span>
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">
                  {village.slug}
                </code>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">तहसील</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {village.tehsil.name}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">जिल्हा</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {village.tehsil.district}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">राज्य</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {village.tehsil.state}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">वापरकर्ते</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {village._count.users}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Status & Access Card */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
              Status
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge
                  color={village.status === "active" ? "success" : "error"}
                >
                  {village.status}
                </Badge>
              </div>
              <button
                onClick={handleToggleStatus}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                  village.status === "active"
                    ? "bg-error-500 hover:bg-error-600"
                    : "bg-success-500 hover:bg-success-600"
                }`}
              >
                {village.status === "active" ? "निष्क्रिय करा" : "सक्रिय करा"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
              Access URLs
            </h3>
            <div className="space-y-3">
              <div>
                <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Platform Subdomain URL
                </span>
                <code className="block rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                  http://{village.subdomain}.{PLATFORM_DOMAIN}:5173
                </code>
              </div>
              {village.customDomain && (
                <div>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Custom Domain URL
                  </span>
                  <code className="block rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                    http://{village.customDomain}
                  </code>
                </div>
              )}
              <div>
                <span className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  तयार केले
                </span>
                <span className="text-sm text-gray-800 dark:text-white/90">
                  {new Date(village.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-white/90">
              थीम सेटिंग्ज
            </h3>
            <div className="space-y-3">
              <div>
                <Label>वेबसाइट थीम</Label>
                <select
                  value={village.theme || "classic"}
                  onChange={(e) => handleThemeChange(e.target.value)}
                  disabled={savingTheme}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option value="classic">Classic (क्लासिक)</option>
                  <option value="modern">Modern (आधुनिक)</option>
                  <option value="minimal">Minimal (सोपे)</option>
                </select>
                <p className="mt-1 text-xs text-gray-400">
                  गावाच्या वेबसाइटचे स्वरूप बदला. Classic आणि Modern उपलब्ध आहे.
                </p>
              </div>
              {savingTheme && (
                <p className="text-sm text-orange-500">थीम अपडेट करत आहे...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Domain & URL Configuration Card */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-1 text-lg font-medium text-gray-800 dark:text-white/90">
          Domain & URL Configuration
        </h3>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          Subdomain आणि Custom Domain स्वतंत्रपणे कॉन्फिगर करा. Subdomain बदलल्यास Slug बदलत नाही.
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label>Subdomain</Label>
            <div className="flex items-center gap-2">
              <Input
                value={domainForm.subdomain}
                onChange={(e) =>
                  setDomainForm((prev) => ({ ...prev, subdomain: e.target.value }))
                }
                placeholder="e.g. village1"
              />
              <span className="shrink-0 text-sm text-gray-400">.{PLATFORM_DOMAIN}</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Platform subdomain URL: http://{domainForm.subdomain || "…"}.{PLATFORM_DOMAIN}
            </p>
          </div>
          <div>
            <Label>Custom Domain</Label>
            <div className="flex items-center gap-2">
              <Input
                value={domainForm.customDomain}
                onChange={(e) =>
                  setDomainForm((prev) => ({ ...prev, customDomain: e.target.value }))
                }
                placeholder="e.g. village2.in (रिकामे ठेवा म्हणजे काढले जाईल)"
              />
              {domainForm.customDomain && (
                <button
                  onClick={() => setDomainForm((prev) => ({ ...prev, customDomain: "" }))}
                  className="shrink-0 text-xs text-error-500 hover:text-error-700"
                  title="Clear custom domain"
                >
                  ✕ काढा
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {domainForm.customDomain
                ? `Custom domain URL: http://${domainForm.customDomain}`
                : "Custom domain सेट नाही — फक्त subdomain वापरेल"}
            </p>
          </div>
        </div>

        {/* Live URL preview */}
        <div className="mt-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/40 space-y-2">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">URL Preview</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-28">Platform URL:</span>
            <code className="text-xs text-gray-700 dark:text-gray-300">
              http://{domainForm.subdomain || village.subdomain}.{PLATFORM_DOMAIN}
            </code>
          </div>
          {(domainForm.customDomain || village.customDomain) && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-28">Custom Domain:</span>
              <code className="text-xs text-blue-600 dark:text-blue-400">
                http://{domainForm.customDomain || village.customDomain}
              </code>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button size="sm" onClick={handleDomainSave} disabled={savingDomain}>
            {savingDomain ? "सेव्ह करत आहे..." : "सेव्ह करा"}
          </Button>
          <button
            onClick={() =>
              setDomainForm({
                subdomain: village.subdomain || "",
                customDomain: village.customDomain || "",
              })
            }
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            रद्द करा
          </button>
        </div>
      </div>

      {/* Subscription Card */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">सदस्यता / Subscription</h3>
          <button
            onClick={() => setShowRenewModal(true)}
            className="rounded-lg bg-success-500 px-4 py-2 text-sm font-medium text-white hover:bg-success-600"
          >
            🔄 नूतनीकरण करा
          </button>
        </div>
        {subSuccess && (
          <div className="mb-3 rounded-lg bg-success-50 p-3 text-sm text-success-700 dark:bg-success-500/10 dark:text-success-400">
            {subSuccess}
          </div>
        )}
        {subscription ? (
          <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xs text-gray-400 mb-1">स्थिती</p>
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                subscription.status === "active"
                  ? subscription.daysLeft <= 30 ? "bg-warning-100 text-warning-700" : "bg-success-100 text-success-700"
                  : "bg-error-100 text-error-700"
              }`}>
                {subscription.status === "active"
                  ? subscription.daysLeft <= 0 ? "कालबाह्य" : `${subscription.daysLeft} दिवस शिल्लक`
                  : subscription.status}
              </span>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xs text-gray-400 mb-1">सुरुवात</p>
              <p className="font-medium text-gray-700 dark:text-gray-300">{new Date(subscription.startDate).toLocaleDateString("mr-IN")}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xs text-gray-400 mb-1">समाप्ती</p>
              <p className={`font-medium ${subscription.daysLeft <= 30 ? "text-warning-600" : "text-gray-700 dark:text-gray-300"}`}>
                {new Date(subscription.endDate).toLocaleDateString("mr-IN")}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xs text-gray-400 mb-1">रक्कम</p>
              <p className="font-medium text-gray-700 dark:text-gray-300">₹{subscription.amount}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xs text-gray-400 mb-1">पेमेंट पद्धत</p>
              <p className="font-medium text-gray-700 dark:text-gray-300">{subscription.paymentMethod || "-"}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xs text-gray-400 mb-1">पावती क्रमांक</p>
              <p className="font-mono text-xs text-gray-600 dark:text-gray-300">{subscription.receiptNo || "-"}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-warning-50 p-4 text-sm text-warning-700 dark:bg-warning-500/10 dark:text-warning-400">
            ⚠️ या गावासाठी सदस्यता नोंदणी झालेली नाही. नूतनीकरण करा बटण दाबून सेवा सुरू करा.
          </div>
        )}
      </div>

      {/* Renew Modal */}
      {showRenewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
              🔄 सदस्यता नूतनीकरण
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              <strong>{village.name}</strong> — वार्षिक सेवा (१ वर्ष)
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">रक्कम (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={renewForm.amount}
                  onChange={(e) => setRenewForm(f => ({ ...f, amount: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">पेमेंट पद्धत</label>
                <select
                  value={renewForm.paymentMethod}
                  onChange={(e) => setRenewForm(f => ({ ...f, paymentMethod: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="cash">रोख (Cash)</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">बँक ट्रान्सफर</option>
                  <option value="cheque">चेक</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">नोट (पर्यायी)</label>
                <input
                  type="text"
                  placeholder="शेरा..."
                  value={renewForm.remarks}
                  onChange={(e) => setRenewForm(f => ({ ...f, remarks: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowRenewModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                रद्द करा
              </button>
              <button
                onClick={handleRenew}
                disabled={renewing}
                className="rounded-lg bg-success-500 px-4 py-2 text-sm font-medium text-white hover:bg-success-600 disabled:opacity-50"
              >
                {renewing ? "नूतनीकरण करत आहे..." : "✅ नूतनीकरण करा"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Admin पासवर्ड रीसेट करा
            </h3>
            <p className="mt-1 mb-4 text-sm text-gray-500 dark:text-gray-400">
              <strong>{village.name}</strong> या गावाच्या Admin वापरकर्त्याचा पासवर्ड बदलवा.
            </p>
            {error && (
              <div className="mb-3 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
                {error}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <Label>नवीन पासवर्ड</Label>
                <div className="relative">
                  <Input
                    type={showResetPw ? "text" : "password"}
                    placeholder="किमान ६ अक्षरे"
                    value={resetPw}
                    onChange={(e) => setResetPw(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
                  >
                    {showResetPw ? "hide" : "show"}
                  </button>
                </div>
              </div>
              <div>
                <Label>पासवर्ड पुन्हा टाका</Label>
                <Input
                  type={showResetPw ? "text" : "password"}
                  placeholder="पासवर्ड पुन्हा हवे"
                  value={resetPwConfirm}
                  onChange={(e) => setResetPwConfirm(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => { setShowResetPassword(false); setError(""); }}
                disabled={resettingPw}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                रद्द करा
              </button>
              <button
                onClick={handleResetPassword}
                disabled={resettingPw}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
              >
                {resettingPw ? "रीसेट करत आहे..." : "पासवर्ड रीसेट करा"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              गाव डिलीट करायचे आहे का?
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              <strong>{village.name}</strong> आणि त्याचा सर्व डेटा (सदस्य, सूचना, गॅलरी, योजना, कार्यक्रम इ.) कायमचा हटवला जाईल. ही क्रिया परत करता येणार नाही.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                रद्द करा
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-error-500 px-4 py-2 text-sm font-medium text-white hover:bg-error-600 disabled:opacity-50"
              >
                {deleting ? "डिलीट करत आहे..." : "होय, डिलीट करा"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
