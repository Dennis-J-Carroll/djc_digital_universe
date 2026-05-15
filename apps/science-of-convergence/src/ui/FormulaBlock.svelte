<script>
  export let formula = '';
  export let symbols = []; // [{sym, meaning}]
  export let derivation = '';
  export let example = '';
  export let validity = '';
</script>

<div class="formula-block" role="region" aria-label="Formula: {formula}">
  <div class="formula-main">
    <code>{formula}</code>
  </div>

  {#if symbols.length > 0}
    <dl class="symbol-grid">
      {#each symbols as { sym, meaning }}
        <dt><code>{sym}</code></dt>
        <dd>{meaning}</dd>
      {/each}
    </dl>
  {/if}

  {#if validity}
    <div class="validity">
      <strong>Regime of validity:</strong>
      <p>{validity}</p>
    </div>
  {/if}

  {#if derivation}
    <div class="derivation">
      <strong>Derivation:</strong>
      <p>{derivation}</p>
    </div>
  {/if}

  {#if example}
    <div class="example">
      <strong>Worked example:</strong>
      <p>{example}</p>
    </div>
  {/if}
</div>

<style>
  .formula-block {
    background: var(--formula-bg);
    border: 1px solid var(--border);
    border-left: 3px solid var(--primary);
    border-radius: 0 6px 6px 0;
    padding: 16px;
    margin: 14px 0;
    font-size: 0.9em;
  }
  .formula-main { margin-bottom: 12px; }
  .formula-main code {
    display: inline-block;
    font-size: 1.1em;
    color: var(--text);
    background: #fff;
    padding: 8px 14px;
    border-radius: 4px;
    border: 1px solid #e0d4c4;
  }
  .symbol-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 3px 14px;
    margin: 10px 0;
  }
  .symbol-grid dt {
    font-family: 'Courier New', monospace;
    color: var(--accent);
    font-weight: 600;
    font-size: 0.92em;
  }
  .symbol-grid dd { color: #6B4F3A; }
  .validity, .derivation, .example {
    margin-top: 10px;
    padding: 10px 12px;
    background: #fff;
    border-radius: 4px;
    border: 1px solid #e0d4c4;
    line-height: 1.6;
  }
  .validity strong, .derivation strong, .example strong {
    color: var(--primary);
    display: block;
    margin-bottom: 4px;
    font-family: sans-serif;
    font-size: 0.88em;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .validity p, .derivation p, .example p { color: #6B4F3A; margin: 0; }
</style>
