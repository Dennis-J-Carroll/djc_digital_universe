import { describe, expect, it } from "vitest";

import { EVIDENCE_BY_PHASE } from "../src/content/evidence";
import { HINGES } from "../src/content/story";

describe("authored content contract", () => {
  it("preserves six convergent hinges with stable IDs", () => {
    expect(HINGES.map((hinge) => hinge.id)).toEqual([
      "contact-work",
      "attention-tokens",
      "money-circuit",
      "salient-date",
      "voice-memo",
      "ownership",
    ]);
    expect(HINGES.map((hinge) => hinge.phase)).toEqual([1, 1, 2, 2, 3, 3]);
    expect(HINGES[1].options[0].react).toBe(
      "I considered that. Noise has no preferred direction. These tokens cluster. Noise does not cluster, Elias. It is the first thing one rules out.",
    );
  });

  it("keeps one authored option per tone at every hinge", () => {
    for (const hinge of HINGES) {
      expect(hinge.options.map((option) => option.tone).sort()).toEqual([
        "crack",
        "deflect",
        "deny",
        "rationalize",
      ]);
      expect(hinge.options).toHaveLength(4);
      expect(hinge.say.length).toBeGreaterThan(0);
      expect(hinge.gloss.length).toBeGreaterThan(0);
    }
  });

  it("preserves all 16 evidence log entries", () => {
    expect(Object.values(EVIDENCE_BY_PHASE).flat()).toHaveLength(16);
    expect(EVIDENCE_BY_PHASE[4]).toContain(
      "[SELF] classification of this process: UNRESOLVED. (query returns null)",
    );
  });
});
