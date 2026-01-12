import React, { useEffect, useRef, useState } from "react";

/**
 * Interactive Cursor Effect Component
 * Creates a custom cursor with trailing glow effect that follows mouse movement
 */
const InteractiveCursor = () => {
    const cursorRef = useRef(null);
    const cursorDotRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const mousePos = useRef({ x: 0, y: 0 });
    const cursorPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Don't show custom cursor on touch devices
        if ('ontouchstart' in window) return;

        const handleMouseMove = (e) => {
            mousePos.current = { x: e.clientX, y: e.clientY };

            if (!isVisible) {
                setIsVisible(true);
            }

            // Move the dot cursor immediately
            if (cursorDotRef.current) {
                cursorDotRef.current.style.left = `${e.clientX}px`;
                cursorDotRef.current.style.top = `${e.clientY}px`;
            }
        };

        const handleMouseEnter = () => setIsVisible(true);
        const handleMouseLeave = () => setIsVisible(false);

        // Animate the trailing cursor
        const animateCursor = () => {
            if (cursorRef.current) {
                const dx = mousePos.current.x - cursorPos.current.x;
                const dy = mousePos.current.y - cursorPos.current.y;

                cursorPos.current.x += dx * 0.15;
                cursorPos.current.y += dy * 0.15;

                cursorRef.current.style.left = `${cursorPos.current.x}px`;
                cursorRef.current.style.top = `${cursorPos.current.y}px`;
            }
            requestAnimationFrame(animateCursor);
        };

        // Track hover state on interactive elements
        const handleElementHover = () => setIsHovering(true);
        const handleElementLeave = () => setIsHovering(false);

        const addHoverListeners = () => {
            const interactiveElements = document.querySelectorAll('a, button, [role="button"], input, select, textarea');
            interactiveElements.forEach(el => {
                el.addEventListener('mouseenter', handleElementHover);
                el.addEventListener('mouseleave', handleElementLeave);
            });
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseenter', handleMouseEnter);
        document.addEventListener('mouseleave', handleMouseLeave);

        // Start animation loop
        const animationId = requestAnimationFrame(animateCursor);

        // Add hover listeners after a short delay to ensure DOM is ready
        setTimeout(addHoverListeners, 1000);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseenter', handleMouseEnter);
            document.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationId);
        };
    }, [isVisible]);

    // Don't render on server or touch devices
    if (typeof window === 'undefined') return null;

    return (
        <>
            {/* Main cursor ring */}
            <div
                ref={cursorRef}
                className={`cursor-ring ${isHovering ? 'hovering' : ''}`}
                style={{
                    opacity: isVisible ? 1 : 0
                }}
            />

            {/* Cursor dot */}
            <div
                ref={cursorDotRef}
                className={`cursor-dot ${isHovering ? 'hovering' : ''}`}
                style={{
                    opacity: isVisible ? 1 : 0
                }}
            />

            <style jsx global>{`
        /* Hide default cursor on desktop */
        @media (hover: hover) and (pointer: fine) {
          body {
            cursor: none;
          }
          
          a, button, [role="button"], input, select, textarea {
            cursor: none;
          }
        }

        .cursor-ring {
          position: fixed;
          width: 40px;
          height: 40px;
          border: 2px solid var(--primary-color, #00bcd4);
          border-radius: 50%;
          pointer-events: none;
          z-index: 10000;
          transform: translate(-50%, -50%);
          transition: width 0.2s ease, height 0.2s ease, border-color 0.2s ease, opacity 0.3s ease;
          box-shadow: 
            0 0 10px rgba(0, 188, 212, 0.3),
            inset 0 0 10px rgba(0, 188, 212, 0.1);
        }

        .cursor-ring.hovering {
          width: 60px;
          height: 60px;
          border-color: var(--secondary-color, #7c4dff);
          box-shadow: 
            0 0 20px rgba(124, 77, 255, 0.4),
            inset 0 0 15px rgba(124, 77, 255, 0.2);
        }

        .cursor-dot {
          position: fixed;
          width: 8px;
          height: 8px;
          background: linear-gradient(135deg, var(--primary-color, #00bcd4), var(--secondary-color, #7c4dff));
          border-radius: 50%;
          pointer-events: none;
          z-index: 10001;
          transform: translate(-50%, -50%);
          transition: transform 0.15s ease, opacity 0.3s ease;
          box-shadow: 0 0 15px var(--primary-color, #00bcd4);
        }

        .cursor-dot.hovering {
          transform: translate(-50%, -50%) scale(1.5);
          box-shadow: 0 0 25px var(--secondary-color, #7c4dff);
        }

        /* Tokyo Afternoon theme cursor - Sunset colors */
        body.tokyo-afternoon .cursor-ring {
          border-color: var(--primary-color, #e85d75);
          box-shadow: 
            0 0 10px rgba(232, 93, 117, 0.3),
            inset 0 0 10px rgba(232, 93, 117, 0.1);
        }

        body.tokyo-afternoon .cursor-ring.hovering {
          border-color: var(--secondary-color, #ff9a56);
          box-shadow: 
            0 0 20px rgba(255, 154, 86, 0.4),
            inset 0 0 15px rgba(255, 154, 86, 0.2);
        }

        body.tokyo-afternoon .cursor-dot {
          background: linear-gradient(135deg, var(--primary-color, #e85d75), var(--secondary-color, #ff9a56));
          box-shadow: 0 0 15px var(--primary-color, #e85d75);
        }

        /* Light theme cursor */
        body.light-theme .cursor-ring {
          border-color: var(--primary-color, #006fae);
          box-shadow: 
            0 0 10px rgba(0, 111, 174, 0.2),
            inset 0 0 10px rgba(0, 111, 174, 0.05);
        }

        body.light-theme .cursor-dot {
          box-shadow: 0 0 10px rgba(0, 111, 174, 0.4);
        }

        /* Hide custom cursor on mobile/touch devices */
        @media (hover: none) or (pointer: coarse) {
          .cursor-ring,
          .cursor-dot {
            display: none !important;
          }
        }
      `}</style>
        </>
    );
};

export default InteractiveCursor;
