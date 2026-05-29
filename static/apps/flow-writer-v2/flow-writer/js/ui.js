/* ============================================================
   Flow Writer — UI Rendering & Event Wiring
   Handles all DOM manipulation, dynamic rendering, and event
   wiring for the branching-enhanced interface.
   ============================================================ */

import {
  getState,
  getActiveBranch,
  getAllBranches,
  switchBranch,
  createBranch,
  renameBranch,
  deleteBranch,
  createCommit,
  getCommitHistory,
  restoreCommit,
  saveCurrentDoc,
  switchDoc,
  addTreeNode,
  renameTreeNode,
  deleteTreeNode,
  moveTreeNode,
  toggleFolderExpanded,
  setSceneGoal,
  getSceneGoal,
  toggleSceneGoalPinned,
  completeSceneGoal,
  countWords,
  getBranchDoc,
  compareBranchDocs,
  copyDocBetweenBranches,
  searchAcrossBranches,
} from './branch-engine.js?v=3';

import {
  getSprintState,
  startSprint,
  pauseSprint,
  resumeSprint,
  stopSprint,
  onTick,
  onPhaseChange,
} from './sprint-engine.js?v=3';

import {
  getDailyTarget,
  setDailyTarget,
  getTodayStats,
  getWeekStats,
  getAllTimeStats,
  getBranchStats,
  formatDuration,
} from './stats-engine.js?v=3';

import {
  initAIAssistant,
  getInlineSuggestion,
  rewriteText,
  getAIConfig,
  setAIConfig,
  abortAIRequest,
} from './ai-assistant.js?v=3';

import {
  openMap,
} from './interactive-maps.js?v=3';

// ---------- DOM helpers ----------
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

// ═══════════════════════════════════════════════════════════════
//  SVG ICON LIBRARY
// ═══════════════════════════════════════════════════════════════

const ICONS = {
  folder: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h4l1.5 2H14a1 1 0 011 1v7a1 1 0 01-1 1H2a1 1 0 01-1-1V4a1 1 0 011-1z"/></svg>',
  doc: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 1H3a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V5l-4-4z"/><path d="M10 1v4h4"/><path d="M5 6h6M5 9h6M5 12h4"/></svg>',
  note: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h12M2 8h12M2 12h8"/></svg>',
  char: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="5" r="3"/><path d="M2 15c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>',
  loc: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 1C5.2 1 3 3.2 3 6c0 3.8 5 9 5 9s5-5.2 5-9c0-2.8-2.2-5-5-5z"/><circle cx="8" cy="6" r="1.5"/></svg>',
  map: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="7"/><path d="M1 8h14M8 1c-2 2.5-2 9.5 0 12M8 1c2 2.5 2 9.5 0 12"/></svg>',
  branch: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v4a2 2 0 002 2h4a2 2 0 002 2v4"/><path d="M12 8h-4a2 2 0 00-2 2v4"/></svg>',
  uni: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 1L1 8l7 7 7-7-7-7z"/><path d="M4 5h8M4 8h8M4 11h8"/></svg>',
  time: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="7"/><path d="M8 4v4l3 3"/></svg>',
  focus: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="7"/><circle cx="8" cy="8" r="4.5"/><circle cx="8" cy="8" r="2" fill="currentColor"/></svg>',
  tw: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="2" width="14" height="12" rx="1"/><path d="M4 6h2M4 10h2M7 6h2M7 10h2M10 6h2M10 10h2"/></svg>',
  spark: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 0v4M8 12v4M0 8h4M12 8h4M2.3 2.3l2.8 2.8M11 11l2.8 2.8M2.3 13.7l2.8-2.8M11 5l2.8-2.8"/></svg>',
  pin: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 1C5.2 1 3 3.2 3 6c0 3.8 5 9 5 9s5-5.2 5-9c0-2.8-2.2-5-5-5z"/><circle cx="8" cy="6" r="1.5"/></svg>',
  proj: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 5l-6-3-6 3v6l6 3 6-3V5z"/><path d="M2 5l6 3 6-3M8 8v6"/></svg>',
  marker: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 1C5.2 1 3 3.2 3 6c0 3.8 5 9 5 9s5-5.2 5-9c0-2.8-2.2-5-5-5z" fill="currentColor" opacity="0.2"/><circle cx="8" cy="6" r="1.5"/></svg>',
  menu: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h12M2 8h12M2 12h12"/></svg>',
  gear: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2.5M8 12.5V15M1 8h2.5M12.5 8H15M3.05 3.05l1.77 1.77M11.18 11.18l1.77 1.77M3.05 12.95l1.77-1.77M11.18 4.82l1.77-1.77"/></svg>',
  chart: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 14V9M6 14V5M10 14V7M14 14V3"/></svg>',
  search: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="5"/><path d="M11 11l4 4"/></svg>',
  wand: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13L1 15M5 11l-2 2M1 11l2 2M8 1l1.5 3L13 5.5l-3 1.5L8 10l-1.5-3L3 5.5l3-1.5z"/></svg>',
  wc: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 1H3a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V5l-4-4z"/><path d="M10 1v4h4M5 7h6M5 10h4"/></svg>',
  expand: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 1H1v3M12 1h3v3M1 12v3h3M15 12v3h-3"/></svg>',
  close: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l10 10M13 3L3 13"/></svg>',
  sun: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="3"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06"/></svg>',
  moon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 9.5a6 6 0 11-7-7 4.5 4.5 0 007 7z" fill="currentColor" opacity="0.2"/></svg>',
  commands: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="1" width="14" height="14" rx="2"/><path d="M4 5h3M4 8h8M4 11h5"/></svg>',
  shortcuts: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="14" height="10" rx="1"/><path d="M4 8h1.5M7 8h1.5M10 8h1.5M4 6h.5M7 6h.5M10 6h.5M4 10h.5M7 10h.5M10 10h.5"/></svg>',
  help: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="7"/><path d="M6.2 5.8c.3-.8 1.1-1.4 2-1.4 1.1 0 2 .9 2 2 0 1.5-2 1.5-2 3.5"/><circle cx="8" cy="12" r=".5" fill="currentColor"/></svg>',
  refresh: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8a6 6 0 0110.2-4.2L14 6M14 2v4h-4M14 8a6 6 0 01-10.2 4.2L2 10M2 14v-4h4"/></svg>',
  plus: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v10M3 8h10"/></svg>',
  minus: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10"/></svg>',
  add: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v6M5 8h6"/></svg>',
  snapshot: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="2" fill="currentColor"/></svg>',
};

export function icon(name, size = 16) {
  const svg = ICONS[name] || '';
  return svg.replace('<svg ', `<svg width="${size}" height="${size}" class="icon-svg i-${name}" `);
}

// ---------- Global UI state (not persisted) ----------
let uiState = {
  treeContextMenu: null,   // { x, y, nodeId }
  branchDropdownOpen: false,
  activeCommitId: null,    // for restore modal
  expandedFolders: new Set(), // tracks IDs of folders that ARE expanded
  sceneGoalEditing: false, // true when editing an existing goal (vs creating new)
};

// Expose uiState for app.js
export function getUIState() { return uiState; }

// ---------- AI inline suggestion state ----------
let _ghostText = '';       // current ghost text
let _ghostVisible = false; // is ghost text currently showing
let _suggestionTimer = null;

// ═══════════════════════════════════════════════════════════════
//  KEYBOARD SHORTCUTS DATA
// ═══════════════════════════════════════════════════════════════

const SHORTCUT_GROUPS = [
  {
    title: 'Editor',
    items: [
      { keys: ['Tab'], desc: 'Accept AI suggestion' },
      { keys: ['Esc'], desc: 'Dismiss suggestion / Close modal' },
    ],
  },
  {
    title: 'Navigation',
    items: [
      { keys: ['⌘', 'K'], desc: 'Command palette' },
      { keys: ['?'], desc: 'This shortcuts list' },
    ],
  },
  {
    title: 'Modes',
    items: [
      { keys: ['⌘', '⇧', 'F'], desc: 'Focus mode' },
      { keys: ['⌘', '⇧', 'T'], desc: 'Typewriter mode' },
    ],
  },
  {
    title: 'Branches',
    items: [
      { keys: ['⌘', '⇧', 'B'], desc: 'New branch' },
      { keys: ['⌘', '⇧', 'S'], desc: 'Save snapshot' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

export function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function formatNumber(n) {
  return n.toLocaleString();
}

export function flashSave(msg, state = 'saved') {
  const saveItem = $('#saveItem');
  const saveLabel = $('#saveLabel');
  if (!saveItem || !saveLabel) return;
  // Store previous label before changing
  if (!saveLabel.dataset.prevLabel) {
    saveLabel.dataset.prevLabel = saveLabel.textContent;
  }
  // state: 'saving' | 'saved' | 'unsaved'
  saveItem.className = `item save-indicator${state !== 'saved' ? ' ' + state : ''}`;
  saveLabel.textContent = msg;
  setTimeout(() => {
    saveLabel.textContent = saveLabel.dataset.prevLabel || 'Saved · just now';
    saveItem.className = 'item save-indicator';
    delete saveLabel.dataset.prevLabel;
  }, 1800);
}

export function setSaveIndicator(state) {
  const saveItem = $('#saveItem');
  if (!saveItem) return;
  saveItem.classList.remove('saving', 'unsaved', 'saved');
  switch (state) {
    case 'saving':
      saveItem.classList.add('saving');
      break;
    case 'unsaved':
      saveItem.classList.add('unsaved');
      break;
    default:
      saveItem.classList.add('saved');
      break;
  }
}

// Focus Mode Word Count Ring
const RING_CIRCUMFERENCE = 2 * Math.PI * 34; // ~213.6

// Generic modal helpers
export function showModal(id, opts = {}) {
  const el = document.getElementById(id);
  if (!el) return;

  // Mobile: use bottom sheet for specified modals
  const isMobile = window.innerWidth <= 768;
  if (isMobile && opts.sheet !== false) {
    el.classList.add('sheet');
    // Add handle if not present
    let handle = el.querySelector('.sheet-handle');
    if (!handle) {
      handle = document.createElement('div');
      handle.className = 'sheet-handle';
      el.querySelector('.modal')?.prepend(handle);
    }
    // Wire swipe-to-close
    wireSheetSwipe(el);
  }

  el.classList.add('show');
  // Auto-focus first input
  const inp = el.querySelector('input[type="text"]');
  if (inp) setTimeout(() => inp.focus(), 50);
}

// Swipe-to-close for bottom sheets
function wireSheetSwipe(scrim) {
  let startY = 0;
  let currentY = 0;

  const onTouchStart = (e) => {
    startY = e.touches[0].clientY;
    currentY = startY;
  };

  const onTouchMove = (e) => {
    currentY = e.touches[0].clientY;
    const delta = currentY - startY;
    if (delta > 0) {
      const modal = scrim.querySelector('.modal');
      if (modal) modal.style.transform = `translateY(${delta}px)`;
    }
  };

  const onTouchEnd = () => {
    const delta = currentY - startY;
    if (delta > 80) {
      // Close the sheet
      scrim.classList.add('closing');
      setTimeout(() => {
        scrim.classList.remove('show', 'sheet', 'closing');
        const modal = scrim.querySelector('.modal');
        if (modal) modal.style.transform = '';
      }, parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dur-fast')) || 150);
    } else {
      // Snap back
      const modal = scrim.querySelector('.modal');
      if (modal) modal.style.transform = '';
    }
    startY = 0;
    currentY = 0;
  };

  const modalEl = scrim.querySelector('.modal');
  if (modalEl) {
    // Remove old listeners to avoid duplicates
    modalEl.removeEventListener('touchstart', onTouchStart);
    modalEl.removeEventListener('touchmove', onTouchMove);
    modalEl.removeEventListener('touchend', onTouchEnd);
    modalEl.addEventListener('touchstart', onTouchStart, { passive: true });
    modalEl.addEventListener('touchmove', onTouchMove, { passive: true });
    modalEl.addEventListener('touchend', onTouchEnd);
  }
}

export function closeModals() {
  $$('.modal-scrim').forEach(el => {
    el.classList.remove('show', 'sheet', 'closing');
    const modal = el.querySelector('.modal');
    if (modal) modal.style.transform = '';
  });
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// ═══════════════════════════════════════════════════════════════
//  KEYBOARD SHORTCUT CHEAT SHEET
// ═══════════════════════════════════════════════════════════════

export function renderShortcuts() {
  const body = $('#shortcutsBody');
  if (!body) return;
  body.innerHTML = SHORTCUT_GROUPS.map(g => `
    <div class="shortcuts-group">
      <h4>${escapeHtml(g.title)}</h4>
      ${g.items.map(item => `
        <div class="shortcuts-row">
          <span>${escapeHtml(item.desc)}</span>
          <div>${item.keys.map(k => `<kbd>${escapeHtml(k)}</kbd>`).join(' ')}</div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

export function openShortcutsModal() {
  renderShortcuts();
  showModal('shortcutsScrim');
}

// ═══════════════════════════════════════════════════════════════
//  TABBED RIGHT PANE
// ═══════════════════════════════════════════════════════════════

export function initRightPaneTabs() {
  const tabContainer = $('#rightPaneTabs');
  if (!tabContainer) return;

  tabContainer.addEventListener('click', (e) => {
    const tab = e.target.closest('.right-pane-tab');
    if (!tab) return;

    const tabId = tab.dataset.tab;

    // Update tab buttons
    $$('.right-pane-tab').forEach(t => t.classList.toggle('active', t === tab));

    // Update sections
    $$('.right-pane-section').forEach(s => {
      s.classList.toggle('active', s.dataset.section === tabId);
    });

    localStorage.setItem('fw-right-tab', tabId);
  });

  // Restore active tab
  const saved = localStorage.getItem('fw-right-tab');
  if (saved) {
    const tab = $(`.right-pane-tab[data-tab="${saved}"]`);
    if (tab) tab.click();
  }
}

// ═══════════════════════════════════════════════════════════════
//  THEME TOGGLE
// ═══════════════════════════════════════════════════════════════

export function wireThemeToggle() {
  const btn = $('#btnTheme');
  const icon = $('#themeIcon');
  if (!btn || !icon) return;

  // SVG paths: sun (for dark mode → click to switch to light) and moon (for light mode → click to switch to dark)
  const sunSvg = '<circle cx="8" cy="8" r="3"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06"/>';
  const moonSvg = '<path d="M13.5 9.5a5.5 5.5 0 0 1-7.78-7.78 6 6 0 1 0 7.78 7.78Z"/>';

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('flow-writer-theme', theme);

    const isDark = theme === 'dark';
    // In dark mode: show sun icon (clicking will switch to light)
    // In light mode: show moon icon (clicking will switch to dark)
    icon.innerHTML = isDark ? sunSvg : moonSvg;
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  }

  // Restore saved theme, but respect HTML attribute if present
  const htmlAttr = document.documentElement.getAttribute('data-theme');
  if (htmlAttr) {
    setTheme(htmlAttr);
  } else {
    const saved = localStorage.getItem('flow-writer-theme') || 'dark';
    setTheme(saved);
  }

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(current === 'dark' ? 'light' : 'dark');
  });
}

export function initTheme() {
  // Standalone initializer for app.js boot
  wireThemeToggle();
}

// ═══════════════════════════════════════════════════════════════
//  RESIZABLE PANES
// ═══════════════════════════════════════════════════════════════

export function initResizablePanes() {
  const app = $('#app');
  const leftDivider = $('#dividerLeft');
  const rightDivider = $('#dividerRight');
  if (!app || !leftDivider || !rightDivider) return;

  let dragging = null; // 'left' | 'right' | null
  let startX = 0;
  let startWidth = 0;

  const onMouseMove = (e) => {
    if (!dragging) return;
    const delta = e.clientX - startX;
    if (dragging === 'left') {
      const newWidth = Math.max(180, Math.min(450, startWidth + delta));
      app.style.gridTemplateColumns = `${newWidth}px 1fr 320px`;
    } else {
      const newWidth = Math.max(220, Math.min(450, startWidth - delta));
      app.style.gridTemplateColumns = `280px 1fr ${newWidth}px`;
    }
  };

  const onMouseUp = () => {
    dragging = null;
    leftDivider.classList.remove('dragging');
    rightDivider.classList.remove('dragging');
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    // Save preference
    const cols = app.style.gridTemplateColumns;
    if (cols) localStorage.setItem('fw-pane-widths', cols);
  };

  const startDrag = (side, e) => {
    dragging = side;
    startX = e.clientX;
    const style = getComputedStyle(app);
    const cols = style.gridTemplateColumns.split(' ');
    startWidth = side === 'left'
      ? parseInt(cols[0], 10)
      : parseInt(cols[2], 10);
    e.target.classList.add('dragging');
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  leftDivider.addEventListener('mousedown', (e) => startDrag('left', e));
  rightDivider.addEventListener('mousedown', (e) => startDrag('right', e));

  // Restore saved widths
  const saved = localStorage.getItem('fw-pane-widths');
  if (saved) app.style.gridTemplateColumns = saved;
}

// ═══════════════════════════════════════════════════════════════
//  FOCUS MODE WORD COUNT RING
// ═══════════════════════════════════════════════════════════════

export function updateWordRing(current, target = 500) {
  const ring = $('#focusWordRing');
  const progress = $('#wordRingProgress');
  const label = $('#wordRingLabel');
  if (!ring || !progress || !label) return;

  label.textContent = String(current);
  const circumference = 213.6; // 2 * PI * 34
  const pct = Math.min(current / target, 1);
  const offset = circumference * (1 - pct);

  progress.style.strokeDashoffset = offset;
}

// ═══════════════════════════════════════════════════════════════
//  INLINE BRANCH RENAME
// ═══════════════════════════════════════════════════════════════

export function initInlineBranchRename() {
  const branchNameEl = $('#branchName');
  if (!branchNameEl) return;

  branchNameEl.addEventListener('dblclick', () => {
    enableBranchRenameEdit(branchNameEl);
  });
}

function enableBranchRenameEdit(el) {
  const currentName = el.textContent;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'branch-name-edit';
  input.value = currentName;

  el.replaceWith(input);
  input.focus();
  input.select();

  const save = async () => {
    const newName = input.value.trim();
    if (newName && newName !== currentName) {
      const activeBranch = getActiveBranch();
      if (activeBranch) {
        renameBranch(activeBranch.id, newName);
        renderBranchSelector();
        updateStatusBar();
        flashSave('Renamed to ' + newName);
      }
    }
    // Replace back with span regardless
    const span = document.createElement('span');
    span.id = 'branchName';
    span.className = 'branch-name';
    span.textContent = newName || currentName;
    input.replaceWith(span);
    // Re-wire
    initInlineBranchRename();
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      save();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      const span = document.createElement('span');
      span.id = 'branchName';
      span.className = 'branch-name';
      span.textContent = currentName;
      input.replaceWith(span);
      initInlineBranchRename();
    }
  });

  input.addEventListener('blur', () => {
    save();
  });
}

// ═══════════════════════════════════════════════════════════════
//  CROSS-BRANCH SEARCH
// ═══════════════════════════════════════════════════════════════

export function openSearchModal() {
  showModal('searchScrim');
  setTimeout(() => $('#searchInput')?.focus(), 50);
  $('#searchResults').innerHTML = '';
  $('#searchMeta').textContent = '';
}

export async function performSearch() {
  const input = $('#searchInput');
  const resultsEl = $('#searchResults');
  const metaEl = $('#searchMeta');

  if (!input || !resultsEl) return;

  const query = input.value.trim();
  if (query.length < 2) {
    resultsEl.innerHTML = '<div style="color:var(--fg-4);text-align:center;padding:20px;font-family:var(--font-mono);font-size:11px;">Type at least 2 characters</div>';
    metaEl.textContent = '';
    return;
  }

  resultsEl.innerHTML = '<div style="color:var(--fg-4);text-align:center;padding:20px;font-family:var(--font-mono);font-size:11px;">Searching...</div>';

  const results = await searchAcrossBranches(query);

  if (results.length === 0) {
    resultsEl.innerHTML = '<div style="color:var(--fg-4);text-align:center;padding:20px;font-family:var(--font-mono);font-size:11px;">No results found</div>';
    metaEl.textContent = '';
    return;
  }

  // Group by branch
  const byBranch = {};
  results.forEach(r => {
    if (!byBranch[r.branchId]) byBranch[r.branchId] = [];
    byBranch[r.branchId].push(r);
  });

  const branchCount = Object.keys(byBranch).length;
  metaEl.textContent = `${results.length} result${results.length > 1 ? 's' : ''} in ${branchCount} branch${branchCount > 1 ? 'es' : ''}`;

  resultsEl.innerHTML = results.map(r => `
    <div class="search-result" data-branch="${r.branchId}" data-doc="${r.docId}" data-index="${r.matchIndex}">
      <div style="font-family:var(--font-mono);font-size:10px;color:var(--accent-2);margin-bottom:4px;">
        ${escapeHtml(r.branchName)} · ${escapeHtml(r.docLabel)}
      </div>
      <div style="font-size:13px;color:var(--fg-2);line-height:1.5;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
        ...${r.snippet}...
      </div>
    </div>
  `).join('');

  // Wire click handlers
  resultsEl.querySelectorAll('.search-result').forEach(el => {
    el.addEventListener('click', async () => {
      const branchId = el.dataset.branch;
      const docId = el.dataset.doc;

      closeModals();

      // Switch to branch and doc
      if (callbacks.onSwitchBranch) {
        await callbacks.onSwitchBranch(branchId);
      }
      if (callbacks.onSwitchDoc) {
        await callbacks.onSwitchDoc(docId);
      }

      // Highlight the match area (scroll to approximate position)
      const matchIndex = parseInt(el.dataset.index, 10);
      if (!isNaN(matchIndex) && callbacks.editor) {
        const text = callbacks.editor.value;
        const beforeText = text.slice(0, matchIndex);
        const lineNum = beforeText.split('\n').length;
        // Scroll to the line
        const lh = parseFloat(getComputedStyle(callbacks.editor).lineHeight) || 28;
        callbacks.editor.scrollTop = (lineNum - 3) * lh;
        callbacks.editor.focus();
      }
    });
  });
}

// ═══════════════════════════════════════════════════════════════
//  AI INLINE SUGGESTIONS (Phase 4)
// ═══════════════════════════════════════════════════════════════

export function initAIInlineSuggestions(editor) {
  // On input: clear ghost, start timer for suggestion
  editor.addEventListener('input', () => {
    clearGhostText();
    clearTimeout(_suggestionTimer);
    _suggestionTimer = setTimeout(async () => {
      const text = editor.value.slice(0, editor.selectionStart);
      if (text.length < 20) return;
      const suggestion = await getInlineSuggestion(text);
      if (suggestion) showGhostText(suggestion, editor);
    }, 2000);
  });

  // Tab to accept ghost text, Escape to dismiss
  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && _ghostVisible) {
      e.preventDefault();
      const pos = editor.selectionStart;
      const before = editor.value.slice(0, pos);
      const after = editor.value.slice(pos);
      editor.value = before + _ghostText + after;
      editor.selectionStart = editor.selectionEnd = pos + _ghostText.length;
      clearGhostText();
      // Trigger save via input event
      editor.dispatchEvent(new Event('input'));
    }
    if (e.key === 'Escape') {
      clearGhostText();
    }
  });
}

function showGhostText(text, editor) {
  _ghostText = text;
  _ghostVisible = true;

  // Remove any existing ghost element first
  clearGhostText();

  // Create a floating div near cursor
  const ghost = document.createElement('span');
  ghost.id = 'aiGhostText';
  ghost.className = 'ai-ghost-text';
  ghost.textContent = text;

  // Position near cursor using text measurement
  const cursorPos = editor.selectionStart;
  const textBefore = editor.value.slice(0, cursorPos);
  const lines = textBefore.split('\n');
  const currentLine = lines[lines.length - 1];

  const lh = parseFloat(getComputedStyle(editor).lineHeight) || 28;
  const ch = parseFloat(getComputedStyle(editor).fontSize) * 0.6 || 10;

  ghost.style.left = (currentLine.length * ch) + 'px';
  ghost.style.top = ((lines.length - 1) * lh) + 'px';

  // Position inside the editor's wrapper
  const wrap = editor.parentElement;
  if (wrap) {
    // Ensure relative positioning context
    if (getComputedStyle(wrap).position === 'static') {
      wrap.style.position = 'relative';
    }
    wrap.appendChild(ghost);
  }
}

function clearGhostText() {
  _ghostText = '';
  _ghostVisible = false;
  const existing = document.getElementById('aiGhostText');
  if (existing) existing.remove();
}

// ═══════════════════════════════════════════════════════════════
//  AI ASSISTANT MODAL (Phase 4)
// ═══════════════════════════════════════════════════════════════

export function openAIAssistantModal() {
  showModal('aiAssistantScrim');
  // Pre-populate selected text from editor
  const editor = $('#editor');
  if (editor) {
    const selected = editor.value.slice(editor.selectionStart, editor.selectionEnd);
    const selInput = $('#aiSelectedText');
    if (selInput && selected) selInput.value = selected;
  }
}

export function saveAIConfig() {
  const endpoint = $('#aiEndpoint')?.value?.trim() || '';
  const apiKey = $('#aiApiKey')?.value?.trim() || '';
  const model = $('#aiModel')?.value?.trim() || 'gpt-4o-mini';

  setAIConfig({ endpoint, apiKey, model });

  const status = $('#aiConfigStatus');
  if (status) {
    if (endpoint && apiKey) {
      status.textContent = 'Config saved (session only) · API ready';
      status.style.color = 'var(--accent-2)';
    } else if (endpoint || apiKey) {
      status.textContent = 'Both endpoint and API key are required';
      status.style.color = 'var(--warn-amber)';
    } else {
      status.textContent = 'Cleared — using local fallback';
      status.style.color = 'var(--fg-4)';
    }
  }
}

export async function performAIRewrite() {
  const text = $('#aiSelectedText')?.value || '';
  const style = $('#aiStyle')?.value || 'more concise';
  const tone = $('#aiTone')?.value || 'dramatic';
  if (!text.trim()) return;

  const resultEl = $('#aiRewriteResult');
  const textEl = $('#aiRewriteResultText');
  if (resultEl) resultEl.style.display = 'block';
  if (textEl) textEl.textContent = 'Thinking…';

  const { result, note } = await rewriteText(text, style, tone);
  if (textEl) textEl.textContent = result || note || 'No result';
}

export function insertAIResult(replace = false) {
  const resultText = $('#aiRewriteResultText')?.textContent || '';
  const editor = $('#editor');
  if (!editor || !resultText) return;

  if (replace) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.value = editor.value.slice(0, start) + resultText + editor.value.slice(end);
    editor.selectionStart = editor.selectionEnd = start + resultText.length;
  } else {
    const pos = editor.selectionEnd;
    editor.value = editor.value.slice(0, pos) + '\n\n' + resultText + editor.value.slice(pos);
    editor.selectionStart = editor.selectionEnd = pos + resultText.length + 2;
  }
  editor.dispatchEvent(new Event('input'));
  editor.focus();
}

// ═══════════════════════════════════════════════════════════════
//  STATUS BAR (Section 7.5)
// ═══════════════════════════════════════════════════════════════

export function updateStatusBar() {
  const branch = getActiveBranch();
  if (!branch) return;

  const branchLabel = $('#branchLabel');
  const statusBranch = $('.status .item.branch');

  const commitCount = branch.metadata?.commitCount ?? 0;
  const wordCount = branch.metadata?.wordCount ?? 0;

  if (branchLabel) {
    branchLabel.textContent = `${branch.name} \u00b7 ${commitCount} commits \u00b7 ${formatNumber(wordCount)} words`;
  }
  if (statusBranch) {
    statusBranch.innerHTML = `<span class="icon-svg" style="opacity:0.7;">${icon('branch', 12)}</span><span id="branchLabel">${branch.name} \u00b7 ${commitCount} commits \u00b7 ${formatNumber(wordCount)} words</span>`;
  }
}

// ═══════════════════════════════════════════════════════════════
//  BRANCH SELECTOR DROPDOWN (Section 7.1)
// ═══════════════════════════════════════════════════════════════

export function renderBranchSelector() {
  const branches = getAllBranches();
  const activeBranch = getActiveBranch();
  const chip = $('.branch-chip');
  if (!chip) return;

  // Update chip text
  const nameEl = chip.querySelector('#branchName') || chip.querySelector('.branch-name');
  if (nameEl) nameEl.textContent = activeBranch?.name ?? 'main';

  // Build or update dropdown
  let dropdown = chip.querySelector('.branch-dropdown');
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.className = 'branch-dropdown';
    chip.appendChild(dropdown);

    // Click chip to toggle
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleBranchDropdown();
    });
  }

  // Render dropdown content
  dropdown.innerHTML = '';

  branches.forEach(branch => {
    const isActive = branch.id === activeBranch?.id;
    const item = document.createElement('div');
    item.className = `branch-dropdown-item${isActive ? ' active' : ''}`;
    item.dataset.branchId = branch.id;

    const wc = branch.metadata?.wordCount ?? 0;
    const cc = branch.metadata?.commitCount ?? 0;

    item.innerHTML = `
      <span>${isActive ? icon('branch', 10) + ' ' : ''}${branch.name}</span>
      <span class="branch-meta">${cc}c \u00b7 ${formatNumber(wc)}w</span>
    `;

    item.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!isActive) {
        onSwitchBranch(branch.id);
      }
      closeBranchDropdown();
    });

    dropdown.appendChild(item);
  });

  // Divider
  const divider = document.createElement('div');
  divider.className = 'branch-dropdown-divider';
  dropdown.appendChild(divider);

  // Actions
  const renameAction = document.createElement('div');
  renameAction.className = 'branch-dropdown-action';
  renameAction.textContent = 'Rename branch...';
  renameAction.addEventListener('click', (e) => {
    e.stopPropagation();
    closeBranchDropdown();
    promptRenameBranch(activeBranch.id);
  });
  dropdown.appendChild(renameAction);

  const deleteAction = document.createElement('div');
  deleteAction.className = 'branch-dropdown-action danger';
  deleteAction.textContent = 'Delete branch...';
  deleteAction.addEventListener('click', (e) => {
    e.stopPropagation();
    closeBranchDropdown();
    promptDeleteBranch(activeBranch.id);
  });
  dropdown.appendChild(deleteAction);
}

function toggleBranchDropdown() {
  const chip = $('.branch-chip');
  const dropdown = chip?.querySelector('.branch-dropdown');
  if (!dropdown) return;

  const isOpen = dropdown.classList.contains('open');
  if (isOpen) {
    closeBranchDropdown();
  } else {
    // Close any other open menus
    closeAllMenus();
    dropdown.classList.add('open');
    uiState.branchDropdownOpen = true;
  }
}

function closeBranchDropdown() {
  const chip = $('.branch-chip');
  const dropdown = chip?.querySelector('.branch-dropdown');
  if (dropdown) dropdown.classList.remove('open');
  uiState.branchDropdownOpen = false;
}

function closeAllMenus() {
  closeBranchDropdown();
  closeTreeContextMenu();
}

// Close menus on outside click / escape
document.addEventListener('click', (e) => {
  if (!e.target.closest('.branch-dropdown') && !e.target.closest('.branch-chip')) {
    closeBranchDropdown();
  }
  if (!e.target.closest('.tree-context-menu')) {
    closeTreeContextMenu();
  }
});

// ═══════════════════════════════════════════════════════════════
//  DYNAMIC TREE RENDERING (Section 7.3)
// ═══════════════════════════════════════════════════════════════

export function renderTree(treeNodes, container, level = 0) {
  if (!container) container = $('#tree');
  if (!container) return;

  // Only clear on top-level render
  if (level === 0) {
    container.innerHTML = '';
  }

  const activeBranch = getActiveBranch();
  const activeDocId = activeBranch?.activeDocId;
  const isTouch = 'ontouchstart' in window;

  treeNodes.forEach(node => {
    const li = document.createElement('li');

    if (node.type === 'folder') {
      li.className = 'tree-folder';
      // Use engine's expanded state if not locally overridden yet;
      // once toggled, we track in the Set
      const defaultExpanded = node.expanded !== false;
      const isExpanded = uiState.expandedFolders.has(node.id)
        ? true
        : (node.expanded === false ? false : defaultExpanded);
      if (isExpanded) {
        li.classList.add('open');
        uiState.expandedFolders.add(node.id);
      }

      const itemDiv = document.createElement('div');
      itemDiv.className = 'tree-item';
      itemDiv.dataset.nodeId = node.id;
      itemDiv.dataset.type = node.type;
      itemDiv.draggable = true;
      itemDiv.innerHTML = `
        <span class="caret">\u25b6</span>
        <span class="tree-icon">${icon(node.icon || 'folder', 14)}</span>
        <span>${escapeHtml(node.label)}</span>
      `;

      // Click to toggle folder
      itemDiv.addEventListener('click', () => {
        li.classList.toggle('open');
        const nowExpanded = li.classList.contains('open');
        if (nowExpanded) {
          uiState.expandedFolders.add(node.id);
        } else {
          uiState.expandedFolders.delete(node.id);
        }
        // Update engine
        toggleFolderExpanded(node.id);
      });

      // Right-click context menu
      itemDiv.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showTreeContextMenu(e, node);
      });

      // Swipe actions (touch only)
      if (isTouch) {
        wrapTreeItemWithSwipe(itemDiv, li, node);
      } else {
        li.appendChild(itemDiv);
      }

      // Children
      if (node.children && node.children.length > 0) {
        const childrenUl = document.createElement('ul');
        childrenUl.className = 'tree-children';
        renderTree(node.children, childrenUl, level + 1);
        li.appendChild(childrenUl);
      }
    } else {
      // Document node (not a folder)
      li.className = 'tree-doc';
      const itemDiv = document.createElement('div');
      itemDiv.className = 'tree-item';
      if (node.id === activeDocId) itemDiv.classList.add('active');
      itemDiv.dataset.doc = node.id;
      itemDiv.dataset.nodeId = node.id;
      itemDiv.dataset.type = node.type;
      itemDiv.draggable = true;

      const colorClass = getFileTypeClass(node.type);
      itemDiv.innerHTML = `
        <span class="tree-icon ${colorClass}">${icon(node.icon || 'doc', 14)}</span>
        <span>${escapeHtml(node.label)}</span>
      `;

      // Click to switch doc (or open map for location/map items)
      itemDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        if (node.type === 'location' || node.type === 'map') {
          if (node.label === 'Town Map') { openMap('town'); }
          else if (node.label === 'Library Layout') { openMap('library'); }
          else { onSwitchDoc(node.id); }
        } else {
          onSwitchDoc(node.id);
        }
      });

      // Right-click context menu
      itemDiv.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showTreeContextMenu(e, node);
      });

      // Swipe actions (touch only)
      if (isTouch) {
        wrapTreeItemWithSwipe(itemDiv, li, node);
      } else {
        li.appendChild(itemDiv);
      }
    }

    container.appendChild(li);
  });

  // Add "+" button for top-level items
  if (level === 0) {
    const addBtn = document.createElement('button');
    addBtn.className = 'tree-add-btn';
    addBtn.innerHTML = '+ New item';
    addBtn.addEventListener('click', () => {
      promptAddTreeNode(null); // null parent = top-level
    });
    container.appendChild(addBtn);
  }
}

/** Wrap a tree-item in a swipe-action container (touch devices only) */
function wrapTreeItemWithSwipe(itemDiv, li, node) {
  const wrap = document.createElement('div');
  wrap.className = 'tree-item-wrap';

  // Swipe action buttons
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'tree-item-swipe-actions';
  actionsDiv.innerHTML = `
    <button class="swipe-btn rename" title="Rename">${icon('wc', 14)}</button>
    <button class="swipe-btn duplicate" title="Duplicate">${icon('commands', 14)}</button>
    <button class="swipe-btn delete" title="Delete">${icon('close', 14)}</button>
  `;

  // Wire swipe buttons
  actionsDiv.querySelector('.swipe-btn.rename').addEventListener('click', (e) => {
    e.stopPropagation();
    wrap.classList.remove('swiped');
    promptRenameTreeNode(node.id);
  });
  actionsDiv.querySelector('.swipe-btn.duplicate').addEventListener('click', (e) => {
    e.stopPropagation();
    wrap.classList.remove('swiped');
    duplicateTreeNode(node);
  });
  actionsDiv.querySelector('.swipe-btn.delete').addEventListener('click', (e) => {
    e.stopPropagation();
    wrap.classList.remove('swiped');
    promptDeleteTreeNode(node.id);
  });

  wrap.appendChild(itemDiv);
  wrap.appendChild(actionsDiv);
  li.appendChild(wrap);

  // Swipe detection
  let startX = 0;
  let startY = 0;
  let isSwiping = false;

  wrap.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    isSwiping = false;
  }, { passive: true });

  wrap.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    // Horizontal swipe detection
    if (Math.abs(dx) > Math.abs(dy) && dx < -60) {
      isSwiping = true;
    }

    if (isSwiping && dx < -60) {
      // Close other open swipes first
      $$('.tree-item-wrap.swiped').forEach(el => {
        if (el !== wrap) el.classList.remove('swiped');
      });
      wrap.classList.add('swiped');
    }
  }, { passive: true });

  wrap.addEventListener('touchend', () => {
    // Keep swipe open; clicking elsewhere closes it
  });

  // Click outside to close swipe
  itemDiv.addEventListener('click', (e) => {
    if (wrap.classList.contains('swiped')) {
      e.stopPropagation();
      wrap.classList.remove('swiped');
    }
  });
}

/** Close any open swipe actions when clicking elsewhere */
document.addEventListener('click', (e) => {
  if (!e.target.closest('.tree-item-wrap')) {
    $$('.tree-item-wrap.swiped').forEach(el => el.classList.remove('swiped'));
  }
});

function getFileTypeClass(type) {
  switch (type) {
    case 'doc': return 'file-type-doc';
    case 'note': return 'file-type-note';
    case 'character': return 'file-type-char';
    case 'location': return 'file-type-map';
    default: return 'file-type-doc';
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ═══════════════════════════════════════════════════════════════
//  TREE CONTEXT MENU
// ═══════════════════════════════════════════════════════════════

function showTreeContextMenu(e, node) {
  closeAllMenus();

  let menu = $('#treeContextMenu');
  if (!menu) {
    menu = document.createElement('div');
    menu.id = 'treeContextMenu';
    menu.className = 'tree-context-menu';
    document.body.appendChild(menu);
  }

  menu.innerHTML = '';
  menu.dataset.nodeId = node.id;

  const actions = [
    { label: 'Rename', action: () => promptRenameTreeNode(node.id) },
    { label: 'Duplicate', action: () => duplicateTreeNode(node) },
    { label: 'Delete', action: () => promptDeleteTreeNode(node.id), danger: true },
  ];

  // Add "New" options for folders
  if (node.type === 'folder') {
    actions.unshift(
      { label: 'New Document', action: () => promptAddTreeNode(node.id, 'doc') },
      { label: 'New Folder', action: () => promptAddTreeNode(node.id, 'folder') }
    );
  } else {
    // For non-folders, add sibling options
    actions.unshift(
      { label: 'New Document', action: () => promptAddTreeNode(null, 'doc') },
      { label: 'New Folder', action: () => promptAddTreeNode(null, 'folder') }
    );
  }

  actions.forEach(a => {
    const item = document.createElement('div');
    item.className = `tree-context-item${a.danger ? ' danger' : ''}`;
    item.textContent = a.label;
    item.addEventListener('click', (ev) => {
      ev.stopPropagation();
      closeTreeContextMenu();
      a.action();
    });
    menu.appendChild(item);
  });

  // Position
  const x = Math.min(e.clientX, window.innerWidth - 180);
  const y = Math.min(e.clientY, window.innerHeight - 150);
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.classList.add('open');
  uiState.treeContextMenu = { nodeId: node.id };
}

function closeTreeContextMenu() {
  const menu = $('#treeContextMenu');
  if (menu) menu.classList.remove('open');
  uiState.treeContextMenu = null;
}

// ═══════════════════════════════════════════════════════════════
//  COMMIT HISTORY PANEL (Section 7.1) — Enhanced Timeline
// ═══════════════════════════════════════════════════════════════

/** Branch color palette (matches branch-graph.js) */
const BRANCH_COLORS_LIST = [
  '#14b89a', '#2dc7a6', '#44d6b8', '#3ef0e2', '#7ce5cf', '#0fa387',
];

function getBranchColorByIndex(index) {
  return BRANCH_COLORS_LIST[index % BRANCH_COLORS_LIST.length];
}

/** Build a branchId -> color map based on branch order */
function buildBranchColorMap() {
  const branches = getAllBranches();
  const sorted = [...branches].sort((a, b) => {
    if (a.id === 'main') return -1;
    if (b.id === 'main') return 1;
    return a.createdAt - b.createdAt;
  });
  const map = new Map();
  sorted.forEach((b, i) => map.set(b.id, getBranchColorByIndex(i)));
  return map;
}

/** Format a date group label: "Today", "Yesterday", "May 24" */
function formatDateGroup(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export async function renderCommitHistory(commits, container) {
  if (!container) container = $('#commitList');
  if (!container) return;

  container.innerHTML = '';

  if (!commits || commits.length === 0) {
    container.innerHTML = '<div style="color:var(--fg-4);font-family:var(--font-mono);font-size:10px;padding:8px;text-align:center;">No commits yet</div>';
    return;
  }

  const colorMap = buildBranchColorMap();
  const branches = getAllBranches();
  const branchMap = new Map(branches.map(b => [b.id, b]));

  // Sort by timestamp descending (newest first)
  const sorted = [...commits].sort((a, b) => b.timestamp - a.timestamp);

  // Group by date
  const groups = new Map();
  for (const commit of sorted) {
    const label = formatDateGroup(commit.timestamp);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(commit);
  }

  for (const [dateLabel, groupCommits] of groups) {
    // Date header
    const header = document.createElement('div');
    header.className = 'commit-group-header';
    header.textContent = dateLabel;
    container.appendChild(header);

    for (const commit of groupCommits) {
      const item = document.createElement('div');
      item.className = 'commit-item';
      item.dataset.commitId = commit.id;

      const branch = branchMap.get(commit.branchId);
      const branchColor = colorMap.get(commit.branchId) || getBranchColorByIndex(0);
      const branchName = branch?.name || commit.branchId;

      const deltaClass = commit.wordCountDelta > 0 ? 'positive' : commit.wordCountDelta < 0 ? 'negative' : 'neutral';
      const deltaSign = commit.wordCountDelta > 0 ? '+' : '';
      const deltaStr = commit.wordCountDelta !== 0 ? `${deltaSign}${commit.wordCountDelta}` : '·';

      // Branch dot
      const dot = document.createElement('span');
      dot.className = 'branch-dot';
      dot.style.backgroundColor = branchColor;

      // Message (clickable)
      const msg = document.createElement('span');
      msg.className = 'commit-msg';
      msg.textContent = commit.message || '(no message)';
      msg.title = `${branchName} · ${new Date(commit.timestamp).toLocaleString()}`;
      msg.addEventListener('click', () => openRestoreCommitModal(commit));

      // Right side: delta + time + restore button
      const right = document.createElement('span');
      right.className = 'commit-right';

      const delta = document.createElement('span');
      delta.className = `commit-delta ${deltaClass}`;
      delta.textContent = deltaStr;

      const time = document.createElement('span');
      time.className = 'commit-time';
      time.textContent = formatRelativeTime(commit.timestamp);

      const restoreBtn = document.createElement('button');
      restoreBtn.className = 'restore-btn';
      restoreBtn.textContent = 'Restore ↩';
      restoreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openRestoreCommitModal(commit);
      });

      right.appendChild(delta);
      right.appendChild(time);
      right.appendChild(restoreBtn);

      item.appendChild(dot);
      item.appendChild(msg);
      item.appendChild(right);

      container.appendChild(item);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
//  SCENE BANNER (Section 7.2)
// ═══════════════════════════════════════════════════════════════

export function renderSceneBanner() {
  const banner = $('#sceneBanner');
  if (!banner) return;

  const activeBranch = getActiveBranch();
  if (!activeBranch) return;

  const docId = activeBranch.activeDocId;
  const goal = getSceneGoal(docId); // returns SceneGoal or null

  const eyebrow = banner.querySelector('.scene-banner-eyebrow');
  const goalContainer = banner.querySelector('.scene-goal') || banner.querySelector('.scene-goal-container');

  if (goal && goal.text) {
    // Show the goal
    if (eyebrow) {
      const pinIndicator = goal.pinned ? ` <span class="pin">${icon('pin', 10)}</span>` : '';
      eyebrow.innerHTML = `
        <span>${icon('pin', 10)} Scene Goal${pinIndicator}</span>
        <span>From <span class="source">${escapeHtml(goal.source || 'Unknown')}</span></span>
      `;
    }
    if (goalContainer) {
      const isCompleted = goal.completed;
      const checkClass = isCompleted ? 'scene-goal-check checked' : 'scene-goal-check';
      const goalClass = isCompleted ? 'scene-goal completed' : 'scene-goal';
      goalContainer.innerHTML = `
        <div class="scene-goal-wrap">
          <span class="${goalClass}" id="sceneGoalTextDisplay">${escapeHtml(goal.text).replace(/\*\*(.+?)\*\*/g, '<em>$1</em>')}</span>
          <button class="${checkClass}" id="sceneGoalCheckBtn" title="${isCompleted ? 'Mark incomplete' : 'Mark complete'}">\u2713</button>
        </div>
      `;
      goalContainer.className = 'scene-goal';

      // Wire click on goal text to open modal for editing
      const textDisplay = goalContainer.querySelector('#sceneGoalTextDisplay');
      if (textDisplay) {
        textDisplay.addEventListener('click', (e) => {
          e.stopPropagation();
          openSceneGoalModal();
        });
      }

      // Wire checkmark button for completion toggle
      const checkBtn = goalContainer.querySelector('#sceneGoalCheckBtn');
      if (checkBtn) {
        checkBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleSceneGoalComplete();
        });
      }
    }
  } else {
    // Show placeholder
    if (eyebrow) {
      eyebrow.innerHTML = `<span>${icon('pin', 10)} Scene Goal</span>`;
    }
    if (goalContainer) {
      goalContainer.innerHTML = '<span class="scene-goal-placeholder"><span class="plus">+</span> Set scene goal</span>';
      goalContainer.className = 'scene-goal';

      // Wire click on placeholder to open modal
      const placeholder = goalContainer.querySelector('.scene-goal-placeholder');
      if (placeholder) {
        placeholder.addEventListener('click', (e) => {
          e.stopPropagation();
          openSceneGoalModal();
        });
      }
    } else {
      // Recreate goal area if missing
      const existing = banner.querySelector('.scene-goal');
      if (existing) {
        existing.innerHTML = '<span class="scene-goal-placeholder"><span class="plus">+</span> Set scene goal</span>';
        const placeholder = existing.querySelector('.scene-goal-placeholder');
        if (placeholder) {
          placeholder.addEventListener('click', (e) => {
            e.stopPropagation();
            openSceneGoalModal();
          });
        }
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════
//  SCENE GOAL MODAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function openSceneGoalModal() {
  const activeBranch = getActiveBranch();
  if (!activeBranch) return;

  const docId = activeBranch.activeDocId;
  const goal = getSceneGoal(docId);

  const templateSelect = $('#sceneGoalTemplate');
  const textArea = $('#sceneGoalText');
  const sourceInput = $('#sceneGoalSource');
  const pinCheckbox = $('#sceneGoalPinned');
  const deleteBtn = $('#sceneGoalDelete');

  // Reset template selector to "Custom..."
  if (templateSelect) templateSelect.value = '';

  if (goal && goal.text) {
    // Editing existing goal
    uiState.sceneGoalEditing = true;
    if (textArea) textArea.value = goal.text;
    if (sourceInput) sourceInput.value = goal.source || '';
    if (pinCheckbox) pinCheckbox.checked = goal.pinned || false;
    if (deleteBtn) deleteBtn.style.display = '';
  } else {
    // Creating new goal
    uiState.sceneGoalEditing = false;
    if (textArea) textArea.value = '';
    if (sourceInput) sourceInput.value = '';
    if (pinCheckbox) pinCheckbox.checked = false;
    if (deleteBtn) deleteBtn.style.display = 'none';
  }

  showModal('sceneGoalScrim');

  // Focus the textarea after a short delay for the modal to animate in
  if (textArea) {
    setTimeout(() => textArea.focus(), 60);
  }
}

export async function saveSceneGoal() {
  const activeBranch = getActiveBranch();
  if (!activeBranch) return;

  const docId = activeBranch.activeDocId;
  const textArea = $('#sceneGoalText');
  const sourceInput = $('#sceneGoalSource');
  const pinCheckbox = $('#sceneGoalPinned');

  const text = textArea?.value?.trim() || '';
  const source = sourceInput?.value?.trim() || '';

  if (!text) {
    // Don't save empty goals
    closeModals();
    return;
  }

  // Save the goal
  await setSceneGoal(docId, text, source);

  // Handle pin state
  const goal = getSceneGoal(docId);
  const shouldBePinned = pinCheckbox?.checked || false;
  if (goal && shouldBePinned !== goal.pinned) {
    await toggleSceneGoalPinned(docId);
  }

  closeModals();
  renderSceneBanner();
  flashSave('Scene goal saved');
}

export async function deleteSceneGoal() {
  const activeBranch = getActiveBranch();
  if (!activeBranch) return;

  const docId = activeBranch.activeDocId;
  showInlineConfirm({
    title: 'Delete Scene Goal',
    message: 'Delete this scene goal?',
    danger: true,
    onConfirm: async () => {
      await setSceneGoal(docId, null, null);

      closeModals();
      renderSceneBanner();
      flashSave('Scene goal deleted');
    }
  });
}

export async function toggleSceneGoalComplete() {
  const activeBranch = getActiveBranch();
  if (!activeBranch) return;

  const docId = activeBranch.activeDocId;
  const goal = getSceneGoal(docId);
  if (!goal || !goal.text) return;

  // Toggle: if already completed, we need a way to un-complete
  // The engine's completeSceneGoal only marks as completed (one-way)
  // We handle toggle by checking current state
  if (goal.completed) {
    // Un-complete by calling setSceneGoal with same text but completed=false
    // Since setSceneGoal preserves existing pinned state but resets completed to false,
    // we need to directly manipulate. But setSceneGoal resets completed:false always.
    // So we just call setSceneGoal which will create a new goal with completed:false
    await setSceneGoal(docId, goal.text, goal.source);
    // Restore pin state if it was pinned
    if (goal.pinned) {
      await toggleSceneGoalPinned(docId);
    }
    flashSave('Scene goal re-opened');
  } else {
    await completeSceneGoal(docId);
    flashSave('Scene goal completed');
  }

  renderSceneBanner();
}

// ═══════════════════════════════════════════════════════════════
//  PROMPT / MODAL HELPERS
// ═══════════════════════════════════════════════════════════════

// Callback references set by app.js
let callbacks = {
  onSwitchBranch: null,
  onSwitchDoc: null,
  onRefreshGraph: null,
  onRefreshHistory: null,
  editor: null,
};

export function setUICallbacks(cbs) {
  callbacks = { ...callbacks, ...cbs };
}

async function onSwitchBranch(branchId) {
  if (callbacks.onSwitchBranch) {
    await callbacks.onSwitchBranch(branchId);
  }
}

async function onSwitchDoc(docId) {
  if (callbacks.onSwitchDoc) {
    await callbacks.onSwitchDoc(docId);
  }
}

async function onRefreshGraph() {
  if (callbacks.onRefreshGraph) {
    await callbacks.onRefreshGraph();
  }
}

async function onRefreshHistory() {
  if (callbacks.onRefreshHistory) {
    await callbacks.onRefreshHistory();
  }
}

// ═══════════════════════════════════════════════════════════════
//  CUSTOM INLINE DIALOGS (replaces window.prompt / confirm / alert)
// ═══════════════════════════════════════════════════════════════

/** Show a custom inline input dialog (replaces window.prompt) */
function showInlineInput({ title, message, value = '', placeholder = '', onConfirm, onCancel }) {
  let overlay = document.getElementById('inlineDialogOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'inlineDialogOverlay';
    overlay.className = 'inline-dialog-overlay';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="inline-dialog-box">
      <div class="inline-dialog-title">${escapeHtml(title)}</div>
      ${message ? `<div class="inline-dialog-message">${escapeHtml(message)}</div>` : ''}
      <input type="text" class="inline-dialog-input" id="inlineDialogInput" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" />
      <div class="inline-dialog-actions">
        <button class="inline-dialog-btn cancel" id="inlineDialogCancel">Cancel</button>
        <button class="inline-dialog-btn confirm" id="inlineDialogConfirm">OK</button>
      </div>
    </div>
  `;

  const input = overlay.querySelector('#inlineDialogInput');
  const confirmBtn = overlay.querySelector('#inlineDialogConfirm');
  const cancelBtn = overlay.querySelector('#inlineDialogCancel');

  function close(result) {
    overlay.classList.remove('open');
    setTimeout(() => {
      overlay.innerHTML = '';
      if (result !== undefined && onConfirm) onConfirm(result);
      else if (onCancel) onCancel();
    }, 200);
  }

  confirmBtn.addEventListener('click', () => close(input.value.trim()));
  cancelBtn.addEventListener('click', () => close(undefined));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') close(input.value.trim());
    if (e.key === 'Escape') close(undefined);
  });

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close(undefined);
  });

  requestAnimationFrame(() => {
    overlay.classList.add('open');
    input.focus();
    input.select();
  });
}

/** Show a custom inline confirm dialog (replaces window.confirm) */
function showInlineConfirm({ title, message, danger = false, onConfirm, onCancel }) {
  let overlay = document.getElementById('inlineDialogOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'inlineDialogOverlay';
    overlay.className = 'inline-dialog-overlay';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="inline-dialog-box">
      <div class="inline-dialog-title">${escapeHtml(title)}</div>
      <div class="inline-dialog-message">${escapeHtml(message)}</div>
      <div class="inline-dialog-actions">
        <button class="inline-dialog-btn cancel" id="inlineDialogCancel">Cancel</button>
        <button class="inline-dialog-btn ${danger ? 'danger' : 'confirm'}" id="inlineDialogConfirm">${danger ? 'Delete' : 'OK'}</button>
      </div>
    </div>
  `;

  const confirmBtn = overlay.querySelector('#inlineDialogConfirm');
  const cancelBtn = overlay.querySelector('#inlineDialogCancel');

  function close(confirmed) {
    overlay.classList.remove('open');
    setTimeout(() => {
      overlay.innerHTML = '';
      if (confirmed && onConfirm) onConfirm();
      else if (!confirmed && onCancel) onCancel();
    }, 200);
  }

  confirmBtn.addEventListener('click', () => close(true));
  cancelBtn.addEventListener('click', () => close(false));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close(false);
  });
  // Keyboard support
  const keyHandler = (e) => {
    if (e.key === 'Enter') { close(true); document.removeEventListener('keydown', keyHandler); }
    if (e.key === 'Escape') { close(false); document.removeEventListener('keydown', keyHandler); }
  };
  document.addEventListener('keydown', keyHandler);

  requestAnimationFrame(() => overlay.classList.add('open'));
}

/** Show a toast notification (replaces window.alert) */
function showToast(message, icon = '✦') {
  let toast = document.getElementById('inlineToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'inlineToast';
    toast.className = 'inline-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span class="inline-toast-icon">${icon}</span><span>${escapeHtml(message)}</span>`;
  requestAnimationFrame(() => {
    toast.classList.add('open');
    setTimeout(() => toast.classList.remove('open'), 2800);
  });
}

function promptRenameBranch(branchId) {
  const branch = getAllBranches().find(b => b.id === branchId);
  if (!branch) return;
  showInlineInput({
    title: 'Rename Branch',
    value: branch.name,
    placeholder: 'Branch name',
    onConfirm: (newName) => {
      if (newName && newName !== branch.name) {
        renameBranch(branchId, newName);
        renderBranchSelector();
        updateStatusBar();
        flashSave('Renamed to ' + newName);
      }
    }
  });
}

function promptDeleteBranch(branchId) {
  const branch = getAllBranches().find(b => b.id === branchId);
  if (!branch) return;
  if (branch.id === 'main') {
    showToast('Cannot delete the main branch.');
    return;
  }
  showInlineConfirm({
    title: 'Delete Branch',
    message: `Delete branch "${branch.name}" and all its commits? This cannot be undone.`,
    danger: true,
    onConfirm: () => {
      deleteBranch(branchId);
      renderBranchSelector();
      renderTree(getActiveBranch()?.tree);
      updateStatusBar();
      flashSave('Branch deleted');
    }
  });
}

function promptRenameTreeNode(nodeId) {
  const node = findTreeNode(getActiveBranch()?.tree, nodeId);
  if (!node) return;
  showInlineInput({
    title: 'Rename',
    value: node.label,
    placeholder: 'Name',
    onConfirm: (newLabel) => {
      if (newLabel && newLabel !== node.label) {
        renameTreeNode(nodeId, newLabel);
        renderTree(getActiveBranch()?.tree);
        flashSave('Renamed');
      }
    }
  });
}

function promptDeleteTreeNode(nodeId) {
  const node = findTreeNode(getActiveBranch()?.tree, nodeId);
  if (!node) return;
  showInlineConfirm({
    title: 'Delete Item',
    message: `Delete "${node.label}"?`,
    danger: true,
    onConfirm: () => {
      deleteTreeNode(nodeId);
      renderTree(getActiveBranch()?.tree);
      flashSave('Deleted');
    }
  });
}

function duplicateTreeNode(node) {
  const branch = getActiveBranch();
  if (!branch) return;

  const copyLabel = node.label + ' (copy)';
  let copyId = node.id + '-copy';

  // Prevent duplicate duplicates — if copy exists, append random suffix
  if (findTreeNode(branch.tree, copyId)) {
    copyId = node.id + '-copy-' + Math.random().toString(36).slice(2, 4);
  }

  const newNode = {
    id: copyId,
    type: node.type,
    label: copyLabel,
    icon: node.icon || 'doc',
    color: node.color || 'var(--accent-2)',
    order: (node.order || 0) + 1,
    ...(node.type === 'folder' ? { expanded: true, children: [] } : {}),
  };

  // Copy document content if it's a document node
  if (node.type !== 'folder' && branch.docs[node.id]) {
    branch.docs[copyId] = branch.docs[node.id];
  }

  // Find parent and insert after original
  const parent = findParentNode(branch.tree, node.id);
  const siblings = parent ? parent.children : branch.tree;
  const originalIndex = siblings.findIndex(n => n.id === node.id);
  const insertIndex = originalIndex >= 0 ? originalIndex + 1 : siblings.length;

  addTreeNode(parent?.id || null, newNode);
  renderTree(branch.tree);
  flashSave('Duplicated "' + copyLabel + '"');
}

function promptAddTreeNode(parentId, type = 'doc') {
  const isFolder = type === 'folder';
  showInlineInput({
    title: isFolder ? 'New Folder' : 'New Document',
    placeholder: isFolder ? 'Folder name' : 'Document name',
    onConfirm: (label) => {
      if (!label) return;
      const nodeType = type === 'folder' ? 'folder' : type;
      const icons = {
        folder: 'folder', doc: 'doc', note: 'note',
        character: 'char', location: 'loc',
      };
      const colors = {
        folder: 'var(--fg-3)', doc: 'var(--accent-2)',
        note: 'var(--accent-2)', character: 'var(--electric-violet)',
        location: 'var(--warn-amber)',
      };
      const newNode = {
        id: 'node-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        type: nodeType,
        label: label,
        icon: icons[nodeType] || icons.doc,
        color: colors[nodeType] || colors.doc,
        order: 999,
        ...(nodeType === 'folder' ? { expanded: true, children: [] } : {}),
      };
      addTreeNode(parentId, newNode);
      renderTree(getActiveBranch()?.tree);
      flashSave('Created ' + label);
    }
  });
}

function findTreeNode(tree, nodeId) {
  if (!tree) return null;
  for (const node of tree) {
    if (node.id === nodeId) return node;
    if (node.children) {
      const found = findTreeNode(node.children, nodeId);
      if (found) return found;
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
//  COMMIT SNAPSHOT MODAL (Section 7.4)
// ═══════════════════════════════════════════════════════════════

export function openCommitSnapshotModal() {
  const modal = $('#commitSnapshotScrim');
  if (!modal) return;

  const activeBranch = getActiveBranch();
  const input = $('#commitSnapshotInput');
  const deltaEl = $('#commitSnapshotDelta');

  // Default message
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (input) input.value = `Snapshot at ${timeStr}`;

  // Show word delta
  if (deltaEl && activeBranch) {
    const commits = activeBranch.metadata?.commitCount ?? 0;
    const currentWc = countWords(callbacks.editor?.value || '');
    deltaEl.textContent = `Current word count: ${formatNumber(currentWc)}`;
  }

  showModal('commitSnapshotScrim');
}

export async function submitCommitSnapshot() {
  const input = $('#commitSnapshotInput');
  if (!input) return;

  const message = input.value.trim() || 'Snapshot';
  const activeBranch = getActiveBranch();
  if (!activeBranch) return;

  const docId = activeBranch.activeDocId;

  // Save first, then commit
  await saveCurrentDoc();
  const commit = await createCommit(message, docId);

  closeModals();
  await onRefreshHistory();
  await onRefreshGraph();
  updateStatusBar();
  flashSave('Snapshot saved \u00b7 ' + message);
}

// ═══════════════════════════════════════════════════════════════
//  RESTORE COMMIT MODAL (Section 7.4)
// ═══════════════════════════════════════════════════════════════

function openRestoreCommitModal(commit) {
  uiState.activeCommitId = commit.id;

  const modal = $('#restoreCommitScrim');
  if (!modal) return;

  const detailsEl = $('#restoreCommitDetails');
  const previewEl = $('#restoreCommitPreview');

  if (detailsEl) {
    detailsEl.innerHTML = `
      <div style="font-family:var(--font-mono);font-size:11px;color:var(--fg-4);margin-bottom:8px;">
        ${escapeHtml(commit.message)}<br>
        ${new Date(commit.timestamp).toLocaleString()}<br>
        ${formatNumber(commit.wordCount)} words
        ${commit.wordCountDelta !== 0 ? `(change: ${commit.wordCountDelta > 0 ? '+' : ''}${commit.wordCountDelta})` : ''}
      </div>
    `;
  }

  if (previewEl) {
    const preview = (commit.docSnapshot || '').slice(0, 200).replace(/</g, '&lt;');
    const ellipsis = (commit.docSnapshot || '').length > 200 ? '...' : '';
    previewEl.innerHTML = preview + ellipsis;
  }

  showModal('restoreCommitScrim');
}

export async function submitRestoreCommit() {
  if (!uiState.activeCommitId) return;

  showInlineConfirm({
    title: 'Restore Version',
    message: 'Restore this version? Unsaved changes will be lost.',
    onConfirm: async () => {
      await restoreCommit(uiState.activeCommitId);

      // Reload editor
      const activeBranch = getActiveBranch();
      if (callbacks.editor && activeBranch) {
        callbacks.editor.value = activeBranch.docs[activeBranch.activeDocId] ?? '';
      }

      closeModals();
      uiState.activeCommitId = null;
      await onRefreshHistory();
      flashSave('Version restored');
    }
  });
}

// ═══════════════════════════════════════════════════════════════
//  CREATE BRANCH MODAL (enhanced — Section 7.4)
// ═══════════════════════════════════════════════════════════════

export function wireCreateBranchModal() {
  const btnCreate = $('#branchCreate');
  if (!btnCreate) return;

  btnCreate.addEventListener('click', async () => {
    const input = $('#branchInput');
    const emptyCheckbox = $('#branchEmptyCheck');
    if (!input) return;

    const name = input.value.trim();
    if (!name) return;

    const activeBranch = getActiveBranch();
    const parentId = emptyCheckbox?.checked ? null : (activeBranch?.id ?? 'main');

    try {
      const newBranch = await createBranch(name, parentId);

      // Reset input
      input.value = '';
      if (emptyCheckbox) emptyCheckbox.checked = false;
      closeModals();

      // Refresh UI
      renderBranchSelector();
      await onSwitchBranch(newBranch.id);
      flashSave('Branched \u00b7 ' + newBranch.name);
    } catch (err) {
      console.error('Failed to create branch:', err);
      flashSave('Error: ' + err.message);
    }
  });
}

// Update parent branch display in create modal
export function updateCreateBranchModal() {
  const parentInfo = $('#createBranchParentInfo');
  if (!parentInfo) return;

  const activeBranch = getActiveBranch();
  if (activeBranch) {
    parentInfo.textContent = `Parent: ${activeBranch.name}`;
  }
}

// ═══════════════════════════════════════════════════════════════
//  BRANCH COMPARISON MODAL (Section 4.1)
// ═══════════════════════════════════════════════════════════════

let _compareState = {
  branchA: null,
  branchB: null,
  docId: null,
};

export function openBranchCompareModal() {
  showModal('compareBranchScrim');
  populateCompareDropdowns();
}

function populateCompareDropdowns() {
  const branches = getAllBranches();
  const activeBranch = getActiveBranch();
  const selA = $('#compareBranchA');
  const selB = $('#compareBranchB');
  const selDoc = $('#compareDocSelect');
  if (!selA || !selB) return;

  // Populate branch dropdowns
  const branchOptions = branches.map(b => `<option value="${b.id}">${escapeHtml(b.name)}</option>`).join('');
  selA.innerHTML = branchOptions;
  selB.innerHTML = branchOptions;

  // Default: active branch in A, first other branch in B
  if (activeBranch) {
    selA.value = activeBranch.id;
    const other = branches.find(b => b.id !== activeBranch.id);
    if (other) selB.value = other.id;
  }

  // Populate doc dropdown with docs present in both branches
  updateCompareDocDropdown();

  // Event listeners
  selA.onchange = () => { updateCompareDocDropdown(); renderComparison(); };
  selB.onchange = () => { updateCompareDocDropdown(); renderComparison(); };
  selDoc.onchange = () => renderComparison();

  // Initial render
  renderComparison();
}

function updateCompareDocDropdown() {
  const selA = $('#compareBranchA');
  const selB = $('#compareBranchB');
  const selDoc = $('#compareDocSelect');
  if (!selA || !selB || !selDoc) return;

  const branchA = getAllBranches().find(b => b.id === selA.value);
  const branchB = getAllBranches().find(b => b.id === selB.value);
  if (!branchA || !branchB) return;

  // Find docs present in both branches
  const docsA = Object.keys(branchA.docs);
  const docsB = Object.keys(branchB.docs);
  const sharedDocs = docsA.filter(d => docsB.includes(d));

  // Get labels from tree nodes if available
  const treeNodes = flattenTree(branchA.tree);
  const nodeMap = new Map(treeNodes.map(n => [n.id, n]));

  const options = sharedDocs.map(docId => {
    const label = nodeMap.get(docId)?.label || docId;
    return `<option value="${docId}">${escapeHtml(label)}</option>`;
  }).join('');

  selDoc.innerHTML = options || '<option value="">No shared documents</option>';
}

async function renderComparison() {
  const selA = $('#compareBranchA');
  const selB = $('#compareBranchB');
  const selDoc = $('#compareDocSelect');
  const headerA = $('#comparePaneHeaderA');
  const headerB = $('#comparePaneHeaderB');
  const contentA = $('#comparePaneContentA');
  const contentB = $('#comparePaneContentB');
  const summary = $('#compareDiffSummary');
  if (!selA || !selB || !selDoc) return;

  const branchA = getAllBranches().find(b => b.id === selA.value);
  const branchB = getAllBranches().find(b => b.id === selB.value);
  const docId = selDoc.value;

  if (!branchA || !branchB || !docId) {
    if (summary) summary.textContent = 'Select branches and a document to compare.';
    return;
  }

  _compareState = { branchA: branchA.id, branchB: branchB.id, docId };

  // Get doc content from both branches
  const textA = await getBranchDoc(branchA.id, docId);
  const textB = await getBranchDoc(branchB.id, docId);

  // Get labels from tree
  const treeNodes = flattenTree(branchA.tree);
  const nodeMap = new Map(treeNodes.map(n => [n.id, n]));
  const docLabel = nodeMap.get(docId)?.label || docId;

  // Update headers
  if (headerA) headerA.textContent = `${escapeHtml(branchA.name)} · ${escapeHtml(docLabel)}`;
  if (headerB) headerB.textContent = `${escapeHtml(branchB.name)} · ${escapeHtml(docLabel)}`;

  // Update content
  if (contentA) contentA.textContent = textA || '(empty)';
  if (contentB) contentB.textContent = textB || '(empty)';

  // Diff summary
  const result = compareBranchDocs(branchA, branchB, docId);
  if (summary) {
    if (result.identical) {
      summary.textContent = `Documents are identical · ${result.wordsA} words`;
      summary.style.background = 'rgba(20,184,154,0.06)';
    } else if (result.diff > 0) {
      summary.textContent = `+${result.diff} words · ${result.wordsA} → ${result.wordsB} words`;
      summary.style.background = 'rgba(20,184,154,0.10)';
    } else {
      summary.textContent = `${result.diff} words · ${result.wordsA} → ${result.wordsB} words`;
      summary.style.background = 'rgba(255,93,115,0.08)';
    }
  }
}

async function onCopyFromOtherBranch() {
  const { branchA, branchB, docId } = _compareState;
  if (!branchA || !branchB || !docId) return;

  showInlineConfirm({
    title: 'Copy Document',
    message: 'Copy this document from the other branch? This will overwrite your current version.',
    onConfirm: async () => {
      const success = await copyDocBetweenBranches(branchB, branchA, docId);
      if (success) {
        flashSave('Copied from ' + branchB);
        renderComparison();
      } else {
        flashSave('Copy failed');
      }
    }
  });
}

// ═══════════════════════════════════════════════════════════════
//  COMMAND PALETTE COMMANDS (Section 7.6)
// ═══════════════════════════════════════════════════════════════

export function getCommands() {
  const branches = getAllBranches();
  const activeBranch = getActiveBranch();

  const commands = [
    { id: 'focus',   label: 'Toggle focus mode',      kbd: '\u2318\u21e7F', icon: 'focus', run: null /* wired by app */ },
    { id: 'tw',      label: 'Toggle typewriter mode', kbd: '\u2318\u21e7T', icon: 'tw', run: null },
    { id: 'scene',   label: 'Toggle scene goal',      kbd: '\u2318/',   icon: 'pin', run: null },
    { id: 'branch',  label: 'Create branch...',       kbd: '\u2318B',  icon: 'branch', run: () => { updateCreateBranchModal(); showModal('branchScrim'); } },
    { id: 'snapshot',label: 'Save snapshot',          kbd: '\u2318S',  icon: 'snapshot', run: () => openCommitSnapshotModal() },
    { id: 'search',  label: 'Search across branches...', kbd: '',      icon: 'search', run: () => openSearchModal() },
    { id: 'graph',   label: 'Show branch graph',      kbd: '',         icon: 'loc', run: () => { /* scroll left pane to graph */ $('.pane.left')?.scrollTo({ top: 0, behavior: 'smooth' }); } },
    { id: 'compare', label: 'Compare branches...',     kbd: '',         icon: 'branch', run: () => openBranchCompareModal() },
    { id: 'sc',      label: 'Show keyboard shortcuts', kbd: '?',       icon: 'shortcuts', run: () => showModal('scScrim') },
    { id: 'ai-assistant', label: 'AI Assistant...',       kbd: '\u2318\u21e7A', icon: 'spark', run: () => openAIAssistantModal() },
    { id: 'export-zip',  label: 'Export branch as ZIP...',  kbd: '', icon: 'proj', run: () => exportBranchAsZip() },
    { id: 'export-txt',  label: 'Export \u00b7 plain text',     kbd: '', icon: 'doc', run: null },
    { id: 'export-md',   label: 'Export \u00b7 Markdown',       kbd: '', icon: 'doc', run: null },
    { id: 'export-html', label: 'Export \u00b7 printable HTML', kbd: '', icon: 'doc', run: null },
    { id: 'export-docx', label: 'Export \u00b7 Word document (.docx)', icon: 'doc', run: () => exportDocx() },
    { id: 'export-pdf',  label: 'Export \u00b7 PDF document',          icon: 'doc', run: () => exportPdf() },
  ];

  // Add branch-switching commands
  if (branches.length > 1) {
    commands.splice(4, 0, {
      id: 'switch-branch',
      label: 'Switch to branch...',
      kbd: '',
      icon: '\u2387',
      run: () => {
        // Open the branch dropdown
        const chip = $('.branch-chip');
        if (chip) chip.click();
      },
      subItems: branches
        .filter(b => b.id !== activeBranch?.id)
        .map(b => ({
          id: `branch-${b.id}`,
          label: `  \u21b3 ${b.name}`,
          kbd: '',
          icon: 'branch',
          run: () => onSwitchBranch(b.id),
        })),
    });
  }

  // Add per-branch doc switch commands
  if (activeBranch?.tree) {
    const docNodes = flattenTree(activeBranch.tree).filter(n => n.type !== 'folder');
    const existingIds = new Set(commands.map(c => c.id));
    docNodes.forEach(node => {
      const cmdId = `doc-${node.id}`;
      if (!existingIds.has(cmdId)) {
        commands.push({
          id: cmdId,
          label: `Open \u00b7 ${node.label}`,
          kbd: '',
          icon: node.icon || 'doc',
          run: () => onSwitchDoc(node.id),
        });
      }
    });
  }

  return commands;
}

function flattenTree(nodes) {
  const result = [];
  for (const node of nodes || []) {
    result.push(node);
    if (node.children) {
      result.push(...flattenTree(node.children));
    }
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════
//  SPRINT UI (Section 3.2)
// ═══════════════════════════════════════════════════════════════

let _sprintTickUnsub = null;
let _sprintPhaseUnsub = null;

export function renderSprintSection() {
  const host = $('#sprintSectionHost') || $('.pane.right');
  if (!host) return;

  let section = $('#sprintSection');
  if (!section) {
    section = document.createElement('div');
    section.id = 'sprintSection';
    section.className = 'sprint-section';
    host.appendChild(section);
  }

  const state = getSprintState();

  if (state.phase === 'idle') {
    section.innerHTML = `
      <h6 class="section-eyebrow">Writing Sprint</h6>
      <div class="sprint-card idle">
        <div class="sprint-time-display">${state.settings.sprintDuration}:00</div>
        <div class="sprint-duration-select">
          <button class="sprint-dur-btn" data-dur="15">15m</button>
          <button class="sprint-dur-btn on" data-dur="25">25m</button>
          <button class="sprint-dur-btn" data-dur="45">45m</button>
        </div>
        <div class="sprint-controls-row">
          <button class="sprint-btn primary" id="sprintStartBtn">Start Sprint</button>
        </div>
        <div class="sprint-stats-row">Sprints today: ${state.sprintsCompletedToday}</div>
      </div>
    `;

    // Wire duration buttons
    section.querySelectorAll('.sprint-dur-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        section.querySelectorAll('.sprint-dur-btn').forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
        const dur = btn.dataset.dur;
        const timeDisplay = section.querySelector('.sprint-time-display');
        if (timeDisplay) timeDisplay.textContent = `${dur}:00`;
      });
    });

    // Wire start button
    const startBtn = section.querySelector('#sprintStartBtn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        hapticFeedback('medium');
        const activeDurBtn = section.querySelector('.sprint-dur-btn.on');
        const minutes = activeDurBtn ? parseInt(activeDurBtn.dataset.dur, 10) : 25;
        startSprint(minutes);
        renderSprintSection();
      });
    }
  } else {
    const isPaused = state.phase === 'paused';
    const phaseLabel = state.phase === 'focus' ? 'FOCUS' : state.phase === 'break' ? 'BREAK' : 'PAUSED';
    const phaseClass = state.phase;

    section.innerHTML = `
      <h6 class="section-eyebrow">Writing Sprint</h6>
      <div class="sprint-card ${phaseClass}">
        <div class="sprint-phase-label">${phaseLabel}</div>
        <div class="sprint-time-display">${state.remainingStr}</div>
        <div class="sprint-progress">
          <div class="sprint-progress-fill" style="width:${state.progress * 100}%"></div>
        </div>
        <div class="sprint-stats-row">
          ${state.wordsWritten > 0 ? `<span>${state.wordsWritten} words</span>` : ''}
          <span>Sprint #${state.currentSprintIndex + 1}</span>
        </div>
        <div class="sprint-controls-row">
          ${isPaused
            ? `<button class="sprint-btn primary" id="sprintResumeBtn">Resume</button>`
            : `<button class="sprint-btn" id="sprintPauseBtn">Pause</button>`
          }
          <button class="sprint-btn danger" id="sprintStopBtn">Stop</button>
        </div>
      </div>
    `;

    // Wire controls
    if (isPaused) {
      section.querySelector('#sprintResumeBtn')?.addEventListener('click', () => {
        hapticFeedback('light');
        resumeSprint();
        renderSprintSection();
      });
    } else {
      section.querySelector('#sprintPauseBtn')?.addEventListener('click', () => {
        hapticFeedback('light');
        pauseSprint();
        renderSprintSection();
      });
    }

    section.querySelector('#sprintStopBtn')?.addEventListener('click', () => {
      hapticFeedback('success');
      stopSprint();
      renderSprintSection();
    });

    // Subscribe to tick updates if not already
    if (!_sprintTickUnsub) {
      _sprintTickUnsub = onTick(() => {
        renderSprintSection();
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════════
//  DAILY TARGET UI (Section 3.4)
// ═══════════════════════════════════════════════════════════════

export async function renderDailyTarget() {
  const rightPane = $('.pane.right');
  const host = $('#dailyTargetSectionHost') || rightPane;
  if (!host) return;

  let section = $('#dailyTargetSection');
  if (!section) {
    section = document.createElement('div');
    section.id = 'dailyTargetSection';
    section.className = 'daily-target-section';
    host.appendChild(section);
  }

  try {
    const target = await getDailyTarget();
    const isComplete = target.percent >= 100;

    section.innerHTML = `
      <h6 class="section-eyebrow">Daily Target</h6>
      <div class="daily-target-bar">
        <div class="daily-target-fill${isComplete ? ' complete' : ''}" style="width:${target.percent}%"></div>
      </div>
      <div class="daily-target-label">${formatNumber(target.current)} / ${formatNumber(target.target)} words &middot; ${target.percent}%</div>
      ${isComplete ? '<div class="daily-target-celebrate">Target reached!</div>' : ''}
    `;

    if (isComplete) hapticFeedback('heavy');
  } catch {
    section.innerHTML = `
      <h6 class="section-eyebrow">Daily Target</h6>
      <div class="daily-target-label" style="color:var(--fg-4);">Loading...</div>
    `;
  }
}

// ═══════════════════════════════════════════════════════════════
//  STATS MODAL (Section 3.3)
// ═══════════════════════════════════════════════════════════════

export async function openStatsModal() {
  // Build modal if it doesn't exist
  let scrim = $('#statsScrim');
  if (!scrim) {
    scrim = document.createElement('div');
    scrim.id = 'statsScrim';
    scrim.className = 'modal-scrim';
    scrim.innerHTML = `
      <div class="modal" style="width:min(600px,92vw);">
        <div class="modal-head">
          <span style="color:var(--accent-2);">${icon('chart', 16)}</span>
          <h3>Writing Statistics</h3>
        </div>
        <div class="modal-body" id="statsModalBody">
          <div style="color:var(--fg-4);text-align:center;padding:20px;">Loading stats...</div>
        </div>
        <div class="modal-foot">
          <button class="btn primary" data-close>Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(scrim);

    // Wire close
    scrim.querySelector('[data-close]')?.addEventListener('click', closeModals);
    scrim.addEventListener('click', e => {
      if (e.target === scrim) closeModals();
    });
  }

  // Load and render stats
  const body = $('#statsModalBody');
  if (body) {
    body.innerHTML = '<div style="color:var(--fg-4);text-align:center;padding:20px;">Loading stats...</div>';
  }

  showModal('statsScrim');

  try {
    const [today, week, allTime, branches] = await Promise.all([
      getTodayStats(),
      getWeekStats(),
      getAllTimeStats(),
      getBranchStats(),
    ]);

    const maxWeekWords = Math.max(1, ...week.map(d => d.totalWords));

    const weekBarsHtml = week.map(d => {
      const height = d.totalWords > 0 ? (d.totalWords / maxWeekWords) * 100 : 4;
      const isToday = d.date === new Date().toISOString().slice(0, 10);
      return `
        <div class="stats-bar-col">
          <div class="stats-bar-track">
            <div class="stats-bar-fill${isToday ? ' today' : ''}" style="height:${height}%"></div>
          </div>
          <div class="stats-bar-label">${d.dayName}</div>
          <div class="stats-bar-value">${formatNumber(d.totalWords)}</div>
        </div>
      `;
    }).join('');

    const branchRowsHtml = branches.map(b => `
      <div class="stats-branch-row">
        <span class="stats-branch-name">${escapeHtml(b.branchName)}</span>
        <span class="stats-branch-wc">${formatNumber(b.wordCount)} words</span>
      </div>
    `).join('');

    // Deep analytics from current document text
    const docText = callbacks.editor?.value || '';
    const readability = calculateReadability(docText);
    const repeatedWords = getRepeatedWords(docText, true);
    const characterNames = extractCharacterNames(docText);
    const sentiment = analyzeSentiment(docText);

    const maxRepeatCount = repeatedWords.length > 0 ? repeatedWords[0][1] : 1;
    const repeatedWordsHtml = repeatedWords.length > 0
      ? repeatedWords.map(([word, count]) => {
          const pct = (count / maxRepeatCount) * 100;
          return `
            <div class="word-frequency-row">
              <span class="word">${escapeHtml(word)}</span>
              <div class="bar-wrap"><div class="bar-fill" style="width:${pct}%"></div></div>
              <span class="count">${count}</span>
            </div>
          `;
        }).join('')
      : '<div style="color:var(--fg-4);font-family:var(--font-mono);font-size:11px;padding:8px 0;">No repeated words found</div>';

    const characterNamesHtml = characterNames.length > 0
      ? characterNames.map(([name, count]) => `
          <span class="character-chip">${escapeHtml(name)} <span class="count">${count}</span></span>
        `).join('')
      : '<div style="color:var(--fg-4);font-family:var(--font-mono);font-size:11px;">No character names detected</div>';

    const sentimentPosPct = sentiment.positive + sentiment.negative > 0
      ? (sentiment.positive / (sentiment.positive + sentiment.negative)) * 100
      : 50;
    const sentimentNegPct = 100 - sentimentPosPct;

    body.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${formatNumber(today.totalWords)}</div>
          <div class="stat-label">Words Today</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${formatDuration(today.totalTime)}</div>
          <div class="stat-label">Time Today</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${today.sessions}</div>
          <div class="stat-label">Sessions</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${today.sprintsCompleted}</div>
          <div class="stat-label">Sprints</div>
        </div>
      </div>

      <h4 class="stats-section-title">This Week</h4>
      <div class="stats-week-chart">
        ${weekBarsHtml}
      </div>

      <h4 class="stats-section-title">All Time</h4>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${formatNumber(allTime.totalWords)}</div>
          <div class="stat-label">Total Words</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${formatDuration(allTime.totalTime)}</div>
          <div class="stat-label">Total Time</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${allTime.longestStreak}</div>
          <div class="stat-label">Longest Streak</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${formatNumber(allTime.avgWordsPerSession)}</div>
          <div class="stat-label">Avg Words/Session</div>
        </div>
      </div>

      <h4 class="stats-section-title">Per Branch</h4>
      <div class="stats-branch-list">
        ${branchRowsHtml}
      </div>

      <h4 class="stats-section-title">Readability</h4>
      <div class="analytics-grid">
        <div class="analytics-card">
          <div class="value" style="font-size:18px;color:var(--accent-2);">${readability.fleschKincaid}</div>
          <div class="label">Flesch-Kincaid Grade</div>
        </div>
        <div class="analytics-card">
          <div class="value" style="font-size:18px;color:var(--accent-2);">${readability.fleschEase}</div>
          <div class="label">Flesch Reading Ease</div>
        </div>
        <div class="analytics-card">
          <div class="value" style="font-size:18px;">${readability.avgSentenceLength}</div>
          <div class="label">Avg Sentence Length</div>
        </div>
        <div class="analytics-card">
          <div class="value" style="font-size:18px;">${readability.avgSyllablesPerWord}</div>
          <div class="label">Avg Syllables/Word</div>
        </div>
      </div>

      <h4 class="stats-section-title">Repeated Words <span style="color:var(--fg-4);font-size:10px;">(top 20)</span></h4>
      <div class="analytics-section">
        ${repeatedWordsHtml}
      </div>

      <h4 class="stats-section-title">Characters <span style="color:var(--fg-4);font-size:10px;">(auto-detected)</span></h4>
      <div class="analytics-section character-list">
        ${characterNamesHtml}
      </div>

      <h4 class="stats-section-title">Sentiment</h4>
      <div class="analytics-section">
        <div class="sentiment-bar">
          <div class="pos" style="width:${sentimentPosPct}%"></div>
          <div class="neg" style="width:${sentimentNegPct}%"></div>
        </div>
        <div class="sentiment-labels">
          <span>Positive: ${sentiment.positive}</span>
          <span>Score: ${sentiment.score > 0 ? '+' : ''}${sentiment.score}</span>
          <span>Negative: ${sentiment.negative}</span>
        </div>
      </div>
    `;
  } catch (err) {
    console.error('[ui.js] Failed to load stats:', err);
    body.innerHTML = `<div style="color:var(--danger-red);text-align:center;padding:20px;">Failed to load statistics</div>`;
  }
}

// ═══════════════════════════════════════════════════════════════
//  BRANCH ZIP EXPORT
// ═══════════════════════════════════════════════════════════════

export async function exportBranchAsZip() {
  const branch = getActiveBranch();
  if (!branch) {
    flashSave('No active branch');
    return;
  }

  // Check if JSZip is available
  if (typeof JSZip === 'undefined') {
    flashSave('ZIP library not loaded');
    return;
  }

  const zip = new JSZip();
  const folder = zip.folder(branch.id);

  // Build document label map from tree
  const labelMap = {};
  function collectLabels(nodes) {
    for (const node of nodes || []) {
      if (node.type !== 'folder') {
        const safeLabel = (node.label || node.id).replace(/[^a-z0-9_\- ]+/gi, '').replace(/\s+/g, '_');
        labelMap[node.id] = safeLabel || node.id;
      }
      if (node.children) collectLabels(node.children);
    }
  }
  collectLabels(branch.tree);

  // Add manifest
  folder.file('_manifest.json', JSON.stringify({
    app: 'Flow Writer',
    version: '1.0',
    branch: {
      id: branch.id,
      name: branch.name,
      parentId: branch.parentId,
      createdAt: branch.createdAt,
    },
    exportedAt: Date.now(),
    documents: Object.keys(branch.docs).map(id => ({
      id,
      label: labelMap[id] || id,
      wordCount: (branch.docs[id] || '').trim().split(/\s+/).filter(Boolean).length,
    })),
    metadata: branch.metadata,
  }, null, 2));

  // Add each document as .txt file
  for (const [docId, content] of Object.entries(branch.docs || {})) {
    const label = labelMap[docId] || docId;
    folder.file(`${label}.txt`, content || '');
  }

  // Generate and download
  const blob = await zip.generateAsync({ type: 'blob' });
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `flow-writer_${branch.id}_${dateStr}.zip`;

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);

  flashSave(`Exported \u00b7 ${filename}`);
}

// ═══════════════════════════════════════════════════════════════
//  ADVANCED EXPORT: DOCX + PDF
// ═══════════════════════════════════════════════════════════════

export async function exportDocx() {
  const branch = getActiveBranch();
  if (!branch) { flashSave('No active branch'); return; }
  if (typeof docx === 'undefined') { flashSave('DOCX library not loaded'); return; }

  try {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } = docx;

    const children = [];

    // Title page
    children.push(new Paragraph({
      text: branch.name || 'Flow Writer Export',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    }));
    children.push(new Paragraph({
      text: `Exported on ${new Date().toLocaleDateString()}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 }
    }));
    children.push(new Paragraph({
      text: `${branch.metadata?.wordCount || 0} words \u00b7 ${Object.keys(branch.docs).length} documents`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    }));

    // Build label lookup from tree
    const labelMap = {};
    function _buildLabelMap(nodes) {
      for (const n of nodes || []) {
        if (n.type !== 'folder') labelMap[n.id] = n.label || n.id;
        if (n.children) _buildLabelMap(n.children);
      }
    }
    collectLabels(branch.tree);

    // Table of contents
    children.push(new Paragraph({ text: 'Contents', heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 200 } }));
    for (const [docId, content] of Object.entries(branch.docs || {})) {
      const label = labelMap[docId] || docId;
      const wc = content.trim().split(/\s+/).filter(Boolean).length;
      children.push(new Paragraph({
        children: [
          new TextRun({ text: label, bold: false }),
          new TextRun({ text: `  ${wc} words`, color: '888888', size: 20 }),
        ],
        spacing: { after: 80 }
      }));
    }
    children.push(new Paragraph({ text: '', spacing: { after: 400 } }));

    // Each document
    for (const [docId, content] of Object.entries(branch.docs || {})) {
      const label = labelMap[docId] || docId;
      children.push(new Paragraph({ text: label, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));

      // Split content into paragraphs
      const paragraphs = (content || '').split('\n').filter(p => p.trim());
      for (const para of paragraphs) {
        children.push(new Paragraph({
          children: [new TextRun({ text: para, font: 'Georgia', size: 24 })], // 12pt
          spacing: { after: 200, line: 360 }, // 1.5 line spacing
        }));
      }
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }

    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `flow-writer-${branch.id}-${new Date().toISOString().slice(0,10)}.docx`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    flashSave('Exported \u00b7 .docx');
  } catch (e) {
    console.error('DOCX export error:', e);
    flashSave('Export failed: ' + e.message);
  }
}

export async function exportPdf() {
  const branch = getActiveBranch();
  if (!branch) { flashSave('No active branch'); return; }
  if (typeof jspdf === 'undefined' || !jspdf.jsPDF) { flashSave('PDF library not loaded'); return; }

  try {
    const { jsPDF } = jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });

    // Build label lookup
    const labelMap = {};
    
    collectLabels(branch.tree);

    let y = 72; // Start 1 inch from top
    const margin = 72;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = pageWidth - margin * 2;

    // Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(branch.name || 'Flow Writer Export', pageWidth / 2, y, { align: 'center' });
    y += 30;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text(`Exported on ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' });
    y += 20;
    doc.text(`${branch.metadata?.wordCount || 0} words`, pageWidth / 2, y, { align: 'center' });
    y += 60;

    doc.setTextColor(0, 0, 0);

    for (const [docId, content] of Object.entries(branch.docs || {})) {
      // Check for page break
      if (y > 600) { doc.addPage(); y = 72; }

      const label = labelMap[docId] || docId;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin, y);
      y += 24;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      const paragraphs = (content || '').split('\n').filter(p => p.trim());
      for (const para of paragraphs) {
        const lines = doc.splitTextToSize(para, textWidth);
        if (y + lines.length * 14 > 720) { doc.addPage(); y = 72; }
        doc.text(lines, margin, y);
        y += lines.length * 14 + 8;
      }
      y += 20;
    }

    doc.save(`flow-writer-${branch.id}-${new Date().toISOString().slice(0,10)}.pdf`);
    flashSave('Exported \u00b7 .pdf');
  } catch (e) {
    console.error('PDF export error:', e);
    flashSave('Export failed: ' + e.message);
  }
}

// ═══════════════════════════════════════════════════════════════
//  FILE IMPORT (Drag and Drop)
// ═══════════════════════════════════════════════════════════════

export function wireFileImport() {
  const tree = $('#tree');
  if (!tree) return;

  tree.addEventListener('dragover', (e) => {
    // Only trigger for files from desktop (not internal tree drags)
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      tree.classList.add('file-drag-over');
    }
  });

  tree.addEventListener('dragleave', (e) => {
    if (!e.relatedTarget?.closest('#tree')) {
      tree.classList.remove('file-drag-over');
    }
  });

  tree.addEventListener('drop', async (e) => {
    // Only handle file drops (not internal tree drags which use text/plain)
    if (!e.dataTransfer.types.includes('Files')) return;

    e.preventDefault();
    tree.classList.remove('file-drag-over');

    const files = Array.from(e.dataTransfer.files).filter(f => {
      const ext = f.name.split('.').pop().toLowerCase();
      return ext === 'txt' || ext === 'md';
    });

    if (files.length === 0) {
      flashSave('Only .txt and .md files are supported');
      return;
    }

    for (const file of files) {
      const text = await file.text();
      const label = file.name.replace(/\.[^.]+$/, ''); // Remove extension

      // Create new document node
      const newNode = {
        id: 'doc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        type: 'doc',
        label,
        icon: 'doc',
        color: 'var(--accent-2)',
        order: 999,
      };

      // Add to tree (top-level) and set content
      await addTreeNode(null, newNode);

      // Set the document content
      const branch = getActiveBranch();
      if (branch) {
        branch.docs[newNode.id] = text;
      }
    }

    // Save and re-render
    await saveCurrentDoc();
    renderTree(getActiveBranch()?.tree);
    flashSave(`Imported ${files.length} file${files.length > 1 ? 's' : ''}`);
  });
}

// ═══════════════════════════════════════════════════════════════
//  ESCAPE KEY HANDLER (shared)
// ═══════════════════════════════════════════════════════════════

export function handleEscape() {
  closeModals();
  closeAllMenus();
}

// ═══════════════════════════════════════════════════════════════
//  HAPTIC FEEDBACK UTILITY (Feature 7)
// ═══════════════════════════════════════════════════════════════

export function hapticFeedback(type = 'light') {
  if (!navigator.vibrate) return;
  const patterns = {
    light: 10,
    medium: 25,
    heavy: 40,
    success: [10, 50, 20],
    error: [30, 40, 30],
  };
  navigator.vibrate(patterns[type] || patterns.light);
}

// ═══════════════════════════════════════════════════════════════
//  ONBOARDING TUTORIAL — 3-step bottom card
// ═══════════════════════════════════════════════════════════════

const TUTORIAL_STEPS = [
  {
    title: 'The Editor',
    desc: 'Your writing space. Tap to start typing. Use \u2318K for commands.',
  },
  {
    title: 'The Sidebar',
    desc: 'Organize chapters, characters, and world building. Drag to reorder.',
  },
  {
    title: 'Branching',
    desc: 'Save snapshots to create branches. Experiment without fear.',
  },
];

let _tutorialTimer = null;

export function initOnboarding() {
  if (localStorage.getItem('fw-onboarding-done')) return;

  const overlay = $('#onboardingOverlay');
  const card = $('#onboardingCard');
  if (!overlay || !card) return;

  let step = 0;

  const showTutorialStep = (index) => {
    const s = TUTORIAL_STEPS[index];
    if (!s) return;

    const titleEl = $('#onboardingTitle');
    const textEl = $('#onboardingText');
    const dotsEl = $('#onboardingDots');

    if (titleEl) titleEl.textContent = s.title;
    if (textEl) textEl.textContent = s.desc;

    if (dotsEl) {
      dotsEl.innerHTML = TUTORIAL_STEPS.map((_, i) =>
        `<div class="dot ${i === index ? 'active' : ''}"></div>`
      ).join('');
    }
  };

  const dismiss = () => {
    if (_tutorialTimer) {
      clearInterval(_tutorialTimer);
      _tutorialTimer = null;
    }
    overlay.style.display = 'none';
    localStorage.setItem('fw-onboarding-done', 'true');
  };

  const advance = () => {
    step++;
    if (step >= TUTORIAL_STEPS.length) {
      dismiss();
      return;
    }
    showTutorialStep(step);
  };

  // Dismiss button
  $('#tutorialDismiss')?.addEventListener('click', (e) => {
    e.stopPropagation();
    dismiss();
  });

  // Click card to advance
  card.addEventListener('click', () => {
    advance();
  });

  // Show first step
  overlay.style.display = '';
  showTutorialStep(step);

  // Auto-advance every 5 seconds
  _tutorialTimer = setInterval(() => {
    advance();
  }, 5000);
}

// ═══════════════════════════════════════════════════════════════
//  DRAG-AND-DROP TREE REORDERING (Section 2)
// ═══════════════════════════════════════════════════════════════

function clearDropIndicators() {
  $$('.tree-item').forEach(el => {
    el.classList.remove('drop-before', 'drop-after', 'drop-into', 'dragging');
  });
}

function findParentNode(tree, nodeId, parent = null) {
  for (const node of tree || []) {
    if (node.id === nodeId) return parent;
    if (node.children) {
      const found = findParentNode(node.children, nodeId, node);
      if (found) return found;
    }
  }
  return null;
}

async function executeTreeMove(draggedId, targetId, action) {
  const branch = getActiveBranch();
  if (!branch) return;

  // Prevent dragging a node into its own descendant
  const draggedNode = findTreeNode(branch.tree, draggedId);
  if (draggedNode && draggedNode.children) {
    const descendantIds = [];
    const collectIds = (nodes) => {
      for (const n of nodes || []) {
        descendantIds.push(n.id);
        if (n.children) collectIds(n.children);
      }
    };
    collectIds(draggedNode.children);
    if (action === 'into' && descendantIds.includes(targetId)) {
      flashSave('Cannot move into own descendant');
      return;
    }
  }

  let success = false;

  try {
    if (action === 'into') {
      // Move into target folder
      success = await moveTreeNode(draggedId, targetId, 999);
    } else {
      // Find target's parent and index
      const targetParent = findParentNode(branch.tree, targetId);
      const siblings = targetParent ? targetParent.children : branch.tree;
      const targetIndex = siblings.findIndex(n => n.id === targetId);

      if (action === 'after') {
        success = await moveTreeNode(draggedId, targetParent?.id || null, targetIndex + 1);
      } else {
        success = await moveTreeNode(draggedId, targetParent?.id || null, targetIndex);
      }
    }

    if (success) {
      renderTree(getActiveBranch()?.tree);
      flashSave('Moved');
    }
  } catch (err) {
    console.error('[ui.js] Move failed:', err);
    flashSave('Move failed');
  }
}

export function wireTreeDragAndDrop() {
  const tree = $('#tree');
  if (!tree) return;

  let draggedNodeId = null;

  // dragstart -- mark item as dragging
  tree.addEventListener('dragstart', (e) => {
    const item = e.target.closest('.tree-item');
    if (!item) return;
    draggedNodeId = item.dataset.nodeId;
    e.dataTransfer.setData('text/plain', draggedNodeId);
    e.dataTransfer.effectAllowed = 'move';
    item.classList.add('dragging');
    hapticFeedback('medium');
  });

  // dragover -- determine drop position
  tree.addEventListener('dragover', (e) => {
    e.preventDefault(); // Allow drop
    e.dataTransfer.dropEffect = 'move';

    const targetItem = e.target.closest('.tree-item');
    if (!targetItem) return;

    clearDropIndicators();

    // Calculate drop position based on mouse Y relative to target
    const rect = targetItem.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;

    if (e.clientY < midY - 6) {
      targetItem.classList.add('drop-before');
    } else if (e.clientY > midY + 6) {
      targetItem.classList.add('drop-after');
    } else if (targetItem.dataset.type === 'folder') {
      // Prevent dropping a folder into itself
      if (targetItem.dataset.nodeId !== draggedNodeId) {
        targetItem.classList.add('drop-into');
      } else {
        targetItem.classList.add('drop-after');
      }
    } else {
      targetItem.classList.add('drop-after');
    }
  });

  // dragleave -- clear indicators when leaving the tree
  tree.addEventListener('dragleave', (e) => {
    if (!e.relatedTarget?.closest('#tree')) {
      clearDropIndicators();
    }
  });

  // drop -- execute move
  tree.addEventListener('drop', async (e) => {
    e.preventDefault();
    clearDropIndicators();

    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId) return;

    const targetItem = e.target.closest('.tree-item');
    if (!targetItem || targetItem.dataset.nodeId === draggedId) return;

    // Determine drop action from CSS classes
    const targetId = targetItem.dataset.nodeId;
    const isFolder = targetItem.dataset.type === 'folder';
    const rect = targetItem.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;

    let action = 'after'; // default
    if (e.clientY < midY - 6) action = 'before';
    else if (e.clientY > midY + 6) action = 'after';
    else if (isFolder) action = 'into';

    // Prevent dropping a folder into a document
    if (action === 'into' && !isFolder) {
      action = 'after';
    }

    // Execute move via engine
    await executeTreeMove(draggedId, targetId, action);
  });

  // dragend -- cleanup
  tree.addEventListener('dragend', (e) => {
    clearDropIndicators();
    e.target.closest('.tree-item')?.classList.remove('dragging');
    draggedNodeId = null;
  });
}

// ═══════════════════════════════════════════════════════════════
//  TOUCH DRAG-AND-DROP FOR TREE (Feature 1 — Phase 5b)
// ═══════════════════════════════════════════════════════════════

export function wireTouchTreeDragAndDrop() {
  const tree = $('#tree');
  if (!tree) return;

  // Detect touch support
  const isTouch = 'ontouchstart' in window;
  if (!isTouch) return;

  let longPressTimer = null;
  let dragNodeId = null;
  let isDragging = false;
  let touchStartPos = null;
  let ghostEl = null;

  const LONG_PRESS_MS = 500;
  const DRAG_THRESHOLD = 10;

  tree.addEventListener('touchstart', (e) => {
    const item = e.target.closest('.tree-item');
    if (!item) return;

    const touch = e.touches[0];
    touchStartPos = { x: touch.clientX, y: touch.clientY };
    dragNodeId = item.dataset.nodeId;

    longPressTimer = setTimeout(() => {
      // Long press detected — start drag mode
      isDragging = true;
      item.classList.add('dragging');
      tree.classList.add('dragging-active');

      // Create ghost element
      ghostEl = item.cloneNode(true);
      ghostEl.classList.add('drag-ghost');
      ghostEl.style.position = 'fixed';
      ghostEl.style.pointerEvents = 'none';
      ghostEl.style.opacity = '0.85';
      ghostEl.style.zIndex = '1000';
      ghostEl.style.width = `${item.offsetWidth}px`;
      document.body.appendChild(ghostEl);

      // Vibrate
      if (navigator.vibrate) navigator.vibrate(20);

      // Prevent default to stop scrolling
      // (can't preventDefault in passive listener, so use CSS touch-action)
    }, LONG_PRESS_MS);
  }, { passive: true });

  tree.addEventListener('touchmove', (e) => {
    if (longPressTimer) {
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartPos.x;
      const dy = touch.clientY - touchStartPos.y;
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    }

    if (!isDragging || !ghostEl) return;

    e.preventDefault();
    const touch = e.touches[0];
    ghostEl.style.left = `${touch.clientX - ghostEl.offsetWidth / 2}px`;
    ghostEl.style.top = `${touch.clientY - 20}px`;

    // Determine drop target
    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetItem = targetEl?.closest('.tree-item');
    clearDropIndicators();
    if (targetItem && targetItem.dataset.nodeId !== dragNodeId) {
      const rect = targetItem.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      if (touch.clientY < midY - 6) {
        targetItem.classList.add('drop-before');
      } else if (touch.clientY > midY + 6) {
        targetItem.classList.add('drop-after');
      } else if (targetItem.dataset.type === 'folder') {
        targetItem.classList.add('drop-into');
      } else {
        targetItem.classList.add('drop-after');
      }
    }
  }, { passive: false });

  const endDrag = async (e) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    if (!isDragging) return;

    // Determine final drop action
    const touch = e.changedTouches[0];
    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetItem = targetEl?.closest('.tree-item');

    if (targetItem && targetItem.dataset.nodeId !== dragNodeId) {
      const rect = targetItem.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      let action = 'after';
      if (touch.clientY < midY - 6) action = 'before';
      else if (touch.clientY > midY + 6) action = 'after';
      else if (targetItem.dataset.type === 'folder') action = 'into';

      await executeTreeMove(dragNodeId, targetItem.dataset.nodeId, action);
    }

    // Cleanup
    clearDropIndicators();
    $$('.tree-item.dragging').forEach(el => el.classList.remove('dragging'));
    if (ghostEl) { ghostEl.remove(); ghostEl = null; }
    tree.classList.remove('dragging-active');
    isDragging = false;
    dragNodeId = null;
  };

  tree.addEventListener('touchend', endDrag);
  tree.addEventListener('touchcancel', endDrag);
}

// ═══════════════════════════════════════════════════════════════
//  MOBILE FILE IMPORT (Phase 5b)
// ═══════════════════════════════════════════════════════════════

function wireMobileFileImport() {
  const btn = $('#mobileImportBtn');
  const input = $('#mobileFileInput');
  if (!btn || !input) return;

  btn.addEventListener('click', () => input.click());

  input.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files).filter(f => {
      const ext = f.name.split('.').pop().toLowerCase();
      return ext === 'txt' || ext === 'md';
    });

    for (const file of files) {
      const text = await file.text();
      const label = file.name.replace(/\.[^.]+$/, '');
      const newNode = {
        id: 'doc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        type: 'doc', label, icon: 'doc', color: 'var(--accent-2)', order: 999,
      };
      await addTreeNode(null, newNode);
      const branch = getActiveBranch();
      if (branch) branch.docs[newNode.id] = text;
    }

    await saveCurrentDoc();
    renderTree(getActiveBranch()?.tree);
    flashSave(`Imported ${files.length} file${files.length > 1 ? 's' : ''}`);
    input.value = '';
  });
}

// ═══════════════════════════════════════════════════════════════
//  INITIAL SETUP
// ═══════════════════════════════════════════════════════════════

export function initUI() {
  // Wire close buttons on all modals
  $$('[data-close]').forEach(b => {
    b.addEventListener('click', closeModals);
  });

  // Click outside modal to close
  $$('.modal-scrim').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target === el) closeModals();
    });
  });

  // Wire "+ branch" button (opens create branch modal)
  const btnBranchNew = $('#btnBranchNew');
  if (btnBranchNew) {
    btnBranchNew.addEventListener('click', () => {
      updateCreateBranchModal();
      showModal('branchScrim');
    });
  }

  // Wire create branch modal (submit button inside modal)
  wireCreateBranchModal();

  // Wire commit snapshot submit
  const btnSnapshot = $('#commitSnapshotSubmit');
  if (btnSnapshot) {
    btnSnapshot.addEventListener('click', submitCommitSnapshot);
  }

  // Wire commit snapshot cancel (uses data-close)
  // Wire restore commit submit
  const btnRestore = $('#restoreCommitSubmit');
  if (btnRestore) {
    btnRestore.addEventListener('click', submitRestoreCommit);
  }

  // Wire scene goal placeholder click → open modal

  // Wire branch comparison copy button
  const btnCompareCopy = $('#compareCopyBtn');
  if (btnCompareCopy) {
    btnCompareCopy.addEventListener('click', onCopyFromOtherBranch);
  }

  // Wire scene goal placeholder click
  const sceneBanner = $('#sceneBanner');
  if (sceneBanner) {
    sceneBanner.addEventListener('click', (e) => {
      if (e.target.closest('.scene-goal-placeholder')) {
        openSceneGoalModal();
      }
    });
  }

  // Wire scene goal modal buttons
  const sceneGoalSaveBtn = $('#sceneGoalSave');
  if (sceneGoalSaveBtn) {
    sceneGoalSaveBtn.addEventListener('click', saveSceneGoal);
  }

  const sceneGoalDeleteBtn = $('#sceneGoalDelete');
  if (sceneGoalDeleteBtn) {
    sceneGoalDeleteBtn.addEventListener('click', deleteSceneGoal);
  }

  // Wire scene goal template selector
  const sceneGoalTemplate = $('#sceneGoalTemplate');
  if (sceneGoalTemplate) {
    sceneGoalTemplate.addEventListener('change', (e) => {
      const textArea = $('#sceneGoalText');
      if (textArea && e.target.value) {
        textArea.value = e.target.value;
      }
    });
  }

  // Wire drag-and-drop tree reordering
  wireTreeDragAndDrop();

  // Wire mobile file import (Phase 5b)
  wireMobileFileImport();

  // Wire cross-branch search input
  const searchInput = $('#searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(performSearch, 200));
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') performSearch();
    });
  }

  // Phase 5a: Initialize tabbed right pane
  initRightPaneTabs();

  // Phase 5a: Initialize inline branch rename (double-click #branchName)
  initInlineBranchRename();

  // Phase 5a: Wire shortcuts button in topbar
  const btnShortcuts = $('#btnShortcuts');
  if (btnShortcuts) {
    btnShortcuts.addEventListener('click', openShortcutsModal);
  }

  // Phase 5a: Wire AI tab quick buttons
  const aiQuickConfig = $('#aiQuickConfig');
  if (aiQuickConfig) {
    aiQuickConfig.addEventListener('click', () => {
      openAIAssistantModal();
      // Switch to the Config sub-area if possible
      const configPanel = $('#aiConfigPanel');
      if (configPanel) configPanel.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const aiOpenModalBtn = $('#aiOpenModalBtn');
  if (aiOpenModalBtn) {
    aiOpenModalBtn.addEventListener('click', openAIAssistantModal);
  }

  // Phase 5a: Wire quick rewrite buttons on AI tab
  ['Concise', 'Vivid', 'Grammar', 'Expand'].forEach(style => {
    const btn = $(`#aiQuick${style}`);
    if (btn) {
      btn.addEventListener('click', async () => {
        const editor = $('#editor');
        if (!editor) return;
        const text = editor.value.slice(editor.selectionStart, editor.selectionEnd);
        if (!text.trim()) {
          flashSave('Select text in the editor first');
          return;
        }
        const styleMap = { Concise: 'more concise', Vivid: 'more vivid', Grammar: 'fix grammar', Expand: 'expand' };
        const result = await rewriteText(text, styleMap[style], 'dramatic');
        if (result.result) {
          const start = editor.selectionStart;
          const end = editor.selectionEnd;
          editor.value = editor.value.slice(0, start) + result.result + editor.value.slice(end);
          editor.selectionStart = editor.selectionEnd = start + result.result.length;
          editor.dispatchEvent(new Event('input'));
          flashSave(`${style} rewrite applied`);
        }
      });
    }
  });

  wireFileImport();

  // Haptic feedback on mode buttons
  $$('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => hapticFeedback('light'));
  });

  // Haptic feedback on export buttons
  $$('.export-btn').forEach(btn => {
    btn.addEventListener('click', () => hapticFeedback('light'));
  });

  // Wire theme toggle buttons
  wireThemeToggle();
}

// ═══════════════════════════════════════════════════════════════
//  DEEP WRITING ANALYTICS
// ═══════════════════════════════════════════════════════════════

export function calculateReadability(text) {
  if (!text || !text.trim()) return { fleschKincaid: 0, fleschEase: 0, avgSentenceLength: 0, avgSyllablesPerWord: 0 };

  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  const words = text.trim().split(/\s+/).filter(Boolean);

  const sentenceCount = sentences.length || 1;
  const wordCount = words.length || 1;

  // Simple syllable counting
  function countSyllables(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const match = word.match(/[aeiouy]{1,2}/g);
    return match ? match.length : 1;
  }

  const syllableCount = words.reduce((sum, w) => sum + countSyllables(w), 0);

  const avgSentenceLength = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllableCount / wordCount;

  const fleschEase = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  const fleschKincaid = (0.39 * avgSentenceLength) + (11.8 * avgSyllablesPerWord) - 15.59;

  return {
    fleschKincaid: Math.max(0, Math.round(fleschKincaid * 10) / 10),
    fleschEase: Math.round(fleschEase * 10) / 10,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 10) / 10,
  };
}

export function getRepeatedWords(text, excludeCommon = true) {
  const COMMON_WORDS = new Set(['the','a','an','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','must','shall','can','need','dare','ought','used','to','of','in','for','on','with','at','by','from','as','into','through','during','before','after','above','below','between','under','and','but','or','yet','so','if','because','although','though','while','where','when','that','which','who','whom','whose','what','this','these','those','i','me','my','myself','we','our','you','your','he','him','his','she','her','it','its','they','them','their','one','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','than','too','very','just','now','then','here','there','up','out','off','over','again','further','once','down','out','s','t','don','didn','won','wouldn','couldn','shouldn']);

  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const counts = {};
  for (const w of words) {
    if (excludeCommon && COMMON_WORDS.has(w)) continue;
    counts[w] = (counts[w] || 0) + 1;
  }

  return Object.entries(counts)
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
}

export function extractCharacterNames(text) {
  // Find capitalized words that appear multiple times
  const matches = text.match(/\b[A-Z][a-z]+\b/g) || [];
  const counts = {};
  for (const name of matches) {
    if (name.length < 3) continue;
    counts[name] = (counts[name] || 0) + 1;
  }
  return Object.entries(counts)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);
}

export function analyzeSentiment(text) {
  const POSITIVE = new Set(['good','great','excellent','happy','joy','love','wonderful','beautiful','amazing','brilliant','perfect','glad','excited','hope','peace','calm','safe','warm','bright','kind']);
  const NEGATIVE = new Set(['bad','terrible','awful','sad','hate','angry','fear','dark','cold','danger','death','pain','broken','lost','alone','worried','nervous','grim','harsh','cruel']);

  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  let pos = 0, neg = 0;
  for (const w of words) {
    if (POSITIVE.has(w)) pos++;
    if (NEGATIVE.has(w)) neg++;
  }
  const total = pos + neg || 1;
  return {
    positive: pos,
    negative: neg,
    score: Math.round(((pos - neg) / total) * 100),
  };
}

// ═══════════════════════════════════════════════════════════════
//  MOBILE NAVIGATION
// ═══════════════════════════════════════════════════════════════

export function initMobileNav() {
  const hamburger = $('#hamburgerBtn');
  const leftPane  = $('.pane.left');
  const rightPane = $('.pane.right');
  const overlay   = $('#leftPaneOverlay');

  const closeAll = () => {
    leftPane?.classList.remove('open');
    rightPane?.classList.remove('open');
    overlay?.classList.remove('show');
  };

  const toggleLeft = () => {
    const opening = !leftPane?.classList.contains('open');
    closeAll();
    if (opening) {
      leftPane?.classList.add('open');
      overlay?.classList.add('show');
    }
  };

  const toggleRight = () => {
    const opening = !rightPane?.classList.contains('open');
    closeAll();
    if (opening) {
      rightPane?.classList.add('open');
      overlay?.classList.add('show');
    }
  };

  if (hamburger) hamburger.addEventListener('click', () => { hapticFeedback('light'); toggleLeft(); });
  if (overlay)   overlay.addEventListener('click', closeAll);

  // Mobile nav buttons
  $('#mobileNavTree')?.addEventListener('click',    () => { hapticFeedback('light'); toggleLeft(); });
  $('#mobileNavTools')?.addEventListener('click',   () => { hapticFeedback('light'); toggleRight(); });

  $('#mobileNavFocus')?.addEventListener('click', () => {
    hapticFeedback('light');
    if (callbacks.onToggleFocus) callbacks.onToggleFocus();
  });

  $('#mobileNavPalette')?.addEventListener('click', () => {
    hapticFeedback('light');
    if (callbacks.onOpenCommandPalette) callbacks.onOpenCommandPalette();
  });

  // Voice: delegate to the topbar button so voice-to-text.js handles state
  const mobileVoiceBtn = $('#mobileNavVoice');
  if (mobileVoiceBtn) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      mobileVoiceBtn.style.display = 'none';
    } else {
      mobileVoiceBtn.addEventListener('click', () => {
        hapticFeedback('light');
        document.getElementById('btnVoice')?.click();
        // Mirror listening state on mobile button
        setTimeout(() => {
          const listening = document.getElementById('btnVoice')?.classList.contains('listening');
          mobileVoiceBtn.classList.toggle('active', !!listening);
        }, 100);
      });
    }
  }

  // Theme toggle: call global handler, update mobile icon
  const mobileThemeBtn = $('#mobileNavTheme');
  const mobileThemeIcon = document.getElementById('mobileNavThemeIcon');
  const updateMobileThemeIcon = () => {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    if (mobileThemeIcon) {
      mobileThemeIcon.innerHTML = isDark
        ? '<circle cx="8" cy="8" r="3"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06"/>'
        : '<path d="M13.5 9.5a6 6 0 11-7-7 4.5 4.5 0 007 7z"/>';
    }
    if (mobileThemeBtn) mobileThemeBtn.setAttribute('title', isDark ? 'Light mode' : 'Dark mode');
  };
  if (mobileThemeBtn) {
    updateMobileThemeIcon();
    mobileThemeBtn.addEventListener('click', () => {
      hapticFeedback('light');
      if (window._toggleTheme) window._toggleTheme();
      updateMobileThemeIcon();
    });
  }

  // Mobile Universe Dashboard button
  $('#mobileNavDashboard')?.addEventListener('click', () => {
    hapticFeedback('light');
    const scrim = document.getElementById('universeDashboardScrim');
    if (scrim) scrim.classList.add('show');
  });
}
