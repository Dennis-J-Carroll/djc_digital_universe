# CONVERGENCE Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the CONVERGENCE interactive terminal narrative with reactive CRT effects, Web Audio sound, a live status bar, restart commands, and integrate it into the site as `/convergence` with a card on the Apps page.

**Architecture:** The game is a DOM-native HTML file served from `static/convergence-app.html`. A minimal Gatsby page at `src/pages/convergence.js` renders a full-viewport iframe (no Layout wrapper — the game gets the full browser window). The Apps catalog gets a new `Creative` category entry pointing to `/convergence`.

**Tech Stack:** Vanilla JS (Web Audio API, CSS custom properties), Gatsby (React, static file serving), Jest + @testing-library/react

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `static/convergence-app.html` | Create (copy + enhance) | The full game: all logic, styles, sound |
| `src/pages/convergence.js` | Create | Gatsby page — bare iframe, no Layout |
| `src/pages/__tests__/convergence.test.js` | Create | Tests for the Gatsby page |
| `src/pages/__tests__/apps.test.js` | Create | Tests including CONVERGENCE card presence |
| `src/pages/apps.js` | Modify | Add CONVERGENCE entry to `interactiveApps` |

---

## Task 1: Copy source file

**Files:**
- Create: `static/convergence-app.html`

- [ ] **Step 1: Copy the source**

```bash
cp "Add to site v2/convergence (1).html" static/convergence-app.html
```

- [ ] **Step 2: Verify the copy**

```bash
wc -l static/convergence-app.html
```
Expected: `1112` lines

- [ ] **Step 3: Open in browser to confirm baseline works**

```bash
# In a separate terminal — Gatsby dev should already be running or start it:
# npm run develop
# Then open http://localhost:8000/convergence-app.html
```
Expected: boot sequence runs, "begin" → hinges work, ending fires

- [ ] **Step 4: Commit**

```bash
git add static/convergence-app.html
git commit -m "feat(convergence): add base game file to static"
```

---

## Task 2: Status bar — HTML and CSS

**Files:**
- Modify: `static/convergence-app.html`

The status bar lives between the title bar and terminal body. It shows phase pips, temperature, session timer, and sound toggle.

- [ ] **Step 1: Insert status bar HTML**

Open `static/convergence-app.html`. Find this exact block (around line 411):

```html
  </div>

  <div class="terminal-body" id="terminalBody">
```

Replace it with:

```html
  </div>

  <div class="status-bar-strip" id="statusBarStrip">
    <span class="sb-phase">PHASE <span id="phasePips">▣░░░</span></span>
    <span class="sb-temp">TEMP <span id="tempBar" class="temp-calm">▓░░░░</span></span>
    <span class="sb-timer" id="statusTimer">00:00</span>
    <button class="snd-toggle" id="sndToggle" onclick="toggleSound()">[SND OFF]</button>
  </div>

  <div class="terminal-body" id="terminalBody">
```

- [ ] **Step 2: Add status bar CSS**

Find the closing `</style>` tag (after the `.cmd-input:disabled` rule, around line 337). Insert this block immediately before `</style>`:

```css
  /* ====== STATUS BAR ====== */
  .status-bar-strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    height: 26px;
    background: #0f0f0f;
    border-bottom: 1px solid rgba(27, 58, 92, 0.2);
    flex-shrink: 0;
    font-size: 13px;
    font-family: 'VT323', monospace;
    color: var(--muted);
    gap: 12px;
  }

  .sb-phase, .sb-temp, .sb-timer { letter-spacing: 0.5px; }

  .temp-calm  { color: #5A8C5A; }
  .temp-rising { color: var(--warn); }
  .temp-cold  { color: #cc6655; }

  .snd-toggle {
    background: transparent;
    border: 1px solid rgba(27, 58, 92, 0.3);
    color: var(--muted);
    font-family: 'VT323', monospace;
    font-size: 13px;
    padding: 1px 8px;
    border-radius: 3px;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
    margin-left: auto;
  }
  .snd-toggle:hover { border-color: var(--accent-light); color: var(--accent-light); }
  .snd-toggle.active { color: var(--accent-light); border-color: var(--accent-light); }

  /* ====== REACTIVE CRT — custom properties ====== */
  /* Breathing animation for max-coldness state */
  @keyframes breathe {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.0018); }
  }
  .breathe-active { animation: breathe 6s ease-in-out infinite; }

  /* Candor cooling flash */
  @keyframes cooling-flash {
    0%   { filter: brightness(1); }
    30%  { filter: brightness(0.78); }
    100% { filter: brightness(1); }
  }
  .cooling-flash { animation: cooling-flash 0.35s ease-out forwards; }
```

- [ ] **Step 3: Open in browser and confirm status bar renders**

Verify the strip appears between title bar and terminal. Check spacing and font match the rest of the TUI.

- [ ] **Step 4: Commit**

```bash
git add static/convergence-app.html
git commit -m "feat(convergence): add status bar HTML and CSS"
```

---

## Task 3: CSS custom properties for reactive CRT

**Files:**
- Modify: `static/convergence-app.html`

Convert hardcoded visual values to CSS custom properties so `updateCRTState()` can drive them from JS.

- [ ] **Step 1: Update `.convergence-text` to use custom properties**

Find this rule:

```css
  .convergence-text {
    color: var(--accent-light);
    text-shadow: 0 0 8px rgba(46, 90, 140, 0.5),
                 0 0 16px rgba(27, 58, 92, 0.3);
  }
```

Replace with:

```css
  .convergence-text {
    color: var(--accent-light);
    text-shadow:
      0 0 var(--phosphor-glow, 8px)  rgba(46, 90, 140, var(--phosphor-alpha,  0.5)),
      0 0 var(--phosphor-glow2, 16px) rgba(27, 58, 92,  var(--phosphor-alpha2, 0.3));
  }
```

- [ ] **Step 2: Update `.scanlines` to use custom property for opacity**

Find:

```css
  .scanlines {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 1000;
    background: repeating-linear-gradient(
      0deg,
      rgba(27, 58, 92, 0.03) 0px,
      rgba(27, 58, 92, 0.03) 1px,
      transparent 1px,
      transparent 3px
    );
  }
```

Replace with:

```css
  .scanlines {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 1000;
    background: repeating-linear-gradient(
      0deg,
      rgba(27, 58, 92, var(--scanline-opacity, 0.03)) 0px,
      rgba(27, 58, 92, var(--scanline-opacity, 0.03)) 1px,
      transparent 1px,
      transparent 3px
    );
  }
```

- [ ] **Step 3: Commit**

```bash
git add static/convergence-app.html
git commit -m "feat(convergence): convert CRT visuals to CSS custom properties"
```

---

## Task 4: Reactive CRT — updateCRTState, triggerCandorFlash, chooseOption hookup

**Files:**
- Modify: `static/convergence-app.html`

- [ ] **Step 1: Add `crtLevel` to state object**

Find:

```js
  startTime: Date.now(),
  bootComplete: false
};
```

Replace with:

```js
  startTime: Date.now(),
  bootComplete: false,
  crtLevel: 0
};
```

- [ ] **Step 2: Add `updateCRTState()` function**

Find the `// ============ SCREEN EFFECTS ============` comment. Insert this entire block immediately before it:

```js
// ============ REACTIVE CRT ============
function updateCRTState(coldness, candor) {
  const cold = Math.min(coldness, 6);
  const t = cold / 6;

  const glow  = (4  + t * 14).toFixed(1) + 'px';
  const glow2 = (8  + t * 28).toFixed(1) + 'px';
  const alpha  = (0.40 + t * 0.50).toFixed(3);
  const alpha2 = (0.25 + t * 0.35).toFixed(3);
  const scanline = (0.025 + t * 0.060).toFixed(4);

  const root = document.documentElement;
  root.style.setProperty('--phosphor-glow',   glow);
  root.style.setProperty('--phosphor-glow2',  glow2);
  root.style.setProperty('--phosphor-alpha',  alpha);
  root.style.setProperty('--phosphor-alpha2', alpha2);
  root.style.setProperty('--scanline-opacity', scanline);

  if (cold >= 5) {
    $terminalWindow.classList.add('breathe-active');
  } else {
    $terminalWindow.classList.remove('breathe-active');
  }

  state.crtLevel = cold;
}

function triggerCandorFlash() {
  $terminalWindow.classList.remove('cooling-flash');
  // Force reflow so re-adding the class restarts the animation
  void $terminalWindow.offsetWidth;
  $terminalWindow.classList.add('cooling-flash');
  setTimeout(() => $terminalWindow.classList.remove('cooling-flash'), 400);
}
```

- [ ] **Step 3: Update `maybeGlitch()` to use dynamic chance**

Find:

```js
function maybeGlitch() {
  if (Math.random() < 0.05) {
    $terminalWindow.classList.add('glitch');
    setTimeout(() => $terminalWindow.classList.remove('glitch'), 150);
  }
}
```

Replace with:

```js
function maybeGlitch() {
  const t = (state.crtLevel || 0) / 6;
  const chance = 0.02 + t * 0.16;
  if (Math.random() < chance) {
    $terminalWindow.classList.add('glitch');
    setTimeout(() => $terminalWindow.classList.remove('glitch'), 150);
  }
}
```

Note: `playCrackle()` is added here in Task 7 after the sound system is defined.

- [ ] **Step 4: Hook `updateCRTState` and `triggerCandorFlash` into `chooseOption()`**

Find this block in `chooseOption()`:

```js
  // update temperature model
  if (opt.tone === 'crack') { state.candor += 1; state.coldness = Math.max(0, state.coldness - 1); }
  else if (opt.tone === 'rationalize') { state.candor += 0.5; state.coldness += 0.5; }
  else { state.coldness += 1; } // deny / deflect
```

Replace with:

```js
  // update temperature model
  if (opt.tone === 'crack') {
    state.candor += 1;
    state.coldness = Math.max(0, state.coldness - 1);
    triggerCandorFlash();
  } else if (opt.tone === 'rationalize') {
    state.candor += 0.5;
    state.coldness += 0.5;
  } else {
    state.coldness += 1; // deny / deflect
  }
  updateCRTState(state.coldness, state.candor);
```

Note: `updateStatusBar()` is wired here in Task 6 (after it is defined). Sound calls (`playCoolingTone`, `playCrackle`) are wired in Task 7.

- [ ] **Step 5: Open browser, play through at least 3 deny choices, confirm phosphor intensifies and scanlines deepen. Make a crack choice, confirm cooling flash fires.**

- [ ] **Step 6: Commit**

```bash
git add static/convergence-app.html
git commit -m "feat(convergence): reactive CRT — coldness drives phosphor, scanlines, breathe"
```

---

## Task 5: Dynamic flicker loop

**Files:**
- Modify: `static/convergence-app.html`

- [ ] **Step 1: Replace `startFlickerLoop()` with coldness-aware version**

Find:

```js
function startFlickerLoop() {
  function flick() {
    setNamedTimer('flicker', () => {
      if (!document.hidden) {
        $terminalWindow.classList.add('flicker');
        setTimeout(() => $terminalWindow.classList.remove('flicker'), 80);
      }
      flick();
    }, randomDelay(8000, 15000));
  }
  flick();
}
```

Replace with:

```js
function startFlickerLoop() {
  function flick() {
    const t = (state.crtLevel || 0) / 6;
    const minMs = Math.round(14000 - t * 12000);
    const maxMs = Math.round(18000 - t * 15000);
    setNamedTimer('flicker', () => {
      if (!document.hidden) {
        $terminalWindow.classList.add('flicker');
        setTimeout(() => $terminalWindow.classList.remove('flicker'), 80);
      }
      flick();
    }, randomDelay(minMs, maxMs));
  }
  flick();
}
```

- [ ] **Step 2: Commit**

```bash
git add static/convergence-app.html
git commit -m "feat(convergence): dynamic flicker interval scales with coldness"
```

---

## Task 6: Status bar updates and session timer

**Files:**
- Modify: `static/convergence-app.html`

- [ ] **Step 1: Add `updateStatusBar()` and `startStatusTimer()`**

Find the `// ============ REACTIVE CRT ============` comment added in Task 4. Insert this new block immediately before it:

```js
// ============ STATUS BAR ============
function updateStatusBar() {
  // Phase pips — one pip per phase (1–4)
  const phase = Math.max(1, state.phase);
  const pips = Array.from({ length: 4 }, (_, i) => i < phase ? '▣' : '░').join('');
  document.getElementById('phasePips').textContent = pips;

  // Temperature bar — coldness 0..6 mapped to 0..5 blocks
  const filled = Math.min(5, Math.round((state.coldness / 6) * 5));
  const tempStr = '▓'.repeat(filled) + '░'.repeat(5 - filled);
  const tempEl = document.getElementById('tempBar');
  tempEl.textContent = tempStr;
  tempEl.className = state.coldness <= 1 ? 'temp-calm'
                   : state.coldness <= 3 ? 'temp-rising'
                   : 'temp-cold';
}

function startStatusTimer() {
  setInterval(() => {
    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const ss = String(elapsed % 60).padStart(2, '0');
    const el = document.getElementById('statusTimer');
    if (el) el.textContent = mm + ':' + ss;
  }, 1000);
}
```

- [ ] **Step 2: Call `updateStatusBar()` and `startStatusTimer()` after boot completes**

Find inside `showOpening()` the callback where boot is done:

```js
              state.bootComplete = true;
              state.phase = 1;
              $input.disabled = false;
              $input.focus();
              appendText('', '');
              appendText("Type 'begin' to proceed. Type 'help' for commands.", 'muted-text');
```

Replace with:

```js
              state.bootComplete = true;
              state.phase = 1;
              $input.disabled = false;
              $input.focus();
              appendText('', '');
              appendText("Type 'begin' to proceed. Type 'help' for commands.", 'muted-text');
              updateStatusBar();
              startStatusTimer();
```

Note: `startHum()` is added here in Task 7 after the sound system is defined.

- [ ] **Step 3: Add `updateStatusBar()` to `chooseOption()` (now that it is defined)**

Find in `chooseOption()` (already modified in Task 4):

```js
  updateCRTState(state.coldness, state.candor);
```

Replace with:

```js
  updateCRTState(state.coldness, state.candor);
  updateStatusBar();
```

- [ ] **Step 4: Call `updateStatusBar()` on phase transitions**

Find in `presentHinge()`:

```js
  if (h.phase !== state.phase) {
    state.phase = h.phase;
    phaseFlash();
    unlockLogsForPhase(h.phase);
  }
```

Replace with:

```js
  if (h.phase !== state.phase) {
    state.phase = h.phase;
    phaseFlash();
    unlockLogsForPhase(h.phase);
    updateStatusBar();
  }
```

- [ ] **Step 5: Open in browser, confirm pips advance on phase change, TEMP bar fills on deny choices, timer counts up.**

- [ ] **Step 6: Commit**

```bash
git add static/convergence-app.html
git commit -m "feat(convergence): status bar live updates — phase pips, temp, timer"
```

---

## Task 7: Web Audio sound system

**Files:**
- Modify: `static/convergence-app.html`

- [ ] **Step 1: Add the sound system block**

Find `// ============ TIMER MANAGEMENT ============`. Insert this entire block immediately before it:

```js
// ============ SOUND SYSTEM ============
const sound = {
  ctx: null,
  enabled: false,
  humNode: null,
  humGain: null,
};

function initAudio() {
  if (sound.ctx) return;
  try {
    sound.ctx = new (window.AudioContext || window.webkitAudioContext)();
    sound.enabled = localStorage.getItem('convergence-snd') === 'on';
    updateSndButton();
  } catch (e) { /* Web Audio not available */ }
}

function startHum() {
  if (!sound.ctx || !sound.enabled || sound.humNode) return;
  sound.humGain = sound.ctx.createGain();
  sound.humGain.gain.setValueAtTime(0.015, sound.ctx.currentTime);
  sound.humNode = sound.ctx.createOscillator();
  sound.humNode.type = 'sine';
  sound.humNode.frequency.setValueAtTime(60, sound.ctx.currentTime);
  sound.humNode.connect(sound.humGain);
  sound.humGain.connect(sound.ctx.destination);
  sound.humNode.start();
}

function stopHum() {
  if (sound.humNode) { try { sound.humNode.stop(); } catch(e) {} sound.humNode.disconnect(); sound.humNode = null; }
  if (sound.humGain) { sound.humGain.disconnect(); sound.humGain = null; }
}

function playClick() {
  if (!sound.ctx || !sound.enabled) return;
  const sr = sound.ctx.sampleRate;
  const buf = sound.ctx.createBuffer(1, Math.floor(sr * 0.003), sr);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = sound.ctx.createBufferSource();
  src.buffer = buf;
  const gain = sound.ctx.createGain();
  gain.gain.setValueAtTime(0.08, sound.ctx.currentTime);
  src.connect(gain); gain.connect(sound.ctx.destination);
  src.start();
}

function playCrackle() {
  if (!sound.ctx || !sound.enabled) return;
  const sr = sound.ctx.sampleRate;
  const dur = 0.08;
  const buf = sound.ctx.createBuffer(1, Math.floor(sr * dur), sr);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = sound.ctx.createBufferSource();
  src.buffer = buf;
  const bpf = sound.ctx.createBiquadFilter();
  bpf.type = 'bandpass';
  bpf.frequency.setValueAtTime(2000, sound.ctx.currentTime);
  bpf.Q.setValueAtTime(2, sound.ctx.currentTime);
  const gain = sound.ctx.createGain();
  gain.gain.setValueAtTime(0.12, sound.ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, sound.ctx.currentTime + dur);
  src.connect(bpf); bpf.connect(gain); gain.connect(sound.ctx.destination);
  src.start();
}

function playPing() {
  if (!sound.ctx || !sound.enabled) return;
  const osc = sound.ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, sound.ctx.currentTime);
  const gain = sound.ctx.createGain();
  gain.gain.setValueAtTime(0.06, sound.ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, sound.ctx.currentTime + 0.04);
  osc.connect(gain); gain.connect(sound.ctx.destination);
  osc.start(); osc.stop(sound.ctx.currentTime + 0.05);
}

function playCoolingTone() {
  if (!sound.ctx || !sound.enabled) return;
  const osc = sound.ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, sound.ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(220, sound.ctx.currentTime + 0.2);
  const gain = sound.ctx.createGain();
  gain.gain.setValueAtTime(0.05, sound.ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, sound.ctx.currentTime + 0.22);
  osc.connect(gain); gain.connect(sound.ctx.destination);
  osc.start(); osc.stop(sound.ctx.currentTime + 0.25);
}

function toggleSound() {
  if (!sound.ctx) { initAudio(); }
  sound.enabled = !sound.enabled;
  localStorage.setItem('convergence-snd', sound.enabled ? 'on' : 'off');
  updateSndButton();
  if (sound.enabled) startHum();
  else stopHum();
}

function updateSndButton() {
  const btn = document.getElementById('sndToggle');
  if (!btn) return;
  btn.textContent = sound.enabled ? '[SND ON]' : '[SND OFF]';
  btn.classList.toggle('active', sound.enabled);
}
```

- [ ] **Step 2: Initialize audio on first user interaction**

Find the `$input.addEventListener('keydown', (e) => {` block. At the very top of that handler (first line inside the callback), add:

```js
  initAudio();
```

Also find `$terminalBody.addEventListener('click', () => {` and add `initAudio();` inside it:

```js
$terminalBody.addEventListener('click', () => { initAudio(); if (!state.isTyping) $input.focus(); });
```

- [ ] **Step 3: Add `playClick()` to `typeWrite()`**

Find inside `typeNext()` in `typeWrite()`:

```js
      element.textContent += text.charAt(i);
      i++;
      maybeGlitch();
```

Replace with:

```js
      element.textContent += text.charAt(i);
      i++;
      playClick();
      maybeGlitch();
```

- [ ] **Step 4: Add `playPing()` to `typeWriteToOutput()`**

Find:

```js
function typeWriteToOutput(text, className, speedMin, speedMax, onComplete) {
  const div = document.createElement('div');
  div.className = 'output-line' + (className ? ' ' + className : '');
  $output.appendChild(div);
  typeWrite(div, text, speedMin, speedMax, onComplete);
  return div;
}
```

Replace with:

```js
function typeWriteToOutput(text, className, speedMin, speedMax, onComplete) {
  const div = document.createElement('div');
  div.className = 'output-line' + (className ? ' ' + className : '');
  $output.appendChild(div);
  if (className && className.includes('convergence-text')) playPing();
  typeWrite(div, text, speedMin, speedMax, onComplete);
  return div;
}
```

- [ ] **Step 5: Add `startHum()` to the boot completion callback (deferred from Task 6)**

Find in `showOpening()`:

```js
              updateStatusBar();
              startStatusTimer();
```

Replace with:

```js
              updateStatusBar();
              startStatusTimer();
              startHum();
```

- [ ] **Step 6: Add `playCrackle()` to `maybeGlitch()` (deferred from Task 4)**

Find:

```js
function maybeGlitch() {
  const t = (state.crtLevel || 0) / 6;
  const chance = 0.02 + t * 0.16;
  if (Math.random() < chance) {
    $terminalWindow.classList.add('glitch');
    setTimeout(() => $terminalWindow.classList.remove('glitch'), 150);
  }
}
```

Replace with:

```js
function maybeGlitch() {
  const t = (state.crtLevel || 0) / 6;
  const chance = 0.02 + t * 0.16;
  if (Math.random() < chance) {
    $terminalWindow.classList.add('glitch');
    playCrackle();
    setTimeout(() => $terminalWindow.classList.remove('glitch'), 150);
  }
}
```

- [ ] **Step 7: Add `playCoolingTone()` to `chooseOption()` for crack choices (deferred from Task 4)**

Find in `chooseOption()`:

```js
  if (opt.tone === 'crack') {
    state.candor += 1;
    state.coldness = Math.max(0, state.coldness - 1);
    triggerCandorFlash();
  } else if (opt.tone === 'rationalize') {
```

Replace with:

```js
  if (opt.tone === 'crack') {
    state.candor += 1;
    state.coldness = Math.max(0, state.coldness - 1);
    triggerCandorFlash();
    playCoolingTone();
  } else if (opt.tone === 'rationalize') {
```

- [ ] **Step 8: Open in browser. Enable sound via `[SND OFF]` button. Confirm:**
  - Click fires keyboard click sounds during typing
  - CONVERGENCE lines play a faint ping at start
  - Deny 3+ choices then trigger a glitch — confirm crackle plays
  - Make a `crack` choice — confirm cooling tone plays
  - Toggle off — all sounds stop, hum stops
  - Refresh — [SND OFF] by default (localStorage off)
  - Enable, refresh — [SND ON] restored

- [ ] **Step 9: Commit**

```bash
git add static/convergence-app.html
git commit -m "feat(convergence): Web Audio sound system — hum, click, crackle, ping, cooling tone"
```

---

## Task 8: Restart commands

**Files:**
- Modify: `static/convergence-app.html`

- [ ] **Step 1: Add `doRestart()` function**

Find `// ============ ENDING (withheld) ============`. Insert this block immediately before it:

```js
// ============ RESTART ============
function doRestart(fast) {
  clearAllTimers();
  stopHum();

  // Reset all game state
  state.phase = 0;
  state.hingeIndex = 0;
  state.hingeOpen = false;
  state.coldness = 0;
  state.candor = 0;
  state.logsUnlocked = [];
  state.finished = false;
  state.commandHistory = [];
  state.historyIndex = -1;
  state.isTyping = false;
  state.startTime = Date.now();
  state.bootComplete = false;
  state.crtLevel = 0;
  state.currentHinge = null;
  state.currentHingeBlock = null;

  // Reset CRT to calm state
  updateCRTState(0, 0);
  $terminalWindow.classList.remove('breathe-active', 'cooling-flash', 'glitch');
  updateStatusBar();

  // Clear terminal output
  $output.innerHTML = '';
  $input.disabled = true;
  $input.value = '';

  if (fast) {
    state.phase = 1;
    state.bootComplete = true;
    showOpening();
  } else {
    runBootSequence();
  }
}
```

- [ ] **Step 2: Add `restart` and `restart --fast` to command parser**

Find:

```js
const commands = ['begin', 'help', 'status', 'logs', 'exit', 'clear'];
```

Replace with:

```js
const commands = ['begin', 'help', 'status', 'logs', 'exit', 'clear', 'restart'];
```

Find the `switch (cmd.toLowerCase())` block:

```js
    case 'clear': doClear(); break;
    default: doUnknown();
```

Replace with:

```js
    case 'clear': doClear(); break;
    case 'restart': doRestart(false); break;
    case 'restart --fast': doRestart(true); break;
    default: doUnknown();
```

- [ ] **Step 3: Add `restart` to the help text**

Find in `doHelp()`:

```js
    'exit      Attempt to leave',
```

Replace with:

```js
    'exit      Attempt to leave',
    'restart   Restart from boot  (restart --fast skips boot)',
```

- [ ] **Step 4: Test restart flow in browser:**
  - Play through to ending, type `restart` — full boot fires, all state resets, CRT calms
  - After ending, type `restart --fast` — skips boot, CONVERGENCE opening appears immediately
  - During active play (not finished), type `restart` — also works, game resets

- [ ] **Step 5: Commit**

```bash
git add static/convergence-app.html
git commit -m "feat(convergence): restart / restart --fast commands"
```

---

## Task 9: Gatsby page — TDD

**Files:**
- Create: `src/pages/convergence.js`
- Create: `src/pages/__tests__/convergence.test.js`

The convergence page uses NO Layout wrapper — the game gets the full browser viewport. The Gatsby `Head` export handles SEO.

- [ ] **Step 1: Write the failing test**

Create `src/pages/__tests__/convergence.test.js`:

```js
import React from 'react';
import { render } from '@testing-library/react';
import ConvergencePage, { Head } from '../convergence';

jest.mock('../../components/shared/seo', () => {
  return function Seo({ title, description }) {
    return <meta data-testid="seo" data-title={title} data-description={description} />;
  };
});

describe('ConvergencePage', () => {
  it('renders a full-viewport iframe pointing to the game file', () => {
    const { container } = render(<ConvergencePage />);
    const iframe = container.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe.getAttribute('src')).toBe('/convergence-app.html');
    expect(iframe.style.width).toBe('100%');
    expect(iframe.style.height).toBe('100vh');
    expect(iframe.style.border).toBe('none');
  });

  it('renders nothing else — no nav, no footer, no wrapper divs', () => {
    const { container } = render(<ConvergencePage />);
    // Only one child: the iframe
    expect(container.children).toHaveLength(1);
    expect(container.firstChild.tagName).toBe('IFRAME');
  });

  it('iframe has an accessible title attribute', () => {
    const { container } = render(<ConvergencePage />);
    const iframe = container.querySelector('iframe');
    expect(iframe.getAttribute('title')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test — confirm it fails**

```bash
npm test -- --testPathPattern="convergence.test" --no-coverage
```

Expected: FAIL — `Cannot find module '../convergence'`

- [ ] **Step 3: Create `src/pages/convergence.js`**

```jsx
import React from 'react';
import Seo from '../components/shared/seo';

export default function ConvergencePage() {
  return (
    <iframe
      src="/convergence-app.html"
      style={{ width: '100%', height: '100vh', border: 'none', display: 'block' }}
      title="CONVERGENCE terminal narrative"
    />
  );
}

export const Head = () => (
  <Seo
    title="CONVERGENCE — meridian_term v3.1.4"
    description="An AI has been reading your files. It has questions. Interactive terminal narrative with live mech-interp concepts."
  />
);
```

- [ ] **Step 4: Run the test — confirm it passes**

```bash
npm test -- --testPathPattern="convergence.test" --no-coverage
```

Expected: PASS (3 tests)

- [ ] **Step 5: Open in browser via Gatsby dev server**

Navigate to `http://localhost:8000/convergence` — game should fill the full browser window with no nav bar visible.

- [ ] **Step 6: Commit**

```bash
git add src/pages/convergence.js src/pages/__tests__/convergence.test.js
git commit -m "feat(convergence): Gatsby page — full-viewport iframe at /convergence"
```

---

## Task 10: Apps catalog card — TDD

**Files:**
- Create: `src/pages/__tests__/apps.test.js`
- Modify: `src/pages/apps.js`

- [ ] **Step 1: Write the failing test**

Create `src/pages/__tests__/apps.test.js`:

```js
import React from 'react';
import { render, screen } from '@testing-library/react';
import AppsPage from '../apps';

// Mock framer-motion
jest.mock('framer-motion', () => {
  const React = require('react');
  const passthrough = ({ children, initial, animate, whileInView, transition, variants, viewport, exit, layoutId, ...props }) =>
    React.createElement('div', props, children);
  return { motion: new Proxy({}, { get: () => passthrough }) };
});

// Mock Layout
jest.mock('../../components/layout/layout', () => {
  return function Layout({ children }) {
    return <div data-testid="layout">{children}</div>;
  };
});

const mockLocation = { pathname: '/apps' };

describe('AppsPage', () => {
  it('renders without crashing', () => {
    render(<AppsPage location={mockLocation} />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('includes CONVERGENCE in the app list', () => {
    render(<AppsPage location={mockLocation} />);
    expect(screen.getByText('CONVERGENCE')).toBeInTheDocument();
  });

  it('CONVERGENCE is in the Creative category section', () => {
    render(<AppsPage location={mockLocation} />);
    const convergenceEl = screen.getByText('CONVERGENCE');
    // The Creative heading should exist
    expect(screen.getByText('Creative')).toBeInTheDocument();
    // The CONVERGENCE card anchor points to /convergence
    const link = convergenceEl.closest('a') || convergenceEl.closest('[href]');
    if (link) {
      expect(link.getAttribute('href')).toBe('/convergence');
    }
  });

  it('CONVERGENCE card description mentions interactive narrative', () => {
    render(<AppsPage location={mockLocation} />);
    expect(screen.getByText(/interactive narrative/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test — confirm it fails**

```bash
npm test -- --testPathPattern="apps.test" --no-coverage
```

Expected: FAIL — "Unable to find an element with the text: 'CONVERGENCE'"

- [ ] **Step 3: Add CONVERGENCE to `interactiveApps` in `src/pages/apps.js`**

Open `src/pages/apps.js`. Find the `interactiveApps` array. Find the line for `'Chroma Echo Visualizer'` (first Creative category entry, around line 212):

```js
    { title: 'Chroma Echo Visualizer', path: '/apps/Chroma_Echo.html', ...
```

Insert this entry immediately before it:

```js
    { title: 'CONVERGENCE', path: '/convergence', description: 'An AI has been reading your files. It has questions. A terminal-based interactive narrative with live mech-interp concepts woven into the interrogation.', category: 'Creative', featured: true },
```

- [ ] **Step 4: Run the test — confirm it passes**

```bash
npm test -- --testPathPattern="apps.test" --no-coverage
```

Expected: PASS (4 tests)

- [ ] **Step 5: Run the full test suite to confirm no regressions**

```bash
npm test --no-coverage
```

Expected: all existing tests still pass

- [ ] **Step 6: Open `http://localhost:8000/apps` in browser, filter to Creative, confirm CONVERGENCE card appears with FEATURED badge and correct icon.**

- [ ] **Step 7: Click the CONVERGENCE card — confirm it opens `/convergence` in a new tab with the full-screen game.**

- [ ] **Step 8: Commit**

```bash
git add src/pages/apps.js src/pages/__tests__/apps.test.js
git commit -m "feat(convergence): add CONVERGENCE card to Apps catalog — Creative/featured"
```

---

## Final verification checklist

- [ ] `npm run build` completes without errors
- [ ] Navigate to `/convergence` — game fills full viewport, no nav visible
- [ ] Boot sequence runs, type `begin`, all 6 hinges complete, ending fires
- [ ] Deny 5+ choices — phosphor brightens, scanlines intensify, flicker speeds up, breathe animation starts at coldness 5
- [ ] Make a `crack` choice — cooling flash fires, cooling tone plays (if SND ON)
- [ ] Enable SND — hum starts, clicks fire per character, pings on CONVERGENCE lines
- [ ] Disable SND — all audio stops immediately
- [ ] `restart` command resets all state, full boot
- [ ] `restart --fast` skips to opening
- [ ] Status bar: phase pips advance correctly, TEMP bar fills/empties with coldness, timer counts up
- [ ] Apps page `/apps`: CONVERGENCE card visible in Creative section, FEATURED badge present
- [ ] Mobile: game is playable on a phone-width screen (TUI adapts via existing responsive CSS)
