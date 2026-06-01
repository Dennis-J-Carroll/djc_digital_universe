# Flow Writer v2 — Editable Character Cards + Gallery + Rich Profile

Date: 2026-05-31
App: `static/apps/flow-writer-v2/` (self-contained static, ES modules, localStorage + IndexedDB)

## Goal

Make Universe Dashboard character cards fully editable, add per-character
avatar + image gallery, a rich character profile, and search/filter +
export/import. Local-first (no server). Keep a clean storage seam so a
future Supabase sync layer can drop in behind the same interface.

## Scope (locked)

- Editor + rich profile: create/edit/delete; fields name, type, description,
  traits, plus backstory, goals, arc, voice/speech notes, relationships (text).
- Avatar + gallery: IndexedDB-backed; many images per character, one primary.
- Search/filter (by name/traits/profile + type chips) + export/import JSON.
- NOT in scope: structured relationship graph, AI portrait generation, server.

## Approach: B — split modules + IndexedDB for images

Text metadata stays in localStorage (KB-sized). Only image binaries go to
IndexedDB. New focused modules; `universe-dashboard.js` stays renderer.

### Files

New:
- `flow-writer/js/character-store.js` — sole persistence layer.
- `flow-writer/js/character-editor.js` — create/edit modal + gallery uploader (injects own DOM).
- `flow-writer/css/character-cards.css` — editor/gallery/avatar/toolbar styles.

Edited:
- `flow-writer/js/db.js` — `DB_VERSION` 1→2, add `images` store (index `charId`), export `STORE_IMAGES`.
- `flow-writer/js/universe-dashboard.js` — consume store; avatars, accent, edit btn, profile in expand; inject toolbar (search/filter/add/export).
- `flow-writer/js/app.js` — bump db + universe-dashboard import to `?v=5`.
- `index.html` — remove inline duplicate renderer; add CSS link; fix swipe-close body-overflow leak.

### Data model

Character (localStorage `fw-universe-characters`):
```
{ id, name, type, description, traits[],
  accentColor|null, avatarId|null, galleryIds[],
  profile:{ backstory, goals, arc, voice, relationships },
  createdAt, updatedAt }
```

Image (IndexedDB `images`, keyPath id, index charId):
```
{ id, charId, dataUrl, name, w, h, createdAt }
```

### Storage layer API (`character-store.js`)

- `loadCharacters()/saveCharacters()`, `getCharacter(id)`
- `createCharacter(data)`, `updateCharacter(id, patch)`, `deleteCharacter(id)` (cascade images)
- `addImage(charId, file)` (canvas downscale → dataUrl), `getImage(id)`, `getImagesForChar(charId)`, `deleteImage(id)`, `setAvatar(charId, imageId)`
- `exportCharacter(id)` / `exportAll()` (inline images) , `importCharacter(json)`
- Defensive normalize on read so legacy chars gain empty new fields.

Downscale: avatar max ~512px, gallery ~1024px, JPEG ~0.82. Reject non-images.

### Versioning / module dedup

`character-store.js` imports `./db.js?v=5`; app.js bumped to `./db.js?v=5` so a
single shared db instance. New modules `?v=1`. (branch/sprint/stats keep their
pre-existing plain `./db.js` instance — out of scope.)

### Rendering changes

- Card: avatar thumb (fallback type icon), accent = `accentColor||typeColor`, new edit (pencil) control.
- Async avatar hydration after sync render (reserve box → no CLS).
- Expanded: avatar/first gallery image + profile fields when present.

### Toolbar (injected above grid)

Search input (live, name/traits/profile), type chips (All/Protagonist/
Antagonist/Supporting), + Add Character, Export all / Import. Filter is a
render-time predicate (no mutation).

### Remove duplicate

Delete inline `CHARS/BEATS/renderCharCard/renderBeatCard/renderDashboard` +
inline dashboard-button wiring in index.html (~888–926, 931–939). Keep map
modal, mobile collapse, swipe-close (add `body.overflow=''` on swipe-close).

## Risks

- DB bump additive; `onversionchange` reload already handled.
- localStorage holds only text (small); images in IndexedDB.
- IndexedDB quota mitigated by downscale; export/import is backup path.
- No migration: legacy chars normalized with defaults on read.
