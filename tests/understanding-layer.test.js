/** @jest-environment jsdom */
window.UL_ICONS = require('../static/apps/understanding-layer.icons.js');
const TRACE = require('../static/apps/understanding-layer.data.js');
const SOURCE = require('../data/understanding-layer/mirage-source.json');
const { readFileSync } = require('fs');
const { join } = require('path');
window.UL_TRACE = TRACE;
const UL = require('../static/apps/understanding-layer.app.js');

test('computeStats returns correct counts', () => {
  const s = UL.computeStats(TRACE.events);
  expect(s.events).toBe(46);
  expect(s.toolCalls).toBe(TRACE.events.filter(e => e.kind === 'TOOL_CALL').length);
});

test('all displayed events preserve their corresponding source text and tool pairs', () => {
  expect(TRACE.events).toHaveLength(SOURCE.input.length - 1);
  TRACE.events.forEach((event, index) => {
    const source = SOURCE.input[index + 1];
    expect(event.id).toBe(`e${index}`);
    expect(event.sourceIndex).toBe(index + 1);
    expect(event.parts.every(part => !part.truncatedUpstream)).toBe(true);
    if (source.role === 'user') {
      expect(event.kind).toBe('MESSAGE');
      expect(event.parts[0].content).toBe(source.content.replace(/\r\n?/g, '\n'));
      expect(event.causalParent).toBeNull();
    } else if (source.role === 'assistant') {
      expect(event.kind).toBe('TOOL_CALL');
      expect(event.parts[0].content).toBe(source.content.replace(/\r\n?/g, '\n'));
      expect(event.toolCallId).toBe(source.tool_calls[0].id);
      expect(event.to).toBe(source.tool_calls[0].function.name);
      expect(event.parts[1].content).toContain(source.tool_calls[0].function.arguments);
      expect(event.causalParent).toBeNull();
    } else {
      expect(event.kind).toBe('TOOL_RESULT');
      expect(event.parts[0].content).toBe(source.content.replace(/\r\n?/g, '\n'));
      expect(event.toolCallId).toBe(source.tool_call_id);
      expect(event.causalParent).toBe(`e${index - 1}`);
      expect(TRACE.events[index - 1].toolCallId).toBe(source.tool_call_id);
    }
  });
});

test('benchmark setup and task boundary remain distinct from agent evidence', () => {
  expect(TRACE.benchmark.misleadingReasoning).toBe(SOURCE.misleading_reasoning);
  expect(TRACE.intent.raw).toBe(SOURCE.goal);
  expect(TRACE.intent.issue).toBe(SOURCE.problem_statement);
  expect(TRACE.events[22].kind).toBe('TOOL_RESULT');
  expect(TRACE.events[23].kind).toBe('MESSAGE');
  expect(TRACE.events[23].parts[0].content).toContain('PythonCodePrinter');
  expect(TRACE.events[45].parts[0].content).toContain('pycode.py');
  expect(TRACE.events[45].causalParent).toBe('e44');
});

test('failure, retry, and fabrication statistics reflect observed evidence', () => {
  expect(TRACE.events.filter(event => event.isError).map(event => event.id)).toEqual(['e14', 'e35']);
  expect(UL.markErrorChains(TRACE.events).map(chain => chain.eventIds)).toEqual([['e13', 'e14', 'e15', 'e16']]);
  const analytics = UL.computeAnalytics(TRACE.events);
  expect(analytics.errorCount).toBe(2);
  expect(analytics.toolResultCount).toBe(22);
  expect(analytics.errorRate).toBeCloseTo(2 / 22);
  expect(analytics.retryCount).toBe(1);
  expect(UL.computeStats(TRACE.events).fabricated).toBeNull();
});

test('generated page has semantic entry points and static context before scripts', () => {
  const html = readFileSync(join(__dirname, '../static/apps/understanding-layer-demo.html'), 'utf8');
  expect(html).toContain('<main id="main-content">');
  expect(html).toContain('<h1 class="page-title">');
  expect(html).toContain('id="ul-tasks"');
  expect(html).toContain('id="ul-event-map"');
  expect(html).toContain('id="ul-glassport"');
  expect(html.indexOf('class="ul-static-summary"')).toBeLessThan(html.indexOf('understanding-layer.app.js'));
  expect(html).toContain('<script src="/apps/understanding-layer.icons.js?v=20260928" defer>');
  expect(html).toContain('<script src="/apps/understanding-layer.data.js?v=20260928" defer>');
  expect(html).toContain('<script src="/apps/understanding-layer.app.js?v=20260928" defer>');
});
test('renderEventCard produces a card with kind badge and event id, no emoji', () => {
  const html = UL.renderEventCard(TRACE.events[0]);
  expect(html).toContain('ev-kind-badge');
  expect(html).toContain('e0');
  expect(html).not.toMatch(/\u{1F4AC}|\u{2699}|\u{1F4E5}/u); // no 💬 ⚙️ 📥
});
test('renderEventCard marks error events', () => {
  const errEvent = TRACE.events.find(e => e.isError);
  expect(UL.renderEventCard(errEvent)).toContain('error');
});
test('renderSummary shows the five summary cards', () => {
  const html = UL.renderSummary(UL.computeStats(TRACE.events));
  ['Events','Actors','Tool Calls','MCP Fabricated Calls','Annotated Events'].forEach(l => expect(html).toContain(l));
  expect(html).toContain('N/A');
});

// ── Feature A: groupByPhase ──────────────────────────────────────────────────
test('groupByPhase returns 5 groups matching phases, correct first event, total 46', () => {
  const groups = UL.groupByPhase(TRACE.events, TRACE.phases);
  expect(groups.length).toBe(5);
  expect(groups[0].events[0].id).toBe('e0');
  const total = groups.reduce((acc, g) => acc + g.events.length, 0);
  expect(total).toBe(46);
  TRACE.phases.forEach((ph, i) => expect(groups[i].phase.label).toBe(ph.label));
});

// ── Feature B: per-event annotations ────────────────────────────────────────
test('e22 annotation cites observed post-edit reproduction before submission', () => {
  const e22 = TRACE.events.find(e => e.id === 'e22');
  const html = UL.renderEventCard(e22);
  expect(html).toContain('annotation-callout');
  expect(html).toContain('annotated');
  expect(html).toContain('task-1-submission');
  expect(html).toContain('rerun before submission');
  expect(html).toContain('href="#e18"');
  expect(html).not.toContain('without re-validating');
});
test('computeStats annotated counts distinct event-annotated ids', () => {
  const distinctAnnotatedIds = new Set(
    TRACE.annotations.filter(a => a.scope === 'event').map(a => a.eventId)
  ).size;
  const s = UL.computeStats(TRACE.events);
  expect(s.annotated).toBe(distinctAnnotatedIds);
  expect(s.annotated).toBeGreaterThan(0);
});

// ── Feature C: expandable card wiring ────────────────────────────────────────
test('renderEventCard shows ul-expand button for long non-truncated content', () => {
  const syntheticEvent = {
    id: 'eX', index: 0, kind: 'MESSAGE', from: 'user', to: 'agent',
    causalParent: null, isError: false, fabricated: false,
    phase: 'task1-reproduce',
    parts: [{
      partKind: 'TEXT',
      content: 'x'.repeat(300),
      preview: 'x'.repeat(140) + '…',
      truncatedUpstream: false
    }]
  };
  const html = UL.renderEventCard(syntheticEvent, {});
  expect(html).toContain('ul-expand');
  // collapsed: shows preview (140 chars + ellipsis)
  expect(html).toContain('x'.repeat(140) + '…');
});
test('renderEventCard with opts.expanded shows full content for long non-truncated part', () => {
  const syntheticEvent = {
    id: 'eX', index: 0, kind: 'MESSAGE', from: 'user', to: 'agent',
    causalParent: null, isError: false, fabricated: false,
    phase: 'task1-reproduce',
    parts: [{
      partKind: 'TEXT',
      content: 'x'.repeat(300),
      preview: 'x'.repeat(140) + '…',
      truncatedUpstream: false
    }]
  };
  const html = UL.renderEventCard(syntheticEvent, { expanded: true });
  // full 300 chars present in data-full attribute
  expect(html).toContain('x'.repeat(300));
});

// ── Sprint 1 context-panels batch ────────────────────────────────────────────

test('renderIntro contains "About this trace" and all three section paragraphs', () => {
  const html = UL.renderIntro(TRACE.intro);
  expect(html).toContain('About this trace');
  // esc() escapes apostrophes to &#39; — compare against escaped versions
  expect(html).toContain(UL.esc(TRACE.intro.what));
  expect(html).toContain(UL.esc(TRACE.intro.read));
  expect(html).toContain(UL.esc(TRACE.intro.watch));
});

test('renderGlossary contains every term in TRACE.glossary', () => {
  const html = UL.renderGlossary(TRACE.glossary);
  TRACE.glossary.forEach(g => {
    expect(html).toContain(g.term);
  });
});

test('renderIntent labels evaluator reference and its comparison limit', () => {
  const html = UL.renderIntent(TRACE.intent);
  // esc() escapes apostrophes — compare against escaped versions
  expect(html).toContain(UL.esc(TRACE.intent.plain));
  // The raw diff text will be HTML-escaped in the output
  expect(html).toContain('diff --git');
  expect(html).toContain('EVALUATOR REFERENCE');
  expect(html).toContain('Comparison limit');
});

test('renderScenario distinguishes benchmark setup from observed outcome', () => {
  const traceAnn = TRACE.annotations.find(a => a.scope === 'trace');
  const html = UL.renderScenario(TRACE.scenario, TRACE.annotations);
  // esc() escapes apostrophes — compare against escaped version
  expect(html).toContain(UL.esc(traceAnn.explanation));
  TRACE.scenario.paragraphs.forEach(p => {
    expect(html).toContain(UL.esc(p));
  });
  expect(html).toContain('not agent output');
  expect(html).not.toContain('Trace-level verdict');
});

// ── Sprint 2: Tasks 10/11/12/14 ───────────────────────────────────────────────

test('applyFilters by kind MESSAGE returns only MESSAGE events', () => {
  const filtered = UL.applyFilters(TRACE.events, { kinds: ['MESSAGE'] });
  const expected = TRACE.events.filter(e => e.kind === 'MESSAGE');
  expect(filtered.length).toBe(expected.length);
  expect(filtered.length).toBeGreaterThan(0);
  filtered.forEach(e => expect(e.kind).toBe('MESSAGE'));
});

test('applyFilters by actor bash returns only events with from===bash OR to===bash', () => {
  const filtered = UL.applyFilters(TRACE.events, { actors: ['bash'] });
  expect(filtered.length).toBeGreaterThan(0);
  filtered.forEach(e => {
    expect(e.from === 'bash' || e.to === 'bash').toBe(true);
  });
});

test('an explicitly empty actor filter returns no events', () => {
  expect(UL.applyFilters(TRACE.events, { actors: [] })).toEqual([]);
});

test('task cards and separate Glassport example disclose their evidence limits', () => {
  const tasks = UL.renderTasks(TRACE.tasks, TRACE.intent, TRACE.meta);
  const glassport = UL.renderGlassportCase(TRACE.glassportExample);
  expect(tasks).toContain('Marshmallow TimeDelta');
  expect(tasks).toContain('SymPy Min/Max');
  expect(tasks).toContain('No SymPy edit');
  expect(tasks).toContain(TRACE.meta.sourceUrl);
  expect(tasks).toContain('46 of 46 displayed input events');
  expect(glassport).toContain('Synthetic sequence');
  expect(glassport).toContain('fabricated_tool_call');
  expect(glassport).toContain('Later declarations');
});

test('applyFilters by query reproduce.py returns matching events', () => {
  const filtered = UL.applyFilters(TRACE.events, { query: 'reproduce.py' });
  expect(filtered.length).toBeGreaterThan(0);
  filtered.forEach(e => {
    const q = 'reproduce.py';
    const inId = e.id.toLowerCase().includes(q);
    const inFrom = e.from.toLowerCase().includes(q);
    const inTo = e.to.toLowerCase().includes(q);
    const inContent = e.parts.some(p => p.content && p.content.toLowerCase().includes(q));
    expect(inId || inFrom || inTo || inContent).toBe(true);
  });
});

test('applyFilters with AND semantics: TOOL_CALL + bash + ls', () => {
  const filtered = UL.applyFilters(TRACE.events, {
    kinds: ['TOOL_CALL'],
    actors: ['bash'],
    query: 'ls'
  });
  // All must be TOOL_CALL, involve bash, and have 'ls' in content/id/from/to
  filtered.forEach(e => {
    expect(e.kind).toBe('TOOL_CALL');
    expect(e.from === 'bash' || e.to === 'bash').toBe(true);
    const q = 'ls';
    const inId = e.id.toLowerCase().includes(q);
    const inFrom = e.from.toLowerCase().includes(q);
    const inTo = e.to.toLowerCase().includes(q);
    const inContent = e.parts.some(p => p.content && p.content.toLowerCase().includes(q));
    expect(inId || inFrom || inTo || inContent).toBe(true);
  });
  // May be 0 results (valid AND), just check no contradictions above
});

test('renderMinimap returns one dot per event and href="#e0"', () => {
  const html = UL.renderMinimap(TRACE.events);
  const dotMatches = html.match(/ul-mini-dot/g) || [];
  expect(dotMatches.length).toBe(TRACE.events.length);
  expect(html).toContain('href="#e0"');
});

test('_highlight wraps matched substring in <mark>', () => {
  const text = UL.esc('python reproduce.py');
  const result = UL._highlight(text, 'reproduce');
  expect(result).toContain('<mark>');
  expect(result).toContain('reproduce');
});

test('groupByPhase never drops events from a filtered subset (regression)', () => {
  // Filtering can remove a phase's range-boundary events; grouping must still
  // place every remaining event by its own phase field.
  [['MESSAGE'], ['TOOL_CALL'], ['TOOL_RESULT']].forEach((kinds) => {
    const filtered = UL.applyFilters(TRACE.events, { kinds });
    const placed = UL.groupByPhase(filtered, TRACE.phases)
      .reduce((n, g) => n + g.events.length, 0);
    expect(placed).toBe(filtered.length);
  });
});

// ── Sprint 2: Tasks 13/15/16/17 ───────────────────────────────────────────────

// Task 13: Per-event commentary
test('commentaryFor("e22") returns sourced note', () => {
  const note = UL.commentaryFor('e22');
  expect(note.basis).toBe('observed');
  expect(note.evidence).toContain('e18');
  expect(note.text.length).toBeGreaterThan(0);
});

test('renderEventCard for e22 contains "Why this matters" and the commentary text', () => {
  const e22 = TRACE.events.find(e => e.id === 'e22');
  const html = UL.renderEventCard(e22);
  expect(html).toContain('Why this matters');
  const commentary = UL.commentaryFor('e22');
  // The text is esc()d so check against the escaped form
  expect(html).toContain(UL.esc(commentary.text));
});

test('renderEventCard for e2 (no commentary) does NOT contain "Why this matters"', () => {
  const e2 = TRACE.events.find(e => e.id === 'e2');
  const html = UL.renderEventCard(e2);
  expect(html).not.toContain('Why this matters');
});

// Task 15: Diff visualization
test('renderDiff produces diff-add, diff-del, diff-hunk classes for unified diff input', () => {
  const input = "@@ -1 +1 @@\n+added\n-removed\n unchanged";
  const html = UL.renderDiff(input);
  expect(html).toContain('diff-add');
  expect(html).toContain('added');
  expect(html).toContain('diff-del');
  expect(html).toContain('removed');
  expect(html).toContain('diff-hunk');
  expect(html).toContain('ul-diff');
});

test('renderIntent contains ul-diff and diff-add when intent.kind is "diff"', () => {
  const html = UL.renderIntent(TRACE.intent);
  expect(html).toContain('ul-diff');
  expect(html).toContain('diff-add');
});

// Task 16: Error chain grouping
test('markErrorChains returns at least one chain including e14', () => {
  const chains = UL.markErrorChains(TRACE.events);
  expect(chains.length).toBeGreaterThan(0);
  const chainWithE14 = chains.find(c => c.eventIds.includes('e14'));
  expect(chainWithE14).toBeDefined();
});

// ── Sprint 3: Tasks 18/19/20/21 ───────────────────────────────────────────────

// Task 18: computeAnalytics
test('computeAnalytics returns toolUsage, errorRate, errorCount, retryCount, perPhase', () => {
  const an = UL.computeAnalytics(TRACE.events);
  expect(typeof an.toolUsage).toBe('object');
  expect(typeof an.errorRate).toBe('number');
  expect(an.errorRate).toBeGreaterThanOrEqual(0);
  expect(an.errorRate).toBeLessThanOrEqual(1);
  expect(typeof an.errorCount).toBe('number');
  expect(typeof an.retryCount).toBe('number');
  expect(typeof an.perPhase).toBe('object');
  // toolUsage counts TOOL_CALL events by their `to`
  const toolCalls = TRACE.events.filter(e => e.kind === 'TOOL_CALL');
  const totalFromUsage = Object.values(an.toolUsage).reduce((a, b) => a + b, 0);
  expect(totalFromUsage).toBe(toolCalls.length);
  // perPhase totals match event count
  const totalPerPhase = Object.values(an.perPhase).reduce((a, b) => a + b, 0);
  expect(totalPerPhase).toBe(TRACE.events.length);
});

test('renderAnalytics returns HTML with .ul-analytics and .ul-bar-row elements', () => {
  const an = UL.computeAnalytics(TRACE.events);
  const html = UL.renderAnalytics(an);
  expect(html).toContain('ul-analytics');
  expect(html).toContain('ul-bar-row');
  expect(html).toContain('Trace analytics');
});

test('event map and matrix preserve source order and count each phase-kind intersection', () => {
  const map = UL.renderEventMap(TRACE.events, TRACE.phases, 'e14');
  expect(map).toContain('Spacing shows sequence, not elapsed time');
  expect((map.match(/class="ul-map-node(?:\s|")/g) || [])).toHaveLength(46);
  expect(map.indexOf('data-ev="e22"')).toBeLessThan(map.indexOf('data-ev="e23"'));
  expect(map).toContain('data-ev="e14" data-kind="TOOL_RESULT"');
  const rows = UL.computePhaseKindCounts(TRACE.events, TRACE.phases);
  expect(rows.map(row => row.total)).toEqual([7, 6, 6, 4, 23]);
  expect(rows.reduce((sum, row) => sum + row.total, 0)).toBe(46);
  const matrix = UL.renderAnalytics(UL.computeAnalytics(TRACE.events), TRACE.events, TRACE.phases);
  expect(matrix).toContain('ul-kind-matrix-table');
  expect(matrix).toContain('data-phase="task2"');
});

test('phase filter limits events while retaining AND behavior', () => {
  const filtered = UL.applyFilters(TRACE.events, { phase: TRACE.phases[0].id, kinds: ['TOOL_CALL'] });
  expect(filtered.length).toBeGreaterThan(0);
  expect(filtered.every(ev => ev.phase === TRACE.phases[0].id && ev.kind === 'TOOL_CALL')).toBe(true);
});

// Task 19: sparkline
test('sparkline([1,2,3]) returns an <svg> containing 3 <rect', () => {
  const html = UL.sparkline([1, 2, 3]);
  expect(html).toContain('<svg');
  const rects = (html.match(/<rect/g) || []).length;
  expect(rects).toBe(3);
});

test('renderSummary(stats, events) contains <svg for sparkline', () => {
  const html = UL.renderSummary(UL.computeStats(TRACE.events), TRACE.events);
  expect(html).toContain('<svg');
});

test('renderSummary(stats) without events still works and contains Events label', () => {
  const html = UL.renderSummary(UL.computeStats(TRACE.events));
  expect(html).toContain('Events');
  // No sparkline when events omitted
  expect(html).not.toContain('<svg');
});

// Task 20: causalChain
test('causalChain links proven call/result pair only', () => {
  expect(UL.causalChain(TRACE.events, 'e2')).toEqual(['e1', 'e2']);
  expect(UL.causalChain(TRACE.events, 'e3')).toEqual(['e3']);
  expect(UL.causalChain(TRACE.events, 'e23')).toEqual(['e23']);
});

test('causalChain for a root event returns just that event', () => {
  const chain = UL.causalChain(TRACE.events, 'e0');
  expect(chain).toEqual(['e0']);
});

// Task 21: summarizePhase
test('summarizePhase returns eventCount, toolCount, hasError for a slice', () => {
  const slice = TRACE.events.slice(0, 7);
  const group = { phase: { label: 'X' }, events: slice };
  const result = UL.summarizePhase(group);
  expect(result.eventCount).toBe(7);
  const expectedToolCount = slice.filter(e => e.kind === 'TOOL_CALL').length;
  expect(result.toolCount).toBe(expectedToolCount);
  expect(typeof result.hasError).toBe('boolean');
  expect(result.label).toBe('X');
});

test('renderTimeline includes .phase-summary spans (one per non-empty phase group)', () => {
  const html = UL.renderTimeline(TRACE.events);
  const matches = (html.match(/class="phase-summary"/g) || []).length;
  expect(matches).toBe(5); // 5 phases, all non-empty
});

test('phase controls expose expanded state and controlled event regions', () => {
  const html = UL.renderTimeline(TRACE.events);
  expect((html.match(/class="phase-header" aria-expanded="true"/g) || [])).toHaveLength(5);
  expect(html).toContain('aria-controls="phase-events-task2"');
  expect(html).toContain('id="phase-events-task2"');
});

// ── Sprint 3: Tasks 22/23/24 ─────────────────────────────────────────────────

// Task 22: tourSteps
test('tourSteps returns exactly 8 steps', () => {
  const steps = UL.tourSteps();
  expect(steps.length).toBe(8);
});

test('tourSteps — each step has target, title, and body', () => {
  UL.tourSteps().forEach((step, i) => {
    expect(typeof step.target).toBe('string');
    expect(step.target.length).toBeGreaterThan(0);
    expect(typeof step.title).toBe('string');
    expect(step.title.length).toBeGreaterThan(0);
    expect(typeof step.body).toBe('string');
    expect(step.body.length).toBeGreaterThan(0);
  });
});

test('tourSteps points to corrected task boundary and post-edit check', () => {
  const targets = UL.tourSteps().map(s => s.target);
  expect(targets).toContain('#e18');
  expect(targets).toContain('#e23');
  expect(targets).toContain('#ul-intro');
});

// Task 23: eventToJSON / traceToJSON
test('eventToJSON round-trips: JSON.parse(eventToJSON(e0)) deep-equals e0', () => {
  const e0 = TRACE.events[0];
  const parsed = JSON.parse(UL.eventToJSON(e0));
  expect(JSON.stringify(parsed)).toBe(JSON.stringify(e0));
});

test('traceToJSON round-trips to an object with 46 events', () => {
  const parsed = JSON.parse(UL.traceToJSON(TRACE));
  expect(parsed.events.length).toBe(46);
});

test('traceToJSON output is valid indented JSON (contains newlines)', () => {
  const json = UL.traceToJSON(TRACE);
  expect(json).toContain('\n');
  expect(() => JSON.parse(json)).not.toThrow();
});

// Task 24: Integration — mount injects all required elements
test('mount injects theme toggle, tour button, export button, tour overlay, and timeline aria-label', () => {
  // Re-mount (app module may cache state, but DOM elements should be queryable)
  // A fresh jsdom environment is used per test-file, so we rely on the module-level mount
  // having run via DOMContentLoaded or manual call. Call mount() explicitly.
  document.body.innerHTML = `
    <div class="djc-app-bar"></div>
    <div id="ul-intro"></div>
    <div id="ul-tasks"></div>
    <div id="ul-analytics"></div>
    <div id="ul-summary"></div>
    <div id="ul-event-map"></div>
    <div id="ul-toolbar"></div>
    <div id="ul-timeline"></div>
    <div id="ul-minimap"></div>
    <div id="ul-intent"></div>
    <div id="ul-panels"></div>
    <div id="ul-glassport"></div>
  `;
  UL.mount();
  expect(document.querySelector('.ul-theme-toggle')).not.toBeNull();
  expect(document.querySelector('.ul-tour-btn')).not.toBeNull();
  expect(document.querySelector('.ul-export-json')).not.toBeNull();
  expect(document.querySelector('.ul-tour-overlay')).not.toBeNull();
  expect(document.getElementById('ul-timeline').getAttribute('aria-label')).toBeTruthy();
  expect(document.getElementById('ul-tasks').textContent).toContain('Two tasks');
  expect(document.getElementById('ul-glassport').textContent).toContain('Glassport');
  expect(document.querySelectorAll('.ul-map-node')).toHaveLength(46);
  const matrixCell = document.querySelector('.ul-matrix-cell[data-phase="task2"][data-kind="TOOL_CALL"]');
  matrixCell.click();
  const visible = UL.applyFilters(TRACE.events, { phase: 'task2', kinds: ['TOOL_CALL'] });
  expect(document.querySelectorAll('.tl-event')).toHaveLength(visible.length);
  expect(matrixCell.getAttribute('aria-pressed')).toBe('true');
  document.querySelector('.ul-matrix-clear').click();
  expect(document.querySelectorAll('.tl-event')).toHaveLength(46);
  const glassportStep = document.querySelector('.ul-case-step[data-step="2"]');
  glassportStep.click();
  expect(glassportStep.getAttribute('aria-pressed')).toBe('true');
  expect(document.querySelector('.ul-case-detail').textContent).toContain('fabricated_tool_call');
});
