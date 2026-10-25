import { createContext, useContext, useRef, useState, useCallback, useEffect, type ReactNode } from "react";
import { AudioEngine } from "./AudioEngine";

interface AudioCtxValue {
  engine: AudioEngine | null;
  muted: boolean;
  ready: boolean;
  initAndPlay: (songSrc?: string) => Promise<void>;
  toggleMute: () => void;
  duck: (level: number, ms: number) => void;
  playHappyBirthday: (onLine?: (idx: number) => void) => Promise<void>;
}

const Ctx = createContext<AudioCtxValue>({
  engine: null,
  muted: false,
  ready: false,
  initAndPlay: async () => {},
  toggleMute: () => {},
  duck: () => {},
  playHappyBirthday: async () => {},
});

export function useAudio() {
  return useContext(Ctx);
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<AudioEngine | null>(null);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);

  /* cleanup on unmount */
  useEffect(() => {
    return () => {
      engineRef.current?.cleanup();
    };
  }, []);

  const initAndPlay = useCallback(async (songSrc?: string) => {
    if (engineRef.current) return;            // already inited
    const engine = new AudioEngine();
    engineRef.current = engine;
    await engine.init();
    await engine.startBackground(songSrc);
    setReady(true);
  }, []);

  const toggleMute = useCallback(() => {
    const m = engineRef.current?.toggleMute() ?? false;
    setMuted(m);
  }, []);

  const duck = useCallback((level: number, ms: number) => {
    engineRef.current?.duck(level, ms);
  }, []);

  const playHappyBirthday = useCallback(async (onLine?: (idx: number) => void) => {
    await engineRef.current?.playHappyBirthday(onLine);
  }, []);

  return (
    <Ctx.Provider value={{ engine: engineRef.current, muted, ready, initAndPlay, toggleMute, duck, playHappyBirthday }}>
      {children}
    </Ctx.Provider>
  );
}
