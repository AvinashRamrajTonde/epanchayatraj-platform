import { useState, useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import {
  Building2,
  Users,
  FileText,
  Bell,
  Shield,
  Globe,
  Smartphone,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Star,
  Zap,
  Lock,
  HeartHandshake,
  MonitorCheck,
  ChevronDown,
  Menu,
  X,
  Landmark,
  BookOpen,
  Megaphone,
  IndianRupee,
  ClipboardList,
  Image,
  Wrench,
  GraduationCap,
  MessageSquare,
  Play,
  ExternalLink,
  Monitor,
  LayoutDashboard,
  FileCheck,
  UserCircle,
} from "lucide-react";

// ── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
}: {
  target: number;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { damping: 40, stiffness: 200 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isInView) motionVal.set(target);
  }, [isInView, target, motionVal]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [spring]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

// ── Fade-in section wrapper ───────────────────────────────────────────────────
function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}

// ── Data ─────────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "वैशिष्ट्ये", href: "#features" },
  { label: "कामाची पद्धत", href: "#how-it-works" },
  { label: "फायदे", href: "#benefits" },
  { label: "डेमो", href: "#demo" },
  { label: "संपर्क", href: "#contact" },
];

const STATS = [
  { label: "ग्रामपंचायती", value: 200, suffix: "+" },
  { label: "प्रमाणपत्रे जारी", value: 50000, suffix: "+" },
  { label: "नागरिक नोंदणी", value: 2, suffix: "L+" },
  { label: "तालुके", value: 150, suffix: "+" },
];

const FEATURES = [
  {
    icon: <FileText size={28} />,
    title: "डिजिटल प्रमाणपत्रे",
    desc: "जन्म, मृत्यू, विवाह, रहिवास, उत्पन्न, गरीबी व चारित्र्य प्रमाणपत्रे QR-कोड सत्यापन व मराठी PDF सह जारी करा.",
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: <Users size={28} />,
    title: "नागरिक सेवा पोर्टल",
    desc: "नागरिक ऑनलाइन नोंदणी करतात, कुटुंब माहिती व्यवस्थापित करतात, अर्ज करतात, ट्रॅक करतात व पेमेंट करतात – २४×७.",
    color: "from-purple-500 to-violet-600",
  },
  {
    icon: <IndianRupee size={28} />,
    title: "कर व पेमेंट संकलन",
    desc: "घरपट्टी, पाणीपट्टी व सेवा शुल्काचे ऑनलाइन संकलन, पेमेंट गेटवे एकत्रीकरण आणि तत्काळ पावत्या.",
    color: "from-orange-500 to-amber-600",
  },
  {
    icon: <Bell size={28} />,
    title: "सूचना व जाहिरात",
    desc: "तातडीच्या, सामान्य व कार्यक्रम सूचना प्रकाशित करा. सर्व नोंदणीकृत नागरिकांना बल्क ईमेल व SMS पाठवा.",
    color: "from-rose-500 to-pink-600",
  },
  {
    icon: <ClipboardList size={28} />,
    title: "तक्रार व्यवस्थापन",
    desc: "नागरिक ऑनलाइन तक्रारी नोंदवतात. ग्राम सेवक ट्रॅक करतात, नियुक्त करतात व स्थिती अद्यतनांसह निराकरण करतात.",
    color: "from-cyan-500 to-sky-600",
  },
  {
    icon: <BarChart3 size={28} />,
    title: "आर्थिक अहवाल व अर्थसंकल्प",
    desc: "पारदर्शक अर्थसंकल्प ट्रॅकिंग, उत्पन्न-खर्च विवरण आणि वार्षिक आर्थिक अहवाल सर्व नागरिकांसाठी उपलब्ध.",
    color: "from-teal-500 to-green-600",
  },
  {
    icon: <Landmark size={28} />,
    title: "ग्रामसभा व्यवस्थापन",
    desc: "ग्रामसभा वेळापत्रक, कार्यवाही नोंद व प्रकाशन. ठराव व उपस्थिती नोंदी डिजिटली जोडा.",
    color: "from-yellow-500 to-amber-500",
  },
  {
    icon: <Wrench size={28} />,
    title: "विकासकामांचा मागोवा",
    desc: "रस्ते, पाणीपुरवठा, स्वच्छता – चालू विकासकामांचा प्रगती अद्यतने व अर्थसंकल्पासह मागोवा ठेवा.",
    color: "from-slate-500 to-gray-600",
  },
  {
    icon: <Megaphone size={28} />,
    title: "शासकीय योजना",
    desc: "केंद्र व राज्य शासनाच्या योजना पात्रता तपशीलांसह सूचीबद्ध करा जेणेकरून नागरिक सहज शोधू व अर्ज करू शकतात.",
    color: "from-fuchsia-500 to-purple-600",
  },
  {
    icon: <GraduationCap size={28} />,
    title: "शाळा व शिक्षण",
    desc: "गावातील शाळांचे प्रोफाइल, विद्यार्थी संख्या, सुविधा आणि उपलब्धी एकाच ठिकाणी.",
    color: "from-blue-400 to-cyan-500",
  },
  {
    icon: <Image size={28} />,
    title: "छायाचित्र दालन व पुरस्कार",
    desc: "गावाच्या उपलब्धी, कार्यक्रम, पुरस्कार आणि विकास टप्पे सुव्यवस्थित दालनाद्वारे प्रदर्शित करा.",
    color: "from-red-400 to-rose-500",
  },
];

const HOW_IT_WORKS = [
  {
    step: "०१",
    title: "ग्रामपंचायत नोंदणी",
    desc: "सुपर-अ‍ॅडमिन तुमची ग्रामपंचायत नोंदवतो, सबडोमेन सेट करतो, लोगो अपलोड करतो व थीम निवडतो – ५ मिनिटांत.",
    icon: <Building2 size={24} />,
  },
  {
    step: "०२",
    title: "सेवांची कॉन्फिगरेशन",
    desc: "ग्राम सेवक प्रमाणपत्रे, कर, तक्रारी आवश्यकतेनुसार सक्रिय करतो आणि शुल्क व मंजूरी प्रवाह सेट करतो.",
    icon: <MonitorCheck size={24} />,
  },
  {
    step: "०३",
    title: "नागरिक नोंदणी",
    desc: "ग्रामस्थ मोबाइलवरून नोंदणी करतात, कुटुंब सदस्य जोडतात व लगेचच ऑनलाइन सेवांसाठी अर्ज करायला सुरुवात करतात.",
    icon: <Smartphone size={24} />,
  },
  {
    step: "०४",
    title: "प्रक्रिया व जारी",
    desc: "अ‍ॅडमिन अर्जांचा आढावा घेतो, मंजूर करतो किंवा कागदपत्रे मागवतो आणि QR-कोडयुक्त डिजिटल प्रमाणपत्र जारी करतो.",
    icon: <CheckCircle2 size={24} />,
  },
];

const BENEFITS = [
  {
    icon: <Zap size={22} />,
    title: "१०× जलद प्रक्रिया",
    desc: "प्रमाणपत्र अर्जांवर आठवडे नव्हे, तर तासांत प्रक्रिया होते. रांगेत उभे राहण्याची गरज नाही.",
  },
  {
    icon: <Lock size={22} />,
    title: "पूर्णपणे सुरक्षित",
    desc: "JWT प्रमाणीकरण, भूमिका-आधारित प्रवेश नियंत्रण, रेट लिमिटिंग आणि एन्क्रिप्टेड डेटा.",
  },
  {
    icon: <Globe size={22} />,
    title: "द्विभाषिक (मराठी/इंग्रजी)",
    desc: "सर्व PDF, सूचना आणि नागरिक-सामना इंटरफेससाठी संपूर्ण मराठी भाषा समर्थन.",
  },
  {
    icon: <HeartHandshake size={22} />,
    title: "पारदर्शक शासन",
    desc: "सार्वजनिक आर्थिक अहवाल, विकासकामांची प्रगती आणि ग्रामसभा नोंदी नागरिकांचा विश्वास वाढवतात.",
  },
  {
    icon: <Smartphone size={22} />,
    title: "मोबाइल फर्स्ट",
    desc: "संपूर्ण रिस्पॉन्सिव्ह डिझाइन – अ‍ॅप डाउनलोडशिवाय कोणत्याही स्मार्टफोनवर उत्तम काम करते.",
  },
  {
    icon: <Shield size={22} />,
    title: "QR-कोड सत्यापन",
    desc: "प्रत्येक प्रमाणपत्रावर अनन्य QR कोड असतो जो कोणताही अधिकारी स्कॅन करून त्वरित सत्यता सिद्ध करू शकतो.",
  },
];

const DEMO_SECTIONS = [
  {
    icon: <LayoutDashboard size={28} />,
    title: "सुपर अ‍ॅडमिन डॅशबोर्ड",
    desc: "सर्व ग्रामपंचायती, सदस्यता, वापरकर्ते आणि प्लॅटफॉर्म सेटिंग्जचे केंद्रीय नियंत्रण पॅनेल.",
    badge: "SuperAdmin",
    badgeColor: "bg-purple-100 text-purple-700",
    demoUrl: "#",
    previewBg: "from-purple-900 via-slate-900 to-indigo-900",
    screens: ["ग्रामपंचायत यादी", "सदस्यता", "बल्क मेल", "SEO सेटिंग्ज"],
  },
  {
    icon: <Monitor size={28} />,
    title: "ग्राम पंचायत वेबसाइट",
    desc: "प्रत्येक गावाची स्वतःची ब्रँडेड वेबसाइट – सूचना, कार्यक्रम, योजना, ग्रामसभा सर्व एकाच ठिकाणी.",
    badge: "Village Portal",
    badgeColor: "bg-green-100 text-green-700",
    demoUrl: "#",
    previewBg: "from-green-900 via-slate-900 to-teal-900",
    screens: ["मुख्यपृष्ठ", "प्रशासन", "सूचना फलक", "फोटो दालन"],
  },
  {
    icon: <FileCheck size={28} />,
    title: "ग्राम सेवक अ‍ॅडमिन पॅनेल",
    desc: "प्रमाणपत्र अर्ज प्रक्रिया, कर संकलन, तक्रार व्यवस्थापन आणि सामग्री व्यवस्थापन.",
    badge: "Village Admin",
    badgeColor: "bg-orange-100 text-orange-700",
    demoUrl: "#",
    previewBg: "from-orange-900 via-slate-900 to-amber-900",
    screens: ["प्रमाणपत्र अर्ज", "कर डॅशबोर्ड", "सदस्य यादी", "ग्रामसभा"],
  },
  {
    icon: <UserCircle size={28} />,
    title: "नागरिक पोर्टल",
    desc: "नागरिक नोंदणी, कुटुंब माहिती, प्रमाणपत्र अर्ज, ट्रॅकिंग आणि ऑनलाइन पेमेंट.",
    badge: "Citizen Portal",
    badgeColor: "bg-blue-100 text-blue-700",
    demoUrl: "#",
    previewBg: "from-blue-900 via-slate-900 to-cyan-900",
    screens: ["माझे अर्ज", "कुटुंब व्यवस्थापन", "प्रमाणपत्र सत्यापन", "पेमेंट"],
  },
];

const TESTIMONIALS = [
  {
    name: "सरपंच राजेश पाटील",
    role: "सरपंच, ग्रामपंचायत",
    text: "ePanchayatRaj ने आमच्या ग्रामपंचायतीचे काम पूर्णपणे बदलले. आता नागरिकांना कार्यालयात यावे लागत नाही. सर्व सेवा मोबाइलवर मिळतात.",
    stars: 5,
  },
  // {
  //   name: "सुनीता वाघमारे",
  //   role: "ग्रामसेवक, कसारा ग्राम पंचायत",
  //   text: "१५ दिवस लागणारी प्रमाणपत्र प्रक्रिया आता २ तासांत होते. QR सत्यापनामुळे संस्थांना आत्मविश्वास मिळतो.",
  //   stars: 5,
  // },
  // {
  //   name: "प्रकाश भोईर",
  //   role: "ग्राम सेवक, भंडारदरा",
  //   text: "डॅशबोर्डवर प्रलंबित अर्ज, आर्थिक स्थिती आणि तक्रार निराकरण एका दृष्टिक्षेपात दिसते.",
  //   stars: 5,
  // },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [formSent, setFormSent] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const scrollTo = (href: string) => {
    setNavOpen(false);
    setActiveSection(href);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Landmark size={22} className="text-white" />
            </div>
            <div>
              <span className={`font-extrabold text-xl leading-none tracking-tight ${scrolled ? "text-gray-900" : "text-white"}`}>
                ePanchayatRaj
              </span>
              <p className={`text-[10px] leading-none font-medium ${scrolled ? "text-gray-500" : "text-white/80"}`}>
                ePanchayatraj.com
              </p>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className={`text-sm font-medium transition-colors ${
                  scrolled
                    ? "text-gray-600 hover:text-orange-600"
                    : "text-white/90 hover:text-white"
                } ${activeSection === l.href ? "!text-orange-500 font-semibold" : ""}`}
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <a
              href="https://admin.epanchayatraj.com"
              className="text-sm font-medium text-orange-600 hover:text-orange-700 border border-orange-300 px-4 py-2 rounded-lg hover:bg-orange-50 transition-all"
            >
              अ‍ॅडमिन लॉगिन
            </a>
            <button
              onClick={() => scrollTo("#contact")}
              className="text-sm font-semibold bg-gradient-to-r from-orange-500 to-green-600 text-white px-5 py-2.5 rounded-lg hover:shadow-lg hover:scale-105 transition-all"
            >
              सुरुवात करा
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            className={`lg:hidden p-2 rounded-lg ${scrolled ? "text-gray-700" : "text-white"}`}
            onClick={() => setNavOpen(!navOpen)}
            aria-label="Toggle menu"
          >
            {navOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile nav dropdown */}
        {navOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden bg-white border-b border-gray-100 shadow-lg px-4 py-4 flex flex-col gap-3"
          >
            {NAV_LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className="text-left text-gray-700 font-medium py-2 border-b border-gray-50 hover:text-orange-600"
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => scrollTo("#contact")}
              className="mt-2 bg-gradient-to-r from-orange-500 to-green-600 text-white py-3 rounded-lg font-semibold text-center"
            >
              सुरुवात करा
            </button>
          </motion.div>
        )}
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-green-950 to-slate-900" />
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm text-white/90 text-sm px-4 py-2 rounded-full mb-8"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            महाराष्ट्रातील #१ डिजिटल ग्रामपंचायत प्लॅटफॉर्म
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6"
          >
            डिजिटल{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
              ग्रामपंचायत
            </span>
            <br />
            प्रत्येक गावासाठी
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto text-lg sm:text-xl text-white/75 leading-relaxed mb-10"
          >
            ePanchayatRaj प्लॅटफॉर्म प्रत्येक ग्रामपंचायतीला ब्रँडेड वेबसाइट,
            डिजिटल प्रमाणपत्रे, नागरिक पोर्टल, कर संकलन, तक्रार व्यवस्थापन
            आणि पारदर्शक शासन देतो — सर्व एकाच ठिकाणी.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => scrollTo("#contact")}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-orange-500/30 hover:scale-105 transition-all"
            >
              डेमो मागवा <ArrowRight size={20} />
            </button>
            <button
              onClick={() => scrollTo("#features")}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg backdrop-blur-sm transition-all"
            >
              वैशिष्ट्ये पाहा <ChevronDown size={20} />
            </button>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40"
          >
            <ChevronDown size={28} />
          </motion.div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-orange-500 via-orange-600 to-green-600 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {STATS.map((s, i) => (
              <FadeIn key={s.label} delay={i * 0.1}>
                <div>
                  <p className="text-4xl lg:text-5xl font-black text-white mb-1">
                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-orange-100 font-medium text-sm lg:text-base">
                    {s.label}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <span className="inline-block bg-orange-100 text-orange-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              प्लॅटफॉर्म वैशिष्ट्ये
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              ग्रामपंचायतीला लागणारे सर्व काही
            </h2>
            <p className="max-w-2xl mx-auto text-gray-500 text-lg">
              महाराष्ट्रातील गाव समुदायांसाठी विशेषतः बनवलेले संपूर्ण डिजिटल शासन सूट.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={(i % 4) * 0.08}>
                <div className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-transparent hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}
                  >
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-base">
                    {f.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <span className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              कामाची पद्धत
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              काही मिनिटांत सुरू व्हा
            </h2>
            <p className="max-w-xl mx-auto text-gray-500 text-lg">
              तुमची ग्रामपंचायत पूर्णपणे डिजिटल करण्यासाठी सोपी चार-पायरी प्रक्रिया.
            </p>
          </FadeIn>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-orange-200 via-green-200 to-orange-200" />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              {HOW_IT_WORKS.map((h, i) => (
                <FadeIn key={h.step} delay={i * 0.12}>
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-50 to-green-50 border-2 border-green-100 flex items-center justify-center shadow-lg">
                        <span className="text-green-600">{h.icon}</span>
                      </div>
                      <span className="absolute -top-3 -right-3 w-9 h-9 bg-gradient-to-br from-orange-500 to-green-600 text-white text-xs font-black rounded-full flex items-center justify-center shadow-md">
                        {h.step}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">
                      {h.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {h.desc}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits ───────────────────────────────────────────────── */}
      <section id="benefits" className="py-24 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <span className="inline-block bg-orange-500/20 text-orange-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              ePanchayatRaj का निवडावे?
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              ग्राम प्रशासकांचा विश्वास
            </h2>
            <p className="max-w-xl mx-auto text-gray-400 text-lg">
              महाराष्ट्राच्या शासन गरजांसाठी खास तयार केलेले.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((b, i) => (
              <FadeIn key={b.title} delay={(i % 3) * 0.1}>
                <div className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/40 rounded-2xl p-6 transition-all duration-300">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500/20 to-green-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 transition-transform">
                    {b.icon}
                  </div>
                  <h3 className="font-bold text-white mb-2">{b.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{b.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-orange-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <span className="inline-block bg-white border border-orange-200 text-orange-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              अभिप्राय
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              ग्रामप्रमुख काय म्हणतात
            </h2>
          </FadeIn>

          <div className="grid sm:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.12}>
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100 hover:shadow-xl transition-shadow h-full flex flex-col">
                  <div className="flex mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star
                        key={j}
                        size={18}
                        className="text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 italic leading-relaxed flex-1 mb-6">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-green-500 flex items-center justify-center text-white font-bold text-sm">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {t.name}
                      </p>
                      <p className="text-gray-400 text-xs">{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo Previews ──────────────────────────────────────────── */}
      <section id="demo" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <span className="inline-block bg-indigo-100 text-indigo-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              लाइव्ह डेमो
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              प्रत्यक्ष पाहा, स्वतः अनुभवा
            </h2>
            <p className="max-w-2xl mx-auto text-gray-500 text-lg">
              ePanchayatRaj च्या चार मुख्य विभागांचे लाइव्ह डेमो खाली दिले आहेत.
              प्रत्येक लिंकवर क्लिक करून थेट प्लॅटफॉर्म अनुभवा.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-8">
            {DEMO_SECTIONS.map((d, i) => (
              <FadeIn key={d.title} delay={(i % 2) * 0.1}>
                <div className="group rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  {/* Preview window */}
                  <div className={`relative bg-gradient-to-br ${d.previewBg} h-52 flex items-center justify-center overflow-hidden`}>
                    {/* Fake browser chrome */}
                    <div className="absolute top-0 inset-x-0 bg-black/30 backdrop-blur-sm h-8 flex items-center px-4 gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                      <div className="ml-2 flex-1 bg-white/10 rounded px-3 py-0.5 text-white/50 text-xs font-mono truncate">
                        epanchayatraj.com/{d.badge.toLowerCase().replace(" ", "-")}
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-4 mt-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white/80 group-hover:scale-110 transition-transform">
                        {d.icon}
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {d.screens.map((s) => (
                          <span key={s} className="bg-white/10 border border-white/20 text-white/70 text-xs px-2.5 py-1 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/60 flex items-center justify-center">
                        <Play size={24} className="text-white ml-1" />
                      </div>
                    </div>
                  </div>
                  {/* Card body */}
                  <div className="p-6 bg-white">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${d.badgeColor} mb-2 inline-block`}>
                          {d.badge}
                        </span>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{d.title}</h3>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed mb-5">{d.desc}</p>
                    <a
                      href={d.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all"
                    >
                      लाइव्ह डेमो पाहा <ExternalLink size={15} />
                    </a>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.3}>
            <div className="mt-10 text-center bg-indigo-50 border border-indigo-100 rounded-2xl py-6 px-8">
              <p className="text-indigo-700 text-sm font-medium">
                📱 मोबाइल अ‍ॅप डेमो लवकरच येत आहे — सूचित राहण्यासाठी
                <button
                  onClick={() => scrollTo("#contact")}
                  className="underline underline-offset-2 font-bold ml-1 hover:text-indigo-900 transition-colors"
                >
                  आत्ताच नोंदणी करा
                </button>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────── */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-r from-orange-600 via-orange-500 to-green-600">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <FadeIn className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <BookOpen size={48} className="text-white/60 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            तुमची ग्रामपंचायत डिजिटल करायला तयार आहात?
          </h2>
          <p className="text-orange-100 text-lg mb-8">
            आधीच २००+ गावे ePanchayatRaj वापरत आहेत. कोणतेही हार्डवेअर नको —
            फक्त इंटरनेट कनेक्शन पुरेसे.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => scrollTo("#contact")}
              className="bg-white text-orange-600 font-bold px-8 py-4 rounded-xl hover:bg-orange-50 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              आमच्याशी संपर्क करा <ArrowRight size={18} />
            </button>
            <a
              href="https://admin.epanchayatraj.com"
              className="border-2 border-white/60 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              अ‍ॅडमिन लॉगिन
            </a>
          </div>
        </FadeIn>
      </section>

      {/* ── Contact ────────────────────────────────────────────────── */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <span className="inline-block bg-blue-100 text-blue-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              संपर्क साधा
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              आमच्याशी बोला
            </h2>
            <p className="max-w-xl mx-auto text-gray-500 text-lg">
              तुमची ग्रामपंचायत नोंदवायची आहे किंवा डेमो हवा आहे? आम्ही मदतीसाठी तयार आहोत.
            </p>
          </FadeIn>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Contact Info */}
            <FadeIn delay={0.1}>
              <div className="space-y-6">
                {/* Company info card */}
                <div className="bg-gradient-to-br from-slate-900 to-green-950 rounded-2xl p-8 text-white">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-green-600 flex items-center justify-center">
                      <Landmark size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xl">ePanchayatRaj</h3>
                      <p className="text-gray-400 text-sm">ePanchayatraj.com</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    आम्ही भारताच्या ग्राम शासनासाठी डिजिटल पायाभूत सुविधा बनवतो —
                    ग्रामपंचायतींना तंत्रज्ञानाद्वारे नागरिकांना अधिक चांगल्या सेवा
                    देण्यासाठी सक्षम करतो.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin size={16} className="text-orange-400" />
                      </div>
                      <div>
                        <p className="text-white/60 text-xs mb-0.5">पत्ता</p>
                        <p className="text-white text-sm">
                          ऑफिस नं. १२, पुणे–नाशिक महामार्ग,<br />
                          इगतपुरी, नाशिक – ४२२४०३,<br />
                          महाराष्ट्र, भारत
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Phone size={16} className="text-green-400" />
                      </div>
                      <div>
                        <p className="text-white/60 text-xs mb-0.5">दूरध्वनी</p>
                        <a href="tel:+919876543210" className="text-white text-sm hover:text-green-400 transition-colors">
                          +९१ ९८७६५ ४३२१०
                        </a>
                        <br />
                        <a href="tel:+912536543210" className="text-white text-sm hover:text-green-400 transition-colors">
                          +९१ २५३६ ५४३२१०
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Mail size={16} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white/60 text-xs mb-0.5">ईमेल</p>
                        <a href="mailto:info@epanchayatraj.com" className="text-white text-sm hover:text-blue-400 transition-colors">
                          info@epanchayatraj.com
                        </a>
                        <br />
                        <a href="mailto:support@epanchayatraj.com" className="text-white text-sm hover:text-blue-400 transition-colors">
                          support@epanchayatraj.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Office hours */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageSquare size={18} className="text-orange-500" />
                    सहाय्य वेळ
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">सोम – शुक्र</span>
                      <span className="font-medium text-gray-900">सकाळी ९:०० – संध्या ६:००</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">शनिवार</span>
                      <span className="font-medium text-gray-900">सकाळी १०:०० – दुपारी २:००</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">रविवार</span>
                      <span className="font-medium text-gray-400">बंद</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Contact Form */}
            <FadeIn delay={0.2}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  संदेश पाठवा
                </h3>

                {formSent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={32} className="text-green-600" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2">
                      संदेश पाठवला गेला!
                    </h4>
                    <p className="text-gray-500 text-sm">
                      आपल्या संपर्कासाठी धन्यवाद. आमची टीम २४ तासांत संपर्क करेल.
                    </p>
                    <button
                      onClick={() => setFormSent(false)}
                      className="mt-6 text-orange-600 text-sm font-medium hover:underline"
                    >
                      आणखी संदेश पाठवा
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          पूर्ण नाव <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="तुमचे नाव"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          मोबाइल नंबर <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="+९१ XXXXX XXXXX"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        ईमेल पत्ता <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="you@example.com"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        संदेश <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        placeholder="तुमच्या गावाबद्दल आणि तुम्हाला काय हवे आहे ते सांगा…"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-orange-500 to-green-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-orange-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                    >
                      संदेश पाठवा <ArrowRight size={18} />
                    </button>
                  </form>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top footer */}
          <div className="py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-white/10">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-green-600 flex items-center justify-center">
                  <Landmark size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-extrabold text-white text-lg leading-none">ePanchayatRaj</p>
                  <p className="text-xs text-gray-500">ePanchayatraj.com</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-4">
                डिजिटल ग्रामपंचायत व्यवस्थापन केंद्र — पारदर्शक डिजिटल शासनाने
                ग्रामीण भारताला सक्षम करत आहोत.
              </p>
              <div className="flex gap-3">
                {["FB", "TW", "YT", "WA"].map((s) => (
                  <div key={s} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors">
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-white font-semibold mb-4">प्लॅटफॉर्म</h4>
              <ul className="space-y-2.5 text-sm">
                {["वैशिष्ट्ये", "कामाची पद्धत", "किंमत", "सुरक्षा", "अद्यतने"].map((l) => (
                  <li key={l}>
                    <a href="#" className="hover:text-white transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-white font-semibold mb-4">सेवा</h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  "डिजिटल प्रमाणपत्रे",
                  "नागरिक पोर्टल",
                  "कर संकलन",
                  "तक्रार प्रणाली",
                  "सूचना फलक",
                ].map((l) => (
                  <li key={l}>
                    <a href="#" className="hover:text-white transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">संपर्क</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <MapPin size={15} className="text-orange-400 mt-0.5 flex-shrink-0" />
                  <span>इगतपुरी, नाशिक – ४२२४०३, महाराष्ट्र</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={15} className="text-green-400 flex-shrink-0" />
                  <a href="tel:+919876543210" className="hover:text-white transition-colors">
                    +९१ ९८७६५ ४३२१०
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={15} className="text-blue-400 flex-shrink-0" />
                  <a href="mailto:info@epanchayatraj.com" className="hover:text-white transition-colors">
                    info@epanchayatraj.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom footer */}
          <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <p>© {new Date().getFullYear()} ePanchayatRaj. सर्व हक्क राखीव.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">गोपनीयता धोरण</a>
              <a href="#" className="hover:text-white transition-colors">सेवा अटी</a>
              <a href="#" className="hover:text-white transition-colors">तक्रार निवारण</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
