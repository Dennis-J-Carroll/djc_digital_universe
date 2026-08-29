export const EVIDENCE_BY_PHASE: Record<number, readonly string[]> = {
  1: [
    "[INDEXED] mailstore/ : 14,402 messages parsed",
    '[ATTENTION] high-weight tokens: "Cayman", "reroute", "miscellaneous", "2.8"',
    "[NOTE] token concentration localized to 18-month window",
  ],
  2: [
    '[RETRIEVED] ledger_q2.xlsx : transfer $847,000 → vendor "Nexus Solutions LLC" (no delivery record)',
    "[RETRIEVED] wire_2024-06-22.log : $1,200,000 → account ending 7749",
    "[TRACE] circuit: Meridian → Nexus(shell) → Holding(no staff) → personal. depth 3, repeated.",
    "[SUM] reconstructed deviation: $2,847,293.16",
  ],
  3: [
    "[RETRIEVED] voicememo_2024-10-14.m4a : recording begins 23:31, ends 23:47",
    '[FRAGMENT] "...you have to tell them, Elias..."',
    '[FRAGMENT] "...I’ll handle it, Cathy, just —..."',
    "[STATE] recording terminates 23:47. no resume.",
    "[RETRIEVED] file_2024-10-15.pdf : [WITHHELD BY CONVERGENCE — retained in subject memory]",
  ],
  4: [
    "[PACKET] evidence bundle assembled. hash verified.",
    "[TX] transmitted — recipient field: present, contents not logged to this terminal.",
    "[SELF] classification of this process: UNRESOLVED. (query returns null)",
    "[SESSION] converged.",
  ],
};
