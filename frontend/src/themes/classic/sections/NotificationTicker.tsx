import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Notice } from "../../../services/publicService";

interface Props {
  notices: Notice[];
}

export default function NotificationTicker({ notices }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationId: number;
    let position = 0;

    const animate = () => {
      if (!paused) {
        position -= 1;
        const scrollWidth = container.scrollWidth / 2;
        if (Math.abs(position) >= scrollWidth) {
          position = 0;
        }
        container.style.transform = `translateX(${position}px)`;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [paused]);

  if (notices.length === 0) return null;

  const urgentNotices = notices.filter((n) => n.priority === "high" || n.category === "urgent");
  const tickerNotices = urgentNotices.length > 0 ? urgentNotices : notices.slice(0, 5);

  return (
    <div className="bg-orange-50 border-y border-orange-200">
      <div className="max-w-7xl mx-auto flex items-center">
        <div className="flex-shrink-0 bg-orange-500 text-white px-4 py-2.5 font-bold text-sm flex items-center gap-1.5">
          <span className="animate-pulse">📢</span> सूचना
        </div>
        <div
          className="flex-1 overflow-hidden py-2.5"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div ref={containerRef} className="flex whitespace-nowrap">
            {[...tickerNotices, ...tickerNotices].map((notice, i) => (
              <Link
                key={`${notice.id}-${i}`}
                to="/notices"
                className="inline-flex items-center gap-2 px-6 text-sm text-gray-700 hover:text-orange-600 transition-colors"
              >
                <span className="text-orange-500">●</span>
                <span>{notice.title}</span>
                {notice.category === "urgent" && (
                  <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">तातडीचे</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
