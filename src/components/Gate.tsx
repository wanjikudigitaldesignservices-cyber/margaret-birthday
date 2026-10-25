import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { content } from "../content";

interface GateProps {
  onOpen: () => void;
}

export function Gate({ onOpen }: GateProps) {
  const [phase, setPhase] = useState<"closed" | "opening" | "gone">("closed");
  const reduced = useReducedMotion();

  const handleTap = () => {
    if (phase !== "closed") return;
    setPhase("opening");
    onOpen();
    setTimeout(() => {
      setPhase("gone");
    }, reduced ? 200 : 950);
  };

  if (phase === "gone") return null;

  return (
    <AnimatePresence>
      <motion.div
        key="gate"
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{ backgroundColor: "var(--plum)" }}
        initial={{ y: 0, opacity: 1 }}
        animate={phase === "opening" ? (reduced ? { opacity: 0 } : { y: "-100%", opacity: 0 }) : { y: 0, opacity: 1 }}
        transition={reduced ? { duration: 0.15 } : { duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
      >
          {/* Gift box SVG */}
          <motion.svg
            viewBox="0 0 220 260"
            className="w-48 h-auto mb-8"
            aria-hidden="true"
            initial={{ scale: 1 }}
            animate={
              phase === "opening"
                ? reduced
                  ? { opacity: 0 }
                  : { scale: 1.1, y: -20 }
                : { scale: 1 }
            }
            transition={{ duration: 0.4 }}
          >
            {/* Box body */}
            <rect x="35" y="130" width="150" height="110" rx="5" fill="var(--rose)" />
            {/* Box shadow */}
            <rect x="35" y="220" width="150" height="20" rx="5" fill="var(--petal)" opacity="0.5" />

            {/* Ribbon vertical */}
            <rect x="100" y="130" width="20" height="110" fill="var(--marigold)" />
            {/* Ribbon horizontal */}
            <rect x="35" y="170" width="150" height="18" fill="var(--marigold)" />

            {/* Lid */}
            <motion.g
              animate={phase === "opening" ? { y: -30, rotate: -5 } : { y: 0, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{ transformOrigin: "110px 120px" }}
            >
              <rect x="25" y="105" width="170" height="30" rx="5" fill="var(--petal)" />
              <rect x="100" y="105" width="20" height="30" fill="var(--marigold)" />
            </motion.g>

            {/* Bow */}
            <motion.g
              animate={
                phase === "opening"
                  ? { scale: 1.2, y: -35, opacity: 0 }
                  : { scale: 1, y: 0, opacity: 1 }
              }
              transition={{ duration: 0.4 }}
              style={{ transformOrigin: "110px 95px" }}
            >
              {/* Left loop */}
              <ellipse cx="88" cy="98" rx="22" ry="16" fill="var(--marigold)" />
              <ellipse cx="88" cy="98" rx="14" ry="9" fill="var(--rose)" opacity="0.3" />
              {/* Right loop */}
              <ellipse cx="132" cy="98" rx="22" ry="16" fill="var(--marigold)" />
              <ellipse cx="132" cy="98" rx="14" ry="9" fill="var(--rose)" opacity="0.3" />
              {/* Center knot */}
              <ellipse cx="110" cy="102" rx="10" ry="7" fill="#D4960F" />
              {/* Tails */}
              <path d="M100 105 L82 135 L92 128 Z" fill="var(--marigold)" opacity="0.85" />
              <path d="M120 105 L138 135 L128 128 Z" fill="var(--marigold)" opacity="0.85" />
            </motion.g>

            {/* Decorative dots on box */}
            <circle cx="60" cy="155" r="3" fill="var(--marigold)" opacity="0.4" />
            <circle cx="80" cy="200" r="2.5" fill="var(--marigold)" opacity="0.3" />
            <circle cx="155" cy="160" r="2" fill="var(--marigold)" opacity="0.35" />
            <circle cx="140" cy="210" r="3" fill="var(--marigold)" opacity="0.4" />
            <circle cx="65" cy="180" r="1.5" fill="var(--blush-white)" opacity="0.5" />
            <circle cx="160" cy="190" r="2" fill="var(--blush-white)" opacity="0.4" />
          </motion.svg>

          {/* Title */}
          <motion.p
            className="font-body text-base mb-6 px-6 text-center"
            style={{ color: "var(--blush-white)", opacity: 0.85 }}
            animate={phase === "opening" ? { opacity: 0, y: -10 } : { opacity: 0.85 }}
            transition={{ duration: 0.3 }}
          >
            {content.gate.title}
          </motion.p>

          {/* Open button */}
          <motion.button
            className="pill-btn"
            style={{
              backgroundColor: "var(--marigold)",
              color: "var(--plum)",
            }}
            onClick={handleTap}
            whileTap={reduced ? {} : { scale: 0.95 }}
            animate={phase === "opening" ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            aria-label={content.gate.button}
          >
            {content.gate.button}
          </motion.button>
        </motion.div>
    </AnimatePresence>
  );
}
