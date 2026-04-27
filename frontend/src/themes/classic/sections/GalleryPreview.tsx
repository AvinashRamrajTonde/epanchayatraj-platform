import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import type { GalleryImage } from "../../../services/publicService";
import { resolveUrl } from "../../../utils/resolveUrl";
import { getYouTubeId, getYouTubeThumbnail, getYouTubeEmbedUrl } from "../../../utils/youtube";
import SectionHeading from "../components/SectionHeading";

interface Props {
  images: GalleryImage[];
}

export default function GalleryPreview({ images }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el?.removeEventListener("scroll", checkScroll);
  }, [checkScroll, images]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  const openLightbox = (idx: number) => setLightbox(idx);
  const closeLightbox = () => setLightbox(null);
  const goNext = useCallback(() => {
    if (lightbox === null) return;
    setLightbox((lightbox + 1) % images.length);
  }, [lightbox, images.length]);
  const goPrev = useCallback(() => {
    if (lightbox === null) return;
    setLightbox((lightbox - 1 + images.length) % images.length);
  }, [lightbox, images.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [lightbox, goNext, goPrev]);

  if (images.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading
          badge="📸 फोटो गॅलरी"
          title="गावाचे क्षणचित्रे"
          align="center"
          badgeColor="text-purple-600 bg-purple-50 border-purple-200"
          rightAction={
            <Link
              to="/gallery"
              className="text-orange-600 font-medium hover:text-orange-700 flex items-center gap-1 text-sm sm:text-base"
            >
              सर्व पहा
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          }
        />

        {/* Slider with arrows */}
        <div className="relative group/slider">
          {/* Left arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-orange-600 hover:shadow-xl transition-all opacity-0 group-hover/slider:opacity-100 sm:opacity-100"
              aria-label="Scroll left"
            >
              ‹
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {images.map((img, idx) => (
              <div
                key={img.id}
                onClick={() => openLightbox(idx)}
                className="flex-shrink-0 w-[200px] sm:w-[240px] md:w-[260px] lg:w-[280px] group cursor-pointer"
              >
                {(() => {
                  const ytId = img.videoUrl ? getYouTubeId(img.videoUrl) : null;
                  const thumb = ytId ? getYouTubeThumbnail(ytId) : img.imageUrl ? resolveUrl(img.imageUrl) : null;
                  return (
                    <div className="relative rounded-xl overflow-hidden aspect-square shadow-sm hover:shadow-xl transition-all duration-300">
                      {thumb && (
                        <img
                          src={thumb}
                          alt={img.title || img.caption || "गॅलरी"}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                      )}
                      {ytId ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-red-600 rounded-full w-12 h-12 flex items-center justify-center shadow-lg opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all">
                            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                          <div className="text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            {img.title && <p className="font-medium text-sm">{img.title}</p>}
                            {img.caption && <p className="text-xs opacity-80">{img.caption}</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>

          {/* Right arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute -right-2 sm:right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-orange-600 hover:shadow-xl transition-all opacity-0 group-hover/slider:opacity-100 sm:opacity-100"
              aria-label="Scroll right"
            >
              ›
            </button>
          )}
        </div>
      </div>

      {/* Lightbox Popup */}
      {lightbox !== null && images[lightbox] && (
        <div
          className="fixed inset-0 z-[90] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-3 right-3 sm:top-5 sm:right-5 text-white/70 hover:text-white text-3xl z-10 w-10 h-10 flex items-center justify-center"
            onClick={closeLightbox}
            aria-label="बंद करा"
          >
            ✕
          </button>

          {images.length > 1 && (
            <>
              <button
                className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl sm:text-2xl z-10 backdrop-blur-sm"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                aria-label="मागील"
              >
                ‹
              </button>
              <button
                className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl sm:text-2xl z-10 backdrop-blur-sm"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                aria-label="पुढील"
              >
                ›
              </button>
            </>
          )}

          <div
            className="max-w-[92vw] sm:max-w-[85vw] max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const cur = images[lightbox];
              const ytId = cur.videoUrl ? getYouTubeId(cur.videoUrl) : null;
              return ytId ? (
                <div className="w-[90vw] sm:w-[70vw] max-w-3xl">
                  <div className="aspect-video rounded-lg overflow-hidden bg-black">
                    <iframe
                      src={getYouTubeEmbedUrl(ytId, true)}
                      title={cur.title || "YouTube Video"}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : (
                <img
                  src={resolveUrl(cur.imageUrl)}
                  alt={cur.title || ""}
                  className="max-w-full max-h-[78vh] object-contain rounded-lg"
                />
              );
            })()}
            <div className="text-center mt-3 px-4">
              {images[lightbox].title && (
                <p className="text-white font-medium text-sm sm:text-base">{images[lightbox].title}</p>
              )}
              {images[lightbox].caption && (
                <p className="text-white/60 text-xs sm:text-sm mt-1">{images[lightbox].caption}</p>
              )}
              <p className="text-white/40 text-xs mt-1">
                {lightbox + 1} / {images.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
