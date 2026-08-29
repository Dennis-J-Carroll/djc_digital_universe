import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { EquationState, Term } from './InteractiveEquation';

// Fix for Recharts TS issues in React 18
const LineChartComponent = LineChart as any;
const LineComponent = Line as any;
const XAxisComponent = XAxis as any;
const YAxisComponent = YAxis as any;
const CartesianGridComponent = CartesianGrid as any;
const TooltipComponent = Tooltip as any;
const LegendComponent = Legend as any;
const ReferenceLineComponent = ReferenceLine as any;

interface EquationGraphProps {
  equation: EquationState;
}

const EquationGraph: React.FC<EquationGraphProps> = ({ equation }) => {
  const data = useMemo(() => {
    const points = [];
    // Determine range based on intersection if possible, but default to [-10, 10]
    // Simple range for now
    for (let x = -10; x <= 10; x += 0.25) {
      const leftY = evaluateSide(equation.left, x);
      const rightY = evaluateSide(equation.right, x);
      points.push({
        x,
        left: leftY,
        right: rightY,
      });
    }
    return points;
  }, [equation]);

  // Helper to evaluate a side of the equation
  function evaluateSide(terms: Term[], x: number): number {
    return terms.reduce((sum, term) => {
      if (term.type === 'constant') {
        return sum + term.value;
      } else {
        // Assume variable is 'x' for graphing purposes
        // If there are multiple variables (e.g. y), treat them as 1 or ignore for 2D graph of x
        // For simplicity, we only support 'x' variable graphing
        if (term.variable !== 'x' && term.variable) return sum;

        const exponent = term.exponent || 1;
        return sum + term.value * Math.pow(x, exponent);
      }
    }, 0);
  }

  // Check if we have 'y' or other variables that make 2D graphing of f(x) invalid
  const hasNonX = [...equation.left, ...equation.right].some(t => t.type === 'variable' && t.variable !== 'x');

  if (hasNonX) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-900/50 backdrop-blur-md rounded-xl border border-slate-700/50 text-slate-400 text-sm">
        Graphing only available for single-variable 'x' equations.
      </div>
    );
  }

  return (
    <div className="w-full h-80 bg-slate-900/50 backdrop-blur-md p-4 rounded-3xl shadow-lg border border-slate-700/50">
      <h3 className="text-center font-bold text-slate-500 uppercase text-xs mb-4 tracking-widest">Visual Representation</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChartComponent data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGridComponent strokeDasharray="3 3" stroke="#334155" />
          <XAxisComponent dataKey="x" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <YAxisComponent stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <TooltipComponent
            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)', color: '#f1f5f9' }}
            itemStyle={{ color: '#f1f5f9' }}
            labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
          />
          <LegendComponent wrapperStyle={{ paddingTop: '20px' }} />
          <ReferenceLineComponent y={0} stroke="#475569" />
          <ReferenceLineComponent x={0} stroke="#475569" />
          <LineComponent
            type="monotone"
            dataKey="left"
            name="Left Side"
            stroke="#06b6d4"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#22d3ee' }}
          />
          <LineComponent
            type="monotone"
            dataKey="right"
            name="Right Side"
            stroke="#10b981"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#34d399' }}
          />
        </LineChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

export default EquationGraph;
