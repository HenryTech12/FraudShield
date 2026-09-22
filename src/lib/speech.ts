// Audio & Speech synthesis helper with graceful fallbacks

class VoiceSynthesizer {
  private isMuted: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioCtx: AudioContext | null = null;

  constructor() {
    // Check if muted preference is stored
    try {
      const stored = localStorage.getItem('fraudshield_muted');
      if (stored !== null) {
        this.isMuted = stored === 'true';
      }
    } catch {
      this.isMuted = false;
    }
  }

  public get muted(): boolean {
    return this.isMuted;
  }

  public set muted(val: boolean) {
    this.isMuted = val;
    try {
      localStorage.setItem('fraudshield_muted', String(val));
    } catch {}
    if (val) {
      this.stop();
    }
  }

  public toggleMute(): boolean {
    this.muted = !this.isMuted;
    return this.isMuted;
  }

  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    this.currentUtterance = null;
  }

  // Play a gentle electronic ringtone or chime using Web Audio API
  public playChime(type: 'ring' | 'connected' | 'freeze' | 'approved'): void {
    if (this.isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'ring') {
        // Soft phone ring burst (440Hz + 480Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(480, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'connected') {
        // Welcoming two-tone pickup chime (523Hz -> 659Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'freeze') {
        // Gentle safety alert tone (low soft chime)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.setValueAtTime(260, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (type === 'approved') {
        // Reassuring harmonic major chime (523Hz -> 784Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch {
      // Audio context may not be allowed without user interaction
    }
  }

  // Speak AI lines using SpeechSynthesis
  public speak(
    text: string,
    onEnd?: () => void,
    onError?: () => void
  ): void {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) {
        // If muted or unavailable, allow scripted pacing to proceed
        setTimeout(onEnd, 1500);
      }
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const cleanText = text
        .replace(/AED\s?([\d,]+)/g, '$1 UAE Dirhams')
        .replace(/\bDeira\b/gi, 'Day-rah')
        .replace(/[•*]/g, '');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      this.currentUtterance = utterance;

      utterance.rate = 0.96; // Calm, clear, reassuring pace
      utterance.pitch = 1.02;

      // Select best natural voice available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Neural') ||
            v.name.includes('Samantha') ||
            v.name.includes('Karen') ||
            v.name.includes('Moira') ||
            v.name.includes('Google UK English Female') ||
            v.name.includes('Zira'))
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      let ended = false;
      const handleDone = () => {
        if (!ended) {
          ended = true;
          this.currentUtterance = null;
          if (onEnd) onEnd();
        }
      };

      utterance.onend = handleDone;
      utterance.onerror = () => {
        if (!ended) {
          ended = true;
          this.currentUtterance = null;
          if (onError) onError();
          else if (onEnd) onEnd();
        }
      };

      // Fallback timer in case speech synthesis stalls
      const words = cleanText.split(' ').length;
      const estimatedDurationMs = Math.max(2000, (words / 2.5) * 1000 + 1000);
      setTimeout(() => {
        if (!ended) {
          handleDone();
        }
      }, estimatedDurationMs);

      window.speechSynthesis.speak(utterance);
    } catch {
      if (onEnd) setTimeout(onEnd, 1500);
    }
  }
}

export const speechSynthesizer = new VoiceSynthesizer();
