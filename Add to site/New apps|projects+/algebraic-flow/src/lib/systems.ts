// Systems of equations utilities

export interface LinearEquation {
  id: string;
  a: number; // coefficient of x
  b: number; // coefficient of y
  c: number; // constant (right side)
}

export interface SystemSolution {
  type: 'unique' | 'infinite' | 'none';
  x?: number;
  y?: number;
  message: string;
  geometricInterpretation: string;
}

export interface IntersectionPoint {
  x: number;
  y: number;
}

// Solve a system of two linear equations
// eq1: a1*x + b1*y = c1
// eq2: a2*x + b2*y = c2
export const solveSystem = (eq1: LinearEquation, eq2: LinearEquation): SystemSolution => {
  const { a: a1, b: b1, c: c1 } = eq1;
  const { a: a2, b: b2, c: c2 } = eq2;
  
  // Calculate determinant
  const det = a1 * b2 - a2 * b1;
  
  if (Math.abs(det) > 1e-10) {
    // Unique solution
    const x = (c1 * b2 - c2 * b1) / det;
    const y = (a1 * c2 - a2 * c1) / det;
    
    return {
      type: 'unique',
      x,
      y,
      message: `Unique solution: (${x.toFixed(3)}, ${y.toFixed(3)})`,
      geometricInterpretation: 'The two lines intersect at a single point.'
    };
  } else {
    // Check if equations are dependent or inconsistent
    // Check if one is a multiple of the other
    const ratioA = a1 / a2;
    const ratioB = b1 / b2;
    const ratioC = c1 / c2;
    
    if (Math.abs(ratioA - ratioB) < 1e-10 && Math.abs(ratioA - ratioC) < 1e-10) {
      return {
        type: 'infinite',
        message: 'Infinitely many solutions',
        geometricInterpretation: 'The two equations represent the same line (dependent system).'
      };
    } else if (Math.abs(ratioA - ratioB) < 1e-10 && Math.abs(ratioA - ratioC) >= 1e-10) {
      return {
        type: 'none',
        message: 'No solution',
        geometricInterpretation: 'The lines are parallel and never intersect (inconsistent system).'
      };
    } else {
      return {
        type: 'none',
        message: 'No unique solution',
        geometricInterpretation: 'The system has no unique solution.'
      };
    }
  }
};

// Generate line data for graphing
export const generateLineData = (
  eq: LinearEquation, 
  xRange: [number, number] = [-10, 10]
): { x: number; y: number }[] => {
  const { a, b, c } = eq;
  const points = [];
  
  // If b is 0, line is vertical: x = c/a
  if (Math.abs(b) < 1e-10) {
    const x = c / a;
    for (let y = xRange[0]; y <= xRange[1]; y += 0.5) {
      points.push({ x, y });
    }
  } else {
    // y = (c - a*x) / b
    for (let x = xRange[0]; x <= xRange[1]; x += 0.5) {
      const y = (c - a * x) / b;
      points.push({ x, y });
    }
  }
  
  return points;
};

// Calculate appropriate range for viewing
export const calculateViewRange = (
  eq1: LinearEquation, 
  eq2: LinearEquation,
  solution?: SystemSolution
): { x: [number, number]; y: [number, number] } => {
  const solutionPoint = solution?.type === 'unique' 
    ? { x: solution.x!, y: solution.y! }
    : null;
  
  // Collect all interesting points
  const points: { x: number; y: number }[] = [];
  
  if (solutionPoint) {
    points.push(solutionPoint);
  }
  
  // Add intercepts
  [eq1, eq2].forEach(eq => {
    // x-intercept: y = 0
    if (Math.abs(eq.a) > 1e-10) {
      points.push({ x: eq.c / eq.a, y: 0 });
    }
    // y-intercept: x = 0
    if (Math.abs(eq.b) > 1e-10) {
      points.push({ x: 0, y: eq.c / eq.b });
    }
  });
  
  if (points.length === 0) {
    return { x: [-10, 10], y: [-10, 10] };
  }
  
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  // Add padding
  const padding = Math.max(maxX - minX, maxY - minY, 4) * 0.3;
  
  return {
    x: [Math.floor(minX - padding), Math.ceil(maxX + padding)],
    y: [Math.floor(minY - padding), Math.ceil(maxY + padding)]
  };
};

// Format equation as string
export const formatEquation = (eq: LinearEquation): string => {
  const { a, b, c } = eq;
  let str = '';
  
  // x term
  if (Math.abs(a) > 1e-10) {
    if (Math.abs(a - 1) < 1e-10) {
      str += 'x';
    } else if (Math.abs(a + 1) < 1e-10) {
      str += '-x';
    } else {
      str += `${a}x`;
    }
  }
  
  // y term
  if (Math.abs(b) > 1e-10) {
    if (str && b > 0) str += ' + ';
    if (str && b < 0) str += ' - ';
    
    const absB = Math.abs(b);
    if (Math.abs(absB - 1) < 1e-10) {
      str += 'y';
    } else {
      str += `${absB}y`;
    }
  }
  
  if (!str) str = '0';
  
  return `${str} = ${c}`;
};

// Check if system is valid (not degenerate)
export const isValidSystem = (eq1: LinearEquation, eq2: LinearEquation): boolean => {
  // At least one equation should have a non-zero coefficient
  const eq1Valid = Math.abs(eq1.a) > 1e-10 || Math.abs(eq1.b) > 1e-10;
  const eq2Valid = Math.abs(eq2.a) > 1e-10 || Math.abs(eq2.b) > 1e-10;
  return eq1Valid && eq2Valid;
};

// Educational templates
export const SYSTEM_TEMPLATES = [
  {
    name: "Intersecting Lines",
    eq1: { id: '1', a: 1, b: 1, c: 5 },
    eq2: { id: '2', a: 2, b: -1, c: 3 }
  },
  {
    name: "Parallel Lines",
    eq1: { id: '1', a: 1, b: 2, c: 4 },
    eq2: { id: '2', a: 1, b: 2, c: 8 }
  },
  {
    name: "Same Line",
    eq1: { id: '1', a: 2, b: 3, c: 6 },
    eq2: { id: '2', a: 4, b: 6, c: 12 }
  },
  {
    name: "Vertical & Horizontal",
    eq1: { id: '1', a: 1, b: 0, c: 3 },
    eq2: { id: '2', a: 0, b: 1, c: 2 }
  }
];
