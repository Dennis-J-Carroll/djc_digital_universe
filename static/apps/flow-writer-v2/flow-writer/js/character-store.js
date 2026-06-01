/* ============================================================
   Flow Writer — Character Store
   ------------------------------------------------------------
   Single persistence seam for characters.
   - Text metadata  -> localStorage  (small, sync)
   - Image binaries -> IndexedDB     (heavy, async, downscaled)

   Everything that reads/writes character data goes through here.
   This is the boundary a future server (e.g. Supabase) would slot
   behind without touching the dashboard or editor.
   ============================================================ */

import {
  dbGet,
  dbPut,
  dbDelete,
  dbGetByIndex,
  generateUUID,
  STORE_IMAGES,
} from './db.js?v=5';

const STORAGE_KEY = 'fw-universe-characters';

// Downscale ceilings — keep IndexedDB lean vs. raw multi-MB phone photos.
const AVATAR_MAX = 512;
const GALLERY_MAX = 1024;
const JPEG_QUALITY = 0.82;

// ---------- Demo seed ----------
const DEMO_CHARACTERS = [
  {
    id: 'char-1', name: 'Sarah', type: 'protagonist',
    description: "A curious young archivist who stumbles upon secrets hidden within the library's oldest collection. Her determination drives the narrative forward.",
    traits: ['curious', 'determined', 'intuitive'],
    profile: {
      backstory: "Raised by her grandmother, the library's former head archivist.",
      goals: "Uncover what her grandmother kept silent.",
      arc: "Learns to trust people as much as paper.",
      voice: "First person. Patient. Aware of light and dust.",
      relationships: "Granddaughter of the previous archivist; wary ally to Detective Rowe.",
    },
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'char-2', name: 'The Librarian', type: 'antagonist',
    description: 'An ancient, mysterious figure who has guarded the library for centuries. Knows far more than they reveal.',
    traits: ['mysterious', 'ancient', 'cryptic', 'all-knowing'],
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'char-3', name: 'Detective Rowe', type: 'supporting',
    description: "A skeptical investigator who provides grounding logic to Sarah's wild theories. Has a hidden connection to the library.",
    traits: ['skeptical', 'logical', 'secretive'],
    createdAt: Date.now() - 86400000,
  },
];

// ---------- In-memory owner ----------
let _characters = null;

// ---------- Normalization ----------
// Legacy characters (pre-profile/avatar) gain empty defaults on read so the
// rest of the app can treat every field as present.
function normalize(c) {
  const profile = c.profile || {};
  return {
    id: c.id || `char-${generateUUID()}`,
    name: c.name || 'Unnamed',
    type: c.type || 'supporting',
    description: c.description || '',
    traits: Array.isArray(c.traits) ? c.traits : [],
    accentColor: c.accentColor || null,
    avatarId: c.avatarId || null,
    galleryIds: Array.isArray(c.galleryIds) ? c.galleryIds : [],
    profile: {
      backstory: profile.backstory || '',
      goals: profile.goals || '',
      arc: profile.arc || '',
      voice: profile.voice || '',
      relationships: profile.relationships || '',
    },
    createdAt: c.createdAt || Date.now(),
    updatedAt: c.updatedAt || c.createdAt || Date.now(),
  };
}

// ---------- Text persistence (localStorage) ----------
export function loadCharacters() {
  if (_characters) return _characters;
  let raw = null;
  try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { /* private mode */ }
  let parsed = null;
  if (raw) {
    try { parsed = JSON.parse(raw); } catch (e) { parsed = null; }
  }
  if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
    _characters = DEMO_CHARACTERS.map(normalize);
    saveCharacters();
  } else {
    _characters = parsed.map(normalize);
  }
  return _characters;
}

export function saveCharacters() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_characters || []));
  } catch (e) {
    console.warn('[CharacterStore] save failed:', e);
  }
}

export function getCharacters() {
  return loadCharacters();
}

export function getCharacter(id) {
  return loadCharacters().find(c => c.id === id) || null;
}

// ---------- CRUD ----------
export function createCharacter(data = {}) {
  loadCharacters();
  const now = Date.now();
  const char = normalize({ ...data, id: data.id || `char-${generateUUID()}`, createdAt: now, updatedAt: now });
  _characters.push(char);
  saveCharacters();
  return char;
}

export function updateCharacter(id, patch = {}) {
  loadCharacters();
  const idx = _characters.findIndex(c => c.id === id);
  if (idx === -1) return null;
  const merged = {
    ..._characters[idx],
    ...patch,
    profile: { ..._characters[idx].profile, ...(patch.profile || {}) },
    updatedAt: Date.now(),
  };
  _characters[idx] = normalize(merged);
  saveCharacters();
  return _characters[idx];
}

export async function deleteCharacter(id) {
  loadCharacters();
  const char = _characters.find(c => c.id === id);
  // Cascade-delete owned images first.
  if (char) {
    const imgs = await getImagesForChar(id).catch(() => []);
    await Promise.all(imgs.map(img => dbDelete(STORE_IMAGES, img.id).catch(() => {})));
  }
  _characters = _characters.filter(c => c.id !== id);
  saveCharacters();
}

export function reorderCharacters(fromId, toId) {
  loadCharacters();
  if (fromId === toId) return;
  const fromIdx = _characters.findIndex(c => c.id === fromId);
  const toIdx = _characters.findIndex(c => c.id === toId);
  if (fromIdx === -1 || toIdx === -1) return;
  const [item] = _characters.splice(fromIdx, 1);
  _characters.splice(toIdx, 0, item);
  saveCharacters();
}

// ---------- Image helpers ----------
// Decode a File, draw it onto a canvas scaled to fit maxDim, return a
// compressed dataURL plus final dimensions. PNG inputs with transparency
// are kept as PNG; everything else becomes JPEG to save space.
function downscaleImage(file, maxDim) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      reject(new Error('Not an image file'));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      const scale = Math.min(1, maxDim / Math.max(width, height));
      width = Math.round(width * scale);
      height = Math.round(height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const isPng = file.type === 'image/png';
      const dataUrl = isPng
        ? canvas.toDataURL('image/png')
        : canvas.toDataURL('image/jpeg', JPEG_QUALITY);
      resolve({ dataUrl, w: width, h: height });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image decode failed')); };
    img.src = url;
  });
}

export async function addImage(charId, file, { isAvatar = false } = {}) {
  const maxDim = isAvatar ? AVATAR_MAX : GALLERY_MAX;
  const { dataUrl, w, h } = await downscaleImage(file, maxDim);
  const image = {
    id: `img-${generateUUID()}`,
    charId,
    dataUrl,
    name: file.name || 'image',
    w, h,
    createdAt: Date.now(),
  };
  await dbPut(STORE_IMAGES, image);

  // Track on the character record.
  const char = getCharacter(charId);
  if (char) {
    const gallery = char.galleryIds.includes(image.id) ? char.galleryIds : [...char.galleryIds, image.id];
    const patch = { galleryIds: gallery };
    if (isAvatar || !char.avatarId) patch.avatarId = image.id;
    updateCharacter(charId, patch);
  }
  return image;
}

export function getImage(id) {
  if (!id) return Promise.resolve(null);
  return dbGet(STORE_IMAGES, id);
}

export function getImagesForChar(charId) {
  return dbGetByIndex(STORE_IMAGES, 'charId', charId);
}

export async function deleteImage(id) {
  const img = await getImage(id);
  await dbDelete(STORE_IMAGES, id);
  if (img) {
    const char = getCharacter(img.charId);
    if (char) {
      const gallery = char.galleryIds.filter(g => g !== id);
      const patch = { galleryIds: gallery };
      if (char.avatarId === id) patch.avatarId = gallery[0] || null;
      updateCharacter(img.charId, patch);
    }
  }
}

export function setAvatar(charId, imageId) {
  return updateCharacter(charId, { avatarId: imageId });
}

// ---------- Export / Import ----------
// A portable character bundle inlines its image dataURLs so a single JSON
// file is self-contained across browsers/devices.
export async function exportCharacter(id) {
  const char = getCharacter(id);
  if (!char) return null;
  const images = await getImagesForChar(id).catch(() => []);
  return { _type: 'flow-writer-character', version: 1, character: char, images };
}

export async function exportAll() {
  const chars = loadCharacters();
  const bundles = await Promise.all(chars.map(c => exportCharacter(c.id)));
  return { _type: 'flow-writer-characters', version: 1, characters: bundles.filter(Boolean) };
}

// Accepts either a single-character bundle or an exportAll bundle. Always
// assigns fresh ids so importing never clobbers existing characters/images.
export async function importBundle(bundle) {
  const single = bundle && bundle._type === 'flow-writer-character';
  const many = bundle && bundle._type === 'flow-writer-characters';
  if (!single && !many) throw new Error('Unrecognized character file');

  const items = single ? [bundle] : bundle.characters;
  const created = [];
  for (const item of items) {
    if (!item || !item.character) continue;
    const src = item.character;
    const newCharId = `char-${generateUUID()}`;
    const idMap = {};
    // Re-key and store images.
    for (const img of (item.images || [])) {
      const newImgId = `img-${generateUUID()}`;
      idMap[img.id] = newImgId;
      await dbPut(STORE_IMAGES, { ...img, id: newImgId, charId: newCharId });
    }
    const char = createCharacter({
      ...src,
      id: newCharId,
      name: src.name,
      avatarId: src.avatarId ? (idMap[src.avatarId] || null) : null,
      galleryIds: (src.galleryIds || []).map(g => idMap[g]).filter(Boolean),
    });
    created.push(char);
  }
  return created;
}
