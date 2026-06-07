# AST Python Protocol — CLI engine

Source of truth for the analysis engine behind the interactive web app at
`/apps/ast-v2.html`. Pure-stdlib Python AST analyzer with a Rich-based TUI.

## Features
- **Cognitive complexity** (SonarSource-style nesting penalty) per function
- **Security scanner** — SEC-001…010 (eval/exec, shell=True, unsafe deserialization,
  weak crypto, insecure randomness, hardcoded secrets, SQL injection, debug mode, temp-file race)
- **Dead code** — unreachable statements + unused module-level functions
- **Modernization** — f-strings, builtin generics, match/case, walrus, pathlib, Python 2-isms
- **Coupling/cohesion** — LCOM-4 per class, fan-in/fan-out per function
- **Test-quality estimation** — minimum tests = max(branches,1) + loops + exception paths
- **Version detection** — minimum required Python version with per-feature line numbers
- **Concept cards** — offline teaching cards for detected Python concepts

## Run
```bash
python ast_v2.py <file.py>     # interactive TUI
python -m pytest test_ast_v2.py   # 86 tests
```

Requires `rich`. Tests require `pytest`.
