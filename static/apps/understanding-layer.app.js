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

  function computeStats(events) {
    return {
      events: events.length,
      actors: new Set(events.flatMap(e => [e.from, e.to])).size,
      toolCalls: events.filter(e => e.kind === 'TOOL_CALL').length,
      fabricated: events.filter(e => e.fabricated).length,
      annotated: 0,
    };
  }

  const KIND_COLOR = { MESSAGE: '#3fb950', TOOL_CALL: '#58a6ff', TOOL_RESULT: '#8b949e' };

  function renderEventCard(ev, opts) {
    opts = opts || {};
    const icons = global.UL_ICONS;
    const dotColor = ev.isError ? '#f85149' : (KIND_COLOR[ev.kind] || '#8b949e');
    const kindLabel = ev.kind.replace('_', ' ');
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
        (canExpand ? '<button class="ul-expand" data-ev="' + ev.id + '" aria-expanded="' + (opts.expanded ? 'true' : 'false') + '">' + icons.chevron + '<span>' + (opts.expanded ? 'Less' : 'More') + '</span></button>' : '') +
        '</div>';
    }).join('');
    const truncNote = anyTrunc ? '<div class="ul-trunc-note">content truncated in source</div>' : '';
    const parent = ev.causalParent ? '<a class="parent-ref" href="#' + ev.causalParent + '">↑ caused by ' + ev.causalParent + '</a>' : '';
    return '<div class="tl-event" id="' + ev.id + '" data-kind="' + ev.kind + '" data-from="' + ev.from + '" data-to="' + ev.to + '" data-phase="' + ev.phase + '">' +
      '<div class="tl-dot" style="background:' + dotColor + '"></div>' +
      '<div class="tl-card' + (ev.isError ? ' error' : '') + (ev.fabricated ? ' fabricated' : '') + '">' +
      '<div class="card-header">' +
      '<span class="ev-kind-badge" style="background:' + kindColor + '22;color:' + kindColor + ';border:1px solid ' + kindColor + '55">' + esc(kindLabel) + '</span>' +
      '<span class="actor-badge" style="color:' + fromColor + '">' + esc(ev.from) + '</span>' +
      '<span class="arrow">→</span>' +
      '<span class="actor-badge" style="color:' + toColor + '">' + esc(ev.to) + '</span>' +
      '<span class="ev-index">' + ev.id + '</span>' +
      '</div>' +
      parent + parts + truncNote +
      '</div>' +
      '</div>';
  }

  function renderTimeline(events, opts) {
    opts = opts || {};
    return '<div class="tl-rail"></div>' + events.map(function (e) { return renderEventCard(e, opts); }).join('');
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

  function mount() {
    var T = global.UL_TRACE;
    var sEl = document.getElementById('ul-summary');
    if (sEl) sEl.innerHTML = renderSummary(computeStats(T.events));
    var tEl = document.getElementById('ul-timeline');
    if (tEl) tEl.innerHTML = renderTimeline(T.events);
  }

  var UL = { computeStats: computeStats, renderEventCard: renderEventCard, renderTimeline: renderTimeline, renderSummary: renderSummary, mount: mount, esc: esc };
  global.UL = UL;
  if (typeof module !== 'undefined') module.exports = UL;
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', mount);
})(typeof window !== 'undefined' ? window : globalThis);
