/* ============================================================
   Flow Writer — Interactive Map Canvas Module
   Hand-drawn style maps with pan, zoom, pin placement,
   note popups, and localStorage persistence.
   ============================================================ */

// ── State ────────────────────────────────────────────────────
let canvas = null;
let ctx = null;
let popup = null;
let pinInput = null;
let currentMapType = null;   // 'town' | 'library' | null
let isOpen = false;

// Camera / viewport
let camera = { x: 0, y: 0, zoom: 1 };
let isPanning = false;
let panStart = { x: 0, y: 0 };
let cameraStart = { x: 0, y: 0 };

// Pins
let pins = [];          // { id, x, y, note }
let placingPin = false; // click-to-place mode
let activePinId = null; // currently selected pin
let hoveredPinId = null;

// Canvas size (internal resolution)
let W = 0, H = 0;

// Seeded random for consistent "hand-drawn" jitter
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Get theme-appropriate stroke color
function getStrokeColor() {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  return theme === 'light' ? '#0f172a' : getComputedStyle(document.documentElement).getPropertyValue('--accent-2').trim() || '#14b89a';
}

function getFillColor() {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  return theme === 'light' ? '#0f172a' : '#ffffff';
}

function getSubtleColor() {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  return theme === 'light' ? 'rgba(15,23,42,0.5)' : 'rgba(20,184,154,0.5)';
}

function getWaterColor() {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  return theme === 'light' ? '#3b82f6' : '#3ef0e2';
}

function getGlowColor() {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  return theme === 'light' ? 'rgba(245,158,11,0.4)' : 'rgba(20,184,154,0.35)';
}

// ── Coordinate transforms ────────────────────────────────────
function screenToWorld(sx, sy) {
  return {
    x: (sx - W / 2) / camera.zoom - camera.x,
    y: (sy - H / 2) / camera.zoom - camera.y,
  };
}

function worldToScreen(wx, wy) {
  return {
    x: (wx + camera.x) * camera.zoom + W / 2,
    y: (wy + camera.y) * camera.zoom + H / 2,
  };
}

// ── Hand-drawn line helpers ──────────────────────────────────
function sketchLine(cx, x1, y1, x2, y2, width = 2, color = null) {
  cx.beginPath();
  cx.strokeStyle = color || getStrokeColor();
  cx.lineWidth = width;
  cx.lineCap = 'round';
  const segments = Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 8);
  const rand = seededRandom(Math.floor(x1 * 7 + y1 * 13 + x2 * 3));
  let px = x1, py = y1;
  cx.moveTo(x1 + (rand() - 0.5) * 1.5, y1 + (rand() - 0.5) * 1.5);
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const nx = x1 + (x2 - x1) * t + (rand() - 0.5) * 1.2;
    const ny = y1 + (y2 - y1) * t + (rand() - 0.5) * 1.2;
    cx.lineTo(nx, ny);
    px = nx; py = ny;
  }
  cx.stroke();
}

function sketchRect(cx, x, y, w, h, width = 2, color = null) {
  sketchLine(cx, x, y, x + w, y, width, color);
  sketchLine(cx, x + w, y, x + w, y + h, width, color);
  sketchLine(cx, x + w, y + h, x, y + h, width, color);
  sketchLine(cx, x, y + h, x, y, width, color);
}

function sketchCircle(cx, cx_, cy, r, width = 2, color = null) {
  cx.beginPath();
  cx.strokeStyle = color || getStrokeColor();
  cx.lineWidth = width;
  const segments = 32;
  const rand = seededRandom(Math.floor(cx_ * 11 + cy * 7));
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const jitter = i < segments ? (rand() - 0.5) * 1.5 : 0;
    const px = cx_ + Math.cos(angle) * (r + jitter);
    const py = cy + Math.sin(angle) * (r + jitter);
    if (i === 0) cx.moveTo(px, py);
    else cx.lineTo(px, py);
  }
  cx.stroke();
}

function sketchOval(cx, cx_, cy, rx, ry, width = 2, color = null) {
  cx.beginPath();
  cx.strokeStyle = color || getStrokeColor();
  cx.lineWidth = width;
  const segments = 32;
  const rand = seededRandom(Math.floor(cx_ * 13 + cy * 3));
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const jitter = i < segments ? (rand() - 0.5) * 1.2 : 0;
    const px = cx_ + Math.cos(angle) * (rx + jitter);
    const py = cy + Math.sin(angle) * (ry + jitter);
    if (i === 0) cx.moveTo(px, py);
    else cx.lineTo(px, py);
  }
  cx.stroke();
}

function sketchCurve(cx, points, width = 2, color = null) {
  if (points.length < 2) return;
  cx.beginPath();
  cx.strokeStyle = color || getStrokeColor();
  cx.lineWidth = width;
  cx.lineCap = 'round';
  cx.lineJoin = 'round';
  const rand = seededRandom(points.length * 17);
  cx.moveTo(points[0].x + (rand() - 0.5), points[0].y + (rand() - 0.5));
  for (let i = 1; i < points.length; i++) {
    cx.lineTo(points[i].x + (rand() - 0.5) * 1.5, points[i].y + (rand() - 0.5) * 1.5);
  }
  cx.stroke();
}

function drawLabel(cx, text, x, y, fontSize = 12, color = null) {
  const fill = color || getFillColor();
  cx.font = `${fontSize}px var(--font-mono, 'JetBrains Mono', monospace)`;
  cx.textAlign = 'center';
  cx.textBaseline = 'middle';
  // Slight text shadow for readability
  cx.shadowColor = document.documentElement.getAttribute('data-theme') === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';
  cx.shadowBlur = 4;
  cx.fillStyle = fill;
  cx.fillText(text, x, y);
  cx.shadowBlur = 0;
}

// ── Town Map Drawing ─────────────────────────────────────────
function drawTownMap(cx) {
  const stroke = getStrokeColor();

  // Main road (horizontal through center)
  sketchLine(cx, -350, 0, 350, 0, 4, stroke);

  // Side streets (angled)
  sketchLine(cx, -150, -200, -150, 200, 3, stroke);   // vertical side street
  sketchLine(cx, 150, -180, 150, 180, 3, stroke);     // vertical side street
  sketchLine(cx, -350, -100, -50, 0, 3, stroke);      // angled connector
  sketchLine(cx, 50, 0, 350, -100, 3, stroke);        // angled connector
  sketchLine(cx, -200, 80, 200, -80, 2.5, stroke);    // diagonal cross

  // Town square (center circle)
  sketchCircle(cx, 0, 0, 55, 3.5, stroke);
  drawLabel(cx, 'Town Square', 0, 0, 12);

  // Decorative inner circle for town square
  sketchCircle(cx, 0, 0, 40, 1.5, getSubtleColor());

  // Library building (rectangle, top-right)
  sketchRect(cx, 180, -140, 120, 90, 3.5, stroke);
  // Library door
  sketchLine(cx, 230, -50, 230, -20, 2.5, stroke);
  sketchLine(cx, 220, -20, 240, -20, 2.5, stroke);
  // Library windows
  sketchRect(cx, 195, -120, 25, 25, 1.5, stroke);
  sketchRect(cx, 260, -120, 25, 25, 1.5, stroke);
  drawLabel(cx, 'Library', 240, -165, 11);

  // Diner (small rectangle, bottom-left)
  sketchRect(cx, -280, 80, 80, 60, 3, stroke);
  sketchRect(cx, -255, 100, 30, 30, 1.5, stroke); // window
  drawLabel(cx, 'Diner', -240, 160, 11);

  // Houses (small rectangles, scattered)
  const houses = [
    [-320, -120, 50, 45], [-250, -160, 45, 40], [-80, -170, 50, 45],
    [80, -160, 55, 50], [320, -80, 45, 40], [-330, 40, 50, 45],
    [-100, 130, 45, 40], [50, 120, 50, 45], [300, 50, 55, 50],
    [250, 140, 45, 40],
  ];
  houses.forEach(([hx, hy, hw, hh]) => {
    sketchRect(cx, hx, hy, hw, hh, 2, stroke);
    // small door
    sketchLine(cx, hx + hw * 0.4, hy + hh, hx + hw * 0.4, hy + hh * 0.55, 1, stroke);
    sketchLine(cx, hx + hw * 0.6, hy + hh, hx + hw * 0.6, hy + hh * 0.55, 1, stroke);
    sketchLine(cx, hx + hw * 0.4, hy + hh * 0.55, hx + hw * 0.6, hy + hh * 0.55, 1, stroke);
  });

  // Park (oval, left side)
  const parkX = -260, parkY = -50;
  sketchOval(cx, parkX, parkY, 70, 50, 2, stroke);
  drawLabel(cx, 'Park', parkX, parkY - 65, 10);

  // Trees in park (small circles)
  const trees = [
    [-290, -60], [-280, -30], [-250, -70], [-240, -40],
    [-300, -50], [-270, -20], [-230, -55],
  ];
  trees.forEach(([tx, ty]) => {
    sketchCircle(cx, tx, ty, 6, 1, getSubtleColor());
    sketchLine(cx, tx, ty + 6, tx, ty + 14, 1, getSubtleColor());
  });

  // River (curved blue line at bottom)
  const riverPoints = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const rx = -380 + t * 760;
    const ry = 220 + Math.sin(t * Math.PI * 2) * 25 + Math.sin(t * Math.PI * 3.5) * 10;
    riverPoints.push({ x: rx, y: ry });
  }
  sketchCurve(cx, riverPoints, 3, getWaterColor());
  // Second river line
  const riverPoints2 = riverPoints.map(p => ({ x: p.x, y: p.y + 12 }));
  sketchCurve(cx, riverPoints2, 1.5, getWaterColor());

  // Road labels
  drawLabel(cx, 'Main St', -300, -12, 9, getSubtleColor());
  drawLabel(cx, 'Oak Ave', -165, -90, 9, getSubtleColor());
  drawLabel(cx, 'Pine Rd', 135, -100, 9, getSubtleColor());

  // Bridge over river
  sketchLine(cx, -40, 210, 40, 235, 2, stroke);
  sketchLine(cx, -40, 218, 40, 243, 2, stroke);
  drawLabel(cx, '~', 0, 228, 14, stroke);
}

// ── Library Layout Drawing ───────────────────────────────────
function drawLibraryMap(cx) {
  const stroke = getStrokeColor();

  // Outer walls (main building)
  sketchRect(cx, -300, -220, 600, 440, 3, stroke);

  // Entrance (bottom center)
  sketchLine(cx, -40, 220, -40, 180, 2.5, stroke);
  sketchLine(cx, 40, 220, 40, 180, 2.5, stroke);
  sketchLine(cx, -40, 180, 40, 180, 2.5, stroke);
  drawLabel(cx, 'Entrance', 0, 200, 10);

  // Main hall (large central area - indicated by floor lines)
  sketchLine(cx, -280, -60, 280, -60, 1, getSubtleColor());
  sketchLine(cx, -280, 60, 280, 60, 1, getSubtleColor());
  drawLabel(cx, 'Main Hall', 0, 0, 14);

  // Reading room (left side, partitioned)
  sketchLine(cx, -200, -200, -200, 200, 2, stroke);
  sketchLine(cx, -300, -100, -200, -100, 2, stroke);
  sketchLine(cx, -300, 100, -200, 100, 2, stroke);
  drawLabel(cx, 'Reading Room', -250, 0, 11);

  // Reading room tables
  sketchRect(cx, -270, -60, 50, 30, 1, getSubtleColor());
  sketchRect(cx, -270, 30, 50, 30, 1, getSubtleColor());

  // Archive room (right side, marked with star)
  sketchLine(cx, 200, -200, 200, 200, 2, stroke);
  sketchLine(cx, 200, -100, 300, -100, 2, stroke);
  sketchLine(cx, 200, 100, 300, 100, 2, stroke);
  drawLabel(cx, 'Archive Room', 250, 0, 11);

  // Star symbol in archive room
  drawStar(cx, 250, -140, 12, stroke);
  drawLabel(cx, '*', 250, -140, 16, stroke);

  // Windows (small rectangles on walls)
  const windows = [
    [-260, -220, 40, 10], [-160, -220, 40, 10], [-60, -220, 40, 10],
    [60, -220, 40, 10], [160, -220, 40, 10], [260, -220, 40, 10],
    [-300, -160, 10, 35], [-300, -20, 10, 35], [-300, 120, 10, 35],
    [290, -160, 10, 35], [290, -20, 10, 35], [290, 120, 10, 35],
  ];
  windows.forEach(([wx, wy, ww, wh]) => {
    sketchRect(cx, wx, wy, ww, wh, 1, getSubtleColor());
  });

  // Bookshelves (rows of small rectangles)
  const bookshelves = [
    // Main hall shelves
    [-120, -180, 80, 15], [40, -180, 80, 15],
    [-120, 130, 80, 15], [40, 130, 80, 15],
    [-120, 160, 80, 15], [40, 160, 80, 15],
    // Reading room shelves
    [-280, -180, 60, 12], [-280, -150, 60, 12],
    [-280, 140, 60, 12], [-280, 170, 60, 12],
    // Archive room shelves
    [220, -180, 60, 12], [220, -150, 60, 12],
    [220, 140, 60, 12], [220, 170, 60, 12],
  ];
  bookshelves.forEach(([bx, by, bw, bh]) => {
    sketchRect(cx, bx, by, bw, bh, 1, stroke);
    // Shelf divider lines
    for (let d = 4; d < bw - 4; d += 8) {
      sketchLine(cx, bx + d, by, bx + d, by + bh, 0.5, getSubtleColor());
    }
  });

  // Secret compartment (small hidden area behind a bookshelf, upper right)
  sketchRect(cx, 160, -200, 35, 20, 1.5, stroke);
  // Dashed effect for hidden
  cx.setLineDash([4, 3]);
  sketchRect(cx, 165, -195, 25, 10, 1, getStrokeColor());
  cx.setLineDash([]);
  drawLabel(cx, 'Secret', 177, -212, 8, getSubtleColor());

  // Hidden journal location (marked with glow)
  const glowX = 177, glowY = -190;
  // Animated glow ring
  const time = Date.now() / 1000;
  const glowRadius = 15 + Math.sin(time * 2) * 4;
  cx.save();
  cx.beginPath();
  cx.arc(glowX, glowY, glowRadius, 0, Math.PI * 2);
  cx.fillStyle = getGlowColor();
  cx.fill();
  cx.restore();

  // Pulse effect
  cx.save();
  cx.beginPath();
  cx.arc(glowX, glowY, glowRadius * 1.4, 0, Math.PI * 2);
  cx.strokeStyle = getGlowColor();
  cx.lineWidth = 1;
  cx.stroke();
  cx.restore();

  // Journal marker
  drawLabel(cx, 'Journal', glowX, glowY, 9, stroke);

  // Labels for other areas
  drawLabel(cx, 'Bookshelves', -40, -195, 9, getSubtleColor());
  drawLabel(cx, 'Information', -40, 195, 9, getSubtleColor());
}

function drawStar(cx, x, y, r, color) {
  cx.save();
  cx.beginPath();
  cx.strokeStyle = color || getStrokeColor();
  cx.lineWidth = 1.5;
  cx.lineJoin = 'round';
  const rand = seededRandom(42);
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(angle) * radius + (rand() - 0.5) * 0.8;
    const py = y + Math.sin(angle) * radius + (rand() - 0.5) * 0.8;
    if (i === 0) cx.moveTo(px, py);
    else cx.lineTo(px, py);
  }
  cx.closePath();
  cx.stroke();
  cx.restore();
}

// ── Pin Drawing ──────────────────────────────────────────────
function drawPin(cx, pin, isHovered, isSelected) {
  const pos = worldToScreen(pin.x, pin.y);
  const x = pos.x;
  const y = pos.y;
  const s = Math.max(0.6, Math.min(1.4, camera.zoom));

  cx.save();

  // Pin shadow
  cx.beginPath();
  cx.ellipse(x + 2 * s, y + 2 * s, 6 * s, 3 * s, 0, 0, Math.PI * 2);
  cx.fillStyle = 'rgba(0,0,0,0.25)';
  cx.fill();

  // Pin body (teardrop)
  cx.beginPath();
  const pinColor = isSelected ? '#f59e0b' : (isHovered ? '#3ef0e2' : '#14b89a');
  cx.fillStyle = pinColor;
  cx.moveTo(x, y - 18 * s);
  cx.bezierCurveTo(
    x - 10 * s, y - 18 * s,
    x - 12 * s, y - 6 * s,
    x, y
  );
  cx.bezierCurveTo(
    x + 12 * s, y - 6 * s,
    x + 10 * s, y - 18 * s,
    x, y - 18 * s
  );
  cx.fill();

  // Pin head
  cx.beginPath();
  cx.arc(x, y - 18 * s, 5 * s, 0, Math.PI * 2);
  cx.fillStyle = isSelected ? '#fbbf24' : '#ffffff';
  cx.fill();
  cx.strokeStyle = pinColor;
  cx.lineWidth = 1.5;
  cx.stroke();

  // Note indicator (small dot if has note)
  if (pin.note) {
    cx.beginPath();
    cx.arc(x + 7 * s, y - 22 * s, 2.5 * s, 0, Math.PI * 2);
    cx.fillStyle = '#f59e0b';
    cx.fill();
  }

  cx.restore();
}

function drawPins(cx) {
  pins.forEach(pin => {
    const isHovered = pin.id === hoveredPinId;
    const isSelected = pin.id === activePinId;
    drawPin(cx, pin, isHovered, isSelected);
  });
}

// ── Grid background ──────────────────────────────────────────
function drawGrid(cx) {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  const gridColor = theme === 'light' ? 'rgba(15,23,42,0.06)' : 'rgba(20,184,154,0.06)';
  const gridSize = 50;

  // Calculate visible grid range in world coords
  const tl = screenToWorld(0, 0);
  const br = screenToWorld(W, H);

  const startX = Math.floor(tl.x / gridSize) * gridSize;
  const startY = Math.floor(tl.y / gridSize) * gridSize;

  cx.save();
  cx.strokeStyle = gridColor;
  cx.lineWidth = 0.5;

  for (let x = startX; x <= br.x + gridSize; x += gridSize) {
    const s1 = worldToScreen(x, tl.y);
    const s2 = worldToScreen(x, br.y);
    cx.beginPath();
    cx.moveTo(s1.x, 0);
    cx.lineTo(s2.x, H);
    cx.stroke();
  }
  for (let y = startY; y <= br.y + gridSize; y += gridSize) {
    const s1 = worldToScreen(tl.x, y);
    const s2 = worldToScreen(br.x, y);
    cx.beginPath();
    cx.moveTo(0, s1.y);
    cx.lineTo(W, s2.y);
    cx.stroke();
  }
  cx.restore();
}

// ── Main render loop ─────────────────────────────────────────
function render() {
  if (!ctx || !canvas) return;

  // Clear canvas
  ctx.clearRect(0, 0, W, H);

  // Draw grid
  drawGrid(ctx);

  // Save context for camera transform
  ctx.save();

  // Apply camera: center of canvas is origin
  ctx.translate(W / 2, H / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(camera.x, camera.y);

  // Draw the map
  if (currentMapType === 'town') {
    drawTownMap(ctx);
  } else if (currentMapType === 'library') {
    drawLibraryMap(ctx);
  }

  // Draw pins (in world space)
  ctx.restore();
  drawPins(ctx);

  // Mode indicator
  if (placingPin) {
    ctx.save();
    ctx.font = '12px var(--font-mono, monospace)';
    ctx.fillStyle = getStrokeColor();
    ctx.textAlign = 'center';
    ctx.fillText('Click anywhere to place a pin', W / 2, 20);
    ctx.restore();
  }
}

let animFrameId = null;
function startRenderLoop() {
  function loop() {
    if (isOpen) {
      render();
      animFrameId = requestAnimationFrame(loop);
    }
  }
  loop();
}

function stopRenderLoop() {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
}

// ── Pin management ───────────────────────────────────────────
function generatePinId() {
  return 'pin-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
}

function findPinAtScreen(sx, sy) {
  // Check in reverse order (top-most first)
  for (let i = pins.length - 1; i >= 0; i--) {
    const pin = pins[i];
    const pos = worldToScreen(pin.x, pin.y);
    const hitRadius = 18 * Math.max(0.6, Math.min(1.4, camera.zoom));
    const dx = sx - pos.x;
    const dy = sy - pos.y;
    if (Math.sqrt(dx * dx + dy * dy) < hitRadius) {
      return pin;
    }
  }
  return null;
}

function addPin(worldX, worldY) {
  const pin = { id: generatePinId(), x: worldX, y: worldY, note: '' };
  pins.push(pin);
  savePinsToStorage();
  return pin;
}

function deletePin(id) {
  pins = pins.filter(p => p.id !== id);
  if (activePinId === id) {
    activePinId = null;
    hidePopup();
  }
  savePinsToStorage();
}

function updatePinNote(id, note) {
  const pin = pins.find(p => p.id === id);
  if (pin) {
    pin.note = note;
    savePinsToStorage();
  }
}

// ── localStorage persistence ─────────────────────────────────
function getStorageKey() {
  return `fw-map-pins-${currentMapType}`;
}

function savePinsToStorage() {
  if (!currentMapType) return;
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(pins));
  } catch (e) {
    console.warn('Failed to save map pins:', e);
  }
}

function loadPinsFromStorage() {
  if (!currentMapType) return;
  try {
    const stored = localStorage.getItem(getStorageKey());
    pins = stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.warn('Failed to load map pins:', e);
    pins = [];
  }
}

export function saveMapState(mapType, state) {
  try {
    localStorage.setItem(`fw-map-pins-${mapType}`, JSON.stringify(state.pins || []));
    localStorage.setItem(`fw-map-camera-${mapType}`, JSON.stringify(state.camera || { x: 0, y: 0, zoom: 1 }));
  } catch (e) {
    console.warn('Failed to save map state:', e);
  }
}

export function getMapState(mapType) {
  try {
    const pinsStored = localStorage.getItem(`fw-map-pins-${mapType}`);
    const cameraStored = localStorage.getItem(`fw-map-camera-${mapType}`);
    return {
      pins: pinsStored ? JSON.parse(pinsStored) : [],
      camera: cameraStored ? JSON.parse(cameraStored) : { x: 0, y: 0, zoom: 1 },
    };
  } catch (e) {
    return { pins: [], camera: { x: 0, y: 0, zoom: 1 } };
  }
}

// ── Popup handling ───────────────────────────────────────────
function showPopupForPin(pin) {
  if (!popup || !pin) return;
  const pos = worldToScreen(pin.x, pin.y);

  // Position popup above the pin
  let left = pos.x - 100;
  let top = pos.y - 90;

  // Clamp to canvas bounds
  left = Math.max(4, Math.min(W - 208, left));
  top = Math.max(4, Math.min(H - 100, top));

  popup.style.left = left + 'px';
  popup.style.top = top + 'px';

  const input = document.getElementById('mapPinInput');
  if (input) {
    input.value = pin.note || '';
    input.dataset.pinId = pin.id;
    setTimeout(() => input.focus(), 50);
  }

  popup.classList.add('open');
}

function hidePopup() {
  if (popup) popup.classList.remove('open');
}

// ── Event handlers ───────────────────────────────────────────
function onMouseDown(e) {
  if (e.button === 1 || (e.button === 0 && !placingPin)) {
    // Check if clicking on a pin
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const clickedPin = findPinAtScreen(sx, sy);
    if (clickedPin && e.button === 0) {
      // Select pin
      activePinId = clickedPin.id;
      showPopupForPin(clickedPin);
      render();
      return;
    }

    // Start panning
    isPanning = true;
    panStart = { x: e.clientX, y: e.clientY };
    cameraStart = { x: camera.x, y: camera.y };
    canvas.style.cursor = 'grabbing';
  }
}

function onMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;

  if (isPanning) {
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    camera.x = cameraStart.x + dx / camera.zoom;
    camera.y = cameraStart.y + dy / camera.zoom;
    return;
  }

  // Hover detection
  const prevHover = hoveredPinId;
  const hovered = findPinAtScreen(sx, sy);
  hoveredPinId = hovered ? hovered.id : null;
  if (prevHover !== hoveredPinId) {
    canvas.style.cursor = hoveredPinId ? 'pointer' : (placingPin ? 'crosshair' : 'grab');
  }
}

function onMouseUp(e) {
  if (isPanning) {
    isPanning = false;
    canvas.style.cursor = placingPin ? 'crosshair' : 'grab';
    // Save camera
    if (currentMapType) {
      try {
        localStorage.setItem(`fw-map-camera-${currentMapType}`, JSON.stringify(camera));
      } catch (_) { /* ignore */ }
    }
  }
}

function onWheel(e) {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;

  // World position under mouse before zoom
  const worldBefore = screenToWorld(sx, sy);

  // Apply zoom
  const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
  const newZoom = Math.max(0.3, Math.min(3.0, camera.zoom * zoomFactor));

  if (newZoom !== camera.zoom) {
    camera.zoom = newZoom;
    // Adjust camera so world point stays under mouse
    camera.x = -worldBefore.x + (sx - W / 2) / camera.zoom;
    camera.y = -worldBefore.y + (sy - H / 2) / camera.zoom;

    // Save camera
    if (currentMapType) {
      try {
        localStorage.setItem(`fw-map-camera-${currentMapType}`, JSON.stringify(camera));
      } catch (_) { /* ignore */ }
    }
  }
}

function onCanvasClick(e) {
  if (isPanning) return;
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;

  if (placingPin) {
    const worldPos = screenToWorld(sx, sy);
    const newPin = addPin(worldPos.x, worldPos.y);
    placingPin = false;
    activePinId = newPin.id;
    updatePlacePinButton();
    showPopupForPin(newPin);
    render();
    return;
  }

  // Check if clicked on empty space (deselect)
  const clickedPin = findPinAtScreen(sx, sy);
  if (!clickedPin) {
    activePinId = null;
    hidePopup();
    render();
  }
}

function onCanvasDoubleClick(e) {
  if (placingPin) return;
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  const worldPos = screenToWorld(sx, sy);
  const newPin = addPin(worldPos.x, worldPos.y);
  activePinId = newPin.id;
  showPopupForPin(newPin);
  render();
}

function onContextMenu(e) {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  const clickedPin = findPinAtScreen(sx, sy);
  if (clickedPin) {
    deletePin(clickedPin.id);
    render();
  }
}

// ── Touch support ────────────────────────────────────────────
let lastTouchDist = 0;

function onTouchStart(e) {
  if (e.touches.length === 1) {
    const t = e.touches[0];
    panStart = { x: t.clientX, y: t.clientY };
    cameraStart = { x: camera.x, y: camera.y };
    isPanning = true;
  } else if (e.touches.length === 2) {
    isPanning = false;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    lastTouchDist = Math.sqrt(dx * dx + dy * dy);
  }
}

function onTouchMove(e) {
  e.preventDefault();
  if (e.touches.length === 1 && isPanning) {
    const t = e.touches[0];
    const dx = t.clientX - panStart.x;
    const dy = t.clientY - panStart.y;
    camera.x = cameraStart.x + dx / camera.zoom;
    camera.y = cameraStart.y + dy / camera.zoom;
  } else if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (lastTouchDist > 0) {
      const zoomFactor = dist / lastTouchDist;
      camera.zoom = Math.max(0.3, Math.min(3.0, camera.zoom * zoomFactor));
    }
    lastTouchDist = dist;
  }
}

function onTouchEnd(e) {
  if (e.touches.length === 0) {
    isPanning = false;
    lastTouchDist = 0;
  }
}

// ── Toolbar button handlers ──────────────────────────────────
function updatePlacePinButton() {
  const btn = document.getElementById('mapPlacePinBtn');
  if (btn) {
    btn.classList.toggle('active', placingPin);
    btn.style.background = placingPin ? 'rgba(20,184,154,0.25)' : '';
  }
}

function togglePlacePinMode() {
  placingPin = !placingPin;
  updatePlacePinButton();
  canvas.style.cursor = placingPin ? 'crosshair' : 'grab';
}

function zoomIn() {
  camera.zoom = Math.min(3.0, camera.zoom * 1.3);
  if (currentMapType) {
    try {
      localStorage.setItem(`fw-map-camera-${currentMapType}`, JSON.stringify(camera));
    } catch (_) { /* ignore */ }
  }
}

function zoomOut() {
  camera.zoom = Math.max(0.3, camera.zoom / 1.3);
  if (currentMapType) {
    try {
      localStorage.setItem(`fw-map-camera-${currentMapType}`, JSON.stringify(camera));
    } catch (_) { /* ignore */ }
  }
}

function zoomReset() {
  camera = { x: 0, y: 0, zoom: 1 };
  if (currentMapType) {
    try {
      localStorage.setItem(`fw-map-camera-${currentMapType}`, JSON.stringify(camera));
    } catch (_) { /* ignore */ }
  }
}

// ── Resize handling ──────────────────────────────────────────
function onResize() {
  if (!canvas) return;
  // Read from canvas client size (respects CSS 100% sizing)
  W = canvas.clientWidth || 800;
  H = canvas.clientHeight || 600;
  // If canvas has no size (modal not yet visible), compute from modal
  if (H < 10) {
    const modal = document.getElementById('mapModal');
    if (modal) {
      const modalH = modal.clientHeight || window.innerHeight * 0.7;
      const head = modal.querySelector('.modal-head');
      const headH = head ? head.clientHeight : 48;
      H = modalH - headH;
      W = modal.clientWidth || window.innerWidth * 0.8;
    }
  }
  H = Math.max(H, 400);
  W = Math.max(W, 600);
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

// ── Theme change detection ───────────────────────────────────
let lastTheme = null;
function checkThemeChange() {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  if (theme !== lastTheme) {
    lastTheme = theme;
    render();
  }
}

// ── Public API ───────────────────────────────────────────────

/**
 * Initialize the interactive maps module.
 * Call once during app boot.
 */
export function initInteractiveMaps() {
  canvas = document.getElementById('interactiveMapCanvas');
  popup = document.getElementById('mapPinPopup');
  if (!canvas) return;

  ctx = canvas.getContext('2d');

  // Set initial size
  onResize();

  // Wire events
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mouseleave', () => { isPanning = false; canvas.style.cursor = placingPin ? 'crosshair' : 'grab'; });
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('click', onCanvasClick);
  canvas.addEventListener('dblclick', onCanvasDoubleClick);
  canvas.addEventListener('contextmenu', onContextMenu);

  // Touch events
  canvas.addEventListener('touchstart', onTouchStart, { passive: true });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', onTouchEnd);

  // Resize observer
  const resizeObserver = new ResizeObserver(onResize);
  if (canvas.parentElement) {
    resizeObserver.observe(canvas.parentElement);
  }

  // Toolbar buttons
  document.getElementById('mapPlacePinBtn')?.addEventListener('click', togglePlacePinMode);
  document.getElementById('mapZoomIn')?.addEventListener('click', zoomIn);
  document.getElementById('mapZoomOut')?.addEventListener('click', zoomOut);
  document.getElementById('mapZoomReset')?.addEventListener('click', zoomReset);

  // Close button on modal
  const closeBtn = document.querySelector('#mapScrim [data-close]');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeMap);
  }

  // Close on scrim click
  const scrim = document.getElementById('mapScrim');
  if (scrim) {
    scrim.addEventListener('click', (e) => {
      if (e.target === scrim) closeMap();
    });
  }

  // Pin popup buttons
  document.getElementById('mapPinSave')?.addEventListener('click', () => {
    const input = document.getElementById('mapPinInput');
    if (input && input.dataset.pinId) {
      updatePinNote(input.dataset.pinId, input.value.trim());
      hidePopup();
      render();
    }
  });

  document.getElementById('mapPinDelete')?.addEventListener('click', () => {
    const input = document.getElementById('mapPinInput');
    if (input && input.dataset.pinId) {
      deletePin(input.dataset.pinId);
      render();
    }
  });

  // Enter key in pin input saves
  document.getElementById('mapPinInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const input = document.getElementById('mapPinInput');
      if (input && input.dataset.pinId) {
        updatePinNote(input.dataset.pinId, input.value.trim());
        hidePopup();
        render();
      }
    }
  });

  // Escape closes map
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      // Only close if popup isn't open
      if (popup && popup.classList.contains('open')) {
        hidePopup();
      } else {
        closeMap();
      }
    }
  });

  // Theme change check loop
  setInterval(checkThemeChange, 500);
}

/**
 * Open a map modal.
 * @param {'town' | 'library'} mapType
 */
export function openMap(mapType) {
  if (mapType !== 'town' && mapType !== 'library') return;

  currentMapType = mapType;
  isOpen = true;

  // Load pins
  loadPinsFromStorage();

  // Load camera
  try {
    const cam = localStorage.getItem(`fw-map-camera-${currentMapType}`);
    if (cam) {
      camera = JSON.parse(cam);
    } else {
      camera = { x: 0, y: 0, zoom: 1 };
    }
  } catch (_) {
    camera = { x: 0, y: 0, zoom: 1 };
  }

  // Ensure canvas size is correct (deferred: modal needs a frame to get final size)
  onResize();
  requestAnimationFrame(() => requestAnimationFrame(onResize));

  // Update modal title/icon
  const titleEl = document.getElementById('mapTitle');
  const iconEl = document.getElementById('mapIcon');
  if (titleEl) titleEl.textContent = mapType === 'town' ? 'Town Map' : 'Library Layout';
  if (iconEl) iconEl.textContent = mapType === 'town' ? '\u25c8' : '\u25a6';

  // Reset modes
  placingPin = false;
  activePinId = null;
  hoveredPinId = null;
  hidePopup();
  updatePlacePinButton();

  // Show modal
  const scrim = document.getElementById('mapScrim');
  if (scrim) {
    scrim.classList.add('show');
  }

  canvas.style.cursor = 'grab';

  // Start render loop
  startRenderLoop();
}

/**
 * Close the map modal.
 */
export function closeMap() {
  isOpen = false;
  currentMapType = null;
  placingPin = false;
  activePinId = null;
  stopRenderLoop();

  const scrim = document.getElementById('mapScrim');
  if (scrim) {
    scrim.classList.remove('show');
  }
  hidePopup();
}
