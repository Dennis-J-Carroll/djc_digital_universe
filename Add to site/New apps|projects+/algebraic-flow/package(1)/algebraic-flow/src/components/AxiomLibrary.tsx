import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { cn } from '../lib/utils';

export interface AxiomData {
  id: string;
  title: string;
  formula: string;
  shortDesc: string;
  longDesc: string;
  example: string;
  visual?: React.ReactNode;
}

export const AXIOMS: Record<string, AxiomData> = {
  'additive_inverse': {
    id: 'additive_inverse',
    title: 'Additive Inverse Property',
    formula: 'a + (-a) = 0',
    shortDesc: 'Moving a term across equality inverts its sign.',
    longDesc: 'When you move a term from one side of the equation to the other, you are actually performing the same operation on both sides to keep the balance. To remove "+5" from the left, we subtract 5 from both sides. On the left, 5 - 5 becomes 0 (disappears). On the right, -5 appears.',
    example: 'x + 5 = 10  →  x + 5 - 5 = 10 - 5  →  x = 5',
    visual: (
      <div className="flex items-center justify-center gap-4 text-sm font-mono text-slate-400">
        <div className="p-2 bg-slate-800 rounded border border-slate-700">x + 5 = 10</div>
        <span>→</span>
        <div className="p-2 bg-slate-800 rounded border border-slate-700">x = 10 - 5</div>
      </div>
    )
  },
  'distributive': {
    id: 'distributive',
    title: 'Distributive Property',
    formula: 'ax + bx = (a + b)x',
    shortDesc: 'Combining like terms adds their coefficients.',
    longDesc: 'When terms share the same variable part (like "x" or "y²"), we can group them together. This is the reverse of distributing a number into parentheses. We are factoring out the variable and adding the numbers in front.',
    example: '2x + 3x = (2 + 3)x = 5x',
    visual: (
      <div className="flex flex-col gap-2 text-sm font-mono text-slate-400 items-center">
        <div className="flex gap-2">
            <span className="text-cyan-400">2x</span> + <span className="text-emerald-400">3x</span>
        </div>
        <div className="w-px h-4 bg-slate-600"></div>
        <div className="p-2 bg-slate-800 rounded border border-slate-700">
            (<span className="text-cyan-400">2</span> + <span className="text-emerald-400">3</span>)x = <span className="text-white font-bold">5x</span>
        </div>
      </div>
    )
  }
};

interface AxiomModalProps {
  axiomId: string | null;
  onClose: () => void;
}

export const AxiomModal: React.FC<AxiomModalProps> = ({ axiomId, onClose }) => {
  if (!axiomId || !AXIOMS[axiomId]) return null;
  const axiom = AXIOMS[axiomId];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="h-2 w-full bg-gradient-to-r from-cyan-500 to-indigo-500" />

          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{axiom.title}</h2>
                    <div className="inline-block px-3 py-1 bg-slate-800 rounded-lg border border-slate-700 text-indigo-300 font-mono text-sm">
                        {axiom.formula}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                    ✕
                </button>
            </div>

            <div className="space-y-6">
                <div className="bg-indigo-950/30 p-4 rounded-xl border border-indigo-500/20">
                    <p className="text-indigo-200 text-sm leading-relaxed">
                        {axiom.longDesc}
                    </p>
                </div>

                {axiom.visual && (
                    <div className="flex justify-center py-4 bg-slate-950/50 rounded-xl border border-slate-800">
                        {axiom.visual}
                    </div>
                )}

                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Example</h4>
                    <div className="font-mono text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                        {axiom.example}
                    </div>
                </div>
            </div>

            <button
                onClick={onClose}
                className="w-full mt-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors border border-slate-600"
            >
                Got it!
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

interface AxiomCardProps {
    axiomId: string;
    active: boolean;
    onMoreInfo: () => void;
}

export const AxiomCard: React.FC<AxiomCardProps> = ({ axiomId, active, onMoreInfo }) => {
    const axiom = AXIOMS[axiomId];
    if (!axiom) return null;

    return (
        <motion.div
            animate={{
                backgroundColor: active ? "rgba(99, 102, 241, 0.15)" : "rgba(30, 41, 59, 0.4)",
                borderColor: active ? "rgba(99, 102, 241, 0.6)" : "rgba(71, 85, 105, 0.4)",
                scale: active ? 1.02 : 1,
                boxShadow: active ? "0 0 20px rgba(99, 102, 241, 0.2)" : "none"
            }}
            className="relative p-4 rounded-xl border backdrop-blur-sm transition-all overflow-hidden group"
        >
            <div className="flex justify-between items-center mb-2">
                <h4 className={cn("font-bold text-sm uppercase tracking-wider", active ? "text-indigo-300" : "text-slate-400")}>{axiom.title}</h4>
                {active && <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold border border-indigo-500/30 animate-pulse">ACTIVE</span>}
            </div>
            <div className="text-lg font-mono text-slate-200 mb-2">{axiom.formula}</div>
            <p className="text-xs text-slate-400 mb-4">{axiom.shortDesc}</p>

            <button
                onClick={onMoreInfo}
                className="text-[10px] uppercase font-bold text-cyan-500 hover:text-cyan-400 flex items-center gap-1 transition-colors"
            >
                Learn More <span>→</span>
            </button>

            {/* Background decoration */}
            <div className={cn("absolute -bottom-4 -right-4 w-24 h-24 rounded-full blur-2xl transition-opacity opacity-0 group-hover:opacity-20", active ? "bg-indigo-500 opacity-20" : "bg-slate-500")} />
        </motion.div>
    );
};
