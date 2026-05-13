import React, { useCallback, useEffect, useRef, useState } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const PARTICLE_COUNT = typeof window !== 'undefined' && window.innerWidth < 768 ? 15 : 30;

const SpaceBackground = () => {
  const [currentTheme, setCurrentTheme] = useState('dark');
  const containerRef = useRef(null);
  const isVisibleRef = useRef(true);

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
      visible ? c.play() : c.pause();
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

  // Static background for tokyo-afternoon (no animation, warm/peaceful)
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

  const getParticleColors = () => {
    if (currentTheme === 'light') {
      return { particles: ["#006fae", "#5a2bcc", "#798996"], links: "#006fae", opacity: 0.4 };
    }
    if (currentTheme === 'retro-80s') {
      return { particles: ["#ff375f", "#00d4ff", "#ffb800"], links: "#ff375f", opacity: 0.5 };
    }
    return { particles: ["#008080", "#606060", "#888888"], links: "#008080", opacity: 0.25 };
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
            onHover: { enable: true, mode: "connect" },
            onClick: { enable: true, mode: "push" },
          },
          modes: {
            connect: { distance: 150, links: { opacity: 0.3 }, radius: 120 },
            push: { quantity: 4 },
          },
        },
        particles: {
          color: { value: colors.particles },
          links: {
            color: colors.links,
            distance: 150,
            enable: true,
            opacity: colors.opacity,
            width: 1,
          },
          move: {
            enable: true,
            outModes: { default: "out" },
            random: true,
            speed: 0.8,
            straight: false,
            path: { enable: true, delay: { value: 0.1 } },
          },
          number: {
            density: { enable: true, area: 1000 },
            value: PARTICLE_COUNT,
          },
          opacity: {
            value: 0.6,
            animation: { enable: true, speed: 0.5, minimumValue: 0.3 },
          },
          shape: { type: "circle" },
          size: {
            value: { min: 1, max: 3 },
            animation: { enable: true, speed: 2, minimumValue: 0.5 },
          },
          twinkle: {
            particles: { enable: true, frequency: 0.05, opacity: 0.8 },
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
