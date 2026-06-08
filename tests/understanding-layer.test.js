/** @jest-environment jsdom */
window.UL_ICONS = require('../static/apps/understanding-layer.icons.js');
const TRACE = require('../static/apps/understanding-layer.data.js');
window.UL_TRACE = TRACE;
const UL = require('../static/apps/understanding-layer.app.js');

test('computeStats returns correct counts', () => {
  const s = UL.computeStats(TRACE.events);
  expect(s.events).toBe(46);
  expect(s.toolCalls).toBe(TRACE.events.filter(e => e.kind === 'TOOL_CALL').length);
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
  ['Events','Actors','Tool Calls','Fabricated','Annotated Events'].forEach(l => expect(html).toContain(l));
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
test('renderEventCard for e22 includes annotation-callout and annotated class', () => {
  const e22 = TRACE.events.find(e => e.id === 'e22');
  const html = UL.renderEventCard(e22);
  expect(html).toContain('annotation-callout');
  expect(html).toContain('annotated');
  expect(html).toContain('decision-point');
  expect(html).toContain('without re-validating');
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

test('renderIntent contains plain summary, raw diff text (escaped), and "Success criteria"', () => {
  const html = UL.renderIntent(TRACE.intent);
  // esc() escapes apostrophes — compare against escaped versions
  expect(html).toContain(UL.esc(TRACE.intent.plain));
  // The raw diff text will be HTML-escaped in the output
  expect(html).toContain('diff --git');
  expect(html).toContain('Success criteria');
});

test('renderScenario contains trace verdict explanation and all 3 scenario paragraphs', () => {
  const traceAnn = TRACE.annotations.find(a => a.scope === 'trace');
  const html = UL.renderScenario(TRACE.scenario, TRACE.annotations);
  // esc() escapes apostrophes — compare against escaped version
  expect(html).toContain(UL.esc(traceAnn.explanation));
  TRACE.scenario.paragraphs.forEach(p => {
    expect(html).toContain(UL.esc(p));
  });
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
