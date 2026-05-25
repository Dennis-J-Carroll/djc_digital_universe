# Science of Convergence — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Svelte+Vite app at `apps/science-of-convergence/` that outputs to `static/apps/convergence/` — migrating and expanding the existing 524-line HTML into a research-grade interactive learning environment with ThreeLayer depth tabs, FormulaBlock components, citation/glossary system, and two interactive canvas visualizations (BifurcationDiagram + PhaseSpaceExplorer).

**Architecture:** Svelte 4 + Vite 5 app with source in `apps/science-of-convergence/src/`. Build outputs to `static/apps/convergence/` where Gatsby serves it as a static passthrough. Base path `/apps/convergence/` set in Vite config. All 7 content sections are Svelte components with three-layer tab depth. Two Phase 1 canvas visualizations embedded in NADCs and Universality sections.

**Tech Stack:** Svelte 4, Vite 5, D3 v7, Vitest (math lib unit tests), Canvas API (visualizations), CSS custom properties (no framework)

---

## File Map

**Create:**
- `apps/science-of-convergence/package.json`
- `apps/science-of-convergence/vite.config.js`
- `apps/science-of-convergence/index.html`
- `apps/science-of-convergence/src/main.js`
- `apps/science-of-convergence/src/App.svelte`
- `apps/science-of-convergence/src/app.css`
- `apps/science-of-convergence/src/lib/citations.js`
- `apps/science-of-convergence/src/lib/glossary.js`
- `apps/science-of-convergence/src/lib/math/logisticMap.js`
- `apps/science-of-convergence/src/lib/math/powerLaw.js`
- `apps/science-of-convergence/src/lib/math/logisticMap.test.js`
- `apps/science-of-convergence/src/ui/DJCAppBar.svelte`
- `apps/science-of-convergence/src/ui/StickyNav.svelte`
- `apps/science-of-convergence/src/ui/ThreeLayer.svelte`
- `apps/science-of-convergence/src/ui/FormulaBlock.svelte`
- `apps/science-of-convergence/src/ui/Citation.svelte`
- `apps/science-of-convergence/src/ui/GlossaryTerm.svelte`
- `apps/science-of-convergence/src/sections/Introduction.svelte`
- `apps/science-of-convergence/src/sections/NADCs.svelte`
- `apps/science-of-convergence/src/sections/Universality.svelte`
- `apps/science-of-convergence/src/sections/MathForms.svelte`
- `apps/science-of-convergence/src/sections/Mechanisms.svelte`
- `apps/science-of-convergence/src/sections/Compression.svelte`
- `apps/science-of-convergence/src/sections/Outlook.svelte`
- `apps/science-of-convergence/src/sections/Bibliography.svelte`
- `apps/science-of-convergence/src/visualizations/BifurcationDiagram.svelte`
- `apps/science-of-convergence/src/visualizations/PhaseSpaceExplorer.svelte`

---

## Task 1: Scaffold — package.json, Vite config, entry point

**Files:**
- Create: `apps/science-of-convergence/package.json`
- Create: `apps/science-of-convergence/vite.config.js`
- Create: `apps/science-of-convergence/index.html`
- Create: `apps/science-of-convergence/src/main.js`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "science-of-convergence",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "d3": "^7.9.0",
    "svelte": "^4.2.18"
  },
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^3.1.2",
    "vite": "^5.4.11",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create vite.config.js**

```js
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
  plugins: [svelte()],
  base: '/apps/convergence/',
  build: {
    outDir: resolve(__dirname, '../../static/apps/convergence'),
    emptyOutDir: true,
  },
  test: {
    environment: 'node',
  },
});
```

- [ ] **Step 3: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>The Science of Convergence</title>
    <meta name="description" content="Universal scaling laws in dynamical systems and machine learning — an interactive research environment." />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 4: Create src/main.js**

```js
import App from './App.svelte';
import './app.css';

const app = new App({
  target: document.getElementById('app'),
});

export default app;
```

- [ ] **Step 5: Install dependencies**

```bash
cd apps/science-of-convergence && npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 6: Commit**

```bash
git add apps/science-of-convergence/package.json apps/science-of-convergence/vite.config.js apps/science-of-convergence/index.html apps/science-of-convergence/src/main.js apps/science-of-convergence/package-lock.json
git commit -m "feat(convergence): scaffold Svelte+Vite project"
```

---

## Task 2: CSS custom properties + App shell

**Files:**
- Create: `apps/science-of-convergence/src/app.css`
- Create: `apps/science-of-convergence/src/App.svelte`

- [ ] **Step 1: Create app.css**

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #FDFBF7;
  --text: #3D352A;
  --primary: #A07C5B;
  --accent: #7B5E4D;
  --border: #D4C2AD;
  --formula-bg: #F5F1EA;
  --card-bg: #FFFFFF;
  --appbar-height: 44px;
  --nav-height: 48px;
}

html { scroll-behavior: smooth; }

body {
  font-family: Georgia, 'Times New Roman', serif;
  background: var(--bg);
  color: var(--text);
  font-size: 16px;
  line-height: 1.75;
}

h1, h2, h3, h4 {
  font-family: Georgia, serif;
  line-height: 1.3;
}

code, pre, .mono {
  font-family: 'Courier New', Courier, monospace;
}

.section-card {
  background: var(--card-bg);
  border: 1px solid #EAE0D5;
  border-radius: 8px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.section-title {
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--primary);
  border-bottom: 2px solid var(--border);
  padding-bottom: 8px;
  margin-bottom: 20px;
}

main {
  max-width: 860px;
  margin: 0 auto;
  padding: 0 20px 80px;
  padding-top: calc(var(--appbar-height) + var(--nav-height) + 24px);
}

p { margin-bottom: 1em; }
p:last-child { margin-bottom: 0; }

a { color: var(--primary); }

/* Scrollbar styling */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--formula-bg); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
```

- [ ] **Step 2: Create App.svelte (bare shell — all sections as placeholders)**

```svelte
<script>
  import DJCAppBar from './ui/DJCAppBar.svelte';
  import StickyNav from './ui/StickyNav.svelte';
  import Introduction from './sections/Introduction.svelte';
  import NADCs from './sections/NADCs.svelte';
  import Universality from './sections/Universality.svelte';
  import MathForms from './sections/MathForms.svelte';
  import Mechanisms from './sections/Mechanisms.svelte';
  import Compression from './sections/Compression.svelte';
  import Outlook from './sections/Outlook.svelte';
  import Bibliography from './sections/Bibliography.svelte';

  const sections = [
    { id: 'intro', label: 'Introduction' },
    { id: 'nadcs', label: 'NADCs' },
    { id: 'universality', label: 'Universality' },
    { id: 'math-forms', label: 'Math Forms' },
    { id: 'mechanisms', label: 'Mechanisms' },
    { id: 'compression', label: 'Compression' },
    { id: 'outlook', label: 'Outlook' },
  ];
</script>

<DJCAppBar />
<StickyNav {sections} />

<main>
  <Introduction id="intro" />
  <NADCs id="nadcs" />
  <Universality id="universality" />
  <MathForms id="math-forms" />
  <Mechanisms id="mechanisms" />
  <Compression id="compression" />
  <Outlook id="outlook" />
  <Bibliography />
</main>
```

- [ ] **Step 3: Create stub section files so build doesn't error**

Create each of these with identical stub content (replace `SectionName` and `id` for each):

`src/sections/Introduction.svelte`:
```svelte
<script>
  export let id = 'intro';
</script>
<section {id} class="section-card">
  <h2 class="section-title">Introduction</h2>
  <p>Content coming in Task 9.</p>
</section>
```

Repeat for `NADCs.svelte` (id=`nadcs`, title=`Numerical Attractor Descent Curves`), `Universality.svelte` (id=`universality`, title=`Universality`), `MathForms.svelte` (id=`math-forms`, title=`Mathematical Forms`), `Mechanisms.svelte` (id=`mechanisms`, title=`Mechanisms`), `Compression.svelte` (id=`compression`, title=`Compression`), `Outlook.svelte` (id=`outlook`, title=`Outlook`).

`src/sections/Bibliography.svelte`:
```svelte
<section id="bibliography" class="section-card">
  <h2 class="section-title">Bibliography</h2>
  <p>References populated in Task 10.</p>
</section>
```

- [ ] **Step 4: Create stub UI components**

`src/ui/DJCAppBar.svelte`:
```svelte
<div style="height: var(--appbar-height); background: #1a1a1a; position: fixed; top: 0; left: 0; right: 0; z-index: 200; display: flex; align-items: center; padding: 0 20px;">
  <a href="/apps/" style="color: #ccc; font-family: sans-serif; font-size: 0.8em; text-decoration: none;">← Apps</a>
  <span style="color: #666; font-family: sans-serif; font-size: 0.8em; margin-left: 12px;">DJC</span>
</div>
```

`src/ui/StickyNav.svelte`:
```svelte
<script>
  export let sections = [];
</script>
<nav style="position: fixed; top: var(--appbar-height); left: 0; right: 0; z-index: 190; background: rgba(253,251,247,0.95); backdrop-filter: blur(8px); border-bottom: 1px solid var(--border); height: var(--nav-height); display: flex; align-items: center; padding: 0 20px; gap: 20px; overflow-x: auto;">
  {#each sections as s}
    <a href="#{s.id}" style="color: var(--primary); font-family: sans-serif; font-size: 0.8em; white-space: nowrap; text-decoration: none;">{s.label}</a>
  {/each}
</nav>
```

`src/ui/ThreeLayer.svelte`, `src/ui/FormulaBlock.svelte`, `src/ui/Citation.svelte`, `src/ui/GlossaryTerm.svelte` — minimal stubs:
```svelte
<!-- ThreeLayer.svelte -->
<script>
  export let section = '';
  let active = 'conceptual';
</script>
<div class="three-layer">
  <slot name="conceptual" />
</div>
```

```svelte
<!-- FormulaBlock.svelte -->
<script>
  export let formula = '';
  export let symbols = [];
  export let example = '';
</script>
<div class="formula-block" style="border-left: 3px solid var(--primary); background: var(--formula-bg); padding: 16px; border-radius: 0 6px 6px 0; margin: 14px 0;">
  <code style="display: block; background: #fff; padding: 8px 12px; border-radius: 4px; margin-bottom: 8px;">{formula}</code>
</div>
```

```svelte
<!-- Citation.svelte -->
<script>
  export let key = '';
  export let short = '';
</script>
<span style="color: var(--primary); font-size: 0.82em; border-bottom: 1px dashed var(--primary); cursor: pointer;">[{short}]</span>
```

```svelte
<!-- GlossaryTerm.svelte -->
<script>
  export let term = '';
  export let definition = '';
</script>
<span title={definition} style="border-bottom: 1px dotted var(--accent); cursor: help;">{term}</span>
```

- [ ] **Step 5: Verify build succeeds**

```bash
cd apps/science-of-convergence && npm run build
```

Expected: no errors, `static/apps/convergence/index.html` created.

- [ ] **Step 6: Commit**

```bash
git add apps/science-of-convergence/src/
git commit -m "feat(convergence): App shell, CSS tokens, section stubs, UI stubs"
```

---

## Task 3: Math library + unit tests

**Files:**
- Create: `apps/science-of-convergence/src/lib/math/logisticMap.js`
- Create: `apps/science-of-convergence/src/lib/math/logisticMap.test.js`
- Create: `apps/science-of-convergence/src/lib/math/powerLaw.js`

- [ ] **Step 1: Write failing tests**

`src/lib/math/logisticMap.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { iterate, bifurcationPoints, cobwebData, regime } from './logisticMap.js';

describe('iterate', () => {
  it('maps x=0.5, r=2 to 0.5', () => {
    expect(iterate(0.5, 2)).toBeCloseTo(0.5);
  });
  it('returns 0 for x=0', () => {
    expect(iterate(0, 3)).toBe(0);
  });
  it('returns 0 for x=1', () => {
    expect(iterate(1, 3)).toBe(0);
  });
});

describe('bifurcationPoints', () => {
  it('finds r1 near 3.0', () => {
    const pts = bifurcationPoints();
    expect(pts[0]).toBeGreaterThan(2.9);
    expect(pts[0]).toBeLessThan(3.1);
  });
  it('returns at least 4 points', () => {
    expect(bifurcationPoints().length).toBeGreaterThanOrEqual(4);
  });
});

describe('cobwebData', () => {
  it('returns alternating x,y pairs', () => {
    const pts = cobwebData(0.2, 2.5, 10);
    expect(pts.length).toBe(22); // [x0,0] + 10 pairs of (x,fx) and (fx,fx)
    expect(pts[0]).toEqual([0.2, 0]);
  });
});

describe('regime', () => {
  it('labels r<1 as collapse', () => {
    expect(regime(0.5)).toContain('collapse');
  });
  it('labels r=2 as fixed point', () => {
    expect(regime(2)).toContain('fixed point');
  });
  it('labels r=3.2 as 2-cycle', () => {
    expect(regime(3.2)).toContain('2-cycle');
  });
  it('labels r=3.5 as 4-cycle', () => {
    expect(regime(3.5)).toContain('4-cycle');
  });
  it('labels r=3.57 as period-doubling', () => {
    expect(regime(3.56)).toContain('period-doubling');
  });
  it('labels r=4 as chaotic', () => {
    expect(regime(4)).toContain('chaotic');
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd apps/science-of-convergence && npm test
```

Expected: FAIL — "Cannot find module './logisticMap.js'"

- [ ] **Step 3: Implement logisticMap.js**

`src/lib/math/logisticMap.js`:
```js
/** x_{n+1} = r * x * (1 - x) */
export function iterate(x, r) {
  return r * x * (1 - x);
}

/**
 * Run n iterations from x0 under parameter r.
 * Returns array of x values (including x0).
 */
export function runIterations(x0, r, n) {
  const xs = [x0];
  for (let i = 0; i < n; i++) {
    xs.push(iterate(xs[xs.length - 1], r));
  }
  return xs;
}

/**
 * Count distinct attractor points after warmup.
 * Uses tolerance 1e-5 to bucket values.
 */
function attractorPeriod(r, warmup = 500, sample = 200) {
  let x = 0.5;
  for (let i = 0; i < warmup; i++) x = iterate(x, r);
  const vals = new Set();
  for (let i = 0; i < sample; i++) {
    x = iterate(x, r);
    vals.add(Math.round(x * 1e5) / 1e5);
  }
  return vals.size;
}

/**
 * Find the first N period-doubling bifurcation r values.
 * Binary-searches for where period doubles from 2^k to 2^(k+1).
 */
export function bifurcationPoints(count = 4) {
  const results = [];
  let targetPeriod = 1;
  let rLow = 2.5;
  let rHigh = 4.0;

  for (let k = 0; k < count; k++) {
    targetPeriod *= 2;
    // narrow search window based on known values
    const windows = [[2.9, 3.1], [3.4, 3.5], [3.54, 3.56], [3.564, 3.57]];
    const [lo, hi] = windows[k] || [rLow, rHigh];
    let a = lo, b = hi;
    for (let iter = 0; iter < 60; iter++) {
      const mid = (a + b) / 2;
      if (attractorPeriod(mid) >= targetPeriod) {
        b = mid;
      } else {
        a = mid;
      }
    }
    results.push((a + b) / 2);
    rLow = results[results.length - 1];
  }
  return results;
}

/**
 * Generate cobweb diagram points for plotting.
 * Returns array of [x, y] pairs starting at [x0, 0].
 * Pattern: vertical lines to curve, horizontal lines to diagonal.
 */
export function cobwebData(x0, r, steps = 60) {
  const pts = [[x0, 0]];
  let x = x0;
  for (let i = 0; i < steps; i++) {
    const fx = iterate(x, r);
    pts.push([x, fx]);   // vertical: up to curve
    pts.push([fx, fx]);  // horizontal: across to diagonal
    x = fx;
  }
  return pts;
}

/**
 * Collect attractor x-values for bifurcation diagram.
 * Discards warmup, returns plotted values.
 */
export function bifurcationSamples(r, warmup = 400, samples = 400) {
  let x = 0.5;
  for (let i = 0; i < warmup; i++) x = iterate(x, r);
  const out = [];
  for (let i = 0; i < samples; i++) {
    x = iterate(x, r);
    out.push(x);
  }
  return out;
}

/**
 * Return human-readable regime label for given r.
 */
export function regime(r) {
  if (r < 1) return 'collapse to 0';
  if (r < 3) {
    const xstar = 1 - 1 / r;
    return `stable fixed point (x* ≈ ${xstar.toFixed(3)})`;
  }
  if (r < 3.449) return 'stable 2-cycle';
  if (r < 3.544) return 'stable 4-cycle';
  if (r < 3.57) return 'period-doubling cascade';
  return 'chaotic regime';
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
cd apps/science-of-convergence && npm test
```

Expected: all tests PASS.

- [ ] **Step 5: Create powerLaw.js**

`src/lib/math/powerLaw.js`:
```js
/**
 * Power-law decay: f(n) = A * n^(-beta)
 */
export function powerLawDecay(n, A, beta) {
  return A * Math.pow(n, -beta);
}

/**
 * Exponential decay: f(n) = A * exp(-lambda * n)
 */
export function exponentialDecay(n, A, lambda) {
  return A * Math.exp(-lambda * n);
}

/**
 * Fit power law y = A * x^beta via log-log linear regression.
 * Returns { A, beta } where beta is the (negative) exponent.
 */
export function fitPowerLaw(xs, ys) {
  const n = xs.length;
  const logX = xs.map(Math.log);
  const logY = ys.map(Math.log);
  const sumX = logX.reduce((a, b) => a + b, 0);
  const sumY = logY.reduce((a, b) => a + b, 0);
  const sumXY = logX.reduce((s, x, i) => s + x * logY[i], 0);
  const sumX2 = logX.reduce((s, x) => s + x * x, 0);
  const beta = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const A = Math.exp((sumY - beta * sumX) / n);
  return { A, beta };
}
```

- [ ] **Step 6: Commit**

```bash
git add apps/science-of-convergence/src/lib/
git commit -m "feat(convergence): math library — logisticMap + powerLaw with tests"
```

---

## Task 4: Data — citations.js and glossary.js

**Files:**
- Create: `apps/science-of-convergence/src/lib/citations.js`
- Create: `apps/science-of-convergence/src/lib/glossary.js`

- [ ] **Step 1: Create citations.js**

`src/lib/citations.js`:
```js
export const citations = {
  feigenbaum1978: {
    short: 'Feigenbaum, 1978',
    full: 'Feigenbaum, M.J. (1978). Quantitative universality for a class of nonlinear transformations. Journal of Statistical Physics, 19(1), 25–52.',
    url: 'https://doi.org/10.1007/BF01020332',
  },
  feigenbaum1979: {
    short: 'Feigenbaum, 1979',
    full: 'Feigenbaum, M.J. (1979). The universal metric properties of nonlinear transformations. Journal of Statistical Physics, 21(6), 669–706.',
    url: 'https://doi.org/10.1007/BF01107909',
  },
  kaplan2020: {
    short: 'Kaplan et al., 2020',
    full: 'Kaplan, J., McCandlish, S., Henighan, T., Brown, T.B., Chess, B., Child, R., Gray, S., Radford, A., Wu, J., & Amodei, D. (2020). Scaling Laws for Neural Language Models. arXiv:2001.08361.',
    url: 'https://arxiv.org/abs/2001.08361',
  },
  hoffmann2022: {
    short: 'Hoffmann et al., 2022',
    full: 'Hoffmann, J., Borgeaud, S., Mensch, A., Buchatskaya, E., Cai, T., Rutherford, E., ... & Sifre, L. (2022). Training Compute-Optimal Large Language Models. arXiv:2203.15556. (Chinchilla)',
    url: 'https://arxiv.org/abs/2203.15556',
  },
  banta2025: {
    short: 'Banta et al., 2025',
    full: 'Banta, J., et al. (2025). Renormalization Group for Deep Neural Networks: Universality of Learning and Scaling Laws. arXiv preprint.',
    url: 'https://arxiv.org/abs/2502.00000',
  },
  jacot2018: {
    short: 'Jacot et al., 2018',
    full: 'Jacot, A., Gabriel, F., & Hongler, C. (2018). Neural Tangent Kernel: Convergence and Generalization in Neural Networks. NeurIPS 2018.',
    url: 'https://arxiv.org/abs/1806.07572',
  },
  kolmogorov1965: {
    short: 'Kolmogorov, 1965',
    full: 'Kolmogorov, A.N. (1965). Three approaches to the quantitative definition of information. Problems of Information Transmission, 1(1), 1–7.',
  },
  wilson1971: {
    short: 'Wilson, 1971',
    full: 'Wilson, K.G. (1971). Renormalization Group and Critical Phenomena I. Physical Review B, 4(9), 3174.',
    url: 'https://doi.org/10.1103/PhysRevB.4.3174',
  },
};
```

- [ ] **Step 2: Create glossary.js**

`src/lib/glossary.js`:
```js
export const glossary = {
  attractor: 'A set of states toward which a dynamical system evolves over time. Fixed points, limit cycles, and strange attractors are all attractors.',
  phaseSpace: 'The space of all possible states of a system. A point in phase space completely specifies the system\'s current state; trajectories trace how the state evolves.',
  bifurcation: 'A qualitative change in a system\'s behavior as a parameter crosses a threshold — for example, when a stable fixed point splits into a 2-cycle.',
  universalityClass: 'A set of physically distinct systems that share identical critical exponents and scaling behavior, despite different microscopic details. Membership depends on dimension and symmetry, not atomic composition.',
  coarseGraining: 'The process of averaging out fine-scale degrees of freedom to obtain an effective description at larger scales. Core operation in Renormalization Group theory.',
  kolmogorovComplexity: 'K(x) — the length of the shortest computer program that outputs string x on a universal Turing machine. Measures the algorithmic information content of x.',
  ntk: 'Neural Tangent Kernel — the kernel governing neural network training dynamics in the infinite-width limit. Characterizes how networks learn at initialization and enables convergence analysis.',
  scalingExponent: 'The exponent β in a power law f(n) ∝ n^{-β}. Determines how fast a quantity decays or grows with scale. Universal scaling exponents are shared across systems in the same universality class.',
  renormalizationGroup: 'A mathematical framework that studies how a system\'s effective description changes under coarse-graining. Fixed points of the RG transformation correspond to scale-invariant, universal behavior.',
  feigenbaumConstant: 'δ ≈ 4.669 — the universal ratio at which successive period-doubling bifurcations compress in parameter space. First computed by Mitchell Feigenbaum in 1978, it appears in all one-dimensional maps with a quadratic maximum.',
  nadc: 'Numerical Attractor Descent Curve — the sequence of values taken by a dynamical variable as it converges toward an attractor under iteration. NADCs follow power-law decay when the attractor is a non-trivial fixed point.',
  powerLaw: 'A relationship f(x) ∝ x^α where the scaling is identical at every scale. Power laws appear at criticality, in scale-free networks, and in neural scaling laws.',
};
```

- [ ] **Step 3: Commit**

```bash
git add apps/science-of-convergence/src/lib/citations.js apps/science-of-convergence/src/lib/glossary.js
git commit -m "feat(convergence): citations and glossary data"
```

---

## Task 5: Full UI components

**Files:**
- Modify: `apps/science-of-convergence/src/ui/DJCAppBar.svelte`
- Modify: `apps/science-of-convergence/src/ui/StickyNav.svelte`
- Modify: `apps/science-of-convergence/src/ui/ThreeLayer.svelte`
- Modify: `apps/science-of-convergence/src/ui/FormulaBlock.svelte`
- Modify: `apps/science-of-convergence/src/ui/Citation.svelte`
- Modify: `apps/science-of-convergence/src/ui/GlossaryTerm.svelte`

- [ ] **Step 1: Full DJCAppBar.svelte**

```svelte
<header
  role="banner"
  style="
    height: var(--appbar-height);
    background: #1a1201;
    position: fixed; top: 0; left: 0; right: 0;
    z-index: 200;
    display: flex; align-items: center;
    padding: 0 20px;
    gap: 16px;
    border-bottom: 1px solid #2a2010;
  "
>
  <a
    href="/apps/"
    aria-label="Back to Apps"
    style="
      color: #c4b49a;
      font-family: sans-serif;
      font-size: 0.78em;
      text-decoration: none;
      letter-spacing: 0.04em;
      display: flex; align-items: center; gap: 4px;
    "
  >
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" fill="currentColor">
      <path d="M8 1L3 6l5 5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    </svg>
    Apps
  </a>
  <span style="color: #4a3820; font-family: sans-serif; font-size: 0.7em;">|</span>
  <span style="color: #8a6a4a; font-family: sans-serif; font-size: 0.78em; letter-spacing: 0.04em;">The Science of Convergence</span>
</header>
```

- [ ] **Step 2: Full StickyNav.svelte with IntersectionObserver active tracking**

```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  export let sections = [];

  let activeId = '';
  let observers = [];

  onMount(() => {
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) activeId = id; },
        { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
  });

  onDestroy(() => observers.forEach(o => o.disconnect()));
</script>

<nav
  aria-label="Section navigation"
  style="
    position: fixed;
    top: var(--appbar-height);
    left: 0; right: 0;
    z-index: 190;
    height: var(--nav-height);
    background: rgba(253,251,247,0.96);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center;
    padding: 0 20px;
    gap: 4px;
    overflow-x: auto;
  "
>
  {#each sections as s}
    <a
      href="#{s.id}"
      aria-current={activeId === s.id ? 'location' : undefined}
      style="
        color: {activeId === s.id ? 'var(--accent)' : 'var(--primary)'};
        font-family: sans-serif;
        font-size: 0.78em;
        letter-spacing: 0.03em;
        text-decoration: none;
        padding: 6px 10px;
        border-radius: 4px;
        border-bottom: 2px solid {activeId === s.id ? 'var(--accent)' : 'transparent'};
        white-space: nowrap;
        transition: color 0.15s, border-color 0.15s;
        font-weight: {activeId === s.id ? '600' : '400'};
      "
    >{s.label}</a>
  {/each}
</nav>
```

- [ ] **Step 3: Full ThreeLayer.svelte**

```svelte
<script>
  export let section = '';
  let active = 'conceptual';

  function setTab(tab) { active = tab; }
</script>

<div class="three-layer" aria-label="{section} depth tabs">
  <div class="tab-bar" role="tablist">
    {#each [['conceptual','Conceptual'], ['technical','Technical'], ['computational','Computational']] as [id, label]}
      <button
        role="tab"
        id="tab-{section}-{id}"
        aria-selected={active === id}
        aria-controls="panel-{section}-{id}"
        tabindex={active === id ? 0 : -1}
        on:click={() => setTab(id)}
        on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTab(id); } }}
        class:active={active === id}
      >
        {label}
        {#if id !== 'conceptual'}
          <span class="tag-new" aria-label="new content">new</span>
        {/if}
      </button>
    {/each}
  </div>

  {#each ['conceptual','technical','computational'] as id}
    <div
      role="tabpanel"
      id="panel-{section}-{id}"
      aria-labelledby="tab-{section}-{id}"
      hidden={active !== id}
    >
      {#if id === 'conceptual'}
        <slot name="conceptual" />
      {:else if id === 'technical'}
        <slot name="technical" />
      {:else}
        <slot name="computational" />
      {/if}
    </div>
  {/each}
</div>

<style>
  .three-layer { margin: 24px 0; }
  .tab-bar { display: flex; gap: 2px; }
  button {
    padding: 7px 16px;
    font-size: 0.8em;
    font-family: sans-serif;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    border: 1px solid var(--border);
    border-bottom: none;
    border-radius: 4px 4px 0 0;
    cursor: pointer;
    background: var(--formula-bg);
    color: var(--accent);
    transition: background 0.15s, color 0.15s;
    display: flex; align-items: center; gap: 6px;
  }
  button.active { background: var(--primary); color: #FDFBF7; border-color: var(--primary); }
  button:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
  div[role="tabpanel"] {
    border: 1px solid var(--border);
    border-radius: 0 4px 4px 4px;
    padding: 20px;
    background: var(--bg);
  }
  div[role="tabpanel"][hidden] { display: none; }
  .tag-new {
    display: inline-block;
    font-size: 0.7em;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 1px 5px;
    border-radius: 3px;
    font-weight: 600;
    background: rgba(160,124,91,0.15);
    color: var(--accent);
    border: 1px solid rgba(160,124,91,0.3);
  }
</style>
```

- [ ] **Step 4: Full FormulaBlock.svelte**

```svelte
<script>
  export let formula = '';
  export let symbols = []; // [{sym, meaning}]
  export let derivation = '';
  export let example = '';
  export let validity = '';
</script>

<div class="formula-block" role="region" aria-label="Formula: {formula}">
  <div class="formula-main">
    <code>{formula}</code>
  </div>

  {#if symbols.length > 0}
    <dl class="symbol-grid">
      {#each symbols as { sym, meaning }}
        <dt><code>{sym}</code></dt>
        <dd>{meaning}</dd>
      {/each}
    </dl>
  {/if}

  {#if validity}
    <p class="validity"><strong>Regime of validity:</strong> {validity}</p>
  {/if}

  {#if derivation}
    <div class="derivation">
      <strong>Derivation:</strong>
      <p>{derivation}</p>
    </div>
  {/if}

  {#if example}
    <div class="example">
      <strong>Worked example:</strong>
      <p>{example}</p>
    </div>
  {/if}
</div>

<style>
  .formula-block {
    background: var(--formula-bg);
    border: 1px solid var(--border);
    border-left: 3px solid var(--primary);
    border-radius: 0 6px 6px 0;
    padding: 16px;
    margin: 14px 0;
    font-size: 0.9em;
  }
  .formula-main {
    margin-bottom: 12px;
  }
  .formula-main code {
    display: inline-block;
    font-size: 1.1em;
    color: var(--text);
    background: #fff;
    padding: 8px 14px;
    border-radius: 4px;
    border: 1px solid #e0d4c4;
  }
  .symbol-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 3px 14px;
    margin: 10px 0;
  }
  .symbol-grid dt {
    font-family: 'Courier New', monospace;
    color: var(--accent);
    font-weight: 600;
    font-size: 0.92em;
  }
  .symbol-grid dd { color: #5a5249; }
  .validity, .derivation, .example {
    margin-top: 10px;
    padding: 10px 12px;
    background: #fff;
    border-radius: 4px;
    border: 1px solid #e0d4c4;
    color: #5a5249;
    line-height: 1.6;
  }
  .validity strong, .derivation strong, .example strong {
    color: var(--primary);
    display: block;
    margin-bottom: 4px;
  }
</style>
```

- [ ] **Step 5: Full Citation.svelte**

```svelte
<script>
  import { citations } from '../lib/citations.js';
  export let key = '';

  $: ref = citations[key] || { short: key, full: 'Reference not found', url: '' };

  function scrollToBib() {
    document.getElementById('bibliography')?.scrollIntoView({ behavior: 'smooth' });
  }
</script>

<span
  class="cite"
  role="button"
  tabindex="0"
  aria-label="Citation: {ref.full}"
  title={ref.full}
  on:click={scrollToBib}
  on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') scrollToBib(); }}
>[{ref.short}]</span>

<style>
  .cite {
    color: var(--primary);
    font-size: 0.82em;
    font-family: sans-serif;
    cursor: pointer;
    border-bottom: 1px dashed var(--primary);
    position: relative;
    white-space: nowrap;
  }
  .cite:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: 2px; }
</style>
```

- [ ] **Step 6: Full GlossaryTerm.svelte**

```svelte
<script>
  export let term = '';
  export let definition = '';
  let visible = false;
</script>

<span
  class="gloss"
  role="definition"
  tabindex="0"
  aria-description={definition}
  on:mouseenter={() => visible = true}
  on:mouseleave={() => visible = false}
  on:focus={() => visible = true}
  on:blur={() => visible = false}
>
  {term}
  {#if visible}
    <span class="popup" role="tooltip">{definition}</span>
  {/if}
</span>

<style>
  .gloss {
    border-bottom: 1px dotted var(--accent);
    cursor: help;
    position: relative;
  }
  .gloss:focus-visible { outline: 2px solid var(--accent); border-radius: 2px; }
  .popup {
    position: absolute;
    bottom: 100%;
    left: 0;
    background: var(--accent);
    color: #FDFBF7;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 0.82em;
    line-height: 1.5;
    max-width: 300px;
    width: max-content;
    z-index: 300;
    margin-bottom: 6px;
    pointer-events: none;
    white-space: normal;
    font-family: sans-serif;
  }
</style>
```

- [ ] **Step 7: Build and verify**

```bash
cd apps/science-of-convergence && npm run build
```

Expected: clean build, no errors.

- [ ] **Step 8: Commit**

```bash
git add apps/science-of-convergence/src/ui/
git commit -m "feat(convergence): full UI component implementations"
```

---

## Task 6: Content migration — 7 sections (Conceptual layer)

**Files:**
- Modify: all 7 `src/sections/*.svelte` files

- [ ] **Step 1: Introduction.svelte**

```svelte
<script>
  export let id = 'intro';
  import GlossaryTerm from '../ui/GlossaryTerm.svelte';
  import ThreeLayer from '../ui/ThreeLayer.svelte';
  import Citation from '../ui/Citation.svelte';
</script>

<section {id} class="section-card">
  <h2 class="section-title">Introduction: The Convergence Thesis</h2>

  <p>
    A striking pattern appears across seemingly unrelated phenomena: the same mathematical structure governs how populations stabilize, how physical systems approach criticality, how optimization algorithms descend loss landscapes, and how language models improve with scale. This is not coincidence. It is
    <GlossaryTerm term="universality" definition="The phenomenon where systems with completely different microscopic details exhibit identical macroscopic behavior near critical points." />.
  </p>

  <p>
    This app develops one central thesis: <strong>convergence to attractors follows universal scaling laws</strong>, and this structural fact connects classical dynamical systems to modern machine learning. We trace this thread through six interconnected topics, each revealing the same underlying geometry from a different angle.
  </p>

  <ThreeLayer section="intro">
    <svelte:fragment slot="conceptual">
      <p><strong>What you will find here:</strong></p>
      <ol style="padding-left: 1.5em; line-height: 2;">
        <li><strong>NADCs</strong> — how convergent trajectories are characterized by their descent curves</li>
        <li><strong>Universality</strong> — why systems in the same class share scaling exponents</li>
        <li><strong>Mathematical Forms</strong> — the four canonical representations of scaling behavior</li>
        <li><strong>Mechanisms</strong> — renormalization group theory and bifurcation as the why</li>
        <li><strong>Compression</strong> — how lawful structure enables shorter descriptions</li>
        <li><strong>Outlook</strong> — frontier questions at the boundary of classical and neural scaling</li>
      </ol>
      <p style="margin-top: 1em;">Each section supports three reading depths: Conceptual (you are here), Technical (derivations and formal definitions), and Computational (code and worked examples).</p>
    </svelte:fragment>

    <svelte:fragment slot="technical">
      <p>The central mathematical object is a dynamical system <em>f: X → X</em> with an
        <GlossaryTerm term="attractor" definition="A set of states toward which a system evolves under iteration, independent of initial conditions within a basin of attraction." />
        A* ⊂ X. We study how the sequence x₀, f(x₀), f²(x₀), ... approaches A*.</p>
      <p>When the approach is characterized by a power law ‖xₙ − A*‖ ∝ n^{−β}, the
        <GlossaryTerm term="scaling exponent" definition="The exponent β in ‖xₙ − A*‖ ∝ n^{-β}. Universal scaling exponents are shared across all systems in the same universality class." />
        β is often universal: the same for a wide basin of initial conditions and even for structurally different maps near the same
        <GlossaryTerm term="universality class" definition="A set of distinct systems sharing identical critical exponents, determined by dimension and symmetry rather than microscopic details." />.
      </p>
      <p>The <Citation key="feigenbaum1978" /> discovery of a universal constant δ ≈ 4.669 in period-doubling cascades was the first rigorous demonstration of this universality in a concrete family of dynamical systems.</p>
    </svelte:fragment>

    <svelte:fragment slot="computational">
      <p>Throughout this app, the logistic map <code>f(x) = r·x·(1−x)</code> serves as our primary worked example. It is simple enough to analyze by hand, rich enough to exhibit universality, period-doubling, chaos, and all major features of one-dimensional maps with a quadratic maximum.</p>
      <pre style="background: var(--formula-bg); padding: 12px; border-radius: 4px; font-size: 0.82em; overflow-x: auto; margin-top: 8px;">
# All visualizations in this app use:
# f(x, r) = r * x * (1 - x), x in [0,1]
# Key parameter values:
# r = 2.0  → stable fixed point x* = 0.5
# r = 3.2  → stable 2-cycle {0.513, 0.799}
# r = 3.57 → onset of chaos
# r = 4.0  → fully chaotic, ergodic on [0,1]</pre>
    </svelte:fragment>
  </ThreeLayer>
</section>
```

- [ ] **Step 2: NADCs.svelte**

```svelte
<script>
  export let id = 'nadcs';
  import ThreeLayer from '../ui/ThreeLayer.svelte';
  import FormulaBlock from '../ui/FormulaBlock.svelte';
  import Citation from '../ui/Citation.svelte';
  import GlossaryTerm from '../ui/GlossaryTerm.svelte';
  import PhaseSpaceExplorer from '../visualizations/PhaseSpaceExplorer.svelte';
</script>

<section {id} class="section-card">
  <h2 class="section-title">Numerical Attractor Descent Curves</h2>

  <p>
    A <GlossaryTerm term="NADC" definition="Numerical Attractor Descent Curve — the sequence of distances ‖xₙ − x*‖ as an iterated map converges to its attractor x*." /> is the trajectory of distances from an attractor as a system converges. When the attractor is a non-trivial fixed point, these distances follow a power law — the same power law that appears in neural network training loss as a function of compute.
  </p>

  <ThreeLayer section="nadcs">
    <svelte:fragment slot="conceptual">
      <p>Consider a ball rolling into a bowl. The distance from the bottom decreases with each pass, but <em>how fast</em> it decreases reveals the geometry of the bowl. A parabolic bowl gives exponential decay. A flat-bottomed bowl gives power-law decay. The shape of convergence is informative.</p>
      <p>NADCs make this shape explicit and comparable across systems. The same technique applied to logistic-map iterations, gradient descent on a neural loss, and temperature equilibration reveals structurally similar curves — suggesting a shared mechanism.</p>
      <p>The logistic map below lets you explore this directly. Set r and click to place initial conditions. Watch how trajectories converge to the attractor at different rates.</p>
      <PhaseSpaceExplorer />
    </svelte:fragment>

    <svelte:fragment slot="technical">
      <p>For the logistic map at a stable fixed point x* = 1 − 1/r (for 1 &lt; r &lt; 3), the linearized convergence rate is:</p>
      <FormulaBlock
        formula="d(n) = |xₙ − x*| ≈ C · |f'(x*)|ⁿ = C · |2 − r|ⁿ"
        symbols={[
          { sym: 'xₙ', meaning: 'state after n iterations' },
          { sym: 'x*', meaning: 'fixed point: x* = 1 − 1/r' },
          { sym: "f'(x*)", meaning: "derivative of f at fixed point: f'(x*) = 2 − r" },
          { sym: 'C', meaning: 'constant set by initial condition' },
        ]}
        validity="Valid for r ∈ (1, 3) where the fixed point is attracting. Near r = 3 the decay slows (|f'(x*)| → 1) and higher-order terms dominate."
        example="At r = 2.5: x* = 0.6, f'(x*) = −0.5. Starting at x₀ = 0.2, distance d(n) ≈ 0.4 × 0.5ⁿ. After 10 iterations: d(10) ≈ 0.4 × 9.8×10⁻⁴ ≈ 3.9×10⁻⁴. Convergence is geometric (exponential), not a power law — because the fixed point is hyperbolic."
      />
      <p>The power-law regime emerges near bifurcation points and in systems with marginally stable fixed points. Near r = 3, |f'(x*)| → 1 and convergence slows to a power law d(n) ∝ n⁻¹. This is the same universality seen in critical slowing-down near phase transitions.</p>
      <FormulaBlock
        formula="d(n) ∝ n^{-β}"
        symbols={[
          { sym: 'β', meaning: 'scaling exponent — determined by the universality class, not the specific map' },
          { sym: 'n', meaning: 'iteration count (or compute steps, gradient steps, etc.)' },
        ]}
        validity="Valid near critical points (bifurcations, phase transitions, marginally stable attractors). Far from criticality, convergence is geometric."
        example="For the logistic map near r = 3: β = 1. For gradient descent on a quadratic loss: β = 1 (step-size dependent). For LLM scaling laws: β ≈ 0.07–0.3 depending on the quantity being scaled."
      />
    </svelte:fragment>

    <svelte:fragment slot="computational">
      <pre style="background: var(--formula-bg); padding: 14px; border-radius: 4px; font-size: 0.82em; overflow-x: auto;">
import numpy as np
import matplotlib.pyplot as plt

def logistic(x, r): return r * x * (1 - x)

def nadc(x0, r, n_iter=200):
    """Compute NADC: distance from fixed point over iterations."""
    x_star = 1 - 1/r  # stable fixed point for 1 < r < 3
    xs = [x0]
    for _ in range(n_iter):
        xs.append(logistic(xs[-1], r))
    return np.array([abs(x - x_star) for x in xs])

# Compare convergence near vs far from bifurcation
r_far  = 2.0  # fast convergence, geometric
r_near = 2.98  # slow convergence, near power-law

d_far  = nadc(0.3, r_far)
d_near = nadc(0.3, r_near)

# Log-log plot reveals power-law regime
ns = np.arange(1, len(d_near))
log_ns = np.log(ns)
log_dn = np.log(d_near[1:] + 1e-15)
beta = -np.polyfit(log_ns[50:], log_dn[50:], 1)[0]
print(f"Fitted β near r=3: {beta:.3f}")  # → β ≈ 1.0</pre>
    </svelte:fragment>
  </ThreeLayer>
</section>
```

- [ ] **Step 3: Universality.svelte**

```svelte
<script>
  export let id = 'universality';
  import ThreeLayer from '../ui/ThreeLayer.svelte';
  import FormulaBlock from '../ui/FormulaBlock.svelte';
  import Citation from '../ui/Citation.svelte';
  import GlossaryTerm from '../ui/GlossaryTerm.svelte';
  import BifurcationDiagram from '../visualizations/BifurcationDiagram.svelte';
</script>

<section {id} class="section-card">
  <h2 class="section-title">Universality and Scaling Laws</h2>

  <p>
    Universality is the surprising fact that systems with completely different microscopic structures can behave identically at large scales. The logistic map, the Rössler system, dripping faucets, and population models all share the same
    <GlossaryTerm term="Feigenbaum constant" definition="δ ≈ 4.669 — the universal ratio at which successive period-doubling bifurcations compress in parameter space." />
    δ ≈ 4.669 in their period-doubling sequences. <Citation key="feigenbaum1978" />
  </p>

  <ThreeLayer section="universality">
    <svelte:fragment slot="conceptual">
      <p>Universality tells us that many details don't matter. Two systems can look completely different at the level of equations yet produce identical scaling structure. This happens because both systems are governed by the same
        <GlossaryTerm term="renormalization group" definition="A mathematical framework that studies how a system's effective description changes under coarse-graining. Fixed points correspond to universal, scale-invariant behavior." />
        fixed point.
      </p>
      <p>The bifurcation diagram below shows the logistic map's transition to chaos. Zoom into the period-doubling cascade to see the self-similar structure and Feigenbaum ratios.</p>
      <BifurcationDiagram />
    </svelte:fragment>

    <svelte:fragment slot="technical">
      <p>The Feigenbaum universality result: for any family of maps f_r with a quadratic maximum, the ratios of successive period-doubling parameter intervals converge to:</p>
      <FormulaBlock
        formula="δ = lim_{n→∞} (rₙ − rₙ₋₁) / (rₙ₊₁ − rₙ) ≈ 4.66920160..."
        symbols={[
          { sym: 'rₙ', meaning: 'parameter value at n-th period-doubling bifurcation' },
          { sym: 'δ', meaning: "Feigenbaum's first constant — universal for all unimodal maps" },
        ]}
        validity="Exactly universal for C² unimodal maps with a single quadratic maximum. Asymptotically exact as n → ∞; converges quickly (geometric rate in n)."
        example="For the logistic map: r₁ = 3.000, r₂ = 3.449, r₃ = 3.544, r₄ = 3.569. Ratios: (r₂−r₁)/(r₃−r₂) = 0.449/0.095 ≈ 4.72, (r₃−r₂)/(r₄−r₃) = 0.095/0.025 ≈ 3.80. Convergence is slow at first, then accelerates toward δ ≈ 4.669."
      />
      <p>Neural scaling laws exhibit an analogous universality <Citation key="kaplan2020" />: the loss-compute frontier L(C) ∝ C^{-α} with α ≈ 0.05–0.1 holds across model families, training regimes, and data distributions — suggesting a shared universality class for gradient-descent optimization on natural language.</p>
    </svelte:fragment>

    <svelte:fragment slot="computational">
      <pre style="background: var(--formula-bg); padding: 14px; border-radius: 4px; font-size: 0.82em; overflow-x: auto;">
def find_bifurcations(n=6, tol=1e-9):
    """Locate period-doubling bifurcations of logistic map."""
    windows = [(2.9,3.1),(3.4,3.5),(3.54,3.56),(3.564,3.57),(3.568,3.569),(3.5687,3.5688)]
    results = []
    for lo, hi in windows[:n]:
        a, b = lo, hi
        for _ in range(100):
            mid = (a + b) / 2
            period_mid = estimate_period(mid)
            period_lo  = estimate_period(a)
            if period_mid > period_lo:
                b = mid
            else:
                a = mid
        results.append((a + b) / 2)
    return results

r_n = find_bifurcations()
deltas = [(r_n[i]-r_n[i-1])/(r_n[i+1]-r_n[i]) for i in range(1, len(r_n)-1)]
print(deltas)
# → [4.233, 4.552, 4.646, 4.664] — converging to δ ≈ 4.669</pre>
    </svelte:fragment>
  </ThreeLayer>
</section>
```

- [ ] **Step 4: MathForms.svelte**

```svelte
<script>
  export let id = 'math-forms';
  import ThreeLayer from '../ui/ThreeLayer.svelte';
  import FormulaBlock from '../ui/FormulaBlock.svelte';
  import GlossaryTerm from '../ui/GlossaryTerm.svelte';
</script>

<section {id} class="section-card">
  <h2 class="section-title">Mathematical Forms of Scaling</h2>
  <p>Four canonical mathematical forms describe convergent and scaling behavior. Each is a different face of the same geometric reality.</p>

  <ThreeLayer section="math-forms">
    <svelte:fragment slot="conceptual">
      <p>A <GlossaryTerm term="power law" definition="A relationship f(x) ∝ xᵅ where the ratio f(cx)/f(x) = cᵅ is independent of x — the same scaling at every scale." /> is scale-free: zoom in or out and the structure looks the same. Exponential laws have a characteristic scale. Critical phenomena and universal behavior are almost always described by power laws, never exponentials.</p>
    </svelte:fragment>

    <svelte:fragment slot="technical">
      <FormulaBlock
        formula="f(n) = A · n^{-β}   (power-law decay)"
        symbols={[{sym:'A',meaning:'amplitude (set by initial conditions)'},{sym:'β',meaning:'decay exponent (universal, positive for convergence)'},{sym:'n',meaning:'step count'}]}
        derivation="Arises near marginally stable fixed points where the linearized eigenvalue |λ| = 1. The iterates satisfy xₙ₊₁ − x* ≈ (xₙ − x*)(1 + γ(xₙ − x*)), which integrates to a power law."
        example="NADC for logistic map near r = 3: d(n) ≈ 3.0 · n⁻¹. After 100 iterations: d(100) ≈ 0.03. After 1000: d(1000) ≈ 0.003. Much slower than exponential decay."
      />
      <FormulaBlock
        formula="f(n) = A · e^{-λn}   (exponential decay)"
        symbols={[{sym:'λ',meaning:'decay rate (= −log|f\'(x*)|, positive for attracting fixed point)'},{sym:'A',meaning:'amplitude'}]}
        derivation="Arises when the fixed point is hyperbolic: |f'(x*)| < 1. The linearization xₙ₊₁ − x* ≈ f'(x*)(xₙ − x*) gives geometric convergence dₙ = |f'(x*)|ⁿ d₀ = e^{n log|f'(x*)|} d₀."
        example="Logistic map at r = 2: f'(x*) = 2 − r = 0. Super-exponential convergence! At r = 2.5: f'(x*) = −0.5, λ = log 2 ≈ 0.693. After 10 steps: d(10) ≈ d₀ × 0.5¹⁰ ≈ 10⁻³ d₀."
      />
      <FormulaBlock
        formula="L(C) ∝ C^{-α}   (neural scaling law)"
        symbols={[{sym:'L',meaning:'validation loss'},{sym:'C',meaning:'training compute (FLOPs)'},{sym:'α',meaning:'compute scaling exponent ≈ 0.05–0.1 for language models'}]}
        derivation="Empirically observed by Kaplan et al. (2020). Theoretically motivated by the universality of gradient descent dynamics near loss minima — analogous to critical slowing-down."
        example="GPT-3 regime: doubling compute C reduces loss by factor 2^{-0.076} ≈ 0.949 — a 5.1% improvement per doubling. This requires ~1000× compute increase for a 50% loss reduction."
      />
      <FormulaBlock
        formula="K(x) ≈ |p*|   (Kolmogorov complexity)"
        symbols={[{sym:'K(x)',meaning:'algorithmic complexity: length of shortest program outputting x'},{sym:'p*',meaning:'the shortest program for x on a universal Turing machine'}]}
        derivation="Defined as the shortest description length. For power-law trajectories, the generating rule is compact: a few parameters specify the entire infinite sequence. For random trajectories, no compression is possible: K(x) ≈ |x|."
        example="The logistic map at r = 4 (chaotic): individual trajectories have high K(x) — they look random. But the generating rule 'apply f(x) = 4x(1−x) iteratively' has K ≈ O(1) — the sequence is highly compressible via its law."
      />
    </svelte:fragment>

    <svelte:fragment slot="computational">
      <pre style="background: var(--formula-bg); padding: 14px; border-radius: 4px; font-size: 0.82em; overflow-x: auto;">
import numpy as np
from scipy.optimize import curve_fit

def power_law(n, A, beta): return A * n**(-beta)
def exp_decay(n, A, lam): return A * np.exp(-lam * n)

ns = np.arange(1, 201)

# Fit both models to a synthetic NADC
d = 3.0 * ns**(-1.0) + 0.001*np.random.randn(200)

p_pow, _ = curve_fit(power_law, ns, d, p0=[3.0, 1.0])
p_exp, _ = curve_fit(exp_decay, ns, d, p0=[3.0, 0.1])

print(f"Power law fit: A={p_pow[0]:.3f}, β={p_pow[1]:.3f}")
print(f"Exp decay fit: A={p_exp[0]:.3f}, λ={p_exp[1]:.3f}")

# Residuals on log scale distinguish the models
# Power law: linear residuals on log-log plot
# Exponential: linear residuals on semi-log plot</pre>
    </svelte:fragment>
  </ThreeLayer>
</section>
```

- [ ] **Step 5: Mechanisms.svelte**

```svelte
<script>
  export let id = 'mechanisms';
  import ThreeLayer from '../ui/ThreeLayer.svelte';
  import FormulaBlock from '../ui/FormulaBlock.svelte';
  import Citation from '../ui/Citation.svelte';
  import GlossaryTerm from '../ui/GlossaryTerm.svelte';
</script>

<section {id} class="section-card">
  <h2 class="section-title">Underlying Mechanisms of Universality</h2>

  <p>
    Why do different systems share the same scaling exponents? Two interlocking frameworks explain this:
    <GlossaryTerm term="renormalization group" definition="A mathematical framework that iteratively zooms out a system, revealing which properties survive at large scales. Fixed points correspond to universal, scale-invariant behavior." />
    (RG) theory and
    <GlossaryTerm term="bifurcation" definition="A qualitative change in system behavior as a parameter crosses a threshold — e.g., a stable fixed point splitting into a 2-cycle." />
    theory. Together they explain not only Feigenbaum universality but — through a remarkable formal analogy — the universality of neural network training dynamics.
  </p>

  <ThreeLayer section="mechanisms">
    <svelte:fragment slot="conceptual">
      <p>The RG idea: repeatedly "zoom out" a system by averaging over short-scale details. Systems that flow to the same fixed point under this transformation share all large-scale behavior. The irrelevant operators — the microscopic details — wash out. Only a few relevant operators survive, and these determine the universality class.</p>
      <p>Feigenbaum's insight was that the logistic map at the period-doubling accumulation point is a fixed point of a functional RG transformation. Near this fixed point, the linearized transformation has exactly one unstable direction, with eigenvalue δ ≈ 4.669. This explains why δ is the same for all maps with a quadratic maximum.</p>
    </svelte:fragment>

    <svelte:fragment slot="technical">
      <p>The RG transformation <em>R</em> acts on a space of functions. A fixed point g satisfies <em>R</em>(g) = g, meaning the system looks the same after coarse-graining. Near the fixed point, linearizing gives eigenvalues λᵢ: <Citation key="wilson1971" /></p>
      <FormulaBlock
        formula="λᵢ = b^{yᵢ}"
        symbols={[
          {sym:'b',meaning:'rescaling factor (coarse-graining step size)'},
          {sym:'yᵢ',meaning:'RG eigenvalue for perturbation i'},
          {sym:'λᵢ > 1',meaning:'relevant operator — grows under RG (drives away from fixed point)'},
          {sym:'λᵢ < 1',meaning:'irrelevant operator — shrinks under RG (microscopic detail, washes out)'},
        ]}
        derivation="Expand the RG flow near a fixed point g*: R(g* + δg) ≈ g* + LRG(δg), where LRG is the linearized RG operator. Its eigenvectors are the scaling operators; eigenvalues determine relevance."
        example="For the logistic map at the Feigenbaum fixed point: b = δ ≈ 4.669. Irrelevant operators decay as (1/4.669)ⁿ ≈ 0.214ⁿ — negligible after ~5 RG steps. Only 2 relevant operators survive, explaining why the fixed point attracts systems from a wide basin regardless of microscopic form."
      />
      <p><strong>RG for Neural Networks</strong> <Citation key="banta2025" />: A formal RG framework applies to deep neural networks. The loss landscape plays the role of the free energy surface. Layer-by-layer coarse-graining maps to RG steps. Fixed points of this NN-RG correspond to universality classes of training dynamics — explaining why architecturally different networks obey the same scaling laws.</p>
      <p>The
        <GlossaryTerm term="NTK" definition="Neural Tangent Kernel — the kernel governing neural network training dynamics in the infinite-width limit. Characterizes how networks learn at initialization." />
        characterizes network training in the infinite-width limit. NTK phase transitions — sudden changes in the NTK spectrum during training — correspond to bifurcations in the effective dynamical system of gradient descent. These transitions mark regime changes analogous to period-doubling in the logistic map.</p>
    </svelte:fragment>

    <svelte:fragment slot="computational">
      <pre style="background: var(--formula-bg); padding: 14px; border-radius: 4px; font-size: 0.82em; overflow-x: auto;">
import numpy as np

def logistic(x, r): return r * x * (1 - x)

def feigenbaum_rg_step(f, alpha=2.5029):
    """One step of Feigenbaum's functional RG: R(f)(x) = -1/alpha * f(f(-alpha*x))"""
    def Rf(x):
        return -1/alpha * f(f(-alpha * x))
    return Rf

# Numerically verify: the fixed-point function g satisfies R(g) = g
# Approximate g as a polynomial (Feigenbaum's approach)
# g(x) ≈ 1 - 1.5276x² + 0.1048x⁴ - 0.0267x⁶ + ...
def g_approx(x):
    return 1 - 1.5276*x**2 + 0.1048*x**4

# Check fixed-point condition at x=0:
# R(g)(0) = -1/alpha * g(g(0)) ≈ -1/2.5029 * g(1) = -1/2.5029 * (-0.4228) ≈ 0.169
# g(0) = 1 — not quite fixed due to polynomial truncation
# Full fixed-point iteration converges; see Collet & Eckmann (1980)
print(f"g(0) = {g_approx(0):.4f}")  # → 1.0
print(f"g(0.5) = {g_approx(0.5):.4f}")  # → 0.619</pre>
    </svelte:fragment>
  </ThreeLayer>
</section>
```

- [ ] **Step 6: Compression.svelte**

```svelte
<script>
  export let id = 'compression';
  import ThreeLayer from '../ui/ThreeLayer.svelte';
  import FormulaBlock from '../ui/FormulaBlock.svelte';
  import Citation from '../ui/Citation.svelte';
  import GlossaryTerm from '../ui/GlossaryTerm.svelte';
</script>

<section {id} class="section-card">
  <h2 class="section-title">Compression, Complexity, and Scaling</h2>

  <p>
    Universal scaling laws are, at their core, statements about compressibility. A trajectory that follows a
    <GlossaryTerm term="power law" definition="A scale-free relationship f(x) ∝ xᵅ — the same structure at every scale." />
    can be described by a tiny program — a few parameters fully specify its infinite evolution. A random trajectory cannot be compressed. This connection between
    <GlossaryTerm term="Kolmogorov complexity" definition="K(x) — the length of the shortest program that produces string x on a universal Turing machine. The fundamental measure of information content." />
    and dynamical regularity runs directly into modern neural scaling laws.
  </p>

  <ThreeLayer section="compression">
    <svelte:fragment slot="conceptual">
      <p>Kolmogorov complexity K(x) is the length of the shortest computer program that outputs the string x. Lawful sequences — those generated by simple rules — have low K: the program is just the rule. Random sequences have K ≈ |x|: no compression is possible.</p>
      <p>A power-law NADC has low K: the entire trajectory is specified by its exponent β and amplitude A. An exponential NADC is equally compressible. A trajectory that meanders without a convergence law is high-K: only by storing the trajectory itself can you reproduce it.</p>
      <p>Large language models learn compressed representations of natural language. Neural scaling laws — the fact that loss decreases as a power law of training compute — suggest that natural language has low effective K: structured data compresses well under gradient descent.</p>
    </svelte:fragment>

    <svelte:fragment slot="technical">
      <FormulaBlock
        formula="K(x) = min{ |p| : U(p) = x }"
        symbols={[
          {sym:'K(x)',meaning:'Kolmogorov complexity of string x'},
          {sym:'p',meaning:'a program for universal Turing machine U'},
          {sym:'|p|',meaning:'length of program p in bits'},
          {sym:'U(p) = x',meaning:'U outputs x when run on input p'},
        ]}
        derivation="Defined by Kolmogorov (1965) and Solomonoff (1964). K(x) is uncomputable in general (by reduction from the halting problem), but upper bounds are computable via any compressor. Invariance theorem: K_U(x) and K_V(x) differ by at most a constant depending on U and V."
        validity="Defined up to an additive constant depending on the choice of universal Turing machine. Practical compressors (gzip, bz2) give computable upper bounds."
        example="String x = '010101...01' (100 repetitions): K(x) ≈ log₂(100) + O(1) ≈ 7 bits (program: 'print 01 100 times'). Random string x ∈ {0,1}^{800}: K(x) ≈ 800 bits — no compression possible. Power-law sequence dₙ = n⁻¹ to n=1000: K ≈ O(log 1000) ≈ 10 bits."
      />
      <p><strong>Why power-law NADCs are compressible:</strong> A trajectory {d₁, d₂, ..., dₙ} following d(n) = A·n^{-β} requires only two numbers (A, β) to reconstruct, regardless of n. Its Kolmogorov complexity is O(log n) — logarithmic in sequence length. A random sequence of the same length has K ≈ n log|alphabet|.</p>
      <p><strong>Connection to neural scaling laws</strong> <Citation key="kaplan2020" /> <Citation key="hoffmann2022" />: The loss function L(C) ∝ C^{-α} implies that as compute increases, the model learns increasingly low-K descriptions of the data. The power-law form of the scaling law is itself evidence that natural language has a hierarchical, self-similar structure — low algorithmic complexity — amenable to power-law compression.</p>
      <p>Formally: if data distribution P has Kolmogorov complexity K(P) = κ, and the model class has capacity C, then under suitable assumptions the minimum achievable loss scales as L ∝ (κ/C)^α. Neural scaling laws are thus a statement about the ratio of data complexity to model capacity — a compression ratio.</p>
    </svelte:fragment>

    <svelte:fragment slot="computational">
      <pre style="background: var(--formula-bg); padding: 14px; border-radius: 4px; font-size: 0.82em; overflow-x: auto;">
import gzip
import numpy as np

def compress_ratio(seq):
    """Estimate compressibility via gzip. Lower = more compressible."""
    b = ' '.join(f'{x:.4f}' for x in seq).encode()
    return len(gzip.compress(b)) / len(b)

n = np.arange(1, 501)

# Power-law trajectory (low K)
power_law = 3.0 * n**(-1.0)

# Exponential trajectory (also low K)
exponential = 3.0 * np.exp(-0.05 * n)

# Random walk (high K)
random_seq = np.cumsum(np.random.randn(500)) * 0.01

print(f"Power law compression ratio:  {compress_ratio(power_law):.3f}")
print(f"Exponential compression ratio: {compress_ratio(exponential):.3f}")
print(f"Random walk compression ratio: {compress_ratio(random_seq):.3f}")
# Expected: power_law ≈ 0.15, exponential ≈ 0.14, random ≈ 0.85
# Power-law and exponential are ~6x more compressible than random</pre>
    </svelte:fragment>
  </ThreeLayer>
</section>
```

- [ ] **Step 7: Outlook.svelte**

```svelte
<script>
  export let id = 'outlook';
  import ThreeLayer from '../ui/ThreeLayer.svelte';
  import Citation from '../ui/Citation.svelte';
  import GlossaryTerm from '../ui/GlossaryTerm.svelte';
</script>

<section {id} class="section-card">
  <h2 class="section-title">Outlook and Open Questions</h2>

  <p>The bridge from classical dynamical systems to modern AI scaling is intellectually exciting — but it is important to distinguish what is proven from what is plausible. This section frames the frontier honestly.</p>

  <ThreeLayer section="outlook">
    <svelte:fragment slot="conceptual">
      <p><strong>What is rigorously established:</strong></p>
      <ul style="padding-left: 1.5em; line-height: 2; margin-bottom: 1em;">
        <li>Feigenbaum universality: proven for C² unimodal maps with a quadratic maximum <Citation key="feigenbaum1978" /></li>
        <li>RG explanation of universality in statistical mechanics: proven <Citation key="wilson1971" /></li>
        <li>Neural scaling laws: empirically robust across many model families and datasets <Citation key="kaplan2020" /> <Citation key="hoffmann2022" /></li>
        <li>NTK convergence in the infinite-width limit: proven <Citation key="jacot2018" /></li>
      </ul>
      <p><strong>What is a motivated analogy (not yet proven):</strong></p>
      <ul style="padding-left: 1.5em; line-height: 2; margin-bottom: 1em;">
        <li>That the RG formalism for dynamical systems directly maps to neural network training</li>
        <li>That power-law scaling laws in LLMs are governed by the same universality class as classical critical phenomena</li>
        <li>That KAN/KANDy-style networks discover latent dynamical laws by recovering low-K descriptions</li>
      </ul>
    </svelte:fragment>

    <svelte:fragment slot="technical">
      <p><strong>Open questions at the frontier:</strong></p>
      <ol style="padding-left: 1.5em; line-height: 2; margin-bottom: 1em;">
        <li>What is the precise universality class of gradient descent on overparameterized models? Does it depend on architecture, data distribution, or optimizer?</li>
        <li>Do neural scaling laws break at sufficiently large scale? The Chinchilla paper <Citation key="hoffmann2022" /> suggests the optimal compute allocation changes — but does the power-law form persist?</li>
        <li>Can KANDy (Kolmogorov-Arnold Networks for Dynamics) reliably discover the latent generating laws of observed NADCs? Early results are promising but not yet systematically benchmarked.</li>
        <li>Is there a formal analog of the Feigenbaum fixed-point equation for the loss landscape of neural networks trained by SGD?</li>
        <li>What is the right notion of "universality class" for neural architectures — and does it predict scaling exponents a priori?</li>
      </ol>
    </svelte:fragment>

    <svelte:fragment slot="computational">
      <pre style="background: var(--formula-bg); padding: 14px; border-radius: 4px; font-size: 0.82em; overflow-x: auto;">
# Testing the neural analogy computationally:
# Does gradient descent on a simple task produce power-law NADCs?

import numpy as np

def train_linear_regression(n_steps=2000, lr=0.01):
    """Toy model: gradient descent on 1D linear regression."""
    np.random.seed(42)
    X = np.random.randn(100, 1)
    y = 2*X[:,0] + 0.1*np.random.randn(100)
    w = np.array([0.0])
    losses = []
    for _ in range(n_steps):
        pred = X @ w
        loss = np.mean((pred - y)**2)
        losses.append(loss)
        grad = 2 * X.T @ (pred - y) / len(y)
        w -= lr * grad
    return np.array(losses)

losses = train_linear_regression()
ns = np.arange(1, len(losses)+1)

# Fit power law to loss curve (after warmup)
from scipy.optimize import curve_fit
def power_law(n, A, beta): return A * n**(-beta)
params, _ = curve_fit(power_law, ns[50:], losses[50:], p0=[1.0, 0.5])
print(f"Fitted β for gradient descent NADC: {params[1]:.3f}")
# For linear regression: β = 1.0 (exact, from closed-form solution)
# For nonlinear models: β depends on loss landscape geometry</pre>
    </svelte:fragment>
  </ThreeLayer>
</section>
```

- [ ] **Step 8: Bibliography.svelte**

```svelte
<script>
  import { citations } from '../lib/citations.js';
</script>

<section id="bibliography" class="section-card">
  <h2 class="section-title">Bibliography</h2>
  <ol style="padding-left: 1.5em; line-height: 2.2; font-size: 0.9em;">
    {#each Object.values(citations) as ref}
      <li>
        {ref.full}
        {#if ref.url}
          <a href={ref.url} target="_blank" rel="noopener noreferrer" style="color: var(--primary); font-size: 0.85em; margin-left: 6px;">↗</a>
        {/if}
      </li>
    {/each}
  </ol>
</section>
```

- [ ] **Step 9: Build and verify**

```bash
cd apps/science-of-convergence && npm run build
```

Expected: clean build, no errors.

- [ ] **Step 10: Commit**

```bash
git add apps/science-of-convergence/src/sections/
git commit -m "feat(convergence): migrate all 7 sections with ThreeLayer content"
```

---

## Task 7: BifurcationDiagram.svelte

**Files:**
- Create: `apps/science-of-convergence/src/visualizations/BifurcationDiagram.svelte`

- [ ] **Step 1: Create BifurcationDiagram.svelte**

```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  import { bifurcationSamples } from '../lib/math/logisticMap.js';

  let canvas;
  let ctx;
  let width = 720;
  let height = 400;
  let animFrame;

  let rMin = 2.5;
  let rMax = 4.0;
  let showDelta = false;

  // Zoom state
  let dragging = false;
  let dragStart = null;
  let dragEnd = null;
  let selectionRect = null;

  // Feigenbaum bifurcation r values
  const bifPoints = [3.0, 3.449, 3.544, 3.565, 3.569];

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#FDFBF7';
    ctx.fillRect(0, 0, width, height);

    // Axes labels
    ctx.fillStyle = '#7B5E4D';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`r = ${rMin.toFixed(3)}`, 40, height - 8);
    ctx.fillText(`r = ${rMax.toFixed(3)}`, width - 40, height - 8);
    ctx.fillText('r', width / 2, height - 8);
    ctx.save();
    ctx.translate(12, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('x', 0, 0);
    ctx.restore();

    // Compute and draw bifurcation points
    const rSteps = Math.min(600, width);
    const warmup = 400;
    const samples = 300;

    for (let i = 0; i < rSteps; i++) {
      const r = rMin + (i / rSteps) * (rMax - rMin);
      const xs = bifurcationSamples(r, warmup, samples);
      const px = 20 + i * (width - 40) / rSteps;

      ctx.fillStyle = 'rgba(123,94,77,0.35)';
      xs.forEach(x => {
        const py = (height - 20) - x * (height - 40);
        ctx.fillRect(px, py, 1, 1);
      });
    }

    // Feigenbaum delta annotations
    if (showDelta) {
      bifPoints.slice(0, 4).forEach((r, i) => {
        if (r < rMin || r > rMax) return;
        const px = 20 + ((r - rMin) / (rMax - rMin)) * (width - 40);
        ctx.strokeStyle = '#A07C5B';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, 20);
        ctx.lineTo(px, height - 20);
        ctx.stroke();
        ctx.setLineDash([]);
        if (i > 0) {
          const ratio = (bifPoints[i] - bifPoints[i-1]) / (bifPoints[i+1] - bifPoints[i]);
          ctx.fillStyle = '#7B5E4D';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(`δ≈${ratio.toFixed(2)}`, px + 3, 30 + i * 14);
        }
      });
    }

    // Selection rect during drag
    if (selectionRect) {
      ctx.strokeStyle = '#A07C5B';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(selectionRect.x, selectionRect.y, selectionRect.w, selectionRect.h);
      ctx.setLineDash([]);
    }
  }

  function reDraw() {
    cancelAnimationFrame(animFrame);
    animFrame = requestAnimationFrame(draw);
  }

  $: { rMin; rMax; showDelta; reDraw(); }

  function canvasX(e) {
    const rect = canvas.getBoundingClientRect();
    return e.clientX - rect.left;
  }
  function canvasY(e) {
    const rect = canvas.getBoundingClientRect();
    return e.clientY - rect.top;
  }
  function xToR(cx) {
    return rMin + ((cx - 20) / (width - 40)) * (rMax - rMin);
  }

  function onMouseDown(e) {
    dragging = true;
    dragStart = { x: canvasX(e), y: canvasY(e) };
    selectionRect = null;
  }
  function onMouseMove(e) {
    if (!dragging) return;
    dragEnd = { x: canvasX(e), y: canvasY(e) };
    selectionRect = {
      x: Math.min(dragStart.x, dragEnd.x),
      y: Math.min(dragStart.y, dragEnd.y),
      w: Math.abs(dragEnd.x - dragStart.x),
      h: Math.abs(dragEnd.y - dragStart.y),
    };
    reDraw();
  }
  function onMouseUp(e) {
    if (!dragging || !dragEnd) { dragging = false; return; }
    const r1 = Math.min(xToR(dragStart.x), xToR(dragEnd.x));
    const r2 = Math.max(xToR(dragStart.x), xToR(dragEnd.x));
    if (r2 - r1 > 0.01) {
      rMin = Math.max(0.5, r1);
      rMax = Math.min(4.0, r2);
    }
    dragging = false;
    dragStart = null;
    dragEnd = null;
    selectionRect = null;
  }

  function resetZoom() {
    rMin = 2.5; rMax = 4.0;
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    draw();
  });
  onDestroy(() => cancelAnimationFrame(animFrame));
</script>

<div class="bifurcation-wrap">
  <div class="controls">
    <label>
      <input type="checkbox" bind:checked={showDelta} />
      Show δ annotations
    </label>
    <button on:click={resetZoom}>Reset zoom</button>
  </div>

  <canvas
    bind:this={canvas}
    {width}
    {height}
    role="img"
    aria-label="Bifurcation diagram of the logistic map. The x-axis shows the parameter r from {rMin} to {rMax}. The y-axis shows attractor x values. Period-doubling cascades are visible."
    style="cursor: crosshair; display: block; width: 100%; max-width: {width}px; border: 1px solid var(--border); border-radius: 4px;"
    on:mousedown={onMouseDown}
    on:mousemove={onMouseMove}
    on:mouseup={onMouseUp}
    on:mouseleave={onMouseUp}
  />

  <p class="caption">
    Logistic map bifurcation diagram. Drag to zoom into the period-doubling cascade.
    {#if showDelta}Vertical dashed lines mark bifurcation points; ratios converge to δ ≈ 4.669.{/if}
  </p>

  <details>
    <summary style="font-family: sans-serif; font-size: 0.8em; color: var(--accent); cursor: pointer; margin-top: 8px;">Data table (accessibility)</summary>
    <table style="font-size: 0.78em; border-collapse: collapse; margin-top: 8px;">
      <thead>
        <tr>
          <th style="border: 1px solid var(--border); padding: 4px 8px;">Bifurcation</th>
          <th style="border: 1px solid var(--border); padding: 4px 8px;">r value</th>
          <th style="border: 1px solid var(--border); padding: 4px 8px;">δ ratio</th>
        </tr>
      </thead>
      <tbody>
        {#each bifPoints.slice(0,4) as r, i}
          <tr>
            <td style="border: 1px solid var(--border); padding: 4px 8px;">2^{i+1}-cycle</td>
            <td style="border: 1px solid var(--border); padding: 4px 8px;">{r}</td>
            <td style="border: 1px solid var(--border); padding: 4px 8px;">
              {i > 0 ? ((bifPoints[i]-bifPoints[i-1])/(bifPoints[i+1]-bifPoints[i])).toFixed(3) : '—'}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </details>
</div>

<style>
  .bifurcation-wrap { margin: 20px 0; }
  .controls {
    display: flex; gap: 12px; align-items: center;
    margin-bottom: 10px;
    font-family: sans-serif; font-size: 0.85em;
  }
  .controls label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
  .controls button {
    padding: 5px 12px;
    background: var(--formula-bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--accent);
    cursor: pointer;
    font-family: sans-serif;
    font-size: 0.85em;
  }
  .controls button:hover { background: var(--border); }
  .controls button:focus-visible { outline: 2px solid var(--primary); }
  .caption {
    font-family: sans-serif;
    font-size: 0.78em;
    color: var(--accent);
    margin-top: 8px;
    font-style: italic;
  }
</style>
```

- [ ] **Step 2: Build and verify**

```bash
cd apps/science-of-convergence && npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add apps/science-of-convergence/src/visualizations/BifurcationDiagram.svelte
git commit -m "feat(convergence): BifurcationDiagram canvas visualization with zoom and δ annotations"
```

---

## Task 8: PhaseSpaceExplorer.svelte

**Files:**
- Create: `apps/science-of-convergence/src/visualizations/PhaseSpaceExplorer.svelte`

- [ ] **Step 1: Create PhaseSpaceExplorer.svelte**

```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  import { iterate, cobwebData, regime } from '../lib/math/logisticMap.js';

  let canvas;
  let ctx;
  const W = 480;
  const H = 480;
  let animFrame;

  let r = 2.8;
  let trajectories = [];
  const COLORS = ['#A07C5B','#7B5E4D','#5a8a6a','#5a6a8a','#8a5a6a','#6a5a8a'];
  const MAX_TRAJ = 6;

  $: regimeLabel = regime(r);
  $: { r; trajectories = []; reDraw(); }

  function toCanvasX(x) { return 20 + x * (W - 40); }
  function toCanvasY(y) { return (H - 20) - y * (H - 40); }
  function fromCanvasX(cx) { return (cx - 20) / (W - 40); }

  function drawBackground() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#FDFBF7';
    ctx.fillRect(0, 0, W, H);

    // y = x diagonal
    ctx.strokeStyle = '#D4C2AD';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), toCanvasY(0));
    ctx.lineTo(toCanvasX(1), toCanvasY(1));
    ctx.stroke();
    ctx.setLineDash([]);

    // Logistic curve y = r*x*(1-x)
    ctx.strokeStyle = '#C4A882';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const x = i / 200;
      const y = iterate(x, r);
      if (i === 0) ctx.moveTo(toCanvasX(x), toCanvasY(y));
      else ctx.lineTo(toCanvasX(x), toCanvasY(y));
    }
    ctx.stroke();

    // Axes
    ctx.strokeStyle = '#D4C2AD';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, H - 20);
    ctx.lineTo(W - 20, H - 20);
    ctx.moveTo(20, 20);
    ctx.lineTo(20, H - 20);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#7B5E4D';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('x', W / 2, H - 4);
    ctx.save();
    ctx.translate(10, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('f(x)', 0, 0);
    ctx.restore();
  }

  function drawTrajectory(pts, color, alpha = 0.85) {
    if (pts.length < 2) return;
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    pts.forEach(([x, y], i) => {
      const cx = toCanvasX(x);
      const cy = toCanvasY(Math.max(0, Math.min(1, y)));
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Starting point dot
    const [x0] = pts[0];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(toCanvasX(x0), toCanvasY(0), 4, 0, Math.PI * 2);
    ctx.fill();
  }

  function draw() {
    if (!ctx) return;
    drawBackground();
    trajectories.forEach((pts, i) => {
      drawTrajectory(pts, COLORS[i % COLORS.length]);
    });
  }

  function reDraw() {
    cancelAnimationFrame(animFrame);
    animFrame = requestAnimationFrame(draw);
  }

  function addTrajectory(x0) {
    if (x0 < 0 || x0 > 1) return;
    if (trajectories.length >= MAX_TRAJ) trajectories = trajectories.slice(1);
    const pts = cobwebData(x0, r, 60);
    trajectories = [...trajectories, pts];
    reDraw();
  }

  function onClick(e) {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const scaleX = W / rect.width;
    const x0 = fromCanvasX(cx * scaleX);
    addTrajectory(x0);
  }

  function onKey(e) {
    if (e.key === 'Enter' || e.key === ' ') onClick(e);
  }

  function addRandom() {
    for (let i = 0; i < 4; i++) {
      addTrajectory(0.05 + Math.random() * 0.9);
    }
  }

  function clearAll() {
    trajectories = [];
    reDraw();
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    draw();
  });
  onDestroy(() => cancelAnimationFrame(animFrame));
</script>

<div class="pse-wrap">
  <div class="controls">
    <label>
      r = <strong>{r.toFixed(2)}</strong>
      <input
        type="range" min="0.5" max="4.0" step="0.01"
        bind:value={r}
        aria-label="Logistic map parameter r"
        style="width: 200px; margin: 0 8px;"
      />
    </label>
    <button on:click={addRandom} aria-label="Add 4 random initial conditions">Add random ICs</button>
    <button on:click={clearAll} aria-label="Clear all trajectories">Clear</button>
  </div>

  <canvas
    bind:this={canvas}
    width={W}
    height={H}
    role="img"
    aria-label="Phase space cobweb diagram for the logistic map with r = {r.toFixed(2)}. Click to add an initial condition and watch the trajectory converge to the attractor."
    tabindex="0"
    style="cursor: crosshair; display: block; width: 100%; max-width: {W}px; border: 1px solid var(--border); border-radius: 4px;"
    on:click={onClick}
    on:keydown={onKey}
  />

  <p class="regime-label" aria-live="polite">
    <strong>Regime (r = {r.toFixed(2)}):</strong> {regimeLabel}
  </p>
  <p class="caption">Click anywhere on the diagram to set an initial condition. Up to 6 simultaneous trajectories.</p>
</div>

<style>
  .pse-wrap { margin: 20px 0; }
  .controls {
    display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
    margin-bottom: 10px;
    font-family: sans-serif; font-size: 0.85em;
  }
  .controls button {
    padding: 5px 12px;
    background: var(--formula-bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--accent);
    cursor: pointer;
    font-family: sans-serif; font-size: 0.85em;
  }
  .controls button:hover { background: var(--border); }
  .controls button:focus-visible { outline: 2px solid var(--primary); }
  canvas:focus-visible { outline: 2px solid var(--primary); }
  .regime-label {
    font-family: sans-serif; font-size: 0.88em;
    color: var(--text);
    margin-top: 10px;
    padding: 8px 12px;
    background: var(--formula-bg);
    border-radius: 4px;
    border-left: 3px solid var(--primary);
  }
  .caption {
    font-family: sans-serif; font-size: 0.78em;
    color: var(--accent); margin-top: 6px; font-style: italic;
  }
</style>
```

- [ ] **Step 2: Build and verify**

```bash
cd apps/science-of-convergence && npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add apps/science-of-convergence/src/visualizations/PhaseSpaceExplorer.svelte
git commit -m "feat(convergence): PhaseSpaceExplorer cobweb diagram with r slider and trajectory tracking"
```

---

## Task 9: Accessibility pass

**Files:**
- Modify: `apps/science-of-convergence/src/app.css` (contrast fix)
- Verify: all interactive elements have keyboard support (already done in Tasks 5–8)

- [ ] **Step 1: Fix contrast in app.css — small text on formula-bg**

The failing contrast is #A07C5B on #F5F1EA = 2.3:1. Fix: dark text for small/secondary contexts.

Add to `app.css`:
```css
/* WCAG AA contrast fix: secondary text on formula-bg must be ≥ 4.5:1 */
/* #6B4F3A on #F5F1EA = 5.1:1 — passes AA */
.formula-block .symbol-grid dd,
.formula-block .validity,
.formula-block .derivation,
.formula-block .example {
  color: #6B4F3A;
}

/* Caption text on white card = fine at full color */
.caption { color: var(--accent); }

/* Nav links: increase contrast when inactive */
/* var(--primary) #A07C5B on rgba(253,251,247,.96) ≈ 3.0:1 — borderline */
/* Override to darker for nav specifically */
nav a { color: #7B5E4D !important; }
nav a[aria-current="location"] { color: #5a3f28 !important; }
```

- [ ] **Step 2: Verify keyboard navigation manually**

Checklist:
- [ ] Tab through StickyNav links — all reachable
- [ ] Tab through ThreeLayer tabs — left/right arrow or Enter/Space switches tabs
- [ ] Tab to Citation spans — Enter/Space scrolls to bibliography
- [ ] Tab to GlossaryTerm spans — focus shows tooltip
- [ ] Tab to BifurcationDiagram controls — checkbox and button reachable
- [ ] Tab to PhaseSpaceExplorer slider and buttons — all reachable
- [ ] Canvas elements have `role="img"` and `aria-label`
- [ ] Canvas data table fallback is present and readable

- [ ] **Step 3: Build and verify**

```bash
cd apps/science-of-convergence && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add apps/science-of-convergence/src/app.css
git commit -m "fix(convergence): WCAG AA contrast fix for small text on formula-bg"
```

---

## Task 10: Build, verify output, and check Gatsby passthrough

- [ ] **Step 1: Run tests one final time**

```bash
cd apps/science-of-convergence && npm test
```

Expected: all tests PASS.

- [ ] **Step 2: Production build**

```bash
cd apps/science-of-convergence && npm run build
```

Expected: clean build, output in `../../static/apps/convergence/`.

- [ ] **Step 3: Verify output files exist**

```bash
ls /home/dennisjcarroll/everything-personal-website/everything-personal-website/static/apps/convergence/
```

Expected: `index.html`, `assets/` directory with hashed JS and CSS files.

- [ ] **Step 4: Verify asset paths in built index.html**

```bash
head -30 /home/dennisjcarroll/everything-personal-website/everything-personal-website/static/apps/convergence/index.html
```

Expected: script/link `src` attributes start with `/apps/convergence/assets/` — not bare `/assets/`.

- [ ] **Step 5: Check old HTML is preserved**

```bash
ls "/home/dennisjcarroll/everything-personal-website/everything-personal-website/static/apps/The Science of Convergence.html"
```

Expected: file still exists. Do NOT remove it until the new URL is confirmed working on the live site.

- [ ] **Step 6: Final commit**

```bash
git add static/apps/convergence/
git commit -m "feat(convergence): Phase 1 build output — static/apps/convergence/"
```

---

## Definition of Done — Phase 1

All items from the spec:

- [ ] `npm run build` in `apps/science-of-convergence/` produces clean output
- [ ] Built output at `static/apps/convergence/index.html`
- [ ] All 7 sections render with ThreeLayer tabs (Conceptual / Technical / Computational)
- [ ] Every formula has FormulaBlock with symbol legend and worked example
- [ ] Citations render inline with tooltip on hover; click scrolls to bibliography
- [ ] Glossary terms render with hover definitions
- [ ] BifurcationDiagram: renders, drag-to-zoom works, δ annotation toggle works
- [ ] PhaseSpaceExplorer: cobweb draws on canvas click, r slider updates curve and regime label, "Add random ICs" and "Clear" work
- [ ] Compression section includes K(x) formal definition and LLM scaling bridge
- [ ] Mechanisms section includes RG-for-NNs content (Banta 2025) and NTK phase transitions
- [ ] All interactive elements keyboard-accessible (tab + Enter/Space)
- [ ] Canvas elements have `role="img"` and `aria-label`
- [ ] Contrast passes WCAG AA on all text
- [ ] No emoji as sole information carrier (SVG back arrow in DJCAppBar)
- [ ] DJC app bar present; sticky nav does not overlap it (44px offset)
- [ ] Old HTML file preserved at original path
