export interface Challenge {
  id: string;
  functionId: string;
  title: string;
  description: string;
  starterCode: string;
  expectedOutput: string;
  hints: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

export const challenges: Challenge[] = [
  {
    id: 'challenge-1',
    functionId: 'zip',
    title: 'Pair Students with Scores',
    description: 'Use zip() to pair student names with their test scores, then print each student\'s result.',
    starterCode: `# Student names and their scores
names = ["Alice", "Bob", "Charlie"]
scores = [85, 92, 78]

# TODO: Use zip() to pair names with scores
# Then print: "Alice scored 85" etc.

`,
    expectedOutput: `Alice scored 85
Bob scored 92
Charlie scored 78`,
    hints: [
      'Use zip(names, scores) to pair the lists',
      'Use a for loop to iterate through the pairs',
      'Use f-strings for formatting: f"{name} scored {score}"'
    ],
    difficulty: 'easy',
    points: 10,
  },
  {
    id: 'challenge-2',
    functionId: 'enumerate',
    title: 'Numbered Todo List',
    description: 'Use enumerate() to print a numbered todo list starting from 1.',
    starterCode: `# Todo items
todos = ["Buy groceries", "Walk the dog", "Read a book", "Call mom"]

# TODO: Use enumerate() to print numbered items
# Expected: "1. Buy groceries" etc.

`,
    expectedOutput: `1. Buy groceries
2. Walk the dog
3. Read a book
4. Call mom`,
    hints: [
      'Use enumerate(todos, start=1) to start from 1',
      'Unpack the index and item in the for loop',
      'Print in the format: f"{index}. {item}"'
    ],
    difficulty: 'easy',
    points: 10,
  },
  {
    id: 'challenge-3',
    functionId: 'sorted',
    title: 'Sort Words by Length',
    description: 'Use sorted() with a key function to sort words by their length (shortest first).',
    starterCode: `# Words to sort
words = ["elephant", "cat", "butterfly", "ant", "hippopotamus"]

# TODO: Sort words by length using sorted()

`,
    expectedOutput: `['ant', 'cat', 'elephant', 'butterfly', 'hippopotamus']`,
    hints: [
      'Use key=len to sort by length',
      'sorted() returns a new list, so assign it to a variable',
      'Print the sorted list'
    ],
    difficulty: 'easy',
    points: 15,
  },
  {
    id: 'challenge-4',
    functionId: 'str-split',
    title: 'Parse CSV Line',
    description: 'Use split() to parse a CSV line and extract the name and age.',
    starterCode: `# CSV line
csv_line = "John Doe,30,Engineer,New York"

# TODO: Split the line and extract name and age
# Expected: Name: John Doe, Age: 30

`,
    expectedOutput: `Name: John Doe, Age: 30`,
    hints: [
      'Use split(",") to split by comma',
      'Unpack the result: name, age, job, city = csv_line.split(",")',
      'Print using f-string'
    ],
    difficulty: 'easy',
    points: 10,
  },
  {
    id: 'challenge-5',
    functionId: 'str-join',
    title: 'Create File Path',
    description: 'Use join() to create a file path from path components.',
    starterCode: `# Path components
parts = ["home", "user", "documents", "projects", "app.py"]

# TODO: Join parts with "/" to create a Unix path

`,
    expectedOutput: `home/user/documents/projects/app.py`,
    hints: [
      'Use "/".join(parts) to join with slashes',
      'You can also use os.path.join() in real code'
    ],
    difficulty: 'easy',
    points: 10,
  },
  {
    id: 'challenge-6',
    functionId: 'itertools-combinations',
    title: 'Generate Team Pairs',
    description: 'Use itertools.combinations to generate all possible pairs from a team of 4 people.',
    starterCode: `import itertools

# Team members
team = ["Alice", "Bob", "Charlie", "Diana"]

# TODO: Generate all pairs and print them

`,
    expectedOutput: `('Alice', 'Bob')
('Alice', 'Charlie')
('Alice', 'Diana')
('Bob', 'Charlie')
('Bob', 'Diana')
('Charlie', 'Diana')`,
    hints: [
      'Use itertools.combinations(team, 2)',
      'Convert to list or iterate directly',
      'Use a for loop to print each pair'
    ],
    difficulty: 'medium',
    points: 20,
  },
  {
    id: 'challenge-7',
    functionId: 'collections-counter',
    title: 'Count Word Frequency',
    description: 'Use Counter to count the frequency of words in a sentence.',
    starterCode: `from collections import Counter

# Words list
words = ["apple", "banana", "apple", "cherry", "banana", "apple"]

# TODO: Count word frequency and print the 2 most common

`,
    expectedOutput: `[('apple', 3), ('banana', 2)]`,
    hints: [
      'Create a Counter: counts = Counter(words)',
      'Use counts.most_common(2) to get top 2',
      'Print the result'
    ],
    difficulty: 'medium',
    points: 20,
  },
  {
    id: 'challenge-8',
    functionId: 'functools-lru-cache',
    title: 'Optimize Fibonacci',
    description: 'Use @lru_cache to optimize a recursive Fibonacci function.',
    starterCode: `from functools import lru_cache

# TODO: Add @lru_cache decorator to optimize this function

def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# Test with a large number
print(f"Fib(30) = {fibonacci(30)}")

`,
    expectedOutput: `Fib(30) = 832040`,
    hints: [
      'Add @lru_cache(maxsize=None) above the function',
      'The decorator will cache results automatically',
      'Without the decorator, fib(30) would be very slow!'
    ],
    difficulty: 'medium',
    points: 25,
  },
  {
    id: 'challenge-9',
    functionId: 'numpy-array',
    title: 'Create and Reshape Array',
    description: 'Create a NumPy array from 0-11 and reshape it to 3x4.',
    starterCode: `import numpy as np

# TODO: Create array from 0-11 and reshape to 3x4

`,
    expectedOutput: `[[ 0  1  2  3]
 [ 4  5  6  7]
 [ 8  9 10 11]]`,
    hints: [
      'Use np.arange(12) to create 0-11',
      'Use .reshape((3, 4)) to reshape',
      'Or do it in one line: np.arange(12).reshape((3, 4))'
    ],
    difficulty: 'medium',
    points: 20,
  },
  {
    id: 'challenge-10',
    functionId: 'pandas-groupby',
    title: 'Calculate Average by Category',
    description: 'Use groupby() to calculate average sales by product category.',
    starterCode: `import pandas as pd

# Sales data
data = {
    'product': ['A', 'B', 'A', 'B', 'C', 'C'],
    'category': ['Electronics', 'Clothing', 'Electronics', 'Clothing', 'Food', 'Food'],
    'sales': [100, 50, 150, 75, 30, 45]
}
df = pd.DataFrame(data)

# TODO: Calculate average sales by category

`,
    expectedOutput: `category
Clothing       62.5
Electronics    125.0
Food           37.5
Name: sales, dtype: float64`,
    hints: [
      'Use df.groupby("category")["sales"].mean()',
      'Group by category, then select sales column',
      'Apply mean() aggregation'
    ],
    difficulty: 'hard',
    points: 30,
  },
];

// Get daily challenge based on date
export function getDailyChallenge(): Challenge {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  return challenges[dayOfYear % challenges.length];
}

// Get challenge by ID
export function getChallengeById(id: string): Challenge | undefined {
  return challenges.find(c => c.id === id);
}

// Get all challenges
export function getAllChallenges(): Challenge[] {
  return challenges;
}

// Get challenges by difficulty
export function getChallengesByDifficulty(difficulty: string): Challenge[] {
  return challenges.filter(c => c.difficulty === difficulty);
}
