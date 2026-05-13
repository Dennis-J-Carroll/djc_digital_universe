import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { EquationState, Term } from '../types';

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
    // Determine coefficients for left side (ax + b) and right side (cx + d)
    let a = 0, b = 0, c = 0, d = 0;

    equation.left.forEach(t => {
      if (t.type === 'variable' && t.variable === 'x' && (t.exponent === 1 || !t.exponent)) {
        a += t.value;
      } else if (t.type === 'constant') {
        b += t.value;
      }
    });

    equation.right.forEach(t => {
      if (t.type === 'variable' && t.variable === 'x' && (t.exponent === 1 || !t.exponent)) {
        c += t.value;
      } else if (t.type === 'constant') {
        d += t.value;
      }
    });

    // Solve for x: ax + b = cx + d => (a-c)x = d-b => x = (d-b)/(a-c)
    let intersectionX: number | null = null;
    let intersectionY: number | null = null;

    if (Math.abs(a - c) > 0.0001) {
      intersectionX = (d - b) / (a - c);
      intersectionY = a * intersectionX + b;
    }

    // Determine range centered on intersection, or default [-10, 10]
    const centerX = intersectionX !== null ? Math.round(intersectionX) : 0;
    const range = 10;
    const minX = centerX - range;
    const maxX = centerX + range;

    const points = [];
    for (let x = minX; x <= maxX; x += 1) {
      const leftY = evaluateSide(equation.left, x);
      const rightY = evaluateSide(equation.right, x);
      points.push({
        x,
        left: leftY,
        right: rightY,
      });
    }
    return { points, intersectionX, intersectionY };
  }, [equation]);

  // Helper to evaluate a side of the equation
  function evaluateSide(terms: Term[], x: number): number {
    return terms.reduce((sum, term) => {
      if (term.type === 'constant') {
        return sum + term.value;
      } else {
        // Assume variable is 'x' for graphing purposes
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
      <div className="flex items-center justify-center h-80 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700/50 text-slate-400 text-sm shadow-lg">
        <p>Graphing currently supports single-variable 'x' equations.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-96 bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-slate-700/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500 opacity-50" />
      <h3 className="text-center font-bold text-slate-400 uppercase text-xs mb-6 tracking-[0.2em] flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></span>
        Visual Representation
        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
      </h3>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChartComponent data={data.points} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
            <CartesianGridComponent strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxisComponent
              dataKey="x"
              stroke="#475569"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tick={{ fill: '#64748b' }}
            />
            <YAxisComponent
              stroke="#475569"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tick={{ fill: '#64748b' }}
              width={40}
            />
            <TooltipComponent
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderRadius: '12px',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                color: '#f1f5f9',
                padding: '12px'
              }}
              itemStyle={{ padding: '2px 0', fontSize: '13px' }}
              labelStyle={{ color: '#94a3b8', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #334155', paddingBottom: '4px' }}
              formatter={(value: number) => value.toFixed(2)}
            />
            <LegendComponent
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
              formatter={(value: string) => <span className="text-slate-300 font-medium text-sm ml-1">{value}</span>}
            />
            <ReferenceLineComponent y={0} stroke="#475569" strokeWidth={1} />
            <ReferenceLineComponent x={0} stroke="#475569" strokeWidth={1} />

            {/* Intersection Point Highlight */}
            {data.intersectionX !== null && (
               <ReferenceLineComponent x={data.intersectionX} stroke="#6366f1" strokeDasharray="3 3" strokeOpacity={0.5} />
            )}

            <LineComponent
              type="monotone"
              dataKey="left"
              name="Left Side (y₁)"
              stroke="#06b6d4"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
              animationDuration={1000}
            />
            <LineComponent
              type="monotone"
              dataKey="right"
              name="Right Side (y₂)"
              stroke="#10b981"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              animationDuration={1000}
            />
          </LineChartComponent>
        </ResponsiveContainer>
      </div>

      {data.intersectionX !== null && (
        <div className="absolute top-6 right-6 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg backdrop-blur-sm">
          <div className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider mb-0.5">Intersection</div>
          <div className="font-mono text-sm text-indigo-200">
            x ≈ <span className="font-bold text-white">{data.intersectionX.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquationGraph;
