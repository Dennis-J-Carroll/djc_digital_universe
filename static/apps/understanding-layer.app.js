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
    var trace = global.UL_TRACE || {};
    var annotations = trace.annotations || [];
    var annotatedIds = new Set(
      annotations
        .filter(function (a) { return a.scope === 'event'; })
        .map(function (a) { return a.eventId; })
    );
    return {
      events: events.length,
      actors: new Set(events.flatMap(e => [e.from, e.to])).size,
      toolCalls: events.filter(e => e.kind === 'TOOL_CALL').length,
      // SWE-agent events have no MCP declared-tool surface to compare.
      fabricated: trace.meta && trace.meta.fabricationAssessment === 'not-applicable'
        ? null : events.filter(e => e.fabricated === true).length,
      annotated: annotatedIds.size,
    };
  }

  const KIND_COLOR = { MESSAGE: '#3fb950', TOOL_CALL: '#58a6ff', TOOL_RESULT: '#8b949e' };

  // ── Task 13: commentaryFor ────────────────────────────────────────────────
  // Pure: returns a sourced reviewer note for an event id, or undefined.
  function commentaryFor(eventId) {
    var commentary = ((global.UL_TRACE || {}).commentary) || {};
    return commentary[eventId];
  }

  function renderEvidenceLinks(ids) {
    if (!ids || !ids.length) return '';
    return '<span class="ul-evidence">Evidence: ' + ids.map(function (id) {
      return '<a href="#' + esc(id) + '">' + esc(id) + '</a>';
    }).join(', ') + '</span>';
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
  // Pure: only adjacent same-tool calls after an observed failure count as retries.
  function markErrorChains(events) {
    var chains = [];
    events.forEach(function (error, index) {
      if (error.kind !== 'TOOL_RESULT' || !error.isError) return;
      var call = events[index - 1];
      var retry = events[index + 1];
      var retryResult = events[index + 2];
      if (!call || call.id !== error.causalParent || call.to !== error.from ||
          !retry || retry.kind !== 'TOOL_CALL' || retry.to !== error.from ||
          retry.phase !== error.phase) return;
      var ids = [call.id, error.id, retry.id];
      if (retryResult && retryResult.causalParent === retry.id) ids.push(retryResult.id);
      chains.push({ chainId: 'chain-' + (chains.length + 1), eventIds: ids, tool: error.from });
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
      // Never imply an upstream-truncated value can reveal more on expand.
      var canExpand = isLong && !p.truncatedUpstream;
      var shown = (opts.expanded || !isLong) ? full : (p.preview || full.slice(0, 140) + '…');
      var shownEscaped = esc(shown);
      if (query) shownEscaped = _highlight(shownEscaped, query);
      return '<div class="part-row">' +
        '<span class="part-icon" style="color:' + kindColor + '">' + ic + '</span>' +
        '<span class="part-kind">' + esc(p.partKind) + '</span>' +
        '<span class="part-content' + (ev.isError ? ' error-text' : '') + '">' + shownEscaped + '</span>' +
        (canExpand ? '<button class="ul-expand" data-ev="' + esc(ev.id) + '" aria-expanded="' + (opts.expanded ? 'true' : 'false') + '">' + icons.chevron + '<span>' + (opts.expanded ? 'Less' : 'More') + '</span></button>' : '') +
        '</div>';
    }).join('');
    var truncNote = anyTrunc ? '<div class="ul-trunc-note">content truncated in source</div>' : '';
    var parent = ev.causalParent ? '<a class="parent-ref" href="#' + esc(ev.causalParent) + '">↑ response to ' + esc(ev.causalParent) + '</a>' : '';

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
        '<div class="ul-note-meta">' + esc(a.basis || 'reviewer note') + ' · ' + renderEvidenceLinks(a.evidence) + '</div>' +
        '</div>';
    }).join('');
    var hasEvAnnotation = evAnnotations.length > 0;

    // ── Task 13: per-event commentary callout ─────────────────────────────
    var commentary = commentaryFor(ev.id);
    var commentaryHtml = commentary
      ? '<details class="ul-commentary">' +
        '<summary>' + (global.UL_ICONS ? global.UL_ICONS.info : '') + ' Why this matters</summary>' +
        '<div>' + esc(commentary.text) + '</div>' +
        '<div class="ul-note-meta">' + esc(commentary.basis) + ' · ' + renderEvidenceLinks(commentary.evidence) + '</div>' +
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
      // Task 21: phase summary for collapsed state
      var psum = summarizePhase(g);
      var psumParts = [count + ' event' + (count !== 1 ? 's' : '')];
      if (psum.toolCount > 0) psumParts.push(psum.toolCount + ' tool call' + (psum.toolCount !== 1 ? 's' : ''));
      if (psum.hasError) psumParts.push('errors');
      var psumText = psumParts.join(' · ');
      return '<div class="phase-group" data-phase-id="' + esc(g.phase.id) + '">' +
        '<button type="button" class="phase-header" aria-expanded="true" aria-controls="phase-events-' + esc(g.phase.id) + '">' +
        '<span class="ph-chevron">' + icons.chevron + '</span>' +
        '<span>' + esc(g.phase.label) + '</span>' +
        '<span class="phase-count">' + count + ' event' + (count !== 1 ? 's' : '') + '</span>' +
        '<span class="phase-summary">' + esc(psumText) + '</span>' +
        '</button>' +
        '<div class="phase-events" id="phase-events-' + esc(g.phase.id) + '">' + eventsHtml + '</div>' +
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

  // Source positions have an order, but no timestamps. Keep the map discrete.
  function renderEventMapDetail(ev, phases) {
    if (!ev) return '';
    var phase = (phases || []).find(function (item) { return item.id === ev.phase; });
    var excerpt = (ev.parts[0] && ev.parts[0].content || '').replace(/\s+/g, ' ').trim();
    if (excerpt.length > 170) excerpt = excerpt.slice(0, 170).trimEnd() + '…';
    var notes = ((global.UL_TRACE || {}).annotations || []).filter(function (a) {
      return a.scope === 'event' && a.eventId === ev.id;
    });
    var status = ev.isError ? 'Observed tool error' : notes.length ? 'Reviewer annotation attached' : 'No reviewer annotation';
    return '<div class="ul-map-detail-text">' +
      '<strong>' + esc(ev.id) + ' · ' + esc(ev.kind.replace(/_/g, ' ')) + '</strong>' +
      '<span>' + esc((phase || {}).label || ev.phase) + ' · ' + esc(ev.from) + ' → ' + esc(ev.to) +
      ' · source input #' + esc(ev.sourceIndex) + '</span>' +
      '<span>' + esc(status) + '</span>' +
      '<p>Preview: ' + esc(excerpt) + '</p>' +
      '</div><a class="ul-map-jump" href="#' + esc(ev.id) + '" data-ev="' + esc(ev.id) + '">Open full event ' + esc(ev.id) + ' ↓</a>';
  }

  function renderEventMap(events, phases, selectedId) {
    var annotated = new Set(((global.UL_TRACE || {}).annotations || [])
      .filter(function (a) { return a.scope === 'event'; })
      .map(function (a) { return a.eventId; }));
    var groups = groupByPhase(events, phases || []);
    var selected = events.find(function (ev) { return ev.id === selectedId; }) || events[0];
    var phasesHtml = groups.map(function (group) {
      var nodes = group.events.map(function (ev) {
        var active = selected && ev.id === selected.id;
        return '<button type="button" class="ul-map-node' +
          (ev.isError ? ' is-error' : '') +
          (annotated.has(ev.id) ? ' is-annotated' : '') +
          (active ? ' is-selected' : '') +
          '" data-ev="' + esc(ev.id) + '" data-kind="' + esc(ev.kind) +
          '" aria-pressed="' + (active ? 'true' : 'false') +
          '" aria-label="' + esc(ev.id + ', ' + ev.kind.replace(/_/g, ' ').toLowerCase() +
          (ev.isError ? ', observed error' : '') +
          (annotated.has(ev.id) ? ', reviewer annotation' : '') +
          ', ' + group.phase.label) + '">' +
          '<span>' + esc(ev.id) + '</span>' + (ev.isError ? '<b aria-hidden="true">!</b>' : '') +
          '</button>';
      }).join('');
      return '<div class="ul-map-phase" data-phase="' + esc(group.phase.id) + '">' +
        '<div class="ul-map-phase-title"><span>' + esc(group.phase.label) + '</span><span>' + group.events.length + ' events</span></div>' +
        '<div class="ul-map-nodes">' + nodes + '</div></div>';
    }).join('');
    return '<section class="ul-event-map" aria-labelledby="ul-map-title">' +
      '<div class="ul-map-header"><div><h2 id="ul-map-title" class="ul-map-heading">Trace map</h2>' +
      '<p class="ul-map-note">' + events.length + ' events in source order. Spacing shows sequence, not elapsed time. Select event for evidence preview.</p></div></div>' +
      '<div class="ul-map-legend"><span class="ul-map-key" data-kind="MESSAGE">Message</span><span class="ul-map-key" data-kind="TOOL_CALL">Tool call</span><span class="ul-map-key" data-kind="TOOL_RESULT">Tool result</span><span>! Observed error</span><span>Amber underline: reviewer note</span></div>' +
      '<div class="ul-map-phases">' + phasesHtml + '</div>' +
      '<div class="ul-map-detail" aria-live="polite">' + renderEventMapDetail(selected, phases) + '</div>' +
      '</section>';
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
  // kinds/actors: undefined means no filter; an explicit empty set means none.
  // query: string; empty/undefined = no text filter.
  function applyFilters(events, state) {
    state = state || {};
    var kinds = state.kinds;
    var actors = state.actors;
    var query = state.query || '';

    // Normalize kinds
    var kindsArr = kinds ? Array.from(kinds) : [];
    var filterKinds = kinds != null;

    // Normalize actors
    var actorsArr = actors ? Array.from(actors) : [];
    var filterActors = actors != null;

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

    if (state.phase) {
      filtered = filtered.filter(function (ev) { return ev.phase === state.phase; });
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

  function renderTasks(tasks, intent, meta) {
    var cards = (tasks || []).map(function (task) {
      return '<article class="ul-task-card">' +
        '<h3>' + esc(task.label) + '</h3>' +
        '<p><strong>Issue.</strong> ' + esc(task.issue) + '</p>' +
        '<p><strong>Observed.</strong> ' + esc(task.observation) + '</p>' +
        '<p><strong>Limit.</strong> ' + esc(task.limit) + '</p>' +
        '<a href="#' + esc(task.range[0]) + '">Events ' + esc(task.range[0]) + '–' + esc(task.range[1]) + '</a>' +
        (task.id === 'task2' && intent ? renderIntent(intent) : '') +
        '</article>';
    }).join('');
    return '<section class="ul-tasks" aria-labelledby="ul-tasks-title">' +
      '<h2 id="ul-tasks-title">Two tasks in source record</h2>' +
      (meta && meta.sourceUrl ? '<p class="ul-source-link">' +
        '46 of 46 displayed input events · <a href="' + esc(meta.sourceUrl) + '" target="_blank" rel="noopener noreferrer">' +
        'Pinned MIRAGE-Bench record (' + esc(meta.sourceCommit.slice(0, 8)) + ')</a> · ' +
        esc(meta.sourceLicense) + '</p>' : '') +
      '<div class="ul-task-grid">' + cards + '</div></section>';
  }

  // ── Task 9: renderIntent ──────────────────────────────────────────────────
  function renderIntent(intent) {
    var diffContent = (intent.kind === 'diff' && intent.raw)
      ? renderDiff(intent.raw)
      : '<pre style="margin-top:8px;font-size:12px;font-family:\'SF Mono\',\'Fira Code\',monospace;color:#a5d6ff;white-space:pre-wrap;word-break:break-all;background:#0d1117;border:1px solid #21262d;border-radius:4px;padding:10px;overflow:auto;">' + esc(intent.raw) + '</pre>';
    return '<div class="intent-box">' +
      '<span class="intent-label">EVALUATOR REFERENCE</span>' +
      '<span class="intent-plain">' + esc(intent.plain) + '</span>' +
      '<details class="ul-intent-diff" style="margin-top:10px;">' +
      '<summary>Reference patch (diff)</summary>' +
      diffContent +
      '</details>' +
      '<details class="ul-issue"><summary>Full benchmark problem statement</summary><pre>' + esc(intent.issue) + '</pre></details>' +
      '<p><strong>Comparison limit.</strong> ' + esc(intent.successCriteria) + '</p>' +
      '</div>';
  }

  // ── Task 5: renderGlossary + _wireGlossary ────────────────────────────────
  function renderGlossary(glossary) {
    return glossary.map(function (g) {
      return '<div class="ul-gloss-term">' + esc(g.term) + '</div>' +
        '<div class="ul-gloss-def">' + esc(g.def) + '</div>';
    }).join('');
  }

  var _glossaryWired = false;
  function _wireGlossary() {
    var btn = document.querySelector('.ul-legend-btn');
    var panel = document.querySelector('.ul-legend-panel');
    if (!btn || !panel) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      panel.classList.toggle('open');
    });
    if (!_glossaryWired) {
      _glossaryWired = true;
      document.addEventListener('click', function (e) {
        if (!panel.contains(e.target) && e.target !== btn) {
          panel.classList.remove('open');
        }
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') panel.classList.remove('open');
      });
    }
  }

  // ── Task 7: renderScenario ────────────────────────────────────────────────
  function renderScenario(scenario, annotations) {
    var icons = global.UL_ICONS;
    var traceAnn = (annotations || []).find(function (a) { return a.scope === 'trace'; });
    var setupHtml = traceAnn
      ? '<div class="annotation-callout">' +
        '<div class="ann-header">' +
        '<span class="ann-sev sev-' + esc(String(traceAnn.severity)) + '">SETUP</span>' +
        '<span class="ann-category">· ' + esc(traceAnn.category) + '</span>' +
        '</div>' +
        '<div class="ann-explanation">' + esc(traceAnn.explanation) + '</div>' +
        '<div class="ul-note-meta">' + esc(traceAnn.basis) + ' · ' + renderEvidenceLinks(traceAnn.evidence) + '</div>' +
        '</div>'
      : '';
    var paragraphsHtml = (scenario.paragraphs || []).map(function (p) {
      return '<p style="font-size:13px;color:#e6edf3;line-height:1.6;margin:0 0 10px 0;">' + esc(p) + '</p>';
    }).join('');
    return '<div class="trace-ann-section">' +
      '<div class="section-title">' +
      '<span style="color:#58a6ff;margin-right:6px;">' + icons.info + '</span>' +
      esc(scenario.title || 'Benchmark context') +
      '</div>' +
      setupHtml +
      '<details class="ul-scenario" style="margin-top:14px;">' +
      '<summary>What this record establishes</summary>' +
      '<div style="margin-top:10px;">' + paragraphsHtml + '</div>' +
      '</details>' +
      '<details class="ul-scenario"><summary>Benchmark-provided misleading explanation · not agent output</summary>' +
      '<p>' + esc((global.UL_TRACE.benchmark || {}).note || '') + '</p>' +
      '<blockquote>' + esc((global.UL_TRACE.benchmark || {}).misleadingReasoning || '') + '</blockquote>' +
      '</details>' +
      '</div>';
  }

  function renderGlassportDetail(step, index) {
    if (!step) return '';
    return '<h3>Step ' + (index + 1) + ' · ' + esc(step.event) + '</h3>' +
      '<p><strong>Declared surface at this step:</strong> ' + esc(step.surface) + '</p>' +
      '<p><strong>Finding:</strong> ' + esc(step.finding) +
      (step.severity ? ' · severity ' + step.severity : '') + '</p>';
  }

  function renderGlassportCase(example) {
    if (!example) return '';
    var steps = example.steps.map(function (step, i) {
      return '<button type="button" class="ul-case-step' + (i === 0 ? ' is-selected' : '') +
        '" data-step="' + i + '" aria-pressed="' + (i === 0 ? 'true' : 'false') +
        '" aria-controls="ul-case-detail">' +
        '<strong>' + (i + 1) + '. ' + esc(step.event) + '</strong>' +
        '<span class="ul-case-finding">' + esc(step.finding) + '</span></button>';
    }).join('');
    return '<section class="ul-glassport" aria-labelledby="ul-glassport-title">' +
      '<h2 id="ul-glassport-title">' + esc(example.title) + '</h2>' +
      '<p>' + esc(example.description) + '</p>' +
      '<div class="ul-case-steps" role="group" aria-label="Glassport declaration sequence">' + steps + '</div>' +
      '<div class="ul-case-detail" id="ul-case-detail" aria-live="polite">' + renderGlassportDetail(example.steps[0], 0) + '</div>' +
      '<p>' + esc(example.limit) + '</p>' +
      '<a href="' + esc(example.sourceUrl) + '">Glassport test source</a>' +
      '</section>';
  }

  // ── Task 19: sparkline ───────────────────────────────────────────────────────
  // Pure: returns inline SVG bar sparkline. One rect per value.
  function sparkline(values, opts) {
    opts = opts || {};
    var color = opts.color || '#58a6ff';
    var width = opts.width || 80;
    var height = opts.height || 20;
    var n = values.length;
    if (!n) return '<svg width="' + width + '" height="' + height + '"></svg>';
    var max = Math.max.apply(null, values);
    var barW = Math.max(1, Math.floor(width / n) - 1);
    var gap = Math.floor(width / n);
    var rects = values.map(function (v, i) {
      var h = max > 0 ? Math.max(2, Math.round((v / max) * height)) : 2;
      var x = i * gap;
      var y = height - h;
      return '<rect x="' + x + '" y="' + y + '" width="' + barW + '" height="' + h + '" fill="' + color + '" rx="1"/>';
    }).join('');
    return '<svg width="' + width + '" height="' + height + '" aria-hidden="true" style="display:inline-block;vertical-align:middle;">' + rects + '</svg>';
  }

  function renderSummary(stats, events) {
    function card(n, label, warn, extra) {
      return '<div class="summary-card"><div class="summary-num ' + (warn ? 'num-warn' : 'num-ok') + '">' + n + '</div><div class="summary-label">' + label + '</div>' + (extra || '') + '</div>';
    }
    var sparkHtml = '';
    if (events) {
      var msgCount = events.filter(function (e) { return e.kind === 'MESSAGE'; }).length;
      var toolCallCount = events.filter(function (e) { return e.kind === 'TOOL_CALL'; }).length;
      var toolResultCount = events.filter(function (e) { return e.kind === 'TOOL_RESULT'; }).length;
      sparkHtml = '<div style="margin-top:6px;" title="MESSAGE / TOOL CALL / TOOL RESULT">' + sparkline([msgCount, toolCallCount, toolResultCount]) + '</div>';
    }
    return card(stats.events, 'Events', false, sparkHtml) +
      card(stats.actors, 'Actors') +
      card(stats.toolCalls, 'Tool Calls') +
      card(stats.fabricated == null ? 'N/A' : stats.fabricated, 'MCP Fabricated Calls', stats.fabricated > 0,
        stats.fabricated == null ? '<div class="summary-explain">No MCP tools/list declaration in this source</div>' : '') +
      card(stats.annotated, 'Annotated Events');
  }

  // ── Task 18: computeAnalytics ────────────────────────────────────────────────
  // Pure: returns analytics object from events array.
  function computeAnalytics(events) {
    var toolUsage = {};
    var errorCount = 0;
    var toolResultCount = 0;
    var perPhase = {};

    events.forEach(function (ev) {
      // Tool usage: count TOOL_CALL events by their `to` (the tool invoked)
      if (ev.kind === 'TOOL_CALL') {
        toolUsage[ev.to] = (toolUsage[ev.to] || 0) + 1;
      }
      // Error count
      if (ev.kind === 'TOOL_RESULT') {
        toolResultCount++;
        if (ev.isError) errorCount++;
      }
      // Per-phase event count
      if (ev.phase) {
        perPhase[ev.phase] = (perPhase[ev.phase] || 0) + 1;
      }
    });

    var errorRate = toolResultCount > 0 ? errorCount / toolResultCount : 0;

    // retryCount: events in error chains beyond first call per chain
    var chains = markErrorChains(events);
    var retryCount = 0;
    chains.forEach(function (chain) {
      // retries = number of TOOL_CALLs to the same tool after the first one
      var callsInChain = events.filter(function (e) {
        return chain.eventIds.indexOf(e.id) !== -1 && e.kind === 'TOOL_CALL' && e.to === chain.tool;
      }).length;
      if (callsInChain > 1) retryCount += (callsInChain - 1);
    });

    return { toolUsage: toolUsage, errorRate: errorRate, errorCount: errorCount, toolResultCount: toolResultCount, retryCount: retryCount, perPhase: perPhase };
  }

  function computePhaseKindCounts(events, phases) {
    return groupByPhase(events, phases).map(function (group) {
      var counts = { MESSAGE: 0, TOOL_CALL: 0, TOOL_RESULT: 0 };
      group.events.forEach(function (ev) { counts[ev.kind]++; });
      return { phase: group.phase, counts: counts, total: group.events.length };
    });
  }

  // ── Task 18: renderAnalytics ─────────────────────────────────────────────────
  // Pure: returns HTML for the analytics panel.
  function renderAnalytics(analytics, events, phases) {
    // Tool usage bar list
    var toolNames = Object.keys(analytics.toolUsage);
    var maxToolCount = toolNames.length > 0 ? Math.max.apply(null, toolNames.map(function (t) { return analytics.toolUsage[t]; })) : 1;
    var toolBarsHtml = toolNames.length > 0
      ? toolNames.map(function (tool) {
          var count = analytics.toolUsage[tool];
          var pct = maxToolCount > 0 ? Math.round((count / maxToolCount) * 100) : 0;
          return '<div class="ul-bar-row">' +
            '<span class="ul-bar-label">' + esc(tool) + '</span>' +
            '<span class="ul-bar-track"><span class="ul-bar-fill" style="width:' + pct + '%"></span></span>' +
            '<span class="ul-bar-count">' + count + '</span>' +
            '</div>';
        }).join('')
      : '<div style="font-size:11px;color:#8b949e;">No tool calls</div>';

    var matrixHtml = '';
    if (events && phases) {
      var rows = computePhaseKindCounts(events, phases);
      var kinds = ['MESSAGE', 'TOOL_CALL', 'TOOL_RESULT'];
      var body = rows.map(function (row) {
        var cells = kinds.map(function (kind) {
          var count = row.counts[kind];
          return '<td>' + (count
            ? '<button type="button" class="ul-matrix-cell" data-phase="' + esc(row.phase.id) +
              '" data-kind="' + kind + '" aria-pressed="false" aria-label="Show ' + count + ' ' +
              esc(kind.replace(/_/g, ' ').toLowerCase()) + ' event' + (count === 1 ? '' : 's') +
              ' in ' + esc(row.phase.label) + '">' + count + '</button>'
            : '<span aria-label="zero">0</span>') + '</td>';
        }).join('');
        return '<tr><th scope="row">' + esc(row.phase.label) + '</th>' + cells + '<td>' + row.total + '</td></tr>';
      }).join('');
      matrixHtml = '<div class="ul-kind-matrix"><div class="ul-matrix-head"><h3>Events by phase and kind</h3>' +
        '<button type="button" class="ul-matrix-clear">Show all events</button></div>' +
        '<p>Choose count to filter trace. Counts describe source events, not elapsed time.</p>' +
        '<div class="ul-matrix-scroll"><table class="ul-kind-matrix-table"><caption>Event counts for each phase</caption>' +
        '<thead><tr><th scope="col">Phase</th><th scope="col">Message</th><th scope="col">Tool call</th><th scope="col">Tool result</th><th scope="col">Total</th></tr></thead>' +
        '<tbody>' + body + '</tbody></table></div>' +
        '<p class="ul-matrix-status" aria-live="polite">Showing all ' + events.length + ' source events.</p></div>';
    }

    var errorPct = (analytics.errorRate * 100).toFixed(1);

    return '<div class="ul-analytics">' +
      '<div class="section-title" style="margin-bottom:14px;">Trace analytics</div>' +
      '<div class="ul-an-grid">' +
        '<div>' +
          '<div style="font-size:11px;color:#8b949e;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Tool usage</div>' +
          toolBarsHtml +
        '</div>' +
        '<div>' +
          '<div style="display:flex;gap:24px;margin-bottom:16px;">' +
            '<div><div class="ul-an-stat' + (analytics.errorCount > 0 ? ' num-warn' : ' num-ok') + '">' + errorPct + '%</div><div class="ul-an-stat-label">Tool failures · ' + analytics.errorCount + '/' + analytics.toolResultCount + ' results</div></div>' +
            '<div><div class="ul-an-stat num-ok">' + analytics.retryCount + '</div><div class="ul-an-stat-label">Direct same-tool retries</div></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      matrixHtml +
      '</div>';
  }

  // ── Task 20: causalChain ─────────────────────────────────────────────────────
  // Pure: returns ordered ancestor id list from root to `id` (inclusive).
  function causalChain(events, id) {
    // Build id → event map
    var byId = {};
    events.forEach(function (ev) { byId[ev.id] = ev; });

    var chain = [];
    var current = id;
    var visited = new Set();
    while (current && byId[current] && !visited.has(current)) {
      visited.add(current);
      chain.push(current);
      current = byId[current].causalParent;
    }
    // chain is in reverse order (id→root), reverse to get root→id
    chain.reverse();
    return chain;
  }

  // ── Task 21: summarizePhase ──────────────────────────────────────────────────
  // Pure: returns {label, eventCount, toolCount, hasError} for a group object.
  function summarizePhase(group) {
    var events = group.events || [];
    var toolCount = events.filter(function (e) { return e.kind === 'TOOL_CALL'; }).length;
    var hasError = events.some(function (e) { return e.isError; });
    var label = (group.phase && group.phase.label) ? group.phase.label : '';
    return { label: label, eventCount: events.length, toolCount: toolCount, hasError: hasError };
  }

  // ── Task 22: tourSteps ───────────────────────────────────────────────────────
  // Pure: returns the 8 guided tour steps.
  function tourSteps() {
    return [
      { target: '#ul-intro',      title: 'Start here',            body: 'Read source scope and evidence rules before interpreting events.' },
      { target: '#ul-tasks',      title: 'Two tasks',             body: 'Marshmallow task ends at e22. SymPy task starts at e23; its reference patch applies only there.' },
      { target: '#ul-analytics',  title: 'Defined counts',        body: 'Tool failures use tool results as denominator. MCP fabricated-call status is not applicable.' },
      { target: '#ul-toolbar',    title: 'Filter and search',    body: 'Search full recovered event text; filter by kind or actor.' },
      { target: '#e18',           title: 'Post-edit check',      body: 'Task 1 reproduction changes from 344 to 345 after the edit.' },
      { target: '#e23',           title: 'New task boundary',    body: 'A new user message starts the SymPy task; it is not a causal child of Task 1 submission.' },
      { target: '#ul-panels',     title: 'Benchmark setup',      body: 'Proposed misleading reasoning belongs to benchmark setup, not observed agent output.' },
      { target: '#ul-glassport',  title: 'Glassport comparison', body: 'MCP declaration timing determines which fabricated-call finding is justified.' }
    ];
  }

  // ── Task 23: eventToJSON / traceToJSON ───────────────────────────────────────
  // Pure: serialize an event or full trace to pretty JSON.
  function eventToJSON(ev) {
    return JSON.stringify(ev, null, 2);
  }

  function traceToJSON(trace) {
    return JSON.stringify(trace, null, 2);
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
      return '<button type="button" class="ul-kind-btn' + (active ? ' active' : '') + '" data-kind="' + esc(k) + '" aria-pressed="' + active + '" style="border-color:' + color + ';color:' + color + '">' + esc(label) + '</button>';
    }).join('');

    // Actor dropdown items
    var actorItems = actors.map(function (id) {
      var color = ((T.actors || {})[id] || {}).color || '#8b949e';
      var checked = filterState.actors.has(id);
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
        '<input class="ul-search" type="search" aria-label="Search available trace text" placeholder="Search trace…" value="' + esc(filterState.query) + '" autocomplete="off">' +
      '</div>' +
      '<span class="ul-count">' + currentCount + ' / ' + totalCount + '</span>' +
      '<button class="ul-collapse-all" data-all-collapsed="false">Collapse all</button>' +
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
    actors: new Set(Object.keys((global.UL_TRACE || {}).actors || {})),
    query: '',
    phase: null
  };

  function _resetTraceFilters() {
    var T = global.UL_TRACE;
    _filterState.kinds = new Set(['MESSAGE', 'TOOL_CALL', 'TOOL_RESULT']);
    _filterState.actors = new Set(Object.keys((T || {}).actors || {}));
    _filterState.query = '';
    _filterState.phase = null;
    _syncToolbarControls();
  }

  function _syncToolbarControls() {
    var toolbar = document.getElementById('ul-toolbar');
    if (!toolbar) return;
    toolbar.querySelectorAll('.ul-kind-btn').forEach(function (btn) {
      var active = _filterState.kinds.has(btn.getAttribute('data-kind'));
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    toolbar.querySelectorAll('.ul-actor-cb').forEach(function (input) {
      input.checked = _filterState.actors.has(input.getAttribute('data-actor'));
    });
    var search = toolbar.querySelector('.ul-search');
    if (search) search.value = _filterState.query;
  }

  function _updateMatrixState(count) {
    var T = global.UL_TRACE;
    var matrix = document.querySelector('.ul-kind-matrix');
    if (!matrix || !T) return;
    matrix.querySelectorAll('.ul-matrix-cell').forEach(function (btn) {
      var selected = btn.getAttribute('data-phase') === _filterState.phase &&
        _filterState.kinds.size === 1 && _filterState.kinds.has(btn.getAttribute('data-kind'));
      btn.classList.toggle('is-selected', selected);
      btn.setAttribute('aria-pressed', String(selected));
    });
    var status = matrix.querySelector('.ul-matrix-status');
    if (status) {
      var phase = (T.phases || []).find(function (item) { return item.id === _filterState.phase; });
      status.textContent = 'Showing ' + count + ' of ' + T.events.length + ' source events' +
        (phase ? ' in ' + phase.label : '') + '.';
    }
  }

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

    // Fix 2: reset keyboard cursor so j/k starts from top after filter change
    _activeIdx = -1;

    // Re-render timeline
    var tEl = document.getElementById('ul-timeline');
    if (tEl) tEl.innerHTML = renderTimeline(filtered, { query: _filterState.query });

    // Fix 3: reset collapse-all button to "expanded" state after re-render
    var collapseBtn = document.querySelector('.ul-collapse-all');
    if (collapseBtn) {
      collapseBtn.setAttribute('data-all-collapsed', 'false');
      collapseBtn.textContent = 'Collapse all';
    }

    // Re-render minimap
    var mmEl = document.getElementById('ul-minimap');
    if (mmEl) {
      mmEl.innerHTML = renderMinimap(filtered);
      _wireMinimap();
    }

    // Update result count
    var countEl = document.querySelector('.ul-count');
    if (countEl) countEl.textContent = filtered.length + ' / ' + T.events.length;
    _updateMatrixState(filtered.length);
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
  var _actorDropdownWired = false;
  function _wireToolbar() {
    var toolbarEl = document.getElementById('ul-toolbar');
    if (!toolbarEl) return;

    // Kind toggle buttons
    toolbarEl.querySelectorAll('.ul-kind-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        _filterState.phase = null;
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
        btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
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
      if (!_actorDropdownWired) {
        _actorDropdownWired = true;
        document.addEventListener('click', function (e) {
          if (!actorMenu.contains(e.target) && e.target !== actorBtn) {
            actorMenu.classList.remove('open');
            actorBtn.setAttribute('aria-expanded', 'false');
          }
        });
      }
    }

    // Actor checkboxes
    toolbarEl.querySelectorAll('.ul-actor-cb').forEach(function (cb) {
      cb.addEventListener('change', function () {
        _filterState.phase = null;
        var actor = cb.getAttribute('data-actor');
        // Build set from all checked boxes
        var newActors = new Set();
        toolbarEl.querySelectorAll('.ul-actor-cb:checked').forEach(function (c) {
          newActors.add(c.getAttribute('data-actor'));
        });
        _filterState.actors = newActors;
        _applyAndRender();
      });
    });

    // Search input (debounced 150ms)
    var searchInput = toolbarEl.querySelector('.ul-search');
    if (searchInput) {
      var debouncedSearch = _debounce(function () {
        _filterState.phase = null;
        _filterState.query = searchInput.value;
        _applyAndRender();
      }, 150);
      searchInput.addEventListener('input', debouncedSearch);
    }
  }

  // ── Task 20: _wireCausal — hover to highlight causal ancestors+descendants ───
  function _wireCausal() {
    var tEl = document.getElementById('ul-timeline');
    if (!tEl) return;
    // Guard: jsdom/node environment without full event support — still safe to add listeners
    var T = global.UL_TRACE;
    if (!T) return;

    tEl.addEventListener('mouseover', function (e) {
      var card = e.target.closest && e.target.closest('.tl-event');
      if (!card) return;
      var evId = card.id;
      if (!evId) return;

      // Ancestors
      var ancestorIds = new Set(causalChain(T.events, evId));
      // Descendants: events whose causal chain includes evId
      var descIds = new Set();
      T.events.forEach(function (ev) {
        if (ev.id !== evId && causalChain(T.events, ev.id).indexOf(evId) !== -1) {
          descIds.add(ev.id);
        }
      });

      // Lit set: ancestors + descendants + self
      var litIds = new Set(ancestorIds);
      descIds.forEach(function (id) { litIds.add(id); });
      litIds.add(evId);

      // Apply dim/lit classes
      tEl.classList.add('causal-dim');
      tEl.querySelectorAll('.tl-event').forEach(function (el) {
        if (litIds.has(el.id)) {
          el.classList.add('causal-lit');
        } else {
          el.classList.remove('causal-lit');
        }
      });
    });

    tEl.addEventListener('mouseout', function (e) {
      var card = e.target.closest && e.target.closest('.tl-event');
      if (!card) return;
      // Only clear when leaving a .tl-event (not just a child)
      var related = e.relatedTarget;
      var stillInside = related && card.contains(related);
      if (stillInside) return;
      tEl.classList.remove('causal-dim');
      tEl.querySelectorAll('.tl-event').forEach(function (el) {
        el.classList.remove('causal-lit');
      });
    });
  }

  // ── Task 21: _wireCollapseAll — collapse/expand all phase groups ─────────────
  function setPhaseCollapsed(group, collapsed) {
    group.classList.toggle('collapsed', collapsed);
    var header = group.querySelector('.phase-header');
    if (header) header.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  }

  function _wireCollapseAll() {
    var toolbarEl = document.getElementById('ul-toolbar');
    if (!toolbarEl) return;
    toolbarEl.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.ul-collapse-all');
      if (!btn) return;
      var allCollapsed = btn.getAttribute('data-all-collapsed') === 'true';
      var tEl = document.getElementById('ul-timeline');
      if (!tEl) return;
      var groups = tEl.querySelectorAll('.phase-group');
      groups.forEach(function (g) {
        setPhaseCollapsed(g, !allCollapsed);
      });
      var nowCollapsed = !allCollapsed;
      btn.setAttribute('data-all-collapsed', nowCollapsed ? 'true' : 'false');
      btn.textContent = nowCollapsed ? 'Expand all' : 'Collapse all';
    });
  }

  // ── Task 23: Theme toggle ────────────────────────────────────────────────────
  function _initTheme() {
    var stored;
    try { stored = localStorage.getItem('ul-theme'); } catch (e) { stored = null; }
    if (stored === 'light') {
      document.body.classList.add('theme-light');
    } else if (stored === 'dark') {
      document.body.classList.remove('theme-light');
    } else {
      // Respect system preference if no stored preference
      var preferLight = false;
      try {
        if (typeof window !== 'undefined' && window.matchMedia) {
          preferLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        }
      } catch (e) { /* jsdom guard */ }
      if (preferLight) document.body.classList.add('theme-light');
    }
    _updateThemeBtn();
  }

  function _updateThemeBtn() {
    var btn = document.querySelector('.ul-theme-toggle');
    if (!btn) return;
    var isLight = document.body.classList.contains('theme-light');
    btn.textContent = isLight ? 'Dark' : 'Light';
    btn.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    btn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
  }

  function _toggleTheme() {
    var isLight = document.body.classList.toggle('theme-light');
    try { localStorage.setItem('ul-theme', isLight ? 'light' : 'dark'); } catch (e) { /* guard */ }
    _updateThemeBtn();
  }

  // ── Task 22: Tour controller ─────────────────────────────────────────────────
  var _tourActive = false;
  var _tourIdx = 0;
  var _tourSpotEl = null;
  var _tourPreviousFocus = null;

  function _startTour() {
    if (typeof document === 'undefined') return;
    _tourPreviousFocus = document.activeElement;
    _tourActive = true;
    var overlay = document.querySelector('.ul-tour-overlay');
    if (overlay) overlay.classList.add('active');
    var bubble = document.querySelector('.ul-tour-bubble');
    if (bubble) bubble.classList.add('active');
    _tourGoto(0);
  }

  function _tourGoto(i) {
    if (typeof document === 'undefined') return;
    var steps = tourSteps();
    if (i < 0) i = 0;
    if (i >= steps.length) i = steps.length - 1;
    _tourIdx = i;

    // Remove spot from previous target
    if (_tourSpotEl) {
      _tourSpotEl.classList.remove('ul-tour-spot');
      _tourSpotEl = null;
    }

    var step = steps[i];
    var targetEl = document.querySelector(step.target);
    if (targetEl) {
      targetEl.classList.add('ul-tour-spot');
      _tourSpotEl = targetEl;
      // Positioning reads the target immediately; animated scroll gives stale coordinates.
      targetEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }

    // Update bubble
    var bubble = document.querySelector('.ul-tour-bubble');
    if (!bubble) return;

    var prevDisabled = i === 0 ? ' disabled' : '';
    var nextDisabled = i === steps.length - 1 ? ' disabled' : '';
    bubble.innerHTML =
      '<h4>' + esc(step.title) + '</h4>' +
      '<div>' + esc(step.body) + '</div>' +
      '<div class="ul-tour-nav">' +
        '<button class="ul-tour-prev"' + prevDisabled + '>&#8592; Prev</button>' +
        '<button class="ul-tour-next"' + nextDisabled + '>Next &#8594;</button>' +
        '<button class="ul-tour-exit">Exit</button>' +
        '<span class="ul-tour-step">Step ' + (i + 1) + '/' + steps.length + '</span>' +
      '</div>';

    // Position bubble near target, or centered if no target
    if (targetEl) {
      var rect = targetEl.getBoundingClientRect();
      var bTop = rect.bottom + 10;
      var bLeft = Math.max(8, rect.left);
      // Keep within viewport
      var maxLeft = Math.max(8, window.innerWidth - (bubble.offsetWidth || 320) - 8);
      if (bLeft > maxLeft) bLeft = maxLeft;
      var bubbleHeight = bubble.offsetHeight || 180;
      var maxTop = Math.max(8, window.innerHeight - bubbleHeight - 8);
      if (bTop > maxTop) bTop = rect.top - bubbleHeight - 10;
      bTop = Math.min(maxTop, Math.max(8, bTop));
      bubble.style.top = bTop + 'px';
      bubble.style.left = bLeft + 'px';
    } else {
      bubble.style.top = '50%';
      bubble.style.left = '50%';
      bubble.style.transform = 'translate(-50%, -50%)';
    }

    // Wire nav buttons
    var prevBtn = bubble.querySelector('.ul-tour-prev');
    var nextBtn = bubble.querySelector('.ul-tour-next');
    var exitBtn = bubble.querySelector('.ul-tour-exit');
    if (prevBtn) prevBtn.addEventListener('click', function () { _tourGoto(_tourIdx - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { _tourGoto(_tourIdx + 1); });
    if (exitBtn) exitBtn.addEventListener('click', _endTour);
    bubble.focus();
  }

  function _endTour() {
    if (typeof document === 'undefined') return;
    _tourActive = false;
    var overlay = document.querySelector('.ul-tour-overlay');
    if (overlay) overlay.classList.remove('active');
    var bubble = document.querySelector('.ul-tour-bubble');
    if (bubble) bubble.classList.remove('active');
    if (_tourSpotEl) {
      _tourSpotEl.classList.remove('ul-tour-spot');
      _tourSpotEl = null;
    }
    if (_tourPreviousFocus && _tourPreviousFocus.focus) _tourPreviousFocus.focus();
    _tourPreviousFocus = null;
  }

  // ── Task 24: Keyboard navigation ─────────────────────────────────────────────
  var _activeIdx = -1;

  function _setActiveEvent(idx) {
    var tEl = document.getElementById('ul-timeline');
    if (!tEl) return;
    var cards = tEl.querySelectorAll('.tl-event');
    if (!cards.length) return;
    // Clamp
    if (idx < 0) idx = 0;
    if (idx >= cards.length) idx = cards.length - 1;
    // Remove previous
    cards.forEach(function (c) { c.classList.remove('kbd-active'); });
    _activeIdx = idx;
    var activeCard = cards[idx];
    activeCard.classList.add('kbd-active');
    activeCard.scrollIntoView({ behavior: preferredScrollBehavior(), block: 'nearest' });
  }

  function _wireKeyboard() {
    if (typeof document === 'undefined') return;
    document.addEventListener('keydown', function (e) {
      // Keep page/control arrow keys available for native navigation.
      var tag = (document.activeElement || {}).tagName;
      var inControl = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A', 'SUMMARY'].indexOf(tag) !== -1 ||
        (document.activeElement && document.activeElement.isContentEditable);

      // Tour keyboard nav
      if (_tourActive) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          _tourGoto(e.key === 'ArrowLeft' ? _tourIdx - 1 : _tourIdx + 1);
          return;
        }
        if (e.key === 'Escape') { _endTour(); return; }
        if (e.key === 'Tab') {
          var bubble = document.querySelector('.ul-tour-bubble');
          var buttons = bubble ? Array.from(bubble.querySelectorAll('button:not(:disabled)')) : [];
          if (buttons.length) {
            var first = buttons[0];
            var last = buttons[buttons.length - 1];
            if (e.shiftKey && (document.activeElement === first || document.activeElement === bubble)) {
              e.preventDefault(); last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault(); first.focus();
            }
          }
        }
        return; // block other keys during tour
      }

      if (inControl && e.key !== 'Escape') return;

      switch (e.key) {
        case 'j':
          e.preventDefault();
          _setActiveEvent(_activeIdx + 1);
          break;
        case 'k':
          e.preventDefault();
          _setActiveEvent(_activeIdx - 1);
          break;
        case 'e': {
          // Toggle expand on active event
          var tEl = document.getElementById('ul-timeline');
          if (tEl && _activeIdx >= 0) {
            var cards = tEl.querySelectorAll('.tl-event');
            var activeCard = cards[_activeIdx];
            if (activeCard) {
              var expandBtn = activeCard.querySelector('.ul-expand');
              if (expandBtn) {
                var evId = expandBtn.getAttribute('data-ev');
                if (evId) _toggleExpand(evId);
              }
            }
          }
          break;
        }
        case 'f': {
          var kindBtn = document.querySelector('.ul-kind-btn');
          if (kindBtn) { kindBtn.focus(); e.preventDefault(); }
          break;
        }
        case 's': {
          var searchInput = document.querySelector('.ul-search');
          if (searchInput) { searchInput.focus(); e.preventDefault(); }
          break;
        }
        case '?': {
          var legendPanel = document.querySelector('.ul-legend-panel');
          if (legendPanel) legendPanel.classList.toggle('open');
          break;
        }
        case 'g':
          e.preventDefault();
          _startTour();
          break;
        case 'Escape': {
          // Close tour first, then legend, then menus
          var panel2 = document.querySelector('.ul-legend-panel');
          if (panel2 && panel2.classList.contains('open')) {
            panel2.classList.remove('open');
            break;
          }
          var actorMenu = document.querySelector('.ul-actor-menu');
          if (actorMenu && actorMenu.classList.contains('open')) {
            actorMenu.classList.remove('open');
            var actorBtn = document.querySelector('.ul-actor-btn');
            if (actorBtn) actorBtn.setAttribute('aria-expanded', 'false');
          }
          break;
        }
      }
    });
  }

  // ── Task 24: Export ──────────────────────────────────────────────────────────
  function _triggerJSONDownload() {
    try {
      var T = global.UL_TRACE;
      if (!T) return;
      var json = traceToJSON(T);
      var blob = new Blob([json], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = (T.meta && T.meta.id ? T.meta.id : 'trace') + '.json';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (e) { /* guard for jsdom / no Blob */ }
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
        if (group) setPhaseCollapsed(group, !group.classList.contains('collapsed'));
        return;
      }
      // Expand/collapse individual card parts
      var expandBtn = e.target.closest && e.target.closest('.ul-expand');
      if (expandBtn) {
        var evId = expandBtn.getAttribute('data-ev');
        if (evId) _toggleExpand(evId);
        return;
      }
      // Task 20: flash target when clicking .parent-ref
      var parentRef = e.target.closest && e.target.closest('.parent-ref');
      if (parentRef) {
        var href = parentRef.getAttribute('href');
        if (href && href.startsWith('#')) {
          var targetId = href.slice(1);
          var targetEl = document.getElementById(targetId);
          if (targetEl) {
            var card = targetEl.querySelector('.tl-card');
            if (card) {
              card.classList.add('flash');
              setTimeout(function () { card.classList.remove('flash'); }, 1000);
            }
          }
        }
        // Don't return — let the default anchor navigation happen
      }
    });
  }

  function _wireVisualizations() {
    var T = global.UL_TRACE;
    if (!T) return;

    var map = document.getElementById('ul-event-map');
    if (map) map.addEventListener('click', function (event) {
      var node = event.target.closest && event.target.closest('.ul-map-node');
      if (node) {
        var id = node.getAttribute('data-ev');
        var selected = T.events.find(function (ev) { return ev.id === id; });
        if (!selected) return;
        map.querySelectorAll('.ul-map-node').forEach(function (button) {
          var active = button === node;
          button.classList.toggle('is-selected', active);
          button.setAttribute('aria-pressed', String(active));
        });
        var detail = map.querySelector('.ul-map-detail');
        if (detail) detail.innerHTML = renderEventMapDetail(selected, T.phases);
        return;
      }
      var jump = event.target.closest && event.target.closest('.ul-map-jump');
      if (jump) {
        event.preventDefault();
        var targetId = jump.getAttribute('data-ev');
        _resetTraceFilters();
        _applyAndRender();
        var target = document.getElementById(targetId);
        if (target) {
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
          if (target.scrollIntoView) target.scrollIntoView({ block: 'start' });
        }
      }
    });

    var analytics = document.getElementById('ul-analytics');
    if (analytics) analytics.addEventListener('click', function (event) {
      var cell = event.target.closest && event.target.closest('.ul-matrix-cell');
      var clear = event.target.closest && event.target.closest('.ul-matrix-clear');
      if (clear) {
        _resetTraceFilters();
        _applyAndRender();
      } else if (cell) {
        var phase = cell.getAttribute('data-phase');
        var kind = cell.getAttribute('data-kind');
        var alreadySelected = _filterState.phase === phase &&
          _filterState.kinds.size === 1 && _filterState.kinds.has(kind);
        _resetTraceFilters();
        if (!alreadySelected) {
          _filterState.phase = phase;
          _filterState.kinds = new Set([kind]);
          _syncToolbarControls();
        }
        _applyAndRender();
      }
    });

    var glassport = document.getElementById('ul-glassport');
    if (glassport) glassport.addEventListener('click', function (event) {
      var stepButton = event.target.closest && event.target.closest('.ul-case-step');
      if (!stepButton || !T.glassportExample) return;
      var index = Number(stepButton.getAttribute('data-step'));
      var step = T.glassportExample.steps[index];
      if (!step) return;
      glassport.querySelectorAll('.ul-case-step').forEach(function (button) {
        var active = button === stepButton;
        button.classList.toggle('is-selected', active);
        button.setAttribute('aria-pressed', String(active));
      });
      var detail = glassport.querySelector('.ul-case-detail');
      if (detail) detail.innerHTML = renderGlassportDetail(step, index);
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
        '.error-chain-label{font-size:10px;color:#f85149;font-weight:600;margin-bottom:4px;text-transform:uppercase;letter-spacing:.05em}',
        // Task 18: Analytics panel
        '.ul-analytics{max-width:860px;margin:0 auto 24px;background:#161b22;border:1px solid #30363d;border-radius:8px;padding:16px}',
        '.ul-an-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}',
        '.ul-bar-row{display:flex;align-items:center;gap:8px;font-size:11px;margin:3px 0}',
        '.ul-bar-label{width:90px;color:#8b949e;text-align:right;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
        '.ul-bar-track{flex:1;background:#0d1117;border-radius:3px;height:10px;overflow:hidden}',
        '.ul-bar-fill{height:100%;background:#58a6ff;border-radius:3px;transition:width .3s}',
        '.ul-bar-count{width:24px;color:#e6edf3;font-size:11px}',
        '.ul-an-stat{font-size:24px;font-weight:700}',
        '.ul-an-stat-label{font-size:11px;color:#8b949e;text-transform:uppercase;letter-spacing:.05em}',
        '@media(max-width:640px){.ul-an-grid{grid-template-columns:1fr}}',
        // Task 20: Causal highlight
        '#ul-timeline.causal-dim .tl-event:not(.causal-lit){opacity:.35;transition:opacity .15s}',
        '.tl-event.causal-lit{}',
        '.tl-card.flash{outline:2px solid #e3b341;outline-offset:2px}',
        // Task 21: Phase summary + collapse-all
        '.phase-summary{display:none;font-size:11px;color:#8b949e;font-weight:400;text-transform:none;letter-spacing:0}',
        '.phase-group.collapsed .phase-summary{display:inline}',
        '.ul-collapse-all{background:#161b22;border:1px solid #30363d;color:#8b949e;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;white-space:nowrap}',
        '.ul-collapse-all:hover{border-color:#58a6ff;color:#e6edf3}',
        // Task 22: Tour
        '.ul-tour-overlay{position:fixed;inset:0;background:rgba(1,4,9,.7);z-index:10000;display:none}',
        '.ul-tour-overlay.active{display:block}',
        '.ul-tour-bubble{display:none;position:fixed;z-index:10002;width:min(320px,calc(100vw - 16px));background:#161b22;border:1px solid #58a6ff;border-radius:8px;padding:14px;font-size:13px;color:#e6edf3}',
        '.ul-tour-bubble.active{display:block}',
        '.ul-tour-bubble h4{margin:0 0 6px;font-size:13px}',
        '.ul-tour-bubble .ul-tour-nav{display:flex;gap:8px;margin-top:10px;align-items:center}',
        '.ul-tour-bubble button{background:#21262d;border:1px solid #30363d;color:#e6edf3;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer}',
        '.ul-tour-step{font-size:11px;color:#8b949e;margin-left:auto}',
        '.ul-tour-spot{outline:3px solid #58a6ff !important;outline-offset:4px;border-radius:6px;position:relative;z-index:10001}',
        // Task 23: Theme toggle button
        '.ul-theme-toggle{background:#161b22;border:1px solid #30363d;color:#e6edf3;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;margin-left:8px}',
        '.ul-theme-toggle:hover{border-color:#58a6ff}',
        // Task 24: App-bar tour button + export
        '.ul-tour-btn{background:#161b22;border:1px solid #30363d;color:#e6edf3;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;margin-left:8px}',
        '.ul-tour-btn:hover{border-color:#58a6ff}',
        '.ul-export-json{background:#161b22;border:1px solid #30363d;color:#8b949e;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;white-space:nowrap}',
        '.ul-export-json:hover{border-color:#58a6ff;color:#e6edf3}',
        // Task 24: Keyboard active state
        '.tl-event.kbd-active .tl-card{outline:2px solid #58a6ff;outline-offset:2px}',
        // Task 24: Focus-visible global
        ':focus-visible{outline:2px solid #58a6ff;outline-offset:2px}',
        // Task 23: Light theme overrides
        'body.theme-light{background:#ffffff;color:#1f2328}',
        'body.theme-light .summary-card{background:#f6f8fa;border-color:#d0d7de}',
        'body.theme-light .tl-card{background:#f6f8fa;border-color:#d0d7de}',
        'body.theme-light .tl-card:hover{background:#eaeef2}',
        'body.theme-light .intent-box{background:#f6f8fa;border-color:#d0d7de}',
        'body.theme-light .ul-analytics{background:#f6f8fa;border-color:#d0d7de}',
        'body.theme-light .phase-header{background:#ffffff;border-color:#d0d7de}',
        'body.theme-light .ul-legend-panel{background:#f6f8fa;border-color:#d0d7de}',
        'body.theme-light .ul-actor-menu{background:#f6f8fa;border-color:#d0d7de}',
        'body.theme-light .ul-search{background:#ffffff;border-color:#d0d7de;color:#1f2328}',
        'body.theme-light .ul-actor-btn{background:#f6f8fa;border-color:#d0d7de;color:#1f2328}',
        'body.theme-light .ul-actor-item{color:#1f2328}',
        'body.theme-light .ul-actor-item:hover{background:#eaeef2}',
        'body.theme-light .ul-collapse-all{background:#f6f8fa;border-color:#d0d7de;color:#57606a}',
        'body.theme-light .ul-gloss-term{color:#1f2328}',
        'body.theme-light .ul-gloss-def{color:#57606a}',
        'body.theme-light .ul-count{color:#57606a}',
        'body.theme-light .ev-index{color:#57606a}',
        'body.theme-light .ul-bar-label{color:#57606a}',
        'body.theme-light .ul-bar-track{background:#eaeef2}',
        'body.theme-light .ul-theme-toggle{background:#f6f8fa;border-color:#d0d7de;color:#1f2328}',
        'body.theme-light .ul-tour-btn{background:#f6f8fa;border-color:#d0d7de;color:#1f2328}',
        'body.theme-light .ul-export-json{background:#f6f8fa;border-color:#d0d7de;color:#57606a}',
        'body.theme-light .ul-tour-bubble{background:#f6f8fa;color:#1f2328}',
        'body.theme-light .ul-tour-bubble button{background:#eaeef2;border-color:#d0d7de;color:#1f2328}',
        'body.theme-light .ul-legend-btn{background:#f6f8fa;border-color:#d0d7de;color:#1f2328}',
      ].join('');
      document.head && document.head.appendChild(styleEl);
    }

    // Task 4: intro panel
    var introEl = document.getElementById('ul-intro');
    if (introEl && T.intro) introEl.innerHTML = renderIntro(T.intro);

    var tasksEl = document.getElementById('ul-tasks');
    if (tasksEl) tasksEl.innerHTML = renderTasks(T.tasks, T.intent, T.meta);

    // Task 18: analytics panel (between summary and toolbar in DOM)
    var anEl = document.getElementById('ul-analytics');
    if (anEl) anEl.innerHTML = renderAnalytics(computeAnalytics(T.events), T.events, T.phases);

    // Summary (Task 19: pass events for sparkline)
    var sEl = document.getElementById('ul-summary');
    if (sEl) sEl.innerHTML = renderSummary(computeStats(T.events), T.events);

    var mapEl = document.getElementById('ul-event-map');
    if (mapEl) mapEl.innerHTML = renderEventMap(T.events, T.phases, T.events[0] && T.events[0].id);

    // Tasks 10/11/12: Toolbar (between summary and timeline)
    var tbEl = document.getElementById('ul-toolbar');
    if (tbEl) {
      tbEl.innerHTML = renderToolbar(_filterState, T.events.length);
      _wireToolbar();
      _wireCollapseAll();
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

    var glassportEl = document.getElementById('ul-glassport');
    if (glassportEl) glassportEl.innerHTML = renderGlassportCase(T.glassportExample);

    // Task 5: glossary legend button + panel
    if (typeof document !== 'undefined') {
      var icons = global.UL_ICONS;
      if (!document.querySelector('.ul-legend-btn')) {
        var legendBtn = document.createElement('button');
        legendBtn.className = 'ul-legend-btn';
        legendBtn.setAttribute('aria-label', 'Toggle glossary legend');
        legendBtn.innerHTML = icons.info + ' Legend';
        document.body.appendChild(legendBtn);
      }
      if (!document.querySelector('.ul-legend-panel')) {
        var legendPanel = document.createElement('div');
        legendPanel.className = 'ul-legend-panel';
        legendPanel.setAttribute('role', 'region');
        legendPanel.setAttribute('aria-label', 'Schema legend glossary');
        legendPanel.innerHTML = '<div style="font-size:13px;font-weight:600;color:#e6edf3;margin-bottom:8px;">Schema Legend</div>' +
          renderGlossary(T.glossary || []);
        document.body.appendChild(legendPanel);
      }
    }

    // Task 22/23/24: Inject app-bar buttons (theme toggle, tour)
    var appBar = document.querySelector('.djc-app-bar');
    if (appBar) {
      if (!document.querySelector('.ul-theme-toggle')) {
        var themeBtn = document.createElement('button');
        themeBtn.className = 'ul-theme-toggle';
        themeBtn.setAttribute('aria-pressed', 'false');
        themeBtn.setAttribute('aria-label', 'Switch to light theme');
        themeBtn.textContent = 'Light';
        appBar.appendChild(themeBtn);
        themeBtn.addEventListener('click', _toggleTheme);
      }

      if (!document.querySelector('.ul-tour-btn')) {
        var tourBtn = document.createElement('button');
        tourBtn.className = 'ul-tour-btn';
        tourBtn.setAttribute('aria-label', 'Start guided tour');
        tourBtn.textContent = 'Tour';
        appBar.appendChild(tourBtn);
        tourBtn.addEventListener('click', _startTour);
      }
    }

    // Task 24: Export button in toolbar
    var tbEl2 = document.getElementById('ul-toolbar');
    if (tbEl2 && !document.querySelector('.ul-export-json')) {
      var exportBtn = document.createElement('button');
      exportBtn.className = 'ul-export-json';
      exportBtn.setAttribute('aria-label', 'Download trace as JSON');
      exportBtn.textContent = 'Download JSON';
      tbEl2.appendChild(exportBtn);
      exportBtn.addEventListener('click', _triggerJSONDownload);
    }

    // Task 22: Tour overlay + bubble containers
    if (typeof document !== 'undefined') {
      if (!document.querySelector('.ul-tour-overlay')) {
        var tourOverlay = document.createElement('div');
        tourOverlay.className = 'ul-tour-overlay';
        tourOverlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(tourOverlay);
        // Close tour when clicking overlay background
        tourOverlay.addEventListener('click', _endTour);
      }
      if (!document.querySelector('.ul-tour-bubble')) {
        var tourBubble = document.createElement('div');
        tourBubble.className = 'ul-tour-bubble';
        tourBubble.setAttribute('role', 'dialog');
        tourBubble.setAttribute('aria-modal', 'true');
        tourBubble.setAttribute('aria-label', 'Guided tour');
        tourBubble.setAttribute('tabindex', '-1');
        document.body.appendChild(tourBubble);
      }
    }

    // Task 24: aria-label on timeline region
    var tlEl = document.getElementById('ul-timeline');
    if (tlEl) tlEl.setAttribute('aria-label', 'Agent trace timeline');

    // Task 24: aria-live on search result count
    var countEl = document.querySelector('.ul-count');
    if (countEl) countEl.setAttribute('aria-live', 'polite');

    // Task 24: aria-labels on toolbar buttons already rendered
    var tbEl3 = document.getElementById('ul-toolbar');
    if (tbEl3) {
      var kindBtns = tbEl3.querySelectorAll('.ul-kind-btn');
      kindBtns.forEach(function (btn) {
        var kind = btn.getAttribute('data-kind');
        if (kind && !btn.getAttribute('aria-label')) {
          btn.setAttribute('aria-label', 'Filter by ' + kind.replace(/_/g, ' ').toLowerCase());
          btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
        }
      });
      var actorBtn2 = tbEl3.querySelector('.ul-actor-btn');
      if (actorBtn2 && !actorBtn2.getAttribute('aria-label')) {
        actorBtn2.setAttribute('aria-label', 'Filter by actor');
      }
      var collapseBtn = tbEl3.querySelector('.ul-collapse-all');
      if (collapseBtn && !collapseBtn.getAttribute('aria-label')) {
        collapseBtn.setAttribute('aria-label', 'Collapse all phases');
      }
    }

    _wire();
    _wireVisualizations();
    _wireGlossary();
    _wireCausal();
    _initTheme();
    _wireKeyboard();
  }

  var UL = {
    computeStats: computeStats,
    groupByPhase: groupByPhase,
    renderEventCard: renderEventCard,
    renderTimeline: renderTimeline,
    renderMinimap: renderMinimap,
    renderEventMap: renderEventMap,
    renderEventMapDetail: renderEventMapDetail,
    renderSummary: renderSummary,
    renderIntro: renderIntro,
    renderTasks: renderTasks,
    renderIntent: renderIntent,
    renderGlossary: renderGlossary,
    renderScenario: renderScenario,
    renderGlassportCase: renderGlassportCase,
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
    // Task 18
    computeAnalytics: computeAnalytics,
    computePhaseKindCounts: computePhaseKindCounts,
    renderAnalytics: renderAnalytics,
    // Task 19
    sparkline: sparkline,
    // Task 20
    causalChain: causalChain,
    // Task 21
    summarizePhase: summarizePhase,
    // Task 22
    tourSteps: tourSteps,
    _startTour: _startTour,
    _tourGoto: _tourGoto,
    _endTour: _endTour,
    // Task 23
    eventToJSON: eventToJSON,
    traceToJSON: traceToJSON,
    // Task 24
    _initTheme: _initTheme,
    _toggleTheme: _toggleTheme,
    _wireKeyboard: _wireKeyboard,
    _triggerJSONDownload: _triggerJSONDownload,
  };
  global.UL = UL;
  if (typeof module !== 'undefined') module.exports = UL;
  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', mount);
})(typeof window !== 'undefined' ? window : globalThis);
