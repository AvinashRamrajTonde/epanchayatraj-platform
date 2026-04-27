import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import ImageUpload from "../../components/form/ImageUpload";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../icons";
import {
  villageAdminService,
  type Member,
} from "../../services/villageAdminService";

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, openModal, closeModal } = useModal();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const TYPE_TO_DESIGNATION: Record<string, string> = {
    sarpanch: "सरपंच",
    upsarpanch: "उपसरपंच",
    grampanchayat_adhikari: "ग्रामपंचायत अधिकारी",
    gramsevak: "ग्रामसेवक",
    leader: "नेते / पदाधिकारी",
    member: "सदस्य",
    staff: "कर्मचारी",
    computer_operator: "संगणक परिचालक",
    pump_operator: "Pump Operator / पाणीपुरवठा कर्मचारी",
    safai_kamgar: "Safai Kamgar / सफाई कामगार",
    peon: "Peon / शिपाई",
    other_staff: "इतर कर्मचारी",
  };

  const emptyForm = {
    name: "",
    type: "member" as string,
    phone: "",
    email: "",
    photoUrl: "",
    sortOrder: 0,
  };
  const [form, setForm] = useState(emptyForm);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await villageAdminService.getMembers();
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const handleAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    openModal();
  };

  const handleEdit = (member: Member) => {
    setEditingId(member.id);
    setForm({
      name: member.name,
      type: member.type || "member",
      phone: member.phone || "",
      email: member.email || "",
      photoUrl: member.photoUrl || "",
      sortOrder: member.sortOrder,
    });
    setError("");
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("हा सदस्य हटवायचा आहे का?")) return;
    try {
      await villageAdminService.deleteMember(id);
      fetchMembers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    // Client-side validation
    const trimmedName = form.name.trim();
    if (trimmedName.length < 2) {
      setError("नाव किमान 2 अक्षरांचे असावे");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name: trimmedName,
        designation: TYPE_TO_DESIGNATION[form.type] || form.type,
        type: form.type || "member",
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        photoUrl: form.photoUrl || undefined,
        sortOrder: form.sortOrder,
      };

      if (editingId) {
        await villageAdminService.updateMember(editingId, payload);
      } else {
        await villageAdminService.createMember(payload);
      }
      closeModal();
      fetchMembers();
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string; errors?: Array<{ field?: string; message?: string }> } };
      };
      const data = axiosErr.response?.data;
      if (data?.errors && data.errors.length > 0) {
        const fieldErrors = data.errors
          .map((e) => `${e.field ? e.field + ": " : ""}${e.message}`)
          .join("\n");
        setError(fieldErrors);
      } else {
        setError(data?.message || "सदस्य सेव्ह करता आला नाही");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta title="सदस्य | गाव प्रशासन" description="गाव पदाधिकारी व्यवस्थापन" />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
          व्यवस्थापन समिती
        </h2>
        <Button size="sm" onClick={handleAdd} startIcon={<PlusIcon className="size-4" />}>
          सदस्य जोडा
        </Button>
      </div>

      {/* Members Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  #
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  नाव
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  पदनाम
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  फोन
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  स्थिती
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                  कृती
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                    लोड होत आहे...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                    अद्याप सदस्य नाहीत. पहिला सदस्य जोडा.
                  </td>
                </tr>
              ) : (
                members.map((member, index) => (
                  <tr
                    key={member.id}
                    className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {index + 1}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={member.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-500 font-semibold dark:bg-brand-500/15">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                            {member.name}
                          </p>
                          {member.email && (
                            <p className="text-xs text-gray-500">{member.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {member.designation}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {member.phone || "-"}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        size="sm"
                        color={member.isActive ? "success" : "error"}
                      >
                        {member.isActive ? "सक्रिय" : "निष्क्रिय"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(member)}
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="संपादित करा"
                        >
                          <PencilIcon className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="rounded-lg p-1.5 text-error-500 hover:bg-error-50 dark:hover:bg-error-500/15"
                          title="हटवा"
                        >
                          <TrashBinIcon className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[500px] p-6 lg:p-8">
        <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
          {editingId ? "सदस्य संपादित करा" : "सदस्य जोडा"}
        </h3>
        {error && (
          <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/15 dark:text-error-400">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">नाव *</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="सदस्याचे नाव"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">पद</Label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              >
                <optgroup label="── पदाधिकारी ──">
                  <option value="sarpanch">सरपंच</option>
                  <option value="upsarpanch">उपसरपंच</option>
                  <option value="grampanchayat_adhikari">ग्रामपंचायत अधिकारी</option>
                  <option value="gramsevak">ग्रामसेवक</option>
                  <option value="leader">नेते / पदाधिकारी</option>
                  <option value="member">सदस्य</option>
                </optgroup>
                <optgroup label="── कर्मचारी ──">
                  <option value="computer_operator">Computer Operator</option>
                  <option value="pump_operator">Pump Operator / पाणीपुरवठा कर्मचारी</option>
                  <option value="safai_kamgar">Safai Kamgar / सफाई कामगार</option>
                  <option value="peon">Peon / शिपाई</option>
                  <option value="staff">कर्मचारी (सामान्य)</option>
                  <option value="other_staff">इतर कर्मचारी</option>
                </optgroup>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">फोन</Label>
              <Input
                type="text"
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="फोन नंबर"
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
                placeholder="ईमेल"
              />
            </div>
          </div>
          <div>
            <ImageUpload
              label="प्रोफाइल फोटो"
              section="team"
              maxFiles={1}
              value={form.photoUrl}
              onChange={(urls) =>
                setForm((prev) => ({ ...prev, photoUrl: urls[0] || "" }))
              }
              uploadFn={villageAdminService.uploadImages}
              deleteFn={villageAdminService.deleteUploadedImage}
              hint="400×400 आकाराचा फोटो शिफारसीय"
            />
          </div>
          <div>
            <Label htmlFor="sortOrder">क्रम</Label>
            <Input
              type="number"
              id="sortOrder"
              name="sortOrder"
              value={form.sortOrder}
              onChange={handleChange}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={closeModal}>
              रद्द करा
            </Button>
            <Button size="sm" disabled={saving || !form.name}>
              {saving ? "सेव्ह करत आहे..." : editingId ? "अपडेट करा" : "सदस्य जोडा"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
