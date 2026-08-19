// Complex number utilities and Argand diagram support

export interface ComplexNumber {
  real: number;
  imag: number;
}

export interface ArgandPoint {
  x: number; // real axis
  y: number; // imaginary axis
  label: string;
  color: string;
}

// Format complex number for display
export const formatComplex = (z: ComplexNumber, precision: number = 2): string => {
  const real = z.real.toFixed(precision);
  const imag = Math.abs(z.imag).toFixed(precision);
  
  if (z.imag === 0) return real;
  if (z.real === 0) return `${z.imag > 0 ? '' : '-'}${imag}i`;
  
  return `${real} ${z.imag > 0 ? '+' : '-'} ${imag}i`;
};

// Format complex number for LaTeX
export const formatComplexLatex = (z: ComplexNumber, precision: number = 2): string => {
  const real = z.real.toFixed(precision);
  const imag = Math.abs(z.imag).toFixed(precision);
  
  if (z.imag === 0) return real;
  if (z.real === 0) return `${z.imag > 0 ? '' : '-'}${imag}i`;
  
  return `${real} ${z.imag > 0 ? '+' : '-'} ${imag}i`;
};

// Calculate magnitude (modulus)
export const magnitude = (z: ComplexNumber): number => {
  return Math.sqrt(z.real * z.real + z.imag * z.imag);
};

// Calculate argument (angle in radians)
export const argument = (z: ComplexNumber): number => {
  return Math.atan2(z.imag, z.real);
};

// Calculate argument in degrees
export const argumentDegrees = (z: ComplexNumber): number => {
  return (argument(z) * 180) / Math.PI;
};

// Add two complex numbers
export const add = (z1: ComplexNumber, z2: ComplexNumber): ComplexNumber => {
  return {
    real: z1.real + z2.real,
    imag: z1.imag + z2.imag
  };
};

// Multiply two complex numbers
export const multiply = (z1: ComplexNumber, z2: ComplexNumber): ComplexNumber => {
  return {
    real: z1.real * z2.real - z1.imag * z2.imag,
    imag: z1.real * z2.imag + z1.imag * z2.real
  };
};

// Get complex conjugate
export const conjugate = (z: ComplexNumber): ComplexNumber => {
  return { real: z.real, imag: -z.imag };
};

// Generate data for Argand diagram
export const generateArgandData = (
  roots: ComplexNumber[],
  showUnitCircle: boolean = false,
  range: number = 5
) => {
  const points: ArgandPoint[] = roots.map((root, index) => ({
    x: root.real,
    y: root.imag,
    label: `z${index + 1} = ${formatComplex(root)}`,
    color: index === 0 ? '#06b6d4' : '#10b981' // cyan-500 and emerald-500
  }));
  
  // Generate unit circle points if requested
  const unitCircle: { x: number; y: number }[] = [];
  if (showUnitCircle) {
    for (let angle = 0; angle <= 2 * Math.PI; angle += 0.1) {
      unitCircle.push({
        x: Math.cos(angle),
        y: Math.sin(angle)
      });
    }
  }
  
  // Calculate appropriate range
  const maxMagnitude = Math.max(
    ...roots.map(r => magnitude(r)),
    showUnitCircle ? 1 : 0,
    2 // minimum range
  );
  
  const adjustedRange = Math.max(range, Math.ceil(maxMagnitude * 1.2));
  
  return {
    points,
    unitCircle,
    range: adjustedRange
  };
};

// Generate grid lines for Argand diagram
export const generateArgandGrid = (range: number) => {
  const gridLines = [];
  
  // Vertical lines (constant real)
  for (let x = -range; x <= range; x++) {
    gridLines.push({
      x1: x, y1: -range,
      x2: x, y2: range,
      isAxis: x === 0
    });
  }
  
  // Horizontal lines (constant imaginary)
  for (let y = -range; y <= range; y++) {
    gridLines.push({
      x1: -range, y1: y,
      x2: range, y2: y,
      isAxis: y === 0
    });
  }
  
  return gridLines;
};

// Check if two complex numbers are conjugates
export const areConjugates = (z1: ComplexNumber, z2: ComplexNumber): boolean => {
  return Math.abs(z1.real - z2.real) < 1e-10 && 
         Math.abs(z1.imag + z2.imag) < 1e-10 &&
         Math.abs(z1.imag) > 1e-10; // Not both real
};

// Convert quadratic roots to complex numbers
export const rootsToComplex = (
  root1: { real: number; imag?: number },
  root2: { real: number; imag?: number }
): [ComplexNumber, ComplexNumber] => {
  return [
    { real: root1.real, imag: root1.imag || 0 },
    { real: root2.real, imag: root2.imag || 0 }
  ];
};

// Educational explanation for complex roots
export const getComplexRootsExplanation = (): string => {
  return `When a quadratic equation has no real roots (discriminant < 0), 
the solutions exist in the complex number system. 

Complex roots always come in conjugate pairs (a + bi and a - bi), 
which are mirror images across the real axis in the Argand diagram.

This is guaranteed by the Fundamental Theorem of Algebra and 
the fact that polynomial coefficients are real numbers.`;
};
