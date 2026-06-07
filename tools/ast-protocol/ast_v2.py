#!/usr/bin/env python3
"""
AST Python Protocol v2.0 - Enhanced Interactive TUI for Code Analysis
Adds: Cognitive Complexity, Security Scanner, Dead Code Detection,
      Deprecated Module Detection, Modernization Hints
"""

import ast
import sys
import math
import io
import tokenize
from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.syntax import Syntax
from rich.prompt import Prompt
from rich import box
from rich.tree import Tree
from rich.columns import Columns
from rich.theme import Theme

tui_theme = Theme({
    "banner": "bold #f8fafc on #0d1b2a",
    "menu.title": "bold #cbd5e1 on #0f172a",
    "menu.border": "#94a3b8",
    "panel.border": "#94a3b8",
    "border": "#94a3b8",
    "table.header": "bold #f8fafc on #0d1b2a",
    "table.border": "#64748b",
    "text.primary": "#f1f5f9",
    "text.secondary": "#cbd5e1",
    "text.muted": "#64748b",
    "highlight": "bold #f8fafc",
    "menu.num": "bold #cbd5e1",
    "warning": "bold #f8fafc on #334155",
    "success": "bold #f8fafc on #1e3a8a",
    "error": "bold #ffffff on #7f1d1d",
    "accent": "#94a3b8",
    "sec.critical": "bold #ffffff on #7f1d1d",
    "sec.high": "bold #f8fafc on #92400e",
    "sec.medium": "bold #f8fafc on #374151",
    "sec.low": "#cbd5e1",
})

console = Console(theme=tui_theme)

# ---------------------------------------------------------------------------
# Deprecated modules (PEP 594 + Python 3.12/3.13 removals)
# ---------------------------------------------------------------------------

DEPRECATED_MODULES: Dict[str, Dict] = {
    "cgi": {
        "removed_in": "3.13",
        "replacement": "Use email.message.EmailMessage or multipart form parsers",
    },
    "smtpd": {
        "removed_in": "3.12",
        "replacement": "Use aiosmtpd (third-party async mail server)",
    },
    "crypt": {
        "removed_in": "3.13",
        "replacement": "Use hashlib for hashing, passlib for password hashing",
    },
    "nntplib": {
        "removed_in": "3.12",
        "replacement": "Use third-party pynntp",
    },
    "optparse": {
        "deprecated_in": "3.2",
        "replacement": "Use argparse instead",
    },
    "imp": {
        "removed_in": "3.12",
        "replacement": "Use importlib",
    },
    "distutils": {
        "removed_in": "3.12",
        "replacement": "Use setuptools",
    },
    "asyncore": {
        "removed_in": "3.12",
        "replacement": "Use asyncio",
    },
    "asynchat": {
        "removed_in": "3.12",
        "replacement": "Use asyncio",
    },
    "pipes": {
        "removed_in": "3.13",
        "replacement": "Use subprocess",
    },
    "telnetlib": {
        "removed_in": "3.13",
        "replacement": "Use third-party telnetlib3 or asyncio",
    },
    "uu": {
        "removed_in": "3.13",
        "replacement": "No direct replacement; use base64 encoding",
    },
}

# ---------------------------------------------------------------------------
# Security finding dataclass
# ---------------------------------------------------------------------------

@dataclass
class VulnerabilityFinding:
    rule_id: str
    severity: str          # CRITICAL | HIGH | MEDIUM | LOW
    category: str
    message: str
    lineno: int
    col_offset: int
    source_snippet: str
    confidence: str        # HIGH | MEDIUM | LOW
    remediation: str
    cwe_id: str = ""
    is_educational: bool = True


# ---------------------------------------------------------------------------
# Cognitive Complexity Visitor (Section 4.2)
# ---------------------------------------------------------------------------

class CognitiveComplexityVisitor:
    """Compute SonarSource cognitive complexity for a function node."""

    def __init__(self):
        self.complexity = 0

    @classmethod
    def compute_for_function(cls, node: ast.FunctionDef) -> int:
        v = cls()
        v._process_body(node.body, depth=0)
        return v.complexity

    def _process_body(self, stmts, depth: int):
        for stmt in stmts:
            self._process_stmt(stmt, depth)

    def _process_stmt(self, node, depth: int):
        if isinstance(node, ast.If):
            self.complexity += 1 + depth
            self._count_boolops(node.test)
            self._process_body(node.body, depth + 1)
            self._process_orelse(node.orelse, depth)

        elif isinstance(node, ast.For):
            self.complexity += 1 + depth
            self._process_body(node.body, depth + 1)
            if node.orelse:
                self._process_body(node.orelse, depth)

        elif isinstance(node, ast.While):
            self.complexity += 1 + depth
            self._count_boolops(node.test)
            self._process_body(node.body, depth + 1)
            if node.orelse:
                self._process_body(node.orelse, depth)

        elif isinstance(node, ast.Try):
            self._process_body(node.body, depth)
            for handler in node.handlers:
                self.complexity += 1 + depth
                self._process_body(handler.body, depth + 1)
            if node.orelse:
                self._process_body(node.orelse, depth)
            finalbody = getattr(node, 'finalbody', []) or []
            if finalbody:
                self._process_body(finalbody, depth)

        elif isinstance(node, ast.With):
            self.complexity += 1 + depth
            self._process_body(node.body, depth + 1)

        elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            pass  # nested function: don't recurse into its body

        else:
            # Walk for BoolOps, comprehensions, ternary in plain statements
            self._count_boolops(node)
            for child in ast.walk(node):
                if isinstance(child, (ast.ListComp, ast.DictComp, ast.SetComp, ast.GeneratorExp)):
                    self.complexity += 1 + depth
                if isinstance(child, ast.IfExp):
                    self.complexity += 1 + depth

    def _process_orelse(self, orelse, depth: int):
        if not orelse:
            return
        if len(orelse) == 1 and isinstance(orelse[0], ast.If):
            # elif: adds +1 base only (no nesting penalty for the elif itself)
            elif_node = orelse[0]
            self.complexity += 1
            self._count_boolops(elif_node.test)
            self._process_body(elif_node.body, depth + 1)
            self._process_orelse(elif_node.orelse, depth)
        else:
            # else: no increment, body at depth+1
            self._process_body(orelse, depth + 1)

    def _count_boolops(self, node):
        for child in ast.walk(node):
            if isinstance(child, ast.BoolOp):
                self.complexity += 1

    @staticmethod
    def get_rating(cc: int) -> str:
        if cc <= 5:
            return "Very Low"
        if cc <= 10:
            return "Low"
        if cc <= 20:
            return "Medium"
        if cc <= 30:
            return "High"
        return "Very High"


# ---------------------------------------------------------------------------
# Security Visitor (Section 5.2)
# ---------------------------------------------------------------------------

class SecurityVisitor(ast.NodeVisitor):
    """Detect security vulnerabilities via AST pattern matching."""

    _SEVERITY_WEIGHT = {"CRITICAL": 15, "HIGH": 8, "MEDIUM": 3, "LOW": 1}

    def __init__(self, source_code: str):
        self.source_code = source_code
        self.source_lines = source_code.splitlines()
        self.findings: List[VulnerabilityFinding] = []

    def _snippet(self, node: ast.AST) -> str:
        start = max(0, node.lineno - 1)
        end = min(len(self.source_lines), getattr(node, 'end_lineno', node.lineno))
        return '\n'.join(self.source_lines[start:end])[:120]

    def _add(self, rule_id: str, severity: str, category: str, cwe: str,
             message: str, node: ast.AST, remediation: str,
             confidence: str = "HIGH"):
        self.findings.append(VulnerabilityFinding(
            rule_id=rule_id,
            severity=severity,
            category=category,
            message=message,
            lineno=node.lineno,
            col_offset=node.col_offset,
            source_snippet=self._snippet(node),
            confidence=confidence,
            remediation=remediation,
            cwe_id=cwe,
        ))

    def visit_Call(self, node: ast.Call):
        func = node.func

        # SEC-001: eval/exec/compile with non-literal
        if isinstance(func, ast.Name) and func.id in {"eval", "exec", "compile"}:
            if node.args and not isinstance(node.args[0], ast.Constant):
                self._add(
                    "SEC-001", "CRITICAL", "Code Injection", "CWE-94",
                    f"Dynamic {func.id}() with non-literal argument — code injection risk.",
                    node,
                    f"Avoid {func.id}(). Use ast.literal_eval() for safe literal parsing.",
                )

        # SEC-002: shell=True in subprocess
        if isinstance(func, ast.Attribute):
            shell_true = any(
                isinstance(kw.arg, str) and kw.arg == "shell"
                and isinstance(kw.value, ast.Constant) and kw.value.value is True
                for kw in node.keywords
            )
            if shell_true:
                self._add(
                    "SEC-002", "CRITICAL", "Command Injection", "CWE-78",
                    "shell=True in subprocess call enables shell injection.",
                    node,
                    "Pass a list of arguments instead of a shell string. Remove shell=True.",
                )

            # SEC-003: unsafe deserialization
            obj_name = getattr(func.value, 'id', '') if isinstance(func.value, ast.Name) else ''
            if (obj_name == "pickle" and func.attr == "loads") or \
               (obj_name == "marshal" and func.attr == "load") or \
               (obj_name == "yaml" and func.attr in {"unsafe_load", "load"}):
                self._add(
                    "SEC-003", "HIGH", "Insecure Deserialization", "CWE-502",
                    f"Unsafe deserialization via {obj_name}.{func.attr}() — arbitrary code execution risk.",
                    node,
                    "Use safe alternatives: json, yaml.safe_load(), or define a custom decoder.",
                )

            # SEC-004: weak cryptographic hash
            if obj_name == "hashlib" and func.attr in {"md5", "sha1"}:
                self._add(
                    "SEC-004", "HIGH", "Weak Cryptography", "CWE-328",
                    f"hashlib.{func.attr}() is cryptographically weak for security use.",
                    node,
                    "Use hashlib.sha256() or hashlib.sha3_256() for security-sensitive hashing.",
                )

            # SEC-010: insecure temp file (race condition)
            if func.attr == "mktemp":
                self._add(
                    "SEC-010", "MEDIUM", "Insecure Temp File", "CWE-377",
                    "tempfile.mktemp() is vulnerable to a time-of-check/time-of-use race.",
                    node,
                    "Use tempfile.mkstemp() or NamedTemporaryFile() which create the file atomically.",
                )

            # SEC-009: Flask/Django debug mode enabled
            if func.attr == "run":
                debug_true = any(
                    isinstance(kw.arg, str) and kw.arg == "debug"
                    and isinstance(kw.value, ast.Constant) and kw.value.value is True
                    for kw in node.keywords
                )
                if debug_true:
                    self._add(
                        "SEC-009", "HIGH", "Debug Mode Enabled", "CWE-489",
                        "Debug mode enabled in production — exposes stack traces and interactive debugger.",
                        node,
                        "Set debug=False in production. Use environment variables to control debug mode.",
                    )

        self.generic_visit(node)

    _SQL_NAMES = {"query", "sql", "statement", "cmd", "command", "q"}
    _SECRET_NAMES = {"password", "passwd", "pwd", "secret", "api_key", "apikey",
                     "token", "access_key", "secret_key", "private_key", "auth"}
    _RANDOM_SEC_NAMES = {"token", "password", "passwd", "pwd", "secret", "key",
                         "salt", "nonce", "otp", "session"}

    @staticmethod
    def _name_matches(name: str, keywords: set) -> bool:
        return any(kw in name.lower() for kw in keywords)

    def visit_Assign(self, node: ast.Assign):
        for target in node.targets:
            if not isinstance(target, ast.Name):
                continue
            tname = target.id

            # SEC-007: SQL injection via f-string in sql/query variables
            if self._name_matches(tname, self._SQL_NAMES) and isinstance(node.value, ast.JoinedStr):
                if any(isinstance(v, ast.FormattedValue) for v in node.value.values):
                    self._add(
                        "SEC-007", "CRITICAL", "SQL Injection", "CWE-89",
                        f"Variable '{tname}' constructed via f-string — SQL injection risk.",
                        node,
                        "Use parameterized queries: cursor.execute(sql, (param,)) instead of string formatting.",
                    )

            # SEC-006: hardcoded secret (literal string in a secret-named variable)
            if (self._name_matches(tname, self._SECRET_NAMES)
                    and isinstance(node.value, ast.Constant)
                    and isinstance(node.value.value, str)
                    and len(node.value.value) >= 6):
                self._add(
                    "SEC-006", "CRITICAL", "Hard-coded Secret", "CWE-798",
                    f"Hard-coded secret assigned to '{tname}'.",
                    node,
                    "Load secrets from environment variables or a secrets manager, never source code.",
                )

            # SEC-005: insecure random used for a security value
            if (self._name_matches(tname, self._RANDOM_SEC_NAMES)
                    and isinstance(node.value, ast.Call)):
                vfunc = node.value.func
                rand_obj = (isinstance(vfunc, ast.Attribute)
                            and isinstance(vfunc.value, ast.Name)
                            and vfunc.value.id == "random")
                if rand_obj:
                    self._add(
                        "SEC-005", "MEDIUM", "Insecure Randomness", "CWE-338",
                        f"random.{vfunc.attr}() used for security value '{tname}' — predictable.",
                        node,
                        "Use the secrets module (secrets.token_hex, secrets.randbelow) for security-sensitive values.",
                    )
        self.generic_visit(node)

    @classmethod
    def calculate_security_score(cls, findings: List[VulnerabilityFinding]) -> int:
        base = 100
        for f in findings:
            multiplier = 1.0 if f.confidence == "HIGH" else 0.6
            base -= int(cls._SEVERITY_WEIGHT.get(f.severity, 0) * multiplier)
        return max(0, base)


# ---------------------------------------------------------------------------
# Dead Code Detector (Section 4.3)
# ---------------------------------------------------------------------------

class DeadCodeDetector:
    """Detect unreachable code and unused functions."""

    _EXEMPT_PREFIXES = ("__",)
    _EXEMPT_NAMES = {"__init__", "__str__", "__repr__", "__main__"}

    def __init__(self):
        self.findings: List[Dict] = []

    def analyze(self, tree: ast.AST, visitor) -> None:
        # Collect ALL called function names from entire tree
        called_funcs: set = set()
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name):
                    called_funcs.add(node.func.id)
                elif isinstance(node.func, ast.Attribute):
                    called_funcs.add(node.func.attr)

        # Check unreachable statements inside each function
        for func in visitor.functions:
            self._check_unreachable_in_stmts(func['node'].body)

        # Check for unused module-level functions
        for func in visitor.functions:
            if func['class'] is not None:
                continue  # skip methods
            if self._is_exempt(func['name']):
                continue
            if func['name'] not in called_funcs:
                self.findings.append({
                    'type': 'unused_function',
                    'name': func['name'],
                    'line': func['line'],
                    'message': f"Function '{func['name']}' is defined but never called.",
                })

    def _check_unreachable_in_stmts(self, stmts: list) -> None:
        for i, stmt in enumerate(stmts):
            if isinstance(stmt, (ast.Return, ast.Raise, ast.Break, ast.Continue)):
                for dead_stmt in stmts[i + 1:]:
                    self.findings.append({
                        'type': 'unreachable',
                        'line': dead_stmt.lineno,
                        'name': None,
                        'message': f"Unreachable code at line {dead_stmt.lineno} (after unconditional {type(stmt).__name__}).",
                    })
                break  # don't recurse past this point in the same block

    def _is_exempt(self, name: str) -> bool:
        if name in self._EXEMPT_NAMES:
            return True
        if name.startswith('__') and name.endswith('__'):
            return True
        if name.startswith('test_'):
            return True
        return False


# ---------------------------------------------------------------------------
# Modernization Checker (Section 6.3)
# ---------------------------------------------------------------------------

_TYPING_BUILTIN_MAP = {
    'List': 'list', 'Dict': 'dict', 'Set': 'set', 'Tuple': 'tuple',
    'FrozenSet': 'frozenset', 'Type': 'type',
}


class ModernizationChecker:
    """Detect outdated Python patterns and suggest modern equivalents."""

    def __init__(self, source_code: str):
        self.source_code = source_code
        self.hints: List[Dict] = []

    def check(self) -> List[Dict]:
        try:
            tree = ast.parse(self.source_code)
        except SyntaxError:
            return self.hints
        self._check_format_strings(tree)
        self._check_typing_imports(tree)
        self._check_elif_chains(tree)
        self._check_py2isms(tree)
        self._check_ospath(tree)
        self._check_walrus_opportunity(tree)
        return self.hints

    def _check_py2isms(self, tree: ast.AST) -> None:
        for node in ast.walk(tree):
            # dict.has_key('x') → 'x' in dict
            if (isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute)
                    and node.func.attr == 'has_key'):
                self.hints.append({
                    'type': 'py2_has_key',
                    'line': node.lineno,
                    'message': "Python 2 `.has_key()` removed in Python 3 — use the `in` operator.",
                    'example': "'key' in d  instead of  d.has_key('key')",
                })
            # xrange() → range()
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == 'xrange':
                self.hints.append({
                    'type': 'py2_xrange',
                    'line': node.lineno,
                    'message': "Python 2 `xrange()` removed in Python 3 — use `range()`.",
                    'example': "range(n)  instead of  xrange(n)",
                })

    def _check_ospath(self, tree: ast.AST) -> None:
        for node in ast.walk(tree):
            if (isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute)
                    and node.func.attr == 'join'
                    and isinstance(node.func.value, ast.Attribute)
                    and node.func.value.attr == 'path'
                    and isinstance(node.func.value.value, ast.Name)
                    and node.func.value.value.id == 'os'):
                self.hints.append({
                    'type': 'use_pathlib',
                    'line': node.lineno,
                    'message': "Prefer pathlib over os.path.join (Python 3.4+).",
                    'example': "Path(a) / b  instead of  os.path.join(a, b)",
                })

    def _check_walrus_opportunity(self, tree: ast.AST) -> None:
        # if <call> compared in test, and same call repeated in the body
        for node in ast.walk(tree):
            if not isinstance(node, ast.If):
                continue
            test_calls = {ast.dump(n) for n in ast.walk(node.test) if isinstance(n, ast.Call)}
            if not test_calls:
                continue
            body_calls = set()
            for stmt in node.body:
                for n in ast.walk(stmt):
                    if isinstance(n, ast.Call):
                        body_calls.add(ast.dump(n))
            if test_calls & body_calls:
                self.hints.append({
                    'type': 'use_walrus',
                    'line': node.lineno,
                    'message': "Repeated call in condition and body — use the walrus operator (Python 3.8+).",
                    'example': "if (n := len(data)) > 0: return n",
                })

    def _check_format_strings(self, tree: ast.AST) -> None:
        for node in ast.walk(tree):
            # "{}".format(x) pattern
            if isinstance(node, ast.Call):
                if (isinstance(node.func, ast.Attribute) and
                        node.func.attr == 'format' and
                        isinstance(node.func.value, ast.Constant) and
                        isinstance(node.func.value.value, str)):
                    self.hints.append({
                        'type': 'use_fstring',
                        'line': node.lineno,
                        'message': 'Use f-string instead of .format() (Python 3.6+)',
                        'example': 'f"Hello, {name}" instead of "Hello, {}".format(name)',
                    })

            # "..." % x pattern
            if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Mod):
                if isinstance(node.left, ast.Constant) and isinstance(node.left.value, str):
                    self.hints.append({
                        'type': 'use_fstring',
                        'line': node.lineno,
                        'message': 'Use f-string instead of % formatting (Python 3.6+)',
                        'example': 'f"Hello, {name}" instead of "Hello, %s" % name',
                    })

    def _check_typing_imports(self, tree: ast.AST) -> None:
        for node in ast.walk(tree):
            if isinstance(node, ast.ImportFrom) and node.module == 'typing':
                for alias in node.names:
                    if alias.name in _TYPING_BUILTIN_MAP:
                        self.hints.append({
                            'type': 'use_builtin_generics',
                            'line': node.lineno,
                            'message': (
                                f"Use built-in `{_TYPING_BUILTIN_MAP[alias.name]}` instead of "
                                f"`typing.{alias.name}` (Python 3.9+)"
                            ),
                            'example': f'list[int] instead of List[int]',
                        })

    def _check_elif_chains(self, tree: ast.AST) -> None:
        seen: set = set()
        for node in ast.walk(tree):
            if isinstance(node, ast.If) and id(node) not in seen:
                chain = self._get_elif_chain(node)
                for n in chain:
                    seen.add(id(n))
                if len(chain) >= 3:
                    # Check all branches compare the same variable
                    compared_vars = set()
                    for if_node in chain:
                        test = if_node.test
                        if isinstance(test, ast.Compare) and isinstance(test.left, ast.Name):
                            compared_vars.add(test.left.id)
                    if len(compared_vars) == 1:
                        self.hints.append({
                            'type': 'use_match_case',
                            'line': node.lineno,
                            'message': f"Consider match/case instead of if/elif chain on '{next(iter(compared_vars))}' (Python 3.10+)",
                            'example': 'match status:\n    case "a": ...',
                        })

    def _get_elif_chain(self, node: ast.If) -> list:
        chain = [node]
        orelse = node.orelse
        while len(orelse) == 1 and isinstance(orelse[0], ast.If):
            chain.append(orelse[0])
            orelse = orelse[0].orelse
        return chain


# ---------------------------------------------------------------------------
# Coupling & Cohesion (Section 4.5)
# ---------------------------------------------------------------------------

class CouplingCohesionAnalyzer:
    """LCOM-4 cohesion per class and fan-in/fan-out coupling per function."""

    @staticmethod
    def _method_attrs_and_calls(method: ast.AST):
        """Return (instance attrs accessed, self-methods called) for a method."""
        attrs, calls = set(), set()
        for n in ast.walk(method):
            if (isinstance(n, ast.Attribute) and isinstance(n.value, ast.Name)
                    and n.value.id == 'self'):
                if isinstance(getattr(n, 'ctx', None), (ast.Load, ast.Store)):
                    # method call self.foo() vs attr access self.x
                    attrs.add(n.attr)
            if (isinstance(n, ast.Call) and isinstance(n.func, ast.Attribute)
                    and isinstance(n.func.value, ast.Name) and n.func.value.id == 'self'):
                calls.add(n.func.attr)
        return attrs, calls

    @classmethod
    def compute_lcom(cls, class_node: ast.ClassDef) -> int:
        """LCOM-4: connected components of the method graph, minus 1 (min 0)."""
        methods = [n for n in class_node.body
                   if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))]
        if len(methods) <= 1:
            return 0

        names = [m.name for m in methods]
        attrs = {}
        calls = {}
        for m in methods:
            a, c = cls._method_attrs_and_calls(m)
            # remove the method's own name from accessed attrs (avoid self-edge noise)
            attrs[m.name] = a - {m.name}
            calls[m.name] = c

        # union-find over methods
        parent = {n: n for n in names}

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        def union(a, b):
            parent[find(a)] = find(b)

        for i, m1 in enumerate(names):
            for m2 in names[i + 1:]:
                shares = bool(attrs[m1] & attrs[m2])
                mutual_call = (m2 in calls[m1]) or (m1 in calls[m2])
                if shares or mutual_call:
                    union(m1, m2)

        components = len({find(n) for n in names})
        return max(components - 1, 0)

    @classmethod
    def analyze(cls, visitor) -> Dict:
        # fan-in / fan-out from the call graph
        fan_out = {}
        fan_in = {}
        for edge in visitor.call_graph:
            caller, callee = edge['caller'], edge['callee']
            fan_out.setdefault(caller, set()).add(callee)
            fan_in.setdefault(callee, set()).add(caller)

        func_metrics = []
        for func in visitor.functions:
            name = func['name']
            func_metrics.append({
                'name': name,
                'class': func['class'],
                'fan_in': len(fan_in.get(name, set())),
                'fan_out': len(fan_out.get(name, set())),
            })

        class_metrics = []
        for c in visitor.classes:
            class_metrics.append({
                'name': c['name'],
                'lcom': cls.compute_lcom(c['node']),
                'method_count': len([m for m in c['node'].body
                                     if isinstance(m, (ast.FunctionDef, ast.AsyncFunctionDef))]),
            })

        return {'functions': func_metrics, 'classes': class_metrics}


# ---------------------------------------------------------------------------
# Test Quality Estimator (Section 4.6)
# ---------------------------------------------------------------------------

class TestQualityEstimator:
    """Estimate the minimum number of tests a function needs."""

    @staticmethod
    def estimate(func_node: ast.AST) -> Dict:
        branches = exceptions = loops = 0
        for n in ast.walk(func_node):
            if isinstance(n, ast.If):
                branches += 1
            elif isinstance(n, (ast.For, ast.While, ast.AsyncFor)):
                loops += 1
            elif isinstance(n, ast.ExceptHandler):
                exceptions += 1

        minimum = max(branches, 1) + exceptions + loops
        if minimum <= 1:
            status = "low"
        elif minimum <= 4:
            status = "moderate"
        else:
            status = "high"

        return {
            'name': getattr(func_node, 'name', '<lambda>'),
            'branches': branches,
            'loops': loops,
            'exceptions': exceptions,
            'minimum_tests_needed': minimum,
            'status': status,
        }


# ---------------------------------------------------------------------------
# Version Detector (Section 6.2 / 6.3)
# ---------------------------------------------------------------------------

class VersionDetector:
    """Estimate the minimum Python version a source file requires."""

    def __init__(self, source_code: str):
        self.source_code = source_code

    def detect(self) -> Dict:
        min_version = (3, 0)
        reasons: List[Dict] = []
        try:
            tree = ast.parse(self.source_code)
        except SyntaxError:
            return {'min_version': min_version, 'reasons': reasons}

        def require(ver, feature, node):
            nonlocal min_version
            if ver > min_version:
                min_version = ver
            reasons.append({'version': ver, 'feature': feature,
                            'line': getattr(node, 'lineno', 0)})

        for node in ast.walk(tree):
            if isinstance(node, ast.JoinedStr):
                require((3, 6), "f-string", node)
            elif isinstance(node, ast.NamedExpr):
                require((3, 8), "walrus operator (:=)", node)
            elif isinstance(node, ast.Match):
                require((3, 10), "match/case", node)
            elif isinstance(node, ast.Subscript) and isinstance(node.value, ast.Name):
                if node.value.id in ('list', 'dict', 'set', 'tuple', 'frozenset', 'type'):
                    require((3, 9), f"builtin generic {node.value.id}[...]", node)
            elif isinstance(node, ast.BinOp) and isinstance(node.op, ast.BitOr):
                # X | Y used as a type annotation
                if isinstance(getattr(node, 'parent', None), (ast.arg, ast.AnnAssign)):
                    require((3, 10), "union type X | Y", node)

        return {'min_version': min_version, 'reasons': reasons}


# ---------------------------------------------------------------------------
# Concept Detector (Section 3.3 — template-based, offline)
# ---------------------------------------------------------------------------

CONCEPT_CARDS: Dict[str, Dict[str, str]] = {
    "decorators": {
        "what": "A decorator wraps a function to add behavior without changing its body.",
        "why": "Separates cross-cutting concerns (logging, caching, auth) from business logic.",
        "how": "Define a wrapper that calls the original; return it. Use @functools.wraps(func).",
        "common_mistakes": "Forgetting @wraps loses the function's name and docstring.",
        "practice": "Write a @timer decorator that prints how long a function takes.",
    },
    "list_comprehensions": {
        "what": "A concise expression that builds a list by transforming/filtering an iterable.",
        "why": "More readable and usually faster than an explicit append loop.",
        "how": "[expr for item in iterable if condition].",
        "common_mistakes": "Nesting too deeply hurts readability — use a loop or generator instead.",
        "practice": "Rewrite a for-append loop that squares positive numbers as a comprehension.",
    },
    "generators": {
        "what": "A function using `yield` that produces values lazily, one at a time.",
        "why": "Constant memory for large/infinite sequences; values computed on demand.",
        "how": "Use `yield` in a function; iterate with for or next().",
        "common_mistakes": "Reusing an exhausted generator — they iterate only once.",
        "practice": "Write a generator that yields the Fibonacci sequence.",
    },
    "context_managers": {
        "what": "An object used with `with` that sets up and tears down a resource.",
        "why": "Guarantees cleanup (closing files, releasing locks) even on exceptions.",
        "how": "Use `with open(...) as f:` or implement __enter__/__exit__ or @contextmanager.",
        "common_mistakes": "Manually closing resources instead of using `with`.",
        "practice": "Write a context manager that times the code inside its block.",
    },
    "async_programming": {
        "what": "Coroutines defined with `async def` and awaited with `await`.",
        "why": "Efficient concurrency for I/O-bound work without threads.",
        "how": "Define `async def`, `await` coroutines, run with asyncio.run().",
        "common_mistakes": "Calling a coroutine without awaiting it — it never runs.",
        "practice": "Write an async function that awaits asyncio.sleep then returns a value.",
    },
    "type_annotations": {
        "what": "Hints that declare expected argument and return types.",
        "why": "Enable static type checking, better editor support, and clearer intent.",
        "how": "def f(x: int) -> str: ...  Use `X | None` for optionals (3.10+).",
        "common_mistakes": "Assuming annotations are enforced at runtime — they are not.",
        "practice": "Add complete type hints to an untyped function.",
    },
    "dataclasses": {
        "what": "Classes decorated with @dataclass that auto-generate __init__, __repr__, __eq__.",
        "why": "Removes boilerplate for data-holding classes.",
        "how": "from dataclasses import dataclass; @dataclass class Point: x: int.",
        "common_mistakes": "Using a mutable default (list) without field(default_factory=...).",
        "practice": "Convert a plain class with a verbose __init__ into a dataclass.",
    },
    "exception_handling": {
        "what": "try/except blocks that catch and respond to errors.",
        "why": "Lets programs recover gracefully instead of crashing.",
        "how": "Catch specific exceptions; use else/finally where appropriate.",
        "common_mistakes": "Bare `except:` hides bugs — catch specific exception types.",
        "practice": "Wrap a risky call so a ValueError is caught and logged.",
    },
}


class ConceptDetector:
    """Detect Python concepts present in code and emit teaching cards."""

    def __init__(self, source_code: str):
        self.source_code = source_code

    def detect(self) -> List[Dict]:
        try:
            tree = ast.parse(self.source_code)
        except SyntaxError:
            return []

        found = set()
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.decorator_list:
                found.add("decorators")
            if isinstance(node, ast.ListComp):
                found.add("list_comprehensions")
            if isinstance(node, (ast.Yield, ast.YieldFrom)):
                found.add("generators")
            if isinstance(node, (ast.With, ast.AsyncWith)):
                found.add("context_managers")
            if isinstance(node, (ast.AsyncFunctionDef, ast.Await)):
                found.add("async_programming")
            if isinstance(node, (ast.AnnAssign, ast.arg)) and getattr(node, 'annotation', None):
                found.add("type_annotations")
            if isinstance(node, ast.ClassDef) and any('dataclass' in ast.unparse(d) for d in node.decorator_list):
                found.add("dataclasses")
            if isinstance(node, ast.Try):
                found.add("exception_handling")

        cards = []
        for concept in found:
            if concept in CONCEPT_CARDS:
                card = {'concept': concept}
                card.update(CONCEPT_CARDS[concept])
                cards.append(card)
        return cards


# ---------------------------------------------------------------------------
# Core AST Visitor (from ast_pp.py, unchanged)
# ---------------------------------------------------------------------------

class AdvancedASTVisitor(ast.NodeVisitor):
    """Deeply traverses the AST to extract detailed code constructs and patterns"""

    def __init__(self, source_code: str):
        self.source_code = source_code
        self.scope_stack = []

        self.functions = []
        self.classes = []
        self.imports = []
        self.variables = []
        self.control_flow = []
        self.expressions = []
        self.anti_patterns = []
        self.call_graph = []
        self.recursion_detected = set()

        self.dunder_methods = []
        self.env_accesses = []
        self.hardcoded_paths = []
        self.abc_classes = []
        self.has_main_block = False
        self.concurrency_libraries = []

        self.operators = []
        self.operands = []

        self.used_names = set()
        self.defined_names = set()
        self.global_declarations = {}

    def current_scope(self):
        if not self.scope_stack:
            return 'global', 'global'
        return self.scope_stack[-1]

    def visit_Import(self, node):
        for alias in node.names:
            self.imports.append({
                'type': 'import',
                'module': alias.name,
                'name': None,
                'alias': alias.asname or alias.name,
                'line': node.lineno
            })
            self.defined_names.add(alias.asname or alias.name)
            self.operands.append(alias.name)
            if alias.asname:
                self.operands.append(alias.asname)
            module_name = alias.name.split('.')[0]
            if module_name in ('asyncio', 'threading', 'multiprocessing', 'concurrent'):
                self.concurrency_libraries.append(module_name)
        self.operators.append('import')
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        for alias in node.names:
            self.imports.append({
                'type': 'from',
                'module': node.module or '',
                'name': alias.name,
                'alias': alias.asname or alias.name,
                'line': node.lineno
            })
            self.defined_names.add(alias.asname or alias.name)
            self.operands.append(node.module or '')
            self.operands.append(alias.name)
            if alias.asname:
                self.operands.append(alias.asname)
        module_name = (node.module or '').split('.')[0]
        if module_name in ('asyncio', 'threading', 'multiprocessing', 'concurrent'):
            self.concurrency_libraries.append(module_name)
        self.operators.append('from_import')
        self.generic_visit(node)

    def visit_Name(self, node):
        if isinstance(node.ctx, ast.Load):
            self.used_names.add(node.id)
            self.operands.append(node.id)
        elif isinstance(node.ctx, ast.Store):
            self.defined_names.add(node.id)
            self.operands.append(node.id)
        self.generic_visit(node)

    def visit_Call(self, node):
        callee = None
        if isinstance(node.func, ast.Name):
            callee = node.func.id
        elif isinstance(node.func, ast.Attribute):
            callee = ast.unparse(node.func)
        scope_type, scope_name = self.current_scope()
        if scope_type == 'function':
            caller = scope_name
            self.call_graph.append({'caller': caller, 'callee': callee, 'line': node.lineno})
            if callee == caller:
                self.recursion_detected.add(caller)
        call_str = ast.unparse(node.func)
        if 'getenv' in call_str or 'environ' in call_str:
            self.env_accesses.append({'call': ast.unparse(node), 'line': node.lineno})
        self.operators.append('call')
        self.generic_visit(node)

    def visit_Subscript(self, node):
        sub_str = ast.unparse(node)
        if 'os.environ' in sub_str:
            self.env_accesses.append({'call': sub_str, 'line': node.lineno})
        self.generic_visit(node)

    def visit_FunctionDef(self, node):
        self._analyze_func_like(node, is_async=False)

    def visit_AsyncFunctionDef(self, node):
        self._analyze_func_like(node, is_async=True)

    def _analyze_func_like(self, node, is_async=False):
        parent_scope_type, parent_scope_name = self.current_scope()
        func_name = node.name
        is_nested = (parent_scope_type == 'function')

        args = [arg.arg for arg in node.args.args]
        posonlyargs = [arg.arg for arg in node.args.posonlyargs]
        kwonlyargs = [arg.arg for arg in node.args.kwonlyargs]
        vararg = node.args.vararg.arg if node.args.vararg else None
        kwarg = node.args.kwarg.arg if node.args.kwarg else None

        returns = ast.unparse(node.returns) if node.returns else None
        decorators = [ast.unparse(dec) for dec in node.decorator_list]
        defaults = [ast.unparse(d) for d in node.args.defaults]
        kw_defaults = [ast.unparse(d) if d else None for d in node.args.kw_defaults]

        for default_node in node.args.defaults + [d for d in node.args.kw_defaults if d]:
            if isinstance(default_node, (ast.List, ast.Dict, ast.Set)):
                self.anti_patterns.append({
                    'type': 'mutable_default',
                    'message': f"Function '{func_name}' uses a mutable default argument ({ast.unparse(default_node)}).",
                    'line': default_node.lineno
                })

        builtins_list = dir(__builtins__)
        if func_name in builtins_list:
            self.anti_patterns.append({
                'type': 'shadow_builtin',
                'message': f"Function '{func_name}' shadows a Python built-in name.",
                'line': node.lineno
            })

        role = "worker"
        if func_name.startswith('get_'):
            role = "getter method" if parent_scope_type == 'class' else "getter function"
        elif func_name.startswith('set_'):
            role = "setter method" if parent_scope_type == 'class' else "setter function"
        elif func_name.startswith('test_'):
            role = "test case"
        elif func_name == '__init__':
            role = "constructor"
        elif func_name.startswith('__') and func_name.endswith('__'):
            role = "magic (dunder) method"
        elif func_name.startswith('is_') or func_name.startswith('has_') or func_name.startswith('can_'):
            role = "predicate (boolean check)"

        if func_name.startswith('__') and func_name.endswith('__'):
            self.dunder_methods.append({
                'name': func_name,
                'class': parent_scope_name if parent_scope_type == 'class' else None,
                'line': node.lineno
            })

        try:
            body_source = ast.unparse(node)
        except Exception:
            body_source = f"def {func_name}(...): ..."

        func_info = {
            'name': func_name,
            'class': parent_scope_name if parent_scope_type == 'class' else None,
            'args': args,
            'posonlyargs': posonlyargs,
            'kwonlyargs': kwonlyargs,
            'vararg': vararg,
            'kwarg': kwarg,
            'defaults': defaults,
            'kw_defaults': kw_defaults,
            'returns': returns,
            'decorators': decorators,
            'docstring': ast.get_docstring(node),
            'line': node.lineno,
            'end_line': getattr(node, 'end_lineno', node.lineno),
            'is_async': is_async,
            'is_nested': is_nested,
            'role': role,
            'has_yield': False,
            'complexity': 1,
            'cognitive_complexity': 0,
            'statements': 0,
            'body': body_source,
            'node': node,
        }

        self.functions.append(func_info)

        branch_nodes = (ast.If, ast.For, ast.While, ast.ExceptHandler, ast.With,
                        ast.match_case, ast.And, ast.Or, ast.IfExp,
                        ast.ListComp, ast.DictComp, ast.SetComp, ast.GeneratorExp)
        complexity = 1
        statements = 0
        has_yield = False

        for child in ast.walk(node):
            if isinstance(child, branch_nodes):
                complexity += 1
            if isinstance(child, ast.stmt):
                statements += 1
            if isinstance(child, (ast.Yield, ast.YieldFrom)):
                has_yield = True

        func_info['complexity'] = complexity
        func_info['statements'] = statements
        func_info['has_yield'] = has_yield

        self.scope_stack.append(('function', func_name))
        self.generic_visit(node)
        self.scope_stack.pop()

    def visit_ClassDef(self, node):
        parent_scope_type, parent_scope_name = self.current_scope()
        class_name = node.name

        bases = [ast.unparse(base) for base in node.bases]
        decorators = [ast.unparse(dec) for dec in node.decorator_list]

        is_dataclass = any('dataclass' in dec for dec in decorators)
        role = "standard class"
        if is_dataclass:
            role = "dataclass"
        elif any('Exception' in b or 'Error' in b for b in bases):
            role = "custom exception class"
        elif class_name.endswith('Factory'):
            role = "factory pattern class"

        class_info = {
            'name': class_name,
            'bases': bases,
            'decorators': decorators,
            'docstring': ast.get_docstring(node),
            'line': node.lineno,
            'end_line': getattr(node, 'end_lineno', node.lineno),
            'methods': [],
            'class_vars': [],
            'instance_vars': [],
            'role': role,
            'node': node,
        }
        self.classes.append(class_info)

        if any('ABC' in base or 'Abstract' in base for base in bases):
            self.abc_classes.append({'name': class_name, 'line': node.lineno})

        self.scope_stack.append(('class', class_name))
        self.generic_visit(node)
        self.scope_stack.pop()

    def visit_Assign(self, node):
        scope_type, scope_name = self.current_scope()
        val_str = ast.unparse(node.value)
        for target in node.targets:
            self._process_target(target, node.lineno, val_str, scope_type, scope_name)
        self.operators.append('assign')
        self.generic_visit(node)

    def visit_AnnAssign(self, node):
        scope_type, scope_name = self.current_scope()
        val_str = ast.unparse(node.value) if node.value else "None"
        anno_str = ast.unparse(node.annotation)
        if node.target:
            self._process_target(node.target, node.lineno, val_str, scope_type, scope_name,
                                 is_annotated=True, annotation=anno_str)
        self.operators.append('ann_assign')
        self.generic_visit(node)

    def visit_AugAssign(self, node):
        scope_type, scope_name = self.current_scope()
        val_str = ast.unparse(node.value)
        op_str = type(node.op).__name__
        self._process_target(node.target, node.lineno, f"{op_str} {val_str}", scope_type, scope_name)
        self.operators.append('aug_assign')
        self.generic_visit(node)

    def visit_NamedExpr(self, node):
        scope_type, scope_name = self.current_scope()
        val_str = ast.unparse(node.value)
        self._process_target(node.target, node.lineno, val_str, scope_type, scope_name, is_walrus=True)
        self.operators.append('walrus')
        self.generic_visit(node)

    def _process_target(self, target, line, val_str, scope_type, scope_name,
                        is_annotated=False, annotation=None, is_walrus=False):
        if isinstance(target, ast.Name):
            var_name = target.id
            builtins_list = dir(__builtins__)
            if var_name in builtins_list:
                self.anti_patterns.append({
                    'type': 'shadow_builtin',
                    'message': f"Variable '{var_name}' shadows a Python built-in name.",
                    'line': line
                })
            var_type = 'global'
            var_scope = 'global'
            if scope_type == 'class':
                var_type = 'class'
                var_scope = scope_name
            elif scope_type == 'function':
                is_global = (scope_name in self.global_declarations and
                             var_name in self.global_declarations[scope_name])
                if is_global:
                    var_type = 'global'
                    var_scope = 'global'
                else:
                    var_type = 'local'
                    var_scope = scope_name
            self.variables.append({
                'name': var_name,
                'type': var_type,
                'scope': var_scope,
                'value': val_str,
                'line': line,
                'is_annotated': is_annotated,
                'annotation': annotation,
                'is_walrus': is_walrus,
            })
            if scope_type == 'class':
                for cls in self.classes:
                    if cls['name'] == scope_name:
                        cls['class_vars'].append({
                            'name': var_name, 'value': val_str,
                            'line': line, 'annotation': annotation,
                        })
        elif isinstance(target, ast.Attribute):
            if isinstance(target.value, ast.Name) and target.value.id == 'self':
                var_name = target.attr
                class_in_scope = None
                for stype, sname in reversed(self.scope_stack):
                    if stype == 'class':
                        class_in_scope = sname
                        break
                if class_in_scope:
                    self.variables.append({
                        'name': f"self.{var_name}",
                        'type': 'instance',
                        'scope': class_in_scope,
                        'value': val_str,
                        'line': line,
                        'is_annotated': is_annotated,
                        'annotation': annotation,
                        'is_walrus': is_walrus,
                    })
                    for cls in self.classes:
                        if cls['name'] == class_in_scope:
                            if not any(iv['name'] == var_name for iv in cls['instance_vars']):
                                cls['instance_vars'].append({
                                    'name': var_name, 'value': val_str,
                                    'line': line, 'annotation': annotation,
                                })
        elif isinstance(target, (ast.Tuple, ast.List)):
            for elt in target.elts:
                self._process_target(elt, line, val_str, scope_type, scope_name,
                                     is_annotated, annotation, is_walrus)

    def visit_Global(self, node):
        scope_type, scope_name = self.current_scope()
        if scope_type == 'function':
            if scope_name not in self.global_declarations:
                self.global_declarations[scope_name] = set()
            for name in node.names:
                self.global_declarations[scope_name].add(name)
                self.anti_patterns.append({
                    'type': 'global_keyword',
                    'message': f"Function '{scope_name}' uses 'global' to modify '{name}'. Modifying globals is discouraged.",
                    'line': node.lineno
                })
        self.operators.append('global')
        self.generic_visit(node)

    def visit_If(self, node):
        if isinstance(node.test, ast.Compare):
            left_str = ast.unparse(node.test.left)
            if left_str == "__name__":
                for op, comparator in zip(node.test.ops, node.test.comparators):
                    if isinstance(op, ast.Eq):
                        comp_str = ast.unparse(comparator)
                        if comp_str in ("'__main__'", '"__main__"'):
                            self.has_main_block = True
        self.control_flow.append({
            'type': 'If', 'line': node.lineno,
            'description': f"Conditional branch (if {ast.unparse(node.test)})"
        })
        self.operators.append('if')
        self.generic_visit(node)

    def visit_For(self, node):
        self.control_flow.append({
            'type': 'For', 'line': node.lineno,
            'description': f"Loop (for {ast.unparse(node.target)} in {ast.unparse(node.iter)})"
        })
        self.operators.append('for')
        self.generic_visit(node)

    def visit_While(self, node):
        self.control_flow.append({
            'type': 'While', 'line': node.lineno,
            'description': f"Loop (while {ast.unparse(node.test)})"
        })
        self.operators.append('while')
        self.generic_visit(node)

    def visit_Try(self, node):
        self.control_flow.append({
            'type': 'Try', 'line': node.lineno,
            'description': "Exception handling block (try...except)"
        })
        self.operators.append('try')
        self.generic_visit(node)

    def visit_ExceptHandler(self, node):
        exc_type = ast.unparse(node.type) if node.type else "Bare Except"
        if exc_type == "Bare Except":
            self.anti_patterns.append({
                'type': 'bare_except',
                'message': "Bare except clause. Catching all exceptions blindly can hide bugs.",
                'line': node.lineno
            })
        self.control_flow.append({
            'type': 'Except', 'line': node.lineno,
            'description': f"Except handler for: {exc_type}"
        })
        self.operators.append('except')
        self.generic_visit(node)

    def visit_With(self, node):
        items = [ast.unparse(item) for item in node.items]
        self.control_flow.append({
            'type': 'With', 'line': node.lineno,
            'description': f"Context manager (with {', '.join(items)})"
        })
        self.operators.append('with')
        self.generic_visit(node)

    def visit_Match(self, node):
        self.control_flow.append({
            'type': 'Match', 'line': node.lineno,
            'description': f"Pattern matching (match {ast.unparse(node.subject)})"
        })
        self.operators.append('match')
        self.generic_visit(node)

    def visit_Compare(self, node):
        for op, comp in zip(node.ops, node.comparators):
            if isinstance(op, (ast.Eq, ast.NotEq)):
                is_none = (
                    (isinstance(comp, ast.Constant) and comp.value is None) or
                    (isinstance(comp, ast.Name) and comp.id == 'None') or
                    (isinstance(node.left, ast.Constant) and node.left.value is None) or
                    (isinstance(node.left, ast.Name) and node.left.id == 'None')
                )
                if is_none:
                    op_word = "==" if isinstance(op, ast.Eq) else "!="
                    self.anti_patterns.append({
                        'type': 'none_comparison',
                        'message': f"Comparing with None using '{op_word}'. Use 'is None' or 'is not None'.",
                        'line': node.lineno
                    })
        for op in node.ops:
            self.operators.append(type(op).__name__)
        self.generic_visit(node)

    def visit_Lambda(self, node):
        self.expressions.append({
            'type': 'Lambda', 'line': node.lineno,
            'description': f"Lambda expression: {ast.unparse(node)}"
        })
        self.operators.append('lambda')
        self.generic_visit(node)

    def visit_IfExp(self, node):
        self.expressions.append({
            'type': 'Ternary', 'line': node.lineno,
            'description': f"Ternary conditional: {ast.unparse(node)}"
        })
        self.operators.append('ternary')
        self.generic_visit(node)

    def visit_ListComp(self, node):
        self.expressions.append({
            'type': 'List Comprehension', 'line': node.lineno,
            'description': f"List comprehension: {ast.unparse(node)}"
        })
        self.operators.append('list_comp')
        self.generic_visit(node)

    def visit_DictComp(self, node):
        self.expressions.append({
            'type': 'Dict Comprehension', 'line': node.lineno,
            'description': f"Dict comprehension: {ast.unparse(node)}"
        })
        self.operators.append('dict_comp')
        self.generic_visit(node)

    def visit_SetComp(self, node):
        self.expressions.append({
            'type': 'Set Comprehension', 'line': node.lineno,
            'description': f"Set comprehension: {ast.unparse(node)}"
        })
        self.operators.append('set_comp')
        self.generic_visit(node)

    def visit_GeneratorExp(self, node):
        self.expressions.append({
            'type': 'Generator Expression', 'line': node.lineno,
            'description': f"Generator expression: {ast.unparse(node)}"
        })
        self.operators.append('generator_exp')
        self.generic_visit(node)

    def visit_BinOp(self, node):
        self.operators.append(type(node.op).__name__)
        self.generic_visit(node)

    def visit_UnaryOp(self, node):
        self.operators.append(type(node.op).__name__)
        self.generic_visit(node)

    def visit_BoolOp(self, node):
        self.operators.append(type(node.op).__name__)
        self.generic_visit(node)

    def visit_Constant(self, node):
        if isinstance(node.value, str):
            val = node.value
            for ext in ('.txt', '.csv', '.json', '.db', '.sqlite', '.yaml', '.yml', '.ini', '.config'):
                if val.endswith(ext) or '/' + ext[1:] in val or '\\' + ext[1:] in val:
                    self.hardcoded_paths.append({'path': val, 'line': node.lineno})
        self.operands.append(str(node.value))
        self.generic_visit(node)


# ---------------------------------------------------------------------------
# Enhanced ASTAnalyzer
# ---------------------------------------------------------------------------

class ASTAnalyzer:
    """Analyzes Python code: structural, metrics, security, dead code, modernization."""

    def __init__(self, source_code: str):
        self.source_code = source_code
        self.tree = ast.parse(source_code)
        self.visitor = AdvancedASTVisitor(source_code)
        self.info: Dict[str, Any] = {}
        self.metrics: Dict[str, Any] = {}
        self.skill_level = "Beginner"
        self.concept_tags: List[str] = []

    def analyze(self):
        self.visitor.visit(self.tree)

        # Associate methods with classes
        for cls in self.visitor.classes:
            cls['methods'] = [f for f in self.visitor.functions if f['class'] == cls['name']]

        # Unused imports
        for imp in self.visitor.imports:
            name_to_check = imp['alias'] or imp['name'] or imp['module']
            if name_to_check not in self.visitor.used_names:
                self.visitor.anti_patterns.append({
                    'type': 'unused_import',
                    'message': f"Unused import: '{name_to_check}' from module '{imp['module']}'.",
                    'line': imp['line']
                })

        # Deprecated module detection
        for imp in self.visitor.imports:
            module_root = imp['module'].split('.')[0]
            if module_root in DEPRECATED_MODULES:
                info = DEPRECATED_MODULES[module_root]
                removed = info.get('removed_in', info.get('deprecated_in', '?'))
                repl = info.get('replacement', 'See Python docs')
                self.visitor.anti_patterns.append({
                    'type': 'deprecated_module',
                    'message': (
                        f"Module '{module_root}' deprecated/removed in Python {removed}. "
                        f"{repl}"
                    ),
                    'line': imp['line']
                })

        # Cognitive complexity per function
        for func in self.visitor.functions:
            func['cognitive_complexity'] = CognitiveComplexityVisitor.compute_for_function(func['node'])

        # Security analysis
        sec_visitor = SecurityVisitor(self.source_code)
        sec_visitor.visit(self.tree)
        security_findings = sec_visitor.findings

        # Dead code detection
        detector = DeadCodeDetector()
        detector.analyze(self.tree, self.visitor)
        dead_code = detector.findings

        # Modernization hints
        checker = ModernizationChecker(self.source_code)
        modernization_hints = checker.check()

        # Coupling & cohesion
        coupling = CouplingCohesionAnalyzer.analyze(self.visitor)

        # Test quality estimation (per function)
        test_quality = [TestQualityEstimator.estimate(f['node']) for f in self.visitor.functions]

        # Minimum Python version
        min_version = VersionDetector(self.source_code).detect()

        # Concept cards
        concept_cards = ConceptDetector(self.source_code).detect()

        self.info = {
            'functions': self.visitor.functions,
            'classes': self.visitor.classes,
            'imports': self.visitor.imports,
            'variables': self.visitor.variables,
            'control_flow': self.visitor.control_flow,
            'expressions': self.visitor.expressions,
            'anti_patterns': self.visitor.anti_patterns,
            'call_graph': self.visitor.call_graph,
            'recursion_detected': list(self.visitor.recursion_detected),
            'dunder_methods': self.visitor.dunder_methods,
            'env_accesses': self.visitor.env_accesses,
            'hardcoded_paths': self.visitor.hardcoded_paths,
            'abc_classes': self.visitor.abc_classes,
            'has_main_block': self.visitor.has_main_block,
            'concurrency_libraries': list(set(self.visitor.concurrency_libraries)),
            'security_findings': security_findings,
            'dead_code': dead_code,
            'modernization_hints': modernization_hints,
            'coupling': coupling,
            'test_quality': test_quality,
            'min_version': min_version,
            'concept_cards': concept_cards,
        }

        self.metrics = self.compute_metrics(self.visitor, self.source_code)
        self.metrics['security_score'] = SecurityVisitor.calculate_security_score(security_findings)

        self.skill_level = self.assess_skill_level(self.visitor, self.metrics)
        self.concept_tags = self.tag_concepts(self.visitor)

        return self.info

    def compute_metrics(self, visitor, raw_code: str) -> Dict[str, Any]:
        lines = raw_code.splitlines()
        physical_loc = len(lines)
        comment_lines = 0
        blank_lines = 0

        try:
            tokens = list(tokenize.generate_tokens(io.StringIO(raw_code).readline))
            for tok in tokens:
                if tok.type == tokenize.COMMENT:
                    comment_lines += 1
        except Exception:
            for line in lines:
                if line.strip().startswith('#'):
                    comment_lines += 1

        for line in lines:
            if not line.strip():
                blank_lines += 1

        code_lines = max(0, physical_loc - comment_lines - blank_lines)
        comment_density = (comment_lines / physical_loc * 100) if physical_loc > 0 else 0

        total_cc = 1
        for f in visitor.functions:
            total_cc += (f['complexity'] - 1)
        avg_cc = (
            sum(f['complexity'] for f in visitor.functions) / len(visitor.functions)
            if visitor.functions else 1
        )

        distinct_ops = set(visitor.operators)
        n1 = len(distinct_ops)
        N1 = len(visitor.operators)
        distinct_opnds = set(visitor.operands)
        n2 = len(distinct_opnds)
        N2 = len(visitor.operands)
        vocabulary = n1 + n2
        length = N1 + N2
        volume = length * math.log2(vocabulary) if vocabulary > 0 else 0
        difficulty = (n1 / 2) * (N2 / n2) if n2 > 0 else 0
        effort = difficulty * volume

        loc_val = max(1, physical_loc)
        vol_val = max(1.0, volume)
        mi = 171.0 - 5.2 * math.log(vol_val) - 0.23 * avg_cc - 16.2 * math.log(loc_val)
        mi = max(0.0, min(100.0, mi))

        if mi > 65:
            mi_grade, mi_color = "High (Good)", "green"
        elif mi >= 30:
            mi_grade, mi_color = "Medium (Moderate)", "yellow"
        else:
            mi_grade, mi_color = "Low (Hard to maintain)", "red"

        return {
            'physical_loc': physical_loc,
            'code_lines': code_lines,
            'comment_lines': comment_lines,
            'comment_density': comment_density,
            'avg_cc': avg_cc,
            'total_cc': total_cc,
            'halstead': {
                'n1': n1, 'n2': n2, 'N1': N1, 'N2': N2,
                'vocabulary': vocabulary, 'length': length,
                'volume': volume, 'difficulty': difficulty, 'effort': effort,
            },
            'maintainability_index': mi,
            'mi_grade': mi_grade,
            'mi_color': mi_color,
        }

    def assess_skill_level(self, visitor, metrics) -> str:
        has_async = any(f['is_async'] for f in visitor.functions)
        has_decorators = (
            any(f['decorators'] for f in visitor.functions) or
            any(c['decorators'] for c in visitor.classes)
        )
        has_classes = len(visitor.classes) > 0
        has_comprehensions = any(
            e['type'] in ('List Comprehension', 'Dict Comprehension', 'Set Comprehension', 'Generator Expression')
            for e in visitor.expressions
        )
        has_exceptions = any(cf['type'] == 'Except' for cf in visitor.control_flow)

        points = 0
        if has_classes: points += 2
        if has_decorators: points += 2
        if has_async: points += 3
        if has_comprehensions: points += 1
        if has_exceptions: points += 1
        if metrics['avg_cc'] > 4: points += 2
        if len(visitor.functions) > 5: points += 1

        if points >= 6 or has_async:
            return "Advanced"
        elif points >= 2:
            return "Intermediate"
        else:
            return "Beginner"

    def tag_concepts(self, visitor) -> List[str]:
        tags = []
        if any(f['decorators'] for f in visitor.functions):
            tags.append("#decorator")
        if any(f['is_async'] for f in visitor.functions):
            tags.append("#async-programming")
        if any(c['bases'] for c in visitor.classes):
            tags.append("#class-inheritance")
        if visitor.recursion_detected:
            tags.append("#recursion")
        if any(cf['type'] == 'Except' for cf in visitor.control_flow):
            tags.append("#exception-handling")
        if any(e['type'] == 'List Comprehension' for e in visitor.expressions):
            tags.append("#list-comprehension")
        if any(e['type'] == 'Dict Comprehension' for e in visitor.expressions):
            tags.append("#dict-comprehension")
        if any(e['type'] == 'Generator Expression' for e in visitor.expressions):
            tags.append("#generators")
        if any(v['is_walrus'] for v in visitor.variables):
            tags.append("#walrus-operator")
        if any(cf['type'] == 'Match' for cf in visitor.control_flow):
            tags.append("#pattern-matching")
        return tags


# ---------------------------------------------------------------------------
# TUI — Enhanced with Security, Dead Code, and Modernization views
# ---------------------------------------------------------------------------

class ASTProtocolTUI:
    def __init__(self):
        self.analyzer = None
        self.source_code = None

    def display_banner(self):
        banner_text = """
 ╔═══════════════════════════════════════════════════════════════════╗
 ║         AST Python Protocol v2.0 - Enhanced Code Explorer        ║
 ║                                                                   ║
 ║  Security Scanner  |  Cognitive Complexity  |  Dead Code          ║
 ║  Modernization Hints  |  7 Architecture Lenses  |  Dev-Lens       ║
 ╚═══════════════════════════════════════════════════════════════════╝
        """
        console.print(Panel(banner_text.strip(), style="banner", border_style="border"))

    def display_menu(self):
        menu_content = (
            "[menu.num][ 1][/menu.num] [text.primary]Upload Script[/text.primary]\n"
            "[menu.num][ 2][/menu.num] [text.primary]View Summary & Metrics Dashboard[/text.primary]\n"
            "[menu.num][ 3][/menu.num] [text.primary]Explore Functions (with Cognitive Complexity)[/text.primary]\n"
            "[menu.num][ 4][/menu.num] [text.primary]Explore Classes[/text.primary]\n"
            "[menu.num][ 5][/menu.num] [text.primary]View Imports[/text.primary]\n"
            "[menu.num][ 6][/menu.num] [text.primary]View Variables[/text.primary]\n"
            "[menu.num][ 7][/menu.num] [text.primary]View Control Flow & Expressions[/text.primary]\n"
            "[menu.num][ 8][/menu.num] [text.primary]Interactive Call Graph[/text.primary]\n"
            "[menu.num][ 9][/menu.num] [text.primary]Anti-patterns & Explanations[/text.primary]\n"
            "[menu.num][10][/menu.num] [text.primary]Export Report (Markdown)[/text.primary]\n"
            "[menu.num][11][/menu.num] [text.primary]Full Analysis[/text.primary]\n"
            "[menu.num][12][/menu.num] [text.primary]View Source Code (with Line Numbers)[/text.primary]\n"
            "[menu.num][13][/menu.num] [text.primary]Architecture Dev-Lens (7 Views)[/text.primary]\n"
            "[menu.num][14][/menu.num] [text.primary]Security Vulnerability Lens[/text.primary]\n"
            "[menu.num][15][/menu.num] [text.primary]Dead Code Report[/text.primary]\n"
            "[menu.num][16][/menu.num] [text.primary]Modernization Suggestions[/text.primary]\n"
            "[menu.num][17][/menu.num] [text.primary]Coupling & Cohesion (LCOM, fan-in/out)[/text.primary]\n"
            "[menu.num][18][/menu.num] [text.primary]Test Quality Estimation[/text.primary]\n"
            "[menu.num][19][/menu.num] [text.primary]Python Version Requirements[/text.primary]\n"
            "[menu.num][20][/menu.num] [text.primary]Concept Cards (Learn)[/text.primary]\n"
            "[menu.num][ 0][/menu.num] [text.secondary]Exit[/text.secondary]"
        )
        menu = Panel(
            menu_content,
            title="[ MAIN MENU — AST PROTOCOL v2.0 ]",
            title_align="center",
            border_style="border",
            style="text.primary",
        )
        console.print(menu)

    def _require_analyzer(self) -> bool:
        if not self.analyzer:
            console.print("[warning]No code loaded. Please upload code first (option 1).[/warning]")
            return False
        return True

    def upload_code(self):
        console.print("\n[highlight]Upload Python Code[/highlight]")
        console.print("[menu.num][1][/menu.num] Enter code directly")
        console.print("[menu.num][2][/menu.num] Load from file")
        choice = Prompt.ask("Choice", choices=["1", "2"])

        if choice == "1":
            console.print("\n[highlight]Enter Python code (type 'END' on a new line to finish):[/highlight]")
            lines = []
            while True:
                line = console.input()
                if line.strip() == "END":
                    break
                lines.append(line)
            self.source_code = '\n'.join(lines)
        else:
            filename = Prompt.ask("Enter filename")
            try:
                with open(filename, 'r') as f:
                    self.source_code = f.read()
            except FileNotFoundError:
                console.print("[error]Error: File not found![/error]")
                return

        try:
            console.print("[text.secondary]Parsing AST... Running analysis pipeline...[/text.secondary]")
            self.analyzer = ASTAnalyzer(self.source_code)
            self.analyzer.analyze()
            console.print("\n[success]Code analyzed successfully![/success]")
        except SyntaxError as e:
            error_msg = (
                f"Syntax Error:\n"
                f"  Line {e.lineno}: {(e.text or '').strip()}\n"
                f"  Error: {e.msg}"
            )
            console.print(Panel(error_msg, title="[ SYNTAX ERROR ]", style="error", border_style="error"))
            self.analyzer = None

    def view_summary(self):
        if not self._require_analyzer():
            return

        struct_table = Table(title="Code Structure Summary", box=box.ROUNDED, border_style="border")
        struct_table.add_column("Component", style="text.primary")
        struct_table.add_column("Count", style="highlight")

        summary = {
            'Functions': len(self.analyzer.info['functions']),
            'Classes': len(self.analyzer.info['classes']),
            'Imports': len(self.analyzer.info['imports']),
            'Variables': len(self.analyzer.info['variables']),
            'Control Flow Blocks': len(self.analyzer.info['control_flow']),
            'Advanced Expressions': len(self.analyzer.info['expressions']),
            'Anti-patterns Detected': len(self.analyzer.info['anti_patterns']),
            'Security Findings': len(self.analyzer.info['security_findings']),
            'Dead Code Issues': len(self.analyzer.info['dead_code']),
            'Modernization Hints': len(self.analyzer.info['modernization_hints']),
        }
        for key, value in summary.items():
            struct_table.add_row(key, str(value))

        metrics = self.analyzer.metrics
        metrics_table = Table(title="Quality Metrics Dashboard", box=box.ROUNDED, border_style="border")
        metrics_table.add_column("Metric", style="text.primary")
        metrics_table.add_column("Value", style="highlight")
        metrics_table.add_column("Rating / Note", style="text.secondary")

        metrics_table.add_row("Physical Lines of Code", str(metrics['physical_loc']), "Total lines")
        metrics_table.add_row("Logical Lines of Code", str(metrics['code_lines']), "Non-empty, non-comment")
        metrics_table.add_row("Comment Density", f"{metrics['comment_density']:.1f}%", "")
        metrics_table.add_row("Avg Cyclomatic Complexity", f"{metrics['avg_cc']:.2f}", "Branch complexity per func")

        avg_cc_val = (
            sum(f['cognitive_complexity'] for f in self.analyzer.info['functions']) /
            len(self.analyzer.info['functions'])
        ) if self.analyzer.info['functions'] else 0
        metrics_table.add_row("Avg Cognitive Complexity", f"{avg_cc_val:.1f}",
                              CognitiveComplexityVisitor.get_rating(int(avg_cc_val)))

        mi_val = metrics['maintainability_index']
        metrics_table.add_row("Maintainability Index", f"{mi_val:.2f}", f"[bold]{metrics['mi_grade']}[/bold]")

        sec_score = metrics['security_score']
        sec_label = "Secure" if sec_score >= 90 else ("Fair" if sec_score >= 70 else "At Risk")
        metrics_table.add_row("Security Score", str(sec_score), sec_label)
        metrics_table.add_row("Developer Skill Level", self.analyzer.skill_level, "Based on feature usage")

        console.print(Columns([struct_table, metrics_table]))

        hal = metrics['halstead']
        hal_table = Table(title="Halstead Complexity Metrics", box=box.ROUNDED, border_style="border")
        hal_table.add_column("Metric", style="text.primary")
        hal_table.add_column("Value", style="highlight")
        hal_table.add_row("Distinct Operators (n1)", str(hal['n1']))
        hal_table.add_row("Distinct Operands (n2)", str(hal['n2']))
        hal_table.add_row("Program Vocabulary (n)", str(hal['vocabulary']))
        hal_table.add_row("Calculated Volume (V)", f"{hal['volume']:.2f}")
        hal_table.add_row("Calculated Difficulty (D)", f"{hal['difficulty']:.2f}")
        hal_table.add_row("Calculated Effort (E)", f"{hal['effort']:.2f}")
        console.print(hal_table)

        if self.analyzer.concept_tags:
            console.print(
                f"\n[text.secondary]Python Concepts Detected: "
                f"[highlight]{' '.join(self.analyzer.concept_tags)}[/highlight][/text.secondary]"
            )

    def explore_functions(self):
        if not self._require_analyzer():
            return

        functions = self.analyzer.info['functions']
        if not functions:
            console.print("[warning]No functions found.[/warning]")
            return

        for i, func in enumerate(functions, 1):
            title = f"Function {i}: {func['name']}()"
            if func['class']:
                title = f"Method {i}: {func['class']}.{func['name']}()"

            cc_rating = CognitiveComplexityVisitor.get_rating(func['cognitive_complexity'])
            cc_color = (
                "success" if func['cognitive_complexity'] <= 5 else
                "warning" if func['cognitive_complexity'] <= 15 else
                "error"
            )

            lines = [
                f"[accent]Line Range:[/accent] {func['line']} - {func['end_line']}",
                f"[accent]Role:[/accent] {func['role'].capitalize()}",
                f"[accent]Async:[/accent] {func['is_async']}",
                f"[accent]Statements:[/accent] {func['statements']}",
                f"[accent]Cyclomatic Complexity:[/accent] {func['complexity']}",
                f"[accent]Cognitive Complexity:[/accent] [{cc_color}]{func['cognitive_complexity']} ({cc_rating})[/{cc_color}]",
            ]

            arg_parts = []
            if func['posonlyargs']:
                arg_parts.append(", ".join(func['posonlyargs']) + " (pos-only)")
            if func['args']:
                arg_parts.append(", ".join(func['args']))
            if func['vararg']:
                arg_parts.append(f"*{func['vararg']}")
            if func['kwonlyargs']:
                arg_parts.append(", ".join(func['kwonlyargs']) + " (kw-only)")
            if func['kwarg']:
                arg_parts.append(f"**{func['kwarg']}")

            lines.append(f"[accent]Arguments:[/accent] {', '.join(arg_parts) if arg_parts else 'None'}")
            if func['defaults']:
                lines.append(f"[accent]Default Values:[/accent] {', '.join(func['defaults'])}")
            if func['returns']:
                lines.append(f"[accent]Return Annotation:[/accent] {func['returns']}")
            if func['decorators']:
                lines.append(f"[accent]Decorators:[/accent] {', '.join(func['decorators'])}")
            if func['docstring']:
                lines.append(f"[accent]Docstring:[/accent]\n  [text.secondary]{func['docstring']}[/text.secondary]")
            if func['has_yield']:
                lines.append("[accent]Generator function (contains yield)[/accent]")

            console.print(Panel("\n".join(lines), title=f"[ {title} ]", border_style="border"))

            body_statements = [ast.unparse(c) for c in ast.iter_child_nodes(func['node'])
                               if isinstance(c, ast.stmt)]
            for ln in body_statements[:5]:
                console.print(f"    [text.secondary]> {ln}[/text.secondary]")
            if len(body_statements) > 5:
                console.print(f"    [text.muted]... ({len(body_statements) - 5} more statements)[/text.muted]")
            console.print()

    def view_security_lens(self):
        if not self._require_analyzer():
            return

        findings = self.analyzer.info['security_findings']
        score = self.analyzer.metrics['security_score']

        score_color = "success" if score >= 90 else ("warning" if score >= 70 else "error")
        console.print(
            Panel(
                f"[{score_color}]Security Score: {score}/100[/{score_color}]\n"
                f"[text.secondary]Findings: {len(findings)} issue(s) detected[/text.secondary]",
                title="[ SECURITY VULNERABILITY LENS ]",
                border_style="border",
            )
        )

        if not findings:
            console.print(Panel(
                "[success]No security vulnerabilities detected! Good job.[/success]",
                border_style="border",
            ))
            return

        severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
        sorted_findings = sorted(findings, key=lambda f: severity_order.get(f.severity, 9))

        table = Table(title="Security Findings", box=box.ROUNDED, border_style="border")
        table.add_column("Rule", style="accent")
        table.add_column("Severity", style="highlight")
        table.add_column("CWE", style="text.muted")
        table.add_column("Category", style="text.secondary")
        table.add_column("Line", style="text.muted")
        table.add_column("Message", style="text.primary")

        for f in sorted_findings:
            sev_style = {
                "CRITICAL": "[sec.critical]CRITICAL[/sec.critical]",
                "HIGH": "[sec.high]HIGH[/sec.high]",
                "MEDIUM": "[sec.medium]MEDIUM[/sec.medium]",
                "LOW": "[sec.low]LOW[/sec.low]",
            }.get(f.severity, f.severity)
            table.add_row(f.rule_id, sev_style, f.cwe_id, f.category, str(f.lineno), f.message)

        console.print(table)

        for f in sorted_findings:
            console.print(Panel(
                f"[text.primary]{f.message}[/text.primary]\n\n"
                f"[accent]Code:[/accent]\n[text.secondary]{f.source_snippet}[/text.secondary]\n\n"
                f"[accent]Remediation:[/accent]\n[text.secondary]{f.remediation}[/text.secondary]",
                title=f"[ {f.rule_id} — {f.severity} — {f.category} (Line {f.lineno}) ]",
                border_style="border",
            ))

    def view_dead_code(self):
        if not self._require_analyzer():
            return

        dead = self.analyzer.info['dead_code']

        console.print(Panel(
            f"[text.secondary]Dead Code Issues: {len(dead)} found[/text.secondary]",
            title="[ DEAD CODE REPORT ]",
            border_style="border",
        ))

        if not dead:
            console.print(Panel(
                "[success]No dead code detected![/success]",
                border_style="border",
            ))
            return

        table = Table(title="Dead Code Issues", box=box.ROUNDED, border_style="border")
        table.add_column("Type", style="accent")
        table.add_column("Name / Line", style="highlight")
        table.add_column("Message", style="text.primary")

        for d in dead:
            type_label = "Unreachable Code" if d['type'] == 'unreachable' else "Unused Function"
            name_line = d.get('name') or f"Line {d.get('line', '?')}"
            table.add_row(type_label, str(name_line), d['message'])

        console.print(table)

    def view_modernization(self):
        if not self._require_analyzer():
            return

        hints = self.analyzer.info['modernization_hints']

        console.print(Panel(
            f"[text.secondary]Modernization Hints: {len(hints)} suggestion(s)[/text.secondary]",
            title="[ MODERNIZATION SUGGESTIONS (Python 3.9–3.13) ]",
            border_style="border",
        ))

        if not hints:
            console.print(Panel(
                "[success]Code follows modern Python patterns![/success]",
                border_style="border",
            ))
            return

        table = Table(title="Modernization Hints", box=box.ROUNDED, border_style="border")
        table.add_column("Type", style="accent")
        table.add_column("Line", style="text.muted")
        table.add_column("Suggestion", style="text.primary")
        table.add_column("Example", style="text.secondary")

        for h in hints:
            type_map = {
                'use_fstring': 'Use f-string',
                'use_builtin_generics': 'Use built-in generics',
                'use_match_case': 'Use match/case',
            }
            table.add_row(
                type_map.get(h['type'], h['type']),
                str(h.get('line', '?')),
                h['message'],
                h.get('example', ''),
            )

        console.print(table)

    def view_coupling(self):
        if not self._require_analyzer():
            return
        coupling = self.analyzer.info['coupling']

        console.print(Panel(
            "[text.secondary]LCOM-4 cohesion per class + fan-in/fan-out coupling per function.[/text.secondary]",
            title="[ COUPLING & COHESION ]",
            border_style="border",
        ))

        classes = coupling['classes']
        if classes:
            ctable = Table(title="Class Cohesion (LCOM-4)", box=box.ROUNDED, border_style="border")
            ctable.add_column("Class", style="accent")
            ctable.add_column("Methods", style="text.muted", justify="right")
            ctable.add_column("LCOM", justify="right")
            ctable.add_column("Verdict", style="text.secondary")
            for c in classes:
                lcom = c['lcom']
                if lcom == 0:
                    verdict = "[success]Cohesive[/success]"
                elif lcom == 1:
                    verdict = "[warning]Loosely cohesive[/warning]"
                else:
                    verdict = "[error]Split candidate[/error]"
                ctable.add_row(c['name'], str(c['method_count']), str(lcom), verdict)
            console.print(ctable)

        funcs = [f for f in coupling['functions'] if f['fan_in'] or f['fan_out']]
        if funcs:
            ftable = Table(title="Function Coupling", box=box.ROUNDED, border_style="border")
            ftable.add_column("Function", style="accent")
            ftable.add_column("Fan-in", justify="right")
            ftable.add_column("Fan-out", justify="right")
            for f in sorted(funcs, key=lambda x: x['fan_in'] + x['fan_out'], reverse=True):
                ftable.add_row(f['name'], str(f['fan_in']), str(f['fan_out']))
            console.print(ftable)

        if not classes and not funcs:
            console.print(Panel("[text.muted]No classes or call relationships to analyze.[/text.muted]",
                                border_style="border"))

    def view_test_quality(self):
        if not self._require_analyzer():
            return
        tq = self.analyzer.info['test_quality']

        console.print(Panel(
            "[text.secondary]Estimated minimum tests = max(branches,1) + loops + exception paths.[/text.secondary]",
            title="[ TEST QUALITY ESTIMATION ]",
            border_style="border",
        ))

        if not tq:
            console.print(Panel("[text.muted]No functions found.[/text.muted]", border_style="border"))
            return

        table = Table(title="Test Adequacy", box=box.ROUNDED, border_style="border")
        table.add_column("Function", style="accent")
        table.add_column("Branches", justify="right")
        table.add_column("Loops", justify="right")
        table.add_column("Except", justify="right")
        table.add_column("Min Tests", justify="right", style="highlight")
        table.add_column("Effort", style="text.secondary")
        effort_style = {"low": "[success]low[/success]", "moderate": "[warning]moderate[/warning]",
                        "high": "[error]high[/error]"}
        for t in sorted(tq, key=lambda x: x['minimum_tests_needed'], reverse=True):
            table.add_row(t['name'], str(t['branches']), str(t['loops']), str(t['exceptions']),
                          str(t['minimum_tests_needed']), effort_style.get(t['status'], t['status']))
        console.print(table)

    def view_version_requirements(self):
        if not self._require_analyzer():
            return
        info = self.analyzer.info['min_version']
        mv = info['min_version']
        version_str = f"{mv[0]}.{mv[1]}"

        console.print(Panel(
            f"[highlight]Minimum Python version required: {version_str}+[/highlight]",
            title="[ PYTHON VERSION REQUIREMENTS ]",
            border_style="border",
        ))

        reasons = info['reasons']
        if not reasons:
            console.print(Panel("[text.muted]No version-specific features detected (broadly compatible).[/text.muted]",
                                border_style="border"))
            return

        table = Table(title="Version-Gating Features", box=box.ROUNDED, border_style="border")
        table.add_column("Requires", style="accent")
        table.add_column("Feature", style="text.primary")
        table.add_column("Line", style="text.muted", justify="right")
        seen = set()
        for r in sorted(reasons, key=lambda x: x['version'], reverse=True):
            key = (r['version'], r['feature'])
            if key in seen:
                continue
            seen.add(key)
            ver = f"{r['version'][0]}.{r['version'][1]}+"
            table.add_row(ver, r['feature'], str(r['line']))
        console.print(table)

    def view_concept_cards(self):
        if not self._require_analyzer():
            return
        cards = self.analyzer.info['concept_cards']

        console.print(Panel(
            f"[text.secondary]{len(cards)} concept(s) detected in this code — learn what they are.[/text.secondary]",
            title="[ CONCEPT CARDS ]",
            border_style="border",
        ))

        if not cards:
            console.print(Panel("[text.muted]No notable Python concepts detected.[/text.muted]",
                                border_style="border"))
            return

        title_map = {
            "decorators": "Decorators", "list_comprehensions": "List Comprehensions",
            "generators": "Generators", "context_managers": "Context Managers",
            "async_programming": "Async / Await", "type_annotations": "Type Annotations",
            "dataclasses": "Dataclasses", "exception_handling": "Exception Handling",
        }
        for card in cards:
            body = (
                f"[accent]What:[/accent]  {card['what']}\n"
                f"[accent]Why:[/accent]   {card['why']}\n"
                f"[accent]How:[/accent]   {card['how']}\n"
                f"[warning]Watch out:[/warning] {card['common_mistakes']}\n"
                f"[success]Practice:[/success]  {card['practice']}"
            )
            console.print(Panel(body, title=f"[ {title_map.get(card['concept'], card['concept'])} ]",
                                border_style="border"))

    # --- All original views from ast_pp.py (unchanged) ---

    def explore_classes(self):
        if not self._require_analyzer():
            return
        classes = self.analyzer.info['classes']
        if not classes:
            console.print("[warning]No classes found.[/warning]")
            return
        for i, cls in enumerate(classes, 1):
            details = [
                f"[accent]Line Range:[/accent] {cls['line']} - {cls['end_line']}",
                f"[accent]Bases:[/accent] {', '.join(cls['bases']) if cls['bases'] else 'object (implicit)'}",
                f"[accent]Role:[/accent] {cls['role'].capitalize()}",
            ]
            if cls['decorators']:
                details.append(f"[accent]Decorators:[/accent] {', '.join(cls['decorators'])}")
            if cls['docstring']:
                details.append(f"[accent]Docstring:[/accent]\n  [text.secondary]{cls['docstring']}[/text.secondary]")
            class_vars = [f"{v['name']} = {v['value']}" for v in cls['class_vars']]
            details.append(f"[accent]Class Variables:[/accent] {', '.join(class_vars) or 'None'}")
            instance_vars = [f"self.{v['name']}" for v in cls['instance_vars']]
            details.append(f"[accent]Instance Variables:[/accent] {', '.join(instance_vars) or 'None'}")
            methods = [f"{m['name']}()" for m in cls['methods']]
            details.append(f"[accent]Methods:[/accent] {', '.join(methods) or 'None'}")
            console.print(Panel("\n".join(details), title=f"[ Class {i}: {cls['name']} ]", border_style="border"))

    def view_imports(self):
        if not self._require_analyzer():
            return
        imports = self.analyzer.info['imports']
        if not imports:
            console.print("[warning]No imports found.[/warning]")
            return
        table = Table(title="Import Statements", box=box.ROUNDED, border_style="border")
        table.add_column("Type", style="accent")
        table.add_column("Source Module", style="text.primary")
        table.add_column("Imported Name / Alias", style="highlight")
        table.add_column("Line", style="text.secondary")
        table.add_column("Status", style="text.secondary")
        for imp in imports:
            name_to_check = imp['alias'] or imp['name'] or imp['module']
            is_unused = name_to_check not in self.analyzer.visitor.used_names
            status = "[warning]Unused[/warning]" if is_unused else "[success]Active[/success]"
            import_name = imp['name'] if imp['name'] else "*"
            alias_str = f" as {imp['alias']}" if imp['alias'] and imp['alias'] != imp['name'] else ""
            table.add_row(imp['type'], imp['module'], f"{import_name}{alias_str}", str(imp['line']), status)
        console.print(table)

    def view_variables(self):
        if not self._require_analyzer():
            return
        variables = self.analyzer.info['variables']
        if not variables:
            console.print("[warning]No variables found.[/warning]")
            return
        table = Table(title="Variables Dictionary", box=box.ROUNDED, border_style="border")
        table.add_column("Name", style="highlight")
        table.add_column("Scope Type", style="accent")
        table.add_column("Scope Name", style="text.secondary")
        table.add_column("Type Annotation", style="text.secondary")
        table.add_column("Value", style="text.primary")
        table.add_column("Line", style="text.muted")
        for var in variables:
            table.add_row(var['name'], var['type'].capitalize(), var['scope'],
                          var['annotation'] or "None", var['value'], str(var['line']))
        console.print(table)

    def view_control_flow(self):
        if not self._require_analyzer():
            return
        cf_table = Table(title="Control Flow Structures", box=box.ROUNDED, border_style="border")
        cf_table.add_column("Line", style="text.muted")
        cf_table.add_column("Construct", style="accent")
        cf_table.add_column("Description", style="text.primary")
        for cf in self.analyzer.info['control_flow']:
            cf_table.add_row(str(cf['line']), cf['type'], cf['description'])
        exp_table = Table(title="Advanced Expressions", box=box.ROUNDED, border_style="border")
        exp_table.add_column("Line", style="text.muted")
        exp_table.add_column("Type", style="accent")
        exp_table.add_column("Code Segment", style="text.primary")
        for exp in self.analyzer.info['expressions']:
            exp_table.add_row(str(exp['line']), exp['type'], exp['description'])
        console.print(cf_table)
        console.print()
        console.print(exp_table)

    def view_call_graph(self):
        if not self._require_analyzer():
            return
        call_graph = self.analyzer.info['call_graph']
        if not call_graph:
            console.print("[warning]No caller-callee relationships detected.[/warning]")
            return
        from collections import defaultdict
        caller_map = defaultdict(list)
        for call in call_graph:
            call_key = (call['callee'], call['line'])
            if call_key not in caller_map[call['caller']]:
                caller_map[call['caller']].append(call_key)
        tree = Tree("[bold title]Module Execution Call Tree[/bold title]", guide_style="border")
        all_callees = {call['callee'] for call in call_graph}
        entry_points = [c for c in caller_map if c not in all_callees] or list(caller_map.keys())
        visited = set()

        def add_calls(node_tree, caller_name):
            if caller_name in visited:
                node_tree.add(f"[text.muted]{caller_name} (recursive)[/text.muted]")
                return
            visited.add(caller_name)
            for callee, line in caller_map[caller_name]:
                disp = f"[highlight]{callee}()[/highlight]" if callee else "anonymous"
                sub = node_tree.add(f"{disp} [text.muted](line {line})[/text.muted]")
                if callee in caller_map:
                    add_calls(sub, callee)
            visited.remove(caller_name)

        for ep in entry_points:
            root = tree.add(f"[bold highlight]{ep}()[/bold highlight]")
            add_calls(root, ep)
        console.print(Panel(tree, title="[ CALL GRAPH ]", border_style="border"))

    def view_anti_patterns(self):
        if not self._require_analyzer():
            return
        anti_patterns = self.analyzer.info['anti_patterns']
        if anti_patterns:
            for ap in anti_patterns:
                ap_type = ap['type'].replace('_', ' ').capitalize()
                console.print(Panel(
                    f"[text.primary]{ap['message']}[/text.primary]\n"
                    f"[text.muted]Line: {ap['line']} | Type: {ap_type}[/text.muted]\n\n"
                    f"[text.secondary][bold]Educational Note:[/bold] "
                    f"{self._get_anti_pattern_explanation(ap['type'])}[/text.secondary]",
                    title=f"[ Warning: {ap_type} ]",
                    border_style="border",
                ))
        else:
            console.print(Panel(
                "[success]No critical anti-patterns detected![/success]",
                border_style="border",
            ))

    def _get_anti_pattern_explanation(self, ap_type: str) -> str:
        explanations = {
            'mutable_default': "Mutable defaults (like `[]` or `{}`) are evaluated once at definition. Use `default=None` and set inside the function.",
            'bare_except': "A bare `except:` catches ALL exceptions including KeyboardInterrupt. Catch specific exceptions instead.",
            'shadow_builtin': "Shadowing built-in names (like `str`, `list`) hides the original. Use alternative names.",
            'none_comparison': "Use `is None` / `is not None` for identity checks, not `==` / `!=`.",
            'global_keyword': "Modifying globals creates hidden side effects. Return values instead.",
            'unused_import': "Unused imports waste memory and clutter the namespace. Remove them.",
            'deprecated_module': "This module is deprecated or removed in a recent Python version. Migrate to the suggested replacement.",
        }
        return explanations.get(ap_type, "Follow Python PEP 8 guidelines.")

    def export_report(self):
        if not self._require_analyzer():
            return
        filename = Prompt.ask("Enter output filename", default="ast_analysis_report.md")
        metrics = self.analyzer.metrics
        hal = metrics['halstead']
        report = []
        report.append("# AST Python Protocol v2.0 — Code Analysis Report")
        report.append("\n## Quality & Complexity Dashboard")
        report.append(f"- **Physical LOC:** {metrics['physical_loc']}")
        report.append(f"- **Logical LOC:** {metrics['code_lines']}")
        report.append(f"- **Comment Density:** {metrics['comment_density']:.1f}%")
        report.append(f"- **Avg Cyclomatic Complexity:** {metrics['avg_cc']:.2f}")
        avg_cog = (
            sum(f['cognitive_complexity'] for f in self.analyzer.info['functions']) /
            len(self.analyzer.info['functions'])
        ) if self.analyzer.info['functions'] else 0
        report.append(f"- **Avg Cognitive Complexity:** {avg_cog:.1f}")
        report.append(f"- **Maintainability Index:** {metrics['maintainability_index']:.2f} ({metrics['mi_grade']})")
        report.append(f"- **Security Score:** {metrics['security_score']}/100")
        report.append(f"- **Developer Skill Level:** {self.analyzer.skill_level}")
        report.append(f"- **Concepts:** {', '.join(self.analyzer.concept_tags) or 'None'}")
        report.append("\n### Halstead Metrics")
        report.append(f"- Vocabulary: {hal['vocabulary']}, Volume: {hal['volume']:.2f}, Effort: {hal['effort']:.2f}")
        report.append("\n## Functions")
        for f in self.analyzer.info['functions']:
            scope = f"class `{f['class']}`" if f['class'] else "global"
            report.append(f"### `{f['name']}()` (Lines {f['line']}-{f['end_line']})")
            report.append(f"- Scope: {scope} | Role: {f['role']} | CC: {f['complexity']} | Cognitive CC: {f['cognitive_complexity']}")
        report.append("\n## Anti-patterns")
        for ap in self.analyzer.info['anti_patterns']:
            report.append(f"- Line {ap['line']}: **{ap['type']}** — {ap['message']}")
        report.append("\n## Security Findings")
        for f in self.analyzer.info['security_findings']:
            report.append(f"- [{f.severity}] {f.rule_id} (Line {f.lineno}): {f.message}")
        report.append("\n## Dead Code")
        for d in self.analyzer.info['dead_code']:
            report.append(f"- {d['type']}: {d['message']}")
        report.append("\n## Modernization Hints")
        for h in self.analyzer.info['modernization_hints']:
            report.append(f"- Line {h.get('line', '?')}: {h['message']}")
        try:
            with open(filename, 'w') as f:
                f.write("\n".join(report))
            console.print(f"\n[success]Report exported to {filename}![/success]")
        except Exception as e:
            console.print(f"[error]Failed to export: {e}[/error]")

    def full_analysis(self):
        if not self._require_analyzer():
            return
        console.print("\n[highlight]Full Code Analysis[/highlight]")
        syntax = Syntax(self.source_code, "python", theme="monokai", line_numbers=True)
        console.print(syntax)
        self.view_summary()
        self.explore_functions()
        self.explore_classes()
        self.view_call_graph()
        self.view_anti_patterns()
        self.view_security_lens()
        self.view_dead_code()
        self.view_modernization()
        self.view_coupling()
        self.view_test_quality()
        self.view_version_requirements()
        self.view_concept_cards()

    def view_source_code(self):
        if not self._require_analyzer():
            return
        console.print(f"\n[highlight]Source Code ({len(self.source_code.splitlines())} lines)[/highlight]")
        syntax = Syntax(self.source_code, "python", theme="monokai", line_numbers=True)
        console.print(Panel(syntax, border_style="border"))

    def view_architecture_lens(self):
        if not self._require_analyzer():
            return
        info = self.analyzer.info
        metrics = self.analyzer.metrics
        while True:
            menu_text = (
                "[menu.num][1][/menu.num] Module Viewtype\n"
                "[menu.num][2][/menu.num] Component-and-Connector Viewtype\n"
                "[menu.num][3][/menu.num] Allocation Viewtype\n"
                "[menu.num][4][/menu.num] Control- & Data-Flow Lens\n"
                "[menu.num][5][/menu.num] Dependency-Inversion & Coupling\n"
                "[menu.num][6][/menu.num] Pythonic Pattern Lens\n"
                "[menu.num][7][/menu.num] Step-by-Step Workflow\n"
                "[menu.num][0][/menu.num] Return"
            )
            console.print(Panel(menu_text, title="[ ARCHITECTURE LENSES ]", border_style="border"))
            choice = Prompt.ask("Select lens", choices=["0", "1", "2", "3", "4", "5", "6", "7"])
            if choice == "0":
                break
            elif choice == "1":
                self._show_module_lens(info)
            elif choice == "2":
                self._show_cc_lens(info)
            elif choice == "3":
                self._show_allocation_lens(info)
            elif choice == "4":
                self._show_flow_lens(info)
            elif choice == "5":
                self._show_dip_lens(info, metrics)
            elif choice == "6":
                self._show_pythonic_lens(info)
            elif choice == "7":
                self._show_workflow_lens()
            Prompt.ask("\n[Press Enter to continue]")

    def _show_module_lens(self, info):
        imports = info['imports']
        std_imports = [i['module'] for i in imports
                       if i['module'].split('.')[0] in
                       ('sys', 'os', 'math', 'json', 'ast', 'io', 'tokenize', 'collections',
                        'typing', 'datetime', 'time', 'abc')]
        ext_imports = [i['module'] for i in imports if i['module'].split('.')[0] not in
                       ('sys', 'os', 'math', 'json', 'ast', 'io', 'tokenize', 'collections',
                        'typing', 'datetime', 'time', 'abc')]
        content = (
            f"[bold highlight]Script Analysis:[/bold highlight]\n"
            f"• [accent]Classes:[/accent] {len(info['classes'])} | [accent]Functions:[/accent] {len(info['functions'])}\n"
            f"• [accent]Standard Imports:[/accent] {', '.join(set(std_imports)) or 'None'}\n"
            f"• [accent]External Dependencies:[/accent] {', '.join(set(ext_imports)) or 'None'}"
        )
        console.print(Panel(content, title="[ LENS 1: MODULE VIEWTYPE ]", border_style="border"))

    def _show_cc_lens(self, info):
        content = (
            f"[bold highlight]Script Analysis:[/bold highlight]\n"
            f"• [accent]Main Entry Block:[/accent] {'Found' if info['has_main_block'] else 'Not Found'}\n"
            f"• [accent]Concurrency Libraries:[/accent] {', '.join(info['concurrency_libraries']) or 'None'}\n"
            f"• [accent]Recursion:[/accent] {', '.join(info['recursion_detected']) or 'None'}\n"
            f"• [accent]Call Links:[/accent] {len(info['call_graph'])}"
        )
        console.print(Panel(content, title="[ LENS 2: COMPONENT-AND-CONNECTOR ]", border_style="border"))

    def _show_allocation_lens(self, info):
        env = [a['call'] for a in info['env_accesses']]
        content = (
            f"• [accent]Env Var Access:[/accent] {', '.join(set(env)) or 'None detected'}\n"
            f"• [accent]Hardcoded Paths:[/accent] {len(info['hardcoded_paths'])} detected"
        )
        console.print(Panel(content, title="[ LENS 3: ALLOCATION VIEWTYPE ]", border_style="border"))

    def _show_flow_lens(self, info):
        generators = [f['name'] for f in info['functions'] if f['has_yield']]
        decorators_list = [d for f in info['functions'] for d in f['decorators']]
        with_count = sum(1 for cf in info['control_flow'] if cf['type'] == 'With')
        content = (
            f"• [accent]Generator Yields:[/accent] {', '.join(generators) or 'None'}\n"
            f"• [accent]Context Managers:[/accent] {with_count}\n"
            f"• [accent]Decorators:[/accent] {', '.join(set(decorators_list)) or 'None'}"
        )
        console.print(Panel(content, title="[ LENS 4: CONTROL- & DATA-FLOW ]", border_style="border"))

    def _show_dip_lens(self, info, metrics):
        paths = [p['path'] for p in info['hardcoded_paths']]
        abc = [c['name'] for c in info['abc_classes']]
        coupling = len(info['imports']) + len(info['hardcoded_paths'])
        rating = "High" if coupling > 8 else ("Medium" if coupling >= 3 else "Low")
        content = (
            f"• [accent]Hardcoded Paths:[/accent] {', '.join(set(paths)) or 'None'}\n"
            f"• [accent]Abstract Interfaces (ABC):[/accent] {', '.join(abc) or 'None'}\n"
            f"• [accent]Coupling Index:[/accent] {coupling} | {rating}"
        )
        console.print(Panel(content, title="[ LENS 5: DEPENDENCY-INVERSION & COUPLING ]", border_style="border"))

    def _show_pythonic_lens(self, info):
        try_count = sum(1 for cf in info['control_flow'] if cf['type'] == 'Try')
        dunders = [f"{d['class']}.{d['name']}" if d['class'] else d['name'] for d in info['dunder_methods']]
        content = (
            f"• [accent]EAFP try/except blocks:[/accent] {try_count}\n"
            f"• [accent]Dunder Methods:[/accent] {', '.join(dunders) or 'None'}"
        )
        console.print(Panel(content, title="[ LENS 6: PYTHONIC PATTERN LENS ]", border_style="border"))

    def _show_workflow_lens(self):
        workflow = (
            "[bold highlight]Apply lenses in this order:[/bold highlight]\n\n"
            "1. Allocation + Module View → Map file tree and dependencies\n"
            "2. C&C View → Identify entry point and execution flow\n"
            "3. Data & Control Flow → Trace data transformations\n"
            "4. Coupling / Pythonic → Evaluate abstractions and design patterns"
        )
        console.print(Panel(workflow, title="[ STEP-BY-STEP WORKFLOW ]", border_style="border"))

    def run(self):
        self.display_banner()

        if len(sys.argv) > 1:
            file_path = sys.argv[1]
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    code = f.read()
                self.source_code = code
                self.analyzer = ASTAnalyzer(code)
                self.analyzer.analyze()
                console.print(f"\n[success]Loaded and analyzed '{file_path}'[/success]\n")
            except Exception as e:
                console.print(f"\n[error]Failed to load '{file_path}': {e}[/error]\n")

        choices = [str(i) for i in range(21)]
        while True:
            self.display_menu()
            choice = Prompt.ask("\nSelect option", choices=choices)
            if choice == "0":
                console.print("\n[highlight]Goodbye![/highlight]")
                break
            elif choice == "1":
                self.upload_code()
            elif choice == "2":
                self.view_summary()
            elif choice == "3":
                self.explore_functions()
            elif choice == "4":
                self.explore_classes()
            elif choice == "5":
                self.view_imports()
            elif choice == "6":
                self.view_variables()
            elif choice == "7":
                self.view_control_flow()
            elif choice == "8":
                self.view_call_graph()
            elif choice == "9":
                self.view_anti_patterns()
            elif choice == "10":
                self.export_report()
            elif choice == "11":
                self.full_analysis()
            elif choice == "12":
                self.view_source_code()
            elif choice == "13":
                self.view_architecture_lens()
            elif choice == "14":
                self.view_security_lens()
            elif choice == "15":
                self.view_dead_code()
            elif choice == "16":
                self.view_modernization()
            elif choice == "17":
                self.view_coupling()
            elif choice == "18":
                self.view_test_quality()
            elif choice == "19":
                self.view_version_requirements()
            elif choice == "20":
                self.view_concept_cards()
            if choice != "0":
                Prompt.ask("\n[Press Enter to continue]")


if __name__ == "__main__":
    tui = ASTProtocolTUI()
    tui.run()
