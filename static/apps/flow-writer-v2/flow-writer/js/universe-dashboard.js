/* ============================================================
   Universe Dashboard — Character & Story Beat Mini-Windows
   ============================================================
   Modal panel showing Characters and Story Beats as cards.

   Characters are owned by character-store.js (text in localStorage,
   images in IndexedDB) and edited via character-editor.js. This
   module renders them and the toolbar (search / filter / add /
   export-import). Story Beats remain local to this module.
   ============================================================ */

import {
  getCharacters,
  createCharacter,
  reorderCharacters,
  getImage,
  exportAll,
  exportCharacter,
  importBundle,
} from './character-store.js?v=1';
import { openEditor } from './character-editor.js?v=1';

// ---------- Beat state (characters live in the store) ----------
let storyBeats = [];
let draggedItem = null;
let draggedType = null; // 'character' | 'beat'
let dragSourceId = null;
let dragSourceIndex = null;

// ---------- Filter state ----------
let searchText = '';
let typeFilter = 'all';

const STORAGE_KEY_BEATS = 'fw-universe-storybeats';

// ---------- Demo Beats ----------
const DEMO_BEATS = [
  { id: 'beat-1', title: 'Discovery of hidden door', act: 'Act 1', chapter: 'Ch.1', scene: 'The Old Wing', status: 'drafted',
    description: "Sarah notices an anomaly in the floor plan — a door that shouldn't exist, hidden behind a bookshelf that hasn't been moved in decades.",
    characters: ['char-1'], createdAt: Date.now() - 86400000 * 3 },
  { id: 'beat-2', title: 'Sarah finds the journal', act: 'Act 2a', chapter: 'Ch.1', scene: 'Behind the Shelf', status: 'drafted',
    description: "Behind the hidden door, Sarah discovers a journal belonging to the library's original architect — filled with cryptic warnings and a map.",
    characters: ['char-1', 'char-2'], createdAt: Date.now() - 86400000 * 2 },
  { id: 'beat-3', title: 'The truth revealed', act: 'Act 2b', chapter: 'Ch.2', scene: 'The Reading Room', status: 'planned',
    description: "The Librarian confronts Sarah, revealing the true purpose of the library — it's not a repository of books, but a prison for something ancient.",
    characters: ['char-1', 'char-2', 'char-3'], createdAt: Date.now() - 86400000 },
  { id: 'beat-4', title: 'Resolution', act: 'Act 3', chapter: 'Ch.2', scene: 'The Archive', status: 'planned',
    description: "Sarah must decide: seal the library forever, or become its new guardian. Detective Rowe arrives with crucial evidence that changes everything.",
    characters: ['char-1', 'char-3'], createdAt: Date.now() },
];

// ---------- Icons ----------
const PERSON_ICON = '<svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="5" r="3"/><path d="M2 15c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>';
const TYPE_ICONS = { protagonist: PERSON_ICON, antagonist: PERSON_ICON, supporting: PERSON_ICON };

const TYPE_COLORS = {
  protagonist: 'var(--accent-2)',
  antagonist: 'var(--danger-red)',
  supporting: 'var(--warn-amber)',
};

const STATUS_CONFIG = {
  planned:  { label: 'Planned',  class: 'status-planned' },
  drafted:  { label: 'Drafted',  class: 'status-drafted' },
  revised:  { label: 'Revised',  class: 'status-revised' },
  complete: { label: 'Complete', class: 'status-complete' },
};

const ACT_COLORS = {
  'Act 1':  'var(--accent-2)',
  'Act 2a': 'var(--electric-cyan)',
  'Act 2b': 'var(--electric-violet)',
  'Act 3':  'var(--pulse-green)',
};

// ---------- Beat persistence ----------
function saveBeats() {
  try { localStorage.setItem(STORAGE_KEY_BEATS, JSON.stringify(storyBeats)); }
  catch (e) { console.warn('[UniverseDashboard] beat save failed:', e); }
}

function seedBeats() {
  let raw = null;
  try { raw = localStorage.getItem(STORAGE_KEY_BEATS); } catch (e) { /* ignore */ }
  let parsed = null;
  if (raw) { try { parsed = JSON.parse(raw); } catch (e) { parsed = null; } }
  storyBeats = (parsed && Array.isArray(parsed) && parsed.length) ? parsed : JSON.parse(JSON.stringify(DEMO_BEATS));
  saveBeats();
}

// ---------- DOM Refs ----------
let scrim, modal, charColumn, charGrid, beatsGrid, toolbar;
let initialized = false;

function cacheDOM() {
  scrim = document.getElementById('universeDashboardScrim');
  modal = document.getElementById('universeDashboardModal');
  charColumn = document.getElementById('characterColumn');
  charGrid = document.getElementById('characterGrid');
  beatsGrid = document.getElementById('beatsGrid');
}

// ---------- Toolbar (injected once) ----------
function ensureToolbar() {
  if (toolbar || !charColumn || !charGrid) return;
  toolbar = document.createElement('div');
  toolbar.className = 'char-toolbar';
  toolbar.id = 'charToolbar';
  toolbar.innerHTML = `
    <input type="text" class="char-search" id="charSearch" placeholder="Search characters…" aria-label="Search characters" />
    <div class="char-type-chips" id="charTypeChips">
      <button type="button" class="char-chip active" data-type="all">All</button>
      <button type="button" class="char-chip" data-type="protagonist">Protagonist</button>
      <button type="button" class="char-chip" data-type="antagonist">Antagonist</button>
      <button type="button" class="char-chip" data-type="supporting">Supporting</button>
    </div>
    <div class="char-toolbar-actions">
      <button type="button" class="char-tb-btn primary" id="charAddBtn">+ Add</button>
      <button type="button" class="char-tb-btn" id="charExportBtn" title="Export all characters">Export</button>
      <button type="button" class="char-tb-btn" id="charImportBtn" title="Import characters">Import</button>
      <input type="file" id="charImportInput" accept="application/json,.json" hidden />
    </div>`;
  charColumn.insertBefore(toolbar, charGrid);

  const search = toolbar.querySelector('#charSearch');
  search.addEventListener('input', () => { searchText = search.value.toLowerCase().trim(); renderCharacters(); });

  toolbar.querySelectorAll('.char-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      typeFilter = chip.dataset.type;
      toolbar.querySelectorAll('.char-chip').forEach(c => c.classList.toggle('active', c === chip));
      renderCharacters();
    });
  });

  toolbar.querySelector('#charAddBtn').addEventListener('click', () => openEditor(null, renderDashboard));
  toolbar.querySelector('#charExportBtn').addEventListener('click', handleExportAll);
  const importInput = toolbar.querySelector('#charImportInput');
  toolbar.querySelector('#charImportBtn').addEventListener('click', () => importInput.click());
  importInput.addEventListener('change', (e) => handleImportFile(e.target.files && e.target.files[0]).finally(() => { importInput.value = ''; }));
}

// ---------- Filtering ----------
function filteredCharacters() {
  return getCharacters().filter(c => {
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;
    if (!searchText) return true;
    const hay = [
      c.name, c.description, (c.traits || []).join(' '),
      c.profile && Object.values(c.profile).join(' '),
    ].join(' ').toLowerCase();
    return hay.includes(searchText);
  });
}

// ---------- Render: Character card ----------
function renderCharacterCard(char) {
  const typeLabel = char.type.charAt(0).toUpperCase() + char.type.slice(1);
  const accent = char.accentColor || TYPE_COLORS[char.type] || 'var(--accent-2)';
  const icon = TYPE_ICONS[char.type] || PERSON_ICON;
  const traitsHtml = (char.traits || []).map(t => `<span class="char-trait">${escapeHtml(t)}</span>`).join('');
  const hasProfile = char.profile && Object.values(char.profile).some(v => v && v.trim());
  const profileHtml = hasProfile ? `
    <div class="char-profile-extra">
      ${['backstory','goals','arc','voice','relationships'].map(k => {
        const v = char.profile[k];
        if (!v || !v.trim()) return '';
        const label = k.charAt(0).toUpperCase() + k.slice(1);
        return `<div class="char-profile-row"><strong>${label}:</strong> ${escapeHtml(v)}</div>`;
      }).join('')}
    </div>` : '';

  const avatarHtml = char.avatarId
    ? `<span class="char-avatar" data-avatar-id="${char.avatarId}" aria-hidden="true"></span>`
    : `<span class="char-type-icon" title="${typeLabel}">${icon}</span>`;

  return `
    <div class="char-window ${char.type}"
         data-char-id="${char.id}"
         draggable="true"
         role="button"
         tabindex="0"
         style="border-top-color:${accent};"
         aria-label="Character: ${escapeHtml(char.name)}">
      <div class="char-window-chrome">
        <div class="char-window-dots"><span class="wdot red"></span><span class="wdot yellow"></span><span class="wdot green"></span></div>
        <div class="char-window-title">
          ${avatarHtml}
          <span class="char-name-label">${escapeHtml(char.name)}</span>
        </div>
        <div class="char-window-controls">
          <button class="cwin-btn edit-btn" title="Edit" data-action="edit"><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11.5 2.5l2 2L6 12l-3 1 1-3z"/></svg></button>
          <button class="cwin-btn expand-btn" title="Expand" data-action="expand"><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 1H1v3M12 1h3v3M1 12v3h3M15 12v3h-3"/></svg></button>
        </div>
      </div>
      <div class="char-window-body">
        <div class="char-meta"><span class="char-type-badge ${char.type}" style="color:${accent};">${typeLabel}</span></div>
        <p class="char-desc">${escapeHtml(char.description)}</p>
        <div class="char-traits">${traitsHtml}</div>
        <div class="char-expanded-extra" style="display:none;">
          <div class="char-detail-divider"></div>
          ${profileHtml}
          <div class="char-detail-stats">
            <span>Updated ${formatRelativeTime(char.updatedAt || char.createdAt)}</span>
            <span>${(char.traits || []).length} traits</span>
          </div>
        </div>
      </div>
    </div>`;
}

// ---------- Render: Beat card ----------
function renderBeatCard(beat, index) {
  const statusCfg = STATUS_CONFIG[beat.status] || STATUS_CONFIG.planned;
  const actColor = ACT_COLORS[beat.act] || 'var(--accent-2)';
  const chars = getCharacters();
  const charsHtml = (beat.characters || []).map(cid => {
    const c = chars.find(ch => ch.id === cid);
    return c ? `<span class="beat-char-chip ${c.type}">${TYPE_ICONS[c.type] || PERSON_ICON} ${escapeHtml(c.name)}</span>` : '';
  }).join('');

  return `
    <div class="beat-card" data-beat-id="${beat.id}" data-index="${index}" draggable="true" role="button" tabindex="0"
         aria-label="Story Beat: ${escapeHtml(beat.title)}" style="--beat-act-color: ${actColor};">
      <div class="beat-card-inner">
        <div class="beat-header">
          <div class="beat-act-badge" style="color:${actColor};border-color:${actColor}40;">
            <span class="beat-act-dot" style="background:${actColor};"></span>${escapeHtml(beat.act)}
          </div>
          <span class="beat-status ${statusCfg.class}">${statusCfg.label}</span>
        </div>
        <h5 class="beat-title">${escapeHtml(beat.title)}</h5>
        <div class="beat-meta"><span class="beat-chapter">${escapeHtml(beat.chapter)}</span><span class="beat-scene">${escapeHtml(beat.scene)}</span></div>
        <p class="beat-desc">${escapeHtml(beat.description)}</p>
        <div class="beat-chars">${charsHtml}</div>
        <div class="beat-expanded-extra" style="display:none;">
          <div class="beat-detail-divider"></div>
          <div class="beat-full-desc"><strong>Full description:</strong><p>${escapeHtml(beat.description)}</p></div>
          <div class="beat-associated"><strong>Associated characters:</strong><div class="beat-associated-chars">${charsHtml}</div></div>
        </div>
      </div>
    </div>`;
}

// ---------- Render orchestration ----------
function renderCharacters() {
  if (!charGrid) return;
  const list = filteredCharacters();
  charGrid.innerHTML = list.length
    ? list.map(renderCharacterCard).join('')
    : '<div class="char-empty">No characters match. <span>Try clearing the search, or add one.</span></div>';
  attachCharListeners();
  hydrateAvatars();
}

function renderBeats() {
  if (!beatsGrid) return;
  beatsGrid.innerHTML = storyBeats.map((b, i) => renderBeatCard(b, i)).join('');
  attachBeatListeners();
}

function renderDashboard() {
  ensureToolbar();
  renderCharacters();
  renderBeats();
}

// ---------- Avatar hydration (async, post-render) ----------
function hydrateAvatars() {
  charGrid.querySelectorAll('.char-avatar[data-avatar-id]').forEach(el => {
    const id = el.dataset.avatarId;
    getImage(id).then(img => {
      if (img && img.dataUrl) {
        el.style.backgroundImage = `url("${img.dataUrl}")`;
        el.classList.add('loaded');
      }
    }).catch(() => {});
  });
}

// ---------- Character interactions ----------
function attachCharListeners() {
  charGrid.querySelectorAll('.char-window').forEach(card => {
    const charId = card.dataset.charId;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.cwin-btn')) return;
      toggleExpandCard(card, 'character');
    });

    const editBtn = card.querySelector('.edit-btn');
    if (editBtn) editBtn.addEventListener('click', (e) => { e.stopPropagation(); openEditor(charId, renderDashboard); });

    const expandBtn = card.querySelector('.expand-btn');
    if (expandBtn) expandBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleExpandCard(card, 'character'); });

    // Drag reorder (id-based, filter-safe)
    card.addEventListener('dragstart', (e) => {
      draggedItem = card; draggedType = 'character'; dragSourceId = charId;
      card.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging'); draggedItem = null; draggedType = null; dragSourceId = null;
      charGrid.querySelectorAll('.drop-target').forEach(el => el.classList.remove('drop-target'));
    });
    card.addEventListener('dragover', (e) => { e.preventDefault(); if (draggedType === 'character') card.classList.add('drop-target'); });
    card.addEventListener('dragleave', () => card.classList.remove('drop-target'));
    card.addEventListener('drop', (e) => {
      e.preventDefault(); card.classList.remove('drop-target');
      if (draggedType !== 'character') return;
      reorderCharacters(dragSourceId, card.dataset.charId);
      renderCharacters();
    });
  });
}

// ---------- Beat interactions ----------
function attachBeatListeners() {
  beatsGrid.querySelectorAll('.beat-card').forEach(card => {
    const beatId = card.dataset.beatId;

    card.addEventListener('click', (e) => { if (e.target.closest('.beat-status')) return; toggleExpandCard(card, 'beat'); });

    const statusBadge = card.querySelector('.beat-status');
    if (statusBadge) statusBadge.addEventListener('click', (e) => { e.stopPropagation(); cycleBeatStatus(beatId); });

    card.addEventListener('dragstart', (e) => {
      draggedItem = card; draggedType = 'beat'; dragSourceIndex = +card.dataset.index;
      card.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging'); draggedItem = null; draggedType = null; dragSourceIndex = null;
      beatsGrid.querySelectorAll('.drop-target').forEach(el => el.classList.remove('drop-target'));
    });
    card.addEventListener('dragover', (e) => { e.preventDefault(); if (draggedType === 'beat') card.classList.add('drop-target'); });
    card.addEventListener('dragleave', () => card.classList.remove('drop-target'));
    card.addEventListener('drop', (e) => {
      e.preventDefault(); card.classList.remove('drop-target');
      if (draggedType !== 'beat') return;
      reorderBeats(dragSourceIndex, +card.dataset.index);
    });
  });
}

// ---------- Expand / Collapse ----------
function toggleExpandCard(card, type) {
  const isExpanded = card.classList.contains('expanded');
  const grid = type === 'character' ? charGrid : beatsGrid;
  const extraSel = type === 'character' ? '.char-expanded-extra' : '.beat-expanded-extra';
  grid.querySelectorAll('.expanded').forEach(c => {
    c.classList.remove('expanded');
    const ex = c.querySelector(extraSel); if (ex) ex.style.display = 'none';
  });
  if (!isExpanded) {
    card.classList.add('expanded');
    const extra = card.querySelector(extraSel);
    if (extra) {
      extra.style.display = 'block';
      extra.style.opacity = '0';
      requestAnimationFrame(() => { extra.style.transition = 'opacity 0.3s ease'; extra.style.opacity = '1'; });
    }
  }
}

// ---------- Beat mutations ----------
function cycleBeatStatus(beatId) {
  const order = ['planned', 'drafted', 'revised', 'complete'];
  const beat = storyBeats.find(b => b.id === beatId);
  if (!beat) return;
  beat.status = order[(order.indexOf(beat.status) + 1) % order.length];
  saveBeats();
  renderBeats();
}

function reorderBeats(fromIdx, toIdx) {
  if (fromIdx === toIdx) return;
  const item = storyBeats.splice(fromIdx, 1)[0];
  storyBeats.splice(toIdx, 0, item);
  saveBeats();
  renderBeats();
}

// ---------- Export / Import ----------
async function handleExportAll() {
  const bundle = await exportAll();
  downloadJson(bundle, 'flow-writer-characters.json');
}

async function handleImportFile(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const json = JSON.parse(text);
    const created = await importBundle(json);
    renderDashboard();
    console.info(`[UniverseDashboard] imported ${created.length} character(s)`);
  } catch (e) {
    console.warn('[UniverseDashboard] import failed:', e);
    window.alert('Import failed: ' + (e && e.message ? e.message : 'invalid file'));
  }
}

function downloadJson(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

// ---------- Public API ----------
export function addCharacter(data) {
  const char = createCharacter(data || {});
  renderDashboard();
  return char;
}

export function addStoryBeat(data = {}) {
  const beat = {
    id: data.id || `beat-${Date.now()}`,
    title: data.title || 'Untitled Beat',
    act: data.act || 'Act 1',
    chapter: data.chapter || '',
    scene: data.scene || '',
    status: data.status || 'planned',
    description: data.description || '',
    characters: data.characters || [],
    createdAt: Date.now(),
  };
  storyBeats.push(beat);
  saveBeats();
  renderBeats();
  return beat;
}

export { exportCharacter };

export function openUniverseDashboard() {
  if (!scrim) cacheDOM();
  if (!scrim) return;
  renderDashboard();
  scrim.classList.add('show');
  document.body.style.overflow = 'hidden';
}

export function closeUniverseDashboard() {
  if (!scrim) return;
  scrim.classList.remove('show');
  document.body.style.overflow = '';
}

export function renderUniverseDashboard() { renderDashboard(); }

export function initUniverseDashboard() {
  if (initialized) return;
  cacheDOM();
  seedBeats();
  getCharacters(); // seed/normalize characters

  if (modal) {
    const closeBtn = modal.querySelector('[data-close]');
    if (closeBtn) closeBtn.addEventListener('click', closeUniverseDashboard);
  }
  if (scrim) {
    scrim.addEventListener('click', (e) => { if (e.target === scrim) closeUniverseDashboard(); });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && scrim && scrim.classList.contains('show')) closeUniverseDashboard();
  });

  const triggerBtn = document.getElementById('btnUniverseDashboard');
  if (triggerBtn) triggerBtn.addEventListener('click', openUniverseDashboard);

  initialized = true;
  renderDashboard();
}

// ---------- Utilities ----------
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatRelativeTime(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000), hours = Math.floor(diff / 3600000), days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}
