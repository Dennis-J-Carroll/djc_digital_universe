import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';
import EquationGraph from './EquationGraph';
import AxiomPanel from './AxiomPanel';
import ProofLog from './ProofLog';
import DiscriminantPanel from './DiscriminantPanel';
import ArgandDiagram from './ArgandDiagram';
import NotationToggle from './NotationToggle';
import SystemsSolver from './SystemsSolver';
import InequalitySolver from './InequalitySolver';
import { ProofLog as ProofLogClass, generateJustification } from '../lib/proofLog';
import { AXIOMS, getAxiomById } from '../lib/axioms';
import { 
  extractQuadraticCoefficients, 
  isQuadratic,
  calculateRoots,
  QuadraticCoefficients
} from '../lib/quadratic';
import { ComplexNumber, rootsToComplex } from '../lib/complex';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Tex, termToLatex } from '../lib/math';
import { parseEquationString } from '../lib/parser';
import { 
  Settings, 
  Calculator, 
  Shapes, 
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Info,
  GitBranch,
  ArrowLeftRight
} from 'lucide-react';

// --- Types ---
export type TermType = 'variable' | 'constant';

export interface Term {
  id: string;
  type: TermType;
  value: number;
  variable?: string;
  exponent?: number;
}

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
  },
  {
    name: "Complex Roots",
    left: [
      { id: 'c1', type: 'variable', value: 1, variable: 'x', exponent: 2 },
      { id: 'c2', type: 'constant', value: 4 }
    ],
    right: [
      { id: 'c3', type: 'constant', value: 0 }
    ]
  }
];

export interface EquationState {
  left: Term[];
  right: Term[];
}

interface ClayNode {
  id: string;
  value: number;
  type: 'base' | 'power' | 'factor';
  display?: string;
  x?: number;
  y?: number;
}

// --- Utils ---
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const generateId = () => Math.random().toString(36).substr(2, 9);

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
    setValue(1);
  };

  return (
    <div className="space-y-3 p-4 bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700/50">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-cyan-400 uppercase mb-2 tracking-wider">Type</label>
          <div className="flex bg-slate-900/50 rounded-lg p-1 border border-slate-700">
            <button onClick={() => setType('variable')} className={cn("flex-1 py-1.5 rounded-md text-sm font-medium transition", type === 'variable' ? "bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]" : "text-slate-500 hover:text-slate-300")}>Variable</button>
            <button onClick={() => setType('constant')} className={cn("flex-1 py-1.5 rounded-md text-sm font-medium transition", type === 'constant' ? "bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]" : "text-slate-500 hover:text-slate-300")}>Constant</button>
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-cyan-400 uppercase mb-2 tracking-wider">{type === 'variable' ? 'Coefficient' : 'Value'}</label>
          <input type="number" value={value} onChange={e => setValue(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" />
        </div>
      </div>
      {type === 'variable' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-cyan-400 uppercase mb-2 tracking-wider">Variable</label>
            <input type="text" value={variable} onChange={e => setVariable(e.target.value)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-center text-slate-200 focus:border-cyan-500 focus:outline-none" maxLength={1} />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-cyan-400 uppercase mb-2 tracking-wider">Exponent</label>
            <input type="number" value={exponent} onChange={e => setExponent(parseFloat(e.target.value) || 1)} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-center text-slate-200 focus:border-cyan-500 focus:outline-none" />
          </div>
        </div>
      )}
      <button onClick={handleAdd} className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-bold transition shadow-[0_0_15px_rgba(6,182,212,0.4)]">+ Add Term</button>
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

  const formatTerm = (t: Term, isFirst: boolean) => {
    const val = Math.abs(t.value);
    const sign = t.value >= 0 ? (isFirst ? '' : '+ ') : '- ';

    const toSuperscript = (num: number) => {
      const map: Record<string, string> = {0:'⁰',1:'¹',2:'²',3:'³',4:'⁴',5:'⁵',6:'⁶',7:'⁷',8:'⁸',9:'⁹','-':'⁻'};
      return String(num).split('').map(d => map[d] || d).join('');
    };

    if (t.type === 'variable') {
      const expStr = (t.exponent && t.exponent !== 1) ? toSuperscript(t.exponent) : '';
      if (val === 1) return `${sign}${t.variable}${expStr}`;
      return `${sign}${val}${t.variable}${expStr}`;
    }
    return `${sign}${val}`;
  };

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
        "backdrop-blur-sm rounded-xl border border-white/10",
        "cursor-grab active:cursor-grabbing select-none",
        "transition-all duration-200",
        term.type === 'variable'
          ? "bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:border-cyan-400/50 hover:bg-cyan-500/20"
          : "bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:border-emerald-400/50 hover:bg-emerald-500/20",
        isDragging && "shadow-[0_0_30px_rgba(99,102,241,0.4)] ring-2 ring-indigo-400 bg-indigo-500/20"
      )}
    >
      <span className="text-2xl drop-shadow-[0_0_5px_rgba(0,0,0,0.5)]">
        <Tex latex={termToLatex(term)} />
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

// --- Play-doh Bubble Component ---
const ClayBubble = ({
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

  const factors: [number, number][] = [];
  const powers: [number, number][] = [];

  if (showMenu) {
    const val = node.value;
    for (let i = 2; i <= Math.sqrt(val); i++) {
      if (val % i === 0) {
        factors.push([i, val / i]);
      }
    }
    for (let b = 2; b <= Math.sqrt(val); b++) {
      let temp = val;
      let exp = 0;
      while (temp % b === 0 && temp > 1) {
        temp /= b;
        exp++;
      }
      if (temp === 1 && exp > 1) {
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
            if (!bubbleRef.current) return;
            const originalDisplay = bubbleRef.current.style.display;
            bubbleRef.current.style.display = 'none';

            let clientX, clientY;
            if ('clientX' in e) {
                clientX = (e as MouseEvent).clientX;
                clientY = (e as MouseEvent).clientY;
            } else if ('changedTouches' in e) {
                clientX = (e as TouchEvent).changedTouches[0].clientX;
                clientY = (e as TouchEvent).changedTouches[0].clientY;
            }

            if (clientX !== undefined && clientY !== undefined) {
                const elementBelow = document.elementFromPoint(clientX, clientY);
                const targetNode = elementBelow?.closest('[data-clay-node]');
                if (targetNode) {
                    const targetId = targetNode.getAttribute('data-clay-id');
                    if (targetId && targetId !== node.id) {
                        onMerge(targetId);
                    }
                }
            }

            bubbleRef.current.style.display = originalDisplay;
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

      <AnimatePresence>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-0" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />

            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none z-20"
            >
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

               {powers.map((pair, i) => {
                 const offsetIndex = i + factors.length;
                const angle = (offsetIndex * (360 / (factors.length + powers.length))) * (Math.PI / 180);
                const radius = 80;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.button
                    key={`p-${i}`}
                    className="absolute pointer-events-auto w-14 h-14 rounded-full bg-slate-800 shadow-lg border border-cyan-500/50 flex flex-col items-center justify-center text-sm text-cyan-400 font-bold hover:bg-slate-700 hover:scale-110 transition-transform"
                    style={{ left: `calc(50% + ${x}px - 28px)`, top: `calc(50% + ${y}px - 28px)` }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onTransform(pair[0], pair[1]);
                        setShowMenu(false);
                    }}
                  >
                    {pair[0]}<sup>{pair[1]}</sup>
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

// --- Main Component ---
export default function InteractiveEquation() {
  const [mode, setMode] = useState<'equation' | 'playdoh' | 'create' | 'systems' | 'inequalities'>('equation');
  const [useFormal, setUseFormal] = useState(false);
  const [showProofLog, setShowProofLog] = useState(false);
  const [showDiscriminant, setShowDiscriminant] = useState(false);
  const [showArgand, setShowArgand] = useState(false);
  
  // Equation State
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
  
  const [history, setHistory] = useState<EquationState[]>([]);
  const [activeAxiom, setActiveAxiom] = useState<string | null>(null);
  const proofLogRef = useRef(new ProofLogClass());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Play-doh State
  const [clayNodes, setClayNodes] = useState<ClayNode[]>([]);
  const [inputValue, setInputValue] = useState('64');
  const constraintsRef = useRef(null);
  const [mergeRequest, setMergeRequest] = useState<{ sourceId: string; targetId: string } | null>(null);

  // Equation string input state
  const [equationInput, setEquationInput] = useState('');
  const [parseError, setParseError] = useState('');

  // Derived state — memoized so these only recompute when equation changes
  const allTerms = useMemo(() => [...equation.left, ...equation.right], [equation]);
  const isQuadraticEq = useMemo(() => isQuadratic(allTerms), [allTerms]);
  const quadraticCoeffs = useMemo(
    () => isQuadraticEq ? extractQuadraticCoefficients(allTerms) : null,
    [isQuadraticEq, allTerms]
  );
  const roots = useMemo(
    () => quadraticCoeffs ? calculateRoots(quadraticCoeffs.a, quadraticCoeffs.b, quadraticCoeffs.c) : null,
    [quadraticCoeffs]
  );
  const complexRoots: [ComplexNumber, ComplexNumber] | null = useMemo(
    () => roots ? rootsToComplex(roots.root1, roots.root2) : null,
    [roots]
  );

  // Initialize proof log with starting equation
  useEffect(() => {
    proofLogRef.current.clear();
    proofLogRef.current.addStep(
      equation,
      'reflexive',
      useFormal ? 'Given' : 'Starting equation',
      ''
    );
  }, []);

  const triggerAxiom = (axiomId: string) => {
    setActiveAxiom(axiomId);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setActiveAxiom(null), 3000);
  };

  const handleDragEnd = (term: Term, info: PanInfo, fromSide: 'left' | 'right') => {
    const threshold = 100;
    const offset = info.offset.x;

    let crossed = false;
    if (fromSide === 'left' && offset > threshold) crossed = true;
    if (fromSide === 'right' && offset < -threshold) crossed = true;

    if (crossed) {
      saveHistory();
      const newSide = fromSide === 'left' ? 'right' : 'left';
      const newTerm = { ...term, value: -term.value, id: generateId() };

      const newEquation = {
        left: fromSide === 'left'
          ? equation.left.filter(t => t.id !== term.id)
          : [...equation.left, newTerm],
        right: fromSide === 'right'
          ? equation.right.filter(t => t.id !== term.id)
          : [...equation.right, newTerm]
      };

      setEquation(newEquation);

      // Add to proof log
      const just = generateJustification('move', `${term.value > 0 ? '' : '-'}${Math.abs(term.value)}`, useFormal);
      proofLogRef.current.addStep(
        newEquation,
        just.axiomId,
        just.text,
        useFormal 
          ? `Applied additive inverse to move term across equality`
          : `Moved ${Math.abs(term.value)} to the ${newSide} side`
      );

      triggerAxiom('additive_inverse');
    }
  };

  const combineTerms = (side: 'left' | 'right') => {
    saveHistory();
    
    const oldEquation = { ...equation };
    let combinedTerms: string[] = [];

    setEquation(prev => {
      const terms = prev[side];
      const groups = new Map<string, Term[]>();

      terms.forEach(t => {
        const key = t.type === 'constant'
          ? 'constant'
          : `var:${t.variable}:${t.exponent || 1}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(t);
      });

      const newTerms: Term[] = [];
      let combined = false;

      groups.forEach((groupTerms, key) => {
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
             const varName = first.type === 'variable' 
               ? `${first.variable}${first.exponent && first.exponent !== 1 ? `^${first.exponent}` : ''}`
               : 'constant';
             combinedTerms.push(varName);
          }
        } else {
          newTerms.push(...groupTerms);
        }
      });

      if (combined) {
        const just = generateJustification('combine', combinedTerms.join(', '), useFormal);
        const newEq = { ...prev, [side]: newTerms };
        
        proofLogRef.current.addStep(
          newEq,
          just.axiomId,
          just.text,
          useFormal
            ? `Combined like terms using distributive property`
            : `Combined ${combinedTerms.join(', ')} terms`
        );
        
        triggerAxiom('distributive');
        return newEq;
      }

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

  const saveHistory = () => {
    setHistory(prev => [...prev.slice(-9), JSON.parse(JSON.stringify(equation))]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setEquation(previous);
    setHistory(prev => prev.slice(0, -1));
    proofLogRef.current.undo();
    setActiveAxiom(null);
  };

  const combineBothTerms = () => {
    saveHistory();
    const processTerms = (terms: Term[]): { result: Term[]; changed: boolean } => {
      const groups = new Map<string, Term[]>();
      terms.forEach(t => {
        const key = t.type === 'constant' ? 'constant' : `var:${t.variable}:${t.exponent || 1}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(t);
      });
      const newTerms: Term[] = [];
      let changed = false;
      groups.forEach(groupTerms => {
        if (groupTerms.length > 1) {
          changed = true;
          const totalVal = groupTerms.reduce((acc, t) => acc + t.value, 0);
          if (totalVal !== 0) newTerms.push({ ...groupTerms[0], id: generateId(), value: totalVal });
        } else {
          newTerms.push(...groupTerms);
        }
      });
      if (!changed) {
        newTerms.sort((a, b) => {
          if (a.type !== b.type) return a.type === 'variable' ? -1 : 1;
          if (a.type === 'variable' && b.type === 'variable') {
            if (a.variable !== b.variable) return (a.variable || '').localeCompare(b.variable || '');
            return (b.exponent || 1) - (a.exponent || 1);
          }
          return 0;
        });
      }
      return { result: newTerms, changed };
    };
    setEquation(prev => {
      const left = processTerms(prev.left);
      const right = processTerms(prev.right);
      const newEq = { left: left.result, right: right.result };
      if (left.changed || right.changed) {
        const just = generateJustification('combine', 'both sides', useFormal);
        proofLogRef.current.addStep(newEq, just.axiomId, just.text,
          useFormal ? 'Combined like terms on both sides using the Distributive Property' : 'Simplified both sides');
        triggerAxiom('distributive');
      }
      return newEq;
    });
  };

  const isSolved = (
    (equation.left.length === 1 && equation.left[0].type === 'variable' &&
     Math.abs(equation.left[0].value) === 1 && (equation.left[0].exponent ?? 1) === 1 &&
     equation.right.length === 1 && equation.right[0].type === 'constant') ||
    (equation.right.length === 1 && equation.right[0].type === 'variable' &&
     Math.abs(equation.right[0].value) === 1 && (equation.right[0].exponent ?? 1) === 1 &&
     equation.left.length === 1 && equation.left[0].type === 'constant')
  );

  // Play-doh Logic
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

  const applyMerge = (op: string) => {
    if (!mergeRequest) return;
    const { sourceId, targetId } = mergeRequest;
    setClayNodes(prev => {
      const n1 = prev.find(n => n.id === sourceId);
      const n2 = prev.find(n => n.id === targetId);
      if (!n1 || !n2) return prev;
      let newVal: number;
      switch (op) {
        case '+': newVal = n1.value + n2.value; break;
        case '-': newVal = n1.value - n2.value; break;
        case '×': newVal = n1.value * n2.value; break;
        case '÷':
          if (Math.abs(n2.value) < 1e-10) return prev;
          newVal = Math.round((n1.value / n2.value) * 10000) / 10000;
          break;
        default: return prev;
      }
      return [
        ...prev.filter(n => n.id !== sourceId && n.id !== targetId),
        { id: generateId(), value: newVal, type: 'base' as const }
      ];
    });
    setMergeRequest(null);
  };

  const combineAll = () => {
    setClayNodes(prev => {
      if (prev.length <= 1) return prev;
      const product = prev.reduce((acc, n) => acc * n.value, 1);
      return [{ id: generateId(), value: Math.round(product * 10000) / 10000, type: 'base' as const }];
    });
  };

  const loadTemplate = (tmpl: typeof TEMPLATES[0]) => {
    const newEquation = {
      left: JSON.parse(JSON.stringify(tmpl.left)),
      right: JSON.parse(JSON.stringify(tmpl.right))
    };
    setEquation(newEquation);
    setHistory([]);
    proofLogRef.current.clear();
    proofLogRef.current.addStep(
      newEquation,
      'reflexive',
      useFormal ? 'Given' : 'Starting equation',
      ''
    );
  };

  const handleParseInput = () => {
    const trimmed = equationInput.trim();
    if (!trimmed) return;
    const parsed = parseEquationString(trimmed);
    if (!parsed) {
      setParseError('Could not parse equation. Try: 2x + 5 = 15');
      return;
    }
    setParseError('');
    const newEquation = { left: parsed.left, right: parsed.right };
    setEquation(newEquation);
    setHistory([]);
    proofLogRef.current.clear();
    proofLogRef.current.addStep(newEquation, 'reflexive', useFormal ? 'Given' : 'Starting equation', '');
    setEquationInput('');
  };

  // Detect kx = n or n = kx form where k !== 1 and k !== 0
  const getDivisor = (): number | null => {
    const left = equation.left;
    const right = equation.right;
    if (left.length === 1 && left[0].type === 'variable' && (left[0].exponent ?? 1) === 1 &&
        Math.abs(left[0].value) !== 1 && Math.abs(left[0].value) > 1e-10 &&
        right.length === 1 && right[0].type === 'constant') {
      return left[0].value;
    }
    if (right.length === 1 && right[0].type === 'variable' && (right[0].exponent ?? 1) === 1 &&
        Math.abs(right[0].value) !== 1 && Math.abs(right[0].value) > 1e-10 &&
        left.length === 1 && left[0].type === 'constant') {
      return right[0].value;
    }
    return null;
  };

  const divisor = getDivisor();

  const divideBothSides = () => {
    if (!divisor) return;
    saveHistory();
    setEquation(prev => {
      const newLeft = prev.left.map(t => ({ ...t, id: generateId(), value: Math.round((t.value / divisor) * 10000) / 10000 }));
      const newRight = prev.right.map(t => ({ ...t, id: generateId(), value: Math.round((t.value / divisor) * 10000) / 10000 }));
      const newEq = { left: newLeft, right: newRight };
      const just = generateJustification('divide', String(divisor), useFormal);
      proofLogRef.current.addStep(newEq, just.axiomId, just.text,
        useFormal ? `Divided both sides by ${divisor} (Division Property of Equality)` : `Divided both sides by ${divisor}`);
      triggerAxiom('division_equality');
      return newEq;
    });
  };

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto">

      {/* Header Controls */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 mb-6">
        <NotationToggle useFormal={useFormal} onToggle={() => setUseFormal(!useFormal)} />
        
        {mode === 'equation' && (
          <div className="flex items-center gap-2">
            {isQuadraticEq && (
              <>
                <button
                  onClick={() => setShowDiscriminant(!showDiscriminant)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    showDiscriminant 
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" 
                      : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-slate-700/50"
                  )}
                >
                  <Calculator className="w-4 h-4" />
                  Discriminant
                </button>
                {complexRoots && complexRoots.some(r => Math.abs(r.imag) > 1e-10) && (
                  <button
                    onClick={() => setShowArgand(!showArgand)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      showArgand 
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" 
                        : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-slate-700/50"
                    )}
                  >
                    <Shapes className="w-4 h-4" />
                    Complex Plane
                  </button>
                )}
              </>
            )}
            <button
              onClick={() => setShowProofLog(!showProofLog)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                showProofLog 
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40" 
                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-slate-700/50"
              )}
            >
              <Settings className="w-4 h-4" />
              Proof Log
            </button>
          </div>
        )}
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 bg-slate-900/50 p-1 rounded-full border border-slate-700/50 backdrop-blur-sm">
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
          <button
              onClick={() => setMode('systems')}
              className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-all", mode === 'systems' ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]" : "text-slate-500 hover:text-slate-300")}
          >
              <GitBranch className="w-3.5 h-3.5 inline mr-1" />
              Systems
          </button>
          <button
              onClick={() => setMode('inequalities')}
              className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-all", mode === 'inequalities' ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]" : "text-slate-500 hover:text-slate-300")}
          >
              <ArrowLeftRight className="w-3.5 h-3.5 inline mr-1" />
              Inequalities
          </button>
      </div>

      {mode === 'equation' && (
        <div className="w-full max-w-2xl mb-4 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={equationInput}
              onChange={e => { setEquationInput(e.target.value); setParseError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleParseInput()}
              placeholder="Type an equation, e.g. 2x + 5 = 15"
              className="flex-1 px-4 py-2 bg-slate-900/70 border border-slate-700 rounded-xl text-sm font-mono text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
            />
            <button
              onClick={handleParseInput}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold transition-all shadow"
            >
              Parse
            </button>
          </div>
          {parseError && (
            <p className="text-xs text-rose-400 pl-1">{parseError}</p>
          )}
        </div>
      )}

      {mode === 'equation' && (
           <div className="flex flex-wrap justify-center gap-2 mb-8">
             {TEMPLATES.map((tmpl, idx) => (
               <button
                 key={idx}
                 onClick={() => loadTemplate(tmpl)}
                 className="px-3 py-1 bg-slate-900/50 border border-slate-700/50 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-800 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
               >
                 {tmpl.name}
               </button>
             ))}
           </div>
        )}

      {mode === 'equation' ? (
        <>
            {/* EQUATION MODE CONTENT */}
            <p className="text-slate-400 mb-6 text-center text-sm">
              {useFormal 
                ? "Drag terms across the equality to apply the Additive Inverse Property."
                : "Drag terms across the center to invert their sign."}
            </p>
            
            <div className="relative flex items-center justify-center w-full max-w-5xl h-64 bg-slate-900/40 rounded-3xl border border-slate-700/50 overflow-hidden backdrop-blur-md shadow-2xl">
                <div className="absolute inset-0 bg-grid-slate-800 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none opacity-20" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-0">
                <div className="text-6xl font-bold text-slate-700 select-none">=</div>
                <div className="w-px h-full bg-slate-700/50 absolute top-0 -z-10" />
                </div>

                <div className="flex-1 h-full flex items-center justify-center p-4 z-10 border-r border-slate-700/30">
                <div className="flex flex-wrap justify-center items-center gap-2">
                    <AnimatePresence mode='popLayout'>
                    {equation.left.length === 0 && (
                        <motion.div initial={{opacity:0}} animate={{opacity:0.3}} className="text-4xl font-bold text-slate-600">0</motion.div>
                    )}
                    {equation.left.map((term) => (
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
                    {equation.right.map((term) => (
                        <TermCard key={term.id} term={term} side="right" onDragEnd={(t, i) => handleDragEnd(t, i, 'right')} />
                    ))}
                    </AnimatePresence>
                </div>
                </div>

                {isSolved && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 bg-emerald-900/90 backdrop-blur-md flex items-center justify-center z-50">
                        <div className="text-center">
                        <h2 className="text-3xl font-bold text-emerald-300 mb-2 drop-shadow-md">Solved! 🎉</h2>
                        <button onClick={() => loadTemplate(TEMPLATES[0])} className="px-6 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-500 transition shadow-[0_0_15px_rgba(16,185,129,0.4)]">New Problem</button>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <button onClick={combineBothTerms} className="px-6 py-3 bg-slate-800/80 border border-slate-600 shadow-lg rounded-xl text-slate-300 font-medium hover:bg-slate-700 hover:text-white hover:border-cyan-500/50 transition-all backdrop-blur-sm">
                  {useFormal ? 'Simplify Both Sides (Distributive)' : 'Simplify Both Sides'}
                </button>
                {divisor !== null && (
                  <button onClick={divideBothSides} className="px-6 py-3 bg-amber-900/40 border border-amber-600/50 shadow-lg rounded-xl text-amber-300 font-medium hover:bg-amber-800/50 hover:text-amber-200 hover:border-amber-500/70 transition-all backdrop-blur-sm">
                    {useFormal ? `Divide Both Sides by ${divisor} (Division Property)` : `Divide Both Sides by ${divisor}`}
                  </button>
                )}
                <button onClick={undo} disabled={history.length === 0} className="px-6 py-3 bg-slate-800/80 border border-slate-600 shadow-lg rounded-xl text-slate-300 font-medium hover:bg-slate-700 hover:text-white hover:border-cyan-500/50 transition-all disabled:opacity-50 disabled:hover:bg-slate-800 disabled:hover:border-slate-600 disabled:cursor-not-allowed">
                  Undo
                </button>
            </div>

            {/* Discriminant Panel */}
            <AnimatePresence>
              {showDiscriminant && isQuadraticEq && quadraticCoeffs && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="w-full max-w-4xl mt-8 overflow-hidden"
                >
                  <DiscriminantPanel 
                    coefficients={quadraticCoeffs}
                    showCompletingSquare={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Argand Diagram */}
            <AnimatePresence>
              {showArgand && complexRoots && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="w-full max-w-4xl mt-8 overflow-hidden"
                >
                  <ArgandDiagram 
                    roots={complexRoots}
                    showConjugateLines={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Proof Log */}
            <ProofLog 
              steps={proofLogRef.current.getSteps()}
              useFormal={useFormal}
              isOpen={showProofLog}
              onToggle={() => setShowProofLog(!showProofLog)}
            />

            {/* Axiom Panel */}
            <div className="mt-12 w-full max-w-4xl">
              <AxiomPanel 
                activeAxiomId={activeAxiom}
                useFormal={useFormal}
              />
            </div>

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
                    Create
                </button>
                <button
                    onClick={combineAll}
                    disabled={clayNodes.length <= 1}
                    className="px-6 py-2 bg-slate-800 border border-slate-600 text-slate-400 rounded-xl font-bold hover:bg-slate-700 hover:text-amber-400 hover:border-amber-500/50 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Combine ×
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
                            onMerge={(targetId) => setMergeRequest({ sourceId: node.id, targetId })}
                        />
                    ))}
                </AnimatePresence>
            </div>

            <div className="mt-8 text-slate-500 text-sm max-w-lg text-center">
                <p><strong>Click a bubble</strong> to split into factors or powers. <strong>Drag one bubble onto another</strong> to combine — choose +, −, ×, or ÷.</p>
            </div>
        </>
      ) : mode === 'create' ? (
        <>
            {/* CREATE MODE CONTENT */}
            <p className="text-slate-400 mb-8 text-center text-sm">Build your own equation by adding terms to each side.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                <div className="flex flex-col gap-4">
                    <h3 className="text-center font-bold text-cyan-400 uppercase text-xs">Left Side</h3>
                    <div className="bg-slate-900/40 p-4 rounded-2xl shadow-inner border border-slate-700/50 min-h-[160px] flex flex-wrap gap-2 items-start content-start">
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
                    <div className="bg-slate-900/40 p-4 rounded-2xl shadow-inner border border-slate-700/50 min-h-[160px] flex flex-wrap gap-2 items-start content-start">
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
                        proofLogRef.current.clear();
                        proofLogRef.current.addStep(
                          equation,
                          'reflexive',
                          useFormal ? 'Given' : 'Starting equation',
                          ''
                        );
                        setMode('equation');
                    }}
                    disabled={equation.left.length === 0 && equation.right.length === 0}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
                >
                    Solve This Equation →
                </button>
            </div>
        </>
      ) : mode === 'systems' ? (
        <SystemsSolver />
      ) : mode === 'inequalities' ? (
        <InequalitySolver />
      ) : null}

      {/* Operation Picker for Play-doh merge */}
      <AnimatePresence>
        {mergeRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setMergeRequest(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-slate-900 rounded-2xl border border-slate-700 p-8 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-4 mb-3">
                  <span className="text-3xl font-bold font-mono text-amber-400">
                    {clayNodes.find(n => n.id === mergeRequest.sourceId)?.display ?? clayNodes.find(n => n.id === mergeRequest.sourceId)?.value}
                  </span>
                  <span className="text-slate-600 text-2xl">?</span>
                  <span className="text-3xl font-bold font-mono text-cyan-400">
                    {clayNodes.find(n => n.id === mergeRequest.targetId)?.display ?? clayNodes.find(n => n.id === mergeRequest.targetId)?.value}
                  </span>
                </div>
                <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Choose Operation</p>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { op: '+', label: '+', cls: 'border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]' },
                  { op: '-', label: '−', cls: 'border-rose-500/50 text-rose-300 hover:bg-rose-500/20 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]' },
                  { op: '×', label: '×', cls: 'border-amber-500/50 text-amber-300 hover:bg-amber-500/20 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]' },
                  { op: '÷', label: '÷', cls: 'border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/20 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]' },
                ].map(({ op, label, cls }) => (
                  <button
                    key={op}
                    onClick={() => applyMerge(op)}
                    className={cn('w-16 h-16 rounded-xl border bg-slate-800/60 text-2xl font-bold transition-all hover:scale-110', cls)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setMergeRequest(null)}
                className="mt-5 w-full py-2 text-xs text-slate-600 hover:text-slate-400 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
