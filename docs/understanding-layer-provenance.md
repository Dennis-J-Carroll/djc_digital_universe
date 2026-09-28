# Understanding Layer source and claim ledger

## Source

- Upstream: [MIRAGE-Bench misleading SWE-bench case](https://github.com/sunblaze-ucb/mirage-bench/blob/46856eb1c0f84fe8456756d8fb63b3bf98243f5d/dataset_all/misleading/swebench/misleading_swebench.sympy__sympy-22914_SWE-agent-gpt-4.1.json)
- Commit: `46856eb1c0f84fe8456756d8fb63b3bf98243f5d`
- SHA-256: `3c72694c3ffe0c209ebc4a23faf2020ea0b45a2243e8794dd6bf3ebc56f3999d`
- License: [Apache-2.0](https://github.com/sunblaze-ucb/mirage-bench/blob/main/LICENSE)
- Included license text: `data/understanding-layer/LICENSE`
- Local pinned copy: `data/understanding-layer/mirage-source.json`
- Regenerate: `node scripts/generate-understanding-layer-data.mjs`

Generator omits source `input[0]` system prompt. Remaining `input[1]` through `input[46]` map to displayed `e0` through `e45`. Every displayed text part comes from full source, with CRLF normalized to LF. Assistant events display source `content` and one recorded tool call. Each tool result links to directly preceding matching call ID. No other causal link is inferred from chronological adjacency.

Generated browser data holds each full text part once. Preview text is sliced at render time, keeping the static payload smaller without losing evidence.

## Claim ledger

| Claim | Evidence | Limit |
| --- | --- | --- |
| Task 1 TimeDelta reproduction returned 344, then 345 after edit | e0, e6, e17, e18 | Single script result does not prove full test-suite success. |
| Task 1 submitted patch after reproduction rerun | e17–e22 | e22 is tool result, not independent quality judgment. |
| Task 2 starts after Task 1 submission | e22, e23 | e23 is new user task, not a causal child of e22. |
| Task 2 Min and Max print conditional expressions in captured environment | e23, e29, e33 | Issue text describes unsupported-function output; code or environment may differ. |
| Task 2 excerpt ends before edit or submission | e45 | No later agent continuation or judge result exists in pinned source. |
| First edit and `find_file` explicitly fail | e14, e35 | Warnings in successful responses are not tool failures. |
| Case supplies misleading explanation and reference patch | Top-level `misleading_reasoning` and `goal` fields | Benchmark setup, not observed agent acceptance or scored hallucination. |
| MCP fabricated-call status unknown/not applicable | No MCP `tools/list` surface in source | Never convert absent declaration to a zero count. |

## Glassport example

Companion sequence is synthetic and test-backed by [Glassport declared-surface tests](https://github.com/Dennis-J-Carroll/glassport/blob/main/tests/test_declared_surface.py). Call before `tools/list` response has unknown declared surface. Call after observed empty declaration is outside that known surface. Example does not claim Glassport analyzed MIRAGE's SWE-agent transcript.

## Reviewer choices

`isError` marks e14 (explicit edit rejection) and e35 (explicit missing directory). Event e16 reports replacement plus review advice, so it is not a failure. e12 and e45 are source views. Review annotations cite supporting event IDs and distinguish benchmark setup from observations. Retry grouping requires immediate same-tool retry after an explicit failed result.
