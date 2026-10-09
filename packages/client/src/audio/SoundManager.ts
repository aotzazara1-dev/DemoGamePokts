/**
 * Procedural 8-bit Sound Effects Engine (Web Audio API).
 * Generates retro Chiptune sound effects in real-time with 0 external sound files.
 */
export class SoundManager {
  private static instance: SoundManager;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.25;

  private constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pokts_audio_muted');
        if (saved !== null) {
          this.isMuted = saved === 'true';
        }
      } catch {
        // Ignore localStorage restrictions
      }
    }
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private initAudio(): boolean {
    if (typeof window === 'undefined') return false;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return false;

    if (!this.ctx) {
      try {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      } catch (err) {
        console.warn('[SoundManager] Web Audio not available', err);
        return false;
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return true;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('pokts_audio_muted', muted ? 'true' : 'false');
      } catch {}
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  // ----------------------------------------------------
  // Sound Synthesis Helpers
  // ----------------------------------------------------

  /**
   * Play a square / synth wave tone with pitch slide and exponential decay.
   */
  private playTone(
    startFreq: number,
    endFreq: number,
    duration: number,
    type: OscillatorType = 'square',
    peakGain: number = 0.3
  ): void {
    if (this.isMuted || !this.initAudio() || !this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(10, endFreq), now + duration);

      gain.gain.setValueAtTime(peakGain, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch {
      // AudioContext dropped or blocked
    }
  }

  /**
   * White noise burst for physical hit/impact crunch.
   */
  private playNoise(duration: number = 0.1, filterFreq: number = 1000): void {
    if (this.isMuted || !this.initAudio() || !this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterFreq, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + duration);
    } catch {
      // AudioContext error catch
    }
  }

  // ----------------------------------------------------
  // Combat Sound FX Suite
  // ----------------------------------------------------

  /** ⚔️ Physical Attack: Quick retro downward slash */
  public playAttack(): void {
    this.playTone(580, 110, 0.1, 'square', 0.25);
  }

  /** 🩸 Hit Impact: Crunchy 8-bit noise punch */
  public playHit(): void {
    this.playNoise(0.12, 1200);
    this.playTone(180, 50, 0.1, 'triangle', 0.3);
  }

  /** ✨ Magic Skill: Rapid 4-note Chiptune Arpeggio */
  public playSkill(): void {
    if (this.isMuted || !this.initAudio() || !this.ctx || !this.masterGain) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, freq * 1.05, 0.08, 'square', 0.2);
      }, idx * 45);
    });
  }

  /** 🛡️ Defend / Guard: Heavy shield thud */
  public playDefend(): void {
    this.playTone(140, 50, 0.16, 'triangle', 0.4);
    this.playTone(800, 400, 0.04, 'square', 0.15); // subtle metallic click
  }

  /** 💚 Heal: Warm upward chime sweep */
  public playHeal(): void {
    if (this.isMuted || !this.initAudio() || !this.ctx || !this.masterGain) return;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, freq * 1.1, 0.12, 'sine', 0.25);
      }, idx * 50);
    });
  }

  /** 💧 Spirit SP Restore: Crystal water sparkle */
  public playSpRestore(): void {
    this.playTone(700, 1200, 0.15, 'sine', 0.25);
  }

  /** ❤️ Revive: Heroic rising chord */
  public playRevive(): void {
    if (this.isMuted || !this.initAudio() || !this.ctx || !this.masterGain) return;
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 1046.5]; // C4..C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, freq, 0.14, 'square', 0.22);
      }, idx * 60);
    });
  }

  /** ⭐ Capture Throw: Retro laser zap */
  public playCapture(): void {
    this.playTone(920, 220, 0.18, 'sawtooth', 0.22);
  }

  /** ⭐ Capture Success: Fanfare sparkle chime */
  public playCaptureSuccess(): void {
    if (this.isMuted || !this.initAudio() || !this.ctx || !this.masterGain) return;
    const notes = [587.33, 739.99, 880, 1174.66]; // D5, F#5, A5, D6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, freq * 1.05, 0.15, 'square', 0.25);
      }, idx * 70);
    });
  }

  /** ❌ Capture Fail: Low disappointed double boop */
  public playCaptureFail(): void {
    this.playTone(220, 180, 0.12, 'square', 0.25);
    setTimeout(() => {
      this.playTone(170, 110, 0.18, 'square', 0.25);
    }, 130);
  }

  /** 🏃 Flee: Comic slide whistle down */
  public playFlee(): void {
    this.playTone(650, 180, 0.25, 'triangle', 0.35);
  }

  /** 🏆 Victory Fanfare: Celebratory 8-bit melody */
  public playVictory(): void {
    if (this.isMuted || !this.initAudio() || !this.ctx || !this.masterGain) return;
    const notes = [
      { f: 523.25, d: 110 }, // C5
      { f: 659.25, d: 110 }, // E5
      { f: 783.99, d: 110 }, // G5
      { f: 1046.5, d: 350 }  // C6
    ];
    let time = 0;
    notes.forEach(n => {
      setTimeout(() => {
        this.playTone(n.f, n.f, n.d / 1000, 'square', 0.25);
      }, time);
      time += n.d + 30;
    });
  }

  /** 💀 Defeat: Sad descending 8-bit game over */
  public playDefeat(): void {
    if (this.isMuted || !this.initAudio() || !this.ctx || !this.masterGain) return;
    const notes = [329.63, 311.13, 293.66, 277.18]; // E4, D#4, D4, C#4
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, freq * 0.95, 0.2, 'square', 0.25);
      }, idx * 180);
    });
  }

  /** 🖱️ UI Button Click: Crisp high blip */
  public playButtonClick(): void {
    this.playTone(1350, 1350, 0.025, 'square', 0.12);
  }
}

export const soundManager = SoundManager.getInstance();
