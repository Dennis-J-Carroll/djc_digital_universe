---
name: dennisjcarroll.com
description: A dark night-console portfolio where cyan signal and violet secondary frame ML experiments and fiction.
colors:
  ink-black: "#0a0e14"
  ink-raised: "#0f1419"
  panel-glass: "rgba(12, 18, 30, 0.92)"
  signal-cyan: "#00bcd4"
  signal-cyan-bright: "#00e5ff"
  ultraviolet: "#7c4dff"
  ultraviolet-light: "#b388ff"
  tailwind-primary: "#0FA0CE"
  tailwind-accent: "#8B5CF6"
  tailwind-secondary: "#1A1F2C"
  text-white: "#ffffff"
  text-muted: "#b8b8b8"
  text-dim: "#9ca3af"
  slate-accent: "#798996"
  cyan-rule: "rgba(0, 188, 212, 0.2)"
  cyan-border: "rgba(0, 188, 212, 0.35)"
typography:
  display:
    fontFamily: "Orbitron, 'Space Grotesk', sans-serif"
    fontSize: "4rem"
    fontWeight: 800
    letterSpacing: "2px"
  headline:
    fontFamily: "'Space Grotesk', sans-serif"
    fontSize: "clamp(2.25rem, 4vw, 3rem)"
    fontWeight: 700
  title:
    fontFamily: "Orbitron, 'Space Grotesk', sans-serif"
    fontSize: "1.6rem"
    fontWeight: 700
    letterSpacing: "0.5px"
  body:
    fontFamily: "ui-serif, Georgia, Cambria, 'Times New Roman', serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  ui:
    fontFamily: "'Space Grotesk', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "'Space Grotesk', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "1px"
  mono:
    fontFamily: "'Fira Code', monospace"
    fontSize: "0.9rem"
rounded:
  sm: "8px"
  md: "12px"
  lg: "20px"
  pill: "50px"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "3rem"
  section: "6rem"
components:
  button-primary:
    backgroundColor: "rgba(0, 188, 212, 0.18)"
    textColor: "{colors.text-white}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1.5rem"
  button-secondary:
    backgroundColor: "rgba(255, 255, 255, 0.06)"
    textColor: "{colors.signal-cyan-bright}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1.5rem"
  button-ghost:
    backgroundColor: "rgba(255, 255, 255, 0.05)"
    textColor: "{colors.text-white}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1.5rem"
  section-badge:
    backgroundColor: "{colors.signal-cyan}"
    textColor: "{colors.text-white}"
    rounded: "{rounded.pill}"
    padding: "0.5rem 1rem"
  feature-card:
    backgroundColor: "rgba(15, 20, 30, 0.9)"
    textColor: "{colors.text-white}"
    rounded: "{rounded.lg}"
    padding: "2.5rem"
  form-input:
    backgroundColor: "rgba(15, 20, 30, 0.8)"
    textColor: "{colors.text-white}"
    rounded: "{rounded.md}"
    padding: "1rem"
---

# Design System: dennisjcarroll.com

## Overview

**Creative North Star: "The Night Instrument Panel"**

A dark console where cyan is the live signal and violet is the secondary channel. The site holds ML experiments, data tools, and fiction under one skin: a working lab readout that happens to host stories. Dark is the only theme; the Light, Tokyo Afternoon, and 80s Retro variants were removed (see THEME.md) and their CSS is dead code.

Density is moderate. Sections are full-bleed with an inner `max-w-6xl` column, generous vertical rhythm (`py-24`), centered section heads (badge, gradient headline, muted lede), then a card grid. The current implementation leans heavily on neon glow, glassmorphism blur, animated gradient text, and a custom cursor with HUD corners. These are the present signature and also the main source of drift: they are applied almost everywhere, so none of them signals anything.

**Key Characteristics:**
- Single dark theme on near-black navy (#0a0e14), flat with no per-page gradients.
- Cyan (#00bcd4) as the signal color; violet (#7c4dff) as its pair, mostly in gradients.
- Four type roles: Orbitron display, Space Grotesk UI, Georgia-class serif body, Fira Code mono.
- Pill buttons and 20px glass cards with cyan hairline borders.
- No emoji anywhere; SVG icons or geometric glyphs only (THEME.md).

## Colors

Cool near-black ground, one cyan signal, one violet partner, white text.

### Primary
- **Signal Cyan** (#00bcd4): links, borders, glows, focus rings, primary CTA tint. Tailwind's `primary` (#0FA0CE) is a near-duplicate used in utility classes.
- **Bright Signal Cyan** (#00e5ff): the top of the hero name gradient and secondary button text.

### Secondary
- **Ultraviolet** (#7c4dff): the second stop in every gradient (buttons, badges, gradient text, card glow). Light variant #b388ff for accent letters. Tailwind's `accent` (#8B5CF6) is a near-duplicate.

### Neutral
- **Ink Black** (#0a0e14): page and site-wrapper background.
- **Ink Raised** (#0f1419): secondary surface.
- **Panel Glass** (rgba(12, 18, 30, 0.92)): card background; form fields use rgba(15, 20, 30, 0.8).
- **White** (#ffffff): primary text. **Muted** (#b8b8b8) for card body; Tailwind `text-gray-400` (#9ca3af) for section ledes.
- **Slate** (#798996): accent-color token, rarely used.
- **Cyan Rule** (rgba(0, 188, 212, 0.2) / 0.35): the border color for dividers and cards.

### Named Rules
**The One Signal Rule.** Cyan means live or interactive. Violet only ever pairs with cyan in a gradient; it never stands alone as a fill.
**The Single Ground Rule.** One flat dark background site-wide. No per-section gradient seams.

## Typography

**Display Font:** Orbitron (with Space Grotesk, sans-serif fallback)
**Body Font:** ui-serif / Georgia (system serif, no webfont)
**UI Font:** Space Grotesk (300 to 700)
**Mono Font:** Fira Code (JetBrains Mono in the research paper template)

**Character:** Orbitron is the machine voice for the name and card titles; Space Grotesk carries UI and cards; the serif body is the inherited default that quietly sets the tone for long prose. The split is real in code, though the serif often gets overridden by Tailwind sans on pages.

### Hierarchy
- **Display** (800, 4rem, Orbitron, 2px tracking): hero name, letter-by-letter reveal.
- **Headline** (700, `text-4xl md:text-5xl`, Space Grotesk): section titles, rendered with `.gradient-text`.
- **Title** (700, 1.6rem, Orbitron): feature card titles.
- **Body** (400, 1rem, line-height 1.6 to 1.7): section ledes at `text-lg`, max ~`max-w-2xl`.
- **Label** (600, 0.75rem, 1px tracking, uppercase): section badges and eyebrow text (`text-sm uppercase tracking-widest text-teal-400`).
- **Mono** (Fira Code): code and `pre` blocks.

### Named Rules
**The Machine Voice Rule.** Orbitron is for the name and card titles only. Never for paragraphs.

## Layout

Full-bleed sections, each constraining content to `max-w-6xl mx-auto` with `px-4 md:px-8 lg:px-16` and `py-24`. `main` caps at 1200px except the homepage (`home-full-bleed`). Feature grids go 1 column to `md:grid-cols-3` with `gap-8`. Section heads are centered with `mb-16`. Forms use `auto-fit, minmax(250px, 1fr)`. One breakpoint rule at 768px in global CSS; otherwise Tailwind's `md`/`lg`.

## Elevation & Depth

Hybrid of tonal layering and glow. Cards sit as translucent glass (backdrop blur 10 to 14px) over the flat ground, with a cyan hairline and a soft black drop shadow. Emphasis is expressed as cyan glow rather than lift. Currently glow and animated gradients appear at rest, not only on state. Flagged as drift: they should answer to hover/focus.

### Shadow Vocabulary
- **Card rest** (`box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2)`): feature and contact cards.
- **Button hover** (`0 6px 20px rgba(0, 0, 0, 0.3), var(--neon-glow)`): lift plus cyan glow.
- **Neon glow** (`0 0 10px #00bcd4, 0 0 20px rgba(0, 128, 128, 0.5)`): `--neon-glow`, used on hover and on the cursor.
- **Primary glass CTA** (`0 4px 24px rgba(0, 188, 212, 0.18), inset 0 1px 0 rgba(255,255,255,0.12)`).

### Named Rules
**The Glow Answers Rule (aspirational, not yet true).** Glow appears only in response to hover, focus, or active state. At rest, surfaces are flat.

## Shapes

Soft and rounded: pill (50px) for buttons and badges, 20px for feature and contact cards, 12px for inputs, 8px for code blocks. Hairline 1px cyan borders at low alpha define edges instead of fills. HUD corner brackets (2px cyan, 100px, partial border) and a ring cursor (20px circle, difference blend) are the decorative geometry.

## Components

### Buttons
- **Shape:** full pill (50px), uppercase, 0.9rem, 1px tracking, 600 weight, `0.75rem 1.5rem`.
- **Primary (`btn-primary-enhanced`):** cyan-tinted glass (rgba(0,188,212,0.18)), 1px cyan border at 0.55, white text, blur 14px.
- **Secondary:** white 6% glass, cyan border at 0.45, bright cyan text (rgba(0,220,240,0.95)).
- **Ghost:** white 5% glass, white 18% border, white 82% text.
- **Hover:** `translateY(-2px)`, stronger fill and border, deeper glow. Base `.btn` is a cyan-to-violet gradient; hero variants override it with `!important`.

### Cards / Containers
- **Feature card:** 20px radius, 2.5rem padding, dark glass gradient (rgba(15,20,30,0.9) to rgba(20,25,35,0.85)), 1px cyan hairline at 0.12, blur 12px, animated faint gradient overlay; on hover the border glows and the icon scales 1.05; title turns gradient.
- **Link:** cyan "read more" with a gradient underline that grows to 100% width.

### Inputs / Fields
- **Style:** 12px radius, 1px cyan hairline at 0.2, dark glass fill, white text, 1rem padding.
- **Focus:** border to solid cyan plus `0 0 0 2px rgba(0,188,212,0.2)` ring. Global rule also forces dark input fill with `!important`.

### Navigation
Space Grotesk 600, 0.5px tracking, pill-shaped items with a sliding indicator (rgba(0,243,255,0.15) with cyan border and glow). Wraps and centers below 768px.

### Section Badge
Pill, cyan-to-violet gradient fill, 0.75rem uppercase 1px tracking, white text. Sits above each section headline.

## Do's and Don'ts

### Do:
- **Do** keep a single dark ground (#0a0e14) and carry hierarchy with white, muted gray, and cyan hairlines.
- **Do** use cyan for interactive or live state and pair violet only inside gradients.
- **Do** use pill radius for actions and 20px for cards; keep hairline borders at 0.12 to 0.35 cyan alpha.
- **Do** use inline SVG or geometric glyphs for icons (THEME.md).
- **Do** keep Orbitron to the name and card titles, Space Grotesk for UI, Fira Code for code.

### Don't:
- **Don't** add emoji anywhere in site pages or `static/apps/` HTML.
- **Don't** re-introduce theme switching without a full token pass; hardcoded Tailwind dark classes ignore theme classes (THEME.md).
- **Don't** add more gradient text, resting glow, or glass blur; they are already overused and should narrow, not spread.
- **Don't** rely on `!important` to win button variants; fold them into the `.btn` token set.
- **Don't** treat Tailwind `primary`/`accent` (#0FA0CE, #8B5CF6) as separate from the CSS cyan/violet; they should converge.
