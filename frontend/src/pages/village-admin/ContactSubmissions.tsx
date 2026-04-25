import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { TrashBinIcon } from "../../icons";
import { villageAdminService } from "../../services/villageAdminService";

interface ContactSubmission {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  subject: string | null;
  message: string;
  status: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, "warning" | "primary" | "success" | "error"> = {
  new: "warning",
  read: "primary",
  replied: "success",
  archived: "error",
};

const STATUS_LABELS: Record<string, string> = {
  new: "नवीन",
  read: "वाचले",
  replied: "उत्तर दिले",
  archived: "संग्रहित",
};

export default function ContactSubmissions() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await villageAdminService.getContactSubmissions({ page, limit: 15 });
      setSubmissions(res.data?.submissions || []);
      setTotalPages(res.pagination?.totalPages || 1);
  
    } catch {
      console.error("Failed to load contact submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [page]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await villageAdminService.updateContactSubmissionStatus(id, status);
      fetchSubmissions();
    } catch {
      alert("स्थिती बदलता आली नाही");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("हा संदेश हटवायचा आहे का?")) return;
    try {
      await villageAdminService.deleteContactSubmission(id);
      fetchSubmissions();
    } catch {
      alert("संदेश हटवता आला नाही");
    }
  };

  const selected = submissions.find((s) => s.id === selectedId);

  return (
    <>
      <PageMeta title="संपर्क संदेश | गाव प्रशासन" />
      <div className="mb-6">
        <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
          संपर्क संदेश
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          वेबसाइट अभ्यागतांनी पाठवलेले संदेश पहा व व्यवस्थापित करा.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="lg:col-span-1">
          {loading ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
              <p className="text-gray-400">लोड होत आहे...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
              <p className="text-gray-400">कोणतेही संदेश उपलब्ध नाहीत.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedId(sub.id)}
                    className={`rounded-xl border bg-white p-4 cursor-pointer transition-colors dark:bg-white/[0.03] ${
                      selectedId === sub.id
                        ? "border-brand-500 ring-1 ring-brand-500"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-800"
                    } ${sub.status === "new" ? "border-l-4 border-l-amber-400" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-800 dark:text-white/90 truncate">
                            {sub.name}
                          </h4>
                          <Badge color={STATUS_COLORS[sub.status] || "warning"}>
                            {STATUS_LABELS[sub.status] || sub.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-0.5">
                          {sub.subject && <span className="font-medium">{sub.subject} — </span>}
                          {sub.message}
                        </p>
                        <div className="flex gap-3 mt-1 text-xs text-gray-400">
                          <span>📞 {sub.phone}</span>
                          {sub.email && <span>✉️ {sub.email}</span>}
                          <span>
                            {new Date(sub.createdAt).toLocaleDateString("mr-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(sub.id);
                        }}
                        className="text-red-400 hover:text-red-600 ml-2 flex-shrink-0"
                        title="हटवा"
                      >
                        <TrashBinIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    मागील
                  </Button>
                  <span className="px-3 py-2 text-sm text-gray-500">
                    {page} / {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    पुढील
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-1">
          {selected ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] sticky top-4">
              <h3 className="font-semibold text-gray-800 dark:text-white/90 text-lg mb-4">
                संदेश तपशील
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">नाव:</span>
                  <p className="text-gray-800 dark:text-white/80 font-medium">
                    {selected.name}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">फोन:</span>
                  <p className="text-gray-800 dark:text-white/80">
                    <a href={`tel:${selected.phone}`} className="text-brand-500 hover:underline">
                      {selected.phone}
                    </a>
                  </p>
                </div>
                {selected.email && (
                  <div>
                    <span className="text-gray-400">ईमेल:</span>
                    <p className="text-gray-800 dark:text-white/80">
                      <a href={`mailto:${selected.email}`} className="text-brand-500 hover:underline">
                        {selected.email}
                      </a>
                    </p>
                  </div>
                )}
                {selected.subject && (
                  <div>
                    <span className="text-gray-400">विषय:</span>
                    <p className="text-gray-800 dark:text-white/80 font-medium">
                      {selected.subject}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-gray-400">संदेश:</span>
                  <p className="text-gray-800 dark:text-white/80 whitespace-pre-wrap mt-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    {selected.message}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">तारीख:</span>
                  <p className="text-gray-800 dark:text-white/80">
                    {new Date(selected.createdAt).toLocaleString("mr-IN")}
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-gray-400 block mb-2">स्थिती बदला:</span>
                  <div className="flex flex-wrap gap-2">
                    {["new", "read", "replied", "archived"].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(selected.id, status)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          selected.status === status
                            ? "bg-brand-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {STATUS_LABELS[status]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
              <p className="text-gray-400 text-sm">
                संदेश पाहण्यासाठी डावीकडील यादीतून निवडा.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
