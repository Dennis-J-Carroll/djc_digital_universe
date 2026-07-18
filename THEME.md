# Theme system — currently locked to Dark

As of 2026-07-18 the site is hardcoded to Dark theme only. The theme switcher
(header dropdown, Light / Tokyo Afternoon / 80s Retro / Dark) has been
removed. This doc explains why, what still exists to build on, and what a
real fix looks like if you want multi-theme support back.

## Why it was removed

The multi-theme system was never actually complete. Two independent things
determined how a page looked:

1. **Theme-aware components** — `Header`, `FeatureCard`, and a handful of
   CSS blocks in `src/styles/futuristic-ui.css` and `src/styles/cursor.css`
   read the `body.light-theme` / `body.tokyo-afternoon-theme` /
   `body.retro-80s-theme` class and switch colors accordingly.
2. **Everything else** — the actual page sections (hero, research card
   section, Featured Apps grid, Contact, About, Apps, Stories...) are built
   with hardcoded Tailwind dark-palette classes: `bg-gray-900`, `bg-black`,
   `text-gray-400`, gradient stops like `from-gray-900/90 to-black`. These
   never look at the body theme class at all — they're always dark.

Three separate places also independently read `localStorage.getItem('theme')`
and applied a theme class on mount (`src/hooks/useTheme.js` — unused/dead,
`src/components/layout/header.js`, `src/components/layout/layout.js`),
which was itself a smaller bug (duplicated, uncoordinated init logic).

Net effect: if `theme` in `localStorage` was ever set to anything but
`dark` (e.g. from tapping the dropdown once on a phone), the nav bar and
any `FeatureCard` instance would switch to that theme's colors while the
rest of the page stayed hardcoded dark. This produced exactly the bug that
prompted this change — a cream-colored nav bar and a white card sitting in
an otherwise dark-navy page, with the hero subtitle rendering dark-on-dark
and becoming unreadable.

## What's still in the repo

- `src/constants/index.js` — the `THEMES` array (`dark`, `light`,
  `tokyo-afternoon`, `retro-80s`) is untouched.
- `src/hooks/useTheme.js` — a `useTheme()` hook implementing
  get/set/persist theme. It was never actually imported anywhere before
  this change (dead code, duplicating header.js's own inline logic) — but
  it's a reasonable starting point for a real implementation if you
  centralize state there instead of in `Header`.
- `src/styles/futuristic-ui.css` — CSS custom properties per theme
  (`:root`, `body.light-theme`, `body.dark-theme`) plus `body.light-theme`
  / `body.tokyo-afternoon-theme` overrides for gray-text contrast, font
  weight, and footer background.
- `src/styles/cursor.css` and `src/components/shared/feature-card.css` —
  more `body.light-theme` / `body.tokyo-afternoon` overrides.
- `src/components/shared/space-background.js` — already watches
  `document.body` class via `MutationObserver` and adjusts particle/gradient
  colors per theme. This still works correctly; it just never sees a
  non-dark class now, so it always renders the dark variant.

None of this CSS or logic was deleted — it's just unreachable because
nothing sets a non-`dark-theme` class on `<body>` anymore. Removed only:
the two `<select>` dropdowns in `src/components/layout/header.js` (desktop
+ mobile drawer), `handleThemeChange`, `themeSelectStyle`, and the
localStorage-driven init in both `header.js` and `layout.js` (now they
unconditionally add `dark-theme`).

## What a real fix needs

Bringing multi-theme back properly — not just restoring the dropdown —
means closing the gap described above:

1. **Single source of truth for theme init.** Pick one place (probably
   `layout.js`, or actually wire up `useTheme.js` and call it from
   `Header`) that reads `localStorage` once and sets the body class before
   anything else renders, ideally via an inline `<script>` in `gatsby-ssr.js`
   so there's no flash-of-wrong-theme on load. Remove the redundant copies.
2. **Audit every hardcoded dark Tailwind class.** Grep for `bg-gray-9`,
   `bg-black`, `text-gray-`, `from-gray-900`, `to-black` etc. across
   `src/pages/*.js` and `src/components/**/*.js`. Each one needs to become
   either a CSS-variable-backed class (`background: var(--bg-primary)`
   etc. — the variables already exist per-theme in `futuristic-ui.css`) or
   a set of `body.light-theme .foo { ... }` overrides like the existing
   ones in that file. This is the actual bulk of the work — it touches
   most page files, not just shared components.
3. **Restore the switcher UI** in `header.js` once (2) is done — otherwise
   you're just reintroducing the original bug (a working dropdown that
   only half-applies).
4. **Re-add the two removed tests** in
   `src/components/layout/__tests__/header.test.js` (`renders theme
   selector`, `theme selector has theme options`) once the dropdown is back.
5. **Test all four themes on the homepage and About page specifically** —
   those are the pages with the most hardcoded-dark section backgrounds and
   the most surface area for this bug to recur.

Until (2) is done for a given page, do not re-enable the switcher — a
partially-themed page is worse than a single consistent dark theme.
