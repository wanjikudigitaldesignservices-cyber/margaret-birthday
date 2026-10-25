import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { content } from "../content";
import { ScallopDivider } from "./ScallopDivider";

interface Petal {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  angle: number;
  vAngle: number;
  color: string;
}

export function Bouquet() {
  const reduced = useReducedMotion();
  const { bouquet, name } = content;

  const [untied, setUntied] = useState(false);
  const [openedNotes, setOpenedNotes] = useState<Set<number>>(new Set());
  const [activeNoteIdx, setActiveNoteIdx] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animIdRef = useRef<number | null>(null);
  const petalsRef = useRef<Petal[]>([]);

  const totalNotes = bouquet.notes.length;
  const allOpened = openedNotes.size >= totalNotes;

  const handleUntie = () => {
    setUntied(true);
  };

  const handleOpenNote = (index: number) => {
    setOpenedNotes((prev) => new Set(prev).add(index));
    setActiveNoteIdx(index);
  };

  /* ── Canvas Petal Shower (max 40 particles) ───────────── */
  const initPetals = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 360);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const colors = ["#F8CFDA", "#F29AB0", "#F6B72D", "#FBEFF3", "#E8A5B8"];
    const count = 36; // <= 40 particles

    petalsRef.current = Array.from({ length: count }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * -height,
      r: 6 + Math.random() * 6,
      vx: (Math.random() - 0.5) * 1.2,
      vy: 1.2 + Math.random() * 1.5,
      angle: Math.random() * Math.PI * 2,
      vAngle: (Math.random() - 0.5) * 0.04,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    let isTabVisible = !document.hidden;
    const onVis = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);

    const render = () => {
      if (isTabVisible && ctx) {
        ctx.clearRect(0, 0, width, height);

        for (const p of petalsRef.current) {
          p.x += p.vx + Math.sin(p.angle) * 0.4;
          p.y += p.vy;
          p.angle += p.vAngle;

          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.beginPath();
          // Rose petal curve
          ctx.ellipse(0, 0, p.r * 1.2, p.r * 0.7, 0, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 0.85;
          ctx.fill();
          ctx.restore();
        }
      }
      animIdRef.current = requestAnimationFrame(render);
    };

    animIdRef.current = requestAnimationFrame(render);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, []);

  useEffect(() => {
    if (allOpened && !reduced) {
      const cleanup = initPetals();
      return cleanup;
    }
  }, [allOpened, reduced, initPetals]);

  return (
    <>
      <ScallopDivider fromColor="var(--marigold)" toColor="var(--rose)" />
      <section
        className="bg-section-bouquet py-12 px-5 sm:px-8 relative overflow-hidden"
        aria-label="Birthday bouquet of notes"
      >
        {/* Title */}
        <div className="max-w-md mx-auto text-center mb-6">
          <h2 className="font-display text-2xl sm:text-3xl" style={{ color: "var(--plum)" }}>
            {bouquet.title}
          </h2>
          <p className="font-body text-xs sm:text-sm mt-1" style={{ color: "var(--plum)", opacity: 0.75 }}>
            {untied
              ? `${openedNotes.size} of ${totalNotes} opened — tap any rose to view voucher`
              : "A hand-rolled bouquet of custom birthday vouchers. Tap the ribbon to untie!"}
          </p>
        </div>

        {/* ── Bouquet Graphic Area ──────────────────────── */}
        <div className="relative mx-auto flex flex-col items-center justify-center min-h-[380px] max-w-sm">
          {/* Petal shower canvas overlay */}
          {allOpened && (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 pointer-events-none z-20 w-full h-full"
              aria-hidden="true"
            />
          )}

          {/* SVG Bouquet container */}
          <div className="relative w-full max-w-[320px] h-[340px] flex items-center justify-center">
            {/* Wrap & Stems SVG */}
            <svg viewBox="0 0 300 320" className="w-full h-full" aria-hidden="true">
              {/* Green stems poking out */}
              <g stroke="var(--leaf)" strokeWidth="3" strokeLinecap="round" opacity="0.85">
                <path d="M150 260 Q130 180 90 90" />
                <path d="M150 260 Q140 180 120 75" />
                <path d="M150 260 Q145 170 140 65" />
                <path d="M150 260 Q150 170 155 60" />
                <path d="M150 260 Q155 170 170 65" />
                <path d="M150 260 Q160 180 190 75" />
                <path d="M150 260 Q170 180 220 90" />
              </g>

              {/* Foliage leaves */}
              <g fill="var(--leaf)" opacity="0.9">
                <path d="M110 130 Q90 120 85 135 Q100 145 110 130 Z" />
                <path d="M190 130 Q210 120 215 135 Q200 145 190 130 Z" />
                <path d="M135 150 Q115 155 120 170 Q135 165 135 150 Z" />
                <path d="M165 150 Q185 155 180 170 Q165 165 165 150 Z" />
              </g>

              {/* Rose paper wrap - Back */}
              <path
                d="M80 140 L150 300 L220 140 Q150 160 80 140 Z"
                fill="var(--petal)"
                opacity="0.9"
              />

              {/* Rose paper wrap - Front folding flaps */}
              <motion.path
                d="M60 120 L150 295 L145 160 Z"
                fill="var(--blush-white)"
                opacity="0.95"
                animate={untied ? { rotate: -15, transformOrigin: "150px 295px" } : { rotate: 0 }}
                transition={{ duration: 0.6 }}
              />
              <motion.path
                d="M240 120 L150 295 L155 160 Z"
                fill="var(--petal)"
                opacity="0.95"
                animate={untied ? { rotate: 15, transformOrigin: "150px 295px" } : { rotate: 0 }}
                transition={{ duration: 0.6 }}
              />

              {/* Central Cone fold */}
              <path
                d="M90 140 L150 295 L210 140 Q150 175 90 140 Z"
                fill="var(--rose)"
                opacity="0.6"
              />

              {/* Ribbon around wrap */}
              <rect x="125" y="215" width="50" height="14" rx="3" fill="var(--marigold)" />
            </svg>

            {/* ── 7 Rose Buds (positioned on top of stems) ── */}
            <div className="absolute inset-0 pointer-events-none">
              {bouquet.notes.map((note, i) => {
                // Fan out positions
                const angles = [-38, -26, -13, 0, 13, 26, 38];
                const baseRad = untied ? 120 : 65;
                const angleRad = (angles[i] * Math.PI) / 180;
                const xOffset = Math.sin(angleRad) * baseRad;
                const yOffset = -Math.cos(angleRad) * baseRad + 50;

                const isOpened = openedNotes.has(i);

                return (
                  <motion.div
                    key={i}
                    className="absolute pointer-events-auto"
                    style={{
                      left: `calc(50% + ${xOffset}px - 24px)`,
                      top: `calc(40% + ${yOffset}px - 24px)`,
                    }}
                    initial={false}
                    animate={
                      untied
                        ? {
                            scale: isOpened ? 1.05 : 1,
                            rotate: angles[i],
                          }
                        : { scale: 0.9, rotate: angles[i] * 0.4 }
                    }
                    transition={{ type: "spring", stiffness: 180, damping: 16, delay: i * 0.04 }}
                  >
                    <button
                      onClick={() => handleOpenNote(i)}
                      disabled={!untied}
                      className="group relative flex flex-col items-center justify-center p-1 rounded-full transition-transform active:scale-95"
                      style={{
                        cursor: untied ? "pointer" : "default",
                        background: "none",
                        border: "none",
                      }}
                      aria-label={`${note.label}: ${isOpened ? "opened" : "unopened"}`}
                      title={note.label}
                    >
                      {/* SVG Rose Bloom */}
                      <svg viewBox="0 0 46 46" className="w-11 h-11 drop-shadow-sm">
                        {/* Outer petals */}
                        <circle cx="23" cy="23" r="19" fill="var(--plum)" opacity="0.1" />
                        <ellipse cx="23" cy="23" rx="18" ry="17" fill="var(--rose)" />
                        {/* Petal folds */}
                        <path
                          d="M10 20 Q23 6 36 20 Q23 34 10 20 Z"
                          fill="var(--petal)"
                          stroke="var(--plum)"
                          strokeWidth="0.6"
                          opacity="0.85"
                        />
                        <path
                          d="M14 24 Q23 12 32 24 Q23 36 14 24 Z"
                          fill="var(--blush-white)"
                          stroke="var(--plum)"
                          strokeWidth="0.6"
                          opacity="0.9"
                        />
                        {/* Rose bud center spiral */}
                        <circle cx="23" cy="23" r="6" fill="var(--rose)" />
                        <path
                          d="M20 23 Q23 19 26 23 Q24 26 21 24"
                          fill="none"
                          stroke="var(--marigold)"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                        {/* Leaf collar */}
                        <path d="M12 32 Q8 37 12 40 Q17 38 18 33 Z" fill="var(--leaf)" />
                        <path d="M34 32 Q38 37 34 40 Q29 38 28 33 Z" fill="var(--leaf)" />
                      </svg>

                      {/* Number tag */}
                      <span
                        className="absolute -bottom-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-sm"
                        style={{
                          backgroundColor: isOpened ? "var(--leaf)" : "var(--plum)",
                          color: isOpened ? "white" : "var(--marigold)",
                        }}
                      >
                        {isOpened ? "✓" : i + 1}
                      </span>
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* ── Ribbon Bow (Tappable to untie) ────────── */}
            <AnimatePresence>
              {!untied && (
                <motion.div
                  className="absolute z-30 flex flex-col items-center"
                  style={{ top: "62%" }}
                  initial={{ scale: 1 }}
                  exit={reduced ? { opacity: 0 } : { scale: 1.4, opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <button
                    onClick={handleUntie}
                    className="group relative cursor-pointer p-2 focus:outline-none"
                    aria-label="Tap to untie ribbon and open bouquet"
                  >
                    <svg viewBox="0 0 100 80" className="w-24 h-auto drop-shadow-md">
                      {/* Left bow loop */}
                      <ellipse cx="32" cy="35" rx="22" ry="16" fill="var(--marigold)" transform="rotate(-15 32 35)" />
                      <ellipse cx="32" cy="35" rx="14" ry="9" fill="#D4960F" opacity="0.35" transform="rotate(-15 32 35)" />
                      {/* Right bow loop */}
                      <ellipse cx="68" cy="35" rx="22" ry="16" fill="var(--marigold)" transform="rotate(15 68 35)" />
                      <ellipse cx="68" cy="35" rx="14" ry="9" fill="#D4960F" opacity="0.35" transform="rotate(15 68 35)" />
                      {/* Center knot */}
                      <ellipse cx="50" cy="38" rx="11" ry="9" fill="#D4960F" />
                      <ellipse cx="50" cy="38" rx="8" ry="6" fill="var(--marigold)" />
                      {/* Ribbon tails */}
                      <path d="M42 42 L25 72 L36 67 L46 45 Z" fill="var(--marigold)" />
                      <path d="M58 42 L75 72 L64 67 L54 45 Z" fill="var(--marigold)" />
                    </svg>

                    {/* Hint pill */}
                    <div
                      className="mt-1 text-center font-body text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm animate-pulse"
                      style={{
                        backgroundColor: "var(--plum)",
                        color: "var(--marigold)",
                        border: "1px solid var(--marigold)",
                      }}
                    >
                      Tap bow to untie ✨
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Active Unrolled Fictional Banknote Modal ──── */}
        <AnimatePresence>
          {activeNoteIdx !== null && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
              onClick={() => setActiveNoteIdx(null)}
            >
              <motion.div
                className="w-full max-w-sm rounded-lg p-5 sm:p-6 shadow-2xl relative"
                style={{
                  backgroundColor: "var(--blush-white)",
                  color: "var(--plum)",
                  border: "3px double var(--plum)",
                }}
                initial={reduced ? { opacity: 1 } : { scale: 0.85, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { scale: 0.85, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-label={bouquet.notes[activeNoteIdx].label}
              >
                {/* Banknote top security bar (fictional) */}
                <div
                  className="flex items-center justify-between pb-2 mb-3 border-b-2"
                  style={{ borderColor: "var(--plum)" }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-black text-xs tracking-widest uppercase">
                      BIRTHDAY BANK
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-rose-100 text-rose-800">
                      OFFICIAL VOUCHER
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold" style={{ color: "var(--plum)" }}>
                    MB-2510-0{activeNoteIdx + 1}
                  </span>
                </div>

                {/* Banknote inner content */}
                <div
                  className="p-4 rounded border-2 border-dashed relative my-2"
                  style={{ borderColor: "rgba(42,15,46,0.3)", backgroundColor: "#FFF8FA" }}
                >
                  {/* Subtle watermark */}
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-5 font-display text-5xl font-black"
                    aria-hidden="true"
                  >
                    MARGARET
                  </div>

                  <p className="font-body text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">
                    Pay to the bearer:
                  </p>
                  <h3 className="font-display text-xl sm:text-2xl font-bold" style={{ color: "var(--plum)" }}>
                    {name}
                  </h3>

                  <div className="my-3 py-2 border-y border-rose-200">
                    <p className="font-display text-base font-semibold text-rose-800">
                      {bouquet.notes[activeNoteIdx].label}
                    </p>
                    <p className="font-body text-sm mt-1 leading-relaxed text-gray-800">
                      "{bouquet.notes[activeNoteIdx].message}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div>
                      <span className="text-[10px] block text-gray-500 uppercase tracking-wider">
                        Issued with love by:
                      </span>
                      <span className="font-signature text-base text-plum font-semibold">
                        Reuben
                      </span>
                    </div>

                    {/* Fictional official stamp */}
                    <div
                      className="border-2 rounded-full px-2.5 py-1 text-center -rotate-6"
                      style={{ borderColor: "var(--leaf)", color: "var(--leaf)" }}
                    >
                      <span className="text-[9px] font-bold block leading-none">VALID ANYTIME</span>
                      <span className="text-[8px] font-semibold block leading-none">100% REDEEMABLE</span>
                    </div>
                  </div>
                </div>

                {/* Close / fold back button */}
                <div className="mt-4 flex justify-end">
                  <button
                    className="pill-btn text-xs py-2 px-5"
                    style={{ backgroundColor: "var(--plum)", color: "var(--marigold)" }}
                    onClick={() => setActiveNoteIdx(null)}
                  >
                    Fold voucher back ✕
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── Finale section when all 7 are opened ─────────── */}
        <AnimatePresence>
          {allOpened && (
            <motion.div
              className="mt-8 text-center max-w-sm mx-auto p-5 rounded-lg shadow-lg relative z-20"
              style={{ backgroundColor: "var(--plum)", color: "var(--blush-white)" }}
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 25, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold block mb-1">
                Bouquet Unlocked
              </span>
              <h3 className="font-display text-3xl sm:text-4xl" style={{ color: "var(--marigold)" }}>
                {bouquet.finale}
              </h3>

              {bouquet.giftLine && (
                <p className="font-body text-sm sm:text-base mt-2 leading-relaxed opacity-90 text-rose-100">
                  {bouquet.giftLine}
                </p>
              )}

              <p className="font-signature text-xl mt-3 text-amber-200">
                — Reuben
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
}
