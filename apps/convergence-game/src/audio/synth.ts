export class AudioSynth {
  private context: AudioContext | null = null;
  private humNode: OscillatorNode | null = null;
  private humGain: GainNode | null = null;

  constructor(public enabled = false) {}

  init(): void {
    if (this.context) return;
    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) return;
    this.context = new AudioContextClass();
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (enabled) {
      this.init();
      this.startHum();
    } else {
      this.stopHum();
    }
  }

  toggle(): boolean {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  startHum(): void {
    const context = this.context;
    if (!context || !this.enabled || this.humNode) return;
    this.humGain = context.createGain();
    this.humGain.gain.setValueAtTime(0.015, context.currentTime);
    this.humNode = context.createOscillator();
    this.humNode.type = "sine";
    this.humNode.frequency.setValueAtTime(60, context.currentTime);
    this.humNode.connect(this.humGain);
    this.humGain.connect(context.destination);
    this.humNode.start();
  }

  stopHum(): void {
    if (this.humNode) {
      try {
        this.humNode.stop();
      } catch {
        // Already stopped.
      }
      this.humNode.disconnect();
      this.humNode = null;
    }
    this.humGain?.disconnect();
    this.humGain = null;
  }

  playClick(): void {
    const context = this.readyContext();
    if (!context) return;
    const sampleRate = context.sampleRate;
    const buffer = context.createBuffer(1, Math.floor(sampleRate * 0.003), sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
    }
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(0.08, context.currentTime);
    source.connect(gain);
    gain.connect(context.destination);
    source.start();
  }

  playCrackle(): void {
    const context = this.readyContext();
    if (!context) return;
    const duration = 0.08;
    const buffer = context.createBuffer(
      1,
      Math.floor(context.sampleRate * duration),
      context.sampleRate,
    );
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2000, context.currentTime);
    filter.Q.setValueAtTime(2, context.currentTime);
    gain.gain.setValueAtTime(0.12, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    source.start();
  }

  playPing(): void {
    this.playTone(880, 880, 0.04, 0.06);
  }

  playCoolingTone(): void {
    this.playTone(440, 220, 0.22, 0.05);
  }

  private playTone(start: number, end: number, duration: number, volume: number): void {
    const context = this.readyContext();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(start, context.currentTime);
    oscillator.frequency.linearRampToValueAtTime(end, context.currentTime + duration);
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration + 0.01);
  }

  private readyContext(): AudioContext | null {
    return this.context && this.enabled ? this.context : null;
  }
}
