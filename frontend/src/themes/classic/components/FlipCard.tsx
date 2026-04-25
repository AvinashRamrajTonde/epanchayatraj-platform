import { useState } from "react";
import { motion } from "framer-motion";
import type { Member } from "../../../services/publicService";
import { resolveUrl } from "../../../utils/resolveUrl";

interface Props {
  member: Member;
}

export default function FlipCard({ member }: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="group perspective-1000 h-72 cursor-pointer"
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-lg"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="relative h-full bg-gradient-to-br from-orange-50 to-amber-50 flex flex-col items-center justify-center p-5">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-amber-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            {member.photoUrl ? (
              <img
                src={resolveUrl(member.photoUrl)}
                alt={member.name}
                className="w-48 h-48 rounded object-cover border-3 border-white shadow-md mb-3 ring-2 ring-orange-500/20"
                loading="lazy"
              />
            ) : (
              <div className="w-48 h-48 rounded bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center mb-3 shadow-md ring-2 ring-orange-500/20">
                <span className="text-white text-3xl font-bold">
                  {member.name.charAt(0)}
                </span>
              </div>
            )}
            <h3 className="font-bold text-gray-800 text-lg text-center leading-tight">
              {member.name}
            </h3>
            <p className="text-orange-600 text-sm font-medium mt-1">{member.designation}</p>
            <div className="mt-3 text-xs text-gray-400 flex items-center gap-1">
              <span className="animate-pulse">↻</span> कार्ड फिरवा
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-lg"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="relative h-full bg-gradient-to-br from-orange-600 to-amber-500 text-white flex flex-col items-center justify-center p-5">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            <div className="relative z-10 text-center">
              <h3 className="font-bold text-xl mb-1">{member.name}</h3>
              <p className="text-orange-100 text-sm font-medium mb-4 bg-white/10 px-3 py-1 rounded-full inline-block">
                {member.designation}
              </p>
              <div className="space-y-2 text-sm">
                {member.phone && (
                  <a
                    href={`tel:${member.phone}`}
                    className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 px-4 py-2 rounded-lg transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    📞 {member.phone}
                  </a>
                )}
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 px-4 py-2 rounded-lg transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    ✉️ {member.email}
                  </a>
                )}
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(member as any).address && (
                  <p className="text-orange-100/80 text-xs mt-2">📍 {(member as any).address}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
