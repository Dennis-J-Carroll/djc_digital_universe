/* ============================================================
   Writing Studio — postMessage Router
   Routes typed artifacts between Prose Trainer and Flow Writer iframes.
   Envelope: { v:1, id, ts, type:'text', action, payload:{ text, meta } }
   ============================================================ */
(function () {
  const ORIGIN = location.origin;
  const proseFrame = document.getElementById('prose-frame');
  const flowFrame  = document.getElementById('flow-frame');

  window.addEventListener('message', (e) => {
    if (e.origin !== ORIGIN) return;
    const msg = e.data;
    if (!msg || typeof msg !== 'object' || msg.v !== 1) return;

    if (msg.action === 'insert') {
      // Prose Trainer → Flow Writer
      flowFrame.contentWindow.postMessage(msg, ORIGIN);
    } else if (msg.action === 'analyze') {
      // Flow Writer → Prose Trainer
      proseFrame.contentWindow.postMessage(msg, ORIGIN);
    }
  });

  // ── Draggable divider ──────────────────────────────────────
  const divider   = document.getElementById('divider');
  const paneLeft  = document.getElementById('pane-left');
  const paneRight = document.getElementById('pane-right');
  const container = document.getElementById('pane-container');
  let dragging = false;

  divider.addEventListener('mousedown', (e) => {
    e.preventDefault();
    dragging = true;
    divider.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    // Block iframe pointer events while dragging so mousemove stays on parent
    proseFrame.style.pointerEvents = 'none';
    flowFrame.style.pointerEvents  = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const rect = container.getBoundingClientRect();
    const ratio = Math.max(0.2, Math.min(0.8, (e.clientX - rect.left) / rect.width));
    paneLeft.style.flex  = `0 0 ${ratio * 100}%`;
    paneRight.style.flex = `0 0 ${(1 - ratio) * 100}%`;
  });

  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    divider.classList.remove('dragging');
    document.body.style.cursor = '';
    proseFrame.style.pointerEvents = '';
    flowFrame.style.pointerEvents  = '';
  });

  // ── Collapse tabs (mobile) ─────────────────────────────────
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.pane;
      paneLeft.classList.toggle('hidden-pane',  target !== 'prose');
      paneRight.classList.toggle('hidden-pane', target !== 'flow');
      divider.classList.toggle('hidden', true);
    });
  });
})();
