/* ============================================================
   Flow Writer -- IndexedDB Layer
   Database name: djc-flow-writer-db  |  Version: 1
   Object stores: branches, commits, settings
   ============================================================ */

const DB_NAME = 'djc-flow-writer-db';
const DB_VERSION = 2;
const STORE_BRANCHES = 'branches';
const STORE_COMMITS = 'commits';
const STORE_SETTINGS = 'settings';
const STORE_IMAGES = 'images';

let _db = null;

const DEFAULT_TREE = [
  { id: 'folder-1', type: 'folder', label: 'The Lost Library', icon: 'folder', color: 'var(--fg-3)', children: [
    { id: 'ch1', type: 'doc', label: 'Chapter 1 — Discovery', icon: 'doc', color: 'var(--accent-2)', order: 0 },
    { id: 'ch2', type: 'doc', label: 'Chapter 2 — Revelations', icon: 'doc', color: 'var(--accent-2)', order: 1 },
    { id: 'notes', type: 'note', label: 'Character Notes', icon: 'note', color: 'var(--accent-2)', order: 2 },
    { id: 'sarah', type: 'character', label: 'Sarah — Protagonist', icon: 'char', color: 'var(--electric-violet)', order: 3 },
  ], expanded: true, order: 0 },
  { id: 'folder-2', type: 'folder', label: 'World Building', icon: 'folder', color: 'var(--fg-3)', children: [
    { id: 'layout', type: 'location', label: 'Library Layout', icon: 'loc', color: 'var(--warn-amber)', order: 0 },
    { id: 'map', type: 'location', label: 'Town Map', icon: 'map', color: 'var(--warn-amber)', order: 1 },
  ], expanded: false, order: 1 },
];

const SEED_DOCS = {
  ch1: "The library held its breath.\n\nSarah's fingers traced the spine of the oak shelf — the one her grandmother had warned her about, the one with the iron lock that had never had a key. Or so she'd thought.\n\nA panel shifted under her palm. Just an inch. A cool draft slipped out from somewhere behind the wood.",
  ch2: '',
  notes: "## Voice\nFirst person. Patient. Aware of light, of dust.\n\n## Themes\n- inheritance\n- silence as language\n- the cost of curiosity",
  sarah: "Sarah — age 24, archivist-in-training.\n\nFlaw: trusts paper more than people.\nWant: to know what her grandmother kept silent.\nNeed: to forgive herself for asking.",
  layout: '',
  map: '',
};

function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

async function initDB() {
  if (_db) return _db;

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      _db = req.result;
      _db.onversionchange = () => {
        _db.close();
        location.reload();
      };
      resolve(_db);
    };

    req.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORE_BRANCHES)) {
        const branchStore = db.createObjectStore(STORE_BRANCHES, { keyPath: 'id' });
        branchStore.createIndex('parentId', 'parentId', { unique: false });
        branchStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_COMMITS)) {
        const commitStore = db.createObjectStore(STORE_COMMITS, { keyPath: 'id' });
        commitStore.createIndex('branchId', 'branchId', { unique: false });
        commitStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
      }

      // v2: character image blobs (avatar + gallery), keyed by image id,
      // indexed by owning character so deletes can cascade.
      if (!db.objectStoreNames.contains(STORE_IMAGES)) {
        const imageStore = db.createObjectStore(STORE_IMAGES, { keyPath: 'id' });
        imageStore.createIndex('charId', 'charId', { unique: false });
      }
    };
  });
}

async function dbGet(store, key) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const os = tx.objectStore(store);
    const req = os.get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function dbPut(store, value) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const os = tx.objectStore(store);
    const req = os.put(value);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbDelete(store, key) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const os = tx.objectStore(store);
    const req = os.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function dbGetAll(store) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const os = tx.objectStore(store);
    const req = os.getAll();
    req.onsuccess = () => resolve(req.result ?? []);
    req.onerror = () => reject(req.error);
  });
}

async function dbGetByIndex(store, indexName, key) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const os = tx.objectStore(store);
    const idx = os.index(indexName);
    const req = idx.getAll(key);
    req.onsuccess = () => resolve(req.result ?? []);
    req.onerror = () => reject(req.error);
  });
}

async function dbClear(store) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const os = tx.objectStore(store);
    const req = os.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function getAllBranches() {
  return dbGetAll(STORE_BRANCHES);
}

async function getBranch(id) {
  return dbGet(STORE_BRANCHES, id);
}

async function saveBranch(branch) {
  return dbPut(STORE_BRANCHES, branch);
}

async function deleteBranch(id) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_BRANCHES, STORE_COMMITS], 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);

    tx.objectStore(STORE_BRANCHES).delete(id);

    const commitStore = tx.objectStore(STORE_COMMITS);
    const idx = commitStore.index('branchId');
    const range = IDBKeyRange.only(id);
    const req = idx.openCursor(range);
    req.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        commitStore.delete(cursor.primaryKey);
        cursor.continue();
      }
    };
  });
}

async function getCommitsForBranch(branchId) {
  return dbGetByIndex(STORE_COMMITS, 'branchId', branchId);
}

async function saveCommit(commit) {
  return dbPut(STORE_COMMITS, commit);
}

async function deleteCommitsForBranch(branchId) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_COMMITS, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);

    const store = tx.objectStore(STORE_COMMITS);
    const idx = store.index('branchId');
    const range = IDBKeyRange.only(branchId);
    const req = idx.openCursor(range);
    req.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        store.delete(cursor.primaryKey);
        cursor.continue();
      }
    };
  });
}

async function getSettings() {
  const all = await dbGetAll(STORE_SETTINGS);
  const result = {};
  for (const row of all) {
    try {
      result[row.key] = row.value;
    } catch {
      result[row.key] = row.value;
    }
  }
  return result;
}

async function setSettings(key, value) {
  return dbPut(STORE_SETTINGS, { key, value });
}

const V1_STORAGE_KEY = 'djc-flow-writer-v1';
const MIGRATION_SETTINGS_KEY = 'migratedFromV1';

async function migrateFromV1() {
  const settings = await getSettings();
  const alreadyMigrated = settings[MIGRATION_SETTINGS_KEY] === true ||
                          settings[MIGRATION_SETTINGS_KEY] === 'true';
  if (alreadyMigrated) {
    const existing = await getAllBranches();
    const main = existing.find(b => b.id === 'main');
    if (main) return main;
  }

  let v1Raw = null;
  try {
    v1Raw = localStorage.getItem(V1_STORAGE_KEY);
  } catch {
    // localStorage may be disabled in private mode
  }

  if (v1Raw) {
    try {
      const v1 = JSON.parse(v1Raw);
      const docs = v1.docs || {};

      const tree = deepClone(DEFAULT_TREE);
      ensureDocKeysInTree(tree, Object.keys(docs));

      const mainBranch = {
        id: 'main',
        name: 'Main',
        parentId: null,
        forkedFromCommitId: null,
        createdAt: Date.now(),
        docs,
        tree,
        activeDocId: v1.docId || 'ch1',
        sceneGoals: {},
        manualTags: Array.isArray(v1.manualTags) ? [...v1.manualTags] : ['library', 'backstory', 'journal', 'setting', 'dialogue'],
        fmt: v1.fmt || { family: 'serif', size: 18, lh: 1.7, width: '720', flowDelay: 35 },
        metadata: {
          wordCount: countWordsV1(docs),
          lastModified: Date.now(),
          commitCount: 0,
        },
      };

      await saveBranch(mainBranch);

      const commit = {
        id: generateUUID(),
        branchId: 'main',
        message: 'Migrated from v1',
        timestamp: Date.now(),
        docId: mainBranch.activeDocId,
        docSnapshot: docs[mainBranch.activeDocId] ?? '',
        wordCount: mainBranch.metadata.wordCount,
        wordCountDelta: 0,
      };
      await saveCommit(commit);

      mainBranch.metadata.commitCount = 1;
      await saveBranch(mainBranch);

      await setSettings(MIGRATION_SETTINGS_KEY, true);

      return mainBranch;
    } catch (err) {
      console.warn('[db.js] Migration parse failed, falling back to default main:', err);
    }
  }

  return createDefaultMainBranch();
}

async function createDefaultMainBranch() {
  const mainBranch = {
    id: 'main',
    name: 'Main',
    parentId: null,
    forkedFromCommitId: null,
    createdAt: Date.now(),
    docs: deepClone(SEED_DOCS),
    tree: deepClone(DEFAULT_TREE),
    activeDocId: 'ch1',
    sceneGoals: {},
    manualTags: ['library', 'backstory', 'journal', 'setting', 'dialogue'],
    fmt: { family: 'serif', size: 18, lh: 1.7, width: '720', flowDelay: 35 },
    metadata: {
      wordCount: countWordsV1(SEED_DOCS),
      lastModified: Date.now(),
      commitCount: 0,
    },
  };

  await saveBranch(mainBranch);

  const commit = {
    id: generateUUID(),
    branchId: 'main',
    message: 'Initial seed',
    timestamp: Date.now(),
    docId: 'ch1',
    docSnapshot: SEED_DOCS.ch1,
    wordCount: mainBranch.metadata.wordCount,
    wordCountDelta: 0,
  };
  await saveCommit(commit);

  mainBranch.metadata.commitCount = 1;
  await saveBranch(mainBranch);

  await setSettings(MIGRATION_SETTINGS_KEY, true);

  return mainBranch;
}

function ensureDocKeysInTree(tree, docKeys) {
  const knownIds = collectTreeIds(tree);
  const missing = docKeys.filter(k => !knownIds.has(k));

  if (missing.length === 0) return;

  const importFolder = {
    id: 'folder-imported',
    type: 'folder',
    label: 'Imported',
    icon: 'folder',
    color: 'var(--fg-3)',
    children: missing.map((key, i) => ({
      id: key,
      type: 'doc',
      label: key,
      icon: 'doc',
      color: 'var(--accent-2)',
      order: i,
    })),
    expanded: true,
    order: tree.length,
  };
  tree.push(importFolder);
}

function collectTreeIds(nodes) {
  const ids = new Set();
  for (const n of nodes) {
    ids.add(n.id);
    if (n.children) {
      for (const id of collectTreeIds(n.children)) ids.add(id);
    }
  }
  return ids;
}

function countWordsV1(docs) {
  let total = 0;
  for (const text of Object.values(docs)) {
    total += text.trim().split(/\s+/).filter(Boolean).length;
  }
  return total;
}

function deepClone(obj) {
  if (typeof structuredClone === 'function') {
    return structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj));
}

export {
  initDB,
  dbGet,
  dbPut,
  dbDelete,
  dbGetAll,
  dbGetByIndex,
  dbClear,
  getAllBranches,
  getBranch,
  saveBranch,
  deleteBranch,
  getCommitsForBranch,
  saveCommit,
  deleteCommitsForBranch,
  getSettings,
  setSettings,
  migrateFromV1,
  createDefaultMainBranch,
  generateUUID,
  DEFAULT_TREE,
  SEED_DOCS,
  deepClone,
  STORE_IMAGES,
};
