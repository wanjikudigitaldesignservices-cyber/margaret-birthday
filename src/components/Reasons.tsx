import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { content } from "../content";
import { ScallopDivider } from "./ScallopDivider";

import { DoodleHeart, SquiggleUnderline } from "./Doodles";

/* Vary size, rotation, and margin for each card so they don't look like a grid */
const CARD_STYLES: { rotate: string; width: string; ml: string }[] = [
  { rotate: "-1.5deg", width: "88%", ml: "0" },
  { rotate: "1deg", width: "78%", ml: "auto" },
  { rotate: "-0.5deg", width: "84%", ml: "8%" },
  { rotate: "1.5deg", width: "75%", ml: "auto" },
  { rotate: "-2deg", width: "90%", ml: "0" },
  { rotate: "0.8deg", width: "80%", ml: "12%" },
  { rotate: "-1deg", width: "82%", ml: "auto" },
];

export function Reasons() {
  const reduced = useReducedMotion();
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <>
      <ScallopDivider fromColor="var(--rose)" toColor="var(--marigold)" />
      <section className="bg-section-reasons py-12 px-5 sm:px-8" aria-label="Reasons you are loved">
        <div className="mb-2">
          <h2 className="font-display text-2xl flex items-center gap-2" style={{ color: "var(--plum)" }}>
            {content.reasons.length} reasons
            <DoodleHeart color="var(--rose)" size={22} />
          </h2>
          <SquiggleUnderline color="var(--plum)" width={85} />
        </div>
        <p className="font-body text-sm mb-8" style={{ color: "var(--plum)", opacity: 0.65 }}>
          Tap each one to reveal it
        </p>

        <div className="space-y-4">
          {content.reasons.map((reason, i) => {
            const style = CARD_STYLES[i % CARD_STYLES.length];
            const isRevealed = revealed.has(i);

            return (
              <motion.div
                key={i}
                style={{
                  width: style.width,
                  marginLeft: style.ml,
                  marginRight: style.ml === "auto" ? "0" : undefined,
                  transform: `rotate(${style.rotate})`,
                }}
                initial={reduced ? {} : { opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full text-left px-4 py-3 rounded-sm font-body transition-colors duration-200"
                  style={{
                    backgroundColor: isRevealed ? "var(--plum)" : "rgba(42,15,46,0.1)",
                    color: isRevealed ? "var(--marigold)" : "var(--plum)",
                    border: "none",
                    cursor: "pointer",
                    minHeight: 44,
                  }}
                  aria-expanded={isRevealed}
                  aria-label={isRevealed ? reason : `Reveal reason ${i + 1}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="font-display text-lg flex-shrink-0 mt-0.5"
                      style={{ opacity: 0.5, width: 20 }}
                    >
                      {i + 1}
                    </span>
                    <AnimatePresence mode="wait">
                      {isRevealed ? (
                        <motion.span
                          key="revealed"
                          className="text-sm leading-relaxed"
                          initial={reduced ? {} : { opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {reason}
                        </motion.span>
                      ) : (
                        <motion.span
                          key="hidden"
                          className="text-sm"
                          style={{ opacity: 0.4 }}
                          initial={{ opacity: 0.4 }}
                          exit={{ opacity: 0 }}
                        >
                          Tap to reveal
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </section>
    </>
  );
}
