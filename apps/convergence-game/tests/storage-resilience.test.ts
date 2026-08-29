import { describe, expect, it } from "vitest";

import { createInitialState } from "../src/engine/state";
import { createProfile, LocalGameStore } from "../src/engine/storage";

const deniedStorage = {
  get length() {
    return 0;
  },
  clear() {
    throw new Error("denied");
  },
  getItem() {
    throw new Error("denied");
  },
  key() {
    return null;
  },
  removeItem() {
    throw new Error("denied");
  },
  setItem() {
    throw new Error("denied");
  },
} satisfies Storage;

describe("storage resilience", () => {
  it("keeps game playable when browser storage is unavailable", () => {
    const store = new LocalGameStore(deniedStorage);

    expect(store.loadSave(["contact-work"])).toBeNull();
    expect(store.loadProfile()).toEqual(createProfile());
    expect(store.saveCheckpoint(createInitialState(), "contact-work")).toBe(false);
    expect(store.saveProfile(createProfile())).toBe(false);
    expect(store.deleteSave()).toBe(false);
  });
});
