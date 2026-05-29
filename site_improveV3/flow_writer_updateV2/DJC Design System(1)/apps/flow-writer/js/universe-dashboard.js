/* ============================================================
   Universe Dashboard — Character & Story Beat Mini-Windows
   ============================================================
   A modal panel displaying Characters and Story Beats as
   clickable mini-windows/cards. Replaces static sidebar content
   with a dynamic, interactive dashboard.
   ============================================================ */

// ---------- State ----------
let characters = [];
let storyBeats = [];
let draggedItem = null;
let draggedType = null; // 'character' | 'beat'
let dragSourceIndex = null;

const STORAGE_KEY_CHARS = 'fw-universe-characters';
const STORAGE_KEY_BEATS = 'fw-universe-storybeats';

// ---------- Demo Data ----------
const DEMO_CHARACTERS = [
  {
    id: 'char-1',
    name: 'Sarah',
    type: 'protagonist',
    description: 'A curious young archivist who stumbles upon secrets hidden within the library\'s oldest collection. Her determination drives the narrative forward.',
    traits: ['curious', 'determined', 'intuitive'],
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'char-2',
    name: 'The Librarian',
    type: 'antagonist',
    description: 'An ancient, mysterious figure who has guarded the library for centuries. Knows far more than they reveal.',
    traits: ['mysterious', 'ancient', 'cryptic', 'all-knowing'],
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'char-3',
    name: 'Detective Rowe',
    type: 'supporting',
    description: 'A skeptical investigator who provides grounding logic to Sarah\'s wild theories. Has a hidden connection to the library.',
    traits: ['skeptical', 'logical', 'secretive'],
    createdAt: Date.now() - 86400000,
  },
];

const DEMO_BEATS = [
  {
    id: 'beat-1',
    title: 'Discovery of hidden door',
    act: 'Act 1',
    chapter: 'Ch.1',
    scene: 'The Old Wing',
    status: 'drafted',
    description: 'Sarah notices an anomaly in the floor plan — a door that shouldn\'t exist, hidden behind a bookshelf that hasn\'t been moved in decades.',
    characters: ['char-1'],
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'beat-2',
    title: 'Sarah finds the journal',
    act: 'Act 2a',
    chapter: 'Ch.1',
    scene: 'Behind the Shelf',
    status: 'drafted',
    description: 'Behind the hidden door, Sarah discovers a journal belonging to the library\'s original architect — filled with cryptic warnings and a map.',
    characters: ['char-1', 'char-2'],
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'beat-3',
    title: 'The truth revealed',
    act: 'Act 2b',
    chapter: 'Ch.2',
    scene: 'The Reading Room',
    status: 'planned',
    description: 'The Librarian confronts Sarah, revealing the true purpose of the library — it\'s not a repository of books, but a prison for something ancient.',
    characters: ['char-1', 'char-2', 'char-3'],
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'beat-4',
    title: 'Resolution',
    act: 'Act 3',
    chapter: 'Ch.2',
    scene: 'The Archive',
    status: 'planned',
    description: 'Sarah must decide: seal the library forever, or become its new guardian. Detective Rowe arrives with crucial evidence that changes everything.',
    characters: ['char-1', 'char-3'],
    createdAt: Date.now(),
  },
];

// ---------- Icons ----------
const TYPE_ICONS = {
  protagonist: '<svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="5" r="3"/><path d="M2 15c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>',
  antagonist: '<svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="5" r="3"/><path d="M2 15c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>',
  supporting: '<svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="5" r="3"/><path d="M2 15c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>',
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

// ---------- Persistence ----------
function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY_CHARS, JSON.stringify(characters));
    localStorage.setItem(STORAGE_KEY_BEATS, JSON.stringify(storyBeats));
  } catch (e) {
    console.warn('[UniverseDashboard] Failed to save to localStorage:', e);
  }
}

function loadFromStorage() {
  try {
    const chars = localStorage.getItem(STORAGE_KEY_CHARS);
    const beats = localStorage.getItem(STORAGE_KEY_BEATS);
    return {
      characters: chars ? JSON.parse(chars) : null,
      storyBeats: beats ? JSON.parse(beats) : null,
    };
  } catch (e) {
    console.warn('[UniverseDashboard] Failed to load from localStorage:', e);
    return { characters: null, storyBeats: null };
  }
}

function seedDemoData() {
  const stored = loadFromStorage();
  if (!stored.characters || stored.characters.length === 0) {
    characters = JSON.parse(JSON.stringify(DEMO_CHARACTERS));
  } else {
    characters = stored.characters;
  }
  if (!stored.storyBeats || stored.storyBeats.length === 0) {
    storyBeats = JSON.parse(JSON.stringify(DEMO_BEATS));
  } else {
    storyBeats = stored.storyBeats;
  }
  saveToStorage();
}

// ---------- DOM Refs ----------
let scrim, modal, charGrid, beatsGrid;
let initialized = false;

function cacheDOM() {
  scrim = document.getElementById('universeDashboardScrim');
  modal = document.getElementById('universeDashboardModal');
  charGrid = document.getElementById('characterGrid');
  beatsGrid = document.getElementById('beatsGrid');
}

// ---------- Rendering: Character Mini-Windows ----------
function renderCharacterCard(char, index) {
  const typeLabel = char.type.charAt(0).toUpperCase() + char.type.slice(1);
  const icon = TYPE_ICONS[char.type] || TYPE_ICONS['supporting'];
  const traitsHtml = (char.traits || [])
    .map(t => `<span class="char-trait">${escapeHtml(t)}</span>`)
    .join('');

  return `
    <div class="char-window ${char.type}" 
         data-char-id="${char.id}" 
         data-index="${index}"
         draggable="true"
         role="button"
         tabindex="0"
         aria-label="Character: ${escapeHtml(char.name)}">
      <div class="char-window-chrome">
        <div class="char-window-dots">
          <span class="wdot red"></span>
          <span class="wdot yellow"></span>
          <span class="wdot green"></span>
        </div>
        <div class="char-window-title">
          <span class="char-type-icon" title="${typeLabel}">${icon}</span>
          <span class="char-name-label">${escapeHtml(char.name)}</span>
        </div>
        <div class="char-window-controls">
          <button class="cwin-btn expand-btn" title="Expand" data-action="expand"><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 1H1v3M12 1h3v3M1 12v3h3M15 12v3h-3"/></svg></button>
          <button class="cwin-btn close-btn" title="Remove" data-action="remove"><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l10 10M13 3L3 13"/></svg></button>
        </div>
      </div>
      <div class="char-window-body">
        <div class="char-meta">
          <span class="char-type-badge ${char.type}">${typeLabel}</span>
        </div>
        <p class="char-desc">${escapeHtml(char.description)}</p>
        <div class="char-traits">${traitsHtml}</div>
        <div class="char-expanded-extra" style="display:none;">
          <div class="char-detail-divider"></div>
          <div class="char-detail-stats">
            <span>Added ${formatRelativeTime(char.createdAt)}</span>
            <span>${(char.traits || []).length} traits</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ---------- Rendering: Story Beat Cards ----------
function renderBeatCard(beat, index) {
  const statusCfg = STATUS_CONFIG[beat.status] || STATUS_CONFIG.planned;
  const actColor = ACT_COLORS[beat.act] || 'var(--accent-2)';
  const charsHtml = (beat.characters || [])
    .map(cid => {
      const c = characters.find(ch => ch.id === cid);
      return c ? `<span class="beat-char-chip ${c.type}">${TYPE_ICONS[c.type] || TYPE_ICONS['supporting']} ${escapeHtml(c.name)}</span>` : '';
    })
    .join('');

  return `
    <div class="beat-card" 
         data-beat-id="${beat.id}" 
         data-index="${index}"
         draggable="true"
         role="button"
         tabindex="0"
         aria-label="Story Beat: ${escapeHtml(beat.title)}"
         style="--beat-act-color: ${actColor};">
      <div class="beat-card-inner">
        <div class="beat-header">
          <div class="beat-act-badge" style="color:${actColor};border-color:${actColor}40;">
            <span class="beat-act-dot" style="background:${actColor};"></span>
            ${escapeHtml(beat.act)}
          </div>
          <span class="beat-status ${statusCfg.class}">${statusCfg.label}</span>
        </div>
        <h5 class="beat-title">${escapeHtml(beat.title)}</h5>
        <div class="beat-meta">
          <span class="beat-chapter">${escapeHtml(beat.chapter)}</span>
          <span class="beat-scene">${escapeHtml(beat.scene)}</span>
        </div>
        <p class="beat-desc">${escapeHtml(beat.description)}</p>
        <div class="beat-chars">${charsHtml}</div>
        <div class="beat-expanded-extra" style="display:none;">
          <div class="beat-detail-divider"></div>
          <div class="beat-detail-timeline">
            <div class="beat-timeline-dot" style="background:${actColor};"></div>
            <div class="beat-timeline-line"></div>
          </div>
          <div class="beat-full-desc">
            <strong>Full description:</strong>
            <p>${escapeHtml(beat.description)}</p>
          </div>
          <div class="beat-associated">
            <strong>Associated characters:</strong>
            <div class="beat-associated-chars">${charsHtml}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ---------- Main Render ----------
function renderDashboard() {
  if (!charGrid || !beatsGrid) return;

  charGrid.innerHTML = characters.map((c, i) => renderCharacterCard(c, i)).join('');
  beatsGrid.innerHTML = storyBeats.map((b, i) => renderBeatCard(b, i)).join('');

  attachCardListeners();
}

// ---------- Card Interactions ----------
function attachCardListeners() {
  // Character window interactions
  charGrid.querySelectorAll('.char-window').forEach(card => {
    const charId = card.dataset.charId;

    // Click to expand (on card body, not controls)
    card.addEventListener('click', (e) => {
      if (e.target.closest('.cwin-btn')) return;
      toggleExpandCard(card, 'character');
    });

    // Expand button
    const expandBtn = card.querySelector('.expand-btn');
    if (expandBtn) {
      expandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleExpandCard(card, 'character');
      });
    }

    // Remove button
    const closeBtn = card.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeCharacter(charId);
      });
    }

    // Drag events
    card.addEventListener('dragstart', (e) => {
      draggedItem = card;
      draggedType = 'character';
      dragSourceIndex = +card.dataset.index;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      draggedItem = null;
      draggedType = null;
      dragSourceIndex = null;
      charGrid.querySelectorAll('.drop-target').forEach(el => el.classList.remove('drop-target'));
    });
    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (draggedType !== 'character') return;
      card.classList.add('drop-target');
    });
    card.addEventListener('dragleave', () => {
      card.classList.remove('drop-target');
    });
    card.addEventListener('drop', (e) => {
      e.preventDefault();
      card.classList.remove('drop-target');
      if (draggedType !== 'character') return;
      const targetIndex = +card.dataset.index;
      reorderCharacters(dragSourceIndex, targetIndex);
    });
  });

  // Story beat interactions
  beatsGrid.querySelectorAll('.beat-card').forEach(card => {
    const beatId = card.dataset.beatId;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.beat-status')) return;
      toggleExpandCard(card, 'beat');
    });

    // Status badge click to cycle
    const statusBadge = card.querySelector('.beat-status');
    if (statusBadge) {
      statusBadge.addEventListener('click', (e) => {
        e.stopPropagation();
        cycleBeatStatus(beatId);
      });
    }

    // Drag events
    card.addEventListener('dragstart', (e) => {
      draggedItem = card;
      draggedType = 'beat';
      dragSourceIndex = +card.dataset.index;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      draggedItem = null;
      draggedType = null;
      dragSourceIndex = null;
      beatsGrid.querySelectorAll('.drop-target').forEach(el => el.classList.remove('drop-target'));
    });
    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (draggedType !== 'beat') return;
      card.classList.add('drop-target');
    });
    card.addEventListener('dragleave', () => {
      card.classList.remove('drop-target');
    });
    card.addEventListener('drop', (e) => {
      e.preventDefault();
      card.classList.remove('drop-target');
      if (draggedType !== 'beat') return;
      const targetIndex = +card.dataset.index;
      reorderBeats(dragSourceIndex, targetIndex);
    });
  });
}

// ---------- Expand / Collapse ----------
function toggleExpandCard(card, type) {
  const isExpanded = card.classList.contains('expanded');

  // Collapse all others of same type (optional - accordion style)
  if (type === 'character') {
    charGrid.querySelectorAll('.char-window.expanded').forEach(c => {
      c.classList.remove('expanded');
      const extra = c.querySelector('.char-expanded-extra');
      if (extra) extra.style.display = 'none';
    });
  } else {
    beatsGrid.querySelectorAll('.beat-card.expanded').forEach(c => {
      c.classList.remove('expanded');
      const extra = c.querySelector('.beat-expanded-extra');
      if (extra) extra.style.display = 'none';
    });
  }

  if (!isExpanded) {
    card.classList.add('expanded');
    const extra = card.querySelector(type === 'character' ? '.char-expanded-extra' : '.beat-expanded-extra');
    if (extra) {
      extra.style.display = 'block';
      // Animate in
      extra.style.opacity = '0';
      requestAnimationFrame(() => {
        extra.style.transition = 'opacity 0.3s ease';
        extra.style.opacity = '1';
      });
    }
  }
}

// ---------- Data Mutations ----------
function removeCharacter(id) {
  characters = characters.filter(c => c.id !== id);
  saveToStorage();
  renderDashboard();
}

function cycleBeatStatus(beatId) {
  const order = ['planned', 'drafted', 'revised', 'complete'];
  const beat = storyBeats.find(b => b.id === beatId);
  if (!beat) return;
  const idx = order.indexOf(beat.status);
  beat.status = order[(idx + 1) % order.length];
  saveToStorage();
  renderDashboard();
}

function reorderCharacters(fromIdx, toIdx) {
  if (fromIdx === toIdx) return;
  const item = characters.splice(fromIdx, 1)[0];
  characters.splice(toIdx, 0, item);
  saveToStorage();
  renderDashboard();
}

function reorderBeats(fromIdx, toIdx) {
  if (fromIdx === toIdx) return;
  const item = storyBeats.splice(fromIdx, 1)[0];
  storyBeats.splice(toIdx, 0, item);
  saveToStorage();
  renderDashboard();
}

// ---------- Public API: Add ----------
export function addCharacter(data) {
  const char = {
    id: data.id || `char-${Date.now()}`,
    name: data.name || 'Unnamed',
    type: data.type || 'supporting',
    description: data.description || '',
    traits: data.traits || [],
    createdAt: Date.now(),
  };
  characters.push(char);
  saveToStorage();
  renderDashboard();
  return char;
}

export function addStoryBeat(data) {
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
  saveToStorage();
  renderDashboard();
  return beat;
}

// ---------- Modal Control ----------
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

// ---------- Init ----------
export function renderUniverseDashboard() {
  renderDashboard();
}

export function initUniverseDashboard() {
  if (initialized) return;
  cacheDOM();
  seedDemoData();

  // Close button on modal head
  if (modal) {
    const closeBtn = modal.querySelector('[data-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeUniverseDashboard);
    }
  }

  // Click scrim to close
  if (scrim) {
    scrim.addEventListener('click', (e) => {
      if (e.target === scrim) closeUniverseDashboard();
    });
  }

  // Escape to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && scrim && scrim.classList.contains('show')) {
      closeUniverseDashboard();
    }
  });

  // Sidebar trigger button
  const triggerBtn = document.getElementById('btnUniverseDashboard');
  if (triggerBtn) {
    triggerBtn.addEventListener('click', openUniverseDashboard);
  }

  initialized = true;
  renderDashboard();
}

// ---------- Utilities ----------
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatRelativeTime(ts) {
  const now = Date.now();
  const diff = now - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}
