import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion, useInView } from "framer-motion";
import confetti from "canvas-confetti";
import { content } from "../content";
import { ScallopDivider } from "./ScallopDivider";

import { DoodleStar, SquiggleUnderline } from "./Doodles";

export function Letter() {
  const reduced = useReducedMotion();
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const letterRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(letterRef, { once: true, margin: "-60px" });

  const paragraphs = content.letter.split("\n").filter((l) => l.trim() !== "");

  /* Open envelope */
  const openEnvelope = () => {
    setEnvelopeOpen(true);
    setTimeout(() => setShowLetter(true), 700);
  };

  /* Reveal lines as letter scrolls into view */
  useEffect(() => {
    if (!showLetter || !isInView) return;
    if (visibleLines >= paragraphs.length + 1) {
      // +1 for signature — fire finale confetti
      confetti({
        particleCount: 40,
        spread: 90,
        origin: { y: 0.7 },
        colors: ["#F6B72D", "#F29AB0", "#FBEFF3", "#F8CFDA"],
      });
      return;
    }
    const t = setTimeout(
      () => setVisibleLines((v) => v + 1),
      reduced ? 50 : 400
    );
    return () => clearTimeout(t);
  }, [showLetter, isInView, visibleLines, paragraphs.length, reduced]);

  return (
    <>
      <ScallopDivider fromColor="var(--marigold)" toColor="var(--plum)" />
      <section
        className="bg-section-letter py-12 px-5 sm:px-8"
        aria-label="Birthday letter"
        ref={letterRef}
      >
        <div className="mb-8">
          <h2 className="font-display text-2xl flex items-center gap-2" style={{ color: "var(--marigold)" }}>
            A letter for you
            <DoodleStar color="var(--marigold)" size={20} />
          </h2>
          <SquiggleUnderline color="var(--marigold)" width={95} />
        </div>

        {/* ── Envelope ────────────────────────────────── */}
        {!showLetter && (
          <div className="flex justify-start">
            <button
              onClick={openEnvelope}
              className="relative"
              style={{ width: "min(80vw, 280px)", cursor: "pointer", background: "none", border: "none", padding: 0 }}
              aria-label="Open the letter"
            >
              <svg viewBox="0 0 280 180" className="w-full h-auto">
                {/* Envelope body */}
                <rect x="10" y="40" width="260" height="130" rx="6" fill="var(--petal)" />
                {/* Envelope flap */}
                <motion.path
                  d="M10 40 L140 110 L270 40"
                  fill="var(--rose)"
                  stroke="var(--plum)"
                  strokeWidth="0.5"
                  style={{ transformOrigin: "140px 40px" }}
                  animate={envelopeOpen ? { rotateX: 180, y: -5 } : { rotateX: 0 }}
                  transition={{ duration: 0.5 }}
                />
                {/* Inner shadow */}
                <rect x="20" y="55" width="240" height="105" rx="3" fill="var(--blush-white)" opacity="0.3" />
                {/* Heart seal */}
                <motion.g
                  style={{ transformOrigin: "140px 65px" }}
                  animate={envelopeOpen ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <circle cx="140" cy="65" r="14" fill="var(--rose)" />
                  <path
                    d="M133 62 Q133 56 140 61 Q147 56 147 62 Q147 68 140 73 Q133 68 133 62"
                    fill="var(--plum)"
                    opacity="0.7"
                  />
                </motion.g>
                {/* Text hint */}
                {!envelopeOpen && (
                  <text
                    x="140"
                    y="140"
                    textAnchor="middle"
                    fontFamily="var(--font-body)"
                    fontSize="11"
                    fill="var(--plum)"
                    opacity="0.4"
                  >
                    Tap to open
                  </text>
                )}
              </svg>
            </button>
          </div>
        )}

        {/* ── Letter content ──────────────────────────── */}
        <AnimatePresence>
          {showLetter && (
            <motion.div
              className="paper-texture rounded-sm p-6 sm:p-8 prose-width"
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {paragraphs.map((para, i) => (
                <motion.p
                  key={i}
                  className="font-body text-sm leading-relaxed mb-4"
                  style={{
                    color: "var(--plum)",
                    opacity: i < visibleLines ? 1 : 0,
                    transform: i < visibleLines ? "translateY(0)" : "translateY(8px)",
                    transition: reduced ? "none" : "opacity 0.4s ease, transform 0.4s ease",
                  }}
                >
                  {para}
                </motion.p>
              ))}

              {/* Signature */}
              <motion.p
                className="font-signature text-xl mt-6"
                style={{
                  color: "var(--plum)",
                  opacity: visibleLines > paragraphs.length ? 1 : 0,
                  transform: visibleLines > paragraphs.length ? "translateY(0)" : "translateY(8px)",
                  transition: reduced ? "none" : "opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s",
                }}
              >
                {content.signature}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
}
