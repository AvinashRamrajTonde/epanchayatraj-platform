import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { citizenService, type Family, type FamilyMember } from "../../services/citizenService";
import { useTenant } from "../../context/TenantContext";
import { motion, AnimatePresence } from "framer-motion";

const RELATIONS = [
  "पती / Husband", "पत्नी / Wife", "मुलगा / Son", "मुलगी / Daughter",
  "वडील / Father", "आई / Mother", "भाऊ / Brother", "बहीण / Sister",
  "आजोबा / Grandfather", "आजी / Grandmother", "इतर / Other",
];

export default function FamilyManagement() {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const { village } = useTenant();

  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Registration form
  const [regForm, setRegForm] = useState({ headName: "", headDob: "", headAadhar: "", headRationCard: "", headVoterId: "" });
  // Member form
  const [memberForm, setMemberForm] = useState({ name: "", dob: "", aadhar: "", voterId: "", relation: "" });

  const loadFamilies = useCallback(async () => {
    try {
      const res = await citizenService.getFamilies();
      const list = res.data || [];
      setFamilies(list);
      if (familyId) {
        const fam = list.find((f: Family) => f.id === familyId);
        if (fam) setSelectedFamily(fam);
        else {
          const detail = await citizenService.getFamily(familyId);
          setSelectedFamily(detail.data);
        }
      } else if (list.length === 1) {
        navigate(`/citizen/family/${list[0].id}`, { replace: true });
      }
    } catch {
      setError("कुटुंब माहिती लोड करता आली नाही");
    } finally {
      setLoading(false);
    }
  }, [familyId, navigate]);

  useEffect(() => { loadFamilies(); }, [loadFamilies]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!village) return setError("गाव माहिती उपलब्ध नाही");
    setSubmitting(true);
    setError("");
    try {
      await citizenService.registerFamily({ ...regForm, villageId: village.id });
      setSuccess("कुटुंब नोंदणी यशस्वी!");
      setShowRegister(false);
      setRegForm({ headName: "", headDob: "", headAadhar: "", headRationCard: "", headVoterId: "" });
      loadFamilies();
    } catch (err: any) {
      setError(err?.response?.data?.error || "नोंदणी अयशस्वी");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFamily) return;
    setSubmitting(true);
    setError("");
    try {
      if (editingMember) {
        await citizenService.updateFamilyMember(editingMember.id, memberForm);
        setSuccess("सदस्य माहिती अद्ययावत केली!");
      } else {
        await citizenService.addFamilyMember(selectedFamily.id, memberForm);
        setSuccess("सदस्य जोडला गेला!");
      }
      setShowAddMember(false);
      setEditingMember(null);
      setMemberForm({ name: "", dob: "", aadhar: "", voterId: "", relation: "" });
      const detail = await citizenService.getFamily(selectedFamily.id);
      setSelectedFamily(detail.data);
      loadFamilies();
    } catch (err: any) {
      setError(err?.response?.data?.error || "अयशस्वी");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm("हा सदस्य काढून टाकायचा आहे का?")) return;
    try {
      await citizenService.deleteFamilyMember(memberId);
      setSuccess("सदस्य काढला गेला");
      if (selectedFamily) {
        const detail = await citizenService.getFamily(selectedFamily.id);
        setSelectedFamily(detail.data);
      }
    } catch {
      setError("सदस्य काढणे अयशस्वी");
    }
  };

  const openEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setMemberForm({ name: member.name, dob: member.dob.split("T")[0], aadhar: member.aadhar, voterId: member.voterId || "", relation: member.relation });
    setShowAddMember(true);
  };

  // Clear messages after 4s
  useEffect(() => { if (success || error) { const t = setTimeout(() => { setSuccess(""); setError(""); }, 4000); return () => clearTimeout(t); } }, [success, error]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-xl w-1/3" />
          <div className="h-36 bg-gray-100 rounded-2xl" />
          <div className="h-36 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Toast messages */}
      <AnimatePresence>
        {(success || error) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold ${
              success ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {success || error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {selectedFamily && (
            <button onClick={() => { setSelectedFamily(null); navigate("/citizen/family"); }} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              {selectedFamily ? "कुटुंब तपशील" : "कुटुंब व्यवस्थापन"}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {selectedFamily ? `कुटुंब क्र. ${selectedFamily.familyId}` : `${families.length} — नोंदणीकृत कुटुंबे`}
            </p>
          </div>
        </div>
        {!selectedFamily && (
          <button
            onClick={() => setShowRegister(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            कुटुंब नोंदणी
          </button>
        )}
      </div>

      {/* Family List */}
      {!selectedFamily && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {families.length === 0 && !showRegister ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h3 className="font-bold text-gray-700 mb-1">कुटुंब नोंदणी केलेली नाही</h3>
              <p className="text-sm text-gray-400 mb-4">प्रमाणपत्रासाठी अर्ज करण्यासाठी प्रथम कुटुंब नोंदणी करा</p>
              <button onClick={() => setShowRegister(true)} className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/25">
                कुटुंब नोंदणी करा
              </button>
            </div>
          ) : (
            families.map((fam) => (
              <motion.button
                key={fam.id}
                onClick={() => navigate(`/citizen/family/${fam.id}`)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-white rounded-2xl border border-gray-100 p-5 text-left hover:shadow-lg shadow-emerald-500/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold text-lg flex-shrink-0">
                    {fam.headName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900">{fam.headName}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-400">
                      <span>कुटुंब क्र. {fam.familyId}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{fam.members?.length || 0} सदस्य</span>
                      {fam._count?.certificates != null && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span>{fam._count.certificates} अर्ज</span>
                        </>
                      )}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </div>
              </motion.button>
            ))
          )}
        </motion.div>
      )}

      {/* Family Detail */}
      {selectedFamily && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Head Info */}
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl font-bold">
                  {selectedFamily.headName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{selectedFamily.headName}</h2>
                  <p className="text-emerald-100 text-sm">कुटुंब प्रमुख • कुटुंब क्र. {selectedFamily.familyId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "जन्म तारीख", value: new Date(selectedFamily.headDob).toLocaleDateString("mr-IN") },
                  { label: "आधार", value: selectedFamily.headAadhar?.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3") },
                  { label: "रेशन कार्ड", value: selectedFamily.headRationCard || "—" },
                  { label: "मतदार ओळखपत्र", value: selectedFamily.headVoterId || "—" },
                ].map((info) => (
                  <div key={info.label} className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2">
                    <p className="text-emerald-100 text-[10px] uppercase tracking-wider">{info.label}</p>
                    <p className="font-semibold text-sm mt-0.5 truncate">{info.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">कुटुंब सदस्य</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedFamily.members?.length || 0} सदस्य</p>
              </div>
              <button
                onClick={() => { setEditingMember(null); setMemberForm({ name: "", dob: "", aadhar: "", voterId: "", relation: "" }); setShowAddMember(true); }}
                className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                सदस्य जोडा
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {(!selectedFamily.members || selectedFamily.members.length === 0) ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  कुटुंबात सदस्य जोडलेले नाहीत
                </div>
              ) : (
                selectedFamily.members.map((m) => (
                  <div key={m.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-sm flex-shrink-0">
                      {m.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-400 mt-0.5">
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md font-medium">{m.relation}</span>
                        <span>आधार: {m.aadhar}</span>
                        <span>DOB: {new Date(m.dob).toLocaleDateString("mr-IN")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditMember(m)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => handleDeleteMember(m.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Register Family Modal */}
      <AnimatePresence>
        {showRegister && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="px-6 pt-6 pb-4 border-b sticky top-0 bg-white rounded-t-3xl z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">कुटुंब नोंदणी</h2>
                  <button onClick={() => setShowRegister(false)} className="p-2 rounded-xl hover:bg-gray-100">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
              <form onSubmit={handleRegister} className="p-6 space-y-4">
                {village && (
                  <div className="bg-emerald-50 rounded-xl px-4 py-3 flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <div>
                      <p className="text-xs text-emerald-600 font-medium">गाव</p>
                      <p className="text-sm font-bold text-emerald-800">{village.name}</p>
                    </div>
                  </div>
                )}
                {[
                  { label: "कुटुंब प्रमुखाचे नाव *", key: "headName", type: "text", placeholder: "पूर्ण नाव", required: true },
                  { label: "जन्म तारीख *", key: "headDob", type: "date", required: true },
                  { label: "आधार क्रमांक *", key: "headAadhar", type: "text", placeholder: "12 अंकी आधार", required: true, pattern: "\\d{12}", maxLength: 12 },
                  { label: "रेशन कार्ड क्रमांक", key: "headRationCard", type: "text", placeholder: "रेशन कार्ड क्रमांक" },
                  { label: "मतदार ओळखपत्र क्रमांक", key: "headVoterId", type: "text", placeholder: "मतदार ओळखपत्र" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>
                    <input
                      type={field.type}
                      value={(regForm as any)[field.key]}
                      onChange={(e) => setRegForm({ ...regForm, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      required={field.required}
                      pattern={field.pattern}
                      maxLength={field.maxLength}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all text-sm"
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {submitting ? "नोंदणी होत आहे..." : "कुटुंब नोंदणी करा"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add / Edit Member Modal */}
      <AnimatePresence>
        {showAddMember && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="px-6 pt-6 pb-4 border-b sticky top-0 bg-white rounded-t-3xl z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">{editingMember ? "सदस्य संपादन" : "सदस्य जोडा"}</h2>
                  <button onClick={() => { setShowAddMember(false); setEditingMember(null); }} className="p-2 rounded-xl hover:bg-gray-100">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
              <form onSubmit={handleAddMember} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">नाते *</label>
                  <select
                    value={memberForm.relation}
                    onChange={(e) => setMemberForm({ ...memberForm, relation: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all text-sm"
                  >
                    <option value="">— नाते निवडा —</option>
                    {RELATIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                {[
                  { label: "नाव *", key: "name", type: "text", placeholder: "पूर्ण नाव", required: true },
                  { label: "जन्म तारीख *", key: "dob", type: "date", required: true },
                  { label: "आधार क्रमांक *", key: "aadhar", type: "text", placeholder: "12 अंकी आधार", required: true, pattern: "\\d{12}", maxLength: 12 },
                  { label: "मतदार ओळखपत्र", key: "voterId", type: "text", placeholder: "मतदार ओळखपत्र" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>
                    <input
                      type={field.type}
                      value={(memberForm as any)[field.key]}
                      onChange={(e) => setMemberForm({ ...memberForm, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      required={field.required}
                      pattern={field.pattern}
                      maxLength={field.maxLength}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all text-sm"
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {submitting ? "कृपया प्रतीक्षा करा..." : editingMember ? "अद्ययावत करा" : "सदस्य जोडा"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
