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
  // Each event lands in the phase named by its own `phase` field. Keying off the
  // event's phase id (not range-boundary index lookup) keeps grouping correct for
  // any SUBSET of events — essential for filtered/searched views, where a phase's
  // boundary events may have been filtered out.
  function groupByPhase(events, phases) {
    return phases.map(function (ph) {
      var phaseEvents = events.filter(function (ev) { return ev.phase === ph.id; });
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

  // ── Task 13: commentaryFor ────────────────────────────────────────────────
  // Pure: returns commentary string for an event id, or undefined.
  function commentaryFor(eventId) {
    var commentary = ((global.UL_TRACE || {}).commentary) || {};
    return commentary[eventId];
  }

  // ── Task 15: renderDiff ───────────────────────────────────────────────────
  // Pure: converts a unified diff string to syntax-highlighted HTML.
  function renderDiff(diffText) {
    var lines = String(diffText).split('\n');
    var linesHtml = lines.map(function (line) {
      var cls;
      if (/^diff --git/.test(line) || /^index /.test(line) || /^\+\+\+/.test(line) || /^---/.test(line)) {
        cls = 'diff-meta';
      } else if (/^@@/.test(line)) {
        cls = 'diff-hunk';
      } else if (/^\+/.test(line)) {
        cls = 'diff-add';
      } else if (/^-/.test(line)) {
        cls = 'diff-del';
      } else {
        cls = 'diff-ctx';
      }
      return '<div class="diff-line ' + cls + '">' + esc(line) + '</div>';
    }).join('');
    return '<div class="ul-diff">' + linesHtml + '</div>';
  }

  // ── Task 16: markErrorChains ──────────────────────────────────────────────
  // Pure: returns [{chainId, eventIds, tool}] for error→retry sequences.
  function markErrorChains(events) {
    // Build a map of event id → event for fast lookup
    var byId = {};
    events.forEach(function (ev) { byId[ev.id] = ev; });

    var chains = [];
    var chainId = 0;
    var visited = new Set();

    events.forEach(function (ev) {
      // Find TOOL_RESULT events that are errors
      if (ev.kind !== 'TOOL_RESULT' || !ev.isError || visited.has(ev.id)) return;

      // Determine the tool that produced this error: it's ev.from
      var tool = ev.from;

      // Collect the contiguous run of events involving this same tool
      // Walk backwards to find the start of the run (the originating TOOL_CALL)
      // and forward to find the end (last result from same tool in this run).
      // Strategy: gather all events in the same phase that involve this tool.
      var phase = ev.phase;
      var runEvents = events.filter(function (e) {
        return e.phase === phase && (e.from === tool || e.to === tool);
      });

      if (runEvents.length < 2) return; // need at least call + error result

      // Only include a chain if there's at least one error and at least one retry
      // (i.e., more than one TOOL_CALL to the same tool in this run)
      var callsInRun = runEvents.filter(function (e) { return e.kind === 'TOOL_CALL' && e.to === tool; });
      var errorsInRun = runEvents.filter(function (e) { return e.kind === 'TOOL_RESULT' && e.isError && e.from === tool; });

      if (callsInRun.length < 2 || errorsInRun.length < 1) return;

      var ids = runEvents.map(function (e) { return e.id; });
      // Avoid duplicate chains: skip if all ids already visited
      if (ids.every(function (id) { return visited.has(id); })) return;

      ids.forEach(function (id) { visited.add(id); });
      chains.push({ chainId: 'chain-' + (++chainId), eventIds: ids, tool: tool });
    });

    return chains;
  }

  // ── Annotation severity label map ─────────────────────────────────────────
  const SEV_LABEL = { 1: 'NOTE', 2: 'WARNING', 3: 'CRITICAL' };

  // ── Task 10/11/12: _highlight helper ─────────────────────────────────────
  // Wraps all case-insensitive occurrences of query (already html-escaped) in
  // the already-escaped content string with <mark>. Call AFTER esc().
  function _highlight(escapedText, query) {
    if (!query) return escapedText;
    var escapedQuery = esc(query);
    if (!escapedQuery) return escapedText;
    // Build a regex from the escaped query (escape regex special chars in escaped form)
    var regexSrc = escapedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      var re = new RegExp(regexSrc, 'gi');
      return escapedText.replace(re, function (m) {
        return '<mark>' + m + '</mark>';
      });
    } catch (e) {
      return escapedText;
    }
  }

  function renderEventCard(ev, opts) {
    opts = opts || {};
    var query = opts.query || '';
    var icons = global.UL_ICONS;
    var dotColor = ev.isError ? '#f85149' : (KIND_COLOR[ev.kind] || '#8b949e');
    var kindLabel = ev.kind.replace(/_/g, ' ');
    var kindColor = KIND_COLOR[ev.kind] || '#8b949e';
    var actors = (global.UL_TRACE || {}).actors || {};
    var fromColor = (actors[ev.from] || {}).color || '#8b949e';
    var toColor = (actors[ev.to] || {}).color || '#8b949e';
    var anyTrunc = ev.parts.some(function (x) { return x.truncatedUpstream; });
    var parts = ev.parts.map(function (p) {
      var ic = icons[icons._forPart(p.partKind, ev.isError)];
      var full = p.content || '';
      var isLong = full.length > 140;
      // Under the truncated-fallback, content===preview, so do NOT offer a useless expand
      // when truncatedUpstream is set; show a source-truncation note instead.
      var canExpand = isLong && !p.truncatedUpstream;
      var shown = (opts.expanded || !isLong) ? full : (p.preview || full.slice(0, 140) + '…');
      var shownEscaped = esc(shown);
      if (query) shownEscaped = _highlight(shownEscaped, query);
      return '<div class="part-row">' +
        '<span class="part-icon" style="color:' + kindColor + '">' + ic + '</span>' +
        '<span class="part-kind">' + esc(p.partKind) + '</span>' +
        '<span class="part-content' + (ev.isError ? ' error-text' : '') + '" data-full="' + esc(full) + '">' + shownEscaped + '</span>' +
        (canExpand ? '<button class="ul-expand" data-ev="' + esc(ev.id) + '" aria-expanded="' + (opts.expanded ? 'true' : 'false') + '">' + icons.chevron + '<span>' + (opts.expanded ? 'Less' : 'More') + '</span></button>' : '') +
        '</div>';
    }).join('');
    var truncNote = anyTrunc ? '<div class="ul-trunc-note">content truncated in source</div>' : '';
    var parent = ev.causalParent ? '<a class="parent-ref" href="#' + esc(ev.causalParent) + '">↑ caused by ' + esc(ev.causalParent) + '</a>' : '';

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

    // ── Task 13: per-event commentary callout ─────────────────────────────
    var commentaryText = commentaryFor(ev.id);
    var commentaryHtml = commentaryText
      ? '<details class="ul-commentary">' +
        '<summary>' + (global.UL_ICONS ? global.UL_ICONS.info : '') + ' Why this matters</summary>' +
        '<div>' + esc(commentaryText) + '</div>' +
        '</details>'
      : '';

    // ── Task 16: error chain class and label ─────────────────────────────
    var inChain = opts.chainedIds && opts.chainedIds.has(ev.id);
    var isChainFirst = opts.chainFirstIds && opts.chainFirstIds.has(ev.id);
    var chainCountMap = opts.chainCountMap || {};
    var chainLabelHtml = '';
    if (isChainFirst) {
      var chainId = null;
      // Find which chain this event is first in
      if (opts.chainsList) {
        for (var ci = 0; ci < opts.chainsList.length; ci++) {
          if (opts.chainsList[ci].eventIds[0] === ev.id) {
            chainId = opts.chainsList[ci].chainId;
            break;
          }
        }
      }
      var retryCount = chainId && chainCountMap[chainId] ? chainCountMap[chainId] : '';
      chainLabelHtml = '<div class="error-chain-label">retry' + (retryCount ? ' ×' + retryCount : '') + '</div>';
    }

    return '<div class="tl-event" id="' + esc(ev.id) + '" data-kind="' + esc(ev.kind) + '" data-from="' + esc(ev.from) + '" data-to="' + esc(ev.to) + '" data-phase="' + esc(ev.phase) + '">' +
      '<div class="tl-dot" style="background:' + dotColor + '"></div>' +
      '<div class="tl-card' + (ev.isError ? ' error' : '') + (ev.fabricated ? ' fabricated' : '') + (hasEvAnnotation ? ' annotated' : '') + (inChain ? ' in-error-chain' : '') + '">' +
      chainLabelHtml +
      '<div class="card-header">' +
      '<span class="ev-kind-badge" style="background:' + kindColor + '22;color:' + kindColor + ';border:1px solid ' + kindColor + '55">' + esc(kindLabel) + '</span>' +
      '<span class="actor-badge" style="color:' + fromColor + '">' + esc(ev.from) + '</span>' +
      '<span class="arrow">→</span>' +
      '<span class="actor-badge" style="color:' + toColor + '">' + esc(ev.to) + '</span>' +
      '<span class="ev-index">' + esc(ev.id) + '</span>' +
      '</div>' +
      parent + parts + truncNote + annotationHtml + commentaryHtml +
      '</div>' +
      '</div>';
  }

  // ── Feature A: renderTimeline with phase segmentation ─────────────────────
  // Empty phase groups are omitted (no header emitted).
  function renderTimeline(events, opts) {
    opts = opts || {};
    var T = global.UL_TRACE;

    // ── Task 16: compute error chains from the FULL trace (not just filtered)
    // so chain membership is stable across filter changes.
    var allEvents = T ? (T.events || []) : events;
    var chains = markErrorChains(allEvents);
    var chainedIds = new Set();
    var chainFirstIds = new Set();
    var chainCountMap = {};
    chains.forEach(function (chain) {
      chain.eventIds.forEach(function (id) { chainedIds.add(id); });
      if (chain.eventIds.length > 0) chainFirstIds.add(chain.eventIds[0]);
      // Count retries = number of TOOL_CALLs to the tool after the first one
      var callCount = allEvents.filter(function (e) {
        return chain.eventIds.indexOf(e.id) !== -1 && e.kind === 'TOOL_CALL' && e.to === chain.tool;
      }).length;
      chainCountMap[chain.chainId] = callCount > 1 ? callCount - 1 : 1;
    });
    var chainOpts = Object.assign({}, opts, {
      chainedIds: chainedIds,
      chainFirstIds: chainFirstIds,
      chainCountMap: chainCountMap,
      chainsList: chains
    });

    if (!T || !T.phases || !T.phases.length) {
      // Fallback: no phases defined, render flat
      return '<div class="tl-rail"></div>' + events.map(function (e) { return renderEventCard(e, chainOpts); }).join('');
    }
    var groups = groupByPhase(events, T.phases);
    var icons = global.UL_ICONS;
    var groupsHtml = groups.map(function (g) {
      // Task 10/11/12: skip empty phase groups (filtered views)
      if (g.events.length === 0) return '';
      var eventsHtml = g.events.map(function (e) { return renderEventCard(e, chainOpts); }).join('');
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

  // ── Task 14: renderMinimap ────────────────────────────────────────────────
  // Pure-ish: returns HTML string. One dot per event, colored by kind (red if error).
  function renderMinimap(events) {
    var dots = events.map(function (ev) {
      var color = ev.isError ? '#f85149' : (KIND_COLOR[ev.kind] || '#8b949e');
      return '<a href="#' + esc(ev.id) + '" class="ul-mini-dot" data-ev="' + esc(ev.id) + '" title="' + esc(ev.id) + ' ' + esc(ev.kind) + '" style="background:' + color + '"></a>';
    }).join('');
    return dots;
  }

  // ── Task 12: searchEvents ─────────────────────────────────────────────────
  // Pure: case-insensitive substring match across part.content, id, from, to.
  function searchEvents(events, query) {
    if (!query) return events;
    var q = query.toLowerCase();
    return events.filter(function (ev) {
      if (ev.id.toLowerCase().indexOf(q) !== -1) return true;
      if (ev.from.toLowerCase().indexOf(q) !== -1) return true;
      if (ev.to.toLowerCase().indexOf(q) !== -1) return true;
      return ev.parts.some(function (p) {
        return p.content && p.content.toLowerCase().indexOf(q) !== -1;
      });
    });
  }

  // ── Tasks 10/11/12: applyFilters ──────────────────────────────────────────
  // Pure: filter events by kind set, actor set, and text query. AND semantics.
  // kinds: Set or array; empty/undefined = all kinds.
  // actors: Set or array; empty/undefined = no actor filter (all pass).
  // query: string; empty/undefined = no text filter.
  function applyFilters(events, state) {
    state = state || {};
    var kinds = state.kinds;
    var actors = state.actors;
    var query = state.query || '';

    // Normalize kinds
    var kindsArr = kinds ? Array.from(kinds) : [];
    var filterKinds = kindsArr.length > 0;

    // Normalize actors
    var actorsArr = actors ? Array.from(actors) : [];
    var filterActors = actorsArr.length > 0;

    var filtered = events;

    if (filterKinds) {
      var kindsSet = new Set(kindsArr);
      filtered = filtered.filter(function (ev) { return kindsSet.has(ev.kind); });
    }

    if (filterActors) {
      var actorsSet = new Set(actorsArr);
      filtered = filtered.filter(function (ev) {
        return actorsSet.has(ev.from) || actorsSet.has(ev.to);
      });
    }

    if (query) {
      filtered = searchEvents(filtered, query);
    }

    return filtered;
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
    var diffContent = (intent.kind === 'diff' && intent.raw)
      ? renderDiff(intent.raw)
      : '<pre style="margin-top:8px;font-size:12px;font-family:\'SF Mono\',\'Fira Code\',monospace;color:#a5d6ff;white-space:pre-wrap;word-break:break-all;background:#0d1117;border:1px solid #21262d;border-radius:4px;padding:10px;overflow:auto;">' + esc(intent.raw) + '</pre>';
    return '<div class="intent-box">' +
      '<span class="intent-label">INTENT</span>' +
      '<span style="font-size:13px;color:#e6edf3;">' + esc(intent.plain) + '</span>' +
      '<details class="ul-intent-diff" style="margin-top:10px;">' +
      '<summary style="cursor:pointer;font-size:12px;color:#58a6ff;font-weight:600;">Gold patch (diff)</summary>' +
      diffContent +
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

  // ── Tasks 10/11/12: Toolbar render ────────────────────────────────────────
  function renderToolbar(filterState, total) {
    var icons = global.UL_ICONS;
    var T = global.UL_TRACE;
    var actors = T ? Object.keys(T.actors || {}) : [];

    // Kind buttons
    var kindBtns = ['MESSAGE', 'TOOL_CALL', 'TOOL_RESULT'].map(function (k) {
      var color = KIND_COLOR[k] || '#8b949e';
      var label = k.replace(/_/g, ' ');
      var active = filterState.kinds.has(k);
      return '<button class="ul-kind-btn' + (active ? ' active' : '') + '" data-kind="' + esc(k) + '" style="border-color:' + color + ';color:' + color + '">' + esc(label) + '</button>';
    }).join('');

    // Actor dropdown items
    var actorItems = actors.map(function (id) {
      var color = ((T.actors || {})[id] || {}).color || '#8b949e';
      var checked = filterState.actors.size === 0 || filterState.actors.has(id);
      return '<label class="ul-actor-item">' +
        '<span class="ul-actor-dot" style="background:' + color + '"></span>' +
        '<input type="checkbox" class="ul-actor-cb" data-actor="' + esc(id) + '"' + (checked ? ' checked' : '') + '>' +
        esc(id) +
        '</label>';
    }).join('');

    var currentCount = total != null ? total : (T ? (T.events || []).length : 0);
    var totalCount = T ? (T.events || []).length : 0;

    return '<div class="ul-toolbar">' +
      '<div class="ul-kind-group">' + kindBtns + '</div>' +
      '<div class="ul-actor-dd">' +
        '<button class="ul-actor-btn" aria-expanded="false">Actors ' + (icons.chevron || '') + '</button>' +
        '<div class="ul-actor-menu">' + actorItems + '</div>' +
      '</div>' +
      '<div class="ul-search-wrap">' +
        '<span class="ul-search-icon">' + (icons.search || '') + '</span>' +
        '<input class="ul-search" type="search" placeholder="Search trace…" value="' + esc(filterState.query) + '" autocomplete="off">' +
      '</div>' +
      '<span class="ul-count">' + currentCount + ' / ' + totalCount + '</span>' +
    '</div>';
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
    node.outerHTML = renderEventCard(ev, { expanded: !wasExpanded, query: _filterState.query });
    // Re-wire the replaced node (it's now a new DOM element)
    _wire();
  }

  // ── Tasks 10/11/12/14: Filter state ───────────────────────────────────────
  var _filterState = {
    kinds: new Set(['MESSAGE', 'TOOL_CALL', 'TOOL_RESULT']),
    actors: new Set(),
    query: ''
  };

  // Debounce helper
  function _debounce(fn, delay) {
    var timer;
    return function () {
      var args = arguments;
      var ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(ctx, args); }, delay);
    };
  }

  // Apply filters and re-render timeline, minimap, and result count
  function _applyAndRender() {
    var T = global.UL_TRACE;
    if (!T) return;
    var filtered = applyFilters(T.events, _filterState);

    // Re-render timeline
    var tEl = document.getElementById('ul-timeline');
    if (tEl) tEl.innerHTML = renderTimeline(filtered, { query: _filterState.query });

    // Re-render minimap
    var mmEl = document.getElementById('ul-minimap');
    if (mmEl) {
      mmEl.innerHTML = renderMinimap(filtered);
      _wireMinimap();
    }

    // Update result count
    var countEl = document.querySelector('.ul-count');
    if (countEl) countEl.textContent = filtered.length + ' / ' + T.events.length;
  }

  // ── Task 14: minimap IntersectionObserver wiring ──────────────────────────
  var _miniObserver = null;

  function _wireMinimap() {
    // Guard: jsdom/Node may not have IntersectionObserver
    if (typeof IntersectionObserver === 'undefined') return;

    // Disconnect old observer if any
    if (_miniObserver) {
      _miniObserver.disconnect();
      _miniObserver = null;
    }

    var mmEl = document.getElementById('ul-minimap');
    if (!mmEl) return;

    _miniObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var evId = entry.target.id;
          // Find matching dot and mark it active
          var dots = mmEl.querySelectorAll('.ul-mini-dot');
          dots.forEach(function (d) {
            d.classList.toggle('active', d.getAttribute('data-ev') === evId);
          });
        }
      });
    }, { threshold: 0.5 });

    // Observe all event cards in timeline
    var tEl = document.getElementById('ul-timeline');
    if (tEl) {
      tEl.querySelectorAll('.tl-event').forEach(function (el) {
        _miniObserver.observe(el);
      });
    }
  }

  // ── Toolbar wiring ────────────────────────────────────────────────────────
  function _wireToolbar() {
    var toolbarEl = document.getElementById('ul-toolbar');
    if (!toolbarEl) return;

    // Kind toggle buttons
    toolbarEl.querySelectorAll('.ul-kind-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var kind = btn.getAttribute('data-kind');
        if (_filterState.kinds.has(kind)) {
          // Only remove if at least one other will remain
          if (_filterState.kinds.size > 1) {
            _filterState.kinds.delete(kind);
            btn.classList.remove('active');
          }
        } else {
          _filterState.kinds.add(kind);
          btn.classList.add('active');
        }
        _applyAndRender();
      });
    });

    // Actor dropdown toggle
    var actorBtn = toolbarEl.querySelector('.ul-actor-btn');
    var actorMenu = toolbarEl.querySelector('.ul-actor-menu');
    if (actorBtn && actorMenu) {
      actorBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var expanded = actorBtn.getAttribute('aria-expanded') === 'true';
        actorBtn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        actorMenu.classList.toggle('open', !expanded);
      });
      document.addEventListener('click', function (e) {
        if (!actorMenu.contains(e.target) && e.target !== actorBtn) {
          actorMenu.classList.remove('open');
          actorBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Actor checkboxes
    toolbarEl.querySelectorAll('.ul-actor-cb').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var actor = cb.getAttribute('data-actor');
        // Build set from all checked boxes
        var newActors = new Set();
        toolbarEl.querySelectorAll('.ul-actor-cb:checked').forEach(function (c) {
          newActors.add(c.getAttribute('data-actor'));
        });
        // If all checked = same as no filter
        var T = global.UL_TRACE;
        var allActors = T ? Object.keys(T.actors || {}) : [];
        if (newActors.size === allActors.length) {
          _filterState.actors = new Set();
        } else {
          _filterState.actors = newActors;
        }
        _applyAndRender();
      });
    });

    // Search input (debounced 150ms)
    var searchInput = toolbarEl.querySelector('.ul-search');
    if (searchInput) {
      var debouncedSearch = _debounce(function () {
        _filterState.query = searchInput.value;
        _applyAndRender();
      }, 150);
      searchInput.addEventListener('input', debouncedSearch);
    }
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
        // Existing legend styles
        '.ul-legend-btn{position:fixed;bottom:20px;right:20px;z-index:50;background:#161b22;border:1px solid #30363d;color:#e6edf3;border-radius:20px;padding:8px 14px;font-size:12px;cursor:pointer;display:inline-flex;align-items:center;gap:6px}',
        '.ul-legend-btn:hover{border-color:#58a6ff}',
        '.ul-legend-panel{position:fixed;bottom:64px;right:20px;z-index:50;width:320px;max-height:60vh;overflow:auto;background:#161b22;border:1px solid #30363d;border-radius:8px;padding:16px;display:none}',
        '.ul-legend-panel.open{display:block}',
        '.ul-gloss-term{font-weight:600;color:#e6edf3;font-size:12px;margin-top:10px}',
        '.ul-gloss-def{color:#8b949e;font-size:12px;line-height:1.5}',
        // Task 10/11/12: Toolbar
        '.ul-toolbar{display:flex;flex-direction:row;align-items:center;gap:10px;flex-wrap:wrap;margin:0 auto 16px;max-width:860px;}',
        '.ul-kind-group{display:flex;gap:6px;flex-wrap:wrap;}',
        '.ul-kind-btn{background:none;border:1px solid;border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700;letter-spacing:.06em;cursor:pointer;text-transform:uppercase;opacity:.4;transition:opacity .15s;}',
        '.ul-kind-btn.active{opacity:1;}',
        '.ul-kind-btn:hover{opacity:.85;}',
        // Actor dropdown
        '.ul-actor-dd{position:relative;}',
        '.ul-actor-btn{background:#161b22;border:1px solid #30363d;color:#e6edf3;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;}',
        '.ul-actor-btn:hover{border-color:#58a6ff;}',
        '.ul-actor-menu{display:none;position:absolute;top:calc(100% + 4px);left:0;z-index:60;background:#161b22;border:1px solid #30363d;border-radius:6px;padding:8px;min-width:140px;max-height:240px;overflow:auto;}',
        '.ul-actor-menu.open{display:block;}',
        '.ul-actor-item{display:flex;align-items:center;gap:6px;font-size:12px;color:#e6edf3;padding:4px 6px;cursor:pointer;border-radius:4px;white-space:nowrap;}',
        '.ul-actor-item:hover{background:#1c2128;}',
        '.ul-actor-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}',
        '.ul-actor-cb{cursor:pointer;}',
        // Search
        '.ul-search-wrap{position:relative;display:flex;align-items:center;}',
        '.ul-search-icon{position:absolute;left:8px;color:#8b949e;display:flex;align-items:center;pointer-events:none;}',
        '.ul-search{background:#0d1117;border:1px solid #30363d;color:#e6edf3;padding:5px 10px 5px 30px;border-radius:6px;font-size:12px;width:200px;outline:none;}',
        '.ul-search:focus{border-color:#58a6ff;}',
        '.ul-search::placeholder{color:#6e7681;}',
        // Result count
        '.ul-count{font-size:11px;color:#8b949e;white-space:nowrap;}',
        // Highlight mark
        'mark{background:#bb8009;color:#fff;border-radius:2px;padding:0 1px;}',
        // Task 14: Minimap
        '.ul-minimap{position:fixed;left:8px;top:80px;bottom:80px;width:14px;display:flex;flex-direction:column;gap:3px;overflow:hidden;z-index:40;}',
        '.ul-mini-dot{flex:1;min-height:3px;max-height:8px;border-radius:2px;opacity:.55;transition:opacity .15s;text-decoration:none;display:block;}',
        '.ul-mini-dot:hover,.ul-mini-dot.active{opacity:1;transform:scaleX(1.6);}',
        '@media(max-width:900px){.ul-minimap{display:none;}}',
        // Task 13: Commentary callout
        '.ul-commentary{margin-top:8px;font-size:12px}',
        '.ul-commentary summary{color:#58a6ff;cursor:pointer;list-style:none;display:inline-flex;align-items:center;gap:4px}',
        '.ul-commentary summary::-webkit-details-marker{display:none}',
        '.ul-commentary>div{color:#c9d1d9;margin-top:6px;padding-left:18px;border-left:2px solid #30363d}',
        // Task 15: Diff visualization
        '.ul-diff{font-family:\'SF Mono\',\'Fira Code\',monospace;font-size:12px;background:#0d1117;border:1px solid #30363d;border-radius:6px;overflow:auto;margin-top:6px}',
        '.diff-line{padding:0 10px;white-space:pre}',
        '.diff-add{background:#1f3a1f;color:#3fb950}',
        '.diff-del{background:#3a1f1f;color:#f85149}',
        '.diff-hunk{color:#58a6ff}',
        '.diff-meta{color:#8b949e}',
        '.diff-ctx{color:#c9d1d9}',
        // Task 16: Error chain
        '.tl-card.in-error-chain{box-shadow:-3px 0 0 #f8514944}',
        '.error-chain-label{font-size:10px;color:#f85149;font-weight:600;margin-bottom:4px;text-transform:uppercase;letter-spacing:.05em}'
      ].join('');
      document.head && document.head.appendChild(styleEl);
    }

    // Task 4: intro panel
    var introEl = document.getElementById('ul-intro');
    if (introEl && T.intro) introEl.innerHTML = renderIntro(T.intro);

    // Task 9: enriched intent
    var intentEl = document.getElementById('ul-intent');
    if (intentEl && T.intent) intentEl.innerHTML = renderIntent(T.intent);

    // Summary
    var sEl = document.getElementById('ul-summary');
    if (sEl) sEl.innerHTML = renderSummary(computeStats(T.events));

    // Tasks 10/11/12: Toolbar (between summary and timeline)
    var tbEl = document.getElementById('ul-toolbar');
    if (tbEl) {
      tbEl.innerHTML = renderToolbar(_filterState, T.events.length);
      _wireToolbar();
    }

    // Timeline (initial = all events, default filter state)
    var tEl = document.getElementById('ul-timeline');
    if (tEl) tEl.innerHTML = renderTimeline(T.events, { query: _filterState.query });

    // Task 14: Minimap
    var mmEl = document.getElementById('ul-minimap');
    if (mmEl) {
      mmEl.innerHTML = renderMinimap(T.events);
      _wireMinimap();
    }

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
    renderMinimap: renderMinimap,
    renderSummary: renderSummary,
    renderIntro: renderIntro,
    renderIntent: renderIntent,
    renderGlossary: renderGlossary,
    renderScenario: renderScenario,
    renderToolbar: renderToolbar,
    applyFilters: applyFilters,
    searchEvents: searchEvents,
    mount: mount,
    esc: esc,
    _highlight: _highlight,
    _toggleExpand: _toggleExpand,
    _wire: _wire,
    _wireGlossary: _wireGlossary,
    _applyAndRender: _applyAndRender,
    // Task 13
    commentaryFor: commentaryFor,
    // Task 15
    renderDiff: renderDiff,
    // Task 16
    markErrorChains: markErrorChains,
  };
  global.UL = UL;
  if (typeof module !== 'undefined') module.exports = UL;
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', mount);
})(typeof window !== 'undefined' ? window : globalThis);
