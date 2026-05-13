// Equation string parser for Algebraic Flow
// Parses expressions like "2x + 5 = 15" or "x^2 - 4 = 0"

const generateId = () => Math.random().toString(36).substr(2, 9);

// Inline type matching Term — avoids circular import
export interface ParsedTerm {
  id: string;
  type: 'variable' | 'constant';
  value: number;
  variable?: string;
  exponent?: number;
}

export interface ParsedEquation {
  left: ParsedTerm[];
  right: ParsedTerm[];
}

/**
 * Parse one side of an equation into an array of terms.
 * Returns null if the expression cannot be parsed.
 */
function parseSide(expr: string): ParsedTerm[] | null {
  // Normalize: strip spaces, convert Unicode superscripts
  let s = expr
    .replace(/\s+/g, '')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/⁴/g, '^4')
    .replace(/⁵/g, '^5');

  if (!s) return [];

  // Add leading + if not already signed
  if (s[0] !== '+' && s[0] !== '-') s = '+' + s;

  // Each term: [+-] optional-coefficient optional-variable optional-^exponent
  const termRegex = /([+-])(\d*\.?\d*)([a-zA-Z]?)(?:\^(\d+))?/g;
  const terms: ParsedTerm[] = [];
  let consumed = 0;

  let match: RegExpExecArray | null;
  while ((match = termRegex.exec(s)) !== null) {
    // Detect unparseable gap between last match and this one
    if (match.index !== consumed) return null;

    consumed = match.index + match[0].length;

    const sign = match[1] === '-' ? -1 : 1;
    const coeffStr = match[2];
    const varStr = match[3];
    const expStr = match[4];

    // Skip entirely empty matches (e.g. lone sign chars)
    if (!coeffStr && !varStr) continue;

    if (varStr) {
      const coeff = coeffStr ? parseFloat(coeffStr) : 1;
      if (isNaN(coeff)) return null;
      const exponent = expStr ? parseInt(expStr, 10) : 1;
      terms.push({
        id: generateId(),
        type: 'variable',
        value: sign * coeff,
        variable: varStr,
        exponent,
      });
    } else if (coeffStr) {
      const val = parseFloat(coeffStr);
      if (isNaN(val)) return null;
      terms.push({
        id: generateId(),
        type: 'constant',
        value: sign * val,
      });
    }
  }

  // If we didn't consume the whole string, it contains unparseable characters
  if (consumed < s.length) return null;

  return terms.length > 0
    ? terms
    : [{ id: generateId(), type: 'constant', value: 0 }];
}

/**
 * Parse a full equation string into left and right term arrays.
 * Returns null if the string is not a valid equation.
 *
 * Supports:
 *   "2x + 5 = 15"    → linear
 *   "x^2 - 4 = 0"    → quadratic
 *   "3x - 2y = 7"    → multi-variable
 *   "-x + 3 = -2"    → negative coefficients
 *   "x = 5"          → already isolated
 */
export function parseEquationString(input: string): ParsedEquation | null {
  const eqParts = input.split('=');
  if (eqParts.length !== 2) return null;

  const leftStr = eqParts[0].trim();
  const rightStr = eqParts[1].trim();
  if (!leftStr && !rightStr) return null;

  const left = parseSide(leftStr);
  const right = parseSide(rightStr);

  if (!left || !right) return null;

  return {
    left: left.length > 0 ? left : [{ id: generateId(), type: 'constant', value: 0 }],
    right: right.length > 0 ? right : [{ id: generateId(), type: 'constant', value: 0 }],
  };
}
