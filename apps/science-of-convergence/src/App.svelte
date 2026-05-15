<script>
  import DJCAppBar from './ui/DJCAppBar.svelte';
  import StickyNav from './ui/StickyNav.svelte';
  import Introduction from './sections/Introduction.svelte';
  import NADCs from './sections/NADCs.svelte';
  import Universality from './sections/Universality.svelte';
  import MathForms from './sections/MathForms.svelte';
  import Mechanisms from './sections/Mechanisms.svelte';
  import Compression from './sections/Compression.svelte';
  import Outlook from './sections/Outlook.svelte';
  import Bibliography from './sections/Bibliography.svelte';

  const sections = [
    { id: 'intro', label: 'Introduction' },
    { id: 'nadcs', label: 'NADCs' },
    { id: 'universality', label: 'Universality' },
    { id: 'math-forms', label: 'Math Forms' },
    { id: 'mechanisms', label: 'Mechanisms' },
    { id: 'compression', label: 'Compression' },
    { id: 'outlook', label: 'Outlook' },
  ];
</script>

<DJCAppBar />
<StickyNav {sections} />

<main>
  <Introduction id="intro" />
  <NADCs id="nadcs" />
  <Universality id="universality" />
  <MathForms id="math-forms" />
  <Mechanisms id="mechanisms" />
  <Compression id="compression" />
  <Outlook id="outlook" />
  <Bibliography />
</main>
