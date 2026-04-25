import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { citizenService, type CertificateType, type Family, type FamilyMember } from "../../services/citizenService";
import { useTenant } from "../../context/TenantContext";
import { motion, AnimatePresence } from "framer-motion";
import { compressImage, COMPRESS_PRESETS } from "../../utils/imageCompression";

/* ─── Photo upload config per cert code ──────────────── */
interface PhotoFieldDef {
  key: string;
  label: string;
  required: boolean;
}

function getPhotoFields(code: string): PhotoFieldDef[] {
  switch (code) {
    case "living":
      return [{ key: "photo", label: "अर्जदाराचा फोटो / Applicant Photo", required: true }];
    case "marriage":
      return [
        { key: "groomPhoto", label: "वराचा फोटो / Groom Photo", required: true },
        { key: "bridePhoto", label: "वधूचा फोटो / Bride Photo", required: true },
      ];
    case "residence":
      return [{ key: "photo", label: "अर्जदाराचा फोटो / Applicant Photo", required: true }];
    case "widow":
      return [{ key: "photo", label: "अर्जदाराचा फोटो / Applicant Photo", required: true }];
    case "birth":
      return [{ key: "hospitalDoc", label: "रुग्णालय दाखला / Hospital Document", required: false }];
    case "death":
      return [{ key: "deathDoc", label: "मृत्यू दाखला / Death Document", required: false }];
    case "niradhar":
      return [
        { key: "photo", label: "अर्जदाराचा फोटो / Applicant Photo", required: true },
        { key: "incomeProof", label: "उत्पन्नाचा दाखला / Income Proof", required: false },
      ];
    case "deserted":
      return [{ key: "photo", label: "अर्जदाराचा फोटो / Applicant Photo", required: true }];
    case "bpl":
      return [
        { key: "rationCard", label: "रेशन कार्ड / Ration Card", required: true },
        { key: "incomeProof", label: "उत्पन्नाचा दाखला / Income Certificate", required: false },
      ];
    default:
      return [];
  }
}

/* ─── Certificate field definitions per code ──────────────── */
interface FieldDef {
  name: string;
  label: string;
  type: "text" | "date" | "number" | "select" | "textarea";
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

function getCertificateFields(code: string): FieldDef[] {
  switch (code) {
    case "birth":
      return [
        { name: "childName", label: "बालकाचे नाव / Child Name", type: "text", required: true, placeholder: "बालकाचे पूर्ण नाव" },
        { name: "dateOfBirth", label: "जन्म तारीख / Date of Birth", type: "date", required: true },
        { name: "placeOfBirth", label: "जन्म ठिकाण / Place of Birth", type: "text", required: true, placeholder: "उदा. ग्रामीण रुग्णालय" },
        { name: "gender", label: "लिंग / Gender", type: "select", required: true, options: ["पुरुष / Male", "स्त्री / Female", "इतर / Other"] },
        { name: "fatherName", label: "वडिलांचे नाव / Father's Name", type: "text", required: true },
        { name: "motherName", label: "आईचे नाव / Mother's Name", type: "text", required: true },
        { name: "religion", label: "धर्म / Religion", type: "text", placeholder: "हिंदू / मुस्लिम / ख्रिश्चन" },
        { name: "nationality", label: "राष्ट्रीयत्व / Nationality", type: "text", placeholder: "भारतीय" },
        { name: "hospitalName", label: "रुग्णालयाचे नाव / Hospital Name", type: "text", placeholder: "रुग्णालय / घरी" },
        { name: "informantName", label: "माहिती देणाऱ्याचे नाव / Informant", type: "text", required: true },
      ];
    case "death":
      return [
        { name: "deceasedName", label: "मृत व्यक्तीचे नाव / Deceased Name", type: "text", required: true },
        { name: "dateOfDeath", label: "मृत्यू तारीख / Date of Death", type: "date", required: true },
        { name: "placeOfDeath", label: "मृत्यू ठिकाण / Place of Death", type: "text", required: true },
        { name: "causeOfDeath", label: "मृत्यूचे कारण / Cause of Death", type: "text", required: true },
        { name: "gender", label: "लिंग / Gender", type: "select", required: true, options: ["पुरुष / Male", "स्त्री / Female", "इतर / Other"] },
        { name: "age", label: "वय / Age", type: "number", required: true, placeholder: "वर्षे" },
        { name: "fatherOrSpouseName", label: "वडील/पती-पत्नी / Father/Spouse Name", type: "text", required: true },
        { name: "permanentAddress", label: "कायमचा पत्ता / Permanent Address", type: "textarea" },
        { name: "informantName", label: "माहिती देणारा / Informant", type: "text", required: true },
      ];
    case "marriage":
      return [
        { name: "groomName", label: "वराचे नाव / Groom Name", type: "text", required: true },
        { name: "groomDob", label: "वराची जन्मतारीख / Groom DOB", type: "date", required: true },
        { name: "groomReligion", label: "वराचा धर्म / Groom Religion", type: "text" },
        { name: "groomAddress", label: "वराचा पत्ता / Groom Address", type: "textarea" },
        { name: "brideName", label: "वधूचे नाव / Bride Name", type: "text", required: true },
        { name: "brideDob", label: "वधूची जन्मतारीख / Bride DOB", type: "date", required: true },
        { name: "brideReligion", label: "वधूचा धर्म / Bride Religion", type: "text" },
        { name: "brideAddress", label: "वधूचा पत्ता / Bride Address", type: "textarea" },
        { name: "marriageDate", label: "विवाह तारीख / Marriage Date", type: "date", required: true },
        { name: "marriagePlace", label: "विवाह ठिकाण / Marriage Place", type: "text", required: true },
        { name: "witness1", label: "साक्षीदार १ / Witness 1", type: "text", required: true },
        { name: "witness2", label: "साक्षीदार २ / Witness 2", type: "text", required: true },
      ];
    case "residence":
      return [
        { name: "currentAddress", label: "सध्याचा पत्ता / Current Address", type: "textarea", required: true },
        { name: "residingSince", label: "कधीपासून राहत आहात / Residing Since", type: "date", required: true },
        { name: "purpose", label: "प्रमाणपत्राचा उद्देश / Purpose", type: "text", required: true, placeholder: "उदा. शाळा प्रवेश, नोकरी" },
        { name: "wardNo", label: "प्रभाग क्र. / Ward No", type: "text" },
      ];
    case "bpl":
      return [
        { name: "ratioCardNo", label: "रेशन कार्ड क्र. / Ration Card No", type: "text", required: true },
        { name: "bplCardNo", label: "बीपीएल कार्ड क्र. / BPL Card No", type: "text" },
        { name: "annualIncome", label: "वार्षिक उत्पन्न / Annual Income (₹)", type: "number", required: true, placeholder: "₹" },
        { name: "occupation", label: "व्यवसाय / Occupation", type: "text", required: true },
        { name: "familyMembersCount", label: "कुटुंब सदस्य संख्या / Family Members", type: "number", required: true },
        { name: "purpose", label: "उद्देश / Purpose", type: "text", required: true },
      ];
    case "living":
      return [
        { name: "purpose", label: "उद्देश / Purpose", type: "text", required: true, placeholder: "हयातीचा दाखला कशासाठी हवा आहे" },
        { name: "currentAddress", label: "सध्याचा पत्ता / Current Address", type: "textarea", required: true },
        { name: "identificationMark", label: "ओळखचिन्ह / Identification Mark", type: "text" },
      ];
    case "no_dues":
      return [
        { name: "propertyType", label: "मालमत्ता प्रकार / Property Type", type: "select", required: true, options: ["घर / House", "दुकान / Shop", "जमीन / Land", "इतर / Other"] },
        { name: "propertyNo", label: "मालमत्ता क्र. / Property No", type: "text", placeholder: "घर / गट क्रमांक" },
        { name: "wardNo", label: "प्रभाग क्र. / Ward No", type: "text" },
        { name: "purpose", label: "उद्देश / Purpose", type: "text", required: true },
      ];
    case "toilet":
      return [
        { name: "constructionYear", label: "बांधकाम वर्ष / Construction Year", type: "number", required: true, placeholder: "2024" },
        { name: "toiletType", label: "शौचालय प्रकार / Toilet Type", type: "select", required: true, options: ["सेप्टिक टँक / Septic Tank", "पिट / Pit", "ट्विन पिट / Twin Pit", "सुलभ / Sulabh"] },
        { name: "wardNo", label: "प्रभाग क्र. / Ward No", type: "text" },
        { name: "purpose", label: "उद्देश / Purpose", type: "text", required: true, placeholder: "उदा. अनुदान, मागणी" },
      ];
    case "niradhar":
      return [
        { name: "age", label: "वय / Age", type: "number", required: true },
        { name: "reason", label: "निराधार असण्याचे कारण / Reason", type: "textarea", required: true, placeholder: "कारण तपशीलवार लिहा" },
        { name: "annualIncome", label: "वार्षिक उत्पन्न / Annual Income (₹)", type: "number", required: true },
        { name: "occupation", label: "व्यवसाय / Occupation", type: "text" },
        { name: "bankName", label: "बँक नाव / Bank Name", type: "text" },
        { name: "accountNo", label: "खाते क्र. / Account No", type: "text" },
        { name: "ifscCode", label: "IFSC कोड", type: "text" },
      ];
    case "widow":
      return [
        { name: "husbandName", label: "पतीचे नाव / Husband Name", type: "text", required: true },
        { name: "husbandDeathDate", label: "पतीचा मृत्यू तारीख / Husband Death Date", type: "date", required: true },
        { name: "marriageDate", label: "विवाह तारीख / Marriage Date", type: "date" },
        { name: "childrenCount", label: "मुलांची संख्या / No of Children", type: "number" },
        { name: "annualIncome", label: "वार्षिक उत्पन्न / Annual Income (₹)", type: "number", required: true },
        { name: "bankName", label: "बँक नाव / Bank Name", type: "text" },
        { name: "accountNo", label: "खाते क्र. / Account No", type: "text" },
        { name: "ifscCode", label: "IFSC कोड", type: "text" },
      ];
    case "deserted":
      return [
        { name: "husbandName", label: "पतीचे नाव / Husband Name", type: "text", required: true },
        { name: "desertionDate", label: "परित्याग तारीख / Desertion Date", type: "date", required: true },
        { name: "desertionReason", label: "परित्यागाचे कारण / Reason", type: "textarea", required: true },
        { name: "childrenCount", label: "मुलांची संख्या / No of Children", type: "number" },
        { name: "annualIncome", label: "वार्षिक उत्पन्न / Annual Income (₹)", type: "number", required: true },
        { name: "bankName", label: "बँक नाव / Bank Name", type: "text" },
        { name: "accountNo", label: "खाते क्र. / Account No", type: "text" },
        { name: "ifscCode", label: "IFSC कोड", type: "text" },
      ];
    case "nuclear_family":
      return [
        { name: "familyMembersCount", label: "कुटुंबातील एकूण सदस्य / Total Members", type: "number", required: true },
        { name: "purpose", label: "उद्देश / Purpose", type: "text", required: true, placeholder: "उदा. शासकीय योजना, शाळा" },
        { name: "wardNo", label: "प्रभाग क्र. / Ward No", type: "text" },
      ];
    default:
      return [
        { name: "purpose", label: "उद्देश / Purpose", type: "text", required: true },
        { name: "remarks", label: "शेरा / Remarks", type: "textarea" },
      ];
  }
}

export default function ApplyCertificate() {
  const { certTypeId } = useParams();
  const navigate = useNavigate();
  const { village } = useTenant();

  const [certType, setCertType] = useState<CertificateType | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [applicantName, setApplicantName] = useState("");
  const [applicantAadhar, setApplicantAadhar] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: select family, 2: fill form

  // Photo upload states
  const [photoFiles, setPhotoFiles] = useState<Record<string, File | null>>({});
  const [photoPreviews, setPhotoPreviews] = useState<Record<string, string>>({});
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const selectedFamily = useMemo(() => families.find((f) => f.id === selectedFamilyId), [families, selectedFamilyId]);
  const fields = useMemo(() => (certType ? getCertificateFields(certType.code) : []), [certType]);
  const photoFields = useMemo(() => (certType ? getPhotoFields(certType.code) : []), [certType]);

  useEffect(() => {
    const load = async () => {
      try {
        const [typesRes, famRes] = await Promise.all([
          citizenService.getCertificateTypes(),
          citizenService.getFamilies(),
        ]);
        const ct = (typesRes.data || []).find((t: CertificateType) => t.id === certTypeId);
        setCertType(ct || null);
        const fams = famRes.data || [];
        setFamilies(fams);
        if (fams.length === 1) {
          setSelectedFamilyId(fams[0].id);
          setApplicantName(fams[0].headName);
          setApplicantAadhar(fams[0].headAadhar);
        }
      } catch {
        setError("माहिती लोड करता आली नाही");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [certTypeId]);

  // Auto-fill on member select
  const handleMemberChange = useCallback((memberId: string) => {
    setSelectedMemberId(memberId);
    if (!selectedFamily) return;
    if (memberId === "") {
      // Head selected
      setApplicantName(selectedFamily.headName);
      setApplicantAadhar(selectedFamily.headAadhar);
    } else if (memberId === "__head__") {
      setApplicantName(selectedFamily.headName);
      setApplicantAadhar(selectedFamily.headAadhar);
    } else {
      const member = selectedFamily.members?.find((m: FamilyMember) => m.id === memberId);
      if (member) {
        setApplicantName(member.name);
        setApplicantAadhar(member.aadhar);
      }
    }
  }, [selectedFamily]);

  const handleFamilySelect = (famId: string) => {
    setSelectedFamilyId(famId);
    setSelectedMemberId("");
    const fam = families.find((f) => f.id === famId);
    if (fam) {
      setApplicantName(fam.headName);
      setApplicantAadhar(fam.headAadhar);
    }
  };

  const [compressingKey, setCompressingKey] = useState<string | null>(null);
  const [fileSizes, setFileSizes] = useState<Record<string, { original: number; compressed: number }>>({});

  const handlePhotoChange = async (key: string, file: File | null) => {
    if (file) {
      setCompressingKey(key);
      const originalSize = file.size;
      // Compress before storing
      const preset = key.includes("Doc") || key.includes("Proof") || key.includes("Card")
        ? COMPRESS_PRESETS.document
        : COMPRESS_PRESETS.photo;
      const compressed = await compressImage(file, preset);
      setPhotoFiles((prev) => ({ ...prev, [key]: compressed }));
      setFileSizes((prev) => ({ ...prev, [key]: { original: originalSize, compressed: compressed.size } }));
      // Generate preview from compressed file
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreviews((prev) => ({ ...prev, [key]: e.target?.result as string }));
      reader.readAsDataURL(compressed);
      setCompressingKey(null);
    } else {
      setPhotoFiles((prev) => ({ ...prev, [key]: null }));
      setPhotoPreviews((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setFileSizes((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!village || !certType) return;

    // Validate required photos
    for (const pf of photoFields) {
      if (pf.required && !photoFiles[pf.key]) {
        setError(`कृपया फोटो अपलोड करा: ${pf.label}`);
        return;
      }
    }

    setSubmitting(true);
    setError("");
    try {
      // Upload photos first if any
      let documents: string[] = [];
      const filesToUpload = Object.values(photoFiles).filter(Boolean) as File[];
      if (filesToUpload.length > 0) {
        setUploadingPhotos(true);
        const uploadRes = await citizenService.uploadImages("certificate-photo", filesToUpload);
        documents = (uploadRes.data?.images || []).map((img: { url: string }) => img.url);
        setUploadingPhotos(false);
      }

      const payload = {
        villageId: village.id,
        familyId: selectedFamilyId,
        familyMemberId: selectedMemberId && selectedMemberId !== "__head__" ? selectedMemberId : undefined,
        certificateTypeId: certType.id,
        applicantName,
        applicantAadhar,
        formData,
        documents,
      };
      const res = await citizenService.applyCertificate(payload);
      const app = res.data;
      if (certType.fee > 0 && app?.id) {
        navigate(`/citizen/payment/${app.id}`);
      } else if (app?.id) {
        navigate(`/citizen/applications/${app.id}`);
      } else {
        navigate("/citizen/applications");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.response?.data?.message || "अर्ज सादर करता आला नाही");
    } finally {
      setSubmitting(false);
      setUploadingPhotos(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-xl w-1/3" />
        <div className="h-48 bg-gray-100 rounded-2xl" />
        <div className="h-48 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (!certType) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
        </div>
        <h2 className="font-bold text-gray-700 mb-1">प्रमाणपत्र प्रकार सापडला नाही</h2>
        <p className="text-sm text-gray-400 mb-4">कृपया सेवा पृष्ठावरून निवड करा</p>
        <button onClick={() => navigate("/citizen/services")} className="bg-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm">सेवा पहा</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/citizen/services")} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex-1">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">{certType.nameMarathi}</h1>
          <p className="text-sm text-gray-400">{certType.nameEnglish}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-3 py-1.5 rounded-xl font-bold ${certType.fee > 0 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
            {certType.fee > 0 ? `₹${certType.fee}/-` : "निशुल्क"}
          </span>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step >= s ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25" : "bg-gray-100 text-gray-400"
            }`}>{s}</div>
            <span className={`text-xs font-semibold hidden sm:block ${step >= s ? "text-gray-800" : "text-gray-400"}`}>
              {s === 1 ? "कुटुंब निवडा" : "अर्ज भरा"}
            </span>
            {s < 2 && <div className={`flex-1 h-0.5 rounded-full ${step > 1 ? "bg-orange-400" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-4 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 1: Family & Member Selection */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">कुटुंब व सदस्य निवडा</h2>

            {families.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400 mb-3">कुटुंब नोंदणी आवश्यक आहे</p>
                <button onClick={() => navigate("/citizen/family")} className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">कुटुंब नोंदणी</button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Family select */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">कुटुंब *</label>
                  <select
                    value={selectedFamilyId}
                    onChange={(e) => handleFamilySelect(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none transition-all text-sm"
                  >
                    <option value="">— कुटुंब निवडा —</option>
                    {families.map((f) => (
                      <option key={f.id} value={f.id}>{f.headName} (कु. क्र. {f.familyId})</option>
                    ))}
                  </select>
                </div>

                {/* Member select */}
                {selectedFamily && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">अर्जदार (सदस्य) *</label>
                    <select
                      value={selectedMemberId}
                      onChange={(e) => handleMemberChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none transition-all text-sm"
                    >
                      <option value="__head__">{selectedFamily.headName} (कुटुंब प्रमुख)</option>
                      {selectedFamily.members?.map((m: FamilyMember) => (
                        <option key={m.id} value={m.id}>{m.name} ({m.relation})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Applicant info preview */}
                {selectedFamilyId && (
                  <div className="bg-orange-50/60 rounded-xl px-4 py-3 mt-2">
                    <p className="text-xs text-orange-600 font-medium mb-1">अर्जदार माहिती</p>
                    <p className="text-sm font-semibold text-gray-800">{applicantName}</p>
                    <p className="text-xs text-gray-500">आधार: {applicantAadhar}</p>
                  </div>
                )}

                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedFamilyId}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  पुढे जा →
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Step 2: Certificate Form */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Applicant card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 text-sm">अर्जदार माहिती</h3>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-orange-500 font-semibold hover:underline">बदला</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">नाव *</label>
                  <input
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">आधार *</label>
                  <input
                    value={applicantAadhar}
                    onChange={(e) => setApplicantAadhar(e.target.value)}
                    required
                    pattern="\d{12}"
                    maxLength={12}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic fields */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-4">{certType.nameMarathi} — तपशील</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map((field) => (
                  <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      {field.label}{field.required && " *"}
                    </label>
                    {field.type === "select" ? (
                      <select
                        value={formData[field.name] || ""}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        required={field.required}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none text-sm"
                      >
                        <option value="">— निवडा —</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        value={formData[field.name] || ""}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        required={field.required}
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none text-sm resize-none"
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={formData[field.name] || ""}
                        onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                        required={field.required}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Photo Upload Section */}
            {photoFields.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 text-sm mb-1 flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  फोटो अपलोड करा
                </h3>
                <p className="text-xs text-gray-400 mb-4">JPG, PNG किंवा WebP फॉरमॅट — स्वयंचलित संकुचन (auto-compressed)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {photoFields.map((pf) => (
                    <div key={pf.key}>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                        {pf.label}{pf.required && " *"}
                      </label>
                      <input
                        ref={(el) => { fileInputRefs.current[pf.key] = el; }}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handlePhotoChange(pf.key, e.target.files?.[0] || null)}
                      />
                      {photoPreviews[pf.key] ? (
                        <div className="relative group">
                          <img
                            src={photoPreviews[pf.key]}
                            alt={pf.label}
                            className="w-full h-36 object-cover rounded-xl border border-gray-200"
                          />
                          <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputRefs.current[pf.key]?.click()}
                              className="bg-white text-gray-700 text-xs px-3 py-1.5 rounded-lg font-semibold"
                            >
                              बदला
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handlePhotoChange(pf.key, null);
                                if (fileInputRefs.current[pf.key]) fileInputRefs.current[pf.key]!.value = "";
                              }}
                              className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg font-semibold"
                            >
                              काढा
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[pf.key]?.click()}
                          className="w-full h-36 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-orange-300 hover:bg-orange-50/30 transition-colors cursor-pointer"
                        >
                          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-3 3m3-3l3 3M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span className="text-xs text-gray-400 font-medium">फोटो निवडा</span>
                        </button>
                      )}
                      {compressingKey === pf.key && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                          <span className="text-[10px] text-orange-500 font-medium">संकुचन होत आहे...</span>
                        </div>
                      )}
                      {photoFiles[pf.key] && !compressingKey && (
                        <div className="mt-1 space-y-0.5">
                          <p className="text-[10px] text-gray-400 truncate">{photoFiles[pf.key]!.name}</p>
                          {fileSizes[pf.key] && fileSizes[pf.key].original !== fileSizes[pf.key].compressed && (
                            <p className="text-[10px] text-emerald-500 font-medium">
                              ✓ {(fileSizes[pf.key].original / 1024).toFixed(0)}KB → {(fileSizes[pf.key].compressed / 1024).toFixed(0)}KB
                              ({Math.round((1 - fileSizes[pf.key].compressed / fileSizes[pf.key].original) * 100)}% कमी)
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fee notice */}
            {certType.fee > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-center gap-3">
                <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-sm text-amber-700">
                  या प्रमाणपत्रासाठी <strong>₹{certType.fee}/-</strong> शुल्क आहे. अर्ज सादर केल्यानंतर पेमेंट पृष्ठावर जाल.
                </p>
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="px-5 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
                ← मागे
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {submitting ? (uploadingPhotos ? "फोटो अपलोड होत आहेत..." : "अर्ज सादर होत आहे...") : certType.fee > 0 ? "अर्ज सादर करा → पेमेंट" : "अर्ज सादर करा"}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Documents info */}
      {certType.requiredDocuments && certType.requiredDocuments.length > 0 && (
        <div className="mt-6 bg-blue-50/60 rounded-2xl px-5 py-4 border border-blue-100">
          <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
            आवश्यक कागदपत्रे
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {certType.requiredDocuments.map((doc, i) => (
              <span key={i} className="text-xs bg-blue-100/60 text-blue-700 px-2.5 py-1 rounded-lg">{doc}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
