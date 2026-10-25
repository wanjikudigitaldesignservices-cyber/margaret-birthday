import { motion, useReducedMotion } from "framer-motion";
import { content } from "../content";
import { DoodleStar } from "./Doodles";

export function Hero({ started = true }: { started?: boolean }) {
  const reduced = useReducedMotion();
  const letters = content.name.split("");

  return (
    <section
      className="bg-section-hero relative overflow-hidden"
      style={{ minHeight: "100svh" }}
      aria-label="Birthday greeting"
    >
      <div className="px-5 pt-20 pb-16 sm:px-8">
        {/* Happy birthday label */}
        <motion.p
          className="font-body text-sm font-medium tracking-widest uppercase mb-3 flex items-center gap-2"
          style={{ color: "var(--plum)", opacity: 0.7 }}
          initial={reduced ? {} : { opacity: 0, x: -20 }}
          animate={started ? { opacity: 0.7, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Happy birthday
          <DoodleStar color="var(--plum)" size={16} />
        </motion.p>

        {/* Name — huge, full width */}
        <h1
          className="font-display leading-none tracking-tight"
          style={{
            fontSize: "clamp(3.5rem, 18vw, 8rem)",
            color: "var(--plum)",
            lineHeight: 0.95,
          }}
        >
          {letters.map((char, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={reduced ? {} : { opacity: 0, y: 40 }}
              animate={started ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{
                duration: 0.45,
                delay: reduced ? 0 : 0.4 + i * 0.07,
                ease: [0.2, 0.8, 0.3, 1],
              }}
            >
              {char}
            </motion.span>
          ))}
        </h1>

        {/* Date ticket-stub tag */}
        <motion.div
          className="mt-6 inline-block"
          initial={reduced ? {} : { opacity: 0, y: 20 }}
          animate={started ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.4, delay: reduced ? 0 : 1.0 }}
        >
          <span
            className="font-body text-xs font-semibold tracking-wider px-4 py-2 rounded-sm inline-block"
            style={{
              backgroundColor: "var(--plum)",
              color: "var(--marigold)",
              border: "1px dashed var(--marigold)",
            }}
          >
            {content.dateLabel}
          </span>
        </motion.div>

        {content.age !== null && (
          <motion.p
            className="font-display mt-4"
            style={{ fontSize: "1.5rem", color: "var(--plum)", opacity: 0.6 }}
            initial={reduced ? {} : { opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1.1 }}
          >
            {content.age} years
          </motion.p>
        )}
      </div>

      {/* Floating SVG balloons */}
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden" aria-hidden="true">
        {[
          { x: "75%", delay: 0.5, color: "var(--rose)", size: 28 },
          { x: "82%", delay: 0.7, color: "var(--petal)", size: 22 },
          { x: "60%", delay: 0.9, color: "var(--plum)", size: 20 },
          { x: "88%", delay: 1.1, color: "var(--rose)", size: 25 },
          { x: "68%", delay: 1.3, color: "var(--marigold)", size: 18 },
          { x: "78%", delay: 0.6, color: "var(--petal)", size: 24 },
        ].map((b, i) => (
          <motion.svg
            key={i}
            viewBox="0 0 40 55"
            className="absolute"
            style={{
              width: b.size,
              left: b.x,
              bottom: -60,
            }}
            initial={reduced ? { bottom: "60%" } : { bottom: -60 }}
            animate={started ? (reduced ? {} : { bottom: "75%" }) : { bottom: -60 }}
            transition={{
              duration: reduced ? 0 : 7,
              delay: b.delay + 0.3,
              ease: "easeOut",
            }}
          >
            <ellipse cx="20" cy="18" rx="14" ry="17" fill={b.color} opacity="0.7" />
            <path d="M20 35 L20 54" stroke={b.color} strokeWidth="0.8" opacity="0.5" />
            <ellipse cx="20" cy="18" rx="8" ry="10" fill="white" opacity="0.12" />
          </motion.svg>
        ))}
      </div>
    </section>
  );
}
