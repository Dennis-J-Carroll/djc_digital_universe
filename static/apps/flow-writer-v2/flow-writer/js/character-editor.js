/* ============================================================
   Flow Writer — Character Editor
   ------------------------------------------------------------
   Create/edit modal for a character: identity, accent color,
   description, traits, rich profile, avatar + image gallery.

   Self-contained: injects its own scrim/modal into <body> on
   init. Text fields commit on Save; media (avatar/gallery)
   persists immediately via the store (explicit user actions).
   ============================================================ */

import {
  getCharacter,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  addImage,
  getImagesForChar,
  deleteImage,
  setAvatar,
} from './character-store.js?v=1';

const TYPES = ['protagonist', 'antagonist', 'supporting'];
const PROFILE_FIELDS = [
  { key: 'backstory', label: 'Backstory', rows: 3 },
  { key: 'goals', label: 'Goals & Motivation', rows: 2 },
  { key: 'arc', label: 'Character Arc', rows: 2 },
  { key: 'voice', label: 'Voice / Speech', rows: 2 },
  { key: 'relationships', label: 'Relationships', rows: 2 },
];

let _scrim = null;
let _charId = null;
let _isNewDraft = false;
let _traits = [];
let _onChange = null;
let _built = false;

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ---------- DOM construction (once) ----------
function build() {
  if (_built) return;
  _scrim = document.createElement('div');
  _scrim.className = 'modal-scrim char-editor-scrim';
  _scrim.id = 'charEditorScrim';
  _scrim.innerHTML = `
    <div class="modal char-editor-modal" role="dialog" aria-modal="true" aria-label="Edit character">
      <div class="modal-head">
        <span class="char-editor-head-icon">&#x25C8;</span>
        <h3 id="charEditorTitle">Edit Character</h3>
        <button class="scene-banner-collapse" data-ce-close title="Close">&times;</button>
      </div>
      <div class="modal-body char-editor-body">
        <div class="ce-top">
          <div class="ce-avatar-wrap">
            <div class="ce-avatar" id="ceAvatar" tabindex="0" role="button" aria-label="Upload avatar">
              <span class="ce-avatar-placeholder">Add<br>avatar</span>
            </div>
            <button type="button" class="ce-mini-btn" id="ceAvatarRemove" hidden>Remove avatar</button>
            <input type="file" id="ceAvatarInput" accept="image/*" hidden />
          </div>
          <div class="ce-identity">
            <label class="ce-label">Name
              <input type="text" id="ceName" class="ce-input" placeholder="Character name" />
            </label>
            <div class="ce-row">
              <label class="ce-label ce-grow">Type
                <select id="ceType" class="ce-input">
                  ${TYPES.map(t => `<option value="${t}">${t[0].toUpperCase() + t.slice(1)}</option>`).join('')}
                </select>
              </label>
              <label class="ce-label ce-accent-label">Accent
                <span class="ce-accent-row">
                  <input type="color" id="ceAccent" class="ce-color" value="#14b89a" />
                  <button type="button" class="ce-mini-btn" id="ceAccentReset" title="Use type color">Reset</button>
                </span>
              </label>
            </div>
          </div>
        </div>

        <label class="ce-label">Description
          <textarea id="ceDesc" class="ce-input ce-textarea" rows="3" placeholder="Who are they, at a glance?"></textarea>
        </label>

        <div class="ce-label">Traits
          <div class="ce-traits" id="ceTraits"></div>
          <input type="text" id="ceTraitInput" class="ce-input ce-trait-input" placeholder="Add trait, press Enter" />
        </div>

        <details class="ce-profile" id="ceProfile">
          <summary>Rich profile</summary>
          <div class="ce-profile-fields">
            ${PROFILE_FIELDS.map(f => `
              <label class="ce-label">${f.label}
                <textarea id="ce-${f.key}" class="ce-input ce-textarea" rows="${f.rows}"></textarea>
              </label>`).join('')}
          </div>
        </details>

        <div class="ce-label">Gallery
          <div class="ce-gallery" id="ceGallery"></div>
          <button type="button" class="ce-mini-btn" id="ceGalleryAdd">+ Add images</button>
          <input type="file" id="ceGalleryInput" accept="image/*" multiple hidden />
        </div>
      </div>
      <div class="modal-foot char-editor-foot">
        <button type="button" class="ce-btn ce-btn-danger" id="ceDelete">Delete</button>
        <span class="ce-foot-spacer"></span>
        <button type="button" class="ce-btn ce-btn-ghost" data-ce-close>Cancel</button>
        <button type="button" class="ce-btn ce-btn-primary" id="ceSave">Save</button>
      </div>
    </div>`;
  document.body.appendChild(_scrim);
  wire();
  _built = true;
}

function $(id) { return _scrim.querySelector('#' + id); }

function wire() {
  _scrim.addEventListener('click', (e) => { if (e.target === _scrim) cancel(); });
  _scrim.querySelectorAll('[data-ce-close]').forEach(b => b.addEventListener('click', cancel));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && _scrim.classList.contains('show')) cancel();
  });

  $('ceSave').addEventListener('click', save);
  $('ceDelete').addEventListener('click', removeCurrent);

  // Avatar upload
  const avatarBox = $('ceAvatar');
  const avatarInput = $('ceAvatarInput');
  avatarBox.addEventListener('click', () => avatarInput.click());
  avatarBox.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); avatarInput.click(); } });
  avatarInput.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) { await addImage(_charId, file, { isAvatar: true }); await refreshMedia(); }
    avatarInput.value = '';
  });
  // Drag-drop onto avatar
  avatarBox.addEventListener('dragover', (e) => { e.preventDefault(); avatarBox.classList.add('drop-target'); });
  avatarBox.addEventListener('dragleave', () => avatarBox.classList.remove('drop-target'));
  avatarBox.addEventListener('drop', async (e) => {
    e.preventDefault(); avatarBox.classList.remove('drop-target');
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) { await addImage(_charId, file, { isAvatar: true }); await refreshMedia(); }
  });
  $('ceAvatarRemove').addEventListener('click', async () => {
    const char = getCharacter(_charId);
    if (char && char.avatarId) { await deleteImage(char.avatarId); await refreshMedia(); }
  });

  // Gallery upload
  const galleryInput = $('ceGalleryInput');
  $('ceGalleryAdd').addEventListener('click', () => galleryInput.click());
  galleryInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);
    for (const f of files) { await addImage(_charId, f); }
    await refreshMedia();
    galleryInput.value = '';
  });

  // Traits
  const traitInput = $('ceTraitInput');
  traitInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const v = traitInput.value.trim();
      if (v && !_traits.includes(v)) { _traits.push(v); renderTraits(); }
      traitInput.value = '';
    }
  });

  // Accent reset
  $('ceAccentReset').addEventListener('click', () => { $('ceAccent').dataset.cleared = '1'; $('ceAccent').value = '#14b89a'; });
  $('ceAccent').addEventListener('input', () => { delete $('ceAccent').dataset.cleared; });
}

// ---------- Render helpers ----------
function renderTraits() {
  const wrap = $('ceTraits');
  wrap.innerHTML = _traits.map((t, i) =>
    `<span class="ce-trait-pill" data-i="${i}">${esc(t)}<button type="button" class="ce-trait-x" data-i="${i}" aria-label="Remove ${esc(t)}">&times;</button></span>`
  ).join('');
  wrap.querySelectorAll('.ce-trait-x').forEach(btn => {
    btn.addEventListener('click', () => { _traits.splice(+btn.dataset.i, 1); renderTraits(); });
  });
}

async function refreshMedia() {
  const char = getCharacter(_charId);
  const images = await getImagesForChar(_charId).catch(() => []);
  const byId = {};
  images.forEach(im => { byId[im.id] = im; });

  // Avatar
  const box = $('ceAvatar');
  const avatar = char && char.avatarId ? byId[char.avatarId] : null;
  if (avatar) {
    box.style.backgroundImage = `url("${avatar.dataUrl}")`;
    box.classList.add('has-image');
    box.querySelector('.ce-avatar-placeholder').style.display = 'none';
    $('ceAvatarRemove').hidden = false;
  } else {
    box.style.backgroundImage = '';
    box.classList.remove('has-image');
    box.querySelector('.ce-avatar-placeholder').style.display = '';
    $('ceAvatarRemove').hidden = true;
  }

  // Gallery
  const g = $('ceGallery');
  g.innerHTML = images.map(im => `
    <div class="ce-thumb ${char && char.avatarId === im.id ? 'is-avatar' : ''}" data-id="${im.id}">
      <img src="${im.dataUrl}" alt="${esc(im.name)}" loading="lazy" />
      <div class="ce-thumb-actions">
        <button type="button" class="ce-thumb-btn" data-act="avatar" data-id="${im.id}" title="Set as avatar">&#9733;</button>
        <button type="button" class="ce-thumb-btn" data-act="del" data-id="${im.id}" title="Delete">&times;</button>
      </div>
    </div>`).join('') || '<span class="ce-gallery-empty">No images yet</span>';

  g.querySelectorAll('.ce-thumb-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (btn.dataset.act === 'avatar') { setAvatar(_charId, id); await refreshMedia(); }
      else { await deleteImage(id); await refreshMedia(); }
    });
  });
}

// ---------- Open / close ----------
export function openEditor(charId, onChange) {
  build();
  _onChange = onChange;

  if (charId) {
    _charId = charId;
    _isNewDraft = false;
    $('charEditorTitle').textContent = 'Edit Character';
    $('ceDelete').hidden = false;
  } else {
    // A real draft so media uploads have an owner; removed on Cancel.
    const draft = createCharacter({ name: '' });
    _charId = draft.id;
    _isNewDraft = true;
    $('charEditorTitle').textContent = 'New Character';
    $('ceDelete').hidden = true;
  }

  const char = getCharacter(_charId) || {};
  $('ceName').value = char.name === 'Unnamed' ? '' : (char.name || '');
  $('ceType').value = char.type || 'supporting';
  $('ceDesc').value = char.description || '';
  _traits = Array.isArray(char.traits) ? char.traits.slice() : [];
  renderTraits();

  const accent = $('ceAccent');
  if (char.accentColor) { accent.value = char.accentColor; delete accent.dataset.cleared; }
  else { accent.value = '#14b89a'; accent.dataset.cleared = '1'; }

  PROFILE_FIELDS.forEach(f => { $('ce-' + f.key).value = (char.profile && char.profile[f.key]) || ''; });

  refreshMedia();

  _scrim.classList.add('show');
  document.body.style.overflow = 'hidden';
  setTimeout(() => $('ceName').focus(), 50);
}

function close() {
  _scrim.classList.remove('show');
  document.body.style.overflow = '';
  if (typeof _onChange === 'function') _onChange();
}

function save() {
  const accent = $('ceAccent');
  const name = $('ceName').value.trim();
  updateCharacter(_charId, {
    name: name || 'Unnamed',
    type: $('ceType').value,
    description: $('ceDesc').value.trim(),
    traits: _traits.slice(),
    accentColor: accent.dataset.cleared ? null : accent.value,
    profile: PROFILE_FIELDS.reduce((acc, f) => { acc[f.key] = $('ce-' + f.key).value.trim(); return acc; }, {}),
  });
  _isNewDraft = false;
  close();
}

async function cancel() {
  if (_isNewDraft && _charId) {
    await deleteCharacter(_charId); // discard untouched draft + any uploaded media
    _isNewDraft = false;
  }
  close();
}

async function removeCurrent() {
  if (!_charId) return;
  if (!window.confirm('Delete this character? This cannot be undone.')) return;
  await deleteCharacter(_charId);
  close();
}
