<script>
  import { citations } from '../lib/citations.js';
</script>

<section id="bibliography" class="section-card">
  <h2 class="section-title">Bibliography</h2>
  <ol style="padding-left: 1.5em; line-height: 2.2; font-size: 0.9em;">
    {#each Object.values(citations) as ref}
      <li>
        {ref.full}
        {#if ref.url}
          <a href={ref.url} target="_blank" rel="noopener noreferrer" style="color: var(--primary); font-size: 0.85em; margin-left: 6px;" aria-label="Open {ref.short} in new tab">↗</a>
        {/if}
      </li>
    {/each}
  </ol>
</section>
