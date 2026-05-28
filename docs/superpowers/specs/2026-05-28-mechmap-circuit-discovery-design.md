# MechMap Circuit Discovery UI — Part 2 Design Spec

**Date:** 2026-05-28  
**Target:** `mechmap-viz/` Next.js app  
**Depends on:** Part 1 heatmap canvas (commit 6 of Part 1 must ship first)  
**Research framework:** Project Aletheia — 6-phase MI research methodology  

---

## 1. Context

The Prisma schema already contains `CircuitPath`, `PathNode`, `Contributor`, and `Comment` models, and API routes exist at `/api/projects/[id]/circuits` and `/api/circuits/[id]`. There is zero UI for any of this. Part 2 builds that UI.

Researchers using MechMap are performing Aletheia-style circuit discovery: identifying components (Previous Token Heads, Induction Heads, Name Movers), connecting them into ordered paths, and validating causality via activation patching (denoising/noising protocols). The UI must support this workflow directly.

---

## 2. Interaction Model

**Hybrid: click-to-build in flow view, live SVG overlay in heatmap.**

- Flow view: clicking a head/MLP in circuit build mode adds it as the next node
- Heatmap: `CircuitOverlay` SVG layer sits above the canvas and shows circuit arrows live as nodes are added
- Both views update simultaneously — no forced view switch
- Right panel toggles: annotation mode (default) ↔ circuit mode (when a circuit is active)

---

## 3. Schema Changes — One Prisma Migration

Three new nullable fields on `PathNode`. No breaking changes.

```prisma
model PathNode {
  // ... all existing fields unchanged ...

  // AND/OR gate label on the edge FROM this node TO the next
  connectionType  String?   // 'and' | 'or' — null = unclassified

  // Activation patching results (Aletheia Phase 3)
  denoisingScore  Float?    // 0.0–1.0 — tests sufficiency (clean→corrupt)
  noisingScore    Float?    // 0.0–1.0 — tests necessity (corrupt→clean)
}
```

**Confidence auto-classification rule** (computed, not stored separately):
- `verified` = all nodes have denoisingScore > 0.8 AND noisingScore > 0.8
- `likely` = all nodes have both scores, average > 0.5
- `speculative` = any node missing scores, or average ≤ 0.5
- Auto-classification only runs when ALL nodes have both scores; otherwise confidence stays at user-set value

Update `POST /api/projects/[id]/circuits/[circuitId]/nodes` and `PUT /api/circuits/[id]` to accept the three new fields.

---

## 4. Store — Circuit Slice

Added to `useTransformerStore` in `src/lib/store.ts` alongside Part 1 slices. Not persisted (circuit data lives in DB).

```typescript
// Circuit slice
circuits: CircuitPath[]
activeCircuitId: string | null
circuitBuildMode: boolean          // true = clicking adds to active circuit

// Actions
loadCircuits: (projectId: string) => Promise<void>
setActiveCircuit: (id: string | null) => void
toggleCircuitBuildMode: () => void
addNodeToCircuit: (componentKey: string) => void
removeCircuitNode: (nodeIndex: number) => Promise<void>
reorderCircuitNodes: (fromIndex: number, toIndex: number) => Promise<void>
// Reorder strategy: send full ordered array of nodeIds to API.
// API deletes all nodes and re-inserts with new positions to avoid
// the @@unique([circuitPathId, position]) constraint collision.
createCircuit: (data: CreateCircuitInput) => Promise<CircuitPath>
updateCircuit: (id: string, data: Partial<CircuitPath>) => Promise<void>
deleteCircuit: (id: string) => Promise<void>
updateCircuitNode: (nodeId: string, data: Partial<PathNodeInput>) => Promise<void>
```

**B key conflict resolution:**
- `activeCircuitId !== null` → B = toggle `circuitBuildMode`
- `activeCircuitId === null` → B = toggle `batchMode` (Part 1)
- Circuit mode takes priority. Entering circuit build mode implicitly exits batch mode.

**State machine:**
```
Normal mode ──[select circuit]──→ Circuit selected (right panel = CircuitPanel)
                                         │
                               [press B or "Add nodes"]
                                         ↓
                              Circuit Build Mode ON
                              (click head/MLP = adds node)
                                         │
                               [press B or Escape]
                                         ↓
                              Back to Circuit selected
```

`Escape` exits build mode without deselecting the circuit. A second `Escape` deselects the circuit and returns right panel to annotation mode.

---

## 5. Component Map

### 5.1 New Files (`src/components/transformer/`)

| File | Purpose |
|------|---------|
| `CircuitOverlay.tsx` | SVG layer absolutely positioned over heatmap canvas |
| `CircuitPanel.tsx` | Right panel in circuit mode — node list, metadata, save |
| `CircuitList.tsx` | Left sidebar section — circuit list, "+ New" button |
| `CircuitNodeRow.tsx` | Single draggable node row inside CircuitPanel |
| `CircuitTemplates.tsx` | "New Circuit" modal — template picker + name/type/color |
| `CircuitBuildBanner.tsx` | Indicator strip in header when build mode is active |
| `useCircuits.ts` | API hook — load/create/update/delete circuits and nodes |

### 5.2 Modified Files

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Add 3 PathNode fields |
| `src/lib/store.ts` | Add circuit slice |
| `src/components/transformer/HeatmapView.tsx` | Mount `CircuitOverlay` on top; expose `heatmapLayout` ref |
| `src/components/transformer/AttentionHead.tsx` | `circuitBuildMode` click handler; circuit-color ring on in-circuit heads |
| `src/components/transformer/MLPBlock.tsx` | Same |
| `src/components/transformer/AnnotationPanel.tsx` | Render `CircuitPanel` when `activeCircuitId !== null` |
| `src/components/transformer/Legend.tsx` | Add `CircuitList` below existing sections |
| `src/app/page.tsx` | Add `CircuitBuildBanner` in header; call `loadCircuits(currentProject.id)` in the same `useEffect` that calls `syncFromProject` — both fire when `currentProject` changes |

---

## 6. Feature Details

### 6.1 CircuitOverlay (SVG Layer)

```tsx
// DOM structure in HeatmapView.tsx
<div style={{ position: 'relative' }}>
  <canvas ref={canvasRef} />   {/* Part 1 heatmap — unchanged */}
  <svg
    style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
    width={cssWidth}
    height={cssHeight}
  >
    {/* pointerEvents: 'none' on SVG root — interactive paths override with pointerEvents: 'auto' */}
    {circuits.map(circuit => <CircuitArrows circuit={circuit} layout={heatmapLayout} />)}
  </svg>
  {/* AND/OR edge label badges: pointerEvents: 'auto', cursor: 'pointer', onClick → open edge editor */}
</div>
```

**`heatmapLayout` ref** — object shared between `HeatmapView` and `CircuitOverlay`:
```typescript
interface HeatmapLayout {
  offsetX: number    // same value used in canvas hit detection
  offsetY: number
  cellSize: number
  numHeads: number   // for column→head mapping
  numLayers: number
}
```
Canvas computes this on every resize/render and writes it to the ref. SVG reads it to position circles and arrows — guaranteed coordinate agreement.

**Cell center calculation:**
```typescript
function cellCenter(layer: number, col: number, layout: HeatmapLayout) {
  const x = layout.offsetX + col * layout.cellSize + layout.cellSize / 2
  const y = layout.offsetY + layer * layout.cellSize + layout.cellSize / 2
  return { x, y }
}
```

**Arrow rendering:** Cubic bezier curves. Control points offset right of midpoint to avoid overlapping cells:
```typescript
// From source (sx, sy) to target (tx, ty)
const mx = (sx + tx) / 2 + 20   // offset right
const d = `M${sx},${sy} C${mx},${sy} ${mx},${ty} ${tx},${ty}`
```

**Per-circuit elements:**
- `<circle>` ring around each node cell (circuit color, `stroke-dasharray="3,2"` for active circuit, solid for inactive)
- `<path>` arrow for each consecutive node pair
- `<marker>` arrowhead element per circuit color
- `<text>` or `<rect>+<text>` AND/OR badge at arrow midpoint (only when `connectionType` is set)
- Active circuit: 100% opacity, 2px stroke, `filter: drop-shadow(0 0 3px {color})`
- Inactive circuits: 35% opacity, 1px stroke, no glow

**In flow view** (when heatmap not visible): `AttentionHead` and `MLPBlock` show a colored `ring-2` border in `circuit.color` for every component that's a node in any loaded circuit. Active circuit nodes get the pulsing ring (`animate-pulse`).

### 6.2 CircuitPanel (Right Panel)

Renders when `activeCircuitId !== null`, replacing `AnnotationPanel`.

**Header row:** Circuit name (editable inline) · type badge · confidence badge (auto-computed + color coded: green=verified, amber=likely, slate=speculative) · color swatch · delete button (AlertDialog confirmation)

**Build mode toggle:** "Add nodes" button (activates build mode, button becomes "Stop adding nodes" with pulsing cyan dot).

**Node list:** Ordered list using `@dnd-kit/sortable`. Each `CircuitNodeRow`:
- Drag handle (`GripVertical` Lucide icon)
- Position index (`0`, `1`, `2`...)
- Component key (`L1_H3` or `L5_MLP`) — if unresolved (template placeholder), shows `—` with "Click to assign" hint
- Role select: `source | relay | amplifier | inhibitor | sink`
- Signal type select: `positional | content | name | fact | pattern`
- D/N score inputs: number input 0.0–1.0 with mini progress bar visualization
- AND/OR edge selector (shown below node, labeled "→ next:"): `AND | OR | —` toggle chips
- Delete row button (trash icon, no confirmation needed for single node)

**Metadata section (collapsible):**
- Hypothesis textarea
- Evidence textarea
- Circuit type select (from Aletheia taxonomy)

**Footer:** "Save" button (saves all pending node + circuit changes in one API batch) + "Export" button (JSON).

### 6.3 CircuitList (Left Sidebar)

Below `FilterPanel`. Section header: "Circuits" + `<Plus>` icon button.

Each list item:
- Color dot (circuit.color, 8px circle)
- Circuit name (truncated)
- Type badge (tiny, 0.6rem)
- Confidence dot: green (verified) / amber (likely) / slate (speculative)
- Click → `setActiveCircuit(id)`, right panel switches to CircuitPanel

Active circuit: cyan left border `border-l-2 border-cyan-400`.

Max height: 200px, scrollable. Empty state: "No circuits yet. Press C to create one."

### 6.4 CircuitTemplates Modal

Triggered by "+" in CircuitList or `C` key when no circuit active.

**Step 1 — Template picker:**
- "Induction Circuit" — 2 nodes: Prev Token Head (relay/positional) → Induction Head (sink/pattern). Pre-creates PathNodes with role+signalType set, layer/head indices null.
- "IOI Name Mover" — 5 nodes: S2 Inhibition (inhibitor/name) → Name Mover (relay/name) → Backup NM (relay/name) → Negative NM (inhibitor/name) → Output (sink/name). All indices null.
- "Blank" — no pre-created nodes.

**Step 2 — Name + config:**
- Circuit name input
- Type select (Aletheia taxonomy: induction / factual_recall / copy / inhibition / boosting / custom)
- Color picker (6 DJC-palette swatches: `#00bcd4` cyan, `#f59e0b` amber, `#7c4dff` violet, `#f43f5e` rose, `#10b981` emerald, `#6366f1` indigo)
- "Create" → POST to API, set as active circuit, open CircuitPanel

### 6.5 CircuitBuildBanner

Thin strip rendered in the header between the icon and title when `circuitBuildMode === true`:

```tsx
<div className="flex items-center gap-2 px-2 py-0.5 rounded border border-cyan-400/40 bg-cyan-400/10">
  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
  <span className="text-xs text-cyan-400">
    Adding nodes to: {activeCircuit.name}
  </span>
  <span className="text-xs text-slate-500 ml-1">Esc to stop</span>
</div>
```

---

## 7. Keyboard Shortcuts (Part 2 Additions)

| Key | Context | Action |
|-----|---------|--------|
| `C` | Global | New circuit (opens CircuitTemplates modal) |
| `B` | Circuit active | Toggle circuit build mode |
| `B` | No circuit | Toggle batch mode (Part 1) |
| `Escape` | Build mode | Exit build mode, keep circuit selected |
| `Escape` | Circuit selected, not building | Deselect circuit, return to annotation mode |

---

## 8. Implementation Order — 9 Commits

| # | Commit | Key files |
|---|--------|-----------|
| 1 | **Prisma migration + API updates** | `schema.prisma`, `api/projects/[id]/circuits/route.ts`, `api/circuits/[id]/route.ts` |
| 2 | **Circuit slice + useCircuits hook** | `store.ts`, `useCircuits.ts` |
| 3 | **CircuitList in left sidebar** | `CircuitList.tsx`, `Legend.tsx` |
| 4 | **New circuit flow** | `CircuitTemplates.tsx`, `page.tsx` (C key handler) |
| 5 | **CircuitPanel (static — no reorder yet)** | `CircuitPanel.tsx`, `CircuitNodeRow.tsx`, `AnnotationPanel.tsx` toggle |
| 6 | **Flow view circuit mode** | `AttentionHead.tsx`, `MLPBlock.tsx`, `CircuitBuildBanner.tsx`, `page.tsx` |
| 7 | **CircuitOverlay on heatmap** | `CircuitOverlay.tsx`, `HeatmapView.tsx` (layout ref + mount overlay) |
| 8 | **@dnd-kit node reordering** | `CircuitPanel.tsx`, `CircuitNodeRow.tsx`, `store.ts` reorderCircuitNodes |
| 9 | **Template pre-fill + confidence auto-classify** | `CircuitTemplates.tsx`, `store.ts` computeConfidence |

Each commit independently shippable. Commits 1–5 ship without heatmap dependency. Commit 7 requires Part 1 commit 6 (heatmap) to be merged first.

---

## 9. Out of Scope

- Arrow routing offset (avoiding overlap when multiple circuits cross same cells) — follow-up
- Activation patching execution (running actual experiments) — future Phase 3 of app
- Steering vector UI (Aletheia Phase 5) — future Phase 3
- Contributor / comment thread UI — future
- Circuit sharing / public links — future

---

## 10. Definition of Done

Part 2 is complete when:
- Prisma migration runs clean on fresh DB
- Can create circuit from template (Induction, IOI) or blank
- Clicking heads in flow view adds nodes in build mode
- SVG arrows appear on heatmap live as nodes are added
- AND/OR labels appear on arrows when connectionType is set
- D/N scores show as progress bars, confidence auto-classifies when all nodes scored
- Node reorder with drag updates position in DB
- Multiple circuits visible simultaneously in different colors
- Circuit delete requires AlertDialog confirmation
- `C` creates, `B` toggles build, `Escape` exits build
- All Lucide SVG icons, zero emojis
- `npm run build` passes with zero errors
