<script>
  import { onMount } from 'svelte';
  import { bifurcationSamples, regime } from '../lib/math/logisticMap.js';

  // Canvas dimensions (logical resolution)
  const CW = 900;
  const CH = 500;

  // R range defaults
  const R_MIN_DEFAULT = 2.5;
  const R_MAX_DEFAULT = 4.0;
  const R_STEPS = 600;

  // Feigenbaum bifurcation thresholds
  const FEIGENBAUM_RS = [
    { r: 3.0,     label: 'r₁' },
    { r: 3.44949, label: 'r₂' },
    { r: 3.54409, label: 'r₃' },
    { r: 3.56995, label: 'r₄' },
  ];

  // Accessible data table rows
  const TABLE_RS = [2.5, 2.8, 3.0, 3.2, 3.449, 3.544, 3.57, 4.0];

  let canvas;
  let ctx = null;
  let rMin = R_MIN_DEFAULT;
  let rMax = R_MAX_DEFAULT;
  let showFeigenbaum = false;
  let regimeText = '';
  let hoverR = null;

  // Stored pre-computed canvas points
  let points = []; // [{cx, cy}]

  // Drag state
  let dragging = false;
  let dragStartX = null;
  let dragCurrentX = null;

  // ---- Data computation ----

  function computePoints(rLo, rHi) {
    const pts = [];
    for (let i = 0; i < R_STEPS; i++) {
      const r = rLo + (i / (R_STEPS - 1)) * (rHi - rLo);
      const samples = bifurcationSamples(r);
      const cx = (r - rLo) / (rHi - rLo) * CW;
      for (const xv of samples) {
        const cy = (1 - xv) * CH;
        pts.push({ cx, cy });
      }
    }
    return pts;
  }

  // ---- Rendering ----

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, CW, CH);

    // Background
    ctx.fillStyle = '#FDFBF7';
    ctx.fillRect(0, 0, CW, CH);

    // Bifurcation points — batched into one path for performance
    ctx.fillStyle = 'rgba(160,124,91,0.35)';
    ctx.beginPath();
    for (const { cx, cy } of points) {
      ctx.rect(cx - 0.8, cy - 0.8, 1.6, 1.6);
    }
    ctx.fill();

    // Feigenbaum annotations
    if (showFeigenbaum) {
      ctx.save();
      ctx.strokeStyle = 'rgba(90,63,40,0.6)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.fillStyle = 'rgba(90,63,40,0.6)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';

      for (const { r, label } of FEIGENBAUM_RS) {
        if (r < rMin || r > rMax) continue;
        const x = (r - rMin) / (rMax - rMin) * CW;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CH);
        ctx.stroke();
        ctx.fillText(label, x, 12);
      }
      ctx.restore();
    }

    // Drag selection highlight
    if (dragging && dragStartX !== null && dragCurrentX !== null) {
      const x0 = Math.min(dragStartX, dragCurrentX);
      const x1 = Math.max(dragStartX, dragCurrentX);
      ctx.save();
      ctx.fillStyle = 'rgba(160,124,91,0.15)';
      ctx.fillRect(x0, 0, x1 - x0, CH);
      ctx.strokeStyle = 'rgba(160,124,91,0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.strokeRect(x0, 0, x1 - x0, CH);
      ctx.restore();
    }
  }

  // ---- Zoom logic ----

  function canvasXToR(x) {
    return rMin + (x / CW) * (rMax - rMin);
  }

  function getCanvasX(e) {
    const rect = canvas.getBoundingClientRect();
    // Scale from CSS pixels to canvas logical pixels
    const scaleX = CW / rect.width;
    return (e.clientX - rect.left) * scaleX;
  }

  function onMousedown(e) {
    dragging = true;
    dragStartX = getCanvasX(e);
    dragCurrentX = dragStartX;
  }

  function onMousemove(e) {
    const cx = getCanvasX(e);
    hoverR = canvasXToR(cx);
    regimeText = `Regime at r=${hoverR.toFixed(3)}: ${regime(hoverR)}`;

    if (dragging) {
      dragCurrentX = cx;
      draw();
    }
  }

  function onMouseup(e) {
    if (!dragging) return;
    dragging = false;
    const endX = getCanvasX(e);
    const x0 = Math.min(dragStartX, endX);
    const x1 = Math.max(dragStartX, endX);
    dragStartX = null;
    dragCurrentX = null;

    // Only zoom if drag is > 5 logical pixels
    if (x1 - x0 > 5) {
      const newRMin = canvasXToR(x0);
      const newRMax = canvasXToR(x1);
      rMin = newRMin;
      rMax = newRMax;
      points = computePoints(rMin, rMax);
    }
    draw();
  }

  function onMouseleave() {
    if (dragging) {
      dragging = false;
      dragStartX = null;
      dragCurrentX = null;
      draw();
    }
    regimeText = '';
  }

  function resetZoom() {
    rMin = R_MIN_DEFAULT;
    rMax = R_MAX_DEFAULT;
    points = computePoints(rMin, rMax);
    draw();
  }

  $: isDefaultZoom = rMin === R_MIN_DEFAULT && rMax === R_MAX_DEFAULT;

  // Explicit dependency on showFeigenbaum so Svelte tracks it for redraw
  $: if (canvas && points.length > 0) {
    showFeigenbaum; // tracked dependency — toggling rerenders Feigenbaum lines
    draw();
  }

  onMount(() => {
    ctx = canvas.getContext('2d');
    points = computePoints(rMin, rMax);
    draw();
  });
</script>

<div class="bifurcation-wrapper">
  <div class="controls">
    <button
      class="toggle-btn"
      on:click={() => { showFeigenbaum = !showFeigenbaum; }}
      aria-pressed={showFeigenbaum}
    >
      {showFeigenbaum ? 'Hide' : 'Show'} Feigenbaum δ
    </button>

    <button
      class="reset-btn"
      on:click={resetZoom}
      disabled={isDefaultZoom}
      aria-label="Reset zoom to full r range"
    >
      Reset zoom
    </button>
  </div>

  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-no-interactive-element-to-noninteractive-role -->
  <!-- role="img" on canvas is valid per ARIA 1.2; Svelte 4 linter does not support ARIA 1.2 canvas roles -->
  <canvas
    bind:this={canvas}
    width={CW}
    height={CH}
    role="img"
    aria-label="Bifurcation diagram of the logistic map. Shows period-doubling cascade from stable fixed point (r<3) through 2-cycle, 4-cycle, to chaotic regime (r>3.569)."
    class="bifurcation-canvas"
    on:mousedown={onMousedown}
    on:mousemove={onMousemove}
    on:mouseup={onMouseup}
    on:mouseleave={onMouseleave}
  ></canvas>

  <p class="regime-label" aria-live="polite">
    {regimeText || 'Hover over the diagram to see the regime at each r value.'}
  </p>

  {#if showFeigenbaum}
    <p class="feigenbaum-note">
      δ ≈ (r₂−r₁)/(r₃−r₂) ≈ (3.44949−3.0)/(3.54409−3.44949) ≈ 4.72 → 4.669…
      The Feigenbaum constant δ ≈ 4.6692 is universal: the ratio of successive bifurcation intervals
      converges to this value for any smooth unimodal map, not just the logistic map.
    </p>
  {/if}

  <details class="data-table-details">
    <summary>Data table (accessibility)</summary>
    <table aria-label="Bifurcation diagram data table">
      <thead>
        <tr>
          <th scope="col">r</th>
          <th scope="col">Regime</th>
        </tr>
      </thead>
      <tbody>
        {#each TABLE_RS as r}
          <tr>
            <td>{r}</td>
            <td>{regime(r)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </details>
</div>

<style>
  .bifurcation-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .controls {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .toggle-btn,
  .reset-btn {
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

  .toggle-btn:hover,
  .reset-btn:hover:not(:disabled) {
    background: var(--primary);
    color: #FDFBF7;
    border-color: var(--primary);
  }

  .toggle-btn[aria-pressed="true"] {
    background: var(--primary);
    color: #FDFBF7;
    border-color: var(--primary);
  }

  .reset-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .toggle-btn:focus-visible,
  .reset-btn:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  .bifurcation-canvas {
    width: 100%;
    max-width: 900px;
    height: auto;
    border: 1px solid var(--border);
    border-radius: 4px;
    cursor: crosshair;
    display: block;
  }

  .regime-label {
    font-size: 0.85em;
    font-family: sans-serif;
    color: var(--accent);
    min-height: 1.4em;
    margin: 0;
  }

  .feigenbaum-note {
    font-size: 0.85em;
    font-family: sans-serif;
    color: var(--text);
    background: var(--formula-bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 10px 14px;
    margin: 0;
    line-height: 1.6;
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
    max-width: 520px;
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
</style>
