import { motion, useReducedMotion } from "framer-motion";

export function SquiggleUnderline({ color = "currentColor", width = 90 }: { color?: string; width?: number }) {
  const reduced = useReducedMotion();

  return (
    <svg
      viewBox="0 0 120 12"
      className="block mt-1.5"
      style={{ width, height: 10 }}
      aria-hidden="true"
    >
      <motion.path
        d="M 3 6 Q 13 1 23 6 Q 33 11 43 6 Q 53 1 63 6 Q 73 11 83 6 Q 93 1 103 6 Q 113 11 117 6"
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </svg>
  );
}

export function DoodleHeart({ color = "var(--rose)", size = 26 }: { color?: string; size?: number }) {
  const reduced = useReducedMotion();

  return (
    <svg viewBox="0 0 32 32" style={{ width: size, height: size }} aria-hidden="true">
      <motion.path
        d="M 16 28 C 16 28 4 20 4 12 C 4 6 9 3 13 6 C 15 8 16 10 16 10 C 16 10 17 8 19 6 C 23 3 28 6 28 12 C 28 20 16 28 16 28 Z"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
      />
    </svg>
  );
}

export function DoodleStar({ color = "var(--marigold)", size = 24 }: { color?: string; size?: number }) {
  const reduced = useReducedMotion();

  return (
    <svg viewBox="0 0 32 32" style={{ width: size, height: size }} aria-hidden="true">
      <motion.path
        d="M 16 2 L 19 12 L 30 12 L 21 18 L 24 29 L 16 22 L 8 29 L 11 18 L 2 12 L 13 12 Z"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.85, ease: "easeOut" }}
      />
    </svg>
  );
}

export function DoodleFlower({ color = "var(--petal)", centerColor = "var(--marigold)", size = 28 }: { color?: string; centerColor?: string; size?: number }) {
  const reduced = useReducedMotion();

  return (
    <svg viewBox="0 0 36 36" style={{ width: size, height: size }} aria-hidden="true">
      {/* 5 petals */}
      <motion.path
        d="M 18 13 C 18 8 14 6 12 9 C 10 12 13 15 15 16
           C 11 14 7 17 8 20 C 10 23 14 21 16 19
           C 14 23 17 26 20 25 C 23 23 21 19 19 17
           C 23 19 26 16 25 13 C 23 10 19 12 17 14
           C 19 10 16 7 13 8"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
      />
      {/* Flower center */}
      <motion.circle
        cx="18"
        cy="18"
        r="3"
        fill={centerColor}
        initial={reduced ? { scale: 1 } : { scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.3 }}
      />
    </svg>
  );
}

export function DoodleSwirl({ color = "var(--rose)", size = 26 }: { color?: string; size?: number }) {
  const reduced = useReducedMotion();

  return (
    <svg viewBox="0 0 32 32" style={{ width: size, height: size }} aria-hidden="true">
      <motion.path
        d="M 16 16 A 2 2 0 0 1 18 16 A 4 4 0 0 1 14 18 A 7 7 0 0 1 18 11 A 11 11 0 0 1 27 20"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
      />
    </svg>
  );
}
