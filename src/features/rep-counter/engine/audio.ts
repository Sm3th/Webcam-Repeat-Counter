/**
 * Lightweight, dependency-free rep cues: a short WebAudio beep and optional spoken
 * count. Browser-only (guards for non-DOM environments), framework-free. The
 * AudioContext is created lazily on first use — by then the user has pressed Start,
 * satisfying the autoplay gesture requirement.
 */
type AudioCtor = typeof AudioContext;

interface AudioWindow {
  AudioContext?: AudioCtor;
  webkitAudioContext?: AudioCtor;
}

export class RepCues {
  private ctx: AudioContext | null = null;

  private ensureCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (this.ctx) return this.ctx;
    const w = window as unknown as AudioWindow;
    const Ctor = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) return null;
    this.ctx = new Ctor();
    return this.ctx;
  }

  /** Short percussive tone. */
  beep(freq = 880, durationMs = 120): void {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') void ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const now = ctx.currentTime;
    const end = now + durationMs / 1000;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(end);
  }

  /** Speak a short string (e.g. the rep number) via the platform TTS voice. */
  speak(text: string): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  dispose(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    void this.ctx?.close();
    this.ctx = null;
  }
}
