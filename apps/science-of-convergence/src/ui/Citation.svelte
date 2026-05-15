<script>
  import { citations } from '../lib/citations.js';
  export let key = '';

  $: ref = citations[key] || { short: key, full: 'Reference not found' };

  function scrollToBib() {
    document.getElementById('bibliography')?.scrollIntoView({ behavior: 'smooth' });
  }
</script>

<span
  class="cite"
  role="button"
  tabindex="0"
  aria-label="Citation: {ref.full}"
  title={ref.full}
  on:click={scrollToBib}
  on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollToBib(); } }}
>[{ref.short}]</span>

<style>
  .cite {
    color: var(--primary);
    font-size: 0.82em;
    font-family: sans-serif;
    cursor: pointer;
    border-bottom: 1px dashed var(--primary);
    position: relative;
    white-space: nowrap;
  }
  .cite:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: 2px; }
</style>
