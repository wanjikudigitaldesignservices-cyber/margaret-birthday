import { useState, useCallback } from "react";
import { AudioProvider, useAudio } from "./audio/AudioContext";
import { content } from "./content";
import { Gate } from "./components/Gate";
import { Hero } from "./components/Hero";
import { CakeSection } from "./components/CakeSection";
import { PhotoCarousel } from "./components/PhotoCarousel";
import { Reasons } from "./components/Reasons";
import { Bouquet } from "./components/Bouquet";
import { Letter } from "./components/Letter";
import { MuteToggle } from "./components/MuteToggle";
import { SparkleTrail } from "./components/SparkleTrail";
import { ScallopDivider } from "./components/ScallopDivider";
import { DoodleHeart, DoodleStar } from "./components/Doodles";

function BirthdaySite() {
  const [gateOpened, setGateOpened] = useState(false);
  const { initAndPlay } = useAudio();

  const handleOpenGate = useCallback(() => {
    setGateOpened(true);
    initAndPlay(content.songSrc);
  }, [initAndPlay]);

  return (
    <div className="relative min-h-screen w-full bg-[var(--plum)] text-[var(--blush-white)] selection:bg-[var(--marigold)] selection:text-[var(--plum)] overflow-x-hidden">
      {/* ── Gift Gate (Full screen on load) ─────────────── */}
      <Gate onOpen={handleOpenGate} />

      {/* ── Sparkle Trail (Desktop cursor & mobile tap) ── */}
      <SparkleTrail />

      {/* ── Main Birthday Experience ───────────────────── */}
      <main className="w-full relative overflow-x-hidden">
        {/* Phase 1/Intro: Hero section */}
        <Hero started={gateOpened} />

        {/* Phase A2: Cake Simulation */}
        <CakeSection />

        {/* Memories: Photo Carousel */}
        <PhotoCarousel />

        {/* 7 Reasons */}
        <Reasons />

        {/* Phase A3: Money Bouquet Simulation */}
        <Bouquet />

        {/* Letter with Envelope & Confetti Finale */}
        <Letter />

        {/* ── Footer / Reuben's Dedication ──────────────── */}
        <ScallopDivider fromColor="var(--plum)" toColor="var(--plum)" />
        <footer className="bg-[var(--plum)] py-12 px-6 text-center relative overflow-hidden">
          <div className="flex items-center justify-center gap-2 mb-3">
            <DoodleStar color="var(--marigold)" size={18} />
            <DoodleHeart color="var(--rose)" size={20} />
            <DoodleStar color="var(--marigold)" size={18} />
          </div>

          <p className="font-body text-sm text-rose-100/90 font-medium max-w-md mx-auto leading-relaxed">
            {content.finalNote || "Handcrafted with love by Reuben for Margaret"}
          </p>

          <p className="font-signature text-2xl mt-3 text-[var(--marigold)]">
            Happy Birthday, {content.name}
          </p>

          <p className="font-body text-xs text-rose-200/50 mt-4 tracking-wider uppercase">
            {content.dateLabel} • Built with love by Reuben
          </p>
        </footer>
      </main>

      {/* ── Floating Mute Toggle ───────────────────────── */}
      <MuteToggle />
    </div>
  );
}

export default function App() {
  return (
    <AudioProvider>
      <BirthdaySite />
    </AudioProvider>
  );
}
