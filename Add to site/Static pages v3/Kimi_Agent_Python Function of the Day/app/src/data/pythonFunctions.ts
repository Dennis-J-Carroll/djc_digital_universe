export interface PythonFunction {
  id: string;
  name: string;
  module: string;
  category: 'built-in' | 'itertools' | 'datetime' | 'math' | 'random' | 'strings' | 'collections' | 'functools';
  description: string;
  signature: string;
  example: string;
  output?: string;
  useCases: string[];
  date?: string;
}

export const pythonFunctions: PythonFunction[] = [
  // Built-in functions
  {
    id: 'zip',
    name: 'zip',
    module: 'built-in',
    category: 'built-in',
    description: 'Aggregate elements from multiple iterables into tuples. Stops at the shortest iterable.',
    signature: 'zip(*iterables)',
    example: `names = ["Alice", "Bob", "Charlie"]
ages = [25, 30, 35]

for name, age in zip(names, ages):
    print(f"{name} is {age}")`,
    output: `Alice is 25
Bob is 30
Charlie is 35`,
    useCases: ['Pairing related lists', 'Transposing matrices', 'Parallel iteration'],
  },
  {
    id: 'enumerate',
    name: 'enumerate',
    module: 'built-in',
    category: 'built-in',
    description: 'Add a counter to an iterable and return it as an enumerate object.',
    signature: 'enumerate(iterable, start=0)',
    example: `fruits = ["apple", "banana", "cherry"]

for index, fruit in enumerate(fruits, start=1):
    print(f"{index}. {fruit}")`,
    output: `1. apple
2. banana
3. cherry`,
    useCases: ['Looping with indices', 'Numbered lists', 'Tracking positions'],
  },
  {
    id: 'sorted',
    name: 'sorted',
    module: 'built-in',
    category: 'built-in',
    description: 'Return a new sorted list from the elements in any iterable.',
    signature: 'sorted(iterable, key=None, reverse=False)',
    example: `words = ["banana", "pie", "Washington"]

# Sort by length
by_length = sorted(words, key=len)
print(by_length)`,
    output: `["pie", "banana", "Washington"]`,
    useCases: ['Custom sorting', 'Sorting dictionaries', 'Multi-key sorts'],
  },
  {
    id: 'map',
    name: 'map',
    module: 'built-in',
    category: 'built-in',
    description: 'Apply a function to every item in an iterable and return an iterator.',
    signature: 'map(function, iterable, ...)',
    example: `numbers = [1, 2, 3, 4, 5]
squares = list(map(lambda x: x ** 2, numbers))
print(squares)`,
    output: `[1, 4, 9, 16, 25]`,
    useCases: ['Data transformation', 'Type conversion', 'Batch operations'],
  },
  {
    id: 'filter',
    name: 'filter',
    module: 'built-in',
    category: 'built-in',
    description: 'Construct an iterator from elements for which the function returns true.',
    signature: 'filter(function, iterable)',
    example: `numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = list(filter(lambda x: x % 2 == 0, numbers))
print(evens)`,
    output: `[2, 4, 6, 8, 10]`,
    useCases: ['Removing None values', 'Filtering lists', 'Data cleaning'],
  },
  {
    id: 'any-all',
    name: 'any & all',
    module: 'built-in',
    category: 'built-in',
    description: 'any() returns True if any element is true. all() returns True if all elements are true.',
    signature: 'any(iterable) / all(iterable)',
    example: `scores = [85, 92, 78, 90]

# Check if any score is perfect
has_perfect = any(s == 100 for s in scores)

# Check if all passed
all_passed = all(s >= 60 for s in scores)

print(f"Has perfect: {has_perfect}")
print(f"All passed: {all_passed}")`,
    output: `Has perfect: False
All passed: True`,
    useCases: ['Validation checks', 'Existence queries', 'Boolean aggregations'],
  },
  
  // Itertools
  {
    id: 'groupby',
    name: 'itertools.groupby',
    module: 'itertools',
    category: 'itertools',
    description: 'Group consecutive items using a key—no sorting required.',
    signature: 'itertools.groupby(iterable, key=None)',
    example: `import itertools

words = ["apple", "apricot", "banana", "cherry"]
for key, group in itertools.groupby(words, key=lambda w: w[0]):
    print(key, list(group))`,
    output: `a ['apple', 'apricot']
b ['banana']
c ['cherry']`,
    useCases: ['Grouping consecutive data', 'Run-length encoding', 'Data segmentation'],
  },
  {
    id: 'chain',
    name: 'itertools.chain',
    module: 'itertools',
    category: 'itertools',
    description: 'Chain multiple iterables together into a single sequence.',
    signature: 'itertools.chain(*iterables)',
    example: `import itertools

list1 = [1, 2, 3]
list2 = ['a', 'b', 'c']
list3 = [True, False]

combined = list(itertools.chain(list1, list2, list3))
print(combined)`,
    output: `[1, 2, 3, 'a', 'b', 'c', True, False]`,
    useCases: ['Concatenating lists', 'Flattening nested lists', 'Stream processing'],
  },
  {
    id: 'combinations',
    name: 'itertools.combinations',
    module: 'itertools',
    category: 'itertools',
    description: 'Generate all possible r-length combinations from an iterable.',
    signature: 'itertools.combinations(iterable, r)',
    example: `import itertools

team = ["Alice", "Bob", "Charlie", "Diana"]
pairs = list(itertools.combinations(team, 2))

for pair in pairs:
    print(pair)`,
    output: `('Alice', 'Bob')
('Alice', 'Charlie')
('Alice', 'Diana')
('Bob', 'Charlie')
('Bob', 'Diana')
('Charlie', 'Diana')`,
    useCases: ['Generating pairs', 'Team assignments', 'Subset generation'],
  },
  {
    id: 'cycle',
    name: 'itertools.cycle',
    module: 'itertools',
    category: 'itertools',
    description: 'Create an iterator that cycles through an iterable indefinitely.',
    signature: 'itertools.cycle(iterable)',
    example: `import itertools

colors = ["red", "green", "blue"]
color_cycle = itertools.cycle(colors)

for _ in range(7):
    print(next(color_cycle))`,
    output: `red
green
blue
red
green
blue
red`,
    useCases: ['Round-robin scheduling', 'Alternating patterns', 'Infinite loops'],
  },
  {
    id: 'accumulate',
    name: 'itertools.accumulate',
    module: 'itertools',
    category: 'itertools',
    description: 'Return accumulated results or accumulated results of a binary function.',
    signature: 'itertools.accumulate(iterable[, func, *, initial=None])',
    example: `import itertools
import operator

numbers = [1, 2, 3, 4, 5]

# Running sum
sums = list(itertools.accumulate(numbers))
print(f"Sums: {sums}")

# Running product
products = list(itertools.accumulate(numbers, operator.mul))
print(f"Products: {products}")`,
    output: `Sums: [1, 3, 6, 10, 15]
Products: [1, 2, 6, 24, 120]`,
    useCases: ['Running totals', 'Cumulative stats', 'Financial calculations'],
  },
  
  // Datetime
  {
    id: 'datetime-now',
    name: 'datetime.datetime.now',
    module: 'datetime',
    category: 'datetime',
    description: 'Get the current local date and time.',
    signature: 'datetime.datetime.now(tz=None)',
    example: `from datetime import datetime

now = datetime.now()
print(f"Now: {now}")
print(f"Year: {now.year}")
print(f"Hour: {now.hour}")`,
    output: `Now: 2026-01-30 14:32:15.123456
Year: 2026
Hour: 14`,
    useCases: ['Timestamps', 'Logging', 'Session tracking'],
  },
  {
    id: 'timedelta',
    name: 'datetime.timedelta',
    module: 'datetime',
    category: 'datetime',
    description: 'Represent a duration, the difference between two dates or times.',
    signature: 'datetime.timedelta(days=0, seconds=0, microseconds=0, milliseconds=0, minutes=0, hours=0, weeks=0)',
    example: `from datetime import datetime, timedelta

now = datetime.now()
future = now + timedelta(days=7)
past = now - timedelta(hours=3)

print(f"Next week: {future.strftime('%Y-%m-%d')}")
print(f"3 hours ago: {past.strftime('%H:%M')}")`,
    output: `Next week: 2026-02-06
3 hours ago: 11:32`,
    useCases: ['Date arithmetic', 'Deadlines', 'Scheduling'],
  },
  {
    id: 'strftime',
    name: 'datetime.strftime',
    module: 'datetime',
    category: 'datetime',
    description: 'Format a datetime object as a string using format codes.',
    signature: 'datetime.strftime(format)',
    example: `from datetime import datetime

now = datetime.now()

# Common formats
print(now.strftime("%Y-%m-%d"))           # ISO date
print(now.strftime("%A, %B %d, %Y"))      # Full date
print(now.strftime("%I:%M %p"))           # 12-hour time`,
    output: `2026-01-30
Friday, January 30, 2026
02:32 PM`,
    useCases: ['Display formatting', 'File naming', 'API responses'],
  },
  {
    id: 'isoweekday',
    name: 'datetime.isoweekday',
    module: 'datetime',
    category: 'datetime',
    description: 'Return the day of the week as an integer (Monday=1, Sunday=7).',
    signature: 'datetime.isoweekday()',
    example: `from datetime import datetime

dates = [
    datetime(2026, 1, 26),  # Monday
    datetime(2026, 1, 30),  # Friday
    datetime(2026, 2, 1),   # Sunday
]

for d in dates:
    print(f"{d.strftime('%A')}: {d.isoweekday()}")`,
    output: `Monday: 1
Friday: 5
Sunday: 7`,
    useCases: ['Business day logic', 'Scheduling', 'Week calculations'],
  },
  
  // Math
  {
    id: 'comb',
    name: 'math.comb',
    module: 'math',
    category: 'math',
    description: 'Return the number of ways to choose k items from n items without repetition.',
    signature: 'math.comb(n, k)',
    example: `import math

# How many ways to choose 3 people from 10?
teams = math.comb(10, 3)
print(f"Ways to form team: {teams}")

# Lottery odds (choose 6 from 49)
lottery = math.comb(49, 6)
print(f"Lottery combinations: {lottery:,}")`,
    output: `Ways to form team: 120
Lottery combinations: 13,983,816`,
    useCases: ['Combinatorics', 'Probability', 'Statistics'],
  },
  {
    id: 'gcd',
    name: 'math.gcd',
    module: 'math',
    category: 'math',
    description: 'Return the greatest common divisor of two or more integers.',
    signature: 'math.gcd(*integers)',
    example: `import math

# Simplify fraction 18/24
g = math.gcd(18, 24)
numerator = 18 // g
denominator = 24 // g
print(f"18/24 = {numerator}/{denominator}")

# GCD of multiple numbers
print(f"GCD(48, 180, 240) = {math.gcd(48, 180, 240)}")`,
    output: `18/24 = 3/4
GCD(48, 180, 240) = 12`,
    useCases: ['Fraction simplification', 'Cryptography', 'Number theory'],
  },
  {
    id: 'isclose',
    name: 'math.isclose',
    module: 'math',
    category: 'math',
    description: 'Return True if two values are close to each other.',
    signature: 'math.isclose(a, b, *, rel_tol=1e-09, abs_tol=0.0)',
    example: `import math

a = 0.1 + 0.2
b = 0.3

print(f"a == b: {a == b}")
print(f"isclose: {math.isclose(a, b)}")

# Custom tolerance
print(f"within 0.01: {math.isclose(3.14, 3.14159, rel_tol=0.01)}")`,
    output: `a == b: False
isclose: True
within 0.01: True`,
    useCases: ['Floating-point comparison', 'Scientific computing', 'Unit tests'],
  },
  
  // Random
  {
    id: 'sample',
    name: 'random.sample',
    module: 'random',
    category: 'random',
    description: 'Return a k-length list of unique elements chosen from the population.',
    signature: 'random.sample(population, k)',
    example: `import random

deck = list(range(1, 53))  # 52 cards
hand = random.sample(deck, 5)
print(f"Your hand: {hand}")

# Random team selection
team = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank"]
presenters = random.sample(team, 3)
print(f"Presenters: {presenters}")`,
    output: `Your hand: [7, 23, 41, 15, 3]
Presenters: ['Charlie', 'Alice', 'Frank']`,
    useCases: ['Random selection', 'Lottery draws', 'A/B testing'],
  },
  {
    id: 'choices',
    name: 'random.choices',
    module: 'random',
    category: 'random',
    description: 'Return a k-sized list of elements chosen with replacement.',
    signature: 'random.choices(population, weights=None, *, cum_weights=None, k=1)',
    example: `import random

# Roll a die 10 times
rolls = random.choices([1, 2, 3, 4, 5, 6], k=10)
print(f"Rolls: {rolls}")

# Weighted selection
colors = ["red", "green", "blue"]
weighted = random.choices(colors, weights=[70, 20, 10], k=5)
print(f"Weighted picks: {weighted}")`,
    output: `Rolls: [3, 6, 2, 4, 1, 5, 3, 2, 6, 4]
Weighted picks: ['red', 'red', 'green', 'red', 'red']`,
    useCases: ['Weighted random', 'Dice rolls', 'Bootstrap sampling'],
  },
  {
    id: 'shuffle',
    name: 'random.shuffle',
    module: 'random',
    category: 'random',
    description: 'Shuffle the sequence in place.',
    signature: 'random.shuffle(x)',
    example: `import random

cards = ['A♠', 'K♠', 'Q♠', 'J♠', '10♠']
random.shuffle(cards)
print(f"Shuffled: {cards}")

# Shuffle with seed for reproducibility
random.seed(42)
items = [1, 2, 3, 4, 5]
random.shuffle(items)
print(f"Seeded shuffle: {items}")`,
    output: `Shuffled: ['Q♠', 'A♠', '10♠', 'K♠', 'J♠']
Seeded shuffle: [3, 1, 5, 4, 2]`,
    useCases: ['Card games', 'Playlist shuffling', 'Randomizing order'],
  },
  
  // Strings
  {
    id: 'splitlines',
    name: 'str.splitlines',
    module: 'built-in',
    category: 'strings',
    description: 'Split a string at line boundaries without the newline mess.',
    signature: 'str.splitlines(keepends=False)',
    example: `text = """Line 1\nLine 2\r\nLine 3\rLine 4"""

# Without keeping ends
lines = text.splitlines()
print(lines)

# Keep the newline characters
with_ends = text.splitlines(keepends=True)
print(with_ends)`,
    output: `['Line 1', 'Line 2', 'Line 3', 'Line 4']
['Line 1\n', 'Line 2\r\n', 'Line 3\r', 'Line 4']`,
    useCases: ['Parsing text files', 'Processing logs', 'CSV handling'],
  },
  {
    id: 'removeprefix',
    name: 'str.removeprefix',
    module: 'built-in',
    category: 'strings',
    description: 'Remove a prefix from a string if it exists (Python 3.9+).',
    signature: 'str.removeprefix(prefix)',
    example: `url = "https://example.com/path"
path = url.removeprefix("https://")
print(path)

# Safe to call even if prefix doesn't exist
text = "hello world"
result = text.removeprefix("xyz")
print(result)`,
    output: `example.com/path
hello world`,
    useCases: ['URL processing', 'File path handling', 'Data cleaning'],
  },
  {
    id: 'join',
    name: 'str.join',
    module: 'built-in',
    category: 'strings',
    description: 'Concatenate an iterable of strings with a separator.',
    signature: 'str.join(iterable)',
    example: `words = ["Python", "is", "awesome"]
sentence = " ".join(words)
print(sentence)

# Build CSV line
fields = ["Alice", "25", "Engineer"]
csv = ",".join(fields)
print(csv)

# Path construction
parts = ["home", "user", "documents"]
path = "/".join(parts)
print(path)`,
    output: `Python is awesome
Alice,25,Engineer
home/user/documents`,
    useCases: ['Building CSV', 'Path construction', 'Sentence building'],
  },
  
  // Collections
  {
    id: 'counter',
    name: 'collections.Counter',
    module: 'collections',
    category: 'collections',
    description: 'A dict subclass for counting hashable objects.',
    signature: 'collections.Counter([iterable-or-mapping])',
    example: `from collections import Counter

words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
counts = Counter(words)

print(counts)
print(f"Most common: {counts.most_common(2)}")
print(f"Apple count: {counts['apple']}")`,
    output: `Counter({'apple': 3, 'banana': 2, 'cherry': 1})
Most common: [('apple', 3), ('banana', 2)]
Apple count: 3`,
    useCases: ['Word counting', 'Frequency analysis', 'Voting systems'],
  },
  {
    id: 'defaultdict',
    name: 'collections.defaultdict',
    module: 'collections',
    category: 'collections',
    description: 'A dict subclass that calls a factory function to supply missing values.',
    signature: 'collections.defaultdict(default_factory=None)',
    example: `from collections import defaultdict

# Group by first letter
words = ["apple", "apricot", "banana", "blueberry", "cherry"]
groups = defaultdict(list)

for word in words:
    groups[word[0]].append(word)

print(dict(groups))`,
    output: `{'a': ['apple', 'apricot'], 'b': ['banana', 'blueberry'], 'c': ['cherry']}`,
    useCases: ['Grouping data', 'Building indexes', 'Nested dictionaries'],
  },
  
  // Functools
  {
    id: 'lru-cache',
    name: 'functools.lru_cache',
    module: 'functools',
    category: 'functools',
    description: 'Decorator that caches the results of function calls.',
    signature: '@functools.lru_cache(maxsize=128, typed=False)',
    example: `from functools import lru_cache

@lru_cache(maxsize=None)
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# First call computes
print(fibonacci(100))

# Second call returns instantly from cache
print(fibonacci(100))`,
    output: `354224848179261915075
354224848179261915075`,
    useCases: ['Memoization', 'Recursive optimization', 'API call caching'],
  },
  {
    id: 'partial',
    name: 'functools.partial',
    module: 'functools',
    category: 'functools',
    description: 'Create a new function with partial application of arguments.',
    signature: 'functools.partial(func, *args, **keywords)',
    example: `from functools import partial

# Create a custom power function
square = partial(pow, 2)
cube = partial(pow, 3)

print(f"2^3 = {square(3)}")
print(f"3^4 = {cube(4)}")

# Fix function arguments
base_url = "https://api.example.com"
api_get = partial(requests.get, base_url)  # hypothetical`,
    output: `2^3 = 8
3^4 = 81`,
    useCases: ['Creating specialized functions', 'Callback handlers', 'API wrappers'],
  },
];

// Get today's function based on date
export function getTodaysFunction(): PythonFunction {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  const index = dayOfYear % pythonFunctions.length;
  return {
    ...pythonFunctions[index],
    date: today.toISOString().split('T')[0],
  };
}

// Get function by ID
export function getFunctionById(id: string): PythonFunction | undefined {
  return pythonFunctions.find(f => f.id === id);
}

// Get functions by category
export function getFunctionsByCategory(category: string): PythonFunction[] {
  if (category === 'all') return pythonFunctions;
  return pythonFunctions.filter(f => f.category === category);
}

// Search functions
export function searchFunctions(query: string): PythonFunction[] {
  const lowerQuery = query.toLowerCase();
  return pythonFunctions.filter(f => 
    f.name.toLowerCase().includes(lowerQuery) ||
    f.description.toLowerCase().includes(lowerQuery) ||
    f.module.toLowerCase().includes(lowerQuery)
  );
}

// Get all categories
export const categories = [
  { id: 'all', label: 'All' },
  { id: 'built-in', label: 'Built-in' },
  { id: 'strings', label: 'Strings' },
  { id: 'itertools', label: 'Itertools' },
  { id: 'datetime', label: 'Datetime' },
  { id: 'math', label: 'Math' },
  { id: 'random', label: 'Random' },
  { id: 'collections', label: 'Collections' },
  { id: 'functools', label: 'Functools' },
];

// Collections data
export const collections = [
  {
    id: 'itertools',
    name: 'Itertools',
    emoji: '🧵',
    description: 'Generators, chains, and infinite loops—handled safely. Master the art of efficient iteration.',
    color: '#FFD166',
  },
  {
    id: 'datetime',
    name: 'Datetime',
    emoji: '📅',
    description: 'Parsing, formatting, and time-zone basics. Never miss a deadline again.',
    color: '#F4A6C3',
  },
  {
    id: 'random',
    name: 'Random',
    emoji: '🎲',
    description: 'Seeds, choices, and shuffles you can trust. Add unpredictability to your programs.',
    color: '#4B6BFB',
  },
  {
    id: 'strings',
    name: 'Strings',
    emoji: '📝',
    description: 'Text manipulation essentials. Parse, format, and transform strings like a pro.',
    color: '#C9E8D8',
  },
  {
    id: 'collections',
    name: 'Collections',
    emoji: '📚',
    description: 'Specialized container datatypes. Counters, deques, and defaultdicts explained.',
    color: '#F6D7C3',
  },
  {
    id: 'math',
    name: 'Math',
    emoji: '🔢',
    description: 'Mathematical functions for the real world. From combinatorics to floating-point safety.',
    color: '#E94E77',
  },
];
