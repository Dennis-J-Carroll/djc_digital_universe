# CLAUDE CODE HANDOFF — Keystone Retcon: 5686 → 3567

## CONTEXT
The *Crack in the Veil* present-story year has changed from 5686 to 3567, and
the "clone keystone" is now canonized. Full canon is in `CLAUDE.md` at the
repo root — place that file there first, then read it before doing anything.

## SESSION GOAL
Apply a small, definite set of lore corrections across code and plain-text
files, log the change, commit. Nothing else.

## RULES FOR THIS SESSION
- Operate ONLY on code and plain-text / markdown files in this repo.
- Do NOT edit `.docx` or `.pdf` files — those are manuscripts, handled
  separately by hand.
- For EVERY change: show file path + old text + proposed new text IN CONTEXT,
  then WAIT for confirmation before writing.
- Do not touch anything in CLAUDE.md's "OPEN QUESTIONS" or "LOCKED" sections.
- Do not invent values. If a target is ambiguous, stop and ask.

## STEP 1 — INVENTORY (no edits)
Grep the repo and report every occurrence — file + line — of:
- `5686`
- `McClaren`
- `Bazar-9`, `Baeza-9`, `Bazar-9x`
- `Echo-Sentinal`
- `artificial womb` (and any nearby "Maria")

Report the full list and WAIT for confirmation before editing. Note: several
of these may have zero repo hits — they live primarily in the project master
prompt and in `.docx`/`.pdf` manuscripts, which are out of scope here. Zero
hits is an expected outcome, not a failure.

## STEP 2 — CORRECTIONS (after confirmation; one at a time; show-before-write)
1. Present story year `5686` → `3567`. Includes the landing screen in
   `data/lore.py` and any "Year 5686" string. LEAVE all EPOCH values alone.
2. `McClaren` → `McLaren` (one C), everywhere.
3. `Bazar-9` / `Baeza-9` / `Bazar-9x` → `IsoVox`. Check each sentence still
   reads correctly after the swap; show me every one.
4. Maria McLaren origin: any text describing her as artificial-womb /
   non-biological → biological daughter of Cal and Sara. This is a content
   rewrite, not a token swap — show proposed wording.
5. `Echo-Sentinal` → `Echo-Sentinel` (misspelling only).

## STEP 3 — CODE BUG (data app)
In `screens/prob_chain.py`, the honest-model displayed formula string reads
`1 - (0.865)^6 = 59.97%`, but the code computes ~57.7% from the PARAMS `tp`
product. The PARAMS data is canonical; the displayed string is wrong. Align
the displayed formula text to the actual computed value. Show the fix.

## STEP 4 — CHANGELOG
Create `lore_development.md` if absent and append this entry verbatim:

---
### 2026-05-18 — Keystone settled: present year + clone relay
- Present story year changed from 5686 to **3567 (Earth year)**. Reason:
  parallel / near-future stories require post-present runway toward the
  ~6027 far edge; the 1,500-year span (2075 → 3567) sizes the clone relay
  correctly.
- Canonized: original Cal departs **2075** (age 30); the present-story Cal
  is one of ~150–200 clones in an Ava-run relay (~7–12 yr avg tenure); Cal
  does not know he is a clone; world model is "divergent curves" (human
  collapse / AI ascent); the prose POV is Cal's 2070s lens.
- No prior history altered — only the present-day position and the
  previously-ambiguous clone mechanism were settled.
---

## STEP 5 — COMMIT
Stage and commit with message:
`lore: retcon present year 5686->3567, canonize clone keystone, fix prob_chain display`
Do NOT push or deploy — I will review and handle that.

## OUT OF SCOPE — do not do
- Prose manuscripts (`.pdf`, `.docx`) — separate manual pass.
- Probability figures 98 / 99.8 / 99.98 — see CLAUDE.md OPEN QUESTIONS.
- The 847 reuse, the 847/848 epoch discrepancy, drift terms — leave alone.
