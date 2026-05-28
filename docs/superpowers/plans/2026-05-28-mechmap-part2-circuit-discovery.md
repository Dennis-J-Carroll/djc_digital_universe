# MechMap Part 2 — Circuit Discovery UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the circuit discovery UI on top of the `mechmap-viz/` Next.js app — researchers click heads/MLPs to build ordered circuit paths (induction circuits, IOI Name Mover circuits, etc.), visualized as SVG arrows on the heatmap canvas, stored in Prisma DB.

**Architecture:** SVG layer (`CircuitOverlay`) absolutely positioned over the heatmap canvas. Circuit state in a new Zustand slice. Right panel toggles between annotation mode and circuit mode. Three circuit templates (Induction, IOI, Blank). Aletheia taxonomy throughout: AND/OR edge labels, denoising/noising patching scores, confidence auto-classification.

**Tech Stack:** Same as Part 1 + `@dnd-kit/sortable` (already installed for node reorder), Prisma SQLite migration (3 new PathNode fields), existing `/api/projects/[id]/circuits` and `/api/circuits/[id]` API routes.

**Prerequisite:** Part 1 Task 6 (heatmap canvas) must be merged before Task 7 of this plan.

**Working directory for all commands:** `mechmap-viz/`

---

## File Map

### New files
- `src/components/transformer/CircuitOverlay.tsx` — SVG arrows over heatmap canvas
- `src/components/transformer/CircuitPanel.tsx` — right panel in circuit mode
- `src/components/transformer/CircuitList.tsx` — left sidebar circuit list
- `src/components/transformer/CircuitNodeRow.tsx` — single draggable node row
- `src/components/transformer/CircuitTemplates.tsx` — new circuit modal with templates
- `src/components/transformer/CircuitBuildBanner.tsx` — header build mode indicator
- `src/hooks/useCircuits.ts` — API hook for circuit CRUD

### Modified files
- `prisma/schema.prisma` — 3 new PathNode fields
- `src/lib/store.ts` — circuit slice appended
- `src/components/transformer/HeatmapView.tsx` — mount CircuitOverlay + expose heatmapLayout ref
- `src/components/transformer/AttentionHead.tsx` — circuit build mode click handler, in-circuit ring
- `src/components/transformer/MLPBlock.tsx` — same
- `src/components/transformer/AnnotationPanel.tsx` — toggle to CircuitPanel when circuit active
- `src/components/transformer/Legend.tsx` — add CircuitList below existing sections
- `src/app/page.tsx` — CircuitBuildBanner in header, C key, load circuits on project change
- `src/components/transformer/index.ts` — export new components
- `src/app/api/projects/[id]/circuits/route.ts` — accept new PathNode fields
- `src/app/api/circuits/[id]/route.ts` — accept new PathNode fields

---

## Task 1: Prisma Migration + API Updates

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `src/app/api/projects/[id]/circuits/route.ts`
- Modify: `src/app/api/circuits/[id]/route.ts`

- [ ] **Step 1: Add 3 fields to PathNode in schema.prisma**

Find the `PathNode` model and append before the closing `}`:
```prisma
connectionType  String?  // 'and' | 'or' — edge FROM this node TO the next
denoisingScore  Float?   // 0.0–1.0, from activation patching (tests sufficiency)
noisingScore    Float?   // 0.0–1.0, from activation patching (tests necessity)
```

- [ ] **Step 2: Run migration**

```bash
npx prisma migrate dev --name add_pathnode_patching_fields
```
Expected: migration created and applied. Existing rows unaffected (all fields nullable).

```bash
npx prisma generate
```
Expected: client regenerated.

- [ ] **Step 3: Read existing circuits API route**

```bash
cat src/app/api/projects/[id]/circuits/route.ts
```

Note the POST body schema. Add `connectionType`, `denoisingScore`, `noisingScore` to any Zod schema or manual validation present. Pass them through to `prisma.pathNode.create()` / `prisma.pathNode.update()` calls.

- [ ] **Step 4: Read circuits/[id] route and add new fields**

```bash
cat src/app/api/circuits/[id]/route.ts
```

Add the three new fields to PUT body handling and to Prisma update calls.

Also add a `PATCH /api/circuits/[id]/reorder` endpoint (or handle in PUT) that accepts `{ nodeIds: string[] }` and re-creates all nodes with new positions:

```typescript
// In circuits/[id]/route.ts, add to PUT handler or as separate handler:
// PATCH body: { nodeIds: string[] }
// Implementation: delete all PathNodes for the circuit, re-insert with position = index
// This avoids the @@unique([circuitPathId, position]) constraint collision on reorder.
if (method === 'PATCH') {
  const { nodeIds } = await req.json();
  await prisma.$transaction([
    prisma.pathNode.deleteMany({ where: { circuitPathId: id } }),
    ...nodeIds.map((nodeId: string, position: number) =>
      prisma.pathNode.update({ where: { id: nodeId }, data: { position } })
    ),
  ]);
  // Fetch and return updated circuit
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/migrations src/app/api/projects src/app/api/circuits
git commit -m "feat(mechmap): Prisma migration — add PathNode patching fields

connectionType: 'and'|'or' (Aletheia AND/OR gate topology).
denoisingScore + noisingScore: Float 0.0-1.0 (activation patching results).
All nullable — zero breaking changes to existing data."
```

---

## Task 2: Circuit Slice + useCircuits Hook

**Files:**
- Modify: `src/lib/store.ts`
- Create: `src/hooks/useCircuits.ts`

- [ ] **Step 1: Define circuit types — add to src/types/transformer.ts**

```typescript
export interface PathNodeData {
  id: string;
  position: number;
  componentType: 'attention_head' | 'mlp';
  layerIndex: number;
  headIndex?: number;
  role?: string;      // 'source' | 'relay' | 'amplifier' | 'inhibitor' | 'sink'
  signalType?: string; // 'positional' | 'content' | 'name' | 'fact' | 'pattern'
  notes?: string;
  connectionType?: 'and' | 'or'; // edge FROM this node TO next
  denoisingScore?: number;
  noisingScore?: number;
  annotationId?: string;
}

export interface CircuitPath {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  circuitType: string; // 'induction' | 'factual_recall' | 'copy' | 'inhibition' | 'boosting' | 'custom'
  hypothesis?: string;
  evidence?: string;
  confidence: string; // 'verified' | 'likely' | 'speculative'
  color: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  nodes: PathNodeData[];
}

export interface CreateCircuitInput {
  name: string;
  circuitType: string;
  color: string;
  templateNodes?: Omit<PathNodeData, 'id' | 'position'>[];
}
```

- [ ] **Step 2: Add circuit slice types to TransformerStore interface in store.ts**

```typescript
// Circuit slice
circuits: CircuitPath[];
activeCircuitId: string | null;
circuitBuildMode: boolean;
setCircuits: (circuits: CircuitPath[]) => void;
setActiveCircuit: (id: string | null) => void;
toggleCircuitBuildMode: () => void;
addNodeToCircuit: (componentKey: string) => void;
removeCircuitNode: (nodeIndex: number) => void;
createCircuit: (input: CreateCircuitInput) => Promise<CircuitPath | null>;
deleteCircuit: (id: string) => Promise<void>;
updateCircuitNode: (circuitId: string, nodeId: string, data: Partial<PathNodeData>) => Promise<void>;
reorderCircuitNodes: (circuitId: string, nodeIds: string[]) => Promise<void>;
```

- [ ] **Step 3: Implement circuit slice in create() call**

Append after the batch slice:

```typescript
// Circuit slice
circuits: [],
activeCircuitId: null,
circuitBuildMode: false,

setCircuits: (circuits) => set({ circuits }),

setActiveCircuit: (id) => {
  set({ activeCircuitId: id, circuitBuildMode: false });
  // If setting to null, close build mode too
  if (id === null) set({ circuitBuildMode: false });
},

toggleCircuitBuildMode: () => {
  const { activeCircuitId } = get();
  if (!activeCircuitId) return; // can't build without active circuit
  // Also disable batch mode when entering circuit build mode
  set((s) => ({ circuitBuildMode: !s.circuitBuildMode, batchMode: false, batchSelected: new Set() }));
},

addNodeToCircuit: (componentKey) => {
  const { activeCircuitId, circuits } = get();
  if (!activeCircuitId) return;
  const circuit = circuits.find((c) => c.id === activeCircuitId);
  if (!circuit) return;

  // Parse key to component data
  const mlpMatch = componentKey.match(/^mlp-layer-(\d+)$/);
  const headMatch = componentKey.match(/^head-layer-(\d+)-head-(\d+)$/);
  if (!mlpMatch && !headMatch) return;

  const nodeData: Omit<PathNodeData, 'id' | 'position'> = mlpMatch
    ? { componentType: 'mlp', layerIndex: parseInt(mlpMatch[1]) }
    : { componentType: 'attention_head', layerIndex: parseInt(headMatch![1]), headIndex: parseInt(headMatch![2]) };

  // Optimistic update — real node created via API in CircuitPanel save
  const tempNode: PathNodeData = {
    id: `temp-${Date.now()}`,
    position: circuit.nodes.length,
    ...nodeData,
  };
  const updatedCircuits = circuits.map((c) =>
    c.id === activeCircuitId ? { ...c, nodes: [...c.nodes, tempNode] } : c
  );
  set({ circuits: updatedCircuits });
},

removeCircuitNode: (nodeIndex) => {
  const { activeCircuitId, circuits } = get();
  const updatedCircuits = circuits.map((c) => {
    if (c.id !== activeCircuitId) return c;
    const nodes = c.nodes.filter((_, i) => i !== nodeIndex)
      .map((n, i) => ({ ...n, position: i }));
    return { ...c, nodes };
  });
  set({ circuits: updatedCircuits });
},

createCircuit: async (input) => {
  const { currentProject, setCircuits, circuits } = get();
  if (!currentProject) return null;
  try {
    const res = await fetch(`/api/projects/${currentProject.id}/circuits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to create circuit');
    const circuit: CircuitPath = await res.json();
    setCircuits([...circuits, circuit]);
    return circuit;
  } catch {
    return null;
  }
},

deleteCircuit: async (id) => {
  const { circuits, activeCircuitId } = get();
  try {
    await fetch(`/api/circuits/${id}`, { method: 'DELETE' });
    set({
      circuits: circuits.filter((c) => c.id !== id),
      activeCircuitId: activeCircuitId === id ? null : activeCircuitId,
      circuitBuildMode: false,
    });
  } catch { /* swallow */ }
},

updateCircuitNode: async (circuitId, nodeId, data) => {
  const { circuits } = get();
  // Optimistic update
  const updatedCircuits = circuits.map((c) => {
    if (c.id !== circuitId) return c;
    return { ...c, nodes: c.nodes.map((n) => n.id === nodeId ? { ...n, ...data } : n) };
  });
  set({ circuits: updatedCircuits });
  // Persist
  await fetch(`/api/circuits/${circuitId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodeId, ...data }),
  });
},

reorderCircuitNodes: async (circuitId, nodeIds) => {
  const { circuits } = get();
  // Optimistic reorder
  const updatedCircuits = circuits.map((c) => {
    if (c.id !== circuitId) return c;
    const nodeMap = Object.fromEntries(c.nodes.map((n) => [n.id, n]));
    const reordered = nodeIds.map((id, i) => ({ ...nodeMap[id], position: i }));
    return { ...c, nodes: reordered };
  });
  set({ circuits: updatedCircuits });
  // Persist via PATCH reorder endpoint
  await fetch(`/api/circuits/${circuitId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodeIds }),
  });
},
```

- [ ] **Step 4: Create useCircuits.ts hook**

```typescript
// src/hooks/useCircuits.ts
'use client';

import { useCallback } from 'react';
import { useTransformerStore } from '@/lib/store';
import type { CircuitPath } from '@/types/transformer';

export function useCircuits() {
  const { currentProject, setCircuits, circuits } = useTransformerStore();

  const loadCircuits = useCallback(async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/circuits`);
      if (!res.ok) return;
      const data: CircuitPath[] = await res.json();
      setCircuits(data);
    } catch { /* swallow */ }
  }, [setCircuits]);

  return { circuits, loadCircuits };
}
```

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit
```

Fix any type errors before continuing.

- [ ] **Step 6: Commit**

```bash
git add src/lib/store.ts src/hooks/useCircuits.ts src/types/transformer.ts
git commit -m "feat(mechmap): add circuit state slice to Zustand store

Circuit CRUD actions, optimistic updates, build mode state machine.
B key (when circuit active) = circuit build mode; B (no circuit) = batch mode.
useCircuits hook for project-scoped circuit loading."
```

---

## Task 3: CircuitList in Left Sidebar

**Files:**
- Create: `src/components/transformer/CircuitList.tsx`
- Modify: `src/components/transformer/Legend.tsx`
- Modify: `src/components/transformer/index.ts`

- [ ] **Step 1: Create CircuitList.tsx**

```tsx
// src/components/transformer/CircuitList.tsx
'use client';

import { Plus } from 'lucide-react';
import { useTransformerStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CircuitListProps {
  onNewCircuit: () => void;
}

const CONFIDENCE_COLORS: Record<string, string> = {
  verified: 'bg-green-500',
  likely: 'bg-amber-500',
  speculative: 'bg-slate-500',
};

export function CircuitList({ onNewCircuit }: CircuitListProps) {
  const { circuits, activeCircuitId, setActiveCircuit, currentProject } = useTransformerStore();

  if (!currentProject) return null;

  return (
    <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-slate-300 uppercase tracking-wider">
          Circuits
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-[#00bcd4] hover:text-[#00bcd4] hover:bg-[rgba(0,188,212,0.1)]"
          onClick={onNewCircuit}
          aria-label="Create new circuit"
          title="New circuit (C)"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {circuits.length === 0 && (
        <p className="text-[10px] text-slate-600 text-center py-2">
          No circuits yet. Press C to create one.
        </p>
      )}

      <div className="space-y-1 max-h-48 overflow-y-auto">
        {circuits.map((circuit) => {
          const isActive = circuit.id === activeCircuitId;
          return (
            <button
              key={circuit.id}
              onClick={() => setActiveCircuit(isActive ? null : circuit.id)}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all text-left',
                isActive
                  ? 'border-l-2 border-[#00bcd4] bg-[rgba(0,188,212,0.08)] text-slate-200'
                  : 'border-l-2 border-transparent text-slate-400 hover:bg-slate-700/50'
              )}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: circuit.color }}
              />
              <span className="flex-1 truncate">{circuit.name}</span>
              <span className="text-[9px] text-slate-600 flex-shrink-0">
                {circuit.circuitType}
              </span>
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full flex-shrink-0',
                  CONFIDENCE_COLORS[circuit.confidence] ?? 'bg-slate-600'
                )}
                title={circuit.confidence}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add CircuitList to Legend.tsx**

```tsx
import { CircuitList } from './CircuitList';

// Legend now needs onNewCircuit prop
interface LegendProps {
  onNewCircuit: () => void;
}

export function Legend({ onNewCircuit }: LegendProps) {
  return (
    <div className="space-y-4">
      {/* existing legend card */}
      {/* FilterPanel */}
      {/* LayerNavigator */}
      <CircuitList onNewCircuit={onNewCircuit} />
    </div>
  );
}
```

Update the Legend usage in `page.tsx` to pass `onNewCircuit` (which opens the `CircuitTemplates` modal — added in Task 4). For now pass a no-op:
```tsx
<Legend onNewCircuit={() => {}} />
```

- [ ] **Step 3: Export CircuitList**

```ts
export { CircuitList } from './CircuitList';
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/components/transformer/CircuitList.tsx src/components/transformer/Legend.tsx src/components/transformer/index.ts src/app/page.tsx
git commit -m "feat(mechmap): add CircuitList to left sidebar

Lists all project circuits with color dot, name, type, confidence indicator.
Active circuit highlighted with cyan left border. Plus button opens new circuit
modal (wired in Task 4)."
```

---

## Task 4: New Circuit Flow — Template Picker Modal

**Files:**
- Create: `src/components/transformer/CircuitTemplates.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/transformer/index.ts`

- [ ] **Step 1: Create CircuitTemplates.tsx**

```tsx
// src/components/transformer/CircuitTemplates.tsx
'use client';

import { useState } from 'react';
import { useTransformerStore } from '@/lib/store';
import type { CreateCircuitInput, PathNodeData } from '@/types/transformer';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const DJC_PALETTE = [
  '#00bcd4', '#f59e0b', '#7c4dff', '#f43f5e', '#10b981', '#6366f1',
];

const CIRCUIT_TYPES = [
  'induction', 'factual_recall', 'copy', 'inhibition', 'boosting', 'custom',
];

const TEMPLATES: Record<string, { label: string; description: string; nodes: Omit<PathNodeData, 'id' | 'position'>[] }> = {
  induction: {
    label: 'Induction Circuit',
    description: '2 nodes: Previous Token Head → Induction Head. Pre-fills role + signalType.',
    nodes: [
      { componentType: 'attention_head', layerIndex: 0, role: 'relay', signalType: 'positional' },
      { componentType: 'attention_head', layerIndex: 0, role: 'sink', signalType: 'pattern' },
    ],
  },
  ioi: {
    label: 'IOI Name Mover',
    description: '5 nodes: S2 Inhibition → Name Mover → Backup NM → Negative NM → Output.',
    nodes: [
      { componentType: 'attention_head', layerIndex: 0, role: 'inhibitor', signalType: 'name' },
      { componentType: 'attention_head', layerIndex: 0, role: 'relay', signalType: 'name' },
      { componentType: 'attention_head', layerIndex: 0, role: 'relay', signalType: 'name' },
      { componentType: 'attention_head', layerIndex: 0, role: 'inhibitor', signalType: 'name' },
      { componentType: 'attention_head', layerIndex: 0, role: 'sink', signalType: 'name' },
    ],
  },
  blank: {
    label: 'Blank',
    description: 'Start empty. Add nodes by clicking components.',
    nodes: [],
  },
};

interface CircuitTemplatesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CircuitTemplates({ open, onOpenChange }: CircuitTemplatesProps) {
  const { createCircuit, setActiveCircuit } = useTransformerStore();
  const [template, setTemplate] = useState<keyof typeof TEMPLATES>('induction');
  const [name, setName] = useState('');
  const [circuitType, setCircuitType] = useState('induction');
  const [color, setColor] = useState(DJC_PALETTE[0]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const input: CreateCircuitInput = {
      name: name.trim(),
      circuitType,
      color,
      templateNodes: TEMPLATES[template].nodes,
    };
    const circuit = await createCircuit(input);
    setLoading(false);
    if (circuit) {
      setActiveCircuit(circuit.id);
      onOpenChange(false);
      setName('');
      setTemplate('induction');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-slate-900 border-[rgba(0,188,212,0.2)]">
        <DialogHeader>
          <DialogTitle>New Circuit</DialogTitle>
          <DialogDescription>
            Choose a template to start from, then name and configure your circuit.
          </DialogDescription>
        </DialogHeader>

        {/* Template picker */}
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(TEMPLATES) as [string, typeof TEMPLATES[string]][]).map(([key, tpl]) => (
            <button
              key={key}
              onClick={() => { setTemplate(key as keyof typeof TEMPLATES); if (key !== 'blank') setCircuitType(key === 'ioi' ? 'copy' : key); }}
              className={cn(
                'p-3 rounded-lg border text-left transition-all',
                template === key
                  ? 'border-[#00bcd4] bg-[rgba(0,188,212,0.08)] text-slate-100'
                  : 'border-slate-700 text-slate-400 hover:border-slate-500'
              )}
            >
              <p className="text-xs font-medium mb-1">{tpl.label}</p>
              <p className="text-[10px] text-slate-500 leading-relaxed">{tpl.description}</p>
            </button>
          ))}
        </div>

        {/* Name + config */}
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Circuit name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Induction Circuit Layer 1-5"
              className="bg-slate-800 border-slate-700"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Type</label>
            <Select value={circuitType} onValueChange={setCircuitType}>
              <SelectTrigger className="bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CIRCUIT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Color</label>
            <div className="flex gap-2">
              {DJC_PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-6 h-6 rounded-full transition-all',
                    color === c ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                  )}
                  style={{ background: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || loading}
            style={{ background: color, color: '#0a0e14' }}
          >
            {loading ? 'Creating...' : 'Create Circuit'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Wire CircuitTemplates modal in page.tsx**

```tsx
import { CircuitTemplates } from '@/components/transformer';
import { useState } from 'react';

// Inside Home component:
const [circuitModalOpen, setCircuitModalOpen] = useState(false);

// Add to keyboard handler:
else if ((e.key === 'c' || e.key === 'C') && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
  setCircuitModalOpen(true);
}
```

Update Legend call:
```tsx
<Legend onNewCircuit={() => setCircuitModalOpen(true)} />
```

Add CircuitTemplates to JSX:
```tsx
<CircuitTemplates open={circuitModalOpen} onOpenChange={setCircuitModalOpen} />
```

- [ ] **Step 3: Export**

```ts
export { CircuitTemplates } from './CircuitTemplates';
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Manual test**

Run dev. Load a project. Press C — modal opens. Pick "Induction Circuit" template, name it, pick a color, click Create. Circuit should appear in the left sidebar list with the chosen color dot.

- [ ] **Step 6: Commit**

```bash
git add src/components/transformer/CircuitTemplates.tsx src/app/page.tsx src/components/transformer/index.ts
git commit -m "feat(mechmap): add new circuit flow with template picker

Three templates: Induction (2-node with pre-filled roles), IOI Name Mover
(5-node), and Blank. DJC color palette swatches. C key shortcut. Creates
circuit via API and immediately sets as active."
```

---

## Task 5: CircuitPanel — Right Panel Circuit Mode

**Files:**
- Create: `src/components/transformer/CircuitNodeRow.tsx`
- Create: `src/components/transformer/CircuitPanel.tsx`
- Modify: `src/components/transformer/AnnotationPanel.tsx`
- Modify: `src/components/transformer/index.ts`

- [ ] **Step 1: Create CircuitNodeRow.tsx**

```tsx
// src/components/transformer/CircuitNodeRow.tsx
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { useTransformerStore } from '@/lib/store';
import type { PathNodeData } from '@/types/transformer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const ROLES = ['source', 'relay', 'amplifier', 'inhibitor', 'sink'] as const;
const SIGNAL_TYPES = ['positional', 'content', 'name', 'fact', 'pattern'] as const;

interface CircuitNodeRowProps {
  node: PathNodeData;
  index: number;
  circuitId: string;
  onRemove: (index: number) => void;
}

export function CircuitNodeRow({ node, index, circuitId, onRemove }: CircuitNodeRowProps) {
  const { updateCircuitNode } = useTransformerStore();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: node.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const label = node.componentType === 'mlp'
    ? `L${node.layerIndex}_MLP`
    : node.headIndex !== undefined
    ? `L${node.layerIndex}_H${node.headIndex}`
    : `L${node.layerIndex}_? (click to assign)`;

  const isAssigned = node.headIndex !== undefined || node.componentType === 'mlp';

  const update = (data: Partial<PathNodeData>) => updateCircuitNode(circuitId, node.id, data);

  return (
    <div ref={setNodeRef} style={style} className="bg-slate-900 border border-slate-700 rounded-md p-2 space-y-1.5">
      {/* Header row */}
      <div className="flex items-center gap-1.5">
        <button {...attributes} {...listeners} className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing">
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <span className="text-[10px] text-slate-600 w-4">{index}</span>
        <span className={cn('font-mono text-xs flex-1', isAssigned ? 'text-[#00bcd4]' : 'text-slate-500 italic')}>
          {label}
        </span>
        <button onClick={() => onRemove(index)} className="text-slate-600 hover:text-red-400 transition-colors">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Role + signal type */}
      <div className="grid grid-cols-2 gap-1">
        <Select value={node.role ?? ''} onValueChange={(v) => update({ role: v })}>
          <SelectTrigger className="h-6 text-[10px] bg-slate-800 border-slate-700">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={node.signalType ?? ''} onValueChange={(v) => update({ signalType: v })}>
          <SelectTrigger className="h-6 text-[10px] bg-slate-800 border-slate-700">
            <SelectValue placeholder="Signal" />
          </SelectTrigger>
          <SelectContent>
            {SIGNAL_TYPES.map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Patching scores */}
      <div className="flex items-center gap-2 text-[10px]">
        <span className="text-slate-600 w-4">D:</span>
        <Input
          type="number" min={0} max={1} step={0.01}
          value={node.denoisingScore ?? ''}
          onChange={(e) => update({ denoisingScore: parseFloat(e.target.value) || undefined })}
          className="h-5 w-14 text-[10px] bg-slate-800 border-slate-700 px-1"
          placeholder="0.0"
        />
        <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${(node.denoisingScore ?? 0) * 100}%` }}
          />
        </div>
        <span className="text-slate-600 w-4">N:</span>
        <Input
          type="number" min={0} max={1} step={0.01}
          value={node.noisingScore ?? ''}
          onChange={(e) => update({ noisingScore: parseFloat(e.target.value) || undefined })}
          className="h-5 w-14 text-[10px] bg-slate-800 border-slate-700 px-1"
          placeholder="0.0"
        />
        <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${(node.noisingScore ?? 0) * 100}%` }}
          />
        </div>
      </div>

      {/* AND/OR edge to next node */}
      <div className="flex items-center gap-1.5 text-[10px]">
        <span className="text-slate-600">→ next:</span>
        {(['and', 'or', undefined] as const).map((v) => (
          <button
            key={String(v)}
            onClick={() => update({ connectionType: v })}
            className={cn(
              'px-1.5 py-0.5 rounded border text-[9px] transition-all',
              node.connectionType === v
                ? 'border-[#00bcd4] text-[#00bcd4] bg-[rgba(0,188,212,0.1)]'
                : 'border-slate-700 text-slate-500 hover:border-slate-500'
            )}
          >
            {v ?? '—'}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create CircuitPanel.tsx**

```tsx
// src/components/transformer/CircuitPanel.tsx
'use client';

import { useCallback } from 'react';
import { X, Layers, Trash2 } from 'lucide-react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTransformerStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CircuitNodeRow } from './CircuitNodeRow';
import { cn } from '@/lib/utils';

function computeConfidence(nodes: { denoisingScore?: number; noisingScore?: number }[]): string {
  if (nodes.length === 0) return 'speculative';
  const allScored = nodes.every((n) => n.denoisingScore !== undefined && n.noisingScore !== undefined);
  if (!allScored) return 'speculative';
  const avgD = nodes.reduce((s, n) => s + (n.denoisingScore ?? 0), 0) / nodes.length;
  const avgN = nodes.reduce((s, n) => s + (n.noisingScore ?? 0), 0) / nodes.length;
  if (avgD > 0.8 && avgN > 0.8) return 'verified';
  if (avgD > 0.5 && avgN > 0.5) return 'likely';
  return 'speculative';
}

const CONFIDENCE_COLORS: Record<string, string> = {
  verified: 'text-green-400 border-green-600',
  likely: 'text-amber-400 border-amber-600',
  speculative: 'text-slate-400 border-slate-600',
};

export function CircuitPanel() {
  const {
    circuits, activeCircuitId, setActiveCircuit, circuitBuildMode, toggleCircuitBuildMode,
    removeCircuitNode, deleteCircuit, reorderCircuitNodes,
  } = useTransformerStore();

  const circuit = circuits.find((c) => c.id === activeCircuitId);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id || !circuit) return;
    const oldIds = circuit.nodes.map((n) => n.id);
    const oldIndex = oldIds.indexOf(active.id);
    const newIndex = oldIds.indexOf(over.id);
    const reordered = [...oldIds];
    reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, active.id);
    reorderCircuitNodes(circuit.id, reordered);
  }, [circuit, reorderCircuitNodes]);

  if (!circuit) return null;

  const confidence = computeConfidence(circuit.nodes);

  return (
    <div className="w-80 h-full bg-slate-900 border-l border-[rgba(0,188,212,0.15)] flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm text-slate-100 truncate flex-1">{circuit.name}</h2>
          <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={() => setActiveCircuit(null)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400">
            {circuit.circuitType}
          </span>
          <span className={cn('text-[10px] px-1.5 py-0.5 border rounded', CONFIDENCE_COLORS[confidence])}>
            {confidence}
          </span>
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ background: circuit.color }}
          />
        </div>

        {/* Build mode toggle */}
        <Button
          variant={circuitBuildMode ? 'default' : 'outline'}
          size="sm"
          className={cn(
            'w-full h-7 text-xs',
            circuitBuildMode
              ? 'bg-[#00bcd4] text-[#0a0e14] hover:bg-[#00bcd4]/90'
              : 'border-[rgba(0,188,212,0.3)] text-[#00bcd4] hover:bg-[rgba(0,188,212,0.1)]'
          )}
          onClick={toggleCircuitBuildMode}
        >
          <Layers className="h-3 w-3 mr-1.5" />
          {circuitBuildMode ? 'Stop adding nodes' : 'Add nodes'}
        </Button>
      </div>

      {/* Node list */}
      <ScrollArea className="flex-1 p-3">
        <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">
          Nodes ({circuit.nodes.length}) — drag to reorder
        </p>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={circuit.nodes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {circuit.nodes.map((node, i) => (
                <CircuitNodeRow
                  key={node.id}
                  node={node}
                  index={i}
                  circuitId={circuit.id}
                  onRemove={removeCircuitNode}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {circuitBuildMode && (
          <div className="mt-2 py-2 text-center text-[10px] text-slate-600 border border-dashed border-slate-700 rounded">
            Click any component to add node {circuit.nodes.length}
          </div>
        )}
      </ScrollArea>

      {/* Delete */}
      <div className="p-3 border-t border-slate-800">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full h-7 text-xs border-red-900 text-red-400 hover:bg-red-950">
              <Trash2 className="h-3 w-3 mr-1.5" />
              Delete circuit
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete "{circuit.name}"?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes the circuit and all {circuit.nodes.length} nodes. Cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteCircuit(circuit.id)} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Toggle right panel between AnnotationPanel and CircuitPanel in AnnotationPanel.tsx**

At the top of `AnnotationPanel.tsx`, add:
```tsx
import { CircuitPanel } from './CircuitPanel';
```

Wrap the existing `AnnotationPanel` export:
```tsx
export function AnnotationPanel() {
  const { activeCircuitId, isPanelOpen } = useTransformerStore();

  if (activeCircuitId) return <CircuitPanel />;

  // ... existing annotation panel code unchanged
}
```

- [ ] **Step 4: Export**

```ts
export { CircuitPanel } from './CircuitPanel';
export { CircuitNodeRow } from './CircuitNodeRow';
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

- [ ] **Step 6: Manual test**

Run dev with a project loaded. Create a circuit via the C key. Right panel should switch from annotation mode to circuit mode showing the CircuitPanel with node list, "Add nodes" button, and delete button.

- [ ] **Step 7: Commit**

```bash
git add src/components/transformer/CircuitPanel.tsx src/components/transformer/CircuitNodeRow.tsx src/components/transformer/AnnotationPanel.tsx src/components/transformer/index.ts
git commit -m "feat(mechmap): add CircuitPanel — right panel circuit mode

Node list with drag reorder (@dnd-kit), role/signalType selects, denoising
+ noising score inputs with progress bar visualization, AND/OR edge labels.
Auto-computes confidence (verified/likely/speculative) from patching scores.
Delete with AlertDialog confirmation."
```

---

## Task 6: Flow View Circuit Mode — Click to Add Nodes

**Files:**
- Create: `src/components/transformer/CircuitBuildBanner.tsx`
- Modify: `src/components/transformer/AttentionHead.tsx`
- Modify: `src/components/transformer/MLPBlock.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/transformer/index.ts`

- [ ] **Step 1: Create CircuitBuildBanner.tsx**

```tsx
// src/components/transformer/CircuitBuildBanner.tsx
'use client';

import { useTransformerStore } from '@/lib/store';

export function CircuitBuildBanner() {
  const { activeCircuitId, circuitBuildMode, circuits } = useTransformerStore();
  const circuit = circuits.find((c) => c.id === activeCircuitId);

  if (!circuitBuildMode || !circuit) return null;

  return (
    <div className="flex items-center gap-2 px-2 py-0.5 rounded border border-[rgba(0,188,212,0.4)] bg-[rgba(0,188,212,0.1)]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00bcd4] animate-pulse flex-shrink-0" />
      <span className="text-xs text-[#00bcd4] truncate max-w-[180px]">
        Adding nodes to: {circuit.name}
      </span>
      <span className="text-xs text-slate-500 flex-shrink-0">Esc to stop</span>
    </div>
  );
}
```

- [ ] **Step 2: Update AttentionHead.tsx click handler for circuit build mode**

Add to store destructure:
```typescript
const { ..., circuitBuildMode, activeCircuitId, circuits, addNodeToCircuit } = useTransformerStore();
```

Update `handleClick`:
```typescript
const handleClick = (e: React.MouseEvent) => {
  // Circuit build mode takes priority
  if (circuitBuildMode && activeCircuitId) {
    addNodeToCircuit(key);
    return;
  }
  // Batch mode
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

Add in-circuit visual indicator (colored ring matching circuit color):
```typescript
const activeCircuit = circuits.find((c) => c.id === activeCircuitId);
const isInActiveCircuit = activeCircuit?.nodes.some(
  (n) => n.componentType === 'attention_head' && n.layerIndex === layerIndex && n.headIndex === headIndex
);
```

Add to className (after batch-selected):
```tsx
isInActiveCircuit && 'ring-2 ring-offset-1 ring-offset-background',
// Use inline style for dynamic circuit color ring:
```

Use `style` prop for dynamic color:
```tsx
style={isInActiveCircuit && activeCircuit ? { boxShadow: `0 0 0 2px ${activeCircuit.color}` } : undefined}
```

- [ ] **Step 3: Same for MLPBlock.tsx**

Same circuit build mode handler pattern. Add `isInActiveCircuit` check for MLP nodes. Apply `style={{ boxShadow: ... }}` when in active circuit.

- [ ] **Step 4: Add CircuitBuildBanner to page.tsx header**

```tsx
import { CircuitBuildBanner } from '@/components/transformer';
```

In the header left side, after the title:
```tsx
<div className="flex items-center gap-3">
  <LayeredNetworkIcon className="w-6 h-6 text-primary" />
  <h1 className="text-lg font-bold">Mech Interp Viz</h1>
  <CircuitBuildBanner />
  <SearchBar />
</div>
```

- [ ] **Step 5: Update Escape key handler in page.tsx**

Add to the global keyboard handler in page.tsx:
```typescript
else if (e.key === 'Escape') {
  const { circuitBuildMode, toggleCircuitBuildMode, activeCircuitId, setActiveCircuit } = useTransformerStore.getState();
  if (circuitBuildMode) {
    toggleCircuitBuildMode(); // exit build mode, keep circuit selected
  } else if (activeCircuitId) {
    setActiveCircuit(null); // deselect circuit
  }
}
```

Note: Use `useTransformerStore.getState()` in the event handler (outside React render) to avoid stale closures.

- [ ] **Step 6: Load circuits when project changes in page.tsx**

Add import:
```tsx
import { useCircuits } from '@/hooks/useCircuits';
```

In `Home` component:
```tsx
const { loadCircuits } = useCircuits();

useEffect(() => {
  syncFromProject(currentProject);
  if (currentProject) {
    loadCircuits(currentProject.id);
  }
}, [currentProject, syncFromProject, loadCircuits]);
```

- [ ] **Step 7: Export**

```ts
export { CircuitBuildBanner } from './CircuitBuildBanner';
```

- [ ] **Step 8: Verify build**

```bash
npm run build
```

- [ ] **Step 9: Manual test**

Run dev with a project. Create a circuit. Click "Add nodes" in CircuitPanel or press B. Banner appears in header. Click heads in flow view — they should appear in the node list in CircuitPanel, and the head should show a colored ring. Press Escape to exit build mode.

- [ ] **Step 10: Commit**

```bash
git add src/components/transformer/CircuitBuildBanner.tsx src/components/transformer/AttentionHead.tsx src/components/transformer/MLPBlock.tsx src/app/page.tsx src/components/transformer/index.ts src/hooks/useCircuits.ts
git commit -m "feat(mechmap): circuit build mode — click flow view to add nodes

CircuitBuildBanner shows in header when build mode active (pulsing cyan dot).
Clicking head/MLP in flow view adds to active circuit's node list.
In-circuit nodes show colored ring (circuit.color). B key toggles build mode.
Esc exits build mode. Circuits loaded from DB on project change."
```

---

## Task 7: CircuitOverlay — SVG Layer on Heatmap

**Prerequisite:** Part 1 Task 6 (HeatmapView canvas) must be in main branch.

**Files:**
- Create: `src/components/transformer/CircuitOverlay.tsx`
- Modify: `src/components/transformer/HeatmapView.tsx`
- Modify: `src/components/transformer/index.ts`

- [ ] **Step 1: Export HeatmapLayout type from HeatmapView.tsx**

At the top of `HeatmapView.tsx`, export the layout interface:
```typescript
export interface HeatmapLayout {
  offsetX: number;
  offsetY: number;
  cellSize: number;
  numLayers: number;
  numHeadsPerLayer: number;
}
```

Add a `layoutRef` prop to `HeatmapView` so `CircuitOverlay` can read coordinates:

```typescript
// Change HeatmapView signature:
interface HeatmapViewProps {
  layoutRef?: React.MutableRefObject<HeatmapLayout | null>;
}
export function HeatmapView({ layoutRef: externalLayoutRef }: HeatmapViewProps = {}) {
```

Where the internal `layoutRef` is computed, also update `externalLayoutRef`:
```typescript
layoutRef.current = { offsetX, offsetY, cellSize, numLayers, numHeadsPerLayer };
if (externalLayoutRef) externalLayoutRef.current = layoutRef.current;
```

- [ ] **Step 2: Create CircuitOverlay.tsx**

```tsx
// src/components/transformer/CircuitOverlay.tsx
'use client';

import { useTransformerStore } from '@/lib/store';
import type { HeatmapLayout } from './HeatmapView';
import type { CircuitPath, PathNodeData } from '@/types/transformer';

interface CircuitOverlayProps {
  layout: HeatmapLayout | null;
  width: number;
  height: number;
}

function cellCenter(layer: number, col: number, layout: HeatmapLayout) {
  return {
    x: layout.offsetX + col * layout.cellSize + layout.cellSize / 2,
    y: layout.offsetY + layer * layout.cellSize + layout.cellSize / 2,
  };
}

function nodeCol(node: PathNodeData, numHeadsPerLayer: number): number {
  if (node.componentType === 'mlp') return numHeadsPerLayer;
  return node.headIndex ?? 0;
}

function cubicBezier(sx: number, sy: number, tx: number, ty: number): string {
  const mx = (sx + tx) / 2 + 20;
  return `M${sx},${sy} C${mx},${sy} ${mx},${ty} ${tx},${ty}`;
}

interface CircuitArrowsProps {
  circuit: CircuitPath;
  layout: HeatmapLayout;
  isActive: boolean;
}

function CircuitArrows({ circuit, layout, isActive }: CircuitArrowsProps) {
  const { numHeadsPerLayer } = layout;
  const markerId = `arrow-${circuit.id}`;
  const opacity = isActive ? 1 : 0.35;
  const strokeWidth = isActive ? 2 : 1;

  return (
    <g opacity={opacity}>
      <defs>
        <marker
          id={markerId}
          markerWidth={6}
          markerHeight={4}
          refX={5}
          refY={2}
          orient="auto"
        >
          <polygon points="0 0, 6 2, 0 4" fill={circuit.color} />
        </marker>
      </defs>

      {circuit.nodes.map((node, i) => {
        const col = nodeCol(node, numHeadsPerLayer);
        const center = cellCenter(node.layerIndex, col, layout);
        const r = layout.cellSize * 0.55;

        return (
          <g key={node.id}>
            {/* Node highlight ring */}
            <circle
              cx={center.x}
              cy={center.y}
              r={r}
              fill="none"
              stroke={circuit.color}
              strokeWidth={isActive ? 1.5 : 1}
              strokeDasharray={isActive ? '3,2' : '2,2'}
              style={isActive ? { filter: `drop-shadow(0 0 2px ${circuit.color})` } : undefined}
            />

            {/* Arrow to next node */}
            {i < circuit.nodes.length - 1 && (() => {
              const next = circuit.nodes[i + 1];
              const nextCol = nodeCol(next, numHeadsPerLayer);
              const nextCenter = cellCenter(next.layerIndex, nextCol, layout);
              const d = cubicBezier(center.x, center.y, nextCenter.x, nextCenter.y);
              const midX = (center.x + nextCenter.x) / 2 + 10;
              const midY = (center.y + nextCenter.y) / 2;
              const connType = node.connectionType;

              return (
                <g>
                  <path
                    d={d}
                    stroke={circuit.color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    markerEnd={`url(#${markerId})`}
                  />
                  {connType && isActive && (
                    <g>
                      <rect
                        x={midX - 8}
                        y={midY - 5}
                        width={16}
                        height={10}
                        rx={2}
                        fill="#0a0e14"
                        stroke={circuit.color}
                        strokeOpacity={0.5}
                        strokeWidth={0.5}
                        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                      />
                      <text
                        x={midX}
                        y={midY + 3.5}
                        fontSize={7}
                        fill={circuit.color}
                        textAnchor="middle"
                        fontFamily="monospace"
                        style={{ pointerEvents: 'none' }}
                      >
                        {connType.toUpperCase()}
                      </text>
                    </g>
                  )}
                </g>
              );
            })()}
          </g>
        );
      })}
    </g>
  );
}

export function CircuitOverlay({ layout, width, height }: CircuitOverlayProps) {
  const { circuits, activeCircuitId } = useTransformerStore();

  if (!layout || circuits.length === 0) return null;

  return (
    <svg
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
      width={width}
      height={height}
    >
      {/* Render inactive circuits first (dimmed), active circuit on top */}
      {circuits
        .filter((c) => c.id !== activeCircuitId)
        .map((circuit) => (
          <CircuitArrows key={circuit.id} circuit={circuit} layout={layout} isActive={false} />
        ))}
      {circuits
        .filter((c) => c.id === activeCircuitId)
        .map((circuit) => (
          <CircuitArrows key={circuit.id} circuit={circuit} layout={layout} isActive={true} />
        ))}
    </svg>
  );
}
```

- [ ] **Step 3: Mount CircuitOverlay in HeatmapView.tsx**

In `HeatmapView.tsx`, update the return:

```tsx
import { CircuitOverlay } from './CircuitOverlay';

// In component, add state for CSS dimensions:
const [dims, setDims] = useState({ w: 0, h: 0 });

// Update ResizeObserver effect to also track CSS dims:
useEffect(() => {
  const container = containerRef.current;
  if (!container) return;
  const ro = new ResizeObserver((entries) => {
    const rect = entries[0].contentRect;
    setDims({ w: rect.width, h: rect.height });
    draw();
  });
  ro.observe(container);
  return () => ro.disconnect();
}, [draw]);

// Return:
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
      <CircuitOverlay layout={layoutRef.current} width={dims.w} height={dims.h - 32} />
      {tooltip && (
        <div /* ... unchanged ... */ />
      )}
    </div>
  </div>
);
```

- [ ] **Step 4: Export**

```ts
export { CircuitOverlay } from './CircuitOverlay';
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

- [ ] **Step 6: Manual test**

Run dev with a project. Create an Induction Circuit template, assign layer/head indices to both nodes. Switch to heatmap view. SVG rings should appear around circuit node cells, and a curved arrow should connect them. The active circuit renders at full opacity; other circuits are dimmed to 35%.

- [ ] **Step 7: Commit**

```bash
git add src/components/transformer/CircuitOverlay.tsx src/components/transformer/HeatmapView.tsx src/components/transformer/index.ts
git commit -m "feat(mechmap): CircuitOverlay — SVG arrows on heatmap canvas

Cubic bezier arrows between circuit nodes. DPR-safe: SVG uses CSS pixel
coordinates synced via layoutRef. Multiple circuits visible simultaneously
in different colors. Active circuit: full opacity + glow. AND/OR badge on
arrow midpoint. Part 2 circuit visualization complete."
```

---

## Task 8: @dnd-kit Node Reorder (Verify + Wire)

The `@dnd-kit` sortable setup was included in `CircuitPanel.tsx` in Task 5. This task verifies it works correctly end-to-end and confirms the reorder API call is functioning.

**Files:**
- Verify: `src/components/transformer/CircuitPanel.tsx`
- Verify: `src/app/api/circuits/[id]/route.ts`

- [ ] **Step 1: Verify @dnd-kit imports resolve**

```bash
npx tsc --noEmit 2>&1 | grep -i dnd
```
Expected: no errors. If `@dnd-kit/sortable` or `@dnd-kit/core` missing: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities` (but they're listed in package.json — should already be installed).

- [ ] **Step 2: Test drag-and-drop reorder**

Run dev. Open a circuit with 3+ nodes. Drag a node row using the grip handle. Verify the order updates in the UI. Check the Network tab — a PATCH request should fire to `/api/circuits/[id]` with `{ nodeIds: [...] }`.

- [ ] **Step 3: Verify reorder persists across reload**

Drag a node to a new position. Reload the page. Load the same project. Verify the circuit nodes appear in the reordered sequence.

- [ ] **Step 4: Commit**

```bash
git add . # only if any fixes were needed
git commit -m "feat(mechmap): verify @dnd-kit node reorder end-to-end

Drag node rows in CircuitPanel to reorder. PATCH /api/circuits/[id] with
full nodeIds array. delete-and-reinsert strategy avoids @@unique position
constraint collision. Persists across page reload."
```

---

## Task 9: Circuit Templates — Pre-fill + Confidence Auto-classify

**Files:**
- Verify: `src/components/transformer/CircuitPanel.tsx` (confidence computation)
- Verify: `src/components/transformer/CircuitTemplates.tsx` (template nodes)

- [ ] **Step 1: Verify confidence auto-classification**

In `CircuitPanel.tsx`, the `computeConfidence()` function at the top of the file handles auto-classification. Verify it returns:
- `'speculative'` when no nodes have scores
- `'likely'` when avg D+N > 0.5
- `'verified'` when all nodes have D > 0.8 AND N > 0.8

Test in dev: open a circuit, set denoisingScore=0.9 and noisingScore=0.9 on all nodes. The confidence badge in the CircuitPanel header should update to "verified" (green).

- [ ] **Step 2: Verify Induction Circuit template pre-fills**

Create a new circuit using the "Induction Circuit" template. Verify the CircuitPanel shows 2 nodes pre-filled with:
- Node 0: role=relay, signalType=positional
- Node 1: role=sink, signalType=pattern

Both nodes show `L0_? (click to assign)` since layer/head indices are not yet assigned. Click heads in flow view (in build mode) to assign them.

- [ ] **Step 3: Verify IOI template pre-fills**

Create a circuit with "IOI Name Mover" template. Verify 5 nodes appear with correct roles:
- Nodes 0, 3: role=inhibitor
- Nodes 1, 2: role=relay
- Node 4: role=sink

All with signalType=name.

- [ ] **Step 4: Fix any gaps found in steps 1-3**

If template nodes aren't being persisted to DB on circuit creation, update `createCircuit` in the store to pass `templateNodes` in the POST body, and update the API route to create PathNodes from the template.

In `src/app/api/projects/[id]/circuits/route.ts`, add to POST handler:
```typescript
const { name, circuitType, color, templateNodes } = body;
const circuit = await prisma.circuitPath.create({
  data: {
    projectId: id,
    name,
    circuitType: circuitType ?? 'custom',
    color: color ?? '#00bcd4',
    confidence: 'speculative',
    nodes: templateNodes?.length > 0 ? {
      create: templateNodes.map((n: any, i: number) => ({
        position: i,
        componentType: n.componentType,
        layerIndex: n.layerIndex ?? 0,
        headIndex: n.headIndex,
        role: n.role,
        signalType: n.signalType,
      })),
    } : undefined,
  },
  include: { nodes: { orderBy: { position: 'asc' } } },
});
```

- [ ] **Step 5: Final build + lint**

```bash
npm run build && npm run lint
```

Expected: zero errors, zero warnings (or only pre-existing warnings).

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat(mechmap): circuit templates + confidence auto-classify complete

Induction (2-node) and IOI (5-node) templates pre-fill role/signalType.
Confidence auto-classifies verified/likely/speculative from avg D+N scores.
All 9 Part 2 tasks complete. Part 2 ready for Part 3 (steering vectors)."
```

---

## Self-Review

Checked Part 2 spec against tasks:

- ✅ Prisma migration (3 PathNode fields) → Task 1
- ✅ API routes updated for new fields → Task 1
- ✅ Reorder endpoint (delete-and-reinsert strategy) → Task 1
- ✅ Circuit types added to transformer.ts → Task 2
- ✅ Circuit slice in store → Task 2
- ✅ useCircuits hook → Task 2
- ✅ CircuitList in left sidebar → Task 3
- ✅ New circuit modal with templates → Task 4
- ✅ C key shortcut → Task 4
- ✅ CircuitNodeRow (draggable, role/signal/scores/AND-OR) → Task 5
- ✅ CircuitPanel (right panel circuit mode) → Task 5
- ✅ AnnotationPanel toggle → Task 5
- ✅ Delete circuit AlertDialog → Task 5
- ✅ Confidence auto-classification → Task 5 (computeConfidence)
- ✅ CircuitBuildBanner in header → Task 6
- ✅ AttentionHead/MLPBlock build mode click handler → Task 6
- ✅ In-circuit node ring (circuit.color) → Task 6
- ✅ B key: circuit build mode (when circuit active) vs. batch mode → Task 6
- ✅ Escape: exit build → Task 6
- ✅ loadCircuits on project change → Task 6
- ✅ CircuitOverlay SVG over canvas → Task 7
- ✅ HeatmapLayout ref shared → Task 7
- ✅ Multiple circuits (active=full, inactive=35% opacity) → Task 7
- ✅ AND/OR badge on arrow midpoint → Task 7
- ✅ @dnd-kit reorder verified → Task 8
- ✅ Template pre-fill to DB → Task 9
- ✅ Confidence verified/likely/speculative → Task 9

**Type consistency:**
- `PathNodeData` defined in Task 2, used in Tasks 5, 7 ✅
- `CircuitPath` defined in Task 2, used in Tasks 3, 4, 5, 6, 7 ✅
- `HeatmapLayout` exported from HeatmapView.tsx in Task 7, imported by CircuitOverlay ✅
- `useCircuits` hook defined in Task 2, used in Task 6 ✅
- `reorderCircuitNodes(circuitId, nodeIds)` defined in Task 2, called in Task 5 with correct signature ✅
