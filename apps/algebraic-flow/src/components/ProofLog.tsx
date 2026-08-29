import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProofStep } from '../lib/proofLog';
import { Tex, termsToLatex } from '../lib/math';
import { ChevronDown, ChevronUp, Copy, FileText, Download, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProofLogProps {
  steps: ProofStep[];
  useFormal: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export const ProofLog: React.FC<ProofLogProps> = ({ 
  steps, 
  useFormal,
  isOpen,
  onToggle
}) => {
  const [showExport, setShowExport] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyLatex = () => {
    const latex = generateLatex(steps);
    navigator.clipboard.writeText(latex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadProof = () => {
    const content = generateTextProof(steps, useFormal);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'algebraic-proof.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (steps.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 p-4 bg-slate-900/30 rounded-xl border border-slate-700/30 text-center">
        <p className="text-slate-500 text-sm">
          Start solving to see your proof log here...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <motion.button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-slate-800/60 backdrop-blur-md rounded-xl border border-slate-700/50 hover:bg-slate-800/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-indigo-400" />
          <span className="font-bold text-slate-200">
            Proof Log
          </span>
          <span className="text-xs text-slate-500">
            ({steps.length} step{steps.length !== 1 ? 's' : ''})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowExport(true);
            }}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            title="Export proof"
          >
            <Download className="w-4 h-4 text-slate-400" />
          </button>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-700/50 overflow-hidden">
              {/* Two-column proof header */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-slate-800/50 border-b border-slate-700/50 text-xs font-bold uppercase tracking-wider text-slate-500">
                <div className="col-span-1">Step</div>
                <div className="col-span-5">Equation</div>
                <div className="col-span-6">Justification</div>
              </div>

              {/* Proof steps */}
              <div className="divide-y divide-slate-700/30">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "grid grid-cols-12 gap-4 p-4 hover:bg-slate-800/30 transition-colors",
                      index === steps.length - 1 && "bg-indigo-500/5"
                    )}
                  >
                    <div className="col-span-1 text-slate-500 font-mono">
                      {step.stepNumber}
                    </div>
                    <div className="col-span-5 text-slate-200">
                      <span className="text-cyan-400">
                        <Tex latex={termsToLatex(step.equation.left)} />
                      </span>
                      <span className="text-slate-500 mx-2">=</span>
                      <span className="text-emerald-400">
                        <Tex latex={termsToLatex(step.equation.right)} />
                      </span>
                    </div>
                    <div className="col-span-6 text-sm">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        step.axiomId === 'additive_inverse' ? "bg-indigo-500/20 text-indigo-300" :
                        step.axiomId === 'distributive' ? "bg-cyan-500/20 text-cyan-300" :
                        step.axiomId === 'division_equality' ? "bg-amber-500/20 text-amber-300" :
                        "bg-slate-700/50 text-slate-400"
                      )}>
                        {step.justification}
                      </span>
                      {step.description && (
                        <p className="mt-1 text-xs text-slate-500">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
        {showExport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowExport(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-2xl border border-slate-700 p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-200">Export Proof</h3>
                <button 
                  onClick={() => setShowExport(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={copyLatex}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy LaTeX'}
                </button>
                <button
                  onClick={downloadProof}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Text
                </button>
              </div>

              <div className="flex-1 overflow-auto bg-slate-950 rounded-xl p-4 font-mono text-sm text-slate-300">
                <pre>{generateLatex(steps)}</pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper functions
function generateLatex(steps: ProofStep[]): string {
  let latex = '\\begin{align*}\n';
  
  steps.forEach((step, index) => {
    const left = toLatexExpression(step.equation.left);
    const right = toLatexExpression(step.equation.right);
    latex += `  ${left} &= ${right} && \\text{${step.justification}}`;
    if (index < steps.length - 1) {
      latex += ' \\\\\n';
    } else {
      latex += '\n';
    }
  });
  
  latex += '\\end{align*}';
  return latex;
}

function toLatexExpression(terms: { type: string; value: number; variable?: string; exponent?: number }[]): string {
  if (terms.length === 0) return '0';
  
  return terms.map((term, index) => {
    const isFirst = index === 0;
    const val = Math.abs(term.value);
    const sign = term.value >= 0 ? (isFirst ? '' : ' + ') : ' - ';
    
    if (term.type === 'constant') {
      return `${sign}${val}`;
    } else {
      const expStr = term.exponent && term.exponent !== 1 ? `^{${term.exponent}}` : '';
      if (val === 1) return `${sign}${term.variable}${expStr}`;
      return `${sign}${val}${term.variable}${expStr}`;
    }
  }).join('');
}

function generateTextProof(steps: ProofStep[], useFormal: boolean): string {
  let text = 'ALGEBRAIC FLOW - PROOF LOG\n';
  text += '='.repeat(60) + '\n\n';
  text += `Generated: ${new Date().toLocaleString()}\n`;
  text += `Notation: ${useFormal ? 'Formal' : 'Intuitive'}\n\n`;
  text += '-'.repeat(60) + '\n';
  text += 'Step | Equation | Justification\n';
  text += '-'.repeat(60) + '\n';
  
  steps.forEach(step => {
    const eq = `${step.leftExpression} = ${step.rightExpression}`;
    text += `${step.stepNumber.toString().padStart(4)} | ${eq.padEnd(30)} | ${step.justification}\n`;
  });
  
  text += '-'.repeat(60) + '\n';
  text += `\nTotal steps: ${steps.length}\n`;
  
  return text;
}

export default ProofLog;
