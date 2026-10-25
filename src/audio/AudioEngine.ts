/* ── Note frequencies ─────────────────────────────────── */
const FREQ: Record<string, number> = {
  F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0,
  A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99,
};

/* ── Happy Birthday melody: [note, beats] at 100 BPM, 3/4 ── */
const HB_MELODY: [string, number][] = [
  ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
  ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
  ["G4", 0.75], ["G4", 0.25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 1],
  ["F5", 0.75], ["F5", 0.25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 2],
];

/* Happy Birthday lyric lines and the note-index where each starts */
export const HB_LYRICS = [
  "Happy birthday to you",
  "Happy birthday to you",
  "Happy birthday dear {name}",
  "Happy birthday to you",
];
const HB_LINE_STARTS = [0, 6, 12, 19];

/* ── Background arpeggio chords ──────────────────────── */
const CHORDS = [
  [261.63, 329.63, 392.0],   // C
  [220.0, 261.63, 329.63],   // Am
  [174.61, 220.0, 261.63],   // F
  [196.0, 246.94, 293.66],   // G
];

/* ─────────────────────────────────────────────────────── */
/*  AudioEngine                                           */
/* ─────────────────────────────────────────────────────── */
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgGain: GainNode | null = null;
  private melodyGain: GainNode | null = null;
  private bgSource: AudioBufferSourceNode | null = null;
  private proceduralRunning = false;
  private proceduralTimer: ReturnType<typeof setTimeout> | null = null;
  private _muted = false;
  private targetVolume = 0.35;
  private duckTimer: ReturnType<typeof setTimeout> | null = null;
  private allOscs: OscillatorNode[] = [];

  /* ── lifecycle ─────────────────────────────────────── */
  async init(): Promise<void> {
    this.ctx = new AudioContext();
    await this.ctx.resume();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.targetVolume;
    this.masterGain.connect(this.ctx.destination);

    this.bgGain = this.ctx.createGain();
    this.bgGain.gain.value = 0;              // will fade in
    this.bgGain.connect(this.masterGain);

    this.melodyGain = this.ctx.createGain();
    this.melodyGain.gain.value = 1;
    this.melodyGain.connect(this.masterGain);

    document.addEventListener("visibilitychange", this._onVis);
  }

  cleanup(): void {
    this.proceduralRunning = false;
    if (this.proceduralTimer) clearTimeout(this.proceduralTimer);
    this.allOscs.forEach((o) => { try { o.stop(); } catch { /* noop */ } });
    this.allOscs = [];
    if (this.bgSource) { try { this.bgSource.stop(); } catch { /* noop */ } }
    document.removeEventListener("visibilitychange", this._onVis);
    this.ctx?.close();
  }

  /* ── visibility ────────────────────────────────────── */
  private _onVis = () => {
    if (!this.ctx) return;
    if (document.hidden) this.ctx.suspend();
    else this.ctx.resume();
  };

  /* ── background music ──────────────────────────────── */
  async startBackground(songSrc?: string): Promise<void> {
    if (!this.ctx || !this.bgGain) return;

    /* try loading the mp3 */
    if (songSrc) {
      try {
        const res = await fetch(songSrc);
        if (res.ok) {
          const buf = await this.ctx.decodeAudioData(await res.arrayBuffer());
          this.bgSource = this.ctx.createBufferSource();
          this.bgSource.buffer = buf;
          this.bgSource.loop = true;
          this.bgSource.connect(this.bgGain);
          this.bgSource.start();
          this._fadeIn(this.bgGain, 2);
          return;
        }
      } catch { /* fall through */ }
    }

    /* procedural fallback */
    this.proceduralRunning = true;
    this._scheduleArpeggio();
    this._fadeIn(this.bgGain, 2);
  }

  /* ── procedural music-box arpeggio ─────────────────── */
  private _scheduleArpeggio(): void {
    if (!this.proceduralRunning || !this.ctx || !this.bgGain) return;

    const beat = 60 / 70;               // ≈ 0.857 s
    const chordLen = beat * 4;           // 4 beats each chord
    const now = this.ctx.currentTime + 0.05;

    /* shared delay for reverb feel – created once per loop pass */
    const delay = this.ctx.createDelay();
    delay.delayTime.value = 0.18;
    const fb = this.ctx.createGain();
    fb.gain.value = 0.25;
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(this.bgGain);

    CHORDS.forEach((chord, ci) => {
      const start = now + ci * chordLen;
      const noteDur = chordLen / 4;
      const arp = [...chord, chord[0]];          // up + root

      arp.forEach((freq, ni) => {
        const t = start + ni * noteDur;
        const osc = this.ctx!.createOscillator();
        osc.type = "triangle";
        osc.frequency.value = freq;

        const g = this.ctx!.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.10, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

        osc.connect(g);
        g.connect(this.bgGain!);
        g.connect(delay);
        osc.start(t);
        osc.stop(t + 0.5);
        this.allOscs.push(osc);
      });
    });

    const loopMs = chordLen * CHORDS.length * 1000;
    this.proceduralTimer = setTimeout(() => this._scheduleArpeggio(), loopMs - 80);
  }

  /* ── mute ──────────────────────────────────────────── */
  get muted() { return this._muted; }

  toggleMute(): boolean {
    this._muted = !this._muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this._muted ? 0 : this.targetVolume;
    }
    return this._muted;
  }

  /* ── duck ──────────────────────────────────────────── */
  duck(level: number, ms: number): void {
    if (!this.bgGain || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.bgGain.gain.cancelScheduledValues(t);
    this.bgGain.gain.setValueAtTime(this.bgGain.gain.value, t);
    this.bgGain.gain.linearRampToValueAtTime(level, t + 0.3);

    if (this.duckTimer) clearTimeout(this.duckTimer);
    this.duckTimer = setTimeout(() => {
      if (!this.bgGain || !this.ctx) return;
      const now = this.ctx.currentTime;
      this.bgGain.gain.cancelScheduledValues(now);
      this.bgGain.gain.setValueAtTime(this.bgGain.gain.value, now);
      this.bgGain.gain.linearRampToValueAtTime(1, now + 0.5);
    }, ms);
  }

  /* ── Happy Birthday melody ─────────────────────────── */
  playHappyBirthday(onLine?: (idx: number) => void): Promise<void> {
    if (!this.ctx || !this.melodyGain) return Promise.resolve();

    const beat = 60 / 100;
    const now = this.ctx.currentTime + 0.05;

    /* delay for music-box shimmer */
    const dly = this.ctx.createDelay();
    dly.delayTime.value = 0.12;
    const fb = this.ctx.createGain();
    fb.gain.value = 0.2;
    dly.connect(fb);
    fb.connect(dly);
    dly.connect(this.melodyGain);

    let t = now;
    HB_MELODY.forEach(([note, beats], i) => {
      /* lyric callback */
      if (onLine) {
        const li = HB_LINE_STARTS.indexOf(i);
        if (li !== -1) {
          const delay = (t - now) * 1000;
          setTimeout(() => onLine(li), delay);
        }
      }

      const freq = FREQ[note];
      const dur = beats * beat;

      /* fundamental */
      const osc = this.ctx!.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;

      /* 3rd-harmonic for music-box brilliance */
      const h = this.ctx!.createOscillator();
      h.type = "sine";
      h.frequency.value = freq * 3;

      const g = this.ctx!.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.22, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.008, t + dur * 0.9);

      const hg = this.ctx!.createGain();
      hg.gain.setValueAtTime(0, t);
      hg.gain.linearRampToValueAtTime(0.05, t + 0.008);
      hg.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.5);

      osc.connect(g); h.connect(hg);
      g.connect(this.melodyGain!); g.connect(dly);
      hg.connect(this.melodyGain!);
      osc.start(t); osc.stop(t + dur);
      h.start(t); h.stop(t + dur);
      this.allOscs.push(osc, h);

      t += dur;
    });

    const total = (t - now) * 1000;
    return new Promise((r) => setTimeout(r, total));
  }

  /* ── helpers ───────────────────────────────────────── */
  private _fadeIn(gain: GainNode, sec: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(1, t + sec);
  }
}
