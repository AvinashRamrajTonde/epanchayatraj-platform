import { useEffect, useState } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { GroupIcon, CheckCircleIcon, CloseCircleIcon } from "../../icons";
import { superadminService } from "../../services/superadminService";

interface Stats {
  total: number;
  active: number;
  inactive: number;
  expiringCount?: number;
  expiredCount?: number;
  totalRevenue?: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superadminService
      .getStats()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      title: "एकूण गावे",
      value: stats.total,
      icon: <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />,
      bgClass: "bg-gray-100 dark:bg-gray-800",
      link: "/villages",
    },
    {
      title: "सक्रिय गावे",
      value: stats.active,
      icon: <CheckCircleIcon className="text-success-500 size-6" />,
      bgClass: "bg-success-50 dark:bg-success-500/15",
      link: "/villages?status=active",
    },
    {
      title: "निष्क्रिय गावे",
      value: stats.inactive,
      icon: <CloseCircleIcon className="text-error-500 size-6" />,
      bgClass: "bg-error-50 dark:bg-error-500/15",
      link: "/villages?status=inactive",
    },
    {
      title: "लवकरच संपणारी सेवा",
      value: stats.expiringCount ?? 0,
      icon: <span className="text-2xl">⏳</span>,
      bgClass: "bg-warning-50 dark:bg-warning-500/15",
      link: "/subscriptions?expiring=soon",
      valueClass: "text-warning-600 dark:text-warning-400",
    },
    {
      title: "सेवा कालबाह्य",
      value: stats.expiredCount ?? 0,
      icon: <CloseCircleIcon className="text-error-500 size-6" />,
      bgClass: "bg-error-50 dark:bg-error-500/15",
      link: "/subscriptions?status=expired",
    },
    {
      title: "एकूण महसूल",
      value: `₹${(stats.totalRevenue ?? 0).toLocaleString("en-IN")}`,
      icon: <span className="text-2xl">💰</span>,
      bgClass: "bg-success-50 dark:bg-success-500/15",
      link: "/subscriptions",
      valueClass: "text-success-600 dark:text-success-400",
    },
  ];

  return (
    <>
      <PageMeta title="डॅशबोर्ड | GPMH Admin" description="Super Admin डॅशबोर्ड" />
      <div className="mb-6">
        <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
          डॅशबोर्ड
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-md transition-shadow"
          >
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${card.bgClass}`}>
              {card.icon}
            </div>
            <div className="mt-5">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {card.title}
              </span>
              <h4 className={`mt-2 font-bold text-title-sm ${card.valueClass || "text-gray-800 dark:text-white/90"}`}>
                {loading ? "..." : card.value}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
}
