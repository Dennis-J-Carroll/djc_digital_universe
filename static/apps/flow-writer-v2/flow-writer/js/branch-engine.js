/* ============================================================
   Flow Writer -- Branch Engine
   Runtime state management, branch CRUD, commits, tree, scene goals.
   Module-level variables (vanilla JS, not OOP).
   ============================================================ */

import {
  initDB,
  getAllBranches as dbGetAllBranches,
  getBranch,
  saveBranch,
  deleteBranch as dbDeleteBranch,
  getCommitsForBranch,
  saveCommit,
  deleteCommitsForBranch,
  getSettings,
  setSettings,
  migrateFromV1,
  generateUUID,
  DEFAULT_TREE,
  deepClone as dbDeepClone,
} from './db.js';

// ------------------------------------------------------------------
// Runtime State
// ------------------------------------------------------------------

/** @type {AppState} */
let _state = {
  activeBranchId: '',
  branches: [],
  commits: [],
  modes: { focus: false, typewriter: false, sceneCollapsed: false },
  branchGraph: { zoom: 1, panX: 0, panY: 0 },
};

// ------------------------------------------------------------------
// Editor reference (set externally by app.js / ui.js)
// ------------------------------------------------------------------

/** @type {HTMLTextAreaElement|null} */
let _editor = null;

/** @param {HTMLTextAreaElement} el */
export function setEditorRef(el) {
  _editor = el;
}

// ------------------------------------------------------------------
// 5.1  Engine Init
// ------------------------------------------------------------------

/**
 * Initialize the engine.
 * 1. Open IndexedDB
 * 2. Run migration from localStorage v1
 * 3. Load all branches
 * 4. Load settings (global modes)
 * 5. Set active branch to main (or first available)
 * 6. Load commits for active branch
 */
async function initEngine() {
  await initDB();

  const mainBranch = await migrateFromV1();

  const branches = await dbGetAllBranches();
  _state.branches = branches;

  const settings = await getSettings();
  if (settings.modes) {
    try {
      const parsed = typeof settings.modes === 'string' ? JSON.parse(settings.modes) : settings.modes;
      _state.modes = { ..._state.modes, ...parsed };
    } catch {
      // keep defaults
    }
  }

  const activeId = mainBranch ? mainBranch.id : (branches[0]?.id || 'main');
  _state.activeBranchId = activeId;

  if (mainBranch && !branches.find(b => b.id === 'main')) {
    _state.branches.push(mainBranch);
  }

  await _loadCommitsForActiveBranch();

  return _state;
}

/**
 * Load commits for the currently active branch into runtime state.
 */
async function _loadCommitsForActiveBranch() {
  if (!_state.activeBranchId) {
    _state.commits = [];
    return;
  }
  _state.commits = await getCommitsForBranch(_state.activeBranchId);
}

// ------------------------------------------------------------------
// 5.1  State Accessors
// ------------------------------------------------------------------

/** @returns {AppState} */
function getState() {
  return _state;
}

/** @returns {Branch|null} */
function getActiveBranch() {
  return _state.branches.find(b => b.id === _state.activeBranchId) || null;
}

/** @returns {Branch[]} */
function getAllBranches() {
  return _state.branches;
}

// ------------------------------------------------------------------
// 5.1  Branch CRUD
// ------------------------------------------------------------------

/**
 * Create a new branch.
 * - Sanitizes name to URL-safe id
 * - If parentId provided, deep-clones parent's docs/tree/fmt/manualTags
 * - Creates fork commit on parent
 * - Creates initial commit on new branch
 * - Saves to DB, updates runtime state
 * @param {string} name  Display name (e.g. "Dark Ending")
 * @param {string|null} parentId  Parent branch id (null for root)
 * @returns {Promise<Branch>}
 */
async function createBranch(name, parentId = null) {
  const id = sanitizeBranchName(name);
  const now = Date.now();

  // Check for duplicate id
  const existing = await getBranch(id);
  if (existing) {
    throw new Error(`Branch "${id}" already exists`);
  }

  let parentBranch = null;
  let forkCommitId = null;

  if (parentId) {
    parentBranch = await getBranch(parentId);
    if (!parentBranch) {
      throw new Error(`Parent branch "${parentId}" not found`);
    }
    forkCommitId = _getLatestCommitIdForBranch(parentId);
  }

  // Deep clone parent data, or use seed defaults
  const docs = parentBranch ? dbDeepClone(parentBranch.docs) : dbDeepClone(SEED_DOCS);
  const tree = parentBranch ? dbDeepClone(parentBranch.tree) : dbDeepClone(DEFAULT_TREE);
  const fmt = parentBranch ? dbDeepClone(parentBranch.fmt) : { family: 'serif', size: 18, lh: 1.7, width: '720', flowDelay: 35 };
  const manualTags = parentBranch ? [...parentBranch.manualTags] : ['library', 'backstory', 'journal', 'setting', 'dialogue'];

  // Determine active doc: inherit from parent, or default
  const activeDocId = parentBranch ? parentBranch.activeDocId : 'ch1';

  const newBranch = {
    id,
    name,
    parentId,
    forkedFromCommitId: forkCommitId,
    createdAt: now,
    docs,
    tree,
    activeDocId,
    sceneGoals: parentBranch ? dbDeepClone(parentBranch.sceneGoals) : {},
    manualTags,
    fmt,
    metadata: {
      wordCount: countWords(docs),
      lastModified: now,
      commitCount: 0,
    },
  };

  await saveBranch(newBranch);

  // Create fork commit on parent branch (if applicable)
  if (parentBranch) {
    const forkCommit = {
      id: generateUUID(),
      branchId: parentBranch.id,
      message: `Forked to ${name}`,
      timestamp: now,
      docId: activeDocId,
      docSnapshot: docs[activeDocId] ?? '',
      wordCount: newBranch.metadata.wordCount,
      wordCountDelta: 0,
    };
    await saveCommit(forkCommit);

    // Update parent branch commit count
    parentBranch.metadata.commitCount = (parentBranch.metadata.commitCount || 0) + 1;
    parentBranch.metadata.lastModified = now;
    await saveBranch(parentBranch);

    // Update runtime parent branch
    const rtParent = _state.branches.find(b => b.id === parentId);
    if (rtParent) {
      rtParent.metadata = { ...parentBranch.metadata };
    }
  }

  // Create initial commit on new branch
  const initialCommit = {
    id: generateUUID(),
    branchId: id,
    message: parentBranch ? `Branch created from ${parentBranch.name}` : 'Branch created',
    timestamp: now + 1, // +1ms to ensure ordering after fork commit
    docId: activeDocId,
    docSnapshot: docs[activeDocId] ?? '',
    wordCount: newBranch.metadata.wordCount,
    wordCountDelta: 0,
  };
  await saveCommit(initialCommit);

  newBranch.metadata.commitCount = 1;
  newBranch.metadata.lastModified = now + 1;
  await saveBranch(newBranch);

  // Update runtime state
  _state.branches.push(newBranch);

  return newBranch;
}

/**
 * Switch to a different branch.
 * 1. Save current doc content to current branch
 * 2. Set activeBranchId
 * 3. Load branch docs into editor (done by caller)
 * 4. Load commits for new branch
 * 5. Returns the switched-to branch
 * @param {string} branchId
 * @returns {Promise<Branch>}
 */
async function switchBranch(branchId) {
  // 1. Save current doc content
  await saveCurrentDoc();

  const target = await getBranch(branchId);
  if (!target) {
    throw new Error(`Branch "${branchId}" not found`);
  }

  // 2. Update active
  _state.activeBranchId = branchId;

  // 3. Refresh branches list (in case another tab changed something)
  _state.branches = await dbGetAllBranches();

  // 4. Load commits for new branch
  await _loadCommitsForActiveBranch();

  // Return the full branch from DB (most up-to-date)
  const freshTarget = _state.branches.find(b => b.id === branchId);
  return freshTarget || target;
}

/**
 * Rename a branch (display name only).
 * @param {string} branchId
 * @param {string} newName
 * @returns {Promise<Branch>}
 */
async function renameBranch(branchId, newName) {
  const branch = await getBranch(branchId);
  if (!branch) {
    throw new Error(`Branch "${branchId}" not found`);
  }

  branch.name = newName;
  branch.metadata.lastModified = Date.now();
  await saveBranch(branch);

  // Update runtime
  const rtBranch = _state.branches.find(b => b.id === branchId);
  if (rtBranch) {
    rtBranch.name = newName;
    rtBranch.metadata = { ...branch.metadata };
  }

  return branch;
}

/**
 * Delete a branch.
 * - Cannot delete 'main'
 * - Cannot delete branch with children (must delete/re-parent children first)
 * - Deletes branch + all its commits
 * - If deleting active branch, switches to 'main'
 * @param {string} branchId
 * @returns {Promise<void>}
 */
async function deleteBranch(branchId) {
  if (branchId === 'main') {
    throw new Error("Cannot delete the 'main' branch");
  }

  const branch = await getBranch(branchId);
  if (!branch) {
    throw new Error(`Branch "${branchId}" not found`);
  }

  // Check for children
  const allBranches = await dbGetAllBranches();
  const children = allBranches.filter(b => b.parentId === branchId);
  if (children.length > 0) {
    const childNames = children.map(c => c.name).join(', ');
    throw new Error(`Cannot delete branch "${branch.name}" because it has children: ${childNames}. Delete or re-parent them first.`);
  }

  // Delete from DB (cascades commits)
  await dbDeleteBranch(branchId);

  // If deleting active branch, switch to main
  if (_state.activeBranchId === branchId) {
    _state.activeBranchId = 'main';
    await _loadCommitsForActiveBranch();
  }

  // Update runtime
  _state.branches = _state.branches.filter(b => b.id !== branchId);
}

/**
 * Merge one branch into another (simple overwrite for Phase 1).
 * Confirmation is the caller's responsibility.
 * @param {string} fromBranchId
 * @param {string} intoBranchId
 * @returns {Promise<Branch>}
 */
async function mergeBranch(fromBranchId, intoBranchId) {
  if (fromBranchId === intoBranchId) {
    throw new Error('Cannot merge a branch into itself');
  }

  const fromBranch = await getBranch(fromBranchId);
  const intoBranch = await getBranch(intoBranchId);

  if (!fromBranch) throw new Error(`Source branch "${fromBranchId}" not found`);
  if (!intoBranch) throw new Error(`Target branch "${intoBranchId}" not found`);

  // Simple overwrite: copy all docs from fromBranch into intoBranch
  for (const [docId, text] of Object.entries(fromBranch.docs)) {
    intoBranch.docs[docId] = text;
  }

  // Merge tree: for Phase 1, overwrite the target tree with source tree
  intoBranch.tree = dbDeepClone(fromBranch.tree);

  // Update metadata
  intoBranch.metadata.wordCount = countWords(intoBranch.docs);
  intoBranch.metadata.lastModified = Date.now();

  // Create merge commit on target
  const mergeCommit = {
    id: generateUUID(),
    branchId: intoBranchId,
    message: `Merged ${fromBranch.name} into ${intoBranch.name}`,
    timestamp: Date.now(),
    docId: intoBranch.activeDocId,
    docSnapshot: intoBranch.docs[intoBranch.activeDocId] ?? '',
    wordCount: intoBranch.metadata.wordCount,
    wordCountDelta: 0,
  };
  await saveCommit(mergeCommit);

  intoBranch.metadata.commitCount = (intoBranch.metadata.commitCount || 0) + 1;
  await saveBranch(intoBranch);

  // Update runtime
  const rtInto = _state.branches.find(b => b.id === intoBranchId);
  if (rtInto) {
    Object.assign(rtInto, intoBranch);
  }

  // Refresh commits if intoBranch is active
  if (_state.activeBranchId === intoBranchId) {
    await _loadCommitsForActiveBranch();
  }

  return intoBranch;
}

// ------------------------------------------------------------------
// 5.1  Commits
// ------------------------------------------------------------------

/**
 * Create a commit on the active branch.
 * @param {string} message  Commit message
 * @param {string} docId    Primary doc that triggered the commit
 * @returns {Promise<Commit>}
 */
async function createCommit(message, docId) {
  const branch = getActiveBranch();
  if (!branch) {
    throw new Error('No active branch');
  }

  const docText = _editor ? _editor.value : (branch.docs[docId] ?? '');
  const wordCount = countWords(branch.docs);

  // Calculate delta from previous commit
  const previousCommits = _state.commits;
  const prevCommit = previousCommits.length > 0
    ? previousCommits[previousCommits.length - 1]
    : null;
  const wordCountDelta = prevCommit ? wordCount - prevCommit.wordCount : 0;

  const commit = {
    id: generateUUID(),
    branchId: branch.id,
    message,
    timestamp: Date.now(),
    docId,
    docSnapshot: branch.docs[docId] ?? '',
    wordCount,
    wordCountDelta,
  };

  await saveCommit(commit);

  // Update branch metadata
  branch.metadata.commitCount = (branch.metadata.commitCount || 0) + 1;
  branch.metadata.lastModified = commit.timestamp;
  await saveBranch(branch);

  // Update runtime
  _state.commits.push(commit);

  return commit;
}

/**
 * Get commit history for a branch, sorted by timestamp desc.
 * @param {string} branchId
 * @returns {Promise<Commit[]>}
 */
async function getCommitHistory(branchId) {
  const commits = await getCommitsForBranch(branchId);
  return commits.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Restore a commit's docSnapshot into the active branch's current doc.
 * @param {string} commitId
 * @returns {Promise<{docId: string, text: string}>}
 */
async function restoreCommit(commitId) {
  const branch = getActiveBranch();
  if (!branch) throw new Error('No active branch');

  const { dbGet } = await import('./db.js');
  const commit = await dbGet('commits', commitId);
  if (!commit) throw new Error(`Commit "${commitId}" not found`);
  if (commit.branchId !== branch.id) {
    throw new Error(`Commit "${commitId}" belongs to a different branch`);
  }

  // Restore the snapshot
  branch.docs[commit.docId] = commit.docSnapshot;
  branch.metadata.lastModified = Date.now();
  branch.metadata.wordCount = countWords(branch.docs);
  await saveBranch(branch);

  // If this is the current doc, update editor
  if (_editor && branch.activeDocId === commit.docId) {
    _editor.value = commit.docSnapshot;
  }

  return { docId: commit.docId, text: commit.docSnapshot };
}

// ------------------------------------------------------------------
// 5.1  Document Operations
// ------------------------------------------------------------------

/**
 * Save the current editor content to the active branch's active doc.
 * Persists to IndexedDB.
 * @returns {Promise<void>}
 */
async function saveCurrentDoc() {
  const branch = getActiveBranch();
  if (!branch || !_editor) return;

  const text = _editor.value;
  branch.docs[branch.activeDocId] = text;
  branch.metadata.wordCount = countWords(branch.docs);
  branch.metadata.lastModified = Date.now();

  await saveBranch(branch);
}

/**
 * Switch the active document within the current branch.
 * 1. Save current doc content
 * 2. Set activeBranch.activeDocId
 * 3. Return new doc content
 * @param {string} docId
 * @returns {Promise<string>}
 */
async function switchDoc(docId) {
  const branch = getActiveBranch();
  if (!branch) throw new Error('No active branch');

  // 1. Save current
  await saveCurrentDoc();

  // 2. Switch active doc
  branch.activeDocId = docId;

  // Ensure doc exists (auto-create empty)
  if (!(docId in branch.docs)) {
    branch.docs[docId] = '';
  }

  branch.metadata.lastModified = Date.now();
  await saveBranch(branch);

  // Update editor
  if (_editor) {
    _editor.value = branch.docs[docId] ?? '';
  }

  return branch.docs[docId] ?? '';
}

// ------------------------------------------------------------------
// 5.1  Tree CRUD
// ------------------------------------------------------------------

/**
 * Find a node in the tree by id (recursive).
 * @param {TreeNode[]} nodes
 * @param {string} nodeId
 * @returns {{node: TreeNode, parent: TreeNode[]|null, index: number}|null}
 */
function _findNodeInTree(nodes, nodeId) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === nodeId) {
      return { node: nodes[i], parent: nodes, index: i };
    }
    if (nodes[i].children) {
      const found = _findNodeInTree(nodes[i].children, nodeId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Add a new tree node.
 * @param {string|null} parentId  Parent folder id, or null for root
 * @param {TreeNode} node         The node to add
 * @returns {Promise<TreeNode>}
 */
async function addTreeNode(parentId, node) {
  const branch = getActiveBranch();
  if (!branch) throw new Error('No active branch');

  const tree = branch.tree;

  if (parentId) {
    const found = _findNodeInTree(tree, parentId);
    if (!found) throw new Error(`Parent node "${parentId}" not found`);
    if (found.node.type !== 'folder') {
      throw new Error(`Node "${parentId}" is not a folder`);
    }
    if (!found.node.children) found.node.children = [];
    node.order = found.node.children.length;
    found.node.children.push(node);
  } else {
    node.order = tree.length;
    tree.push(node);
  }

  // If it's a doc, ensure a doc slot exists
  if (node.type === 'doc' || node.type === 'note' || node.type === 'character' || node.type === 'location') {
    if (!(node.id in branch.docs)) {
      branch.docs[node.id] = '';
    }
  }

  branch.metadata.lastModified = Date.now();
  await saveBranch(branch);
  return node;
}

/**
 * Rename a tree node's label.
 * @param {string} nodeId
 * @param {string} newLabel
 * @returns {Promise<TreeNode>}
 */
async function renameTreeNode(nodeId, newLabel) {
  const branch = getActiveBranch();
  if (!branch) throw new Error('No active branch');

  const found = _findNodeInTree(branch.tree, nodeId);
  if (!found) throw new Error(`Node "${nodeId}" not found`);

  found.node.label = newLabel;
  branch.metadata.lastModified = Date.now();
  await saveBranch(branch);
  return found.node;
}

/**
 * Delete a tree node and its children.
 * Also removes associated doc content.
 * @param {string} nodeId
 * @returns {Promise<void>}
 */
async function deleteTreeNode(nodeId) {
  const branch = getActiveBranch();
  if (!branch) throw new Error('No active branch');

  // Cannot delete if it's the only remaining doc and we're on it
  // But allow it -- the doc just becomes orphaned until user switches

  const result = _removeNodeRecursive(branch.tree, nodeId);
  if (!result.removed) throw new Error(`Node "${nodeId}" not found`);

  // Clean up docs for all removed node ids
  for (const removedId of result.removedIds) {
    delete branch.docs[removedId];
    delete branch.sceneGoals[removedId];
  }

  branch.metadata.wordCount = countWords(branch.docs);
  branch.metadata.lastModified = Date.now();
  await saveBranch(branch);
}

/**
 * Recursively remove a node and collect all removed ids.
 * @param {TreeNode[]} nodes
 * @param {string} nodeId
 * @returns {{removed: boolean, removedIds: string[]}}
 */
function _removeNodeRecursive(nodes, nodeId) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === nodeId) {
      const removedIds = _collectIds(nodes[i]);
      nodes.splice(i, 1);
      return { removed: true, removedIds };
    }
    if (nodes[i].children) {
      const result = _removeNodeRecursive(nodes[i].children, nodeId);
      if (result.removed) return result;
    }
  }
  return { removed: false, removedIds: [] };
}

/**
 * Collect all ids from a node (recursively).
 * @param {TreeNode} node
 * @returns {string[]}
 */
function _collectIds(node) {
  const ids = [node.id];
  if (node.children) {
    for (const child of node.children) {
      ids.push(..._collectIds(child));
    }
  }
  return ids;
}

/**
 * Move a tree node to a new parent folder and/or new order position.
 * @param {string} nodeId
 * @param {string|null} newParentId  New parent folder id, or null for root
 * @param {number} newOrder          New order index within the parent
 * @returns {Promise<TreeNode>}
 */
async function moveTreeNode(nodeId, newParentId, newOrder) {
  const branch = getActiveBranch();
  if (!branch) throw new Error('No active branch');

  // Step 1: Find the node BEFORE removing it
  const found = _findNodeInTree(branch.tree, nodeId);
  if (!found) throw new Error(`Node "${nodeId}" not found`);

  // Step 2: Deep-clone the node (so we can re-insert it)
  const nodeToMove = dbDeepClone(found.node);

  // Step 3: Check for cycles (can't move a folder into its own descendant)
  if (newParentId) {
    const descendantIds = _collectIds(nodeToMove);
    if (descendantIds.includes(newParentId)) {
      throw new Error('Cannot move a folder into its own descendant');
    }
  }

  // Step 4: Remove from current location
  const removed = _removeNodeRecursive(branch.tree, nodeId);
  if (!removed.removed) throw new Error(`Node "${nodeId}" could not be removed`);

  // Step 5: Insert at new location
  if (newParentId) {
    const parentFound = _findNodeInTree(branch.tree, newParentId);
    if (!parentFound) throw new Error(`Parent "${newParentId}" not found`);
    if (parentFound.node.type !== 'folder') throw new Error(`"${newParentId}" is not a folder`);
    if (!parentFound.node.children) parentFound.node.children = [];

    const clampedOrder = Math.max(0, Math.min(newOrder, parentFound.node.children.length));
    nodeToMove.order = clampedOrder;
    parentFound.node.children.splice(clampedOrder, 0, nodeToMove);
    // Re-order siblings
    parentFound.node.children.forEach((n, i) => { n.order = i; });
  } else {
    const clampedOrder = Math.max(0, Math.min(newOrder, branch.tree.length));
    nodeToMove.order = clampedOrder;
    branch.tree.splice(clampedOrder, 0, nodeToMove);
    branch.tree.forEach((n, i) => { n.order = i; });
  }

  branch.metadata.lastModified = Date.now();
  await saveBranch(branch);

  return nodeToMove;
}

/**
 * Toggle a folder's expanded/collapsed state.
 * @param {string} folderId
 * @returns {Promise<boolean>}  New expanded state
 */
async function toggleFolderExpanded(folderId) {
  const branch = getActiveBranch();
  if (!branch) throw new Error('No active branch');

  const found = _findNodeInTree(branch.tree, folderId);
  if (!found) throw new Error(`Folder "${folderId}" not found`);
  if (found.node.type !== 'folder') throw new Error(`"${folderId}" is not a folder`);

  found.node.expanded = !found.node.expanded;
  await saveBranch(branch);
  return found.node.expanded;
}

// ------------------------------------------------------------------
// 5.1  Scene Goals
// ------------------------------------------------------------------

/**
 * Set (or update) a scene goal for a doc.
 * @param {string} docId
 * @param {string} text
 * @param {string} source
 * @returns {Promise<SceneGoal>}
 */
async function setSceneGoal(docId, text, source) {
  const branch = getActiveBranch();
  if (!branch) throw new Error('No active branch');

  const existing = branch.sceneGoals[docId];
  const goal = {
    id: existing?.id || generateUUID(),
    docId,
    text,
    source: source || existing?.source || '',
    pinned: existing?.pinned ?? false,
    completed: false,
    createdAt: existing?.createdAt || Date.now(),
  };

  branch.sceneGoals[docId] = goal;
  branch.metadata.lastModified = Date.now();
  await saveBranch(branch);
  return goal;
}

/**
 * Toggle pinned state of a scene goal.
 * @param {string} docId
 * @returns {Promise<boolean>}
 */
async function toggleSceneGoalPinned(docId) {
  const branch = getActiveBranch();
  if (!branch) throw new Error('No active branch');

  const goal = branch.sceneGoals[docId];
  if (!goal) throw new Error(`No scene goal for doc "${docId}"`);

  goal.pinned = !goal.pinned;
  branch.metadata.lastModified = Date.now();
  await saveBranch(branch);
  return goal.pinned;
}

/**
 * Mark a scene goal as completed.
 * @param {string} docId
 * @returns {Promise<SceneGoal>}
 */
async function completeSceneGoal(docId) {
  const branch = getActiveBranch();
  if (!branch) throw new Error('No active branch');

  const goal = branch.sceneGoals[docId];
  if (!goal) throw new Error(`No scene goal for doc "${docId}"`);

  goal.completed = true;
  branch.metadata.lastModified = Date.now();
  await saveBranch(branch);
  return goal;
}

/**
 * Get a scene goal for a doc.
 * @param {string} docId
 * @returns {SceneGoal|null}
 */
function getSceneGoal(docId) {
  const branch = getActiveBranch();
  if (!branch) return null;
  return branch.sceneGoals[docId] || null;
}

// ------------------------------------------------------------------
// 5.2  Helpers
// ------------------------------------------------------------------

/**
 * Generate a unique id.
 * @returns {string}
 */
function generateId() {
  return generateUUID();
}

/**
 * Sanitize a display name into a URL-safe branch id.
 * @param {string} name
 * @returns {string}
 */
function sanitizeBranchName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Deep-clone an object.
 * @param {any} obj
 * @returns {any}
 */
function deepClone(obj) {
  if (typeof structuredClone === 'function') {
    return structuredClone(obj);
  }
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Count words in a text.
 * @param {string} text
 * @returns {number}
 */
function countWords(text) {
  if (typeof text === 'object' && text !== null) {
    // If passed a docs record, count all words
    let total = 0;
    for (const t of Object.values(text)) {
      total += t.trim().split(/\s+/).filter(Boolean).length;
    }
    return total;
  }
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ------------------------------------------------------------------
// Internal helpers
// ------------------------------------------------------------------

/**
 * Get the latest commit id for a branch.
 * @param {string} branchId
 * @returns {string|null}
 */
function _getLatestCommitIdForBranch(branchId) {
  const branchCommits = _state.commits.filter(c => c.branchId === branchId);
  if (branchCommits.length === 0) return null;
  branchCommits.sort((a, b) => b.timestamp - a.timestamp);
  return branchCommits[0].id;
}

/**
 * Update global modes (called by UI layer).
 * @param {{focus?: boolean, typewriter?: boolean, sceneCollapsed?: boolean}} modes
 */
async function updateModes(modes) {
  _state.modes = { ..._state.modes, ...modes };
  await setSettings('modes', JSON.stringify(_state.modes));
}

/**
 * Get global modes.
 * @returns {{focus: boolean, typewriter: boolean, sceneCollapsed: boolean}}
 */
function getModes() {
  return _state.modes;
}

// ------------------------------------------------------------------
// Branch Comparison
// ------------------------------------------------------------------

/**
 * Get document content from any branch.
 * @param {string} branchId
 * @param {string} docId
 * @returns {Promise<string>}
 */
export async function getBranchDoc(branchId, docId) {
  const branch = await getBranch(branchId);
  return branch?.docs?.[docId] ?? '';
}

/**
 * Compare two branches for a specific document.
 * @param {Branch} branchA
 * @param {Branch} branchB
 * @param {string} docId
 * @returns {{identical: boolean, wordsA: number, wordsB: number, diff: number}}
 */
export function compareBranchDocs(branchA, branchB, docId) {
  const textA = branchA?.docs?.[docId] ?? '';
  const textB = branchB?.docs?.[docId] ?? '';
  const wordsA = countWords(textA);
  const wordsB = countWords(textB);
  return {
    identical: textA === textB,
    wordsA,
    wordsB,
    diff: wordsB - wordsA,
  };
}

/**
 * Copy a document from one branch to another.
 * @param {string} fromBranchId
 * @param {string} toBranchId
 * @param {string} docId
 * @returns {Promise<boolean>}
 */
export async function copyDocBetweenBranches(fromBranchId, toBranchId, docId) {
  const fromBranch = await getBranch(fromBranchId);
  if (!fromBranch || !fromBranch.docs[docId]) return false;

  const toBranch = await getBranch(toBranchId);
  if (!toBranch) return false;

  toBranch.docs[docId] = dbDeepClone(fromBranch.docs[docId]);
  toBranch.metadata.lastModified = Date.now();
  toBranch.metadata.wordCount = countWords(toBranch.docs);
  await saveBranch(toBranch);

  // Create a commit recording the copy
  const commit = {
    id: generateUUID(),
    branchId: toBranchId,
    message: `Copied ${docId} from ${fromBranchId}`,
    timestamp: Date.now(),
    docId,
    docSnapshot: toBranch.docs[docId],
    wordCount: toBranch.metadata.wordCount,
    wordCountDelta: 0,
  };
  await saveCommit(commit);
  return true;
}

// ------------------------------------------------------------------
// Cross-Branch Search
// ------------------------------------------------------------------

export async function searchAcrossBranches(query) {
  if (!query || query.trim().length < 2) return [];

  const q = query.toLowerCase().trim();
  const branches = getAllBranches();
  const results = [];

  for (const branch of branches) {
    for (const [docId, content] of Object.entries(branch.docs || {})) {
      const text = content || '';
      const lowerText = text.toLowerCase();
      let index = lowerText.indexOf(q);

      while (index !== -1) {
        // Find node label
        const node = findNodeInTree(branch.tree, docId);
        const label = node?.label || docId;

        // Build snippet
        const contextStart = Math.max(0, index - 50);
        const contextEnd = Math.min(text.length, index + q.length + 50);
        const before = text.slice(contextStart, index);
        const match = text.slice(index, index + q.length);
        const after = text.slice(index + q.length, contextEnd);

        results.push({
          branchId: branch.id,
          branchName: branch.name,
          docId,
          docLabel: label,
          snippet: `${before}<mark>${match}</mark>${after}`,
          matchIndex: index,
        });

        // Find next occurrence
        index = lowerText.indexOf(q, index + 1);

        // Limit to 3 matches per document
        const docMatches = results.filter(r => r.docId === docId && r.branchId === branch.id);
        if (docMatches.length >= 3) break;
      }
    }
  }

  return results;
}

function findNodeInTree(tree, nodeId) {
  for (const node of tree || []) {
    if (node.id === nodeId) return node;
    if (node.children) {
      const found = findNodeInTree(node.children, nodeId);
      if (found) return found;
    }
  }
  return null;
}

// ------------------------------------------------------------------
// Exports
// ------------------------------------------------------------------

export {
  initEngine,
  getState,
  getActiveBranch,
  getAllBranches,
  createBranch,
  switchBranch,
  renameBranch,
  deleteBranch,
  mergeBranch,
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
  toggleSceneGoalPinned,
  completeSceneGoal,
  getSceneGoal,
  generateId,
  sanitizeBranchName,
  deepClone,
  countWords,
  updateModes,
  getModes,
};
