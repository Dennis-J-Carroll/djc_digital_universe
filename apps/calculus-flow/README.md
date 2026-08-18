# Calculus Flow

This directory is the canonical editable source for Calculus Flow, a standalone React and Vite application published with the Gatsby portfolio.

## Locations

- Canonical source: `apps/calculus-flow/`
- Generated build output: `apps/calculus-flow/dist/`
- Tracked deployed artifact: `static/apps/calc-flow/`
- Public URL: `https://dennisjcarroll.com/apps/calc-flow/`

The public route and deployed directory intentionally retain the shorter `calc-flow` name.

## Fresh-clone setup

This nested package is not a root npm workspace, so the repository-root install does not install its dependencies. After cloning, and whenever `apps/calculus-flow/package-lock.json` changes, run:

```bash
npm ci --prefix apps/calculus-flow
```

## Root commands

Run these from the repository root:

```bash
npm run calc-flow:develop
npm run calc-flow:test
npm run calc-flow:build
npm run calc-flow:deploy
```

`calc-flow:deploy` builds this app, validates that `dist/` contains an `index.html`, and synchronizes the result to the exact `static/apps/calc-flow/` target.

## Generated-file policy

Do not edit `apps/calculus-flow/dist/` or `static/apps/calc-flow/` by hand. The local `dist/` directory is ignored build output. The deployed artifact is tracked so Gatsby can publish it; regenerate it only with `npm run calc-flow:deploy` and commit the resulting artifact changes with the related source changes.

Legacy generated files under `Add to site/Math+/Kimi_Agent_Calculus Flow App/app/` are retained temporarily for recovery and comparison, but they are not canonical source.
