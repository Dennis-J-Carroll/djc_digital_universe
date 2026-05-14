import { useEffect } from 'react';

const COUNT = 14;
const DURATION = 650;

const ClickParticles = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const spawnBurst = (x, y) => {
      const s = getComputedStyle(document.body);
      const colors = [
        s.getPropertyValue('--primary-color').trim()   || '#00bcd4',
        s.getPropertyValue('--secondary-color').trim() || '#7c4dff',
        s.getPropertyValue('--accent-color').trim()    || '#798996',
      ];

      for (let i = 0; i < COUNT; i++) {
        const angle = (i / COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const dist  = 35 + Math.random() * 55;
        const size  = 3 + Math.random() * 5;
        const color = colors[i % colors.length];

        const p = document.createElement('div');
        p.style.cssText = `
          position:fixed;
          left:${x}px;
          top:${y}px;
          width:${size.toFixed(1)}px;
          height:${size.toFixed(1)}px;
          border-radius:50%;
          background:${color};
          box-shadow:0 0 ${(size * 2).toFixed(0)}px ${color};
          pointer-events:none;
          z-index:9998;
          transform:translate(-50%,-50%);
          --dx:${(Math.cos(angle) * dist).toFixed(1)}px;
          --dy:${(Math.sin(angle) * dist).toFixed(1)}px;
          animation:djc-particle-burst ${DURATION}ms ease-out forwards;
        `;
        document.body.appendChild(p);
        setTimeout(() => p.parentNode?.removeChild(p), DURATION + 50);
      }
    };

    // Skip burst when tapping form fields
    const isFormField = (el) =>
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);

    let lastTouch = 0;

    const onClick = (e) => {
      if (isFormField(e.target)) return;
      if (Date.now() - lastTouch < 500) return; // prevent double-fire after touchend
      spawnBurst(e.clientX, e.clientY);
    };

    const onTouchEnd = (e) => {
      if (isFormField(e.target)) return;
      lastTouch = Date.now();
      const t = e.changedTouches[0];
      spawnBurst(t.clientX, t.clientY);
    };

    document.addEventListener('click', onClick);
    document.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return null;
};

export default ClickParticles;
