/* ============================================================
   Flow Writer — Writing Studio Adapter
   Inert when the app is opened standalone.
   Active only when hosted inside the Writing Studio shell iframe.
   ============================================================ */

export function initStudioAdapter(editor) {
  if (window.parent === window) return; // standalone — do nothing

  const ORIGIN = location.origin;

  // ── Receive: insert action from Prose Trainer (via shell router) ──────
  window.addEventListener('message', (e) => {
    if (e.origin !== ORIGIN) return;
    const msg = e.data;
    if (!msg || typeof msg !== 'object' || msg.v !== 1) return;

    if (msg.action === 'insert') {
      const text = msg.payload?.text ?? '';
      if (!text.trim()) return;
      insertAtCursor(editor, text);
    }
  });

  // ── Inject "Analyze selection" button into topbar-right ───────────────
  injectAnalyzeButton(editor);
}

function insertAtCursor(editor, text) {
  const pos = editor.selectionStart ?? editor.value.length;
  const end = editor.selectionEnd ?? pos;
  const before = editor.value.slice(0, pos);
  const after  = editor.value.slice(end);
  // Separate inserted passage from surrounding text with blank lines
  const separator = (before.length > 0 && !before.endsWith('\n\n')) ? '\n\n' : '';
  const inserted = separator + text;
  editor.value = before + inserted + after;
  editor.selectionStart = editor.selectionEnd = pos + inserted.length;
  editor.dispatchEvent(new Event('input'));
  editor.focus();
}

function injectAnalyzeButton(editor) {
  const topbarRight = document.querySelector('.topbar-right');
  if (!topbarRight || document.getElementById('studio-analyze-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'studio-analyze-btn';
  btn.className = 'icon-btn';
  btn.title = 'Analyze selection in Prose Trainer (Writing Studio)';
  btn.setAttribute('aria-label', 'Analyze in Prose Trainer');
  btn.style.cssText = 'position:relative;';

  // Waveform / analysis icon
  btn.innerHTML =
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" ' +
    'stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M1 8h2M4 5v6M7 3v10M10 5v6M13 8h2"/>' +
    '</svg>';

  btn.onclick = () => {
    const start = editor.selectionStart;
    const end   = editor.selectionEnd;
    const text  = (start !== end)
      ? editor.value.slice(start, end)
      : editor.value;
    if (!text.trim()) return;

    window.parent.postMessage({
      v: 1, id: Date.now(), ts: Date.now(),
      type: 'text', action: 'analyze',
      payload: { text, meta: { source: 'flow-writer' } }
    }, location.origin);

    // Brief glow confirm on the button
    btn.style.color = 'var(--accent-2)';
    setTimeout(() => { btn.style.color = ''; }, 1200);
  };

  // Insert before the first existing button
  topbarRight.insertBefore(btn, topbarRight.firstChild);
}
