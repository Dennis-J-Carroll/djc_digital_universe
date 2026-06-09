# CONVERGENCE — Design Spec
**Date:** 2026-06-08
**Status:** Approved

---

## Overview

CONVERGENCE is an interactive terminal narrative where an AI interrogates a CFO about financial crimes and a darker event. Mech-interp concepts (attention, circuit tracing, RAG, salience) are woven into the story via `gloss` annotations after each CONVERGENCE line.

Currently a standalone HTML file. This spec covers:
1. Integration into the site as a proper route
2. Reactive CRT enhancements tied to game state
3. Web Audio sound system with user toggle
4. Apps catalog card

---

## Architecture

### Files

| File | Purpose |
|------|---------|
| `static/convergence-app.html` | Enhanced standalone game (all logic, styles, and sound) |
| `src/pages/convergence.js` | Gatsby page — full-viewport iframe wrapper, SEO metadata |
| `src/pages/apps.js` | Add CONVERGENCE card to the catalog |

### Route

`/convergence` — top-level route. Top-level avoids a Gatsby directory/file conflict between `src/pages/apps.js` and a potential `src/pages/apps/` subdirectory.

### Iframe approach rationale

The game relies on direct DOM manipulation, named timer management, and document-level event listeners — patterns that conflict with React reconciliation. An iframe gives full-viewport isolation with zero React entanglement. The Gatsby wrapper page provides the route, SEO metadata, and layout shell; the game runs in its own DOM context.

The iframe src points to `/convergence-app.html`. The Gatsby page sets `<title>`, `<meta name="description">`, and Open Graph tags.

---

## Reactive CRT System

### Principle

`state.coldness` and `state.candor` are already tracked per choice. A new `updateCRTState()` function is called after every `chooseOption()`. It sets CSS custom properties on `document.documentElement` which drive all visual effects declaratively.

### CSS Custom Properties

```css
--glitch-chance:       0.02  → 0.18   (per-character glitch probability)
--flicker-interval-ms: 14000 → 2000  (ms between flicker events)
--phosphor-glow:       4px   → 18px  (text-shadow blur radius on .convergence-text)
--scanline-opacity:    0.025 → 0.085 (repeating-gradient opacity)
--breathe:             0     → 1     (enables slow scale(1.002) loop at cold ≥ 6)
```

### Coldness Levels

| Level | Condition | Visual State |
|-------|-----------|-------------|
| Calm | cold = 0–1 | Subtle phosphor, rare flicker (12–18s), 2% glitch, fine scanlines |
| Rising | cold = 2–4 | Warmer glow, flicker 4–7s, 8% glitch, denser scanlines |
| Harsh | cold = 5+ | Bright phosphor + white core, flicker 1.5–3s, 18% glitch, heavy scanlines, screen breathe |

### Candor Cooling Flash

On any `crack` tone choice: terminal phosphor dims for 300ms then settles to current level. Implemented as a short CSS transition override — a visible reward for honesty, thematically resonant (CONVERGENCE's temperature dropping).

### updateCRTState() Signature

```js
function updateCRTState(coldness, candor) {
  // Interpolate CSS vars based on coldness (0–6 scale, clamped)
  // Called after every chooseOption()
  // Candor flash handled separately via triggerCandorFlash()
}
```

---

## Status Bar

A persistent strip between the title bar and terminal body (~26px height).

### Layout

```
PHASE ▣▣░░  |  TEMP ▓▓▓░░  |  00:04:23  |  [SND]
```

### Components

- **PHASE pips** — 4 square pips, filled = current phase (uses `state.phase`)
- **TEMP bar** — 5 block chars (`▓`/`░`), ratio of coldness to max (6). Color: green at 0, amber at 3, red-amber at 6
- **Session timer** — `MM:SS` from `state.startTime`, updates every second via `setInterval`
- **[SND] toggle** — click to enable/disable sound, persisted to localStorage

Visual style: muted text (`#6B6B6B` base), small font (12px VT323), same dark background as terminal body. Never dominates — it reads as chrome, not UI.

---

## Sound System

### Engine

Web Audio API — zero external files, zero network requests, zero load latency. `AudioContext` initialized on first user interaction (keydown or click) to satisfy browser autoplay policy.

### Sounds

| Sound | Type | Trigger | Params |
|-------|------|---------|--------|
| CRT hum | OscillatorNode @ 60Hz, sine | Boot complete | gain 0.015, constant |
| Typewriter click | 3ms white noise burst | Per character typed | gain 0.08, immediate |
| Static crackle | Bandpass-filtered noise, 80ms | On glitch animation | gain 0.12, Q=2 @ 2kHz |
| CONVERGENCE ping | OscillatorNode @ 880Hz, sine, 40ms | Start of each `>` output line | gain 0.06, fast decay |
| Cooling flash tone | Sine descend 440→220Hz, 200ms | On `crack` choice | gain 0.05, smooth release |

### Toggle

`[SND]` button in status bar. Default: **off**. State key: `localStorage.getItem('convergence-snd')`. Button label switches between `[SND OFF]` and `[SND ON]`. Muting stops the CRT hum oscillator; re-enabling resumes it.

---

## Replay System

After `endingTail()` completes, the command parser accepts two new variants:

```
> restart         Full boot sequence → CONVERGENCE opening
> restart --fast  Skip boot → CONVERGENCE opening line immediately
```

Both reset: `state.coldness`, `state.candor`, `state.phase`, `state.hingeIndex`, `state.hingeOpen`, `state.logsUnlocked`, `state.finished`, `state.startTime`.

Sound preference and `AudioContext` survive restart (no re-initialization needed).

CRT state resets to calm (`updateCRTState(0, 0)`) at restart.

`--fast` variant clears `#outputContainer` and calls `showOpening()` directly.

---

## Apps Catalog Card

### Category
`Creative` — uses existing gradient: `linear-gradient(160deg, #4a2d40 0%, #5c3d52 60%, #6e4a63 100%)`, accent `#b38fa3`.

### Icon
Terminal cursor icon: VT323 font, `meridian_term v3.1.4` label in muted text, `> ▌` with blinking cursor. Matches the actual game's title bar aesthetic.

### Copy

```
Title:       CONVERGENCE
Category:    Creative
Description: An AI has been reading your files. It has questions.
             A terminal-based interactive narrative with live
             mech-interp concepts woven into the interrogation.
Tags:        interactive · narrative · AI/ML
Link:        /convergence
```

### Card behavior
Clicking the card navigates to `/convergence`. No modal, no overlay — direct navigation to the full-screen experience.

---

## Gatsby Page (src/pages/convergence.js)

Minimal wrapper:

```jsx
// Full-viewport iframe — game is DOM-native, runs in isolation
export default function ConvergencePage() {
  return (
    <Layout>
      <Seo
        title="CONVERGENCE — meridian_term v3.1.4"
        description="An AI has been reading your files. It has questions. Interactive terminal narrative with mech-interp concepts."
      />
      <iframe
        src="/convergence-app.html"
        style={{ width: '100%', height: 'calc(100vh - VAR_NAV_HEIGHT)', border: 'none', display: 'block' }}
        title="CONVERGENCE terminal narrative"
      />
    </Layout>
  );
}
```

The game's terminal window is `position: fixed` inside the iframe — it self-centers in the iframe's viewport. The nav bar sits above the iframe in the Gatsby layout. During implementation, measure the actual nav bar height (or read the CSS variable if one exists) and replace `VAR_NAV_HEIGHT` with the correct value so the iframe fills the remaining viewport without overflow.

---

## Implementation Order

1. Enhance `static/convergence-app.html` (reactive CRT + status bar + sound + replay)
2. Create `src/pages/convergence.js` (iframe wrapper)
3. Add card to `src/pages/apps.js`
4. Test: reactive CRT at all coldness levels, sound toggle, restart variants, card link, mobile layout

---

## Out of Scope

- Saving session state across page refreshes (localStorage full save)
- Shareable ending URLs
- Technical debrief screen post-ending
- Mobile-specific sound adjustments
- Any changes to the narrative content itself
