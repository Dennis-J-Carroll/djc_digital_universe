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

// ---------- theme ----------
const SVG_SUN  = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
const SVG_MOON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

let currentTheme = localStorage.getItem('djc-fw-theme') || 'dark';

function applyTheme(t) {
  currentTheme = t;
  document.body.classList.toggle('theme-light', t === 'light');
  localStorage.setItem('djc-fw-theme', t);
  const btn = $('#btnTheme');
  if (btn) btn.innerHTML = t === 'dark' ? SVG_SUN : SVG_MOON;
}
function toggleTheme() { applyTheme(currentTheme === 'dark' ? 'light' : 'dark'); }

$('#btnTheme')?.addEventListener('click', toggleTheme);

// ---------- mobile drawer ----------
const MOB_DOCS = [
  { id: 'ch1',    icon: '⌐', cls: 'file-type-doc',  label: 'Chapter 1 — Discovery' },
  { id: 'ch2',    icon: '⌐', cls: 'file-type-doc',  label: 'Chapter 2 — Revelations' },
  { id: 'notes',  icon: '≡', cls: 'file-type-doc',  label: 'Character Notes' },
  { id: 'sarah',  icon: '◉', cls: 'file-type-char', label: 'Sarah — Protagonist' },
  { id: 'layout', icon: '▦', cls: 'file-type-map',  label: 'Library Layout' },
  { id: 'map',    icon: '▲', cls: 'file-type-map',  label: 'Town Map' },
];

let mobActiveTab = 'docs';
const mobScrim  = $('#mobDrawerScrim');
const mobBody   = $('#mobDrawerBody');

function openMobDrawer() {
  renderMobTab(mobActiveTab);
  mobScrim.classList.add('open');
}
function closeMobDrawer() {
  mobScrim.classList.remove('open');
}
function switchMobTab(tab) {
  mobActiveTab = tab;
  $$('.mob-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  renderMobTab(tab);
}
function renderMobTab(tab) {
  if (tab === 'docs')   { mobBody.innerHTML = renderMobDocsHtml();   wireMobDocs(); }
  if (tab === 'tags')   { mobBody.innerHTML = renderMobTagsHtml();   wireMobTags(); }
  if (tab === 'format') { mobBody.innerHTML = renderMobFmtHtml();    wireMobFmt(); }
  if (tab === 'export') { mobBody.innerHTML = renderMobExportHtml(); wireMobExport(); }
}

function renderMobDocsHtml() {
  return MOB_DOCS.map(d =>
    `<div class="mob-doc-item${d.id === state.docId ? ' active' : ''}" data-doc="${d.id}">
       <span class="tree-icon ${d.cls}">${d.icon}</span>
       <span>${d.label}</span>
     </div>`
  ).join('');
}
function wireMobDocs() {
  $$('#mobDrawerBody .mob-doc-item[data-doc]').forEach(el =>
    el.addEventListener('click', () => {
      state.docs[state.docId] = editor.value;
      state.docId = el.dataset.doc;
      editor.value = state.docs[state.docId] ?? '';
      $$('.tree-item').forEach(x => x.classList.toggle('active', x.dataset.doc === state.docId));
      $('#sceneSummaryLabel').textContent = el.querySelector('span:last-child').textContent + ' · The Lost Library';
      updateAll();
      save();
      closeMobDrawer();
    })
  );
}

function renderMobTagsHtml() {
  const t = editor.value;
  const hits = AUTO_RULES.filter(r => r.re.test(t)).map(r => r.tag);
  const autoHtml = hits.length
    ? hits.map(tag => `<span class="tag auto">${tag}</span>`).join('')
    : `<span class="tag suggest" style="border-style:dashed;">no signals yet</span>`;
  const manualHtml = state.manualTags.map(tag =>
    `<span class="tag manual">${tag}<span class="close" data-rm="${tag}">×</span></span>`
  ).join('') +
    `<span class="tag-add" id="mobTagAdd">+ <input type="text" placeholder="add tag" id="mobTagInput" /></span>`;
  return `
    <h6 class="section-eyebrow">Auto-Detected <span class="count">${hits.length}</span></h6>
    <div class="tag-row">${autoHtml}</div>
    <h6 class="section-eyebrow" style="margin-top:var(--space-4);">Manual <span class="count">${state.manualTags.length}</span></h6>
    <div class="tag-row" id="mobManualTags">${manualHtml}</div>
    <h6 class="section-eyebrow" style="margin-top:var(--space-4);">Suggested</h6>
    <div class="tag-row">
      <span class="tag suggest" data-add="flashback">+ flashback</span>
      <span class="tag suggest" data-add="emotional_tension">+ emotional_tension</span>
    </div>`;
}
function wireMobTags() {
  const inp = $('#mobTagInput');
  inp?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && inp.value.trim()) {
      const v = inp.value.trim().toLowerCase().replace(/\s+/g, '_');
      if (!state.manualTags.includes(v)) state.manualTags.push(v);
      save();
      switchMobTab('tags');
      setTimeout(() => $('#mobTagInput')?.focus(), 0);
    }
  });
  mobBody.querySelectorAll('[data-rm]').forEach(x =>
    x.addEventListener('click', e => {
      e.stopPropagation();
      state.manualTags = state.manualTags.filter(t => t !== x.dataset.rm);
      save(); switchMobTab('tags');
    })
  );
  mobBody.querySelectorAll('.tag.suggest[data-add]').forEach(el =>
    el.addEventListener('click', () => {
      const v = el.dataset.add;
      if (!state.manualTags.includes(v)) { state.manualTags.push(v); save(); }
      switchMobTab('tags');
    })
  );
}

function renderMobFmtHtml() {
  const f = state.fmt;
  const famName   = { serif: 'Serif', garamond: 'Garamond', sans: 'Sans', mono: 'Mono' }[f.family] || f.family;
  const lhName    = f.lh < 1.6 ? 'Compact' : f.lh > 1.85 ? 'Spacious' : 'Normal';
  const widthName = f.width === '560' ? 'Narrow' : f.width === '720' ? 'Medium' : f.width === '880' ? 'Wide' : 'Full';
  const on = (cond) => cond ? ' class="on"' : '';
  return `
    <div class="mode-row" style="margin-bottom:var(--space-4);">
      <button class="mode-btn${state.modes.focus ? ' on' : ''}" id="mMobFocus">Focus</button>
      <button class="mode-btn${state.modes.typewriter ? ' on' : ''}" id="mMobTw">Typewriter</button>
    </div>
    <div class="fmt-group">
      <div class="fmt-label">Theme</div>
      <div class="seg" id="mThemeSeg">
        <button data-v="dark"${currentTheme === 'dark' ? ' class="on"' : ''}>Dark</button>
        <button data-v="light"${currentTheme === 'light' ? ' class="on"' : ''}>Light</button>
      </div>
    </div>
    <div class="fmt-group">
      <div class="fmt-label">Family <span class="val" id="mFamVal">${famName}</span></div>
      <div class="seg" id="mFamSeg">
        <button data-v="serif"${on(f.family==='serif')}>Serif</button>
        <button data-v="garamond"${on(f.family==='garamond')}>Grmnd</button>
        <button data-v="sans"${on(f.family==='sans')}>Sans</button>
        <button data-v="mono"${on(f.family==='mono')}>Mono</button>
      </div>
    </div>
    <div class="fmt-group">
      <div class="fmt-label">Size <span class="val" id="mSizeVal">${f.size}px</span></div>
      <input type="range" id="mSizeRange" min="14" max="28" value="${f.size}" step="1" />
    </div>
    <div class="fmt-group">
      <div class="fmt-label">Line Height <span class="val" id="mLhVal">${lhName}</span></div>
      <div class="seg" id="mLhSeg">
        <button data-v="1.45"${on(f.lh===1.45)}>Compact</button>
        <button data-v="1.7"${on(f.lh===1.7)}>Normal</button>
        <button data-v="2.0"${on(f.lh===2.0)}>Spacious</button>
      </div>
    </div>
    <div class="fmt-group">
      <div class="fmt-label">Width <span class="val" id="mWidthVal">${widthName}</span></div>
      <div class="seg" id="mWidthSeg">
        <button data-v="560"${on(f.width==='560')}>Narrow</button>
        <button data-v="720"${on(f.width==='720')}>Medium</button>
        <button data-v="880"${on(f.width==='880')}>Wide</button>
        <button data-v="100%"${on(f.width==='100%')}>Full</button>
      </div>
    </div>
    <div class="fmt-group">
      <div class="fmt-label">Flow Nudge <span class="val" id="mFlowVal">${f.flowDelay === 0 ? 'off' : f.flowDelay + 's'}</span></div>
      <input type="range" id="mFlowRange" min="0" max="120" value="${f.flowDelay}" step="5" />
      <div style="font-size:11px;color:var(--fg-4);margin-top:6px;font-family:var(--font-mono);">0 = off · drift on silence</div>
    </div>`;
}
function wireMobFmt() {
  $$('#mFamSeg button').forEach(b => b.addEventListener('click', () => {
    state.fmt.family = b.dataset.v; applyFmt(); save();
    $$('#mFamSeg button').forEach(x => x.classList.toggle('on', x.dataset.v === state.fmt.family));
    const names = { serif: 'Serif', garamond: 'Garamond', sans: 'Sans', mono: 'Mono' };
    const el = $('#mFamVal'); if (el) el.textContent = names[state.fmt.family];
  }));
  $$('#mLhSeg button').forEach(b => b.addEventListener('click', () => {
    state.fmt.lh = parseFloat(b.dataset.v); applyFmt(); save();
    $$('#mLhSeg button').forEach(x => x.classList.toggle('on', parseFloat(x.dataset.v) === state.fmt.lh));
    const el = $('#mLhVal'); if (el) el.textContent = state.fmt.lh < 1.6 ? 'Compact' : state.fmt.lh > 1.85 ? 'Spacious' : 'Normal';
  }));
  $$('#mWidthSeg button').forEach(b => b.addEventListener('click', () => {
    state.fmt.width = b.dataset.v; applyFmt(); save();
    $$('#mWidthSeg button').forEach(x => x.classList.toggle('on', x.dataset.v === state.fmt.width));
  }));
  $('#mSizeRange')?.addEventListener('input', e => {
    state.fmt.size = +e.target.value; applyFmt(); save();
    const el = $('#mSizeVal'); if (el) el.textContent = state.fmt.size + 'px';
  });
  $('#mFlowRange')?.addEventListener('input', e => {
    state.fmt.flowDelay = +e.target.value; save(); scheduleNudge();
    const el = $('#mFlowVal'); if (el) el.textContent = state.fmt.flowDelay === 0 ? 'off' : state.fmt.flowDelay + 's';
  });
  $('#mMobFocus')?.addEventListener('click', () => { toggleFocus(); switchMobTab('format'); });
  $('#mMobTw')?.addEventListener('click',    () => { toggleTypewriter(); switchMobTab('format'); });
  $$('#mThemeSeg button').forEach(b => b.addEventListener('click', () => {
    applyTheme(b.dataset.v);
    $$('#mThemeSeg button').forEach(x => x.classList.toggle('on', x.dataset.v === currentTheme));
  }));
}

function renderMobExportHtml() {
  return `
    <p style="font-size:13px;color:var(--fg-3);margin-bottom:var(--space-4);line-height:1.6;">
      Export the current document in your preferred format.
    </p>
    <div class="export-row">
      <button class="export-btn" data-fmt="txt"><span class="ext">TXT</span><span class="lbl">Plain</span></button>
      <button class="export-btn" data-fmt="md"><span class="ext">MD</span><span class="lbl">Markdown</span></button>
      <button class="export-btn" data-fmt="html"><span class="ext">HTML</span><span class="lbl">Print</span></button>
    </div>`;
}
function wireMobExport() {
  mobBody.querySelectorAll('.export-btn').forEach(b =>
    b.addEventListener('click', () => { exportDoc(b.dataset.fmt); closeMobDrawer(); })
  );
}

$('#btnDrawer')?.addEventListener('click', openMobDrawer);
$('#openDrawer')?.addEventListener('click', openMobDrawer);
mobScrim?.addEventListener('click', e => { if (e.target === mobScrim) closeMobDrawer(); });
$$('.mob-tab').forEach(b => b.addEventListener('click', () => switchMobTab(b.dataset.tab)));

// ---------- voice to text ----------
const hasSpeech = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
const micFab     = $('#micFab');
const micPreview = $('#micPreview');

let isRecording  = false;
let voiceRecog   = null;
let voiceInsertPos = 0;
let voiceInserted  = 0;

if (hasSpeech) {
  const SR   = window.SpeechRecognition || window.webkitSpeechRecognition;
  voiceRecog = new SR();
  voiceRecog.continuous      = true;
  voiceRecog.interimResults  = true;
  voiceRecog.lang            = 'en-US';

  voiceRecog.onstart = () => {
    voiceInsertPos = editor.selectionStart;
    voiceInserted  = 0;
    micFab.classList.add('recording');
    micPreview.style.display = 'block';
    micPreview.innerHTML = '<span class="listening">●</span> Listening…';
  };

  voiceRecog.onresult = (event) => {
    let finalText = '', interimText = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const t = event.results[i][0].transcript;
      event.results[i].isFinal ? (finalText += t) : (interimText += t);
    }
    if (finalText) {
      const at     = voiceInsertPos + voiceInserted;
      const insert = finalText.trimEnd() + ' ';
      editor.value = editor.value.slice(0, at) + insert + editor.value.slice(at);
      voiceInserted += insert.length;
      editor.selectionStart = editor.selectionEnd = voiceInsertPos + voiceInserted;
      updateWordCount(); refreshAutoTags(); markDirty(); scheduleNudge();
    }
    micPreview.innerHTML = interimText
      ? `<span class="listening">●</span> <span class="interim">${interimText}</span>`
      : '<span class="listening">●</span> Listening…';
  };

  voiceRecog.onerror = (e) => {
    if (e.error !== 'aborted' && e.error !== 'no-speech') stopVoice();
  };

  // iOS Safari stops after silence even with continuous:true — restart to simulate
  voiceRecog.onend = () => {
    if (isRecording) {
      try { voiceRecog.start(); } catch(e) { stopVoice(); }
    } else {
      micFab?.classList.remove('recording');
      if (micPreview) micPreview.style.display = 'none';
    }
  };
} else if (micFab) {
  micFab.style.display = 'none'; // hide FAB if browser lacks support
}

function startVoice() {
  if (!hasSpeech || isRecording) return;
  isRecording = true;
  try { voiceRecog.start(); } catch(e) {}
}
function stopVoice() {
  isRecording = false;
  try { voiceRecog?.stop(); } catch(e) {}
  micFab?.classList.remove('recording');
  if (micPreview) micPreview.style.display = 'none';
}

micFab?.addEventListener('click', () => { isRecording ? stopVoice() : startVoice(); });

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
applyTheme(currentTheme);
updateAll();
scheduleNudge();
bumpFlow();
editor.focus();
