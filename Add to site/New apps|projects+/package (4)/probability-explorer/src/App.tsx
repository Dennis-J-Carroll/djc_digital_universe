import { useState, useEffect, useCallback, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line } from 'recharts';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './App.css';

// KaTeX Formula component for rendering LaTeX
const Formula: React.FC<{ formula: string; block?: boolean; className?: string }> = ({ formula, block = false, className = '' }) => {
  const html = useMemo(() => {
    return katex.renderToString(formula, {
      throwOnError: false,
      displayMode: block,
    });
  }, [formula, block]);

  return (
    <span
      className={`${block ? 'math-block' : 'math-inline'} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ fontSize: block ? '1.2em' : '1.1em' }}
    />
  );
};

// Utility functions
const factorial = (n: number): number => n <= 1 ? 1 : n * factorial(n - 1);
const combinations = (n: number, k: number): number => factorial(n) / (factorial(k) * factorial(n - k));

// Types
interface ConceptProps {
  title: string;
  formula: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

// Animation wrapper
const AnimatedSection: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {children}
    </div>
  );
};

// ====== DETAILED CONTENT MODAL ======
const DetailedModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  concept: {
    title: string;
    color: string;
    icon: React.ReactNode;
    detailedContent: React.ReactNode;
  } | null;
}> = ({ isOpen, onClose, concept }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !concept) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative min-h-screen flex items-start justify-center p-4 pt-8 pb-20">
        <div
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden animate-slideUp"
          style={{ borderTop: `6px solid ${concept.color}` }}
        >
          {/* Header */}
          <div
            className="p-6 flex items-center justify-between"
            style={{ background: `linear-gradient(135deg, ${concept.color}20, ${concept.color}05)` }}
          >
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl" style={{ backgroundColor: concept.color }}>
                {concept.icon}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">{concept.title}</h2>
                <p className="text-gray-500">In-depth exploration with examples</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-8 max-h-[70vh] overflow-y-auto">
            {concept.detailedContent}
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
            <span className="text-sm text-gray-500">Click outside or the button to close</span>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
              style={{ backgroundColor: concept.color }}
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ====== DETAILED CONTENT COMPONENTS ======

// Basic Probability Detailed
const BasicProbabilityDetailed: React.FC<{ color: string }> = ({ color }) => {
  const [sampleSize, setSampleSize] = useState(100);
  const [favorable, setFavorable] = useState(3);
  const [total, setTotal] = useState(6);

  const probability = total > 0 ? favorable / total : 0;
  const expectedSuccesses = sampleSize * probability;

  // Generate simulation data
  const simulateRolls = Array.from({ length: 10 }, () => {
    let successes = 0;
    for (let i = 0; i < sampleSize; i++) {
      if (Math.random() < probability) successes++;
    }
    return successes;
  });

  const simulationData = simulateRolls.map((val, i) => ({ trial: `Trial ${i + 1}`, successes: val }));

  return (
    <div className="space-y-8">
      {/* Key Concepts */}
      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>1</span>
          Understanding the Formula
        </h3>
        <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border">
          <div className="text-center mb-4">
            <div className="text-3xl font-bold" style={{ color }}><Formula formula="P(A) = \\frac{\\text{Events in A}}{\\text{Total Events}}" block /></div>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Probability measures how likely an event is to occur. It's always a number between 0 and 1,
            where <strong>0 means impossible</strong> and <strong>1 means certain</strong>.
          </p>
        </div>
      </section>

      {/* Key Properties */}
      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>2</span>
          Key Properties
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="text-3xl mb-2">0</div>
            <div className="font-semibold text-blue-800">Impossible Event</div>
            <div className="text-sm text-blue-600">Can never happen</div>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
            <div className="text-3xl mb-2">0.5</div>
            <div className="font-semibold text-green-800">Even Chance</div>
            <div className="text-sm text-green-600">Equally likely</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
            <div className="text-3xl mb-2">1</div>
            <div className="font-semibold text-purple-800">Certain Event</div>
            <div className="text-sm text-purple-600">Always happens</div>
          </div>
        </div>
      </section>

      {/* Real World Example */}
      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>3</span>
          Real-World Example: Rolling a Die
        </h3>
        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
          <div className="flex items-start gap-4">
            <div className="text-5xl">🎲</div>
            <div>
              <p className="text-gray-700 mb-3">
                <strong>Question:</strong> What's the probability of rolling an even number on a fair six-sided die?
              </p>
              <div className="bg-white p-4 rounded-xl">
                <p className="text-gray-600 mb-2"><strong>Even numbers:</strong> 2, 4, 6 (3 outcomes)</p>
                <p className="text-gray-600 mb-2"><strong>Total outcomes:</strong> 6 (1, 2, 3, 4, 5, 6)</p>
                <p className="text-lg font-semibold" style={{ color }}>
                  <Formula formula="P(\\text{even}) = \frac{3}{6} = 0.5 = 50\%" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Law of Large Numbers Simulation */}
      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>4</span>
          Law of Large Numbers
        </h3>
        <p className="text-gray-600 mb-4">
          As you repeat an experiment more times, the experimental probability gets closer to the theoretical probability.
        </p>

        <div className="bg-white p-4 rounded-xl border mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Sample Size per Trial</label>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={sampleSize}
                onChange={(e) => setSampleSize(Number(e.target.value))}
                className="w-48 cursor-pointer"
                style={{ accentColor: color }}
              />
              <div className="font-bold" style={{ color }}>{sampleSize} rolls per trial</div>
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-sm text-gray-500">Expected successes per trial</div>
            <div className="text-3xl font-bold" style={{ color }}>{expectedSuccesses.toFixed(1)}</div>
            <div className="text-sm text-gray-500">Theoretical: <Formula formula={`${sampleSize} \\times ${probability.toFixed(4)}`} /></div>
          </div>
        </div>

        <div className="h-48">
          <ResponsiveContainer>
            <BarChart data={simulationData}>
              <XAxis dataKey="trial" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="successes" fill={color} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-500 text-center mt-2">
          Each bar shows successes in {sampleSize} rolls. They're all close to the expected value!
        </p>
      </section>

      {/* Interactive Calculator */}
      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>5</span>
          Interactive Calculator
        </h3>
        <div className="bg-white p-6 rounded-2xl border">
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-2">Favorable Outcomes</label>
              <input
                type="number"
                min="1"
                max="100"
                value={favorable}
                onChange={(e) => setFavorable(Number(e.target.value))}
                className="w-full p-3 border-2 rounded-xl focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-2">Total Outcomes</label>
              <input
                type="number"
                min={favorable}
                max="100"
                value={total}
                onChange={(e) => setTotal(Number(e.target.value))}
                className="w-full p-3 border-2 rounded-xl focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
            <div className="text-5xl font-bold mb-2" style={{ color }}>
              {(probability * 100).toFixed(2)}%
            </div>
            <code className="text-lg">
              <Formula formula={`P(A) = \\frac{${favorable}}{${total}} = ${probability.toFixed(4)}`} />
            </code>
          </div>
        </div>
      </section>
    </div>
  );
};

// Complement Rule Detailed
const ComplementRuleDetailed: React.FC<{ color: string }> = ({ color }) => {
  const [pA, setPA] = useState(0.7);
  const pAc = 1 - pA;

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>1</span>
          The Complement Rule
        </h3>
        <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border">
          <div className="text-center mb-4">
            <div className="text-3xl font-bold" style={{ color }}>
              <Formula formula="P(A') = 1 - P(A)" block />
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed">
            The complement of an event A (written <Formula formula="A'" /> or <Formula formula="\bar{A}" />) includes <strong>all outcomes where A does NOT occur</strong>.
            Since something either happens or doesn't happen, the probabilities must add to 1.
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>2</span>
          Visual Representation
        </h3>
        <div className="flex justify-center py-4">
          <div className="relative w-64 h-32">
            <div
              className="absolute inset-0 rounded-full border-4 flex items-center justify-center"
              style={{
                background: `conic-gradient(${color} 0deg ${pA * 360}deg, #e5e7eb ${pA * 360}deg 360deg)`,
                borderColor: 'transparent'
              }}
            >
              <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center">
                <span className="text-xs text-gray-500">Total</span>
                <span className="text-2xl font-bold">1.0</span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center p-4 rounded-xl" style={{ backgroundColor: `${color}20` }}>
            <div className="text-2xl font-bold" style={{ color }}>{(pA * 100).toFixed(0)}%</div>
            <div className="text-sm"><Formula formula="P(A)" /></div>
          </div>
          <div className="text-center p-4 rounded-xl bg-gray-100">
            <div className="text-2xl font-bold text-gray-600">{(pAc * 100).toFixed(0)}%</div>
            <div className="text-sm"><Formula formula="P(A')" /></div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>3</span>
          Real-World Example
        </h3>
        <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
          <div className="flex items-start gap-4">
            <div className="text-5xl">🎰</div>
            <div>
              <p className="text-gray-700 mb-3">
                <strong>Scenario:</strong> A slot machine pays out 30% of the time. What's the probability you <em>don't</em> win?
              </p>
              <div className="bg-white p-4 rounded-xl">
                <p className="text-gray-600 mb-2"><strong><Formula formula="P(\\text{win})" /></strong> = 0.30</p>
                <p className="text-gray-600 mb-2"><strong><Formula formula="P(\\text{not win})" /></strong> = 1 - 0.30 = 0.70</p>
                <p className="text-lg font-semibold" style={{ color }}>
                  70% chance you lose! The house usually wins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>4</span>
          Interactive Visualization
        </h3>
        <div className="bg-white p-6 rounded-2xl border">
          <label className="block text-center mb-4 font-medium">Adjust <Formula formula={`P(A): ${pA.toFixed(2)}`} /></label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={pA}
            onChange={(e) => setPA(Number(e.target.value))}
            className="w-full h-3 rounded-full cursor-pointer"
            style={{ background: `linear-gradient(to right, ${color} ${pA * 100}%, #e5e7eb ${pA * 100}%)` }}
          />
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-xl text-center" style={{ backgroundColor: `${color}15` }}>
              <div className="text-sm text-gray-500"><Formula formula="P(A)" /></div>
              <div className="text-2xl font-bold" style={{ color }}>{pA.toFixed(3)}</div>
            </div>
            <div className="p-4 rounded-xl text-center bg-gray-100">
              <div className="text-sm text-gray-500"><Formula formula="P(A')" /></div>
              <div className="text-2xl font-bold text-gray-700">{pAc.toFixed(3)}</div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-xl text-center">
            <code className="text-lg">
              <Formula formula={`${pA.toFixed(3)} + ${pAc.toFixed(3)} = ${(pA + pAc).toFixed(3)}`} />
            </code>
          </div>
        </div>
      </section>
    </div>
  );
};

// Addition Rule Detailed
const AdditionRuleDetailed: React.FC<{ color: string }> = ({ color }) => {
  const [pA, setPA] = useState(0.4);
  const [pB, setPB] = useState(0.3);
  const [pIntersection, setPIntersection] = useState(0.1);
  const pUnion = pA + pB - pIntersection;

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>1</span>
          Addition Rule for Union
        </h3>
        <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border">
          <div className="text-center mb-4">
            <div className="text-2xl font-bold" style={{ color }}>
              <Formula formula="P(A \\cup B) = P(A) + P(B) - P(A \\cap B)" block />
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed">
            The union of two events is when <strong>either event occurs</strong> (or both).
            We subtract the intersection because we'd otherwise count those outcomes twice!
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>2</span>
          Interactive Venn Diagram
        </h3>
        <div className="flex justify-center py-4">
          <svg width="300" height="200" className="mx-auto">
            <circle cx="120" cy="100" r="60" fill="#6366f1" fillOpacity="0.4" stroke="#6366f1" strokeWidth="3" />
            <circle cx="180" cy="100" r="60" fill="#ec4899" fillOpacity="0.4" stroke="#ec4899" strokeWidth="3" />
            <text x="80" y="50" fontSize="14" fontWeight="bold" fill="#6366f1">A</text>
            <text x="210" y="50" fontSize="14" fontWeight="bold" fill="#ec4899">B</text>
            <text x="150" y="105" fontSize="12" fontWeight="bold" fill="#1f2937">A∩B</text>
          </svg>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <div className="font-bold text-indigo-600">Only A</div>
            <div>{(pA - pIntersection).toFixed(3)}</div>
          </div>
          <div className="p-2 bg-purple-100 rounded-lg">
            <div className="font-bold text-purple-600"><Formula formula="A \\cap B" /></div>
            <div>{pIntersection.toFixed(3)}</div>
          </div>
          <div className="p-2 bg-pink-100 rounded-lg">
            <div className="font-bold text-pink-600">Only B</div>
            <div>{(pB - pIntersection).toFixed(3)}</div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>3</span>
          Real-World Example: Cards
        </h3>
        <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
          <div className="flex items-start gap-4">
            <div className="text-5xl">🃏</div>
            <div>
              <p className="text-gray-700 mb-3">
                <strong>Question:</strong> What's the probability of drawing a <strong>King</strong> or a <strong>Heart</strong> from a deck?
              </p>
              <div className="bg-white p-4 rounded-xl space-y-2">
                <p className="text-gray-600"><Formula formula="P(\\text{King}) = \frac{4}{52}" /></p>
                <p className="text-gray-600"><Formula formula="P(\\text{Heart}) = \frac{13}{52}" /></p>
                <p className="text-gray-600"><Formula formula="P(\\text{King} \\cap \\text{Heart}) = \frac{1}{52}" /> (King of Hearts)</p>
                <div className="border-t pt-2 mt-2">
                  <p className="text-gray-600"><Formula formula="P(\\text{King} \\cup \\text{Heart}) = \frac{4}{52} + \frac{13}{52} - \frac{1}{52}" /></p>
                  <p className="text-lg font-bold" style={{ color }}><Formula formula="= \frac{16}{52} \approx 30.8\%" /></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>4</span>
          Adjustable Calculator
        </h3>
        <div className="bg-white p-6 rounded-2xl border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-indigo-600 block mb-2"><Formula formula={`P(A): ${pA.toFixed(2)}`} /></label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={pA}
                onChange={(e) => setPA(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: '#6366f1' }}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-pink-600 block mb-2"><Formula formula={`P(B): ${pB.toFixed(2)}`} /></label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={pB}
                onChange={(e) => setPB(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: '#ec4899' }}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-purple-600 block mb-2"><Formula formula={`P(A \\cap B): ${pIntersection.toFixed(2)}`} /></label>
              <input
                type="range"
                min="0"
                max={Math.min(pA, pB)}
                step="0.01"
                value={pIntersection}
                onChange={(e) => setPIntersection(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: '#8b5cf6' }}
              />
            </div>
          </div>
          <div className="p-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl text-white text-center">
            <div className="text-sm opacity-80"><Formula formula="P(A \\cup B)" /></div>
            <div className="text-4xl font-bold">{pUnion.toFixed(3)}</div>
            <code className="text-xs mt-2 block opacity-80">
              <Formula formula={`${pA.toFixed(2)} + ${pB.toFixed(2)} - ${pIntersection.toFixed(2)}`} />
            </code>
          </div>
        </div>
      </section>
    </div>
  );
};

// Conditional Probability Detailed
const ConditionalProbabilityDetailed: React.FC<{ color: string }> = ({ color }) => {
  const [pB, setPB] = useState(0.6);
  const [pBA, setPBA] = useState(0.8);
  const pAandB = pB * pBA;
  const pAgivenB = pAandB / pB;

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>1</span>
          What is Conditional Probability?
        </h3>
        <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border">
          <div className="text-center mb-4">
            <div className="text-3xl font-bold" style={{ color }}>
              <Formula formula="P(A|B) = \\frac{P(A \\cap B)}{P(B)}" block />
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Conditional probability finds the probability of event A <strong>given that</strong> event B has already occurred.
            The vertical bar "|" means "given that" or "knowing that".
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>2</span>
          Reading Probability Notation
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-xl">
            <div className="text-2xl mb-2"><Formula formula="P(A)" /></div>
            <div className="text-sm text-gray-600">Probability of A</div>
          </div>
          <div className="bg-green-50 p-4 rounded-xl">
            <div className="text-2xl mb-2"><Formula formula="P(A|B)" /></div>
            <div className="text-sm text-gray-600">Probability of A given B</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl">
            <div className="text-2xl mb-2"><Formula formula="P(A \\cap B)" /></div>
            <div className="text-sm text-gray-600">A and B both occur</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-xl">
            <div className="text-2xl mb-2"><Formula formula="P(A \\cup B)" /></div>
            <div className="text-sm text-gray-600">A or B occurs</div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>3</span>
          Real-World Example: Medical Test
        </h3>
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
          <div className="flex items-start gap-4">
            <div className="text-5xl">🏥</div>
            <div>
              <p className="text-gray-700 mb-3">
                <strong>Scenario:</strong> A test for a disease is 99% accurate. If 1% of the population has the disease,
                what's the probability you have it if you tested positive?
              </p>
              <div className="bg-white p-4 rounded-xl space-y-2">
                <p className="text-gray-600">This requires Bayes' Theorem! But intuitively:</p>
                <p className="text-gray-600">Even with 99% accuracy, most positive tests are <strong>false positives</strong> because the disease is rare.</p>
                <p className="text-gray-600"><Formula formula="P(\\text{Disease}|\\text{Positive})" /> depends on base rate!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>4</span>
          Tree Diagram
        </h3>
        <div className="bg-white p-4 rounded-2xl border">
          <svg viewBox="0 0 500 200" className="w-full">
            <circle cx="50" cy="100" r="30" fill="#1f2937" />
            <text x="50" y="105" textAnchor="middle" fill="white" fontSize="12">Start</text>

            <line x1="80" y1="85" x2="150" y2="40" stroke="#6366f1" strokeWidth="3" />
            <text x="110" y="50" fontSize="10" fill="#6366f1">P(B)={pB.toFixed(2)}</text>
            <circle cx="170" cy="35" r="25" fill="#6366f1" fillOpacity="0.7" />
            <text x="170" y="40" textAnchor="middle" fill="white" fontSize="10">B</text>

            <line x1="195" y1="25" x2="270" y2="15" stroke="#10b981" strokeWidth="2" />
            <text x="225" y="15" fontSize="9" fill="#10b981">P(A|B)={pBA.toFixed(2)}</text>
            <circle cx="290" cy="12" r="20" fill="#10b981" />
            <text x="290" y="17" textAnchor="middle" fill="white" fontSize="9">A</text>

            <line x1="195" y1="45" x2="270" y2="55" stroke="#ef4444" strokeWidth="2" />
            <text x="225" y="60" fontSize="9" fill="#ef4444">{(1-pBA).toFixed(2)}</text>
            <circle cx="290" cy="58" r="20" fill="#ef4444" />
            <text x="290" y="63" textAnchor="middle" fill="white" fontSize="9">A'</text>

            <line x1="80" y1="115" x2="150" y2="160" stroke="#ec4899" strokeWidth="3" />
            <text x="110" y="150" fontSize="10" fill="#ec4899">{(1-pB).toFixed(2)}</text>
            <circle cx="170" cy="165" r="25" fill="#ec4899" fillOpacity="0.7" />
            <text x="170" y="170" textAnchor="middle" fill="white" fontSize="10">B'</text>
          </svg>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>5</span>
          Interactive Calculator
        </h3>
        <div className="bg-white p-6 rounded-2xl border">
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-2"><Formula formula={`P(B): ${pB.toFixed(2)}`} /></label>
              <input
                type="range"
                min="0.01"
                max="0.99"
                step="0.01"
                value={pB}
                onChange={(e) => setPB(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: color }}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-2"><Formula formula={`P(A|B): ${pBA.toFixed(2)}`} /></label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={pBA}
                onChange={(e) => setPBA(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: color }}
              />
            </div>
          </div>
          <div className="text-center p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
            <div className="text-sm text-gray-500 mb-1"><Formula formula="P(A|B)" /></div>
            <div className="text-5xl font-bold mb-2" style={{ color }}>{(pAgivenB * 100).toFixed(1)}%</div>
            <code className="text-sm">
              <Formula formula={`\\frac{${pAandB.toFixed(3)}}{${pB.toFixed(2)}} = ${pAgivenB.toFixed(3)}`} />
            </code>
          </div>
        </div>
      </section>
    </div>
  );
};

// Bayes' Theorem Detailed
const BayesTheoremDetailed: React.FC<{ color: string }> = ({ color }) => {
  const [priorA, setPriorA] = useState(0.3);
  const [likelihoodBgivenA, setLikelihoodBgivenA] = useState(0.8);
  const [likelihoodBgivenNotA, setLikelihoodBgivenNotA] = useState(0.2);

  const priorNotA = 1 - priorA;
  const marginalB = priorA * likelihoodBgivenA + priorNotA * likelihoodBgivenNotA;
  const posteriorA = (likelihoodBgivenA * priorA) / marginalB;
  const posteriorNotA = (likelihoodBgivenNotA * priorNotA) / marginalB;

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>1</span>
          Bayes' Theorem: Updating Beliefs
        </h3>
        <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border">
          <div className="text-center mb-4">
            <div className="text-2xl font-bold" style={{ color }}>
              <Formula formula="P(A|B) = \\frac{P(B|A) \\times P(A)}{P(B)}" block />
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Bayes' Theorem calculates <strong>reverse probability</strong>.
            If we know <Formula formula="P(B|A)" /> but want <Formula formula="P(A|B)" />, Bayes' Theorem bridges the gap using the base rate <Formula formula="P(A)" />.
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>2</span>
          Understanding Each Term
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-indigo-50 p-4 rounded-xl border-l-4 border-indigo-500">
            <div className="font-bold text-indigo-700"><Formula formula="P(A)" /> - Prior</div>
            <div className="text-sm text-gray-600">Our initial belief before seeing evidence</div>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl border-l-4 border-emerald-500">
            <div className="font-bold text-emerald-700"><Formula formula="P(B|A)" /> - Likelihood</div>
            <div className="text-sm text-gray-600">How likely is B if A is true?</div>
          </div>
          <div className="bg-pink-50 p-4 rounded-xl border-l-4 border-pink-500">
            <div className="font-bold text-pink-700"><Formula formula="P(B)" /> - Marginal</div>
            <div className="text-sm text-gray-600">Total probability of B</div>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl border-l-4 border-amber-500">
            <div className="font-bold text-amber-700"><Formula formula="P(A|B)" /> - Posterior</div>
            <div className="text-sm text-gray-600">Updated belief after evidence</div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>3</span>
          Famous Example: Medical Testing
        </h3>
        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
          <div className="flex items-start gap-4">
            <div className="text-5xl">💉</div>
            <div className="flex-1">
              <p className="text-gray-700 mb-3">
                <strong>The Scenario:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4">
                <li>1% of population has disease (prior)</li>
                <li>Test is 95% accurate (sensitivity & specificity)</li>
                <li>You test positive - what's the chance you have it?</li>
              </ul>
              <div className="bg-white p-4 rounded-xl">
                <p className="text-gray-600 text-sm mb-2">Most people guess ~95%, but the answer is about <strong>16%</strong>!</p>
                <p className="text-gray-600 text-sm">This surprising result is why understanding base rates matters.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>4</span>
          Applications of Bayes' Theorem
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-xl">
            <div className="text-2xl mb-2">🔍</div>
            <div className="font-bold text-blue-800">Spam Detection</div>
            <div className="text-sm text-gray-600"><Formula formula="P(\\text{spam} | \\text{contains word})" /></div>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl">
            <div className="text-2xl mb-2">🤖</div>
            <div className="font-bold text-purple-800">Machine Learning</div>
            <div className="text-sm text-gray-600">Naive Bayes classifiers</div>
          </div>
          <div className="bg-green-50 p-4 rounded-xl">
            <div className="text-2xl mb-2">📰</div>
            <div className="font-bold text-green-800">News Classification</div>
            <div className="text-sm text-gray-600"><Formula formula="P(\\text{topic} | \\text{words})" /></div>
          </div>
          <div className="bg-orange-50 p-4 rounded-xl">
            <div className="text-2xl mb-2">🔬</div>
            <div className="font-bold text-orange-800">Scientific Research</div>
            <div className="text-sm text-gray-600">Updating hypotheses</div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>5</span>
          Interactive Calculator
        </h3>
        <div className="bg-white p-6 rounded-2xl border">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1"><Formula formula="P(A)" /> - Prior</label>
              <input
                type="range"
                min="0.01"
                max="0.99"
                step="0.01"
                value={priorA}
                onChange={(e) => setPriorA(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: '#6366f1' }}
              />
              <div className="text-center font-bold text-indigo-600">{priorA.toFixed(2)}</div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1"><Formula formula="P(B|A)" /> - Likelihood</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={likelihoodBgivenA}
                onChange={(e) => setLikelihoodBgivenA(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: '#10b981' }}
              />
              <div className="text-center font-bold text-emerald-600">{likelihoodBgivenA.toFixed(2)}</div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1"><Formula formula="P(B|A')" /> - False Pos</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={likelihoodBgivenNotA}
                onChange={(e) => setLikelihoodBgivenNotA(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: '#ec4899' }}
              />
              <div className="text-center font-bold text-pink-600">{likelihoodBgivenNotA.toFixed(2)}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-500 text-white rounded-xl text-center">
              <div className="text-sm opacity-80"><Formula formula="P(A|B)" /> - Posterior</div>
              <div className="text-4xl font-bold">{(posteriorA * 100).toFixed(1)}%</div>
            </div>
            <div className="p-4 bg-red-500 text-white rounded-xl text-center">
              <div className="text-sm opacity-80"><Formula formula="P(A'|B)" /></div>
              <div className="text-4xl font-bold">{(posteriorNotA * 100).toFixed(1)}%</div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-xl text-center">
            <code className="text-sm">
              <Formula formula={`P(B) = (${priorA.toFixed(2)} \\times ${likelihoodBgivenA.toFixed(2)}) + (${(1-priorA).toFixed(2)} \\times ${likelihoodBgivenNotA.toFixed(2)}) = ${marginalB.toFixed(3)}`} />
            </code>
          </div>
        </div>
      </section>
    </div>
  );
};

// Expected Value Detailed
const ExpectedValueDetailed: React.FC<{ color: string }> = ({ color }) => {
  const [outcomes, setOutcomes] = useState([
    { value: 1, probability: 0.2 },
    { value: 2, probability: 0.3 },
    { value: 3, probability: 0.3 },
    { value: 4, probability: 0.15 },
    { value: 5, probability: 0.05 }
  ]);

  const expectedValue = outcomes.reduce((sum, o) => sum + o.value * o.probability, 0);
  const variance = outcomes.reduce((sum, o) => sum + o.probability * Math.pow(o.value - expectedValue, 2), 0);
  const stdDev = Math.sqrt(variance);

  const updateOutcome = (index: number, newProb: number) => {
    const newOutcomes = [...outcomes];
    newOutcomes[index] = { ...newOutcomes[index], probability: newProb };
    const total = newOutcomes.reduce((sum, o) => sum + o.probability, 0);
    if (total > 0 && Math.abs(total - 1) > 0.001) {
      newOutcomes.forEach(o => o.probability /= total);
    }
    setOutcomes(newOutcomes);
  };

  const chartData = outcomes.map(o => ({
    name: `x=${o.value}`,
    value: o.value,
    probability: o.probability,
    contribution: o.value * o.probability
  }));

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>1</span>
          What is Expected Value?
        </h3>
        <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border">
          <div className="text-center mb-4">
            <div className="text-2xl font-bold" style={{ color }}>
              <Formula formula="E[X] = \\sum_{i} x_i \\times P(x_i)" block />
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Expected Value (<Formula formula="E[X]" />) is the <strong>long-run average</strong> of a random variable.
            It's what you expect to happen on average over many repetitions of an experiment.
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>2</span>
          Real-World Example: Casino Game
        </h3>
        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
          <div className="flex items-start gap-4">
            <div className="text-5xl">🎰</div>
            <div>
              <p className="text-gray-700 mb-3">
                <strong>A game costs $5 to play. You roll two dice:</strong>
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div className="bg-white p-2 rounded">Sum = 7 → Win $20</div>
                <div className="bg-white p-2 rounded">Sum ≠ 7 → Win $0</div>
              </div>
              <div className="bg-white p-4 rounded-xl">
                <p className="text-gray-600 text-sm"><Formula formula="P(7) = 6/36 = 1/6" /></p>
                <p className="text-gray-600 text-sm"><Formula formula="\\text{Earnings} = (1/6 \times \$20) + (5/6 \times \$0) = \$3.33" /></p>
                <p className="text-lg font-bold mt-2" style={{ color }}>
                  <Formula formula="\\text{E[profit]} = \$3.33 - \$5 =" /> <strong>-$1.67</strong> per game
                </p>
                <p className="text-xs text-gray-500 mt-2">Negative expected value means the casino always wins!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>3</span>
          Variance and Standard Deviation
        </h3>
        <div className="bg-white p-6 rounded-2xl border">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-violet-50 p-4 rounded-xl">
              <div className="text-sm text-gray-500">Variance</div>
              <div className="text-3xl font-bold text-violet-600"><Formula formula={`\\text{Var} = ${variance.toFixed(3)}`} /></div>
              <code className="text-xs text-gray-500"><Formula formula="\\text{Var}(X) = E[(X-\\mu)^2]" /></code>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl">
              <div className="text-sm text-gray-500">Std Deviation</div>
              <div className="text-3xl font-bold text-amber-600"><Formula formula={`\\sigma = ${stdDev.toFixed(3)}`} /></div>
              <code className="text-xs text-gray-500"><Formula formula="\\sigma = \\sqrt{\\text{Var}(X)}" /></code>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Variance</strong> measures how spread out the values are from the mean.
            <strong> Standard deviation</strong> is the square root, bringing it back to the original units.
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>4</span>
          Contributions to Expected Value
        </h3>
        <div className="h-56 mb-4">
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="contribution" name="Contribution" fill={color} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-500 text-center">
          Each bar shows how much that outcome contributes to <Formula formula="E[X]" />. The sum of all bars equals <Formula formula="E[X]" />!
        </p>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>5</span>
          Interactive Distribution
        </h3>
        <div className="bg-white p-6 rounded-2xl border">
          <div className="text-center mb-4 p-4 bg-gradient-to-r from-violet-100 to-purple-100 rounded-xl">
            <div className="text-sm text-gray-500">Expected Value</div>
            <div className="text-4xl font-bold" style={{ color }}><Formula formula={`E[X] = ${expectedValue.toFixed(3)}`} /></div>
          </div>
          <div className="space-y-3">
            {outcomes.map((outcome, i) => (
              <div key={i} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl">
                <span className="w-16 font-mono font-bold">x = {outcome.value}</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={outcome.probability}
                  onChange={(e) => updateOutcome(i, Number(e.target.value))}
                  className="flex-1 cursor-pointer"
                  style={{ accentColor: color }}
                />
                <span className="w-20 text-right font-mono" style={{ color }}>{(outcome.probability * 100).toFixed(0)}%</span>
                <span className="w-24 text-right text-sm text-gray-500">
                  = {outcome.value} × {(outcome.probability).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// Binomial Distribution Detailed
const BinomialDistributionDetailed: React.FC<{ color: string }> = ({ color }) => {
  const [n, setN] = useState(10);
  const [p, setP] = useState(0.5);

  const binomialPMF = (k: number) => {
    return combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  };

  const expectedValue = n * p;
  const variance = n * p * (1 - p);

  const data = Array.from({ length: n + 1 }, (_, k) => ({
    k,
    probability: binomialPMF(k),
    expected: expectedValue
  }));

  // Cumulative data
  const cumulativeData = Array.from({ length: n + 1 }, (_, k) => ({
    k,
    cumulative: Array.from({ length: k + 1 }, (_, i) => binomialPMF(i)).reduce((a, b) => a + b, 0)
  }));

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>1</span>
          Binomial Distribution Formula
        </h3>
        <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border">
          <div className="text-center mb-4">
            <div className="text-2xl font-bold" style={{ color }}>
              <Formula formula="P(X=k) = \\binom{n}{k} p^k (1-p)^{n-k}" block />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 text-sm">
            <div className="bg-blue-50 p-2 rounded text-center">
              <div className="font-bold">n</div>
              <div className="text-gray-600">Trials</div>
            </div>
            <div className="bg-green-50 p-2 rounded text-center">
              <div className="font-bold">k</div>
              <div className="text-gray-600">Successes</div>
            </div>
            <div className="bg-purple-50 p-2 rounded text-center">
              <div className="font-bold">p</div>
              <div className="text-gray-600">Prob success</div>
            </div>
            <div className="bg-amber-50 p-2 rounded text-center">
              <div className="font-bold">C(n,k)</div>
              <div className="text-gray-600">Combinations</div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>2</span>
          When to Use Binomial
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 p-4 rounded-xl border-l-4 border-emerald-500">
            <div className="font-bold text-emerald-800 mb-2">✓ Requirements</div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Fixed number of trials (n)</li>
              <li>Each trial is independent</li>
              <li>Two outcomes only (success/fail)</li>
              <li>Same probability each trial</li>
            </ul>
          </div>
          <div className="bg-red-50 p-4 rounded-xl border-l-4 border-red-500">
            <div className="font-bold text-red-800 mb-2">✗ Not Binomial</div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Variable number of trials</li>
              <li>Dependent trials</li>
              <li>More than 2 outcomes</li>
              <li>Changing probability</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>3</span>
          Real-World Example: Free Throws
        </h3>
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="text-5xl">🏀</div>
            <div>
              <p className="text-gray-700 mb-3">
                <strong>Question:</strong> A basketball player makes 70% of free throws.
                In a game with 10 attempts, what's the probability of making exactly 7?
              </p>
              <div className="bg-white p-4 rounded-xl">
                <p className="text-gray-600 text-sm mb-1"><Formula formula="n = 10, p = 0.70, k = 7" /></p>
                <p className="text-gray-600 text-sm mb-1"><Formula formula="C(10,7) = 120" /></p>
                <p className="text-gray-600 text-sm mb-1"><Formula formula="P(X=7) = 120 \times (0.7)^7 \times (0.3)^3" /></p>
                <p className="text-lg font-bold mt-2" style={{ color }}>
                  ≈ <strong>26.7%</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>4</span>
          Distribution Shape
        </h3>
        <div className="h-56 mb-4">
          <ResponsiveContainer>
            <BarChart data={data}>
              <XAxis dataKey="k" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="probability" fill={color} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-indigo-100 rounded-xl">
            <div className="text-sm text-gray-500">Mean</div>
            <div className="font-bold text-indigo-600"><Formula formula={`E[X] = ${expectedValue.toFixed(2)}`} /></div>
          </div>
          <div className="text-center p-3 bg-emerald-100 rounded-xl">
            <div className="text-sm text-gray-500">Variance</div>
            <div className="font-bold text-emerald-600"><Formula formula={`\\text{Var} = ${variance.toFixed(2)}`} /></div>
          </div>
          <div className="text-center p-3 bg-amber-100 rounded-xl">
            <div className="text-sm text-gray-500">Std Dev</div>
            <div className="font-bold text-amber-600"><Formula formula={`\\sigma = ${Math.sqrt(variance).toFixed(2)}`} /></div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>5</span>
          Interactive Parameters
        </h3>
        <div className="bg-white p-6 rounded-2xl border">
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-2"><Formula formula={`n \\text{ (trials)}: ${n}`} /></label>
              <input
                type="range"
                min="5"
                max="30"
                value={n}
                onChange={(e) => setN(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: color }}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-2"><Formula formula={`p \\text{ (success prob)}: ${p.toFixed(2)}`} /></label>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={p}
                onChange={(e) => setP(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: color }}
              />
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <Formula formula="P(X=k) = \\binom{n}{k} p^k (1-p)^{n-k}" block />
          </div>
        </div>
      </section>
    </div>
  );
};

// Poisson Distribution Detailed
const PoissonDistributionDetailed: React.FC<{ color: string }> = ({ color }) => {
  const [lambda, setLambda] = useState(4);

  const poissonPMF = (k: number) => {
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
  };

  const data = Array.from({ length: 15 }, (_, k) => ({
    k,
    probability: poissonPMF(k)
  }));

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>1</span>
          Poisson Distribution
        </h3>
        <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border">
          <div className="text-center mb-4">
            <div className="text-2xl font-bold" style={{ color }}>
              <Formula formula="P(X=k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}" block />
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed">
            The Poisson distribution models the number of events occurring in a <strong>fixed interval</strong>
            when events happen at a constant average rate (<Formula formula="\\lambda" />) and independently of each other.
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>2</span>
          Key Properties
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-rose-50 p-4 rounded-xl">
            <div className="font-bold text-rose-800 mb-2"><Formula formula="E[X] = \\lambda" /></div>
            <div className="text-sm text-gray-600">Mean equals the rate parameter</div>
          </div>
          <div className="bg-violet-50 p-4 rounded-xl">
            <div className="font-bold text-violet-800 mb-2"><Formula formula="\\text{Var}(X) = \\lambda" /></div>
            <div className="text-sm text-gray-600">Variance also equals <Formula formula="\\lambda" /></div>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl col-span-2">
            <div className="font-bold text-amber-800 mb-2"><Formula formula="\\sigma = \\sqrt{\\lambda}" /></div>
            <div className="text-sm text-gray-600">For Poisson, both the mean and variance are <Formula formula="\\lambda" />.</div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>3</span>
          When to Use Poisson
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
            <span className="text-2xl">📧</span>
            <div>
              <div className="font-semibold">Emails per hour</div>
              <div className="text-sm text-gray-500">Events: email arrivals, Rate: avg per hour</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
            <span className="text-2xl">☎️</span>
            <div>
              <div className="font-semibold">Calls per minute</div>
              <div className="text-sm text-gray-500">Events: phone calls, Rate: avg per minute</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
            <span className="text-2xl">🚗</span>
            <div>
              <div className="font-semibold">Customers per day</div>
              <div className="text-sm text-gray-500">Events: arrivals, Rate: avg per day</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
            <span className="text-2xl">🔬</span>
            <div>
              <div className="font-semibold">Radioactive decays</div>
              <div className="text-sm text-gray-500">Events: particle emissions, Rate: avg per time</div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>4</span>
          Real-World Example
        </h3>
        <div className="bg-cyan-50 p-6 rounded-2xl border border-cyan-100">
          <div className="flex items-start gap-4">
            <div className="text-5xl">📞</div>
            <div>
              <p className="text-gray-700 mb-3">
                <strong>Scenario:</strong> A call center receives an average of 4 calls per hour.
                What's the probability of getting exactly 6 calls?
              </p>
              <div className="bg-white p-4 rounded-xl">
                <p className="text-gray-600 text-sm mb-1"><Formula formula="\\lambda = 4, k = 6" /></p>
                <p className="text-gray-600 text-sm mb-1"><Formula formula="P(X=6) = \frac{4^6 \times e^{-4}}{6!}" /></p>
                <p className="text-gray-600 text-sm mb-1"><Formula formula="= \frac{4096 \times 0.0183}{720}" /></p>
                <p className="text-lg font-bold mt-2" style={{ color }}>
                  ≈ <strong>10.4%</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color }}>
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: color }}>5</span>
          Interactive Visualization
        </h3>
        <div className="bg-white p-6 rounded-2xl border">
          <div className="text-center mb-4">
            <label className="text-sm font-medium text-gray-600 block mb-2"><Formula formula={`\\lambda \\text{ (average rate)}: ${lambda}`} /></label>
            <input
              type="range"
              min="0.5"
              max="15"
              step="0.5"
              value={lambda}
              onChange={(e) => setLambda(Number(e.target.value))}
              className="w-64 mx-auto cursor-pointer"
              style={{ accentColor: color }}
            />
          </div>
          <div className="h-56 mb-4">
            <ResponsiveContainer>
              <BarChart data={data}>
                <XAxis dataKey="k" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="probability" fill={color} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-rose-100 rounded-xl">
              <div className="text-sm text-gray-500">Mean = <Formula formula="\\lambda" /></div>
              <div className="font-bold text-rose-600">{lambda}</div>
            </div>
            <div className="text-center p-3 bg-violet-100 rounded-xl">
              <div className="text-sm text-gray-500">Variance = <Formula formula="\\lambda" /></div>
              <div className="font-bold text-violet-600">{lambda}</div>
            </div>
            <div className="text-center p-3 bg-amber-100 rounded-xl">
              <div className="text-sm text-gray-500">Std Dev = <Formula formula="\\sqrt{\\lambda}" /></div>
              <div className="font-bold text-amber-600">{Math.sqrt(lambda).toFixed(2)}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Concept Card Component - with More Detail button
const ConceptCard: React.FC<ConceptProps & { children: React.ReactNode; onMoreDetail: () => void }> = ({
  title, formula, description, icon, color, children, onMoreDetail
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl ${expanded ? 'ring-4' : ''}`}
      style={{ '--tw-ring-color': color } as React.CSSProperties}
    >
      {/* Clickable Header */}
      <div
        className="p-6 cursor-pointer transition-all duration-300 hover:brightness-95"
        style={{ background: `linear-gradient(135deg, ${color}15, ${color}05)` }}
        onClick={handleToggle}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl" style={{ backgroundColor: color }}>
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">{title}</h3>
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); onMoreDetail(); }}
                  className="px-3 py-1.5 rounded-lg font-semibold text-xs text-white transition-all hover:scale-105"
                  style={{ backgroundColor: color }}
                >
                  📚 More Detail
                </button>
                <button
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    expanded
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'text-white hover:opacity-90'
                  }`}
                  style={!expanded ? { backgroundColor: color } : {}}
                  onClick={handleToggle}
                >
                  {expanded ? '✕ Close' : '▶ Explore'}
                </button>
              </div>
            </div>
            <div className="mt-2 inline-block bg-white/50 px-2 py-1 rounded"><Formula formula={formula} /></div>
          </div>
        </div>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>

      {/* Interactive Content */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${expanded ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0'}`}
        onClick={handleContentClick}
      >
        <div className="p-6 border-t-2 border-gray-100 bg-gradient-to-b from-gray-50 to-white">
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }}></span>
            Interactive Visual — Adjust parameters below
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

// ====== 1. Basic Probability Component ======
const BasicProbability: React.FC = () => {
  const [favorable, setFavorable] = useState(3);
  const [total, setTotal] = useState(6);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const probability = total > 0 ? favorable / total : 0;

  const rollDice = useCallback(() => {
    setRolling(true);
    setTimeout(() => {
      const outcome = Math.floor(Math.random() * total) + 1;
      setResult(outcome <= favorable ? outcome : null);
      setRolling(false);
    }, 600);
  }, [favorable, total]);

  const data = [
    { name: 'Favorable', value: favorable, fill: '#10b981' },
    { name: 'Unfavorable', value: total - favorable, fill: '#ef4444' }
  ];

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="space-y-6" onClick={stopPropagation}>
      <div className="flex flex-wrap gap-6 justify-center">
        <div className="flex flex-col items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Favorable Outcomes</label>
          <input
            type="range"
            min="1"
            max={total}
            value={favorable}
            onChange={(e) => setFavorable(Number(e.target.value))}
            onClick={stopPropagation}
            className="w-32 accent-emerald-500 cursor-pointer"
          />
          <span className="text-2xl font-bold text-emerald-600">{favorable}</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Total Outcomes</label>
          <input
            type="range"
            min={favorable}
            max="20"
            value={total}
            onChange={(e) => setTotal(Number(e.target.value))}
            onClick={stopPropagation}
            className="w-32 accent-blue-500 cursor-pointer"
          />
          <span className="text-2xl font-bold text-blue-600">{total}</span>
        </div>
      </div>

      <div className="flex gap-8 items-center justify-center flex-wrap">
        <div className="w-48 h-48">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                dataKey="value"
                animationDuration={500}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="text-center">
          <div className="text-5xl font-bold bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
            {(probability * 100).toFixed(1)}%
          </div>
          <div className="text-gray-500 mt-2"><Formula formula={`P(A) = \\frac{${favorable}}{${total}}`} /></div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={(e) => { e.stopPropagation(); rollDice(); }}
          disabled={rolling}
          className={`px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
            rolling ? 'scale-95 bg-gray-400' : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-105'
          }`}
        >
          {rolling ? 'Rolling...' : '🎲 Roll the Dice'}
        </button>

        {result !== null && (
          <div className={`text-4xl font-bold animate-bounce ${result ? 'text-emerald-500' : 'text-red-500'}`}>
            {result ? `✓ Rolled ${result} (Success!)` : '✗ No success'}
          </div>
        )}
      </div>
    </div>
  );
};

// ====== 2. Complement Rule Component ======
const ComplementRule: React.FC = () => {
  const [pA, setPA] = useState(0.7);
  const [spinning, setSpinning] = useState(false);

  const pAc = 1 - pA;

  const spinWheel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSpinning(true);
    setTimeout(() => setSpinning(false), 2000);
  };

  return (
    <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-col items-center gap-4">
        <div
          className={`w-48 h-48 rounded-full border-8 border-gray-800 relative overflow-hidden transition-transform ${spinning ? '[animation:spin_0.5s_linear_infinite]' : ''}`}
          style={{
            background: `conic-gradient(#6366f1 0deg ${pA * 360}deg, #ec4899 ${pA * 360}deg 360deg)`
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
              <div className="w-2 h-16 bg-gray-800 absolute -translate-y-8" />
            </div>
          </div>
        </div>

        <button
          onClick={spinWheel}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition"
        >
          🎰 Spin the Wheel
        </button>
      </div>

      <div className="flex justify-center gap-8 flex-wrap">
        <div className="text-center p-4 bg-indigo-50 rounded-xl">
          <div className="text-3xl font-bold text-indigo-600">{(pA * 100).toFixed(0)}%</div>
          <div className="text-sm text-gray-600"><Formula formula="P(A)" /> occurs</div>
        </div>
        <div className="text-center p-4 bg-pink-50 rounded-xl">
          <div className="text-3xl font-bold text-pink-600">{(pAc * 100).toFixed(0)}%</div>
          <div className="text-sm text-gray-600"><Formula formula="P(A')" /> does not occur</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-inner">
        <label className="block text-center mb-2 font-medium"><Formula formula={`\\text{Adjust } P(A): ${pA.toFixed(2)}`} /></label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={pA}
          onChange={(e) => setPA(Number(e.target.value))}
          onClick={(e) => e.stopPropagation()}
          className="w-full accent-indigo-500 cursor-pointer"
        />
      </div>

      <div className="text-center bg-gray-100 p-4 rounded-xl">
        <Formula formula={`P(A') = 1 - P(A) = 1 - ${pA.toFixed(2)} = ${pAc.toFixed(2)}`} block />
      </div>
    </div>
  );
};

// ====== 3. Addition Rule Component ======
const AdditionRule: React.FC = () => {
  const [pA, setPA] = useState(0.4);
  const [pB, setPB] = useState(0.3);
  const [pIntersection, setPIntersection] = useState(0.1);

  const pUnion = pA + pB - pIntersection;

  const VennDiagram = () => {
    const canvasSize = 280;
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    const radius = 70;
    const distance = 45;

    return (
      <svg width={canvasSize} height={canvasSize} className="mx-auto" onClick={(e) => e.stopPropagation()}>
        <circle cx={centerX - distance} cy={centerY} r={radius} fill="#6366f1" fillOpacity="0.5" stroke="#6366f1" strokeWidth="3" />
        <circle cx={centerX + distance} cy={centerY} r={radius} fill="#ec4899" fillOpacity="0.5" stroke="#ec4899" strokeWidth="3" />
        <text x={centerX - distance - 35} y={centerY - 50} fontSize="14" fontWeight="bold" fill="#6366f1">A</text>
        <text x={centerX + distance + 20} y={centerY - 50} fontSize="14" fontWeight="bold" fill="#ec4899">B</text>
        <text x={centerX} y={centerY + 5} fontSize="12" fontWeight="bold" fill="#1f2937" textAnchor="middle">A∩B</text>
      </svg>
    );
  };

  return (
    <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
      <VennDiagram />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-indigo-50 p-4 rounded-xl">
          <label className="text-sm font-medium text-gray-600"><Formula formula={`P(A): ${pA.toFixed(2)}`} /></label>
          <input type="range" min="0" max="1" step="0.01" value={pA} onChange={(e) => setPA(Number(e.target.value))} onClick={(e) => e.stopPropagation()} className="w-full accent-indigo-500 cursor-pointer" />
        </div>
        <div className="bg-pink-50 p-4 rounded-xl">
          <label className="text-sm font-medium text-gray-600"><Formula formula={`P(B): ${pB.toFixed(2)}`} /></label>
          <input type="range" min="0" max="1" step="0.01" value={pB} onChange={(e) => setPB(Number(e.target.value))} onClick={(e) => e.stopPropagation()} className="w-full accent-pink-500 cursor-pointer" />
        </div>
        <div className="bg-purple-50 p-4 rounded-xl">
          <label className="text-sm font-medium text-gray-600"><Formula formula={`P(A \\cap B): ${pIntersection.toFixed(2)}`} /></label>
          <input type="range" min="0" max={Math.min(pA, pB)} step="0.01" value={pIntersection} onChange={(e) => setPIntersection(Number(e.target.value))} onClick={(e) => e.stopPropagation()} className="w-full accent-purple-500 cursor-pointer" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 rounded-xl text-white text-center">
        <div className="text-4xl font-bold mb-2">{(pUnion * 100).toFixed(1)}%</div>
        <div className="bg-white/20 px-4 py-2 rounded inline-block">
          <Formula formula={`P(A \\cup B) = ${pA.toFixed(2)} + ${pB.toFixed(2)} - ${pIntersection.toFixed(2)}`} />
        </div>
      </div>
    </div>
  );
};

// ====== 4. Conditional Probability Component ======
const ConditionalProbability: React.FC = () => {
  const [pB, setPB] = useState(0.6);
  const [pBA, setPBA] = useState(0.8);

  const pAandB = pB * pBA;
  const pAgivenB = pAandB / pB;

  const TreeDiagram = () => (
    <svg viewBox="0 0 400 250" className="w-full max-w-md mx-auto" onClick={(e) => e.stopPropagation()}>
      <circle cx="50" cy="125" r="25" fill="#1f2937" />
      <text x="50" y="130" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Start</text>
      <line x1="75" y1="110" x2="150" y2="60" stroke="#6366f1" strokeWidth="3" />
      <text x="110" y="75" fontSize="10" fill="#6366f1">P(B)={pB.toFixed(2)}</text>
      <circle cx="175" cy="50" r="25" fill="#6366f1" fillOpacity="0.7" />
      <text x="175" y="55" textAnchor="middle" fill="white" fontSize="10">B</text>
      <line x1="200" y1="40" x2="280" y2="25" stroke="#10b981" strokeWidth="2" />
      <text x="230" y="25" fontSize="9" fill="#10b981">P(A|B)={pBA.toFixed(2)}</text>
      <circle cx="305" cy="20" r="20" fill="#10b981" />
      <text x="305" y="25" textAnchor="middle" fill="white" fontSize="9">A</text>
      <line x1="200" y1="60" x2="280" y2="75" stroke="#ef4444" strokeWidth="2" />
      <text x="230" y="75" fontSize="9" fill="#ef4444">P(A'|B)={(1-pBA).toFixed(2)}</text>
      <circle cx="305" cy="80" r="20" fill="#ef4444" />
      <text x="305" y="85" textAnchor="middle" fill="white" fontSize="9">A'</text>
      <line x1="75" y1="140" x2="150" y2="190" stroke="#ec4899" strokeWidth="3" />
      <text x="110" y="175" fontSize="10" fill="#ec4899">P(B')={(1-pB).toFixed(2)}</text>
      <circle cx="175" cy="200" r="25" fill="#ec4899" fillOpacity="0.7" />
      <text x="175" y="205" textAnchor="middle" fill="white" fontSize="10">B'</text>
      <line x1="200" y1="190" x2="280" y2="175" stroke="#10b981" strokeWidth="2" />
      <circle cx="305" cy="170" r="20" fill="#10b981" />
      <text x="305" y="175" textAnchor="middle" fill="white" fontSize="9">A</text>
      <line x1="200" y1="210" x2="280" y2="225" stroke="#ef4444" strokeWidth="2" />
      <circle cx="305" cy="230" r="20" fill="#ef4444" />
      <text x="305" y="235" textAnchor="middle" fill="white" fontSize="9">A'</text>
      <text x="340" y="25" fontSize="11" fill="#1f2937">P(A∩B) = {pAandB.toFixed(3)}</text>
    </svg>
  );

  return (
    <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
      <TreeDiagram />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-indigo-50 p-4 rounded-xl">
          <label className="text-sm font-medium text-gray-600"><Formula formula={`P(B): ${pB.toFixed(2)}`} /></label>
          <input type="range" min="0.1" max="0.9" step="0.01" value={pB} onChange={(e) => setPB(Number(e.target.value))} onClick={(e) => e.stopPropagation()} className="w-full accent-indigo-500 cursor-pointer" />
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl">
          <label className="text-sm font-medium text-gray-600"><Formula formula={`P(A|B): ${pBA.toFixed(2)}`} /></label>
          <input type="range" min="0" max="1" step="0.01" value={pBA} onChange={(e) => setPBA(Number(e.target.value))} onClick={(e) => e.stopPropagation()} className="w-full accent-emerald-500 cursor-pointer" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-inner text-center">
        <div className="text-5xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent mb-4">
          {(pAgivenB * 100).toFixed(1)}%
        </div>
        <div className="bg-gray-100 px-4 py-2 rounded inline-block">
          <Formula formula={`P(A|B) = \\frac{${pAandB.toFixed(3)}}{${pB.toFixed(2)}} = ${pAgivenB.toFixed(3)}`} block />
        </div>
      </div>
    </div>
  );
};

// ====== 5. Bayes' Theorem Component ======
const BayesTheorem: React.FC = () => {
  const [priorA, setPriorA] = useState(0.3);
  const [likelihoodBgivenA, setLikelihoodBgivenA] = useState(0.8);
  const [likelihoodBgivenNotA, setLikelihoodBgivenNotA] = useState(0.2);

  const priorNotA = 1 - priorA;
  const marginalB = priorA * likelihoodBgivenA + priorNotA * likelihoodBgivenNotA;
  const posteriorA = (likelihoodBgivenA * priorA) / marginalB;
  const posteriorNotA = (likelihoodBgivenNotA * priorNotA) / marginalB;

  return (
    <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
      <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-6 rounded-xl">
        <div className="text-center mb-4">
          <div className="text-xl font-bold text-purple-600">
            <Formula formula={`P(A|B) = \\frac{P(B|A) \\times P(A)}{P(B)}`} block />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white/50 p-3 rounded-lg text-center">
            <div className="text-xs text-gray-500 mb-1"><Formula formula="P(A)" /> - Prior</div>
            <input type="range" min="0.05" max="0.95" step="0.01" value={priorA} onChange={(e) => setPriorA(Number(e.target.value))} onClick={(e) => e.stopPropagation()} className="w-full accent-indigo-500 cursor-pointer" />
            <div className="font-bold text-indigo-600">{priorA.toFixed(2)}</div>
          </div>
          <div className="bg-white/50 p-3 rounded-lg text-center">
            <div className="text-xs text-gray-500 mb-1"><Formula formula="P(B|A)" /> - Likelihood</div>
            <input type="range" min="0" max="1" step="0.01" value={likelihoodBgivenA} onChange={(e) => setLikelihoodBgivenA(Number(e.target.value))} onClick={(e) => e.stopPropagation()} className="w-full accent-emerald-500 cursor-pointer" />
            <div className="font-bold text-emerald-600">{likelihoodBgivenA.toFixed(2)}</div>
          </div>
          <div className="bg-white/50 p-3 rounded-lg text-center">
            <div className="text-xs text-gray-500 mb-1"><Formula formula="P(B|A')" /> - False Pos</div>
            <input type="range" min="0" max="1" step="0.01" value={likelihoodBgivenNotA} onChange={(e) => setLikelihoodBgivenNotA(Number(e.target.value))} onClick={(e) => e.stopPropagation()} className="w-full accent-pink-500 cursor-pointer" />
            <div className="font-bold text-pink-600">{likelihoodBgivenNotA.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-6 flex-wrap">
        <div className="bg-emerald-500 text-white p-6 rounded-xl text-center shadow-lg min-w-[160px]">
          <div className="text-sm opacity-80"><Formula formula="P(A|B)" /> - Posterior</div>
          <div className="text-4xl font-bold">{(posteriorA * 100).toFixed(1)}%</div>
        </div>
        <div className="bg-red-500 text-white p-6 rounded-xl text-center shadow-lg min-w-[160px]">
          <div className="text-sm opacity-80"><Formula formula="P(A'|B)" /></div>
          <div className="text-4xl font-bold">{(posteriorNotA * 100).toFixed(1)}%</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-inner text-center">
        <Formula formula={`P(B) = (${priorA.toFixed(2)} \\times ${likelihoodBgivenA.toFixed(2)}) + (${(1-priorA).toFixed(2)} \\times ${likelihoodBgivenNotA.toFixed(2)}) = ${marginalB.toFixed(3)}`} block />
      </div>
    </div>
  );
};

// ====== 6. Expected Value Component ======
const ExpectedValue: React.FC = () => {
  const [outcomes, setOutcomes] = useState([
    { value: 1, probability: 0.2 },
    { value: 2, probability: 0.3 },
    { value: 3, probability: 0.3 },
    { value: 4, probability: 0.15 },
    { value: 5, probability: 0.05 }
  ]);

  const expectedValue = outcomes.reduce((sum, o) => sum + o.value * o.probability, 0);
  const variance = outcomes.reduce((sum, o) => sum + o.probability * Math.pow(o.value - expectedValue, 2), 0);

  const updateOutcome = (index: number, newValue: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newOutcomes = [...outcomes];
    newOutcomes[index] = { ...newOutcomes[index], probability: newValue };
    const total = newOutcomes.reduce((sum, o) => sum + o.probability, 0);
    if (total > 0 && Math.abs(total - 1) > 0.001) {
      newOutcomes.forEach(o => o.probability /= total);
    }
    setOutcomes(newOutcomes);
  };

  const chartData = outcomes.map(o => ({
    name: `x=${o.value}`,
    value: o.value,
    probability: o.probability,
    expected: expectedValue
  }));

  return (
    <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
      <div className="flex gap-4 justify-center flex-wrap">
        <div className="bg-gradient-to-br from-violet-500 to-purple-500 text-white p-6 rounded-xl text-center shadow-lg">
          <div className="text-sm opacity-80">Expected Value</div>
          <div className="text-4xl font-bold"><Formula formula={`E[X] = ${expectedValue.toFixed(3)}`} /></div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white p-6 rounded-xl text-center shadow-lg">
          <div className="text-sm opacity-80">Variance</div>
          <div className="text-4xl font-bold"><Formula formula={`Var(X) = ${variance.toFixed(3)}`} /></div>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={({ active, payload }) => active && payload?.length ? (
              <div className="bg-white p-3 rounded-lg shadow-lg">
                <div>Value: {payload[0].payload.value}</div>
                <div>Probability: {(payload[0].payload.probability * 100).toFixed(1)}%</div>
              </div>
            ) : null} />
            <Bar dataKey="probability" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-gray-700">Adjust Probabilities:</h4>
        {outcomes.map((outcome, i) => (
          <div key={i} className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg">
            <span className="w-16 font-mono text-xs"><Formula formula={`x = ${outcome.value}`} /></span>
            <input type="range" min="0" max="1" step="0.01" value={outcome.probability} onChange={(e) => updateOutcome(i, Number(e.target.value))} onClick={(e) => e.stopPropagation()} className="flex-1 accent-violet-500 cursor-pointer" />
            <span className="w-20 text-right font-mono text-violet-600">{(outcome.probability * 100).toFixed(0)}%</span>
            <span className="w-32 text-right text-sm text-gray-500"><Formula formula={`= ${outcome.value} \\times ${(outcome.probability).toFixed(2)}`} /></span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ====== 7. Binomial Distribution Component ======
const BinomialDistribution: React.FC = () => {
  const [n, setN] = useState(10);
  const [p, setP] = useState(0.5);
  const [selectedK, setSelectedK] = useState<number | null>(null);

  const binomialPMF = (k: number) => combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  const expectedValue = n * p;
  const variance = n * p * (1 - p);
  const data = Array.from({ length: n + 1 }, (_, k) => ({ k, probability: binomialPMF(k) }));
  const selectedProb = selectedK !== null ? binomialPMF(selectedK) : null;

  return (
    <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
      <div className="flex gap-4 justify-center flex-wrap">
        <div className="bg-indigo-100 p-4 rounded-xl text-center">
          <div className="text-xs text-gray-500">n (trials)</div>
          <input type="range" min="5" max="20" value={n} onChange={(e) => setN(Number(e.target.value))} onClick={(e) => e.stopPropagation()} className="w-24 accent-indigo-500 cursor-pointer" />
          <div className="font-bold text-indigo-600"><Formula formula={`n = ${n}`} /></div>
        </div>
        <div className="bg-emerald-100 p-4 rounded-xl text-center">
          <div className="text-xs text-gray-500">p (success prob)</div>
          <input type="range" min="0.1" max="0.9" step="0.05" value={p} onChange={(e) => setP(Number(e.target.value))} onClick={(e) => e.stopPropagation()} className="w-24 accent-emerald-500 cursor-pointer" />
          <div className="font-bold text-emerald-600"><Formula formula={`p = ${p.toFixed(2)}`} /></div>
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer>
          <BarChart data={data} onClick={(e) => { e.stopPropagation(); if (e && e.activeLabel !== undefined) setSelectedK(Number(e.activeLabel)); }}>
            <XAxis dataKey="k" />
            <YAxis />
            <Tooltip content={({ active, payload }) => active && payload?.length ? (
              <div className="bg-white p-3 rounded-lg shadow-lg">
                <div className="font-bold">k = {payload[0].payload.k}</div>
                <Formula formula={`P(X=${payload[0].payload.k}) = ${(payload[0].payload.probability * 100).toFixed(2)} \\%`} />
              </div>
            ) : null} />
            <Bar dataKey="probability" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={selectedK === entry.k ? '#f59e0b' : '#6366f1'} fillOpacity={selectedK === entry.k ? 1 : 0.7} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {selectedK !== null && (
        <div className="bg-amber-100 p-4 rounded-xl text-center animate-pulse">
          <Formula formula={`P(X = ${selectedK}) = ${(selectedProb! * 100).toFixed(2)} \\%`} block />
        </div>
      )}

      <div className="flex justify-center gap-6 flex-wrap">
        <div className="bg-indigo-500 text-white px-6 py-3 rounded-xl shadow-lg">
          <div className="text-xs opacity-80"><Formula formula="E[X]" /></div>
          <div className="font-bold">{expectedValue.toFixed(2)}</div>
        </div>
        <div className="bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg">
          <div className="text-xs opacity-80"><Formula formula="Var(X)" /></div>
          <div className="font-bold">{variance.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};

// ====== 8. Poisson Distribution Component ======
const PoissonDistribution: React.FC = () => {
  const [lambda, setLambda] = useState(4);
  const [selectedK, setSelectedK] = useState<number | null>(null);

  const poissonPMF = (k: number) => (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
  const data = Array.from({ length: 15 }, (_, k) => ({ k, probability: poissonPMF(k) }));
  const selectedProb = selectedK !== null ? poissonPMF(selectedK) : null;

  return (
    <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-center">
        <div className="bg-rose-100 p-4 rounded-xl text-center">
          <div className="text-sm text-gray-600 mb-2"><Formula formula="\\lambda" /> (average rate)</div>
          <input type="range" min="0.5" max="10" step="0.5" value={lambda} onChange={(e) => setLambda(Number(e.target.value))} onClick={(e) => e.stopPropagation()} className="w-48 accent-rose-500 cursor-pointer" />
          <div className="font-bold text-rose-600 text-2xl mt-2"><Formula formula={`\\lambda = ${lambda}`} /></div>
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer>
          <BarChart data={data} onClick={(e) => { e.stopPropagation(); if (e && e.activeLabel !== undefined) setSelectedK(Number(e.activeLabel)); }}>
            <XAxis dataKey="k" />
            <YAxis />
            <Tooltip content={({ active, payload }) => active && payload?.length ? (
              <div className="bg-white p-3 rounded-lg shadow-lg">
                <div className="font-bold">k = {payload[0].payload.k}</div>
                <Formula formula={`P(X=${payload[0].payload.k}) = ${(payload[0].payload.probability * 100).toFixed(2)} \\%`} />
              </div>
            ) : null} />
            <Bar dataKey="probability" fill="#f43f5e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {selectedK !== null && (
        <div className="bg-rose-100 p-4 rounded-xl text-center">
          <Formula formula={`P(X = ${selectedK}) = ${(selectedProb! * 100).toFixed(2)} \\%`} block />
        </div>
      )}

      <div className="flex justify-center">
        <div className="bg-rose-500 text-white px-8 py-4 rounded-xl shadow-lg">
          <div className="text-sm opacity-80">Both <Formula formula="E[X]" /> and <Formula formula="Var(X)" /></div>
          <div className="text-3xl font-bold"><Formula formula={`\\lambda = ${lambda}`} /></div>
        </div>
      </div>
    </div>
  );
};

// ====== Main App Component ======
function App() {
  const [detailedModal, setDetailedModal] = useState<{
    title: string;
    color: string;
    icon: React.ReactNode;
    detailedContent: React.ReactNode;
  } | null>(null);

  const concepts = [
    {
      title: 'Basic Probability',
      formula: 'P(A) = \\frac{favorable}{total}',
      description: 'The fundamental ratio of favorable outcomes to total possible outcomes in equally likely scenarios.',
      icon: <DiceIcon />,
      color: '#10b981',
      component: <BasicProbability />,
      detailedContent: <BasicProbabilityDetailed color="#10b981" />
    },
    {
      title: 'Complement Rule',
      formula: "P(A') = 1 - P(A)",
      description: 'The probability that an event does NOT occur, which always sums to 1 with the event probability.',
      icon: <RotateIcon />,
      color: '#ec4899',
      component: <ComplementRule />,
      detailedContent: <ComplementRuleDetailed color="#ec4899" />
    },
    {
      title: 'Addition Rule',
      formula: 'P(A \\cup B) = P(A) + P(B) - P(A \\cap B)',
      description: 'Calculates the probability of either event A or event B occurring, accounting for overlap.',
      icon: <UniteIcon />,
      color: '#6366f1',
      component: <AdditionRule />,
      detailedContent: <AdditionRuleDetailed color="#6366f1" />
    },
    {
      title: 'Conditional Probability',
      formula: 'P(A|B) = \\frac{P(A \\cap B)}{P(B)}',
      description: 'The probability of event A occurring given that event B has already occurred.',
      icon: <BranchIcon />,
      color: '#f59e0b',
      component: <ConditionalProbability />,
      detailedContent: <ConditionalProbabilityDetailed color="#f59e0b" />
    },
    {
      title: "Bayes' Theorem",
      formula: 'P(A|B) = \\frac{P(B|A) \\times P(A)}{P(B)}',
      description: 'Updates probability estimates based on new evidence - the foundation of statistical inference.',
      icon: <BrainIcon />,
      color: '#8b5cf6',
      component: <BayesTheorem />,
      detailedContent: <BayesTheoremDetailed color="#8b5cf6" />
    },
    {
      title: 'Expected Value',
      formula: 'E[X] = \\sum x_i \\times P(x_i)',
      description: 'The long-run average value of a random variable across many repetitions.',
      icon: <ChartIcon />,
      color: '#14b8a6',
      component: <ExpectedValue />,
      detailedContent: <ExpectedValueDetailed color="#14b8a6" />
    },
    {
      title: 'Binomial Distribution',
      formula: 'P(X=k) = \\binom{n}{k} p^k (1-p)^{n-k}',
      description: 'Probability of exactly k successes in n independent yes/no trials.',
      icon: <CoinIcon />,
      color: '#3b82f6',
      component: <BinomialDistribution />,
      detailedContent: <BinomialDistributionDetailed color="#3b82f6" />
    },
    {
      title: 'Poisson Distribution',
      formula: 'P(X=k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}',
      description: 'Models the probability of a given number of events in a fixed interval.',
      icon: <SparkleIcon />,
      color: '#f43f5e',
      component: <PoissonDistribution />,
      detailedContent: <PoissonDistributionDetailed color="#f43f5e" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 animate-pulse" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              Probability Explorer
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Interactive visualizations of fundamental probability concepts.
            Click each concept to explore and experiment with real-time calculations.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="#concepts" className="px-8 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition">
              Explore Concepts ↓
            </a>
          </div>
        </div>

        <div className="absolute top-10 left-10 text-6xl opacity-20 animate-bounce">🎲</div>
        <div className="absolute bottom-20 right-10 text-6xl opacity-20 animate-pulse">📊</div>
        <div className="absolute top-40 right-20 text-5xl opacity-20 animate-ping">🎰</div>
      </header>

      {/* Concepts Grid */}
      <main id="concepts" className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {concepts.map((concept, index) => (
            <AnimatedSection key={concept.title} delay={index * 100}>
              <ConceptCard {...concept} onMoreDetail={() => setDetailedModal({
                title: concept.title,
                color: concept.color,
                icon: concept.icon,
                detailedContent: concept.detailedContent
              })}>
                {concept.component}
              </ConceptCard>
            </AnimatedSection>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/30 py-8 text-center">
        <p className="text-gray-400">
          Built with React & Recharts • Interactive Probability Visualizations
        </p>
      </footer>

      {/* Detailed Modal */}
      <DetailedModal
        isOpen={detailedModal !== null}
        onClose={() => setDetailedModal(null)}
        concept={detailedModal}
      />
    </div>
  );
}

// Icon Components
const DiceIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
    <rect x="2" y="2" width="20" height="20" rx="3" strokeWidth="2" stroke="white" fill="none" />
    <circle cx="7" cy="7" r="1.5" fill="white" />
    <circle cx="17" cy="7" r="1.5" fill="white" />
    <circle cx="12" cy="12" r="1.5" fill="white" />
    <circle cx="7" cy="17" r="1.5" fill="white" />
    <circle cx="17" cy="17" r="1.5" fill="white" />
  </svg>
);

const RotateIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
  </svg>
);

const UniteIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
    <circle cx="9" cy="9" r="6" fill="none" stroke="white" strokeWidth="2" />
    <circle cx="15" cy="15" r="6" fill="none" stroke="white" strokeWidth="2" />
  </svg>
);

const BranchIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
    <path d="M13 8V4l-3 4 3 4v-3c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zM6 12c0-3.31 2.69-6 6-6v-3l3 4-3 4v-3c-3.31 0-6-2.69-6-6z" />
  </svg>
);

const BrainIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
    <path d="M3 13h2v8H3v-8zm4-6h2v14H7V7zm4-4h2v18h-2V3zm4 8h2v10h-2V11zm4-4h2v14h-2V7z" />
  </svg>
);

const CoinIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none" />
    <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">$</text>
  </svg>
);

const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
  </svg>
);

export default App;
