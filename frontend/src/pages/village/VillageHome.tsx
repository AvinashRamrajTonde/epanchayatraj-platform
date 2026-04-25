import { useTenant } from "../../context/TenantContext";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";

export default function VillageHome() {
  const { village, isLoading, error } = useTenant();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-lg text-gray-500">गाव लोड होत आहे...</p>
      </div>
    );
  }

  if (error || !village) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            गाव सापडले नाही
          </h1>
          <p className="mt-2 text-gray-500">
            {error || "हे गाव अस्तित्वात नाही."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`${village.name} | ग्रामपंचायत`}
        description={`${village.name} ग्रामपंचायत मध्ये स्वागत`}
      />
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-lg mx-auto text-center p-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03]">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90 sm:text-3xl">
              {village.name} मध्ये आपले स्वागत
            </h1>
            <p className="mt-2 text-xl text-brand-500">ग्रामपंचायत</p>

            <div className="mt-6 space-y-3 text-left">
              <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  तहसील
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {village.tehsil.name}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  जिल्हा
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {village.tehsil.district}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  राज्य
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {village.tehsil.state}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  स्थिती
                </span>
                <Badge
                  color={village.status === "active" ? "success" : "error"}
                >
                  {village.status}
                </Badge>
              </div>
            </div>

            <div className="mt-8 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                हे गावाचे सार्वजनिक पोर्टल आहे. पुढील टप्प्यात नागरिक सुविधा जोडल्या जातील.
              </p>
            </div>

            <div className="mt-4">
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                गाव प्रशासन पॅनेल &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
