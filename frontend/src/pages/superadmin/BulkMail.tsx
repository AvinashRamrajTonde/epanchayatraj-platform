import { useEffect, useRef, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { superadminService } from "../../services/superadminService";

interface Village {
  id: string;
  name: string;
  slug: string;
  tehsil: { name: string };
  status: string;
}

const TEMPLATES = [
  {
    label: "सूचना (General Notice)",
    subject: "महत्त्वाची सूचना — GPMH ग्रामपंचायत पोर्टल",
    html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;">
  <h2 style="color:#1a3c5e;">🏛️ GPMH ग्रामपंचायत पोर्टल</h2>
  <p style="color:#444;line-height:1.7;">नमस्कार,</p>
  <p style="color:#444;line-height:1.7;">[येथे संदेश लिहा]</p>
  <p style="color:#888;font-size:13px;margin-top:24px;">GPMH Support Team</p>
</div>`,
  },
  {
    label: "देखभाल (Maintenance)",
    subject: "🔧 GPMH पोर्टल — देखभालीची सूचना",
    html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;">
  <h2 style="color:#e65100;">🔧 देखभाल सूचना</h2>
  <p style="color:#444;line-height:1.7;">नमस्कार,<br/>GPMH पोर्टलची नियमित देखभाल <strong>[तारीख/वेळ]</strong> रोजी होणार आहे. या काळात पोर्टल काही वेळ बंद राहील.</p>
  <p style="color:#888;font-size:13px;margin-top:24px;">GPMH Support Team</p>
</div>`,
  },
  {
    label: "नवीन वैशिष्ट्य (New Feature)",
    subject: "✨ GPMH पोर्टलमध्ये नवीन वैशिष्ट्य",
    html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;">
  <h2 style="color:#2e7d32;">✨ नवीन वैशिष्ट्य उपलब्ध</h2>
  <p style="color:#444;line-height:1.7;">नमस्कार,<br/>आम्हाला आनंद आहे की GPMH पोर्टलमध्ये नवीन वैशिष्ट्य उपलब्ध झाले आहे: <strong>[वैशिष्ट्याचे नाव]</strong></p>
  <p style="color:#888;font-size:13px;margin-top:24px;">GPMH Support Team</p>
</div>`,
  },
];

export default function BulkMail() {
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const previewRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const fetchAll = async () => {
      let all: Village[] = [];
      let page = 1;
      let totalPages = 1;
      do {
        const res = await superadminService.getVillages({ page, limit: 100, status: "active" });
        all = all.concat(res.data.villages);
        totalPages = res.data.pagination.totalPages;
        page++;
      } while (page <= totalPages);
      setVillages(all);
    };
    fetchAll().catch(console.error);
  }, []);

  const filteredVillages = villages.filter(
    (v) => v.name.toLowerCase().includes(search.toLowerCase()) || v.tehsil.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleVillage = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      setSelectedIds(new Set(filteredVillages.map((v) => v.id)));
      setSelectAll(true);
    }
  };

  const handleSend = async () => {
    setSending(true);
    setShowConfirm(false);
    setResult(null);
    try {
      const villageIds = selectedIds.size > 0 ? Array.from(selectedIds) : undefined;
      const res = await superadminService.sendBulkMail({ subject, html, villageIds });
      setResult(res.data.data);
    } catch (err: any) {
      setResult({ sent: 0, failed: -1 });
    } finally {
      setSending(false);
    }
  };

  const applyTemplate = (template: (typeof TEMPLATES)[0]) => {
    setSubject(template.subject);
    setHtml(template.html);
  };

  const recipientCount = selectedIds.size > 0 ? selectedIds.size : villages.length;

  return (
    <>
      <PageMeta title="बल्क मेल | GPMH Admin" description="Bulk Mail Sender" />
      <div className="mb-6">
        <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">📧 बल्क मेल</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">निवडलेल्या किंवा सर्व गावांच्या Admin ला ईमेल पाठवा.</p>
      </div>

      {result && (
        <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${result.failed === -1 ? "bg-error-50 text-error-700" : "bg-success-50 text-success-700"}`}>
          {result.failed === -1 ? "❌ ईमेल पाठवता आल्या नाहीत" : `✅ ${result.sent} ईमेल पाठवल्या | ${result.failed} अयशस्वी`}
          <button onClick={() => setResult(null)} className="ml-3 font-bold opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Village Selector */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              प्राप्तकर्ते ({selectedIds.size > 0 ? `${selectedIds.size} निवडले` : `सर्व ${villages.length}`})
            </h3>
            <button
              onClick={toggleAll}
              className="text-xs text-brand-500 hover:text-brand-600"
            >
              {selectAll ? "सर्व रद्द करा" : "सर्व निवडा"}
            </button>
          </div>
          <input
            type="text"
            placeholder="गाव किंवा तहसील शोधा..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3 h-9 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 dark:border-gray-700 dark:text-white"
          />
          <div className="max-h-80 overflow-y-auto space-y-1">
            {filteredVillages.map((v) => (
              <label key={v.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800">
                <input
                  type="checkbox"
                  checked={selectedIds.has(v.id)}
                  onChange={() => toggleVillage(v.id)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{v.name}</span>
                <span className="ml-auto text-xs text-gray-400">{v.tehsil.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Composer */}
        <div className="lg:col-span-3 space-y-4">
          {/* Templates */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="mb-2 text-xs font-medium text-gray-500 uppercase">टेम्प्लेट निवडा</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  onClick={() => applyTemplate(t)}
                  className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject + HTML */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">विषय (Subject)</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="ईमेलचा विषय..."
                className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">HTML संदेश</label>
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="text-xs text-brand-500 hover:text-brand-600"
                >
                  {previewMode ? "HTML संपादित करा" : "Preview पहा"}
                </button>
              </div>
              {previewMode ? (
                <div className="h-72 rounded-lg border border-gray-200 overflow-auto bg-white">
                  <iframe
                    ref={previewRef}
                    srcDoc={html}
                    className="w-full h-full"
                    sandbox="allow-same-origin"
                    title="Email Preview"
                  />
                </div>
              ) : (
                <textarea
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  rows={12}
                  placeholder="HTML ईमेल कोड येथे लिहा..."
                  className="w-full rounded-lg border border-gray-300 p-3 font-mono text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <p className="text-sm text-gray-500">
                📬 <strong>{recipientCount}</strong> गावांना ईमेल जाईल
              </p>
              <button
                onClick={() => setShowConfirm(true)}
                disabled={!subject || !html || sending}
                className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {sending ? "पाठवत आहे..." : "📧 पाठवा"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">ईमेल पाठवायची का?</h3>
            <p className="text-sm text-gray-500 mb-1">विषय: <strong>{subject}</strong></p>
            <p className="text-sm text-gray-500 mb-6">
              <strong>{recipientCount}</strong> गावांच्या Admin ला ही ईमेल पाठवली जाईल.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirm(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300">
                रद्द करा
              </button>
              <button onClick={handleSend} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
                होय, पाठवा
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
