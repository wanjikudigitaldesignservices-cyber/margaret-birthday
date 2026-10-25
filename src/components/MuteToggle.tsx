import { motion } from "framer-motion";
import { useAudio } from "../audio/AudioContext";

export function MuteToggle() {
  const { muted, toggleMute, ready } = useAudio();

  if (!ready) return null;

  return (
    <motion.button
      onClick={toggleMute}
      className="fixed z-40 pill-btn safe-bottom"
      style={{
        bottom: 16,
        right: 16,
        backgroundColor: "rgba(42,15,46,0.85)",
        color: "var(--marigold)",
        padding: "8px 14px",
        backdropFilter: "blur(4px)",
        minWidth: 44,
        minHeight: 44,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 2, duration: 0.3 }}
      whileTap={{ scale: 0.92 }}
      aria-label={muted ? "Unmute music" : "Mute music"}
      title={muted ? "Unmute" : "Mute"}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Speaker body */}
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" opacity="0.3" />
        <path d="M11 5L6 9H2v6h4l5 4V5z" />

        {muted ? (
          /* X marks */
          <>
            <line x1="17" y1="9" x2="23" y2="15" />
            <line x1="23" y1="9" x2="17" y2="15" />
          </>
        ) : (
          /* Sound bars */
          <>
            <motion.path
              d="M15.5 8.5a5 5 0 0 1 0 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3 }}
            />
            <motion.path
              d="M19 5a9 9 0 0 1 0 14"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            />
          </>
        )}
      </svg>
    </motion.button>
  );
}
