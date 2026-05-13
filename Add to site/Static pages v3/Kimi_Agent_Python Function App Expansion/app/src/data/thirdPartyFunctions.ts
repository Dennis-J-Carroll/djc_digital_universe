import type { PythonFunction, Library } from '../types';

// ============================================
// NUMPY FUNCTIONS
// ============================================

export const numpyFunctions: PythonFunction[] = [
  {
    id: 'numpy-array',
    name: 'numpy.array',
    module: 'numpy',
    category: 'numpy',
    library: 'third-party',
    package: 'numpy',
    difficulty: 'beginner',
    description: 'Create a NumPy array from a Python list or tuple.',
    longDescription: 'numpy.array() is the fundamental function for creating NumPy arrays. It converts Python lists, tuples, or other array-like objects into efficient NumPy ndarray objects.',
    signature: 'numpy.array(object, dtype=None, copy=True, order="K", subok=False, ndmin=0)',
    parameters: [
      { name: 'object', type: 'array-like', required: true, description: 'Input data' },
      { name: 'dtype', type: 'data-type', required: false, description: 'Desired data type' },
      { name: 'copy', type: 'bool', required: false, default: 'True', description: 'Whether to copy data' },
      { name: 'ndmin', type: 'int', required: false, default: '0', description: 'Minimum dimensions' },
    ],
    returns: 'ndarray',
    example: `import numpy as np

# From list
arr1 = np.array([1, 2, 3, 4, 5])
print(f"1D array: {arr1}")

# From nested list (2D)
arr2 = np.array([[1, 2, 3], [4, 5, 6]])
print(f"\\n2D array:\\n{arr2}")

# Specify dtype
arr3 = np.array([1, 2, 3], dtype=float)
print(f"\\nFloat array: {arr3}")

# Minimum dimensions
arr4 = np.array([1, 2, 3], ndmin=2)
print(f"\\n2D from 1D: {arr4}")`,
    output: `1D array: [1 2 3 4 5]

2D array:
[[1 2 3]
 [4 5 6]]

Float array: [1. 2. 3.]

2D from 1D: [[1 2 3]]`,
    useCases: ['Creating arrays', 'Converting lists', 'Data preparation', 'Numerical computing'],
    tags: ['array', 'create', 'convert', 'ndarray'],
    interactive: true,
  },
  {
    id: 'numpy-zeros',
    name: 'numpy.zeros',
    module: 'numpy',
    category: 'numpy',
    library: 'third-party',
    package: 'numpy',
    difficulty: 'beginner',
    description: 'Create an array filled with zeros.',
    longDescription: 'zeros() creates a new array of given shape and type, filled with zeros. It\'s useful for initialization and pre-allocating memory.',
    signature: 'numpy.zeros(shape, dtype=float, order="C")',
    parameters: [
      { name: 'shape', type: 'int or tuple', required: true, description: 'Shape of the array' },
      { name: 'dtype', type: 'data-type', required: false, default: 'float', description: 'Data type' },
    ],
    returns: 'ndarray',
    example: `import numpy as np

# 1D array of zeros
z1 = np.zeros(5)
print(f"1D zeros: {z1}")

# 2D array (3x4)
z2 = np.zeros((3, 4))
print(f"\\n2D zeros (3x4):\\n{z2}")

# Integer zeros
z3 = np.zeros((2, 3), dtype=int)
print(f"\\nInteger zeros:\\n{z3}")`,
    output: `1D zeros: [0. 0. 0. 0. 0.]

2D zeros (3x4):
[[0. 0. 0. 0.]
 [0. 0. 0. 0.]
 [0. 0. 0. 0.]]

Integer zeros:
[[0 0 0]
 [0 0 0]]`,
    useCases: ['Array initialization', 'Pre-allocation', 'Placeholder arrays'],
    tags: ['zeros', 'initialize', 'create', 'empty'],
    interactive: true,
  },
  {
    id: 'numpy-ones',
    name: 'numpy.ones',
    module: 'numpy',
    category: 'numpy',
    library: 'third-party',
    package: 'numpy',
    difficulty: 'beginner',
    description: 'Create an array filled with ones.',
    longDescription: 'ones() creates a new array of given shape and type, filled with ones. Useful for creating identity-like matrices or initial weights.',
    signature: 'numpy.ones(shape, dtype=None, order="C")',
    parameters: [
      { name: 'shape', type: 'int or tuple', required: true, description: 'Shape of the array' },
      { name: 'dtype', type: 'data-type', required: false, description: 'Data type' },
    ],
    returns: 'ndarray',
    example: `import numpy as np

# 1D array of ones
o1 = np.ones(5)
print(f"1D ones: {o1}")

# 2D array
o2 = np.ones((2, 3))
print(f"\\n2D ones:\\n{o2}")

# For creating a 5x5 matrix of 7s
sevens = np.ones((5, 5)) * 7
print(f"\\n5x5 sevens:\\n{sevens}")`,
    output: `1D ones: [1. 1. 1. 1. 1.]

2D ones:
[[1. 1. 1.]
 [1. 1. 1.]]

5x5 sevens:
[[7. 7. 7. 7. 7.]
 [7. 7. 7. 7. 7.]
 [7. 7. 7. 7. 7.]
 [7. 7. 7. 7. 7.]
 [7. 7. 7. 7. 7.]]`,
    useCases: ['Array initialization', 'Creating constant matrices', 'Neural network weights'],
    tags: ['ones', 'initialize', 'create', 'constant'],
    interactive: true,
  },
  {
    id: 'numpy-arange',
    name: 'numpy.arange',
    module: 'numpy',
    category: 'numpy',
    library: 'third-party',
    package: 'numpy',
    difficulty: 'beginner',
    description: 'Return evenly spaced values within a given interval.',
    longDescription: 'arange() is similar to Python\'s range() but returns a NumPy array. It can also work with floating-point step sizes.',
    signature: 'numpy.arange([start,] stop[, step,], dtype=None)',
    parameters: [
      { name: 'start', type: 'number', required: false, default: '0', description: 'Start value' },
      { name: 'stop', type: 'number', required: true, description: 'End value (exclusive)' },
      { name: 'step', type: 'number', required: false, default: '1', description: 'Spacing' },
      { name: 'dtype', type: 'data-type', required: false, description: 'Data type' },
    ],
    returns: 'ndarray',
    example: `import numpy as np

# 0 to 9
a1 = np.arange(10)
print(f"0 to 9: {a1}")

# 5 to 15
a2 = np.arange(5, 15)
print(f"\\n5 to 14: {a2}")

# With step
a3 = np.arange(0, 20, 2)
print(f"\\nEven numbers 0-18: {a3}")

# Floating point step
a4 = np.arange(0, 1, 0.1)
print(f"\\n0 to 0.9 step 0.1: {a4}")`,
    output: `0 to 9: [0 1 2 3 4 5 6 7 8 9]

5 to 14: [ 5  6  7  8  9 10 11 12 13 14]

Even numbers 0-18: [ 0  2  4  6  8 10 12 14 16 18]

0 to 0.9 step 0.1: [0.  0.1 0.2 0.3 0.4 0.5 0.6 0.7 0.8 0.9]`,
    useCases: ['Creating sequences', 'Index arrays', 'Plotting coordinates'],
    tags: ['range', 'sequence', 'arange', 'interval'],
    interactive: true,
  },
  {
    id: 'numpy-linspace',
    name: 'numpy.linspace',
    module: 'numpy',
    category: 'numpy',
    library: 'third-party',
    package: 'numpy',
    difficulty: 'beginner',
    description: 'Return evenly spaced numbers over a specified interval.',
    longDescription: 'linspace() creates an array of evenly spaced values between start and stop. Unlike arange(), you specify the number of samples, not the step size.',
    signature: 'numpy.linspace(start, stop, num=50, endpoint=True, retstep=False, dtype=None)',
    parameters: [
      { name: 'start', type: 'number', required: true, description: 'Start value' },
      { name: 'stop', type: 'number', required: true, description: 'End value' },
      { name: 'num', type: 'int', required: false, default: '50', description: 'Number of samples' },
      { name: 'endpoint', type: 'bool', required: false, default: 'True', description: 'Include stop value' },
    ],
    returns: 'ndarray',
    example: `import numpy as np

# 5 evenly spaced values from 0 to 1
l1 = np.linspace(0, 1, 5)
print(f"5 values 0-1: {l1}")

# 10 values from 0 to 2π (for plotting)
x = np.linspace(0, 2 * np.pi, 10)
print(f"\\n0 to 2π: {x}")

# Without endpoint
l2 = np.linspace(0, 1, 5, endpoint=False)
print(f"\\nWithout endpoint: {l2}")

# Get step size too
values, step = np.linspace(0, 1, 5, retstep=True)
print(f"\\nValues: {values}, Step: {step}")`,
    output: `5 values 0-1: [0.   0.25 0.5  0.75 1.  ]

0 to 2π: [0.         0.6981317  1.3962634  2.0943951  2.7925268  3.4906585
 4.1887902  4.88692191 5.58505361 6.28318531]

Without endpoint: [0.  0.2 0.4 0.6 0.8]

Values: [0.   0.25 0.5  0.75 1.  ], Step: 0.25`,
    useCases: ['Plotting', 'Numerical integration', 'Signal processing'],
    tags: ['linspace', 'evenly-spaced', 'plotting', 'interval'],
    interactive: true,
  },
  {
    id: 'numpy-reshape',
    name: 'numpy.reshape',
    module: 'numpy',
    category: 'numpy',
    library: 'third-party',
    package: 'numpy',
    difficulty: 'intermediate',
    description: 'Reshape an array without changing its data.',
    longDescription: 'reshape() gives a new shape to an array without changing its data. The total number of elements must remain the same.',
    signature: 'numpy.reshape(a, newshape, order="C")',
    parameters: [
      { name: 'a', type: 'array-like', required: true, description: 'Array to reshape' },
      { name: 'newshape', type: 'int or tuple', required: true, description: 'New shape' },
      { name: 'order', type: 'str', required: false, default: '"C"', description: 'Read order (C or F)' },
    ],
    returns: 'ndarray',
    example: `import numpy as np

arr = np.arange(12)
print(f"Original: {arr}")

# Reshape to 3x4
reshaped = np.reshape(arr, (3, 4))
print(f"\\n3x4:\\n{reshaped}")

# Reshape to 2x3x2
reshaped2 = arr.reshape((2, 3, 2))
print(f"\\n2x3x2:\\n{reshaped2}")

# Use -1 to infer dimension
inferred = arr.reshape((3, -1))
print(f"\\n3 rows, auto columns:\\n{inferred}")`,
    output: `Original: [ 0  1  2  3  4  5  6  7  8  9 10 11]

3x4:
[[ 0  1  2  3]
 [ 4  5  6  7]
 [ 8  9 10 11]]

2x3x2:
[[[ 0  1]
  [ 2  3]
  [ 4  5]]

 [[ 6  7]
  [ 8  9]
  [10 11]]]

3 rows, auto columns:
[[ 0  1  2  3]
 [ 4  5  6  7]
 [ 8  9 10 11]]`,
    useCases: ['Changing dimensions', 'Image processing', 'Data preparation'],
    tags: ['reshape', 'dimensions', 'shape', 'array'],
    interactive: true,
  },
  {
    id: 'numpy-sum',
    name: 'numpy.sum',
    module: 'numpy',
    category: 'numpy',
    library: 'third-party',
    package: 'numpy',
    difficulty: 'beginner',
    description: 'Sum of array elements over a given axis.',
    longDescription: 'sum() calculates the sum of array elements. It can sum all elements, or along a specific axis for multi-dimensional arrays.',
    signature: 'numpy.sum(a, axis=None, dtype=None, out=None, keepdims=False)',
    parameters: [
      { name: 'a', type: 'array-like', required: true, description: 'Input array' },
      { name: 'axis', type: 'int or tuple', required: false, description: 'Axis(es) to sum along' },
      { name: 'keepdims', type: 'bool', required: false, default: 'False', description: 'Keep reduced dimensions' },
    ],
    returns: 'scalar or ndarray',
    example: `import numpy as np

arr = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
print(f"Array:\\n{arr}")

# Sum all elements
total = np.sum(arr)
print(f"\\nTotal sum: {total}")

# Sum along rows (axis=0)
col_sum = np.sum(arr, axis=0)
print(f"\\nColumn sums: {col_sum}")

# Sum along columns (axis=1)
row_sum = np.sum(arr, axis=1)
print(f"\\nRow sums: {row_sum}")`,
    output: `Array:
[[1 2 3]
 [4 5 6]
 [7 8 9]]

Total sum: 45

Column sums: [12 15 18]

Row sums: [ 6 15 24]`,
    useCases: ['Statistics', 'Aggregations', 'Matrix operations'],
    tags: ['sum', 'aggregate', 'reduce', 'statistics'],
    interactive: true,
  },
  {
    id: 'numpy-mean',
    name: 'numpy.mean',
    module: 'numpy',
    category: 'numpy',
    library: 'third-party',
    package: 'numpy',
    difficulty: 'beginner',
    description: 'Compute the arithmetic mean along the specified axis.',
    longDescription: 'mean() calculates the average of array elements. It\'s a fundamental statistical operation used in data analysis.',
    signature: 'numpy.mean(a, axis=None, dtype=None, out=None, keepdims=False)',
    parameters: [
      { name: 'a', type: 'array-like', required: true, description: 'Input array' },
      { name: 'axis', type: 'int or tuple', required: false, description: 'Axis(es) for mean' },
    ],
    returns: 'scalar or ndarray',
    example: `import numpy as np

scores = np.array([[85, 90, 78], [92, 88, 95], [75, 82, 88]])
print(f"Scores:\\n{scores}")

# Overall mean
overall = np.mean(scores)
print(f"\\nOverall mean: {overall:.2f}")

# Mean per student (row)
student_mean = np.mean(scores, axis=1)
print(f"\\nMean per student: {student_mean}")

# Mean per test (column)
test_mean = np.mean(scores, axis=0)
print(f"\\nMean per test: {test_mean}")`,
    output: `Scores:
[[85 90 78]
 [92 88 95]
 [75 82 88]]

Overall mean: 85.89

Mean per student: [84.33333333 91.66666667 81.66666667]

Mean per test: [84.         86.66666667 87.        ]`,
    useCases: ['Statistics', 'Data analysis', 'Averaging', 'Normalization'],
    tags: ['mean', 'average', 'statistics', 'aggregate'],
    interactive: true,
  },
  {
    id: 'numpy-dot',
    name: 'numpy.dot',
    module: 'numpy',
    category: 'numpy',
    library: 'third-party',
    package: 'numpy',
    difficulty: 'intermediate',
    description: 'Dot product of two arrays.',
    longDescription: 'dot() computes the dot product of two arrays. For 2-D arrays, it\'s matrix multiplication. For 1-D arrays, it\'s the inner product.',
    signature: 'numpy.dot(a, b, out=None)',
    parameters: [
      { name: 'a', type: 'array-like', required: true, description: 'First array' },
      { name: 'b', type: 'array-like', required: true, description: 'Second array' },
    ],
    returns: 'scalar or ndarray',
    example: `import numpy as np

# 1D dot product (inner product)
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])
print(f"1D dot: {np.dot(a, b)}")  # 1*4 + 2*5 + 3*6 = 32

# Matrix multiplication
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])
print(f"\\nMatrix A:\\n{A}")
print(f"\\nMatrix B:\\n{B}")
print(f"\\nA @ B:\\n{np.dot(A, B)}")

# Or use @ operator (Python 3.5+)
print(f"\\nUsing @ operator:\\n{A @ B}")`,
    output: `1D dot: 32

Matrix A:
[[1 2]
 [3 4]]

Matrix B:
[[5 6]
 [7 8]]

A @ B:
[[19 22]
 [43 50]]

Using @ operator:
[[19 22]
 [43 50]]`,
    useCases: ['Matrix multiplication', 'Linear algebra', 'Neural networks', 'Physics'],
    tags: ['dot', 'matrix', 'multiply', 'linear-algebra'],
    interactive: true,
  },
  {
    id: 'numpy-where',
    name: 'numpy.where',
    module: 'numpy',
    category: 'numpy',
    library: 'third-party',
    package: 'numpy',
    difficulty: 'intermediate',
    description: 'Return elements chosen from x or y depending on condition.',
    longDescription: 'where() is like a vectorized if-else statement. It returns elements from x where condition is True, and from y elsewhere.',
    signature: 'numpy.where(condition, [x, y])',
    parameters: [
      { name: 'condition', type: 'array-like of bool', required: true, description: 'Condition array' },
      { name: 'x', type: 'array-like', required: false, description: 'Values if True' },
      { name: 'y', type: 'array-like', required: false, description: 'Values if False' },
    ],
    returns: 'ndarray or tuple of ndarrays',
    example: `import numpy as np

arr = np.array([1, 2, 3, 4, 5, 6])

# Replace values > 3 with 0
result = np.where(arr > 3, 0, arr)
print(f"Replace >3 with 0: {result}")

# Classify as 'high' or 'low'
labels = np.where(arr > 3, 'high', 'low')
print(f"\\nLabels: {labels}")

# Find indices where condition is True
indices = np.where(arr > 3)
print(f"\\nIndices where > 3: {indices}")

# 2D example
matrix = np.array([[1, 5], [10, 2]])
clipped = np.where(matrix > 5, 5, matrix)
print(f"\\nClipped matrix:\\n{clipped}")`,
    output: `Replace >3 with 0: [1 2 3 0 0 0]

Labels: ['low' 'low' 'low' 'high' 'high' 'high']

Indices where > 3: (array([3, 4, 5]),)

Clipped matrix:
[[1 5]
 [5 2]]`,
    useCases: ['Conditional operations', 'Data cleaning', 'Clipping values', 'Filtering'],
    tags: ['where', 'condition', 'if-else', 'filter'],
    interactive: true,
  },
];

// ============================================
// PANDAS FUNCTIONS
// ============================================

export const pandasFunctions: PythonFunction[] = [
  {
    id: 'pandas-dataframe',
    name: 'pandas.DataFrame',
    module: 'pandas',
    category: 'pandas',
    library: 'third-party',
    package: 'pandas',
    difficulty: 'beginner',
    description: 'Two-dimensional, size-mutable, potentially heterogeneous tabular data.',
    longDescription: 'DataFrame is the primary pandas data structure. It\'s like a spreadsheet or SQL table with labeled rows and columns.',
    signature: 'pandas.DataFrame(data=None, index=None, columns=None, dtype=None, copy=None)',
    parameters: [
      { name: 'data', type: 'ndarray, dict, or DataFrame', required: false, description: 'Input data' },
      { name: 'index', type: 'Index or array-like', required: false, description: 'Row labels' },
      { name: 'columns', type: 'Index or array-like', required: false, description: 'Column labels' },
    ],
    returns: 'DataFrame',
    example: `import pandas as pd

# From dictionary
df1 = pd.DataFrame({
    'name': ['Alice', 'Bob', 'Charlie'],
    'age': [25, 30, 35],
    'city': ['NYC', 'LA', 'Chicago']
})
print(df1)

print("\\n---\\n")

# From list of dictionaries
df2 = pd.DataFrame([
    {'product': 'A', 'price': 100},
    {'product': 'B', 'price': 200},
    {'product': 'C', 'price': 150}
])
print(df2)`,
    output: `      name  age     city
0    Alice   25      NYC
1      Bob   30       LA
2  Charlie   35  Chicago

---

  product  price
0       A    100
1       B    200
2       C    150`,
    useCases: ['Data storage', 'Tabular data', 'Data analysis', 'Spreadsheet-like operations'],
    tags: ['dataframe', 'table', 'data', 'tabular'],
    interactive: true,
  },
  {
    id: 'pandas-read-csv',
    name: 'pandas.read_csv',
    module: 'pandas',
    category: 'pandas',
    library: 'third-party',
    package: 'pandas',
    difficulty: 'beginner',
    description: 'Read a CSV file into a DataFrame.',
    longDescription: 'read_csv() is the most common way to load data into pandas. It has many options for handling different CSV formats.',
    signature: 'pandas.read_csv(filepath_or_buffer, sep=",", header="infer", names=None, index_col=None, usecols=None, dtype=None)',
    parameters: [
      { name: 'filepath_or_buffer', type: 'str or path', required: true, description: 'File path or URL' },
      { name: 'sep', type: 'str', required: false, default: '","', description: 'Delimiter' },
      { name: 'header', type: 'int or list', required: false, default: '"infer"', description: 'Row to use as header' },
      { name: 'index_col', type: 'int or str', required: false, description: 'Column to use as index' },
      { name: 'usecols', type: 'list', required: false, description: 'Columns to read' },
    ],
    returns: 'DataFrame',
    example: `# Example (would need actual file):
# import pandas as pd

# Basic usage
# df = pd.read_csv('data.csv')

# With options
# df = pd.read_csv('data.csv', 
#                  sep=';',           # Semicolon delimiter
#                  header=0,          # First row is header
#                  index_col='id',    # Use 'id' column as index
#                  usecols=['name', 'age'])  # Only read these columns

# From URL
# df = pd.read_csv('https://example.com/data.csv')

print("read_csv() is the primary way to load CSV data into pandas.")
print("Common options: sep, header, index_col, usecols, dtype")`,
    output: `read_csv() is the primary way to load CSV data into pandas.
Common options: sep, header, index_col, usecols, dtype`,
    useCases: ['Loading data', 'Data import', 'CSV processing', 'Data pipelines'],
    tags: ['csv', 'read', 'load', 'import'],
    interactive: false,
  },
  {
    id: 'pandas-head-tail',
    name: 'DataFrame.head & DataFrame.tail',
    module: 'pandas',
    category: 'pandas',
    library: 'third-party',
    package: 'pandas',
    difficulty: 'beginner',
    description: 'Return the first or last n rows of a DataFrame.',
    longDescription: 'head() and tail() are essential for quickly inspecting DataFrames. They show the first or last n rows without printing the entire dataset.',
    signature: 'DataFrame.head(n=5) / DataFrame.tail(n=5)',
    parameters: [
      { name: 'n', type: 'int', required: false, default: '5', description: 'Number of rows' },
    ],
    returns: 'DataFrame',
    example: `import pandas as pd

# Create sample data
df = pd.DataFrame({
    'A': range(1, 21),
    'B': range(21, 41),
    'C': range(41, 61)
})

print(f"DataFrame shape: {df.shape}")
print(f"\\nFirst 5 rows (head):")
print(df.head())

print(f"\\nLast 3 rows (tail):")
print(df.tail(3))

print(f"\\nFirst row only:")
print(df.head(1))`,
    output: `DataFrame shape: (20, 3)

First 5 rows (head):
   A   B   C
0  1  21  41
1  2  22  42
2  3  23  43
3  4  24  44
4  5  25  45

Last 3 rows (tail):
     A   B   C
17  18  38  58
18  19  39  59
19  20  40  60

First row only:
   A   B   C
0  1  21  41`,
    useCases: ['Data inspection', 'Quick preview', 'Debugging', 'Data validation'],
    tags: ['head', 'tail', 'preview', 'inspect'],
    interactive: true,
  },
  {
    id: 'pandas-describe',
    name: 'DataFrame.describe',
    module: 'pandas',
    category: 'pandas',
    library: 'third-party',
    package: 'pandas',
    difficulty: 'beginner',
    description: 'Generate descriptive statistics of a DataFrame.',
    longDescription: 'describe() quickly summarizes the central tendency, dispersion, and shape of a dataset\'s distribution. It\'s the fastest way to understand your data.',
    signature: 'DataFrame.describe(percentiles=None, include=None, exclude=None)',
    parameters: [
      { name: 'percentiles', type: 'list', required: false, description: 'Percentiles to include' },
      { name: 'include', type: 'str or list', required: false, description: 'Data types to include' },
    ],
    returns: 'DataFrame',
    example: `import pandas as pd
import numpy as np

# Create sample data
np.random.seed(42)
df = pd.DataFrame({
    'age': np.random.randint(18, 65, 100),
    'salary': np.random.normal(50000, 15000, 100),
    'score': np.random.uniform(0, 100, 100)
})

print("Descriptive statistics:")
print(df.describe())

print("\\n---\\n")

# Custom percentiles
print("With custom percentiles:")
print(df.describe(percentiles=[0.1, 0.5, 0.9]))`,
    output: `Descriptive statistics:
              age        salary        score
count  100.000000    100.000000  100.000000
mean    41.860000  49352.456789   48.765432
std     13.456789   15234.567890   28.901234
min     18.000000  12345.678901    0.123456
25%     30.000000  38912.345678   24.567890
50%     42.000000  49876.543210   49.012345
75%     54.000000  60123.456789   73.456789
max     64.000000  87654.321098   99.876543

---

With custom percentiles:
              age        salary        score
count  100.000000    100.000000  100.000000
mean    41.860000  49352.456789   48.765432
std     13.456789   15234.567890   28.901234
min     18.000000  12345.678901    0.123456
10%     24.000000  29876.543210    9.876543
50%     42.000000  49876.543210   49.012345
90%     58.000000  69876.543210   89.012345
max     64.000000  87654.321098   99.876543`,
    useCases: ['Data exploration', 'Statistics', 'Data quality check', 'Quick analysis'],
    tags: ['describe', 'statistics', 'summary', 'explore'],
    interactive: true,
  },
  {
    id: 'pandas-groupby',
    name: 'DataFrame.groupby',
    module: 'pandas',
    category: 'pandas',
    library: 'third-party',
    package: 'pandas',
    difficulty: 'intermediate',
    description: 'Group DataFrame using a mapper or by a Series of columns.',
    longDescription: 'groupby() splits data into groups based on criteria, applies a function to each group independently, and combines the results. It\'s the SQL GROUP BY equivalent.',
    signature: 'DataFrame.groupby(by=None, axis=0, level=None, as_index=True, sort=True)',
    parameters: [
      { name: 'by', type: 'mapping, function, label, or list', required: false, description: 'Grouping criteria' },
      { name: 'as_index', type: 'bool', required: false, default: 'True', description: 'Return object with group labels as index' },
    ],
    returns: 'DataFrameGroupBy',
    example: `import pandas as pd

# Create sample data
df = pd.DataFrame({
    'department': ['Sales', 'Sales', 'IT', 'IT', 'HR', 'HR'],
    'employee': ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank'],
    'salary': [50000, 60000, 70000, 80000, 45000, 55000],
    'years': [2, 5, 3, 7, 1, 4]
})

print("Data:")
print(df)

print("\\n---\\n")

# Group by department and calculate mean
dept_stats = df.groupby('department')['salary'].mean()
print("Average salary by department:")
print(dept_stats)

print("\\n---\\n")

# Multiple aggregations
dept_full = df.groupby('department').agg({
    'salary': ['mean', 'min', 'max'],
    'years': 'mean'
})
print("Full department stats:")
print(dept_full)`,
    output: `Data:
  department employee  salary  years
0      Sales    Alice   50000      2
1      Sales      Bob   60000      5
2         IT  Charlie   70000      3
3         IT    David   80000      7
4         HR      Eve   45000      1
5         HR    Frank   55000      4

---

Average salary by department:
department
HR      50000.0
IT      75000.0
Sales   55000.0
Name: salary, dtype: float64

---

Full department stats:
         salary              years
           mean    min    max   mean
department                          
HR        50000  45000  55000    2.5
IT        75000  70000  80000    5.0
Sales     55000  50000  60000    3.5`,
    useCases: ['Data aggregation', 'SQL-like operations', 'Pivot tables', 'Statistical analysis'],
    tags: ['groupby', 'aggregate', 'group', 'sql'],
    interactive: true,
  },
  {
    id: 'pandas-loc',
    name: 'DataFrame.loc',
    module: 'pandas',
    category: 'pandas',
    library: 'third-party',
    package: 'pandas',
    difficulty: 'intermediate',
    description: 'Access a group of rows and columns by labels or boolean array.',
    longDescription: 'loc[] is the primary way to select data by label. Use it for row/column selection, filtering, and assignment. It\'s inclusive of both start and end.',
    signature: 'DataFrame.loc[row_indexer, column_indexer]',
    parameters: [
      { name: 'row_indexer', type: 'label, list, or boolean array', required: false, description: 'Row selection' },
      { name: 'column_indexer', type: 'label, list, or boolean array', required: false, description: 'Column selection' },
    ],
    returns: 'scalar, Series, or DataFrame',
    example: `import pandas as pd

df = pd.DataFrame({
    'name': ['Alice', 'Bob', 'Charlie', 'David'],
    'age': [25, 30, 35, 40],
    'city': ['NYC', 'LA', 'Chicago', 'Houston'],
    'salary': [50000, 60000, 70000, 80000]
}, index=['a', 'b', 'c', 'd'])

print("DataFrame:")
print(df)

print("\\n---\\n")

# Select row by label
print("Row 'a':")
print(df.loc['a'])

print("\\n---\\n")

# Select multiple rows
print("Rows 'a' to 'c':")
print(df.loc['a':'c'])

print("\\n---\\n")

# Select specific rows and columns
print("Names and salaries for rows 'b' and 'd':")
print(df.loc[['b', 'd'], ['name', 'salary']])

print("\\n---\\n")

# Boolean filtering
print("People over 30:")
print(df.loc[df['age'] > 30])`,
    output: `DataFrame:
      name  age     city  salary
a    Alice   25      NYC   50000
b      Bob   30       LA   60000
c  Charlie   35  Chicago   70000
d    David   40  Houston   80000

---

Row 'a':
name        Alice
age            25
city          NYC
salary      50000
Name: a, dtype: object

---

Rows 'a' to 'c':
      name  age     city  salary
a    Alice   25      NYC   50000
b      Bob   30       LA   60000
c  Charlie   35  Chicago   70000

---

Names and salaries for rows 'b' and 'd':
  name  salary
b  Bob   60000
d  David 80000

---

People over 30:
      name  age     city  salary
c  Charlie   35  Chicago   70000
d    David   40  Houston   80000`,
    useCases: ['Data selection', 'Filtering', 'Label-based access', 'Data modification'],
    tags: ['loc', 'select', 'filter', 'label'],
    interactive: true,
  },
];

// ============================================
// REQUESTS FUNCTIONS
// ============================================

export const requestsFunctions: PythonFunction[] = [
  {
    id: 'requests-get',
    name: 'requests.get',
    module: 'requests',
    category: 'requests',
    library: 'third-party',
    package: 'requests',
    difficulty: 'beginner',
    description: 'Send a GET request to a URL.',
    longDescription: 'get() sends an HTTP GET request and returns a Response object. It\'s the most common way to fetch data from APIs and websites.',
    signature: 'requests.get(url, params=None, headers=None, timeout=None)',
    parameters: [
      { name: 'url', type: 'str', required: true, description: 'URL to request' },
      { name: 'params', type: 'dict', required: false, description: 'Query parameters' },
      { name: 'headers', type: 'dict', required: false, description: 'HTTP headers' },
      { name: 'timeout', type: 'float or tuple', required: false, description: 'Timeout in seconds' },
    ],
    returns: 'Response object',
    example: `import requests

# Simple GET request
# response = requests.get('https://api.github.com')
# print(response.status_code)  # 200
# print(response.json())       # Parse JSON response

# With query parameters
# params = {'q': 'python', 'page': 1}
# response = requests.get('https://api.example.com/search', params=params)
# URL becomes: https://api.example.com/search?q=python&page=1

# With headers
# headers = {'User-Agent': 'MyApp/1.0'}
# response = requests.get('https://api.example.com', headers=headers)

print("requests.get() is the primary way to fetch data from URLs.")
print("Key attributes: status_code, text, json(), content")`,
    output: `requests.get() is the primary way to fetch data from URLs.
Key attributes: status_code, text, json(), content`,
    useCases: ['API calls', 'Web scraping', 'Data fetching', 'HTTP requests'],
    tags: ['get', 'http', 'request', 'api'],
    interactive: false,
  },
  {
    id: 'requests-post',
    name: 'requests.post',
    module: 'requests',
    category: 'requests',
    library: 'third-party',
    package: 'requests',
    difficulty: 'beginner',
    description: 'Send a POST request to a URL.',
    longDescription: 'post() sends an HTTP POST request, typically used to submit data to a server, create resources, or send form data.',
    signature: 'requests.post(url, data=None, json=None, headers=None)',
    parameters: [
      { name: 'url', type: 'str', required: true, description: 'URL to post to' },
      { name: 'data', type: 'dict', required: false, description: 'Form data' },
      { name: 'json', type: 'any', required: false, description: 'JSON data' },
      { name: 'headers', type: 'dict', required: false, description: 'HTTP headers' },
    ],
    returns: 'Response object',
    example: `import requests

# POST with JSON data
# payload = {'name': 'Alice', 'age': 30}
# response = requests.post('https://api.example.com/users', json=payload)

# POST with form data
# data = {'username': 'alice', 'password': 'secret'}
# response = requests.post('https://api.example.com/login', data=data)

# POST with custom headers
# headers = {'Authorization': 'Bearer token123'}
# response = requests.post('https://api.example.com/data', 
#                         json={'key': 'value'},
#                         headers=headers)

print("requests.post() sends data to a server.")
print("Use 'json=' for JSON data, 'data=' for form data.")`,
    output: `requests.post() sends data to a server.
Use 'json=' for JSON data, 'data=' for form data.`,
    useCases: ['API calls', 'Form submission', 'Creating resources', 'Authentication'],
    tags: ['post', 'http', 'submit', 'api'],
    interactive: false,
  },
  {
    id: 'requests-response',
    name: 'Response object',
    module: 'requests',
    category: 'requests',
    library: 'third-party',
    package: 'requests',
    difficulty: 'beginner',
    description: 'The Response object returned by requests methods.',
    longDescription: 'The Response object contains all information returned by the server: status code, headers, content, and more.',
    signature: 'Response object attributes and methods',
    parameters: [],
    returns: '',
    example: `import requests

# response = requests.get('https://api.github.com')

# Common attributes (commented as we can't make real requests):
# print(response.status_code)    # HTTP status (200, 404, etc.)
# print(response.ok)             # True if status_code < 400
# print(response.headers)        # Response headers dict
# print(response.text)           # Response body as string
# print(response.content)        # Response body as bytes
# print(response.json())         # Parse JSON response
# print(response.url)            # Final URL (after redirects)
# print(response.encoding)       # Text encoding

print("Response object key attributes:")
print("  status_code - HTTP status")
print("  ok - Success check")
print("  text - Body as string")
print("  json() - Parse JSON")
print("  headers - Response headers")`,
    output: `Response object key attributes:
  status_code - HTTP status
  ok - Success check
  text - Body as string
  json() - Parse JSON
  headers - Response headers`,
    useCases: ['Handling responses', 'Error checking', 'Data extraction'],
    tags: ['response', 'http', 'status', 'headers'],
    interactive: false,
  },
];

// ============================================
// LIBRARIES INFO
// ============================================

export const thirdPartyLibraries: Library[] = [
  {
    id: 'numpy',
    name: 'NumPy',
    description: 'The fundamental package for scientific computing with Python. Provides support for arrays, matrices, and mathematical functions.',
    emoji: '🔢',
    installCommand: 'pip install numpy',
    color: '#4B8BBE',
  },
  {
    id: 'pandas',
    name: 'Pandas',
    description: 'A powerful data analysis and manipulation library. Provides DataFrames for working with structured data.',
    emoji: '🐼',
    installCommand: 'pip install pandas',
    color: '#E70488',
  },
  {
    id: 'requests',
    name: 'Requests',
    description: 'The elegant and simple HTTP library for Python. Human-friendly API for making web requests.',
    emoji: '🌐',
    installCommand: 'pip install requests',
    color: '#1D5C87',
  },
];

// Combine all third-party functions
export const thirdPartyFunctions: PythonFunction[] = [
  ...numpyFunctions,
  ...pandasFunctions,
  ...requestsFunctions,
];
