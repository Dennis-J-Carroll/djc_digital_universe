import { useEffect, useMemo, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

import {
  CHAIN_RULE_PRESETS,
  affine,
  compose,
  createChainRuleExample,
  differentiate,
  evaluate,
  exp,
  formatLatex,
  formatPlain,
  generateChainRuleExample,
  ln,
  power,
  shellLabel,
  shellTemplateLatex,
  sin,
  variable,
  type ChainRuleExample,
  type Expression,
  type FunctionShell,
} from '@/lib/derivativeAst';
import { getDerivativeAnimationFrame } from '@/lib/derivativeAnimation';

const OUTER_SHELLS: FunctionShell[] = [power(2), power(3), power(5), sin(), exp(), ln()];
const INNER_BLOCKS: { label: string; expression: Expression }[] = [
  { label: '3x + 2', expression: affine(3, 2) },
  { label: '4x', expression: affine(4, 0) },
  { label: '5x − 1', expression: affine(5, -1) },
  { label: 'x²', expression: compose(power(2), variable()) },
];

function Formula({ latex, display = false }: { latex: string; display?: boolean }) {
  const html = useMemo(() => katex.renderToString(latex, {
    displayMode: display,
    throwOnError: false,
    trust: false,
  }), [display, latex]);

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return reduced;
}

function shellKey(shell: FunctionShell) {
  return shell.kind === 'power-shell' ? `${shell.kind}-${shell.exponent}` : shell.kind;
}

function safeSampleX(outer: FunctionShell, inner: Expression) {
  const expression = compose(outer, inner);
  const derivative = differentiate(expression);
  return [1, 0.5, 1.5, 2].find((candidate) => (
    Number.isFinite(evaluate(expression, candidate)) && Number.isFinite(evaluate(derivative, candidate))
  )) ?? 1;
}

function customExample(outer: FunctionShell, inner: Expression): ChainRuleExample {
  const expression = compose(outer, inner);
  return createChainRuleExample(
    `custom-${shellKey(outer)}-${formatPlain(inner)}`,
    formatPlain(expression),
    outer,
    inner,
    safeSampleX(outer, inner),
  );
}

interface GraphData {
  functionPath: string;
  derivativePath: string;
  zeroY: number;
  activeFunctionY: number;
  activeDerivativeY: number;
  activeX: number;
}

function createGraphData(example: ChainRuleExample, x: number): GraphData {
  const width = 720;
  const height = 230;
  const padding = 24;
  const xMin = 0.25;
  const xMax = 2.5;
  const sampleCount = 90;
  const samples = Array.from({ length: sampleCount }, (_, index) => {
    const sampleX = xMin + ((xMax - xMin) * index) / (sampleCount - 1);
    return {
      x: sampleX,
      y: evaluate(example.expression, sampleX),
      derivative: evaluate(example.derivative, sampleX),
    };
  }).filter((sample) => Number.isFinite(sample.y) && Number.isFinite(sample.derivative));

  const allValues = samples.flatMap((sample) => [sample.y, sample.derivative]);
  const rawMin = Math.min(0, ...allValues);
  const rawMax = Math.max(0, ...allValues);
  const span = Math.max(rawMax - rawMin, 1);
  const yMin = rawMin - span * 0.08;
  const yMax = rawMax + span * 0.08;
  const xScale = (value: number) => padding + ((value - xMin) / (xMax - xMin)) * (width - padding * 2);
  const yScale = (value: number) => height - padding - ((value - yMin) / (yMax - yMin)) * (height - padding * 2);
  const path = (key: 'y' | 'derivative') => samples
    .map((sample, index) => `${index === 0 ? 'M' : 'L'} ${xScale(sample.x).toFixed(2)} ${yScale(sample[key]).toFixed(2)}`)
    .join(' ');

  return {
    functionPath: path('y'),
    derivativePath: path('derivative'),
    zeroY: yScale(0),
    activeFunctionY: yScale(evaluate(example.expression, x)),
    activeDerivativeY: yScale(evaluate(example.derivative, x)),
    activeX: xScale(x),
  };
}

function DerivativeGraph({ example, x }: { example: ChainRuleExample; x: number }) {
  const graph = useMemo(() => createGraphData(example, x), [example, x]);
  const functionValue = evaluate(example.expression, x);
  const derivativeValue = evaluate(example.derivative, x);

  return (
    <figure className="derivative-graph-panel">
      <figcaption className="derivative-graph-title">
        <span><i className="graph-key graph-key-function" /> Function</span>
        <span><i className="graph-key graph-key-derivative" /> Derivative</span>
      </figcaption>
      <svg
        className="derivative-graph"
        viewBox="0 0 720 230"
        role="img"
        aria-label={`At x ${x.toFixed(2)}, function value is ${functionValue.toFixed(2)} and derivative is ${derivativeValue.toFixed(2)}.`}
      >
        <line x1="24" x2="696" y1={graph.zeroY} y2={graph.zeroY} className="derivative-axis" />
        <line x1={graph.activeX} x2={graph.activeX} y1="18" y2="206" className="derivative-cursor" />
        <path d={graph.functionPath} className="derivative-curve derivative-curve-function" />
        <path d={graph.derivativePath} className="derivative-curve derivative-curve-derivative" />
        <circle cx={graph.activeX} cy={graph.activeFunctionY} r="5" className="derivative-dot derivative-dot-function" />
        <circle cx={graph.activeX} cy={graph.activeDerivativeY} r="5" className="derivative-dot derivative-dot-derivative" />
      </svg>
    </figure>
  );
}

export default function DerivativePlayground() {
  const [example, setExample] = useState(CHAIN_RULE_PRESETS[0]);
  const [stepIndex, setStepIndex] = useState(0);
  const [x, setX] = useState(CHAIN_RULE_PRESETS[0].sampleX);
  const [seed, setSeed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reducedMotion = useReducedMotion();

  const innerValue = evaluate(example.inner, x);
  const innerRate = evaluate(differentiate(example.inner), x);
  const totalRate = evaluate(example.derivative, x);
  const outerRate = innerRate === 0 ? 0 : totalRate / innerRate;
  const activeStep = example.steps[stepIndex];

  useEffect(() => {
    if (!playing || reducedMotion) return;
    let frameId = 0;
    const startedAt = performance.now();
    const duration = 6000;

    const animate = (now: number) => {
      const frame = getDerivativeAnimationFrame(now - startedAt, duration, example.steps.length);
      setX(frame.x);
      setStepIndex(frame.stepIndex);
      if (!frame.complete) {
        frameId = requestAnimationFrame(animate);
      } else {
        setPlaying(false);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [example.steps.length, playing, reducedMotion]);

  const chooseExample = (next: ChainRuleExample) => {
    setExample(next);
    setStepIndex(0);
    setX(next.sampleX);
    setPlaying(false);
  };

  const chooseOuter = (outer: FunctionShell) => chooseExample(customExample(outer, example.inner));
  const chooseInner = (inner: Expression) => chooseExample(customExample(example.outer, inner));

  const generateExample = () => {
    const nextSeed = seed + 1;
    setSeed(nextSeed);
    chooseExample(generateChainRuleExample(nextSeed));
  };

  const play = () => {
    if (reducedMotion) {
      setStepIndex((current) => (current + 1) % example.steps.length);
      setX((current) => current >= 2.5 ? 0.25 : Math.min(2.5, current + 0.25));
      return;
    }
    if (!playing) {
      setX(0.25);
      setStepIndex(0);
    }
    setPlaying((current) => !current);
  };

  return (
    <section className="derivative-lab" aria-labelledby="derivative-lab-title">
      <header className="derivative-lab-header">
        <div>
          <p className="derivative-eyebrow">DERIVATIVE LEGO PLAYGROUND</p>
          <h2 id="derivative-lab-title">Build inside. Differentiate outside.</h2>
          <p>Swap function pieces, then watch both rates combine through chain rule.</p>
        </div>
        <div className="derivative-header-actions">
          <button type="button" className="pill-inactive focus-ring" onClick={generateExample}>
            ↻ Generate example
          </button>
          <button type="button" className="pill-inactive focus-ring" onClick={() => chooseExample(CHAIN_RULE_PRESETS[0])}>
            Reset
          </button>
        </div>
      </header>

      <div className="derivative-presets" role="group" aria-label="Chain rule examples">
        {CHAIN_RULE_PRESETS.map((preset) => (
          <button
            type="button"
            key={preset.key}
            className="derivative-preset focus-ring"
            aria-pressed={example.key === preset.key}
            onClick={() => chooseExample(preset)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="derivative-builder-grid">
        <aside className="derivative-tray" aria-label="Function piece tray">
          <div className="derivative-tray-group" role="group" aria-label="Choose outside function">
            <p>OUTSIDE SHELL</p>
            <div className="derivative-piece-list">
              {OUTER_SHELLS.map((shell) => (
                <button
                  type="button"
                  key={shellKey(shell)}
                  className="derivative-piece derivative-piece-outer focus-ring"
                  aria-pressed={shellKey(example.outer) === shellKey(shell)}
                  onClick={() => chooseOuter(shell)}
                >
                  <span>{shellLabel(shell)}</span>
                  <Formula latex={shellTemplateLatex(shell)} />
                </button>
              ))}
            </div>
          </div>

          <div className="derivative-tray-group" role="group" aria-label="Choose inside function">
            <p>INSIDE BLOCK</p>
            <div className="derivative-piece-list">
              {INNER_BLOCKS.map((block) => (
                <button
                  type="button"
                  key={block.label}
                  className="derivative-piece derivative-piece-inner focus-ring"
                  aria-pressed={formatLatex(example.inner) === formatLatex(block.expression)}
                  onClick={() => chooseInner(block.expression)}
                >
                  <Formula latex={formatLatex(block.expression)} />
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="derivative-workbench">
          <div className={`function-shell ${stepIndex === 1 ? 'is-active' : ''}`}>
            <span className="function-shell-label">OUTSIDE · {shellLabel(example.outer)}</span>
            <div className={`function-inner ${stepIndex === 0 || stepIndex === 2 ? 'is-active' : ''}`}>
              <span className="function-inner-label">INSIDE</span>
              <Formula latex={formatLatex(example.inner)} />
            </div>
            <div className="function-composition">
              <Formula latex={`y = ${formatLatex(example.expression)}`} display />
            </div>
          </div>

          <nav className="derivative-steps" aria-label="Chain rule calculation steps">
            {example.steps.map((step, index) => (
              <button
                type="button"
                key={step.key}
                className="derivative-step focus-ring"
                aria-current={stepIndex === index ? 'step' : undefined}
                onClick={() => {
                  setStepIndex(index);
                  setPlaying(false);
                }}
              >
                <span>{index + 1}</span>
                {step.title}
              </button>
            ))}
          </nav>

          <div className="derivative-step-readout" aria-live="polite">
            <p>{activeStep.instruction}</p>
            <div className="derivative-step-formula">
              <Formula latex={activeStep.latex} display />
            </div>
            <span className="sr-only">{activeStep.plain}</span>
          </div>
        </div>
      </div>

      <div className="rate-motion-panel">
        <div className="rate-motion-heading">
          <div>
            <p>RATE PIPELINE AT x = {x.toFixed(2)}</p>
            <span>Chain rule multiplies two local rates.</span>
          </div>
          <button type="button" className="pill-active focus-ring" onClick={play}>
            {reducedMotion ? 'Next state' : playing ? 'Pause motion' : 'Play calculation'}
          </button>
        </div>

        <label className="derivative-scrubber" htmlFor="derivative-x">
          <span>Move x</span>
          <input
            id="derivative-x"
            type="range"
            min="0.25"
            max="2.5"
            step="0.01"
            value={x}
            aria-valuetext={`x equals ${x.toFixed(2)}`}
            onChange={(event) => {
              setX(Number(event.target.value));
              setPlaying(false);
            }}
          />
          <output htmlFor="derivative-x">{x.toFixed(2)}</output>
        </label>

        <div className="rate-pipeline" aria-label="Numeric chain rule calculation">
          <div className="rate-node">
            <span>INPUT</span>
            <strong>x = {x.toFixed(2)}</strong>
          </div>
          <div className="rate-arrow">
            <span>inside rate</span>
            <strong>× {innerRate.toFixed(2)}</strong>
          </div>
          <div className="rate-node rate-node-inner">
            <span>INSIDE VALUE</span>
            <strong>u = {innerValue.toFixed(2)}</strong>
          </div>
          <div className="rate-arrow rate-arrow-outer">
            <span>outside rate</span>
            <strong>× {outerRate.toFixed(2)}</strong>
          </div>
          <div className="rate-node rate-node-result">
            <span>TOTAL RATE</span>
            <strong>dy/dx = {totalRate.toFixed(2)}</strong>
          </div>
        </div>

        <DerivativeGraph example={example} x={x} />
      </div>
    </section>
  );
}
