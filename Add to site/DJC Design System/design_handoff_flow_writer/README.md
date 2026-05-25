# Handoff: Flow Writer (DJC redesign)

## Overview

Flow Writer is a focus-oriented writing app for Dennis J. Carroll's apps gallery.
This package redesigns the existing `dennisjcarroll.com/apps/flow_writer.html` to
the DJC brand (deep navy + electric teal, glassmorphic, futuristic-neural) and adds
real working interactions on top of the original feature set: live word count,
inline tag detection, autosaving with per-document storage, focus mode, typewriter
mode, branching, a command palette, and export to TXT/MD/HTML.

The target deployment is the Gatsby 5 + React 18 + Tailwind 4 site at
`Dennis-J-Carroll/djc_digital_universe`. Two integration options below.

---

## About the design files

The files in `reference/` are **design references created in HTML** — a working
prototype showing the intended look and behaviour. They are not production code
to copy directly.

The task is to **recreate this design inside the target codebase** (Gatsby 5 +
React 18 + Tailwind 4) using its existing patterns: Tailwind utilities with the
DJC token palette, the site's existing `Layout` + `Seo` components, Framer Motion
for the animations the prototype hand-rolls in plain CSS, and the site's font
loading (Orbitron / Space Grotesk / JetBrains Mono are already configured).

Vanilla DOM event handlers, `localStorage`, `document.querySelector`, and the
inline `<style>` block in the prototype are *reference behaviour* — re-express
them with React state, `useEffect`, custom hooks, and Tailwind classes.

---

## Fidelity

**High-fidelity.** Final colours, type scale, spacing, motion timings, and
interaction details are all specified. Recreate pixel-perfect within Tailwind's
constraints (add a `tailwind.config.js` extension below for the bespoke teal/navy
ramps). Where the prototype uses inline CSS variables from
`colors_and_type.css`, the target codebase already has `--primary-color: #00bcd4`
in `src/styles/global.css` (very close to `--teal-500: #14b89a`). Use the design
system's exact values; the existing `futuristic-ui.css` theme is close but not
identical.

---

## Screens / Views

Single-screen app. Full-viewport CSS grid layout.

### Layout (root grid)

```
grid-template-columns: 280px  1fr  320px
grid-template-rows:    52px   1fr  36px
grid-template-areas:
  "topbar topbar topbar"
  "left   center right"
  "status status status"
```

Focus mode collapses left + right columns to `0` (animated, 420ms).

Background: `radial-gradient` auroras at 15%/0% and 100%/100% (teal at
0.10 + 0.08 alpha), over flat `--navy-950` (`#070e1a`).

Below 920px the side panes hide; centre flexes full-width. (Mobile is reading
fallback only — the writing experience targets desktop.)

---

### 1. Topbar (52px tall, sticky)

- Background: `rgba(7, 14, 26, 0.72)` + `backdrop-filter: blur(14px)`
- Border-bottom: `1px solid rgba(124, 180, 200, 0.08)` (--border-subtle)
- Padding: `0 24px`, horizontal flex, gap `16px`
- z-index: 30

**Left cluster (in order):**
- `← Projects` back link — 12px text, `--fg-3` (`#7d92ab`), 1px subtle border,
  `4px 10px` padding, `8px` radius. Hover → teal accent border + faint teal bg.
- DJC brand tile — `28×28px`, `7px` radius, gradient `linear-gradient(135deg,
  #0b7e68 0%, #14b89a 100%)` (--grad-brand-deep), `box-shadow: 0 0 12px
  rgba(20,184,154,0.35), inset 0 1px 0 rgba(255,255,255,0.04)`. Contains "DJC" in
  JetBrains Mono 10px/700, white.
- Wordmark: `FLOW WRITER` in Orbitron 14px/700, letter-spacing `0.06em`. "FLOW"
  is `--fg-1` (`#ecf4fb`), "WRITER" is `--teal-300` (`#44d6b8`).

**Centre cluster:**
- Scene summary pill — pill-shaped (`border-radius: 999px`), `6px 14px`,
  `rgba(20,41,63,0.45)` bg, subtle border. Contains a 6×6px teal dot with
  `box-shadow: 0 0 8px <teal>`, then a label like `Chapter 1 — Discovery · The
  Lost Library` in JetBrains Mono 11px, `--fg-3`. Updates when the active doc
  in the tree changes.

**Right cluster (icon buttons, in order):**
- `⌘K` — opens command palette
- `🎯` — toggles focus mode
- `⌨︎` — toggles typewriter mode
- `?` — opens keyboard shortcuts modal

Icon buttons: `32×32px`, `8px` radius, subtle border, `--fg-3` icon. Hover/active
→ teal accent, `box-shadow: 0 0 12px rgba(20,184,154,0.35)`. The active state
(focus/typewriter on) also adds `rgba(20,184,154,0.10)` background.

---

### 2. Left pane (280px, story universe)

Padding `24px 16px`, vertical scroll. Border-right: subtle.

**Project switcher** — full-width row, gradient card background (--grad-card),
`12px 10px` padding, `12px` radius. Icon `📦` in teal, label "The Lost Library"
13px/500, chevron `▾` muted. Clicking is a placeholder ("Multi-project · coming
soon") — wire to your project model later.

**Branch row** — two elements:
- Pill `⎇ main`: 4px/10px padding, `rgba(20,184,154,0.10)` bg, teal accent
  border, teal text, JetBrains Mono 11px, `box-shadow: 0 0 12px
  rgba(20,184,154,0.35)`.
- `+ branch` button: dashed border, becomes solid teal on hover. Opens the
  Create Branch modal.

**Story Universe tree** — section eyebrow (Orbitron 10px/600 uppercase, letter-
spacing `0.18em`, teal-300) + folder/file list.

- Folder rows have a `▶` caret that rotates `90°` when open (140ms).
- Children list nested with `1px dashed` left border, `padding-left: 16px`,
  `4px` top margin.
- Active file row: `rgba(20,184,154,0.10)` bg, teal accent border, teal-glow
  shadow, **plus a 2px teal vertical accent bar** at `left: -10px` extending the
  height of the item, with `box-shadow: 0 0 6px <teal>` (signature pin marker).
- File icons colour-coded:
  - `⌐` document — teal-300
  - `≡` notes — teal-300
  - `◉` character — electric-violet (#7c4dff)
  - `▦ / ▲` map — warn-amber (#f4b840)

**Branch History panel** — at the bottom of the left pane.
- `12px` padding, `rgba(7,14,26,0.5)` bg, subtle border, 12px radius.
- Each commit: 8×8 teal dot with glow (current) or muted fg-4 (past), then a
  monospace 11px label, with optional `· 2h` timestamp in fg-4.
- Between commits a 1px vertical stem (`12px tall`, subtle border colour),
  inset 4px from the left to align under the dot.

---

### 3. Centre (editor)

Flex column, overflow hidden. Contains scene banner, editor scroll-region, and
the floating nudge.

**Scene banner** (collapsible)
- `max-width: 720px`, centred, `24px` margin-top, `16px 24px` padding.
- `--grad-card` background, subtle border, `16px` radius.
- `box-shadow: 0 6px 18px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`.
- Top row: eyebrow "◇ Scene Goal · Pinned" left, "From Chapter 1 Outline.md"
  right (source name in teal-300). JetBrains Mono 10px uppercase, letter-
  spacing `0.12em`, --fg-4.
- Body: Orbitron 16px/500, color --fg-1. Inline `<em>` gets a teal *highlighter*
  effect: `background: linear-gradient(180deg, transparent 65%, rgba(20,184,154,
  0.25) 65%, rgba(20,184,154,0.25) 100%)`, padding `0 2px`, not italic.
- Close button at top-right (`×`) collapses the banner with a 420ms animation
  on max-height + padding + margin + opacity.

**Editor scroll wrap**
- Padding `32px 48px`, vertical scroll only.
- Custom scrollbar (8px wide, `--navy-700` thumb, transparent track).

**Editor textarea**
- Centred, `max-width: 720px` by default (Narrow 560 / Medium 720 / Wide 880 /
  Full).
- Transparent bg, no border, no outline.
- Font: serif by default (`'Iowan Old Style', Charter, Georgia, serif`),
  swappable to Garamond, Sans (Space Grotesk), or Mono (JetBrains Mono) via
  the `data-family` attribute on the centre column.
- Size 18px default (slider 14–28). Line-height: Compact 1.45 / Normal 1.7 /
  Spacious 2.0.
- Color: `--fg-1` (#ecf4fb). Caret-color: teal-300.
- Selection: `background: rgba(20,184,154,0.30); color: --fg-1`.
- Placeholder: italic, `--fg-4` (#4e6480).
- Padding-bottom: `50vh` so the user can keep typing at the visual mid-line.
- Letter-spacing: `0.005em` (a hair of breathing room).

**Typewriter mode**
- Adds `padding-top: 35vh` to the editor-wrap.
- On keyup/click, scrolls `editorWrap` so the caret line sits near vertical
  centre. The prototype computes the line index from `selectionStart`, multiplies
  by the computed line-height, and sets `scrollTop`. In React this is a
  `useEffect` that runs on every text change + selection change, against a ref
  to the wrap and the textarea.

**Flow nudge** (idle prompt)
- Floating card, bottom-centre of the editor area, `bottom: 32px`, translate-x
  `-50%`.
- Background: `rgba(7,14,26,0.85)` + `backdrop-filter: blur(14px)`.
- Border: 1px teal-accent. Shadow: `--glow-teal-md`.
- 12px/18px padding, 12px radius. Max-width 520px.
- Layout: round icon badge (22px, `rgba(20,184,154,0.18)`, teal `✦`), prose,
  dismiss `×` button.
- Prose 13px, `--fg-2`. The hint word inside is wrapped in `<em>` styled non-
  italic, teal-300.
- Hidden by default with `opacity: 0; transform: translateY(8px); pointer-events:
  none`. Showing transitions both over 420ms.
- Timer: after the configured delay of keyboard silence (default 35s,
  user-adjustable 0–120s, 0 = off), pop one of the canned nudges (rotating
  pool). Dismissing or typing resets the timer.

---

### 4. Right pane (320px, tags + format + export)

Padding `24px 16px`, border-left subtle, vertical scroll.

**Mode block** — 2-column grid (gap 6px) of two `mode-btn`s:
- Each button: `9px 8px` padding, `rgba(7,14,26,0.5)` bg, subtle border, 8px
  radius, --fg-3 text, JetBrains Mono 11px, centre-aligned.
- Active: `rgba(20,184,154,0.10)` bg, teal-accent border, teal text, teal-sm
  glow.
- Labels: `🎯 Focus` and `⌨︎ Typewriter`. (These mirror the topbar icons; either
  surface toggles state.)

**Auto-Detected tags**
- Generated from the editor body via these regexes (case-insensitive):
  - `protagonist`: `\b(sarah|her|she)\b`
  - `mystery`: `\b(hidden|secret|whisper|silence|locked|never)\b`
  - `discovery`: `\b(found|discover|reveal|open|panel|shift|inch)\b`
  - `dialogue`: smart-quoted or straight-quoted span
  - `flashback`: `\b(remembered|once|years ago|grandmother|childhood)\b`
  - `setting`: `\b(library|shelf|oak|dust|window|room|corridor)\b`
  - `emotion`: `\b(tremble|breath|gasp|tear|ache|fear|wonder)\b`
- Chip style: teal-glow border + faint teal bg, JetBrains Mono 11px, pill,
  teal-300 text.
- Empty state: dashed-border "no signals yet" chip in --fg-3.

**Manual tags**
- Same chip shape, electric-cyan (#3ef0e2) text, cyan-tinted border.
- Each has a `×` close glyph (--fg-4 → danger-red on hover).
- After the last chip: a dashed `+` chip containing an inline input. Enter
  commits a new tag (lowercased, spaces → `_`). De-duped against existing.

**Suggested tags**
- Pre-canned: `+ flashback`, `+ emotional_tension`. Dashed border, --fg-3 text.
- Click promotes to manual.

**Typography group**
Each fmt-group is a 24px-bottom block with a label row (11px, --fg-3 + a teal-
300 mono value on the right) and either a segmented control or a slider.

- **Family** segmented control: Serif (default) / Garamond / Sans / Mono.
  Active button: `--grad-brand-deep` bg, white text, teal-sm glow, inset top
  highlight.
- **Size** slider: 14–28, step 1, default 18. Custom thumb (14×14 teal-300
  circle, 2px navy-950 border, teal-sm glow).
- **Line Height** segmented: Compact 1.45 / Normal 1.7 / Spacious 2.0.
- **Width** segmented: Narrow 560 / Medium 720 / Wide 880 / Full (`max-width:
  none`).

**Flow Nudges** group
- Slider 0–120s, step 5, default 35.
- Subline "0 = off · drift on silence" in --fg-4.

**Export** row — 3-up grid of cards:
- Each `10px/6px` padded, `--grad-card` bg, subtle border, 8px radius. Two
  stacked labels: bold uppercase extension (`TXT`/`MD`/`HTML`, 12px), then a 9px
  Uppercase tracked --fg-4 sublabel (`Plain`/`Markdown`/`Print`).
- Hover: teal accent border, teal-sm glow, `translateY(-2px)`.

---

### 5. Status bar (36px, bottom)

- `rgba(7,14,26,0.85)` + blur, 1px subtle top border.
- JetBrains Mono 11px, --fg-3 text, padding `0 24px`, gap 16px. z-index 30.
- Items, in order:
  - **Flow state** — `In flow` (pulse-green dot, `0 0 6px pulse-green` glow,
    `2s` pulse animation) / `Idle` (warn-amber dot, no glow). Switches to Idle
    after 6s of no keyboard activity.
  - **Word count** — `N words · M min read` (M = max(1, round(words/230))).
  - **Branch** — `⎇ <branch-name>` in teal-300.
  - **Save state** — animated saving dot during the 600ms debounce, then
    "Saved · just now" with a teal glow dot.
  - Spacer.
  - Two kbd hints: `⌘K commands` and `? shortcuts`. `<kbd>` style: 1px subtle
    border, `rgba(7,14,26,0.6)` bg, 3px radius, 10px mono, --fg-3.

Animations:
```css
@keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
```

---

### 6. Modals

Shared scrim: `position: fixed; inset: 0`, `rgba(7,14,26,0.6)` + `backdrop-
filter: blur(6px)`, grid-place start-centre with `padding-top: 12vh`, z-index
100.

Scrim entrance: opacity 0→1 over 240ms. Modal body slides up 8px + scales from
0.98 to 1 over 240ms.

**Modal card**
- `width: min(560px, 92vw)`.
- `--grad-card` bg, 1px `--border-line` border (`rgba(124,180,200,0.18)`), 16px
  radius.
- `box-shadow: 0 14px 40px rgba(0,0,0,0.5), 0 0 22px rgba(20,184,154,0.45), 0 0
  42px rgba(62,240,226,0.18)`.
- Header: 16/24 padding, subtle bottom border, Orbitron 14px uppercase title
  letter-spacing 0.06em.
- Footer: 12/24 padding, subtle top border, `rgba(7,14,26,0.4)` bg, right-
  aligned button row.

**Buttons** (`.btn`)
- `8px 16px`, 8px radius, Orbitron 12px uppercase, letter-spacing 0.06em.
- Default: transparent bg, 1px `--border-line`, --fg-2.
- Primary: `--grad-brand-deep` bg, white text, transparent border, teal-sm glow
  + inset highlight. Hover → teal-md glow.

**Command palette** (⌘K)
- Header doubles as the search input row.
- Results list, max-height 320px, scrollable.
- Item: 24×24 icon tile (teal/teal-rgba bg, 6px radius), label 13px --fg-1,
  shortcut kbd chip on the right.
- Selected item: `rgba(20,184,154,0.08)` bg, 2px teal-left border.
- Arrow keys move selection (with `scrollIntoView({block:'nearest'})`),
  Enter triggers, Esc closes.

**Create Branch** (⌘B)
- Body paragraph, then text input. Footer Cancel + Create branch.
- Submit lowercases + sanitises (`/[^a-z0-9_-]/g → -`), then updates the branch
  chip + status bar branch label and flashes "Branched · <name>" in the save
  slot.

**Keyboard Shortcuts** (`?`)
- 2-col grid (label / keys). Keys are 1px subtle border, 2px bottom border,
  `rgba(7,14,26,0.6)` bg, 4px radius, JetBrains Mono 11px, teal-300, min-
  width 18px.

---

## Interactions & Behaviour

### Editor input flow
On every keystroke:
1. Bump `lastKey = Date.now()`.
2. Recount words + reading time.
3. Re-run auto-tag regex sweep, re-render the auto chips.
4. Set flow state to "In flow", reset the 6s → Idle timer.
5. Debounce-save (600ms) to `localStorage`, swap save badge through saving →
   saved.
6. Reset the flow-nudge timer (delay × 1000ms).
7. Re-apply typewriter scroll if mode is on.

### Modes
- **Focus** — toggle `app.focus-mode`, which animates the grid-template-columns
  to `0 1fr 0` over 420ms and fades both panes (`opacity 1→0`, translate ±8px).
  Also collapses the scene banner.
- **Typewriter** — toggle `center.typewriter` and update scroll on key/click.
- **Scene goal collapse** — toggle `sceneBanner.collapsed`, animate max-height,
  padding, margin, opacity, border-colour.

### Tree
- Folder rows toggle their parent `.tree-folder.open` class; caret rotates 90°.
- File rows mark themselves `.active` (clearing siblings), `loadDoc(id)` runs:
  - Stash the current textarea value into `state.docs[oldId]`.
  - Set `editor.value = state.docs[newId] ?? ''`.
  - Update the scene summary pill label.
  - Re-run word count + auto-tags.

### Tag input
- `Enter` commits the value if non-empty and not already present. Refocus the
  input after re-render.
- `×` glyph on a manual tag removes it.

### Branch creation
- Modal opens via `⌘B`, the toolbar button, or the command palette.
- Submit updates `state.branch`, the in-pane chip text, and the status-bar
  label.

### Command palette
- ⌘K opens. Input is fuzzy-matched against command labels with a regex of
  the input letters separated by `.*`.
- ↑/↓ moves `.sel`, Enter clicks, Esc closes.
- Commands: toggle focus / typewriter / scene goal, create branch, save
  snapshot, show shortcuts, open each tree doc, export TXT/MD/HTML.

### Export
- `txt`: raw textarea contents.
- `md`: `# <doc title>\n\n<contents>`.
- `html`: minimal print-styled doc (Georgia, 680px column, line-height 1.7,
  black on white). Whitespace preserved with `white-space: pre-wrap`.
- Filename is the active doc label sanitised.

### Idle state
- 6s after last keystroke, flow indicator → "Idle" with warn-amber dot.

### Persistence
- Single `localStorage` key (`djc-flow-writer-v1`).
- Stored shape:
  ```ts
  {
    docId: string,
    branch: string,
    docs: Record<DocId, string>,
    manualTags: string[],
    fmt: { family, size, lh, width, flowDelay },
    modes: { focus, typewriter, sceneCollapsed },
  }
  ```
- On boot: hydrate state, fall back to a seeded sample of "The Lost Library".

### Animations & timings
| Where | Property | Duration | Easing |
|---|---|---|---|
| Hover transitions | `all` | 140ms | `cubic-bezier(.2,.7,.2,1)` |
| Toggle ribbons / standard | varies | 240ms | same |
| Pane collapse / banner collapse / focus | grid + opacity | 420ms | same |
| Pulse on flow / save dot | opacity 1↔0.4 | 2s | infinite |

No bounces. No overshoots. Quick in, smooth settle.

---

## State Management (React translation)

Suggested shape — a single hook owns it all.

```ts
type DocId = 'ch1' | 'ch2' | 'notes' | 'sarah' | 'layout' | 'map';

interface FmtState {
  family: 'serif' | 'garamond' | 'sans' | 'mono';
  size: number;          // 14–28
  lh: number;            // 1.45 | 1.7 | 2.0
  width: '560'|'720'|'880'|'100%';
  flowDelay: number;     // 0–120 (seconds; 0 = off)
}

interface ModeState {
  focus: boolean;
  typewriter: boolean;
  sceneCollapsed: boolean;
}

interface AppState {
  docId: DocId;
  branch: string;
  docs: Record<DocId, string>;
  manualTags: string[];
  fmt: FmtState;
  modes: ModeState;
}
```

Hooks/refs needed:
- `useLocalStorage<AppState>('djc-flow-writer-v1', seed)` — sync state to disk.
- `useDebouncedEffect(value, 600, () => save())` — for the save badge.
- `useIdle(lastInputAt, 6000)` — flow → idle.
- `useFlowNudge(lastInputAt, fmt.flowDelay)` — emit a nudge after the delay.
- `useTypewriterScroll(textareaRef, wrapRef, enabled)` — sync scrollTop.
- `useCommandPalette()` — open/close, query, fuzzy filter.

Framer Motion handles: focus-mode column animation, scene-banner collapse,
modal entry, nudge enter/exit. Use `layout` animations on the grid and
`AnimatePresence` for the nudge & modals.

---

## Design Tokens

All canonical values live in `reference/colors_and_type.css`. Pull them in via
Tailwind's theme extension and a small `:root` CSS block.

### Colors
| Token | Hex | Use |
|---|---|---|
| `--navy-950` | `#070e1a` | App bg |
| `--navy-900` | `#0a1423` | Surface |
| `--navy-800` | `#0f1d31` | Raised |
| `--navy-700` | `#14293f` | Scrollbar / slider track |
| `--navy-600` | `#1d3852` | Borders @ depth |
| `--teal-500` | `#14b89a` | Primary accent (used as glow base) |
| `--teal-400` | `#2dc7a6` | Hover step |
| `--teal-300` | `#44d6b8` | Accent text, brand wordmark |
| `--teal-700` | `#0b7e68` | Gradient stop |
| `--electric-cyan` | `#3ef0e2` | Hi-energy highlight, manual tags |
| `--electric-violet` | `#7c4dff` | Character file rows |
| `--warn-amber` | `#f4b840` | Map files, idle state |
| `--pulse-green` | `#4ade80` | Live/flow dot |
| `--danger-red` | `#ff5d73` | Destructive hover |
| `--fg-1` | `#ecf4fb` | Headings, editor body |
| `--fg-2` | `#b8c6d8` | Default text |
| `--fg-3` | `#7d92ab` | Muted |
| `--fg-4` | `#4e6480` | Disabled / hint |

### Glows
```css
--glow-teal-sm: 0 0 12px rgba(20, 184, 154, 0.35);
--glow-teal-md: 0 0 22px rgba(20, 184, 154, 0.45),
                0 0 42px rgba(62, 240, 226, 0.18);
--glow-cyan:    0 0 18px rgba(62, 240, 226, 0.55);
```

### Spacing (4pt grid)
| Token | px |
|---|---|
| --space-1 | 4 |
| --space-2 | 8 |
| --space-3 | 12 |
| --space-4 | 16 |
| --space-5 | 24 |
| --space-6 | 32 |
| --space-7 | 48 |
| --space-8 | 64 |

### Type
| Token | Value |
|---|---|
| `--font-display` | `Orbitron, Space Grotesk, system-ui, sans-serif` |
| `--font-sans` | `Space Grotesk, system-ui, sans-serif` |
| `--font-mono` | `JetBrains Mono, ui-monospace, Menlo, monospace` |

Scale: `xs 12 / sm 14 / md 16 / lg 18 / xl 22 / 2xl 28 / 3xl 36`.

### Radii
`xs 4 / sm 8 / md 12 / lg 16 / xl 24 / pill 999`.

### Tailwind config addition
```js
// tailwind.config.js — extend with these (Tailwind 4 syntax)
theme: {
  extend: {
    colors: {
      navy: { 50:'#eaf0f5', 100:'#cdd9e5', 200:'#9fb5ca', 300:'#6d89a8',
              400:'#46678a', 500:'#2a4d6d', 600:'#1d3852', 700:'#14293f',
              800:'#0f1d31', 900:'#0a1423', 950:'#070e1a' },
      teal:  { 50:'#e6fbf7', 100:'#b8f2e5', 200:'#7ce5cf', 300:'#44d6b8',
              400:'#2dc7a6', 500:'#14b89a', 600:'#0fa387', 700:'#0b7e68',
              800:'#075844', 900:'#043327' },
      'electric-cyan':   '#3ef0e2',
      'electric-violet': '#7c4dff',
      'pulse-green':     '#4ade80',
      'warn-amber':      '#f4b840',
      fg: { 1:'#ecf4fb', 2:'#b8c6d8', 3:'#7d92ab', 4:'#4e6480' },
    },
    fontFamily: {
      display: ['Orbitron','Space Grotesk','system-ui','sans-serif'],
      sans:    ['Space Grotesk','system-ui','sans-serif'],
      mono:    ['JetBrains Mono','ui-monospace','Menlo','monospace'],
    },
    boxShadow: {
      'glow-teal-sm': '0 0 12px rgba(20,184,154,0.35)',
      'glow-teal-md': '0 0 22px rgba(20,184,154,0.45), 0 0 42px rgba(62,240,226,0.18)',
      'glow-cyan':    '0 0 18px rgba(62,240,226,0.55)',
      'inset-hi':     'inset 0 1px 0 rgba(255,255,255,0.04)',
    },
    transitionTimingFunction: {
      'out-djc':    'cubic-bezier(.2,.7,.2,1)',
      'in-out-djc': 'cubic-bezier(.65,0,.35,1)',
    },
  }
}
```

---

## Assets

- **DJC logo tile** — rendered in CSS (no image file): 28×28 rounded square,
  teal gradient, "DJC" in JetBrains Mono. Sits in the topbar. The full logo at
  `assets/djc-logo.jpg` (in the source design-system project) is not needed for
  this view.
- **Icons** — Unicode glyphs / single emoji throughout (`📦 ⎇ 📂 ⌐ ≡ ◉ ▦ ▲ ◇
  ✦ × ▶ ▾ ⌘ ⇧ ⌨︎ 🎯`). If you'd rather match the rest of the codebase's hand-
  rolled stroke SVGs, swap to Lucide equivalents: `package`, `git-branch`,
  `folder`, `file-text`, `file-text`, `user`, `map`, `map`, `diamond`,
  `sparkle`, `x`, `chevron-right`, `chevron-down`, `command`, `keyboard`,
  `crosshair`. The DJC system flags Lucide as the approved icon substitute.
- **Fonts** — Orbitron, Space Grotesk, JetBrains Mono. Already loaded via
  Google Fonts in `colors_and_type.css`; the live codebase loads Orbitron +
  Space Grotesk already and only needs JetBrains Mono added to its existing
  Google Fonts import.

---

## Integration paths

The project's `CLAUDE.md` documents two patterns the team has used before for
similar HTML drops (`Crack in the Veil`). Reuse them.

### Option A — Static drop-in (fast)
1. Copy `reference/Flow Writer.html` and `reference/Flow Writer.js` into the
   Gatsby `static/` folder, renamed to be URL-friendly:
   - `static/flow-writer.html`
   - `static/flow-writer.js`
2. The HTML references `Flow Writer.js` — update the `<script src>` to match
   the renamed JS.
3. The HTML also references `../colors_and_type.css`. Either:
   - copy `reference/colors_and_type.css` into `static/` and rewrite the link
     to `colors_and_type.css`, **or**
   - paste the token block into `src/styles/global.css` and remove the
     `<link>` (preferred — single source of truth).
4. Link to it from the Apps page:
   `<a href="/flow-writer.html">Flow Writer →</a>`.
5. Live at `https://dennisjcarroll.com/flow-writer.html`.

This is identical to the Crack in the Veil pattern already in the repo.

### Option B — Native Gatsby route + React refactor (preferred long-term)

1. Add the Tailwind config extension above.
2. Create `src/pages/apps/flow-writer.js` rendering a `<FlowWriter />` client
   component inside the site's existing `Layout` + `Seo`.
3. Decompose by region:
   ```
   src/components/flow-writer/
     index.jsx                  → grid shell, mode state, keyboard handler
     Topbar.jsx
     LeftPane/
       ProjectSwitcher.jsx
       BranchChip.jsx
       Tree.jsx
       BranchGraph.jsx
     Editor/
       SceneBanner.jsx
       Editor.jsx               → textarea + typewriter scroll hook
       FlowNudge.jsx
     RightPane/
       ModeToggle.jsx
       TagSection.jsx
       FormatGroup.jsx
       ExportRow.jsx
     StatusBar.jsx
     modals/
       CommandPalette.jsx
       BranchModal.jsx
       ShortcutsModal.jsx
     hooks/
       useFlowWriterState.js
       useTypewriter.js
       useFlowNudge.js
       useAutoTags.js
       useShortcuts.js
   ```
4. Animations: replace the CSS `transition: grid-template-columns` and the
   collapse transitions with `motion.div` + `layout` props. Modal entry → wrap
   in `AnimatePresence` with the same 240ms timing and easing as the prototype.
5. Persistence: `useLocalStorage('djc-flow-writer-v1', seed)` (the
   site's existing site-wide theme persistence pattern can be reused).
6. SEO: title "Flow Writer · Dennis J. Carroll", description matches the
   prototype's intent, `pageType="website"`. Add to nav in
   `src/constants/index.js` under Apps:
   `{ id: 'flow-writer', label: 'Flow Writer', path: '/apps/flow-writer' }`.

---

## Acceptance checklist

A reasonable PR for this should:

- [ ] Render the three-column grid with the exact widths and the 52/36 bars.
- [ ] Match the colour ramps + glows (no `bg-cyan-500` shortcuts — use the
      navy/teal tokens added to tailwind config).
- [ ] Load Orbitron + Space Grotesk + JetBrains Mono and apply them to the
      brand wordmark, body, and mono chips respectively.
- [ ] Persist state under `djc-flow-writer-v1` across reloads.
- [ ] Auto-tag detection runs on every input, with the same regexes.
- [ ] Save badge cycles saving → saved with the 600ms debounce.
- [ ] Flow nudge appears after the configured delay; Esc and the dismiss
      button hide it; the timer resets on input.
- [ ] Focus mode collapses both panes + the scene banner.
- [ ] Typewriter mode keeps the caret line near vertical centre.
- [ ] All keyboard shortcuts in the modal actually work (incl. inside text
      inputs they shouldn't fire — guard with `document.activeElement`).
- [ ] Command palette: fuzzy filter, ↑/↓ + Enter, Esc, click.
- [ ] Branch creation updates both the chip and status-bar label.
- [ ] Export downloads the three formats with the active doc's title as
      filename.
- [ ] Reduced-motion query disables the pulse + nudge transitions (the
      prototype's site-wide `prefers-reduced-motion` rule applies — keep it).
- [ ] Below 920px the side panes hide gracefully.

---

## Files in this handoff

| File | Purpose |
|---|---|
| `README.md` | This document. Self-sufficient — implement from this alone. |
| `reference/Flow Writer.html` | Working prototype, markup + styles |
| `reference/Flow Writer.js` | Working prototype, behaviour |
| `reference/colors_and_type.css` | Design tokens — colours, type, spacing, radii, shadows, glows, gradients |

Open `reference/Flow Writer.html` in a browser to interact with the reference
implementation. Every interaction in the acceptance checklist is wired in that
file.
