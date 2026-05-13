# Mechanistic Interpretability Visualization Tool - Work Log

---
## Task ID: 1 - Main Developer
### Work Task
Build an interactive visualization tool for Mechanistic Interpretability research in Next.js 15 with transformer architecture visualization, annotation system, and data persistence.

### Work Summary

**Completed Features:**

1. **Core Visualization Components**
   - Created `TransformerVisualization` - Main container showing vertical stack of transformer layers
   - Created `TransformerLayer` - Individual layer with attention heads and MLP block
   - Created `AttentionHead` - Clickable attention head nodes with selection state and visual indicators
   - Created `MLPBlock` - MLP representation with annotation support
   - Added data flow visualization (input embeddings → layers → output logits)

2. **Type Definitions** (`/src/types/transformer.ts`)
   - Defined `Annotation`, `TransformerConfig`, `SelectedComponent` types
   - Created predefined tags for mechanistic interpretability (Induction Head, Copy Head, Name Mover, etc.)
   - Defined importance color schemes (high/medium/low/unknown)

3. **State Management** (`/src/lib/store.ts`)
   - Implemented Zustand store with localStorage persistence
   - Configuration state (model name, layers, heads per layer)
   - Selection state for components
   - Annotation CRUD operations
   - Export/Import functionality for JSON data

4. **Annotation Panel** (`/src/components/transformer/AnnotationPanel.tsx`)
   - Side panel showing selected component info
   - Importance level selector with color coding
   - Tag management with predefined tags and custom tags
   - Notes textarea for research findings
   - Save/Delete actions with timestamps
   - Export/Import buttons for data persistence

5. **Configuration Panel** (`/src/components/transformer/ConfigPanel.tsx`)
   - Sheet component for model configuration
   - Model presets (GPT-2 Small/Medium/Large/XL, GPT-3 variants)
   - Sliders for number of layers (1-48) and attention heads (1-32)
   - Model summary showing total components

6. **Supporting Components**
   - `Legend` - Visual guide for component types and importance colors
   - `Stats` - Real-time statistics (coverage, importance distribution, top tags)

7. **Main Page Layout** (`/src/app/page.tsx`)
   - Dark theme interface optimized for research sessions
   - Header with title, help dialog, config button, and GitHub link
   - Three-column layout: Legend/Stats (left), Visualization (center), Annotation Panel (right)
   - Responsive design with collapsible sidebars

8. **Data Persistence**
   - Automatic localStorage persistence via Zustand persist middleware
   - JSON export/import for sharing annotations between devices
   - Configuration and annotations stored together

**Technical Stack Used:**
- Next.js 15 with App Router
- TypeScript 5
- Zustand for state management
- shadcn/ui components (Button, Textarea, Badge, Select, Slider, Sheet, Dialog, ScrollArea, Tooltip)
- Tailwind CSS for styling
- Lucide icons

**Files Created:**
- `/src/types/transformer.ts` - Type definitions
- `/src/lib/store.ts` - Zustand store
- `/src/components/transformer/AttentionHead.tsx`
- `/src/components/transformer/MLPBlock.tsx`
- `/src/components/transformer/TransformerLayer.tsx`
- `/src/components/transformer/TransformerVisualization.tsx`
- `/src/components/transformer/AnnotationPanel.tsx`
- `/src/components/transformer/ConfigPanel.tsx`
- `/src/components/transformer/Legend.tsx`
- `/src/components/transformer/Stats.tsx`
- `/src/components/transformer/index.ts` - Barrel exports

**Files Modified:**
- `/src/app/page.tsx` - Main page with complete layout
- `/src/app/layout.tsx` - Dark theme class, updated metadata

**Key Design Decisions:**
1. Used dark theme for long research sessions
2. Color-coded importance levels: Red (high), Amber (medium), Green (low), Gray (unknown)
3. White dot indicator for components with notes
4. Key-based remounting for annotation form to avoid useEffect state issues
5. Vertical flow showing data direction (embeddings → layers → output)

---
## Task ID: 2 - Database & API Integration
### Work Task
Add database persistence and API routes so annotations can be saved to a shared database instead of just localStorage.

### Work Summary

**Completed Features:**

1. **Database Schema** (`/prisma/schema.prisma`)
   - Created `Project` model: stores model configuration (name, layers, heads)
   - Created `Annotation` model: stores findings with component info, notes, tags, importance
   - Added unique constraint on projectId + componentType + layerIndex + headIndex
   - SQLite database for easy local development

2. **API Routes**
   - `GET/POST /api/projects` - List and create projects
   - `GET/PUT/DELETE /api/projects/[id]` - Project CRUD
   - `GET/POST /api/projects/[id]/annotations` - List and create annotations for a project
   - `GET/PUT/DELETE /api/annotations/[id]` - Individual annotation CRUD
   - `GET /api/export?projectId=xxx&format=json|markdown` - Export projects

3. **Custom Hook** (`/src/hooks/useProjects.ts`)
   - `loadProjects()` - Fetch all projects
   - `createProject()` - Create new project
   - `loadProject()` - Load project with annotations
   - `updateProject()` / `deleteProject()` - Project management
   - `saveAnnotation()` / `deleteAnnotation()` - Annotation management
   - `exportProject()` - Export as JSON or Markdown

4. **Project Selector Component** (`/src/components/transformer/ProjectSelector.tsx`)
   - Dropdown to select/create projects
   - Shows annotation count per project
   - Create project dialog with model presets
   - Delete project with confirmation
   - Export dropdown (JSON/Markdown)

5. **Updated Store** (`/src/lib/store.ts`)
   - Added `syncFromProject()` to sync state from DB-loaded project
   - Updated persistence logic to not duplicate data when project is loaded
   - Stores `currentProject` reference

6. **Updated AnnotationPanel** (`/src/components/transformer/AnnotationPanel.tsx`)
   - Shows database connection status
   - Saves to API when project is loaded
   - Falls back to local storage when no project selected

**Files Created:**
- `/src/types/api.ts` - API type definitions
- `/src/hooks/useProjects.ts` - Projects API hook
- `/src/components/transformer/ProjectSelector.tsx`
- `/src/app/api/projects/route.ts`
- `/src/app/api/projects/[id]/route.ts`
- `/src/app/api/projects/[id]/annotations/route.ts`
- `/src/app/api/annotations/[id]/route.ts`
- `/src/app/api/export/route.ts`

**Files Modified:**
- `/prisma/schema.prisma` - Added Project and Annotation models
- `/src/lib/store.ts` - Added project sync functionality
- `/src/components/transformer/AnnotationPanel.tsx` - Integrated API sync
- `/src/components/transformer/index.ts` - Added ProjectSelector export
- `/src/app/page.tsx` - Added ProjectSelector and project sync effect

**How to Use Database:**
1. Click "New Project" to create a project
2. Fill in project name and select model preset
3. Click on components to add annotations - they sync to DB automatically
4. Use Export dropdown to export as JSON (backup) or Markdown (documentation)
5. Multiple users can share the same SQLite database file
