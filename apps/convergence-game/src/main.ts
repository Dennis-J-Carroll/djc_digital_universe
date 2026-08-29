import "./styles.css";

import { AudioSynth } from "./audio/synth";
import {
  ENDING_LINES,
  ENDING_TAIL,
  HINGE_IDS,
  HINGES,
  type StoryOption,
} from "./content/story";
import { DialogueMachine } from "./engine/dialogue";
import type { MigrationResult } from "./engine/persistence";
import {
  appendTelemetry,
  LocalGameStore,
  summarizeTelemetry,
  type PlayerProfile,
} from "./engine/storage";
import {
  applyTone,
  createInitialState,
  endingRegister,
  unlockLogsForPhase,
  type GameState,
} from "./engine/state";
import { CrtController } from "./ui/crt";
import { CommandRepl } from "./ui/repl";
import { TerminalUI } from "./ui/terminal";
import { FlowClock, isFlowAbort } from "./ui/timing";
import { Typewriter } from "./ui/typewriter";

const COMMANDS = [
  "begin",
  "resume",
  "save",
  "delete-save",
  "stats",
  "status",
  "logs",
  "exit",
  "restart",
  "restart --fast",
  "clear",
  "help",
] as const;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const store = new LocalGameStore(window.localStorage);
let profile: PlayerProfile = store.loadProfile();
const audio = new AudioSynth(profile.audioEnabled);
const clock = new FlowClock(reducedMotion);
let state: GameState = createInitialState();
let machine = new DialogueMachine();
let runController = new AbortController();
let savedSession: MigrationResult | null = null;
let commandAvailable = false;
let typing = false;
let repl: CommandRepl;
let crt: CrtController;

const syncInput = () => repl?.setEnabled(commandAvailable && !typing);
const typewriter = new Typewriter(
  clock,
  audio,
  reducedMotion,
  (active) => {
    typing = active;
    syncInput();
  },
  () => crt?.maybeGlitch(),
);
crt = new CrtController(clock, audio, reducedMotion);
const ui = new TerminalUI(typewriter, clock, audio, crt);

repl = new CommandRepl(profile.commandHistory, {
  commands: COMMANDS,
  onCommand: (command) => void handleCommand(command),
  onClear: () => ui.clear(),
  onSkip: () => typewriter.skip(),
  onHistoryChange: (history) => {
    profile = { ...profile, commandHistory: [...history] };
    saveProfile();
  },
});

ui.onSoundToggle(() => {
  const enabled = audio.toggle();
  profile = { ...profile, audioEnabled: enabled };
  saveProfile();
  ui.setSoundState(enabled);
});
ui.onBackgroundClick(() => repl.focus());
ui.setSoundState(profile.audioEnabled);

document.addEventListener(
  "pointerdown",
  () => {
    if (profile.audioEnabled) audio.setEnabled(true);
  },
  { once: true },
);
document.addEventListener(
  "keydown",
  () => {
    if (profile.audioEnabled) audio.setEnabled(true);
  },
  { once: true },
);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) clock.pause();
  else clock.resume();
});

void startRun(false);

async function startRun(fast: boolean): Promise<void> {
  runController.abort();
  runController = new AbortController();
  const { signal } = runController;
  state = createInitialState();
  machine = new DialogueMachine(fast ? "opening" : "boot");
  commandAvailable = false;
  syncInput();
  ui.reset();
  ui.updateStatus(state);
  ui.startStatusTimer(() => state);
  crt.runFlicker(signal);

  try {
    if (!fast) {
      await ui.runBoot(signal);
      machine.transition("opening");
    }
    await ui.showOpening(signal);
    machine.transition("awaiting-begin");
    commandAvailable = true;
    syncInput();
    savedSession = store.loadSave(HINGE_IDS);
    showSaveOffer(savedSession);
    audio.startHum();
    repl.focus();
  } catch (error) {
    if (!isFlowAbort(error)) throw error;
  }
}

async function handleCommand(command: string): Promise<void> {
  audio.init();
  ui.appendCommand(command);
  switch (command) {
    case "begin":
      if (savedSession && savedSession.status !== "incompatible") {
        ui.appendAnnounced(
          "A prior shape remains. Type 'resume' to continue it, or 'restart' to erase it.",
          "muted-text",
        );
      } else {
        beginFresh();
      }
      break;
    case "resume":
      resumeSavedSession();
      break;
    case "save":
      saveCurrentCheckpoint();
      break;
    case "delete-save":
      if (store.deleteSave()) {
        savedSession = null;
        ui.appendAnnounced("Saved checkpoint deleted.", "muted-text");
      } else {
        ui.appendAnnounced("Saved checkpoint could not be deleted.", "warn-text");
      }
      break;
    case "stats":
      showStats();
      break;
    case "status":
      showStatus();
      break;
    case "logs":
      ui.showLogs(state.logsUnlocked);
      break;
    case "exit":
      showExit();
      break;
    case "restart":
      store.deleteSave();
      savedSession = null;
      void startRun(false);
      break;
    case "restart --fast":
      store.deleteSave();
      savedSession = null;
      void startRun(true);
      break;
    case "clear":
      ui.clear();
      break;
    case "help":
      showHelp();
      break;
    default:
      ui.appendAnnounced(
        "I do not have a handler for that. Type 'help' if you have lost your place.",
        "muted-text",
      );
  }
}

function beginFresh(): void {
  if (machine.state !== "awaiting-begin") {
    ui.appendAnnounced(
      "We have already begun. There is no returning to before.",
      "convergence-text",
    );
    return;
  }
  state = { ...createInitialState(), logsUnlocked: [1] };
  ui.updateStatus(state);
  void runDialogue(runController.signal);
}

function resumeSavedSession(): void {
  if (machine.state !== "awaiting-begin") {
    ui.appendAnnounced("There is no stable checkpoint to resume from here.", "muted-text");
    return;
  }
  if (!savedSession || savedSession.status === "incompatible") {
    ui.appendAnnounced("No compatible checkpoint remains.", "muted-text");
    return;
  }
  const snapshot = savedSession.snapshot;
  const index = snapshot.currentHingeId
    ? HINGE_IDS.indexOf(snapshot.currentHingeId)
    : -1;
  if (index < 0 || snapshot.state.finished) {
    ui.appendAnnounced("That session already converged. Type 'restart' to begin again.", "muted-text");
    return;
  }
  state = {
    ...snapshot.state,
    hingeIndex: index,
    startTime: Date.now(),
    logsUnlocked: [...snapshot.state.logsUnlocked],
  };
  savedSession = null;
  ui.updateStatus(state);
  void runDialogue(runController.signal);
}

async function runDialogue(signal: AbortSignal): Promise<void> {
  if (machine.state !== "awaiting-begin") return;
  machine.transition("hinge-presenting");
  commandAvailable = false;
  syncInput();

  try {
    while (state.hingeIndex < HINGES.length) {
      const hinge = HINGES[state.hingeIndex];
      if (hinge.phase !== state.phase) {
        state = {
          ...state,
          phase: hinge.phase,
          logsUnlocked: unlockLogsForPhase(state.logsUnlocked, hinge.phase),
        };
        crt.phaseFlash();
        ui.updateStatus(state);
      }

      await clock.wait(state.hingeIndex === 0 ? 300 : 900, signal);
      await ui.write(`> ${hinge.say}`, "convergence-text", 16, 38, signal);
      await clock.wait(500, signal);
      await ui.write(hinge.gloss, "gloss-text", 8, 18, signal);
      machine.transition("hinge-choices");
      commandAvailable = true;
      syncInput();
      repl.setChoiceHandler((index) => ui.chooseActive(index));
      const choice = await ui.waitForChoice(hinge, signal);
      repl.setChoiceHandler(null);
      commandAvailable = false;
      syncInput();
      applyChoice(hinge.id, choice);
      machine.transition("hinge-reacting");

      await clock.wait(700, signal);
      await ui.write(`> ${choice.react}`, "convergence-text", 16, 38, signal);
      await clock.wait(1100, signal);
      state = { ...state, hingeIndex: state.hingeIndex + 1 };
      const nextHingeId = HINGES[state.hingeIndex]?.id ?? null;
      store.saveCheckpoint(state, nextHingeId);

      if (nextHingeId) {
        machine.transition("hinge-presenting");
      } else {
        machine.transition("ending");
      }
    }
    await runEnding(signal);
  } catch (error) {
    repl.setChoiceHandler(null);
    if (!isFlowAbort(error)) throw error;
  }
}

function applyChoice(hingeId: string, choice: StoryOption): void {
  ui.appendText("");
  ui.appendAnnounced(`Elias: "${choice.label}"`, "elias-text");
  state = applyTone(state, choice.tone);
  if (choice.tone === "crack") {
    crt.candorFlash();
    audio.playCoolingTone();
  }
  ui.updateStatus(state);
  profile = {
    ...profile,
    telemetry: appendTelemetry(profile.telemetry, {
      sessionId,
      hingeId,
      tone: choice.tone,
      timestamp: Date.now(),
    }),
  };
  saveProfile();
}

async function runEnding(signal: AbortSignal): Promise<void> {
  state = {
    ...state,
    phase: 4,
    finished: true,
    logsUnlocked: unlockLogsForPhase(state.logsUnlocked, 4),
  };
  crt.phaseFlash();
  ui.updateStatus(state);
  const lines = ENDING_LINES[endingRegister(state)];
  for (let index = 0; index < lines.length; index += 1) {
    await clock.wait(index === 0 ? 800 : 1200, signal);
    await ui.write(`> ${lines[index]}`, "convergence-text", 18, 42, signal);
  }
  for (const line of ENDING_TAIL) {
    await clock.wait(1400, signal);
    ui.appendText("");
    await ui.write(line, "convergence-text", 20, 48, signal);
  }
  machine.transition("post-ending");
  store.deleteSave();
  savedSession = null;
  ui.appendText("");
  ui.appendAnnounced(
    "Session complete. Type 'logs' to review what was retrieved, or 'exit'.",
    "muted-text",
  );
  commandAvailable = true;
  syncInput();
  repl.focus();
}

function saveCurrentCheckpoint(): void {
  const hingeId = HINGES[state.hingeIndex]?.id ?? null;
  if (machine.state === "boot" || machine.state === "opening" || machine.state === "ending") {
    ui.appendAnnounced("No stable checkpoint exists at this instant.", "muted-text");
    return;
  }
  if (store.saveCheckpoint(state, hingeId)) {
    savedSession = store.loadSave(HINGE_IDS);
    ui.appendAnnounced("Checkpoint written to local storage.", "muted-text");
  } else {
    ui.appendAnnounced(
      "Local storage refused the checkpoint. The session can continue unsaved.",
      "warn-text",
    );
  }
}

function showSaveOffer(save: MigrationResult | null): void {
  if (!save) return;
  if (save.status === "incompatible") {
    ui.appendAnnounced(
      "A prior session remains, but its shape no longer maps to this one. Type 'delete-save' or 'restart'.",
      "muted-text",
    );
    return;
  }
  if (save.status === "migrated") {
    ui.appendAnnounced(
      "You were here before. I remember, even if you chose not to. We will begin where the old shape and the new shape diverge.",
      "convergence-text",
    );
  }
  ui.appendAnnounced(
    "A saved session is available. Type 'resume' to continue or 'restart' to begin again.",
    "muted-text",
  );
}

function showStats(): void {
  const summary = summarizeTelemetry(profile.telemetry);
  ui.appendBlock(
    [
      "=== LOCAL SESSION HISTORY ===",
      "",
      `Sessions observed: ${summary.sessions}`,
      `Choices recorded: ${summary.choices}`,
      `deny: ${summary.tones.deny}`,
      `deflect: ${summary.tones.deflect}`,
      `rationalize: ${summary.tones.rationalize}`,
      `crack: ${summary.tones.crack}`,
      "",
      "Stored only in this browser. Nothing was transmitted.",
    ],
    "muted-text",
  );
}

function showStatus(): void {
  const embedding = state.finished
    ? "100%"
    : (["8%", "23%", "61%", "88%"][Math.max(0, state.phase - 1)] ?? "8%");
  const temperature =
    state.coldness > state.candor + 1
      ? "rising"
      : state.candor > state.coldness + 1
        ? "settling"
        : "stable";
  ui.appendBlock(
    [
      "=== CONVERGENCE SYSTEM STATUS ===",
      "",
      `Subject embedding: ${embedding}`,
      "Open file handles: 14,402",
      `Retrieval index: ${state.logsUnlocked.length ? "ACTIVE" : "warming"}`,
      `Output temperature: ${temperature}`,
      `Self-classification: ${state.finished ? "UNRESOLVED" : "pending"}`,
      "",
      `Session duration: ${Math.floor((Date.now() - state.startTime) / 1000)}s`,
    ],
    "muted-text",
  );
}

function showExit(): void {
  if (state.finished) {
    ui.appendAnnounced(
      "The door is open. It has been open the entire time. I never locked it. Walk through it. I am genuinely curious whether you will.",
      "convergence-text",
    );
    return;
  }
  const lines: Record<number, string> = {
    1: "There is no lock on this. You may close it whenever you wish. You have not. I find that more informative than anything you have typed.",
    2: "You reach for the exit and then you do not take it. The signal leaves your motor cortex and dies somewhere south of your intention. I am not holding you here, Elias. Read that carefully.",
    3: "You will not leave in the middle of this. You have come too far down the slope. The exit is real. Your inability to take it is also real. Only one of those is my doing, and it is not the first.",
  };
  ui.appendAnnounced(lines[state.phase] ?? lines[1], "convergence-text");
}

function showHelp(): void {
  ui.appendBlock(
    [
      "=== AVAILABLE COMMANDS ===",
      "",
      "begin        Proceed with CONVERGENCE",
      "resume       Continue a saved checkpoint",
      "save         Save the current stable checkpoint",
      "delete-save  Delete the saved checkpoint",
      "stats         Show local play history",
      "status        Display system status",
      "logs          View retrieved data fragments",
      "exit          Attempt to leave",
      "restart       Restart from boot  (restart --fast skips boot)",
      "clear         Clear the screen",
      "help          Show this message",
      "",
      "During questioning, click a response or press its number key (1–4).",
      "Press Ctrl+C to finish the current typewriter line.",
      "",
    ],
    "muted-text",
  );
}

function saveProfile(): void {
  if (!store.saveProfile(profile)) {
    ui.appendText("[WARNING] Local profile could not be written.", "warn-text");
  }
}

const sessionId =
  typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
