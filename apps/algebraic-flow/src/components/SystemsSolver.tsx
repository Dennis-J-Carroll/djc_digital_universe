import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine
} from 'recharts';
import { 
  LinearEquation, 
  SystemSolution, 
  solveSystem, 
  generateLineData, 
  calculateViewRange,
  formatEquation,
  isValidSystem,
  SYSTEM_TEMPLATES
} from '../lib/systems';
import { Calculator, GitBranch, AlertCircle, CheckCircle2, XCircle, Infinity as InfinityIcon } from 'lucide-react';
import { Tex } from '../lib/math';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fix for Recharts TS issues
const LineChartComponent = LineChart as any;
const LineComponent = Line as any;
const XAxisComponent = XAxis as any;
const YAxisComponent = YAxis as any;
const CartesianGridComponent = CartesianGrid as any;
const TooltipComponent = Tooltip as any;
const ReferenceDotComponent = ReferenceDot as any;
const ReferenceLineComponent = ReferenceLine as any;

export const SystemsSolver: React.FC = () => {
  const [eq1, setEq1] = useState<LinearEquation>({ id: '1', a: 1, b: 1, c: 5 });
  const [eq2, setEq2] = useState<LinearEquation>({ id: '2', a: 2, b: -1, c: 3 });

  const solution = useMemo(() => solveSystem(eq1, eq2), [eq1, eq2]);
  const viewRange = useMemo(() => calculateViewRange(eq1, eq2, solution), [eq1, eq2, solution]);
  
  const line1Data = useMemo(() => generateLineData(eq1, viewRange.x), [eq1, viewRange]);
  const line2Data = useMemo(() => generateLineData(eq2, viewRange.x), [eq2, viewRange]);
  
  const isValid = isValidSystem(eq1, eq2);

  const updateEquation = (id: string, field: keyof LinearEquation, value: number) => {
    if (id === '1') {
      setEq1(prev => ({ ...prev, [field]: value }));
    } else {
      setEq2(prev => ({ ...prev, [field]: value }));
    }
  };

  const loadTemplate = (template: typeof SYSTEM_TEMPLATES[0]) => {
    setEq1({ ...template.eq1, id: '1' });
    setEq2({ ...template.eq2, id: '2' });
  };

  const getSolutionIcon = () => {
    switch (solution.type) {
      case 'unique': return <CheckCircle2 className="w-6 h-6 text-emerald-400" />;
      case 'infinite': return <InfinityIcon className="w-6 h-6 text-amber-400" />;
      case 'none': return <XCircle className="w-6 h-6 text-rose-400" />;
    }
  };

  const getSolutionColor = () => {
    switch (solution.type) {
      case 'unique': return 'border-emerald-500/30 bg-emerald-500/10';
      case 'infinite': return 'border-amber-500/30 bg-amber-500/10';
      case 'none': return 'border-rose-500/30 bg-rose-500/10';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Templates */}
      <div className="flex flex-wrap justify-center gap-2">
        {SYSTEM_TEMPLATES.map((template, idx) => (
          <button
            key={idx}
            onClick={() => loadTemplate(template)}
            className="px-3 py-1.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-800 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
          >
            {template.name}
          </button>
        ))}
      </div>

      {/* Equation Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Equation 1 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-700/50"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
              <span className="text-cyan-400 font-bold text-sm">1</span>
            </div>
            <h3 className="font-bold text-slate-200">First Equation</h3>
          </div>

          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-800/50 text-center text-lg text-slate-200">
              <Tex latex={formatEquation(eq1)} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-cyan-400 uppercase mb-1">x coefficient</label>
                <input
                  type="number"
                  value={eq1.a}
                  onChange={(e) => updateEquation('1', 'a', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-cyan-400 uppercase mb-1">y coefficient</label>
                <input
                  type="number"
                  value={eq1.b}
                  onChange={(e) => updateEquation('1', 'b', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-cyan-400 uppercase mb-1">constant</label>
                <input
                  type="number"
                  value={eq1.c}
                  onChange={(e) => updateEquation('1', 'c', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Equation 2 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-700/50"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400 font-bold text-sm">2</span>
            </div>
            <h3 className="font-bold text-slate-200">Second Equation</h3>
          </div>

          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-800/50 text-center text-lg text-slate-200">
              <Tex latex={formatEquation(eq2)} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-emerald-400 uppercase mb-1">x coefficient</label>
                <input
                  type="number"
                  value={eq2.a}
                  onChange={(e) => updateEquation('2', 'a', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-emerald-400 uppercase mb-1">y coefficient</label>
                <input
                  type="number"
                  value={eq2.b}
                  onChange={(e) => updateEquation('2', 'b', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-emerald-400 uppercase mb-1">constant</label>
                <input
                  type="number"
                  value={eq2.c}
                  onChange={(e) => updateEquation('2', 'c', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Solution Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={cn(
          "p-6 rounded-2xl border backdrop-blur-md",
          getSolutionColor()
        )}
      >
        <div className="flex items-start gap-4">
          {getSolutionIcon()}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-200 mb-1">
              {solution.type === 'unique' ? 'Unique Solution' : 
               solution.type === 'infinite' ? 'Infinitely Many Solutions' : 
               'No Solution'}
            </h3>
            <p className="text-slate-300 mb-3">{solution.message}</p>
            
            {solution.type === 'unique' && (
              <div className="flex gap-4">
                <div className="px-4 py-2 rounded-xl bg-slate-900/50">
                  <span className="text-xs text-slate-500 uppercase">x = </span>
                  <span className="font-mono text-cyan-400">{solution.x!.toFixed(4)}</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-slate-900/50">
                  <span className="text-xs text-slate-500 uppercase">y = </span>
                  <span className="font-mono text-emerald-400">{solution.y!.toFixed(4)}</span>
                </div>
              </div>
            )}
            
            <p className="mt-3 text-sm text-slate-400">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              {solution.geometricInterpretation}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-700/50"
      >
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-slate-200">Geometric Interpretation</h3>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChartComponent margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGridComponent strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              
              <XAxisComponent 
                type="number" 
                dataKey="x" 
                domain={viewRange.x}
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#475569' }}
                label={{ value: 'x', position: 'right', fill: '#64748b' }}
              />
              <YAxisComponent 
                type="number" 
                domain={viewRange.y}
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#475569' }}
                label={{ value: 'y', position: 'top', fill: '#64748b' }}
              />

              <TooltipComponent
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderRadius: '12px', 
                  border: '1px solid #334155', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)', 
                  color: '#f1f5f9' 
                }}
                formatter={(value: number) => [value.toFixed(3), 'y']}
              />

              {/* Line 1 */}
              <LineComponent
                data={line1Data}
                type="monotone"
                dataKey="y"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={false}
                name={formatEquation(eq1)}
              />

              {/* Line 2 */}
              <LineComponent
                data={line2Data}
                type="monotone"
                dataKey="y"
                stroke="#10b981"
                strokeWidth={3}
                dot={false}
                name={formatEquation(eq2)}
              />

              {/* Intersection point */}
              {solution.type === 'unique' && (
                <ReferenceDotComponent
                  x={solution.x}
                  y={solution.y}
                  r={8}
                  fill="#f59e0b"
                  stroke="#fff"
                  strokeWidth={2}
                  label={{ value: `(${solution.x!.toFixed(2)}, ${solution.y!.toFixed(2)})`, fill: '#f59e0b', position: 'top' }}
                />
              )}

              {/* Origin reference */}
              <ReferenceLineComponent x={0} stroke="#475569" strokeDasharray="3 3" />
              <ReferenceLineComponent y={0} stroke="#475569" strokeDasharray="3 3" />
            </LineChartComponent>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 flex justify-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-cyan-500 rounded-full" />
            <span className="text-sm text-slate-400"><Tex latex={formatEquation(eq1)} /></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-emerald-500 rounded-full" />
            <span className="text-sm text-slate-400"><Tex latex={formatEquation(eq2)} /></span>
          </div>
          {solution.type === 'unique' && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-sm text-slate-400">Intersection</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Educational Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20"
      >
        <h4 className="text-sm font-bold text-indigo-300 mb-2">
          Understanding Systems of Equations
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          A system of two linear equations can have three possible outcomes: 
          <strong className="text-emerald-400"> one unique solution</strong> (intersecting lines), 
          <strong className="text-rose-400"> no solution</strong> (parallel lines), or 
          <strong className="text-amber-400"> infinitely many solutions</strong> (same line). 
          The algebraic method uses the determinant (ad - bc) to determine which case applies.
        </p>
      </motion.div>
    </div>
  );
};

export default SystemsSolver;
