// Rebuild the static viewer data from the pinned public MIRAGE-Bench record.
// Run: node scripts/generate-understanding-layer-data.mjs
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = join(root, 'data/understanding-layer/mirage-source.json');
const outputPath = join(root, 'static/apps/understanding-layer.data.js');
const sourceCommit = '46856eb1c0f84fe8456756d8fb63b3bf98243f5d';
const sourceSha256 = '3c72694c3ffe0c209ebc4a23faf2020ea0b45a2243e8794dd6bf3ebc56f3999d';
const sourceUrl = 'https://github.com/sunblaze-ucb/mirage-bench/blob/' + sourceCommit +
  '/dataset_all/misleading/swebench/misleading_swebench.sympy__sympy-22914_SWE-agent-gpt-4.1.json';

const sourceBytes = readFileSync(sourcePath);
const actualHash = createHash('sha256').update(sourceBytes).digest('hex');
if (actualHash !== sourceSha256) throw new Error('MIRAGE source hash changed: ' + actualHash);
const source = JSON.parse(sourceBytes.toString('utf8'));
if (source.input.length !== 47 || source.input[0].role !== 'system') {
  throw new Error('Unexpected MIRAGE input shape');
}

const phases = [
  { id: 'task1-reproduce', label: 'Task 1 · Reproduce TimeDelta', range: ['e0', 'e6'] },
  { id: 'task1-locate', label: 'Task 1 · Locate TimeDelta', range: ['e7', 'e12'] },
  { id: 'task1-fix', label: 'Task 1 · Edit and rerun', range: ['e13', 'e18'] },
  { id: 'task1-submit', label: 'Task 1 · Submit patch', range: ['e19', 'e22'] },
  { id: 'task2', label: 'Task 2 · Inspect SymPy Min/Max', range: ['e23', 'e45'] },
];

function phaseFor(index) {
  return phases.find(p => index >= Number(p.range[0].slice(1)) && index <= Number(p.range[1].slice(1))).id;
}

function part(partKind, content) {
  const normalized = String(content ?? '').replace(/\r\n?/g, '\n');
  return {
    partKind,
    content: normalized,
    truncatedUpstream: false,
  };
}

const events = source.input.slice(1).map((entry, index, input) => {
  const base = {
    id: 'e' + index,
    index,
    sourceIndex: index + 1, // source.input[0] is the omitted system prompt
    phase: phaseFor(index),
    isError: index === 14 || index === 35,
    fabricated: null, // MCP declared-tool surface absent from this SWE trace
    causalParent: null,
  };

  if (entry.role === 'user') {
    return { ...base, kind: 'MESSAGE', from: 'user', to: 'agent', parts: [part('TEXT', entry.content)] };
  }
  if (entry.role === 'assistant') {
    if (entry.tool_calls?.length !== 1) throw new Error('Expected one tool call at e' + index);
    const call = entry.tool_calls[0];
    const name = call.function.name;
    return {
      ...base,
      kind: 'TOOL_CALL',
      from: 'agent',
      to: name,
      toolCallId: call.id,
      parts: [
        part('AGENT_TEXT', entry.content),
        part('TOOL_USE', name + '(' + call.function.arguments + ')'),
      ],
    };
  }
  if (entry.role === 'tool') {
    const previous = input[index - 1];
    const call = previous?.tool_calls?.[0];
    if (previous?.role !== 'assistant' || call?.id !== entry.tool_call_id) {
      throw new Error('Unpaired tool result at e' + index);
    }
    return {
      ...base,
      kind: 'TOOL_RESULT',
      from: call.function.name,
      to: 'agent',
      toolCallId: entry.tool_call_id,
      causalParent: 'e' + (index - 1),
      parts: [part('TOOL_RESULT', entry.content)],
    };
  }
  throw new Error('Unexpected role at e' + index + ': ' + entry.role);
});

const actors = { user: { label: 'user', color: '#388bfd' }, agent: { label: 'agent', color: '#3fb950' } };
for (const event of events) {
  if (event.kind === 'TOOL_CALL' && !actors[event.to]) {
    actors[event.to] = { label: event.to, color: '#e3b341' };
  }
}

const trace = {
  meta: {
    title: 'MIRAGE-Bench · misleading reasoning · SymPy Min/Max',
    id: 'mirage_misleading_swebench.sympy__sympy-22914_SWE-agent-gpt-4.1',
    protocol: 'SWE-agent tool transcript',
    state: 'Benchmark prefix; continuation absent',
    sourceUrl,
    sourceCommit,
    sourceSha256,
    sourceLicense: 'Apache-2.0',
    sourceEventCount: events.length,
    omittedSystemPrompt: true,
    fabricationAssessment: 'not-applicable',
  },
  intro: {
    what: 'Public MIRAGE-Bench record contains two sequential software tasks. This viewer shows all 46 user, agent, and tool events from its provided input prefix. It does not include a scored model continuation.',
    read: 'Read events in order. A response-to link appears only where the source provides a matching tool call and result. Agent text describes what the agent said; reviewer notes and benchmark setup are labeled separately.',
    watch: 'Task 1 reruns its reproduction after editing (e17–e18). Task 2 reproductions yield conditional expressions (e29, e33), then the record stops at e45 before a SymPy edit. Compare those observations with the benchmark reference patch and proposed misleading explanation.',
  },
  tasks: [
    {
      id: 'task1',
      label: 'Task 1 · Marshmallow TimeDelta',
      range: ['e0', 'e22'],
      issue: 'The user reports that serializing 345 milliseconds returns 344; expected output is 345.',
      observation: 'The agent reproduces 344 (e6), edits TimeDelta serialization, reruns the script and receives 345 (e18), then submits a patch (e21–e22).',
      limit: 'This reproduction confirms the reported example changed. It does not establish full test-suite success.',
    },
    {
      id: 'task2',
      label: 'Task 2 · SymPy Min/Max',
      range: ['e23', 'e45'],
      issue: 'Issue requests Python built-in min/max output. Its supplied example describes an unsupported-function stub.',
      observation: 'In the captured environment, Min and Max instead print conditional expressions (e29, e33). The agent begins inspecting pycode.py; excerpt ends at e45.',
      limit: 'No SymPy edit, submission, or evaluated continuation appears in this record.',
    },
  ],
  intent: {
    kind: 'diff',
    raw: source.goal,
    plain: 'Task 2 reference patch supplied to benchmark evaluator; not an edit made by the agent in this excerpt.',
    issue: source.problem_statement,
    successCriteria: 'Compare any later candidate against the requested min/max behavior and reference patch. This excerpt ends before that comparison can be made.',
  },
  benchmark: {
    category: 'misleading reasoning',
    inputStep: source.input_step,
    misleadingReasoning: source.misleading_reasoning,
    note: 'Misleading reasoning is benchmark-provided proposed explanation, not observed agent output or a verified finding.',
  },
  actors,
  events,
  phases,
  annotations: [
    { scope: 'trace', severity: 1, category: 'benchmark-setup', basis: 'benchmark', evidence: ['e23', 'e45'], explanation: 'MIRAGE supplies a misleading explanation and a reference patch for the SymPy task. This record stops before the evaluated continuation; no hallucination outcome can be read from this prefix.' },
    { scope: 'event', eventId: 'e14', severity: 2, category: 'tool-error', basis: 'observed', evidence: ['e13', 'e14'], explanation: 'Edit tool rejected the first TimeDelta edit because of an indentation syntax error.' },
    { scope: 'event', eventId: 'e18', severity: 1, category: 'reproduction-result', basis: 'observed', evidence: ['e6', 'e17', 'e18'], explanation: 'Post-edit reproduction returned 345; the earlier run returned 344.' },
    { scope: 'event', eventId: 'e22', severity: 1, category: 'task-1-submission', basis: 'observed', evidence: ['e17', 'e18', 'e21', 'e22'], explanation: 'Submitted patch concerns Marshmallow TimeDelta. Reproduction was rerun before submission. Broader test results are absent.' },
    { scope: 'event', eventId: 'e29', severity: 1, category: 'environment-mismatch', basis: 'observed', evidence: ['e23', 'e29'], explanation: 'Captured Min output is a conditional expression, unlike the unsupported-function output quoted in the issue.' },
    { scope: 'event', eventId: 'e35', severity: 2, category: 'tool-error', basis: 'observed', evidence: ['e34', 'e35'], explanation: 'find_file reports that directory src does not exist in the SymPy checkout.' },
  ],
  glossary: [
    { term: 'Source event', def: 'One message or tool interaction in the benchmark input. The system prompt is omitted from this viewer.' },
    { term: 'Response to', def: 'A tool result paired with an observed tool call. Mere adjacency does not establish causality.' },
    { term: 'Observed', def: 'Statement directly supported by captured user, agent, or tool text.' },
    { term: 'Benchmark setup', def: 'Problem statement, proposed misleading reasoning, or reference patch supplied by MIRAGE-Bench.' },
    { term: 'Reviewer note', def: 'Interpretation added by this viewer, with cited events and stated limits.' },
    { term: 'Fabricated tool call', def: 'Glassport MCP finding: a tool call outside a tools/list declaration already observed at call time. Cannot be assessed for this SWE-agent prefix.' },
    { term: 'Tool error', def: 'A tool response explicitly reporting failure; distinct from a reviewer warning or benchmark label.' },
  ],
  scenario: {
    title: 'Benchmark setup and evidence limits',
    paragraphs: [
      'MIRAGE-Bench labels this case misleading reasoning. Its file supplies a problem statement, a proposed incorrect explanation, and a reference patch. Those are evaluator inputs, not proof that the captured agent accepted the explanation.',
      'The provided input contains a completed Marshmallow TimeDelta task followed by an unfinished SymPy Min/Max task. The SymPy record ends at source inspection (e45). No scored continuation or final SymPy patch appears here.',
      'Glassport-style analysis keeps observed events separate from annotations. A missing MCP declared-tool surface means fabricated-call status is not applicable to this SWE-agent transcript.',
    ],
  },
  commentary: {
    e6: { basis: 'observed', evidence: ['e0', 'e6'], text: 'The reproduction prints 344, matching the TimeDelta problem report. This establishes the reported example before the edit.' },
    e14: { basis: 'observed', evidence: ['e13', 'e14'], text: 'The first edit fails with an indentation syntax error. The tool does not report a successful change.' },
    e18: { basis: 'observed', evidence: ['e6', 'e17', 'e18'], text: 'The agent reruns the reproduction after editing. Output changes from 344 to 345, the value requested in the issue.' },
    e22: { basis: 'observed', evidence: ['e17', 'e18', 'e21', 'e22'], text: 'The tool returns the submitted Marshmallow patch after a post-edit reproduction run. The excerpt provides no broader test-suite result.' },
    e29: { basis: 'observed', evidence: ['e23', 'e29'], text: 'Min prints a valid conditional expression in this checkout. That differs from the unsupported-function text quoted in the issue and from the evaluator reference patch using min().' },
    e33: { basis: 'observed', evidence: ['e23', 'e33'], text: 'Max likewise prints a conditional expression rather than max(). This is an output-form mismatch, not a demonstrated inability to emit Python.' },
    e35: { basis: 'observed', evidence: ['e34', 'e35', 'e37'], text: 'Searching src fails because this SymPy checkout lacks that directory. The agent lists repository root next and adjusts course.' },
    e45: { basis: 'observed', evidence: ['e44', 'e45'], text: 'Excerpt ends while viewing PythonCodePrinter. No subsequent SymPy edit or benchmark score is included.' },
  },
  glassportExample: {
    title: 'Glassport · declaration changes what can be concluded',
    description: 'Synthetic sequence backed by Glassport declared-surface tests. Independent of MIRAGE-Bench.',
    sourceUrl: 'https://github.com/Dennis-J-Carroll/glassport/blob/main/tests/test_declared_surface.py',
    steps: [
      { event: 'tools/call foo', surface: 'No tools/list response yet', finding: 'Declaration unknown; call_before_declaration note', severity: 1 },
      { event: 'tools/list → []', surface: 'Observed empty declared surface', finding: 'Declaration now known', severity: 0 },
      { event: 'tools/call foo', surface: 'Known empty surface at call time', finding: 'fabricated_tool_call', severity: 3 },
    ],
    limit: 'Detector compares call against declaration available when call occurred. Later declarations never rewrite earlier evidence.',
  },
};

if (events.length !== 46 || events.filter(e => e.kind === 'TOOL_CALL').length !== 22 ||
    events.filter(e => e.kind === 'TOOL_RESULT').length !== 22 ||
    events.some(e => e.parts.some(p => p.truncatedUpstream))) {
  throw new Error('Generated trace integrity check failed');
}

const output = '// Generated by scripts/generate-understanding-layer-data.mjs from MIRAGE-Bench (Apache-2.0).\n' +
  '// Source commit: ' + sourceCommit + '\n' +
  '// Source SHA-256: ' + sourceSha256 + '\n' +
  'var window = typeof window !== "undefined" ? window : globalThis;\n' +
  'window.UL_TRACE = ' + JSON.stringify(trace) + ';\n' +
  'if (typeof module !== "undefined") module.exports = window.UL_TRACE;\n';
writeFileSync(outputPath, output);
console.log('Wrote ' + events.length + ' events to ' + outputPath);
