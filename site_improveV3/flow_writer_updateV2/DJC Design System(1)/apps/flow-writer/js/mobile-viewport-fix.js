/* ============================================================
   Mobile Viewport Fix — handles keyboard resize on iOS/Android
   Adds/removes 'keyboard-open' class and adjusts app height.
   Only runs on devices with visualViewport support.
   ============================================================ */

export function initMobileViewportFix() {
  if (!('visualViewport' in window)) return;
  // Only run on mobile (viewport width <= 768 or visualViewport present on touch devices)
  const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
  if (!isMobile) return;

  const vv = window.visualViewport;
  let lastHeight = vv.height;

  const onResize = () => {
    const h = vv.height;
    const isKeyboardOpen = h < window.innerHeight * 0.75;

    document.documentElement.classList.toggle('keyboard-open', isKeyboardOpen);

    if (isKeyboardOpen) {
      // Adjust app height to visible area
      const app = document.getElementById('app');
      if (app) app.style.height = `${h}px`;
    } else {
      const app = document.getElementById('app');
      if (app) app.style.height = '';
    }

    lastHeight = h;
  };

  vv.addEventListener('resize', onResize);
  window.addEventListener('resize', onResize);
}
