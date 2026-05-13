
export type TermType = 'variable' | 'constant';

export interface Term {
  id: string;
  type: TermType;
  value: number; // Coefficient for variables, value for constants
  variable?: string; // 'x', 'y', etc.
  exponent?: number;
}

export interface EquationState {
  left: Term[];
  right: Term[];
}

export interface HistoryStep {
  state: EquationState;
  action: string;
}

export interface ClayNode {
  id: string;
  value: number;
  type: 'base' | 'power' | 'factor'; // power means like 8^2 (display as value but visual hint), factor means part of product
  display?: string; // Custom display string like "8²"
  x?: number;
  y?: number;
}
