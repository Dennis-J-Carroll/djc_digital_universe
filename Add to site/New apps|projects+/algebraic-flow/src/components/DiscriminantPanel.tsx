import React from 'react';
import { motion } from 'framer-motion';
import { Tex } from '../lib/math';
import { 
  analyzeDiscriminant, 
  calculateRoots, 
  calculateVertex,
  generateCompletingSquareSteps,
  DiscriminantAnalysis,
  QuadraticCoefficients
} from '../lib/quadratic';
import { ComplexNumber, formatComplex, rootsToComplex, generateArgandData } from '../lib/complex';
import { AlertCircle, Calculator, TrendingUp, GitBranch } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DiscriminantPanelProps {
  coefficients: QuadraticCoefficients;
  showCompletingSquare?: boolean;
}

export const DiscriminantPanel: React.FC<DiscriminantPanelProps> = ({ 
  coefficients,
  showCompletingSquare = false
}) => {
  const { a, b, c } = coefficients;
  const analysis = analyzeDiscriminant(a, b, c);
  const roots = calculateRoots(a, b, c);
  const vertex = calculateVertex(a, b, c);
  const completingSquareSteps = generateCompletingSquareSteps(a, b, c);

  const complexRoots: [ComplexNumber, ComplexNumber] | null = 
    analysis.type === 'complex' ? rootsToComplex(roots.root1, roots.root2) : null;

  return (
    <div className="w-full space-y-4">
      {/* Discriminant Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl border backdrop-blur-md"
        style={{ 
          backgroundColor: `${analysis.color}15`,
          borderColor: `${analysis.color}40`
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold mb-1" style={{ color: analysis.color }}>
              Discriminant Analysis
            </h3>
            <p className="text-slate-400 text-sm">b² − 4ac determines the nature of roots</p>
          </div>
          <div 
            className="px-4 py-2 rounded-xl font-mono text-2xl font-bold"
            style={{ backgroundColor: `${analysis.color}20`, color: analysis.color }}
          >
            Δ = {analysis.value}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-xl bg-slate-900/50">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Type</div>
            <div className="font-medium text-slate-200">{analysis.description}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/50">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Geometric Meaning</div>
            <div className="text-sm text-slate-300">{analysis.geometricMeaning}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/50">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Vertex</div>
            <div className="font-mono text-slate-200">
              ({vertex.x.toFixed(2)}, {vertex.y.toFixed(2)})
            </div>
          </div>
        </div>
      </motion.div>

      {/* Roots Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-700/50"
        >
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="w-5 h-5 text-cyan-400" />
            <h4 className="font-bold text-slate-200">Roots</h4>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
              <span className="text-slate-400">x₁</span>
              <span className="font-mono text-lg" style={{ color: analysis.color }}>
                {analysis.type === 'complex' && complexRoots
                  ? formatComplex(complexRoots[0])
                  : roots.root1.real.toFixed(4)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
              <span className="text-slate-400">x₂</span>
              <span className="font-mono text-lg" style={{ color: analysis.color }}>
                {analysis.type === 'complex' && complexRoots
                  ? formatComplex(complexRoots[1])
                  : roots.root2.real.toFixed(4)}
              </span>
            </div>
          </div>

          {analysis.type === 'complex' && complexRoots && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5" />
                <p className="text-xs text-rose-300">
                  Complex roots appear as conjugate pairs. The parabola does not intersect the real x-axis.
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Quadratic Formula Reference */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-700/50"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-amber-400" />
            <h4 className="font-bold text-slate-200">Quadratic Formula</h4>
          </div>
          
          <div className="p-4 rounded-xl bg-slate-800/50 text-center text-lg text-slate-200 mb-4">
            <Tex latex={String.raw`x = \dfrac{-b \pm \sqrt{\Delta}}{2a}`} display />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">a =</span>
              <span className="font-mono text-cyan-400">{a}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">b =</span>
              <span className="font-mono text-cyan-400">{b}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">c =</span>
              <span className="font-mono text-cyan-400">{c}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Completing the Square Steps */}
      {showCompletingSquare && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-700/50"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-slate-200">Completing the Square</h4>
          </div>

          <div className="space-y-3">
            {completingSquareSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-4 p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                  {step.step}
                </span>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1">{step.description}</p>
                  <p className="text-slate-200">
                    <Tex latex={step.latex} />
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DiscriminantPanel;
