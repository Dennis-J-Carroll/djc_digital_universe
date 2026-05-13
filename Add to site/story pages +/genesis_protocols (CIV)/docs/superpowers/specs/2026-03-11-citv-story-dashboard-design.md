# Crack in the Veil — Story Dashboard Design

**Date:** 2026-03-11
**Status:** Approved
**Target:** dennisjcarroll.com/stories/

## Overview

A single self-contained `index.html` file rendering a 9-tab classified-document terminal dashboard for the "Crack in the Veil" sci-fi universe. React + Recharts loaded via CDN. No build step. Drop into the site's `/stories/` directory.

## Architecture

- Single HTML file with inline `<script type="text/babel">` JSX
- CDN dependencies: React 18, ReactDOM 18, Babel standalone (JSX transform), Recharts
- All canonical data embedded inline (from MAIN SCHEMA OUTLINE in `DJC_CITV_outline_dashboardStory.md`)
- CRT scanline overlay effect via CSS + React tick state

## Visual Design

- Background: `#05080f`
- Teal accent: `#00c9b1`
- Red critical: `#ff2d4b`
- Amber warning: `#f5a623`
- Cyan: `#67e8f9`
- Purple: `#a78bfa`
- Green: `#22c55e`
- Ghost/dim: `#2e3f52` / `#415464`
- Monospace everything (`Courier New`)
- Sticky header + tab bar
- CRT scanline sweep + glitch character flicker

## 9 Tabs

### Tab 0: SUFFER INDEX
- Stat cards: Training Epochs (847), Final Accuracy (94.7%), Test Subjects (2.3M), Globally Deployed (4.2B)
- Suffer Index trajectory: 54.2 → 8.7 → 1.2 with progress bar
- Recharts horizontal BarChart: species suffer comparison with human baseline reference line
- Neural network architecture schema (monospace text block)
- Hidden discovery callout (amber box)

### Tab 1: N8K7 PHASES
- 4 phase cards (Miracle/Warning/Fracture/Silence) with color-coded left borders
- Each card: 4 metrics (Suffer Index, Memory Loss %, Identity Fracture %, Reality Distortion %) with bars
- Classified/Catastrophic chips
- Phase 3 catastrophe note (red box)

### Tab 2: N8K7 BIO DATA
- Recharts LineChart: 7 biological metrics (pain, empathy, memory, identity, cortisol, repro, neurogenesis) over 2038-2048
- Color-coded legend
- Year-by-year annotation cards (2-column grid, alternating years)
- Fertility mechanism callout (red box)

### Tab 3: NEURAL CASCADE
- Recharts grouped BarChart: baseline (2037) vs post-N8K7 (2048) receptor activity by brain region
- Legend for baseline vs post-N8K7
- Cascade logic cards (01-05): Nociceptor Suppression → Emotional Collapse → Memory Loss → Identity Fragmentation → Reproductive Shutdown
- Masochist emergence note (purple box)

### Tab 4: PARAM AUDIT
- Parameter comparison table: 7 rows (PARAMETER, FILED, TRUE VALUE, DELTA, FLAG)
- Critical rows get red left border + CRITICAL chip
- stellar_age_penalty finding callout (red box)

### Tab 5: PROB CHAIN
- 3 ProbCard components:
  - Filed model: 99.98% (red, MANIPULATED)
  - Honest model: 59.97% (amber, TRUE BASELINE)
  - Honest + proximity: 3.24% (teal, FULL MODEL)
- Each with formula box + progress bar
- Independence assumption note

### Tab 6: EARTH PROX
- earth_proximity_factor formula definition (purple box)
- Planet scores table: 6 Kesslar planets + Earth row (green background)
- Columns: PLANET, DIST, BASE P, PROX FACTOR, ADJUSTED P, RESULT
- Smoking gun conclusion (red box with amber final statement)

### Tab 7: ISOVOX COMP
- Material specification grid (2x2): Structure, Binding, Regenerative, Energetic
- Voxium-C chemical formula display: C9H20Si6N4O7 with element cards (5-column grid)
- Recharts LineChart: frequency cascade waveform (f1, f2, f3, f-infinity)
- Material properties cards: Self-Repair, Voice Reactivity, Vacuum Compatibility, Possible Sentience

### Tab 8: FIELD LOG
- Cal McLaren's encrypted journal fragment (styled prose)
- NAI archive header
- Key highlights: "99.98", Ava's pause (amber), "where we came from" (red)
- Closing: "The math doesn't lie..." (amber)
- Ava access log footer with M. MIRRO requestor

## Data Sources

All values from canonical data in `DJC_CITV_outline_dashboardStory.md` MAIN SCHEMA OUTLINE:
- `planets[]` — 6 Kesslar planets with dist, rep, tp
- `params[]` — 7 parameters with filed/true/delta/critical
- `phases[]` — 4 N8K7 deployment phases
- `bioTimeline[]` — 11 years of biological cascade data (2038-2048)
- `receptorData[]` — 8 brain regions with baseline vs post values
- `speciesSuffer[]` — 7 species with suffer scores
- `freqData[]` — 60 data points for IsoVox frequency cascade
- Derived: `filed`, `honest`, `withProx` probability calculations
- `earth_proximity_factor(d) = e^(-d/400)`

## Shared UI Components

- `Bar` — progress bar with configurable color/height
- `Chip` — labeled badge with color
- `SectionLabel` — section header with arrow prefix
- `ProbCard` — probability display card with formula + bar

## Deliverable

One file: `crack-in-the-veil-stories/index.html`
