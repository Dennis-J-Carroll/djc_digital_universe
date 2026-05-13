import React from 'react';
import { motion } from 'framer-motion';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
  Line
} from 'recharts';
import { ComplexNumber, formatComplex, magnitude, argumentDegrees } from '../lib/complex';
import { Info } from 'lucide-react';

// Fix for Recharts TS issues
const ScatterChartComponent = ScatterChart as any;
const ScatterComponent = Scatter as any;
const XAxisComponent = XAxis as any;
const YAxisComponent = YAxis as any;
const CartesianGridComponent = CartesianGrid as any;
const TooltipComponent = Tooltip as any;
const ReferenceLineComponent = ReferenceLine as any;
const ReferenceDotComponent = ReferenceDot as any;
const LineComponent = Line as any;

interface ArgandDiagramProps {
  roots: ComplexNumber[];
  showUnitCircle?: boolean;
  showConjugateLines?: boolean;
  title?: string;
}

export const ArgandDiagram: React.FC<ArgandDiagramProps> = ({ 
  roots,
  showUnitCircle = false,
  showConjugateLines = true,
  title = "Complex Plane (Argand Diagram)"
}) => {
  // Filter to only complex roots (non-zero imaginary part)
  const complexRoots = roots.filter(r => Math.abs(r.imag) > 1e-10);
  
  if (complexRoots.length === 0) {
    return (
      <div className="w-full h-64 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-700/50 flex items-center justify-center">
        <div className="text-center">
          <Info className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No complex roots to display</p>
          <p className="text-slate-600 text-xs mt-1">The discriminant is non-negative</p>
        </div>
      </div>
    );
  }

  // Calculate range based on roots
  const maxMagnitude = Math.max(...complexRoots.map(r => magnitude(r)), 2);
  const range = Math.ceil(maxMagnitude * 1.2);

  // Prepare data for scatter plot
  const scatterData = complexRoots.map((root, index) => ({
    x: root.real,
    y: root.imag,
    z: magnitude(root),
    label: `z${index + 1}`,
    root
  }));

  // Generate unit circle if requested
  const unitCircleData = showUnitCircle 
    ? Array.from({ length: 101 }, (_, i) => {
        const angle = (i / 100) * 2 * Math.PI;
        return {
          x: Math.cos(angle),
          y: Math.sin(angle)
        };
      })
    : [];

  // Check if roots are conjugates
  const areConjugates = complexRoots.length === 2 && 
    Math.abs(complexRoots[0].real - complexRoots[1].real) < 1e-10 &&
    Math.abs(complexRoots[0].imag + complexRoots[1].imag) < 1e-10;

  return (
    <div className="w-full">
      <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-200">{title}</h3>
          {areConjugates && (
            <span className="text-xs px-2 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Conjugate Pair
            </span>
          )}
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChartComponent margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGridComponent 
                strokeDasharray="3 3" 
                stroke="#334155"
                opacity={0.5}
              />
              
              {/* Real axis */}
              <ReferenceLineComponent 
                y={0} 
                stroke="#64748b" 
                strokeWidth={2}
                label={{ value: 'Re', position: 'right', fill: '#64748b', fontSize: 12 }}
              />
              
              {/* Imaginary axis */}
              <ReferenceLineComponent 
                x={0} 
                stroke="#64748b" 
                strokeWidth={2}
                label={{ value: 'Im', position: 'top', fill: '#64748b', fontSize: 12 }}
              />

              <XAxisComponent 
                type="number" 
                dataKey="x" 
                domain={[-range, range]}
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val: number) => val.toFixed(0)}
              />
              <YAxisComponent 
                type="number" 
                dataKey="y" 
                domain={[-range, range]}
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val: number) => val.toFixed(0)}
              />

              <TooltipComponent
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-xl">
                        <p className="font-mono text-cyan-400 mb-1">{data.label}</p>
                        <p className="text-slate-200 text-sm">{formatComplex(data.root)}</p>
                        <div className="mt-2 text-xs text-slate-500 space-y-1">
                          <p>|z| = {magnitude(data.root).toFixed(3)}</p>
                          <p>arg(z) = {argumentDegrees(data.root).toFixed(1)}°</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Unit circle */}
              {showUnitCircle && (
                <LineComponent
                  data={unitCircleData}
                  dataKey="y"
                  stroke="#f59e0b"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  isAnimationActive={false}
                />
              )}

              {/* Conjugate connection line */}
              {showConjugateLines && areConjugates && complexRoots.length === 2 && (
                <LineComponent
                  data={[
                    { x: complexRoots[0].real, y: complexRoots[0].imag },
                    { x: complexRoots[1].real, y: complexRoots[1].imag }
                  ]}
                  dataKey="y"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  isAnimationActive={true}
                />
              )}

              {/* Root points */}
              <ScatterComponent
                name="Complex Roots"
                data={scatterData}
                fill="#06b6d4"
              >
                {scatterData.map((entry, index) => (
                  <ReferenceDotComponent
                    key={index}
                    x={entry.x}
                    y={entry.y}
                    r={8}
                    fill={index === 0 ? '#06b6d4' : '#10b981'}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </ScatterComponent>
            </ScatterChartComponent>
          </ResponsiveContainer>
        </div>

        {/* Root details */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {complexRoots.map((root, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 rounded-xl bg-slate-800/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 uppercase tracking-wider">
                  z{index + 1}
                </span>
                <span 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: index === 0 ? '#06b6d4' : '#10b981' }}
                />
              </div>
              <p className="font-mono text-slate-200 mb-1">{formatComplex(root)}</p>
              <div className="flex gap-4 text-xs text-slate-500">
                <span>|z| = {magnitude(root).toFixed(3)}</span>
                <span>θ = {argumentDegrees(root).toFixed(1)}°</span>
              </div>
            </motion.div>
          ))}
        </div>

        {areConjugates && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20"
          >
            <h4 className="text-sm font-bold text-indigo-300 mb-2">Complex Conjugate Pair</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              These roots are complex conjugates: they have the same real part and opposite imaginary parts. 
              They are mirror images across the real axis. This always happens when a quadratic with real 
              coefficients has complex roots — the Fundamental Theorem of Algebra guarantees this symmetry.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ArgandDiagram;
