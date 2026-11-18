---
name: Edge AI Training Lab
description: A neural field guide for browser-based training experiments.
colors:
  red: "#ad3023"
  red-dark: "#842218"
  blue: "#165d9f"
  green: "#1e6841"
  green-wash: "#dce9d4"
  paper: "#f8f2e0"
  paper-deep: "#efe5cc"
  plate-glaze: "rgba(248, 242, 224, .66)"
  ink: "#211b14"
  muted: "#514735"
  rule: "#86765d"
typography:
  display:
    fontFamily: "'Zen Antique Soft', Georgia, serif"
    fontSize: "clamp(32px, 3vw, 47px)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-.02em"
  section:
    fontFamily: "'Zen Antique Soft', Georgia, serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.2
  title:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: ".1em"
  body:
    fontFamily: "Georgia, 'Times New Roman', serif"
    lineHeight: 1.45
  label:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "13px"
    fontWeight: 700
  action:
    fontFamily: "'Zen Antique Soft', Georgia, serif"
    fontSize: "23px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: ".07em"
rounded:
  square: "0px"
  control: "2px"
  circle: "50%"
spacing:
  compact: "12px"
  panel: "16px"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "#fffaf1"
    typography: "{typography.action}"
    rounded: "{rounded.square}"
    padding: "12px 18px"
    height: "72px"
  button-primary-hover:
    backgroundColor: "{colors.red-dark}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "7px"
    height: "39px"
  button-secondary-hover:
    backgroundColor: "{colors.paper-deep}"
  field-select:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "7px 11px"
    height: "39px"
  card-plate:
    backgroundColor: "{colors.plate-glaze}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
  status-idle:
    backgroundColor: "{colors.green-wash}"
    textColor: "{colors.green}"
    rounded: "{rounded.square}"
    padding: "3px 8px"
  nav-index:
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "7px 10px"
  progress-track:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.square}"
    height: "8px"
---

# Design System: Edge AI Training Lab

## Overview

**Creative North Star: "The Neural Field Guide"**

This document applies only to the standalone Edge AI Training Lab at `static/apps/edge-ai-sandbox.html`. It does not define the visual system for dennisjcarroll.com or the surrounding Gatsby site.

The lab presents an experiment as an illustrated technical folio. Warm uncoated paper, engraved rules, editorial serif type, and paired scientific plates make the network and data readable as related observations. Color has a bounded job: red identifies the main action and one data class, blue identifies the other class and focus, and green identifies active or successful state. This is the approved Neural Field Guide direction represented by `.impeccable/mocks/option-2.webp`; the implementation is the source for values and behavior.

**Key Characteristics:**

- A paper field with double rules and inset plate borders.
- A large network plate beside a data plate, with a narrower action column on wide screens.
- Typographic labels, figure numbers, and quiet captions around live graphics.
- Immediate, visible training state with reduced-motion support.

## Colors

The palette is warm and restrained so experiment signals remain distinct.

### Primary

- **Vermilion (`red`, #ad3023):** Train action, range accent, active network connections, and one plotted class.
- **Deep vermilion (`red-dark`, #842218):** Primary hover and numeric control emphasis.

### Secondary

- **Scientific blue (`blue`, #165d9f):** Other plotted class, comparison label, and keyboard focus outline.

### Tertiary

- **Training green (`green`, #1e6841):** Active neurons, progress, and status; **green wash** (`green-wash`, #dce9d4) backs selected and positive states.

### Neutral

- **Uncoated paper (`paper`, #f8f2e0):** Main canvas and controls; **deep paper** (`paper-deep`, #efe5cc) separates the site bar and hover surfaces.
- **Plate glaze (`plate-glaze`, rgba(248, 242, 224, .66)):** Lightly translucent plate and panel surface over the paper texture.
- **Engraving ink (`ink`, #211b14):** Primary text and diagram outlines; **muted ink** (`muted`, #514735) supports captions and secondary text.
- **Sepia rule (`rule`, #86765d):** Dividers, plate borders, axes, and control strokes.

**The Bounded Signal Rule.** Keep red, blue, and green attached to actions, data, and state. Let paper and ink carry the reading surface.

## Typography

**Display Font:** Zen Antique Soft (Georgia, serif fallback).
**Body Font:** Georgia (Times New Roman, serif fallback).
**Log Font:** System monospace stack in the training log.

**Character:** The display face gives the folio its printed title and action mark. Georgia carries compact explanations and scientific labels; numeric readouts use tabular figures.

### Hierarchy

- **Display** (400, `clamp(32px, 3vw, 47px)`, 1.08): Page title; reduced to `clamp(26px, 8vw, 38px)` on small screens.
- **Section** (400, 28px, 1.2): The study section heading.
- **Title** (700, 15px, 1.2, `.1em`, uppercase): Panel headings.
- **Body** (Georgia, 1.45): Explanations, captions, and controls; the study text is limited to 64ch.
- **Label** (700, 13px): Field labels and compact figure headings; uppercase plate labels carry additional tracking.
- **Action** (700, 23px, 1.1, `.07em`, uppercase): The Train button.

**The Figure Label Rule.** Use small uppercase labels and numbered captions to orient a graphic; preserve the plot and model as the main content.

## Layout

The folio has a 1680px maximum width. Its first spread uses two equal, flexible plates and a narrower action column (`minmax(265px, .55fr)`) with 12px gaps. Detailed controls and curves begin in a four-column lower spread. The default plates have a 555px minimum height so the diagrams dominate the first view.

At 1180px, the action column moves below the two plates and divides into three columns; lower controls become two columns. At 720px, the layout becomes one column. The dataset picker, Train button, and status appear before the stacked network and data plates, keeping the action reachable without burying the diagrams. The index remains horizontally scrollable. Panels use 16px internal padding, while plate framing uses 11px.

**The Paired Plate Rule.** On wide screens, keep topology and data at comparable visual weight; on narrow screens, stack them after the immediate experiment controls.

## Elevation & Depth

Depth comes from the repeated paper texture, tonal paper layers, sepia borders, and a double inset rule. Plates and panels use an inset shadow (`inset 0 0 0 5px var(--paper), inset 0 0 0 6px rgba(134,118,93,.7)`) to simulate a printed frame. There is no floating card shadow vocabulary.

**The Printed Frame Rule.** Separate regions with rules and paper tone; do not turn the folio into elevated dashboard cards.

## Shapes

Panels and plates are square-cornered. Select controls use a subtle 2px radius; neurons, plot dots, and the training indicator are circular. Fine 1px strokes define most boundaries, while the masthead uses a 3px double rule and the primary action uses a 4px double border.

## Components

### Buttons

- **Primary Train:** Full-width vermilion stamp, at least 72px high, with cream lettering, double border, and dark red hover. Hover lifts by 1px; disabled state fades and removes movement. Keyboard focus has a 3px blue outline offset by 3px.
- **Secondary actions:** Square paper buttons with a single sepia rule, 39px minimum height, deep-paper hover, and disabled opacity.

### Cards / Containers

- **Scientific plate:** Translucent paper, inset double frame, uppercase plate heading, and caption separated by a rule. Figures contain the live network or data canvas.
- **Folio panel:** The same frame treatment around dataset selection, status, settings, curves, and summary blocks.

### Inputs / Fields

- **Select:** Paper fill, sepia rule, 2px corners, and at least 39px height for single-row controls. The visible dataset list marks selection with green wash.
- **Range and toggle:** Native controls with vermilion accent. Visible numeric outputs use tabular figures.

### Navigation

The small uppercase shoulder index links to Data, Network, Training, and Results. Hover or keyboard focus adds a sepia border and deep-paper fill. On mobile, links stay in one horizontally scrollable row.

### Status and progress

The status badge has a green border and wash in the idle state. A compact definition list shows epoch, loss, and accuracy; an 8px progress track uses green fill. The training indicator pulses, except under reduced-motion preference.

**The Truthful State Rule.** Keep idle, training, stopping, and completed states tied to actual experiment state; never present placeholder metrics as measured results.

## Do's and Don'ts

### Do:

- **Do** preserve the paired figure hierarchy and label each representation clearly.
- **Do** use the observed paper, ink, and rule tokens for new lab panels.
- **Do** keep keyboard focus visible in scientific blue and honor reduced-motion preference.
- **Do** show unavailable results as unavailable until training produces them.

### Don't:

- **Don't** extend this document's tokens to the Gatsby site without a separate design decision.
- **Don't** replace the folio with equal-weight neon dashboard cards; the selected direction rejects that look.
- **Don't** use color alone to distinguish classes, training state, or comparison models.
