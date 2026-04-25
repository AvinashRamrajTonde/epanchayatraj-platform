import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Users,
  Bell,
  Image,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  MapPin,
  ExternalLink,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import {
  villageAdminService,
  type DashboardStats,
} from "../../services/villageAdminService";
import type { CertificateApplication } from "../../services/citizenService";

export default function VillageAdminDashboard() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingPayments, setPendingPayments] = useState<CertificateApplication[]>([]);

  useEffect(() => {
    villageAdminService
      .getDashboardStats()
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));

    // Fetch applications under review (includes pending payments)
    villageAdminService
      .getCertificateApplications({ status: "under_review", limit: 10 })
      .then((res) => setPendingPayments(res.data?.applications || []))
      .catch(console.error);
  }, []);

  const stats = data?.stats;
  const village = data?.village;

  const cards = [
    {
      title: "पदाधिकारी / सदस्य",
      value: stats?.members ?? 0,
      icon: <Users size={20} />,
      color: "brand",
      href: "/admin/members",
    },
    {
      title: "सूचना",
      value: stats?.notices ?? 0,
      icon: <Bell size={20} />,
      color: "blue",
      href: "/admin/notices",
    },
    {
      title: "गॅलरी फोटो",
      value: stats?.galleryImages ?? 0,
      icon: <Image size={20} />,
      color: "purple",
      href: "/admin/gallery",
    },
    {
      title: "एकूण अर्ज",
      value: stats?.applications?.total ?? 0,
      icon: <FileText size={20} />,
      color: "gray",
      href: "/admin/applications",
    },
    {
      title: "प्रलंबित अर्ज",
      value: stats?.applications?.pending ?? 0,
      icon: <Clock size={20} />,
      color: "warning",
      href: "/admin/applications",
    },
    {
      title: "मंजूर अर्ज",
      value: stats?.applications?.approved ?? 0,
      icon: <CheckCircle2 size={20} />,
      color: "success",
      href: "/admin/applications",
    },
    {
      title: "नाकारलेले अर्ज",
      value: stats?.applications?.rejected ?? 0,
      icon: <XCircle size={20} />,
      color: "error",
      href: "/admin/applications",
    },
  ];

  const colorMap: Record<string, { bg: string; icon: string; border: string; glow: string }> = {
    brand: {
      bg: "bg-brand-50 dark:bg-brand-500/10",
      icon: "text-brand-500 dark:text-brand-400",
      border: "border-brand-100 dark:border-brand-500/20",
      glow: "hover:border-brand-300 dark:hover:border-brand-500/40",
    },
    blue: {
      bg: "bg-blue-light-50 dark:bg-blue-light-500/10",
      icon: "text-blue-light-500 dark:text-blue-light-400",
      border: "border-blue-light-100 dark:border-blue-light-500/20",
      glow: "hover:border-blue-light-300 dark:hover:border-blue-light-500/40",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-500/10",
      icon: "text-purple-500 dark:text-purple-400",
      border: "border-purple-100 dark:border-purple-500/20",
      glow: "hover:border-purple-300 dark:hover:border-purple-500/40",
    },
    gray: {
      bg: "bg-gray-100 dark:bg-gray-800",
      icon: "text-gray-600 dark:text-gray-300",
      border: "border-gray-200 dark:border-gray-700",
      glow: "hover:border-gray-300 dark:hover:border-gray-600",
    },
    warning: {
      bg: "bg-warning-50 dark:bg-warning-500/10",
      icon: "text-warning-500 dark:text-warning-400",
      border: "border-warning-100 dark:border-warning-500/20",
      glow: "hover:border-warning-300 dark:hover:border-warning-500/40",
    },
    success: {
      bg: "bg-success-50 dark:bg-success-500/10",
      icon: "text-success-500 dark:text-success-400",
      border: "border-success-100 dark:border-success-500/20",
      glow: "hover:border-success-300 dark:hover:border-success-500/40",
    },
    error: {
      bg: "bg-error-50 dark:bg-error-500/10",
      icon: "text-error-500 dark:text-error-400",
      border: "border-error-100 dark:border-error-500/20",
      glow: "hover:border-error-300 dark:hover:border-error-500/40",
    },
  };

  return (
    <>
      <PageMeta
        title={`डॅशबोर्ड | ${village?.name || "गाव"} प्रशासन`}
        description="गाव प्रशासन डॅशबोर्ड"
      />

      {/* Page header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={20} className="text-brand-500" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {village?.name ? `${village.name}` : "डॅशबोर्ड"}
            </h1>
          </div>
          {village?.tehsil && (
            <p className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <MapPin size={13} />
              तहसील: {village.tehsil.name} &nbsp;&bull;&nbsp; जिल्हा: {village.tehsil.district}
            </p>
          )}
        </div>
        <Link
          to="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <ExternalLink size={13} />
          वेबसाइट पहा
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 md:gap-4">
        {cards.map((card) => {
          const c = colorMap[card.color];
          return (
            <Link
              key={card.title}
              to={card.href}
              className={`group relative rounded-xl border p-4 bg-white dark:bg-gray-900 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-gray-900/50 ${c.border} ${c.glow}`}
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${c.bg} ${c.icon} mb-3`}>
                {card.icon}
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-tight mb-1">
                {card.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? (
                  <span className="inline-block h-6 w-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                ) : (
                  card.value
                )}
              </p>
              <ArrowRight size={14} className="absolute right-3 bottom-3 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors" />
            </Link>
          );
        })}
      </div>

      {/* Pending Payment Verifications */}
      {pendingPayments.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-warning-100 dark:bg-warning-500/15">
                <Clock size={13} className="text-warning-600 dark:text-warning-400" />
              </span>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                पेमेंट सत्यापन प्रलंबित
                <span className="ml-1.5 rounded-full bg-warning-100 dark:bg-warning-500/20 px-1.5 py-0.5 text-xs font-bold text-warning-700 dark:text-warning-400">
                  {pendingPayments.length}
                </span>
              </h3>
            </div>
            <Link
              to="/admin/certificates"
              className="flex items-center gap-1 text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors"
            >
              सर्व पहा <ArrowRight size={12} />
            </Link>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">अर्ज क्र.</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">प्रमाणपत्र</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">अर्जदार</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">रक्कम</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">UTR</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">कृती</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {pendingPayments.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300">
                          {app.applicationNo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{app.certificateType?.nameMarathi}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">{app.applicantName}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200">₹{app.payment?.amount || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{app.payment?.utrNumber || "—"}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to="/admin/certificates"
                          className="inline-flex items-center gap-1 rounded-lg bg-brand-50 dark:bg-brand-500/15 px-3 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-500/25 transition-colors"
                        >
                          <CheckCircle2 size={12} />
                          सत्यापित करा
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
