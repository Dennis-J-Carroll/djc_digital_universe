import type { AudioSynth } from "../audio/synth";
import { randomDelay, requiredElement } from "./dom";
import type { FlowClock } from "./timing";
import { isFlowAbort } from "./timing";

export class CrtController {
  private readonly terminal = requiredElement<HTMLElement>("#terminalWindow");
  private coldness = 0;

  constructor(
    private readonly clock: FlowClock,
    private readonly audio: AudioSynth,
    private readonly reducedMotion: boolean,
  ) {}

  update(coldness: number): void {
    const cold = Math.min(coldness, 6);
    const ratio = cold / 6;
    const root = document.documentElement;
    root.style.setProperty("--phosphor-glow", `${(4 + ratio * 14).toFixed(1)}px`);
    root.style.setProperty("--phosphor-glow2", `${(8 + ratio * 28).toFixed(1)}px`);
    root.style.setProperty("--phosphor-alpha", (0.4 + ratio * 0.5).toFixed(3));
    root.style.setProperty("--phosphor-alpha2", (0.25 + ratio * 0.35).toFixed(3));
    root.style.setProperty("--scanline-opacity", (0.025 + ratio * 0.06).toFixed(4));
    this.terminal.classList.toggle("breathe-active", cold >= 5 && !this.reducedMotion);
    this.coldness = cold;
  }

  maybeGlitch(): void {
    if (this.reducedMotion || Math.random() >= 0.02 + (this.coldness / 6) * 0.16) return;
    this.terminal.classList.add("glitch");
    this.audio.playCrackle();
    setTimeout(() => this.terminal.classList.remove("glitch"), 150);
  }

  candorFlash(): void {
    if (this.reducedMotion) return;
    this.terminal.classList.remove("cooling-flash");
    void this.terminal.offsetWidth;
    this.terminal.classList.add("cooling-flash");
    setTimeout(() => this.terminal.classList.remove("cooling-flash"), 400);
  }

  phaseFlash(): void {
    if (this.reducedMotion) return;
    this.terminal.classList.add("phase-flash");
    setTimeout(() => this.terminal.classList.remove("phase-flash"), 500);
  }

  runFlicker(signal: AbortSignal): void {
    if (this.reducedMotion) return;
    void this.flickerLoop(signal).catch((error: unknown) => {
      if (!isFlowAbort(error)) throw error;
    });
  }

  reset(): void {
    this.update(0);
    this.terminal.classList.remove(
      "breathe-active",
      "cooling-flash",
      "glitch",
      "flicker",
      "phase-flash",
    );
  }

  private async flickerLoop(signal: AbortSignal): Promise<void> {
    while (!signal.aborted) {
      const ratio = this.coldness / 6;
      const minimum = Math.round(14000 - ratio * 12000);
      const maximum = Math.round(18000 - ratio * 15000);
      await this.clock.wait(randomDelay(minimum, maximum), signal);
      this.terminal.classList.add("flicker");
      await this.clock.wait(80, signal);
      this.terminal.classList.remove("flicker");
    }
  }
}
