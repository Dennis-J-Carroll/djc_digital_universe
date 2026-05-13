import type { PythonFunction, Library } from '../types';

// ============================================
// JSON FUNCTIONS
// ============================================

export const jsonFunctions: PythonFunction[] = [
  {
    id: 'json-loads',
    name: 'json.loads',
    module: 'json',
    category: 'json',
    library: 'stdlib',
    difficulty: 'beginner',
    description: 'Parse a JSON string into a Python object.',
    longDescription: 'loads() (load string) parses a JSON-formatted string and converts it into a Python dictionary, list, or other appropriate Python data type.',
    signature: 'json.loads(s, *, cls=None, object_hook=None, parse_float=None, parse_int=None, parse_constant=None, object_pairs_hook=None)',
    parameters: [
      { name: 's', type: 'str', required: true, description: 'JSON string to parse' },
    ],
    returns: 'Python object (dict, list, etc.)',
    example: `import json

# Parse JSON string
json_str = '{"name": "Alice", "age": 30, "city": "NYC"}'
data = json.loads(json_str)

print(f"Type: {type(data)}")
print(f"Name: {data['name']}")
print(f"Age: {data['age']}")

# Parse JSON array
json_array = '[1, 2, 3, "hello", true]'
arr = json.loads(json_array)
print(f"\\nArray: {arr}")`,
    output: `Type: <class 'dict'>
Name: Alice
Age: 30

Array: [1, 2, 3, 'hello', True]`,
    useCases: ['Parsing API responses', 'Reading JSON files', 'Data interchange'],
    tags: ['json', 'parse', 'deserialize', 'load'],
    interactive: true,
  },
  {
    id: 'json-dumps',
    name: 'json.dumps',
    module: 'json',
    category: 'json',
    library: 'stdlib',
    difficulty: 'beginner',
    description: 'Serialize a Python object to a JSON string.',
    longDescription: 'dumps() (dump string) converts a Python object into a JSON-formatted string. It\'s the inverse of loads().',
    signature: 'json.dumps(obj, *, skipkeys=False, ensure_ascii=True, check_circular=True, allow_nan=True, cls=None, indent=None, separators=None, default=None, sort_keys=False)',
    parameters: [
      { name: 'obj', type: 'any', required: true, description: 'Python object to serialize' },
      { name: 'indent', type: 'int or str', required: false, description: 'Indentation for pretty-printing' },
      { name: 'sort_keys', type: 'bool', required: false, default: 'False', description: 'Sort dictionary keys' },
    ],
    returns: 'str: JSON string',
    example: `import json

# Python dictionary
data = {
    "name": "Alice",
    "age": 30,
    "hobbies": ["reading", "coding"],
    "active": True
}

# Convert to JSON string
json_str = json.dumps(data)
print(f"Compact: {json_str}")

# Pretty-print with indentation
pretty = json.dumps(data, indent=2)
print(f"\\nPretty:\\n{pretty}")

# Sort keys
sorted_json = json.dumps(data, indent=2, sort_keys=True)
print(f"\\nSorted keys:\\n{sorted_json}")`,
    output: `Compact: {"name": "Alice", "age": 30, "hobbies": ["reading", "coding"], "active": true}

Pretty:
{
  "name": "Alice",
  "age": 30,
  "hobbies": [
    "reading",
    "coding"
  ],
  "active": true
}

Sorted keys:
{
  "active": true,
  "age": 30,
  "hobbies": [
    "reading",
    "coding"
  ],
  "name": "Alice"
}`,
    useCases: ['API responses', 'Saving data', 'Pretty-printing JSON', 'Data interchange'],
    tags: ['json', 'serialize', 'dump', 'stringify'],
    interactive: true,
  },
];

// ============================================
// REGEX (RE) FUNCTIONS
// ============================================

export const regexFunctions: PythonFunction[] = [
  {
    id: 're-search',
    name: 're.search',
    module: 're',
    category: 'regex',
    library: 'stdlib',
    difficulty: 'intermediate',
    description: 'Scan through a string looking for a match to the pattern.',
    longDescription: 'search() looks for the pattern anywhere in the string (not just at the beginning) and returns a Match object if found, or None if not.',
    signature: 're.search(pattern, string, flags=0)',
    parameters: [
      { name: 'pattern', type: 'str', required: true, description: 'Regular expression pattern' },
      { name: 'string', type: 'str', required: true, description: 'String to search' },
      { name: 'flags', type: 'int', required: false, default: '0', description: 'Regex flags' },
    ],
    returns: 'Match object or None',
    example: `import re

# Search for a pattern
text = "The quick brown fox jumps over the lazy dog"

# Find 'fox'
match = re.search(r"fox", text)
if match:
    print(f"Found '{match.group()}' at position {match.start()}-{match.end()}")

# Search for digits
result = re.search(r"\\d+", "abc123def")
if result:
    print(f"\\nFound digits: {result.group()}")

# Pattern not found
no_match = re.search(r"cat", text)
print(f"\\n'cat' found: {no_match is not None}")`,
    output: `Found 'fox' at position 16-19

Found digits: 123

'cat' found: False`,
    useCases: ['Pattern matching', 'Validation', 'Text extraction', 'Log parsing'],
    tags: ['regex', 'search', 'pattern', 'match'],
    interactive: true,
  },
  {
    id: 're-findall',
    name: 're.findall',
    module: 're',
    category: 'regex',
    library: 'stdlib',
    difficulty: 'intermediate',
    description: 'Return all non-overlapping matches of pattern in string.',
    longDescription: 'findall() returns a list of all matches of the pattern in the string. If the pattern has groups, it returns a list of groups.',
    signature: 're.findall(pattern, string, flags=0)',
    parameters: [
      { name: 'pattern', type: 'str', required: true, description: 'Regular expression pattern' },
      { name: 'string', type: 'str', required: true, description: 'String to search' },
    ],
    returns: 'list of matches',
    example: `import re

# Find all words
text = "The quick brown fox"
words = re.findall(r"\\w+", text)
print(f"Words: {words}")

# Find all numbers
data = "Prices: $10, $25, $50, $100"
numbers = re.findall(r"\\d+", data)
print(f"\\nNumbers: {numbers}")

# Find all email addresses (simple pattern)
text2 = "Contact: alice@email.com or bob@test.org"
emails = re.findall(r"[\\w.-]+@[\\w.-]+\\.\\w+", text2)
print(f"\\nEmails: {emails}")

# Find words starting with 'b'
b_words = re.findall(r"\\bb\\w+", text, re.IGNORECASE)
print(f"\\nWords starting with 'b': {b_words}")`,
    output: `Words: ['The', 'quick', 'brown', 'fox']

Numbers: ['10', '25', '50', '100']

Emails: ['alice@email.com', 'bob@test.org']

Words starting with 'b': ['brown']`,
    useCases: ['Extracting data', 'Tokenization', 'Parsing', 'Data mining'],
    tags: ['regex', 'findall', 'extract', 'all-matches'],
    interactive: true,
  },
  {
    id: 're-sub',
    name: 're.sub',
    module: 're',
    category: 'regex',
    library: 'stdlib',
    difficulty: 'intermediate',
    description: 'Replace occurrences of a pattern with a replacement string.',
    longDescription: 'sub() (substitute) replaces all occurrences of the pattern with the replacement string. It\'s like str.replace() but with regex power.',
    signature: 're.sub(pattern, repl, string, count=0, flags=0)',
    parameters: [
      { name: 'pattern', type: 'str', required: true, description: 'Pattern to find' },
      { name: 'repl', type: 'str or function', required: true, description: 'Replacement string' },
      { name: 'string', type: 'str', required: true, description: 'String to modify' },
      { name: 'count', type: 'int', required: false, default: '0', description: 'Max replacements (0=all)' },
    ],
    returns: 'str: Modified string',
    example: `import re

# Replace all digits with '#'
text = "Phone: 123-456-7890"
masked = re.sub(r"\\d", "#", text)
print(f"Masked: {masked}")

# Replace multiple spaces with single space
messy = "Too    many    spaces"
clean = re.sub(r"\\s+", " ", messy)
print(f"\\nCleaned: '{clean}'")

# Remove non-alphanumeric characters
dirty = "Hello, World! @2024"
clean2 = re.sub(r"[^\\w\\s]", "", dirty)
print(f"\\nAlphanumeric only: '{clean2}'")

# Replace only first 2 occurrences
numbers = "1 2 3 4 5"
result = re.sub(r"\\d", "X", numbers, count=2)
print(f"\\nFirst 2 replaced: {result}")`,
    output: `Masked: Phone: ###-###-####

Cleaned: 'Too many spaces'

Alphanumeric only: 'Hello World 2024'

First 2 replaced: X X 3 4 5`,
    useCases: ['Data cleaning', 'Text sanitization', 'Masking', 'Formatting'],
    tags: ['regex', 'sub', 'replace', 'substitute'],
    interactive: true,
  },
];

// ============================================
// BEAUTIFULSOUP FUNCTIONS
// ============================================

export const beautifulsoupFunctions: PythonFunction[] = [
  {
    id: 'bs4-beautifulsoup',
    name: 'BeautifulSoup',
    module: 'bs4',
    category: 'web-scraping',
    library: 'third-party',
    package: 'beautifulsoup4',
    difficulty: 'intermediate',
    description: 'Parse HTML and XML documents for web scraping.',
    longDescription: 'BeautifulSoup is the main class for parsing HTML/XML. It creates a parse tree that you can navigate and search.',
    signature: 'BeautifulSoup(markup, features=None, builder=None)',
    parameters: [
      { name: 'markup', type: 'str or file-like', required: true, description: 'HTML/XML to parse' },
      { name: 'features', type: 'str', required: false, description: 'Parser to use (html.parser, lxml, etc.)' },
    ],
    returns: 'BeautifulSoup object',
    example: `# Example (requires beautifulsoup4 installed):
# from bs4 import BeautifulSoup

# html = """
# <html>
#   <body>
#     <h1>Hello World</h1>
#     <p class="intro">This is a paragraph.</p>
#   </body>
# </html>
# """

# soup = BeautifulSoup(html, 'html.parser')
# print(soup.h1.text)  # "Hello World"
# print(soup.p['class'])  # ["intro"]

print("BeautifulSoup is a powerful HTML/XML parser for web scraping.")
print("Install: pip install beautifulsoup4")`,
    output: `BeautifulSoup is a powerful HTML/XML parser for web scraping.
Install: pip install beautifulsoup4`,
    useCases: ['Web scraping', 'HTML parsing', 'Data extraction', 'XML processing'],
    tags: ['html', 'xml', 'parse', 'scrape', 'web'],
    interactive: false,
  },
  {
    id: 'bs4-find',
    name: 'BeautifulSoup.find',
    module: 'bs4',
    category: 'web-scraping',
    library: 'third-party',
    package: 'beautifulsoup4',
    difficulty: 'intermediate',
    description: 'Find the first tag matching the given criteria.',
    longDescription: 'find() searches the parse tree and returns the first Tag object that matches the given filters.',
    signature: 'soup.find(name=None, attrs={}, recursive=True, text=None, **kwargs)',
    parameters: [
      { name: 'name', type: 'str or list', required: false, description: 'Tag name(s) to find' },
      { name: 'attrs', type: 'dict', required: false, description: 'Attribute filters' },
      { name: 'class_', type: 'str or list', required: false, description: 'CSS class(es)' },
    ],
    returns: 'Tag or None',
    example: `# Example (requires beautifulsoup4):
# from bs4 import BeautifulSoup

# html = """
# <div class="content">
#   <h1>Title</h1>
#   <p class="intro">Introduction</p>
#   <p class="body">Main content</p>
# </div>
# """

# soup = BeautifulSoup(html, 'html.parser')

# Find first <p> tag
# first_p = soup.find('p')
# print(first_p.text)  # "Introduction"

# Find by class
# intro = soup.find('p', class_='intro')
# print(intro.text)

# Find by attribute
# content_div = soup.find('div', attrs={'class': 'content'})

print("find() returns the first matching element.")
print("Use find_all() to get all matches.")`,
    output: `find() returns the first matching element.
Use find_all() to get all matches.`,
    useCases: ['Finding elements', 'Extracting data', 'Navigation'],
    tags: ['html', 'find', 'scrape', 'element'],
    interactive: false,
  },
  {
    id: 'bs4-find-all',
    name: 'BeautifulSoup.find_all',
    module: 'bs4',
    category: 'web-scraping',
    library: 'third-party',
    package: 'beautifulsoup4',
    difficulty: 'intermediate',
    description: 'Find all tags matching the given criteria.',
    longDescription: 'find_all() searches the parse tree and returns a list of all Tag objects that match the given filters.',
    signature: 'soup.find_all(name=None, attrs={}, recursive=True, text=None, limit=None, **kwargs)',
    parameters: [
      { name: 'name', type: 'str or list', required: false, description: 'Tag name(s) to find' },
      { name: 'attrs', type: 'dict', required: false, description: 'Attribute filters' },
      { name: 'limit', type: 'int', required: false, description: 'Max results to return' },
    ],
    returns: 'ResultSet (list-like)',
    example: `# Example (requires beautifulsoup4):
# from bs4 import BeautifulSoup

# html = """
# <ul>
#   <li>Item 1</li>
#   <li>Item 2</li>
#   <li>Item 3</li>
# </ul>
# """

# soup = BeautifulSoup(html, 'html.parser')

# Find all <li> tags
# items = soup.find_all('li')
# for item in items:
#     print(item.text)

# Find with limit
# first_two = soup.find_all('li', limit=2)

print("find_all() returns ALL matching elements as a list.")
print("Use list slicing or limit parameter to restrict results.")`,
    output: `find_all() returns ALL matching elements as a list.
Use list slicing or limit parameter to restrict results.`,
    useCases: ['Extracting multiple elements', 'List processing', 'Data collection'],
    tags: ['html', 'find-all', 'scrape', 'list'],
    interactive: false,
  },
];

// ============================================
// LIBRARIES INFO
// ============================================

export const moreLibraries: Library[] = [
  {
    id: 'json',
    name: 'JSON',
    description: 'Built-in module for encoding and decoding JSON data. Essential for working with APIs and configuration files.',
    emoji: '📋',
    installCommand: '',
    color: '#4B8BBE',
  },
  {
    id: 're',
    name: 'Regular Expressions',
    description: 'Built-in module for pattern matching with regular expressions. Powerful tool for text processing.',
    emoji: '🔍',
    installCommand: '',
    color: '#9B5DE5',
  },
  {
    id: 'beautifulsoup4',
    name: 'BeautifulSoup',
    description: 'Popular library for parsing HTML and XML. Makes web scraping easy and intuitive.',
    emoji: '🍲',
    installCommand: 'pip install beautifulsoup4',
    color: '#8BC34A',
  },
];

// Combine all additional functions
export const additionalFunctions: PythonFunction[] = [
  ...jsonFunctions,
  ...regexFunctions,
  ...beautifulsoupFunctions,
];
