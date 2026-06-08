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
    var sEl = document.getElementById('ul-summary');
    if (sEl) sEl.innerHTML = renderSummary(computeStats(T.events));
    var tEl = document.getElementById('ul-timeline');
    if (tEl) tEl.innerHTML = renderTimeline(T.events);
    _wire();
  }

  var UL = {
    computeStats: computeStats,
    groupByPhase: groupByPhase,
    renderEventCard: renderEventCard,
    renderTimeline: renderTimeline,
    renderSummary: renderSummary,
    mount: mount,
    esc: esc,
    _toggleExpand: _toggleExpand,
    _wire: _wire,
  };
  global.UL = UL;
  if (typeof module !== 'undefined') module.exports = UL;
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', mount);
})(typeof window !== 'undefined' ? window : globalThis);
