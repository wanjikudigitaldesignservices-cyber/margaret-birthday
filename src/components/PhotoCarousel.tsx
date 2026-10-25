import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { content } from "../content";
import { ScallopDivider } from "./ScallopDivider";

export function PhotoCarousel() {
  const reduced = useReducedMotion();
  const { photos } = content;

  return (
    <>
      <ScallopDivider fromColor="var(--plum)" toColor="var(--rose)" />
      <section className="bg-section-photos py-12" aria-label="Photo memories">
        <h2
          className="font-display text-2xl px-5 sm:px-8 mb-6"
          style={{ color: "var(--plum)" }}
        >
          Some moments
          <SquiggleUnderline color="var(--plum)" />
        </h2>

        {/* Horizontal scroll-snap carousel */}
        <div
          className="flex gap-5 overflow-x-auto px-5 sm:px-8 pb-4"
          style={{
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
        >
          {photos.map((photo, i) => {
            const tilt = ["-2deg", "1.5deg", "-1deg", "2deg", "-1.5deg", "0.5deg"][i % 6];

            return (
              <motion.div
                key={i}
                className="flex-shrink-0 polaroid relative"
                style={{
                  scrollSnapAlign: "start",
                  width: "min(70vw, 260px)",
                  transform: `rotate(${tilt})`,
                }}
                initial={reduced ? {} : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                {/* Washi tape corners */}
                <div
                  className="washi-tape"
                  style={{
                    top: -5,
                    left: 8,
                    backgroundColor: i % 2 === 0 ? "var(--marigold)" : "var(--petal)",
                    transform: "rotate(-8deg)",
                  }}
                />
                <div
                  className="washi-tape"
                  style={{
                    top: -5,
                    right: 8,
                    backgroundColor: i % 2 === 0 ? "var(--petal)" : "var(--marigold)",
                    transform: "rotate(6deg)",
                  }}
                />

                <PhotoSlot photo={photo} index={i} />

                {photo.caption && (
                  <p
                    className="font-signature text-sm text-center mt-1 pb-1"
                    style={{ color: "var(--plum)", opacity: 0.7 }}
                  >
                    {photo.caption}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>
    </>
  );
}

/* ── Photo slot: shows styled placeholder until a real image loads ── */
function PhotoSlot({ photo, index }: { photo: { src: string; caption?: string }; index: number }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const placeholderColors = [
    "var(--petal)", "var(--marigold)", "var(--rose)",
    "var(--petal)", "var(--marigold)", "var(--rose)",
  ];

  if (failed || !photo.src) {
    return (
      <div
        className="flex items-center justify-center font-body text-sm"
        style={{
          aspectRatio: "4/5",
          backgroundColor: placeholderColors[index % 6],
          color: "var(--plum)",
          fontWeight: 500,
          borderRadius: 2,
        }}
      >
        <span style={{ opacity: 0.5 }}>Photo {index + 1}</span>
      </div>
    );
  }

  return (
    <div style={{ aspectRatio: "4/5", position: "relative", overflow: "hidden", borderRadius: 2 }}>
      {!loaded && (
        <div
          className="absolute inset-0 flex items-center justify-center font-body text-sm"
          style={{
            backgroundColor: placeholderColors[index % 6],
            color: "var(--plum)",
          }}
        >
          <span style={{ opacity: 0.5 }}>Photo {index + 1}</span>
        </div>
      )}
      <img
        src={photo.src}
        alt={photo.caption || `Photo ${index + 1} of ${content.name}`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      />
    </div>
  );
}

/* ── Squiggle underline ──────────────────────────────── */
function SquiggleUnderline({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 120 8"
      className="block mt-1"
      style={{ width: 80, height: 6 }}
      aria-hidden="true"
    >
      <path
        d="M2 5 Q10 1 20 5 Q30 9 40 5 Q50 1 60 5 Q70 9 80 5 Q90 1 100 5 Q110 9 118 5"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
        style={{
          strokeDasharray: 200,
          strokeDashoffset: 200,
        }}
        className="draw-on"
      />
    </svg>
  );
}
