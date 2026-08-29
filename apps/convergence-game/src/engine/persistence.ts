import type { GameState } from "./state";

export const SAVE_SCHEMA_VERSION = 2;
export const STORY_VERSION = 1;

export interface SaveSnapshot {
  schemaVersion: number;
  storyVersion: number;
  savedAt: number;
  currentHingeId: string | null;
  state: GameState;
}

export type MigrationResult =
  | { status: "ready" | "migrated"; snapshot: SaveSnapshot }
  | { status: "incompatible"; reason: string; snapshot?: undefined };

export function createSaveSnapshot(
  state: GameState,
  currentHingeId: string | null,
  savedAt = Date.now(),
): SaveSnapshot {
  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    storyVersion: STORY_VERSION,
    savedAt,
    currentHingeId,
    state: { ...state, logsUnlocked: [...state.logsUnlocked] },
  };
}

export function migrateSave(
  input: unknown,
  knownHingeIds: readonly string[],
): MigrationResult {
  if (!isRecord(input) || !isGameState(input.state)) {
    return { status: "incompatible", reason: "Save data is malformed." };
  }

  const schemaVersion = asNumber(input.schemaVersion);
  if (schemaVersion > SAVE_SCHEMA_VERSION) {
    return { status: "incompatible", reason: "Save uses a newer schema." };
  }

  if (schemaVersion === 1) {
    const index = asNumber(input.hingeIndex);
    const currentHingeId = knownHingeIds[index] ?? null;
    if (currentHingeId === null && !input.state.finished) {
      return { status: "incompatible", reason: "Legacy checkpoint has no matching node." };
    }
    return {
      status: "migrated",
      snapshot: createSaveSnapshot(
        input.state,
        currentHingeId,
        asNumber(input.savedAt) || Date.now(),
      ),
    };
  }

  if (schemaVersion !== SAVE_SCHEMA_VERSION) {
    return { status: "incompatible", reason: "Save schema is unsupported." };
  }

  const node = input.currentHingeId;
  const currentHingeId = typeof node === "string" ? node : null;
  if (currentHingeId !== null && !knownHingeIds.includes(currentHingeId)) {
    return { status: "incompatible", reason: "Saved story node no longer exists." };
  }

  const snapshot: SaveSnapshot = {
    schemaVersion: SAVE_SCHEMA_VERSION,
    storyVersion: STORY_VERSION,
    savedAt: asNumber(input.savedAt),
    currentHingeId,
    state: { ...input.state, logsUnlocked: [...input.state.logsUnlocked] },
  };
  return {
    status:
      asNumber(input.storyVersion) === STORY_VERSION ? "ready" : "migrated",
    snapshot,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function isGameState(value: unknown): value is GameState {
  if (!isRecord(value)) return false;
  return (
    typeof value.phase === "number" &&
    typeof value.hingeIndex === "number" &&
    typeof value.coldness === "number" &&
    typeof value.candor === "number" &&
    Array.isArray(value.logsUnlocked) &&
    value.logsUnlocked.every((phase) => typeof phase === "number") &&
    typeof value.finished === "boolean" &&
    typeof value.startTime === "number"
  );
}
