import { Link } from "react-router-dom";
import AnimatedSection from "../components/AnimatedSection";

interface Props {
  about?: Record<string, unknown>;
  villageName: string;
}

/** Reusable image collage: Row 1 = 1 large img (60%), Row 2 = 2 imgs (40%) */
function ImageCollage({ images, villageName }: { images: string[]; villageName: string }) {
  if (images.length >= 2) {
    return (
      <div className="flex flex-col gap-2 sm:gap-3 h-auto sm:h-[380px]">
        <div className="rounded-2xl overflow-hidden shadow-lg" style={{ flex: "5 1 0%" }}>
          <img src={images[0]} alt={`${villageName} - 1`} className="w-full h-48 sm:h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3" style={{ flex: "3 1 0%" }}>
          {images.slice(1, 3).map((img, i) => (
            <div key={i} className="rounded-xl overflow-hidden shadow-md">
              <img src={img} alt={`${villageName} - ${i + 2}`} className="w-full h-32 sm:h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="relative">
        <img src={images[0]} alt={villageName} className="rounded-2xl shadow-lg w-full h-56 sm:h-80 object-cover" loading="lazy" />
        <div className="absolute -bottom-3 -right-3 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl -z-10 shadow-lg shadow-orange-500/20" />
        <div className="absolute -top-2 -left-2 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-400 rounded-xl -z-10 opacity-60" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 h-56 sm:h-80 flex items-center justify-center">
      <div className="text-center">
        <span className="text-5xl sm:text-6xl">🏘️</span>
        <p className="text-orange-600 font-medium mt-3">{villageName}</p>
      </div>
    </div>
  );
}

export default function AboutSection({ about, villageName }: Props) {
  const title = (about?.title as string) || `${villageName} बद्दल`;
  const description1 = (about?.description1 as string) || `${villageName} ग्रामपंचायत महाराष्ट्रातील एक प्रगतीशील गाव आहे. गावाच्या विकासासाठी आमची ग्रामपंचायत सतत कार्यरत आहे.`;
  const image = (about?.image as string) || "";
  const images = (about?.images as string[]) || [];
  const allImages = images.length > 0 ? images.slice(0, 3) : image ? [image] : [];

  // Check if description1 contains HTML tags (rich text from editor)
  const isHtml = /<[a-z][\s\S]*>/i.test(description1);

  return (
    <section className="py-12 sm:py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          <AnimatedSection animation="fadeLeft" duration={0.7}>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border text-orange-600 bg-orange-50 border-orange-200 mb-3">
                आमच्याबद्दल
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 sm:mb-6">{title}</h2>
              {isHtml ? (
                <div
                  className="prose prose-sm sm:prose-base prose-gray max-w-none mb-6 break-words [&_p]:text-gray-600 [&_p]:leading-relaxed [&_p]:break-words [&_p]:whitespace-pre-wrap [&_a]:text-orange-600 [&_a]:underline"
                  style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
                  dangerouslySetInnerHTML={{ __html: description1 }}
                />
              ) : (
                <p className="text-gray-600 leading-relaxed mb-6 text-sm sm:text-base break-words whitespace-pre-wrap">{description1}</p>
              )}
              <Link
                to="/about"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 text-sm sm:text-base"
              >
                अधिक वाचा
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </AnimatedSection>
          <AnimatedSection animation="fadeRight" duration={0.7} delay={0.15}>
            <div className="relative">
              <ImageCollage images={allImages} villageName={villageName} />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

export { ImageCollage };
