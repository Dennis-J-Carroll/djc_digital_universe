# MechMap Core Upgrade — Part 1 Design Spec

**Date:** 2026-05-28  
**Target:** `mechmap-viz/` Next.js app (the live version)  
**Scope:** 16 guide items adapted for React/Next.js + DJC design system integration  
**Part 2:** Circuit discovery UI (separate spec — depends on heatmap built here)

---

## 1. Context

The live MechMap app is a Next.js 16 / React 19 app in `mechmap-viz/`. It uses Zustand for state, Prisma + SQLite for DB persistence, shadcn/ui components, and Lucide icons. The `static/apps/mechmap.html` is the old version — do not touch it.

The Kimi implementation guide was written for the static HTML version. Most Phase 1 bugs (MLP bracket syntax, slider focus loss, render debounce) are already resolved by React's architecture. The relevant remaining work is: one critical fix, four high-impact features, and five advanced features — plus DJC design integration.

---

## 2. Architecture: Approach A — Incremental Slice Expansion

Expand the single `useTransformerStore` in `src/lib/store.ts` with four new slice-like additions. No refactor of existing state. Each slice can be added independently without breaking current functionality.

### 2.1 New Store State

```typescript
// View slice
view: 'flow' | 'heatmap'
setView: (v: 'flow' | 'heatmap') => void

// History slice (undo/redo)
history: Record<string, Annotation>[]   // max 20, FIFO eviction
historyPointer: number                   // -1 = no history
isDirty: boolean                         // true after undo if project loaded
isRestoring: boolean                     // prevents snapshot loops
pushSnapshot: () => void                 // call BEFORE every annotation mutation
undo: () => void
redo: () => void

// Filter slice
filterQuery: string
filterImportance: string[]              // active importance levels
filterTags: string[]                    // active tag filters
matchingKeys: Set<string>              // recomputed on every filter change
setFilterQuery: (q: string) => void
toggleFilterImportance: (level: string) => void
toggleFilterTag: (tag: string) => void
clearFilters: () => void

// Batch slice
batchMode: boolean
batchSelected: Set<string>
lastBatchClicked: string | null
toggleBatchMode: () => void
toggleBatchComponent: (key: string) => void
selectBatchRange: (fromKey: string, toKey: string) => void
applyBatchAnnotation: (data: Partial<Annotation>) => void
clearBatch: () => void
```

### 2.2 Undo/Redo Contract

**Every mutation that changes `state.annotations` must call `pushSnapshot()` before executing:**
- `saveAnnotation`
- `deleteAnnotation`
- `applyBatchAnnotation`
- `importAnnotations`

**Undo/redo behavior:**
- Restores local Zustand annotation state only — does NOT fire API calls
- Sets `isDirty = true` when a project is loaded (unsaved changes indicator)
- `isRestoring` flag set during undo/redo prevents snapshot loops
- Stack max 20 entries. FIFO eviction when exceeded.
- New mutation after undo discards redo branch (`history.slice(0, pointer + 1)`)
- Uses `structuredClone()` for deep copy of annotations object

**Keyboard:** `Ctrl+Z` undo, `Ctrl+Shift+Z` redo (global `keydown` listener in `page.tsx`)

---

## 3. Component Map

### 3.1 New Files (`src/components/transformer/`)

| File | Purpose |
|------|---------|
| `HeatmapView.tsx` | Canvas-based grid view — replaces `TransformerVisualization` when `view === 'heatmap'` |
| `SearchBar.tsx` | Header search input with debounce (150ms) and clear button |
| `FilterPanel.tsx` | Left sidebar importance chips + tag cloud filter |
| `BatchToolbar.tsx` | Floating action bar — appears when `batchSelected.size >= 2` |
| `LayerNavigator.tsx` | Left sidebar jump-to-layer with per-layer annotation counts |
| `UndoRedo.tsx` | Header undo/redo icon buttons, disabled state when stack empty |
| `AutoBackupIndicator.tsx` | Footer save status: "Unsaved changes" amber / "Saved" green / timestamp |
| `LayeredNetworkIcon.tsx` | Custom neuro node SVG — replaces Lucide `Brain` in header |

### 3.2 Modified Files

| File | Changes |
|------|---------|
| `src/lib/store.ts` | Add 4 slices (view, history, filter, batch) |
| `src/components/transformer/AttentionHead.tsx` | ARIA labels, batch dashed ring, filter dim opacity |
| `src/components/transformer/MLPBlock.tsx` | ARIA labels, batch dashed ring, filter dim opacity |
| `src/components/transformer/TransformerVisualization.tsx` | View dispatch (flow/heatmap), keyboard nav handler, layer `role="group"` |
| `src/components/transformer/AnnotationPanel.tsx` | Wrap delete button in Radix `AlertDialog` |
| `src/app/page.tsx` | Add `SearchBar`, `UndoRedo`, `LayeredNetworkIcon` to header; mobile tab bar layout |
| `src/app/globals.css` | DJC design token swap (dark theme only) |
| `src/components/transformer/TransformerLayer.tsx` | Add `id="layer-{layerIndex}"` to wrapper div for LayerNavigator scroll targets |

---

## 4. Feature Details

### 4.1 DJC Design System Integration

Token swaps in `globals.css` dark theme — importance colors (red/amber/green) unchanged, they are semantic not brand:

| Token | Current | DJC |
|-------|---------|-----|
| Primary (rings, icons, search) | `#3b82f6` | `#00bcd4` |
| Background base | `#020617` | `#0a0e14` |
| Surface/header | `#0f172a` | `#0f1419` |
| Layer/card border | `#1e293b` solid | `rgba(0,188,212,0.15)` |
| Unannotated head border | `#475569` | `rgba(0,188,212,0.2)` |
| MLP block | `#7c3aed` | `#7c4dff` + `box-shadow: 0 0 6px rgba(124,77,255,0.3)` |
| Selection ring | `rgba(59,130,246,0.5)` | `rgba(0,188,212,0.5)` + `0 0 10px rgba(0,188,212,0.4)` |

### 4.2 Neuro Node Icon (LayeredNetworkIcon)

Custom SVG, `viewBox="0 0 24 24"`, stroke-based, accepts `className` prop for sizing:

```tsx
// 2 input → 3 hidden → 1 output layered network
// Mirrors the transformer architecture being visualized
// Nodes: input (cx=3,cy=8), (cx=3,cy=16) | hidden (cx=12,cy=5), (cx=12,cy=12), (cx=12,cy=19) | output (cx=21,cy=12)
// Connections: weighted opacity (0.3 / 0.6 / 0.9) to show varying signal strength
// Center hidden node brightest (fill-opacity 0.25 vs 0.1/0.15)
```

Used in `page.tsx` header replacing `<Brain className="w-6 h-6 text-primary" />`.

### 4.3 Heatmap View (`HeatmapView.tsx`)

- Single `<canvas>` element, DPR-aware: `canvas.width = cssWidth * devicePixelRatio`, then `ctx.scale(dpr, dpr)`
- Cell layout: `cellSize = Math.min(canvasWidth / (numHeads + 1), canvasHeight / numLayers)` — square cells, centered, last column = MLP
- Colors: `high → #ef4444`, `medium → #f59e0b`, `low → #22c55e`, `unknown → #6b7280`, `unannotated → #0a0e14` (DJC base)
- White 2.5px dot top-right corner if annotation has notes
- Row labels left of grid (`L0`, `L1`…), column header `H0…HN | MLP`
- Hit detection: `Math.floor((mx - offsetX) / cellSize)` on `mousemove`
- Hover: tooltip div (absolutely positioned) shows component id + importance + tag count
- Click: `setSelectedComponent(...)` + `setView('flow')` — zooms into flow view at selected component
- View toggle: `LayoutGrid` icon (heatmap) and `AlignJustify` icon (flow) from Lucide in header. Keyboard `H` toggles.
- MLP column cells: slightly larger corner radius (`3px` vs `2px`) to visually distinguish

### 4.4 Batch Annotation Mode (`BatchToolbar.tsx` + store)

**Activation:** `B` key or header toggle button. Banner below header: "Batch mode active — Ctrl+Click to select, Shift+Click for range"

**Selection mechanics:**
- Plain click: clears batch, selects one (normal behavior)
- `Ctrl+Click`: toggles component in `batchSelected`
- `Shift+Click`: range-selects all heads between `lastBatchClicked` and target, same layer only. Falls back to toggle if different layer.

**Visual state:** `border-2 border-dashed border-cyan-400` on batch-selected components (DJC cyan, not blue). Coexists with importance color background and single-selection ring.

**BatchToolbar:** Floating bar, `position: sticky top-0` inside viz scroll area. Appears when `batchSelected.size >= 2`. Contains:
- Count label: "N selected"
- Importance dropdown (`Select` from shadcn)
- Add tag dropdown (`Select`)
- Delete all button → `AlertDialog` confirmation
- Clear button (`X` icon)

**Undo integration:** `applyBatchAnnotation` calls `pushSnapshot()` once before iterating all selected components. Single Ctrl+Z reverts the entire batch.

**DB sync:** If project loaded, fires parallel `Promise.all()` API calls. Partial failure: per-component error toast via `sonner`.

### 4.5 Mobile Layout

Breakpoints:
- `> 1024px`: Full 3-column layout (left sidebar + viz + right panel)
- `768–1024px`: Left sidebar hidden, viz + right panel
- `< 768px`: Full-width viz, annotation panel as `Vaul` Drawer (already installed), bottom tab bar

Mobile tab bar (3 tabs using `useIsMobile` hook):
- **Viz** — `LayoutGrid` icon — shows transformer visualization
- **Notes** — `PenLine` icon — opens Vaul Drawer with annotation panel
- **Stats** — `BarChart3` icon — shows Legend + Stats + FilterPanel

Layer navigator on mobile: floating `Layers` icon button bottom-right → opens bottom sheet with layer list.

### 4.6 Layer Navigator (`LayerNavigator.tsx`)

Left sidebar below `FilterPanel`. Shows a scrollable list of all layers. Each row:
- Layer number (`L0`, `L1`…)
- Mini importance bar (count of high/medium/low/unknown per layer, color-coded)
- Clicking scrolls viz area to that layer via `element.scrollIntoView({ behavior: 'smooth', block: 'start' })`

Requires `id="layer-{N}"` on each `TransformerLayer` wrapper div.

### 4.7 AutoBackupIndicator (`AutoBackupIndicator.tsx`)

Footer right side. Three states:
- **No project:** hidden (local-only mode shown by existing footer text)
- **isDirty + project:** amber dot + "Unsaved changes" — `Dot` icon from Lucide
- **Saved:** green dot + "Saved · {time}" — updates to relative time ("2m ago") every 30s

---

## 5. ARIA Contract

### 5.1 Component Labels

```tsx
// AttentionHead
aria-label={`Layer ${layerIndex}, Head ${headIndex}${
  ann ? ` — ${ann.importance} — ${ann.tags.join(', ')}` : ' — unannotated'
}`}
aria-pressed={isSelected}

// MLPBlock  
aria-label={`Layer ${layerIndex}, MLP${
  ann ? ` — ${ann.importance} — ${ann.tags.join(', ')}` : ' — unannotated'
}`}
aria-pressed={isSelected}
```

### 5.2 Layer Groups

```tsx
<div role="group" aria-labelledby={`layer-label-${layerIndex}`}>
  <span id={`layer-label-${layerIndex}`} className="...">Layer {layerIndex}</span>
  {/* heads + MLP */}
</div>
```

### 5.3 Page Landmarks

```tsx
<header role="banner">
<main role="main" aria-label="Transformer architecture visualization">
<aside role="complementary" aria-label="Legend and statistics">
<aside role="complementary" aria-label="Annotation panel">
```

Radix `Dialog` handles modal ARIA automatically — no extra work for Config/Help/Delete modals.

### 5.4 Live Region

Single visually-hidden `aria-live="polite" aria-atomic="true"` div appended to body on mount. Used for: "Annotation saved", "Undo", "Redo", batch operation results.

---

## 6. Keyboard Shortcuts

| Key | Context | Action |
|-----|---------|--------|
| `↑` / `↓` | Viz focused | Navigate layers. Announces "Layer N". |
| `←` / `→` | Viz focused | Navigate heads. `→` past last head moves to MLP. |
| `Enter` | Head/MLP focused | Select component, open panel. |
| `Escape` | Global | Close panel / modal. Returns focus to trigger. |
| `Ctrl+S` | Panel open | Save annotation. Announces "Saved". |
| `Ctrl+Z` | Global | Undo. |
| `Ctrl+Shift+Z` | Global | Redo. |
| `B` | Viz focused | Toggle batch mode. |
| `H` | Global | Toggle heatmap / flow view. |
| `Ctrl+Click` | Batch mode | Toggle component in batch selection. |
| `Shift+Click` | Batch mode | Range-select within layer. |

---

## 7. Implementation Order — 9 Commits

Each commit is independently shippable and reviewable:

| # | Commit | Key files |
|---|--------|-----------|
| 1 | **DJC theme + neuro icon** | `globals.css`, `LayeredNetworkIcon.tsx`, `page.tsx` |
| 2 | **Delete confirmation** | `AnnotationPanel.tsx` (AlertDialog wrap) |
| 3 | **History slice + UndoRedo** | `store.ts`, `UndoRedo.tsx`, `page.tsx` |
| 4 | **Filter slice + SearchBar + FilterPanel** | `store.ts`, `SearchBar.tsx`, `FilterPanel.tsx`, `AttentionHead.tsx`, `MLPBlock.tsx` |
| 5 | **ARIA + keyboard nav** | `AttentionHead.tsx`, `MLPBlock.tsx`, `TransformerVisualization.tsx`, `page.tsx` |
| 6 | **Heatmap view** | `store.ts`, `HeatmapView.tsx`, `TransformerVisualization.tsx`, `page.tsx` |
| 7 | **Batch annotation mode** | `store.ts`, `BatchToolbar.tsx`, `AttentionHead.tsx`, `MLPBlock.tsx` |
| 8 | **Layer navigator + AutoBackupIndicator** | `LayerNavigator.tsx`, `AutoBackupIndicator.tsx`, `TransformerLayer.tsx` |
| 9 | **Mobile redesign** | `page.tsx`, Vaul Drawer integration |

---

## 8. Out of Scope (Part 2)

- Circuit path visualization (SVG overlay on heatmap)
- CircuitPath / PathNode UI (create, name, order nodes)
- Circuit list sidebar
- Contributor / comment system UI

---

## 9. Definition of Done

Part 1 is complete when:
- All 9 commits merged to `main`
- `npm run build` passes with zero errors
- Delete confirmation prevents accidental loss
- Undo/redo works for save, delete, batch ops
- Search + filter dims non-matching annotated components
- Heatmap renders GPT-2 XL (48×25) without perceptible lag
- Batch selects and applies to 10+ components in one operation
- All heads/MLPs have descriptive ARIA labels
- Keyboard nav traverses layers and heads without mouse
- App passes basic WCAG 2.1 AA check (contrast, focus visibility, landmark roles)
- DJC cyan theme applied, neuro node icon in header, zero emojis in UI
- Mobile layout functional on 375px viewport with Vaul Drawer
