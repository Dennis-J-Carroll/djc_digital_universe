export type FunctionShell =
  | { kind: 'power-shell'; exponent: number }
  | { kind: 'sin-shell' }
  | { kind: 'exp-shell' }
  | { kind: 'ln-shell' };

export type Expression =
  | { kind: 'variable' }
  | { kind: 'constant'; value: number }
  | { kind: 'affine'; coefficient: number; intercept: number }
  | { kind: 'power'; base: Expression; exponent: number }
  | { kind: 'sin'; argument: Expression }
  | { kind: 'cos'; argument: Expression }
  | { kind: 'exp'; argument: Expression }
  | { kind: 'ln'; argument: Expression }
  | { kind: 'multiply'; factors: Expression[] }
  | { kind: 'divide'; numerator: Expression; denominator: Expression }
  | { kind: 'chain'; outerDerivative: Expression; innerDerivative: Expression };

export interface DerivativeStep {
  key: 'compose' | 'outer' | 'inner' | 'multiply';
  title: string;
  instruction: string;
  latex: string;
  plain: string;
}

export interface ChainRuleExample {
  key: string;
  label: string;
  outer: FunctionShell;
  inner: Expression;
  expression: Expression;
  derivative: Expression;
  sampleX: number;
  steps: DerivativeStep[];
}

export const variable = (): Expression => ({ kind: 'variable' });
export const constant = (value: number): Expression => ({ kind: 'constant', value });
export const affine = (coefficient: number, intercept: number): Expression => ({
  kind: 'affine',
  coefficient,
  intercept,
});
export const power = (exponent: number): FunctionShell => ({ kind: 'power-shell', exponent });
export const sin = (): FunctionShell => ({ kind: 'sin-shell' });
export const exp = (): FunctionShell => ({ kind: 'exp-shell' });
export const ln = (): FunctionShell => ({ kind: 'ln-shell' });

export function compose(outer: FunctionShell, inner: Expression): Expression {
  switch (outer.kind) {
    case 'power-shell':
      return { kind: 'power', base: inner, exponent: outer.exponent };
    case 'sin-shell':
      return { kind: 'sin', argument: inner };
    case 'exp-shell':
      return { kind: 'exp', argument: inner };
    case 'ln-shell':
      return { kind: 'ln', argument: inner };
  }
}

function multiply(...factors: Expression[]): Expression {
  const flattened = factors.flatMap((factor) => factor.kind === 'multiply' ? factor.factors : [factor]);
  const withoutOnes = flattened.filter((factor) => factor.kind !== 'constant' || factor.value !== 1);

  if (withoutOnes.length === 0) return constant(1);
  if (withoutOnes.length === 1) return withoutOnes[0];
  return { kind: 'multiply', factors: withoutOnes };
}

function chain(outerDerivative: Expression, innerDerivative: Expression): Expression {
  if (innerDerivative.kind === 'constant' && innerDerivative.value === 1) return outerDerivative;
  return { kind: 'chain', outerDerivative, innerDerivative };
}

export function differentiate(expression: Expression): Expression {
  switch (expression.kind) {
    case 'constant':
      return constant(0);
    case 'variable':
      return constant(1);
    case 'affine':
      return constant(expression.coefficient);
    case 'power':
      return chain(
        multiply(constant(expression.exponent), {
          kind: 'power',
          base: expression.base,
          exponent: expression.exponent - 1,
        }),
        differentiate(expression.base),
      );
    case 'sin':
      return chain({ kind: 'cos', argument: expression.argument }, differentiate(expression.argument));
    case 'cos':
      return chain(
        multiply(constant(-1), { kind: 'sin', argument: expression.argument }),
        differentiate(expression.argument),
      );
    case 'exp':
      return chain({ kind: 'exp', argument: expression.argument }, differentiate(expression.argument));
    case 'ln':
      return chain(
        { kind: 'divide', numerator: constant(1), denominator: expression.argument },
        differentiate(expression.argument),
      );
    case 'multiply': {
      const terms = expression.factors.map((_, index) => multiply(
        ...expression.factors.map((candidate, candidateIndex) => (
          candidateIndex === index ? differentiate(candidate) : candidate
        )),
      ));
      return terms.length === 1 ? terms[0] : { kind: 'multiply', factors: terms };
    }
    case 'divide':
      throw new Error('Quotient differentiation is not part of Chain Rule Lab yet.');
    case 'chain':
      return multiply(expression.outerDerivative, expression.innerDerivative);
  }
}

export function evaluate(expression: Expression, x: number): number {
  switch (expression.kind) {
    case 'variable': return x;
    case 'constant': return expression.value;
    case 'affine': return expression.coefficient * x + expression.intercept;
    case 'power': return evaluate(expression.base, x) ** expression.exponent;
    case 'sin': return Math.sin(evaluate(expression.argument, x));
    case 'cos': return Math.cos(evaluate(expression.argument, x));
    case 'exp': return Math.exp(evaluate(expression.argument, x));
    case 'ln': return Math.log(evaluate(expression.argument, x));
    case 'multiply': return expression.factors.reduce((value, factor) => value * evaluate(factor, x), 1);
    case 'divide': return evaluate(expression.numerator, x) / evaluate(expression.denominator, x);
    case 'chain': return evaluate(expression.outerDerivative, x) * evaluate(expression.innerDerivative, x);
  }
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function wrapArgument(expression: Expression): string {
  if (expression.kind === 'variable') return 'x';
  return `\\left(${formatLatex(expression)}\\right)`;
}

export function formatLatex(expression: Expression): string {
  switch (expression.kind) {
    case 'variable':
      return 'x';
    case 'constant':
      return formatNumber(expression.value);
    case 'affine': {
      const coefficient = expression.coefficient === 1
        ? 'x'
        : expression.coefficient === -1
          ? '-x'
          : `${formatNumber(expression.coefficient)}x`;
      if (expression.intercept === 0) return coefficient;
      const sign = expression.intercept > 0 ? '+' : '-';
      return `${coefficient} ${sign} ${formatNumber(Math.abs(expression.intercept))}`;
    }
    case 'power':
      return `${wrapArgument(expression.base)}^{${formatNumber(expression.exponent)}}`;
    case 'sin':
      return `\\sin${wrapArgument(expression.argument)}`;
    case 'cos':
      return `\\cos${wrapArgument(expression.argument)}`;
    case 'exp':
      return `e^{${formatLatex(expression.argument)}}`;
    case 'ln':
      return `\\ln${wrapArgument(expression.argument)}`;
    case 'multiply':
      return expression.factors.map((factor, index) => {
        const latex = formatLatex(factor);
        if (index === 0) return latex;
        const previous = expression.factors[index - 1];
        if (previous.kind === 'constant' && factor.kind !== 'constant') return latex;
        return ` \\cdot ${latex}`;
      }).join('');
    case 'divide':
      return `\\frac{${formatLatex(expression.numerator)}}{${formatLatex(expression.denominator)}}`;
    case 'chain':
      return `${formatLatex(expression.outerDerivative)} \\cdot ${formatLatex(expression.innerDerivative)}`;
  }
}

export function formatPlain(expression: Expression): string {
  return formatLatex(expression)
    .replaceAll('\\left', '')
    .replaceAll('\\right', '')
    .replaceAll('\\cdot', '×')
    .replaceAll('\\sin', 'sin')
    .replaceAll('\\cos', 'cos')
    .replaceAll('\\ln', 'ln')
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)')
    .replace(/\^\{([^{}]+)\}/g, '^$1');
}

export function shellLabel(shell: FunctionShell): string {
  switch (shell.kind) {
    case 'power-shell': return `Power ${shell.exponent}`;
    case 'sin-shell': return 'Sine';
    case 'exp-shell': return 'Exponential';
    case 'ln-shell': return 'Natural log';
  }
}

export function shellTemplateLatex(shell: FunctionShell): string {
  switch (shell.kind) {
    case 'power-shell': return `(\\square)^{${shell.exponent}}`;
    case 'sin-shell': return '\\sin(\\square)';
    case 'exp-shell': return 'e^{\\square}';
    case 'ln-shell': return '\\ln(\\square)';
  }
}

function outerDerivative(shell: FunctionShell, inner: Expression): Expression {
  switch (shell.kind) {
    case 'power-shell':
      return multiply(constant(shell.exponent), {
        kind: 'power',
        base: inner,
        exponent: shell.exponent - 1,
      });
    case 'sin-shell':
      return { kind: 'cos', argument: inner };
    case 'exp-shell':
      return { kind: 'exp', argument: inner };
    case 'ln-shell':
      return { kind: 'divide', numerator: constant(1), denominator: inner };
  }
}

export function createChainRuleExample(
  key: string,
  label: string,
  outer: FunctionShell,
  inner: Expression,
  sampleX: number,
): ChainRuleExample {
  const expression = compose(outer, inner);
  const outerResult = outerDerivative(outer, inner);
  const innerResult = differentiate(inner);
  const derivative = chain(outerResult, innerResult);

  return {
    key,
    label,
    outer,
    inner,
    expression,
    derivative,
    sampleX,
    steps: [
      {
        key: 'compose',
        title: 'Find nested functions',
        instruction: `Outside: ${shellLabel(outer)}. Inside stays grouped as one input.`,
        latex: `y = ${formatLatex(expression)}`,
        plain: `Original function: ${formatPlain(expression)}`,
      },
      {
        key: 'outer',
        title: 'Differentiate outside',
        instruction: 'Differentiate outside shell while keeping inside expression unchanged.',
        latex: formatLatex(outerResult),
        plain: `Outer derivative: ${formatPlain(outerResult)}`,
      },
      {
        key: 'inner',
        title: 'Differentiate inside',
        instruction: 'Now measure how quickly inside function changes with x.',
        latex: formatLatex(innerResult),
        plain: `Inner derivative: ${formatPlain(innerResult)}`,
      },
      {
        key: 'multiply',
        title: 'Multiply both rates',
        instruction: 'Outside rate per inside unit × inside rate per x unit gives total rate per x.',
        latex: `\\frac{dy}{dx} = ${formatLatex(derivative)}`,
        plain: `Final derivative: ${formatPlain(derivative)}`,
      },
    ],
  };
}

const xSquared = compose(power(2), variable());

export const CHAIN_RULE_PRESETS: ChainRuleExample[] = [
  createChainRuleExample('power-affine', '(3x + 2)⁵', power(5), affine(3, 2), 1),
  createChainRuleExample('sine-affine', 'sin(4x)', sin(), affine(4, 0), 0.5),
  createChainRuleExample('exp-square', 'e^(x²)', exp(), xSquared, 1),
  createChainRuleExample('log-affine', 'ln(5x − 1)', ln(), affine(5, -1), 1),
];

const GENERATED_OUTERS: FunctionShell[] = [power(2), power(3), power(4), power(5), sin(), exp(), ln()];
const GENERATED_INNERS: Expression[] = [
  affine(2, 1),
  affine(3, -1),
  affine(4, 2),
  affine(5, -1),
  xSquared,
];

export function generateChainRuleExample(seed: number): ChainRuleExample {
  const normalizedSeed = Math.abs(Math.trunc(seed));
  const outer = GENERATED_OUTERS[normalizedSeed % GENERATED_OUTERS.length];
  const inner = GENERATED_INNERS[Math.floor(normalizedSeed / GENERATED_OUTERS.length) % GENERATED_INNERS.length];
  const sampleCandidates = [1, 0.5, 2, -0.5];
  const expression = compose(outer, inner);
  const derivative = differentiate(expression);
  const sampleX = sampleCandidates.find((candidate) => (
    Number.isFinite(evaluate(expression, candidate)) && Number.isFinite(evaluate(derivative, candidate))
  )) ?? 1;

  return createChainRuleExample(
    `generated-${normalizedSeed}`,
    formatPlain(expression),
    outer,
    inner,
    sampleX,
  );
}
