/**
 * SVG Branch Graph Visualization
 * Flow Writer — Phase 1
 *
 * Renders an interactive SVG graph of branches and commits.
 * Time flows horizontally, branches are laid out in vertical lanes.
 *
 * Exports: renderBranchGraph, computeGraphLayout, panGraph, zoomGraph, resetView
 */

// ============================================================
// CONSTANTS
// ============================================================

// Pyramid layout — time flows TOP → BOTTOM, branches spread LEFT → RIGHT
const NODE_SPACING_Y = 44;                      // Vertical pixels between commits
const LANE_WIDTH    = 44;                       // Horizontal pixels per branch lane
const NODE_RADIUS   = 4;                        // Regular commit node radius
const HEAD_RADIUS   = 6;                        // Head commit node radius
const TOP_PADDING   = 32;                       // Top padding (room for lane labels)
const LEFT_PADDING  = 20;                       // Left padding
const RIGHT_PADDING = 90;                       // Right padding for head labels
const BOTTOM_PADDING = 24;                      // Bottom padding
const MIN_SVG_HEIGHT = 200;                     // Minimum SVG height in px
const ZOOM_MIN = 0.3;                           // Minimum zoom scale
const ZOOM_MAX = 3.0;                           // Maximum zoom scale

// Branch color palette (teal spectrum)
const BRANCH_COLORS = [
  '#14b89a',  // teal-500 (main)
  '#2dc7a6',  // teal-400 (branch-1)
  '#44d6b8',  // teal-300 (branch-2)
  '#3ef0e2',  // electric-cyan (branch-3)
  '#7ce5cf',  // teal-200 (branch-4)
  '#0fa387',  // teal-600 (branch-5)
];

// ============================================================
// MODULE STATE
// ============================================================

/** @type {Map<SVGSVGElement, ViewState>} */
const viewStates = new Map();

/**
 * @typedef {Object} ViewState
 * @property {number} zoom - Current zoom scale
 * @property {number} panX - Horizontal pan offset (in viewBox units)
 * @property {number} panY - Vertical pan offset (in viewBox units)
 * @property {boolean} isPanning - Whether the user is currently panning
 * @property {number} panStartGraphX - Graph X coord under cursor at pan start
 * @property {number} panStartGraphY - Graph Y coord under cursor at pan start
 * @property {number} panStartViewX - View panX at pan start
 * @property {number} panStartViewY - View panY at pan start
 * @property {number} containerWidth - Container width in pixels
 * @property {number} containerHeight - Container height in pixels
 * @property {string|null} activeBranchId - Currently active branch
 */

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get or create the view state for an SVG element.
 * @param {SVGSVGElement} svgElement
 * @returns {ViewState}
 */
function getViewState(svgElement) {
  if (!viewStates.has(svgElement)) {
    const rect = svgElement.getBoundingClientRect();
    viewStates.set(svgElement, {
      zoom: 1,
      panX: 0,
      panY: 0,
      isPanning: false,
      panStartGraphX: 0,
      panStartGraphY: 0,
      panStartViewX: 0,
      panStartViewY: 0,
      containerWidth: rect.width,
      containerHeight: rect.height,
      activeBranchId: null,
    });
  }
  return viewStates.get(svgElement);
}

/**
 * Get a branch color based on its index in the branch order.
 * @param {number} index
 * @returns {string}
 */
function getBranchColor(index) {
  if (index >= 0 && index < BRANCH_COLORS.length) {
    return BRANCH_COLORS[index];
  }
  // Cycle through with slight hue shifts for branches beyond the palette
  const baseIndex = index % BRANCH_COLORS.length;
  return BRANCH_COLORS[baseIndex];
}

/**
 * Format a relative time string (e.g. "2m ago", "1h ago").
 * @param {number} timestamp
 * @returns {string}
 */
function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

/**
 * Create an SVG element with the given namespace-qualified name.
 * @param {string} tag
 * @returns {SVGElement}
 */
function svgEl(tag) {
  return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

// ============================================================
// LAYOUT ALGORITHM
// ============================================================

/**
 * Compute the full graph layout from branches and commits.
 *
 * @param {Array<Branch>} branches
 * @param {Array<Commit>} commits
 * @param {Object} [options]
 * @param {number} [options.pixelsPerMs]
 * @returns {{ nodes: GraphNode[], edges: GraphEdge[], branchLanes: BranchLane[], viewBox: { width: number, height: number, minTime: number } }}
 */
function computeGraphLayout(branches, commits, options = {}) {
  // Edge case: empty graph
  if (!branches || branches.length === 0 || !commits || commits.length === 0) {
    return {
      nodes: [],
      edges: [],
      branchLanes: [],
      viewBox: { width: 200, height: MIN_SVG_HEIGHT, minTime: 0 },
    };
  }

  // Sort branches: main first, then by creation time
  const sortedBranches = [...branches].sort((a, b) => {
    if (a.id === 'main') return -1;
    if (b.id === 'main') return 1;
    return a.createdAt - b.createdAt;
  });

  // Sort commits by timestamp
  const sortedCommits = [...commits].sort((a, b) => a.timestamp - b.timestamp);

  // --- Tree-aware lane allocation ---
  // Build branch tree structure
  const branchTree = new Map(); // branchId -> { branch, children: [], parent: null, depth: 0 }
  for (const branch of sortedBranches) {
    branchTree.set(branch.id, { branch, children: [], parent: null, depth: 0 });
  }
  for (const branch of sortedBranches) {
    if (branch.parentId && branchTree.has(branch.parentId)) {
      const parent = branchTree.get(branch.parentId);
      const child = branchTree.get(branch.id);
      parent.children.push(child);
      child.parent = parent;
      child.depth = parent.depth + 1;
    }
  }

  // Find root branches (no parent)
  const rootBranches = sortedBranches.filter(b => !b.parentId);

  // Assign lanes using tree-spread algorithm
  // Root branches get center lanes, children spread outward
  /** @type {Map<string, number>} branchId -> laneIndex */
  const branchToLane = new Map();
  /** @type {BranchLane[]} */
  const branchLanes = [];

  function assignLanes(node, startLane) {
    const children = node.children;
    if (children.length === 0) {
      branchToLane.set(node.branch.id, startLane);
      branchLanes.push({ branch: node.branch, lane: startLane });
      return;
    }

    // Place this branch
    branchToLane.set(node.branch.id, startLane);
    branchLanes.push({ branch: node.branch, lane: startLane });

    // Spread children outward
    children.forEach((child, i) => {
      const offset = i - (children.length - 1) / 2;
      assignLanes(child, startLane + Math.round(offset * 2));
    });
  }

  // Start with root branches centered
  rootBranches.forEach((root, i) => {
    const rootNode = branchTree.get(root.id);
    const centerOffset = Math.round((i - (rootBranches.length - 1) / 2) * 3);
    assignLanes(rootNode, centerOffset);
  });

  // Normalize lanes to start from 0
  const minLane = Math.min(...branchToLane.values(), 0);
  for (const [branchId, lane] of branchToLane) {
    branchToLane.set(branchId, lane - minLane);
  }
  for (const bl of branchLanes) {
    bl.lane -= minLane;
  }

  // Build BranchLane objects (replace temporary objects)
  // Rebuild from sortedBranches to ensure correct order and use proper objects
  branchLanes.length = 0;
  for (let i = 0; i < sortedBranches.length; i++) {
    const branch = sortedBranches[i];
    const laneIndex = branchToLane.get(branch.id) ?? 0;
    branchLanes.push({
      branchId: branch.id,
      laneIndex,
      color: getBranchColor(branchLanes.length),
    });
  }

  // Update colors to match lane order, not creation order
  // Re-sort branchLanes by laneIndex for color assignment
  branchLanes.sort((a, b) => a.laneIndex - b.laneIndex);
  // Reassign colors based on lane position (main = lane 0 = teal-500)
  const colorMap = new Map(); // branchId -> color
  for (let i = 0; i < branchLanes.length; i++) {
    branchLanes[i].color = getBranchColor(i);
    colorMap.set(branchLanes[i].branchId, branchLanes[i].color);
  }
  // Sort back to original branch order
  branchLanes.sort((a, b) => {
    const aIdx = sortedBranches.findIndex(br => br.id === a.branchId);
    const bIdx = sortedBranches.findIndex(br => br.id === b.branchId);
    return aIdx - bIdx;
  });

  // --- Build nodes — PYRAMID layout: Y = time index (top→bottom), X = lane (left→right) ---
  // Global commit index for uniform row spacing
  const commitGlobalIndex = new Map();
  sortedCommits.forEach((c, i) => commitGlobalIndex.set(c.id, i));

  // Find head commit for each branch
  /** @type {Map<string, Commit>} branchId -> latest commit */
  const branchHeads = new Map();
  for (const commit of sortedCommits) {
    const existing = branchHeads.get(commit.branchId);
    if (!existing || commit.timestamp > existing.timestamp) {
      branchHeads.set(commit.branchId, commit);
    }
  }

  /** @type {GraphNode[]} */
  const nodes = [];
  /** @type {Map<string, GraphNode>} commitId -> node */
  const nodeByCommitId = new Map();

  for (const commit of sortedCommits) {
    const branch = sortedBranches.find(b => b.id === commit.branchId);
    if (!branch) continue;

    const laneIndex   = branchToLane.get(commit.branchId) ?? 0;
    const globalIdx   = commitGlobalIndex.get(commit.id) ?? 0;
    // X = lane column, Y = time row (oldest at top → newest at bottom)
    const x = LEFT_PADDING + laneIndex * LANE_WIDTH + LANE_WIDTH / 2;
    const y = TOP_PADDING  + globalIdx * NODE_SPACING_Y;
    const isHead = branchHeads.get(commit.branchId)?.id === commit.id;

    /** @type {GraphNode} */
    const node = { id: commit.id, x, y, commit, branch, isHead };
    nodes.push(node);
    nodeByCommitId.set(commit.id, node);
  }

  // --- Build edges ---
  /** @type {GraphEdge[]} */
  const edges = [];

  // Commit-to-commit edges (sequential within each branch — vertical lines)
  for (const branch of sortedBranches) {
    const branchCommits = sortedCommits
      .filter(c => c.branchId === branch.id)
      .sort((a, b) => a.timestamp - b.timestamp);

    for (let i = 1; i < branchCommits.length; i++) {
      const fromNode = nodeByCommitId.get(branchCommits[i - 1].id);
      const toNode   = nodeByCommitId.get(branchCommits[i].id);
      if (fromNode && toNode) {
        edges.push({ from: { x: fromNode.x, y: fromNode.y }, to: { x: toNode.x, y: toNode.y }, type: 'commit' });
      }
    }
  }

  // Fork edges: curved path from parent commit → first child commit
  for (const branch of sortedBranches) {
    if (!branch.parentId) continue;
    const branchCommits = sortedCommits
      .filter(c => c.branchId === branch.id)
      .sort((a, b) => a.timestamp - b.timestamp);
    if (branchCommits.length === 0) continue;

    const firstChildCommit = branchCommits[0];
    const forkCommitId = branch.forkedFromCommitId;

    let fromNode;
    if (forkCommitId && nodeByCommitId.has(forkCommitId)) {
      fromNode = nodeByCommitId.get(forkCommitId);
    } else {
      const parentCommits = sortedCommits
        .filter(c => c.branchId === branch.parentId && c.timestamp <= firstChildCommit.timestamp)
        .sort((a, b) => a.timestamp - b.timestamp);
      if (parentCommits.length > 0) {
        fromNode = nodeByCommitId.get(parentCommits[parentCommits.length - 1].id);
      }
    }

    const toNode = nodeByCommitId.get(firstChildCommit.id);
    if (fromNode && toNode) {
      edges.push({ from: { x: fromNode.x, y: fromNode.y }, to: { x: toNode.x, y: toNode.y }, type: 'fork' });
    }
  }

  // Compute viewBox — width = lanes, height = commit rows
  const numLanes  = Math.max(...branchToLane.values(), 0) + 1;
  const graphWidth  = LEFT_PADDING + numLanes * LANE_WIDTH + RIGHT_PADDING;
  const graphHeight = Math.max(MIN_SVG_HEIGHT, TOP_PADDING + sortedCommits.length * NODE_SPACING_Y + BOTTOM_PADDING);

  return {
    nodes,
    edges,
    branchLanes,
    viewBox: {
      width:   Math.max(graphWidth, 200),
      height:  graphHeight,
      minTime: sortedCommits[0]?.timestamp ?? 0,
    },
  };
}

// ============================================================
// RENDERING
// ============================================================

// Store last layout so maximize can access it
let _lastLayout = null;
let _lastActiveBranchId = null;

/**
 * Render the branch graph into the given SVG element.
 */
function renderBranchGraph(svgElement, layout, activeBranchId = null) {
  const { nodes, edges, branchLanes, viewBox } = layout;
  const state = getViewState(svgElement);
  state.activeBranchId = activeBranchId;
  _lastLayout = layout;
  _lastActiveBranchId = activeBranchId;

  // Clear existing content
  while (svgElement.firstChild) svgElement.removeChild(svgElement.firstChild);

  svgElement.setAttribute('viewBox', `0 0 ${viewBox.width} ${viewBox.height}`);
  svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svgElement.style.minHeight = `${Math.max(MIN_SVG_HEIGHT, viewBox.height)}px`;

  const viewport = svgEl('g');
  viewport.setAttribute('class', 'viewport');
  viewport.setAttribute('data-viewport', 'true');
  svgElement.appendChild(viewport);

  // Defs — glow filter
  const defs = svgEl('defs');
  const glowFilter = svgEl('filter');
  glowFilter.setAttribute('id', 'branch-glow');
  glowFilter.setAttribute('x', '-50%'); glowFilter.setAttribute('y', '-50%');
  glowFilter.setAttribute('width', '200%'); glowFilter.setAttribute('height', '200%');
  const feGaussian = svgEl('feGaussianBlur');
  feGaussian.setAttribute('stdDeviation', '3'); feGaussian.setAttribute('result', 'blur');
  glowFilter.appendChild(feGaussian);
  const feMerge = svgEl('feMerge');
  [svgEl('feMergeNode'), svgEl('feMergeNode')].forEach((n, i) => {
    n.setAttribute('in', i === 0 ? 'blur' : 'SourceGraphic');
    feMerge.appendChild(n);
  });
  glowFilter.appendChild(feMerge);
  defs.appendChild(glowFilter);
  svgElement.appendChild(defs);

  // Empty state
  if (nodes.length === 0) {
    const placeholder = svgEl('text');
    placeholder.setAttribute('x', viewBox.width / 2);
    placeholder.setAttribute('y', viewBox.height / 2);
    placeholder.setAttribute('text-anchor', 'middle');
    placeholder.setAttribute('dominant-baseline', 'middle');
    placeholder.setAttribute('class', 'graph-placeholder');
    placeholder.textContent = 'No commits yet. Save a snapshot to begin.';
    viewport.appendChild(placeholder);
    applyTransform(svgElement);
    attachInteractionHandlers(svgElement);
    return;
  }

  // Color map
  const colorMap = new Map();
  for (const bl of branchLanes) colorMap.set(bl.branchId, bl.color);

  // ── Lane guide lines (subtle vertical tracks) ──
  const lanesGroup = svgEl('g');
  lanesGroup.setAttribute('class', 'lanes-group');
  const uniqueLanes = [...new Set(nodes.map(n => n.x))];
  for (const lx of uniqueLanes) {
    const minY = Math.min(...nodes.filter(n => n.x === lx).map(n => n.y));
    const maxY = Math.max(...nodes.filter(n => n.x === lx).map(n => n.y));
    if (minY === maxY) continue;
    const guide = svgEl('line');
    guide.setAttribute('x1', lx); guide.setAttribute('y1', minY);
    guide.setAttribute('x2', lx); guide.setAttribute('y2', maxY);
    guide.setAttribute('stroke', 'var(--border-subtle)');
    guide.setAttribute('stroke-width', '1');
    guide.setAttribute('stroke-dasharray', '2 4');
    lanesGroup.appendChild(guide);
  }
  viewport.appendChild(lanesGroup);

  // ── Edges ──
  const edgesGroup = svgEl('g');
  edgesGroup.setAttribute('class', 'edges-group');
  for (const edge of edges) {
    if (edge.type === 'fork') {
      // Vertical S-curve: starts going down from parent, curves to child lane
      const path = svgEl('path');
      const midY = (edge.from.y + edge.to.y) / 2;
      const d = `M ${edge.from.x},${edge.from.y} C ${edge.from.x},${midY} ${edge.to.x},${midY} ${edge.to.x},${edge.to.y}`;
      path.setAttribute('d', d);
      path.setAttribute('class', 'fork-path');
      edgesGroup.appendChild(path);
    } else {
      const line = svgEl('line');
      line.setAttribute('x1', edge.from.x); line.setAttribute('y1', edge.from.y);
      line.setAttribute('x2', edge.to.x);   line.setAttribute('y2', edge.to.y);
      line.setAttribute('class', 'edge');
      edgesGroup.appendChild(line);
    }
  }
  viewport.appendChild(edgesGroup);

  // ── Commit nodes ──
  const nodesGroup = svgEl('g');
  nodesGroup.setAttribute('class', 'nodes-group');
  tooltipCommitData.clear();

  for (const node of nodes) {
    const color = colorMap.get(node.branch.id) || getBranchColor(0);
    const circle = svgEl('circle');
    circle.setAttribute('cx', node.x); circle.setAttribute('cy', node.y);
    circle.setAttribute('r', node.isHead ? HEAD_RADIUS : NODE_RADIUS);
    circle.setAttribute('class', `commit-node${node.isHead ? ' head' : ''}`);
    circle.setAttribute('data-commit-id', node.id);
    circle.setAttribute('data-branch-id', node.branch.id);
    circle.style.fill = color;
    tooltipCommitData.set(node.id, { ...node.commit, branchName: node.branch.name });
    circle.addEventListener('click', (e) => { e.stopPropagation(); handleNodeClick(node); });
    nodesGroup.appendChild(circle);

    // Note indicator — amber dot on nodes that have a saved note
    const hasNote = !!localStorage.getItem(`fw-commit-note-${node.id}`);
    if (hasNote) {
      const nd = svgEl('circle');
      const nr = node.isHead ? HEAD_RADIUS : NODE_RADIUS;
      nd.setAttribute('cx', String(node.x + nr + 1));
      nd.setAttribute('cy', String(node.y - nr));
      nd.setAttribute('r', '3');
      nd.setAttribute('fill', 'var(--warn-amber, #f4b840)');
      nd.setAttribute('opacity', '0.9');
      nodesGroup.appendChild(nd);
    }

    if (activeBranchId && node.branch.id === activeBranchId && node.isHead) {
      const indicator = svgEl('circle');
      indicator.setAttribute('cx', node.x); indicator.setAttribute('cy', node.y);
      indicator.setAttribute('r', HEAD_RADIUS + 4);
      indicator.setAttribute('class', 'active-indicator');
      indicator.style.stroke = 'var(--pulse-green, #4ade80)';
      nodesGroup.appendChild(indicator);
    }
  }
  viewport.appendChild(nodesGroup);

  // ── Lane labels (at top of each branch's first commit) ──
  const labelsGroup = svgEl('g');
  labelsGroup.setAttribute('class', 'labels-group');
  const labeledBranches = new Set();

  for (const node of nodes) {
    if (node.isHead && !labeledBranches.has(node.branch.id)) {
      labeledBranches.add(node.branch.id);
      const color = colorMap.get(node.branch.id) || getBranchColor(0);
      // Label to the right of head node
      const label = svgEl('text');
      label.setAttribute('x', String(node.x + HEAD_RADIUS + 6));
      label.setAttribute('y', String(node.y + 4));
      label.setAttribute('class', `branch-label${activeBranchId === node.branch.id ? ' active' : ''}`);
      label.setAttribute('fill', color);
      label.textContent = node.branch.name;
      labelsGroup.appendChild(label);
    }
  }
  viewport.appendChild(labelsGroup);

  applyTransform(svgElement);
  attachInteractionHandlers(svgElement);
}

/**
 * Highlight the active branch by adding/removing the glow indicator.
 * @param {SVGSVGElement} svgElement
 * @param {string|null} branchId
 */
function highlightActiveBranch(svgElement, branchId) {
  const state = getViewState(svgElement);
  state.activeBranchId = branchId;

  // Remove all existing active indicators
  const indicators = svgElement.querySelectorAll('.active-indicator');
  indicators.forEach(el => el.remove());

  if (!branchId) return;

  // Find the head node for this branch and add an indicator
  const headNode = svgElement.querySelector(
    `.commit-node.head[data-branch-id="${branchId}"]`
  );
  if (headNode) {
    const cx = headNode.getAttribute('cx');
    const cy = headNode.getAttribute('cy');
    const indicator = svgEl('circle');
    indicator.setAttribute('cx', cx);
    indicator.setAttribute('cy', cy);
    indicator.setAttribute('r', String(HEAD_RADIUS + 4));
    indicator.setAttribute('class', 'active-indicator');

    const viewport = svgElement.querySelector('[data-viewport="true"]');
    if (viewport) {
      viewport.appendChild(indicator);
    }
  }
}

// ============================================================
// PAN / ZOOM
// ============================================================

/**
 * Apply the current pan/zoom transform to the SVG viewport group.
 * @param {SVGSVGElement} svgElement
 */
function applyTransform(svgElement) {
  const state = getViewState(svgElement);
  const viewport = svgElement.querySelector('[data-viewport="true"]');
  if (viewport) {
    viewport.setAttribute(
      'transform',
      `translate(${state.panX}, ${state.panY}) scale(${state.zoom})`
    );
  }
}

/**
 * Pan the graph by the given delta.
 * @param {SVGSVGElement} svgElement
 * @param {number} dx - Delta X in screen pixels
 * @param {number} dy - Delta Y in screen pixels
 */
function panGraph(svgElement, dx, dy) {
  const state = getViewState(svgElement);
  state.panX += dx;
  state.panY += dy;
  applyTransform(svgElement);
}

/**
 * Zoom the graph by the given factor, centered on a point.
 * @param {SVGSVGElement} svgElement
 * @param {number} factor - Zoom multiplier (e.g. 1.1 for zoom in, 0.9 for zoom out)
 * @param {{ x: number, y: number }} [centerPoint] - Point to zoom toward in global screen coords (clientX/clientY). Defaults to center of SVG.
 */
function zoomGraph(svgElement, factor, centerPoint) {
  const state = getViewState(svgElement);
  const rect = svgElement.getBoundingClientRect();

  // Default to center of SVG in global screen coords
  const cx = centerPoint ? centerPoint.x : rect.left + rect.width / 2;
  const cy = centerPoint ? centerPoint.y : rect.top + rect.height / 2;

  // Clamp zoom
  const oldZoom = state.zoom;
  const newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, oldZoom * factor));
  if (newZoom === oldZoom) return;

  // Get the graph coordinate under the zoom center (before changing zoom)
  const graphPoint = screenToGraph(svgElement, cx, cy);

  // Apply zoom
  state.zoom = newZoom;

  // Adjust pan so the same graph point stays at the same screen position.
  // Formula derived from: graphPoint * newZoom + newPan = graphPoint * oldZoom + oldPan
  state.panX += graphPoint.x * (oldZoom - newZoom);
  state.panY += graphPoint.y * (oldZoom - newZoom);

  applyTransform(svgElement);
}

/**
 * Reset zoom and pan to default.
 * @param {SVGSVGElement} svgElement
 */
function resetView(svgElement) {
  const state = getViewState(svgElement);
  state.zoom = 1;
  state.panX = 0;
  state.panY = 0;
  applyTransform(svgElement);
}

/**
 * Convert global screen coordinates (clientX/clientY) to graph coordinates.
 * Uses the native SVG CTM for correctness with viewBox scaling and transforms.
 * @param {SVGSVGElement} svgElement
 * @param {number} clientX - Global mouse X (e.clientX)
 * @param {number} clientY - Global mouse Y (e.clientY)
 * @returns {{ x: number, y: number }}
 */
function screenToGraph(svgElement, clientX, clientY) {
  const viewport = svgElement.querySelector('[data-viewport="true"]');
  if (!viewport) return { x: 0, y: 0 };

  const point = svgElement.createSVGPoint();
  point.x = clientX;
  point.y = clientY;

  const ctm = viewport.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };

  const svgPoint = point.matrixTransform(ctm.inverse());
  return { x: svgPoint.x, y: svgPoint.y };
}

// ============================================================
// INTERACTION HANDLERS
// ============================================================

function attachInteractionHandlers(svgElement) {
  if (svgElement.dataset.handlersAttached === 'true') return;
  svgElement.dataset.handlersAttached = 'true';

  const state = getViewState(svgElement);

  // ── Wheel zoom ──
  svgElement.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    zoomGraph(svgElement, factor, { x: e.clientX, y: e.clientY });
  }, { passive: false });

  // ── Mouse panning — clean screen-delta approach (no CTM feedback jerk) ──
  svgElement.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('.commit-node')) return;
    e.preventDefault();
    state.isPanning = true;
    state.panStartScreenX = e.clientX;
    state.panStartScreenY = e.clientY;
    state.panStartViewX   = state.panX;
    state.panStartViewY   = state.panY;
    svgElement.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!state.isPanning) return;
    const dx = e.clientX - state.panStartScreenX;
    const dy = e.clientY - state.panStartScreenY;
    // Convert screen pixels → SVG viewBox units
    const rect = svgElement.getBoundingClientRect();
    const vb   = svgElement.viewBox.baseVal;
    const scaleX = rect.width  > 0 && vb.width  > 0 ? vb.width  / rect.width  : 1;
    const scaleY = rect.height > 0 && vb.height > 0 ? vb.height / rect.height : 1;
    state.panX = state.panStartViewX + dx * scaleX;
    state.panY = state.panStartViewY + dy * scaleY;
    applyTransform(svgElement);
  });

  window.addEventListener('mouseup', () => {
    if (state.isPanning) {
      state.isPanning = false;
      svgElement.style.cursor = '';
    }
  });

  // ── Touch panning ──
  svgElement.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    if (e.target.closest('.commit-node')) return;
    e.preventDefault();
    state.isPanning = true;
    state.panStartScreenX = e.touches[0].clientX;
    state.panStartScreenY = e.touches[0].clientY;
    state.panStartViewX   = state.panX;
    state.panStartViewY   = state.panY;
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    if (!state.isPanning || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - state.panStartScreenX;
    const dy = e.touches[0].clientY - state.panStartScreenY;
    const rect = svgElement.getBoundingClientRect();
    const vb   = svgElement.viewBox.baseVal;
    const scaleX = rect.width  > 0 && vb.width  > 0 ? vb.width  / rect.width  : 1;
    const scaleY = rect.height > 0 && vb.height > 0 ? vb.height / rect.height : 1;
    state.panX = state.panStartViewX + dx * scaleX;
    state.panY = state.panStartViewY + dy * scaleY;
    applyTransform(svgElement);
  }, { passive: true });

  window.addEventListener('touchend', () => { state.isPanning = false; });

  // ── Double-click to reset ──
  svgElement.addEventListener('dblclick', (e) => {
    if (!e.target.closest('.commit-node')) resetView(svgElement);
  });

  // ── Resize observer ──
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      state.containerWidth  = entry.contentRect.width;
      state.containerHeight = entry.contentRect.height;
    }
  });
  resizeObserver.observe(svgElement);
}

function closeGraphMaximized() {
  const modal = document.getElementById('branchGraphMaxModal');
  if (modal) modal.classList.remove('open');
}

/**
 * Handle click on a commit node.
 * @param {GraphNode} node
 */
function handleNodeClick(node) {
  // Dispatch a custom event that the UI layer can listen for
  const event = new CustomEvent('commit:selected', {
    detail: {
      commitId: node.commit.id,
      branchId: node.branch.id,
      message: node.commit.message,
      timestamp: node.commit.timestamp,
      wordCount: node.commit.wordCount,
      wordCountDelta: node.commit.wordCountDelta,
    },
    bubbles: true,
  });
  document.dispatchEvent(event);
}

// ============================================================
// COMMIT LIST RENDERING
// ============================================================

/**
 * Render a scrollable commit list below the SVG graph.
 *
 * @param {HTMLElement} container
 * @param {Commit[]} commits
 * @param {Object} [options]
 * @param {string|null} [options.activeCommitId]
 * @param {function(Commit): void} [options.onSelect]
 */
function renderCommitList(container, commits, options = {}) {
  const { activeCommitId = null, onSelect } = options;

  container.innerHTML = '';
  container.classList.add('commit-list');

  if (!commits || commits.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'commit-list-empty';
    empty.textContent = 'No commits yet.';
    container.appendChild(empty);
    return;
  }

  // Sort by timestamp descending (newest first)
  const sorted = [...commits].sort((a, b) => b.timestamp - a.timestamp);

  for (const commit of sorted) {
    const item = document.createElement('div');
    item.className = 'commit-item';
    if (commit.id === activeCommitId) {
      item.classList.add('active');
    }
    item.dataset.commitId = commit.id;

    const message = document.createElement('span');
    message.className = 'message';
    message.textContent = commit.message || '(no message)';

    const time = document.createElement('span');
    time.className = 'time';
    time.textContent = formatRelativeTime(commit.timestamp);
    time.title = new Date(commit.timestamp).toLocaleString();

    const delta = document.createElement('span');
    delta.className = 'delta';
    const deltaVal = commit.wordCountDelta || 0;
    if (deltaVal > 0) {
      delta.textContent = `+${deltaVal}`;
      delta.classList.add('positive');
    } else if (deltaVal < 0) {
      delta.textContent = `${deltaVal}`;
      delta.classList.add('negative');
    } else {
      delta.textContent = '·';
    }

    item.appendChild(message);
    item.appendChild(time);
    item.appendChild(delta);

    if (onSelect) {
      item.addEventListener('click', () => onSelect(commit));
    }

    container.appendChild(item);
  }
}

// ============================================================
// GRAPH TOOLTIP
// ============================================================

/** @type {Map<string, Commit>} commitId -> commit data for tooltip lookup */
const tooltipCommitData = new Map();

/**
 * Create and manage a tooltip for commit nodes.
 * Shows commit message, timestamp, word count, and delta on hover.
 * @param {SVGSVGElement} svgElement
 */
export function setupGraphTooltip(svgElement) {
  // Create tooltip element
  let tooltip = document.getElementById('graphTooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'graphTooltip';
    tooltip.className = 'graph-tooltip';
    document.body.appendChild(tooltip);
  }

  svgElement.addEventListener('mouseover', (e) => {
    const node = e.target.closest('.commit-node');
    if (!node) return;

    const commitId = node.dataset.commitId;
    const commit = tooltipCommitData.get(commitId);
    if (!commit) return;

    const branchId = node.dataset.branchId;
    const branchName = commit.branchName || branchId;

    tooltip.innerHTML = `
      <div class="msg">${escapeHtml(commit.message)}</div>
      <div class="meta">
        ${formatRelativeTime(commit.timestamp)} · ${new Date(commit.timestamp).toLocaleString()}<br>
        ${commit.wordCount} words
        ${commit.wordCountDelta !== 0 ? `(${commit.wordCountDelta > 0 ? '+' : ''}${commit.wordCountDelta})` : ''}
        · ${escapeHtml(branchName)}
      </div>
    `;

    tooltip.classList.add('visible');
    positionTooltip(tooltip, e.clientX, e.clientY);
  });

  svgElement.addEventListener('mousemove', (e) => {
    if (tooltip.classList.contains('visible')) {
      positionTooltip(tooltip, e.clientX, e.clientY);
    }
  });

  svgElement.addEventListener('mouseout', (e) => {
    const node = e.target.closest('.commit-node');
    if (node) {
      tooltip.classList.remove('visible');
    }
  });
}

function positionTooltip(tooltip, clientX, clientY) {
  const pad = 12;
  let left = clientX + pad;
  let top = clientY + pad;

  // Prevent overflow
  const rect = tooltip.getBoundingClientRect();
  if (left + rect.width > window.innerWidth - pad) {
    left = clientX - rect.width - pad;
  }
  if (top + rect.height > window.innerHeight - pad) {
    top = clientY - rect.height - pad;
  }

  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============================================================
// ZOOM CONTROLS
// ============================================================

export function renderGraphControls(containerElement, svgElement) {
  if (!containerElement) return;

  containerElement.innerHTML = '';
  containerElement.classList.add('graph-controls');

  const btnZoomOut = document.createElement('button');
  btnZoomOut.className = 'graph-control-btn';
  btnZoomOut.textContent = '−';
  btnZoomOut.title = 'Zoom out';
  btnZoomOut.addEventListener('click', () => zoomGraph(svgElement, 0.8));

  const btnReset = document.createElement('button');
  btnReset.className = 'graph-control-btn';
  btnReset.textContent = '⌂';
  btnReset.title = 'Reset view (double-click graph)';
  btnReset.addEventListener('click', () => resetView(svgElement));

  const btnZoomIn = document.createElement('button');
  btnZoomIn.className = 'graph-control-btn';
  btnZoomIn.textContent = '+';
  btnZoomIn.title = 'Zoom in';
  btnZoomIn.addEventListener('click', () => zoomGraph(svgElement, 1.25));

  const btnMax = document.createElement('button');
  btnMax.className = 'graph-control-btn graph-maximize-btn';
  btnMax.title = 'Maximize graph';
  btnMax.innerHTML = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2h4v4M6 14H2v-4M14 10v4h-4M2 6V2h4"/></svg>';
  btnMax.addEventListener('click', () => openGraphMaximized());

  containerElement.appendChild(btnZoomOut);
  containerElement.appendChild(btnReset);
  containerElement.appendChild(btnZoomIn);
  containerElement.appendChild(btnMax);
}

// ── Maximize modal ──
function openGraphMaximized() {
  let modal = document.getElementById('branchGraphMaxModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'branchGraphMaxModal';
    modal.className = 'branch-graph-max-modal';
    modal.innerHTML = `
      <div class="branch-graph-max-inner">
        <div class="branch-graph-max-header">
          <span class="branch-graph-max-title">Branch History</span>
          <div class="branch-graph-max-controls" id="branchGraphMaxControls"></div>
          <button class="branch-graph-max-close" id="branchGraphMaxClose" title="Close">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l10 10M13 3L3 13"/></svg>
          </button>
        </div>
        <div class="branch-graph-max-layout">
          <div class="branch-graph-max-body">
            <svg id="branchGraphMaxSvg" class="branch-graph-svg branch-graph-max-svg"></svg>
          </div>
          <aside class="branch-graph-max-detail" id="branchGraphMaxDetail">
            <div class="bgm-empty-state">
              <svg width="28" height="28" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.25;margin-bottom:8px"><circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="2"/></svg>
              <p>Click a node to explore its version</p>
            </div>
          </aside>
        </div>
      </div>`;
    document.body.appendChild(modal);
    document.getElementById('branchGraphMaxClose').addEventListener('click', closeGraphMaximized);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeGraphMaximized(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeGraphMaximized(); });
    // Listen for node selection while modal is open
    document.addEventListener('commit:selected', (e) => {
      if (modal.classList.contains('open')) populateNodeDetail(e.detail);
    });
  }
  requestAnimationFrame(() => modal.classList.add('open'));
  const maxSvg = document.getElementById('branchGraphMaxSvg');
  if (maxSvg && _lastLayout) {
    viewStates.delete(maxSvg);
    delete maxSvg.dataset.handlersAttached;
    renderBranchGraph(maxSvg, _lastLayout, _lastActiveBranchId);
    setupGraphTooltip(maxSvg);
    renderGraphControls(document.getElementById('branchGraphMaxControls'), maxSvg);
    const innerMax = document.querySelector('#branchGraphMaxControls .graph-maximize-btn');
    if (innerMax) innerMax.remove();
  }
}

function getAutoChars() {
  const el = document.getElementById('autoTags');
  if (!el) return [];
  return [...el.querySelectorAll('.tag.auto')]
    .map(t => t.textContent.trim()).filter(Boolean);
}

function populateNodeDetail(commitData) {
  const panel = document.getElementById('branchGraphMaxDetail');
  if (!panel) return;
  const { commitId, branchId, message, timestamp, wordCount, wordCountDelta } = commitData;
  const savedNote = localStorage.getItem(`fw-commit-note-${commitId}`) || '';
  const chars = getAutoChars();
  const timeStr = formatRelativeTime(timestamp);
  const deltaNum = wordCountDelta || 0;
  const deltaStr = deltaNum > 0 ? `+${deltaNum}` : deltaNum < 0 ? `${deltaNum}` : '';
  const deltaClass = deltaNum > 0 ? 'positive' : deltaNum < 0 ? 'negative' : '';

  panel.innerHTML = `
    <div class="bgm-detail-content">
      <div class="bgm-detail-meta">
        <span class="bgm-detail-branch">${escapeHtml(branchId || '')}</span>
        <span class="bgm-detail-time">${timeStr}</span>
      </div>

      <div class="bgm-detail-message">${escapeHtml(message || '(snapshot)')}</div>

      <div class="bgm-detail-wc">
        <span>${wordCount || 0} words</span>
        ${deltaStr ? `<span class="bgm-delta ${deltaClass}">${deltaStr}</span>` : ''}
      </div>

      ${chars.length ? `
        <div class="bgm-section-title">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="6" cy="5" r="3"/><path d="M1 14c0-3 2.5-5 5-5s5 2 5 5"/><circle cx="12" cy="6" r="2"/><path d="M12 10c1.5 0 3 1 3 4"/></svg>
          Characters
        </div>
        <div class="bgm-chars">
          ${chars.map(c => `<span class="bgm-char-chip">${escapeHtml(c)}</span>`).join('')}
        </div>` : ''}

      <div class="bgm-section-title">
        <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h12M2 6h8M2 9h10M2 12h6"/></svg>
        Note
      </div>
      <textarea class="bgm-note-input" id="bgmNoteInput"
        placeholder="Context, intentions, things to remember…"
        rows="4">${escapeHtml(savedNote)}</textarea>

      <button class="bgm-hop-btn" id="bgmHopBtn">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
        Open this version
      </button>
    </div>`;

  // Persist note on input (debounced)
  let noteTimer;
  const noteInput = panel.querySelector('#bgmNoteInput');
  if (noteInput) {
    noteInput.addEventListener('input', () => {
      clearTimeout(noteTimer);
      noteTimer = setTimeout(() => {
        localStorage.setItem(`fw-commit-note-${commitId}`, noteInput.value);
        // Refresh graph so note indicator dot appears/disappears
        const maxSvg = document.getElementById('branchGraphMaxSvg');
        if (maxSvg && _lastLayout) renderBranchGraph(maxSvg, _lastLayout, _lastActiveBranchId);
      }, 700);
    });
    noteInput.focus();
  }

  // Hop to this version
  const hopBtn = panel.querySelector('#bgmHopBtn');
  if (hopBtn) {
    hopBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('commit:selected', {
        detail: { commitId, branchId, message, timestamp, wordCount, wordCountDelta },
        bubbles: true,
      }));
      closeGraphMaximized();
    });
  }
}

// ============================================================
// AUTO-PAN TO ACTIVE BRANCH
// ============================================================

/**
 * Smoothly pan the graph to center on a branch's head commit.
 * @param {SVGSVGElement} svgElement
 * @param {string} branchId
 * @param {Object} layout
 * @param {GraphNode[]} layout.nodes
 */
export function panToBranch(svgElement, branchId, layout) {
  if (!layout || !layout.nodes) return;

  const headNode = layout.nodes.find(
    n => n.branch.id === branchId && n.isHead
  );
  if (!headNode) return;

  const state = getViewState(svgElement);
  const rect = svgElement.getBoundingClientRect();

  // Target: center the head node in the SVG viewport
  const targetPanX = rect.width / 2 - headNode.x * state.zoom;
  const targetPanY = rect.height / 2 - headNode.y * state.zoom;

  // Animate pan
  animatePan(svgElement, targetPanX, targetPanY, 400);
}

/**
 * Animate pan to target coordinates.
 * @param {SVGSVGElement} svgElement
 * @param {number} targetX
 * @param {number} targetY
 * @param {number} duration
 */
function animatePan(svgElement, targetX, targetY, duration) {
  const state = getViewState(svgElement);
  const startX = state.panX;
  const startY = state.panY;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);
    // Ease out cubic
    const ease = 1 - Math.pow(1 - t, 3);

    state.panX = startX + (targetX - startX) * ease;
    state.panY = startY + (targetY - startY) * ease;
    applyTransform(svgElement);

    if (t < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

// ============================================================
// EXPORTS
// ============================================================

export {
  computeGraphLayout,
  renderBranchGraph,
  highlightActiveBranch,
  panGraph,
  zoomGraph,
  resetView,
  renderCommitList,
};
