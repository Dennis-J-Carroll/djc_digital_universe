<script>
  export let section = '';
  const TABS = ['conceptual', 'technical', 'computational'];
  let active = 'conceptual';

  function setTab(tab) { active = tab; }

  function onKeydown(e, idx) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setTab(TABS[idx]);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = TABS[(idx + 1) % TABS.length];
      setTab(next);
      document.getElementById(`tab-${section}-${next}`)?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = TABS[(idx - 1 + TABS.length) % TABS.length];
      setTab(prev);
      document.getElementById(`tab-${section}-${prev}`)?.focus();
    }
  }
</script>

<div class="three-layer">
  <div class="tab-bar" role="tablist" aria-label="{section} depth">
    {#each [['conceptual','Conceptual'], ['technical','Technical'], ['computational','Computational']] as [id, label], idx}
      <button
        role="tab"
        id="tab-{section}-{id}"
        aria-selected={active === id}
        aria-controls="panel-{section}-{id}"
        tabindex={active === id ? 0 : -1}
        on:click={() => setTab(id)}
        on:keydown={(e) => onKeydown(e, idx)}
        class:active={active === id}
      >
        {label}
        {#if id !== 'conceptual'}
          <span class="tag-new" aria-hidden="true">new</span>
        {/if}
      </button>
    {/each}
  </div>

  {#each ['conceptual','technical','computational'] as id}
    <div
      role="tabpanel"
      id="panel-{section}-{id}"
      aria-labelledby="tab-{section}-{id}"
      hidden={active !== id}
    >
      {#if id === 'conceptual'}
        <slot name="conceptual" />
      {:else if id === 'technical'}
        <slot name="technical" />
      {:else}
        <slot name="computational" />
      {/if}
    </div>
  {/each}
</div>

<style>
  .three-layer { margin: 24px 0; }
  .tab-bar { display: flex; gap: 2px; }
  button {
    padding: 7px 16px;
    font-size: 0.8em;
    font-family: sans-serif;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    border: 1px solid var(--border);
    border-bottom: none;
    border-radius: 4px 4px 0 0;
    cursor: pointer;
    background: var(--formula-bg);
    color: var(--accent);
    transition: background 0.15s, color 0.15s;
    display: flex; align-items: center; gap: 6px;
  }
  button.active { background: var(--primary); color: #FDFBF7; border-color: var(--primary); }
  button:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
  div[role="tabpanel"] {
    border: 1px solid var(--border);
    border-radius: 0 4px 4px 4px;
    padding: 20px;
    background: var(--bg);
  }
  div[role="tabpanel"][hidden] { display: none; }
  .tag-new {
    display: inline-block;
    font-size: 0.7em;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 1px 5px;
    border-radius: 3px;
    font-weight: 600;
    background: rgba(160,124,91,0.15);
    color: var(--accent);
    border: 1px solid rgba(160,124,91,0.3);
  }
</style>
