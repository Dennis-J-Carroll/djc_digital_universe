# Calculus Flow — App Plan

## Overview
Build "Calculus Flow" — an interactive calculus visualization webapp mirroring the design language of Algebraic Flow (dark navy theme, particle network background, glowing cyan accents, mode tabs, interactive board) but focused on calculus: Riemann sums, area under curves, integrals, and derivative/integral relationships.

## Key Features
- **Interactive curve visualization** with adjustable Riemann sum rectangles
- **Mode tabs**: Area Mode (Riemann sums), Derivative Mode, Integral Mode, FTC Explorer
- **Curve presets**: Polynomial, Exponential, Trigonometric, Velocity-Time
- **Adjustable parameters**: Number of rectangles, left/right/midpoint sums
- **Live area calculation** with animated counter
- **Educational section**: Limit definition of integral, Fundamental Theorem of Calculus
- **Proof/Explanation log** similar to Algebraic Flow's proof log

## Stages

### Stage 1 — Design PRD
- Write design.md with full visual design system, animations, interactions
- Match Algebraic Flow: dark navy bg (#0a0e27), cyan glow accents, particle network, glassmorphism

### Stage 2 — Asset Generation
- Generate any needed images (particle effects are code-generated)

### Stage 3 — Web Development
- Build full React app with all interactive features
- Canvas-based curve rendering + Riemann sum visualization
- Framer Motion animations
- All mode tabs, presets, controls, educational sections

### Stage 4 — Build & Deploy
- Build and deploy the static site
