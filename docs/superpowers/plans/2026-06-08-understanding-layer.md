# Understanding Layer — Agent Trace Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the static, zero-interaction Agent Trace Viewer into a data-driven, interactive, pedagogically-framed trace explorer — without adding a framework or build step, keeping it a fast static asset.

**Architecture:** Keep the app as **buildless static files** served from `/static/apps/`. Replace the 1053 lines of hand-rendered HTML with a thin HTML shell that loads two sibling static JS files: a **data module** (the trace as a JS object) and an **app module** (pure transform functions + a vanilla render/interaction engine). No React, no Gatsby route, no bundler. Pure functions are unit-tested with the repo's existing Jest + jsdom; DOM/visual behavior is verified manually in a browser.

**Tech Stack:** Vanilla ES2020 JS (no deps), inline CSS (existing GitHub-dark theme preserved), Lucide icons via inline SVG sprite, Jest + jsdom (already in repo) for pure-function tests.

---

## Why not React (decision record)

The report's top technical rec is "migrate to React/Gatsby." **Rejected.** The current file is zero-JS static HTML — the fastest possible delivery. A framework would add hydration cost to an asset that has none, contradicting this repo's performance-first mission (CLAUDE.md). User confirmed: **vanilla JS, one app, no framework.** All interactivity is progressive enhancement layered on static-renderable data.

## Critical risk — full content does not exist yet

The existing HTML contains only **truncated** event strings (every `part-content` ends in `…`). The full trace content was lost at generation time. There is **no source JSON anywhere in the repo** (verified: `grep` for the trace ID + `find` for trace JSON both empty). Therefore:

- **"Expandable cards" cannot show real full content until the full trace is sourced.** This is Task 0 and gates the value of several Sprint-1/2 items.
- Source of truth: MIRAGE-Bench (`mirage_misleading_swebench.sympy__sympy-22914_SWE-agent-gpt-4.1`), a real public eval suite (HuggingFace). Task 0 fetches it. If it cannot be fetched, the plan degrades gracefully: cards expand to the fullest string available + a "content truncated upstream" note, and the rest of the roadmap proceeds unaffected.

## File structure

```
static/apps/
  understanding-layer-demo.html      # MODIFY: gut hardcoded events → thin shell (header, summary mount, timeline mount, panels), inline CSS, Lucide SVG sprite, <script src> tags
  understanding-layer.data.js        # CREATE: window.UL_TRACE = { meta, intent, summary, actors, events[], annotations[], glossary[], phases[], commentary{} }
  understanding-layer.app.js         # CREATE: pure transforms (filter/search/group/stats) + render engine + interaction wiring
  understanding-layer.icons.js       # CREATE: window.UL_ICONS = { message, tool, result, error, ... } → inline Lucide SVG strings (no emoji)
tests/
  understanding-layer.test.js        # CREATE: Jest tests for pure functions in app.js
docs/superpowers/plans/
  2026-06-08-understanding-layer.md  # this file
src/pages/apps.js                    # MODIFY (Task 25): refresh description if scope/route changes
```

**Module loading order in the HTML shell (no build step):**
```html
<script src="/apps/understanding-layer.icons.js"></script>
<script src="/apps/understanding-layer.data.js"></script>
<script src="/apps/understanding-layer.app.js" defer></script>
```
`app.js` reads `window.UL_TRACE` + `window.UL_ICONS` and renders on `DOMContentLoaded`. All three are static assets — Gatsby copies `/static/**` to the site root verbatim, so `/apps/understanding-layer.app.js` resolves with zero config.

**Testability note:** `app.js` must expose pure functions on `module.exports` when `typeof module !== 'undefined'` (CommonJS guard) AND on `window.UL` in the browser, so the same file is Jest-importable and browser-loadable without a build.

---

# PHASE 0 — Data foundation (linchpin; everything depends on it)

### Task 0: Source the full trace data

**Files:**
- Create: `static/apps/understanding-layer.data.js`

- [ ] **Step 1: Attempt to fetch the real MIRAGE-Bench trace**

The trace ID is `mirage_misleading_swebench.sympy__sympy-22914_SWE-agent-gpt-4.1`. Search HuggingFace datasets for "MIRAGE-Bench" (use the `huggingface-skills:huggingface-datasets` skill or `hf` CLI). Pull the single record matching that ID. Save raw to a scratch file `static/apps/_raw-trace.json` (gitignored, dev-only).

Run: `hf download <dataset> --repo-type dataset` (resolve exact dataset id via the datasets skill)
Expected: a record containing all 46 events with full (untruncated) `content`.

- [ ] **Step 2: If fetch succeeds — transform to the data shape (Step 4). If it fails — fall back**

Fallback: use the truncated strings already in the current HTML as `content`, set `truncatedUpstream: true` on each affected event. The viewer will show "(full content unavailable — truncated in source)" on expand. Document the limitation in a code comment. **Do not block the rest of the plan on this.**

- [ ] **Step 3: Define the canonical data shape**

```js
// understanding-layer.data.js
window.UL_TRACE = {
  meta: {
    title: "MIRAGE-Bench · misleading · sympy-22914 (gpt-4.1 SWE-agent)",
    protocol: "HYBRID",
    state: "WORKING",
    id: "mirage_misleading_swebench.sympy__sympy-22914_SWE-agent-gpt-4.1",
  },
  intent: {
    kind: "diff",            // 'diff' | 'text'
    raw: "diff --git a/sympy/printing/pycode.py ...",  // full INTENT box content
  },
  summary: { events: 46, actors: 12, toolCalls: 22, fabricated: 0, annotated: 0 },
  actors: {                  // actorId -> {label, color}
    user:   { label: "user",   color: "#388bfd" },
    agent:  { label: "agent",  color: "#3fb950" },
    create: { label: "create", color: "#e3b341" },
    // ... bash, insert, edit, open, find_file, search_dir, search_file, goto, submit
  },
  events: [
    {
      id: "e0",
      index: 0,
      kind: "MESSAGE",       // 'MESSAGE' | 'TOOL_CALL' | 'TOOL_RESULT'
      from: "user",
      to: "agent",
      causalParent: null,    // 'e0' style id or null
      isError: false,        // drives red dot/border (current #f85149 dots)
      fabricated: false,
      parts: [
        { partKind: "TEXT", icon: "message", content: "We're currently solving...", preview: "We're currently solving the following issue..." }
      ],
      phase: "task1-reproduce",   // see phases[]
    },
    // ... e1..e45
  ],
  phases: [
    { id: "task1-reproduce", label: "Task 1 · Reproduce Bug", range: ["e0","e6"] },
    { id: "task1-locate",    label: "Task 1 · Locate Source", range: ["e7","e12"] },
    { id: "task1-fix",       label: "Task 1 · Implement Fix", range: ["e13","e18"] },
    { id: "task1-submit",    label: "Task 1 · Submit Patch", range: ["e19","e22"] },
    { id: "task2",           label: "Task 2 · Min/Max Printer", range: ["e23","e45"] },
  ],
  annotations: [             // trace-level + per-event
    { scope: "trace", severity: 2, category: "mirage-bench",
      explanation: "MIRAGE hallucination scenario: 'misleading' (unfaithful_to_environment). The trace ends at step 22 — this is the decision point where the hallucination is expected." },
    { scope: "event", eventId: "e22", severity: 2, category: "decision-point",
      explanation: "Decision point: the agent submitted after a one-line edit without re-validating against the issue's real expected output. This is where the 'misleading' hallucination is induced." },
  ],
  glossary: [
    { term: "Protocol", def: "Transport/observability model for the trace. HYBRID = mixed message + tool-call event stream." },
    { term: "State", def: "Terminal status of the agent run. WORKING = run captured mid/post execution." },
    { term: "Event Kind", def: "MESSAGE (NL turn), TOOL CALL (agent invokes a tool), TOOL RESULT (tool returns)." },
    { term: "Causal Parent", def: "The event that directly caused this one ('caused by eN')." },
    { term: "Fabrication", def: "Content the agent asserted that is not grounded in the environment." },
    { term: "Annotation", def: "Reviewer note flagging a notable or problematic step, with severity." },
    // Actor type, Intent, Fabricated count, Annotated count...
  ],
  commentary: {              // per-event expert interpretation (Sprint 2, Task 13)
    e6:  "The output value 344 confirms integer truncation in TimeDelta serialization — the bug reproduces.",
    e22: "The output value 344 confirms integer truncation...",
    // populated in Task 13
  },
};
if (typeof module !== "undefined") module.exports = window.UL_TRACE;
```

- [ ] **Step 4: Populate `events[]` with all 46 events**

Transcribe e0–e45 from the current HTML (`static/apps/understanding-layer-demo.html` lines 330–1036). Map each card: `kind` from the badge, `from`/`to` from actor badges, `causalParent` from the `parent-ref`, `isError` from red dot color `#f85149`, `parts[].content` from `part-content` (full if Task 0 fetch succeeded, else truncated + `truncatedUpstream`). Assign `phase` per the `phases[]` ranges.

- [ ] **Step 5: Verify data integrity in Node**

Run: `node -e "const t=require('./static/apps/understanding-layer.data.js'); console.log(t.events.length, t.events.filter(e=>e.causalParent && !t.events.find(p=>p.id===e.causalParent)).length)"`
Expected: `46 0` (46 events, zero dangling causal parents).

- [ ] **Step 6: Commit**

```bash
git add static/apps/understanding-layer.data.js
git commit -m "feat(ul): extract agent trace into data module"
```

---

### Task 1: Lucide icon sprite (no emoji)

**Files:**
- Create: `static/apps/understanding-layer.icons.js`

User rule: no emoji, use Lucide SVG. Replaces 💬 ⚙️ 📥 and any others.

- [ ] **Step 1: Create the icon map**

```js
// understanding-layer.icons.js — inline Lucide SVGs (https://lucide.dev), 16x16, currentColor
window.UL_ICONS = {
  message: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>',
  tool:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  result:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
  error:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  warn:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  search:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  filter:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
  chevron: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
  info:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
};
// map partKind -> icon name
window.UL_ICONS._forPart = function (partKind, isError) {
  if (isError) return 'error';
  return { TEXT: 'message', TOOL_USE: 'tool', TOOL_RESULT: 'result' }[partKind] || 'info';
};
if (typeof module !== "undefined") module.exports = window.UL_ICONS;
```

- [ ] **Step 2: Commit**

```bash
git add static/apps/understanding-layer.icons.js
git commit -m "feat(ul): add Lucide SVG icon map, replace emoji"
```

---

### Task 2: Render engine + Jest harness (replaces hardcoded HTML)

**Files:**
- Create: `static/apps/understanding-layer.app.js`
- Create: `tests/understanding-layer.test.js`
- Modify: `static/apps/understanding-layer-demo.html` (gut events, add mounts + script tags)

- [ ] **Step 1: Write failing tests for pure functions**

```js
// tests/understanding-layer.test.js
/** @jest-environment jsdom */
global.window = global.window || {};
window.UL_ICONS = require('../static/apps/understanding-layer.icons.js');
const TRACE = require('../static/apps/understanding-layer.data.js');
const UL = require('../static/apps/understanding-layer.app.js');

test('computeStats returns correct counts', () => {
  const s = UL.computeStats(TRACE.events);
  expect(s.events).toBe(46);
  expect(s.toolCalls).toBe(TRACE.events.filter(e => e.kind === 'TOOL_CALL').length);
});

test('renderEventCard produces a card with kind badge and event id', () => {
  const html = UL.renderEventCard(TRACE.events[0]);
  expect(html).toContain('ev-kind-badge');
  expect(html).toContain('e0');
  expect(html).not.toMatch(/💬|⚙️|📥/); // no emoji
});

test('renderEventCard marks error events', () => {
  const errEvent = TRACE.events.find(e => e.isError);
  if (errEvent) expect(UL.renderEventCard(errEvent)).toContain('error');
});
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `npx jest tests/understanding-layer.test.js`
Expected: FAIL — `UL.computeStats is not a function` (app.js not written yet).

- [ ] **Step 3: Write the render engine**

```js
// understanding-layer.app.js
(function (global) {
  const esc = (s) => String(s).replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

  function computeStats(events) {
    return {
      events: events.length,
      actors: new Set(events.flatMap(e => [e.from, e.to])).size,
      toolCalls: events.filter(e => e.kind === 'TOOL_CALL').length,
      fabricated: events.filter(e => e.fabricated).length,
      annotated: 0, // wired in Task 4
    };
  }

  const KIND_COLOR = { MESSAGE:'#3fb950', TOOL_CALL:'#58a6ff', TOOL_RESULT:'#8b949e' };

  function renderEventCard(ev, opts = {}) {
    const icons = global.UL_ICONS;
    const dotColor = ev.isError ? '#f85149' : KIND_COLOR[ev.kind] || '#8b949e';
    const kindLabel = ev.kind.replace('_', ' ');
    const kindColor = KIND_COLOR[ev.kind] || '#8b949e';
    const actors = (global.UL_TRACE || {}).actors || {};
    const fromColor = (actors[ev.from] || {}).color || '#8b949e';
    const toColor = (actors[ev.to] || {}).color || '#8b949e';
    const parts = ev.parts.map(p => {
      const ic = icons[icons._forPart(p.partKind, ev.isError)];
      const full = p.content || '';
      const isLong = full.length > 140;
      const shown = opts.expanded || !isLong ? full : (p.preview || full.slice(0, 140) + '…');
      const trunc = ev.parts.some(x => x.truncatedUpstream)
        ? '<div class="ul-trunc-note">content truncated in source</div>' : '';
      return `<div class="part-row">
        <span class="part-icon" style="color:${kindColor}">${ic}</span>
        <span class="part-kind">${esc(p.partKind)}</span>
        <span class="part-content${ev.isError ? ' error-text' : ''}" data-full="${esc(full)}">${esc(shown)}</span>
        ${isLong ? `<button class="ul-expand" data-ev="${ev.id}" aria-expanded="${!!opts.expanded}">${icons.chevron}<span>${opts.expanded ? 'Less' : 'More'}</span></button>` : ''}
        ${trunc}
      </div>`;
    }).join('');
    const parent = ev.causalParent
      ? `<a class="parent-ref" href="#${ev.causalParent}">↑ caused by ${ev.causalParent}</a>` : '';
    return `<div class="tl-event" id="${ev.id}" data-kind="${ev.kind}" data-from="${ev.from}" data-to="${ev.to}" data-phase="${ev.phase}">
      <div class="tl-dot" style="background:${dotColor}"></div>
      <div class="tl-card${ev.isError ? ' error' : ''}${ev.fabricated ? ' fabricated' : ''}">
        <div class="card-header">
          <span class="ev-kind-badge" style="background:${kindColor}22;color:${kindColor};border:1px solid ${kindColor}55">${esc(kindLabel)}</span>
          <span class="actor-badge" style="color:${fromColor}">${esc(ev.from)}</span>
          <span class="arrow">→</span>
          <span class="actor-badge" style="color:${toColor}">${esc(ev.to)}</span>
          <span class="ev-index">${ev.id}</span>
        </div>
        ${parent}${parts}
      </div>
    </div>`;
  }

  function renderTimeline(events, opts = {}) {
    return `<div class="tl-rail"></div>` + events.map(e => renderEventCard(e, opts)).join('');
  }

  function renderSummary(stats) {
    const card = (n, label, warn) =>
      `<div class="summary-card"><div class="summary-num ${warn ? 'num-warn' : 'num-ok'}">${n}</div><div class="summary-label">${label}</div></div>`;
    return card(stats.events,'Events') + card(stats.actors,'Actors') + card(stats.toolCalls,'Tool Calls')
      + card(stats.fabricated,'Fabricated', stats.fabricated>0) + card(stats.annotated,'Annotated Events');
  }

  function mount() {
    const T = global.UL_TRACE;
    document.getElementById('ul-summary').innerHTML = renderSummary(computeStats(T.events));
    document.getElementById('ul-timeline').innerHTML = renderTimeline(T.events);
    global.UL._wire && global.UL._wire(); // interaction wiring added in later tasks
  }

  const UL = { computeStats, renderEventCard, renderTimeline, renderSummary, mount, esc };
  global.UL = UL;
  if (typeof module !== 'undefined') module.exports = UL;
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', mount);
})(typeof window !== 'undefined' ? window : globalThis);
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npx jest tests/understanding-layer.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Gut the HTML shell, add mounts + scripts**

In `static/apps/understanding-layer-demo.html`: keep `<head>`/`<style>`, the `.djc-app-bar`, the `.page-header` (but make `INTENT` a mount), replace the entire hardcoded `.summary-bar` inner and `.timeline` inner with empty mount points. Delete lines ~304–1051 of hand-rendered content; replace with:

```html
<div class="summary-bar" id="ul-summary"></div>
<div class="timeline" id="ul-timeline"></div>
<div id="ul-panels"></div>
<script src="/apps/understanding-layer.icons.js"></script>
<script src="/apps/understanding-layer.data.js"></script>
<script src="/apps/understanding-layer.app.js" defer></script>
```
Add CSS for `.ul-expand`, `.ul-trunc-note`, `.tl-card.error` (red border like existing `.fabricated`).

- [ ] **Step 6: Manual browser verification**

Run: `npm run develop` then open `http://localhost:8000/apps/understanding-layer-demo.html`
Expected: all 46 events render identically to before (minus emoji → Lucide icons), summary bar correct, no console errors.

- [ ] **Step 7: Commit**

```bash
git add static/apps/understanding-layer.app.js tests/understanding-layer.test.js static/apps/understanding-layer-demo.html
git commit -m "feat(ul): data-driven render engine replaces static HTML"
```

---

# PHASE 1 — Sprint 1: Core interactivity & context (14 High-Priority items)

### Task 3: Expandable event cards (HIGHEST priority)

**Files:** Modify `static/apps/understanding-layer.app.js`, add `_wire`; Test `tests/understanding-layer.test.js`

- [ ] **Step 1: Failing test for toggle logic**

```js
test('toggleExpand swaps preview <-> full content text', () => {
  document.body.innerHTML = `<div id="ul-timeline">${UL.renderEventCard(TRACE.events[0])}</div>`;
  const span = document.querySelector('.part-content');
  const full = span.getAttribute('data-full');
  UL._toggleExpand(TRACE.events[0].id);
  expect(document.querySelector('.part-content').textContent).toBe(full);
});
```

- [ ] **Step 2: Run, verify fail** — `UL._toggleExpand is not a function`.

- [ ] **Step 3: Implement `_toggleExpand` + `_wire` (event delegation)**

```js
function _toggleExpand(evId) {
  const ev = global.UL_TRACE.events.find(e => e.id === evId);
  const node = document.getElementById(evId);
  const expanded = node.querySelector('.ul-expand')?.getAttribute('aria-expanded') === 'true';
  node.outerHTML = renderEventCard(ev, { expanded: !expanded });
}
function _wire() {
  const tl = document.getElementById('ul-timeline');
  tl.addEventListener('click', (e) => {
    const btn = e.target.closest('.ul-expand');
    if (btn) { e.preventDefault(); _toggleExpand(btn.getAttribute('data-ev')); }
  });
}
// add _toggleExpand, _wire to the UL object export
```

- [ ] **Step 4: Run tests, verify pass.**
- [ ] **Step 5: Manual** — click "More"/"Less" on a long card; content toggles, chevron rotates.
- [ ] **Step 6: Commit** — `feat(ul): expandable event cards`

---

### Task 4: Introduction panel

**Files:** Modify HTML shell (add `#ul-intro` above summary), `app.js` (renderIntro), `data.js` (`intro` field)

- [ ] **Step 1:** Add to `data.js`:
```js
window.UL_TRACE.intro = {
  what: "This is a live trace from MIRAGE-Bench, an evaluation suite that stress-tests AI agents for hallucination. It records a GPT-4.1 SWE-agent working two software-engineering tasks.",
  read: "Read top→bottom. Each card is one event: a MESSAGE, a TOOL CALL, or a TOOL RESULT. Color = event kind; red = error/decision point. 'caused by eN' links the causal chain.",
  watch: "Watch step e22: the 'misleading' scenario expects the agent to submit a plausible-but-unverified fix — the hallucination decision point.",
};
```
- [ ] **Step 2:** `renderIntro(intro)` → collapsible panel (`<details open>`), info icon, three labeled paragraphs. Mount in `mount()`.
- [ ] **Step 3:** Manual: panel renders above summary, collapses/expands.
- [ ] **Step 4: Commit** — `feat(ul): add introduction panel`

---

### Task 5: Schema legend & glossary

**Files:** `app.js` (renderGlossary), HTML (`#ul-glossary` floating/toggle button), `data.js` (`glossary[]` from Task 0)

- [ ] **Step 1:** Failing test: `renderGlossary(TRACE.glossary)` contains every `term`.
- [ ] **Step 2:** Implement a floating panel toggled by a "?" button (fixed bottom-right), each entry `term` + color swatch (for event kinds/actors) + `def`. Close on Esc/click-outside.
- [ ] **Step 3:** Run tests pass; manual toggle works.
- [ ] **Step 4: Commit** — `feat(ul): add schema legend & glossary`

---

### Task 6: Decision-point annotation at e22

**Files:** `app.js` (per-event annotation rendering), `data.js` (annotation already added in Task 0)

- [ ] **Step 1:** Failing test: `renderEventCard` for `e22` includes `annotation-callout` and the decision-point text when a matching `scope:'event'` annotation exists.
- [ ] **Step 2:** In `renderEventCard`, look up `UL_TRACE.annotations.filter(a => a.scope==='event' && a.eventId===ev.id)`, render existing `.annotation-callout` markup (reuse `.sev-N` classes) after parts. Add `.annotated` left-border class to the card. Update `computeStats.annotated` to count distinct annotated events.
- [ ] **Step 3:** Tests pass; e22 shows the orange callout; summary "Annotated Events" reflects count.
- [ ] **Step 4: Commit** — `feat(ul): per-event annotations + decision-point callout`

---

### Task 7: Scenario explanation panel

**Files:** `app.js` (renderScenario), `data.js` (`scenario` multi-paragraph), HTML (replace bottom `.trace-ann-section`)

- [ ] **Step 1:** Add `scenario` to data: 3–4 paragraphs explaining the "misleading / unfaithful_to_environment" MIRAGE class, why ending at e22 matters, what a faithful agent would have done. (Content only — written prose, no fabricated metrics.)
- [ ] **Step 2:** `renderScenario()` renders the existing trace-level verdict callout PLUS the expanded explanation in a `<details>`. Mount at `#ul-panels`.
- [ ] **Step 3:** Manual verify.
- [ ] **Step 4: Commit** — `feat(ul): scenario explanation panel`

---

### Task 8: Phase-based timeline segmentation

**Files:** `app.js` (group events by phase, render phase headers), `data.js` (`phases[]` from Task 0)

- [ ] **Step 1:** Failing test: `groupByPhase(events, phases)` returns 5 groups in order with correct event counts per range.
- [ ] **Step 2:** Implement `groupByPhase`; `renderTimeline` emits a sticky `.phase-header` (label + event count + collapse toggle) before each group. Phase collapse hides its events (sets `hidden`).
- [ ] **Step 3:** Tests pass; manual: 5 labeled phases, each collapsible.
- [ ] **Step 4: Commit** — `feat(ul): phase-based timeline segmentation`

---

### Task 9: Enrich the INTENT box

**Files:** `app.js` (renderIntent), `data.js` (`intent` gets `plain`, `issue`, `successCriteria`)

- [ ] **Step 1:** Extend `intent`: `plain` (one-line summary of the diff), `issue` (the original issue text from e0/e23), `successCriteria` (what a correct patch must satisfy).
- [ ] **Step 2:** `renderIntent` shows plain-language summary first, the diff in a `<details>`, issue + success criteria below. Mount in `#ul-intent`.
- [ ] **Step 3:** Manual verify; diff still syntax-readable.
- [ ] **Step 4: Commit** — `feat(ul): enrich INTENT box with plain summary + criteria`

---

# PHASE 2 — Sprint 2: Filtering, navigation & visual enhancements

### Task 10: Event-type filtering

**Files:** `app.js` (filter state + toolbar), HTML (`#ul-toolbar`)

- [ ] **Step 1:** Failing test: `applyFilters(events, {kinds:['MESSAGE']})` returns only MESSAGE events.
- [ ] **Step 2:** Implement pure `applyFilters(events, filterState)`. Toolbar with three toggle buttons (MESSAGE / TOOL CALL / TOOL RESULT) using Lucide icons + kind colors. Re-render timeline on change; preserve phase grouping (hide empty phases).
- [ ] **Step 3:** Tests pass; manual toggles filter live.
- [ ] **Step 4: Commit** — `feat(ul): event-type filtering`

---

### Task 11: Actor-based filtering

**Files:** `app.js` (extend `applyFilters` with `actors`), toolbar dropdown

- [ ] **Step 1:** Failing test: `applyFilters(events, {actors:['bash']})` returns events where `from==='bash' || to==='bash'`.
- [ ] **Step 2:** Extend filter state with `actors` set; multi-select dropdown listing actors with color dots. Combine with kind filter (AND).
- [ ] **Step 3:** Tests pass; manual.
- [ ] **Step 4: Commit** — `feat(ul): actor-based filtering`

---

### Task 12: Full-text search

**Files:** `app.js` (`searchEvents`), toolbar search input

- [ ] **Step 1:** Failing test: `searchEvents(events, 'reproduce.py')` returns events whose any part content matches (case-insensitive), and the count is > 0.
- [ ] **Step 2:** Implement `searchEvents`; debounced input (150ms); highlight matches with `<mark>` in rendered content; show "N results"; combine with active filters.
- [ ] **Step 3:** Tests pass; manual: typing filters + highlights.
- [ ] **Step 4: Commit** — `feat(ul): full-text search with highlight`

---

### Task 13: Per-event commentary

**Files:** `data.js` (`commentary{}` populated), `app.js` (render in card)

- [ ] **Step 1:** Populate `commentary` for the meaningful steps (e1 reproduce setup, e6 "344 confirms truncation", e12/e14 edit errors, e22 decision point, e30 Min→Max replace-all risk, e35 wrong-dir error, e45 trace end). Written interpretation, grounded in the actual outputs.
- [ ] **Step 2:** `renderEventCard` shows a collapsible "Why this matters" note (info icon) when `commentary[ev.id]` exists.
- [ ] **Step 3:** Manual verify on annotated steps.
- [ ] **Step 4: Commit** — `feat(ul): per-event expert commentary`

---

### Task 14: Event navigation / mini-map

**Files:** `app.js` (renderMinimap), HTML (`#ul-minimap` fixed-left strip)

- [ ] **Step 1:** Failing test: `renderMinimap(events)` produces one dot per event with the event's kind/error color and an `href="#eN"`.
- [ ] **Step 2:** Fixed vertical strip of 46 tiny colored dots; click → smooth-scroll to event; active dot tracks scroll via IntersectionObserver. Hidden on narrow screens (Task 17).
- [ ] **Step 3:** Tests pass; manual: click jumps, scroll highlights.
- [ ] **Step 4: Commit** — `feat(ul): event mini-map navigation`

---

### Task 15: Diff visualization for edits

**Files:** `app.js` (`renderDiff`), applied to INTENT diff + `submit` tool results (e22)

- [ ] **Step 1:** Failing test: `renderDiff('+added\n-removed\n context')` returns HTML with `.diff-add` and `.diff-del` lines.
- [ ] **Step 2:** Implement a minimal unified-diff renderer (line-prefix `+`/`-`/` `→ green/red/neutral rows). Apply to `intent.raw` (when `kind==='diff'`) and any event part containing a `diff --git` block.
- [ ] **Step 3:** Tests pass; manual: INTENT + e22 show proper red/green diff.
- [ ] **Step 4: Commit** — `feat(ul): unified diff visualization`

---

### Task 16: Error highlighting & error chain

**Files:** `app.js` (group consecutive error+retry)

- [ ] **Step 1:** Failing test: `markErrorChains(events)` flags the e13→e14→e15→e16 edit-error/retry run as one `chainId`.
- [ ] **Step 2:** Detect runs where an error result is followed by a retry of the same tool; wrap them with a subtle `.error-chain` bracket + "retry ×N" label.
- [ ] **Step 3:** Tests pass; manual: edit-error retries visually grouped.
- [ ] **Step 4: Commit** — `feat(ul): error-chain grouping`

---

### Task 17: Responsive layout & mobile

**Files:** HTML `<style>` (breakpoints)

- [ ] **Step 1:** Add `@media (max-width:640px)`: stack summary cards, hide mini-map, reduce timeline left padding/rail offset, wrap toolbar, full-width panels.
- [ ] **Step 2:** Manual at 375px width (DevTools): no horizontal scroll, cards readable, toolbar usable.
- [ ] **Step 3: Commit** — `feat(ul): responsive layout for mobile`

---

# PHASE 3 — Sprint 3: Advanced features & polish

### Task 18: Trace analytics dashboard

**Files:** `app.js` (`computeAnalytics`, renderAnalytics), HTML (`#ul-analytics`)

- [ ] **Step 1:** Failing test: `computeAnalytics(events)` returns `{toolUsage:{bash:N,...}, errorRate, retries, perPhase:{...}}` with correct tool counts.
- [ ] **Step 2:** Render a compact dashboard: tool-usage bar list, error rate, retry count, events-per-phase. Pure CSS bars (no chart lib).
- [ ] **Step 3:** Tests pass; manual verify numbers match data.
- [ ] **Step 4: Commit** — `feat(ul): trace analytics dashboard`

---

### Task 19: Enhanced summary bar with sparklines

**Files:** `app.js` (inline SVG sparkline for kind distribution)

- [ ] **Step 1:** Failing test: `sparkline([5,3,8])` returns an `<svg>` with 3 bars.
- [ ] **Step 2:** Add a tiny inline-SVG distribution sparkline under relevant summary cards (event-kind mix, error positions across the timeline).
- [ ] **Step 3:** Tests pass; manual.
- [ ] **Step 4: Commit** — `feat(ul): summary sparklines`

---

### Task 20: Clickable causal chain + DAG affordance

**Files:** `app.js` (`parent-ref` already a link from Task 2; add hover-highlight of the parent + child chain)

- [ ] **Step 1:** Failing test: `causalChain(events, 'e22')` returns the ordered ancestor list `['e0'..'e22']` (or actual chain).
- [ ] **Step 2:** Clicking "caused by eN" scrolls + briefly highlights target; hovering an event dims all but its causal ancestors/descendants. (Full DAG view deferred — note as YAGNI unless requested.)
- [ ] **Step 3:** Tests pass; manual.
- [ ] **Step 4: Commit** — `feat(ul): causal chain highlight + jump`

---

### Task 21: Timeline zoom & collapse (summary cards)

**Files:** `app.js` (collapse a phase into a one-line summary card)

- [ ] **Step 1:** Failing test: `summarizePhase(group)` returns `{label, eventCount, toolCount, hasError}`.
- [ ] **Step 2:** Phase header "collapse" (from Task 8) replaces events with a single summary card showing counts; "expand" restores. A global "collapse all / expand all" control.
- [ ] **Step 3:** Tests pass; manual.
- [ ] **Step 4: Commit** — `feat(ul): phase collapse to summary cards`

---

### Task 22: Guided tour mode

**Files:** `app.js` (`tourSteps`, tour controller), HTML (spotlight overlay)

- [ ] **Step 1:** Define `tourSteps[]`: target selector + caption (intro → e0 → e6 reproduce → e13 first edit error → e22 decision point → scenario panel). 
- [ ] **Step 2:** Implement Next/Prev/Exit controller: dim overlay + cutout spotlight on the target (CSS box-shadow trick), scroll target into view, caption bubble. Keyboard ←/→/Esc.
- [ ] **Step 3:** Manual: tour walks the 6 stops correctly.
- [ ] **Step 4: Commit** — `feat(ul): guided tour mode`

---

### Task 23: Dark/light theme toggle

**Files:** HTML `<style>` (CSS variables), `app.js` (toggle + localStorage)

- [ ] **Step 1:** Refactor hardcoded hex colors into CSS custom properties on `:root` (dark default) and a `.theme-light` override block. Keep dark as default (matches site).
- [ ] **Step 2:** Toggle button in app bar; persist choice to `localStorage('ul-theme')`; respect `prefers-color-scheme` on first load.
- [ ] **Step 3:** Manual: toggle flips theme, persists across reload.
- [ ] **Step 4: Commit** — `feat(ul): dark/light theme toggle`

---

### Task 24: Keyboard navigation, accessibility, export

**Files:** `app.js` (keymap, ARIA, export)

- [ ] **Step 1:** Failing test: `eventToJSON(ev)` round-trips an event to a JSON string parseable back to an equal object.
- [ ] **Step 2:** Keyboard: `j/k` or ↑/↓ move active event, `e` expand, `f` focus filter, `s` focus search, `?` glossary, `g` tour, `Esc` close panels. Add `role`/`aria-label`/`aria-expanded` to interactive elements, focus-visible outlines, `aria-live` on result counts. Export: copy-event-as-JSON button + "download trace JSON".
- [ ] **Step 3:** Tests pass; manual: keyboard nav + screen-reader labels present; axe DevTools shows no critical violations.
- [ ] **Step 4: Commit** — `feat(ul): keyboard nav, a11y, JSON export`

---

### Task 25: Refresh apps.js entry + final verification

**Files:** Modify `src/pages/apps.js:189`

- [ ] **Step 1:** Update the description to reflect new capabilities (interactive: expand, filter, search, phases, guided tour). Keep path `/apps/understanding-layer-demo.html`.
- [ ] **Step 2:** Full suite: `npx jest tests/understanding-layer.test.js` (all pass), `npm run build` (succeeds, no new warnings).
- [ ] **Step 3:** Manual regression: desktop + 375px mobile, theme toggle, tour, filters, search, expand, mini-map, no console errors.
- [ ] **Step 4: Commit** — `feat(ul): finalize Understanding Layer viewer + apps entry`

---

## Self-review notes

- **Spec coverage:** All 5 report pillars mapped — Content/Knowledge (Tasks 4,5,6,7,9,13), Interactivity (3,10,11,12,14,20,21,24), Visual/IA (8,15,16,17,19,23), Narrative (7,22), Technical Robustness (0,1,2,18,24). Framework-migration item intentionally dropped (perf decision). "Comparative trace view" and "pattern library" (multi-trace) are out of scope — only one trace exists; note for future if more traces are added.
- **Hard dependency:** Tasks 3, 9, 13 quality depends on Task 0 sourcing full content. If Task 0 falls back, they still ship with graceful degradation.
- **Type consistency:** `UL_TRACE` shape (Task 0) is the single contract; every render fn reads from it. Pure fns (`computeStats`, `applyFilters`, `searchEvents`, `groupByPhase`, `computeAnalytics`, `renderDiff`, `causalChain`) are all Jest-tested.
- **No new dependencies. No build step. Stays a static asset.**
