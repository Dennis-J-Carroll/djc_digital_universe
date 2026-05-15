<script>
  export let term = '';
  export let definition = '';
  let visible = false;
</script>

<span
  class="gloss"
  role="definition"
  tabindex="0"
  aria-description={definition}
  on:mouseenter={() => visible = true}
  on:mouseleave={() => visible = false}
  on:focus={() => visible = true}
  on:blur={() => visible = false}
>
  {term}
  {#if visible}
    <span class="popup" role="tooltip">{definition}</span>
  {/if}
</span>

<style>
  .gloss {
    border-bottom: 1px dotted var(--accent);
    cursor: help;
    position: relative;
  }
  .gloss:focus-visible { outline: 2px solid var(--accent); border-radius: 2px; }
  .popup {
    position: absolute;
    bottom: 100%;
    left: 0;
    background: var(--accent);
    color: #FDFBF7;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 0.82em;
    line-height: 1.5;
    max-width: 300px;
    width: max-content;
    z-index: 300;
    margin-bottom: 6px;
    pointer-events: none;
    white-space: normal;
    font-family: sans-serif;
  }
</style>
