import type { AudioSynth } from "../audio/synth";
import { randomDelay } from "./dom";
import type { FlowClock } from "./timing";

export class Typewriter {
  private skipRequested = false;

  constructor(
    private readonly clock: FlowClock,
    private readonly audio: AudioSynth,
    private readonly reducedMotion: boolean,
    private readonly onTypingChange: (typing: boolean) => void,
    private readonly onCharacter: () => void,
  ) {}

  skip(): void {
    this.skipRequested = true;
  }

  async write(
    element: HTMLElement,
    text: string,
    speedMinimum: number,
    speedMaximum: number,
    signal: AbortSignal,
  ): Promise<void> {
    this.skipRequested = false;
    this.onTypingChange(true);
    element.classList.add("type-cursor");
    try {
      if (this.reducedMotion) {
        element.textContent = text;
        return;
      }
      for (const character of text) {
        await this.clock.wait(0, signal);
        if (this.skipRequested) {
          element.textContent = text;
          break;
        }
        element.textContent += character;
        this.audio.playClick();
        this.onCharacter();
        await this.clock.wait(randomDelay(speedMinimum, speedMaximum), signal);
      }
    } finally {
      element.classList.remove("type-cursor");
      this.onTypingChange(false);
    }
  }
}
