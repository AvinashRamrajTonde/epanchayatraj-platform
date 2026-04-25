/* ─── Shared certificate field definitions ──────────────── */
export interface FieldDef {
  name: string;
  label: string;
  type: "text" | "date" | "number" | "select" | "textarea";
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

export interface PhotoFieldDef {
  key: string;
  label: string;
  required: boolean;
}

export function getCertificateFields(code: string): FieldDef[] {
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

export function getPhotoFields(code: string): PhotoFieldDef[] {
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
