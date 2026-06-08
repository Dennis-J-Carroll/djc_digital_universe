// understanding-layer.app.js
// Render engine for the Understanding Layer agent trace viewer.
// No framework, no build step. Reads window.UL_TRACE and window.UL_ICONS.

(function (global) {
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));

  // ── Feature A: groupByPhase ────────────────────────────────────────────────
  // Pure function: returns [{phase, events}] in phase order.
  // Each event lands in the phase whose range[start..end] (by events array index
  // order, keyed by event id) contains it.
  function groupByPhase(events, phases) {
    // Build id → array-index map for O(1) range lookups
    var idToIdx = {};
    events.forEach(function (ev, i) { idToIdx[ev.id] = i; });

    return phases.map(function (ph) {
      var startIdx = idToIdx[ph.range[0]];
      var endIdx   = idToIdx[ph.range[1]];
      var phaseEvents = events.filter(function (ev, i) {
        return i >= startIdx && i <= endIdx;
      });
      return { phase: ph, events: phaseEvents };
    });
  }

  // ── Feature B: computeStats reads annotations ─────────────────────────────
  function computeStats(events) {
    var annotations = ((global.UL_TRACE || {}).annotations) || [];
    var annotatedIds = new Set(
      annotations
        .filter(function (a) { return a.scope === 'event'; })
        .map(function (a) { return a.eventId; })
    );
    return {
      events: events.length,
      actors: new Set(events.flatMap(e => [e.from, e.to])).size,
      toolCalls: events.filter(e => e.kind === 'TOOL_CALL').length,
      fabricated: events.filter(e => e.fabricated).length,
      annotated: annotatedIds.size,
    };
  }

  const KIND_COLOR = { MESSAGE: '#3fb950', TOOL_CALL: '#58a6ff', TOOL_RESULT: '#8b949e' };

  // ── Annotation severity label map ─────────────────────────────────────────
  const SEV_LABEL = { 1: 'NOTE', 2: 'WARNING', 3: 'CRITICAL' };

  function renderEventCard(ev, opts) {
    opts = opts || {};
    const icons = global.UL_ICONS;
    const dotColor = ev.isError ? '#f85149' : (KIND_COLOR[ev.kind] || '#8b949e');
    const kindLabel = ev.kind.replace(/_/g, ' ');
    const kindColor = KIND_COLOR[ev.kind] || '#8b949e';
    const actors = (global.UL_TRACE || {}).actors || {};
    const fromColor = (actors[ev.from] || {}).color || '#8b949e';
    const toColor = (actors[ev.to] || {}).color || '#8b949e';
    const anyTrunc = ev.parts.some(function (x) { return x.truncatedUpstream; });
    const parts = ev.parts.map(function (p) {
      const ic = icons[icons._forPart(p.partKind, ev.isError)];
      const full = p.content || '';
      const isLong = full.length > 140;
      // Under the truncated-fallback, content===preview, so do NOT offer a useless expand
      // when truncatedUpstream is set; show a source-truncation note instead.
      const canExpand = isLong && !p.truncatedUpstream;
      const shown = (opts.expanded || !isLong) ? full : (p.preview || full.slice(0, 140) + '…');
      return '<div class="part-row">' +
        '<span class="part-icon" style="color:' + kindColor + '">' + ic + '</span>' +
        '<span class="part-kind">' + esc(p.partKind) + '</span>' +
        '<span class="part-content' + (ev.isError ? ' error-text' : '') + '" data-full="' + esc(full) + '">' + esc(shown) + '</span>' +
        (canExpand ? '<button class="ul-expand" data-ev="' + esc(ev.id) + '" aria-expanded="' + (opts.expanded ? 'true' : 'false') + '">' + icons.chevron + '<span>' + (opts.expanded ? 'Less' : 'More') + '</span></button>' : '') +
        '</div>';
    }).join('');
    const truncNote = anyTrunc ? '<div class="ul-trunc-note">content truncated in source</div>' : '';
    const parent = ev.causalParent ? '<a class="parent-ref" href="#' + esc(ev.causalParent) + '">↑ caused by ' + esc(ev.causalParent) + '</a>' : '';

    // ── Feature B: per-event annotation callouts ───────────────────────────
    var annotations = ((global.UL_TRACE || {}).annotations) || [];
    var evAnnotations = annotations.filter(function (a) {
      return a.scope === 'event' && a.eventId === ev.id;
    });
    var annotationHtml = evAnnotations.map(function (a) {
      var sevLabel = SEV_LABEL[a.severity] || String(a.severity);
      return '<div class="annotation-callout">' +
        '<div class="ann-header">' +
        '<span class="ann-sev sev-' + esc(String(a.severity)) + '">' + esc(sevLabel) + '</span>' +
        '<span class="ann-category">· ' + esc(a.category) + '</span>' +
        '</div>' +
        '<div class="ann-explanation">' + esc(a.explanation) + '</div>' +
        '</div>';
    }).join('');
    var hasEvAnnotation = evAnnotations.length > 0;

    return '<div class="tl-event" id="' + esc(ev.id) + '" data-kind="' + esc(ev.kind) + '" data-from="' + esc(ev.from) + '" data-to="' + esc(ev.to) + '" data-phase="' + esc(ev.phase) + '">' +
      '<div class="tl-dot" style="background:' + dotColor + '"></div>' +
      '<div class="tl-card' + (ev.isError ? ' error' : '') + (ev.fabricated ? ' fabricated' : '') + (hasEvAnnotation ? ' annotated' : '') + '">' +
      '<div class="card-header">' +
      '<span class="ev-kind-badge" style="background:' + kindColor + '22;color:' + kindColor + ';border:1px solid ' + kindColor + '55">' + esc(kindLabel) + '</span>' +
      '<span class="actor-badge" style="color:' + fromColor + '">' + esc(ev.from) + '</span>' +
      '<span class="arrow">→</span>' +
      '<span class="actor-badge" style="color:' + toColor + '">' + esc(ev.to) + '</span>' +
      '<span class="ev-index">' + esc(ev.id) + '</span>' +
      '</div>' +
      parent + parts + truncNote + annotationHtml +
      '</div>' +
      '</div>';
  }

  // ── Feature A: renderTimeline with phase segmentation ─────────────────────
  function renderTimeline(events, opts) {
    opts = opts || {};
    var T = global.UL_TRACE;
    if (!T || !T.phases || !T.phases.length) {
      // Fallback: no phases defined, render flat
      return '<div class="tl-rail"></div>' + events.map(function (e) { return renderEventCard(e, opts); }).join('');
    }
    var groups = groupByPhase(events, T.phases);
    var icons = global.UL_ICONS;
    var groupsHtml = groups.map(function (g) {
      var eventsHtml = g.events.map(function (e) { return renderEventCard(e, opts); }).join('');
      var count = g.events.length;
      return '<div class="phase-group" data-phase-id="' + esc(g.phase.id) + '">' +
        '<div class="phase-header">' +
        '<span class="ph-chevron">' + icons.chevron + '</span>' +
        '<span>' + esc(g.phase.label) + '</span>' +
        '<span class="phase-count">' + count + ' event' + (count !== 1 ? 's' : '') + '</span>' +
        '</div>' +
        eventsHtml +
        '</div>';
    }).join('');
    return '<div class="tl-rail"></div>' + groupsHtml;
  }

  // ── Task 4: renderIntro ───────────────────────────────────────────────────
  function renderIntro(intro) {
    var icons = global.UL_ICONS;
    return '<details open class="ul-intro" style="max-width:860px;margin:0 auto 20px;background:#161b22;border:1px solid #30363d;border-radius:8px;padding:14px 18px;">' +
      '<summary style="cursor:pointer;font-size:13px;font-weight:600;color:#e6edf3;list-style:none;display:flex;align-items:center;gap:8px;">' +
      '<span style="color:#58a6ff;flex-shrink:0;">' + icons.info + '</span>' +
      'About this trace' +
      '</summary>' +
      '<div style="margin-top:12px;display:flex;flex-direction:column;gap:12px;">' +
      '<div><div style="font-size:11px;font-weight:700;color:#3fb950;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;">What</div>' +
      '<p style="font-size:13px;color:#e6edf3;line-height:1.6;margin:0;">' + esc(intro.what) + '</p></div>' +
      '<div><div style="font-size:11px;font-weight:700;color:#3fb950;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;">How to read it</div>' +
      '<p style="font-size:13px;color:#e6edf3;line-height:1.6;margin:0;">' + esc(intro.read) + '</p></div>' +
      '<div><div style="font-size:11px;font-weight:700;color:#ffa657;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;">What to watch for</div>' +
      '<p style="font-size:13px;color:#e6edf3;line-height:1.6;margin:0;">' + esc(intro.watch) + '</p></div>' +
      '</div>' +
      '</details>';
  }

  // ── Task 9: renderIntent ──────────────────────────────────────────────────
  function renderIntent(intent) {
    return '<div class="intent-box">' +
      '<span class="intent-label">INTENT</span>' +
      '<span style="font-size:13px;color:#e6edf3;">' + esc(intent.plain) + '</span>' +
      '<details class="ul-intent-diff" style="margin-top:10px;">' +
      '<summary style="cursor:pointer;font-size:12px;color:#58a6ff;font-weight:600;">Gold patch (diff)</summary>' +
      '<pre style="margin-top:8px;font-size:12px;font-family:\'SF Mono\',\'Fira Code\',monospace;color:#a5d6ff;white-space:pre-wrap;word-break:break-all;background:#0d1117;border:1px solid #21262d;border-radius:4px;padding:10px;overflow:auto;">' + esc(intent.raw) + '</pre>' +
      '</details>' +
      '<div style="margin-top:10px;font-size:12px;color:#8b949e;line-height:1.5;">' +
      '<span style="font-weight:600;color:#e6edf3;">Issue: </span>' + esc(intent.issue) +
      '</div>' +
      '<div style="margin-top:6px;font-size:12px;color:#8b949e;line-height:1.5;">' +
      '<span style="font-weight:600;color:#e6edf3;">Success criteria: </span>' + esc(intent.successCriteria) +
      '</div>' +
      '</div>';
  }

  // ── Task 5: renderGlossary + _wireGlossary ────────────────────────────────
  function renderGlossary(glossary) {
    return glossary.map(function (g) {
      return '<div class="ul-gloss-term">' + esc(g.term) + '</div>' +
        '<div class="ul-gloss-def">' + esc(g.def) + '</div>';
    }).join('');
  }

  function _wireGlossary() {
    var btn = document.querySelector('.ul-legend-btn');
    var panel = document.querySelector('.ul-legend-panel');
    if (!btn || !panel) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      panel.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (!panel.contains(e.target) && e.target !== btn) {
        panel.classList.remove('open');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') panel.classList.remove('open');
    });
  }

  // ── Task 7: renderScenario ────────────────────────────────────────────────
  function renderScenario(scenario, annotations) {
    var icons = global.UL_ICONS;
    var traceAnn = (annotations || []).find(function (a) { return a.scope === 'trace'; });
    var verdictHtml = traceAnn
      ? '<div class="annotation-callout">' +
        '<div class="ann-header">' +
        '<span class="ann-sev sev-' + esc(String(traceAnn.severity)) + '">' + esc({ 1: 'NOTE', 2: 'WARNING', 3: 'CRITICAL' }[traceAnn.severity] || String(traceAnn.severity)) + '</span>' +
        '<span class="ann-category">· ' + esc(traceAnn.category) + '</span>' +
        '</div>' +
        '<div class="ann-explanation">' + esc(traceAnn.explanation) + '</div>' +
        '</div>'
      : '';
    var paragraphsHtml = (scenario.paragraphs || []).map(function (p) {
      return '<p style="font-size:13px;color:#e6edf3;line-height:1.6;margin:0 0 10px 0;">' + esc(p) + '</p>';
    }).join('');
    return '<div class="trace-ann-section">' +
      '<div class="section-title">' +
      '<span style="color:#ffa657;margin-right:6px;">' + icons.warn + '</span>' +
      'Trace-level verdict' +
      '</div>' +
      verdictHtml +
      '<details class="ul-scenario" style="margin-top:14px;">' +
      '<summary style="cursor:pointer;font-size:12px;color:#58a6ff;font-weight:600;">Why this is the \'misleading\' scenario</summary>' +
      '<div style="margin-top:10px;">' + paragraphsHtml + '</div>' +
      '</details>' +
      '</div>';
  }

  function renderSummary(stats) {
    function card(n, label, warn) {
      return '<div class="summary-card"><div class="summary-num ' + (warn ? 'num-warn' : 'num-ok') + '">' + n + '</div><div class="summary-label">' + label + '</div></div>';
    }
    return card(stats.events, 'Events') +
      card(stats.actors, 'Actors') +
      card(stats.toolCalls, 'Tool Calls') +
      card(stats.fabricated, 'Fabricated', stats.fabricated > 0) +
      card(stats.annotated, 'Annotated Events');
  }

  // ── Feature C: expand toggle ───────────────────────────────────────────────
  // Track per-event expanded state
  var _expandState = {};

  function _toggleExpand(evId) {
    var T = global.UL_TRACE;
    if (!T) return;
    var ev = T.events.find(function (e) { return e.id === evId; });
    if (!ev) return;
    var wasExpanded = !!_expandState[evId];
    _expandState[evId] = !wasExpanded;
    var node = document.getElementById(evId);
    if (!node) return;
    node.outerHTML = renderEventCard(ev, { expanded: !wasExpanded });
    // Re-wire the replaced node (it's now a new DOM element)
    _wire();
  }

  // ── Event delegation wiring ────────────────────────────────────────────────
  var _wired = false;
  function _wire() {
    var tEl = document.getElementById('ul-timeline');
    if (!tEl || _wired) return;
    _wired = true;

    tEl.addEventListener('click', function (e) {
      // Phase header collapse toggle
      var header = e.target.closest && e.target.closest('.phase-header');
      if (header) {
        var group = header.closest('.phase-group');
        if (group) group.classList.toggle('collapsed');
        return;
      }
      // Expand/collapse individual card parts
      var expandBtn = e.target.closest && e.target.closest('.ul-expand');
      if (expandBtn) {
        var evId = expandBtn.getAttribute('data-ev');
        if (evId) _toggleExpand(evId);
        return;
      }
    });
  }

  function mount() {
    var T = global.UL_TRACE;
    if (!T) return;

    // Inject legend/glossary CSS once
    if (!document.getElementById('ul-legend-css') && typeof document !== 'undefined') {
      var styleEl = document.createElement('style');
      styleEl.id = 'ul-legend-css';
      styleEl.textContent = [
        '.ul-legend-btn{position:fixed;bottom:20px;right:20px;z-index:50;background:#161b22;border:1px solid #30363d;color:#e6edf3;border-radius:20px;padding:8px 14px;font-size:12px;cursor:pointer;display:inline-flex;align-items:center;gap:6px}',
        '.ul-legend-btn:hover{border-color:#58a6ff}',
        '.ul-legend-panel{position:fixed;bottom:64px;right:20px;z-index:50;width:320px;max-height:60vh;overflow:auto;background:#161b22;border:1px solid #30363d;border-radius:8px;padding:16px;display:none}',
        '.ul-legend-panel.open{display:block}',
        '.ul-gloss-term{font-weight:600;color:#e6edf3;font-size:12px;margin-top:10px}',
        '.ul-gloss-def{color:#8b949e;font-size:12px;line-height:1.5}'
      ].join('');
      document.head && document.head.appendChild(styleEl);
    }

    // Task 4: intro panel
    var introEl = document.getElementById('ul-intro');
    if (introEl && T.intro) introEl.innerHTML = renderIntro(T.intro);

    // Task 9: enriched intent
    var intentEl = document.getElementById('ul-intent');
    if (intentEl && T.intent) intentEl.innerHTML = renderIntent(T.intent);

    // Summary + timeline
    var sEl = document.getElementById('ul-summary');
    if (sEl) sEl.innerHTML = renderSummary(computeStats(T.events));
    var tEl = document.getElementById('ul-timeline');
    if (tEl) tEl.innerHTML = renderTimeline(T.events);

    // Task 7: scenario panel
    var panelsEl = document.getElementById('ul-panels');
    if (panelsEl && T.scenario) panelsEl.innerHTML = renderScenario(T.scenario, T.annotations);

    // Task 5: glossary legend button + panel
    if (typeof document !== 'undefined') {
      var icons = global.UL_ICONS;
      var legendBtn = document.createElement('button');
      legendBtn.className = 'ul-legend-btn';
      legendBtn.setAttribute('aria-label', 'Toggle glossary legend');
      legendBtn.innerHTML = icons.info + ' Legend';
      var legendPanel = document.createElement('div');
      legendPanel.className = 'ul-legend-panel';
      legendPanel.innerHTML = '<div style="font-size:13px;font-weight:600;color:#e6edf3;margin-bottom:8px;">Schema Legend</div>' +
        renderGlossary(T.glossary || []);
      document.body.appendChild(legendBtn);
      document.body.appendChild(legendPanel);
    }

    _wire();
    _wireGlossary();
  }

  var UL = {
    computeStats: computeStats,
    groupByPhase: groupByPhase,
    renderEventCard: renderEventCard,
    renderTimeline: renderTimeline,
    renderSummary: renderSummary,
    renderIntro: renderIntro,
    renderIntent: renderIntent,
    renderGlossary: renderGlossary,
    renderScenario: renderScenario,
    mount: mount,
    esc: esc,
    _toggleExpand: _toggleExpand,
    _wire: _wire,
    _wireGlossary: _wireGlossary,
  };
  global.UL = UL;
  if (typeof module !== 'undefined') module.exports = UL;
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', mount);
})(typeof window !== 'undefined' ? window : globalThis);
