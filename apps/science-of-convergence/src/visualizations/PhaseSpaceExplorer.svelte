<script>
  import { onMount } from 'svelte';
  import { cobwebData, regime } from '../lib/math/logisticMap.js';

  // Canvas logical dimensions
  const CW = 500;
  const CH = 500;
  const MARGIN = 30;

  // Trajectory color cycle
  const COLORS = [
    '#A07C5B',
    '#7B5E4D',
    '#8B6914',
    '#5C7A6B',
    '#8B4A3A',
    '#6B5C8B',
  ];

  const MAX_TRAJECTORIES = 6;
  const COBWEB_STEPS = 40;

  let canvas;
  let ctx = null;

  let r = 3.0;
  let trajectories = []; // Array of { x0, color }
  let colorIndex = 0;

  // ---- Coordinate helpers ----

  function toCanvasX(x) {
    return MARGIN + x * (CW - 2 * MARGIN);
  }

  function toCanvasY(y) {
    // y ∈ [0,1] → canvas [CH-MARGIN, MARGIN] (inverted)
    return CH - MARGIN - y * (CH - 2 * MARGIN);
  }

  function fromCanvasX(cx) {
    return (cx - MARGIN) / (CW - 2 * MARGIN);
  }

  // ---- Drawing ----

  function drawBackground() {
    ctx.fillStyle = '#FDFBF7';
    ctx.fillRect(0, 0, CW, CH);
  }

  function drawAxes() {
    ctx.save();
    ctx.strokeStyle = 'rgba(160,124,91,0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    // x-axis (y=0 line)
    ctx.beginPath();
    ctx.moveTo(MARGIN, toCanvasY(0));
    ctx.lineTo(CW - MARGIN, toCanvasY(0));
    ctx.stroke();

    // y-axis (x=0 line)
    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), MARGIN);
    ctx.lineTo(toCanvasX(0), CH - MARGIN);
    ctx.stroke();

    ctx.restore();
  }

  function drawDiagonal() {
    ctx.save();
    ctx.strokeStyle = 'rgba(160,124,91,0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), toCanvasY(0));
    ctx.lineTo(toCanvasX(1), toCanvasY(1));
    ctx.stroke();

    ctx.restore();
  }

  function drawParabola() {
    const SAMPLES = 200;
    ctx.save();
    ctx.strokeStyle = '#A07C5B';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);

    ctx.beginPath();
    for (let i = 0; i <= SAMPLES; i++) {
      const x = i / SAMPLES;
      const y = r * x * (1 - x);
      const cx = toCanvasX(x);
      const cy = toCanvasY(y);
      if (i === 0) {
        ctx.moveTo(cx, cy);
      } else {
        ctx.lineTo(cx, cy);
      }
    }
    ctx.stroke();

    ctx.restore();
  }

  function drawCobweb(traj) {
    const pts = cobwebData(traj.x0, r, COBWEB_STEPS);
    if (pts.length < 2) return;

    ctx.save();
    ctx.strokeStyle = traj.color;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);

    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const [x, y] = pts[i];
      const cx = toCanvasX(x);
      const cy = toCanvasY(y);
      if (i === 0) {
        ctx.moveTo(cx, cy);
      } else {
        ctx.lineTo(cx, cy);
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  function draw() {
    if (!ctx) return;
    drawBackground();
    drawAxes();
    drawDiagonal();
    drawParabola();
    for (const traj of trajectories) {
      drawCobweb(traj);
    }
  }

  // ---- Trajectory management ----

  function addTrajectory(x0) {
    const color = COLORS[colorIndex % COLORS.length];
    colorIndex = (colorIndex + 1) % COLORS.length;

    if (trajectories.length >= MAX_TRAJECTORIES) {
      trajectories = [...trajectories.slice(1), { x0, color }];
    } else {
      trajectories = [...trajectories, { x0, color }];
    }

    draw();
  }

  function addRandomTrajectory() {
    const x0 = Math.random() * 0.98 + 0.01;
    addTrajectory(x0);
  }

  function clearTrajectories() {
    trajectories = [];
    draw();
  }

  // ---- Canvas interactions ----

  function getCanvasX(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = CW / rect.width;
    return (e.clientX - rect.left) * scaleX;
  }

  function onCanvasClick(e) {
    const cx = getCanvasX(e);
    let x0 = fromCanvasX(cx);
    x0 = Math.max(0.01, Math.min(0.99, x0));
    addTrajectory(x0);
  }

  function onCanvasKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      addRandomTrajectory();
    }
  }

  // ---- Reactive redraw on r change ----

  $: if (ctx) {
    r; // tracked dependency
    draw();
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    draw();
  });
</script>

<div class="phase-wrapper">
  <div class="controls">
    <label class="slider-label">
      <span>r = {r.toFixed(2)}</span>
      <input
        type="range"
        min="0.5"
        max="4.0"
        step="0.01"
        bind:value={r}
        aria-label="Parameter r for logistic map"
      />
    </label>

    <button
      class="action-btn"
      on:click={addRandomTrajectory}
      aria-label="Add trajectory from random initial condition"
    >
      Add random IC
    </button>

    <button
      class="action-btn"
      on:click={clearTrajectories}
      aria-label="Clear all trajectories"
    >
      Clear
    </button>
  </div>

  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-role-has-required-interactive-content -->
  <!-- role="img" on canvas is valid per ARIA spec; Svelte linter incorrectly flags it -->
  <canvas
    bind:this={canvas}
    width={CW}
    height={CH}
    role="img"
    aria-label="Phase space cobweb diagram. The curve shows f(x)=r·x·(1−x), cobweb lines trace iterates from initial condition x₀."
    class="phase-canvas"
    tabindex="0"
    on:click={onCanvasClick}
    on:keydown={onCanvasKeydown}
  ></canvas>

  <p class="regime-label" aria-live="polite">Regime: {regime(r)}</p>

  <details class="data-table-details">
    <summary>Data table (accessibility)</summary>
    <table aria-label="Phase space explorer trajectory data">
      <thead>
        <tr>
          <th scope="col">x₀</th>
          <th scope="col">Color</th>
          <th scope="col">Regime</th>
        </tr>
      </thead>
      <tbody>
        {#if trajectories.length === 0}
          <tr>
            <td colspan="3">No trajectories added yet.</td>
          </tr>
        {:else}
          {#each trajectories as traj}
            <tr>
              <td>{traj.x0.toFixed(4)}</td>
              <td>
                <span
                  class="color-swatch"
                  style="background: {traj.color}"
                  aria-label={traj.color}
                ></span>
                {traj.color}
              </td>
              <td>{regime(r)}</td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </details>
</div>

<style>
  .phase-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
  }

  .slider-label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.85em;
    font-family: sans-serif;
    color: var(--accent);
    font-weight: 500;
    white-space: nowrap;
  }

  .slider-label input[type="range"] {
    width: 160px;
    accent-color: var(--primary);
    cursor: pointer;
  }

  .slider-label input[type="range"]:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
    border-radius: 2px;
  }

  .action-btn {
    padding: 7px 16px;
    font-size: 0.8em;
    font-family: sans-serif;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    border: 1px solid var(--border);
    border-radius: 4px;
    cursor: pointer;
    background: var(--formula-bg);
    color: var(--accent);
    transition: background 0.15s, color 0.15s;
  }

  .action-btn:hover {
    background: var(--primary);
    color: #FDFBF7;
    border-color: var(--primary);
  }

  .action-btn:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  .phase-canvas {
    width: 100%;
    max-width: 500px;
    height: auto;
    border: 1px solid var(--border);
    border-radius: 4px;
    cursor: crosshair;
    display: block;
  }

  .phase-canvas:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  .regime-label {
    font-size: 0.85em;
    font-family: sans-serif;
    color: var(--accent);
    min-height: 1.4em;
    margin: 0;
  }

  .data-table-details {
    margin-top: 4px;
  }

  .data-table-details summary {
    font-size: 0.8em;
    font-family: sans-serif;
    color: var(--accent);
    cursor: pointer;
    user-select: none;
    padding: 4px 0;
  }

  .data-table-details summary:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  table {
    border-collapse: collapse;
    font-size: 0.82em;
    font-family: sans-serif;
    margin-top: 8px;
    width: 100%;
    max-width: 600px;
  }

  th, td {
    border: 1px solid var(--border);
    padding: 5px 10px;
    text-align: left;
  }

  th {
    background: var(--formula-bg);
    color: var(--accent);
    font-weight: 600;
  }

  td {
    color: var(--text);
  }

  .color-swatch {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 2px;
    vertical-align: middle;
    margin-right: 4px;
    border: 1px solid rgba(0,0,0,0.15);
  }
</style>
