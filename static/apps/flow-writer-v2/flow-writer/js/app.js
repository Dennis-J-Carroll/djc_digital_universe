/* ============================================================
   Flow Writer — Main Bootstrap
   Ties together DB layer, Branch Engine, SVG Graph, and UI.
   Preserves ALL existing functionality from original Flow_Writer.js
   ============================================================ */

import {
  initDB,
  migrateFromV1,
  getAllBranches,
  getSettings,
} from './db.js?v=3';

import {
  initEngine,
  setEditorRef,
  getActiveBranch,
  getState,
  switchBranch,
  saveCurrentDoc,
  createCommit,
  restoreCommit,
  switchDoc,
  createBranch,
  renameBranch,
  deleteBranch,
  renameTreeNode,
  deleteTreeNode,
  addTreeNode,
  toggleFolderExpanded,
  getCommitHistory,
  countWords,
} from './branch-engine.js?v=3';

import {
  renderBranchGraph,
  computeGraphLayout,
  setupGraphTooltip,
  renderGraphControls,
  panToBranch,
} from './branch-graph.js?v=3';

import {
  initMobileViewportFix,
} from './mobile-viewport-fix.js?v=3';

import {
  initInteractiveMaps,
} from './interactive-maps.js?v=3';

import {
  initTimeline,
  renderTimeline,
} from './timeline.js?v=3';

import {
  renderTree,
  renderCommitHistory,
  renderBranchSelector,
  renderSceneBanner,
  renderSprintSection,
  renderDailyTarget,
  openStatsModal,
  openSceneGoalModal,
  saveSceneGoal,
  deleteSceneGoal,
  toggleSceneGoalComplete,
  updateStatusBar,
  showModal,
  closeModals,
  flashSave,
  openCommitSnapshotModal,
  submitCommitSnapshot,
  submitRestoreCommit,
  openBranchCompareModal,
  openSearchModal,
  exportBranchAsZip,
  exportDocx,
  exportPdf,
  getCommands,
  handleEscape,
  initUI,
  initMobileNav,
  setUICallbacks,
  formatRelativeTime,
  updateCreateBranchModal,
  initAIInlineSuggestions,
  openAIAssistantModal,
  performAIRewrite,
  insertAIResult,
  saveAIConfig,
  initResizablePanes,
  initRightPaneTabs,
  openShortcutsModal,
  wireTouchTreeDragAndDrop,
  initOnboarding,
  initTheme,
  icon,
} from './ui.js?v=3';

import {
  initSprintEngine,
  startSprint,
  pauseSprint,
  resumeSprint,
  stopSprint,
  getSprintState,
  onTick as onSprintTick,
  onEditorInput as onSprintEditorInput,
} from './sprint-engine.js?v=3';

import {
  initStatsEngine,
  getDailyTarget,
  onEditorInput as onStatsEditorInput,
} from './stats-engine.js?v=3';

import {
  initUniverseDashboard,
} from './universe-dashboard.js?v=3';

import {
  initVoiceToText,
} from './voice-to-text.js?v=3';

// ---------- DOM helpers ----------
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

// ---------- Element references ----------
let app, editor, center, editorWrap, sceneBanner, nudge, nudgeMsg;
let btnFocus, btnTw, btnCmd, btnShortcuts, mFocus, mTw;
let wcLabel, saveLabel, saveItem, flowState, flowLabel;
let autoTagsEl, manualTagsEl, autoCount, manualCount;

function cacheElements() {
  app           = $('#app');
  editor        = $('#editor');
  center        = $('#center');
  editorWrap    = $('#editorWrap');
  sceneBanner   = $('#sceneBanner');
  nudge         = $('#nudge');
  nudgeMsg      = $('#nudgeMsg');

  btnFocus      = $('#btnFocus');
  btnTw         = $('#btnTw');
  btnCmd        = $('#btnCmd');
  btnShortcuts  = $('#btnShortcuts');
  mFocus        = $('#mFocus');
  mTw           = $('#mTw');

  wcLabel       = $('#wcLabel');
  saveLabel     = $('#saveLabel');
  saveItem      = $('#saveItem');
  flowState     = $('#flowState');
  flowLabel     = $('#flowLabel');
  autoTagsEl    = $('#autoTags');
  manualTagsEl  = $('#manualTags');
  autoCount     = $('#autoCount');
  manualCount   = $('#manualCount');
}

// ---------- Existing state (preserved from Flow_Writer.js) ----------
// Per-branch state is now managed by the engine. These globals remain
// for modes and transient UI state that is NOT per-branch.
let manualTags = []; // Loaded from active branch
let saveTimer = null;
let lastKey = Date.now();
let nudgeTimer = null;
let flowTimer = null;

const NUDGES = [
  'Consider how her <em>hands tremble</em> as the spine cracks open.',
  'What does the dust <em>sound</em> like in here?',
  'Skip the description \u2014 drop the <em>next line of dialogue</em>.',
  'The room remembers something. <em>Show one detail it remembers.</em>',
  'What is <em>just outside the frame</em> of this scene?',
  'A single sentence. Just one. <em>Move</em>.',
];

const AUTO_RULES = [
  { tag: 'protagonist',  re: /\b(sarah|her|she)\b/i },
  { tag: 'mystery',      re: /\b(hidden|secret|whisper|silence|locked|never)\b/i },
  { tag: 'discovery',    re: /\b(found|discover|reveal|open|panel|shift|inch)\b/i },
  { tag: 'dialogue',     re: /[""].+?[""]|"[^"]+"/ },
  { tag: 'flashback',    re: /\b(remembered|once|years ago|grandmother|childhood)\b/i },
  { tag: 'setting',      re: /\b(library|shelf|oak|dust|window|room|corridor)\b/i },
  { tag: 'emotion',      re: /\b(tremble|breath|gasp|tear|ache|fear|wonder)\b/i },
];

// Command palette registry (populated after boot)
let COMMANDS = [];

// ═══════════════════════════════════════════════════════════════
//  EXISTING FEATURES — PRESERVED (from Flow_Writer.js)
// ═══════════════════════════════════════════════════════════════

// ---------- word count + reading time ----------
function updateWordCount() {
  const t = editor.value.trim();
  const words = t ? t.split(/\s+/).length : 0;
  const mins  = Math.max(1, Math.round(words / 230));
  wcLabel.textContent = `${words} word${words === 1 ? '' : 's'} \u00b7 ${mins} min read`;
}

// ---------- auto-detect tags ----------
function refreshAutoTags() {
  const t = editor.value;
  const hits = AUTO_RULES.filter(r => r.re.test(t)).map(r => r.tag);
  autoTagsEl.innerHTML = hits.length
    ? hits.map(tag => `<span class="tag auto">${tag}</span>`).join('')
    : `<span class="tag suggest" style="border-style:dashed;">no signals yet</span>`;
  autoCount.textContent = hits.length;
}

// ---------- manual tags ----------
function renderManual() {
  manualTagsEl.innerHTML = manualTags.map(t =>
    `<span class="tag manual" data-tag="${t}">${t}<span class="close" data-rm="${t}">\u00d7</span></span>`
  ).join('') +
    `<span class="tag-add" id="tagAdd">+ <input type="text" placeholder="add tag" id="tagInput" /></span>`;
  manualCount.textContent = manualTags.length;
  wireTagInput();
}

function wireTagInput() {
  const inp = $('#tagInput');
  inp?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && inp.value.trim()) {
      const v = inp.value.trim().toLowerCase().replace(/\s+/g, '_');
      if (!manualTags.includes(v)) manualTags.push(v);
      renderManual();
      saveCurrentDoc();
      setTimeout(() => $('#tagInput')?.focus(), 0);
    }
  });
  manualTagsEl.querySelectorAll('[data-rm]').forEach(x => {
    x.addEventListener('click', e => {
      e.stopPropagation();
      manualTags = manualTags.filter(t => t !== x.dataset.rm);
      renderManual();
      saveCurrentDoc();
    });
  });
}

// ---------- save state ----------
function markDirty() {
  saveItem.className = 'item saving';
  saveLabel.textContent = 'Saving\u2026';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveCurrentDoc();
    saveItem.className = 'item saved';
    saveLabel.textContent = 'Saved \u00b7 just now';
  }, 600);
}

// ---------- flow / idle nudge ----------
function scheduleNudge() {
  clearTimeout(nudgeTimer);
  hideNudge();
  const branch = getActiveBranch();
  const flowDelay = branch?.fmt?.flowDelay ?? 35;
  if (flowDelay === 0) return;
  nudgeTimer = setTimeout(showNudge, flowDelay * 1000);
}
function showNudge() {
  nudgeMsg.innerHTML = NUDGES[Math.floor(Math.random() * NUDGES.length)];
  nudge.classList.add('show');
}
function hideNudge() { nudge.classList.remove('show'); }

// ---------- flow state indicator ----------
function bumpFlow() {
  flowState.className = 'item flow';
  flowLabel.textContent = 'In flow';
  clearTimeout(flowTimer);
  flowTimer = setTimeout(() => {
    flowState.className = 'item idle';
    flowLabel.textContent = 'Idle';
  }, 6000);
}

// ---------- format controls ----------
function applyFmt() {
  const branch = getActiveBranch();
  if (!branch) return;
  const fmt = branch.fmt;

  center.dataset.family = fmt.family;
  editor.style.setProperty('--editor-fs', fmt.size + 'px');
  editor.style.fontSize = fmt.size + 'px';
  editor.style.lineHeight = fmt.lh;
  if (fmt.width === '100%') editor.style.maxWidth = 'none';
  else editor.style.maxWidth = fmt.width + 'px';

  // segment ui
  $$('#famSeg button').forEach(b => b.classList.toggle('on', b.dataset.v === fmt.family));
  $$('#lhSeg button').forEach(b => b.classList.toggle('on', parseFloat(b.dataset.v) === fmt.lh));
  $$('#widthSeg button').forEach(b => b.classList.toggle('on', b.dataset.v === fmt.width));
  $('#sizeRange').value = fmt.size;
  $('#sizeVal').textContent = fmt.size + 'px';
  const famName = { serif: 'Serif', garamond: 'Garamond', sans: 'Sans', mono: 'Mono' }[fmt.family] || fmt.family;
  $('#famVal').textContent = famName;
  $('#lhVal').textContent = fmt.lh < 1.6 ? 'Compact' : fmt.lh > 1.85 ? 'Spacious' : 'Normal';
  $('#widthVal').textContent = fmt.width === '560' ? 'Narrow' : fmt.width === '720' ? 'Medium' : fmt.width === '880' ? 'Wide' : 'Full';
  $('#flowRange').value = fmt.flowDelay;
  $('#flowVal').textContent = fmt.flowDelay === 0 ? 'off' : fmt.flowDelay + 's';
}

function wireFormatControls() {
  $$('#famSeg button').forEach(b => b.addEventListener('click', () => {
    const branch = getActiveBranch(); if (!branch) return;
    branch.fmt.family = b.dataset.v; applyFmt(); saveCurrentDoc();
  }));
  $$('#lhSeg button').forEach(b => b.addEventListener('click', () => {
    const branch = getActiveBranch(); if (!branch) return;
    branch.fmt.lh = parseFloat(b.dataset.v); applyFmt(); saveCurrentDoc();
  }));
  $$('#widthSeg button').forEach(b => b.addEventListener('click', () => {
    const branch = getActiveBranch(); if (!branch) return;
    branch.fmt.width = b.dataset.v; applyFmt(); saveCurrentDoc();
  }));
  $('#sizeRange').addEventListener('input', e => {
    const branch = getActiveBranch(); if (!branch) return;
    branch.fmt.size = +e.target.value; applyFmt(); saveCurrentDoc();
  });
  $('#flowRange').addEventListener('input', e => {
    const branch = getActiveBranch(); if (!branch) return;
    branch.fmt.flowDelay = +e.target.value;
    $('#flowVal').textContent = branch.fmt.flowDelay === 0 ? 'off' : branch.fmt.flowDelay + 's';
    saveCurrentDoc(); scheduleNudge();
  });
}

// ---------- modes ----------
function applyModes() {
  const appState = getState();
  if (!appState) return;
  const modes = appState.modes;

  app.classList.toggle('focus-mode', modes.focus);
  center.classList.toggle('typewriter', modes.typewriter);
  sceneBanner.classList.toggle('collapsed', modes.sceneCollapsed || modes.focus);
  [btnFocus, mFocus].forEach(b => b.classList.toggle('active', modes.focus));
  [btnFocus, mFocus].forEach(b => b.classList.toggle('on',     modes.focus));
  [btnTw, mTw].filter(Boolean).forEach(b => b.classList.toggle('active', modes.typewriter));
  [btnTw, mTw].filter(Boolean).forEach(b => b.classList.toggle('on',     modes.typewriter));
  applyTypewriter();
}
function toggleFocus() {
  const s = getState(); if (!s) return;
  s.modes.focus = !s.modes.focus; applyModes();
  saveCurrentDoc();
}
function toggleTypewriter() {
  const s = getState(); if (!s) return;
  s.modes.typewriter = !s.modes.typewriter; applyModes();
  saveCurrentDoc();
}
function toggleSceneGoal() {
  const s = getState(); if (!s) return;
  s.modes.sceneCollapsed = !s.modes.sceneCollapsed; applyModes();
  saveCurrentDoc();
}

// ---------- Typewriter scroll ----------
function applyTypewriter() {
  const s = getState();
  if (!s?.modes?.typewriter) return;
  const before = editor.value.slice(0, editor.selectionStart);
  const lineIdx = before.split('\n').length - 1;
  const lh = parseFloat(getComputedStyle(editor).lineHeight) || 28;
  const target = lineIdx * lh - editorWrap.clientHeight / 2 + lh;
  editorWrap.scrollTop = Math.max(0, target + editor.offsetTop - editorWrap.offsetTop + 0);
}

function wireModeToggles() {
  btnFocus.addEventListener('click', toggleFocus);
  mFocus.addEventListener('click', toggleFocus);
  btnTw?.addEventListener('click', toggleTypewriter);
  mTw?.addEventListener('click', toggleTypewriter);
  $('#sceneCollapse').addEventListener('click', toggleSceneGoal);
  editor.addEventListener('keyup', applyTypewriter);
  editor.addEventListener('click', applyTypewriter);
}

// ---------- export ----------
function exportDoc(fmt) {
  const text = editor.value;
  const titleEl = $('.tree-item.active span:last-child');
  const title = titleEl?.textContent.trim() || 'flow-writer-doc';
  let blob, ext;
  if (fmt === 'txt')  { blob = new Blob([text], { type: 'text/plain' }); ext = 'txt'; }
  else if (fmt === 'md') { blob = new Blob([`# ${title}\n\n${text}`], { type: 'text/markdown' }); ext = 'md'; }
  else {
    const html = `<!doctype html><meta charset=utf-8><title>${title}</title>
      <style>body{font-family:Georgia,serif;max-width:680px;margin:60px auto;line-height:1.7;color:#111;padding:0 20px;}
      h1{font-family:'Helvetica Neue',sans-serif;letter-spacing:-0.01em;}
      p{white-space:pre-wrap;}</style>
      <h1>${title}</h1><p>${text.replace(/</g,'&lt;')}</p>`;
    blob = new Blob([html], { type: 'text/html' }); ext = 'html';
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = title.replace(/[^a-z0-9-_ ]+/gi,'').replace(/\s+/g,'-') + '.' + ext;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  flashSave('Exported \u00b7 .' + ext);
}
function wireExport() {
  $$('.export-btn').forEach(b => b.addEventListener('click', () => {
    const fmt = b.dataset.fmt;
    if (fmt === 'docx') exportDocx();
    else if (fmt === 'pdf') exportPdf();
    else exportDoc(fmt);
  }));
}

// ---------- editor input (enhanced with branching save) ----------
function wireEditorEvents() {
  editor.addEventListener('input', () => {
    lastKey = Date.now();
    updateWordCount();
    refreshAutoTags();
    bumpFlow();
    markDirty();
    scheduleNudge();
    applyTypewriter();

    // Phase 2: Track word deltas for sprint + stats
    const currentWc = countWords(editor.value);
    onSprintEditorInput(currentWc);
    onStatsEditorInput(currentWc);
  });
}

// ---------- command palette ----------
function populateCommands() {
  COMMANDS = getCommands();

  // Bind the mode/export toggles that need app-level state
  COMMANDS.forEach(c => {
    if (c.id === 'focus') c.run = toggleFocus;
    if (c.id === 'tw') c.run = toggleTypewriter;
    if (c.id === 'scene') c.run = toggleSceneGoal;
    if (c.id === 'export-txt') c.run = () => exportDoc('txt');
    if (c.id === 'export-md') c.run = () => exportDoc('md');
    if (c.id === 'export-html') c.run = () => exportDoc('html');
    if (c.id === 'export-docx') c.run = exportDocx;
    if (c.id === 'export-pdf') c.run = exportPdf;
    if (c.id === 'search') c.run = openSearchModal;
    if (c.id === 'ai-assistant') c.run = openAIAssistantModal;
    if (c.id === 'export-zip') c.run = exportBranchAsZip;
  });
}

function renderCmd(q = '') {
  const re = new RegExp(q.split('').map(c => c.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('.*'), 'i');

  // Flatten commands + subItems for display
  const allItems = [];
  COMMANDS.forEach(c => {
    allItems.push(c);
    if (c.subItems) allItems.push(...c.subItems);
  });

  const list = q ? allItems.filter(c => re.test(c.label)) : allItems;
  const res = $('#cmdResults');
  res.innerHTML = list.map((c, i) => `
    <div class="cmd-item ${i===0?'sel':''}" data-id="${c.id}">
      <div class="ic">${icon(c.icon, 14)}</div>
      <div class="label">${c.label}</div>
      ${c.kbd ? `<div class="kbd">${c.kbd}</div>` : ''}
    </div>`).join('');
  $$('#cmdResults .cmd-item').forEach(el => el.addEventListener('click', () => {
    const c = allItems.find(x => x.id === el.dataset.id);
    closeModals(); c && c.run && c.run();
  }));
}

function wireCommandPalette() {
  btnCmd.addEventListener('click', () => { showModal('cmdScrim'); renderCmd(''); setTimeout(() => $('#cmdInput').focus(), 50); });
  btnShortcuts.addEventListener('click', () => showModal('scScrim'));

  $('#cmdInput').addEventListener('input', e => renderCmd(e.target.value));
  $('#cmdInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const sel = $('#cmdResults .cmd-item.sel') || $('#cmdResults .cmd-item');
      if (sel) sel.click();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const items = $$('#cmdResults .cmd-item');
      const i = items.findIndex(x => x.classList.contains('sel'));
      items.forEach(x => x.classList.remove('sel'));
      const ni = e.key === 'ArrowDown' ? (i+1) % items.length : (i-1+items.length) % items.length;
      items[ni]?.classList.add('sel');
      items[ni]?.scrollIntoView({ block: 'nearest' });
    }
  });
}

// ---------- keyboard shortcuts ----------
function wireKeyboardShortcuts() {
  window.addEventListener('keydown', e => {
    const mod = e.metaKey || e.ctrlKey;

    if (mod && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      showModal('cmdScrim'); renderCmd(''); setTimeout(() => $('#cmdInput').focus(), 50);
    }
    else if (mod && e.shiftKey && e.key.toLowerCase() === 'f') {
      e.preventDefault(); toggleFocus();
    }
    else if (mod && e.shiftKey && e.key.toLowerCase() === 't') {
      e.preventDefault(); toggleTypewriter();
    }
    else if (mod && e.shiftKey && e.key.toLowerCase() === 'a') {
      e.preventDefault(); openAIAssistantModal();
    }
    else if (mod && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      updateCreateBranchModal();
      showModal('branchScrim');
    }
    else if (mod && e.key === '\\') {
      e.preventDefault(); toggleFocus();
    }
    else if (mod && e.key === '/') {
      e.preventDefault(); toggleSceneGoal();
    }
    else if (mod && e.key.toLowerCase() === 's') {
      // UPDATED: \u2318S now opens commit snapshot modal
      e.preventDefault();
      openCommitSnapshotModal();
    }
    else if (e.key === 'Escape') {
      e.preventDefault();
      handleEscape();
      hideNudge();
    }
    else if (e.key === '?' && document.activeElement !== editor && document.activeElement?.tagName !== 'INPUT') {
      openShortcutsModal();
    }
  });
}

// ---------- nudge dismiss ----------
function wireNudge() {
  $('#nudgeDismiss').addEventListener('click', () => { hideNudge(); scheduleNudge(); });
}

// ---------- suggested tags ----------
function wireSuggestedTags() {
  $('#suggestTags').addEventListener('click', e => {
    const t = e.target.closest('.tag.suggest');
    if (!t) return;
    const v = t.textContent.replace(/^\+\s*/, '').trim();
    if (!manualTags.includes(v)) manualTags.push(v);
    renderManual(); saveCurrentDoc();
  });
}

// ---------- project switcher (placeholder) ----------
function wireProjectSwitcher() {
  $('#projSwitcher').addEventListener('click', () => flashSave('Multi-project \u00b7 coming soon'));
}

// ═══════════════════════════════════════════════════════════════
//  PHASE 2 FEATURE WIRING
// ═══════════════════════════════════════════════════════════════

function wireSceneGoalModal() {
  // Scene goal save
  const saveBtn = $('#sceneGoalSave');
  if (saveBtn) saveBtn.addEventListener('click', saveSceneGoal);

  // Scene goal delete
  const delBtn = $('#sceneGoalDelete');
  if (delBtn) delBtn.addEventListener('click', deleteSceneGoal);

  // Template select auto-populates textarea
  const templateSel = $('#sceneGoalTemplate');
  const goalText = $('#sceneGoalText');
  if (templateSel && goalText) {
    templateSel.addEventListener('change', () => {
      if (templateSel.value) goalText.value = templateSel.value;
    });
  }
}

function wireStatsModal() {
  // Stats trigger — wire into command palette via existing 'graph' command or add new
  // The openStatsModal is called from command palette
}

// ═══════════════════════════════════════════════════════════════
//  PHASE 4: AI ASSISTANT WIRING
// ═══════════════════════════════════════════════════════════════

function wireAIModal() {
  // AI Rewrite button
  const aiRewriteBtn = $('#aiRewriteBtn');
  if (aiRewriteBtn) {
    aiRewriteBtn.addEventListener('click', performAIRewrite);
  }

  // Replace selected text with AI result
  const aiReplaceBtn = $('#aiReplaceBtn');
  if (aiReplaceBtn) {
    aiReplaceBtn.addEventListener('click', () => { insertAIResult(true); closeModals(); });
  }

  // Insert AI result below cursor
  const aiInsertBtn = $('#aiInsertBtn');
  if (aiInsertBtn) {
    aiInsertBtn.addEventListener('click', () => { insertAIResult(false); closeModals(); });
  }

  // Save AI config (session only)
  const aiSaveConfig = $('#aiSaveConfig');
  if (aiSaveConfig) {
    aiSaveConfig.addEventListener('click', saveAIConfig);
  }
}

// ═══════════════════════════════════════════════════════════════
//  BRANCH-AWARE OPERATIONS
// ═══════════════════════════════════════════════════════════════

async function onSwitchBranch(branchId) {
  // 1. Save current state
  await saveCurrentDoc();

  // 2. Switch branch in engine
  const branch = await switchBranch(branchId);
  if (!branch) {
    console.error('Failed to switch branch');
    return;
  }

  // 3. Re-render everything
  editor.value = branch.docs[branch.activeDocId] ?? '';
  manualTags = branch.manualTags || [];

  renderTree(branch.tree);
  renderBranchSelector();
  await refreshBranchGraph();
  await refreshCommitHistory();
  renderSceneBanner();

  updateAll();
  updateStatusBar();
  flashSave('Switched to \u00b7 ' + branch.name);
}

const MEDIA_TYPES = new Set(['location', 'map', 'image', 'asset']);

function mediaKey(nodeId) { return `fw-media-${nodeId}`; }

function saveMediaItem(nodeId, dataUrl, fileName) {
  try {
    const items = JSON.parse(localStorage.getItem(mediaKey(nodeId)) || '[]');
    items.push({ dataUrl, fileName, added: Date.now() });
    localStorage.setItem(mediaKey(nodeId), JSON.stringify(items));
  } catch(e) { console.warn('[Media] Save failed:', e); }
}

function deleteMediaItem(nodeId, index) {
  try {
    const items = JSON.parse(localStorage.getItem(mediaKey(nodeId)) || '[]');
    items.splice(index, 1);
    localStorage.setItem(mediaKey(nodeId), JSON.stringify(items));
  } catch(e) {}
}

function renderMediaGrid(nodeId) {
  const grid = document.getElementById('mediaPreviewGrid');
  const drop = document.getElementById('mediaDropZone');
  if (!grid) return;
  const items = JSON.parse(localStorage.getItem(mediaKey(nodeId)) || '[]');
  drop.style.display = items.length ? 'none' : '';
  grid.innerHTML = items.map((item, i) => {
    const isPdf = item.fileName?.toLowerCase().endsWith('.pdf') || item.dataUrl?.startsWith('data:application/pdf');
    const thumb = isPdf
      ? `<div class="media-pdf-thumb">
           <svg width="28" height="28" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><rect x="2" y="1" width="12" height="14" rx="1"/><path d="M5 5h6M5 8h6M5 11h4"/></svg>
           PDF
         </div>`
      : `<img src="${item.dataUrl}" alt="${item.fileName || ''}" loading="lazy" onclick="window.open('${item.dataUrl}','_blank')" />`;
    return `<div class="media-thumb" title="${item.fileName || ''}">
      ${thumb}
      <div class="media-thumb-label">${item.fileName || 'Attachment'}</div>
      <button class="media-thumb-del" data-node="${nodeId}" data-idx="${i}" title="Remove">\u00d7</button>
    </div>`;
  }).join('');

  grid.querySelectorAll('.media-thumb-del').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      deleteMediaItem(btn.dataset.node, parseInt(btn.dataset.idx));
      renderMediaGrid(btn.dataset.node);
    });
  });
}

function initMapMediaInput() {
  const mapInput = document.getElementById('mapMediaInput');
  if (!mapInput) return;

  const MAP_NODE_IDS = { town: 'map', library: 'layout' };

  // When map modal opens, sync media strip
  const scrim = document.getElementById('mapScrim');
  if (scrim) {
    new MutationObserver(() => {
      if (scrim.classList.contains('show')) {
        const titleEl = document.getElementById('mapTitle');
        const mapType = titleEl?.textContent === 'Town Map' ? 'town' : 'library';
        const nodeId = MAP_NODE_IDS[mapType];
        mapInput.dataset.mapType = mapType;
        renderMapMediaStrip(nodeId);
      }
    }).observe(scrim, { attributes: true, attributeFilter: ['class'] });
  }

  mapInput.addEventListener('change', () => {
    const mapType = mapInput.dataset.mapType;
    const nodeId  = MAP_NODE_IDS[mapType] || mapType;
    [...mapInput.files].forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        saveMediaItem(nodeId, ev.target.result, file.name);
        renderMapMediaStrip(nodeId);
      };
      reader.readAsDataURL(file);
    });
    mapInput.value = '';
  });
}

function renderMapMediaStrip(nodeId) {
  const strip = document.getElementById('mapMediaStrip');
  if (!strip) return;
  const items = JSON.parse(localStorage.getItem(mediaKey(nodeId)) || '[]');
  if (!items.length) { strip.style.display = 'none'; return; }
  strip.style.display = 'flex';
  strip.innerHTML = items.map((item, i) => {
    const isPdf = item.fileName?.toLowerCase().endsWith('.pdf');
    const thumb = isPdf
      ? `<div class="map-media-pdf">PDF</div>`
      : `<img src="${item.dataUrl}" alt="${item.fileName||''}" onclick="window.open('${item.dataUrl}','_blank')" />`;
    return `<div class="map-media-item" title="${item.fileName||''}">
      ${thumb}
      <button class="media-thumb-del map-del" data-node="${nodeId}" data-idx="${i}" title="Remove">×</button>
    </div>`;
  }).join('');
  strip.querySelectorAll('.map-del').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      deleteMediaItem(btn.dataset.node, parseInt(btn.dataset.idx));
      renderMapMediaStrip(btn.dataset.node);
    });
  });
}

function initMediaZone() {
  const input = document.getElementById('mediaFileInput');
  const drop  = document.getElementById('mediaDropZone');
  if (!input) return;

  input.addEventListener('change', () => {
    const nodeId = input.dataset.nodeId;
    if (!nodeId) return;
    [...input.files].forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        saveMediaItem(nodeId, ev.target.result, file.name);
        renderMediaGrid(nodeId);
      };
      reader.readAsDataURL(file);
    });
    input.value = '';
  });

  // Drag-and-drop
  drop?.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('drag-over'); });
  drop?.addEventListener('dragleave', () => drop.classList.remove('drag-over'));
  drop?.addEventListener('drop', e => {
    e.preventDefault();
    drop.classList.remove('drag-over');
    const nodeId = input.dataset.nodeId;
    if (!nodeId) return;
    [...e.dataTransfer.files].forEach(file => {
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') return;
      const reader = new FileReader();
      reader.onload = ev => {
        saveMediaItem(nodeId, ev.target.result, file.name);
        renderMediaGrid(nodeId);
      };
      reader.readAsDataURL(file);
    });
  });
}

async function onSwitchDoc(docId) {
  // Save current doc content
  await saveCurrentDoc();

  // Switch doc in engine
  const content = await switchDoc(docId);

  // Detect node type
  const branch = getActiveBranch();
  const treeNodes = flattenTree(branch?.tree || []);
  const node = treeNodes.find(n => n.id === docId);
  const isMedia = MEDIA_TYPES.has(node?.type);

  // Toggle center view: editor vs media zone
  const editorWrap = document.getElementById('editorWrap');
  const mediaZone  = document.getElementById('mediaZone');
  const mediaInput = document.getElementById('mediaFileInput');
  if (editorWrap) editorWrap.style.display = isMedia ? 'none' : '';
  if (mediaZone) {
    mediaZone.style.display = isMedia ? 'flex' : 'none';
    if (isMedia) {
      if (mediaInput) mediaInput.dataset.nodeId = docId;
      const title = document.getElementById('mediaZoneTitle');
      if (title) title.textContent = (node?.label || 'World Building') + ' \u00b7 Attachments';
      renderMediaGrid(docId);
    }
  }

  // Update editor
  editor.value = content ?? '';

  // Update active highlight in tree
  $$('.tree-item').forEach(el => el.classList.toggle('active', el.dataset.doc === docId));

  // Update scene summary pill
  const label = node?.label ?? '';
  $('#sceneSummaryLabel').textContent = label + ' \u00b7 The Lost Library';

  renderSceneBanner();
  updateAll();
  if (!isMedia) editor.focus();
}

async function refreshBranchGraph() {
  const svg = $('#branchGraphSvg');
  if (!svg) return;

  try {
    const state = getState();
    const branches = state?.branches || [];
    const activeBranch = getActiveBranch();
    // Get commits for all branches to render full graph
    const allCommits = [];
    for (const b of branches) {
      const commits = await getCommitHistory(b.id);
      allCommits.push(...commits);
    }

    const layout = computeGraphLayout(branches, allCommits);
    renderBranchGraph(svg, layout, activeBranch?.id);

    // Setup tooltip (idempotent — checks before re-creating)
    setupGraphTooltip(svg);

    // Render zoom controls
    let controlsContainer = svg.parentElement.querySelector('.graph-controls');
    if (!controlsContainer) {
      controlsContainer = document.createElement('div');
      controlsContainer.className = 'graph-controls';
      svg.insertAdjacentElement('afterend', controlsContainer);
    }
    renderGraphControls(controlsContainer, svg);

    // Pan to active branch head
    if (activeBranch) {
      panToBranch(svg, activeBranch.id, layout);
    }
  } catch (err) {
    console.error('Failed to refresh branch graph:', err);
  }
}

async function refreshCommitHistory() {
  try {
    const activeBranch = getActiveBranch();
    if (!activeBranch) return;
    const commits = await getCommitHistory(activeBranch.id);
    await renderCommitHistory(commits);
  } catch (err) {
    console.error('Failed to refresh commit history:', err);
  }
}

// ═══════════════════════════════════════════════════════════════
//  MASTER UPDATE
// ═══════════════════════════════════════════════════════════════

function updateAll() {
  updateWordCount();
  refreshAutoTags();
  applyFmt();
  applyModes();
  renderManual();
}

function flattenTree(nodes) {
  const result = [];
  for (const node of nodes || []) {
    result.push(node);
    if (node.children) result.push(...flattenTree(node.children));
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════
//  BOOT SEQUENCE (Section 9.1)
// ═══════════════════════════════════════════════════════════════

async function boot() {
  console.log('[Flow Writer] Booting...');

  try {
    // 1. Cache DOM element references
    cacheElements();
    setEditorRef(editor);

    // 2. Open IndexedDB
    await initDB();
    console.log('[Flow Writer] DB opened');

    // 3. Migrate from localStorage v1 if needed
    const mainBranch = await migrateFromV1();
    console.log('[Flow Writer] Migration complete:', mainBranch?.id);

    // 4. Load all branches
    const branches = await getAllBranches();
    console.log('[Flow Writer] Loaded', branches.length, 'branches');

    // 5. Initialize engine state
    await initEngine(branches, mainBranch?.id);
    console.log('[Flow Writer] Engine initialized');

    // 6. Load global settings (modes)
    const settings = await getSettings();
    applyGlobalSettings(settings);

    // 6b. Initialize sprint and stats engines (Phase 2)
    initSprintEngine();
    initStatsEngine();

    // 6c. Initialize mobile viewport fix (Phase 5b)
    initMobileViewportFix();

    // 7. Set UI callbacks (for cross-module communication)
    setUICallbacks({
      onSwitchBranch,
      onSwitchDoc,
      onRefreshGraph: refreshBranchGraph,
      onRefreshHistory: refreshCommitHistory,
      onToggleFocus: toggleFocus,
      onOpenCommandPalette: () => { showModal('cmdScrim'); renderCmd(''); setTimeout(() => $('#cmdInput').focus(), 50); },
      editor,
    });

    // 8. Render initial UI
    const activeBranch = getActiveBranch();
    if (activeBranch) {
      manualTags = activeBranch.manualTags || [];
      renderTree(activeBranch.tree);
      renderBranchSelector();
      await refreshBranchGraph();
      await refreshCommitHistory();
      renderSceneBanner();

      // 9. Load active doc into editor
      editor.value = activeBranch.docs[activeBranch.activeDocId] ?? '';

      // 9b. Phase 2: Render sprint section and daily target
      renderSprintSection();
      renderDailyTarget();

      // Update scene summary pill
      const treeNodes = flattenTree(activeBranch.tree || []);
      const activeNode = treeNodes.find(n => n.id === activeBranch.activeDocId);
      if ($('#sceneSummaryLabel')) {
        $('#sceneSummaryLabel').textContent = (activeNode?.label || 'Untitled') + ' \u00b7 The Lost Library';
      }
    }

    // 10. Wire ALL event handlers
    initTheme();
    initUI();
    initMobileNav();
    initResizablePanes();
    initRightPaneTabs();
    initUniverseDashboard();
    wireTouchTreeDragAndDrop();
    initOnboarding();
    initInteractiveMaps();
    initVoiceToText();
    initTimeline();
    initMediaZone();
    initMapMediaInput();
    wireEditorEvents();
    wireKeyboardShortcuts();
    initAIInlineSuggestions(editor);
    wireFormatControls();
    wireModeToggles();
    wireExport();
    wireNudge();
    wireSuggestedTags();
    wireProjectSwitcher();
    wireCommandPalette();

    // Populate commands after engine is ready
    populateCommands();

    // Phase 2: Wire scene goal modal
    wireSceneGoalModal();

    // Phase 2: Wire stats modal
    wireStatsModal();

    // Phase 4: Wire AI assistant modal
    wireAIModal();

    // 11. Run update cycle
    updateAll();
    updateStatusBar();
    scheduleNudge();
    bumpFlow();
    editor.focus();

    console.log('[Flow Writer] Boot complete');
  } catch (err) {
    console.error('[Flow Writer] Boot failed:', err);
    // Fallback: seed with defaults
    editor.value = 'Welcome to Flow Writer. An error occurred during startup. Please refresh.';
    editor.focus();
  }
}

function applyGlobalSettings(settings) {
  // Apply persisted modes to engine state
  const state = getState();
  if (settings?.modes && state) {
    state.modes = { ...state.modes, ...settings.modes };
  }
}

// Start the application
boot();
