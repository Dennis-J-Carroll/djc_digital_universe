import type { PythonFunction, Category, Library, LearningPath } from '../types';

// ============================================
// STANDARD LIBRARY FUNCTIONS
// ============================================

export const stdlibFunctions: PythonFunction[] = [
  // ========== BUILT-IN FUNCTIONS ==========
  {
    id: 'print',
    name: 'print',
    module: 'built-in',
    category: 'built-in',
    library: 'stdlib',
    difficulty: 'beginner',
    description: 'Output text to the console with customizable separators and endings.',
    longDescription: 'The print() function sends output to the standard output device (screen). It can take multiple arguments, customize the separator between items, and control what appears at the end.',
    signature: 'print(*objects, sep=" ", end="\\n", file=sys.stdout, flush=False)',
    parameters: [
      { name: '*objects', type: 'any', required: false, description: 'Values to print' },
      { name: 'sep', type: 'str', required: false, default: '" "', description: 'Separator between values' },
      { name: 'end', type: 'str', required: false, default: '"\\n"', description: 'Ending character' },
    ],
    returns: 'None',
    example: `name = "Alice"
age = 30
print("Name:", name, "Age:", age, sep=" | ")`,
    output: `Name: | Alice | Age: | 30`,
    useCases: ['Debugging', 'User output', 'Logging', 'Data display'],
    tags: ['output', 'console', 'display', 'debugging'],
    interactive: true,
  },
  {
    id: 'len',
    name: 'len',
    module: 'built-in',
    category: 'built-in',
    library: 'stdlib',
    difficulty: 'beginner',
    description: 'Return the number of items in an object.',
    longDescription: 'len() returns the length (number of items) of an object. Works with strings, lists, tuples, dictionaries, sets, and any object with a __len__ method.',
    signature: 'len(obj)',
    parameters: [
      { name: 'obj', type: 'sequence or collection', required: true, description: 'Object to measure' },
    ],
    returns: 'int: Number of items',
    example: `text = "Hello, World!"
items = [1, 2, 3, 4, 5]
print(f"String length: {len(text)}")
print(f"List length: {len(items)}")`,
    output: `String length: 13
List length: 5`,
    useCases: ['Counting items', 'Loop bounds', 'Validation', 'Sizing containers'],
    tags: ['length', 'count', 'size', 'measure'],
    interactive: true,
  },
  {
    id: 'type',
    name: 'type',
    module: 'built-in',
    category: 'built-in',
    library: 'stdlib',
    difficulty: 'beginner',
    description: 'Return the type of an object.',
    longDescription: 'type() returns the type of the specified object. It\'s useful for debugging, type checking, and understanding your data.',
    signature: 'type(object)',
    parameters: [
      { name: 'object', type: 'any', required: true, description: 'Object to check' },
    ],
    returns: 'type: The type of the object',
    example: `print(type(42))
print(type("hello"))
print(type([1, 2, 3]))
print(type({"a": 1}))`,
    output: `<class 'int'>
<class 'str'>
<class 'list'>
<class 'dict'>`,
    useCases: ['Debugging', 'Type checking', 'Validation', 'Understanding data'],
    tags: ['type', 'debugging', 'introspection'],
    interactive: true,
  },
  {
    id: 'range',
    name: 'range',
    module: 'built-in',
    category: 'built-in',
    library: 'stdlib',
    difficulty: 'beginner',
    description: 'Generate a sequence of numbers, commonly used in for loops.',
    longDescription: 'range() generates an immutable sequence of numbers. It\'s memory efficient because it generates numbers on-the-fly rather than storing them all in memory.',
    signature: 'range(stop) / range(start, stop[, step])',
    parameters: [
      { name: 'start', type: 'int', required: false, default: '0', description: 'Starting number' },
      { name: 'stop', type: 'int', required: true, description: 'Stop before this number' },
      { name: 'step', type: 'int', required: false, default: '1', description: 'Increment' },
    ],
    returns: 'range object',
    example: `# Count from 0 to 4
print(list(range(5)))

# Count from 2 to 8
print(list(range(2, 9)))

# Even numbers
print(list(range(0, 10, 2)))

# Count backwards
print(list(range(5, 0, -1)))`,
    output: `[0, 1, 2, 3, 4]
[2, 3, 4, 5, 6, 7, 8]
[0, 2, 4, 6, 8]
[5, 4, 3, 2, 1]`,
    useCases: ['For loops', 'Generating indices', 'Number sequences', 'Iterations'],
    tags: ['loop', 'sequence', 'iteration', 'numbers'],
    interactive: true,
  },
  {
    id: 'zip',
    name: 'zip',
    module: 'built-in',
    category: 'built-in',
    library: 'stdlib',
    difficulty: 'beginner',
    description: 'Aggregate elements from multiple iterables into tuples.',
    longDescription: 'zip() pairs elements from multiple iterables together. It stops when the shortest iterable is exhausted, making it safe for unequal-length inputs.',
    signature: 'zip(*iterables, strict=False)',
    parameters: [
      { name: '*iterables', type: 'iterable', required: true, description: 'Iterables to combine' },
      { name: 'strict', type: 'bool', required: false, default: 'False', description: 'Require equal lengths' },
    ],
    returns: 'iterator of tuples',
    example: `names = ["Alice", "Bob", "Charlie"]
ages = [25, 30, 35]
scores = [85, 92, 78]

for name, age, score in zip(names, ages, scores):
    print(f"{name}: {age} years, scored {score}")`,
    output: `Alice: 25 years, scored 85
Bob: 30 years, scored 92
Charlie: 35 years, scored 78`,
    useCases: ['Pairing related lists', 'Transposing matrices', 'Parallel iteration'],
    tags: ['combine', 'pair', 'iterate', 'matrix'],
    interactive: true,
  },
  {
    id: 'enumerate',
    name: 'enumerate',
    module: 'built-in',
    category: 'built-in',
    library: 'stdlib',
    difficulty: 'beginner',
    description: 'Add a counter to an iterable and return it as an enumerate object.',
    longDescription: 'enumerate() adds a counter to an iterable and returns it as an enumerate object. You can specify the starting number (default is 0).',
    signature: 'enumerate(iterable, start=0)',
    parameters: [
      { name: 'iterable', type: 'iterable', required: true, description: 'Iterable to enumerate' },
      { name: 'start', type: 'int', required: false, default: '0', description: 'Starting number' },
    ],
    returns: 'enumerate object',
    example: `fruits = ["apple", "banana", "cherry", "date"]

# With default start (0)
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")

print("---")

# With custom start (1)
for i, fruit in enumerate(fruits, start=1):
    print(f"{i}. {fruit}")`,
    output: `0: apple
1: banana
2: cherry
3: date
---
1. apple
2. banana
3. cherry
4. date`,
    useCases: ['Looping with indices', 'Numbered lists', 'Tracking positions'],
    tags: ['index', 'counter', 'loop', 'enumerate'],
    interactive: true,
  },
  {
    id: 'sorted',
    name: 'sorted',
    module: 'built-in',
    category: 'built-in',
    library: 'stdlib',
    difficulty: 'beginner',
    description: 'Return a new sorted list from the elements in any iterable.',
    longDescription: 'sorted() returns a new sorted list from the elements in any iterable. Unlike list.sort(), it works on any iterable and returns a new list without modifying the original.',
    signature: 'sorted(iterable, key=None, reverse=False)',
    parameters: [
      { name: 'iterable', type: 'iterable', required: true, description: 'Iterable to sort' },
      { name: 'key', type: 'function', required: false, description: 'Function to extract comparison key' },
      { name: 'reverse', type: 'bool', required: false, default: 'False', description: 'Sort in descending order' },
    ],
    returns: 'list: New sorted list',
    example: `words = ["banana", "pie", "Washington", "book"]

# Sort alphabetically
print(sorted(words))

# Sort by length
print(sorted(words, key=len))

# Sort by last letter
print(sorted(words, key=lambda w: w[-1]))

# Reverse sort
print(sorted(words, reverse=True))`,
    output: `['Washington', 'banana', 'book', 'pie']
['pie', 'book', 'banana', 'Washington']
['banana', 'pie', 'Washington', 'book']
['banana', 'book', 'pie', 'Washington']`,
    useCases: ['Custom sorting', 'Sorting dictionaries', 'Multi-key sorts'],
    tags: ['sort', 'order', 'compare', 'arrange'],
    interactive: true,
  },
  {
    id: 'map',
    name: 'map',
    module: 'built-in',
    category: 'built-in',
    library: 'stdlib',
    difficulty: 'intermediate',
    description: 'Apply a function to every item in an iterable and return an iterator.',
    longDescription: 'map() applies a given function to each item of an iterable and returns an iterator. It\'s a clean alternative to list comprehensions for simple transformations.',
    signature: 'map(function, iterable, ...)',
    parameters: [
      { name: 'function', type: 'callable', required: true, description: 'Function to apply' },
      { name: 'iterable', type: 'iterable', required: true, description: 'Iterable to process' },
    ],
    returns: 'iterator',
    example: `numbers = [1, 2, 3, 4, 5]

# Square all numbers
squares = list(map(lambda x: x ** 2, numbers))
print(squares)

# Convert strings to integers
str_nums = ["1", "2", "3"]
ints = list(map(int, str_nums))
print(ints)

# Multiple iterables
a = [1, 2, 3]
b = [4, 5, 6]
sums = list(map(lambda x, y: x + y, a, b))
print(sums)`,
    output: `[1, 4, 9, 16, 25]
[1, 2, 3]
[5, 7, 9]`,
    useCases: ['Data transformation', 'Type conversion', 'Batch operations'],
    tags: ['transform', 'apply', 'functional'],
    interactive: true,
  },
  {
    id: 'filter',
    name: 'filter',
    module: 'built-in',
    category: 'built-in',
    library: 'stdlib',
    difficulty: 'intermediate',
    description: 'Construct an iterator from elements for which the function returns true.',
    longDescription: 'filter() constructs an iterator from elements of an iterable for which a function returns true. If function is None, it uses the identity function.',
    signature: 'filter(function, iterable)',
    parameters: [
      { name: 'function', type: 'callable or None', required: true, description: 'Function that returns bool' },
      { name: 'iterable', type: 'iterable', required: true, description: 'Iterable to filter' },
    ],
    returns: 'iterator',
    example: `numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# Get even numbers
evens = list(filter(lambda x: x % 2 == 0, numbers))
print(evens)

# Remove empty strings
words = ["hello", "", "world", "", "python"]
non_empty = list(filter(None, words))
print(non_empty)

# Filter by length
names = ["Alice", "Bob", "Charlie", "Eve"]
long_names = list(filter(lambda n: len(n) > 3, names))
print(long_names)`,
    output: `[2, 4, 6, 8, 10]
['hello', 'world', 'python']
['Alice', 'Charlie']`,
    useCases: ['Removing None values', 'Filtering lists', 'Data cleaning'],
    tags: ['filter', 'select', 'condition'],
    interactive: true,
  },
  {
    id: 'any-all',
    name: 'any & all',
    module: 'built-in',
    category: 'built-in',
    library: 'stdlib',
    difficulty: 'intermediate',
    description: 'Test whether any or all elements in an iterable are true.',
    longDescription: 'any() returns True if any element is true. all() returns True if all elements are true (or if the iterable is empty). Both short-circuit on the first determining result.',
    signature: 'any(iterable) / all(iterable)',
    parameters: [
      { name: 'iterable', type: 'iterable', required: true, description: 'Iterable to test' },
    ],
    returns: 'bool',
    example: `scores = [85, 92, 78, 90, 88]

# Check if any score is perfect
has_perfect = any(s == 100 for s in scores)
print(f"Any perfect score: {has_perfect}")

# Check if all passed
all_passed = all(s >= 60 for s in scores)
print(f"All passed: {all_passed}")

# Check if list is empty (all on empty returns True!)
empty = []
print(f"All on empty: {all(empty)}")

# Practical: check if any string contains a substring
words = ["apple", "banana", "cherry"]
has_a = any("a" in w for w in words)
print(f"Any word contains 'a': {has_a}")`,
    output: `Any perfect score: False
All passed: True
All on empty: True
Any word contains 'a': True`,
    useCases: ['Validation checks', 'Existence queries', 'Boolean aggregations'],
    tags: ['boolean', 'test', 'aggregate', 'check'],
    interactive: true,
  },
  {
    id: 'isinstance',
    name: 'isinstance',
    module: 'built-in',
    category: 'built-in',
    library: 'stdlib',
    difficulty: 'intermediate',
    description: 'Check if an object is an instance of a class or type.',
    longDescription: 'isinstance() checks if an object is an instance of a class or a tuple of classes. It\'s the preferred way to check types over type() comparisons.',
    signature: 'isinstance(object, classinfo)',
    parameters: [
      { name: 'object', type: 'any', required: true, description: 'Object to check' },
      { name: 'classinfo', type: 'type or tuple', required: true, description: 'Type(s) to check against' },
    ],
    returns: 'bool',
    example: `value = 42

# Check single type
print(isinstance(value, int))
print(isinstance(value, str))

# Check multiple types
print(isinstance(value, (int, float)))

# Works with custom classes
class Animal:
    pass

class Dog(Animal):
    pass

dog = Dog()
print(isinstance(dog, Dog))
print(isinstance(dog, Animal))`,
    output: `True
False
True
True
True`,
    useCases: ['Type validation', 'Polymorphism', 'Input checking'],
    tags: ['type', 'check', 'validation', 'oop'],
    interactive: true,
  },

  // ========== STRING METHODS ==========
  {
    id: 'str-split',
    name: 'str.split',
    module: 'built-in',
    category: 'strings',
    library: 'stdlib',
    difficulty: 'beginner',
    description: 'Split a string into a list using a delimiter.',
    longDescription: 'split() divides a string into a list of substrings using a specified separator. If no separator is given, it splits on whitespace.',
    signature: 'str.split(sep=None, maxsplit=-1)',
    parameters: [
      { name: 'sep', type: 'str', required: false, description: 'Delimiter (default: whitespace)' },
      { name: 'maxsplit', type: 'int', required: false, default: '-1', description: 'Maximum splits' },
    ],
    returns: 'list of strings',
    example: `text = "hello world python"

# Split on whitespace (default)
print(text.split())

# Split on specific character
csv = "apple,banana,cherry"
print(csv.split(","))

# Limit splits
data = "a,b,c,d,e"
print(data.split(",", 2))`,
    output: `['hello', 'world', 'python']
['apple', 'banana', 'cherry']
['a', 'b', 'c,d,e']`,
    useCases: ['Parsing CSV', 'Tokenizing text', 'Data extraction'],
    tags: ['split', 'parse', 'tokenize', 'string'],
    interactive: true,
  },
  {
    id: 'str-join',
    name: 'str.join',
    module: 'built-in',
    category: 'strings',
    library: 'stdlib',
    difficulty: 'beginner',
    description: 'Concatenate an iterable of strings with a separator.',
    longDescription: 'join() is the inverse of split(). It concatenates an iterable of strings, placing the separator string between each element.',
    signature: 'str.join(iterable)',
    parameters: [
      { name: 'iterable', type: 'iterable of str', required: true, description: 'Strings to join' },
    ],
    returns: 'str',
    example: `words = ["Python", "is", "awesome"]

# Join with spaces
sentence = " ".join(words)
print(sentence)

# Build CSV
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
    tags: ['join', 'concatenate', 'combine', 'string'],
    interactive: true,
  },
  {
    id: 'str-strip',
    name: 'str.strip',
    module: 'built-in',
    category: 'strings',
    library: 'stdlib',
    difficulty: 'beginner',
    description: 'Remove leading and trailing characters from a string.',
    longDescription: 'strip() removes leading and trailing characters (whitespace by default). Use lstrip() for left only, rstrip() for right only.',
    signature: 'str.strip(chars=None)',
    parameters: [
      { name: 'chars', type: 'str', required: false, description: 'Characters to remove' },
    ],
    returns: 'str',
    example: `text = "   hello world   "

# Remove whitespace
print(f"'{text.strip()}'")

# Remove specific characters
padded = "xxxhello worldxxx"
print(f"'{padded.strip('x')}'")

# Remove multiple characters
messy = "...hello!!!"
print(f"'{messy.strip('.!')}'")`,
    output: `'hello world'
'hello world'
'hello'`,
    useCases: ['Cleaning input', 'Removing padding', 'Data normalization'],
    tags: ['clean', 'trim', 'whitespace', 'string'],
    interactive: true,
  },
  {
    id: 'str-replace',
    name: 'str.replace',
    module: 'built-in',
    category: 'strings',
    library: 'stdlib',
    difficulty: 'beginner',
    description: 'Replace occurrences of a substring with another.',
    longDescription: 'replace() returns a copy of the string with all occurrences of old replaced by new. Optionally limit the number of replacements.',
    signature: 'str.replace(old, new, count=-1)',
    parameters: [
      { name: 'old', type: 'str', required: true, description: 'Substring to replace' },
      { name: 'new', type: 'str', required: true, description: 'Replacement string' },
      { name: 'count', type: 'int', required: false, default: '-1', description: 'Maximum replacements' },
    ],
    returns: 'str',
    example: `text = "I love JavaScript. JavaScript is great!"

# Replace all
print(text.replace("JavaScript", "Python"))

# Replace first occurrence only
print(text.replace("JavaScript", "Python", 1))`,
    output: `I love Python. Python is great!
I love Python. JavaScript is great!`,
    useCases: ['Text substitution', 'Data cleaning', 'Template filling'],
    tags: ['replace', 'substitute', 'modify', 'string'],
    interactive: true,
  },
  {
    id: 'str-find',
    name: 'str.find',
    module: 'built-in',
    category: 'strings',
    library: 'stdlib',
    difficulty: 'beginner',
    description: 'Return the lowest index of a substring (or -1 if not found).',
    longDescription: 'find() returns the index of the first occurrence of a substring. Returns -1 if not found (unlike index() which raises an exception).',
    signature: 'str.find(sub[, start[, end]])',
    parameters: [
      { name: 'sub', type: 'str', required: true, description: 'Substring to find' },
      { name: 'start', type: 'int', required: false, description: 'Start position' },
      { name: 'end', type: 'int', required: false, description: 'End position' },
    ],
    returns: 'int: Index or -1',
    example: `text = "hello world hello"

# Find first occurrence
print(text.find("hello"))

# Find from position
print(text.find("hello", 5))

# Not found returns -1
print(text.find("goodbye"))`,
    output: `0
12
-1`,
    useCases: ['Searching text', 'Parsing', 'Validation'],
    tags: ['find', 'search', 'index', 'locate'],
    interactive: true,
  },
  {
    id: 'str-startswith',
    name: 'str.startswith',
    module: 'built-in',
    category: 'strings',
    library: 'stdlib',
    difficulty: 'beginner',
    description: 'Check if a string starts with a specified prefix.',
    longDescription: 'startswith() returns True if the string starts with the specified prefix. Can check multiple prefixes with a tuple.',
    signature: 'str.startswith(prefix[, start[, end]])',
    parameters: [
      { name: 'prefix', type: 'str or tuple', required: true, description: 'Prefix(es) to check' },
      { name: 'start', type: 'int', required: false, description: 'Start position' },
      { name: 'end', type: 'int', required: false, description: 'End position' },
    ],
    returns: 'bool',
    example: `filename = "document.pdf"
url = "https://example.com"

# Single prefix
print(filename.startswith("doc"))
print(filename.endswith(".pdf"))

# Multiple prefixes
protocols = ("http://", "https://")
print(url.startswith(protocols))`,
    output: `True
True
True`,
    useCases: ['File type checking', 'URL validation', 'Parsing'],
    tags: ['prefix', 'suffix', 'check', 'validate'],
    interactive: true,
  },
  {
    id: 'str-format',
    name: 'str.format',
    module: 'built-in',
    category: 'strings',
    library: 'stdlib',
    difficulty: 'intermediate',
    description: 'Format a string using placeholders.',
    longDescription: 'format() replaces placeholders in a string with values. Supports positional, named, and formatted placeholders.',
    signature: 'str.format(*args, **kwargs)',
    parameters: [
      { name: '*args', type: 'any', required: false, description: 'Positional values' },
      { name: '**kwargs', type: 'any', required: false, description: 'Named values' },
    ],
    returns: 'str',
    example: `# Positional
print("Hello, {0}! You are {1} years old.".format("Alice", 30))

# Named
print("Hello, {name}! You are {age} years old.".format(name="Bob", age=25))

# Formatting
pi = 3.14159
print("Pi = {:.2f}".format(pi))
print("Number = {:05d}".format(42))`,
    output: `Hello, Alice! You are 30 years old.
Hello, Bob! You are 25 years old.
Pi = 3.14
Number = 00042`,
    useCases: ['String templating', 'Output formatting', 'Localization'],
    tags: ['format', 'template', 'placeholder'],
    interactive: true,
  },
  {
    id: 'f-strings',
    name: 'f-strings',
    module: 'built-in',
    category: 'strings',
    library: 'stdlib',
    difficulty: 'beginner',
    description: 'Formatted string literals (Python 3.6+).',
    longDescription: 'f-strings provide a concise way to embed expressions inside string literals. They\'re faster and more readable than format().',
    signature: 'f"...{expression}..."',
    parameters: [],
    returns: 'str',
    example: `name = "Alice"
age = 30
pi = 3.14159

# Basic interpolation
print(f"Hello, {name}!")

# Expressions
print(f"Next year you'll be {age + 1}")

# Formatting
print(f"Pi = {pi:.2f}")

# Padding
print(f"|{name:^10}|")`,
    output: `Hello, Alice!
Next year you'll be 31
Pi = 3.14
|  Alice   |`,
    useCases: ['String interpolation', 'Debug output', 'Template strings'],
    tags: ['f-string', 'interpolation', 'format', 'modern'],
    interactive: true,
  },

  // ========== ITERtools ==========
  {
    id: 'itertools-groupby',
    name: 'itertools.groupby',
    module: 'itertools',
    category: 'itertools',
    library: 'stdlib',
    difficulty: 'advanced',
    description: 'Group consecutive items using a key function.',
    longDescription: 'groupby() groups consecutive elements that have the same key value. Important: only groups consecutive items! Sort first if you want all similar items grouped.',
    signature: 'itertools.groupby(iterable, key=None)',
    parameters: [
      { name: 'iterable', type: 'iterable', required: true, description: 'Iterable to group' },
      { name: 'key', type: 'function', required: false, description: 'Key function' },
    ],
    returns: 'iterator of (key, group) pairs',
    example: `import itertools

# Group consecutive by first letter
words = ["apple", "apricot", "banana", "blueberry", "cherry"]
for key, group in itertools.groupby(words, key=lambda w: w[0]):
    print(key, list(group))

print("---")

# Group by length
numbers = [1, 2, 3, 10, 11, 12, 100]
for length, group in itertools.groupby(numbers, key=lambda n: len(str(n))):
    print(f"{length} digit(s): {list(group)}")`,
    output: `a ['apple', 'apricot']
b ['banana', 'blueberry']
c ['cherry']
---
1 digit(s): [1, 2, 3]
2 digit(s): [10, 11, 12]
3 digit(s): [100]`,
    useCases: ['Grouping consecutive data', 'Run-length encoding', 'Data segmentation'],
    commonMistakes: ['Forgetting items must be consecutive', 'Not sorting when needed'],
    tags: ['group', 'consecutive', 'aggregate'],
    interactive: true,
  },
  {
    id: 'itertools-chain',
    name: 'itertools.chain',
    module: 'itertools',
    category: 'itertools',
    library: 'stdlib',
    difficulty: 'intermediate',
    description: 'Chain multiple iterables together into a single sequence.',
    longDescription: 'chain() takes multiple iterables and returns an iterator that yields elements from the first iterable, then the second, and so on.',
    signature: 'itertools.chain(*iterables)',
    parameters: [
      { name: '*iterables', type: 'iterable', required: true, description: 'Iterables to chain' },
    ],
    returns: 'iterator',
    example: `import itertools

list1 = [1, 2, 3]
list2 = ['a', 'b', 'c']
list3 = [True, False]

# Chain multiple lists
combined = list(itertools.chain(list1, list2, list3))
print(combined)

# Chain from iterable of iterables
lists = [[1, 2], [3, 4], [5, 6]]
flat = list(itertools.chain.from_iterable(lists))
print(flat)`,
    output: `[1, 2, 3, 'a', 'b', 'c', True, False]
[1, 2, 3, 4, 5, 6]`,
    useCases: ['Concatenating lists', 'Flattening nested lists', 'Stream processing'],
    tags: ['chain', 'concatenate', 'flatten', 'combine'],
    interactive: true,
  },
  {
    id: 'itertools-combinations',
    name: 'itertools.combinations',
    module: 'itertools',
    category: 'itertools',
    library: 'stdlib',
    difficulty: 'intermediate',
    description: 'Generate all possible r-length combinations from an iterable.',
    longDescription: 'combinations() generates all r-length combinations of elements from the input iterable. Order doesn\'t matter (AB is same as BA).',
    signature: 'itertools.combinations(iterable, r)',
    parameters: [
      { name: 'iterable', type: 'iterable', required: true, description: 'Source iterable' },
      { name: 'r', type: 'int', required: true, description: 'Combination length' },
    ],
    returns: 'iterator of tuples',
    example: `import itertools

team = ["Alice", "Bob", "Charlie", "Diana"]

# All pairs
pairs = list(itertools.combinations(team, 2))
print(f"Pairs ({len(pairs)}):")
for pair in pairs:
    print(f"  {pair}")

# All trios
trios = list(itertools.combinations(team, 3))
print(f"\\nTrios ({len(trios)}):")
for trio in trios:
    print(f"  {trio}")`,
    output: `Pairs (6):
  ('Alice', 'Bob')
  ('Alice', 'Charlie')
  ('Alice', 'Diana')
  ('Bob', 'Charlie')
  ('Bob', 'Diana')
  ('Charlie', 'Diana')

Trios (4):
  ('Alice', 'Bob', 'Charlie')
  ('Alice', 'Bob', 'Diana')
  ('Alice', 'Charlie', 'Diana')
  ('Bob', 'Charlie', 'Diana')`,
    useCases: ['Generating pairs', 'Team assignments', 'Subset generation'],
    tags: ['combinations', 'pairs', 'subsets', 'math'],
    interactive: true,
  },
  {
    id: 'itertools-permutations',
    name: 'itertools.permutations',
    module: 'itertools',
    category: 'itertools',
    library: 'stdlib',
    difficulty: 'intermediate',
    description: 'Generate all possible r-length permutations from an iterable.',
    longDescription: 'permutations() generates all r-length permutations. Order matters (AB is different from BA). If r is not specified, uses length of iterable.',
    signature: 'itertools.permutations(iterable, r=None)',
    parameters: [
      { name: 'iterable', type: 'iterable', required: true, description: 'Source iterable' },
      { name: 'r', type: 'int', required: false, description: 'Permutation length' },
    ],
    returns: 'iterator of tuples',
    example: `import itertools

items = ['A', 'B', 'C']

# All permutations
perms = list(itertools.permutations(items))
print(f"All permutations ({len(perms)}):")
for p in perms:
    print(f"  {p}")

# 2-item permutations
perms2 = list(itertools.permutations(items, 2))
print(f"\\n2-item permutations ({len(perms2)}):")
for p in perms2:
    print(f"  {p}")`,
    output: `All permutations (6):
  ('A', 'B', 'C')
  ('A', 'C', 'B')
  ('B', 'A', 'C')
  ('B', 'C', 'A')
  ('C', 'A', 'B')
  ('C', 'B', 'A')

2-item permutations (6):
  ('A', 'B')
  ('A', 'C')
  ('B', 'A')
  ('B', 'C')
  ('C', 'A')
  ('C', 'B')`,
    useCases: ['Generating arrangements', 'Password combinations', 'Game moves'],
    tags: ['permutations', 'arrangements', 'ordering', 'math'],
    interactive: true,
  },
  {
    id: 'itertools-cycle',
    name: 'itertools.cycle',
    module: 'itertools',
    category: 'itertools',
    library: 'stdlib',
    difficulty: 'intermediate',
    description: 'Create an iterator that cycles through an iterable indefinitely.',
    longDescription: 'cycle() creates an infinite iterator that cycles through the input iterable. Useful for round-robin scheduling and alternating patterns.',
    signature: 'itertools.cycle(iterable)',
    parameters: [
      { name: 'iterable', type: 'iterable', required: true, description: 'Iterable to cycle' },
    ],
    returns: 'infinite iterator',
    example: `import itertools

colors = ["red", "green", "blue"]
color_cycle = itertools.cycle(colors)

# Get first 7 colors
for _ in range(7):
    print(next(color_cycle))

print("---")

# Round-robin task assignment
tasks = ["Task A", "Task B", "Task C"]
workers = ["Worker 1", "Worker 2"]

for task, worker in zip(tasks, itertools.cycle(workers)):
    print(f"{worker} does {task}")`,
    output: `red
green
blue
red
green
blue
red
---
Worker 1 does Task A
Worker 2 does Task B
Worker 1 does Task C`,
    useCases: ['Round-robin scheduling', 'Alternating patterns', 'Infinite loops'],
    tags: ['cycle', 'infinite', 'round-robin', 'repeat'],
    interactive: true,
  },
  {
    id: 'itertools-accumulate',
    name: 'itertools.accumulate',
    module: 'itertools',
    category: 'itertools',
    library: 'stdlib',
    difficulty: 'advanced',
    description: 'Return accumulated results of a binary function.',
    longDescription: 'accumulate() makes an iterator that returns accumulated results. By default, it adds (running total), but you can provide any binary function.',
    signature: 'itertools.accumulate(iterable[, func, *, initial=None])',
    parameters: [
      { name: 'iterable', type: 'iterable', required: true, description: 'Input iterable' },
      { name: 'func', type: 'callable', required: false, description: 'Binary function (default: add)' },
      { name: 'initial', type: 'any', required: false, description: 'Initial value' },
    ],
    returns: 'iterator',
    example: `import itertools
import operator

numbers = [1, 2, 3, 4, 5]

# Running sum (default)
sums = list(itertools.accumulate(numbers))
print(f"Running sums: {sums}")

# Running product
products = list(itertools.accumulate(numbers, operator.mul))
print(f"Running products: {products}")

# Running max
maxes = list(itertools.accumulate([3, 1, 4, 1, 5], max))
print(f"Running max: {maxes}")

# With initial value
sums_with_initial = list(itertools.accumulate(numbers, initial=100))
print(f"Sums with initial 100: {sums_with_initial}")`,
    output: `Running sums: [1, 3, 6, 10, 15]
Running products: [1, 2, 6, 24, 120]
Running max: [3, 3, 4, 4, 5]
Sums with initial 100: [100, 101, 103, 106, 110, 115]`,
    useCases: ['Running totals', 'Cumulative stats', 'Financial calculations'],
    tags: ['accumulate', 'running', 'cumulative', 'reduce'],
    interactive: true,
  },

  // ========== DATETIME ==========
  {
    id: 'datetime-now',
    name: 'datetime.datetime.now',
    module: 'datetime',
    category: 'datetime',
    library: 'stdlib',
    difficulty: 'beginner',
    description: 'Get the current local date and time.',
    longDescription: 'now() returns the current local date and time. You can optionally pass a timezone. For UTC, use datetime.utcnow() or datetime.now(timezone.utc).',
    signature: 'datetime.now(tz=None)',
    parameters: [
      { name: 'tz', type: 'tzinfo', required: false, description: 'Timezone' },
    ],
    returns: 'datetime object',
    example: `from datetime import datetime, timezone

# Local time
now = datetime.now()
print(f"Now: {now}")
print(f"Year: {now.year}")
print(f"Month: {now.month}")
print(f"Day: {now.day}")
print(f"Hour: {now.hour}")
print(f"Minute: {now.minute}")

# UTC time
utc_now = datetime.now(timezone.utc)
print(f"\\nUTC: {utc_now}")`,
    output: `Now: 2026-01-30 14:32:15.123456
Year: 2026
Month: 1
Day: 30
Hour: 14
Minute: 32

UTC: 2026-01-30 14:32:15.123456+00:00`,
    useCases: ['Timestamps', 'Logging', 'Session tracking'],
    tags: ['time', 'current', 'now', 'timestamp'],
    interactive: true,
  },
  {
    id: 'datetime-timedelta',
    name: 'datetime.timedelta',
    module: 'datetime',
    category: 'datetime',
    library: 'stdlib',
    difficulty: 'beginner',
    description: 'Represent a duration, the difference between two dates or times.',
    longDescription: 'timedelta represents a duration in days, seconds, and microseconds. It\'s used for date arithmetic like adding days or subtracting hours.',
    signature: 'timedelta(days=0, seconds=0, microseconds=0, milliseconds=0, minutes=0, hours=0, weeks=0)',
    parameters: [
      { name: 'days', type: 'int', required: false, default: '0', description: 'Days' },
      { name: 'seconds', type: 'int', required: false, default: '0', description: 'Seconds' },
      { name: 'hours', type: 'int', required: false, default: '0', description: 'Hours' },
      { name: 'weeks', type: 'int', required: false, default: '0', description: 'Weeks' },
    ],
    returns: 'timedelta object',
    example: `from datetime import datetime, timedelta

now = datetime.now()

# Future dates
future = now + timedelta(days=7)
print(f"Next week: {future.strftime('%Y-%m-%d')}")

# Past dates
past = now - timedelta(hours=3)
print(f"3 hours ago: {past.strftime('%H:%M')}")

# Duration between dates
deadline = datetime(2026, 12, 31)
remaining = deadline - now
print(f"Days until deadline: {remaining.days}")`,
    output: `Next week: 2026-02-06
3 hours ago: 11:32
Days until deadline: 335`,
    useCases: ['Date arithmetic', 'Deadlines', 'Scheduling'],
    tags: ['duration', 'time', 'difference', 'arithmetic'],
    interactive: true,
  },
  {
    id: 'datetime-strftime',
    name: 'datetime.strftime',
    module: 'datetime',
    category: 'datetime',
    library: 'stdlib',
    difficulty: 'beginner',
    description: 'Format a datetime object as a string using format codes.',
    longDescription: 'strftime() formats dates using format codes like %Y for year, %m for month, etc. It\'s the most flexible way to format dates in Python.',
    signature: 'datetime.strftime(format)',
    parameters: [
      { name: 'format', type: 'str', required: true, description: 'Format string' },
    ],
    returns: 'str',
    example: `from datetime import datetime

now = datetime.now()

# Common formats
print(now.strftime("%Y-%m-%d"))           # ISO date
print(now.strftime("%A, %B %d, %Y"))      # Full date
print(now.strftime("%I:%M %p"))           # 12-hour time
print(now.strftime("%d/%m/%Y %H:%M"))     # European format

# Custom format
print(now.strftime("Today is %A, %B %d"))`,
    output: `2026-01-30
Friday, January 30, 2026
02:32 PM
30/01/2026 14:32
Today is Friday, January 30`,
    useCases: ['Display formatting', 'File naming', 'API responses'],
    tags: ['format', 'string', 'display', 'output'],
    interactive: true,
  },
  {
    id: 'datetime-isoweekday',
    name: 'datetime.isoweekday',
    module: 'datetime',
    category: 'datetime',
    library: 'stdlib',
    difficulty: 'beginner',
    description: 'Return the day of the week as an integer (Monday=1, Sunday=7).',
    longDescription: 'isoweekday() follows the ISO 8601 standard where Monday is 1 and Sunday is 7. Use weekday() for Monday=0 version.',
    signature: 'datetime.isoweekday()',
    parameters: [],
    returns: 'int (1-7)',
    example: `from datetime import datetime

dates = [
    datetime(2026, 1, 26),  # Monday
    datetime(2026, 1, 30),  # Friday
    datetime(2026, 2, 1),   # Sunday
]

for d in dates:
    weekday_name = d.strftime('%A')
    iso_day = d.isoweekday()
    print(f"{weekday_name}: ISO day {iso_day}")

# Check if weekday
print(f"\\nIs today a weekday? {dates[0].isoweekday() <= 5}")`,
    output: `Monday: ISO day 1
Friday: ISO day 5
Sunday: ISO day 7

Is today a weekday? True`,
    useCases: ['Business day logic', 'Scheduling', 'Week calculations'],
    tags: ['weekday', 'day', 'iso', 'calendar'],
    interactive: true,
  },

  // ========== MATH ==========
  {
    id: 'math-comb',
    name: 'math.comb',
    module: 'math',
    category: 'math',
    library: 'stdlib',
    difficulty: 'intermediate',
    description: 'Return the number of ways to choose k items from n without repetition.',
    longDescription: 'comb() calculates "n choose k" - the number of combinations. It\'s useful for probability, statistics, and combinatorial problems.',
    signature: 'math.comb(n, k)',
    parameters: [
      { name: 'n', type: 'int', required: true, description: 'Total items' },
      { name: 'k', type: 'int', required: true, description: 'Items to choose' },
    ],
    returns: 'int',
    example: `import math

# How many ways to choose 3 people from 10?
teams = math.comb(10, 3)
print(f"Ways to form team of 3 from 10: {teams}")

# Lottery odds (choose 6 from 49)
lottery = math.comb(49, 6)
print(f"Lottery combinations: {lottery:,}")

# Pascal's triangle row
row = [math.comb(5, k) for k in range(6)]
print(f"Pascal's triangle row 5: {row}")`,
    output: `Ways to form team of 3 from 10: 120
Lottery combinations: 13,983,816
Pascal's triangle row 5: [1, 5, 10, 10, 5, 1]`,
    useCases: ['Combinatorics', 'Probability', 'Statistics'],
    tags: ['combinations', 'math', 'probability', 'choose'],
    interactive: true,
  },
  {
    id: 'math-gcd',
    name: 'math.gcd',
    module: 'math',
    category: 'math',
    library: 'stdlib',
    difficulty: 'intermediate',
    description: 'Return the greatest common divisor of two or more integers.',
    longDescription: 'gcd() returns the largest positive integer that divides all the input integers. Python 3.9+ supports more than two arguments.',
    signature: 'math.gcd(*integers)',
    parameters: [
      { name: '*integers', type: 'int', required: true, description: 'Integers to find GCD of' },
    ],
    returns: 'int',
    example: `import math

# Simplify fraction 18/24
g = math.gcd(18, 24)
numerator = 18 // g
denominator = 24 // g
print(f"18/24 = {numerator}/{denominator}")

# GCD of multiple numbers
print(f"GCD(48, 180, 240) = {math.gcd(48, 180, 240)}")

# Check if coprime (GCD = 1)
a, b = 17, 24
print(f"Are {a} and {b} coprime? {math.gcd(a, b) == 1}")`,
    output: `18/24 = 3/4
GCD(48, 180, 240) = 12
Are 17 and 24 coprime? True`,
    useCases: ['Fraction simplification', 'Cryptography', 'Number theory'],
    tags: ['gcd', 'math', 'number-theory', 'fraction'],
    interactive: true,
  },
  {
    id: 'math-isclose',
    name: 'math.isclose',
    module: 'math',
    category: 'math',
    library: 'stdlib',
    difficulty: 'intermediate',
    description: 'Return True if two values are close to each other.',
    longDescription: 'isclose() compares two floats for approximate equality. It uses both relative and absolute tolerance to handle numbers of different magnitudes.',
    signature: 'math.isclose(a, b, *, rel_tol=1e-09, abs_tol=0.0)',
    parameters: [
      { name: 'a', type: 'float', required: true, description: 'First value' },
      { name: 'b', type: 'float', required: true, description: 'Second value' },
      { name: 'rel_tol', type: 'float', required: false, default: '1e-09', description: 'Relative tolerance' },
      { name: 'abs_tol', type: 'float', required: false, default: '0.0', description: 'Absolute tolerance' },
    ],
    returns: 'bool',
    example: `import math

# Classic floating point problem
a = 0.1 + 0.2
b = 0.3

print(f"a == b: {a == b}")
print(f"a = {a:.17f}")
print(f"b = {b:.17f}")
print(f"isclose: {math.isclose(a, b)}")

# Custom tolerance for larger numbers
print(f"\\nWithin 1%: {math.isclose(100, 101, rel_tol=0.01)}")

# Absolute tolerance for near-zero
print(f"Near zero: {math.isclose(1e-10, 0, abs_tol=1e-09)}")`,
    output: `a == b: False
a = 0.30000000000000004
b = 0.29999999999999999
isclose: True

Within 1%: True
Near zero: True`,
    useCases: ['Floating-point comparison', 'Scientific computing', 'Unit tests'],
    tags: ['float', 'compare', 'tolerance', 'epsilon'],
    interactive: true,
  },
  {
    id: 'math-sqrt',
    name: 'math.sqrt',
    module: 'math',
    category: 'math',
    library: 'stdlib',
    difficulty: 'beginner',
    description: 'Return the square root of a number.',
    longDescription: 'sqrt() returns the square root of x. For negative inputs, it raises ValueError. Use cmath.sqrt() for complex results.',
    signature: 'math.sqrt(x)',
    parameters: [
      { name: 'x', type: 'float or int', required: true, description: 'Number to find square root of' },
    ],
    returns: 'float',
    example: `import math

# Basic square roots
print(f"√16 = {math.sqrt(16)}")
print(f"√2 = {math.sqrt(2):.6f}")

# Pythagorean theorem
a, b = 3, 4
c = math.sqrt(a**2 + b**2)
print(f"\\n3-4-5 triangle hypotenuse: {c}")

# Distance between points
x1, y1 = 1, 2
x2, y2 = 4, 6
distance = math.sqrt((x2-x1)**2 + (y2-y1)**2)
print(f"Distance: {distance:.2f}")`,
    output: `√16 = 4.0
√2 = 1.414214

3-4-5 triangle hypotenuse: 5.0
Distance: 5.00`,
    useCases: ['Geometry', 'Physics calculations', 'Statistics'],
    tags: ['sqrt', 'root', 'math', 'geometry'],
    interactive: true,
  },

  // ========== RANDOM ==========
  {
    id: 'random-sample',
    name: 'random.sample',
    module: 'random',
    category: 'random',
    library: 'stdlib',
    difficulty: 'beginner',
    description: 'Return a k-length list of unique elements chosen from the population.',
    longDescription: 'sample() returns a list of unique elements chosen randomly. It\'s used for random sampling without replacement.',
    signature: 'random.sample(population, k, *, counts=None)',
    parameters: [
      { name: 'population', type: 'sequence or set', required: true, description: 'Source population' },
      { name: 'k', type: 'int', required: true, description: 'Number of items to select' },
    ],
    returns: 'list',
    example: `import random

# Random sample from list
deck = list(range(1, 53))  # 52 cards
hand = random.sample(deck, 5)
print(f"Your hand: {hand}")

# Random team selection
team = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank"]
presenters = random.sample(team, 3)
print(f"Presenters: {presenters}")

# Sample with replacement using choices
rolls = random.choices([1, 2, 3, 4, 5, 6], k=5)
print(f"Dice rolls: {rolls}")`,
    output: `Your hand: [7, 23, 41, 15, 3]
Presenters: ['Charlie', 'Alice', 'Frank']
Dice rolls: [3, 6, 2, 4, 1]`,
    useCases: ['Random selection', 'Lottery draws', 'A/B testing'],
    tags: ['sample', 'random', 'selection', 'shuffle'],
    interactive: true,
  },
  {
    id: 'random-choices',
    name: 'random.choices',
    module: 'random',
    category: 'random',
    library: 'stdlib',
    difficulty: 'beginner',
    description: 'Return a k-sized list of elements chosen with replacement.',
    longDescription: 'choices() selects elements randomly with replacement, meaning the same element can be selected multiple times. Supports weighted selection.',
    signature: 'random.choices(population, weights=None, *, cum_weights=None, k=1)',
    parameters: [
      { name: 'population', type: 'sequence', required: true, description: 'Source population' },
      { name: 'weights', type: 'list', required: false, description: 'Relative weights' },
      { name: 'k', type: 'int', required: false, default: '1', description: 'Number of selections' },
    ],
    returns: 'list',
    example: `import random

# Roll a die 10 times
rolls = random.choices([1, 2, 3, 4, 5, 6], k=10)
print(f"Rolls: {rolls}")

# Weighted selection (70% red, 20% green, 10% blue)
colors = ["red", "green", "blue"]
weighted = random.choices(colors, weights=[70, 20, 10], k=8)
print(f"Weighted: {weighted}")

# Bootstrap sampling (sampling with replacement)
data = [1, 2, 3, 4, 5]
bootstrap = random.choices(data, k=len(data))
print(f"Bootstrap: {bootstrap}")`,
    output: `Rolls: [3, 6, 2, 4, 1, 5, 3, 2, 6, 4]
Weighted: ['red', 'red', 'green', 'red', 'red', 'blue', 'red', 'red']
Bootstrap: [2, 5, 2, 1, 4]`,
    useCases: ['Weighted random', 'Dice rolls', 'Bootstrap sampling'],
    tags: ['choices', 'weighted', 'random', 'replacement'],
    interactive: true,
  },
  {
    id: 'random-shuffle',
    name: 'random.shuffle',
    module: 'random',
    category: 'random',
    library: 'stdlib',
    difficulty: 'beginner',
    description: 'Shuffle the sequence in place.',
    longDescription: 'shuffle() randomly reorders the elements of a list in place. It modifies the original list and returns None.',
    signature: 'random.shuffle(x)',
    parameters: [
      { name: 'x', type: 'list', required: true, description: 'List to shuffle' },
    ],
    returns: 'None',
    example: `import random

# Shuffle a deck
cards = ['A♠', 'K♠', 'Q♠', 'J♠', '10♠']
random.shuffle(cards)
print(f"Shuffled: {cards}")

# Shuffle with seed for reproducibility
random.seed(42)
items = [1, 2, 3, 4, 5]
random.shuffle(items)
print(f"Seeded shuffle: {items}")

# Shuffle again with same seed
random.seed(42)
items2 = [1, 2, 3, 4, 5]
random.shuffle(items2)
print(f"Same seed, same result: {items2}")`,
    output: `Shuffled: ['Q♠', 'A♠', '10♠', 'K♠', 'J♠']
Seeded shuffle: [3, 1, 5, 4, 2]
Same seed, same result: [3, 1, 5, 4, 2]`,
    useCases: ['Card games', 'Playlist shuffling', 'Randomizing order'],
    tags: ['shuffle', 'randomize', 'reorder', 'mix'],
    interactive: true,
  },
  {
    id: 'random-randint',
    name: 'random.randint',
    module: 'random',
    category: 'random',
    library: 'stdlib',
    difficulty: 'beginner',
    description: 'Return a random integer between a and b (inclusive).',
    longDescription: 'randint(a, b) returns a random integer N such that a <= N <= b. Both endpoints are included.',
    signature: 'random.randint(a, b)',
    parameters: [
      { name: 'a', type: 'int', required: true, description: 'Lower bound (inclusive)' },
      { name: 'b', type: 'int', required: true, description: 'Upper bound (inclusive)' },
    ],
    returns: 'int',
    example: `import random

# Roll a 6-sided die
die = random.randint(1, 6)
print(f"Rolled: {die}")

# Random year
year = random.randint(1900, 2026)
print(f"Random year: {year}")

# Coin flip
coin = random.randint(0, 1)
result = "Heads" if coin == 1 else "Tails"
print(f"Coin: {result}")

# Multiple random integers
lottery = [random.randint(1, 49) for _ in range(6)]
print(f"Lottery numbers: {lottery}")`,
    output: `Rolled: 4
Random year: 1987
Coin: Heads
Lottery numbers: [7, 23, 41, 15, 3, 38]`,
    useCases: ['Dice rolls', 'Random numbers', 'Games'],
    tags: ['random', 'integer', 'dice', 'game'],
    interactive: true,
  },

  // ========== COLLECTIONS ==========
  {
    id: 'collections-counter',
    name: 'collections.Counter',
    module: 'collections',
    category: 'collections',
    library: 'stdlib',
    difficulty: 'beginner',
    description: 'A dict subclass for counting hashable objects.',
    longDescription: 'Counter is a dictionary where elements are stored as keys and their counts as values. It\'s perfect for counting occurrences.',
    signature: 'collections.Counter([iterable-or-mapping])',
    parameters: [
      { name: 'iterable', type: 'iterable', required: false, description: 'Elements to count' },
    ],
    returns: 'Counter object',
    example: `from collections import Counter

# Count words
words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
counts = Counter(words)

print(f"All counts: {counts}")
print(f"Most common: {counts.most_common(2)}")
print(f"Apple count: {counts['apple']}")
print(f"Grape count: {counts['grape']}")  # Returns 0, not KeyError

# Count characters in a string
char_count = Counter("mississippi")
print(f"\\nLetters: {char_count}")`,
    output: `All counts: Counter({'apple': 3, 'banana': 2, 'cherry': 1})
Most common: [('apple', 3), ('banana', 2)]
Apple count: 3
Grape count: 0

Letters: Counter({'i': 4, 's': 4, 'p': 2, 'm': 1})`,
    useCases: ['Word counting', 'Frequency analysis', 'Voting systems'],
    tags: ['count', 'frequency', 'histogram', 'stats'],
    interactive: true,
  },
  {
    id: 'collections-defaultdict',
    name: 'collections.defaultdict',
    module: 'collections',
    category: 'collections',
    library: 'stdlib',
    difficulty: 'intermediate',
    description: 'A dict subclass that calls a factory function to supply missing values.',
    longDescription: 'defaultdict automatically creates default values for missing keys using a factory function. No more KeyError!',
    signature: 'collections.defaultdict(default_factory=None)',
    parameters: [
      { name: 'default_factory', type: 'callable', required: false, description: 'Factory for default values' },
    ],
    returns: 'defaultdict object',
    example: `from collections import defaultdict

# Group by first letter
words = ["apple", "apricot", "banana", "blueberry", "cherry"]
groups = defaultdict(list)

for word in words:
    groups[word[0]].append(word)

print(dict(groups))

# Count with default 0
counts = defaultdict(int)
for word in words:
    counts[word[0]] += 1

print(f"\\nLetter counts: {dict(counts)}")

# Nested defaultdict
nested = defaultdict(lambda: defaultdict(int))
nested['a']['b'] = 1
print(f"\\nNested: {dict(nested)}")`,
    output: `{'a': ['apple', 'apricot'], 'b': ['banana', 'blueberry'], 'c': ['cherry']}

Letter counts: {'a': 2, 'b': 2, 'c': 1}

Nested: defaultdict(<function>, {'a': defaultdict(<class 'int'>, {'b': 1})})`,
    useCases: ['Grouping data', 'Building indexes', 'Nested dictionaries'],
    tags: ['default', 'dict', 'group', 'auto-create'],
    interactive: true,
  },
  {
    id: 'collections-deque',
    name: 'collections.deque',
    module: 'collections',
    category: 'collections',
    library: 'stdlib',
    difficulty: 'intermediate',
    description: 'A list-like container with fast appends and pops on both ends.',
    longDescription: 'deque (double-ended queue) is optimized for operations at both ends. It\'s O(1) for append/pop at either end vs O(n) for lists.',
    signature: 'collections.deque([iterable[, maxlen]])',
    parameters: [
      { name: 'iterable', type: 'iterable', required: false, description: 'Initial items' },
      { name: 'maxlen', type: 'int', required: false, description: 'Maximum size' },
    ],
    returns: 'deque object',
    example: `from collections import deque

# Basic deque
d = deque([1, 2, 3])
d.append(4)        # Add to right
d.appendleft(0)    # Add to left
print(f"After appends: {list(d)}")

# Pop from both ends
right = d.pop()
left = d.popleft()
print(f"Popped {left} and {right}, remaining: {list(d)}")

# Fixed-size deque (circular buffer)
history = deque(maxlen=3)
for i in range(5):
    history.append(i)
    print(f"After adding {i}: {list(history)}")`,
    output: `After appends: [0, 1, 2, 3, 4]
Popped 0 and 4, remaining: [1, 2, 3]
After adding 0: [0]
After adding 1: [0, 1]
After adding 2: [0, 1, 2]
After adding 3: [1, 2, 3]
After adding 4: [2, 3, 4]`,
    useCases: ['Queues', 'Stacks', 'Sliding windows', 'History'],
    tags: ['queue', 'stack', 'deque', 'efficient'],
    interactive: true,
  },

  // ========== FUNCTOOLS ==========
  {
    id: 'functools-lru-cache',
    name: 'functools.lru_cache',
    module: 'functools',
    category: 'functools',
    library: 'stdlib',
    difficulty: 'advanced',
    description: 'Decorator that caches the results of function calls.',
    longDescription: 'lru_cache memoizes function results, storing the most recently used calls. Dramatically speeds up recursive and expensive functions.',
    signature: '@functools.lru_cache(maxsize=128, typed=False)',
    parameters: [
      { name: 'maxsize', type: 'int', required: false, default: '128', description: 'Cache size limit' },
      { name: 'typed', type: 'bool', required: false, default: 'False', description: 'Separate caches by type' },
    ],
    returns: 'decorator',
    example: `from functools import lru_cache

@lru_cache(maxsize=None)
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# First call computes
print(f"Fib(100) = {fibonacci(100)}")

# Second call returns instantly from cache
print(f"Fib(100) cached = {fibonacci(100)}")

# View cache info
print(f"\\nCache info: {fibonacci.cache_info()}")

# Clear cache
fibonacci.cache_clear()`,
    output: `Fib(100) = 354224848179261915075
Fib(100) cached = 354224848179261915075

Cache info: CacheInfo(hits=98, misses=101, maxsize=None, currsize=101)`,
    useCases: ['Memoization', 'Recursive optimization', 'API call caching'],
    tags: ['cache', 'memoize', 'optimize', 'performance'],
    interactive: true,
  },
  {
    id: 'functools-partial',
    name: 'functools.partial',
    module: 'functools',
    category: 'functools',
    library: 'stdlib',
    difficulty: 'intermediate',
    description: 'Create a new function with partial application of arguments.',
    longDescription: 'partial() "freezes" some arguments of a function, creating a new function with fewer parameters. Great for creating specialized functions.',
    signature: 'functools.partial(func, *args, **keywords)',
    parameters: [
      { name: 'func', type: 'callable', required: true, description: 'Function to wrap' },
      { name: '*args', type: 'any', required: false, description: 'Positional arguments to freeze' },
      { name: '**keywords', type: 'any', required: false, description: 'Keyword arguments to freeze' },
    ],
    returns: 'partial object',
    example: `from functools import partial

# Create custom power functions
square = partial(pow, 2)
cube = partial(pow, 3)

print(f"2^3 = {square(3)}")
print(f"3^4 = {cube(4)}")

# Fix function arguments
basetwo = partial(int, base=2)
print(f"\\nBinary 1010 = {basetwo('1010')}")
print(f"Binary 1111 = {basetwo('1111')}")

# With multiple frozen args
multiply_by_10 = partial(lambda x, y: x * y, 10)
print(f"\\n10 * 5 = {multiply_by_10(5)}")`,
    output: `2^3 = 8
3^4 = 81

Binary 1010 = 10
Binary 1111 = 15

10 * 5 = 50`,
    useCases: ['Creating specialized functions', 'Callback handlers', 'API wrappers'],
    tags: ['partial', 'curry', 'bind', 'specialize'],
    interactive: true,
  },
];

// Import third-party functions
import { thirdPartyFunctions, thirdPartyLibraries } from './thirdPartyFunctions';
import { additionalFunctions, moreLibraries } from './moreLibraries';

// Combine all functions
export const pythonFunctions: PythonFunction[] = [
  ...stdlibFunctions, 
  ...thirdPartyFunctions,
  ...additionalFunctions,
];

// ============================================
// CATEGORIES
// ============================================

export const categories: Category[] = [
  { id: 'all', label: 'All', library: 'stdlib', color: '#E94E77' },
  { id: 'built-in', label: 'Built-in', library: 'stdlib', color: '#4B6BFB' },
  { id: 'strings', label: 'Strings', library: 'stdlib', color: '#FFD166' },
  { id: 'itertools', label: 'Itertools', library: 'stdlib', color: '#C9E8D8' },
  { id: 'datetime', label: 'Datetime', library: 'stdlib', color: '#F4A6C3' },
  { id: 'math', label: 'Math', library: 'stdlib', color: '#F6D7C3' },
  { id: 'random', label: 'Random', library: 'stdlib', color: '#9B5DE5' },
  { id: 'collections', label: 'Collections', library: 'stdlib', color: '#00BBF9' },
  { id: 'functools', label: 'Functools', library: 'stdlib', color: '#00F5D4' },
  { id: 'numpy', label: 'NumPy', library: 'third-party', package: 'numpy', color: '#4B8BBE' },
  { id: 'pandas', label: 'Pandas', library: 'third-party', package: 'pandas', color: '#E70488' },
  { id: 'requests', label: 'Requests', library: 'third-party', package: 'requests', color: '#1D5C87' },
  { id: 'json', label: 'JSON', library: 'stdlib', color: '#4B8BBE' },
  { id: 'regex', label: 'Regex', library: 'stdlib', color: '#9B5DE5' },
  { id: 'web-scraping', label: 'Web Scraping', library: 'third-party', package: 'beautifulsoup4', color: '#8BC34A' },
];

// ============================================
// LIBRARIES
// ============================================

export const libraries: Library[] = [
  {
    id: 'stdlib',
    name: 'Python Standard Library',
    description: 'Built-in modules that come with every Python installation. No installation required.',
    emoji: '🐍',
    installCommand: '',
    color: '#4B6BFB',
  },
  ...thirdPartyLibraries,
  ...moreLibraries,
];

// ============================================
// LEARNING PATHS
// ============================================

export const learningPaths: LearningPath[] = [
  {
    id: 'python-basics',
    name: 'Python Basics',
    description: 'Master the essential built-in functions every Python developer needs.',
    emoji: '🌱',
    difficulty: 'beginner',
    functions: ['print', 'len', 'type', 'range', 'zip', 'enumerate'],
    estimatedHours: 3,
    color: '#C9E8D8',
  },
  {
    id: 'string-master',
    name: 'String Master',
    description: 'Become proficient at text manipulation and string operations.',
    emoji: '📝',
    difficulty: 'beginner',
    functions: ['str-split', 'str-join', 'str-strip', 'str-replace', 'str-find', 'str-startswith', 'f-strings'],
    estimatedHours: 4,
    color: '#FFD166',
  },
  {
    id: 'data-wrangler',
    name: 'Data Wrangler',
    description: 'Learn powerful tools for processing and transforming data.',
    emoji: '🔧',
    difficulty: 'intermediate',
    functions: ['map', 'filter', 'sorted', 'itertools-chain', 'collections-counter', 'collections-defaultdict'],
    estimatedHours: 5,
    color: '#F4A6C3',
  },
  {
    id: 'algorithm-pro',
    name: 'Algorithm Pro',
    description: 'Advanced functions for algorithms and performance optimization.',
    emoji: '⚡',
    difficulty: 'advanced',
    functions: ['itertools-groupby', 'itertools-combinations', 'itertools-permutations', 'functools-lru-cache', 'math-comb'],
    estimatedHours: 6,
    color: '#E94E77',
  },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

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

export function getFunctionById(id: string): PythonFunction | undefined {
  return pythonFunctions.find(f => f.id === id);
}

export function getFunctionsByCategory(category: string): PythonFunction[] {
  if (category === 'all') return pythonFunctions;
  return pythonFunctions.filter(f => f.category === category);
}

export function getFunctionsByDifficulty(difficulty: string): PythonFunction[] {
  return pythonFunctions.filter(f => f.difficulty === difficulty);
}

export function searchFunctions(query: string): PythonFunction[] {
  const lowerQuery = query.toLowerCase();
  return pythonFunctions.filter(f => 
    f.name.toLowerCase().includes(lowerQuery) ||
    f.description.toLowerCase().includes(lowerQuery) ||
    f.module.toLowerCase().includes(lowerQuery) ||
    f.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function getRelatedFunctions(functionId: string): PythonFunction[] {
  const func = getFunctionById(functionId);
  if (!func || !func.relatedFunctions) return [];
  return func.relatedFunctions.map(id => getFunctionById(id)).filter(Boolean) as PythonFunction[];
}

export function getLearningPath(id: string): LearningPath | undefined {
  return learningPaths.find(p => p.id === id);
}
