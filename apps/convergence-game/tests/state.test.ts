import { describe, expect, it } from "vitest";

import {
  applyTone,
  createInitialState,
  endingRegister,
  unlockLogsForPhase,
} from "../src/engine/state";

describe("CONVERGENCE state", () => {
  it("applies authored tone deltas without mutating prior state", () => {
    const initial = createInitialState(1000);

    const denied = applyTone(initial, "deny");
    const rationalized = applyTone(initial, "rationalize");
    const cracked = applyTone({ ...initial, coldness: 1 }, "crack");

    expect(initial).toMatchObject({ coldness: 0, candor: 0 });
    expect(denied).toMatchObject({ coldness: 1, candor: 0 });
    expect(rationalized).toMatchObject({ coldness: 0.5, candor: 0.5 });
    expect(cracked).toMatchObject({ coldness: 0, candor: 1 });
  });

  it("selects ending register at exact thresholds with candor precedence", () => {
    expect(endingRegister({ coldness: 3.5, candor: 3.5 })).toBe("neutral");
    expect(endingRegister({ coldness: 0, candor: 4 })).toBe("candid");
    expect(endingRegister({ coldness: 4, candor: 0 })).toBe("cold");
    expect(endingRegister({ coldness: 5, candor: 4 })).toBe("candid");
  });

  it("unlocks evidence cumulatively, uniquely, and immutably", () => {
    const original = [1];
    const unlocked = unlockLogsForPhase(original, 3);

    expect(original).toEqual([1]);
    expect(unlocked).toEqual([1, 2, 3]);
    expect(unlockLogsForPhase(unlocked, 2)).toEqual([1, 2, 3]);
  });
});
