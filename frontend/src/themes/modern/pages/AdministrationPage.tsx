import { useEffect, useState } from "react";
import { publicService, type Member } from "../../../services/publicService";
import { resolveUrl } from "../../../utils/resolveUrl";

const STAFF_TYPES = ["staff", "computer_operator", "pump_operator", "safai_kamgar", "peon", "other_staff"];

const TYPES = [
  { value: "", label: "सर्व" },
  { value: "sarpanch", label: "सरपंच" },
  { value: "upsarpanch", label: "उपसरपंच" },
  { value: "grampanchayat_adhikari", label: "ग्रामपंचायत अधिकारी" },
  { value: "gramsevak", label: "ग्रामसेवक" },
  { value: "leader", label: "पदाधिकारी" },
  { value: "member", label: "सदस्य" },
  { value: "staff", label: "कर्मचारी" },
];

const TYPE_LABEL: Record<string, string> = {
  sarpanch: "सरपंच",
  upsarpanch: "उपसरपंच",
  grampanchayat_adhikari: "ग्रामपंचायत अधिकारी",
  gramsevak: "ग्रामसेवक",
  leader: "पदाधिकारी",
  member: "सदस्य",
  staff: "कर्मचारी",
  computer_operator: "संगणक परिचालक",
  pump_operator: "पाणीपुरवठा कर्मचारी",
  safai_kamgar: "सफाई कामगार",
  peon: "शिपाई",
  other_staff: "इतर कर्मचारी",
};

export default function AdministrationPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [allMembers, setAllMembers] = useState<Member[]>([]);

  useEffect(() => {
    publicService
      .getMembers()
      .then((data) => {
        setAllMembers(data);
        setMembers(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!filter) {
      setMembers(allMembers);
    } else if (filter === "staff") {
      // Match all staff sub-types
      setMembers(allMembers.filter((m) => STAFF_TYPES.includes(m.type)));
    } else {
      setMembers(allMembers.filter((m) => m.type === filter));
    }
  }, [filter, allMembers]);

  return (
    <>
      <section className="bg-gradient-to-br from-teal-700 to-indigo-800 py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white">प्रशासन</h1>
          <p className="text-teal-200 mt-2">ग्रामपंचायतीचे लोकप्रतिनिधी व कर्मचारी</p>
        </div>
      </section>

      <section className="py-12 bg-slate-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4">
          {/* Type Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setFilter(t.value)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === t.value
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : members.filter((m) => m.isActive).length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-lg font-bold text-slate-600">सदस्य सापडले नाहीत</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {members.filter((m) => m.isActive).map((m) => (
                <div key={m.id} className="bg-white rounded-2xl border border-slate-100 p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                    {m.photoUrl ? (
                      <img src={resolveUrl(m.photoUrl)} alt={m.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <svg className="w-12 h-12 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-800">{m.name}</h3>
                  <p className="text-sm text-teal-600 mt-0.5">{m.designation}</p>
                  {m.type && <span className="inline-block bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded mt-2">{TYPE_LABEL[m.type] || m.type}</span>}
                  {m.phone && <p className="text-xs text-slate-400 mt-2">{m.phone}</p>}
                  {m.bio && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{m.bio}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
