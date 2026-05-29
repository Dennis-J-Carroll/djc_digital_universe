/* ============================================================
   Flow Writer — Story Timeline
   Horizontal SVG timeline with zoom, pan, nodes, connections,
   tooltips, and persistence.
   ============================================================ */

// ─── State ───
const STORAGE_KEY = 'fw-timeline-events';
const DEFAULT_EVENTS = [
  { id: 'ch1', title: 'Ch.1: Discovery', chapter: 'Chapter 1', type: 'chapter', position: 15, status: 'drafted', description: 'The library and its secrets', color: '#14b89a' },
  { id: 'sc1', title: 'The Hidden Door', chapter: 'Chapter 1', type: 'scene', position: 25, status: 'drafted', description: 'Sarah discovers the oak shelf moves', connections: ['sc2'] },
  { id: 'sc2', title: 'The Journal', chapter: 'Chapter 1', type: 'scene', position: 40, status: 'drafted', description: 'Finding the handwritten journal', connections: ['sc3'] },
  { id: 'ch2', title: 'Ch.2: Revelations', chapter: 'Chapter 2', type: 'chapter', position: 55, status: 'planned', description: 'The truth unfolds', color: '#3ef0e2' },
  { id: 'sc3', title: 'The Reading', chapter: 'Chapter 2', type: 'scene', position: 65, status: 'planned', description: 'Deciphering the journal entries', connections: ['sc4'] },
  { id: 'sc4', title: 'Confrontation', chapter: 'Chapter 2', type: 'scene', position: 80, status: 'planned', description: 'Meeting the Librarian', connections: ['sc5'] },
  { id: 'sc5', title: 'Resolution', chapter: 'Chapter 2', type: 'scene', position: 95, status: 'planned', description: 'The choice Sarah must make' },
];

let events = [];
let selectedId = null;
let visible = true;

// Zoom / pan state
let zoom = 1;
let panX = 0;
let isPanning = false;
let panStartX = 0;
let panStartPanX = 0;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2;

// DOM refs
let svg = null;
let bar = null;
let app = null;
let popup = null;
let popupTitle = null;
let popupChapter = null;
let popupDesc = null;
let popupStatus = null;

// Status color mapping
const STATUS_COLORS = {
  planned: '#6b7280',
  drafted: '#f59e0b',
  revised: '#3b82f6',
  complete: '#22c55e',
};

const STATUS_LABELS = {
  planned: 'Planned',
  drafted: 'Drafted',
  revised: 'Revised',
  complete: 'Complete',
};

// Node geometry
const NODE_Y = 24;           // vertical center of nodes
const LABEL_Y = 48;          // y position for labels
const CONNECTION_Y = 8;      // arc height above/below for connections
const MARGIN_X = 60;         // horizontal margin in SVG coords

// ─── Persistence ───
function loadEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      events = JSON.parse(raw);
      return;
    }
  } catch (e) {
    console.warn('[Timeline] Failed to load events:', e);
  }
  events = JSON.parse(JSON.stringify(DEFAULT_EVENTS));
  persistEvents();
}

function persistEvents() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (e) {
    console.warn('[Timeline] Failed to persist events:', e);
  }
}

// ─── Coordinate helpers ───
function posToX(p, width) {
  const avail = width - MARGIN_X * 2;
  return MARGIN_X + (p / 100) * avail;
}

function xToPos(x, width) {
  const avail = width - MARGIN_X * 2;
  return Math.max(0, Math.min(100, ((x - MARGIN_X) / avail) * 100));
}

// ─── SVG Element helpers ───
function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
  return el;
}

// ─── Main render ───
export function renderTimeline() {
  if (!svg) return;
  svg.innerHTML = '';

  const rect = svg.getBoundingClientRect();
  const W = rect.width || 800;
  const H = rect.height || 64;

  // Viewport transform
  const viewBoxW = W / zoom;
  const viewBoxX = -panX / zoom;
  svg.setAttribute('viewBox', `${viewBoxX} 0 ${viewBoxW} ${H}`);

  // Defs for glow
  const defs = svgEl('defs');
  const filter = svgEl('filter', { id: 'nodeGlow', x: '-50%', y: '-50%', width: '200%', height: '200%' });
  filter.appendChild(svgEl('feGaussianBlur', { stdDeviation: '2', result: 'coloredBlur' }));
  const merge = svgEl('feMerge');
  merge.appendChild(svgEl('feMergeNode', { in: 'coloredBlur' }));
  merge.appendChild(svgEl('feMergeNode', { in: 'SourceGraphic' }));
  filter.appendChild(merge);
  defs.appendChild(filter);
  svg.appendChild(defs);

  // Main horizontal line
  const lineY = NODE_Y;
  svg.appendChild(svgEl('line', {
    x1: viewBoxX, y1: lineY, x2: viewBoxX + viewBoxW, y2: lineY,
    class: 'timeline-main-line',
    stroke: 'var(--border-line)',
    'stroke-width': '2',
  }));

  // Render connections first (behind nodes)
  events.forEach(evt => {
    if (!evt.connections?.length) return;
    evt.connections.forEach(targetId => {
      const target = events.find(e => e.id === targetId);
      if (!target) return;
      renderConnection(evt, target, W, lineY);
    });
  });

  // Render nodes
  events.forEach(evt => {
    renderNode(evt, W, lineY);
  });
}

function renderConnection(fromEvt, toEvt, W, lineY) {
  const x1 = posToX(fromEvt.position, W);
  const x2 = posToX(toEvt.position, W);
  const midX = (x1 + x2) / 2;
  const arcHeight = CONNECTION_Y + Math.min(Math.abs(x2 - x1) * 0.15, 14);

  const path = svgEl('path', {
    d: `M${x1},${lineY} Q${midX},${lineY - arcHeight} ${x2},${lineY}`,
    class: 'timeline-connection',
  });
  svg.appendChild(path);
}

function renderNode(evt, W, lineY) {
  const x = posToX(evt.position, W);
  const isSelected = evt.id === selectedId;

  // Node group
  const g = svgEl('g', {
    class: `timeline-node ${evt.type}`,
    'data-id': evt.id,
    transform: `translate(${x},${lineY})`,
    style: 'transition: transform var(--dur-fast);',
  });

  // Shape based on type
  const color = evt.color || (evt.type === 'chapter' ? 'var(--accent-2)' : evt.type === 'scene' ? 'var(--accent-1)' : 'var(--fg-3)');
  let shape;

  if (evt.type === 'chapter') {
    shape = svgEl('circle', { r: '12', fill: color, stroke: 'var(--bg-surface)', 'stroke-width': '2' });
  } else if (evt.type === 'scene') {
    shape = svgEl('circle', { r: '8', fill: color, stroke: 'var(--bg-surface)', 'stroke-width': '2' });
  } else {
    // beat — diamond
    shape = svgEl('rect', {
      x: '-6', y: '-6', width: '12', height: '12',
      fill: color, stroke: 'var(--bg-surface)', 'stroke-width': '1',
      transform: 'rotate(45)',
    });
  }

  // Selection ring
  if (isSelected) {
    const ringR = evt.type === 'chapter' ? 16 : evt.type === 'scene' ? 12 : 9;
    const ring = svgEl('circle', {
      r: ringR, fill: 'none',
      stroke: 'var(--accent-2)', 'stroke-width': '2',
      opacity: '0.6',
    });
    g.appendChild(ring);
  }

  g.appendChild(shape);

  // Status dot
  const statusColor = STATUS_COLORS[evt.status] || STATUS_COLORS.planned;
  let dotR, dotOff;
  if (evt.type === 'chapter') { dotR = 3.5; dotOff = 8; }
  else if (evt.type === 'scene') { dotR = 2.5; dotOff = 5.5; }
  else { dotR = 2; dotOff = 4.5; }

  const dot = svgEl('circle', {
    cx: dotOff, cy: -dotOff,
    r: dotR, fill: statusColor,
    stroke: 'var(--bg-surface)', 'stroke-width': '1',
  });
  g.appendChild(dot);

  // Label
  const label = svgEl('text', {
    x: '0', y: LABEL_Y - lineY,
    class: 'timeline-node-label',
  });
  label.textContent = truncateTitle(evt.title, evt.type);
  g.appendChild(label);

  // Events
  g.addEventListener('mouseenter', (e) => onNodeHover(e, evt));
  g.addEventListener('mouseleave', onNodeLeave);
  g.addEventListener('click', (e) => onNodeClick(e, evt));
  g.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showTimelineContextMenu(e, evt);
  });

  svg.appendChild(g);
}

function truncateTitle(title, type) {
  const max = type === 'chapter' ? 18 : type === 'scene' ? 16 : 12;
  if (title.length <= max) return title;
  return title.slice(0, max - 1) + '\u2026';
}

// ─── Interactions ───
function onNodeHover(e, evt) {
  showPopup(evt, e.currentTarget);
}

function onNodeLeave() {
  hidePopup();
}

function onNodeClick(e, evt) {
  e.stopPropagation();
  selectedId = evt.id;
  renderTimeline();

  // Dispatch navigation event
  const detail = { id: evt.id, event: evt };
  const customEvt = new CustomEvent('timeline:navigate', { detail, bubbles: true });
  svg.dispatchEvent(customEvt);
}

// ─── Popup ───
function showPopup(evt, targetEl) {
  if (!popup) return;

  popupTitle.textContent = evt.title;
  popupChapter.textContent = evt.chapter;
  popupDesc.textContent = evt.description || '';

  const statusLabel = STATUS_LABELS[evt.status] || evt.status;
  const statusColor = STATUS_COLORS[evt.status] || '#6b7280';
  popupStatus.innerHTML = `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${statusColor};"></span> ${statusLabel}`;
  popupStatus.style.background = `${statusColor}1a`;
  popupStatus.style.color = statusColor;

  popup.classList.add('visible');

  // Position near the node — viewport coords so popup escapes overflow:hidden on the bar
  const nodeRect = targetEl.getBoundingClientRect();
  const popupW = popup.offsetWidth || 200;
  const popupH = popup.offsetHeight || 120;

  let left = nodeRect.left + nodeRect.width / 2 - popupW / 2;
  let top  = nodeRect.bottom + 10;

  // Clamp to viewport
  if (left < 8) left = 8;
  if (left + popupW > window.innerWidth - 8) left = window.innerWidth - popupW - 8;
  if (top + popupH > window.innerHeight - 8) top = nodeRect.top - popupH - 8;

  popup.style.left = left + 'px';
  popup.style.top  = top  + 'px';
}

function hidePopup() {
  popup?.classList.remove('visible');
}

// ─── Context Menu ───
let contextMenu = null;

function getTimelineMenuIcon(name) {
  const icons = {
    navigate: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>',
    edit: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2l3 3-8 8H3v-3l8-8z"/></svg>',
    status: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="2"/></svg>',
    trash: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9"/></svg>',
  };
  return icons[name] || '';
}

function showTimelineContextMenu(e, evt) {
  e.preventDefault();
  e.stopPropagation();
  hidePopup(); // hide the hover popup

  // Close existing menu
  if (contextMenu) {
    contextMenu.remove();
    contextMenu = null;
  }

  // Create menu
  contextMenu = document.createElement('div');
  contextMenu.className = 'timeline-context-menu';
  contextMenu.id = 'timelineContextMenu';

  const statusItems = [
    { key: 'planned', label: 'Planned', color: STATUS_COLORS.planned },
    { key: 'drafted', label: 'Drafted', color: STATUS_COLORS.drafted },
    { key: 'revised', label: 'Revised', color: STATUS_COLORS.revised },
    { key: 'complete', label: 'Complete', color: STATUS_COLORS.complete },
  ];

  contextMenu.innerHTML = `
    <div class="timeline-context-item" data-action="navigate">
      ${getTimelineMenuIcon('navigate')} Navigate to Scene
    </div>
    <div class="timeline-context-divider"></div>
    <div class="timeline-context-item" data-action="edit">
      ${getTimelineMenuIcon('edit')} Edit Title
    </div>
    <div class="timeline-context-item" data-action="status">
      ${getTimelineMenuIcon('status')} Change Status
      <div class="timeline-context-submenu">
        ${statusItems.map(s => `
          <div class="timeline-context-item" data-action="setStatus" data-status="${s.key}">
            <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="${s.color}"/></svg>
            ${s.label}
          </div>
        `).join('')}
      </div>
    </div>
    <div class="timeline-context-divider"></div>
    <div class="timeline-context-item danger" data-action="delete">
      ${getTimelineMenuIcon('trash')} Delete Event
    </div>
  `;

  // Position at cursor, clamped to viewport
  const menuW = 200;
  const menuH = 180;
  const x = Math.min(e.clientX, window.innerWidth - menuW);
  const y = Math.min(e.clientY, window.innerHeight - menuH);
  contextMenu.style.left = x + 'px';
  contextMenu.style.top = y + 'px';

  document.body.appendChild(contextMenu);

  // Wire actions
  contextMenu.querySelectorAll('[data-action]').forEach(item => {
    item.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const action = item.dataset.action;

      switch (action) {
        case 'navigate': {
          selectedId = evt.id;
          renderTimeline();
          const detail = { id: evt.id, event: evt };
          const customEvt = new CustomEvent('timeline:navigate', { detail, bubbles: true });
          svg.dispatchEvent(customEvt);
          closeTimelineContextMenu();
          break;
        }
        case 'edit': {
          closeTimelineContextMenu();
          if (typeof window.showInlineInput === 'function') {
            window.showInlineInput({
              title: 'Edit Title',
              value: evt.title,
              placeholder: 'Event title',
              onConfirm: (newTitle) => {
                if (newTitle && newTitle !== evt.title) {
                  updateTimelineEvent(evt.id, { title: newTitle });
                }
              }
            });
          } else {
            const newTitle = window.prompt('Edit title:', evt.title);
            if (newTitle && newTitle.trim() && newTitle.trim() !== evt.title) {
              updateTimelineEvent(evt.id, { title: newTitle.trim() });
            }
          }
          break;
        }
        case 'setStatus': {
          const newStatus = item.dataset.status;
          if (newStatus && newStatus !== evt.status) {
            updateTimelineEvent(evt.id, { status: newStatus });
          }
          closeTimelineContextMenu();
          break;
        }
        case 'delete': {
          closeTimelineContextMenu();
          if (typeof window.showInlineConfirm === 'function') {
            window.showInlineConfirm({
              title: 'Delete Event',
              message: `Delete "${evt.title}"? This cannot be undone.`,
              danger: true,
              onConfirm: () => {
                removeTimelineEvent(evt.id);
              }
            });
          } else {
            if (window.confirm(`Delete "${evt.title}"?`)) {
              removeTimelineEvent(evt.id);
            }
          }
          break;
        }
      }
    });
  });

  // Animate in
  requestAnimationFrame(() => contextMenu.classList.add('open'));
}

function closeTimelineContextMenu() {
  if (contextMenu) {
    contextMenu.classList.remove('open');
    setTimeout(() => {
      if (contextMenu) {
        contextMenu.remove();
        contextMenu = null;
      }
    }, 200);
  }
}

// Close timeline context menu when clicking elsewhere
document.addEventListener('click', (e) => {
  if (!e.target.closest('.timeline-context-menu')) {
    closeTimelineContextMenu();
  }
});

// ─── Zoom & Pan ───
function onWheel(e) {
  if (!bar || !bar.contains(e.target)) return;
  e.preventDefault();

  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom + delta));

  // Zoom around mouse position
  if (svg) {
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const viewBoxW = rect.width / zoom;
    const mouseViewX = (mouseX / rect.width) * viewBoxW + (-panX / zoom);

    zoom = newZoom;

    const newViewBoxW = rect.width / zoom;
    panX = -(mouseViewX - (mouseX / rect.width) * newViewBoxW) * zoom;

    clampPan(rect.width);
    renderTimeline();
  }
}

function onMouseDown(e) {
  if (!svg || e.target.closest('.timeline-node')) return;
  isPanning = true;
  panStartX = e.clientX;
  panStartPanX = panX;
  svg.style.cursor = 'grabbing';
  e.preventDefault();
}

function onMouseMove(e) {
  if (!isPanning) return;
  const dx = e.clientX - panStartX;
  panX = panStartPanX + dx;
  if (svg) {
    const rect = svg.getBoundingClientRect();
    clampPan(rect.width);
  }
  renderTimeline();
}

function onMouseUp() {
  isPanning = false;
  if (svg) svg.style.cursor = 'grab';
}

function onDoubleClick(e) {
  if (!bar || !bar.contains(e.target)) return;
  zoom = 1;
  panX = 0;
  renderTimeline();
}

// ── Touch handlers ──
function onTouchStart(e) {
  if (!svg) return;
  // If touching a timeline node, let the click handler deal with it
  if (e.target.closest('.timeline-node')) return;
  if (e.touches.length === 1) {
    isPanning = true;
    panStartX = e.touches[0].clientX;
    panStartPanX = panX;
  }
}

function onTouchMove(e) {
  if (!isPanning || e.touches.length !== 1) return;
  e.preventDefault(); // Prevent page scroll while panning timeline
  const dx = e.touches[0].clientX - panStartX;
  panX = panStartPanX + dx;
  if (svg) {
    const rect = svg.getBoundingClientRect();
    clampPan(rect.width);
  }
  renderTimeline();
}

function onTouchEnd() {
  isPanning = false;
}

function clampPan(width) {
  const viewBoxW = width / zoom;
  const totalW = width;
  const minPan = -(totalW * (zoom - 1));
  const maxPan = totalW * (zoom - 1) * 0.5;
  panX = Math.max(minPan, Math.min(maxPan, panX));
}

// ─── Exported API ───
export function initTimeline() {
  svg = document.getElementById('timelineSvg');
  bar = document.getElementById('timelineBar');
  app = document.getElementById('app');
  popup = document.getElementById('timelinePopup');
  popupTitle = document.getElementById('timelinePopupTitle');
  popupChapter = document.getElementById('timelinePopupChapter');
  popupDesc = document.getElementById('timelinePopupDesc');
  popupStatus = document.getElementById('timelinePopupStatus');

  if (!svg || !bar) {
    console.warn('[Timeline] Required DOM elements not found, timeline disabled');
    return;
  }

  loadEvents();

  // Restore visibility preference (collapsed by default on mobile)
  const isMobile = window.innerWidth <= 768;
  const savedVisible = localStorage.getItem('fw-timeline-visible');
  if (savedVisible !== null) {
    // On mobile, always collapse regardless of saved preference
    visible = isMobile ? false : (savedVisible === 'true');
    applyVisibility();
  } else if (isMobile) {
    // No saved preference + mobile = collapse
    visible = false;
    applyVisibility();
  }

  // Zoom / pan events on the bar (not just SVG)
  bar.addEventListener('wheel', onWheel, { passive: false });
  svg.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  svg.addEventListener('dblclick', onDoubleClick);
  // Touch support
  svg.addEventListener('touchstart', onTouchStart, { passive: false });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd);

  // Toggle button inside timeline bar
  const toggleBtn = document.getElementById('timelineToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTimeline();
    });
  }

  // Topbar timeline button
  const btnTimeline = document.getElementById('btnTimeline');
  if (btnTimeline) {
    btnTimeline.addEventListener('click', toggleTimeline);
  }

  // Initial render — defer so the bar has layout dimensions
  requestAnimationFrame(() => {
    renderTimeline();
    // If still no size, try again after a brief delay
    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      setTimeout(renderTimeline, 100);
    }
  });

  // Re-render on window resize
  window.addEventListener('resize', () => renderTimeline());
}

export function toggleTimeline() {
  visible = !visible;
  localStorage.setItem('fw-timeline-visible', String(visible));
  applyVisibility();
}

export function isTimelineVisible() {
  return visible;
}

function applyVisibility() {
  if (!app || !bar) return;

  if (visible) {
    bar.classList.remove('collapsed');
    app.classList.add('has-timeline');
    app.classList.remove('timeline-collapsed');
  } else {
    bar.classList.add('collapsed');
    app.classList.add('has-timeline');
    app.classList.add('timeline-collapsed');
  }

  // Update toggle button arrow
  const toggleBtn = document.getElementById('timelineToggle');
  if (toggleBtn) {
    toggleBtn.textContent = visible ? '\u23F7' : '\u23F6';
  }

  // Dispatch event
  const evt = new CustomEvent('timeline:toggle', {
    detail: { visible },
    bubbles: true,
  });
  bar.dispatchEvent(evt);
}

export function addTimelineEvent(eventData) {
  if (!eventData?.id) {
    console.warn('[Timeline] addTimelineEvent requires an id');
    return;
  }
  const existing = events.findIndex(e => e.id === eventData.id);
  if (existing !== -1) {
    events[existing] = { ...events[existing], ...eventData };
  } else {
    events.push({
      connections: [],
      status: 'planned',
      description: '',
      color: null,
      ...eventData,
    });
  }
  persistEvents();
  renderTimeline();
}

export function removeTimelineEvent(id) {
  events = events.filter(e => e.id !== id);
  // Clean up connections to removed event
  events.forEach(e => {
    if (e.connections) {
      e.connections = e.connections.filter(cid => cid !== id);
    }
  });
  if (selectedId === id) selectedId = null;
  persistEvents();
  renderTimeline();
}

export function updateTimelineEvent(id, data) {
  const idx = events.findIndex(e => e.id === id);
  if (idx === -1) {
    console.warn('[Timeline] Event not found:', id);
    return;
  }
  events[idx] = { ...events[idx], ...data };
  persistEvents();
  renderTimeline();
}

export function getTimelineState() {
  return {
    events: JSON.parse(JSON.stringify(events)),
    selectedId,
    visible,
    zoom,
    panX,
  };
}
