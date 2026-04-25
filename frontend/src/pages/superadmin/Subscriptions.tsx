import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { superadminService } from "../../services/superadminService";

interface Subscription {
  id: string;
  villageId: string;
  plan: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: string;
  receiptNo: string | null;
  paymentMethod: string | null;
  daysLeft: number;
  village: {
    name: string;
    slug: string;
    tehsil: { name: string; district: string };
  };
}

function DaysLeftBadge({ daysLeft, status }: { daysLeft: number; status: string }) {
  if (status === "expired" || (status === "active" && daysLeft <= 0)) {
    return <span className="rounded-full bg-error-100 px-2.5 py-0.5 text-xs font-medium text-error-700">कालबाह्य</span>;
  }
  if (daysLeft <= 7) {
    return <span className="rounded-full bg-error-100 px-2.5 py-0.5 text-xs font-medium text-error-700">🔴 {daysLeft}d</span>;
  }
  if (daysLeft <= 30) {
    return <span className="rounded-full bg-warning-100 px-2.5 py-0.5 text-xs font-medium text-warning-700">🟡 {daysLeft}d</span>;
  }
  return <span className="rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-medium text-success-700">✅ {daysLeft}d</span>;
}

export default function Subscriptions() {
  const [searchParams] = useSearchParams();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get("status") || "");
  const [expiring, setExpiring] = useState(searchParams.get("expiring") || "");
  const [reminderStatus, setReminderStatus] = useState<string>("");
  const [sendingReminder, setSendingReminder] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filter) params.status = filter;
      if (expiring) params.expiring = expiring;
      const res = await superadminService.getSubscriptions(params);
      setSubscriptions(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filter, expiring]);

  const handleSendReminders = async () => {
    setSendingReminder(true);
    setReminderStatus("");
    try {
      const res = await superadminService.sendRenewalReminders();
      const { sent, failed, total } = res.data.data;
      setReminderStatus(`✅ ${sent} ईमेल पाठवल्या | ${failed} अयशस्वी | एकूण ${total} गावे`);
    } catch (err: any) {
      setReminderStatus("❌ रिमाइंडर पाठवता आले नाहीत");
    } finally {
      setSendingReminder(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("mr-IN", { year: "numeric", month: "short", day: "numeric" });

  return (
    <>
      <PageMeta title="सदस्यता | GPMH Admin" description="Village Subscriptions" />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">सदस्यता / Subscriptions</h2>
        <button
          onClick={handleSendReminders}
          disabled={sendingReminder}
          className="rounded-lg bg-warning-500 px-4 py-2 text-sm font-medium text-white hover:bg-warning-600 disabled:opacity-50"
        >
          {sendingReminder ? "पाठवत आहे..." : "📧 नूतनीकरण रिमाइंडर पाठवा"}
        </button>
      </div>

      {reminderStatus && (
        <div className="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
          {reminderStatus}
          <button onClick={() => setReminderStatus("")} className="ml-3 font-bold opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { label: "सर्व", value: "", expValue: "" },
          { label: "🟡 लवकरच संपणारी (≤30d)", value: "active", expValue: "soon" },
          { label: "🔴 कालबाह्य", value: "expired", expValue: "" },
          { label: "✅ सक्रिय", value: "active", expValue: "" },
        ].map((f) => (
          <button
            key={f.label}
            onClick={() => { setFilter(f.value); setExpiring(f.expValue); }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value && expiring === f.expValue
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {["गाव", "तहसील / जिल्हा", "सेवा कालावधी", "दिवस शिल्लक", "रक्कम", "पावती", "कृती"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-500">लोड होत आहे...</td></tr>
              ) : subscriptions.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-500">कोणतीही सदस्यता सापडली नाही.</td></tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                      <Link to={`/villages/${sub.villageId}`} className="hover:text-brand-500">{sub.village.name}</Link>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {sub.village.tehsil.name}<br />
                      <span className="text-xs text-gray-400">{sub.village.tehsil.district}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {formatDate(sub.startDate)}<br />
                      <span className="text-xs text-gray-400">→ {formatDate(sub.endDate)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <DaysLeftBadge daysLeft={sub.daysLeft} status={sub.status} />
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">₹{sub.amount}</td>
                    <td className="px-5 py-4 text-xs font-mono text-gray-500">{sub.receiptNo || "-"}</td>
                    <td className="px-5 py-4">
                      <Link
                        to={`/villages/${sub.villageId}`}
                        className="text-sm text-brand-500 hover:text-brand-600"
                      >
                        नूतनीकरण
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
