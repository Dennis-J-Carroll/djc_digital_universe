import { describe, expect, it } from "vitest";

import { appendTelemetry, summarizeTelemetry } from "../src/engine/storage";

describe("local telemetry", () => {
  it("records choices locally and summarizes tone counts", () => {
    const first = appendTelemetry([], {
      sessionId: "session-a",
      hingeId: "contact-work",
      tone: "deny",
      timestamp: 10,
    });
    const second = appendTelemetry(first, {
      sessionId: "session-a",
      hingeId: "attention-tokens",
      tone: "crack",
      timestamp: 20,
    });

    expect(first).toHaveLength(1);
    expect(second).toHaveLength(2);
    expect(summarizeTelemetry(second)).toEqual({
      choices: 2,
      sessions: 1,
      tones: { crack: 1, deflect: 0, deny: 1, rationalize: 0 },
    });
  });
});
