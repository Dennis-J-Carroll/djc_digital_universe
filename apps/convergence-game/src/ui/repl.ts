import { requiredElement } from "./dom";

interface ReplOptions {
  commands: readonly string[];
  onCommand: (command: string) => void;
  onClear: () => void;
  onSkip: () => void;
  onHistoryChange: (history: readonly string[]) => void;
}

export class CommandRepl {
  private readonly input = requiredElement<HTMLInputElement>("#cmdInput");
  private readonly history: string[];
  private historyIndex: number;
  private choiceHandler: ((index: number) => void) | null = null;

  constructor(initialHistory: readonly string[], private readonly options: ReplOptions) {
    this.history = [...initialHistory];
    this.historyIndex = this.history.length;
    this.input.addEventListener("keydown", (event) => this.handleInput(event));
    document.addEventListener("keydown", (event) => this.handleDocument(event));
  }

  setEnabled(enabled: boolean): void {
    this.input.disabled = !enabled;
  }

  focus(): void {
    if (!this.input.disabled) this.input.focus();
  }

  setChoiceHandler(handler: ((index: number) => void) | null): void {
    this.choiceHandler = handler;
  }

  private handleInput(event: KeyboardEvent): void {
    if (event.key === "Enter") {
      const command = normalizeCommand(this.input.value);
      this.input.value = "";
      if (!command) return;
      this.history.push(command);
      this.historyIndex = this.history.length;
      this.options.onHistoryChange(this.history);
      this.options.onCommand(command);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex -= 1;
        this.input.value = this.history[this.historyIndex] ?? "";
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex += 1;
        this.input.value = this.history[this.historyIndex] ?? "";
      } else {
        this.historyIndex = this.history.length;
        this.input.value = "";
      }
      return;
    }
    if (event.key === "Tab" && !event.shiftKey) {
      const completion = autocomplete(this.input.value, this.options.commands);
      if (completion) {
        event.preventDefault();
        this.input.value = completion;
      }
      return;
    }
    if (event.key.toLowerCase() === "l" && event.ctrlKey) {
      event.preventDefault();
      this.options.onClear();
    }
  }

  private handleDocument(event: KeyboardEvent): void {
    if (event.key.toLowerCase() === "c" && event.ctrlKey) {
      event.preventDefault();
      this.options.onSkip();
      return;
    }
    if (
      this.choiceHandler &&
      ["1", "2", "3", "4"].includes(event.key) &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      this.input.value === ""
    ) {
      event.preventDefault();
      this.choiceHandler(Number(event.key) - 1);
    }
  }
}

export function normalizeCommand(command: string): string {
  return command.trim().replace(/\s+/g, " ").toLowerCase();
}

function autocomplete(partial: string, commands: readonly string[]): string | null {
  const normalized = partial.trim().toLowerCase();
  if (!normalized) return null;
  const matches = commands.filter((command) => command.startsWith(normalized));
  return matches.length === 1 ? matches[0] : null;
}
