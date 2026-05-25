/* ============================================================
   Flow Writer — interactive shell
   ============================================================ */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

// ---------- elements ----------
const app           = $('#app');
const editor        = $('#editor');
const center        = $('#center');
const editorWrap    = $('#editorWrap');
const sceneBanner   = $('#sceneBanner');
const nudge         = $('#nudge');
const nudgeMsg      = $('#nudgeMsg');

const btnFocus      = $('#btnFocus');
const btnTw         = $('#btnTw');
const btnCmd        = $('#btnCmd');
const btnShortcuts  = $('#btnShortcuts');
const mFocus        = $('#mFocus');
const mTw           = $('#mTw');

const wcLabel       = $('#wcLabel');
const saveLabel     = $('#saveLabel');
const saveItem      = $('#saveItem');
const flowState     = $('#flowState');
const flowLabel     = $('#flowLabel');
const autoTagsEl    = $('#autoTags');
const manualTagsEl  = $('#manualTags');
const autoCount     = $('#autoCount');
const manualCount   = $('#manualCount');

// ---------- state ----------
const STORAGE_KEY = 'djc-flow-writer-v1';
const state = {
  docId: 'ch1',
  branch: 'main',
  docs: {},          // docId -> text
  manualTags: ['library','backstory','journal','setting','dialogue'],
  fmt: {
    family: 'serif', size: 18, lh: 1.7, width: '720',
    flowDelay: 35,
  },
  modes: { focus: false, typewriter: false, sceneCollapsed: false },
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    Object.assign(state, JSON.parse(raw));
    if (!state.docs) state.docs = {};
  } catch { seed(); }
}
function seed() {
  state.docs = {
    ch1: `The library held its breath.\n\nSarah's fingers traced the spine of the oak shelf — the one her grandmother had warned her about, the one with the iron lock that had never had a key. Or so she'd thought.\n\nA panel shifted under her palm. Just an inch. A cool draft slipped out from somewhere behind the wood.`,
    ch2: '',
    notes: '## Voice\nFirst person. Patient. Aware of light, of dust.\n\n## Themes\n- inheritance\n- silence as language\n- the cost of curiosity',
    sarah: 'Sarah — age 24, archivist-in-training.\n\nFlaw: trusts paper more than people.\nWant: to know what her grandmother kept silent.\nNeed: to forgive herself for asking.',
    layout: '',
    map: '',
  };
}
function save() {
  state.docs[state.docId] = editor.value;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ---------- doc switch ----------
function loadDoc(id) {
  state.docs[state.docId] = editor.value;
  state.docId = id;
  editor.value = state.docs[id] ?? '';
  $$('.tree-item').forEach(el => el.classList.toggle('active', el.dataset.doc === id));
  const label = $$('.tree-item').find(el => el.dataset.doc === id)?.innerText.trim() ?? '';
  $('#sceneSummaryLabel').textContent = label + ' · The Lost Library';
  updateAll();
  editor.focus();
}

// ---------- word count + reading time ----------
function updateWordCount() {
  const t = editor.value.trim();
  const words = t ? t.split(/\s+/).length : 0;
  const mins  = Math.max(1, Math.round(words / 230));
  wcLabel.textContent = `${words} word${words === 1 ? '' : 's'} · ${mins} min read`;
}

// ---------- auto-detect tags ----------
const AUTO_RULES = [
  { tag: 'protagonist',  re: /\b(sarah|her|she)\b/i },
  { tag: 'mystery',      re: /\b(hidden|secret|whisper|silence|locked|never)\b/i },
  { tag: 'discovery',    re: /\b(found|discover|reveal|open|panel|shift|inch)\b/i },
  { tag: 'dialogue',     re: /[""].+?[""]|"[^"]+"/ },
  { tag: 'flashback',    re: /\b(remembered|once|years ago|grandmother|childhood)\b/i },
  { tag: 'setting',      re: /\b(library|shelf|oak|dust|window|room|corridor)\b/i },
  { tag: 'emotion',      re: /\b(tremble|breath|gasp|tear|ache|fear|wonder)\b/i },
];
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
  manualTagsEl.innerHTML = state.manualTags.map(t =>
    `<span class="tag manual" data-tag="${t}">${t}<span class="close" data-rm="${t}">×</span></span>`
  ).join('') +
    `<span class="tag-add" id="tagAdd">+ <input type="text" placeholder="add tag" id="tagInput" /></span>`;
  manualCount.textContent = state.manualTags.length;
  wireTagInput();
}
function wireTagInput() {
  const inp = $('#tagInput');
  inp?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && inp.value.trim()) {
      const v = inp.value.trim().toLowerCase().replace(/\s+/g, '_');
      if (!state.manualTags.includes(v)) state.manualTags.push(v);
      renderManual();
      save();
      setTimeout(() => $('#tagInput')?.focus(), 0);
    }
  });
  manualTagsEl.querySelectorAll('[data-rm]').forEach(x => {
    x.addEventListener('click', e => {
      e.stopPropagation();
      state.manualTags = state.manualTags.filter(t => t !== x.dataset.rm);
      renderManual(); save();
    });
  });
}

// ---------- save state ----------
let saveTimer = null;
function markDirty() {
  saveItem.className = 'item saving';
  saveLabel.textContent = 'Saving…';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    save();
    saveItem.className = 'item saved';
    saveLabel.textContent = 'Saved · just now';
  }, 600);
}

// ---------- flow / idle nudge ----------
let lastKey = Date.now();
let nudgeTimer = null;
const NUDGES = [
  'Consider how her <em>hands tremble</em> as the spine cracks open.',
  'What does the dust <em>sound</em> like in here?',
  'Skip the description — drop the <em>next line of dialogue</em>.',
  'The room remembers something. <em>Show one detail it remembers.</em>',
  'What is <em>just outside the frame</em> of this scene?',
  'A single sentence. Just one. <em>Move</em>.',
];

function scheduleNudge() {
  clearTimeout(nudgeTimer);
  hideNudge();
  if (state.fmt.flowDelay === 0) return;
  nudgeTimer = setTimeout(showNudge, state.fmt.flowDelay * 1000);
}
function showNudge() {
  nudgeMsg.innerHTML = NUDGES[Math.floor(Math.random() * NUDGES.length)];
  nudge.classList.add('show');
}
function hideNudge() { nudge.classList.remove('show'); }
$('#nudgeDismiss').addEventListener('click', () => { hideNudge(); scheduleNudge(); });

// ---------- flow state indicator ----------
let flowTimer = null;
function bumpFlow() {
  flowState.className = 'item flow';
  flowLabel.textContent = 'In flow';
  clearTimeout(flowTimer);
  flowTimer = setTimeout(() => {
    flowState.className = 'item idle';
    flowLabel.textContent = 'Idle';
  }, 6000);
}

// ---------- editor input ----------
editor.addEventListener('input', () => {
  lastKey = Date.now();
  updateWordCount();
  refreshAutoTags();
  bumpFlow();
  markDirty();
  scheduleNudge();
  applyTypewriter();
});

// ---------- format controls ----------
function applyFmt() {
  center.dataset.family = state.fmt.family;
  editor.style.setProperty('--editor-fs', state.fmt.size + 'px');
  editor.style.fontSize = state.fmt.size + 'px';
  editor.style.lineHeight = state.fmt.lh;
  if (state.fmt.width === '100%') editor.style.maxWidth = 'none';
  else editor.style.maxWidth = state.fmt.width + 'px';

  // segment ui
  $$('#famSeg button').forEach(b => b.classList.toggle('on', b.dataset.v === state.fmt.family));
  $$('#lhSeg button').forEach(b => b.classList.toggle('on', parseFloat(b.dataset.v) === state.fmt.lh));
  $$('#widthSeg button').forEach(b => b.classList.toggle('on', b.dataset.v === state.fmt.width));
  $('#sizeRange').value = state.fmt.size;
  $('#sizeVal').textContent = state.fmt.size + 'px';
  const famName = { serif: 'Serif', garamond: 'Garamond', sans: 'Sans', mono: 'Mono' }[state.fmt.family] || state.fmt.family;
  $('#famVal').textContent = famName;
  $('#lhVal').textContent = state.fmt.lh < 1.6 ? 'Compact' : state.fmt.lh > 1.85 ? 'Spacious' : 'Normal';
  $('#widthVal').textContent = state.fmt.width === '560' ? 'Narrow' : state.fmt.width === '720' ? 'Medium' : state.fmt.width === '880' ? 'Wide' : 'Full';
  $('#flowRange').value = state.fmt.flowDelay;
  $('#flowVal').textContent = state.fmt.flowDelay === 0 ? 'off' : state.fmt.flowDelay + 's';
}

$$('#famSeg button').forEach(b => b.addEventListener('click', () => { state.fmt.family = b.dataset.v; applyFmt(); save(); }));
$$('#lhSeg button').forEach(b => b.addEventListener('click', () => { state.fmt.lh = parseFloat(b.dataset.v); applyFmt(); save(); }));
$$('#widthSeg button').forEach(b => b.addEventListener('click', () => { state.fmt.width = b.dataset.v; applyFmt(); save(); }));
$('#sizeRange').addEventListener('input', e => { state.fmt.size = +e.target.value; applyFmt(); save(); });
$('#flowRange').addEventListener('input', e => {
  state.fmt.flowDelay = +e.target.value;
  $('#flowVal').textContent = state.fmt.flowDelay === 0 ? 'off' : state.fmt.flowDelay + 's';
  save(); scheduleNudge();
});

// ---------- modes ----------
function applyModes() {
  app.classList.toggle('focus-mode', state.modes.focus);
  center.classList.toggle('typewriter', state.modes.typewriter);
  sceneBanner.classList.toggle('collapsed', state.modes.sceneCollapsed || state.modes.focus);
  [btnFocus, mFocus].forEach(b => b.classList.toggle('active', state.modes.focus));
  [btnFocus, mFocus].forEach(b => b.classList.toggle('on',     state.modes.focus));
  [btnTw, mTw].forEach(b => b.classList.toggle('active', state.modes.typewriter));
  [btnTw, mTw].forEach(b => b.classList.toggle('on',     state.modes.typewriter));
  applyTypewriter();
}
function toggleFocus()      { state.modes.focus = !state.modes.focus; applyModes(); save(); }
function toggleTypewriter() { state.modes.typewriter = !state.modes.typewriter; applyModes(); save(); }
function toggleSceneGoal()  { state.modes.sceneCollapsed = !state.modes.sceneCollapsed; applyModes(); save(); }

btnFocus.addEventListener('click', toggleFocus);
mFocus.addEventListener('click', toggleFocus);
btnTw.addEventListener('click', toggleTypewriter);
mTw.addEventListener('click', toggleTypewriter);
$('#sceneCollapse').addEventListener('click', toggleSceneGoal);

// Typewriter: keep caret line near vertical center
function applyTypewriter() {
  if (!state.modes.typewriter) return;
  // mirror caret position with a hidden div would be heavy; quick approach: scroll based on selectionStart line count.
  const before = editor.value.slice(0, editor.selectionStart);
  const lineIdx = before.split('\n').length - 1;
  const lh = parseFloat(getComputedStyle(editor).lineHeight) || 28;
  const target = lineIdx * lh - editorWrap.clientHeight / 2 + lh;
  editorWrap.scrollTop = Math.max(0, target + editor.offsetTop - editorWrap.offsetTop + 0);
}
editor.addEventListener('keyup', applyTypewriter);
editor.addEventListener('click', applyTypewriter);

// ---------- tree ----------
$$('.tree-folder > .tree-item').forEach(el => {
  el.addEventListener('click', () => {
    el.parentElement.classList.toggle('open');
  });
});
$$('.tree-item[data-doc]').forEach(el => {
  el.addEventListener('click', e => { e.stopPropagation(); loadDoc(el.dataset.doc); });
});

// ---------- command palette ----------
const COMMANDS = [
  { id: 'focus',   label: 'Toggle focus mode',     kbd: '⌘⇧F', icon: '🎯', run: toggleFocus },
  { id: 'tw',      label: 'Toggle typewriter mode',kbd: '⌘⇧T', icon: '⌨︎', run: toggleTypewriter },
  { id: 'scene',   label: 'Toggle scene goal',     kbd: '⌘/',  icon: '◇', run: toggleSceneGoal },
  { id: 'branch',  label: 'Create branch…',        kbd: '⌘B',  icon: '⎇', run: () => showModal('branchScrim') },
  { id: 'snapshot',label: 'Save snapshot',         kbd: '⌘S',  icon: '◉', run: () => { save(); flashSave('Snapshot saved'); } },
  { id: 'sc',      label: 'Show keyboard shortcuts',kbd:'?',   icon: '?', run: () => showModal('scScrim') },
  { id: 'ch1',     label: 'Open · Chapter 1 — Discovery', kbd: '', icon: '⌐', run: () => loadDoc('ch1') },
  { id: 'ch2',     label: 'Open · Chapter 2 — Revelations',kbd:'',icon: '⌐', run: () => loadDoc('ch2') },
  { id: 'notes',   label: 'Open · Character Notes',kbd: '',    icon: '≡', run: () => loadDoc('notes') },
  { id: 'sarah',   label: 'Open · Sarah — Protagonist', kbd:'',icon: '◉', run: () => loadDoc('sarah') },
  { id: 'export-txt', label: 'Export · plain text',kbd: '',    icon: '↓', run: () => exportDoc('txt') },
  { id: 'export-md',  label: 'Export · Markdown',  kbd: '',    icon: '↓', run: () => exportDoc('md') },
  { id: 'export-html',label: 'Export · printable HTML',kbd:'', icon: '↓', run: () => exportDoc('html') },
];
function renderCmd(q = '') {
  const re = new RegExp(q.split('').map(c => c.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('.*'), 'i');
  const list = q ? COMMANDS.filter(c => re.test(c.label)) : COMMANDS;
  const res = $('#cmdResults');
  res.innerHTML = list.map((c, i) => `
    <div class="cmd-item ${i===0?'sel':''}" data-id="${c.id}">
      <div class="ic">${c.icon}</div>
      <div class="label">${c.label}</div>
      ${c.kbd ? `<div class="kbd">${c.kbd}</div>` : ''}
    </div>`).join('');
  $$('#cmdResults .cmd-item').forEach(el => el.addEventListener('click', () => {
    const c = COMMANDS.find(x => x.id === el.dataset.id);
    closeModals(); c && c.run();
  }));
}
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
btnCmd.addEventListener('click', () => showModal('cmdScrim'));

// ---------- modals ----------
function showModal(id) {
  $('#' + id).classList.add('show');
  if (id === 'cmdScrim') { renderCmd(''); setTimeout(() => $('#cmdInput').focus(), 50); }
  if (id === 'branchScrim') setTimeout(() => $('#branchInput').focus(), 50);
}
function closeModals() {
  $$('.modal-scrim').forEach(el => el.classList.remove('show'));
}
$$('.modal-scrim').forEach(el => {
  el.addEventListener('click', e => { if (e.target === el) closeModals(); });
});
$$('[data-close]').forEach(b => b.addEventListener('click', closeModals));

btnShortcuts.addEventListener('click', () => showModal('scScrim'));
$('#btnBranchNew').addEventListener('click', () => showModal('branchScrim'));
$('#branchCreate').addEventListener('click', () => {
  const name = ($('#branchInput').value || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
  if (!name) return;
  state.branch = name;
  $('#branchName').textContent = name;
  $('#branchLabel').textContent = name;
  closeModals();
  flashSave('Branched · ' + name);
});

// ---------- export ----------
function exportDoc(fmt) {
  const text = editor.value;
  const title = $$('.tree-item.active span').slice(-1)[0]?.textContent.trim() || 'flow-writer-doc';
  let blob, ext;
  if (fmt === 'txt')  { blob = new Blob([text], { type: 'text/plain' }); ext = 'txt'; }
  else if (fmt === 'md') { blob = new Blob([`# ${title}\n\n${text}`], { type: 'text/markdown' }); ext = 'md'; }
  else {
    const html = `<!doctype html><meta charset="utf-8"><title>${title}</title>
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
  flashSave('Exported · .' + ext);
}
$$('.export-btn').forEach(b => b.addEventListener('click', () => exportDoc(b.dataset.fmt)));

function flashSave(msg) {
  saveItem.className = 'item saved';
  const prev = saveLabel.textContent;
  saveLabel.textContent = msg;
  setTimeout(() => { saveLabel.textContent = prev; }, 1800);
}

// ---------- keyboard ----------
window.addEventListener('keydown', e => {
  const mod = e.metaKey || e.ctrlKey;
  if (mod && e.key.toLowerCase() === 'k')                 { e.preventDefault(); showModal('cmdScrim'); }
  else if (mod && e.shiftKey && e.key.toLowerCase() === 'f') { e.preventDefault(); toggleFocus(); }
  else if (mod && e.shiftKey && e.key.toLowerCase() === 't') { e.preventDefault(); toggleTypewriter(); }
  else if (mod && e.key.toLowerCase() === 'b')            { e.preventDefault(); showModal('branchScrim'); }
  else if (mod && e.key === '\\')                          { e.preventDefault(); toggleFocus(); }
  else if (mod && e.key === '/')                          { e.preventDefault(); toggleSceneGoal(); }
  else if (mod && e.key.toLowerCase() === 's')            { e.preventDefault(); save(); flashSave('Snapshot saved'); }
  else if (e.key === 'Escape')                            { closeModals(); hideNudge(); }
  else if (e.key === '?' && document.activeElement !== editor) { showModal('scScrim'); }
});

// suggested -> add to manual on click
$('#suggestTags').addEventListener('click', e => {
  const t = e.target.closest('.tag.suggest');
  if (!t) return;
  const v = t.textContent.replace(/^\+\s*/, '').trim();
  if (!state.manualTags.includes(v)) state.manualTags.push(v);
  renderManual(); save();
});

// project switcher (placeholder feedback)
$('#projSwitcher').addEventListener('click', () => flashSave('Multi-project · coming soon'));

// ---------- boot ----------
function updateAll() {
  updateWordCount();
  refreshAutoTags();
  applyFmt();
  applyModes();
  renderManual();
}

load();
editor.value = state.docs[state.docId] ?? '';
updateAll();
scheduleNudge();
bumpFlow();
editor.focus();
