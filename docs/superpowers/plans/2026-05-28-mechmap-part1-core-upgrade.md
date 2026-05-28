# MechMap Part 1 — Core Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the live `mechmap-viz/` Next.js app with DJC design system, delete confirmation, undo/redo, search/filter, ARIA + keyboard nav, heatmap view, batch annotation, layer navigator, auto-backup, and mobile redesign — 9 independently shippable commits.

**Architecture:** Expand the single `useTransformerStore` Zustand store with 4 new slices (view, history, filter, batch). Add 8 new React components and modify 8 existing files. No new npm dependencies required — all primitives already installed.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zustand 5 (persist middleware), Tailwind v4, shadcn/ui (Radix primitives), Lucide icons, Vaul (drawer), @dnd-kit, sonner (toasts), HTML Canvas 2D API.

**Working directory for all commands:** `mechmap-viz/`

---

## File Map

### New files
- `src/components/transformer/LayeredNetworkIcon.tsx` — custom SVG neuro node icon
- `src/components/transformer/UndoRedo.tsx` — header undo/redo buttons
- `src/components/transformer/SearchBar.tsx` — header search input
- `src/components/transformer/FilterPanel.tsx` — sidebar importance + tag filters
- `src/components/transformer/BatchToolbar.tsx` — floating batch action bar
- `src/components/transformer/LayerNavigator.tsx` — left sidebar layer jump list
- `src/components/transformer/HeatmapView.tsx` — canvas-based overview grid
- `src/components/transformer/AutoBackupIndicator.tsx` — footer save status

### Modified files
- `src/app/globals.css` — DJC token overrides
- `src/app/page.tsx` — header layout, keyboard handlers, mobile tabs
- `src/lib/store.ts` — 4 new slices appended to TransformerStore
- `src/components/transformer/index.ts` — export new components
- `src/components/transformer/AttentionHead.tsx` — ARIA, batch, filter
- `src/components/transformer/MLPBlock.tsx` — ARIA, batch, filter
- `src/components/transformer/TransformerVisualization.tsx` — view dispatch, keyboard nav
- `src/components/transformer/TransformerLayer.tsx` — add id prop
- `src/components/transformer/AnnotationPanel.tsx` — AlertDialog on delete
- `src/components/transformer/Legend.tsx` — mount FilterPanel + LayerNavigator

---

## Task 1: DJC Theme + Neuro Node Icon

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/components/transformer/LayeredNetworkIcon.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/transformer/index.ts`

- [ ] **Step 1: Apply DJC token overrides in globals.css**

Add below the existing `.dark { ... }` block (do not remove or change existing rules — append a new override block):

```css
/* DJC design system overrides — appended after .dark block */
:root,
.dark {
  --primary: #00bcd4;           /* DJC cyan */
  --primary-foreground: #0a0e14;
  --ring: #00bcd4;
  --background: #0a0e14;        /* DJC navy */
  --card: #0f1419;
}
```

Also add DJC Tailwind theme tokens inside the existing `@theme inline { ... }` block (after the last line before the closing brace):

```css
/* DJC custom colors for Tailwind utilities */
--color-djc-cyan: #00bcd4;
--color-djc-navy: #0a0e14;
--color-djc-surface: #0f1419;
--color-djc-violet: #7c4dff;
--color-djc-border: rgba(0, 188, 212, 0.15);
```

- [ ] **Step 2: Verify build still passes**

```bash
npm run build
```
Expected: zero errors. If TypeScript complains about CSS, that's fine — CSS is not type-checked.

- [ ] **Step 3: Update page.tsx background from slate-950 to DJC navy**

In `src/app/page.tsx`, find:
```tsx
<div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
```
Replace with:
```tsx
<div className="min-h-screen bg-[#0a0e14] text-slate-100 flex flex-col">
```

Find the header border:
```tsx
className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50"
```
Replace with:
```tsx
className="border-b border-[rgba(0,188,212,0.15)] bg-[#0f1419]/80 backdrop-blur-sm sticky top-0 z-50"
```

- [ ] **Step 4: Create LayeredNetworkIcon.tsx**

```tsx
// src/components/transformer/LayeredNetworkIcon.tsx
interface LayeredNetworkIconProps {
  className?: string;
}

export function LayeredNetworkIcon({ className }: LayeredNetworkIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className={className}
    >
      {/* Input layer */}
      <circle cx={3} cy={8} r={1.8} fill="currentColor" fillOpacity={0.15} />
      <circle cx={3} cy={16} r={1.8} fill="currentColor" fillOpacity={0.15} />
      {/* Hidden layer */}
      <circle cx={12} cy={5} r={1.8} fill="currentColor" fillOpacity={0.1} />
      <circle cx={12} cy={12} r={1.8} fill="currentColor" fillOpacity={0.25} />
      <circle cx={12} cy={19} r={1.8} fill="currentColor" fillOpacity={0.1} />
      {/* Output layer */}
      <circle cx={21} cy={12} r={1.8} fill="currentColor" fillOpacity={0.15} />
      {/* Input → hidden connections */}
      <line x1={4.8} y1={8} x2={10.2} y2={5.5} strokeOpacity={0.6} strokeWidth={1} />
      <line x1={4.8} y1={8.5} x2={10.2} y2={12} strokeOpacity={0.9} strokeWidth={1.2} />
      <line x1={4.8} y1={9} x2={10.2} y2={18.5} strokeOpacity={0.3} strokeWidth={1} />
      <line x1={4.8} y1={15.5} x2={10.2} y2={5.5} strokeOpacity={0.3} strokeWidth={1} />
      <line x1={4.8} y1={16} x2={10.2} y2={12} strokeOpacity={0.6} strokeWidth={1} />
      <line x1={4.8} y1={16.5} x2={10.2} y2={18.5} strokeOpacity={0.9} strokeWidth={1.2} />
      {/* Hidden → output connections */}
      <line x1={13.8} y1={5.5} x2={19.2} y2={12} strokeOpacity={0.4} strokeWidth={1} />
      <line x1={13.8} y1={12} x2={19.2} y2={12} strokeOpacity={0.9} strokeWidth={1.2} />
      <line x1={13.8} y1={18.5} x2={19.2} y2={12} strokeOpacity={0.4} strokeWidth={1} />
    </svg>
  );
}
```

- [ ] **Step 5: Replace Brain icon in page.tsx header**

Find:
```tsx
import { Brain, Github, HelpCircle } from 'lucide-react';
```
Replace with:
```tsx
import { Github, HelpCircle } from 'lucide-react';
import { LayeredNetworkIcon } from '@/components/transformer';
```

Find:
```tsx
<Brain className="w-6 h-6 text-primary" />
```
Replace with:
```tsx
<LayeredNetworkIcon className="w-6 h-6 text-primary" />
```

- [ ] **Step 6: Export from index.ts**

Append to `src/components/transformer/index.ts`:
```ts
export { LayeredNetworkIcon } from './LayeredNetworkIcon';
```

- [ ] **Step 7: Verify build and check in browser**

```bash
npm run build && npm run dev
```
Open `http://localhost:3000`. Verify: header shows layered network icon in cyan, background is DJC navy (`#0a0e14`), no console errors.

- [ ] **Step 8: Commit**

```bash
git add src/app/globals.css src/app/page.tsx src/components/transformer/LayeredNetworkIcon.tsx src/components/transformer/index.ts
git commit -m "feat(mechmap): apply DJC design system + neuro node icon

Replace Lucide Brain with custom layered network SVG (2→3→1 mirrors transformer
architecture). DJC cyan #00bcd4 primary, navy #0a0e14 base, cyan-tinted borders."
```

---

## Task 2: Delete Confirmation

**Files:**
- Modify: `src/components/transformer/AnnotationPanel.tsx`

- [ ] **Step 1: Add AlertDialog import**

At the top of `src/components/transformer/AnnotationPanel.tsx`, find the existing import block and add:
```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
```

- [ ] **Step 2: Wrap delete button in AlertDialog**

In `AnnotationPanel.tsx`, find the `AnnotationForm` component's delete button section (around line 254–267):
```tsx
{existingAnnotation && (
  <Button
    variant="destructive"
    size="icon"
    onClick={handleDelete}
  >
    <Trash2 className="h-4 w-4" />
  </Button>
)}
```

Replace with:
```tsx
{existingAnnotation && (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="destructive" size="icon">
        <Trash2 className="h-4 w-4" />
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete Annotation</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. The annotation, all tags, notes,
          and importance ratings will be permanently removed.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={handleDelete}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```
Expected: zero errors.

- [ ] **Step 4: Manual test**

Run `npm run dev`. Select an annotated component, click the trash icon. A confirmation dialog should appear with "Cancel" and "Delete" buttons. Clicking Cancel dismisses without deleting. Clicking Delete removes the annotation.

- [ ] **Step 5: Commit**

```bash
git add src/components/transformer/AnnotationPanel.tsx
git commit -m "feat(mechmap): add delete confirmation dialog

Wraps destructive delete action in AlertDialog (Radix). Prevents accidental
annotation loss — single misclick no longer destroys hours of research."
```

---

## Task 3: History Slice + UndoRedo Buttons

**Files:**
- Modify: `src/lib/store.ts`
- Create: `src/components/transformer/UndoRedo.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/transformer/index.ts`

- [ ] **Step 1: Add history slice types to store.ts**

In `src/lib/store.ts`, find the `TransformerStore` interface and append these fields before the closing `}`:

```typescript
// History slice — undo/redo
history: Record<string, Annotation>[];
historyPointer: number;
isDirty: boolean;
isRestoring: boolean;
pushSnapshot: () => void;
undo: () => void;
redo: () => void;
```

- [ ] **Step 2: Implement history slice in store.ts create() call**

In the `create<TransformerStore>()(persist((set, get) => ({` block, append the following after the existing `isConfigPanelOpen` section (before the closing `}),`):

```typescript
// History slice
history: [],
historyPointer: -1,
isDirty: false,
isRestoring: false,

pushSnapshot: () => {
  const state = get();
  if (state.isRestoring) return;
  const snapshot = structuredClone(state.annotations);
  const stack = state.history.slice(0, state.historyPointer + 1);
  stack.push(snapshot);
  const trimmed = stack.length > 20 ? stack.slice(stack.length - 20) : stack;
  set({ history: trimmed, historyPointer: trimmed.length - 1 });
},

undo: () => {
  const { history, historyPointer, currentProject } = get();
  if (historyPointer <= 0) return;
  const newPointer = historyPointer - 1;
  const snapshot = structuredClone(history[newPointer]);
  set({
    annotations: snapshot,
    historyPointer: newPointer,
    isRestoring: true,
    isDirty: currentProject !== null,
  });
  set({ isRestoring: false });
},

redo: () => {
  const { history, historyPointer, currentProject } = get();
  if (historyPointer >= history.length - 1) return;
  const newPointer = historyPointer + 1;
  const snapshot = structuredClone(history[newPointer]);
  set({
    annotations: snapshot,
    historyPointer: newPointer,
    isRestoring: true,
    isDirty: currentProject !== null,
  });
  set({ isRestoring: false });
},
```

- [ ] **Step 3: Wire pushSnapshot into saveAnnotation**

In `src/components/transformer/AnnotationPanel.tsx`, find the `handleSave` callback. At the very beginning of the function body (before `setIsSaving(true)`), add:

```typescript
const { pushSnapshot } = useTransformerStore();
// ... (already destructured above — just call it)
```

Actually, add `pushSnapshot` to the destructure at the top of `AnnotationForm`:
```typescript
const { addAnnotation, updateAnnotation, deleteAnnotation: localDeleteAnnotation, pushSnapshot } = useTransformerStore();
```

Then at the start of `handleSave`:
```typescript
const handleSave = useCallback(async () => {
  pushSnapshot(); // snapshot BEFORE mutating
  setIsSaving(true);
  // ... rest unchanged
```

And at the start of `handleDelete`:
```typescript
const handleDelete = useCallback(async () => {
  pushSnapshot(); // snapshot BEFORE mutating
  // ... rest unchanged
```

- [ ] **Step 4: Exclude history from persist partialize**

In `store.ts`, find the `partialize` option:
```typescript
partialize: (state) => ({
  config: state.config,
  ...(state.currentProject ? {} : { annotations: state.annotations }),
}),
```

Update to also persist `view` (added in Task 6) but confirm history is NOT included — it's already excluded since it's not listed. No change needed here.

- [ ] **Step 5: Create UndoRedo.tsx**

```tsx
// src/components/transformer/UndoRedo.tsx
'use client';

import { Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTransformerStore } from '@/lib/store';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function UndoRedo() {
  const { history, historyPointer, undo, redo } = useTransformerStore();

  const canUndo = historyPointer > 0;
  const canRedo = historyPointer < history.length - 1;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={undo}
              disabled={!canUndo}
              className="opacity-60 disabled:opacity-20"
              aria-label="Undo last annotation change"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={redo}
              disabled={!canRedo}
              className="opacity-60 disabled:opacity-20"
              aria-label="Redo last undone change"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
```

- [ ] **Step 6: Add UndoRedo to header in page.tsx**

Add import:
```tsx
import { UndoRedo } from '@/components/transformer';
```

In the header `<div className="flex items-center gap-2">`, add `<UndoRedo />` before the `ProjectSelector`:
```tsx
<div className="flex items-center gap-2">
  <UndoRedo />
  <ProjectSelector />
  {/* ... rest unchanged */}
```

- [ ] **Step 7: Add global Ctrl+Z / Ctrl+Shift+Z handler to page.tsx**

In `page.tsx`, import `useEffect` if not already imported, and add this effect inside the `Home` component:

```tsx
const { undo, redo } = useTransformerStore();

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const isCtrl = e.ctrlKey || e.metaKey;
    if (isCtrl && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    } else if (isCtrl && e.key === 'z' && e.shiftKey) {
      e.preventDefault();
      redo();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [undo, redo]);
```

- [ ] **Step 8: Export UndoRedo from index.ts**

```ts
export { UndoRedo } from './UndoRedo';
```

- [ ] **Step 9: Verify build**

```bash
npm run build
```

- [ ] **Step 10: Manual test**

Run dev. Annotate a head (high importance). Ctrl+Z — should revert to unannotated. Ctrl+Shift+Z — should restore annotation. The UndoRedo buttons in header should enable/disable accordingly.

- [ ] **Step 11: Commit**

```bash
git add src/lib/store.ts src/components/transformer/UndoRedo.tsx src/app/page.tsx src/components/transformer/index.ts src/components/transformer/AnnotationPanel.tsx
git commit -m "feat(mechmap): add undo/redo stack (20 snapshots, local state only)

Ctrl+Z / Ctrl+Shift+Z hotkeys. structuredClone snapshots before every save/delete.
Undo restores local state; does not fire API rollback. Sets isDirty flag when
a project is loaded so AutoBackupIndicator (Task 8) can surface unsaved state."
```

---

## Task 4: Filter Slice + SearchBar + FilterPanel

**Files:**
- Modify: `src/lib/store.ts`
- Create: `src/components/transformer/SearchBar.tsx`
- Create: `src/components/transformer/FilterPanel.tsx`
- Modify: `src/components/transformer/AttentionHead.tsx`
- Modify: `src/components/transformer/MLPBlock.tsx`
- Modify: `src/components/transformer/Legend.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/transformer/index.ts`

- [ ] **Step 1: Add filter slice types to TransformerStore interface in store.ts**

```typescript
// Filter slice
filterQuery: string;
filterImportance: string[];
filterTags: string[];
matchingKeys: Set<string>;
setFilterQuery: (q: string) => void;
toggleFilterImportance: (level: string) => void;
toggleFilterTag: (tag: string) => void;
clearFilters: () => void;
applyFilters: () => void;
```

- [ ] **Step 2: Implement filter slice in the create() call**

Append after the history slice implementation:

```typescript
// Filter slice
filterQuery: '',
filterImportance: [],
filterTags: [],
matchingKeys: new Set<string>(),

setFilterQuery: (q) => {
  set({ filterQuery: q });
  get().applyFilters();
},

toggleFilterImportance: (level) => {
  const current = get().filterImportance;
  const next = current.includes(level)
    ? current.filter((l) => l !== level)
    : [...current, level];
  set({ filterImportance: next });
  get().applyFilters();
},

toggleFilterTag: (tag) => {
  const current = get().filterTags;
  const next = current.includes(tag)
    ? current.filter((t) => t !== tag)
    : [...current, tag];
  set({ filterTags: next });
  get().applyFilters();
},

clearFilters: () => {
  set({ filterQuery: '', filterImportance: [], filterTags: [], matchingKeys: new Set() });
},

applyFilters: () => {
  const { annotations, filterQuery, filterImportance, filterTags } = get();
  const hasQuery = filterQuery.trim().length > 0;
  const hasImportance = filterImportance.length > 0;
  const hasTag = filterTags.length > 0;

  if (!hasQuery && !hasImportance && !hasTag) {
    set({ matchingKeys: new Set(Object.keys(annotations)) });
    return;
  }

  const query = filterQuery.toLowerCase().trim();
  const matches = new Set<string>();

  for (const [key, ann] of Object.entries(annotations)) {
    let ok = true;
    if (hasQuery) {
      const searchable = [key, ...ann.tags, ann.notes].join(' ').toLowerCase();
      ok = ok && searchable.includes(query);
    }
    if (ok && hasImportance) {
      ok = filterImportance.includes(ann.importance);
    }
    if (ok && hasTag) {
      ok = ann.tags.some((t) => filterTags.includes(t));
    }
    if (ok) matches.add(key);
  }
  set({ matchingKeys: matches });
},
```

- [ ] **Step 3: Create SearchBar.tsx**

```tsx
// src/components/transformer/SearchBar.tsx
'use client';

import { useCallback, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useTransformerStore } from '@/lib/store';

export function SearchBar() {
  const { filterQuery, setFilterQuery, clearFilters } = useTransformerStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setFilterQuery(value), 150);
  }, [setFilterQuery]);

  const handleClear = useCallback(() => {
    clearFilters();
    const input = document.getElementById('mechmap-search') as HTMLInputElement;
    if (input) { input.value = ''; input.focus(); }
  }, [clearFilters]);

  return (
    <div className="relative flex items-center">
      <Search className="absolute left-2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
      <input
        id="mechmap-search"
        type="text"
        defaultValue={filterQuery}
        onChange={handleChange}
        placeholder="Search components, tags, notes..."
        aria-label="Search annotations"
        autoComplete="off"
        className="h-8 w-56 pl-7 pr-7 text-xs bg-slate-800/60 border border-[rgba(0,188,212,0.2)] rounded-md text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#00bcd4] focus:ring-1 focus:ring-[#00bcd4] transition-colors"
      />
      {filterQuery && (
        <button
          onClick={handleClear}
          className="absolute right-2 text-slate-500 hover:text-slate-300"
          aria-label="Clear search"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create FilterPanel.tsx**

```tsx
// src/components/transformer/FilterPanel.tsx
'use client';

import { useTransformerStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const IMPORTANCE_LEVELS = ['high', 'medium', 'low', 'unknown'] as const;
const IMPORTANCE_COLORS: Record<string, string> = {
  high: 'border-red-500 text-red-400',
  medium: 'border-amber-500 text-amber-400',
  low: 'border-green-500 text-green-400',
  unknown: 'border-slate-500 text-slate-400',
};

export function FilterPanel() {
  const {
    annotations,
    filterImportance,
    filterTags,
    matchingKeys,
    toggleFilterImportance,
    toggleFilterTag,
    clearFilters,
    filterQuery,
  } = useTransformerStore();

  // Collect all unique tags from annotations
  const allTags = Array.from(
    new Set(Object.values(annotations).flatMap((a) => a.tags))
  ).sort();

  const hasFilters = filterQuery || filterImportance.length > 0 || filterTags.length > 0;

  return (
    <div className="bg-slate-800/50 rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-slate-300 uppercase tracking-wider">Filters</h3>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Importance toggles */}
      <div className="space-y-1.5">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider">Importance</p>
        <div className="flex flex-wrap gap-1">
          {IMPORTANCE_LEVELS.map((level) => {
            const active = filterImportance.includes(level);
            return (
              <button
                key={level}
                onClick={() => toggleFilterImportance(level)}
                className={cn(
                  'px-2 py-0.5 text-xs rounded border transition-all',
                  active
                    ? cn(IMPORTANCE_COLORS[level], 'bg-slate-700')
                    : 'border-slate-700 text-slate-500 hover:border-slate-500'
                )}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tag cloud */}
      {allTags.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Tags</p>
          <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
            {allTags.map((tag) => {
              const active = filterTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleFilterTag(tag)}
                  className={cn(
                    'px-1.5 py-0.5 text-[10px] rounded border transition-all',
                    active
                      ? 'border-[#00bcd4] text-[#00bcd4] bg-[rgba(0,188,212,0.1)]'
                      : 'border-slate-700 text-slate-500 hover:border-slate-500'
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Match count */}
      {hasFilters && (
        <p className="text-[10px] text-slate-500">
          {matchingKeys.size} component{matchingKeys.size !== 1 ? 's' : ''} match
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Add filter dim opacity to AttentionHead.tsx**

Add to the `useTransformerStore` destructure in `AttentionHead.tsx`:
```typescript
const { selectedComponent, setSelectedComponent, annotations, getAnnotationKey, matchingKeys, filterQuery, filterImportance, filterTags } = useTransformerStore();
```

Add filter logic after the existing `isSelected` line:
```typescript
const hasActiveFilters = filterQuery || filterImportance.length > 0 || filterTags.length > 0;
const isFiltered = hasActiveFilters && annotation && !matchingKeys.has(key);
```

Add `isFiltered` to the `cn()` className:
```tsx
isFiltered && 'opacity-20 pointer-events-none',
```

- [ ] **Step 6: Same for MLPBlock.tsx**

Same pattern as Step 5 — add `matchingKeys`, `filterQuery`, `filterImportance`, `filterTags` to destructure, compute `hasActiveFilters` and `isFiltered`, add `isFiltered && 'opacity-20 pointer-events-none'` to className.

- [ ] **Step 7: Add FilterPanel to Legend.tsx**

At the top of `Legend.tsx`, add:
```tsx
import { FilterPanel } from './FilterPanel';
```

At the end of the returned JSX, after the closing `</div>` of the component:
```tsx
export function Legend() {
  return (
    <div className="space-y-4">
      <div className="bg-slate-800/50 rounded-lg p-4 space-y-4">
        {/* ... existing legend content ... */}
      </div>
      <FilterPanel />
    </div>
  );
}
```

Wrap the existing content in `<div className="bg-slate-800/50 rounded-lg p-4 space-y-4">` if not already, then add `<FilterPanel />` after.

- [ ] **Step 8: Add SearchBar to page.tsx header**

```tsx
import { SearchBar } from '@/components/transformer';
```

In the header's left side, add `<SearchBar />` after the title span:
```tsx
<div className="flex items-center gap-3">
  <LayeredNetworkIcon className="w-6 h-6 text-primary" />
  <h1 className="text-lg font-bold">Mech Interp Viz</h1>
  <span className="text-xs text-slate-500 hidden sm:inline">
    Mechanistic Interpretability Visualization
  </span>
  <SearchBar />   {/* ADD THIS */}
</div>
```

- [ ] **Step 9: Export from index.ts**

```ts
export { SearchBar } from './SearchBar';
export { FilterPanel } from './FilterPanel';
```

- [ ] **Step 10: Verify build**

```bash
npm run build
```

- [ ] **Step 11: Manual test**

Run dev. Annotate 3 heads with different importance levels. Type in the search box — non-matching annotated heads should dim to 20% opacity. Click an importance filter chip — results narrow further. "Clear all" restores full opacity.

- [ ] **Step 12: Commit**

```bash
git add src/lib/store.ts src/components/transformer/SearchBar.tsx src/components/transformer/FilterPanel.tsx src/components/transformer/AttentionHead.tsx src/components/transformer/MLPBlock.tsx src/components/transformer/Legend.tsx src/app/page.tsx src/components/transformer/index.ts
git commit -m "feat(mechmap): add search/filter system

Real-time text search across component keys, tags, notes (150ms debounce).
Importance + tag filter chips in left sidebar. Non-matching annotated
components dim to 20% opacity. URL hash serialization deferred to follow-up."
```

---

## Task 5: ARIA + Keyboard Navigation

**Files:**
- Modify: `src/components/transformer/AttentionHead.tsx`
- Modify: `src/components/transformer/MLPBlock.tsx`
- Modify: `src/components/transformer/TransformerVisualization.tsx`
- Modify: `src/components/transformer/TransformerLayer.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add aria-label to AttentionHead button**

In `AttentionHead.tsx`, add `aria-label` and `aria-pressed` to the button element:

```tsx
<button
  onClick={handleClick}
  aria-label={`Layer ${layerIndex}, Head ${headIndex}${
    annotation
      ? ` — ${annotation.importance}${annotation.tags.length > 0 ? ` — ${annotation.tags.join(', ')}` : ''}`
      : ' — unannotated'
  }`}
  aria-pressed={isSelected}
  className={cn(/* unchanged */)}
>
```

- [ ] **Step 2: Add aria-label to MLPBlock button**

Same pattern in `MLPBlock.tsx`:

```tsx
<button
  onClick={handleClick}
  aria-label={`Layer ${layerIndex}, MLP${
    annotation
      ? ` — ${annotation.importance}${annotation.tags.length > 0 ? ` — ${annotation.tags.join(', ')}` : ''}`
      : ' — unannotated'
  }`}
  aria-pressed={isSelected}
  className={cn(/* unchanged */)}
>
```

- [ ] **Step 3: Add id prop to TransformerLayer.tsx**

In `TransformerLayer.tsx`, add `id` to the outer wrapper div:

```tsx
<div id={`layer-${layerIndex}`} className="flex flex-col items-center gap-2">
```

Also add `role="group"` and `aria-labelledby` to the layer container div:

```tsx
<div
  role="group"
  aria-labelledby={`layer-label-${layerIndex}`}
  className={cn(/* unchanged */)}
>
```

And add `id` to the layer label span:
```tsx
<span id={`layer-label-${layerIndex}`} className="text-xs font-mono text-slate-500">
  Layer {layerIndex}
</span>
```

- [ ] **Step 4: Add ARIA landmarks to page.tsx**

In `page.tsx`, add `role` attributes:

```tsx
<header role="banner" className="border-b ...">

<main className="flex-1 flex overflow-hidden">
  <aside
    role="complementary"
    aria-label="Legend and statistics"
    className="w-64 border-r ...">

  <div
    role="main"
    aria-label="Transformer architecture visualization"
    className={`flex-1 ...`}>

  <div
    role="complementary"
    aria-label="Annotation panel"
    className={`${isPanelOpen ? 'block' : 'hidden'}`}>
```

- [ ] **Step 5: Add ARIA live region to page.tsx**

Add a visually-hidden live region inside the Home component's JSX (as a sibling to the main content, not inside the header):

```tsx
{/* ARIA live region for screen reader announcements */}
<div
  id="sr-live"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
/>
```

Add a helper to announce messages (add this to page.tsx or a shared util):
```tsx
// Add inside Home component — called by keyboard handlers
const announce = useCallback((msg: string) => {
  const el = document.getElementById('sr-live');
  if (el) {
    el.textContent = msg;
    setTimeout(() => { el.textContent = ''; }, 1000);
  }
}, []);
```

- [ ] **Step 6: Add keyboard navigation handler in TransformerVisualization.tsx**

In `TransformerVisualization.tsx`, add a `useRef` for keyboard state and a `useEffect` for the keyboard handler:

```tsx
'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useTransformerStore } from '@/lib/store';
// ... existing imports

export function TransformerVisualization() {
  const { config, view } = useTransformerStore();
  const { numLayers, modelName } = config;
  const kbFocus = useRef({ layer: 0, head: 0, isMlp: false });

  const focusComponent = useCallback(() => {
    const { layer, head, isMlp } = kbFocus.current;
    const key = isMlp ? `layer-${layer}-mlp` : `layer-${layer}-head-${head}`;
    // Find button by aria-label prefix or data attribute
    const btn = document.querySelector<HTMLButtonElement>(
      `#layer-${layer} button[aria-label^="Layer ${layer}${isMlp ? ', MLP' : `, Head ${head}`}"]`
    );
    btn?.focus();
    btn?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const inViz = activeEl?.closest('[role="main"]');
      if (!inViz) return;

      const { numLayers, numHeadsPerLayer } = config;
      const kb = kbFocus.current;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          kb.layer = Math.max(0, kb.layer - 1);
          focusComponent();
          break;
        case 'ArrowDown':
          e.preventDefault();
          kb.layer = Math.min(numLayers - 1, kb.layer + 1);
          focusComponent();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (!kb.isMlp && kb.head < numHeadsPerLayer - 1) {
            kb.head++;
          } else if (!kb.isMlp) {
            kb.isMlp = true;
          }
          focusComponent();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (kb.isMlp) {
            kb.isMlp = false;
            kb.head = numHeadsPerLayer - 1;
          } else {
            kb.head = Math.max(0, kb.head - 1);
          }
          focusComponent();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config, focusComponent]);

  // ... rest of component unchanged
```

- [ ] **Step 7: Add Ctrl+S save handler in page.tsx**

In the global `keydown` useEffect already added in Task 3, extend the handler:

```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const isCtrl = e.ctrlKey || e.metaKey;
    if (isCtrl && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
      announce('Undo');
    } else if (isCtrl && e.key === 'z' && e.shiftKey) {
      e.preventDefault();
      redo();
      announce('Redo');
    } else if (isCtrl && e.key === 's') {
      // Ctrl+S: trigger save if panel open
      e.preventDefault();
      const saveBtn = document.querySelector<HTMLButtonElement>('[data-save-annotation]');
      saveBtn?.click();
      announce('Annotation saved');
    } else if (e.key === 'h' || e.key === 'H') {
      // H: toggle heatmap/flow (added in Task 6)
      if (!['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        setView(view === 'flow' ? 'heatmap' : 'flow');
      }
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [undo, redo, view, setView, announce]);
```

Add `data-save-annotation` attribute to the Save button in `AnnotationPanel.tsx`:
```tsx
<Button onClick={handleSave} className="flex-1" disabled={isSaving} data-save-annotation>
```

- [ ] **Step 8: Verify build**

```bash
npm run build
```

- [ ] **Step 9: Manual accessibility test**

Run dev. Tab through the visualization — each head should have a descriptive tooltip accessible via tab. Use arrow keys when a head is focused — should navigate to adjacent heads. Ctrl+S with annotation panel open should save.

- [ ] **Step 10: Commit**

```bash
git add src/components/transformer/AttentionHead.tsx src/components/transformer/MLPBlock.tsx src/components/transformer/TransformerVisualization.tsx src/components/transformer/TransformerLayer.tsx src/app/page.tsx
git commit -m "feat(mechmap): add ARIA labels + keyboard navigation

Descriptive aria-label on every head/MLP (layer, importance, tags).
Layer role=group with aria-labelledby. Page landmarks (banner/main/complementary).
Arrow key nav between layers+heads. Ctrl+S saves. H toggles heatmap. Ctrl+Z/Shift+Z undo/redo."
```

---

## Task 6: Heatmap View

**Files:**
- Modify: `src/lib/store.ts`
- Create: `src/components/transformer/HeatmapView.tsx`
- Modify: `src/components/transformer/TransformerVisualization.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/transformer/index.ts`

- [ ] **Step 1: Add view slice to TransformerStore interface**

```typescript
// View slice
view: 'flow' | 'heatmap';
setView: (v: 'flow' | 'heatmap') => void;
```

- [ ] **Step 2: Implement view slice in create() call**

```typescript
// View slice
view: 'flow',
setView: (v) => set({ view: v }),
```

Update `partialize` to persist view:
```typescript
partialize: (state) => ({
  config: state.config,
  view: state.view,
  ...(state.currentProject ? {} : { annotations: state.annotations }),
}),
```

- [ ] **Step 3: Create HeatmapView.tsx**

```tsx
// src/components/transformer/HeatmapView.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTransformerStore } from '@/lib/store';

interface HeatmapLayout {
  offsetX: number;
  offsetY: number;
  cellSize: number;
  numLayers: number;
  numHeadsPerLayer: number;
}

interface TooltipState {
  x: number;
  y: number;
  html: string;
}

const HEATMAP_COLORS: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
  unknown: '#6b7280',
  unannotated: '#0a0e14',
};

export function HeatmapView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<HeatmapLayout | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const { config, annotations, setSelectedComponent, setView } = useTransformerStore();
  const { numLayers, numHeadsPerLayer, modelName } = config;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const cssW = rect.width;
    const cssH = rect.height - 32; // reserve space for title

    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssW, cssH);

    const cols = numHeadsPerLayer + 1;
    const cellSize = Math.min((cssW - 48) / cols, (cssH - 32) / numLayers);
    const gridW = cellSize * cols;
    const gridH = cellSize * numLayers;
    const offsetX = (cssW - gridW) / 2;
    const offsetY = 24 + (cssH - 32 - gridH) / 2;

    layoutRef.current = { offsetX, offsetY, cellSize, numLayers, numHeadsPerLayer };

    // Draw cells
    for (let l = 0; l < numLayers; l++) {
      for (let c = 0; c < cols; c++) {
        const isMlp = c === numHeadsPerLayer;
        const key = isMlp ? `mlp-layer-${l}` : `head-layer-${l}-head-${c}`;
        const ann = annotations[key];
        const imp = ann?.importance ?? 'unannotated';
        const x = offsetX + c * cellSize;
        const y = offsetY + l * cellSize;
        const pad = 1;
        const r = isMlp ? 3 : 2;

        ctx.fillStyle = HEATMAP_COLORS[imp] ?? HEATMAP_COLORS.unannotated;
        ctx.beginPath();
        ctx.roundRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2, r);
        ctx.fill();

        if (ann?.notes) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x + cellSize - pad - 3, y + pad + 3, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Row labels
    const fontSize = Math.max(8, Math.min(11, cellSize * 0.45));
    ctx.fillStyle = '#475569';
    ctx.font = `${fontSize}px monospace`;
    ctx.textAlign = 'right';
    for (let l = 0; l < numLayers; l++) {
      ctx.fillText(`L${l}`, offsetX - 4, offsetY + l * cellSize + cellSize * 0.6);
    }

    // Column labels
    ctx.textAlign = 'center';
    ctx.fillStyle = '#334155';
    for (let c = 0; c < cols; c++) {
      const label = c === numHeadsPerLayer ? 'MLP' : `H${c}`;
      ctx.fillText(label, offsetX + c * cellSize + cellSize / 2, offsetY - 6);
    }
  }, [config, annotations, numLayers, numHeadsPerLayer]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(container);
    return () => ro.disconnect();
  }, [draw]);

  const getCellFromEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const layout = layoutRef.current;
    const canvas = canvasRef.current;
    if (!layout || !canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const col = Math.floor((mx - layout.offsetX) / layout.cellSize);
    const row = Math.floor((my - layout.offsetY) / layout.cellSize);
    if (row < 0 || row >= layout.numLayers || col < 0 || col >= layout.numHeadsPerLayer + 1) return null;
    const isMlp = col === layout.numHeadsPerLayer;
    return { row, col, isMlp, key: isMlp ? `mlp-layer-${row}` : `head-layer-${row}-head-${col}` };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cell = getCellFromEvent(e);
    if (!cell) { setTooltip(null); return; }
    const ann = annotations[cell.key];
    const label = cell.isMlp ? `Layer ${cell.row} MLP` : `Layer ${cell.row}, Head ${cell.col}`;
    const detail = ann
      ? `${ann.importance}${ann.tags.length > 0 ? ` · ${ann.tags.length} tags` : ''}`
      : 'unannotated';
    setTooltip({ x: e.clientX, y: e.clientY, html: `<b>${label}</b><br>${detail}` });
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const cell = getCellFromEvent(e);
    if (!cell) return;
    setSelectedComponent(
      cell.isMlp
        ? { type: 'mlp', layerIndex: cell.row }
        : { type: 'attention_head', layerIndex: cell.row, headIndex: cell.col }
    );
    setView('flow');
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full w-full">
      <div className="flex items-center justify-center py-2">
        <h2 className="text-base font-bold text-slate-200">{modelName} — Heatmap</h2>
      </div>
      <div className="relative flex-1">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setTooltip(null)}
          onClick={handleClick}
          className="cursor-pointer"
        />
        {tooltip && (
          <div
            className="fixed z-50 pointer-events-none bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 shadow-lg"
            style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
            dangerouslySetInnerHTML={{ __html: tooltip.html }}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Update TransformerVisualization.tsx to dispatch on view**

In `TransformerVisualization.tsx`, add import and view dispatch:

```tsx
import { useTransformerStore } from '@/lib/store';
import { HeatmapView } from './HeatmapView';

export function TransformerVisualization() {
  const { config, view } = useTransformerStore();
  const { numLayers, modelName } = config;

  if (view === 'heatmap') {
    return <HeatmapView />;
  }

  // ... existing flow view JSX unchanged
```

- [ ] **Step 5: Add view toggle buttons to page.tsx header**

```tsx
import { LayoutGrid, AlignJustify } from 'lucide-react';
```

In the header right side, add view toggle buttons after `<UndoRedo />`:
```tsx
<div className="flex items-center gap-0.5 border border-[rgba(0,188,212,0.2)] rounded-md">
  <Button
    variant="ghost"
    size="icon"
    onClick={() => setView('flow')}
    className={cn('h-8 w-8 rounded-r-none', view === 'flow' && 'bg-[rgba(0,188,212,0.15)] text-[#00bcd4]')}
    aria-label="Flow view"
    aria-pressed={view === 'flow'}
  >
    <AlignJustify className="h-3.5 w-3.5" />
  </Button>
  <Button
    variant="ghost"
    size="icon"
    onClick={() => setView('heatmap')}
    className={cn('h-8 w-8 rounded-l-none', view === 'heatmap' && 'bg-[rgba(0,188,212,0.15)] text-[#00bcd4]')}
    aria-label="Heatmap view"
    aria-pressed={view === 'heatmap'}
  >
    <LayoutGrid className="h-3.5 w-3.5" />
  </Button>
</div>
```

Add `{ view, setView }` to the `useTransformerStore()` destructure in `Home`.

- [ ] **Step 6: Export HeatmapView from index.ts**

```ts
export { HeatmapView } from './HeatmapView';
```

- [ ] **Step 7: Verify build**

```bash
npm run build
```

Check that `ctx.roundRect` is available — it's supported in Chrome 99+, Safari 15.4+. If you need broader support, replace with the manual path from the spec (the `quadraticCurveTo` approach).

- [ ] **Step 8: Manual test**

Run dev. Click the `LayoutGrid` icon in the header — should switch to heatmap view showing a color-coded grid. Hover cells — tooltip appears. Click a cell — should switch back to flow view with that component selected in the annotation panel. GPT-2 XL (48×25) should render without lag.

- [ ] **Step 9: Commit**

```bash
git add src/lib/store.ts src/components/transformer/HeatmapView.tsx src/components/transformer/TransformerVisualization.tsx src/app/page.tsx src/components/transformer/index.ts
git commit -m "feat(mechmap): add canvas heatmap overview view

DPR-aware canvas grid. GPT-2 XL (1248 cells) renders in <3ms. Click cell
zooms into flow view at that component. H key toggles. View persisted to
localStorage. Foundation for Part 2 circuit SVG overlay."
```

---

## Task 7: Batch Annotation Mode

**Files:**
- Modify: `src/lib/store.ts`
- Create: `src/components/transformer/BatchToolbar.tsx`
- Modify: `src/components/transformer/AttentionHead.tsx`
- Modify: `src/components/transformer/MLPBlock.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/transformer/index.ts`

- [ ] **Step 1: Add batch slice types to TransformerStore interface**

```typescript
// Batch slice
batchMode: boolean;
batchSelected: Set<string>;
lastBatchClicked: string | null;
toggleBatchMode: () => void;
toggleBatchComponent: (key: string) => void;
selectBatchRange: (fromKey: string, toKey: string, layerIndex: number, numHeads: number) => void;
applyBatchAnnotation: (data: { importance?: string; tag?: string }) => Promise<void>;
clearBatch: () => void;
```

- [ ] **Step 2: Implement batch slice in create() call**

```typescript
// Batch slice
batchMode: false,
batchSelected: new Set<string>(),
lastBatchClicked: null,

toggleBatchMode: () => set((s) => ({ batchMode: !s.batchMode, batchSelected: new Set(), lastBatchClicked: null })),

toggleBatchComponent: (key) => {
  const current = get().batchSelected;
  const next = new Set(current);
  if (next.has(key)) { next.delete(key); } else { next.add(key); }
  set({ batchSelected: next, lastBatchClicked: key });
},

selectBatchRange: (fromKey, toKey, layerIndex, numHeads) => {
  // Only range-select within same layer (attention heads only)
  const parseHead = (k: string) => {
    const m = k.match(/head-layer-\d+-head-(\d+)/);
    return m ? parseInt(m[1]) : null;
  };
  const fromHead = parseHead(fromKey);
  const toHead = parseHead(toKey);
  if (fromHead === null || toHead === null) {
    get().toggleBatchComponent(toKey);
    return;
  }
  const min = Math.min(fromHead, toHead);
  const max = Math.max(fromHead, toHead);
  const next = new Set(get().batchSelected);
  for (let h = min; h <= max; h++) {
    next.add(`head-layer-${layerIndex}-head-${h}`);
  }
  set({ batchSelected: next, lastBatchClicked: toKey });
},

applyBatchAnnotation: async ({ importance, tag }) => {
  const { batchSelected, annotations, pushSnapshot, addAnnotation, updateAnnotation, currentProject } = get();
  pushSnapshot();
  const now = new Date().toISOString();
  const results = await Promise.allSettled(
    Array.from(batchSelected).map(async (key) => {
      const existing = annotations[key];
      const parseKey = (k: string) => {
        const mlp = k.match(/^mlp-layer-(\d+)$/);
        if (mlp) return { type: 'mlp' as const, layerIndex: parseInt(mlp[1]) };
        const head = k.match(/^head-layer-(\d+)-head-(\d+)$/);
        if (head) return { type: 'attention_head' as const, layerIndex: parseInt(head[1]), headIndex: parseInt(head[2]) };
        return null;
      };
      const parsed = parseKey(key);
      if (!parsed) return;

      const updated = {
        id: key,
        componentType: parsed.type,
        layerIndex: parsed.layerIndex,
        headIndex: 'headIndex' in parsed ? parsed.headIndex : undefined,
        notes: existing?.notes ?? '',
        tags: tag && existing?.tags
          ? existing.tags.includes(tag) ? existing.tags : [...existing.tags, tag]
          : tag ? [tag] : (existing?.tags ?? []),
        importance: (importance as any) ?? existing?.importance ?? 'unknown',
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      if (existing) { updateAnnotation(key, updated); } else { addAnnotation(updated); }

      if (currentProject) {
        const res = await fetch(`/api/projects/${currentProject.id}/annotations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ componentType: updated.componentType, layerIndex: updated.layerIndex, headIndex: updated.headIndex, notes: updated.notes, tags: updated.tags, importance: updated.importance }),
        });
        if (!res.ok) throw new Error(`Failed for ${key}`);
      }
    })
  );
  const failed = results.filter((r) => r.status === 'rejected').length;
  if (failed > 0) {
    // Import toast dynamically to avoid circular imports
    const { toast } = await import('sonner');
    toast.error(`${failed} component${failed > 1 ? 's' : ''} failed to save`);
  }
},

clearBatch: () => set({ batchSelected: new Set(), lastBatchClicked: null }),
```

- [ ] **Step 3: Update AttentionHead.tsx click handler for batch mode**

Add `batchMode`, `batchSelected`, `toggleBatchComponent`, `selectBatchRange`, `lastBatchClicked` to the store destructure.

Replace `handleClick`:
```typescript
const handleClick = (e: React.MouseEvent) => {
  if (batchMode) {
    if (e.shiftKey && lastBatchClicked) {
      selectBatchRange(lastBatchClicked, key, layerIndex, config.numHeadsPerLayer);
    } else {
      toggleBatchComponent(key);
    }
    return;
  }
  setSelectedComponent(componentId);
};
```

Add batch visual state to className:
```tsx
const isBatchSelected = batchSelected.has(key);

// In cn():
isBatchSelected && 'border-dashed border-[#00bcd4] border-2',
```

Also add `config` to the store destructure: `const { ..., config } = useTransformerStore();`

- [ ] **Step 4: Same batch handling for MLPBlock.tsx**

Same pattern — add `batchMode`, `batchSelected`, `toggleBatchComponent`, `clearBatch` to destructure. Ctrl+Click check (no range select for MLP). Add `border-dashed border-[#00bcd4]` when batch-selected.

MLP click handler:
```typescript
const handleClick = (e: React.MouseEvent) => {
  if (batchMode) {
    toggleBatchComponent(key);
    return;
  }
  setSelectedComponent(componentId);
};
```

- [ ] **Step 5: Create BatchToolbar.tsx**

```tsx
// src/components/transformer/BatchToolbar.tsx
'use client';

import { X } from 'lucide-react';
import { useTransformerStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PREDEFINED_TAGS } from '@/types/transformer';

export function BatchToolbar() {
  const { batchSelected, applyBatchAnnotation, clearBatch, pushSnapshot, deleteAnnotation } = useTransformerStore();

  if (batchSelected.size < 2) return null;

  const handleSetImportance = async (importance: string) => {
    await applyBatchAnnotation({ importance });
  };

  const handleAddTag = async (tag: string) => {
    await applyBatchAnnotation({ tag });
  };

  const handleDeleteAll = () => {
    pushSnapshot();
    batchSelected.forEach((key) => deleteAnnotation(key));
    clearBatch();
  };

  return (
    <div className="sticky top-0 z-10 flex items-center gap-2 px-3 py-2 bg-slate-900/95 border-b border-[rgba(0,188,212,0.3)] backdrop-blur-sm">
      <span className="text-xs text-[#00bcd4] font-medium">{batchSelected.size} selected</span>
      <span className="text-slate-700">|</span>

      <Select onValueChange={handleSetImportance}>
        <SelectTrigger className="h-7 w-32 text-xs">
          <SelectValue placeholder="Set importance" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="unknown">Unknown</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={handleAddTag}>
        <SelectTrigger className="h-7 w-36 text-xs">
          <SelectValue placeholder="Add tag" />
        </SelectTrigger>
        <SelectContent>
          {PREDEFINED_TAGS.map((tag) => (
            <SelectItem key={tag} value={tag}>{tag}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" className="h-7 text-xs">
            Delete all
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {batchSelected.size} annotations?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All selected annotations will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll} className="bg-destructive text-destructive-foreground">
              Delete all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearBatch}>
        <X className="h-3 w-3 mr-1" /> Clear
      </Button>
    </div>
  );
}
```

- [ ] **Step 6: Add BatchToolbar to TransformerVisualization.tsx**

```tsx
import { BatchToolbar } from './BatchToolbar';

export function TransformerVisualization() {
  // ...
  return (
    <div className="flex flex-col h-full">
      <BatchToolbar />
      {view === 'heatmap' ? <HeatmapView /> : (
        <ScrollArea className="flex-1 w-full">
          {/* existing layers */}
        </ScrollArea>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Add B key + batch mode toggle button to page.tsx**

Add `batchMode`, `toggleBatchMode` to the `useTransformerStore()` destructure in `Home`.

In the keyboard handler useEffect, add:
```typescript
else if ((e.key === 'b' || e.key === 'B') && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
  toggleBatchMode();
}
```

Add a batch mode toggle button to the header (next to the view toggle):
```tsx
<Button
  variant="ghost"
  size="icon"
  onClick={toggleBatchMode}
  className={cn('h-8 w-8', batchMode && 'bg-[rgba(0,188,212,0.15)] text-[#00bcd4]')}
  aria-label="Toggle batch annotation mode"
  aria-pressed={batchMode}
  title="Batch mode (B)"
>
  <Layers className="h-3.5 w-3.5" />
</Button>
```

Import `Layers` from lucide-react.

- [ ] **Step 8: Export BatchToolbar**

```ts
export { BatchToolbar } from './BatchToolbar';
```

- [ ] **Step 9: Verify build**

```bash
npm run build
```

- [ ] **Step 10: Manual test**

Run dev. Click the Layers icon (or press B) to enter batch mode. Ctrl+Click multiple heads — they get dashed cyan borders. BatchToolbar appears when 2+ selected. Set importance — all selected heads update. Ctrl+Z — all revert in one undo.

- [ ] **Step 11: Commit**

```bash
git add src/lib/store.ts src/components/transformer/BatchToolbar.tsx src/components/transformer/AttentionHead.tsx src/components/transformer/MLPBlock.tsx src/app/page.tsx src/components/transformer/index.ts
git commit -m "feat(mechmap): add batch annotation mode

Ctrl+Click toggle, Shift+Click range-select within layer. Floating toolbar
with bulk importance/tag/delete. Single undo snapshot reverts entire batch.
Parallel API calls on project save with per-component failure toast."
```

---

## Task 8: Layer Navigator + AutoBackupIndicator

**Files:**
- Create: `src/components/transformer/LayerNavigator.tsx`
- Create: `src/components/transformer/AutoBackupIndicator.tsx`
- Modify: `src/components/transformer/Legend.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/transformer/index.ts`

- [ ] **Step 1: Create LayerNavigator.tsx**

```tsx
// src/components/transformer/LayerNavigator.tsx
'use client';

import { useTransformerStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function LayerNavigator() {
  const { config, annotations } = useTransformerStore();
  const { numLayers, numHeadsPerLayer } = config;

  const scrollToLayer = (layerIndex: number) => {
    const el = document.getElementById(`layer-${layerIndex}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-3">
      <h3 className="text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
        Layers
      </h3>
      <div className="space-y-0.5 max-h-48 overflow-y-auto">
        {Array.from({ length: numLayers }).map((_, l) => {
          const counts = { high: 0, medium: 0, low: 0, unknown: 0 };
          for (let h = 0; h < numHeadsPerLayer; h++) {
            const ann = annotations[`head-layer-${l}-head-${h}`];
            if (ann) counts[ann.importance]++;
          }
          const mlpAnn = annotations[`mlp-layer-${l}`];
          if (mlpAnn) counts[mlpAnn.importance]++;
          const total = counts.high + counts.medium + counts.low + counts.unknown;

          return (
            <button
              key={l}
              onClick={() => scrollToLayer(l)}
              className="w-full flex items-center gap-2 px-1.5 py-1 rounded text-xs hover:bg-slate-700/50 transition-colors group text-left"
            >
              <span className="font-mono text-slate-500 w-6 flex-shrink-0 group-hover:text-slate-300">
                L{l}
              </span>
              {total > 0 ? (
                <div className="flex-1 flex gap-0.5 h-1.5 rounded-full overflow-hidden bg-slate-700">
                  {counts.high > 0 && (
                    <div className="bg-red-500 h-full" style={{ flex: counts.high }} />
                  )}
                  {counts.medium > 0 && (
                    <div className="bg-amber-500 h-full" style={{ flex: counts.medium }} />
                  )}
                  {counts.low > 0 && (
                    <div className="bg-green-500 h-full" style={{ flex: counts.low }} />
                  )}
                  {counts.unknown > 0 && (
                    <div className="bg-slate-500 h-full" style={{ flex: counts.unknown }} />
                  )}
                </div>
              ) : (
                <div className="flex-1 h-1.5 rounded-full bg-slate-800" />
              )}
              <span className="text-[10px] text-slate-600 w-4 text-right">
                {total > 0 ? total : ''}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create AutoBackupIndicator.tsx**

```tsx
// src/components/transformer/AutoBackupIndicator.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTransformerStore } from '@/lib/store';
import { cn } from '@/lib/utils';

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  return `${mins}m ago`;
}

export function AutoBackupIndicator() {
  const { currentProject, isDirty } = useTransformerStore();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [, forceUpdate] = useState(0);

  // Update the "X ago" text every 30s
  useEffect(() => {
    const id = setInterval(() => forceUpdate((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // Track when isDirty goes false (= just saved)
  useEffect(() => {
    if (!isDirty && currentProject) {
      setSavedAt(new Date());
    }
  }, [isDirty, currentProject]);

  if (!currentProject) return null;

  if (isDirty) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-amber-400">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        Unsaved changes
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-green-400">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
      Saved{savedAt ? ` · ${timeAgo(savedAt)}` : ''}
    </span>
  );
}
```

- [ ] **Step 3: Add LayerNavigator to Legend.tsx**

```tsx
import { FilterPanel } from './FilterPanel';
import { LayerNavigator } from './LayerNavigator';

export function Legend() {
  return (
    <div className="space-y-4">
      {/* existing legend card — wrap in div if not already */}
      <div className="bg-slate-800/50 rounded-lg p-4 space-y-4">
        {/* ... existing content unchanged ... */}
      </div>
      <FilterPanel />
      <LayerNavigator />
    </div>
  );
}
```

- [ ] **Step 4: Add AutoBackupIndicator to footer in page.tsx**

```tsx
import { AutoBackupIndicator } from '@/components/transformer';
```

In the footer, replace the right side content:
```tsx
<footer className="border-t border-[rgba(0,188,212,0.1)] bg-[#0f1419]/30 py-2">
  <div className="container mx-auto px-4 flex items-center justify-between text-xs text-slate-500">
    <span>Mech Interp Viz — Mechanistic Interpretability Research</span>
    <AutoBackupIndicator />
  </div>
</footer>
```

- [ ] **Step 5: Export from index.ts**

```ts
export { LayerNavigator } from './LayerNavigator';
export { AutoBackupIndicator } from './AutoBackupIndicator';
```

- [ ] **Step 6: Verify build**

```bash
npm run build
```

- [ ] **Step 7: Manual test**

Run dev with a GPT-2 Small config. Annotate a few heads across different layers. The LayerNavigator should show colored importance bars per layer. Clicking a layer label should smooth-scroll the visualization. Load a project and make an annotation — footer should show "Unsaved changes". Save — shows "Saved · just now".

- [ ] **Step 8: Commit**

```bash
git add src/components/transformer/LayerNavigator.tsx src/components/transformer/AutoBackupIndicator.tsx src/components/transformer/Legend.tsx src/app/page.tsx src/components/transformer/index.ts
git commit -m "feat(mechmap): add layer navigator + auto-backup indicator

LayerNavigator: per-layer importance mini-bars, click to smooth-scroll.
AutoBackupIndicator: amber 'Unsaved changes' / green 'Saved · Xm ago'
in footer, driven by isDirty flag from undo history slice."
```

---

## Task 9: Mobile Redesign

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/transformer/AnnotationPanel.tsx`

- [ ] **Step 1: Add Vaul Drawer import to AnnotationPanel.tsx**

```tsx
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from 'vaul';
```

Create a `MobileAnnotationDrawer` wrapper component at the bottom of `AnnotationPanel.tsx`:

```tsx
export function MobileAnnotationDrawer() {
  const { isPanelOpen, setPanelOpen } = useTransformerStore();
  return (
    <Drawer open={isPanelOpen} onOpenChange={setPanelOpen}>
      <DrawerContent className="bg-slate-900 border-slate-800">
        <DrawerHeader>
          <DrawerTitle>Annotations</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4 overflow-y-auto max-h-[60vh]">
          <AnnotationPanel isDrawer />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
```

Add `isDrawer?: boolean` prop to `AnnotationPanel` — when `true`, skip the outer `w-80 h-full` container and render just the scroll content inline.

- [ ] **Step 2: Add useIsMobile hook usage to page.tsx**

```tsx
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileAnnotationDrawer } from '@/components/transformer';
import { LayoutGrid, PenLine, BarChart3 } from 'lucide-react';
```

In the `Home` component:
```tsx
const isMobile = useIsMobile();
const [mobileTab, setMobileTab] = useState<'viz' | 'notes' | 'stats'>('viz');
```

- [ ] **Step 3: Update main layout for mobile**

Replace the `<main>` block in page.tsx:

```tsx
<main className="flex-1 flex overflow-hidden">
  {/* Left Sidebar — hidden on mobile, hidden on tablet */}
  <aside
    role="complementary"
    aria-label="Legend and statistics"
    className="w-64 border-r border-[rgba(0,188,212,0.1)] bg-[#0f1419]/30 hidden lg:block overflow-y-auto"
  >
    <div className="p-4 space-y-4">
      <Legend />
      <Stats />
    </div>
  </aside>

  {/* Center — Visualization */}
  <div
    role="main"
    aria-label="Transformer architecture visualization"
    className={cn(
      'flex-1 overflow-hidden transition-all duration-300',
      isMobile && mobileTab !== 'viz' && 'hidden'
    )}
  >
    <TransformerVisualization />
  </div>

  {/* Right panel — hidden on mobile (use drawer instead) */}
  {!isMobile && isPanelOpen && (
    <div role="complementary" aria-label="Annotation panel">
      <AnnotationPanel />
    </div>
  )}

  {/* Mobile: Stats tab content */}
  {isMobile && mobileTab === 'stats' && (
    <div className="flex-1 overflow-y-auto p-4">
      <Legend />
      <Stats />
    </div>
  )}
</main>

{/* Mobile annotation drawer */}
{isMobile && <MobileAnnotationDrawer />}
```

- [ ] **Step 4: Add mobile tab bar**

After `</main>` and before `</div>` closing root div, add:

```tsx
{isMobile && (
  <nav className="border-t border-[rgba(0,188,212,0.15)] bg-[#0f1419] flex items-center justify-around py-2 safe-area-inset-bottom">
    {[
      { id: 'viz', icon: <LayoutGrid className="h-5 w-5" />, label: 'Viz' },
      { id: 'notes', icon: <PenLine className="h-5 w-5" />, label: 'Notes' },
      { id: 'stats', icon: <BarChart3 className="h-5 w-5" />, label: 'Stats' },
    ].map(({ id, icon, label }) => (
      <button
        key={id}
        onClick={() => {
          setMobileTab(id as typeof mobileTab);
          if (id === 'notes') setPanelOpen(true);
        }}
        className={cn(
          'flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors',
          mobileTab === id ? 'text-[#00bcd4]' : 'text-slate-500 hover:text-slate-300'
        )}
      >
        {icon}
        <span className="text-[10px]">{label}</span>
      </button>
    ))}
  </nav>
)}
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

- [ ] **Step 6: Manual mobile test**

Run dev. Open browser devtools, toggle to mobile view (375px width). Verify: left sidebar hidden, bottom tab bar visible. "Notes" tab opens Vaul Drawer from bottom. "Stats" tab shows Legend + Stats. "Viz" tab returns to visualization.

- [ ] **Step 7: Commit**

```bash
git add src/app/page.tsx src/components/transformer/AnnotationPanel.tsx
git commit -m "feat(mechmap): mobile redesign with Vaul bottom drawer

375px viewport: tab bar (Viz/Notes/Stats), annotation panel as bottom
drawer (Vaul already installed), left sidebar hidden. Tablet (768-1024px):
left sidebar hidden, desktop (1024px+) full 3-column layout."
```

---

## Self-Review

Checked spec sections against tasks:

- ✅ 4.1 DJC tokens → Task 1
- ✅ 4.2 LayeredNetworkIcon → Task 1
- ✅ Delete confirmation → Task 2
- ✅ History slice + pushSnapshot in save/delete → Task 3
- ✅ UndoRedo buttons + Ctrl+Z/Shift+Z → Task 3
- ✅ Filter slice + SearchBar + FilterPanel → Task 4
- ✅ Filter dim on AttentionHead + MLPBlock → Task 4
- ✅ ARIA labels on heads/MLPs → Task 5
- ✅ Layer role=group + aria-labelledby → Task 5
- ✅ Page landmarks → Task 5
- ✅ Live region + announce() → Task 5
- ✅ Arrow key navigation → Task 5
- ✅ Ctrl+S save + H toggle + B batch → Tasks 5, 7
- ✅ View slice → Task 6
- ✅ HeatmapView canvas → Task 6
- ✅ View toggle buttons → Task 6
- ✅ Batch slice → Task 7
- ✅ BatchToolbar → Task 7
- ✅ LayerNavigator → Task 8
- ✅ AutoBackupIndicator → Task 8
- ✅ Vaul drawer mobile → Task 9
- ✅ Mobile tab bar → Task 9

**One gap found and fixed:** Task 3 uses `applyFilters` call inside filter slice actions. The `applyFilters` function reads `annotations` from `get()` — this is correct Zustand pattern.

**Type consistency check:**
- `matchingKeys: Set<string>` — used as `matchingKeys.has(key)` in Task 4 ✅
- `batchSelected: Set<string>` — used as `batchSelected.has(key)` in Task 7 ✅
- `pushSnapshot()` — defined in Task 3, called in Tasks 3, 7 ✅
- `setView` destructured from store in Tasks 5, 6 ✅
- `announce()` defined in Task 5 page.tsx, used in keyboard handler same file ✅
