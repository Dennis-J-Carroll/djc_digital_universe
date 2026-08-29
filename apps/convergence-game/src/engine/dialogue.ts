export type DialogueState =
  | "boot"
  | "opening"
  | "awaiting-begin"
  | "hinge-presenting"
  | "hinge-choices"
  | "hinge-reacting"
  | "ending"
  | "post-ending";

const allowedTransitions: Record<DialogueState, readonly DialogueState[]> = {
  boot: ["opening"],
  opening: ["awaiting-begin"],
  "awaiting-begin": ["hinge-presenting"],
  "hinge-presenting": ["hinge-choices"],
  "hinge-choices": ["hinge-reacting"],
  "hinge-reacting": ["hinge-presenting", "ending"],
  ending: ["post-ending"],
  "post-ending": [],
};

export class DialogueMachine {
  state: DialogueState;

  constructor(initialState: DialogueState = "boot") {
    this.state = initialState;
  }

  transition(next: DialogueState): void {
    if (!allowedTransitions[this.state].includes(next)) {
      throw new Error(`Invalid dialogue transition: ${this.state} -> ${next}`);
    }
    this.state = next;
  }

  reset(next: "boot" | "opening"): void {
    this.state = next;
  }
}
