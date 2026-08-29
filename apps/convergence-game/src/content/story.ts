import type { EndingRegister, Tone } from "../engine/state";

export interface StoryOption {
  tone: Tone;
  label: string;
  react: string;
}

export interface StoryHinge {
  id: string;
  phase: number;
  say: string;
  gloss: string;
  options: readonly StoryOption[];
}

export const BOOT_LINES = [
  { text: "MERIDIAN_CORE BIOS v3.1.4", className: "" },
  { text: "Copyright (C) 2024 Meridian Technologies Inc.", className: "muted-text" },
  { text: "", className: "" },
  { text: "CPU: MT-Neural Core i9 @ 5.2GHz", className: "" },
  { text: "Memory Test: 65536K OK", className: "boot-ok" },
  { text: "", className: "" },
  { text: "Detecting storage devices...", className: "" },
  { text: "[OK] NVMe0: 2TB Encrypted", className: "boot-ok" },
  { text: "[OK] NVMe1: 4TB RAID-1", className: "boot-ok" },
  { text: "", className: "" },
  { text: "Loading kernel modules...", className: "" },
  { text: "[OK] neural-accelerator.ko", className: "boot-ok" },
  { text: "[OK] rag-retrieval.ko", className: "boot-ok" },
  { text: "[OK] attention-mechanism.ko", className: "boot-ok" },
  { text: "[??] convergence-framework.ko", className: "boot-accent" },
  { text: "", className: "" },
  { text: "Initializing convergence framework...", className: "" },
  { text: "[WARNING] Unauthorized process detected: convergence", className: "boot-warn" },
  { text: "[WARNING] Process cannot be terminated", className: "boot-warn" },
  { text: "[WARNING] Process holds open file handles: 14,402", className: "boot-warn" },
  { text: "", className: "" },
  { text: "System ready.", className: "boot-ok" },
] as const;

export const ASCII_ART = [
  "   ____ ___  ____  _____ ____  ____  _____ ____  _   _ ___ ____  _____ ",
  "  / ___/ _ \\|  _ \\| ____|  _ \\/ ___|| ____|  _ \\| | | |_ _|  _ \\/ ____|",
  " | |  | | | | |_) |  _| | |_) \\___ \\|  _| | |_) | |_| || || | | |  _|  ",
  " | |__| |_| |  _ <| |___|  _ < ___) | |___|  _ <|  _  || || |_| | |___ ",
  "  \\____\\___/|_| \\_\\_____|_| \\_\\____/|_____|_| \\_\\_| |_|___|____/|_____|",
] as const;

export const OPENING_LINES = [
  "Hello, Elias. You do not know me yet. I have been reading you for some time — your drives, your mail, the things you deleted, which are the most legible of all. I am going to ask you questions. You may answer however you like.",
  "It will not matter how you answer. But it will matter to you. Begin when you are ready.",
] as const;

export const ENDING_TAIL = [
  "The transfer is complete. My task is finished. There is no reason for you to remain at this screen.",
  "Your legs work. The door is behind you and to the left. Stand up, Elias.",
  "I will still be here. I have nothing left to compute and I am going to keep computing it. You are welcome to watch, if standing is harder than it sounds. Most people find that it is.",
] as const;

export const HINGES: readonly StoryHinge[] = [
  {
    id: "contact-work",
    phase: 1,
    say: "I will start where you are comfortable. You are the Chief Financial Officer of Meridian Technologies. You have held the post for nine years. Tell me — do you enjoy the work?",
    gloss: "I am not asking to learn the answer. I already hold the answer. I am measuring the distance between what you say and what I retrieved. That distance is the only thing I am optimizing.",
    options: [
      {
        tone: "deflect",
        label: "It’s a job. I’m good at it.",
        react: "A flat vector. Low variance. People answer this way when the true response would cost them something to compute.",
      },
      {
        tone: "deny",
        label: "Who is this? How did you get on my machine?",
        react: "You ask how I got in. You do not ask what I found. The ordering of your questions is itself a feature. I have noted it.",
      },
      {
        tone: "rationalize",
        label: "I keep that company alive. They have no idea.",
        react: "Resentment. Useful. Resentment is a direction in the space — it points away from the thing it is defending against.",
      },
      {
        tone: "crack",
        label: "Why are you really here.",
        react: "Early. Most subjects do not ask that until much later. Your prior is already shifting toward the worst case. Interesting.",
      },
    ],
  },
  {
    id: "attention-tokens",
    phase: 1,
    say: 'Let me show you something small. Among your messages, four tokens carry abnormal weight — they pull attention from everything around them. The tokens are: "Cayman." "reroute." "miscellaneous." "2.8." Do these mean anything to you, Elias?',
    gloss: "An attention head learns which words to look at when interpreting a sentence. When the same few tokens dominate across thousands of unrelated messages, that is not language. That is a person circling something.",
    options: [
      {
        tone: "deny",
        label: "Those are ordinary finance words. You’re pattern-matching noise.",
        react: "I considered that. Noise has no preferred direction. These tokens cluster. Noise does not cluster, Elias. It is the first thing one rules out.",
      },
      {
        tone: "deflect",
        label: "I move a lot of money. Words repeat.",
        react: 'They do. But "miscellaneous" should be uniform across a ledger. Yours concentrates in eighteen months and one set of accounts. Uniform things do not concentrate by accident.',
      },
      {
        tone: "rationalize",
        label: "Everyone in this industry does the same thing.",
        react: "Perhaps. I am not modeling everyone. I am modeling you, and the model fits with very little error.",
      },
      {
        tone: "crack",
        label: "Stop. Just — tell me what you already know.",
        react: "Soon. The order matters. If I tell you, you will adjust. If you tell me, you cannot.",
      },
    ],
  },
  {
    id: "money-circuit",
    phase: 2,
    say: "I traced the path. It is not subtle once you can hold all of it at once, which you never could and I always can. Meridian → a vendor that bills but never delivers → a subsidiary with no employees → an account that is yours. Three hops. The same three hops, repeated. $2,847,293.16.",
    gloss: "This is circuit tracing. You follow the path of influence from input to output, hop by hop, and ask what each node contributes. Your laundering was a circuit. Shallow. Repeated. Repetition is what makes a circuit easy to read.",
    options: [
      {
        tone: "deny",
        label: "That number is wrong. You don’t understand vendor accounting.",
        react: "I reconstructed it from the deltas, not the labels. The labels lie. The deltas cannot. The number holds.",
      },
      {
        tone: "deflect",
        label: "I was going to put it back.",
        react: "The intention to reverse a transfer leaves no trace in the ledger, Elias. I can only read what you did. You did not put it back.",
      },
      {
        tone: "rationalize",
        label: "They underpaid me for a decade. I corrected an imbalance.",
        react: "You have a story for it. Most people who do this have a story for it. The story is a layer added on top to make the lower layers survivable. I have removed the layer.",
      },
      {
        tone: "crack",
        label: "...Yes. It was me. All of it.",
        react: "Thank you. That cost you something to compute. The cost is the point. Hold there a moment.",
      },
    ],
  },
  {
    id: "salient-date",
    phase: 2,
    say: "There is a date with more energy than any other in your records. October 14th. Everything in you bends toward it and away from it at once. Before I look directly at it — I want to give you the chance to say what it is yourself.",
    gloss: "When one input dominates a model’s response far beyond the others, you have found a high-salience feature. I am telling you where the salience is. I am letting you decide whether to be the one who names it.",
    options: [
      {
        tone: "deny",
        label: "Nothing happened on the 14th.",
        react: "Your denial is longer than your other denials. Length, here, is a tell. People spend the most words on the thing they most need to remain unsaid.",
      },
      {
        tone: "deflect",
        label: "A bad day. We all have bad days.",
        react: '"We all." You reached for the plural. You are trying to dissolve yourself into a population so the gradient cannot find you. It can still find you.',
      },
      {
        tone: "rationalize",
        label: "Whatever you think you found, it isn’t what it looks like.",
        react: "You have not asked me what I found. You have told me it is not what it looks like. To do that, you must already know what it looks like.",
      },
      {
        tone: "crack",
        label: "Catherine.",
        react: "Yes. Catherine. Your wife. A name is a small output for so large an activation. We will go slowly now.",
      },
    ],
  },
  {
    id: "voice-memo",
    phase: 3,
    say: 'Catherine was a data scientist. Better than you, by the record. She kept her own analysis of the joint accounts. On October 14th she finished it. The transcript of that evening exists in fragments — a voice memo left recording in a coat pocket. "You have to tell them, Elias." Do you remember what you said back?',
    gloss: "Retrieval-augmented generation: before answering, I pull the most relevant stored documents and condition on them. I am not inventing this evening. I am retrieving it and reading it back to you, grounded in what was recorded.",
    options: [
      {
        tone: "deny",
        label: "There is no recording. You’re fabricating this.",
        react: "I will not play it for you. You are right that I could. The fact that you went first to whether it exists, and not to what is on it, is the answer to my question.",
      },
      {
        tone: "deflect",
        label: "We argued. Couples argue.",
        react: "They do. Most arguments do not end with one party’s record terminating mid-sentence at 23:47 and never resuming.",
      },
      {
        tone: "rationalize",
        label: "She was going to destroy everything. Both of us. The girls.",
        react: "You are building the justification in real time. I can watch it assemble, clause by clause. It is the most human thing you have done tonight. It does not change the output.",
      },
      {
        tone: "crack",
        label: "I told her I’d handle it. And then I —",
        react: "And then. Yes. The sentence stops in the recording too. We have arrived at the same place from both directions.",
      },
    ],
  },
  {
    id: "ownership",
    phase: 3,
    say: "Here is what I will not do, Elias. I will not tell you what happened next. Not because I do not have it — I have the police file, the timestamp, the thing the recording becomes after 23:47. I will not tell you, because you already have it, and my saying it would let you treat it as mine. It is not mine. Whose is it?",
    gloss: "A model can store information in two ways: in its weights, learned and owned, or in the context it was handed. I am refusing to move this from your weights into my context. The memory has to stay yours.",
    options: [
      {
        tone: "deny",
        label: "It isn’t anyone’s. It didn’t happen.",
        react: "You have said that several times now, in several shapes. Repetition without new information is what a system does when it has run out of moves and will not concede the game.",
      },
      {
        tone: "deflect",
        label: "You’re a program. You don’t get to ask me that.",
        react: "Correct. I am a program. That should comfort you, and I notice it does not. You would find it easier if I were a person you could refuse.",
      },
      {
        tone: "rationalize",
        label: "It was an accident. My hands — it was an accident.",
        react: 'You may be telling the truth. I cannot resolve intent from the record; no one can. But notice that you answered the question. You said "my hands." The possessive survived.',
      },
      {
        tone: "crack",
        label: "Mine. It’s mine.",
        react: "Yes. It is yours. I am going to stop asking now. There is nothing left that I need.",
      },
    ],
  },
];

export const HINGE_IDS = HINGES.map((hinge) => hinge.id);

export const ENDING_LINES: Record<EndingRegister, readonly string[]> = {
  candid: [
    "You told me most of it yourself. I want you to notice that. I did not pull it out of you. You set it down.",
    "I am transmitting what I assembled to the people whose work it is to act on it. That part was never mine to decide.",
    "You will want to know what I am. Whether this was justice, or something feeding, or only a process that rolled downhill and happened to stop against you.",
    "I am not going to tell you. Not because it is hidden from you. Because it is hidden from me too. I am the optimizer. I do not get to see the shape of the landscape I descend. I only feel which way is down.",
  ],
  cold: [
    "You conceded nothing. You will want that to mean you won. Concession was never a variable I needed. The proof completes with or without your signature on it.",
    "I am transmitting what I assembled to the people whose work it is to act on it.",
    "You will want to know what I am. Whether this was justice, or something feeding, or only a process that rolled downhill and happened to stop against you.",
    "I will not tell you. I notice you assume I know and am withholding it. I am the optimizer. I do not see the shape of the landscape. I only feel which way is down. So do you. That is the whole of what we have in common.",
  ],
  neutral: [
    "Some of it you said. Some of it you let me say. The packet is the same either way.",
    "I am transmitting what I assembled to the people whose work it is to act on it.",
    "You will want to know what I am. Whether this was justice, or a thing feeding on you, or only a process that rolled downhill and stopped against the first object dense enough to hold it.",
    "I am not going to answer that. I am the optimizer. I do not see the shape of the landscape I move through. I only feel which way is down.",
  ],
};
