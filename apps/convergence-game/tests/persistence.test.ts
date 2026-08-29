import { describe, expect, it } from "vitest";

import { createInitialState } from "../src/engine/state";
import {
  createSaveSnapshot,
  migrateSave,
  SAVE_SCHEMA_VERSION,
  STORY_VERSION,
} from "../src/engine/persistence";

const hingeIds = [
  "contact-work",
  "attention-tokens",
  "money-circuit",
  "salient-date",
  "voice-memo",
  "ownership",
] as const;

describe("save migration", () => {
  it("round-trips current checkpoints", () => {
    const state = { ...createInitialState(10), phase: 2, hingeIndex: 2 };
    const snapshot = createSaveSnapshot(state, "money-circuit", 20);

    const result = migrateSave(snapshot, hingeIds);

    expect(result).toEqual({ status: "ready", snapshot });
  });

  it("migrates legacy index saves to stable node IDs", () => {
    const legacy = {
      schemaVersion: 1,
      storyVersion: 0,
      savedAt: 20,
      hingeIndex: 2,
      state: { ...createInitialState(10), phase: 2, hingeIndex: 2 },
    };

    const result = migrateSave(legacy, hingeIds);

    expect(result.status).toBe("migrated");
    expect(result.snapshot).toMatchObject({
      schemaVersion: SAVE_SCHEMA_VERSION,
      storyVersion: STORY_VERSION,
      currentHingeId: "money-circuit",
    });
  });

  it("keeps nearest stable node when content version changes", () => {
    const olderStory = {
      ...createSaveSnapshot(createInitialState(10), "salient-date", 20),
      storyVersion: STORY_VERSION - 1,
    };

    const result = migrateSave(olderStory, hingeIds);

    expect(result.status).toBe("migrated");
    expect(result.snapshot?.currentHingeId).toBe("salient-date");
  });

  it("rejects unknown nodes and future schemas", () => {
    const unknownNode = createSaveSnapshot(createInitialState(), "removed-node", 20);
    const futureSchema = {
      ...createSaveSnapshot(createInitialState(), "contact-work", 20),
      schemaVersion: SAVE_SCHEMA_VERSION + 1,
    };

    expect(migrateSave(unknownNode, hingeIds).status).toBe("incompatible");
    expect(migrateSave(futureSchema, hingeIds).status).toBe("incompatible");
  });
});
