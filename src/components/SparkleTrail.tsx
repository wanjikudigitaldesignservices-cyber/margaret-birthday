import { useEffect, useState, useCallback, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
}

export function SparkleTrail() {
  const reduced = useReducedMotion();
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const idCounter = useRef(0);
  const colors = ["#F6B72D", "#F29AB0", "#F8CFDA", "#FFD166"];

  const addSparkle = useCallback(
    (x: number, y: number, count = 1) => {
      if (reduced) return;

      const newItems: Sparkle[] = [];
      for (let i = 0; i < count; i++) {
        idCounter.current += 1;
        const offsetDist = count > 1 ? Math.random() * 24 - 12 : 0;
        newItems.push({
          id: idCounter.current,
          x: x + offsetDist,
          y: y + offsetDist,
          size: Math.floor(10 + Math.random() * 10),
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.floor(Math.random() * 90),
        });
      }

      setSparkles((prev) => {
        // Enforce max 12 alive at once
        const combined = [...prev, ...newItems];
        return combined.slice(-12);
      });
    },
    [reduced]
  );

  useEffect(() => {
    if (reduced) return;

    let throttle = 0;
    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        const now = performance.now();
        if (now - throttle > 55) {
          throttle = now;
          addSparkle(e.clientX, e.clientY, 1);
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      // Small sparkle burst on tap
      addSparkle(e.clientX, e.clientY, 3);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [reduced, addSparkle]);

  // Clean up old sparkles after 600ms
  useEffect(() => {
    if (sparkles.length === 0) return;
    const timer = setTimeout(() => {
      setSparkles((prev) => (prev.length > 0 ? prev.slice(1) : prev));
    }, 120);
    return () => clearTimeout(timer);
  }, [sparkles]);

  if (reduced || sparkles.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      aria-hidden="true"
    >
      {sparkles.map((s) => (
        <svg
          key={s.id}
          viewBox="0 0 24 24"
          className="absolute sparkle"
          style={{
            left: s.x - s.size / 2,
            top: s.y - s.size / 2,
            width: s.size,
            height: s.size,
            transformOrigin: "center",
          }}
        >
          {/* 4-point star path */}
          <path
            d="M12 0 Q12 12 0 12 Q12 12 12 24 Q12 12 24 12 Q12 12 12 0 Z"
            fill={s.color}
          />
        </svg>
      ))}
    </div>
  );
}
