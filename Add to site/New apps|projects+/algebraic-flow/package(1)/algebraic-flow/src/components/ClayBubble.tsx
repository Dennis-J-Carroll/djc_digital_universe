import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClayNode } from '../types';
import { cn } from '../lib/utils';

export const ClayBubble = ({
  node,
  constraintsRef,
  onClick,
  onSplit,
  onTransform,
  onMerge
}: {
  node: ClayNode;
  constraintsRef: React.RefObject<HTMLDivElement>;
  onClick: () => void;
  onSplit: (factor1: number, factor2: number) => void;
  onTransform: (base: number, exp: number) => void;
  onMerge: (targetId: string) => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Calculate factors and powers for menu
  const factors: [number, number][] = [];
  const powers: [number, number][] = [];

  if (showMenu) {
    const val = node.value;
    // Simple factorization
    for (let i = 2; i <= Math.sqrt(val); i++) {
      if (val % i === 0) {
        factors.push([i, val / i]);
      }
    }
    // Check for powers (perfect squares, cubes)
    // Try bases from 2 up to sqrt(val)
    for (let b = 2; b <= Math.sqrt(val); b++) {
      let temp = val;
      let exp = 0;
      while (temp % b === 0 && temp > 1) {
        temp /= b;
        exp++;
      }
      if (temp === 1 && exp > 1) {
         // Check if exactly this power
         if (Math.pow(b, exp) === val) {
            powers.push([b, exp]);
         }
      }
    }
  }

  return (
    <motion.div
        ref={bubbleRef}
        layoutId={node.id}
        drag
        dragConstraints={constraintsRef}
        dragMomentum={false}
        data-clay-node="true"
        data-clay-id={node.id}
        onDragEnd={(e) => {
            let clientX, clientY;
            if ('clientX' in e) {
                clientX = (e as MouseEvent).clientX;
                clientY = (e as MouseEvent).clientY;
            } else if ('changedTouches' in e) {
                clientX = (e as TouchEvent).changedTouches[0].clientX;
                clientY = (e as TouchEvent).changedTouches[0].clientY;
            }

            if (clientX !== undefined && clientY !== undefined) {
                // Use elementsFromPoint to find potential merge targets underneath the dragged element
                const elements = document.elementsFromPoint(clientX, clientY);

                for (const el of elements) {
                    const targetNode = el.closest('[data-clay-node]');
                    if (targetNode) {
                        const targetId = targetNode.getAttribute('data-clay-id');
                        // Ensure we don't merge with ourselves
                        if (targetId && targetId !== node.id) {
                            onMerge(targetId);
                            break;
                        }
                    }
                }
            }
        }}
        className="relative inline-block m-4 z-10"
    >
      <motion.div
        onClick={() => setShowMenu(!showMenu)}
        className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center cursor-pointer shadow-[0_0_30px_rgba(0,0,0,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-shadow select-none relative z-10 border border-white/20 backdrop-blur-md",
          node.type === 'base'
            ? "bg-gradient-to-br from-amber-500/80 to-orange-600/80 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)]"
            : "bg-gradient-to-br from-cyan-500/80 to-blue-600/80 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]"
        )}
        whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="absolute inset-0 rounded-full bg-white/10 mix-blend-overlay"></div>
        <span className="text-3xl font-bold font-mono drop-shadow-md">
          {node.display || node.value}
        </span>
      </motion.div>

      {/* Radial Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Overlay to close */}
            <div className="fixed inset-0 z-0" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />

            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none z-20"
            >
              {/* Factor Options */}
              {factors.map((pair, i) => {
                const angle = (i * (360 / (factors.length + powers.length))) * (Math.PI / 180);
                const radius = 80;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.button
                    key={`f-${i}`}
                    className="absolute pointer-events-auto w-14 h-14 rounded-full bg-slate-800 shadow-lg border border-orange-500/50 flex flex-col items-center justify-center text-xs text-orange-400 font-bold hover:bg-slate-700 hover:scale-110 transition-transform"
                    style={{ left: `calc(50% + ${x}px - 28px)`, top: `calc(50% + ${y}px - 28px)` }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSplit(pair[0], pair[1]);
                        setShowMenu(false);
                    }}
                  >
                    <div>{pair[0]}</div>
                    <div className="w-full h-px bg-orange-500/30 my-0.5"></div>
                    <div>{pair[1]}</div>
                  </motion.button>
                );
              })}

               {/* Power Options */}
               {powers.map((pair, i) => {
                 const offsetIndex = i + factors.length;
                const angle = (offsetIndex * (360 / (factors.length + powers.length))) * (Math.PI / 180);
                const radius = 80;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.button
                    key={`p-${i}`}
                    className="absolute pointer-events-auto w-14 h-14 rounded-full bg-slate-800 shadow-lg border border-cyan-500/50 flex items-center justify-center text-sm text-cyan-400 font-bold hover:bg-slate-700 hover:scale-110 transition-transform"
                    style={{ left: `calc(50% + ${x}px - 28px)`, top: `calc(50% + ${y}px - 28px)` }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onTransform(pair[0], pair[1]);
                        setShowMenu(false);
                    }}
                  >
                    <span>{pair[0]}<sup>{pair[1]}</sup></span>
                  </motion.button>
                );
              })}

              {factors.length === 0 && powers.length === 0 && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60px] bg-slate-800 text-slate-300 border border-slate-600 text-xs px-2 py-1 rounded">Prime</div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ClayBubble;
