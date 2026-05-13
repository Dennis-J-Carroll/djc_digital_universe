# CITV Dashboard — Implementation Cheatsheet

## Quick Reference

**File:** `crack-in-the-veil-stories/index.html` (single self-contained file)
**Stack:** React 18 + Recharts 2.12.7 + prop-types 15 (all via CDN)
**Local testing:** `python3 -m http.server 8080` then open `http://localhost:8080`

---

## File Structure (inside `<script>`)

```
Lines  1–24    HTML shell, CDN imports, CSS
Lines  28–40   CDN load guard (error diagnostic)
Lines  42–50   Color constants (C object)
Lines  52–340  Canonical data arrays
Lines  342–360 Derived calculations + Recharts destructure
Lines  362–492 Shared UI components (Bar, Chip, SectionLabel, ProbCard)
Lines  494–697 Tab0: SUFFER INDEX
Lines  699–812 Tab1: N8K7 PHASES
Lines  814–1030 Tab2: N8K7 BIO DATA
Lines  1032–1258 Tab3: NEURAL CASCADE
Lines  1260–1342 Tab4: PARAM AUDIT
Lines  1344–1382 Tab5: PROB CHAIN
Lines  1384–1520 Tab6: EARTH PROX
Lines  1522–1815 Tab7: ISOVOX COMP
Lines  1817–1867 Tab8: FIELD LOG
Lines  1869–2017 Main app (QSRIRecovered) — header, tabs, CRT effect
```

---

## Color Palette

| Name     | Hex       | Usage                                    |
|----------|-----------|------------------------------------------|
| `C.bg`   | `#05080f` | Main background                          |
| `C.bg2`  | `#090d18` | Card/section backgrounds                 |
| `C.bg3`  | `#0e1420` | Alternate card backgrounds               |
| `C.border`| `#182030`| Borders, grid lines, separators          |
| `C.teal` | `#00c9b1` | Primary accent, success, active tab      |
| `C.red`  | `#ff2d4b` | Critical data, warnings, MANIPULATED     |
| `C.amber`| `#f5a623` | Warnings, Phase 2, TRUE BASELINE         |
| `C.cyan` | `#67e8f9` | Formulas, code, TRUE VALUE column        |
| `C.purple`| `#a78bfa`| Identity, IsoVox, Phase 3 orange nearby  |
| `C.ghost`| `#2e3f52` | Very dim elements, progress bar tracks   |
| `C.text` | `#b0c4d8` | Main body text                           |
| `C.dim`  | `#415464` | Labels, section headers, secondary text  |
| `C.green`| `#22c55e` | Neurogenesis line in bio chart            |

---

## Shared Components

### Bar (progress bar)
```jsx
<Bar val={60} max={100} col={C.teal} h={7} />
```
- `val` — current value
- `max` — maximum value (default: 100)
- `col` — color string
- `h` — height in px (default: 7)

### Chip (badge/tag)
```jsx
<Chip label="CRITICAL" col={C.red} />
```
- `label` — text to display
- `col` — color (used for text, border tint, bg tint)

### SectionLabel (section header)
```jsx
<SectionLabel>SOME HEADING TEXT</SectionLabel>
```
- Renders: `▸ SOME HEADING TEXT` in dim monospace, 9px, letter-spacing 3

### ProbCard (probability display)
```jsx
<ProbCard
  label="FILED MODEL (v2.1)"
  tag="MANIPULATED"
  prob={0.9998}
  col={C.red}
  formula="P(≥1 hit) = 99.98%"
  note="Explanatory text here."
/>
```
- `prob` — decimal probability (0–1), displayed as percentage
- `formula` — monospace formula string
- Shows: label, big percentage, tag chip, formula box, progress bar, note

---

## Tab-by-Tab Guide

### Tab 0: SUFFER INDEX
**What it shows:** QSRI model overview, suffer index trajectory, species comparison

**Key elements:**
- **Stat cards** — 4-column grid, each card has `.l` (label), `.v` (value), `.col` (color)
- **Trajectory** — 3-value display (54.2 → 8.7 → 1.2) with arrows
- **Species chart** — Recharts horizontal `BarChart` with `speciesSuffer` data
  - Uses `<RBar>` (Recharts Bar, renamed to avoid conflict with our Bar)
  - `<ReferenceLine x={54.2}>` draws the human baseline dashed line
- **Plant discovery callout** — amber-bordered box

**To modify stat cards:**
Find the array `[{l:"TRAINING EPOCHS",v:"847",col:C.teal}, ...]` and edit values.

**To modify the species chart data:**
Edit the `speciesSuffer` array near the top of the file:
```js
const speciesSuffer = [
  {species:"Plants (cut/harvested)", score:94, note:"..."},
  // ... add/remove/edit entries here
];
```

---

### Tab 1: N8K7 PHASES
**What it shows:** 4 deployment phases with metric bars

**Key elements:**
- **Phase cards** — mapped from `phases` array, each has colored left border
- **Metric grid** — 4 columns: Suffer Index (max 60), Memory %, Identity %, Reality %
- **Catastrophe note** — red callout about Phase 3 outcomes

**To modify phase data:**
Edit the `phases` array:
```js
const phases = [
  {name:"Phase 1 · Miracle", yr:"2037–2042", suffer:8.7, mem:2, id:1, real:0, col:C.teal},
  // ...
];
```

**To change the catastrophe note text:**
Search for `"Phase 3 data showed"` and edit the surrounding text.

---

### Tab 2: N8K7 BIO DATA
**What it shows:** Multi-line chart of biological decline + annotations

**Key elements:**
- **LineChart** — 7 lines from `bioTimeline` data, height 280px
  - Lines: pain (teal), empathy (purple), memory (cyan), identity (amber), cortisol (ghost dashed), repro (red thick), neurogen (green dashed)
  - `<ReferenceLine y={50}>` draws midline
- **Legend** — manual flex row of colored indicators
- **Annotation cards** — 2-column grid, shows every other year
- **Fertility callout** — red box about HPG axis

**To add a new bio metric line:**
1. Add the data key to each entry in `bioTimeline`:
   ```js
   {yr:"2038", pain:92, empathy:95, ..., newMetric:85, note:"..."},
   ```
2. Add a `<Line>` component in Tab2:
   ```jsx
   React.createElement(Line, {type:"monotone", dataKey:"newMetric", stroke:"#colorHex", strokeWidth:2, dot:false, name:"Metric Name"})
   ```
3. Add to the legend array:
   ```js
   {l:"Metric Name", col:"#colorHex"}
   ```

**To modify year annotations:**
Edit the `note` field in `bioTimeline` entries. Only every-other-year entries show (filtered by `i % 2 === 0`).

---

### Tab 3: NEURAL CASCADE
**What it shows:** Brain region suppression bar chart + cascade logic

**Key elements:**
- **Grouped BarChart** — `receptorData`, two bars per region (baseline=teal translucent, post-N8K7=red)
  - Custom tooltip shows region description on hover
  - Uses `<RBar>` component
- **Cascade logic cards** — 5 numbered explanation cards (01–05)
- **Masochist emergence note** — purple callout

**To modify receptor data:**
Edit the `receptorData` array:
```js
const receptorData = [
  {region:"Nociceptors\n(Pain Signal)", y1:100, y2:8, desc:"Description..."},
  // \n creates line break in axis label
];
```

**To add/edit cascade logic cards:**
Find the array starting with `{n:"01", title:"Nociceptor Suppression"...}` in Tab3 and modify entries. Each card has:
- `n` — card number (string, e.g. "01")
- `title` — heading text
- `col` — left border + title color
- `body` — paragraph text

---

### Tab 4: PARAM AUDIT
**What it shows:** Parameter comparison table (filed vs recovered)

**Key elements:**
- **Comparison table** — 7 rows from `params`, columns: PARAMETER, FILED, TRUE VALUE, DELTA, FLAG
- Critical rows get red left border + bold + CRITICAL chip
- **Finding callout** — red box about stellar_age_penalty

**To modify parameter data:**
Edit the `params` array:
```js
const params = [
  {n:"prior_sector_isovox", f:"0.87", t:"0.23", d:"+278%", c:true},
  // n=name, f=filed value, t=true value, d=delta, c=critical boolean
];
```

---

### Tab 5: PROB CHAIN
**What it shows:** Three probability calculations with visual bars

**Key elements:**
- **3 ProbCard components** using the shared ProbCard
- Values are computed dynamically: `filed`, `honest`, `withProx` (derived from planet data)
- **Independence note** — dim box about correlated models

**To change probability formulas:**
The displayed percentage is COMPUTED from planet data. To change the percentage:
- Modify `planets` array `rep` values (affects filed model)
- Modify `planets` array `tp` values (affects honest model)
- Modify `px` function or planet `dist` values (affects proximity model)

To change formula TEXT (cosmetic), edit the `formula` prop strings in Tab5.

---

### Tab 6: EARTH PROX
**What it shows:** The omitted variable + planet score table + smoking gun

**Key elements:**
- **Formula box** — purple, shows `e^(−d/400)` definition
- **Planet table** — 6 Kesslar planets + Earth appended
  - Earth row: green background, teal text, ORIGIN CANDIDATE chip
  - Kesslar rows: red adjusted P, NULL chip
  - Values computed inline: `px(p.dist)` and `p.tp * px(p.dist)`
- **Smoking gun box** — red border, concluding statement

**To add a new planet:**
Add to the `planets` array:
```js
{name:"Kesslar-15", dist:1500, rep:0.65, tp:0.08},
```
It will automatically appear in the table AND affect probability calculations.

---

### Tab 7: ISOVOX COMP
**What it shows:** Material spec, chemical formula, frequency waveform, properties

**Key elements:**
- **Material spec grid** — 2x2, each card: label, value, abbreviation, color
- **Chemical formula** — large `C₉H₂₀Si₆N₄O₇` with element cards (5-column)
- **Frequency cascade** — Recharts LineChart, 4 sine waves (f1, f2, f3, finf)
  - Data from `freqData` (60 generated points)
  - Height 160px, no axis labels
- **Properties cards** — 4 cards with body text

**To modify the chemical formula display:**
Find `"C", React.createElement("sub", null, "9")` pattern and edit numbers.

**To change element cards:**
Find the array `[{el:"C",n:9,name:"Carbon",col:C.text}, ...]` and edit.

**To modify frequency waveform:**
Edit the `freqData` generator:
```js
const freqData = Array.from({length:60},(_,i)=>({
  t: i,
  f1: Math.sin(i*0.3)*50+50,    // fundamental - change frequency/amplitude
  f2: Math.sin(i*0.6+1)*40+50,  // harmonic
  f3: Math.sin(i*1.2+2)*30+50,  // subharmonic
  finf: Math.sin(i*2.4+3)*20+50, // resonance lock
}));
```

**To modify property cards:**
Find the array starting with `{label:"SELF-REPAIR",col:C.teal,body:"..."}` and edit.

---

### Tab 8: FIELD LOG
**What it shows:** Cal McLaren's encrypted journal entry

**Key elements:**
- Pure text content — no charts or data tables
- **Header** — monospace dim metadata (NAI fragment, Day 2847, Kesslar-12)
- **Journal paragraphs** — styled prose with color highlights:
  - `C.teal` — "CC here."
  - `C.amber` — Ava's pause timing, closing wisdom
  - `C.red` — "where we came from"
- **Footer** — border-top separator, Ava access log, M. MIRRO in red

**To edit Cal's journal text:**
Search for `"CC here."` in the file and edit the surrounding `React.createElement("p", ...)` blocks. Each paragraph is a separate `<p>` element.

**To add a new paragraph:**
Insert a new `React.createElement("p", null, "Your text here")` in the Tab8 function between existing paragraphs.

**To add colored text within a paragraph:**
```js
React.createElement("p", null,
  "Regular text ",
  React.createElement("span", {style:{color:C.red}}, "red highlighted text"),
  " more regular text."
)
```

---

## Styling Patterns

### Card/Box styles
```js
// Standard card
{background:C.bg2, border:`1px solid ${C.border}`, borderRadius:4, padding:"11px 13px"}

// Critical/warning box
{background:"#100006", border:`1px solid ${C.red}44`, borderRadius:4, padding:12}

// Purple accent box (IsoVox, formulas)
{background:"#0a0812", border:`1px solid ${C.purple}44`, borderRadius:4, padding:13}

// Amber callout
{background:"#0a0600", border:`1px solid ${C.amber}33`, borderRadius:4, padding:11}
```

### Color-coded left border
```js
{borderLeft:`3px solid ${someColor}`}
```

### Text styles
```js
// Section label (dim, tiny, spaced)
{fontSize:9, letterSpacing:3, color:C.dim, fontFamily:"monospace"}

// Big number
{fontSize:22, fontWeight:700, color:C.teal, fontFamily:"monospace"}

// Body text
{fontSize:11, color:C.text, lineHeight:1.7}

// Monospace code/formula
{fontSize:11, color:C.cyan, fontFamily:"monospace"}
```

---

## Recharts Patterns

### Horizontal Bar Chart (species comparison)
```jsx
<BarChart data={dataArray} layout="vertical" margin={{top:0,right:20,bottom:0,left:140}}>
  <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
  <XAxis type="number" domain={[0,100]} tick={{fill:C.dim,fontSize:9}}/>
  <YAxis type="category" dataKey="species" tick={{fill:C.text,fontSize:9}}/>
  <Tooltip contentStyle={tooltipStyle}/>
  <RBar dataKey="score" fill={C.teal} radius={[0,2,2,0]}/>
  <ReferenceLine x={54.2} stroke={C.amber} strokeDasharray="4 2"/>
</BarChart>
```

### Multi-Line Chart (bio timeline)
```jsx
<LineChart data={bioTimeline} margin={{top:5,right:20,bottom:5,left:0}}>
  <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
  <XAxis dataKey="yr" tick={{fill:C.dim,fontSize:9}}/>
  <YAxis domain={[0,100]} tick={{fill:C.dim,fontSize:9}}/>
  <Tooltip contentStyle={tooltipStyle}/>
  <Line type="monotone" dataKey="pain" stroke={C.teal} strokeWidth={2} dot={false}/>
  <!-- add more <Line> for each metric -->
</LineChart>
```

### Grouped Bar Chart (receptor comparison)
```jsx
<BarChart data={receptorData} margin={{top:5,right:20,bottom:40,left:10}}>
  <RBar dataKey="y1" fill={C.teal} opacity={0.3}/>  <!-- baseline -->
  <RBar dataKey="y2" fill={C.red}/>                  <!-- post-N8K7 -->
</BarChart>
```

### Important: Bar naming
- `Bar` = our custom progress bar component
- `RBar` = Recharts Bar component (renamed to avoid conflict)
- Always use `RBar` inside Recharts charts, `Bar` for inline progress bars

---

## Adding a New Tab

1. **Create the tab component function:**
   ```js
   function Tab9() {
     return React.createElement("div", null,
       React.createElement(SectionLabel, null, "YOUR TAB TITLE"),
       // ... your content
     );
   }
   ```

2. **Add tab name to TABS array** (around line 1870):
   ```js
   const TABS = [...existing tabs..., "NEW TAB"];
   ```

3. **Add conditional render** in the content area (around line 2011):
   ```js
   tab === 9 && React.createElement(Tab9, null)
   ```

---

## CRT Effect

The scanline effect is in the main `QSRIRecovered` component:
- **Repeating gradient** — fixed full-screen, 3px transparent + 1px dark stripe
- **Moving scan line** — horizontal bar at `top: (tick * 1.6) % 800`, teal at 4% opacity
- **Flicker character** — `▓` every 53 ticks, `░` every 37 ticks, shown in header

To adjust scan speed: change `1.6` multiplier or `70`ms interval.
To disable CRT: remove the two fixed-position `div`s at the start of QSRIRecovered's return.

---

## Deployment

### Local testing
```bash
cd crack-in-the-veil-stories
python3 -m http.server 8080
# Open http://localhost:8080
```

### Deploy to dennisjcarroll.com
Copy `index.html` to your site's `/stories/` directory. That's it.

### As an iframe
```html
<iframe src="/stories/index.html" style="width:100vw;height:100vh;border:none;"></iframe>
```

---

## Common Edits

| Task | Where to look |
|------|--------------|
| Change a data value | Edit the relevant array (`planets`, `params`, `phases`, `bioTimeline`, etc.) near the top |
| Change text content | Search for a unique phrase, edit the string |
| Change a color | Edit the `C` object at the top, or individual `style` objects |
| Add colored text | `React.createElement("span", {style:{color:C.red}}, "text")` |
| Add a new section | Use `React.createElement(SectionLabel, null, "TITLE")` then add content |
| Modify chart data | Edit the data array the chart references |
| Add a chart line | Add new `React.createElement(Line, {...})` in the chart + legend entry |
| Change chart height | Find `height: 280` (or similar) in the tab and change the number |
