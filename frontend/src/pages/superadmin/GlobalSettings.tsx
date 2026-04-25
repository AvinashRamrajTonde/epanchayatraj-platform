import { useState, useEffect, useRef } from "react";
import { superadminService } from "../../services/superadminService";

interface EmergencyNumber {
  name: string;
  number: string;
  icon?: string;
}

interface UsefulLink {
  name: string;
  url: string;
  icon?: string;
}

type PopupMode =
  | { type: "emergency"; item?: EmergencyNumber; index?: number }
  | { type: "links"; item?: UsefulLink; index?: number }
  | null;

const EMOJI_OPTIONS = ["🚔", "🚒", "🚑", "👩", "👶", "⚠️", "⚡", "💧", "🏛️", "🌾", "🖥️", "📋", "🇮🇳", "🏠", "🧑‍🌾", "👷", "📞", "🌐", "🏥", "🚨", "📂", "🔗"];

export default function GlobalSettings() {
  const [emergency, setEmergency] = useState<EmergencyNumber[]>([]);
  const [links, setLinks] = useState<UsefulLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<"emergency" | "links" | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [popup, setPopup] = useState<PopupMode>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  // Close popup on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) setPopup(null);
    };
    if (popup) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [popup]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await superadminService.getGlobalSettings();
      const data = res.data || {};
      setEmergency(Array.isArray(data.emergency_numbers) ? data.emergency_numbers : []);
      setLinks(Array.isArray(data.useful_links) ? data.useful_links : []);
    } catch {
      // no settings yet
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (type: "success" | "error", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  const save = async (key: "emergency_numbers" | "useful_links", value: unknown) => {
    const label = key === "emergency_numbers" ? "emergency" : "links";
    setSaving(label as "emergency" | "links");
    try {
      await superadminService.upsertGlobalSetting(key, value);
      showMsg("success", "जतन केले!");
    } catch {
      showMsg("error", "जतन अयशस्वी");
    } finally {
      setSaving(null);
    }
  };

  // ── Emergency popup ──
  const openEmergencyPopup = (item?: EmergencyNumber, index?: number) => {
    setForm({ name: item?.name || "", number: item?.number || "", icon: item?.icon || "🚔" });
    setPopup({ type: "emergency", item, index });
  };

  const submitEmergency = () => {
    if (!form.name || !form.number) return;
    const newItem: EmergencyNumber = { name: form.name, number: form.number, icon: form.icon };
    let updated: EmergencyNumber[];
    if (popup?.type === "emergency" && popup.index !== undefined) {
      updated = emergency.map((e, i) => (i === popup.index ? newItem : e));
    } else {
      updated = [...emergency, newItem];
    }
    setEmergency(updated);
    setPopup(null);
    save("emergency_numbers", updated);
  };

  const deleteEmergency = (index: number) => {
    const updated = emergency.filter((_, i) => i !== index);
    setEmergency(updated);
    save("emergency_numbers", updated);
  };

  // ── Links popup ──
  const openLinksPopup = (item?: UsefulLink, index?: number) => {
    setForm({ name: item?.name || "", url: item?.url || "", icon: item?.icon || "🔗" });
    setPopup({ type: "links", item, index });
  };

  const submitLinks = () => {
    if (!form.name || !form.url) return;
    const newItem: UsefulLink = { name: form.name, url: form.url, icon: form.icon };
    let updated: UsefulLink[];
    if (popup?.type === "links" && popup.index !== undefined) {
      updated = links.map((l, i) => (i === popup.index ? newItem : l));
    } else {
      updated = [...links, newItem];
    }
    setLinks(updated);
    setPopup(null);
    save("useful_links", updated);
  };

  const deleteLink = (index: number) => {
    const updated = links.filter((_, i) => i !== index);
    setLinks(updated);
    save("useful_links", updated);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
          जागतिक सेटिंग्ज
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          हे सेटिंग्ज सर्व गावांसाठी लागू होतात. आपत्कालीन क्रमांक व उपयुक्त दुवे येथून व्यवस्थापित करा.
        </p>
      </div>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
          msg.type === "success"
            ? "bg-success-50 text-success-700 border border-success-200 dark:bg-success-500/10 dark:text-success-400"
            : "bg-error-50 text-error-700 border border-error-200 dark:bg-error-500/10 dark:text-error-400"
        }`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ── Emergency Numbers ── */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white/90">🚨 आपत्कालीन क्रमांक</h3>
              <p className="text-xs text-gray-500 mt-0.5">सर्व गावांच्या महत्त्वाची माहिती पेजवर दिसतात</p>
            </div>
            <button
              onClick={() => openEmergencyPopup()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              जोडा
            </button>
          </div>
          <div className="p-4 space-y-2">
            {emergency.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-6">अद्याप कोणतेही क्रमांक नाहीत. डीफॉल्ट क्रमांक वापरले जातील.</p>
            )}
            {emergency.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 group">
                <span className="text-xl">{item.icon || "📞"}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-800 dark:text-white/90">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.number}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEmergencyPopup(item, i)}
                    className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-colors"
                    title="संपादित करा"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteEmergency(i)}
                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors"
                    title="हटवा"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                {saving === "emergency" && i === emergency.length - 1 && (
                  <div className="w-4 h-4 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Useful Links ── */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white/90">🔗 उपयुक्त दुवे</h3>
              <p className="text-xs text-gray-500 mt-0.5">सर्व गावांच्या महत्त्वाची माहिती पेजवर दिसतात</p>
            </div>
            <button
              onClick={() => openLinksPopup()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              जोडा
            </button>
          </div>
          <div className="p-4 space-y-2">
            {links.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-6">अद्याप कोणतेही दुवे नाहीत. डीफॉल्ट दुवे वापरले जातील.</p>
            )}
            {links.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 group">
                <span className="text-xl">{item.icon || "🔗"}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-800 dark:text-white/90">{item.name}</p>
                  <p className="text-xs text-gray-400 truncate">{item.url}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openLinksPopup(item, i)}
                    className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-colors"
                    title="संपादित करा"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteLink(i)}
                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors"
                    title="हटवा"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Popup Modal ── */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div
            ref={popupRef}
            className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h4 className="font-semibold text-gray-800 dark:text-white/90">
                {popup.type === "emergency"
                  ? popup.index !== undefined ? "क्रमांक संपादित करा" : "नवीन क्रमांक जोडा"
                  : popup.index !== undefined ? "दुवा संपादित करा" : "नवीन दुवा जोडा"}
              </h4>
              <button onClick={() => setPopup(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Icon picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">चिन्ह (Icon)</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, icon: emoji }))}
                      className={`w-9 h-9 text-lg rounded-lg border-2 transition-colors ${
                        form.icon === emoji
                          ? "border-brand-500 bg-brand-50 dark:bg-brand-500/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">नाव *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder={popup.type === "emergency" ? "उदा. पोलीस" : "उदा. महाराष्ट्र शासन"}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Number or URL */}
              {popup.type === "emergency" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">क्रमांक *</label>
                  <input
                    type="text"
                    value={form.number}
                    onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
                    placeholder="उदा. 100"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL *</label>
                  <input
                    type="url"
                    value={form.url}
                    onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                    placeholder="उदा. https://maharashtra.gov.in"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
              <button
                onClick={() => setPopup(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                रद्द करा
              </button>
              <button
                onClick={popup.type === "emergency" ? submitEmergency : submitLinks}
                disabled={popup.type === "emergency" ? !form.name || !form.number : !form.name || !form.url}
                className="px-5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
              >
                {popup.index !== undefined ? "अपडेट करा" : "जोडा"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
