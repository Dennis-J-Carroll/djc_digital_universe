<script>
  export let sections = [];
</script>
<nav style="position: fixed; top: var(--appbar-height); left: 0; right: 0; z-index: 190; background: rgba(253,251,247,0.95); border-bottom: 1px solid var(--border); height: var(--nav-height); display: flex; align-items: center; padding: 0 20px; gap: 20px; overflow-x: auto;">
  {#each sections as s}
    <a href="#{s.id}" style="color: var(--primary); font-family: sans-serif; font-size: 0.8em; white-space: nowrap; text-decoration: none;">{s.label}</a>
  {/each}
</nav>
