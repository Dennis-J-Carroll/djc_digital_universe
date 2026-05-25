# Design Spec: Science of Convergence — Phase 1 Overhaul

**Date:** 2026-05-15  
**Status:** Approved  
**Subject:** `dennisjcarroll.com/apps/convergence/`  
**Current score:** 3.5/10 → **Target after Phase 1:** ~7.5/10

---

## Problem

The current app is a 524-line single HTML file scored 3.5/10 by external evaluation. Critical gaps:

- Formulas presented as isolated code boxes with no derivations, symbol legends, or worked examples
- Zero 2024–2026 research integration (RG for neural networks, NTK phase transitions, Kaplan/Chinchilla neural scaling laws, KANDy)
- Interactivity limited to click-to-reveal text — no simulations, no parameter controls
- Single Chart.js line chart as the only visualization
- No citations, bibliography, glossary, or pedagogical structure
- Accessibility failures: emoji icons, missing ARIA, contrast failures on small text
- Single-file architecture will not scale to the target feature set

---

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Svelte + Vite | Compiles to zero-runtime JS; reactive primitives ideal for slider-driven canvas; lighter bundle than React for this scale |
| Visualization | D3.js + Canvas | D3 for data-driven SVG (RG flow, axes); Canvas for pixel-level ops (bifurcation, attractor basin) |
| Delivery sequence | Architecture-first | Migrate to Svelte first; write content once in the right place; no double-rewrite |
| Phase 1 visualizations | BifurcationDiagram + PhaseSpaceExplorer | Highest pedagogical ROI; directly teaches Feigenbaum universality and attractor convergence |

---

## Architecture

### Directory layout

```
everything-personal-website/
├── apps/
│   └── science-of-convergence/        ← Svelte source (new)
│       ├── src/
│       │   ├── App.svelte
│       │   ├── sections/
│       │   ├── visualizations/
│       │   ├── ui/
│       │   └── lib/
│       ├── vite.config.js
│       └── package.json
├── static/
│   └── apps/
│       ├── The Science of Convergence.html   ← old (kept until new URL confirmed)
│       └── convergence/               ← vite build output
│           ├── index.html
│           └── assets/
```

### Build → deploy

```
cd apps/science-of-convergence && npm run build
# output → static/apps/convergence/
# Gatsby serves as static passthrough
# Live at: dennisjcarroll.com/apps/convergence/
```

---

## Component Tree

```
App.svelte
├── DJCAppBar.svelte           ← back → /apps, DJC logo
├── StickyNav.svelte           ← scroll-tracked, 7 section links
│
├── sections/
│   ├── Introduction.svelte    ← thesis + classical-to-modern overview
│   ├── NADCs.svelte           + PhaseSpaceExplorer.svelte   [Phase 1]
│   ├── Universality.svelte    + BifurcationDiagram.svelte   [Phase 1]
│   ├── MathForms.svelte       + DecayExplorer.svelte        [Phase 2]
│   ├── Mechanisms.svelte      + RGFlowViz.svelte            [Phase 2]
│   ├── Compression.svelte     + AttractorBasinMap.svelte    [Phase 2]
│   └── Outlook.svelte         + LossLandscape.svelte        [Phase 2]
│
└── ui/
    ├── FormulaBlock.svelte    ← equation + symbol legend + derivation + worked example
    ├── ThreeLayer.svelte      ← Conceptual / Technical / Computational tab accordion
    ├── Citation.svelte        ← inline [Author, year] → hover tooltip → bibliography anchor
    ├── GlossaryTerm.svelte    ← hover → definition popup
    ├── KnowledgeCheck.svelte  ← [Phase 2]
    └── LearningObjectives.svelte ← [Phase 2]

lib/
├── math/
│   ├── logisticMap.js         ← iteration, bifurcation point finder, cobweb data
│   ├── lorenz.js              ← [Phase 2]
│   └── powerLaw.js            ← fitting, scaling exponent estimation
├── citations.js               ← bibliography data (all refs)
└── glossary.js                ← term → definition map
```

---

## Phase 1 Scope

### In scope

1. **Svelte + Vite scaffold** — project setup, build pipeline, Vite config, CSS custom properties for warm palette, DJC app bar, sticky scroll-tracked nav
2. **All 7 sections migrated** — existing content moved to Svelte components without regression
3. **ThreeLayer tabs** — Conceptual / Technical / Computational accordion on every section; Technical and Computational layers populated with new math depth
4. **FormulaBlock component** — every formula gets: symbol legend, derivation sketch, regime of validity, worked numeric example; replaces isolated monospace code boxes
5. **Citation + Bibliography system** — inline `[Author, year]` with hover tooltip; bibliography section at page bottom; baseline refs: Feigenbaum 1978, Kaplan 2020, Chinchilla 2022, Banta et al. 2025 (RG for NNs), NTK papers NeurIPS 2025
6. **Glossary system** — GlossaryTerm hover popups for: attractor, phase space, bifurcation, universality class, coarse-graining, Kolmogorov complexity, NTK, scaling exponent
7. **Research integration (critical)** — RG for neural networks (Banta et al. arXiv 2025) in Mechanisms section with formal classical↔neural mapping; neural scaling laws (Kaplan/Chinchilla) in Compression + Universality; NTK phase transitions in Mechanisms; KANDy mention in NADCs
8. **Compression section overhaul** — formal Kolmogorov complexity K(x) definition, mathematical argument for why power-law NADCs compress better than random trajectories, worked compression ratio example, direct bridge to LLM scaling laws
9. **Accessibility fixes** — ARIA roles + tabindex on all interactive elements, keyboard nav, contrast fixes for tan-on-beige (#A07C5B on #F5F1EA fails WCAG AA at small size), canvas aria-labels with data table fallback, replace emoji icons (🔄📈) with accessible SVG or text labels
10. **BifurcationDiagram.svelte** — interactive logistic map bifurcation diagram on Canvas; drag-to-zoom into period-doubling cascade; hover annotations showing Feigenbaum ratios converging to δ ≈ 4.669; "Show δ annotations" toggle
11. **PhaseSpaceExplorer.svelte** — cobweb diagram on Canvas; r parameter slider (0.5–4.0); click anywhere to set initial condition and watch trajectory converge; dynamic annotation describing current regime (fixed point / 2-cycle / 4-cycle / chaos); "Add random ICs" and "Clear" controls

### Deferred to Phase 2

- RGFlowViz.svelte (vector field, stable/unstable fixed points)
- DecayExplorer.svelte (parametric sliders, log-scale toggle, power-law fitter)
- AttractorBasinMap.svelte (pixel-colored basin map, WebWorker for perf)
- LossLandscape.svelte (3D neural loss surface, gradient descent trajectories)
- KnowledgeCheck questions (3–5 per section)
- Classical-to-Modern guided learning path
- Lorenz system in PhaseSpaceExplorer
- localStorage progress tracking
- Deep linking / client-side routing

---

## UI Component Specs

### ThreeLayer.svelte

Three tabs per section. Tab bar floats above content panel.

- **Conceptual** — existing prose content, refined for clarity. Default active tab.
- **Technical** — formal definitions, derivation sketches, key equations with FormulaBlock, caveats, regime of validity. Tagged "new" on first render.
- **Computational** — Python/JS code examples, numerical methods, worked data, reproducible experiments. Tagged "new" on first render.

Tab state: local to each section instance (not globally synced).

### FormulaBlock.svelte

Props: `formula` (string), `symbols` (array of {sym, meaning}), `derivation` (string, optional), `example` (string).

Visual: amber left border, beige background, formula in monospace on white inset, symbol grid below, worked example box at bottom.

### Citation.svelte

Props: `key` (string matching citations.js), `short` (display string e.g. "Feigenbaum, 1978").

Renders inline `[Feigenbaum, 1978]` in amber, dashed underline. Hover → tooltip with full reference. Click → scroll to bibliography.

### GlossaryTerm.svelte

Props: `term` (string), `definition` (string).

Renders term with dotted underline. Hover → definition popup above. No click required.

---

## Visualization Specs

### BifurcationDiagram.svelte (Phase 1)

- Canvas-rendered. Computes logistic map `x_{n+1} = r·x_{n}·(1−x_{n})` for r ∈ [rMin, rMax]
- 400 warmup iterations discarded; 400 plotted per r value
- Drag-to-zoom: mousedown → mousemove → mouseup draws selection rect; on release, rMin/rMax update and diagram redraws
- Reset zoom button
- "Show δ annotations" toggle: draws vertical dashed lines at bifurcation points r₁=3.449, r₂=3.544, r₃=3.565, r₄=3.569; annotation text shows successive ratios converging to δ
- Annotation bar below canvas updates on interaction

### PhaseSpaceExplorer.svelte (Phase 1)

- Canvas-rendered cobweb diagram
- r slider range: 0.5–4.0 (step 0.01)
- Background: logistic curve `y = r·x·(1−x)` in light tan; y=x diagonal in lighter tan
- Click on canvas: computes x-coordinate as initial condition x₀; draws cobweb (vertical then horizontal lines alternating between the logistic curve and y=x diagonal) for 60 iterations
- Up to 6 simultaneous trajectories, color-coded
- Annotation bar: dynamically describes current regime based on r value:
  - r < 1: collapse to 0
  - 1 ≤ r < 3: stable fixed point, shows x* = 1−1/r
  - 3 ≤ r < 3.449: stable 2-cycle
  - 3.449 ≤ r < 3.544: stable 4-cycle
  - 3.544 ≤ r < 3.57: period-doubling cascade
  - r ≥ 3.57: chaotic regime
- "Clear" and "Add random ICs" (4 random starting points) buttons

---

## Content Priorities by Section

| Section | Phase 1 additions |
|---|---|
| Introduction | Explicit classical→modern thesis; overview of what each section proves |
| NADCs | Three-layer tabs; FormulaBlock for d(n) ∝ n^{-β}; KANDy mention; kicked rotator case study; PhaseSpaceExplorer embedded |
| Universality | Three-layer tabs; FormulaBlock for scaling exponents; neural scaling laws (Kaplan/Chinchilla) as direct analog; BifurcationDiagram embedded |
| Math Forms | Three-layer tabs; FormulaBlock for all 4 forms; derivation sketches; power-law fitting example |
| Mechanisms | Three-layer tabs; RG fixed-point derivation (Technical layer); Feigenbaum numeric computation (Computational layer); RG-for-NNs bridge (Banta 2025); NTK phase transitions |
| Compression | **Full overhaul**: K(x) formal definition; compression ratio argument; worked example; LLM scaling laws as universality phenomenon; citations throughout |
| Outlook | Frontier framing: which universality claims are proven vs heuristic; open questions around KAN/KANDy; where neural analogies may break |

---

## Accessibility Requirements

- All interactive elements: `role="button"` or native `<button>`, `tabindex="0"`, keyboard `Enter`/`Space` handlers
- Canvas elements: `role="img"` with `aria-label` describing content; `<table>` data fallback in `<details>` below each canvas
- Color contrast: all text-on-background combinations must pass WCAG AA (4.5:1 for small text). Tan #A07C5B on beige #F5F1EA = 2.3:1 — **fails**. Fix: darken text to #6B4F3A or lighten background to #fff for small text contexts.
- Emoji icons (🔄📈 in generation diagram): replace with SVG icons or text labels with aria-label
- Sticky nav: must not overlap DJC app bar. App bar height = 44px; nav top offset = 44px.

---

## Visual System

Preserve existing palette exactly:

| Token | Value | Use |
|---|---|---|
| Page background | #FDFBF7 | Body |
| Main text | #3D352A | Body copy |
| Primary UI | #A07C5B | Section titles, nav links, accents |
| Accent | #7B5E4D | Hover states, formula borders |
| Secondary UI | #D4C2AD | Borders, dividers |
| Formula bg | #F5F1EA | FormulaBlock, code insets |
| Card bg | #FFFFFF | Section cards |

Typography: body in Georgia/serif for long-form reading. UI elements (tabs, labels, controls) in system sans-serif. Monospace for formulas and code.

---

## Definition of Done (Phase 1)

- [ ] `npm run build` in `apps/science-of-convergence/` produces clean output
- [ ] Built output served correctly from `static/apps/convergence/index.html`
- [ ] All 7 sections render with ThreeLayer tabs
- [ ] Every formula has FormulaBlock with symbol legend and worked example
- [ ] Citations render inline with working hover tooltips
- [ ] Glossary terms render with hover definitions
- [ ] BifurcationDiagram: renders, zooms, shows δ annotations
- [ ] PhaseSpaceExplorer: cobweb draws on click, r slider updates regime, annotation updates
- [ ] Compression section includes K(x) definition and LLM bridge
- [ ] Mechanisms section includes RG-for-NNs content
- [ ] All interactive elements keyboard-accessible
- [ ] Canvas elements have aria-labels
- [ ] Contrast passes WCAG AA on all text
- [ ] No emoji as sole information carrier
- [ ] DJC app bar present and nav does not overlap it
- [ ] Old HTML file preserved at original path until new URL confirmed working

---

## Phase 2 Preview

After Phase 1 ships and is confirmed:

1. RGFlowViz — 2D parameter space with RG flow arrows, stable/unstable fixed points, universality class demonstration
2. DecayExplorer — parametric sliders for β and λ, log-scale toggle, "fit a power law" from user-drawn points
3. AttractorBasinMap — pixel-colored basin of attraction map, WebWorker for non-blocking compute
4. LossLandscape — 2D slice of neural loss surface, gradient descent trajectories as NADCs, learning rate slider
5. KnowledgeCheck — 3–5 questions per section, conceptual + applied types, localStorage progress
6. Classical-to-Modern path — prerequisite-aware 6-step guided learning sequence
