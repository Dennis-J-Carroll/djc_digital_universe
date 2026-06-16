# Research Section Improvements — Design

Date: 2026-06-16
Status: Approved (pending spec review)

## Context

The research section is already wired into the Gatsby site (untracked work):
`gatsby-config` sources `src/research`, `gatsby-node` creates `/research/<slug>` pages
with `src/templates/research-paper.js`, the hub lives at `src/pages/research/index.js`,
and three papers exist as MDX:

- `frequency-wins/` — Paper 1, live ("The Frequency Prior Trilogy")
- `steering-the-prior/` — Paper 2, live
- `frequency-direction/` — Paper 3, coming-soon

A companion tool, `static/apps/attn_flow_web.html`, is a fullscreen canvas particle
simulation of GPT-2 attention heads.

This design covers improvements to that existing implementation, plus an educational
layer and mobile-comfort pass requested during brainstorming.

## Goals

1. Remove hub/MDX duplication — single source of truth for paper card data.
2. Show the scale-sweep figures that Paper 1 currently only describes in prose.
3. Add navigable heading anchors to long papers.
4. Close the `createSchemaCustomization` gap (series fields) to prevent build flakiness.
5. Add reading-time to the paper meta row.
6. Audit MDX for bare `<` that MDX would misparse as JSX.
7. Add an explicit Paper 1 → Attn Flow link.
8. Add an educational drawer to the animation page (tokens / logits / probabilities,
   per-head mechanism explanation).
9. Ensure the whole section is comfortable on mobile (≤640px / 360px target).

Out of scope: rebuilding or changing the particle simulation logic; redesigning the
site theme; touching stories/projects MDX.

## Decisions (from brainstorming)

- **Hub DRY: full move.** Card-display fields move into each paper's frontmatter;
  hub queries them via GraphQL.
- **Reading time: computed field** in `onCreateNode` (words / 200), not manual frontmatter.
- **Animation panel: slide-out drawer**, toggle top-left, closed by default,
  full-width on mobile, sim runs behind.

## Design

### 1. Hub single source of truth

Add to each paper's MDX frontmatter:

```yaml
cardTitle: "Frequency Wins"          # short title for the hub card
tagline: "Diagnosing the lesion"
order: 1                              # hub sort order
highlights:
  - "ICL accuracy peaks at n=1 (79%), degrades monotonically to 55% at n=5"
  - "Circuit: heads L9H8, L8H11, L10H0 do retrieval and frequency amplification"
  - "..."
```

`src/pages/research/index.js`:
- Convert to a page component with a `graphql` page query.
- Query: `allMdx(filter: { internal: { contentFilePath: { regex: "/src/research/" } } },
  sort: { frontmatter: { order: ASC } })` returning `cardTitle, title, tagline,
  description, status, seriesNumber, tags, highlights` and `fields { slug }`.
  (`sourceInstanceName` is not directly queryable on Mdx in Gatsby 5; the contentFilePath
  regex is the reliable scope and excludes stories/projects.)
- Keep page-level constants in the file: trilogy `title`, `description`, `model`,
  `platform`, and the `tool` block. These are not per-paper and do not belong in
  frontmatter.
- Card render logic unchanged; data comes from `data.allMdx.nodes` instead of the
  hardcoded `trilogy.papers` array. Use `cardTitle || title` and build the link from
  `fields.slug`.

Risk: the regex filter must not catch other MDX. Verified scope is `/src/research/`.
Intentional: hub shows short `cardTitle`, the paper page shows the full `title`.

### 2. Scale-sweep images

- Copy `scale_headline.png` and `scale_trajectory_4sizes.png` from
  `~/Desktop/research/gpt2-interpretability/new_experiments/scale_results/`
  into `static/research/`.
- Insert `<figure>` blocks (img + figcaption) into `frequency-wins/index.mdx` at the
  scale-sweep section.
- Template CSS: `.research-content img { max-width: 100%; height: auto; border-radius: 8px;
  border: 1px solid rgba(120,180,255,0.12); }` and a muted, centered `figcaption`.

### 3. Heading anchor links

- `npm i rehype-slug rehype-autolink-headings`.
- `gatsby-config` `gatsby-plugin-mdx` `mdxOptions.rehypePlugins`:
  `[require('rehype-slug'), [require('rehype-autolink-headings'), { behavior: 'wrap' }]]`.
- Template CSS: heading anchor reveals a `#` on hover; keep it unobtrusive and
  keyboard-focusable.

### 4. Schema coverage

`gatsby-node.js` `MdxFrontmatter` typeDefs gain:
`series: String`, `seriesNumber: Int`, `seriesPrev: String`, `seriesNext: String`,
`tags: [String]`, `tagline: String`, `cardTitle: String`, `highlights: [String]`,
`order: Int`. Prevents null-type inference errors (e.g. `seriesNext: null` in Paper 3).

### 5. Reading time

`gatsby-node.js` `onCreateNode`: for MDX nodes under `src/research`, read the file body
(strip frontmatter), count words, `createNodeField({ node, name: "timeToRead",
value: Math.max(1, Math.round(words / 200)) })`.
Template query adds `fields { timeToRead }`; meta row renders `ClockIcon` + `N min read`.

### 6. MDX bare-`<` audit

Grep the three MDX files for `<` immediately followed by a letter (outside code fences).
Paper 1's `p < 0.0001` is safe (space follows). Fix any real offenders by escaping or
wording around them. No code change unless a match is found.

### 7. Paper 1 → Attn Flow link

One inline link in `frequency-wins/index.mdx` (near the mechanism/conclusion) to
`/apps/attn_flow_web.html`, making the paper↔tool connection explicit.

### 8. Animation educational drawer

`static/apps/attn_flow_web.html`, additive only — no simulation/canvas math changes.

- Toggle button (top-left, `?` key + touch). Drawer slides from left, closed by default,
  `~340px` desktop / full-width under 640px, scrollable with `max-height: 100vh`.
- Nested content:
  1. Primer — particles are probability mass drifting toward attended tokens; bright
     token = high incoming attention; the bar = attention mass.
  2. Glossary — token, logit, probability in plain language.
  3. Per-head accordion — the six heads (L7·H0 … L11·H2) with their mechanism role;
     the currently-displayed head is auto-highlighted as the user cycles
     (hook into existing `switchHead`).
  4. Controls list (keyboard + touch).
  5. "Read the paper →" link to `/research/frequency-wins/`.
- Mobile: add touch buttons for theme + reset to the existing nav cluster; shorten/hide
  the long HUD controls-hint line under 640px; drawer is a full-width bottom-or-side
  sheet on narrow screens.

### 9. Mobile-comfort pass

- Hub: stack the `Model · Platform` meta line on narrow widths so it does not wrap
  mid-value.
- Template: confirm tables (already `display:block` + horizontal scroll), series nav
  (`flex-wrap`), and new images hold at 360px.
- Animation: per item 8.
- Verify by building and eyeballing hub, Paper 1, and the animation at mobile width.

## Verification

- `npm run build` passes with no MDX/GraphQL errors.
- Hub renders all three cards from GraphQL; editing a frontmatter `tagline` changes the
  card with no `index.js` edit.
- Paper 1 shows the two scale figures and reading time; headings have anchors.
- Animation drawer opens/closes on desktop + mobile; per-head highlight tracks the sim.
- No layout breakage at 360px on hub, Paper 1, animation.

## Rollback

Each item is independently revertible. The risky pieces (hub GraphQL migration, rehype
plugin add) are isolated to `index.js` + `gatsby-config` and can be reverted without
affecting the others.
