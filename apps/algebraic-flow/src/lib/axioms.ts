// Field Axioms and Equality Properties for Algebraic Flow

export interface Axiom {
  id: string;
  title: string;
  formula: string;
  latex: string;
  formalName: string;
  intuitiveName: string;
  description: string;
  category: 'field' | 'equality' | 'operation';
}

export const AXIOMS: Axiom[] = [
  // Field Axioms
  {
    id: 'additive_inverse',
    title: 'Additive Inverse Property',
    formula: 'a + (-a) = 0',
    latex: 'a + (-a) = 0',
    formalName: 'Additive Inverse Axiom',
    intuitiveName: 'Flip the Sign',
    description: 'Moving a term across equality inverts its sign. This is equivalent to adding the inverse to both sides.',
    category: 'field'
  },
  {
    id: 'multiplicative_inverse',
    title: 'Multiplicative Inverse Property',
    formula: 'a × (1/a) = 1',
    latex: 'a \\times \\dfrac{1}{a} = 1',
    formalName: 'Multiplicative Inverse Axiom',
    intuitiveName: 'Divide Both Sides',
    description: 'Dividing both sides by a coefficient is equivalent to multiplying by its reciprocal.',
    category: 'field'
  },
  {
    id: 'distributive',
    title: 'Distributive Property',
    formula: 'a(b + c) = ab + ac',
    latex: 'a(b + c) = ab + ac',
    formalName: 'Distributive Property',
    intuitiveName: 'Combine Like Terms',
    description: 'Combining like terms allows us to add their coefficients while keeping the variable part.',
    category: 'field'
  },
  {
    id: 'commutative_addition',
    title: 'Commutative Property (Addition)',
    formula: 'a + b = b + a',
    latex: 'a + b = b + a',
    formalName: 'Commutative Axiom of Addition',
    intuitiveName: 'Reorder Terms',
    description: 'The order of terms in addition does not affect the sum.',
    category: 'field'
  },
  {
    id: 'commutative_multiplication',
    title: 'Commutative Property (Multiplication)',
    formula: 'a × b = b × a',
    latex: 'a \\times b = b \\times a',
    formalName: 'Commutative Axiom of Multiplication',
    intuitiveName: 'Reorder Factors',
    description: 'The order of factors in multiplication does not affect the product.',
    category: 'field'
  },
  {
    id: 'associative_addition',
    title: 'Associative Property (Addition)',
    formula: '(a + b) + c = a + (b + c)',
    latex: '(a + b) + c = a + (b + c)',
    formalName: 'Associative Axiom of Addition',
    intuitiveName: 'Regroup Terms',
    description: 'Grouping of terms in addition does not affect the sum.',
    category: 'field'
  },
  {
    id: 'associative_multiplication',
    title: 'Associative Property (Multiplication)',
    formula: '(a × b) × c = a × (b × c)',
    latex: '(a \\times b) \\times c = a \\times (b \\times c)',
    formalName: 'Associative Axiom of Multiplication',
    intuitiveName: 'Regroup Factors',
    description: 'Grouping of factors in multiplication does not affect the product.',
    category: 'field'
  },
  {
    id: 'additive_identity',
    title: 'Additive Identity',
    formula: 'a + 0 = a',
    latex: 'a + 0 = a',
    formalName: 'Additive Identity Axiom',
    intuitiveName: 'Add Zero',
    description: 'Adding zero to any number leaves it unchanged.',
    category: 'field'
  },
  {
    id: 'multiplicative_identity',
    title: 'Multiplicative Identity',
    formula: 'a × 1 = a',
    latex: 'a \\times 1 = a',
    formalName: 'Multiplicative Identity Axiom',
    intuitiveName: 'Multiply by One',
    description: 'Multiplying any number by one leaves it unchanged.',
    category: 'field'
  },
  {
    id: 'zero_product',
    title: 'Zero Product Property',
    formula: 'ab = 0 → a = 0 or b = 0',
    latex: 'ab = 0 \\Rightarrow a = 0 \\text{ or } b = 0',
    formalName: 'Zero Product Property',
    intuitiveName: 'Split by Zero',
    description: 'If a product equals zero, at least one factor must be zero.',
    category: 'field'
  },

  // Equality Properties
  {
    id: 'reflexive',
    title: 'Reflexive Property',
    formula: 'a = a',
    latex: 'a = a',
    formalName: 'Reflexive Property of Equality',
    intuitiveName: 'Self-Equality',
    description: 'Any quantity equals itself.',
    category: 'equality'
  },
  {
    id: 'symmetric',
    title: 'Symmetric Property',
    formula: 'a = b → b = a',
    latex: 'a = b \\Rightarrow b = a',
    formalName: 'Symmetric Property of Equality',
    intuitiveName: 'Flip the Equation',
    description: 'If a equals b, then b equals a.',
    category: 'equality'
  },
  {
    id: 'transitive',
    title: 'Transitive Property',
    formula: 'a = b and b = c → a = c',
    latex: 'a = b \\text{ and } b = c \\Rightarrow a = c',
    formalName: 'Transitive Property of Equality',
    intuitiveName: 'Chain Equalities',
    description: 'If a equals b and b equals c, then a equals c.',
    category: 'equality'
  },
  {
    id: 'addition_equality',
    title: 'Addition Property of Equality',
    formula: 'a = b → a + c = b + c',
    latex: 'a = b \\Rightarrow a + c = b + c',
    formalName: 'Addition Property of Equality',
    intuitiveName: 'Add to Both Sides',
    description: 'Adding the same quantity to both sides preserves equality.',
    category: 'equality'
  },
  {
    id: 'subtraction_equality',
    title: 'Subtraction Property of Equality',
    formula: 'a = b → a - c = b - c',
    latex: 'a = b \\Rightarrow a - c = b - c',
    formalName: 'Subtraction Property of Equality',
    intuitiveName: 'Subtract from Both Sides',
    description: 'Subtracting the same quantity from both sides preserves equality.',
    category: 'equality'
  },
  {
    id: 'multiplication_equality',
    title: 'Multiplication Property of Equality',
    formula: 'a = b → a × c = b × c',
    latex: 'a = b \\Rightarrow a \\times c = b \\times c',
    formalName: 'Multiplication Property of Equality',
    intuitiveName: 'Multiply Both Sides',
    description: 'Multiplying both sides by the same quantity preserves equality.',
    category: 'equality'
  },
  {
    id: 'division_equality',
    title: 'Division Property of Equality',
    formula: 'a = b → a ÷ c = b ÷ c (c ≠ 0)',
    latex: 'a = b \\Rightarrow \\dfrac{a}{c} = \\dfrac{b}{c},\\ c \\neq 0',
    formalName: 'Division Property of Equality',
    intuitiveName: 'Divide Both Sides',
    description: 'Dividing both sides by the same non-zero quantity preserves equality.',
    category: 'equality'
  },

  // Operation Properties
  {
    id: 'squaring',
    title: 'Squaring Property',
    formula: 'a = b → a² = b²',
    latex: 'a = b \\Rightarrow a^2 = b^2',
    formalName: 'Squaring Property of Equality',
    intuitiveName: 'Square Both Sides',
    description: 'Squaring both sides preserves equality (may introduce extraneous solutions).',
    category: 'operation'
  },
  {
    id: 'square_root',
    title: 'Square Root Property',
    formula: 'a² = b → a = ±√b',
    latex: 'a^2 = b \\Rightarrow a = \\pm\\sqrt{b}',
    formalName: 'Square Root Property',
    intuitiveName: 'Take Square Root',
    description: 'Taking the square root yields both positive and negative solutions.',
    category: 'operation'
  }
];

export const getAxiomById = (id: string): Axiom | undefined => {
  return AXIOMS.find(a => a.id === id);
};

export const getAxiomsByCategory = (category: Axiom['category']): Axiom[] => {
  return AXIOMS.filter(a => a.category === category);
};
