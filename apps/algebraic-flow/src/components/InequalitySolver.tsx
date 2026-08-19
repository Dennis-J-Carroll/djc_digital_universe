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
  ReferenceLine,
  ReferenceArea,
  Area,
  ReferenceDot
} from 'recharts';
import {
  Inequality,
  InequalitySign,
  solveLinearInequality,
  solveQuadraticInequality,
  formatInequality,
  formatInequalityLatex,
  INEQUALITY_TEMPLATES,
  generateNumberLineData
} from '../lib/inequalities';
import { Tex } from '../lib/math';
import { ArrowLeftRight, ChevronDown, ChevronUp, AlertCircle, TrendingUp } from 'lucide-react';
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
const ReferenceLineComponent = ReferenceLine as any;
const ReferenceAreaComponent = ReferenceArea as any;
const AreaComponent = Area as any;
const ReferenceDotComponent = ReferenceDot as any;

export const InequalitySolver: React.FC = () => {
  const [inequality, setInequality] = useState<Inequality>({
    id: '1',
    type: 'linear',
    a: 2,
    b: -6,
    c: 0,
    sign: '<'
  });
  const [showExplanation, setShowExplanation] = useState(false);

  const solution = useMemo(() => {
    if (inequality.type === 'linear') {
      return solveLinearInequality(inequality.a, inequality.b, inequality.sign);
    } else {
      return solveQuadraticInequality(inequality.a, inequality.b, inequality.c, inequality.sign);
    }
  }, [inequality]);

  // Generate graph data
  const graphData = useMemo(() => {
    const points = [];
    const range = 10;
    
    for (let x = -range; x <= range; x += 0.1) {
      let y;
      if (inequality.type === 'linear') {
        y = inequality.a * x + inequality.b;
      } else {
        y = inequality.a * x * x + inequality.b * x + inequality.c;
      }
      
      // Check if this point satisfies the inequality
      let satisfies = false;
      switch (inequality.sign) {
        case '<': satisfies = y < 0; break;
        case '<=': satisfies = y <= 0; break;
        case '>': satisfies = y > 0; break;
        case '>=': satisfies = y >= 0; break;
      }
      
      points.push({ x, y, satisfies });
    }
    
    return points;
  }, [inequality]);

  const updateInequality = (field: keyof Inequality, value: any) => {
    setInequality(prev => ({ ...prev, [field]: value }));
  };

  const loadTemplate = (template: typeof INEQUALITY_TEMPLATES[0]) => {
    setInequality({ ...template.inequality, id: '1' });
  };

  const signOptions: { value: InequalitySign; label: string }[] = [
    { value: '<', label: '<' },
    { value: '<=', label: '≤' },
    { value: '>', label: '>' },
    { value: '>=', label: '≥' }
  ];

  // Format interval for display
  const formatInterval = (interval: { start: number; end: number; inclusive: [boolean, boolean] }) => {
    const leftBracket = interval.inclusive[0] ? '[' : '(';
    const rightBracket = interval.inclusive[1] ? ']' : ')';
    const start = interval.start === -Infinity ? '-∞' : interval.start.toFixed(2);
    const end = interval.end === Infinity ? '∞' : interval.end.toFixed(2);
    return `${leftBracket}${start}, ${end}${rightBracket}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Templates */}
      <div className="flex flex-wrap justify-center gap-2">
        {INEQUALITY_TEMPLATES.map((template, idx) => (
          <button
            key={idx}
            onClick={() => loadTemplate(template)}
            className="px-3 py-1.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-800 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
          >
            {template.name}
          </button>
        ))}
      </div>

      {/* Input Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-700/50"
      >
        <div className="flex items-center gap-2 mb-4">
          <ArrowLeftRight className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-slate-200">Inequality Input</h3>
        </div>

        {/* Type Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => updateInequality('type', 'linear')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              inequality.type === 'linear'
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
            )}
          >
            Linear
          </button>
          <button
            onClick={() => updateInequality('type', 'quadratic')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              inequality.type === 'quadratic'
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
            )}
          >
            Quadratic
          </button>
        </div>

        {/* Coefficient Inputs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-[10px] font-bold text-cyan-400 uppercase mb-1">
              {inequality.type === 'linear' ? 'x coefficient (a)' : 'x² coefficient (a)'}
            </label>
            <input
              type="number"
              value={inequality.a}
              onChange={(e) => updateInequality('a', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-cyan-400 uppercase mb-1">
              {inequality.type === 'linear' ? 'constant (b)' : 'x coefficient (b)'}
            </label>
            <input
              type="number"
              value={inequality.b}
              onChange={(e) => updateInequality('b', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          {inequality.type === 'quadratic' && (
            <div>
              <label className="block text-[10px] font-bold text-cyan-400 uppercase mb-1">constant (c)</label>
              <input
                type="number"
                value={inequality.c}
                onChange={(e) => updateInequality('c', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-bold text-cyan-400 uppercase mb-1">sign</label>
            <select
              value={inequality.sign}
              onChange={(e) => updateInequality('sign', e.target.value as InequalitySign)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              {signOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Display */}
        <div className="p-4 rounded-xl bg-slate-800/50 text-center text-xl text-slate-200">
          <Tex latex={formatInequalityLatex(inequality)} />
        </div>
      </motion.div>

      {/* Solution Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-700/50"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-slate-200">Solution</h3>
        </div>

        {/* Intervals */}
        <div className="mb-4">
          <span className="text-sm text-slate-500 uppercase tracking-wider">Solution Set</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {solution.intervals.length > 0 ? (
              solution.intervals.map((interval, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30"
                >
                  <span className="font-mono text-emerald-300">{formatInterval(interval)}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/30">
                <span className="font-mono text-rose-300">No solution (∅)</span>
              </div>
            )}
          </div>
        </div>

        {/* Critical Points */}
        {solution.criticalPoints.length > 0 && (
          <div className="mb-4">
            <span className="text-sm text-slate-500 uppercase tracking-wider">Critical Points</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {solution.criticalPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30"
                >
                  <span className="font-mono text-amber-300">x = {point.toFixed(3)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explanation */}
        <motion.button
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
        >
          {showExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showExplanation ? 'Hide' : 'Show'} step-by-step explanation
        </motion.button>

        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-4 rounded-xl bg-slate-800/30 whitespace-pre-line text-sm text-slate-300">
                {solution.explanation}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-700/50"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-slate-200">Visual Representation</h3>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
              <span className="text-slate-400">Solution region</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/50" />
              <span className="text-slate-400">Non-solution region</span>
            </div>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChartComponent data={graphData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGridComponent strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              
              <XAxisComponent 
                dataKey="x"
                type="number"
                domain={[-10, 10]}
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#475569' }}
              />
              <YAxisComponent 
                domain={[-10, 10]}
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#475569' }}
              />

              <TooltipComponent
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderRadius: '12px', 
                  border: '1px solid #334155', 
                  color: '#f1f5f9' 
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'y') return [value.toFixed(3), 'f(x)'];
                  return [value, name];
                }}
              />

              {/* Solution region shading */}
              {solution.intervals.map((interval, idx) => (
                <ReferenceAreaComponent
                  key={idx}
                  x1={Math.max(interval.start, -10)}
                  x2={Math.min(interval.end, 10)}
                  fill="#10b981"
                  fillOpacity={0.12}
                  stroke="#10b981"
                  strokeOpacity={0.4}
                  strokeWidth={1}
                  strokeDasharray={interval.inclusive[0] || interval.inclusive[1] ? undefined : "4 2"}
                />
              ))}

              {/* Zero line */}
              <ReferenceLineComponent y={0} stroke="#475569" strokeDasharray="3 3" />
              <ReferenceLineComponent x={0} stroke="#475569" strokeDasharray="3 3" />

              {/* The function curve */}
              <LineComponent
                type="monotone"
                dataKey="y"
                stroke={inequality.type === 'linear' ? '#06b6d4' : '#a855f7'}
                strokeWidth={3}
                dot={false}
                name="f(x)"
              />

              {/* Critical points */}
              {solution.criticalPoints.map((point, idx) => (
                <ReferenceDotComponent
                  key={idx}
                  x={point}
                  y={0}
                  r={6}
                  fill="#f59e0b"
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </LineChartComponent>
          </ResponsiveContainer>
        </div>

        {/* Sign Chart */}
        {solution.signChart.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-bold text-slate-400 mb-3">Sign Chart</h4>
            <div className="flex flex-wrap gap-2">
              {solution.signChart.map((entry, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "px-3 py-2 rounded-lg text-xs",
                    entry.sign === 'positive' ? "bg-emerald-500/20 text-emerald-300" :
                    entry.sign === 'negative' ? "bg-rose-500/20 text-rose-300" :
                    "bg-amber-500/20 text-amber-300"
                  )}
                >
                  <span className="font-mono">{entry.region}</span>
                  <span className="ml-2 uppercase">{entry.sign}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Educational Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20"
      >
        <h4 className="text-sm font-bold text-indigo-300 mb-2">
          Key Concepts
        </h4>
        <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
          <li>
            <strong className="text-slate-300">Multiplying/Dividing by Negative:</strong> 
            When you multiply or divide both sides by a negative number, 
            <span className="text-rose-400"> flip the inequality sign</span>.
          </li>
          <li>
            <strong className="text-slate-300">Strict vs Non-strict:</strong> 
            {' '}&lt; and &gt; are strict (dotted line on graph), while ≤ and ≥ include the boundary (solid line).
          </li>
          <li>
            <strong className="text-slate-300">Quadratic Inequalities:</strong> 
            The solution depends on the discriminant and whether the parabola opens up or down.
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default InequalitySolver;
