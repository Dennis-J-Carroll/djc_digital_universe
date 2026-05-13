// Quadratic equation analysis utilities

export interface QuadraticCoefficients {
  a: number;
  b: number;
  c: number;
}

export interface DiscriminantAnalysis {
  value: number;
  type: 'two-real' | 'one-real' | 'complex';
  color: string;
  description: string;
  geometricMeaning: string;
}

export interface QuadraticRoots {
  root1: { real: number; imag?: number };
  root2: { real: number; imag?: number };
}

export interface Vertex {
  x: number;
  y: number;
}

export interface CompletingTheSquareStep {
  step: number;
  description: string;
  expression: string;
  latex: string;
}

// Extract coefficients from terms
export const extractQuadraticCoefficients = (terms: { type: string; value: number; variable?: string; exponent?: number }[]): QuadraticCoefficients => {
  let a = 0, b = 0, c = 0;
  
  terms.forEach(term => {
    if (term.type === 'variable') {
      if (term.variable === 'x') {
        if (term.exponent === 2) {
          a = term.value;
        } else if (!term.exponent || term.exponent === 1) {
          b = term.value;
        }
      }
    } else if (term.type === 'constant') {
      c += term.value;
    }
  });
  
  return { a, b, c };
};

// Calculate discriminant and its analysis
export const analyzeDiscriminant = (a: number, b: number, c: number): DiscriminantAnalysis => {
  const discriminant = b * b - 4 * a * c;
  
  if (discriminant > 0) {
    return {
      value: discriminant,
      type: 'two-real',
      color: '#10b981', // emerald-500
      description: 'Two distinct real roots',
      geometricMeaning: 'The parabola crosses the x-axis at two distinct points.'
    };
  } else if (discriminant === 0) {
    return {
      value: 0,
      type: 'one-real',
      color: '#f59e0b', // amber-500
      description: 'One repeated real root',
      geometricMeaning: 'The parabola touches the x-axis at exactly one point (the vertex).'
    };
  } else {
    return {
      value: discriminant,
      type: 'complex',
      color: '#f43f5e', // rose-500
      description: 'Two complex conjugate roots',
      geometricMeaning: 'The parabola does not intersect the x-axis; roots exist in the complex plane.'
    };
  }
};

// Calculate roots
export const calculateRoots = (a: number, b: number, c: number): QuadraticRoots => {
  const discriminant = b * b - 4 * a * c;
  
  if (discriminant >= 0) {
    const sqrtD = Math.sqrt(discriminant);
    return {
      root1: { real: (-b + sqrtD) / (2 * a) },
      root2: { real: (-b - sqrtD) / (2 * a) }
    };
  } else {
    const realPart = -b / (2 * a);
    const imagPart = Math.sqrt(-discriminant) / (2 * a);
    return {
      root1: { real: realPart, imag: imagPart },
      root2: { real: realPart, imag: -imagPart }
    };
  }
};

// Calculate vertex
export const calculateVertex = (a: number, b: number, c: number): Vertex => {
  const x = -b / (2 * a);
  const y = a * x * x + b * x + c;
  return { x, y };
};

// Generate completing the square steps
export const generateCompletingSquareSteps = (a: number, b: number, c: number): CompletingTheSquareStep[] => {
  const steps: CompletingTheSquareStep[] = [];
  
  // Step 1: Original equation
  steps.push({
    step: 1,
    description: 'Start with the quadratic equation',
    expression: `${a}x² + ${b}x + ${c} = 0`,
    latex: `${a}x^2 + ${b}x + ${c} = 0`
  });
  
  // Step 2: Move constant to right
  steps.push({
    step: 2,
    description: 'Move constant term to the right side',
    expression: `${a}x² + ${b}x = ${-c}`,
    latex: `${a}x^2 + ${b}x = ${-c}`
  });
  
  // Step 3: Divide by a if a ≠ 1
  if (a !== 1) {
    const newB = b / a;
    const newC = -c / a;
    steps.push({
      step: 3,
      description: `Divide by ${a} to make the coefficient of x² equal to 1`,
      expression: `x² + ${newB.toFixed(2)}x = ${newC.toFixed(2)}`,
      latex: `x^2 + ${newB}x = ${newC}`
    });
  }
  
  // Step 4: Calculate value to complete the square
  const halfB = b / (2 * a);
  const squareValue = halfB * halfB;
  steps.push({
    step: steps.length + 1,
    description: `Take half of the x-coefficient (${(b/a).toFixed(2)}/2 = ${halfB.toFixed(2)}) and square it (${squareValue.toFixed(2)})`,
    expression: `Add ${squareValue.toFixed(2)} to both sides`,
    latex: `x^2 + ${(b/a)}x + ${squareValue} = ${(-c/a).toFixed(2)} + ${squareValue}`
  });
  
  // Step 5: Write as perfect square
  const rightSide = (-c / a) + squareValue;
  steps.push({
    step: steps.length + 1,
    description: 'Write left side as a perfect square',
    expression: `(x + ${halfB.toFixed(2)})² = ${rightSide.toFixed(2)}`,
    latex: `(x + ${halfB})^2 = ${rightSide.toFixed(4)}`
  });
  
  // Step 6: Take square root
  if (rightSide >= 0) {
    const sqrtRight = Math.sqrt(rightSide);
    steps.push({
      step: steps.length + 1,
      description: 'Take the square root of both sides',
      expression: `x + ${halfB.toFixed(2)} = ±${sqrtRight.toFixed(2)}`,
      latex: `x + ${halfB} = \\pm ${sqrtRight.toFixed(4)}`
    });
    
    // Step 7: Solve for x
    const root1 = -halfB + sqrtRight;
    const root2 = -halfB - sqrtRight;
    steps.push({
      step: steps.length + 1,
      description: 'Solve for x',
      expression: `x = ${root1.toFixed(2)} or x = ${root2.toFixed(2)}`,
      latex: `x = ${root1.toFixed(4)} \\text{ or } x = ${root2.toFixed(4)}`
    });
  } else {
    const sqrtRight = Math.sqrt(-rightSide);
    steps.push({
      step: steps.length + 1,
      description: 'Take the square root of both sides (complex)',
      expression: `x + ${halfB.toFixed(2)} = ±${sqrtRight.toFixed(2)}i`,
      latex: `x + ${halfB} = \\pm ${sqrtRight.toFixed(4)}i`
    });
    
    const realPart = -halfB;
    steps.push({
      step: steps.length + 1,
      description: 'Solve for x (complex roots)',
      expression: `x = ${realPart.toFixed(2)} ± ${sqrtRight.toFixed(2)}i`,
      latex: `x = ${realPart.toFixed(4)} \\pm ${sqrtRight.toFixed(4)}i`
    });
  }
  
  return steps;
};

// Generate parabola data for graphing
export const generateParabolaData = (a: number, b: number, c: number, range: number = 10) => {
  const data = [];
  const vertex = calculateVertex(a, b, c);
  
  // Generate points around vertex
  const start = Math.floor(vertex.x - range);
  const end = Math.ceil(vertex.x + range);
  
  for (let x = start; x <= end; x += 0.5) {
    const y = a * x * x + b * x + c;
    data.push({ x, y });
  }
  
  return data;
};

// Check if an equation is quadratic
export const isQuadratic = (terms: { type: string; value: number; variable?: string; exponent?: number }[]): boolean => {
  return terms.some(t => t.type === 'variable' && t.variable === 'x' && t.exponent === 2);
};
