# Calculus Flow Repository Reorganization

## Goal

Make Calculus Flow source easy to find and safely reproducible without changing website routes, appearance, content, or deployed behavior.

## Global constraints

- Preserve public route `/apps/calc-flow/`.
- Preserve deployed directory `static/apps/calc-flow/`.
- Preserve current uncommitted Calculus Flow source and deployed assets before moving anything.
- Move canonical editable project to `apps/calculus-flow/`.
- Do not change homepage, About page, theme, copy, information architecture, Gatsby plugins, analytics, or motion.
- Do not delete or reorganize unrelated staging directories.
- Do not remove legacy `dist-new`, unused UI components, dependencies, or inspection plugin in this batch.
- Do not commit unrelated dirty or untracked files.
- Use `apply_patch` for repository file edits.

## Task 1: Protective Calculus Flow commit

Commit only current Calculus Flow work from:

- `Add to site/Math+/Kimi_Agent_Calculus Flow App/app/`
- `static/apps/calc-flow/`

Include tracked edits, new derivative source/tests, new generated deploy assets, and deleted old hashed deploy assets. Exclude all unrelated changes.

Verification:

- `npm test` inside current Calculus Flow source.
- `diff -qr Add to site/Math+/Kimi_Agent_Calculus Flow App/app/dist static/apps/calc-flow`.
- `git show --stat --oneline HEAD` contains only approved Calculus Flow paths.

Commit message:

`feat(calc-flow): preserve derivative lab improvements`

## Task 2: Canonical source move and workflow

Move editable project files from staging path to `apps/calculus-flow/`. Move source, tests, package manifests, lockfile, configs, and app documentation. Leave generated `dist`, tracked `dist-new`, local `node_modules`, screenshots, and staging plans untouched for later cleanup.

Add:

- Root package scripts for Calculus Flow develop, test, build, and deploy.
- Deterministic deployment script that builds canonical app and synchronizes build output into `static/apps/calc-flow/`.
- `apps/calculus-flow/README.md` documenting canonical source, deployed artifact, public URL, commands, and generated-file policy.
- Pointer README at legacy staging app path identifying new canonical source and untouched legacy artifacts.
- Corrections to stale Calculus Flow documentation paths where needed.

Deployment synchronization must reject missing build output and operate only on exact `static/apps/calc-flow/` target.

Verification:

- `npm run calc-flow:test`.
- `npm run calc-flow:build`.
- Compare fresh `apps/calculus-flow/dist/` against `static/apps/calc-flow/` before deployment.
- `npm run calc-flow:deploy`.
- `diff -qr apps/calculus-flow/dist static/apps/calc-flow`.
- `npm run build` at repository root.
- `npm test -- --runInBand` at repository root; report known unrelated About test failures separately.
- Confirm `src/pages/apps.js` still links to `/apps/calc-flow/`.
- Confirm no unrelated files entered commit.

Commit message:

`chore(calc-flow): establish canonical app workflow`

## Review requirements

- Per-task spec and quality review.
- Final branch review covering both commits.
- Fresh verification before completion claim.
