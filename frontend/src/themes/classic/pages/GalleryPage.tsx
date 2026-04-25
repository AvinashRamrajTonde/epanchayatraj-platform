import { useEffect, useState, useCallback } from "react";
import { publicService, type GalleryImage } from "../../../services/publicService";
import { resolveUrl } from "../../../utils/resolveUrl";
import SeoHead from "../components/SeoHead";
import SectionHero from "../components/SectionHero";
import { StaggerContainer, StaggerItem } from "../components/AnimatedSection";

const CATEGORIES = [
  { key: "all", label: "सर्व" },
  { key: "general", label: "सामान्य" },
  { key: "events", label: "कार्यक्रम" },
  { key: "infrastructure", label: "पायाभूत सुविधा" },
  { key: "heritage", label: "वारसा" },
  { key: "nature", label: "निसर्ग" },
  { key: "development", label: "विकासकामे" },
];

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    publicService
      .getGallery()
      .then(setImages)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    category === "all" ? images : images.filter((i) => i.category === category);

  const openLightbox = (idx: number) => setLightbox(idx);
  const closeLightbox = () => setLightbox(null);

  const goNext = useCallback(() => {
    if (lightbox === null) return;
    setLightbox((lightbox + 1) % filtered.length);
  }, [lightbox, filtered.length]);

  const goPrev = useCallback(() => {
    if (lightbox === null) return;
    setLightbox((lightbox - 1 + filtered.length) % filtered.length);
  }, [lightbox, filtered.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [lightbox, goNext, goPrev]);

  // Count per category for badges
  const categoryCounts = CATEGORIES.map((c) => ({
    ...c,
    count:
      c.key === "all"
        ? images.length
        : images.filter((i) => i.category === c.key).length,
  }));

  return (
    <>
      <SeoHead title="फोटो गॅलरी" path="/gallery" />

      <SectionHero
        title="फोटो गॅलरी"
        subtitle="गावातील विविध कार्यक्रम, विकासकामे व नैसर्गिक सौंदर्य"
        gradient="from-purple-700 to-fuchsia-600"
      />

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {categoryCounts.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  category === c.key
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {c.label}
                {c.count > 0 && (
                  <span className="ml-1.5 text-xs opacity-70">({c.count})</span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <span className="text-5xl block mb-4">📷</span>
              या प्रवर्गात फोटो उपलब्ध नाहीत
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((img, idx) => (
                <StaggerItem
                  key={img.id}
                  className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer border border-gray-100"
                  onClick={() => openLightbox(idx)}
                >
                  <img
                    src={resolveUrl(img.imageUrl)}
                    alt={img.title || ''}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <div>
                      <p className="text-white text-sm font-medium leading-tight">
                        {img.title}
                      </p>
                      {img.caption && (
                        <p className="text-white/70 text-xs mt-0.5">
                          {img.caption}
                        </p>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && filtered[lightbox] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl z-10"
            onClick={closeLightbox}
            aria-label="बंद करा"
          >
            ✕
          </button>

          {/* Prev */}
          {filtered.length > 1 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl z-10"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="मागील"
            >
              ‹
            </button>
          )}

          {/* Image */}
          <div
            className="max-w-[90vw] max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={resolveUrl(filtered[lightbox].imageUrl)}
              alt={filtered[lightbox].title || ''}
              className="max-w-full max-h-[75vh] object-contain rounded"
            />
            <div className="text-center mt-3">
              <p className="text-white font-medium">
                {filtered[lightbox].title}
              </p>
              {filtered[lightbox].caption && (
                <p className="text-white/60 text-sm mt-1">
                  {filtered[lightbox].caption}
                </p>
              )}
              <p className="text-white/40 text-xs mt-1">
                {lightbox + 1} / {filtered.length}
              </p>
            </div>
          </div>

          {/* Next */}
          {filtered.length > 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl z-10"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="पुढील"
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  );
}
