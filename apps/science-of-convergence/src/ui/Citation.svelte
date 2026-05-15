<script>
  import { citations } from '../lib/citations.js';
  export let key = '';

  $: ref = citations[key] || { short: key, full: 'Reference not found' };
</script>

<a
  class="cite"
  href="#bibliography"
  aria-label="Citation: {ref.full}"
  title={ref.full}
>[{ref.short}]</a>

<style>
  .cite {
    color: var(--primary);
    font-size: 0.82em;
    font-family: sans-serif;
    text-decoration: none;
    border-bottom: 1px dashed var(--primary);
    white-space: nowrap;
  }
  .cite:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: 2px; }
</style>
