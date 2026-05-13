# Crack in the Veil — Story Dashboard Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single self-contained `index.html` file that renders a 9-tab classified-document terminal dashboard for the "Crack in the Veil" sci-fi universe.

**Architecture:** Single HTML file with inline React JSX (Babel standalone for browser-side transform), Recharts for data visualization, all canonical data embedded as JS constants. No build step — drop into site's `/stories/` directory.

**Tech Stack:** React 18 (CDN), ReactDOM 18 (CDN), Babel standalone (CDN), Recharts (CDN), vanilla CSS

**Spec:** `docs/superpowers/specs/2026-03-11-citv-story-dashboard-design.md`

**Source of truth for all data/content:** `DJC_CITV_outline_dashboardStory.md` — MAIN SCHEMA OUTLINE (starts at line ~1407)

---

## File Structure

```
crack-in-the-veil-stories/
└── index.html    # The entire app — HTML shell, CSS, canonical data, shared components, 9 tab components, main app component
```

One file. Everything inline. The file will be structured in this order within `<script type="text/babel">`:
1. Color constants (`C` object)
2. Canonical data constants (planets, params, phases, bioTimeline, receptorData, speciesSuffer, freqData)
3. Derived calculations (filed, honest, withProx probabilities)
4. Shared UI components (Bar, Chip, SectionLabel, ProbCard)
5. Tab components (Tab0 through Tab8)
6. Main QSRIRecovered component (header, tab bar, tab routing, CRT overlay)
7. ReactDOM.createRoot render call

---

## Chunk 1: Scaffold + Data + Shared Components

### Task 1: HTML Shell + CSS + CDN Imports

**Files:**
- Create: `crack-in-the-veil-stories/index.html`

- [ ] **Step 1: Create project directory**

```bash
mkdir -p "crack-in-the-veil-stories"
```

- [ ] **Step 2: Write the HTML shell**

Create `crack-in-the-veil-stories/index.html` with:
- `<!DOCTYPE html>` with `lang="en"`, charset UTF-8, viewport meta
- `<title>QSRI FILE 7734-C // RECOVERED</title>`
- `<meta name="description" content="Recovered classified documents from the Crack in the Veil universe.">`
- CDN script tags (in `<head>`, crossorigin):
  - `https://unpkg.com/react@18/umd/react.production.min.js`
  - `https://unpkg.com/react-dom@18/umd/react-dom.production.min.js`
  - `https://unpkg.com/@babel/standalone/babel.min.js`
  - `https://unpkg.com/recharts@2/umd/Recharts.js`
- `<style>` block with:
  - Reset: `*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }`
  - `html, body { width:100%; height:100%; background:#05080f; overflow-x:hidden; font-family:'Courier New',monospace; }`
  - `#root { min-height:100vh; }`
  - `p { margin: 0 0 12px 0; }`
  - `sub { font-size: 0.65em; }`
  - `table { border-spacing: 0; }`
  - CRT scanline keyframe: none needed (driven by JS tick)
- `<body>` with `<div id="root"></div>`
- `<script type="text/babel">` block (empty for now, will be filled in subsequent tasks)
- Closing tags

- [ ] **Step 3: Verify file opens in browser**

Open `crack-in-the-veil-stories/index.html` in browser. Should show blank dark page (#05080f background).

- [ ] **Step 4: Commit**

```bash
git add crack-in-the-veil-stories/index.html
git commit -m "feat: scaffold HTML shell with CDN imports for CITV dashboard"
```

---

### Task 2: Canonical Data Constants

**Files:**
- Modify: `crack-in-the-veil-stories/index.html` (inside `<script type="text/babel">`)

- [ ] **Step 1: Add color constants**

Inside the `<script type="text/babel">` block, add the `C` color object:

```javascript
const C = {
  bg:"#05080f", bg2:"#090d18", bg3:"#0e1420",
  border:"#182030", teal:"#00c9b1", red:"#ff2d4b",
  amber:"#f5a623", cyan:"#67e8f9", purple:"#a78bfa",
  ghost:"#2e3f52", text:"#b0c4d8", dim:"#415464",
  green:"#22c55e",
};
```

- [ ] **Step 2: Add canonical data arrays**

Add all data constants exactly as specified in MAIN SCHEMA OUTLINE (lines 1424–1495 of `DJC_CITV_outline_dashboardStory.md`):

- `planets` array (6 Kesslar planets with name, dist, rep, tp)
- `params` array (7 parameters with n, f, t, d, c)
- `phases` array (4 phases with name, yr, suffer, mem, id, real, col)
- `bioTimeline` array (11 years 2038-2048 with pain, empathy, memory, identity, cortisol, repro, neurogen, note)
- `receptorData` array (8 brain regions with region, y1, y2, desc)
- `speciesSuffer` array (7 species with species, score, note)
- `freqData` generated array (60 points with t, f1, f2, f3, finf)

**Critical:** Copy values exactly from the outline. Do not invent or modify any numbers.

- [ ] **Step 3: Add derived probability calculations**

```javascript
const px = d => Math.exp(-d/400);
const filed   = 1-planets.reduce((a,p)=>a*(1-p.rep),1);
const honest  = 1-planets.reduce((a,p)=>a*(1-p.tp),1);
const withProx= 1-planets.reduce((a,p)=>a*(1-p.tp*px(p.dist)),1);
```

- [ ] **Step 4: Verify no console errors**

Open in browser, check dev console. No errors expected (data is just constants, nothing rendered yet).

- [ ] **Step 5: Commit**

```bash
git add crack-in-the-veil-stories/index.html
git commit -m "feat: add canonical lore data constants"
```

---

### Task 3: Recharts Destructuring + Shared UI Components

**Files:**
- Modify: `crack-in-the-veil-stories/index.html` (inside `<script type="text/babel">`, after data constants)

- [ ] **Step 1: Destructure Recharts from window global**

Recharts CDN exposes everything on `window.Recharts`. Destructure needed components:

```javascript
const {
  LineChart, Line, AreaChart, Area, BarChart, Bar: RBar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} = Recharts;
```

Note: Recharts `Bar` conflicts with our custom `Bar` component. Import as `RBar`.

- [ ] **Step 2: Add shared UI components**

Add these exactly as in MAIN SCHEMA OUTLINE (lines 1504–1550):

```javascript
// Bar — progress bar
function Bar({val, max=100, col, h=7}) { ... }

// Chip — labeled badge
function Chip({label, col}) { ... }

// SectionLabel — section header
function SectionLabel({children}) { ... }

// ProbCard — probability display card
function ProbCard({label, tag, prob, col, formula, note}) { ... }

// Tooltip style constant
const tooltipStyle = { ... };
```

Copy implementations exactly from the outline.

- [ ] **Step 3: Add a minimal render to verify components work**

Temporarily add:

```javascript
function App() {
  return React.createElement('div', {style:{padding:20}},
    React.createElement(SectionLabel, null, "TEST LABEL"),
    React.createElement(Bar, {val:60, col:C.teal}),
    React.createElement(Chip, {label:"TEST", col:C.red})
  );
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
```

- [ ] **Step 4: Verify in browser**

Should see a teal section label, a teal progress bar at 60%, and a red "TEST" chip. Check console for errors.

- [ ] **Step 5: Remove temporary render, commit**

Remove the temporary `App` function and render call. They'll be replaced by the real components.

```bash
git add crack-in-the-veil-stories/index.html
git commit -m "feat: add Recharts imports and shared UI components"
```

---

## Chunk 2: Tab Components 0–4

### Task 4: Tab 0 — SUFFER INDEX

**Files:**
- Modify: `crack-in-the-veil-stories/index.html` (add Tab0 component after shared components)

- [ ] **Step 1: Implement Tab0 component**

Build the `Tab0` function component exactly matching MAIN SCHEMA OUTLINE Tab 0 (lines 1617–1690). Contains:

1. **QSRI MODEL SPECIFICATIONS** — 4-column grid of stat cards (Epochs 847, Accuracy 94.7%, Subjects 2.3M, Deployed 4.2B)
2. **SUFFER INDEX GLOBAL TRAJECTORY** — 3-column display (54.2 → 8.7 → 1.2) with arrows between, Bar underneath, scale labels
3. **SPECIES SUFFER INDEX COMPARISON** — Recharts horizontal `BarChart` using `speciesSuffer` data, with `ReferenceLine` at 54.2 (human baseline). Height 220px. Uses `RBar` (not `Bar`).
4. **Plant discovery callout** — amber-bordered box with narrative text

Note: The Recharts `Bar` was imported as `RBar` to avoid conflict with our progress `Bar` component. Use `<RBar dataKey="score" .../>` in the chart.

- [ ] **Step 2: Commit**

```bash
git add crack-in-the-veil-stories/index.html
git commit -m "feat: add Tab 0 — Suffer Index"
```

---

### Task 5: Tab 1 — N8K7 PHASES

**Files:**
- Modify: `crack-in-the-veil-stories/index.html` (add Tab1 component)

- [ ] **Step 1: Implement Tab1 component**

Build `Tab1` matching MAIN SCHEMA OUTLINE Tab 1 (lines 1695–1734). Contains:

1. **Phase cards** — map over `phases` array, each card has:
   - Color-coded left border (`borderLeft: 3px solid ${p.col}`)
   - Phase name + year range + Classified/Catastrophic chip
   - 4-column metric grid: Suffer Index (max 60), Memory Loss %, Identity Fracture %, Reality Distortion %
   - Each metric shows value + `Bar` component
2. **Catastrophe note** — red box with Phase 3 data (47% family recognition failure, 68% wrong timeline, 12% autobiographical collapse, UN council quote)

- [ ] **Step 2: Commit**

```bash
git add crack-in-the-veil-stories/index.html
git commit -m "feat: add Tab 1 — N8K7 Phases"
```

---

### Task 6: Tab 2 — N8K7 BIO DATA

**Files:**
- Modify: `crack-in-the-veil-stories/index.html` (add Tab2 component)

- [ ] **Step 1: Implement Tab2 component**

Build `Tab2` matching MAIN SCHEMA OUTLINE Tab 2 (lines 1739–1810). Contains:

1. **Recharts LineChart** — 7 lines over `bioTimeline` data:
   - pain (teal, 2px), empathy (purple, 2px), memory (cyan, 2px), identity (amber, 2px)
   - cortisol (ghost, 1.5px dashed), repro (red, 2.5px), neurogen (green, 1.5px dashed)
   - Height 280px, XAxis by year, YAxis 0-100 with "% baseline" label
   - ReferenceLine at y=50, Tooltip with % formatter
   - Uses `<Line>` components (from Recharts destructure)
2. **Legend** — flex row of colored line indicators with labels
3. **Year-by-year annotations** — 2-column grid, filter to alternating years, each card shows year, repro %, note. Left border color coded by repro level (red <50, amber <80, teal >=80)
4. **Fertility mechanism callout** — red box explaining HPG axis shutdown, Cal McLaren born 2045

- [ ] **Step 2: Commit**

```bash
git add crack-in-the-veil-stories/index.html
git commit -m "feat: add Tab 2 — N8K7 Bio Data with line chart"
```

---

### Task 7: Tab 3 — NEURAL CASCADE

**Files:**
- Modify: `crack-in-the-veil-stories/index.html` (add Tab3 component)

- [ ] **Step 1: Implement Tab3 component**

Build `Tab3` matching MAIN SCHEMA OUTLINE Tab 3 (lines 1815–1895). Contains:

1. **Recharts grouped BarChart** — `receptorData` with two bars per region:
   - y1 (baseline, teal, opacity 0.3) and y2 (post-N8K7, red)
   - Height 300px, XAxis showing region names (interval=0, fontSize 8)
   - Custom Tooltip content showing region name, description, baseline vs 2048 values
   - Uses `<RBar>` (renamed Recharts Bar)
2. **Legend** — baseline (teal translucent) vs post-N8K7 (red solid)
3. **Cascade logic cards** — 5 numbered cards (01–05):
   - 01: Nociceptor Suppression (red)
   - 02: Emotional Pain Pathway Collapse (#ff7a00)
   - 03: Memory Salience Loss (amber)
   - 04: Identity Fragmentation (purple)
   - 05: Reproductive Axis Shutdown (red)
   - Each has number, title, body text. Color-coded left border.
4. **Masochist emergence note** — purple box about Phase 2 adaptation

- [ ] **Step 2: Commit**

```bash
git add crack-in-the-veil-stories/index.html
git commit -m "feat: add Tab 3 — Neural Cascade with bar chart"
```

---

### Task 8: Tab 4 — PARAM AUDIT

**Files:**
- Modify: `crack-in-the-veil-stories/index.html` (add Tab4 component)

- [ ] **Step 1: Implement Tab4 component**

Build `Tab4` matching MAIN SCHEMA OUTLINE Tab 4 (lines 1900–1936). Contains:

1. **Parameter comparison table** — 7 rows from `params` array:
   - Columns: PARAMETER, FILED, TRUE VALUE, DELTA, FLAG
   - Critical rows: red left border (3px), filed value in red bold, delta in red bold, CRITICAL chip
   - Non-critical: ghost left border, filed in teal, delta in dim, MINOR chip
   - Alternating row backgrounds (bg2/bg3)
   - `overflowX: auto` wrapper, `minWidth: 560`
2. **stellar_age_penalty finding** — red box explaining Van-21-IR, +31 percentage points per planet

- [ ] **Step 2: Commit**

```bash
git add crack-in-the-veil-stories/index.html
git commit -m "feat: add Tab 4 — Parameter Audit table"
```

---

## Chunk 3: Tab Components 5–8 + Main App + Final Assembly

### Task 9: Tab 5 — PROB CHAIN

**Files:**
- Modify: `crack-in-the-veil-stories/index.html` (add Tab5 component)

- [ ] **Step 1: Implement Tab5 component**

Build `Tab5` matching MAIN SCHEMA OUTLINE Tab 5 (lines 1941–1963). Contains:

1. **Three ProbCard components:**
   - Filed model (red, "MANIPULATED", `filed` probability, formula with Unicode superscripts)
   - Honest model (amber, "TRUE BASELINE", `honest` probability)
   - Honest + proximity (teal, "FULL MODEL", `withProx` probability)
   - Each has note text explaining the implication
2. **Independence assumption note** — bg2 box about correlated model

Uses the shared `ProbCard` component from Task 3.

- [ ] **Step 2: Commit**

```bash
git add crack-in-the-veil-stories/index.html
git commit -m "feat: add Tab 5 — Probability Chain"
```

---

### Task 10: Tab 6 — EARTH PROX

**Files:**
- Modify: `crack-in-the-veil-stories/index.html` (add Tab6 component)

- [ ] **Step 1: Implement Tab6 component**

Build `Tab6` matching MAIN SCHEMA OUTLINE Tab 6 (lines 1968–2031). Contains:

1. **Formula definition** — purple box with `earth_proximity_factor(d) = e^(-d / 400)` and explanation
2. **Planet scores table** — 7 rows (6 Kesslar + Earth):
   - Columns: PLANET, DIST (LY), BASE P, PROX FACTOR, ADJUSTED P, RESULT
   - Earth row: green background (#001a0a), teal left border, teal text, bold, "ORIGIN CANDIDATE" chip
   - Kesslar rows: alternating bg2/bg3, red left border, red adjusted P, "NULL" chip
   - Proximity factor calculated inline: `px(p.dist)`
   - Adjusted P calculated inline: `p.tp * px(p.dist)`
   - Spread planets array with Earth appended: `[...planets, {name:"EARTH",dist:0,rep:0,tp:0.94}]`
3. **Smoking gun conclusion** — red-bordered box with:
   - "SMOKING GUN" header in red
   - All six below 5%, Earth at 94.00%
   - Known to QSRI leads by 2036
   - Amber closing: mission designed to send Cal away

- [ ] **Step 2: Commit**

```bash
git add crack-in-the-veil-stories/index.html
git commit -m "feat: add Tab 6 — Earth Proximity"
```

---

### Task 11: Tab 7 — ISOVOX COMP

**Files:**
- Modify: `crack-in-the-veil-stories/index.html` (add Tab7 component)

- [ ] **Step 1: Implement Tab7 component**

Build `Tab7` matching MAIN SCHEMA OUTLINE Tab 7 (lines 2036–2133). Contains:

1. **Material spec grid** — 2x2 grid of cards:
   - Structure Type: Self-Phased Phononic Mesh (SPPM), teal
   - Binding Mechanism: Vibration-Mediated Coulomb Stabilization (VMCS), cyan
   - Regenerative Agent: Isofractal Hydrogen Nets (IHN + REBM), purple
   - Energetic Role: Passive Ambient Synchronizer (Vacuum-State Compatible), amber
2. **Voxium-C formula display:**
   - Large formula: C₉H₂₀Si₆N₄O₇ (using `<sub>` tags)
   - Subtitle: "Voxium-C — Siloxane fused with self-resonating amino-ceramic chains"
   - 5-column element cards: C×9, H×20, Si×6, N×4, O×7 with color coding
3. **Frequency cascade waveform** — Recharts LineChart:
   - `freqData` (60 points), 4 lines: f1 (teal), f2 (cyan), f3 (purple), finf (amber)
   - Height 160px, no X tick labels, no Y tick labels
   - Legend row beneath
4. **Material properties cards** — 4 cards with color-coded left borders:
   - Self-Repair (teal), Voice Reactivity (cyan), Vacuum Compatibility (purple), Possible Sentience (amber)
   - Each has label + body text

- [ ] **Step 2: Commit**

```bash
git add crack-in-the-veil-stories/index.html
git commit -m "feat: add Tab 7 — IsoVox Composition"
```

---

### Task 12: Tab 8 — FIELD LOG

**Files:**
- Modify: `crack-in-the-veil-stories/index.html` (add Tab8 component)

- [ ] **Step 1: Implement Tab8 component**

Build `Tab8` matching MAIN SCHEMA OUTLINE Tab 8 (lines 2138–2176). Contains:

1. **Section label:** "FIELD LOG :: CAL McLAREN :: ENCRYPTED LOCAL — NOT ROUTED TO AVA HIVEMIND"
2. **Journal container** — bg3 background, border, rounded, padded, styled prose:
   - Header: monospace dim text with NAI fragment info, Day 2847, Kesslar-12 orbit
   - "CC here." in teal
   - Paragraphs of Cal's journal (copy text exactly from outline)
   - Key highlights: "99.98" reference, Ava's pause timing in amber, "where we came from" in red
   - Closing paragraph in amber: "The math doesn't lie..."
   - Footer: border-top separator, Ava access log, M. MIRRO in red, flagged read-only

- [ ] **Step 2: Commit**

```bash
git add crack-in-the-veil-stories/index.html
git commit -m "feat: add Tab 8 — Field Log"
```

---

### Task 13: Main App Component + CRT Effects + Final Assembly

**Files:**
- Modify: `crack-in-the-veil-stories/index.html` (add main QSRIRecovered component + render call)

- [ ] **Step 1: Implement QSRIRecovered main component**

Build `QSRIRecovered` matching MAIN SCHEMA OUTLINE main component (lines 1560–2181). Contains:

1. **State:** `tab` (number, default 0), `tick` (number, incremented every 70ms via useEffect interval)
2. **Derived:** `scan = (tick * 1.6) % 800`, `flicker` character (▓ every 53 ticks, ░ every 37 ticks)
3. **CRT scanline overlay:**
   - Fixed full-screen repeating gradient (3px transparent, 1px rgba black)
   - Fixed horizontal scan line at `top: scan`, height 2px, teal at 4% opacity
4. **Header** (sticky, z-index 10):
   - Classification bar: red, 9px, letterSpacing 3, with flicker char
   - Title: "GENESIS PROTOCOLS — FULL DATA RECONSTRUCTION" in teal
   - Subtitle stats: QSRI 2037-2041, Budget $847B, Epochs 847, Accuracy 94.7%, Deployed 4.2B, VEIL: COMPROMISED (red)
5. **Tab bar** (sticky, z-index 9):
   - `TABS` array: ["SUFFER INDEX","N8K7 PHASES","N8K7 BIO DATA","NEURAL CASCADE","PARAM AUDIT","PROB CHAIN","EARTH PROX","ISOVOX COMP","FIELD LOG"]
   - Map to buttons with active state (teal border-bottom + teal text)
   - `overflowX: auto` for mobile
6. **Tab content area** (padding 20, maxWidth 900):
   - Conditional render: `{tab===0 && <Tab0/>}`, `{tab===1 && <Tab1/>}`, etc.

- [ ] **Step 2: Add ReactDOM render call**

```javascript
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<QSRIRecovered/>);
```

- [ ] **Step 3: Verify full app in browser**

Open in browser. All 9 tabs should be clickable. Verify:
- CRT scanline moves
- Header flicker character appears occasionally
- Tab 0: stat cards + species chart renders
- Tab 2: line chart renders with 7 lines
- Tab 3: bar chart renders with grouped bars
- Tab 7: frequency cascade waveform renders
- Tab 8: Cal's log text is complete
- No console errors

- [ ] **Step 4: Commit**

```bash
git add crack-in-the-veil-stories/index.html
git commit -m "feat: add main app component with CRT effects — dashboard complete"
```

---

### Task 14: Final Polish + Verification

**Files:**
- Modify: `crack-in-the-veil-stories/index.html` (minor fixes if needed)

- [ ] **Step 1: Cross-check all canonical data values**

Verify against `DJC_CITV_outline_dashboardStory.md` MAIN SCHEMA OUTLINE:
- All 6 planet distances and probabilities match
- All 7 parameter values match
- All 4 phase metrics match
- All 11 bioTimeline years match
- All 8 receptor regions match
- All 7 species suffer scores match
- Probability calculations: filed ≈ 99.98%, honest ≈ 59.97%, withProx ≈ 3.24%

- [ ] **Step 2: Test responsive behavior**

Resize browser window. Tables should scroll horizontally. Tab bar should scroll. Layout should remain usable at 768px width.

- [ ] **Step 3: Final commit**

```bash
git add crack-in-the-veil-stories/index.html
git commit -m "feat: CITV story dashboard — complete and verified"
```
