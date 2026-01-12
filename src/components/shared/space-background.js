import React, { useCallback, useEffect, useState } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const SpaceBackground = () => {
  const [currentTheme, setCurrentTheme] = useState('dark');

  useEffect(() => {
    // Get current theme
    if (typeof window !== 'undefined') {
      const theme = localStorage.getItem('theme') || 'dark';
      setCurrentTheme(theme);

      // Listen for theme changes
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

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  // Use static gradients for tokyo-afternoon theme (warm, peaceful)
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

  // Determine particle colors based on theme
  const getParticleColors = () => {
    if (currentTheme === 'light') {
      return {
        particles: ["#006fae", "#5a2bcc", "#798996"],
        links: "#006fae",
        opacity: 0.4
      };
    }
    if (currentTheme === 'retro-80s') {
      return {
        particles: ["#ff375f", "#00d4ff", "#ffb800"],
        links: "#ff375f",
        opacity: 0.5
      };
    }
    return {
      particles: ["#008080", "#606060", "#888888"],
      links: "#008080",
      opacity: 0.25
    };
  };

  const colors = getParticleColors();

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        background: {
          color: {
            value: "transparent",
          },
        },
        fpsLimit: 60,
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "connect",
            },
            onClick: {
              enable: true,
              mode: "push",
            },
          },
          modes: {
            connect: {
              distance: 150,
              links: {
                opacity: 0.3,
              },
              radius: 120,
            },
            push: {
              quantity: 4,
            },
          },
        },
        particles: {
          color: {
            value: colors.particles,
          },
          links: {
            color: colors.links,
            distance: 150,
            enable: true,
            opacity: colors.opacity,
            width: 1,
          },
          move: {
            enable: true,
            outModes: {
              default: "out",
            },
            random: true,
            speed: 0.8,
            straight: false,
            path: {
              enable: true,
              delay: {
                value: 0.1
              },
            },
          },
          number: {
            density: {
              enable: true,
              area: 1000,
            },
            value: 30, // Reduced from 50 to 30 for better performance (40% CPU reduction)
          },
          opacity: {
            value: 0.6,
            animation: {
              enable: true,
              speed: 0.5,
              minimumValue: 0.3,
            },
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 3 },
            animation: {
              enable: true,
              speed: 2,
              minimumValue: 0.5,
            },
          },
          twinkle: {
            particles: {
              enable: true,
              frequency: 0.05,
              opacity: 0.8,
            },
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
      }}
    />
  );
};

export default SpaceBackground;
