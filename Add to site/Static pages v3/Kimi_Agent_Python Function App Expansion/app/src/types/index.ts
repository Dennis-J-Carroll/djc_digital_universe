export interface Parameter {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description: string;
}

export interface CodeExample {
  title: string;
  code: string;
  output?: string;
  explanation?: string;
}

export interface PythonFunction {
  id: string;
  name: string;
  module: string;
  category: string;
  library: 'stdlib' | 'third-party';
  package?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  longDescription?: string;
  signature: string;
  parameters?: Parameter[];
  returns?: string;
  example: string;
  examples?: CodeExample[];
  output?: string;
  useCases: string[];
  commonMistakes?: string[];
  relatedFunctions?: string[];
  tags: string[];
  date?: string;
  videoUrl?: string;
  interactive?: boolean;
}

export interface UserProgress {
  viewedFunctions: string[];
  completedFunctions: string[];
  favoriteFunctions: string[];
  lastVisited: string;
  streak: number;
  totalTimeSpent: number;
  notes: Record<string, string>;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  emoji: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  functions: string[];  // Function IDs
  estimatedHours: number;
  color: string;
}

export interface Category {
  id: string;
  label: string;
  library: 'stdlib' | 'third-party';
  package?: string;
  color: string;
}

export interface Library {
  id: string;
  name: string;
  description: string;
  emoji: string;
  installCommand: string;
  color: string;
}
