export interface QuizQuestion {
  id: string;
  functionId: string;
  question: string;
  code?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'quiz-1',
    functionId: 'zip',
    question: 'What does zip() do when given lists of different lengths?',
    options: [
      'Raises an error',
      'Stops at the shortest list',
      'Fills missing values with None',
      'Extends to the longest list with zeros'
    ],
    correctAnswer: 1,
    explanation: 'zip() stops at the shortest iterable. This is called "zip shortest" behavior.',
    difficulty: 'easy',
  },
  {
    id: 'quiz-2',
    functionId: 'enumerate',
    question: 'What is the default starting index for enumerate()?',
    options: [
      '1',
      '-1',
      '0',
      'None'
    ],
    correctAnswer: 2,
    explanation: 'enumerate() starts at 0 by default. Use enumerate(iterable, start=1) to start at 1.',
    difficulty: 'easy',
  },
  {
    id: 'quiz-3',
    functionId: 'sorted',
    question: 'What does sorted([3, 1, 4, 1, 5], reverse=True) return?',
    options: [
      '[1, 1, 3, 4, 5]',
      '[5, 4, 3, 1, 1]',
      '[3, 1, 4, 1, 5]',
      'None'
    ],
    correctAnswer: 1,
    explanation: 'reverse=True sorts in descending order, so the result is [5, 4, 3, 1, 1].',
    difficulty: 'easy',
  },
  {
    id: 'quiz-4',
    functionId: 'str-split',
    question: 'What is the result of "a,b,c".split(",")?',
    options: [
      '["a,b,c"]',
      '["a", "b", "c"]',
      '"abc"',
      'Raises an error'
    ],
    correctAnswer: 1,
    explanation: 'split(",") splits the string at each comma, returning ["a", "b", "c"].',
    difficulty: 'easy',
  },
  {
    id: 'quiz-5',
    functionId: 'str-join',
    question: 'What does "-".join(["a", "b", "c"]) return?',
    options: [
      '"abc"',
      '"a-b-c"',
      '["a-b-c"]',
      'Raises an error'
    ],
    correctAnswer: 1,
    explanation: 'join() concatenates the list elements with "-" between them, giving "a-b-c".',
    difficulty: 'easy',
  },
  {
    id: 'quiz-6',
    functionId: 'len',
    question: 'What does len({"a": 1, "b": 2, "c": 3}) return?',
    options: [
      '6',
      '3',
      '1',
      'Raises an error'
    ],
    correctAnswer: 1,
    explanation: 'len() on a dictionary returns the number of key-value pairs, which is 3.',
    difficulty: 'easy',
  },
  {
    id: 'quiz-7',
    functionId: 'range',
    question: 'What is the result of list(range(2, 10, 2))?',
    options: [
      '[2, 4, 6, 8, 10]',
      '[2, 4, 6, 8]',
      '[0, 2, 4, 6, 8]',
      '[2, 4, 6, 8, 10, 12]'
    ],
    correctAnswer: 1,
    explanation: 'range(2, 10, 2) starts at 2, stops before 10, stepping by 2: [2, 4, 6, 8].',
    difficulty: 'easy',
  },
  {
    id: 'quiz-8',
    functionId: 'map',
    question: 'What is the result of list(map(lambda x: x*2, [1, 2, 3]))?',
    options: [
      '[1, 2, 3, 1, 2, 3]',
      '[2, 4, 6]',
      '[1, 4, 9]',
      'None'
    ],
    correctAnswer: 1,
    explanation: 'map() applies the lambda to each element, doubling them: [2, 4, 6].',
    difficulty: 'medium',
  },
  {
    id: 'quiz-9',
    functionId: 'filter',
    question: 'What does list(filter(lambda x: x > 0, [-1, 0, 1, 2])) return?',
    options: [
      '[-1, 0, 1, 2]',
      '[0, 1, 2]',
      '[1, 2]',
      '[-1]'
    ],
    correctAnswer: 2,
    explanation: 'filter() keeps only elements where the condition is True (x > 0), giving [1, 2].',
    difficulty: 'medium',
  },
  {
    id: 'quiz-10',
    functionId: 'any-all',
    question: 'What is the result of all([1, 2, 3, 0])?',
    options: [
      'True',
      'False',
      'None',
      'Raises an error'
    ],
    correctAnswer: 1,
    explanation: 'all() returns False if any element is falsy. 0 is falsy, so the result is False.',
    difficulty: 'medium',
  },
  {
    id: 'quiz-11',
    functionId: 'itertools-groupby',
    question: 'What is a key requirement for itertools.groupby() to work correctly?',
    options: [
      'Input must be sorted by the key',
      'All items must be unique',
      'Input must be a list',
      'Key function is required'
    ],
    correctAnswer: 0,
    explanation: 'groupby() only groups consecutive items. Sort first if you want all similar items grouped.',
    difficulty: 'hard',
  },
  {
    id: 'quiz-12',
    functionId: 'collections-defaultdict',
    question: 'What happens when you access a missing key in a defaultdict(list)?',
    options: [
      'Raises KeyError',
      'Returns None',
      'Creates an empty list',
      'Returns an empty string'
    ],
    correctAnswer: 2,
    explanation: 'defaultdict calls the factory function (list) to create a default value when a key is missing.',
    difficulty: 'medium',
  },
  {
    id: 'quiz-13',
    functionId: 'functools-lru-cache',
    question: 'What does @lru_cache do?',
    options: [
      'Logs function calls',
      'Caches function results',
      'Validates arguments',
      'Measures execution time'
    ],
    correctAnswer: 1,
    explanation: '@lru_cache memoizes function results, storing them to avoid recomputation.',
    difficulty: 'medium',
  },
  {
    id: 'quiz-14',
    functionId: 'datetime-timedelta',
    question: 'What is the result of (datetime(2024, 1, 15) - datetime(2024, 1, 10)).days?',
    options: [
      '5',
      '-5',
      '10',
      '15'
    ],
    correctAnswer: 0,
    explanation: 'Subtracting datetimes gives a timedelta. The difference is 5 days.',
    difficulty: 'medium',
  },
  {
    id: 'quiz-15',
    functionId: 'numpy-array',
    question: 'What is the shape of np.array([[1, 2], [3, 4], [5, 6]])?',
    options: [
      '(6,)',
      '(3, 2)',
      '(2, 3)',
      '(3, 3)'
    ],
    correctAnswer: 1,
    explanation: 'The array has 3 rows and 2 columns, so the shape is (3, 2).',
    difficulty: 'medium',
  },
  {
    id: 'quiz-16',
    functionId: 'pandas-dataframe',
    question: 'How do you select a single column from a DataFrame?',
    options: [
      'df.column_name',
      'df["column_name"]',
      'Both A and B',
      'df.get("column_name")'
    ],
    correctAnswer: 2,
    explanation: 'Both df.column_name and df["column_name"] work. Dot notation only works for valid Python identifiers.',
    difficulty: 'easy',
  },
  {
    id: 'quiz-17',
    functionId: 'str-strip',
    question: 'What does "  hello  ".strip() return?',
    options: [
      '"  hello  "',
      '"hello"',
      '"hello  "',
      '"  hello"'
    ],
    correctAnswer: 1,
    explanation: 'strip() removes whitespace from both ends, giving "hello".',
    difficulty: 'easy',
  },
  {
    id: 'quiz-18',
    functionId: 'random-sample',
    question: 'What is the difference between random.sample() and random.choices()?',
    options: [
      'No difference',
      'sample() without replacement, choices() with replacement',
      'sample() is faster',
      'choices() returns a dict'
    ],
    correctAnswer: 1,
    explanation: 'sample() picks unique items (no replacement), while choices() can pick the same item multiple times.',
    difficulty: 'medium',
  },
  {
    id: 'quiz-19',
    functionId: 'math-isclose',
    question: 'Why is math.isclose(0.1 + 0.2, 0.3) preferred over 0.1 + 0.2 == 0.3?',
    options: [
      'It is faster',
      'Floating-point precision issues',
      'It handles integers better',
      'It is shorter to type'
    ],
    correctAnswer: 1,
    explanation: 'Due to floating-point representation, 0.1 + 0.2 != 0.3 exactly. isclose() handles this.',
    difficulty: 'hard',
  },
  {
    id: 'quiz-20',
    functionId: 'numpy-mean',
    question: 'What does np.mean([[1, 2], [3, 4]], axis=0) return?',
    options: [
      '[2, 3]',
      '[1.5, 3.5]',
      '2.5',
      '[[1.5, 3.5]]'
    ],
    correctAnswer: 0,
    explanation: 'axis=0 means along rows, so it computes column means: [(1+3)/2, (2+4)/2] = [2, 3].',
    difficulty: 'hard',
  },
];

// Get quiz questions by difficulty
export function getQuizByDifficulty(difficulty: string): typeof quizQuestions {
  return quizQuestions.filter(q => q.difficulty === difficulty);
}

// Get random quiz questions
export function getRandomQuiz(count: number = 5): typeof quizQuestions {
  const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Get quiz by function ID
export function getQuizByFunction(functionId: string): typeof quizQuestions {
  return quizQuestions.filter(q => q.functionId === functionId);
}

// Calculate score
export function calculateScore(answers: Record<string, number>): { correct: number; total: number; percentage: number } {
  let correct = 0;
  const total = Object.keys(answers).length;
  
  for (const [questionId, answer] of Object.entries(answers)) {
    const question = quizQuestions.find(q => q.id === questionId);
    if (question && question.correctAnswer === answer) {
      correct++;
    }
  }
  
  return {
    correct,
    total,
    percentage: Math.round((correct / total) * 100),
  };
}
