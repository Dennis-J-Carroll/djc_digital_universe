#!/usr/bin/env python3
"""
TDD tests for ast_v2.py - Enhanced AST Python Protocol
Tests written BEFORE implementation (Red phase).
"""

import ast
import sys
import os
from textwrap import dedent

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import pytest
from ast_v2 import (
    ASTAnalyzer,
    CognitiveComplexityVisitor,
    SecurityVisitor,
    DeadCodeDetector,
    ModernizationChecker,
    DEPRECATED_MODULES,
    CouplingCohesionAnalyzer,
    TestQualityEstimator,
    VersionDetector,
    ConceptDetector,
)


def parse_class(code: str, index: int = 0) -> ast.ClassDef:
    tree = ast.parse(dedent(code))
    classes = [n for n in tree.body if isinstance(n, ast.ClassDef)]
    return classes[index]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def parse_func(code: str, index: int = 0) -> ast.FunctionDef:
    """Return the nth top-level FunctionDef from parsed code."""
    tree = ast.parse(dedent(code))
    funcs = [n for n in tree.body if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))]
    return funcs[index]


def analyze(code: str) -> ASTAnalyzer:
    analyzer = ASTAnalyzer(dedent(code))
    analyzer.analyze()
    return analyzer


# ===========================================================================
# Section 1: CognitiveComplexityVisitor
# ===========================================================================

class TestCognitiveComplexity:
    """Tests for Section 4.2 - Cognitive Complexity."""

    def test_simple_return_is_zero(self):
        code = "def foo(): return 1"
        func = parse_func(code)
        assert CognitiveComplexityVisitor.compute_for_function(func) == 0

    def test_single_if_adds_one(self):
        code = """
        def foo(x):
            if x > 0:
                return x
            return 0
        """
        func = parse_func(code)
        assert CognitiveComplexityVisitor.compute_for_function(func) == 1

    def test_nested_if_in_for_adds_nesting_penalty(self):
        # for at depth 0 → +1; if inside for at depth 1 → +1+1=2; total = 3
        code = """
        def foo(items):
            for x in items:
                if x > 0:
                    return x
        """
        func = parse_func(code)
        assert CognitiveComplexityVisitor.compute_for_function(func) == 3

    def test_boolop_adds_one(self):
        # if: +1, `and`: +1 → total 2
        code = """
        def foo(x, y):
            if x > 0 and y > 0:
                return True
        """
        func = parse_func(code)
        assert CognitiveComplexityVisitor.compute_for_function(func) == 2

    def test_while_loop_adds_one(self):
        code = """
        def foo(n):
            while n > 0:
                n -= 1
        """
        func = parse_func(code)
        assert CognitiveComplexityVisitor.compute_for_function(func) == 1

    def test_double_nesting_adds_escalating_penalty(self):
        # while at depth 0: +1; for inside while depth 1: +1+1=2; if inside for depth 2: +1+2=3
        # total = 1 + 2 + 3 = 6
        code = """
        def foo(data):
            while True:
                for x in data:
                    if x > 0:
                        break
        """
        func = parse_func(code)
        assert CognitiveComplexityVisitor.compute_for_function(func) == 6

    def test_sequential_ifs_no_nesting_penalty(self):
        # Three sequential ifs at depth 0 → 3 × 1 = 3
        code = """
        def foo(a, b, c):
            if a:
                pass
            if b:
                pass
            if c:
                pass
        """
        func = parse_func(code)
        assert CognitiveComplexityVisitor.compute_for_function(func) == 3

    def test_analyzer_stores_cognitive_complexity_per_function(self):
        code = """
        def simple(): return 1

        def complex_fn(items):
            for x in items:
                if x > 0:
                    return x
        """
        a = analyze(code)
        ccs = {f['name']: f['cognitive_complexity'] for f in a.info['functions']}
        assert ccs['simple'] == 0
        assert ccs['complex_fn'] == 3


# ===========================================================================
# Section 2: SecurityVisitor
# ===========================================================================

class TestSecurityVisitor:
    """Tests for Section 5.2 - Security Vulnerability Scanner."""

    def scan(self, code: str):
        source = dedent(code)
        tree = ast.parse(source)
        v = SecurityVisitor(source)
        v.visit(tree)
        return v.findings

    def finding_ids(self, code: str):
        return {f.rule_id for f in self.scan(code)}

    # SEC-001: eval/exec with non-literal
    def test_eval_with_variable_is_sec001(self):
        ids = self.finding_ids("eval(user_input)")
        assert "SEC-001" in ids

    def test_eval_with_literal_is_safe(self):
        ids = self.finding_ids("eval('1+1')")
        assert "SEC-001" not in ids

    def test_exec_with_variable_is_sec001(self):
        ids = self.finding_ids("exec(user_code)")
        assert "SEC-001" in ids

    # SEC-002: shell=True in subprocess
    def test_subprocess_shell_true_is_sec002(self):
        code = "import subprocess\nsubprocess.call(cmd, shell=True)"
        ids = self.finding_ids(code)
        assert "SEC-002" in ids

    def test_subprocess_shell_false_is_safe(self):
        code = "import subprocess\nsubprocess.call(['ls'], shell=False)"
        ids = self.finding_ids(code)
        assert "SEC-002" not in ids

    # SEC-003: pickle.loads / yaml.unsafe_load
    def test_pickle_loads_is_sec003(self):
        code = "import pickle\npickle.loads(data)"
        ids = self.finding_ids(code)
        assert "SEC-003" in ids

    def test_yaml_unsafe_load_is_sec003(self):
        code = "import yaml\nyaml.unsafe_load(stream)"
        ids = self.finding_ids(code)
        assert "SEC-003" in ids

    # SEC-004: weak crypto (md5, sha1)
    def test_hashlib_md5_is_sec004(self):
        code = "import hashlib\nhashlib.md5(data)"
        ids = self.finding_ids(code)
        assert "SEC-004" in ids

    def test_hashlib_sha1_is_sec004(self):
        code = "import hashlib\nhashlib.sha1(data)"
        ids = self.finding_ids(code)
        assert "SEC-004" in ids

    # SEC-007: SQL injection via f-string in assignment named 'query'/'sql'
    def test_fstring_in_sql_query_is_sec007(self):
        code = 'query = f"SELECT * FROM users WHERE id = {user_id}"'
        ids = self.finding_ids(code)
        assert "SEC-007" in ids

    # SEC-009: Flask debug mode
    def test_flask_debug_true_is_sec009(self):
        code = "app.run(debug=True)"
        ids = self.finding_ids(code)
        assert "SEC-009" in ids

    def test_flask_debug_false_is_safe(self):
        code = "app.run(debug=False)"
        ids = self.finding_ids(code)
        assert "SEC-009" not in ids

    def test_security_findings_in_analyzer(self):
        code = "eval(user_input)\npickle.loads(data)"
        a = analyze(code)
        ids = {f.rule_id for f in a.info['security_findings']}
        assert "SEC-001" in ids
        assert "SEC-003" in ids


# ===========================================================================
# Section 3: Deprecated Module Detection
# ===========================================================================

class TestDeprecatedModules:
    """Tests for Section 6.2 - Python 3.13 Deprecated Module Detection."""

    def test_cgi_is_in_deprecated_list(self):
        assert "cgi" in DEPRECATED_MODULES

    def test_imp_is_in_deprecated_list(self):
        assert "imp" in DEPRECATED_MODULES

    def test_smtpd_is_in_deprecated_list(self):
        assert "smtpd" in DEPRECATED_MODULES

    def test_cgi_import_creates_deprecation_antipattern(self):
        code = "import cgi"
        a = analyze(code)
        types = [ap['type'] for ap in a.info['anti_patterns']]
        assert 'deprecated_module' in types

    def test_imp_import_creates_deprecation_antipattern(self):
        code = "import imp"
        a = analyze(code)
        types = [ap['type'] for ap in a.info['anti_patterns']]
        assert 'deprecated_module' in types

    def test_safe_module_no_deprecation_warning(self):
        code = "import os"
        a = analyze(code)
        types = [ap['type'] for ap in a.info['anti_patterns']]
        assert 'deprecated_module' not in types


# ===========================================================================
# Section 4: DeadCodeDetector
# ===========================================================================

class TestDeadCodeDetector:
    """Tests for Section 4.3 - Dead Code Detection."""

    def test_unreachable_after_return(self):
        code = """
        def foo():
            return 1
            x = 2
        """
        a = analyze(code)
        dead = a.info['dead_code']
        unreachable_lines = [d['line'] for d in dead if d['type'] == 'unreachable']
        assert len(unreachable_lines) > 0

    def test_unreachable_after_raise(self):
        code = """
        def foo():
            raise ValueError("bad")
            return 1
        """
        a = analyze(code)
        dead = a.info['dead_code']
        unreachable_lines = [d['line'] for d in dead if d['type'] == 'unreachable']
        assert len(unreachable_lines) > 0

    def test_reachable_code_not_flagged(self):
        code = """
        def foo(x):
            if x:
                return 1
            return 0
        """
        a = analyze(code)
        dead = a.info['dead_code']
        unreachable = [d for d in dead if d['type'] == 'unreachable']
        assert len(unreachable) == 0

    def test_unused_function_detected(self):
        code = """
        def helper():
            pass

        def main():
            pass

        main()
        """
        a = analyze(code)
        dead = a.info['dead_code']
        unused_names = [d['name'] for d in dead if d['type'] == 'unused_function']
        assert 'helper' in unused_names

    def test_used_function_not_flagged_as_unused(self):
        code = """
        def helper():
            return 1

        result = helper()
        """
        a = analyze(code)
        dead = a.info['dead_code']
        unused_names = [d['name'] for d in dead if d['type'] == 'unused_function']
        assert 'helper' not in unused_names

    def test_magic_methods_not_flagged(self):
        code = """
        class Foo:
            def __init__(self): pass
            def __str__(self): return "Foo"
        """
        a = analyze(code)
        dead = a.info['dead_code']
        unused_names = [d['name'] for d in dead if d['type'] == 'unused_function']
        assert '__init__' not in unused_names
        assert '__str__' not in unused_names


# ===========================================================================
# Section 5: ModernizationChecker
# ===========================================================================

class TestModernizationChecker:
    """Tests for Section 6.3 - Modern Syntax Opportunity Detection."""

    def hints(self, code: str):
        return ModernizationChecker(dedent(code)).check()

    def hint_types(self, code: str):
        return {h['type'] for h in self.hints(code)}

    def test_format_string_suggests_fstring(self):
        code = 'result = "Hello, {}".format(name)'
        types = self.hint_types(code)
        assert 'use_fstring' in types

    def test_percent_format_suggests_fstring(self):
        code = 'result = "Hello, %s" % name'
        types = self.hint_types(code)
        assert 'use_fstring' in types

    def test_typing_list_suggests_builtin(self):
        code = "from typing import List\ndef foo(x: List[int]): pass"
        types = self.hint_types(code)
        assert 'use_builtin_generics' in types

    def test_typing_dict_suggests_builtin(self):
        code = "from typing import Dict\ndef foo(x: Dict[str, int]): pass"
        types = self.hint_types(code)
        assert 'use_builtin_generics' in types

    def test_elif_chain_suggests_match(self):
        code = """
        if status == 'a':
            pass
        elif status == 'b':
            pass
        elif status == 'c':
            pass
        """
        types = self.hint_types(code)
        assert 'use_match_case' in types

    def test_short_elif_chain_no_suggestion(self):
        code = """
        if status == 'a':
            pass
        elif status == 'b':
            pass
        """
        types = self.hint_types(code)
        assert 'use_match_case' not in types

    def test_modernization_hints_in_analyzer(self):
        code = 'result = "Hello, {}".format(name)'
        a = analyze(code)
        types = {h['type'] for h in a.info['modernization_hints']}
        assert 'use_fstring' in types


# ===========================================================================
# Section 6: Integration - ASTAnalyzer with new fields
# ===========================================================================

class TestAnalyzerIntegration:
    """Tests that ASTAnalyzer exposes all new analysis fields."""

    def test_info_has_security_findings_key(self):
        a = analyze("x = 1")
        assert 'security_findings' in a.info

    def test_info_has_dead_code_key(self):
        a = analyze("x = 1")
        assert 'dead_code' in a.info

    def test_info_has_modernization_hints_key(self):
        a = analyze("x = 1")
        assert 'modernization_hints' in a.info

    def test_functions_have_cognitive_complexity_field(self):
        code = "def foo(): return 1"
        a = analyze(code)
        assert 'cognitive_complexity' in a.info['functions'][0]

    def test_metrics_has_security_score(self):
        a = analyze("x = 1")
        assert 'security_score' in a.metrics

    def test_clean_code_has_perfect_security_score(self):
        a = analyze("def add(a, b): return a + b")
        assert a.metrics['security_score'] == 100

    def test_eval_lowers_security_score(self):
        a = analyze("eval(user_input)")
        assert a.metrics['security_score'] < 100


# ===========================================================================
# Section 7: SecurityVisitor — completing the 10-rule Quick-Win set
# ===========================================================================

class TestSecurityVisitorExtended:
    """SEC-005 insecure random, SEC-006 hardcoded secret, SEC-010 temp race."""

    def scan(self, code: str):
        source = dedent(code)
        v = SecurityVisitor(source)
        v.visit(ast.parse(source))
        return v.findings

    def ids(self, code: str):
        return {f.rule_id for f in self.scan(code)}

    # SEC-005: insecure random for security values
    def test_random_for_token_is_sec005(self):
        code = "import random\ntoken = random.randint(1000, 9999)"
        assert "SEC-005" in self.ids(code)

    def test_random_for_password_is_sec005(self):
        code = "import random\npassword = random.random()"
        assert "SEC-005" in self.ids(code)

    def test_random_for_plain_var_is_safe(self):
        code = "import random\nx = random.random()"
        assert "SEC-005" not in self.ids(code)

    # SEC-006: hardcoded secret
    def test_hardcoded_password_is_sec006(self):
        code = 'password = "hunter2supersecret"'
        assert "SEC-006" in self.ids(code)

    def test_hardcoded_api_key_is_sec006(self):
        code = 'api_key = "sk-abc123def456ghi789"'
        assert "SEC-006" in self.ids(code)

    def test_secret_from_call_is_safe(self):
        code = "password = get_password()"
        assert "SEC-006" not in self.ids(code)

    def test_nonsecret_name_is_safe(self):
        code = 'username = "alice"'
        assert "SEC-006" not in self.ids(code)

    # SEC-010: temp file race
    def test_mktemp_is_sec010(self):
        code = "import tempfile\npath = tempfile.mktemp()"
        assert "SEC-010" in self.ids(code)

    def test_mkstemp_is_safe(self):
        code = "import tempfile\nfd, path = tempfile.mkstemp()"
        assert "SEC-010" not in self.ids(code)


# ===========================================================================
# Section 8: CouplingCohesionAnalyzer (Section 4.5)
# ===========================================================================

class TestCouplingCohesion:

    def test_cohesive_class_lcom_zero(self):
        code = """
        class A:
            def __init__(self): self.x = 1
            def get(self): return self.x
            def inc(self): self.x += 1
        """
        cls = parse_class(code)
        assert CouplingCohesionAnalyzer.compute_lcom(cls) == 0

    def test_split_class_lcom_positive(self):
        code = """
        class B:
            def a(self): return self.x
            def b(self): return self.x
            def c(self): return self.y
            def d(self): return self.y
        """
        cls = parse_class(code)
        assert CouplingCohesionAnalyzer.compute_lcom(cls) >= 1

    def test_single_method_class_lcom_zero(self):
        code = """
        class C:
            def only(self): return 1
        """
        cls = parse_class(code)
        assert CouplingCohesionAnalyzer.compute_lcom(cls) == 0

    def test_methods_linked_by_mutual_call_are_cohesive(self):
        code = """
        class D:
            def a(self): return self.b()
            def b(self): return 1
        """
        cls = parse_class(code)
        assert CouplingCohesionAnalyzer.compute_lcom(cls) == 0

    def test_fan_out_counts_distinct_callees(self):
        code = """
        def helper(): pass
        def other(): pass
        def main():
            helper()
            helper()
            other()
        """
        a = analyze(code)
        funcs = {f['name']: f for f in a.info['coupling']['functions']}
        assert funcs['main']['fan_out'] == 2

    def test_fan_in_counts_distinct_callers(self):
        code = """
        def helper(): pass
        def main():
            helper()
        """
        a = analyze(code)
        funcs = {f['name']: f for f in a.info['coupling']['functions']}
        assert funcs['helper']['fan_in'] == 1

    def test_info_has_coupling_key(self):
        a = analyze("x = 1")
        assert 'coupling' in a.info


# ===========================================================================
# Section 9: TestQualityEstimator (Section 4.6)
# ===========================================================================

class TestTestQuality:

    def est(self, code: str):
        return TestQualityEstimator.estimate(parse_func(code))

    def test_simple_function_needs_one_test(self):
        assert self.est("def add(a, b): return a + b")['minimum_tests_needed'] == 1

    def test_branches_loops_exceptions_sum(self):
        code = """
        def f(x):
            if x > 0:
                for i in range(x):
                    pass
            try:
                g()
            except ValueError:
                pass
        """
        result = self.est(code)
        # max(branches=1,1) + loops=1 + exceptions=1 = 3
        assert result['minimum_tests_needed'] == 3

    def test_info_has_test_quality_key(self):
        a = analyze("def foo(): return 1")
        assert 'test_quality' in a.info

    def test_test_quality_lists_each_function(self):
        code = """
        def a(): return 1
        def b(): return 2
        """
        a = analyze(code)
        names = {t['name'] for t in a.info['test_quality']}
        assert names == {'a', 'b'}


# ===========================================================================
# Section 10: VersionDetector (Section 6.2 / 6.3)
# ===========================================================================

class TestVersionDetector:

    def detect(self, code: str):
        return VersionDetector(dedent(code)).detect()

    def test_fstring_requires_36(self):
        result = self.detect('x = f"{y}"')
        assert result['min_version'] >= (3, 6)

    def test_builtin_generics_requires_39(self):
        result = self.detect("def f(x: list[int]): pass")
        assert result['min_version'] >= (3, 9)

    def test_match_case_requires_310(self):
        code = """
        match x:
            case 1:
                pass
        """
        result = self.detect(code)
        assert result['min_version'] >= (3, 10)

    def test_walrus_requires_38(self):
        result = self.detect("if (n := 10) > 5: pass")
        assert result['min_version'] >= (3, 8)

    def test_plain_code_low_version(self):
        result = self.detect("def f(a, b): return a + b")
        assert result['min_version'] <= (3, 6)

    def test_reasons_are_reported(self):
        result = self.detect('x = f"{y}"')
        assert len(result['reasons']) > 0

    # Python 2-isms / modernization
    def test_has_key_flagged(self):
        hints = ModernizationChecker("if d.has_key('a'): pass").check()
        assert any(h['type'] == 'py2_has_key' for h in hints)

    def test_ospath_join_suggests_pathlib(self):
        code = "import os\np = os.path.join(a, b)"
        hints = ModernizationChecker(code).check()
        assert any(h['type'] == 'use_pathlib' for h in hints)

    def test_walrus_opportunity_detected(self):
        code = """
        if len(data) > 0:
            return len(data)
        """
        hints = ModernizationChecker(dedent(code)).check()
        assert any(h['type'] == 'use_walrus' for h in hints)

    def test_info_has_min_version_key(self):
        a = analyze("x = 1")
        assert 'min_version' in a.info


# ===========================================================================
# Section 11: ConceptDetector (Section 3.3)
# ===========================================================================

class TestConceptDetector:

    def concepts(self, code: str):
        cards = ConceptDetector(dedent(code)).detect()
        return {c['concept'] for c in cards}

    def test_decorator_detected(self):
        code = """
        @my_decorator
        def foo(): pass
        """
        assert 'decorators' in self.concepts(code)

    def test_list_comprehension_detected(self):
        assert 'list_comprehensions' in self.concepts("x = [i*2 for i in items]")

    def test_generator_detected(self):
        code = """
        def gen():
            yield 1
        """
        assert 'generators' in self.concepts(code)

    def test_context_manager_detected(self):
        code = """
        with open('f') as fh:
            pass
        """
        assert 'context_managers' in self.concepts(code)

    def test_async_detected(self):
        code = """
        async def fetch():
            pass
        """
        assert 'async_programming' in self.concepts(code)

    def test_dataclass_detected(self):
        code = """
        @dataclass
        class Point:
            x: int
        """
        assert 'dataclasses' in self.concepts(code)

    def test_card_has_pedagogical_fields(self):
        cards = ConceptDetector("x = [i for i in items]").detect()
        card = next(c for c in cards if c['concept'] == 'list_comprehensions')
        for field in ('what', 'why', 'how', 'common_mistakes', 'practice'):
            assert field in card and card[field]

    def test_no_concepts_in_plain_code(self):
        assert self.concepts("x = 1 + 2") == set()

    def test_info_has_concept_cards_key(self):
        a = analyze("x = 1")
        assert 'concept_cards' in a.info


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
