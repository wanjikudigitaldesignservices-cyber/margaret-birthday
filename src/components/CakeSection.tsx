import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";
import { content } from "../content";
import { useAudio } from "../audio/AudioContext";
import { HB_LYRICS } from "../audio/AudioEngine";
import { ScallopDivider } from "./ScallopDivider";

type Step = "light" | "sing" | "blow" | "wish" | "cut" | "done";

export function CakeSection() {
  const reduced = useReducedMotion();
  const { duck, playHappyBirthday } = useAudio();
  const { cake } = content;

  const [step, setStep] = useState<Step>("light");
  const [litCandles, setLitCandles] = useState<boolean[]>(Array(cake.candles).fill(false));
  const [smoke, setSmoke] = useState<number[]>([]);
  const [lyricLine, setLyricLine] = useState(-1);
  const [blownCandles, setBlownCandles] = useState<boolean[]>(Array(cake.candles).fill(false));
  const [blowing, setBlowing] = useState(false);
  const [sliceCut, setSliceCut] = useState(false);
  const [knifeProgress, setKnifeProgress] = useState(0);

  const blowTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const knifeRef = useRef<HTMLDivElement>(null);
  const knifeStartX = useRef(0);
  const knifeWidth = useRef(0);

  /* Mic blowing */
  const [micActive, setMicActive] = useState(false);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const allLit = litCandles.every(Boolean);
  const allBlown = blownCandles.every(Boolean);

  /* ── LIGHT step ────────────────────────────────────── */
  const lightCandle = useCallback(
    (i: number) => {
      if (step !== "light") return;
      setLitCandles((prev) => {
        const next = [...prev];
        next[i] = true;
        return next;
      });
    },
    [step]
  );

  /* auto-advance when all lit */
  useEffect(() => {
    if (step === "light" && allLit) {
      const t = setTimeout(() => setStep("sing"), 600);
      return () => clearTimeout(t);
    }
  }, [step, allLit]);

  /* ── SING step ─────────────────────────────────────── */
  const handleSing = useCallback(async () => {
    duck(0.1, 20000);
    setLyricLine(0);
    await playHappyBirthday((lineIdx) => setLyricLine(lineIdx));
    setLyricLine(-1);
    setTimeout(() => setStep("blow"), 500);
  }, [duck, playHappyBirthday]);

  /* ── BLOW step ─────────────────────────────────────── */
  const blowCandleOnce = useCallback(() => {
    setBlownCandles((prev) => {
      const next = [...prev];
      const idx = next.findIndex((b) => !b);
      if (idx !== -1) {
        next[idx] = true;
        setSmoke((s) => [...s, idx]);
      }
      return next;
    });
  }, []);

  const startBlowing = useCallback(() => {
    if (step !== "blow") return;
    setBlowing(true);
    blowTimerRef.current = setInterval(() => {
      blowCandleOnce();
    }, 320);
  }, [step, blowCandleOnce]);

  const stopBlowing = useCallback(() => {
    setBlowing(false);
    if (blowTimerRef.current) {
      clearInterval(blowTimerRef.current);
      blowTimerRef.current = null;
    }
  }, []);

  /* Cleanup mic */
  const stopMic = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (micContextRef.current) {
      micContextRef.current.close().catch(() => {});
      micContextRef.current = null;
    }
    setMicActive(false);
  }, []);

  const startMic = useCallback(async () => {
    if (micActive) {
      stopMic();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = stream;
      const audioCtx = new AudioContext();
      micContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      setMicActive(true);

      let blowCooldown = 0;
      const checkAudio = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;

        // Threshold for blowing into mic
        if (avg > 35) {
          setBlowing(true);
          blowCooldown++;
          if (blowCooldown % 12 === 0) {
            blowCandleOnce();
          }
        } else {
          setBlowing(false);
        }
        animFrameRef.current = requestAnimationFrame(checkAudio);
      };
      animFrameRef.current = requestAnimationFrame(checkAudio);
    } catch {
      // Silently fall back to button if mic is denied or unavailable
      stopMic();
    }
  }, [micActive, stopMic, blowCandleOnce]);

  /* Cleanup mic on step change or unmount */
  useEffect(() => {
    return () => stopMic();
  }, [stopMic]);

  /* auto-advance when all blown */
  useEffect(() => {
    if (step === "blow" && allBlown) {
      stopBlowing();
      stopMic();
      setTimeout(() => setStep("wish"), 300);
    }
  }, [step, allBlown, stopBlowing, stopMic]);

  /* ── WISH step auto-advance ────────────────────────── */
  useEffect(() => {
    if (step === "wish") {
      const t = setTimeout(() => {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#F6B72D", "#F29AB0", "#FBEFF3", "#F8CFDA"],
        });
        setStep("cut");
      }, 2200);
      return () => clearTimeout(t);
    }
  }, [step]);

  /* ── CUT step (knife swipe) ────────────────────────── */
  const handleKnifeStart = useCallback(
    (clientX: number) => {
      if (step !== "cut" || !knifeRef.current) return;
      const rect = knifeRef.current.getBoundingClientRect();
      knifeStartX.current = rect.left;
      knifeWidth.current = rect.width;
      const progress = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      setKnifeProgress(progress);
    },
    [step]
  );

  const handleKnifeMove = useCallback(
    (clientX: number) => {
      if (step !== "cut" || knifeWidth.current === 0) return;
      const progress = Math.max(0, Math.min(1, (clientX - knifeStartX.current) / knifeWidth.current));
      setKnifeProgress(progress);
      if (progress > 0.85 && !sliceCut) {
        setSliceCut(true);
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.5 },
          colors: ["#F6B72D", "#F29AB0", "#FBEFF3"],
        });
        setTimeout(() => setStep("done"), 800);
      }
    },
    [step, sliceCut]
  );

  /* ── RESET ─────────────────────────────────────────── */
  const reset = () => {
    setStep("light");
    setLitCandles(Array(cake.candles).fill(false));
    setBlownCandles(Array(cake.candles).fill(false));
    setSmoke([]);
    setLyricLine(-1);
    setSliceCut(false);
    setKnifeProgress(0);
  };

  /* ── Stepper ───────────────────────────────────────── */
  const steps: { key: Step; label: string }[] = [
    { key: "light", label: "Light" },
    { key: "sing", label: "Sing" },
    { key: "blow", label: "Blow" },
    { key: "cut", label: "Cut" },
  ];

  const stepIdx = ["light", "sing", "blow", "wish", "cut", "done"].indexOf(step);

  return (
    <>
      <ScallopDivider fromColor="var(--marigold)" toColor="var(--plum)" />
      <section className="bg-section-cake py-12 px-5 sm:px-8" aria-label="Birthday cake">
        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8 max-w-xs">
          {steps.map((s, i) => {
            const active = stepIdx >= ["light", "sing", "blow", "cut"].indexOf(s.key);
            return (
              <div key={s.key} className="flex items-center gap-2">
                <div
                  className="font-body text-xs font-medium px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: active ? "var(--marigold)" : "rgba(255,255,255,0.1)",
                    color: active ? "var(--plum)" : "var(--blush-white)",
                    opacity: active ? 1 : 0.5,
                  }}
                >
                  {i + 1}. {s.label}
                </div>
                {i < steps.length - 1 && (
                  <div
                    style={{
                      width: 12,
                      height: 1,
                      backgroundColor: active ? "var(--marigold)" : "rgba(255,255,255,0.15)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── CAKE SVG ────────────────────────────────── */}
        <div className="relative mx-auto" style={{ maxWidth: 320 }}>
          <svg viewBox="0 0 300 280" className="w-full h-auto" role="img" aria-label="Birthday cake">
            {/* Plate */}
            <ellipse cx="150" cy="265" rx="140" ry="14" fill="var(--blush-white)" opacity="0.9" />
            <ellipse cx="150" cy="265" rx="130" ry="10" fill="white" opacity="0.3" />

            {/* Bottom tier */}
            <rect x="40" y="195" width="220" height="70" rx="8" fill="var(--rose)" />
            {/* Scalloped frosting bottom tier */}
            <path
              d="M40 200 Q55 188 70 200 Q85 188 100 200 Q115 188 130 200 Q145 188 160 200 Q175 188 190 200 Q205 188 220 200 Q235 188 260 200"
              fill="var(--petal)"
              stroke="none"
            />
            {/* Cream stripe */}
            <rect x="40" y="220" width="220" height="8" rx="4" fill="var(--blush-white)" opacity="0.5" />

            {/* Top tier */}
            <rect x="70" y="130" width="160" height="70" rx="8" fill="var(--rose)" />
            {/* Scalloped frosting top tier */}
            <path
              d="M70 135 Q85 123 100 135 Q115 123 130 135 Q145 123 160 135 Q175 123 190 135 Q205 123 230 135"
              fill="var(--petal)"
              stroke="none"
            />
            {/* Cream stripe top */}
            <rect x="70" y="155" width="160" height="6" rx="3" fill="var(--blush-white)" opacity="0.5" />

            {/* Sprinkles */}
            {[
              [55, 215, "#F6B72D", 12], [80, 240, "#2F6B4F", -20], [120, 230, "#F6B72D", 45],
              [180, 220, "#F29AB0", -15], [200, 245, "#F6B72D", 30], [240, 225, "#2F6B4F", -40],
              [90, 150, "#F6B72D", 25], [130, 165, "#2F6B4F", -10], [170, 145, "#F6B72D", 55],
              [200, 160, "#F29AB0", -30],
            ].map(([x, y, color, rot], i) => (
              <rect
                key={`sp-${i}`}
                x={Number(x) - 3}
                y={Number(y) - 1}
                width="6"
                height="2.5"
                rx="1"
                fill={String(color)}
                transform={`rotate(${rot} ${x} ${y})`}
                opacity="0.7"
              />
            ))}

            {/* Strawberries */}
            {[90, 150, 210].map((cx, i) => (
              <g key={`st-${i}`} transform={`translate(${cx}, 190)`}>
                <ellipse cx="0" cy="0" rx="8" ry="10" fill="#e74c3c" />
                <ellipse cx="0" cy="-2" rx="5" ry="6" fill="#c0392b" opacity="0.3" />
                <path d="M-4 -8 L0 -12 L4 -8" fill="var(--leaf)" strokeWidth="0" />
                {/* seeds */}
                <circle cx="-2" cy="2" r="0.8" fill="var(--marigold)" opacity="0.7" />
                <circle cx="2" cy="-1" r="0.8" fill="var(--marigold)" opacity="0.7" />
                <circle cx="0" cy="5" r="0.8" fill="var(--marigold)" opacity="0.7" />
              </g>
            ))}

            {/* Name on cake */}
            <text
              x="150"
              y="180"
              textAnchor="middle"
              fontFamily="'Homemade Apple', cursive"
              fontSize="16"
              fill="var(--plum)"
              opacity="0.7"
            >
              {cake.name}
            </text>

            {/* ── Candles ────────────────────────────── */}
            {Array.from({ length: cake.candles }).map((_, i) => {
              const cx = 70 + ((i + 1) * 160) / (cake.candles + 1);
              const isLit = litCandles[i];
              const isBlown = blownCandles[i];
              const showSmoke = smoke.includes(i);

              return (
                <g key={`candle-${i}`}>
                  {/* Candle body */}
                  <rect
                    x={cx - 4}
                    y={95}
                    width={8}
                    height={38}
                    rx={2}
                    fill={i % 2 === 0 ? "var(--marigold)" : "var(--petal)"}
                    stroke="var(--plum)"
                    strokeWidth="0.5"
                    opacity="0.9"
                  />
                  {/* Stripe */}
                  <rect x={cx - 1} y={95} width={2} height={38} rx={1} fill="white" opacity="0.25" />
                  {/* Wick */}
                  <line x1={cx} y1={90} x2={cx} y2={95} stroke="var(--plum)" strokeWidth="1.2" />

                  {/* Flame */}
                  {isLit && !isBlown && (
                    <g
                      className={reduced ? "" : "flame-flicker"}
                      style={{
                        transformOrigin: `${cx}px 90px`,
                        transform: blowing ? "rotate(24deg) skewX(-14deg)" : "none",
                        transition: "transform 0.15s ease",
                      }}
                    >
                      <ellipse cx={cx} cy={82} rx={4} ry={8} fill="#FF9F1C" opacity="0.9" />
                      <ellipse cx={cx} cy={83} rx={2.5} ry={5} fill="#FFEB3B" opacity="0.8" />
                      {/* Glow */}
                      <circle
                        cx={cx}
                        cy={85}
                        r={18}
                        fill="#FF9F1C"
                        opacity="0.08"
                        className={reduced ? "" : "candle-glow"}
                      />
                    </g>
                  )}

                  {/* Smoke wisp */}
                  {isBlown && showSmoke && (
                    <g className={reduced ? "" : "smoke-wisp"} style={{ transformOrigin: `${cx}px 85px` }}>
                      <ellipse cx={cx} cy={80} rx={3} ry={4} fill="var(--blush-white)" opacity="0.4" />
                      <ellipse cx={cx + 2} cy={76} rx={2} ry={3} fill="var(--blush-white)" opacity="0.25" />
                    </g>
                  )}

                  {/* Tap target for lighting */}
                  {step === "light" && !isLit && (
                    <rect
                      x={cx - 12}
                      y={75}
                      width={24}
                      height={60}
                      fill="transparent"
                      style={{ cursor: "pointer" }}
                      onClick={() => lightCandle(i)}
                      role="button"
                      aria-label={`Light candle ${i + 1}`}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") lightCandle(i);
                      }}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* light prompt */}
          {step === "light" && !allLit && (
            <p className="text-center font-body text-sm mt-2" style={{ color: "var(--blush-white)", opacity: 0.7 }}>
              Tap each candle to light it
            </p>
          )}
        </div>

        {/* ── SING UI ────────────────────────────────── */}
        <AnimatePresence>
          {step === "sing" && (
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {lyricLine === -1 ? (
                <button
                  className="pill-btn"
                  style={{ backgroundColor: "var(--marigold)", color: "var(--plum)" }}
                  onClick={handleSing}
                  aria-label="Play Happy Birthday song"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  Sing
                </button>
              ) : (
                <div className="space-y-2 mt-4">
                  {HB_LYRICS.map((line, i) => (
                    <p
                      key={i}
                      className="font-body text-lg transition-all duration-300"
                      style={{
                        color: i === lyricLine ? "var(--marigold)" : "var(--blush-white)",
                        opacity: i <= lyricLine ? 1 : 0.3,
                        fontWeight: i === lyricLine ? 600 : 400,
                        transform: i === lyricLine ? "scale(1.05)" : "scale(1)",
                      }}
                    >
                      {line.replace("{name}", content.name)}
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── BLOW UI ────────────────────────────────── */}
        <AnimatePresence>
          {step === "blow" && (
            <motion.div
              className="mt-8 text-center space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  className="pill-btn"
                  style={{
                    backgroundColor: blowing && !micActive ? "var(--rose)" : "var(--marigold)",
                    color: "var(--plum)",
                  }}
                  onPointerDown={startBlowing}
                  onPointerUp={stopBlowing}
                  onPointerLeave={stopBlowing}
                  aria-label="Hold to blow out candles"
                >
                  {blowing && !micActive ? "Blowing..." : "Hold to blow"}
                </button>

                <button
                  className="pill-btn"
                  style={{
                    backgroundColor: micActive ? "var(--rose)" : "rgba(255,255,255,0.12)",
                    color: micActive ? "var(--plum)" : "var(--blush-white)",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                  onClick={startMic}
                  aria-label="Use microphone to blow"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="22"/>
                  </svg>
                  {micActive ? (blowing ? "Microphone: blowing!" : "Listening... (blow!)") : "Use your microphone"}
                </button>
              </div>

              <p className="font-body text-xs" style={{ color: "var(--blush-white)", opacity: 0.6 }}>
                Press & hold the button or blow directly into your microphone
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── WISH UI ────────────────────────────────── */}
        <AnimatePresence>
          {step === "wish" && (
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p
                className="font-display text-2xl"
                style={{ color: "var(--marigold)" }}
              >
                {cake.wishLine}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CUT UI ─────────────────────────────────── */}
        <AnimatePresence>
          {step === "cut" && (
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <p
                className="font-body text-sm text-center mb-4"
                style={{ color: "var(--blush-white)", opacity: 0.7 }}
              >
                Swipe across to cut the cake
              </p>

              {/* Knife guide */}
              <div
                ref={knifeRef}
                className="relative mx-auto"
                style={{
                  maxWidth: 280,
                  height: 50,
                  borderBottom: "2px dashed var(--marigold)",
                  cursor: "pointer",
                  touchAction: "none",
                }}
                onPointerDown={(e) => handleKnifeStart(e.clientX)}
                onPointerMove={(e) => {
                  if (e.buttons > 0) handleKnifeMove(e.clientX);
                }}
                onTouchStart={(e) => handleKnifeStart(e.touches[0].clientX)}
                onTouchMove={(e) => handleKnifeMove(e.touches[0].clientX)}
                role="slider"
                aria-label="Drag to cut the cake"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(knifeProgress * 100)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSliceCut(true);
                    confetti({
                      particleCount: 80,
                      spread: 60,
                      origin: { y: 0.5 },
                      colors: ["#F6B72D", "#F29AB0", "#FBEFF3"],
                    });
                    setTimeout(() => setStep("done"), 800);
                  }
                }}
              >
                {/* Knife indicator */}
                <motion.div
                  className="absolute top-0 h-full flex items-center"
                  style={{ left: `${knifeProgress * 100}%` }}
                >
                  <svg width="24" height="40" viewBox="0 0 24 40" fill="none">
                    <rect x="10" y="0" width="4" height="20" rx="1" fill="var(--blush-white)" />
                    <path d="M8 20 L16 20 L14 40 L10 40 Z" fill="var(--marigold)" />
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── DONE UI ────────────────────────────────── */}
        <AnimatePresence>
          {step === "done" && (
            <motion.div
              className="mt-8 text-center space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Slice illustration */}
              <div className="flex items-end justify-center gap-3 mb-4">
                {/* Plate with slice */}
                <svg viewBox="0 0 100 70" className="w-28 h-auto" aria-hidden="true">
                  <ellipse cx="50" cy="60" rx="45" ry="8" fill="var(--blush-white)" opacity="0.9" />
                  {/* Slice */}
                  <path d="M30 25 L50 60 L70 25 Z" fill="var(--rose)" />
                  {/* Sponge layer */}
                  <path d="M35 35 L50 55 L65 35 Z" fill="var(--marigold)" opacity="0.5" />
                  {/* Cream */}
                  <rect x="38" y="33" width="24" height="3" rx="1" fill="var(--blush-white)" opacity="0.7" />
                  {/* Strawberry layer */}
                  <rect x="40" y="37" width="20" height="3" rx="1" fill="#e74c3c" opacity="0.6" />
                  {/* Heart pick */}
                  <line x1="50" y1="15" x2="50" y2="35" stroke="var(--leaf)" strokeWidth="1.5" />
                  <path
                    d="M46 15 Q46 10 50 13 Q54 10 54 15 Q54 19 50 22 Q46 19 46 15"
                    fill="var(--rose)"
                  />
                </svg>
              </div>

              <p className="font-display text-xl" style={{ color: "var(--marigold)" }}>
                {cake.afterCut}
              </p>

              <button
                className="pill-btn mt-4"
                style={{
                  backgroundColor: "transparent",
                  color: "var(--blush-white)",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
                onClick={reset}
              >
                Do it again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
}
