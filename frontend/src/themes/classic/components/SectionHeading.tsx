import AnimatedSection from "./AnimatedSection";

interface Props {
  badge: string;
  title: string;
  subtitle?: string;
  badgeColor?: string;
  align?: "left" | "center";
  children?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export default function SectionHeading({
  badge,
  title,
  subtitle,
  badgeColor = "text-orange-600 bg-orange-50 border-orange-200",
  align = "left",
  rightAction,
}: Props) {
  const isCenter = align === "center";

  return (
    <AnimatedSection animation="fadeUp">
      <div
        className={`mb-10 ${
          isCenter
            ? "text-center"
            : "flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        }`}
      >
        <div>
          <span
            className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${badgeColor} mb-3`}
          >
            {badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
            {title}
          </h2>
          {subtitle && (
            <p
              className={`text-gray-500 mt-2 text-sm sm:text-base ${
                isCenter ? "max-w-xl mx-auto" : "max-w-xl"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
        {rightAction && <div className="flex-shrink-0">{rightAction}</div>}
      </div>
    </AnimatedSection>
  );
}
