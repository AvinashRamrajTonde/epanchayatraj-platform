import { useEffect, useState } from "react";
import { publicService } from "../../../services/publicService";
import SeoHead from "../components/SeoHead";
import SectionHero from "../components/SectionHero";
import AnimatedSection, { StaggerContainer, StaggerItem } from "../components/AnimatedSection";

interface ServiceItem {
  name: string;
  description: string;
  icon: string;
  link?: string;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  { name: "तक्रार निवारण", description: "नागरिकांच्या तक्रारी नोंदवा व निराकरण मिळवा", icon: "📝" },
  { name: "रहिवासी प्रमाणपत्र", description: "रहिवासी दाखला मिळवण्यासाठी अर्ज करा", icon: "🏠" },
  { name: "जन्म प्रमाणपत्र", description: "जन्म नोंदणी व प्रमाणपत्र मिळवा", icon: "👶" },
  { name: "मृत्यू प्रमाणपत्र", description: "मृत्यू नोंदणी व प्रमाणपत्र मिळवा", icon: "📄" },
  { name: "विवाह प्रमाणपत्र", description: "विवाह नोंदणी व प्रमाणपत्र मिळवा", icon: "💍" },
  { name: "विविध नमुने (नमुना ८ अ)", description: "ग्रामपंचायत विविध नमुने डाउनलोड करा", icon: "📋" },
  { name: "दारिद्र्य रेषा दाखला", description: "दारिद्र्य रेषेखालील दाखला मिळवा", icon: "📑" },
  { name: "मालमत्ता कर भरणा", description: "ऑनलाइन मालमत्ता कर भरा", icon: "🏦" },
  { name: "पाणीपट्टी भरणा", description: "पाणीपट्टी ऑनलाइन भरा", icon: "💧" },
  { name: "बांधकाम परवानगी", description: "बांधकाम परवानगी अर्ज करा", icon: "🏗️" },
  { name: "माहितीचा अधिकार (RTI)", description: "RTI अर्ज दाखल करा", icon: "📢" },
  { name: "ग्रामसभा तक्रार", description: "ग्रामसभेत तक्रार नोंदवा", icon: "🏛️" },
  { name: "शासकीय योजना मार्गदर्शन", description: "विविध शासकीय योजनांबद्दल माहिती मिळवा", icon: "💡" },
];

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicService
      .getContentSection("services")
      .then((data) => {
        if (data && Array.isArray(data.services) && data.services.length > 0) {
          setServices(data.services);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SeoHead
        title="नागरिक सेवा"
        description="ग्रामपंचायत द्वारे नागरिकांना उपलब्ध असलेल्या सरकारी सेवा"
        path="/services"
      />

      <SectionHero
        title="नागरिक सेवा"
        subtitle="ग्रामपंचायतीमार्फत नागरिकांसाठी उपलब्ध विविध सेवा"
        gradient="from-teal-700 to-cyan-600"
      />

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : (
            <>
              {/* Service Grid */}
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.06}>
                {services.map((svc, idx) => (
                  <StaggerItem key={idx}>
                  <div
                    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 p-6 flex gap-4 items-start hover:-translate-y-1"
                  >
                    <span className="text-3xl flex-shrink-0 mt-1">{svc.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-lg leading-tight">
                        {svc.name}
                      </h3>
                      <p className="text-gray-500 text-sm mt-1">{svc.description}</p>
                      {svc.link && (
                        <a
                          href={svc.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-teal-600 text-sm font-medium hover:underline"
                        >
                          अधिक माहिती →
                        </a>
                      )}
                    </div>
                  </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>

              {/* Application CTA - Link to Citizen Portal */}
              <div className="mt-12 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl p-8 text-center text-white">
                <h3 className="text-2xl font-bold mb-2">ऑनलाइन प्रमाणपत्रासाठी अर्ज करा</h3>
                <p className="text-white/80 max-w-xl mx-auto mb-4">
                  नागरिक पोर्टलवर लॉगिन करून विविध प्रमाणपत्रांसाठी
                  ऑनलाइन अर्ज करा. मोबाइल OTP द्वारे लॉगिन करा.
                </p>
                <a
                  href="/citizen/login"
                  className="inline-block bg-white text-teal-700 font-semibold px-6 py-2.5 rounded-lg hover:bg-teal-50 transition-colors"
                >
                  🏛️ नागरिक पोर्टल — अर्ज करा
                </a>
              </div>

              {/* सहपत्र-अ — Services Info Table */}
              <AnimatedSection>
                <div className="mt-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">सहपत्र-अ — सेवांची माहिती</h2>
                  <p className="text-gray-500 text-sm mb-4">महाराष्ट्र लोकसेवा हक्क अध्यादेश अंतर्गत ग्रामपंचायत स्तरावरील सेवांची माहिती</p>
                  <div className="bg-white rounded-xl border overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-teal-50">
                        <tr>
                          <th className="p-3 text-left font-semibold text-teal-800 border-b">अ.क्र.</th>
                          <th className="p-3 text-left font-semibold text-teal-800 border-b">सेवेचे नाव</th>
                          <th className="p-3 text-left font-semibold text-teal-800 border-b">कालमर्यादा</th>
                          <th className="p-3 text-left font-semibold text-teal-800 border-b">पदनिर्देशित अधिकारी</th>
                          <th className="p-3 text-left font-semibold text-teal-800 border-b">प्रथम अपील अधिकारी</th>
                          <th className="p-3 text-left font-semibold text-teal-800 border-b">द्वितीय अपील अधिकारी</th>
                          <th className="p-3 text-left font-semibold text-teal-800 border-b">शुल्क (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {[
                          { sr: 1, name: "जन्म दाखला", days: "7 दिवस", officer: "ग्रामपंचायत अधिकारी", first: "गट विकास अधिकारी", second: "मुख्य कार्यकारी अधिकारी", fee: "₹0" },
                          { sr: 2, name: "मृत्यू दाखला", days: "7 दिवस", officer: "ग्रामपंचायत अधिकारी", first: "गट विकास अधिकारी", second: "मुख्य कार्यकारी अधिकारी", fee: "₹0" },
                          { sr: 3, name: "विवाह नोंदणी दाखला", days: "15 दिवस", officer: "ग्रामपंचायत अधिकारी", first: "गट विकास अधिकारी", second: "मुख्य कार्यकारी अधिकारी", fee: "₹0" },
                          { sr: 4, name: "रहिवासी दाखला", days: "7 दिवस", officer: "सरपंच / ग्रामपंचायत अधिकारी", first: "गट विकास अधिकारी", second: "मुख्य कार्यकारी अधिकारी", fee: "₹10" },
                          { sr: 5, name: "दारिद्र्यरेषेखालील दाखला (BPL)", days: "15 दिवस", officer: "ग्रामपंचायत अधिकारी", first: "गट विकास अधिकारी", second: "मुख्य कार्यकारी अधिकारी", fee: "₹10" },
                          { sr: 6, name: "हयात दाखला", days: "7 दिवस", officer: "सरपंच / ग्रामपंचायत अधिकारी", first: "गट विकास अधिकारी", second: "मुख्य कार्यकारी अधिकारी", fee: "₹10" },
                          { sr: 7, name: "थकबाकी नसल्याचा दाखला", days: "7 दिवस", officer: "ग्रामपंचायत अधिकारी", first: "गट विकास अधिकारी", second: "मुख्य कार्यकारी अधिकारी", fee: "₹20" },
                          { sr: 8, name: "शौचालय बांधकाम दाखला", days: "15 दिवस", officer: "ग्रामपंचायत अधिकारी", first: "गट विकास अधिकारी", second: "मुख्य कार्यकारी अधिकारी", fee: "₹10" },
                          { sr: 9, name: "निराधार दाखला", days: "15 दिवस", officer: "सरपंच / ग्रामपंचायत अधिकारी", first: "गट विकास अधिकारी", second: "मुख्य कार्यकारी अधिकारी", fee: "₹10" },
                          { sr: 10, name: "विधवा दाखला", days: "15 दिवस", officer: "सरपंच / ग्रामपंचायत अधिकारी", first: "गट विकास अधिकारी", second: "मुख्य कार्यकारी अधिकारी", fee: "₹10" },
                          { sr: 11, name: "परित्यक्ता दाखला", days: "15 दिवस", officer: "सरपंच / ग्रामपंचायत अधिकारी", first: "गट विकास अधिकारी", second: "मुख्य कार्यकारी अधिकारी", fee: "₹10" },
                          { sr: 12, name: "अविभक्त कुटुंब दाखला", days: "15 दिवस", officer: "सरपंच / ग्रामपंचायत अधिकारी", first: "गट विकास अधिकारी", second: "मुख्य कार्यकारी अधिकारी", fee: "₹10" },
                        ].map((row) => (
                          <tr key={row.sr} className="hover:bg-gray-50">
                            <td className="p-3 text-gray-600">{row.sr}</td>
                            <td className="p-3 font-medium text-gray-800">{row.name}</td>
                            <td className="p-3 text-gray-600">{row.days}</td>
                            <td className="p-3 text-gray-600">{row.officer}</td>
                            <td className="p-3 text-gray-600">{row.first}</td>
                            <td className="p-3 text-gray-600">{row.second}</td>
                            <td className="p-3 text-gray-800 font-medium">{row.fee}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </AnimatedSection>

              {/* Required Documents Table */}
              <AnimatedSection>
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">अर्जासोबत द्यावयाचे कागदपत्र</h2>
                  <div className="bg-white rounded-xl border overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-amber-50">
                        <tr>
                          <th className="p-3 text-left font-semibold text-amber-800 border-b">अ.क्र.</th>
                          <th className="p-3 text-left font-semibold text-amber-800 border-b">दाखला</th>
                          <th className="p-3 text-left font-semibold text-amber-800 border-b">आवश्यक कागदपत्र</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {[
                          { sr: 1, cert: "जन्म दाखला", docs: "जन्म नोंदणी, आधार कार्ड, रेशन कार्ड" },
                          { sr: 2, cert: "मृत्यू दाखला", docs: "मृत्यू नोंदणी, आधार कार्ड, वैद्यकीय प्रमाणपत्र" },
                          { sr: 3, cert: "विवाह प्रमाणपत्र", docs: "आधार कार्ड (दोघांचे), वयाचा पुरावा, लग्नपत्रिका, दोन साक्षीदार" },
                          { sr: 4, cert: "रहिवासी दाखला", docs: "आधार कार्ड, रेशन कार्ड, वीज बिल, मतदार ओळखपत्र" },
                          { sr: 5, cert: "BPL दाखला", docs: "आधार कार्ड, रेशन कार्ड, उत्पन्नाचा दाखला, BPL यादी" },
                          { sr: 6, cert: "हयात दाखला", docs: "आधार कार्ड, पासपोर्ट फोटो" },
                          { sr: 7, cert: "थकबाकी नसल्याचा दाखला", docs: "आधार कार्ड, मिळकत पावती, पाणीपट्टी पावती" },
                          { sr: 8, cert: "शौचालय बांधकाम दाखला", docs: "आधार कार्ड, बांधकाम पूर्णत्व फोटो, योजना कागदपत्र" },
                          { sr: 9, cert: "निराधार दाखला", docs: "आधार कार्ड, उत्पन्नाचा दाखला, वैद्यकीय प्रमाणपत्र (लागू असल्यास)" },
                          { sr: 10, cert: "विधवा दाखला", docs: "आधार कार्ड, पतीचा मृत्यू दाखला, रेशन कार्ड" },
                          { sr: 11, cert: "परित्यक्ता दाखला", docs: "आधार कार्ड, शपथपत्र, पोलीस तक्रार (लागू असल्यास)" },
                          { sr: 12, cert: "अविभक्त कुटुंब दाखला", docs: "आधार (सर्व सदस्य), रेशन कार्ड, शपथपत्र" },
                        ].map((row) => (
                          <tr key={row.sr} className="hover:bg-gray-50">
                            <td className="p-3 text-gray-600">{row.sr}</td>
                            <td className="p-3 font-medium text-gray-800">{row.cert}</td>
                            <td className="p-3 text-gray-600">{row.docs}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </AnimatedSection>

              {/* नमुना ८ चा उतारा — Coming Soon */}
              <AnimatedSection>
                <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                  <span className="text-3xl">🚧</span>
                  <h3 className="font-bold text-gray-700 mt-2">नमुना ८ चा उतारा</h3>
                  <p className="text-gray-500 text-sm mt-1">ही सुविधा लवकरच उपलब्ध होईल. (Coming Soon)</p>
                </div>
              </AnimatedSection>

              {/* Helpline box */}
              <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6 flex flex-col sm:flex-row gap-4 items-center">
                <span className="text-4xl">📞</span>
                <div className="text-center sm:text-left">
                  <h4 className="font-bold text-amber-800 text-lg">हेल्पलाइन</h4>
                  <p className="text-amber-700 text-sm">
                    सेवेसंबंधी कोणत्याही अडचणीसाठी ग्रामपंचायत
                    कार्यालयाशी संपर्क साधा
                  </p>
                </div>
                <div className="sm:ml-auto text-center">
                  <p className="text-2xl font-bold text-amber-800">1800-XXX-XXXX</p>
                  <p className="text-amber-600 text-xs">सोमवार - शनिवार | सकाळी १० ते संध्या ५</p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
