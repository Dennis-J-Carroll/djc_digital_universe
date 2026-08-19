// Proof Log System for Algebraic Flow
// Records each transformation as a formal proof step

import { EquationState, Term } from '../components/InteractiveEquation';

export interface ProofStep {
  id: string;
  stepNumber: number;
  equation: EquationState;
  leftExpression: string;
  rightExpression: string;
  justification: string;
  axiomId: string;
  description: string;
  timestamp: number;
}

export class ProofLog {
  private steps: ProofStep[] = [];
  private stepCounter = 0;

  addStep(
    equation: EquationState,
    axiomId: string,
    justification: string,
    description: string,
    useFormal: boolean = false
  ): ProofStep {
    this.stepCounter++;
    
    const step: ProofStep = {
      id: `step-${Date.now()}-${this.stepCounter}`,
      stepNumber: this.stepCounter,
      equation: JSON.parse(JSON.stringify(equation)),
      leftExpression: this.formatSide(equation.left),
      rightExpression: this.formatSide(equation.right),
      justification,
      axiomId,
      description,
      timestamp: Date.now()
    };

    this.steps.push(step);
    return step;
  }

  getSteps(): ProofStep[] {
    return [...this.steps];
  }

  getLastStep(): ProofStep | undefined {
    return this.steps[this.steps.length - 1];
  }

  undo(): ProofStep | undefined {
    if (this.steps.length > 0) {
      this.steps.pop();
      this.stepCounter--;
      return this.getLastStep();
    }
    return undefined;
  }

  clear(): void {
    this.steps = [];
    this.stepCounter = 0;
  }

  exportAsLatex(): string {
    let latex = '\\begin{align*}\n';
    
    this.steps.forEach((step, index) => {
      const left = this.toLatexExpression(step.equation.left);
      const right = this.toLatexExpression(step.equation.right);
      latex += `  ${left} &= ${right} && \\text{${step.justification}}`;
      if (index < this.steps.length - 1) {
        latex += ' \\\\\n';
      } else {
        latex += '\n';
      }
    });
    
    latex += '\\end{align*}';
    return latex;
  }

  exportAsTwoColumn(): string {
    let text = 'TWO-COLUMN PROOF\n';
    text += '='.repeat(60) + '\n\n';
    text += `Step | Equation | Justification\n`;
    text += '-'.repeat(60) + '\n';
    
    this.steps.forEach(step => {
      const eq = `${step.leftExpression} = ${step.rightExpression}`;
      text += `${step.stepNumber.toString().padStart(4)} | ${eq.padEnd(30)} | ${step.justification}\n`;
    });
    
    return text;
  }

  private formatSide(terms: Term[]): string {
    if (terms.length === 0) return '0';
    
    return terms.map((term, index) => {
      const isFirst = index === 0;
      const val = Math.abs(term.value);
      const sign = term.value >= 0 ? (isFirst ? '' : '+ ') : '- ';
      
      if (term.type === 'constant') {
        return `${sign}${val}`;
      } else {
        const expStr = term.exponent && term.exponent !== 1 ? `^${term.exponent}` : '';
        if (val === 1) return `${sign}${term.variable}${expStr}`;
        return `${sign}${val}${term.variable}${expStr}`;
      }
    }).join(' ');
  }

  private toLatexExpression(terms: Term[]): string {
    if (terms.length === 0) return '0';
    
    return terms.map((term, index) => {
      const isFirst = index === 0;
      const val = Math.abs(term.value);
      const sign = term.value >= 0 ? (isFirst ? '' : ' + ') : ' - ';
      
      if (term.type === 'constant') {
        return `${sign}${val}`;
      } else {
        const expStr = term.exponent && term.exponent !== 1 ? `^{${term.exponent}}` : '';
        if (val === 1) return `${sign}${term.variable}${expStr}`;
        return `${sign}${val}${term.variable}${expStr}`;
      }
    }).join('');
  }
}

// Helper to format terms for display
export const formatTermsToString = (terms: Term[]): string => {
  if (terms.length === 0) return '0';
  
  return terms.map((term, index) => {
    const isFirst = index === 0;
    const val = Math.abs(term.value);
    const sign = term.value >= 0 ? (isFirst ? '' : '+ ') : '- ';
    
    if (term.type === 'constant') {
      return `${sign}${val}`;
    } else {
      const expStr = term.exponent && term.exponent !== 1 ? `^${term.exponent}` : '';
      if (val === 1) return `${sign}${term.variable}${expStr}`;
      return `${sign}${val}${term.variable}${expStr}`;
    }
  }).join(' ');
};

// Generate justification text based on action
export const generateJustification = (
  action: 'move' | 'combine' | 'divide' | 'simplify',
  details: string,
  useFormal: boolean
): { axiomId: string; text: string } => {
  switch (action) {
    case 'move':
      return {
        axiomId: 'additive_inverse',
        text: useFormal 
          ? 'Additive Inverse Property of Equality'
          : `Moved ${details} to other side`
      };
    case 'combine':
      return {
        axiomId: 'distributive',
        text: useFormal
          ? 'Distributive Property (combining like terms)'
          : `Combined like terms: ${details}`
      };
    case 'divide':
      return {
        axiomId: 'division_equality',
        text: useFormal
          ? 'Division Property of Equality'
          : `Divided both sides by ${details}`
      };
    case 'simplify':
      return {
        axiomId: 'multiplicative_identity',
        text: useFormal
          ? 'Simplification (Multiplicative Identity)'
          : `Simplified: ${details}`
      };
    default:
      return {
        axiomId: 'reflexive',
        text: useFormal ? 'Given' : 'Starting equation'
      };
  }
};
