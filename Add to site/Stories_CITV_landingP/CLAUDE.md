# CLAUDE.md — DJC Design System Project

## What this project is
Design system and landing page for Dennis J. Carroll's personal website and the **Crack in the Veil** story universe. Contains:
- CSS token file (`colors_and_type.css`) — full brand token system
- Design system preview cards (`preview/`) — 19 spec cards covering Colors, Type, Spacing, Components, Brand
- Website UI kit (`ui_kits/website/`) — hi-fi React recreation of dennisjcarroll.com
- **Crack in the Veil landing page** (`Crack in the Veil.html`) — immersive story universe hub

---

## Crack in the Veil landing page

### What it does
Full-viewport animated cracked-glass hero built on a `<canvas>` element. Cracks radiate from a central impact point using a recursive fractal crack algorithm. Teal/cyan glow along every fault line. Drift particles float along the cracks. On load, cracks grow in over ~2.4s.

**Click interaction:** Clicking anywhere in the hero spawns a new crack from that exact point — radial fractures with sub-branches, expanding ring burst, cyan glow. Cracks accumulate and fade out over ~6–9 seconds.

### Key implementation details
- Canvas is `position: absolute; inset: 0` inside `.hero`
- The gradient overlay (`.hero-overlay`) has `pointer-events: none` so clicks pass through to the canvas
- Click listener is on `#hero` (the section), not the canvas, so it fires across the full hero area
- `makeCrack(x, y, angle, length, depth, maxDepth)` — recursive segment builder; depth controls sub-branching
- `clickCracks[]` array stores `{ segs, born, x, y }` objects; draw loop renders them with a grow + fade lifecycle
- After `FADE_START` (6000ms) cracks begin fading; pruned from array after 9000ms

---

## How to insert the landing page into the live Gatsby site

The live site is at **dennisjcarroll.com**, built with Gatsby 5 + React 18 + Tailwind CSS. Repo: `Dennis-J-Carroll/djc_digital_universe`.

### Option A — Static drop-in (fastest, zero build required)
The `Crack in the Veil.html` file is fully self-contained (Google Fonts CDN, no other dependencies). Drop it into the Gatsby `static/` folder:

```
static/
  crack-in-the-veil.html    ← place it here
```

Gatsby copies everything in `static/` verbatim to the public root. The page will be live at:
```
https://dennisjcarroll.com/crack-in-the-veil.html
```

Link to it from the Stories nav item or anywhere in the Gatsby site:
```jsx
// In any Gatsby page or component:
<a href="/crack-in-the-veil.html">Crack in the Veil →</a>
```

### Option B — Gatsby page (full integration)
To make it a proper Gatsby route at `/stories/crack-in-the-veil`:

1. **Extract the canvas crack logic** into `src/scripts/crackCanvas.js` — export `initCrackCanvas(canvasEl)` that runs the whole animation + click listener.

2. **Create the Gatsby page** at `src/pages/stories/crack-in-the-veil.js`:

```jsx
import React, { useEffect, useRef } from 'react'
import Layout from '../../components/layout/layout'
import Seo from '../../components/shared/seo'
import { initCrackCanvas } from '../../scripts/crackCanvas'

const CrackInTheVeilPage = ({ location }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (canvasRef.current) {
      const cleanup = initCrackCanvas(canvasRef.current)
      return cleanup
    }
  }, [])

  return (
    <Layout location={location}>
      {/* Hero */}
      <section style={{ position: 'relative', minHeight: '100vh' }}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(5,8,15,.45) 0%, rgba(5,8,15,.82) 70%, #05080f 100%)' }} />
        {/* hero content here */}
      </section>
      {/* rest of page sections */}
    </Layout>
  )
}

export const Head = ({ location }) => (
  <Seo title="Crack in the Veil" pathname={location.pathname} pageType="website"
    description="Enter the Crack in the Veil universe — a story of pain, silence, and survival." />
)

export default CrackInTheVeilPage
```

3. **Add to navigation** in `src/constants/index.js`:
```js
{ id: 'crack-in-the-veil', label: 'Crack in the Veil', path: '/stories/crack-in-the-veil' }
```

4. **Fonts** — Orbitron and Space Grotesk are already in the site. JetBrains Mono may need adding to the Google Fonts import in `gatsby-config.js` or `src/styles/global.css`.

### Option C — MDX template route
If future Crack in the Veil stories will be MDX files (matching the existing blog/stories pattern), use Option B for the hub page and the existing `src/templates/project-detail.js` template for individual story entries — just add a `crack-in-the-veil/` subdirectory under `src/stories/`.

---

## Theming notes
The landing page uses its own inline CSS (not Tailwind) but tokens are aligned with `colors_and_type.css`:
- `#05080f` = `--navy-950`
- `#00c9b1` = close to `--teal-500` (the codebase's `--primary-color` is `#00bcd4` — nearly identical)
- `#67e8f9` = `--electric-cyan`
- `#a78bfa` = `--electric-violet`
- Font stack: Orbitron (display) + Space Grotesk (body) + JetBrains Mono (terminal/code) — exact match to codebase spec

If converting to Tailwind, the closest config additions to `tailwind.config.js`:
```js
colors: {
  'citv-teal':   '#00c9b1',
  'citv-cyan':   '#67e8f9',
  'citv-purple': '#a78bfa',
  'citv-navy':   '#05080f',
}
```
