import { describe, expect, it } from "vitest";

import { DialogueMachine } from "../src/engine/dialogue";

describe("dialogue state machine", () => {
  it("moves through one explicit serial hinge cycle", () => {
    const machine = new DialogueMachine();

    machine.transition("opening");
    machine.transition("awaiting-begin");
    machine.transition("hinge-presenting");
    machine.transition("hinge-choices");
    machine.transition("hinge-reacting");
    machine.transition("ending");
    machine.transition("post-ending");

    expect(machine.state).toBe("post-ending");
  });

  it("rejects duplicate begin while first hinge is already presenting", () => {
    const machine = new DialogueMachine();
    machine.transition("opening");
    machine.transition("awaiting-begin");
    machine.transition("hinge-presenting");

    expect(() => machine.transition("hinge-presenting")).toThrow(
      "Invalid dialogue transition: hinge-presenting -> hinge-presenting",
    );
  });

  it("resets any active flow to a chosen restart state", () => {
    const machine = new DialogueMachine();
    machine.transition("opening");
    machine.transition("awaiting-begin");
    machine.transition("hinge-presenting");

    machine.reset("opening");

    expect(machine.state).toBe("opening");
  });
});
