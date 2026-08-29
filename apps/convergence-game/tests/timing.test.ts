import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FlowClock, isFlowAbort } from "../src/ui/timing";

describe("flow clock", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("waits for visibility before continuing a paused flow", async () => {
    const clock = new FlowClock(false);
    clock.pause();
    let finished = false;
    const pending = clock.wait(100).then(() => {
      finished = true;
    });

    await vi.advanceTimersByTimeAsync(1000);
    expect(finished).toBe(false);

    clock.resume();
    await vi.advanceTimersByTimeAsync(100);
    await pending;
    expect(finished).toBe(true);
  });

  it("aborts stale restart work", async () => {
    const clock = new FlowClock(false);
    const controller = new AbortController();
    const pending = clock.wait(1000, controller.signal);

    controller.abort();

    await expect(pending).rejects.toSatisfy(isFlowAbort);
  });

  it("collapses waits when reduced motion is active", async () => {
    const clock = new FlowClock(true);
    await expect(clock.wait(10_000)).resolves.toBeUndefined();
  });
});
