import {
  createSaveSnapshot,
  migrateSave,
  type MigrationResult,
} from "./persistence";
import type { GameState, Tone } from "./state";

const SAVE_KEY = "convergence.save.v2";
const PROFILE_KEY = "convergence.profile.v1";
const PROFILE_VERSION = 1;
const TELEMETRY_LIMIT = 500;

export interface TelemetryEvent {
  sessionId: string;
  hingeId: string;
  tone: Tone;
  timestamp: number;
}

export interface PlayerProfile {
  version: number;
  audioEnabled: boolean;
  commandHistory: string[];
  telemetry: TelemetryEvent[];
}

export interface TelemetrySummary {
  choices: number;
  sessions: number;
  tones: Record<Tone, number>;
}

export class LocalGameStore {
  constructor(private readonly storage: Storage) {}

  loadSave(knownHingeIds: readonly string[]): MigrationResult | null {
    try {
      const raw = this.storage.getItem(SAVE_KEY);
      if (!raw) return null;
      return migrateSave(JSON.parse(raw) as unknown, knownHingeIds);
    } catch {
      return null;
    }
  }

  saveCheckpoint(state: GameState, currentHingeId: string | null): boolean {
    try {
      this.storage.setItem(
        SAVE_KEY,
        JSON.stringify(createSaveSnapshot(state, currentHingeId)),
      );
      return true;
    } catch {
      return false;
    }
  }

  deleteSave(): boolean {
    try {
      this.storage.removeItem(SAVE_KEY);
      return true;
    } catch {
      return false;
    }
  }

  loadProfile(): PlayerProfile {
    try {
      const raw = this.storage.getItem(PROFILE_KEY);
      if (!raw) return createProfile();
      const value = JSON.parse(raw) as unknown;
      return isProfile(value) ? value : createProfile();
    } catch {
      return createProfile();
    }
  }

  saveProfile(profile: PlayerProfile): boolean {
    try {
      this.storage.setItem(PROFILE_KEY, JSON.stringify(profile));
      return true;
    } catch {
      return false;
    }
  }
}

export function createProfile(): PlayerProfile {
  return {
    version: PROFILE_VERSION,
    audioEnabled: false,
    commandHistory: [],
    telemetry: [],
  };
}

export function appendTelemetry(
  events: readonly TelemetryEvent[],
  event: TelemetryEvent,
): TelemetryEvent[] {
  return [...events, event].slice(-TELEMETRY_LIMIT);
}

export function summarizeTelemetry(events: readonly TelemetryEvent[]): TelemetrySummary {
  const tones: Record<Tone, number> = {
    crack: 0,
    deflect: 0,
    deny: 0,
    rationalize: 0,
  };
  const sessions = new Set<string>();
  for (const event of events) {
    sessions.add(event.sessionId);
    tones[event.tone] += 1;
  }
  return { choices: events.length, sessions: sessions.size, tones };
}

function isProfile(value: unknown): value is PlayerProfile {
  if (typeof value !== "object" || value === null) return false;
  const profile = value as Record<string, unknown>;
  return (
    profile.version === PROFILE_VERSION &&
    typeof profile.audioEnabled === "boolean" &&
    Array.isArray(profile.commandHistory) &&
    profile.commandHistory.every((entry) => typeof entry === "string") &&
    Array.isArray(profile.telemetry)
  );
}
