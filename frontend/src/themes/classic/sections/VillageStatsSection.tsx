import AnimatedSection, { StaggerContainer, StaggerItem } from "../components/AnimatedSection";
import AnimatedCounter from "../components/AnimatedCounter";

interface Props {
  stats?: Record<string, unknown>;
}

interface StatItem {
  key: string;
  icon: string;
  label: string;
  value: string;
}

/* Accent colors for icons & top border */
const ACCENT_COLORS = [
  { border: "border-t-blue-500", iconBg: "bg-blue-50", iconText: "text-blue-600" },
  { border: "border-t-emerald-500", iconBg: "bg-emerald-50", iconText: "text-emerald-600" },
  { border: "border-t-purple-500", iconBg: "bg-purple-50", iconText: "text-purple-600" },
  { border: "border-t-orange-500", iconBg: "bg-orange-50", iconText: "text-orange-600" },
  { border: "border-t-teal-500", iconBg: "bg-teal-50", iconText: "text-teal-600" },
  { border: "border-t-pink-500", iconBg: "bg-pink-50", iconText: "text-pink-600" },
  { border: "border-t-indigo-500", iconBg: "bg-indigo-50", iconText: "text-indigo-600" },
  { border: "border-t-rose-500", iconBg: "bg-rose-50", iconText: "text-rose-600" },
  { border: "border-t-cyan-500", iconBg: "bg-cyan-50", iconText: "text-cyan-600" },
  { border: "border-t-amber-500", iconBg: "bg-amber-50", iconText: "text-amber-600" },
];

/* Old-format fallback mapping */
const OLD_STAT_ITEMS = [
  { key: "population", label: "लोकसंख्या", icon: "👥" },
  { key: "families", label: "कुटुंबे", icon: "🏠" },
  { key: "voters", label: "मतदार", icon: "🗳️" },
  { key: "literacy", label: "साक्षरता दर", icon: "📚" },
  { key: "literacyRate", label: "साक्षरता दर", icon: "📚" },
  { key: "area", label: "क्षेत्रफळ", icon: "📐" },
  { key: "establishments", label: "आस्थापने", icon: "🏢" },
];

function resolveStats(stats: Record<string, unknown>): StatItem[] {
  const arr = stats.stats as StatItem[] | undefined;
  if (Array.isArray(arr) && arr.length > 0) {
    return arr.filter((s) => s.value !== undefined && s.value !== null && s.value !== "");
  }
  return OLD_STAT_ITEMS
    .filter((item) => stats[item.key] !== undefined && stats[item.key] !== null && stats[item.key] !== "")
    .map((item) => ({ ...item, value: String(stats[item.key]) }));
}

export default function VillageStatsSection({ stats }: Props) {
  if (!stats) return null;

  const displayStats = resolveStats(stats);
  if (displayStats.length === 0) return null;

  const gridCols =
    displayStats.length <= 3
      ? "grid-cols-1 sm:grid-cols-3"
      : displayStats.length <= 4
      ? "grid-cols-2 sm:grid-cols-4"
      : displayStats.length <= 6
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-orange-100/40 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 relative">
        <AnimatedSection animation="fadeUp" className="text-center mb-10 sm:mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border text-orange-600 bg-orange-50 border-orange-200 mb-3">
            📊 गाव माहिती
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900">
            गाव सांख्यिकी
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mt-2 max-w-xl mx-auto">
            आमच्या गावाची प्रमुख आकडेवारी
          </p>
        </AnimatedSection>

        <StaggerContainer className={`grid ${gridCols} gap-4 sm:gap-6`} staggerDelay={0.08}>
          {displayStats.map((item, idx) => {
            const val = String(item.value);
            const numericVal = parseInt(val.replace(/[^0-9]/g, ""), 10);
            const hasNumber = !isNaN(numericVal) && numericVal > 0;
            const suffix = val.replace(/[0-9,]/g, "").trim();
            const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length];

            return (
              <StaggerItem key={item.key} animation="scaleIn">
                <div
                  className={`bg-white rounded-2xl border border-gray-100 border-t-4 ${accent.border} p-5 sm:p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1`}
                >
                  <div className={`w-14 h-14 ${accent.iconBg} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-gray-800">
                    {hasNumber ? (
                      <AnimatedCounter end={numericVal} suffix={suffix ? ` ${suffix}` : ""} />
                    ) : (
                      val
                    )}
                  </p>
                  <p className={`text-sm font-medium mt-1.5 ${accent.iconText}`}>{item.label}</p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
