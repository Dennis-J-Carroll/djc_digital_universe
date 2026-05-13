import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';
import EquationGraph from './EquationGraph';
import ClayBubble from './ClayBubble';
import { AxiomCard, AxiomModal } from './AxiomLibrary';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TermType, Term, EquationState, HistoryStep, ClayNode } from '../types';
import { cn, generateId } from '../lib/utils';
import { playMove, playCombine, playUndo, playSuccess } from '../lib/audio';

// --- Types ---
// Removed locally defined types as they are now imported from ../types

const TEMPLATES = [
  {
    name: "Linear Equation",
    left: [
      { id: '1', type: 'variable', value: 2, variable: 'x' },
      { id: '2', type: 'constant', value: 5 }
    ],
    right: [
      { id: '3', type: 'constant', value: 15 },
      { id: '4', type: 'variable', value: -3, variable: 'x' }
    ]
  },
  {
    name: "Quadratic Equation",
    left: [
      { id: 'q1', type: 'variable', value: 1, variable: 'x', exponent: 2 },
      { id: 'q2', type: 'variable', value: 5, variable: 'x' },
      { id: 'q3', type: 'constant', value: 6 }
    ],
    right: [
      { id: 'q4', type: 'constant', value: 0 }
    ]
  },
  {
    name: "Diff of Squares",
    left: [
       { id: 'd1', type: 'variable', value: 1, variable: 'x', exponent: 2 },
       { id: 'd2', type: 'constant', value: -9 }
    ],
    right: [
       { id: 'd3', type: 'constant', value: 0 }
    ]
  },
  {
    name: "Multi-Variable",
    left: [
      { id: 'm1', type: 'variable', value: 3, variable: 'x' },
      { id: 'm2', type: 'variable', value: 2, variable: 'y' }
    ],
    right: [
      { id: 'm3', type: 'constant', value: 12 },
      { id: 'm4', type: 'variable', value: 1, variable: 'x' }
    ]
  }
];

// --- Utils ---
const toSuperscript = (num: number) => {
  const map: Record<string, string> = {0:'⁰',1:'¹',2:'²',3:'³',4:'⁴',5:'⁵',6:'⁶',7:'⁷',8:'⁸',9:'⁹','-':'⁻'};
  return String(num).split('').map(d => map[d] || d).join('');
};

export const formatTerm = (t: Term, isFirst: boolean) => {
  const val = Math.abs(t.value);
  const sign = t.value >= 0 ? (isFirst ? '' : '+ ') : '- ';

  if (t.type === 'variable') {
    const expStr = (t.exponent && t.exponent !== 1) ? toSuperscript(t.exponent) : '';
    if (val === 1) return `${sign}${t.variable}${expStr}`;
    return `${sign}${val}${t.variable}${expStr}`;
  }
  return `${sign}${val}`;
};

// --- Components ---

const TermBuilder = ({ onAdd }: { onAdd: (term: Term) => void }) => {
  const [type, setType] = useState<TermType>('variable');
  const [value, setValue] = useState(1);
  const [variable, setVariable] = useState('x');
  const [exponent, setExponent] = useState(1);

  const handleAdd = () => {
    onAdd({
      id: generateId(),
      type,
      value,
      variable: type === 'variable' ? variable : undefined,
      exponent: type === 'variable' ? exponent : undefined
    });
    // Reset defaults
    setValue(1);
    // Keep variable/exponent same for quick entry of similar terms
  };

  return (
    <div className="flex flex-wrap items-end gap-2 p-3 bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700/50">
        <div>
            <label className="block text-[10px] font-bold text-cyan-400 uppercase mb-1">Type</label>
            <div className="flex bg-slate-900/50 rounded-lg p-1 border border-slate-700">
                <button onClick={() => setType('variable')} className={cn("px-2 py-1 rounded-md text-xs font-medium transition", type === 'variable' ? "bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]" : "text-slate-500 hover:text-slate-300")}>Var</button>
                <button onClick={() => setType('constant')} className={cn("px-2 py-1 rounded-md text-xs font-medium transition", type === 'constant' ? "bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]" : "text-slate-500 hover:text-slate-300")}>Const</button>
            </div>
        </div>
        <div>
            <label className="block text-[10px] font-bold text-cyan-400 uppercase mb-1">Coeff/Val</label>
            <input type="number" value={value} onChange={e => setValue(parseFloat(e.target.value) || 0)} className="w-16 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" />
        </div>
        {type === 'variable' && (
            <>
                <div>
                    <label className="block text-[10px] font-bold text-cyan-400 uppercase mb-1">Var</label>
                    <input type="text" value={variable} onChange={e => setVariable(e.target.value)} className="w-10 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-center text-slate-200 focus:border-cyan-500 focus:outline-none" maxLength={1} />
                </div>
                 <div>
                    <label className="block text-[10px] font-bold text-cyan-400 uppercase mb-1">Exp</label>
                    <input type="number" value={exponent} onChange={e => setExponent(parseFloat(e.target.value) || 1)} className="w-10 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-center text-slate-200 focus:border-cyan-500 focus:outline-none" />
                </div>
            </>
        )}
        <button onClick={handleAdd} className="h-[34px] px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition ml-auto shadow-[0_0_15px_rgba(6,182,212,0.4)]">Add</button>
    </div>
  );
};

const TermCard = ({
  term,
  side,
  onDragEnd
}: {
  term: Term;
  side: 'left' | 'right';
  onDragEnd: (term: Term, info: PanInfo) => void;
}) => {
  const controls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);


  return (
    <motion.div
      layout
      drag
      dragControls={controls}
      dragMomentum={false}
      dragElastic={0.1}
      whileDrag={{ scale: 1.1, zIndex: 100, cursor: 'grabbing' }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e, info) => {
        setIsDragging(false);
        onDragEnd(term, info);
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className={cn(
        "relative flex items-center justify-center px-4 py-3 m-2",
        "backdrop-blur-md rounded-xl border-2",
        "cursor-grab active:cursor-grabbing select-none",
        "transition-all duration-200 shadow-lg",
        term.type === 'variable'
          ? "bg-cyan-950/60 border-cyan-500/30 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:border-cyan-400 hover:bg-cyan-900/80 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          : "bg-emerald-950/60 border-emerald-500/30 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:border-emerald-400 hover:bg-emerald-900/80 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]",
        isDragging && "shadow-[0_0_30px_rgba(99,102,241,0.6)] ring-2 ring-indigo-400 bg-indigo-900/80 z-50 scale-110"
      )}
    >
      <span className="text-2xl font-medium font-mono tracking-wide drop-shadow-[0_0_5px_rgba(0,0,0,0.5)]">
        {formatTerm(term, false).replace(/^\+ /, '')}
      </span>

      <div className={cn(
        "absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white opacity-0 transition-opacity",
        isDragging ? "opacity-100" : "",
        term.value > 0 ? "bg-emerald-500" : "bg-rose-500"
      )}>
        {term.value > 0 ? "POS" : "NEG"}
      </div>
    </motion.div>
  );
};

// --- Axiom Display Component removed (imported from AxiomLibrary)


// --- History Log Component ---
const HistoryLog = ({ history }: { history: HistoryStep[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mt-8 bg-slate-900/40 rounded-xl border border-slate-700/50 p-6 backdrop-blur-sm shadow-xl">
      <h3 className="text-center font-bold text-slate-500 uppercase text-xs mb-4 tracking-widest flex items-center justify-center gap-2">
        <span className="w-8 h-px bg-slate-700"></span>
        Solution Log
        <span className="w-8 h-px bg-slate-700"></span>
      </h3>
      <div ref={scrollRef} className="max-h-48 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {history.map((step, idx) => (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            key={idx}
            className="flex items-center gap-4 text-sm p-3 rounded-lg bg-slate-800/40 border border-slate-700/40 hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-900/30 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-mono text-xs font-bold">
              {idx + 1}
            </div>
            <span className="text-slate-300 font-medium">{step.action}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default function InteractiveEquation() {
  const [mode, setMode] = useState<'equation' | 'playdoh' | 'create'>('equation');
  const [activeTemplate, setActiveTemplate] = useState<number>(0);

  // --- Equation State ---
  const [equation, setEquation] = useState<EquationState>({
    left: [
      { id: '1', type: 'variable', value: 2, variable: 'x' },
      { id: '2', type: 'constant', value: 5 }
    ],
    right: [
      { id: '3', type: 'constant', value: 15 },
      { id: '4', type: 'variable', value: -3, variable: 'x' }
    ]
  });
  const [history, setHistory] = useState<HistoryStep[]>([]);
  const [activeAxiom, setActiveAxiom] = useState<string | null>(null);
  const [selectedAxiomId, setSelectedAxiomId] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isSolved = (
    (equation.left.length === 1 && equation.left[0].type === 'variable' &&
     equation.right.length === 1 && equation.right[0].type === 'constant') ||
    (equation.right.length === 1 && equation.right[0].type === 'variable' &&
     equation.left.length === 1 && equation.left[0].type === 'constant')
  );

  // --- Play-doh State ---
  const [clayNodes, setClayNodes] = useState<ClayNode[]>([]);
  const [inputValue, setInputValue] = useState('64');
  const constraintsRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if input is focused
      if (document.activeElement?.tagName === 'INPUT') return;

      if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        undo();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (!isSolved) autoSolveStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, isSolved, equation]);

  // --- Shared Logic ---
  const triggerAxiom = (axiom: string) => {
    setActiveAxiom(axiom);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setActiveAxiom(null), 3000);
  };

  // --- Equation Logic ---
  const moveTerm = (term: Term, fromSide: 'left' | 'right') => {
    const val = Math.abs(term.value);
    const varStr = term.type === 'variable' ? term.variable : '';
    const termDisplay = term.type === 'variable' ? `${val}${varStr}` : `${val}`;
    saveHistory(`Moved ${termDisplay} to ${fromSide === 'left' ? 'right' : 'left'} side (Additive Inverse)`);

    const newTerm = { ...term, value: -term.value, id: generateId() };

    setEquation(prev => ({
      left: fromSide === 'left'
        ? prev.left.filter(t => t.id !== term.id)
        : [...prev.left, newTerm],
      right: fromSide === 'right'
        ? prev.right.filter(t => t.id !== term.id)
        : [...prev.right, newTerm]
    }));

    triggerAxiom('additive_inverse');
    playMove();
  };

  const handleDragEnd = (term: Term, info: PanInfo, fromSide: 'left' | 'right') => {
    const threshold = 100;
    const offset = info.offset.x;

    let crossed = false;
    if (fromSide === 'left' && offset > threshold) crossed = true;
    if (fromSide === 'right' && offset < -threshold) crossed = true;

    if (crossed) {
      moveTerm(term, fromSide);
    }
  };

  const combineTerms = (side: 'left' | 'right') => {
    saveHistory(`Combined terms on ${side} side (Distributive Property)`);
    setEquation(prev => {
      const terms = prev[side];
      const groups = new Map<string, Term[]>();

      // Group by variable AND exponent
      terms.forEach(t => {
        const key = t.type === 'constant'
          ? 'constant'
          : `var:${t.variable}:${t.exponent || 1}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(t);
      });

      const newTerms: Term[] = [];
      let combined = false;

      groups.forEach((groupTerms) => {
        if (groupTerms.length > 1) {
          combined = true;
          const totalVal = groupTerms.reduce((acc, t) => acc + t.value, 0);
          if (totalVal !== 0) {
             const first = groupTerms[0];
             newTerms.push({
               ...first,
               id: generateId(),
               value: totalVal
             });
          }
        } else {
          newTerms.push(...groupTerms);
        }
      });

      if (combined) {
        triggerAxiom('distributive');
        playCombine();
      }

      // Sort: Alphabetical then Degree (descending)
      newTerms.sort((a, b) => {
         if (a.type !== b.type) return a.type === 'variable' ? -1 : 1;
         if (a.type === 'variable' && b.type === 'variable') {
             if (a.variable !== b.variable) return (a.variable || '').localeCompare(b.variable || '');
             return (b.exponent || 1) - (a.exponent || 1);
         }
         return 0;
      });

      return { ...prev, [side]: newTerms };
    });
  };

  const saveHistory = (action: string) => {
    setHistory(prev => [...prev.slice(-9), { state: JSON.parse(JSON.stringify(equation)), action }]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const previousStep = history[history.length - 1];
    setEquation(previousStep.state);
    setHistory(prev => prev.slice(0, -1));
    setActiveAxiom(null);
    playUndo();
  };

  useEffect(() => {
    if (isSolved) playSuccess();
  }, [isSolved]);

  const canCombine = (terms: Term[]) => {
      const keys = new Set();
      for (const t of terms) {
          const key = t.type === 'constant' ? 'constant' : `var:${t.variable}:${t.exponent||1}`;
          if (keys.has(key)) return true;
          keys.add(key);
      }
      return false;
  };

  const autoSolveStep = () => {
    // 1. Move variables to left
    const rightVar = equation.right.find(t => t.type === 'variable');
    if (rightVar) {
      moveTerm(rightVar, 'right');
      return;
    }

    // 2. Move constants to right
    const leftConst = equation.left.find(t => t.type === 'constant');
    if (leftConst) {
      moveTerm(leftConst, 'left');
      return;
    }

    // 3. Combine like terms
    if (canCombine(equation.left)) {
        combineTerms('left');
        return;
    }
    if (canCombine(equation.right)) {
        combineTerms('right');
        return;
    }
  };

  // --- Play-doh Logic ---
  const addClayNode = () => {
      const val = parseInt(inputValue);
      if (!isNaN(val)) {
          setClayNodes(prev => [...prev, { id: generateId(), value: val, type: 'base' }]);
      }
  };

  const splitNode = (originalId: string, f1: number, f2: number) => {
      setClayNodes(prev => {
          const newNodes = prev.filter(n => n.id !== originalId);
          newNodes.push({ id: generateId(), value: f1, type: 'factor' });
          newNodes.push({ id: generateId(), value: f2, type: 'factor' });
          return newNodes;
      });
  };

  const transformNode = (originalId: string, base: number, exp: number) => {
      setClayNodes(prev => {
          return prev.map(n => {
              if (n.id === originalId) {
                  return { ...n, display: `${base}${['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹'][exp] || `^${exp}`}`, type: 'power' };
              }
              return n;
          });
      });
  };

  const mergeNodes = (id1: string, id2: string) => {
      setClayNodes(prev => {
          const n1 = prev.find(n => n.id === id1);
          const n2 = prev.find(n => n.id === id2);
          if (!n1 || !n2) return prev;

          const newVal = n1.value * n2.value;
          const newNode: ClayNode = {
              id: generateId(),
              value: newVal,
              type: 'base'
          };

          return [...prev.filter(n => n.id !== id1 && n.id !== id2), newNode];
      });
  };

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto">

      {/* Mode Switcher */}
      <div className="flex justify-center gap-2 mb-8 bg-slate-900/50 p-1 rounded-full border border-slate-700/50 backdrop-blur-sm">
          <button
              onClick={() => setMode('equation')}
              className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-all", mode === 'equation' ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]" : "text-slate-500 hover:text-slate-300")}
          >
              Equation Mode
          </button>
          <button
              onClick={() => setMode('playdoh')}
              className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-all", mode === 'playdoh' ? "bg-orange-500/20 text-orange-300 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]" : "text-slate-500 hover:text-slate-300")}
          >
              Play-doh Mode
          </button>
          <button
              onClick={() => setMode('create')}
              className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-all", mode === 'create' ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]" : "text-slate-500 hover:text-slate-300")}
          >
              Create Mode
          </button>
      </div>

      {mode === 'equation' && (
           <div className="flex flex-wrap justify-center gap-2 mb-8">
             {TEMPLATES.map((tmpl, idx) => (
               <button
                 key={idx}
                 onClick={() => {
                   setEquation({
                     left: JSON.parse(JSON.stringify(tmpl.left)),
                     right: JSON.parse(JSON.stringify(tmpl.right))
                   });
                   setHistory([]);
                   setActiveTemplate(idx);
                 }}
                 className={cn(
                   "px-4 py-2 rounded-lg text-xs font-bold transition-all border",
                   activeTemplate === idx
                     ? "bg-cyan-600 text-white border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105"
                     : "bg-slate-900/50 text-slate-500 border-slate-700/50 hover:bg-slate-800 hover:text-cyan-400 hover:border-cyan-500/30"
                 )}
               >
                 {tmpl.name}
               </button>
             ))}
           </div>
        )}

      {mode === 'equation' ? (
        <>
            {/* EQUATION MODE CONTENT */}
            <p className="text-slate-400 mb-6 text-center text-sm">Drag terms across the center to invert their sign.</p>
            <div className="relative flex items-center justify-center w-full max-w-5xl h-64 bg-slate-900/40 rounded-3xl border border-slate-700/50 overflow-hidden backdrop-blur-md shadow-2xl">
                <div className="absolute inset-0 bg-grid-slate-800 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none opacity-20" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-0">
                <div className="text-6xl font-bold text-slate-600 select-none drop-shadow-[0_0_10px_rgba(148,163,184,0.3)] transition-all">=</div>
                <div className="w-px h-full bg-slate-700/50 absolute top-0 -z-10" />
                </div>

                <div className="flex-1 h-full flex items-center justify-center p-4 z-10 border-r border-slate-700/30">
                <div className="flex flex-wrap justify-center items-center gap-2">
                    <AnimatePresence mode='popLayout'>
                    {equation.left.length === 0 && (
                        <motion.div initial={{opacity:0}} animate={{opacity:0.3}} className="text-4xl font-bold text-slate-600">0</motion.div>
                    )}
                    {equation.left.map((term, index) => (
                        <TermCard key={term.id} term={term} side="left" onDragEnd={(t, i) => handleDragEnd(t, i, 'left')} />
                    ))}
                    </AnimatePresence>
                </div>
                </div>

                <div className="flex-1 h-full flex items-center justify-center p-4 z-10">
                <div className="flex flex-wrap justify-center items-center gap-2">
                    <AnimatePresence mode='popLayout'>
                    {equation.right.length === 0 && (
                        <motion.div initial={{opacity:0}} animate={{opacity:0.3}} className="text-4xl font-bold text-slate-600">0</motion.div>
                    )}
                    {equation.right.map((term, index) => (
                        <TermCard key={term.id} term={term} side="right" onDragEnd={(t, i) => handleDragEnd(t, i, 'right')} />
                    ))}
                    </AnimatePresence>
                </div>
                </div>

                {isSolved && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 bg-emerald-900/90 backdrop-blur-md flex flex-col items-center justify-center z-50 rounded-3xl">
                        <div className="text-center">
                        <h2 className="text-3xl font-bold text-emerald-300 mb-4 drop-shadow-md">Solved! 🎉</h2>
                        <div className="text-4xl font-mono text-white mb-8 bg-black/20 px-8 py-4 rounded-xl border border-white/10">
                            {equation.left[0]?.type === 'variable'
                              ? `${formatTerm(equation.left[0], true)} = ${equation.right[0]?.value}`
                              : `${equation.left[0]?.value} = ${formatTerm(equation.right[0], true)}`
                            }
                        </div>
                        <button
                            onClick={() => {
                                const tmpl = TEMPLATES[activeTemplate];
                                setEquation({
                                    left: JSON.parse(JSON.stringify(tmpl.left)),
                                    right: JSON.parse(JSON.stringify(tmpl.right))
                                });
                                setHistory([]);
                            }}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-500 transition shadow-[0_0_15px_rgba(16,185,129,0.4)] font-bold"
                        >
                            Reset Problem
                        </button>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="mt-8 flex gap-4 items-center">
                <button onClick={() => combineTerms('left')} className="px-8 py-4 bg-gradient-to-br from-indigo-600 to-violet-700 border border-indigo-400/30 shadow-[0_4px_20px_rgba(79,70,229,0.4)] rounded-2xl text-white font-bold text-lg hover:from-indigo-500 hover:to-violet-600 hover:scale-105 hover:shadow-[0_6px_25px_rgba(79,70,229,0.5)] transition-all active:scale-95">Combine Left</button>

                <div className="flex flex-col gap-2 mx-4">
                  <button onClick={undo} disabled={history.length === 0} className="px-4 py-2 bg-transparent border border-slate-700 rounded-lg text-slate-500 text-sm font-medium hover:bg-slate-800 hover:text-slate-300 hover:border-slate-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                      <span className="mr-2">↺</span> Undo
                  </button>
                  <button onClick={autoSolveStep} disabled={isSolved} className="px-4 py-2 bg-transparent border border-cyan-700 rounded-lg text-cyan-500 text-sm font-medium hover:bg-slate-800 hover:text-cyan-300 hover:border-cyan-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                      <span className="mr-2">✨</span> Auto Step
                  </button>
                </div>

                <button onClick={() => combineTerms('right')} className="px-8 py-4 bg-gradient-to-br from-indigo-600 to-violet-700 border border-indigo-400/30 shadow-[0_4px_20px_rgba(79,70,229,0.4)] rounded-2xl text-white font-bold text-lg hover:from-indigo-500 hover:to-violet-600 hover:scale-105 hover:shadow-[0_6px_25px_rgba(79,70,229,0.5)] transition-all active:scale-95">Combine Right</button>
            </div>

            <HistoryLog history={history} />

            <div className="mt-12 w-full max-w-4xl">
                <h3 className="text-center uppercase tracking-widest font-bold mb-6 text-slate-500 text-xs">Field Axioms & Equality Properties</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AxiomCard
                    axiomId="additive_inverse"
                    active={activeAxiom === 'additive_inverse'}
                    onMoreInfo={() => setSelectedAxiomId('additive_inverse')}
                  />
                  <AxiomCard
                    axiomId="distributive"
                    active={activeAxiom === 'distributive'}
                    onMoreInfo={() => setSelectedAxiomId('distributive')}
                  />
                </div>
            </div>

            <AnimatePresence>
                {selectedAxiomId && (
                    <div className="fixed inset-0 z-[100]" onClick={() => setSelectedAxiomId(null)}>
                         <AxiomModal axiomId={selectedAxiomId} onClose={() => setSelectedAxiomId(null)} />
                    </div>
                )}
            </AnimatePresence>

            <div className="mt-12 w-full max-w-4xl">
              <EquationGraph equation={equation} />
            </div>
        </>
      ) : mode === 'playdoh' ? (
        <>
            {/* PLAY-DOH MODE CONTENT */}
            <p className="text-slate-400 mb-8 text-center text-sm">Enter a number and mold it into equivalent forms (factors, powers).</p>

            <div className="flex gap-2 mb-8">
                <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-center text-lg w-32 focus:ring-2 focus:ring-orange-500 outline-none text-slate-200"
                    placeholder="Value"
                />
                <button
                    onClick={addClayNode}
                    className="px-6 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-bold hover:from-orange-500 hover:to-amber-500 transition shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                >
                    Create Clay
                </button>
                <button
                    onClick={() => setClayNodes([])}
                    className="px-6 py-2 bg-slate-800 border border-slate-600 text-slate-400 rounded-xl font-bold hover:bg-slate-700 hover:text-red-400 hover:border-red-500/50 transition shadow-sm"
                >
                    Clear
                </button>
            </div>

            <div ref={constraintsRef} className="w-full max-w-5xl min-h-[400px] bg-slate-900/50 rounded-3xl p-8 flex flex-wrap content-center items-center justify-center gap-8 relative overflow-hidden border border-slate-700/50 shadow-inner">
                 <div className="absolute inset-0 bg-white/5 [mask-image:radial-gradient(circle,transparent,black)] pointer-events-none" />

                {clayNodes.length === 0 && (
                    <div className="text-slate-600 font-bold text-lg select-none">Enter a number above to start!</div>
                )}

                <AnimatePresence>
                    {clayNodes.map(node => (
                        <ClayBubble
                            key={node.id}
                            node={node}
                            constraintsRef={constraintsRef}
                            onClick={() => {}}
                            onSplit={(f1, f2) => splitNode(node.id, f1, f2)}
                            onTransform={(b, e) => transformNode(node.id, b, e)}
                            onMerge={(targetId) => mergeNodes(node.id, targetId)}
                        />
                    ))}
                </AnimatePresence>
            </div>

            <div className="mt-8 text-slate-500 text-sm max-w-lg text-center">
                <p><strong>Click a bubble</strong> to reveal its hidden structure. <strong>Drag one bubble onto another</strong> to merge them.</p>
            </div>
        </>
      ) : (
        <>
            {/* CREATE MODE CONTENT */}
            <p className="text-slate-400 mb-8 text-center text-sm">Build your own equation by adding terms to each side.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                <div className="flex flex-col gap-4">
                    <h3 className="text-center font-bold text-cyan-400 uppercase text-xs">Left Side</h3>
                    <div className="bg-slate-900/40 p-4 rounded-2xl shadow-inner border border-slate-700/50 min-h-[120px] flex flex-wrap gap-2 items-start content-start">
                        {equation.left.length === 0 && <span className="text-slate-600 w-full text-center mt-8 text-sm">Empty</span>}
                        {equation.left.map(t => (
                            <div key={t.id} className="relative group">
                                <TermCard term={t} side="left" onDragEnd={() => {}} />
                                <button
                                    onClick={() => setEquation(prev => ({ ...prev, left: prev.left.filter(term => term.id !== t.id) }))}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow-sm z-50 hover:bg-rose-400"
                                >×</button>
                            </div>
                        ))}
                    </div>
                    <TermBuilder onAdd={(t) => setEquation(prev => ({ ...prev, left: [...prev.left, t] }))} />
                </div>

                <div className="flex flex-col gap-4">
                    <h3 className="text-center font-bold text-emerald-400 uppercase text-xs">Right Side</h3>
                    <div className="bg-slate-900/40 p-4 rounded-2xl shadow-inner border border-slate-700/50 min-h-[120px] flex flex-wrap gap-2 items-start content-start">
                         {equation.right.length === 0 && <span className="text-slate-600 w-full text-center mt-8 text-sm">Empty</span>}
                         {equation.right.map(t => (
                            <div key={t.id} className="relative group">
                                <TermCard term={t} side="right" onDragEnd={() => {}} />
                                <button
                                    onClick={() => setEquation(prev => ({ ...prev, right: prev.right.filter(term => term.id !== t.id) }))}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow-sm z-50 hover:bg-rose-400"
                                >×</button>
                            </div>
                        ))}
                    </div>
                    <TermBuilder onAdd={(t) => setEquation(prev => ({ ...prev, right: [...prev.right, t] }))} />
                </div>
            </div>

            <div className="mt-12 flex justify-center">
                <button
                    onClick={() => {
                        setHistory([]);
                        setMode('equation');
                    }}
                    disabled={equation.left.length === 0 && equation.right.length === 0}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
                >
                    Solve This Equation →
                </button>
            </div>
        </>
      )}

    </div>
  );
}
