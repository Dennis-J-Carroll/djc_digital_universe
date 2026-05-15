<script>
  import { onMount, onDestroy } from 'svelte';
  export let sections = [];

  let activeId = '';
  let observers = [];

  onMount(() => {
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) activeId = id; },
        { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
  });

  onDestroy(() => observers.forEach(o => o.disconnect()));
</script>

<nav
  aria-label="Section navigation"
  style="
    position: fixed;
    top: var(--appbar-height);
    left: 0; right: 0;
    z-index: 190;
    height: var(--nav-height);
    background: rgba(253,251,247,0.96);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center;
    padding: 0 20px;
    gap: 4px;
    overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  "
>
  {#each sections as s}
    <a
      href="#{s.id}"
      aria-current={activeId === s.id ? 'true' : undefined}
      style="
        color: {activeId === s.id ? '#5a3f28' : '#7B5E4D'};
        font-family: sans-serif;
        font-size: 0.75em;
        letter-spacing: 0.02em;
        text-decoration: none;
        padding: 6px 8px;
        border-radius: 4px;
        border-bottom: 2px solid {activeId === s.id ? '#5a3f28' : 'transparent'};
        white-space: nowrap;
        transition: color 0.15s, border-color 0.15s;
        font-weight: {activeId === s.id ? '600' : '400'};
        flex-shrink: 0;
      "
    >{s.label}</a>
  {/each}
</nav>
