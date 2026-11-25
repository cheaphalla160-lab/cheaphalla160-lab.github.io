// Cheerful background music & sound effects via Web Audio API + Web Speech API helpers

class AudioEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private isMusicPlaying = false;
  private stepTimer: number | null = null;
  private stepIndex = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  // Cheerful C-major marimba/xylophone loop (frequencies in Hz)
  private readonly melodyNotes: (number | null)[] = [
    523.25, 659.25, 783.99, 659.25, // C5 E5 G5 E5
    880.0, 783.99, 659.25, null,    // A5 G5 E5 -
    587.33, 698.46, 880.0, 698.46,  // D5 F5 A5 F5
    783.99, 659.25, 587.33, null,   // G5 E5 D5 -
    523.25, 659.25, 783.99, 1046.5, // C5 E5 G5 C6
    880.0, 783.99, 659.25, 587.33,  // A5 G5 E5 D5
    523.25, 587.33, 659.25, 783.99, // C5 D5 E5 G5
    523.25, null, 523.25, null,     // C5 - C5 -
  ];

  private readonly bassNotes: (number | null)[] = [
    130.81, null, 196.0, null, // C3 - G3 -
    130.81, null, 196.0, null,
    174.61, null, 130.81, null, // F3 - C3 -
    196.0, null, 146.83, null,  // G3 - D3 -
    130.81, null, 196.0, null,
    174.61, null, 130.81, null,
    196.0, null, 196.0, null,
    130.81, null, null, null,
  ];

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    targetNode?: AudioNode,
    delay = 0
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(targetNode ?? ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public startMusic() {
    if (this.isMusicPlaying) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    if (!this.musicGain) {
      this.musicGain = ctx.createGain();
      this.musicGain.gain.value = 0.24;
      this.musicGain.connect(ctx.destination);
    }

    this.isMusicPlaying = true;
    const stepMs = 260; // Playful ~115 BPM eighth-note pulse

    const tick = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;
      const idx = this.stepIndex % this.melodyNotes.length;
      const mel = this.melodyNotes[idx];
      const bass = this.bassNotes[idx];

      if (mel) {
        this.playTone(mel, 0.22, 'triangle', 0.22, this.musicGain);
      }
      if (bass) {
        this.playTone(bass, 0.34, 'sine', 0.2, this.musicGain);
      }

      this.stepIndex += 1;
      this.stepTimer = window.setTimeout(tick, stepMs);
    };

    tick();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.stepTimer !== null) {
      window.clearTimeout(this.stepTimer);
      this.stepTimer = null;
    }
  }

  public toggleMusic(): boolean {
    if (this.isMusicPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  public getMusicState(): boolean {
    return this.isMusicPlaying;
  }

  public playPop() {
    this.playTone(523.25, 0.09, 'sine', 0.16, undefined, 0);
    this.playTone(783.99, 0.12, 'triangle', 0.16, undefined, 0.05);
  }

  public playStack() {
    this.playTone(392.0, 0.1, 'triangle', 0.18, undefined, 0);
    this.playTone(587.33, 0.14, 'sine', 0.16, undefined, 0.06);
  }

  public playSuccess() {
    this.playTone(523.25, 0.12, 'triangle', 0.18, undefined, 0);
    this.playTone(659.25, 0.12, 'triangle', 0.18, undefined, 0.08);
    this.playTone(783.99, 0.22, 'triangle', 0.2, undefined, 0.16);
  }

  public playGentleNudge() {
    this.playTone(349.23, 0.14, 'sine', 0.13, undefined, 0);
    this.playTone(311.13, 0.18, 'sine', 0.12, undefined, 0.12);
  }

  public playFanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((n, idx) => {
      this.playTone(n, idx === notes.length - 1 ? 0.42 : 0.15, 'triangle', 0.2, undefined, idx * 0.09);
    });
  }
}

export const audioEngine = new AudioEngine();

export function speakEnglish(text: string, rate = 0.88): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      utterance.pitch = 1.08;

      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find((v) => v.lang.startsWith('en-US') && /natural|google|samantha|aria|jenny/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith('en-US')) ||
        voices.find((v) => v.lang.startsWith('en'));

      if (preferred) {
        utterance.voice = preferred;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    } catch {
      resolve();
    }
  });
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  results: {
    [index: number]: SpeechRecognitionResultLike;
    length: number;
  };
}

interface SpeechRecognitionInstanceLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionInstanceLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstanceLike;
  };
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export interface ListenResult {
  matched: boolean;
  transcript: string;
  error?: string;
}

export function listenForWord(aliases: string[]): {
  promise: Promise<ListenResult>;
  stop: () => void;
} {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionInstanceLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstanceLike;
  };
  const RecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;

  if (!RecognitionCtor) {
    return {
      promise: Promise.resolve({
        matched: false,
        transcript: '',
        error: 'Speech recognition not available in this browser.',
      }),
      stop: () => {},
    };
  }

  const recognition = new RecognitionCtor();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;

  let settled = false;

  const promise = new Promise<ListenResult>((resolve) => {
    const finish = (res: ListenResult) => {
      if (settled) return;
      settled = true;
      resolve(res);
    };

    const timeoutId = window.setTimeout(() => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
      finish({ matched: false, transcript: '', error: 'timeout' });
    }, 5500);

    recognition.onresult = (event) => {
      window.clearTimeout(timeoutId);
      const candidates: string[] = [];
      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i];
        for (let j = 0; j < 3; j += 1) {
          if (result[j]?.transcript) {
            candidates.push(result[j].transcript.toLowerCase().trim());
          }
        }
      }
      const primary = candidates[0] || '';
      const normalizedAliases = aliases.map((a) => a.toLowerCase());
      const matched = candidates.some((cand) =>
        normalizedAliases.some((alias) => cand.includes(alias) || alias.includes(cand))
      );
      finish({ matched, transcript: primary });
    };

    recognition.onerror = (event) => {
      window.clearTimeout(timeoutId);
      finish({ matched: false, transcript: '', error: event.error });
    };

    recognition.onend = () => {
      window.clearTimeout(timeoutId);
      finish({ matched: false, transcript: '', error: 'no-speech' });
    };

    try {
      recognition.start();
    } catch {
      window.clearTimeout(timeoutId);
      finish({ matched: false, transcript: '', error: 'start-failed' });
    }
  });

  return {
    promise,
    stop: () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    },
  };
}
