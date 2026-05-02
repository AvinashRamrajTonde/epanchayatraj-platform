import SeoHead from "../components/SeoHead";
import SectionHero from "../components/SectionHero";
import AnimatedSection, { StaggerContainer, StaggerItem } from "../components/AnimatedSection";

interface DeclarationForm {
  title: string;
  filename: string;
  icon: string;
  color: string;
}

const DECLARATION_FORMS: DeclarationForm[] = [
  {
    title: "कोणत्याही योजनेचा लाभ न घेतल्याचे स्वयंघोषणापत्र",
    filename: "कोणत्याही-योजनेचा-लाभ-न-घेतल्याचे-स्वयंघोषणापत्र.pdf",
    icon: "📋",
    color: "from-blue-500 to-indigo-500",
  },
  {
    title: "परितक्या असल्याबाबत स्वयंघोषणापत्र",
    filename: "परितक्या-असल्याबाबत-स्वयंघोषणापत्र.pdf",
    icon: "📝",
    color: "from-purple-500 to-violet-500",
  },
  {
    title: "रहिवाशी दाखला स्वयंघोषणापत्र",
    filename: "रहिवाशी_दाखला_स्व_घोषणापत्र.pdf",
    icon: "🏠",
    color: "from-emerald-500 to-green-500",
  },
  {
    title: "विधवा असल्याबाबत स्वयंघोषणापत्र",
    filename: "विधवा-असल्याबाबत-स्वयंघोषणापत्र-1.pdf",
    icon: "📄",
    color: "from-rose-500 to-pink-500",
  },
  {
    title: "विभक्त कुटुंब असल्यास स्वयंघोषणापत्र",
    filename: "विभक्त-कुटुंब-असल्यास-स्वयंघोषणापत्र.pdf",
    icon: "👨‍👩‍👧",
    color: "from-amber-500 to-orange-500",
  },
  {
    title: "वीज जोडणी स्वयंघोषणापत्र",
    filename: "वीज-जोडणी-स्वयंघोषणापत्र.pdf",
    icon: "⚡",
    color: "from-yellow-500 to-amber-500",
  },
  {
    title: "शौचालय असल्याबाबत स्वयंघोषणापत्र",
    filename: "शौचालय-असल्याबाबत-स्वयंघोषणापत्र.pdf",
    icon: "🚻",
    color: "from-cyan-500 to-teal-500",
  },
  {
    title: "हयात असल्याबाबत स्वयंघोषणापत्र",
    filename: "हयात-असल्याबाबत-स्वयंघोषणापत्र.pdf",
    icon: "✅",
    color: "from-green-500 to-emerald-500",
  },
];

export default function DeclarationsPage() {
  return (
    <>
      <SeoHead title="स्वयंघोषणापत्रे" path="/declarations" />

      <SectionHero
        title="स्वयंघोषणापत्रे"
        subtitle="PDF स्वरूपातील स्वयंघोषणापत्रे — खालील फॉर्म डाऊनलोड करून आवश्यकतेनुसार वापरावेत"
        gradient="from-indigo-700 to-purple-600"
      />

      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          {/* Info Banner */}
          <AnimatedSection>
            <div className="mb-10 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 px-6 py-5 flex items-start gap-4">
              <div className="text-3xl flex-shrink-0">📄</div>
              <div>
                <h3 className="font-bold text-indigo-800 text-lg">
                  PDF स्वरूपातील स्वयंघोषणापत्रे
                </h3>
                <p className="text-indigo-600/80 mt-1 text-sm leading-relaxed">
                  खालील फॉर्म डाऊनलोड करून प्रिंट करा आणि आवश्यकतेनुसार भरून ग्रामपंचायत कार्यालयात जमा करा.
                  सर्व फॉर्म PDF स्वरूपात उपलब्ध आहेत.
                </p>
              </div>
            </div>
          </AnimatedSection>

          {/* Forms Grid */}
          <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {DECLARATION_FORMS.map((form) => (
              <StaggerItem key={form.filename}>
                <div className="group h-full flex flex-col rounded-2xl bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all duration-400 hover:-translate-y-1 overflow-hidden">
                  {/* Card Header */}
                  <div className={`bg-gradient-to-br ${form.color} px-5 py-4 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
                    <span className="text-3xl block mb-1">{form.icon}</span>
                  </div>

                  {/* Card Body */}
                  <div className="flex-1 px-5 py-4 flex flex-col">
                    <h3 className="text-sm font-semibold text-gray-800 leading-relaxed flex-1">
                      {form.title}
                    </h3>

                    <a
                      href={`/declarations/${form.filename}`}
                      download
                      className={`mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r ${form.color} text-white font-medium text-sm hover:opacity-90 transition-all duration-300 shadow-sm hover:shadow-md`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      डाउनलोड करा
                    </a>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Additional Info */}
          <AnimatedSection>
            <div className="mt-10 text-center">
              <p className="text-gray-400 text-sm">
                टीप: सर्व स्वयंघोषणापत्रे PDF स्वरूपात उपलब्ध आहेत. डाउनलोड करण्यासाठी PDF Reader आवश्यक आहे.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
