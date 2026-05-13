// Inequality utilities

export type InequalityType = 'linear' | 'quadratic';
export type InequalitySign = '<' | '<=' | '>' | '>=';

export interface Inequality {
  id: string;
  type: InequalityType;
  // For linear: ax + b ? 0
  // For quadratic: ax² + bx + c ? 0
  a: number;
  b: number;
  c: number;
  sign: InequalitySign;
}

export interface InequalitySolution {
  intervals: { start: number; end: number; inclusive: [boolean, boolean] }[];
  criticalPoints: number[];
  explanation: string;
  signChart: { point: number; sign: 'positive' | 'negative' | 'zero'; region: string }[];
}

// Solve linear inequality: ax + b ? 0
export const solveLinearInequality = (
  a: number, 
  b: number, 
  sign: InequalitySign
): InequalitySolution => {
  const criticalPoint = -b / a;
  const intervals: InequalitySolution['intervals'] = [];
  const explanation: string[] = [];
  
  explanation.push(`Solve: ${a}x + ${b} ${sign} 0`);
  explanation.push(`Subtract ${b} from both sides: ${a}x ${sign} ${-b}`);
  
  if (a > 0) {
    explanation.push(`Divide by ${a} (positive, inequality direction stays same): x ${sign} ${criticalPoint.toFixed(3)}`);
    
    if (sign === '<' || sign === '<=') {
      intervals.push({
        start: -Infinity,
        end: criticalPoint,
        inclusive: [false, sign === '<=' ]
      });
    } else {
      intervals.push({
        start: criticalPoint,
        end: Infinity,
        inclusive: [sign === '>=', false ]
      });
    }
  } else {
    // a < 0, flip inequality
    const flippedSign = flipSign(sign);
    explanation.push(`Divide by ${a} (negative, flip inequality): x ${flippedSign} ${criticalPoint.toFixed(3)}`);
    
    if (flippedSign === '<' || flippedSign === '<=') {
      intervals.push({
        start: -Infinity,
        end: criticalPoint,
        inclusive: [false, flippedSign === '<=' ]
      });
    } else {
      intervals.push({
        start: criticalPoint,
        end: Infinity,
        inclusive: [flippedSign === '>=', false ]
      });
    }
  }
  
  return {
    intervals,
    criticalPoints: [criticalPoint],
    explanation: explanation.join('\n'),
    signChart: [
      { point: criticalPoint, sign: 'zero', region: 'at boundary' },
      { point: criticalPoint - 1, sign: a > 0 ? 'negative' : 'positive', region: 'left of boundary' },
      { point: criticalPoint + 1, sign: a > 0 ? 'positive' : 'negative', region: 'right of boundary' }
    ]
  };
};

// Solve quadratic inequality: ax² + bx + c ? 0
export const solveQuadraticInequality = (
  a: number,
  b: number,
  c: number,
  sign: InequalitySign
): InequalitySolution => {
  const discriminant = b * b - 4 * a * c;
  const intervals: InequalitySolution['intervals'] = [];
  const criticalPoints: number[] = [];
  const explanation: string[] = [];
  const signChart: InequalitySolution['signChart'] = [];
  
  explanation.push(`Solve: ${a}x² + ${b}x + ${c} ${sign} 0`);
  explanation.push(`Discriminant = ${discriminant.toFixed(3)}`);
  
  if (discriminant < 0) {
    // No real roots
    explanation.push('No real roots - parabola never crosses x-axis');
    
    // Determine if always positive or always negative
    const alwaysPositive = a > 0;
    explanation.push(`Since a = ${a} > 0, parabola opens upward and is always ${alwaysPositive ? 'positive' : 'negative'}`);
    
    if ((sign === '>' || sign === '>=') && alwaysPositive) {
      intervals.push({ start: -Infinity, end: Infinity, inclusive: [false, false] });
      explanation.push('Solution: All real numbers (always positive, looking for > 0)');
    } else if ((sign === '<' || sign === '<=') && !alwaysPositive) {
      intervals.push({ start: -Infinity, end: Infinity, inclusive: [false, false] });
      explanation.push('Solution: All real numbers (always negative, looking for < 0)');
    } else {
      explanation.push('Solution: No solution');
    }
    
    signChart.push({ point: 0, sign: alwaysPositive ? 'positive' : 'negative', region: 'everywhere' });
    
  } else if (Math.abs(discriminant) < 1e-10) {
    // One repeated root
    const root = -b / (2 * a);
    criticalPoints.push(root);
    explanation.push(`One repeated root at x = ${root.toFixed(3)}`);
    
    if (sign === '>') {
      // Looking for strictly positive, but vertex touches zero
      intervals.push({ start: -Infinity, end: root, inclusive: [false, false] });
      intervals.push({ start: root, end: Infinity, inclusive: [false, false] });
      explanation.push('Solution: All x except x = ' + root.toFixed(3));
    } else if (sign === '>=') {
      intervals.push({ start: -Infinity, end: Infinity, inclusive: [false, false] });
      explanation.push('Solution: All real numbers');
    } else if (sign === '<') {
      // Never strictly negative
      explanation.push('Solution: No solution');
    } else if (sign === '<=') {
      intervals.push({ start: root, end: root, inclusive: [true, true] });
      explanation.push('Solution: Only x = ' + root.toFixed(3));
    }
    
    signChart.push({ point: root, sign: 'zero', region: 'at vertex' });
    signChart.push({ point: root - 1, sign: a > 0 ? 'positive' : 'negative', region: 'left of vertex' });
    signChart.push({ point: root + 1, sign: a > 0 ? 'positive' : 'negative', region: 'right of vertex' });
    
  } else {
    // Two distinct roots
    const sqrtD = Math.sqrt(discriminant);
    const root1 = (-b + sqrtD) / (2 * a);
    const root2 = (-b - sqrtD) / (2 * a);
    const minRoot = Math.min(root1, root2);
    const maxRoot = Math.max(root1, root2);
    
    criticalPoints.push(minRoot, maxRoot);
    explanation.push(`Two roots: x₁ = ${minRoot.toFixed(3)}, x₂ = ${maxRoot.toFixed(3)}`);
    
    // Determine intervals based on sign and parabola direction
    const opensUp = a > 0;
    
    if (sign === '>' || sign === '>=') {
      if (opensUp) {
        // Positive outside the roots
        intervals.push({ start: -Infinity, end: minRoot, inclusive: [false, sign === '>='] });
        intervals.push({ start: maxRoot, end: Infinity, inclusive: [sign === '>=', false] });
        explanation.push(`Parabola opens up, positive outside [${minRoot.toFixed(3)}, ${maxRoot.toFixed(3)}]`);
      } else {
        // Positive between the roots
        intervals.push({ start: minRoot, end: maxRoot, inclusive: [sign === '>=', sign === '>='] });
        explanation.push(`Parabola opens down, positive between (${minRoot.toFixed(3)}, ${maxRoot.toFixed(3)})`);
      }
    } else {
      // < or <=
      if (opensUp) {
        // Negative between the roots
        intervals.push({ start: minRoot, end: maxRoot, inclusive: [sign === '<=', sign === '<='] });
        explanation.push(`Parabola opens up, negative between (${minRoot.toFixed(3)}, ${maxRoot.toFixed(3)})`);
      } else {
        // Negative outside the roots
        intervals.push({ start: -Infinity, end: minRoot, inclusive: [false, sign === '<='] });
        intervals.push({ start: maxRoot, end: Infinity, inclusive: [sign === '<=', false] });
        explanation.push(`Parabola opens down, negative outside [${minRoot.toFixed(3)}, ${maxRoot.toFixed(3)}]`);
      }
    }
    
    signChart.push({ point: minRoot - 1, sign: opensUp ? 'positive' : 'negative', region: 'left of smaller root' });
    signChart.push({ point: (minRoot + maxRoot) / 2, sign: opensUp ? 'negative' : 'positive', region: 'between roots' });
    signChart.push({ point: maxRoot + 1, sign: opensUp ? 'positive' : 'negative', region: 'right of larger root' });
    signChart.push({ point: minRoot, sign: 'zero', region: 'at smaller root' });
    signChart.push({ point: maxRoot, sign: 'zero', region: 'at larger root' });
  }
  
  return {
    intervals,
    criticalPoints,
    explanation: explanation.join('\n'),
    signChart
  };
};

// Flip inequality sign when multiplying/dividing by negative
export const flipSign = (sign: InequalitySign): InequalitySign => {
  switch (sign) {
    case '<': return '>';
    case '<=': return '>=';
    case '>': return '<';
    case '>=': return '<=';
  }
};

// Format inequality as string
export const formatInequality = (inq: Inequality): string => {
  const { a, b, c, sign, type } = inq;
  
  let leftSide = '';
  
  if (type === 'linear') {
    if (Math.abs(a) > 1e-10) {
      leftSide += a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
    }
    if (Math.abs(b) > 1e-10) {
      if (leftSide && b > 0) leftSide += ' + ';
      if (leftSide && b < 0) leftSide += ' - ';
      leftSide += Math.abs(b);
    }
  } else {
    // Quadratic
    if (Math.abs(a) > 1e-10) {
      leftSide += a === 1 ? 'x²' : a === -1 ? '-x²' : `${a}x²`;
    }
    if (Math.abs(b) > 1e-10) {
      if (leftSide && b > 0) leftSide += ' + ';
      if (leftSide && b < 0) leftSide += ' - ';
      leftSide += Math.abs(b) === 1 ? 'x' : `${Math.abs(b)}x`;
    }
    if (Math.abs(c) > 1e-10) {
      if (leftSide && c > 0) leftSide += ' + ';
      if (leftSide && c < 0) leftSide += ' - ';
      leftSide += Math.abs(c);
    }
  }
  
  if (!leftSide) leftSide = '0';
  
  const signStr = sign === '<=' ? '≤' : sign === '>=' ? '≥' : sign;
  return `${leftSide} ${signStr} 0`;
};

// Format inequality as LaTeX (handles ≤/≥ and x²)
export const formatInequalityLatex = (inq: Inequality): string => {
  const { a, b, c, sign, type } = inq;

  let leftSide = '';

  if (type === 'linear') {
    if (Math.abs(a) > 1e-10) {
      leftSide += a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`;
    }
    if (Math.abs(b) > 1e-10) {
      if (leftSide && b > 0) leftSide += ' + ';
      if (leftSide && b < 0) leftSide += ' - ';
      leftSide += Math.abs(b);
    }
  } else {
    if (Math.abs(a) > 1e-10) {
      leftSide += a === 1 ? 'x^{2}' : a === -1 ? '-x^{2}' : `${a}x^{2}`;
    }
    if (Math.abs(b) > 1e-10) {
      if (leftSide && b > 0) leftSide += ' + ';
      if (leftSide && b < 0) leftSide += ' - ';
      leftSide += Math.abs(b) === 1 ? 'x' : `${Math.abs(b)}x`;
    }
    if (Math.abs(c) > 1e-10) {
      if (leftSide && c > 0) leftSide += ' + ';
      if (leftSide && c < 0) leftSide += ' - ';
      leftSide += Math.abs(c);
    }
  }

  if (!leftSide) leftSide = '0';

  const signStr =
    sign === '<=' ? '\\leq' :
    sign === '>=' ? '\\geq' :
    sign;

  return `${leftSide} ${signStr} 0`;
};

// Generate number line data for visualization
export const generateNumberLineData = (
  solution: InequalitySolution,
  range: [number, number] = [-10, 10]
) => {
  const points = [];
  const step = 0.1;
  
  for (let x = range[0]; x <= range[1]; x += step) {
    // Check if x is in solution set
    const inSolution = solution.intervals.some(interval => {
      const afterStart = interval.inclusive[0] ? x >= interval.start : x > interval.start;
      const beforeEnd = interval.inclusive[1] ? x <= interval.end : x < interval.end;
      return afterStart && beforeEnd;
    });
    
    points.push({ x, inSolution });
  }
  
  return points;
};

// Educational templates
export const INEQUALITY_TEMPLATES = [
  {
    name: "Simple Linear",
    inequality: { id: '1', type: 'linear' as const, a: 2, b: -6, c: 0, sign: '<' as const }
  },
  {
    name: "Negative Coefficient",
    inequality: { id: '1', type: 'linear' as const, a: -3, b: 9, c: 0, sign: '<=' as const }
  },
  {
    name: "Quadratic (Two Roots)",
    inequality: { id: '1', type: 'quadratic' as const, a: 1, b: -5, c: 6, sign: '>' as const }
  },
  {
    name: "Quadratic (No Real Roots)",
    inequality: { id: '1', type: 'quadratic' as const, a: 1, b: 2, c: 5, sign: '<' as const }
  },
  {
    name: "Quadratic (One Root)",
    inequality: { id: '1', type: 'quadratic' as const, a: 1, b: -4, c: 4, sign: '>=' as const }
  }
];
