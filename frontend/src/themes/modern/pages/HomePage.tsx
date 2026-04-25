import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { publicService, type VillageFullData, type HeroSlide, type Notice, type Member, type Program, type GalleryImage, type Award } from "../../../services/publicService";
import { resolveUrl } from "../../../utils/resolveUrl";
import { useTenant } from "../../../context/TenantContext";

/* ─── Page Hero Banner ─── */
function HeroBanner({ slides, villageName }: { slides: HeroSlide[]; villageName: string }) {
  const [current, setCurrent] = useState(0);
  const activeSlides = slides.filter((s) => s.isActive);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const t = setInterval(() => setCurrent((p) => (p + 1) % activeSlides.length), 5000);
    return () => clearInterval(t);
  }, [activeSlides.length]);

  const slide = activeSlides[current];
  if (!slide) {
    return (
      <section className="relative h-[75vh] bg-gradient-to-br from-teal-800 via-teal-700 to-indigo-800 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">ग्रामपंचायत {villageName}</h1>
          <p className="text-lg text-teal-100 max-w-xl mx-auto">गावाच्या सर्वांगीण विकासासाठी कटिबद्ध</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[75vh] overflow-hidden">
      {activeSlides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? "opacity-100" : "opacity-0"}`}
        >
          <img src={resolveUrl(s.imageUrl)} alt={s.altText || ""} className="w-full h-full object-cover" />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
        <div className="max-w-7xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-teal-600/80 backdrop-blur text-white px-4 py-1.5 rounded-full text-xs font-medium mb-4">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            ग्रामपंचायत अधिकृत संकेतस्थळ
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-3">
            ग्रामपंचायत {villageName}
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-2xl">
            पारदर्शक प्रशासन, डिजिटल सेवा व नागरिक सहभागातून आदर्श गाव निर्माण
          </p>
        </div>
      </div>
      {/* Slide indicators */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-6 right-8 flex gap-2">
          {activeSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${i === current ? "w-8 bg-teal-400" : "w-4 bg-white/40 hover:bg-white/60"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ─── Stats Bar ─── */
function StatsBar({ stats }: { stats: Record<string, unknown> | undefined }) {
  if (!stats) return null;
  const items = [
    stats.population && { label: "लोकसंख्या", value: String(stats.population) },
    stats.area && { label: "क्षेत्रफळ", value: `${stats.area} चौ. किमी` },
    stats.households && { label: "कुटुंबे", value: String(stats.households) },
    stats.literacyRate && { label: "साक्षरता दर", value: `${stats.literacyRate}%` },
    stats.waterSupply && { label: "पाणी पुरवठा", value: `${stats.waterSupply}%` },
  ].filter(Boolean) as { label: string; value: string }[];

  if (items.length === 0) return null;
  return (
    <section className="-mt-10 relative z-10 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-100 p-6 grid grid-cols-2 md:grid-cols-5 gap-6">
        {items.slice(0, 5).map((s, i) => (
          <div key={i} className="text-center">
            <p className="text-2xl font-black text-teal-700">{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Notice Ticker ─── */
function NoticeTicker({ notices }: { notices: Notice[] }) {
  return (
    <section className="bg-teal-700 py-2.5 overflow-hidden">
      <div className="flex items-center gap-3 max-w-7xl mx-auto px-4">
        <span className="shrink-0 bg-white text-teal-700 px-3 py-1 rounded text-xs font-bold">सूचना</span>
        <div className="overflow-hidden flex-1">
          <div className="flex animate-marquee whitespace-nowrap gap-12">
            {[...notices, ...notices].map((n, i) => (
              <Link key={i} to="/notices" className="text-teal-50 text-sm hover:text-white transition-colors">
                {n.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .animate-marquee { animation: marquee 30s linear infinite; }
      `}</style>
    </section>
  );
}

/* ─── About Preview ─── */
function AboutPreview({ about, villageName }: { about: Record<string, unknown>; villageName: string }) {
  const title = (about?.title as string) || `${villageName} बद्दल`;
  const desc = about?.description1 ? String(about.description1) : "";
  const isHtml = /<[a-z][\s\S]*>/i.test(desc);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="max-w-3xl">
          <span className="text-teal-600 text-sm font-semibold tracking-wide uppercase">आमच्याबद्दल</span>
          <h2 className="text-3xl font-black text-slate-800 mt-2 mb-4">{title}</h2>
          {desc && (
            isHtml ? (
              <div
                className="prose prose-slate max-w-none text-slate-600 leading-relaxed [&_a]:text-teal-600"
                style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
                dangerouslySetInnerHTML={{ __html: desc }}
              />
            ) : (
              <p className="text-slate-600 leading-relaxed line-clamp-4">{desc}</p>
            )
          )}
          <Link
            to="/about"
            className="inline-flex items-center gap-2 mt-6 text-teal-600 font-semibold text-sm hover:text-teal-700 transition-colors group"
          >
            अधिक वाचा
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Administration Preview ─── */
function AdminPreview({ members }: { members: Member[] }) {
  const top = members.filter((m) => m.isActive).slice(0, 4);
  if (top.length === 0) return null;
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-teal-600 text-sm font-semibold tracking-wide uppercase">प्रशासन</span>
          <h2 className="text-3xl font-black text-slate-800 mt-2">आमचे प्रशासन</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {top.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                {m.photoUrl ? (
                  <img src={resolveUrl(m.photoUrl)} alt={m.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <svg className="w-10 h-10 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                )}
              </div>
              <h3 className="font-bold text-slate-800 text-sm">{m.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{m.designation}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/administration" className="inline-flex items-center gap-2 text-teal-600 font-semibold text-sm hover:text-teal-700 group">
            सर्व सदस्य पहा
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Notices Preview ─── */
function NoticesPreview({ notices }: { notices: Notice[] }) {
  if (notices.length === 0) return null;
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-teal-600 text-sm font-semibold tracking-wide uppercase">सूचना</span>
            <h2 className="text-3xl font-black text-slate-800 mt-2">ताज्या सूचना</h2>
          </div>
          <Link to="/notices" className="text-teal-600 font-semibold text-sm hover:text-teal-700 hidden sm:inline-flex items-center gap-1 group">
            सर्व पहा <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {notices.slice(0, 3).map((n) => (
            <article key={n.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-shadow">
              {n.category === "urgent" && (
                <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full mb-3">तातडीचे</span>
              )}
              <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-2">{n.title}</h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-3">{n.content}</p>
              <time className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleDateString("mr-IN", { day: "numeric", month: "short", year: "numeric" })}</time>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Gallery Preview ─── */
function GalleryPreview({ images }: { images: GalleryImage[] }) {
  if (images.length === 0) return null;
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-teal-600 text-sm font-semibold tracking-wide uppercase">गॅलरी</span>
          <h2 className="text-3xl font-black text-slate-800 mt-2">फोटो गॅलरी</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.slice(0, 8).map((img) => (
            <div key={img.id} className="aspect-square rounded-xl overflow-hidden group">
              <img
                src={resolveUrl(img.imageUrl)}
                alt={img.title || img.caption || ""}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/gallery" className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-teal-700 transition-colors">
            सर्व फोटो पहा
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Programs Preview ─── */
function ProgramsPreview({ programs }: { programs: Program[] }) {
  if (programs.length === 0) return null;
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-teal-600 text-sm font-semibold tracking-wide uppercase">विकासकामे</span>
            <h2 className="text-3xl font-black text-slate-800 mt-2">अलीकडील विकासकामे</h2>
          </div>
          <Link to="/programs" className="text-teal-600 font-semibold text-sm hover:text-teal-700 hidden sm:inline-flex items-center gap-1 group">
            सर्व पहा <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.slice(0, 3).map((p) => (
            <article key={p.id} className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 hover:shadow-md transition-shadow group">
              {p.images?.[0] && (
                <div className="h-48 overflow-hidden">
                  <img src={resolveUrl(p.images[0])} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
              )}
              <div className="p-5">
                <span className="text-xs text-teal-600 font-medium bg-teal-50 px-2 py-0.5 rounded">{p.category || "सामान्य"}</span>
                <h3 className="font-bold text-slate-800 mt-2 line-clamp-2">{p.title}</h3>
                {p.description && <p className="text-slate-500 text-sm mt-1 line-clamp-2">{p.description}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Awards Preview ─── */
function AwardsPreview({ awards }: { awards: Award[] }) {
  if (!awards || awards.length === 0) return null;
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-indigo-600 text-sm font-semibold tracking-wide uppercase">पुरस्कार</span>
          <h2 className="text-3xl font-black text-slate-800 mt-2">मिळालेले पुरस्कार</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {awards.slice(0, 3).map((a) => (
            <div key={a.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0012.75 11h-.75V7.5m0-4.5h3.375c.621 0 1.125.504 1.125 1.125v3.026a2.999 2.999 0 010 5.198v.401c0 .621-.504 1.125-1.125 1.125H9.375c-.621 0-1.125-.504-1.125-1.125v-.401a2.999 2.999 0 010-5.198V4.125c0-.621.504-1.125 1.125-1.125H12m0 0V1.5" /></svg>
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{a.title}</h3>
              {a.year && <p className="text-xs text-slate-400 mb-2">{a.year}</p>}
              {a.awardedBy && <p className="text-sm text-slate-500">{a.awardedBy}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Contact CTA ─── */
function ContactCTA({ villageName }: { villageName: string }) {
  return (
    <section className="py-20 bg-gradient-to-r from-teal-700 to-indigo-700 text-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-black mb-4">संपर्क करा</h2>
        <p className="text-teal-100 mb-6 max-w-lg mx-auto">
          ग्रामपंचायत {villageName} शी संपर्क साधा. आपल्या प्रश्न व सूचनांसाठी आम्ही उपलब्ध आहोत.
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 bg-white text-teal-700 px-8 py-3 rounded-lg font-bold text-sm hover:bg-teal-50 transition-colors shadow-lg"
        >
          संपर्क करा
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </Link>
      </div>
    </section>
  );
}

/* ═══ HOME PAGE ═══ */
export default function HomePage() {
  const { village } = useTenant();
  const [data, setData] = useState<VillageFullData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicService.getVillageFullData().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">लोड होत आहे...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">डेटा लोड करण्यात अयशस्वी</div>;
  }

  const { village: v, content, heroSlides, members, notices, programs, gallery, awards } = data;
  const villageName = v.name || village?.name || "";

  return (
    <>
      <HeroBanner slides={heroSlides} villageName={villageName} />
      <StatsBar stats={content.village_stats} />
      {notices.length > 0 && <NoticeTicker notices={notices} />}
      <AboutPreview about={content.about || {}} villageName={villageName} />
      <AdminPreview members={members} />
      <NoticesPreview notices={notices} />
      <GalleryPreview images={gallery} />
      <ProgramsPreview programs={programs} />
      <AwardsPreview awards={awards} />
      <ContactCTA villageName={villageName} />
    </>
  );
}
