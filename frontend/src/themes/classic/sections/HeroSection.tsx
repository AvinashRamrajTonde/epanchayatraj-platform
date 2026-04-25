import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HeroSlide } from "../../../services/publicService";
import { resolveUrl } from "../../../utils/resolveUrl";

interface StatItem {
  key: string;
  icon: string;
  label: string;
  value: string;
}

interface Props {
  slides: HeroSlide[];
  hero?: Record<string, unknown>;
  villageStats?: Record<string, unknown>;
  village: { name: string; tehsil?: { name: string; district: string } };
}

export default function HeroSection({ slides, hero, villageStats, village }: Props) {
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % Math.max(slides.length, 1));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [slides.length, nextSlide]);

  const badge = (hero?.badge as string) || "🏛️ अधिकृत वेबसाइट";
  const title = (hero?.title as string) || `ग्रामपंचायत ${village.name}`;
  const description =
    (hero?.description as string) ||
    `ता. ${village.tehsil?.name || ""}, जि. ${village.tehsil?.district || ""} - गावाच्या विकासासाठी कटिबद्ध`;

  // Resolve stats to show on hero — from heroStatKeys (selecting from village_stats)
  const stats = useMemo(() => {
    const heroStatKeys = (hero?.heroStatKeys as string[]) || [];
    if (heroStatKeys.length === 0 || !villageStats) {
      // fallback to legacy hero.stats array
      return (hero?.stats as Array<{ label: string; value: string; icon?: string }>) || [];
    }
    // Read from village_stats (new dynamic array format)
    const statsArr = (villageStats.stats as StatItem[]) || [];
    if (statsArr.length > 0) {
      return heroStatKeys
        .map((key) => statsArr.find((s) => s.key === key))
        .filter(Boolean) as StatItem[];
    }
    // Fallback: old flat format
    return heroStatKeys
      .map((key) => {
        const val = villageStats[key] as string;
        if (!val) return null;
        return { key, label: key, value: val, icon: "" };
      })
      .filter(Boolean) as StatItem[];
  }, [hero, villageStats]);

  return (
    <section className="relative w-full h-[55vh] min-h-[300px] max-h-[380px] sm:h-[60vh] sm:min-h-[400px] sm:max-h-[500px] md:h-[65vh] md:min-h-[460px] md:max-h-[580px] lg:h-[70vh] lg:min-h-[520px] lg:max-h-[680px] xl:h-[75vh] xl:max-h-[800px] overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          {slides.length > 0 ? (
            <motion.div
              key={slides[current]?.id || current}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <img
                src={resolveUrl(slides[current]?.imageUrl)}
                alt={slides[current]?.altText || village.name}
                className="w-full h-full object-cover object-center"
              />
            </motion.div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-amber-600 to-orange-800 animate-gradient-shift" />
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none" />
      </div>

      {/* Floating particles - hidden on mobile */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden sm:block">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 lg:w-1.5 lg:h-1.5 bg-white/20 rounded-full animate-float"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center px-4 sm:px-6">
        <div className="text-center text-white w-full max-w-4xl">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block bg-white/15 backdrop-blur-md text-white px-3 py-1 sm:px-5 sm:py-2 rounded-full text-[11px] sm:text-sm font-medium mb-2 sm:mb-4 border border-white/20"
          >
            {badge}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-[22px] leading-snug sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 sm:mb-4 sm:leading-tight drop-shadow-lg"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-xs sm:text-base md:text-lg lg:text-xl text-white/90 mb-3 sm:mb-6 drop-shadow max-w-2xl mx-auto"
          >
            {description}
          </motion.p>

          {/* Stats row — horizontal scroll on mobile */}
          {stats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex items-center justify-start sm:justify-center gap-2.5 sm:gap-4 lg:gap-6 mt-1 sm:mt-4 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap"
            >
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 text-center bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 py-1.5 sm:px-5 sm:py-3 border border-white/10"
                >
                  {"icon" in stat && stat.icon && (
                    <div className="text-lg sm:text-xl mb-0.5">{stat.icon}</div>
                  )}
                  <div className="text-base sm:text-2xl md:text-3xl font-bold whitespace-nowrap">{stat.value}</div>
                  <div className="text-[10px] sm:text-sm text-white/80 whitespace-nowrap">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-2 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                i === current ? "bg-white w-5 sm:w-8 shadow-lg shadow-white/30" : "bg-white/40 w-1.5 sm:w-2 hover:bg-white/60"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Prev/Next arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((current - 1 + slides.length) % slides.length)}
            className="absolute left-1.5 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 bg-white/10 hover:bg-white/25 active:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all border border-white/10 hover:scale-110 text-base sm:text-xl"
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-1.5 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 bg-white/10 hover:bg-white/25 active:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all border border-white/10 hover:scale-110 text-base sm:text-xl"
            aria-label="Next slide"
          >
            ›
          </button>
        </>
      )}
    </section>
  );
}
