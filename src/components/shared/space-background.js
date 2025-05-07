import React, { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const SpaceBackground = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

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
            value: ["#008080", "#606060", "#888888"],
          },
          links: {
            color: "#008080",
            distance: 150,
            enable: true,
            opacity: 0.25,
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
            value: 50, // Reduced from 100 to improve performance
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
