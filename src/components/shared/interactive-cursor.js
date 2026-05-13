import React, { useEffect, useRef, useState } from "react";
import "../../styles/cursor.css";

const InteractiveCursor = () => {
    const cursorRef = useRef(null);
    const cursorDotRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const mousePos = useRef({ x: 0, y: 0 });
    const cursorPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        if ('ontouchstart' in window) return;

        const handleMouseMove = (e) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
            if (!isVisible) setIsVisible(true);
            if (cursorDotRef.current) {
                cursorDotRef.current.style.left = `${e.clientX}px`;
                cursorDotRef.current.style.top = `${e.clientY}px`;
            }
        };

        const handleMouseEnter = () => setIsVisible(true);
        const handleMouseLeave = () => setIsVisible(false);

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

        const animationId = requestAnimationFrame(animateCursor);
        setTimeout(addHoverListeners, 1000);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseenter', handleMouseEnter);
            document.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationId);
        };
    }, [isVisible]);

    if (typeof window === 'undefined') return null;

    return (
        <>
            <div
                ref={cursorRef}
                className={`cursor-ring ${isHovering ? 'hovering' : ''}`}
                style={{ opacity: isVisible ? 1 : 0 }}
            />
            <div
                ref={cursorDotRef}
                className={`cursor-dot ${isHovering ? 'hovering' : ''}`}
                style={{ opacity: isVisible ? 1 : 0 }}
            />
        </>
    );
};

export default InteractiveCursor;
