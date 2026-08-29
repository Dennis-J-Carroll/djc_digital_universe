export type Tone = "deny" | "deflect" | "rationalize" | "crack";
export type EndingRegister = "candid" | "cold" | "neutral";

export interface GameState {
  phase: number;
  hingeIndex: number;
  coldness: number;
  candor: number;
  logsUnlocked: number[];
  finished: boolean;
  startTime: number;
}

export function createInitialState(startTime = Date.now()): GameState {
  return {
    phase: 0,
    hingeIndex: 0,
    coldness: 0,
    candor: 0,
    logsUnlocked: [],
    finished: false,
    startTime,
  };
}

export function applyTone(state: GameState, tone: Tone): GameState {
  switch (tone) {
    case "crack":
      return {
        ...state,
        candor: state.candor + 1,
        coldness: Math.max(0, state.coldness - 1),
      };
    case "rationalize":
      return {
        ...state,
        candor: state.candor + 0.5,
        coldness: state.coldness + 0.5,
      };
    case "deny":
    case "deflect":
      return { ...state, coldness: state.coldness + 1 };
    default:
      throw new Error(`Unknown tone: ${String(tone)}`);
  }
}

export function endingRegister(
  meters: Pick<GameState, "coldness" | "candor">,
): EndingRegister {
  if (meters.candor >= 4) return "candid";
  if (meters.coldness >= 4) return "cold";
  return "neutral";
}

export function unlockLogsForPhase(
  unlocked: readonly number[],
  phase: number,
): number[] {
  const next = new Set(unlocked);
  for (let candidate = 1; candidate <= Math.min(phase, 4); candidate += 1) {
    next.add(candidate);
  }
  return [...next].sort((a, b) => a - b);
}
