import React, { useCallback, useEffect, useRef, useState } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const SpaceBackground = () => {
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);
  const isVisibleRef = useRef(true);

  // Detect mobile on client — skip canvas entirely on small screens
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Theme observer
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const theme = localStorage.getItem('theme') || 'dark';
      setCurrentTheme(theme);

      const observer = new MutationObserver(() => {
        const bodyClasses = document.body.className;
        if (bodyClasses.includes('tokyo-afternoon-theme')) {
          setCurrentTheme('tokyo-afternoon');
        } else if (bodyClasses.includes('retro-80s-theme')) {
          setCurrentTheme('retro-80s');
        } else if (bodyClasses.includes('light-theme')) {
          setCurrentTheme('light');
        } else {
          setCurrentTheme('dark');
        }
      });

      observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    }
  }, []);

  // IntersectionObserver + visibilitychange — pause when off-screen or tab hidden
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const applyVisibility = (visible) => {
      isVisibleRef.current = visible;
      const c = containerRef.current;
      if (!c) return;
      visible ? c?.play?.() : c?.pause?.();
    };

    const handleVisibility = () => {
      applyVisibility(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Query canvas after tsparticles mounts (small delay)
    let intersectionObserver;
    const timer = setTimeout(() => {
      const canvas = document.querySelector('#tsparticles canvas');
      if (!canvas) return;
      intersectionObserver = new IntersectionObserver(
        ([entry]) => applyVisibility(entry.isIntersecting),
        { threshold: 0 }
      );
      intersectionObserver.observe(canvas);
    }, 300);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (intersectionObserver) intersectionObserver.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    containerRef.current = container;
  }, []);

  // Mobile: zero JS — theme-accurate accent color gradients
  if (isMobile) {
    const mobileGradients = {
      dark:              'radial-gradient(ellipse at 30% 20%, rgba(0,188,212,0.13) 0%, rgba(0,188,212,0.04) 40%, rgba(124,77,255,0.08) 70%, transparent 100%)',
      light:             'radial-gradient(ellipse at 30% 20%, rgba(0,111,174,0.14) 0%, rgba(0,111,174,0.05) 40%, rgba(90,43,204,0.07) 70%, transparent 100%)',
      'tokyo-afternoon': 'radial-gradient(ellipse at 30% 20%, rgba(184,155,124,0.18) 0%, rgba(184,155,124,0.07) 40%, rgba(138,155,110,0.10) 70%, transparent 100%)',
      'retro-80s':       'radial-gradient(ellipse at 30% 20%, rgba(255,55,95,0.14) 0%, rgba(255,55,95,0.05) 40%, rgba(0,212,255,0.08) 70%, transparent 100%)',
    };
    return (
      <div style={{
        position: "fixed", width: "100%", height: "100%", zIndex: -1, top: 0, left: 0,
        background: mobileGradients[currentTheme] || mobileGradients.dark,
      }} />
    );
  }

  // Desktop: tokyo-afternoon stays static (warm/peaceful, no animation)
  if (currentTheme === 'tokyo-afternoon') {
    return (
      <div
        className="static-gradient-background"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(184, 155, 124, 0.1) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(138, 155, 110, 0.05) 0%, transparent 50%)',
        }}
      />
    );
  }

  // Desktop dark / light / retro-80s: full neural network particle graph
  const getParticleColors = () => {
    if (currentTheme === 'light') {
      return { particles: ["#006fae", "#5a2bcc", "#0099cc"], links: "#006fae", linkOpacity: 0.45, nodeOpacity: 0.65 };
    }
    if (currentTheme === 'retro-80s') {
      return { particles: ["#ff375f", "#00d4ff", "#bf5fff"], links: "#ff375f", linkOpacity: 0.5, nodeOpacity: 0.7 };
    }
    return { particles: ["#00bcd4", "#7c4dff", "#00e5ff"], links: "#00bcd4", linkOpacity: 0.45, nodeOpacity: 0.55 };
  };

  const colors = getParticleColors();

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded}
      options={{
        background: { color: { value: "transparent" } },
        fpsLimit: 60,
        pauseOnBlur: true,
        interactivity: {
          events: {
            onHover: { enable: true, mode: "grab" },
            onClick: { enable: true, mode: "push" },
          },
          modes: {
            grab: { distance: 180, links: { opacity: 0.7 } },
            push: { quantity: 3 },
          },
        },
        particles: {
          color: { value: colors.particles },
          links: {
            color: colors.links,
            distance: 160,
            enable: true,
            opacity: colors.linkOpacity,
            width: 1,
            triangles: { enable: false },
          },
          move: {
            enable: true,
            outModes: { default: "out" },
            random: false,
            speed: 1.6,
            straight: false,
          },
          number: {
            density: { enable: true, area: 900 },
            value: 40,
          },
          opacity: {
            value: colors.nodeOpacity,
          },
          shape: { type: "circle" },
          size: {
            value: { min: 1, max: 2 },
          },
        },
        detectRetina: true,
      }}
      style={{
        position: "fixed",
        width: "100%",
        height: "100%",
        zIndex: -1,
        top: 0,
        left: 0,
        userSelect: "none",
      }}
    />
  );
};

export default SpaceBackground;
