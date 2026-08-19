# Calculus Flow — Improvements Design
**Date:** 2026-06-08
**Scope:** Bug pass + Intuitive Mode tooltip layer + direct static delivery through Gatsby

---

## Context

Calculus Flow is a standalone React 19 + Vite + Tailwind CSS v3 canvas-based calculus
visualizer. Its canonical source lives at `apps/calculus-flow/`. It has six
interactive modes: Riemann, Tangent, Derivative Lab, Area, FTC, and Limits.

The Gatsby portfolio site (`/`) uses React 18 — incompatible for direct component
integration. The standalone app is delivered from Gatsby's static assets.

---

## Decisions

| Question | Decision |
|----------|----------|
| Scope | Bugs + highest-value features |
| Integration | Direct static delivery through Gatsby |
| Intuitive Mode behavior | Canvas tooltip layer (callout bubbles on canvas) |
| Commit strategy | 3 commits: bugs → intuitive mode → Gatsby integration |

---

## Section 1 — Bug Fixes

### 1.1 `isAnimating` prop unused in CanvasBoard
**File:** `apps/calculus-flow/src/components/CanvasBoard.tsx`
**Problem:** `isAnimating` is declared in `CanvasBoardProps` and passed from App but
never destructured in the component function.
**Fix:** Destructure it. Use it to gate the data callback throttle: during animation
skip `onRiemannDataChange` when n hasn't meaningfully changed (avoids flooding state
with nearly-identical values at 60fps).

### 1.2 FTC lower-half y-range incorrect
**File:** `apps/calculus-flow/src/lib/canvasRenderers.ts` → `renderFTC`
**Problem:** `lowerCs` uses the same `yMin/yMax` as `upperCs`. The antiderivative F(x)
has a completely different value range than f(x). The dot on the lower panel renders at
the wrong vertical position.
**Fix:** Call `getFunctionRange(preset.antiderivative, cs.xMin, cs.xMax)` and build
`lowerCs` with the correct range. Import `getFunctionRange` from `mathFunctions`.

### 1.3 Limits `(1+1/x)^x` preset — `limitPoint: Infinity`
**File:** `apps/calculus-flow/src/lib/mathFunctions.ts`
**Problem:** `limitPoint: Infinity` causes the renderer to try to draw a vertical dashed
line and label at `x = Infinity` — both silently fail or render off-screen.
**Fix:** Set `limitPoint: 1000` (large proxy) and keep `limitValue: Math.E`. The label
string stays `x → ∞` (handled in App.tsx readout, already renders the `→` symbol).
Also guard `renderLimits`: skip the vertical dashed line if `limitPoint > cs.xMax`.

### 1.4 Secant line not draggable
**File:** `apps/calculus-flow/src/App.tsx` + `apps/calculus-flow/src/components/CanvasBoard.tsx`
**Problem:** `const [secantX] = useState(3)` — no setter. User cannot reposition the
secant point.
**Fix:**
- `App.tsx`: change to `const [secantX, setSecantX] = useState(3)` and pass
  `onSecantXChange={setSecantX}` to CanvasBoard.
- `CanvasBoardProps`: add `onSecantXChange: (x: number) => void`.
- `CanvasBoard`: in `startDrag` and `doDrag`, when `mode === 'tangent'` and
  `showSecant` is true, detect clicks near the secant point (within 20px) and set
  dragging to `'secantX'`. In `doDrag`, call `onSecantXChange(clampedX)`.

---

## Section 2 — Intuitive Mode Tooltip Layer

### Architecture
`intuitiveMode: boolean` flows from `App` state → `CanvasBoard` prop → passed into
each renderer call. Each renderer calls `drawIntuitiveTips(ctx, cs, mode, params)` as
its final step when `intuitiveMode` is true.

### New helper: `drawTip`
**File:** `apps/calculus-flow/src/lib/canvasRenderers.ts`

```ts
function drawTip(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  text: string,
  align: 'left' | 'center' | 'right' = 'left'
): void
```

Draws one semi-transparent rounded-rect bubble at canvas coordinates `(px, py)`:
- Background: `rgba(10, 14, 39, 0.85)`
- Border: `rgba(34, 211, 238, 0.25)`, 1px
- Text: `11px "JetBrains Mono"`, color `#94a3b8`
- Padding: 6px horizontal, 4px vertical
- Corner radius: 6px

Each renderer calls `drawTip` directly at its end when `intuitiveMode` is true,
using canvas pixel positions it already has in scope. No generic wrapper needed —
each renderer knows where its elements are.

### Per-mode tips (2–3 per mode)

**Riemann:**
- On the first rectangle (left edge + half width, 60% height): `"← each bar = one area estimate"`
- Bottom-center of canvas: `"↑ more bars → closer to the true integral"`

**Tangent:**
- Near the tangent line midpoint: `"← tangent: slope = f′(x) at this point"`
- Near the draggable dot: `"← drag the dot along the curve"`

**Area:**
- Center of the shaded region: `"↑ shaded area = ∫f(x)dx from a to b"`
- Near bound handle `a`: `"← drag to change lower bound"`

**FTC:**
- Upper-left corner (below `f(x)` label): `"← drag the point to accumulate area"`
- Lower-left corner (below `F(x)` label): `"← F′(t) = f(t): that's the theorem"`

**Limits:**
- Near the approach point: `"← drag toward the dashed line"`
- Near the open circle (if visible): `"← function undefined here, but limit exists"`

### CanvasBoard changes
- Add `intuitiveMode: boolean` to `CanvasBoardProps` interface.
- Destructure it in the function signature.
- Pass to each `renderX(ctx, cs, { ..., intuitiveMode })` call.
- Each renderer destructures `intuitiveMode` and calls `drawIntuitiveTips` at the end.

### App.tsx changes
- `intuitiveMode` is already in state (`useState(false)`).
- Add `intuitiveMode={intuitiveMode}` prop to `<CanvasBoard>`.

---

## Section 3 — Static Delivery Through Gatsby

### 3.1 Vite build config
**File:** `apps/calculus-flow/vite.config.ts`
**Change:** Set `base: './'` so all built asset paths are relative. This allows the
built `dist/` to be served from any subdirectory.

### 3.2 Build + deploy
```bash
npm run calc-flow:deploy
```

The deploy command builds the canonical source and synchronizes `dist/` to
`static/apps/calc-flow/`. Gatsby serves that directory as-is at the public URL
`https://dennisjcarroll.com/apps/calc-flow/`.

### 3.3 Portfolio discovery link
**File:** `src/pages/apps.js`

The Apps page links its Calculus Flow card directly to `/apps/calc-flow/`. There is
no dedicated Gatsby page or wrapper; the standalone application is
delivered directly from Gatsby's static assets.

---

## Commit Sequence

| # | Message | Files touched |
|---|---------|---------------|
| 1 | `fix(calc-flow): isAnimating prop, FTC y-range, Infinity preset, secant drag` | `CanvasBoard.tsx`, `canvasRenderers.ts`, `mathFunctions.ts`, `App.tsx` |
| 2 | `feat(calc-flow): intuitive mode canvas tooltip layer` | `canvasRenderers.ts`, `CanvasBoard.tsx`, `App.tsx` |
| 3 | `chore(calc-flow): establish canonical app workflow` | `apps/calculus-flow/*`, `scripts/deploy-calc-flow.mjs`, `static/apps/calc-flow/*`, `src/pages/apps.js` |

---

## Testing Checklist

- [ ] Vite dev server starts: `npm run calc-flow:develop` from the repository root
- [ ] FTC mode: antiderivative dot tracks correctly in lower panel
- [ ] Riemann animation: no console warnings about unused props
- [ ] Limits mode: `(1+1/x)^x` preset loads without rendering artifacts
- [ ] Tangent mode: secant point is draggable when `Show Secant` is on
- [ ] Derivative Lab: chain-rule builder, step navigation, graph, and x scrubber work
- [ ] Mode tabs expose all six modes, including Derivative Lab
- [ ] Intuitive mode toggle: tips appear/disappear correctly in every supported canvas mode
- [ ] Vite build succeeds: `npm run calc-flow:build`
- [ ] Built `dist/index.html` uses relative asset paths (`./assets/...`)
- [ ] Gatsby Apps page links directly to `/apps/calc-flow/`
- [ ] `/apps/calc-flow/` renders the app correctly at full viewport
- [ ] Mobile: canvas sizes correctly, touch drag works

---

## Out of Scope

- Custom function input (deferred)
- URL state sharing (deferred)
- Multi-function comparison (deferred)
- Gatsby React version upgrade
