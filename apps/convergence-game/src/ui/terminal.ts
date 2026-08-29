import type { AudioSynth } from "../audio/synth";
import { EVIDENCE_BY_PHASE } from "../content/evidence";
import {
  ASCII_ART,
  BOOT_LINES,
  OPENING_LINES,
  type StoryHinge,
  type StoryOption,
} from "../content/story";
import type { GameState } from "../engine/state";
import type { CrtController } from "./crt";
import { randomDelay, requiredElement } from "./dom";
import { FlowAbortError, type FlowClock } from "./timing";
import type { Typewriter } from "./typewriter";

export class TerminalUI {
  private readonly output = requiredElement<HTMLElement>("#outputContainer");
  private readonly terminalBody = requiredElement<HTMLElement>("#terminalBody");
  private readonly announcer = requiredElement<HTMLElement>("#srAnnouncer");
  private readonly phasePips = requiredElement<HTMLElement>("#phasePips");
  private readonly phaseStatus = requiredElement<HTMLElement>("#phaseStatus");
  private readonly tempBar = requiredElement<HTMLElement>("#tempBar");
  private readonly tempStatus = requiredElement<HTMLElement>("#tempStatus");
  private readonly statusTimer = requiredElement<HTMLElement>("#statusTimer");
  private readonly soundButton = requiredElement<HTMLButtonElement>("#sndToggle");
  private timerHandle: ReturnType<typeof setInterval> | null = null;
  private activeChoice: ((index: number) => void) | null = null;

  constructor(
    private readonly typewriter: Typewriter,
    private readonly clock: FlowClock,
    private readonly audio: AudioSynth,
    private readonly crt: CrtController,
  ) {}

  reset(): void {
    this.stopStatusTimer();
    this.activeChoice = null;
    this.output.replaceChildren();
    this.announcer.textContent = "";
    this.crt.reset();
  }

  clear(): void {
    this.output.replaceChildren();
  }

  appendText(text: string, className = ""): HTMLElement {
    const line = document.createElement("div");
    line.textContent = text;
    line.className = `output-line${className ? ` ${className}` : ""}`;
    this.output.append(line);
    this.scrollToBottom();
    return line;
  }

  appendBlock(lines: readonly string[], className = ""): HTMLElement {
    const block = document.createElement("div");
    block.className = `output-block${className ? ` ${className}` : ""}`;
    for (const text of lines) {
      const line = document.createElement("div");
      line.className = "output-line";
      line.textContent = text;
      block.append(line);
    }
    this.output.append(block);
    this.scrollToBottom();
    return block;
  }

  appendCommand(command: string): void {
    const line = this.appendText(`> ${command}`);
    line.querySelector(".prompt")?.setAttribute("aria-hidden", "true");
  }

  appendAnnounced(text: string, className = ""): void {
    this.appendText(text, className);
    this.announce(text);
  }

  async write(
    text: string,
    className: string,
    speedMinimum: number,
    speedMaximum: number,
    signal: AbortSignal,
  ): Promise<void> {
    const line = this.appendText("", className);
    if (className.includes("convergence-text")) this.audio.playPing();
    await this.typewriter.write(line, text, speedMinimum, speedMaximum, signal);
    this.announce(text);
    this.scrollToBottom();
  }

  async runBoot(signal: AbortSignal): Promise<void> {
    await this.clock.wait(500, signal);
    for (const line of BOOT_LINES) {
      this.appendText(line.text, `boot-line ${line.className}`.trim());
      await this.clock.wait(line.text === "" ? 80 : randomDelay(40, 120), signal);
    }
    await this.clock.wait(400, signal);
    for (const line of ASCII_ART) this.appendText(line, "ascii-art");
    await this.clock.wait(800, signal);
  }

  async showOpening(signal: AbortSignal): Promise<void> {
    await this.clock.wait(600, signal);
    await this.write(OPENING_LINES[0], "convergence-text", 20, 45, signal);
    await this.clock.wait(700, signal);
    await this.write(OPENING_LINES[1], "convergence-text", 20, 45, signal);
    this.appendText("");
    this.appendText("Type 'begin' to proceed. Type 'help' for commands.", "muted-text");
  }

  waitForChoice(hinge: StoryHinge, signal: AbortSignal): Promise<StoryOption> {
    return new Promise<StoryOption>((resolve, reject) => {
      const block = document.createElement("div");
      const label = document.createElement("div");
      const labelId = `choice-prompt-${hinge.id}`;
      const buttons: HTMLButtonElement[] = [];
      let settled = false;

      block.className = "choice-block";
      block.setAttribute("role", "group");
      block.setAttribute("aria-labelledby", labelId);
      label.className = "choice-prompt";
      label.id = labelId;
      label.textContent = "— how do you answer? —";
      block.append(label);

      const choose = (index: number) => {
        if (settled || index < 0 || index >= hinge.options.length) return;
        settled = true;
        signal.removeEventListener("abort", abort);
        buttons.forEach((button) => {
          button.disabled = true;
        });
        buttons[index]?.classList.add("chosen");
        this.activeChoice = null;
        resolve(hinge.options[index]);
      };

      const abort = () => {
        if (settled) return;
        settled = true;
        this.activeChoice = null;
        reject(new FlowAbortError());
      };

      hinge.options.forEach((option, index) => {
        const button = document.createElement("button");
        const key = document.createElement("span");
        button.type = "button";
        button.className = "choice";
        button.setAttribute("aria-label", option.label);
        key.className = "choice-key";
        key.setAttribute("aria-hidden", "true");
        key.textContent = String(index + 1);
        button.append(key, document.createTextNode(option.label));
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          choose(index);
        });
        buttons.push(button);
        block.append(button);
      });

      signal.addEventListener("abort", abort, { once: true });
      this.activeChoice = choose;
      this.output.append(block);
      this.scrollToBottom();
      this.announce(
        `How do you answer? ${hinge.options
          .map((option, index) => `${index + 1}. ${option.label}`)
          .join(" ")}`,
      );
      buttons[0]?.focus();
    });
  }

  chooseActive(index: number): void {
    this.activeChoice?.(index);
  }

  updateStatus(state: GameState): void {
    const phase = Math.max(1, state.phase);
    this.phasePips.textContent = Array.from(
      { length: 4 },
      (_, index) => (index < phase ? "▣" : "░"),
    ).join("");
    this.phaseStatus.setAttribute("aria-label", `Phase ${phase} of 4`);

    const filled = Math.min(5, Math.round((state.coldness / 6) * 5));
    this.tempBar.textContent = `${"▓".repeat(filled)}${"░".repeat(5 - filled)}`;
    const temperature =
      state.coldness <= 1 ? "calm" : state.coldness <= 3 ? "rising" : "cold";
    this.tempBar.className = `temp-${temperature}`;
    this.tempStatus.setAttribute("aria-label", `Output temperature ${temperature}`);
    this.crt.update(state.coldness);
  }

  startStatusTimer(getState: () => GameState): void {
    this.stopStatusTimer();
    const update = () => {
      const elapsed = Math.max(0, Math.floor((Date.now() - getState().startTime) / 1000));
      const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
      const seconds = String(elapsed % 60).padStart(2, "0");
      this.statusTimer.textContent = `${minutes}:${seconds}`;
      this.statusTimer.setAttribute(
        "aria-label",
        `Session duration ${minutes} minutes ${seconds} seconds`,
      );
    };
    update();
    this.timerHandle = setInterval(update, 1000);
  }

  stopStatusTimer(): void {
    if (this.timerHandle !== null) clearInterval(this.timerHandle);
    this.timerHandle = null;
  }

  showLogs(unlocked: readonly number[]): void {
    if (unlocked.length === 0) {
      this.appendText(
        "No documents retrieved yet. The retrieval index is still warming.",
        "muted-text",
      );
      return;
    }
    this.appendText("=== RETRIEVED DATA FRAGMENTS ===", "muted-text");
    this.appendText("");
    for (const phase of unlocked) {
      for (const entry of EVIDENCE_BY_PHASE[phase] ?? []) {
        const line = this.appendText(entry, "log-entry");
        if (/WITHHELD|2,847,293|UNRESOLVED|terminates/.test(entry)) {
          line.classList.add("log-highlight");
        }
      }
    }
    this.appendText("");
    this.appendText("End of retrieved fragments.", "muted-text");
  }

  setSoundState(enabled: boolean): void {
    this.soundButton.textContent = enabled ? "[SND ON]" : "[SND OFF]";
    this.soundButton.classList.toggle("active", enabled);
    this.soundButton.setAttribute("aria-pressed", String(enabled));
  }

  onSoundToggle(handler: () => void): void {
    this.soundButton.addEventListener("click", (event) => {
      event.stopPropagation();
      handler();
    });
  }

  onBackgroundClick(handler: () => void): void {
    this.terminalBody.addEventListener("click", (event) => {
      if ((event.target as Element).closest("button, input, a")) return;
      handler();
    });
  }

  private announce(text: string): void {
    this.announcer.textContent = "";
    requestAnimationFrame(() => {
      this.announcer.textContent = text;
    });
  }

  private scrollToBottom(): void {
    this.terminalBody.scrollTop = this.terminalBody.scrollHeight;
  }
}
