import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import type { Program } from "../../../services/publicService";
import { resolveUrl } from "../../../utils/resolveUrl";
import AnimatedSection, { StaggerContainer, StaggerItem } from "../components/AnimatedSection";

interface Props {
  programs: Program[];
}

/** Image Slider for program popup */
function ImageSlider({ images, title }: { images: string[]; title: string }) {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(() => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1)), [images.length]);
  const next = useCallback(() => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1)), [images.length]);

  if (images.length === 0) {
    return (
      <div className="h-56 sm:h-72 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center rounded-xl">
        <span className="text-6xl text-white/80">🏗️</span>
      </div>
    );
  }

  return (
    <div className="relative group/slider">
      <div className="relative h-56 sm:h-72 overflow-hidden rounded-xl">
        {images.map((img, i) => (
          <img
            key={i}
            src={resolveUrl(img)}
            alt={`${title} - ${i + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
              i === current ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
          />
        ))}
        {/* Image counter badge */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium">
            {current + 1} / {images.length}
          </div>
        )}
      </div>
      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current ? "w-6 h-2 bg-green-500" : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProgramsPreview({ programs }: Props) {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <AnimatedSection animation="fadeUp">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-green-600 font-semibold text-sm uppercase tracking-wide">
                विकास कामे
              </span>
              <h2 className="text-3xl font-bold text-gray-800 mt-2">
                गावातील विकास प्रकल्प
              </h2>
            </div>
            <Link
              to="/programs"
              className="text-green-600 font-medium hover:text-green-700 flex items-center gap-1"
            >
              सर्व पहा →
            </Link>
          </div>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.12}>
          {programs.map((program) => {
            const firstImage = program.images && program.images.length > 0 ? program.images[0] : null;
            return (
              <StaggerItem key={program.id}>
                <div
                  onClick={() => setSelectedProgram(program)}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 block hover:-translate-y-1 cursor-pointer"
                >
                  {firstImage ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={resolveUrl(firstImage)}
                        alt={program.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-green-500 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">
                          {program.category}
                        </span>
                      </div>
                      {program.images && program.images.length > 1 && (
                        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                          🖼️ {program.images.length}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                      <span className="text-5xl text-white/80">🏗️</span>
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                      {program.title}
                    </h3>
                    {program.description && (
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                        {program.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        {program.location && (
                          <span className="flex items-center gap-1">📍 {program.location}</span>
                        )}
                        {program.date && (
                          <span className="flex items-center gap-1">
                            📅 {new Date(program.date).toLocaleDateString("mr-IN")}
                          </span>
                        )}
                      </div>
                      <span className="text-green-600 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        पहा
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>

      {/* Program Detail Popup with Image Slider */}
      {selectedProgram && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedProgram(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-teal-500 px-5 py-4 flex items-center justify-between rounded-t-2xl sticky top-0 z-10">
              <h3 className="text-white font-bold text-sm sm:text-base flex items-center gap-2 truncate">
                🏗️ {selectedProgram.title}
              </h3>
              <button
                onClick={() => setSelectedProgram(null)}
                className="text-white/80 hover:text-white text-2xl flex-shrink-0 ml-2"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 space-y-4">
              {/* Image Slider */}
              <ImageSlider
                images={selectedProgram.images || []}
                title={selectedProgram.title}
              />

              {/* Category & Date */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                  {selectedProgram.category}
                </span>
                {selectedProgram.date && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                    📅 {new Date(selectedProgram.date).toLocaleDateString("mr-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
                {selectedProgram.location && (
                  <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                    📍 {selectedProgram.location}
                  </span>
                )}
              </div>

              {/* Description */}
              {selectedProgram.description && (
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                  {selectedProgram.description}
                </p>
              )}

              {/* Highlights */}
              {selectedProgram.highlights && selectedProgram.highlights.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-2">मुख्य मुद्दे:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProgram.highlights.map((h, i) => (
                      <span key={i} className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-md border border-green-100">
                        ✅ {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Result */}
              {selectedProgram.result && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
                  <p className="text-xs text-gray-500 mb-1">निकाल / परिणाम</p>
                  <p className="text-sm text-emerald-700 font-medium">{selectedProgram.result}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export { ImageSlider };
