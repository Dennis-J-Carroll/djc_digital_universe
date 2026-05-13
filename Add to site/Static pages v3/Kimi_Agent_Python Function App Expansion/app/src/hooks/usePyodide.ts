import { useState, useEffect, useRef, useCallback } from 'react';

interface PyodideInstance {
  runPython: (code: string) => unknown;
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackage: (packageName: string) => Promise<void>;
  pyimport: (name: string) => unknown;
}

interface UsePyodideReturn {
  pyodide: PyodideInstance | null;
  isLoading: boolean;
  error: string | null;
  runCode: (code: string) => Promise<{ output: string; error: string | null }>;
}

export function usePyodide(): UsePyodideReturn {
  const [pyodide, setPyodide] = useState<PyodideInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pyodideRef = useRef<PyodideInstance | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPyodide() {
      try {
        setIsLoading(true);
        setError(null);

        // Dynamic import to avoid SSR issues
        const { loadPyodide: loadPyodideFunc } = await import('pyodide');

        const instance = await loadPyodideFunc({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/',
        });

        if (!isMounted) return;

        pyodideRef.current = instance as unknown as PyodideInstance;
        setPyodide(instance as unknown as PyodideInstance);
        setIsLoading(false);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load Pyodide');
        setIsLoading(false);
      }
    }

    loadPyodide();

    return () => {
      isMounted = false;
    };
  }, []);

  const runCode = useCallback(async (code: string): Promise<{ output: string; error: string | null }> => {
    if (!pyodideRef.current) {
      return { output: '', error: 'Pyodide not loaded yet' };
    }

    try {
      // Redirect stdout to capture output
      const captureCode = `
import sys
from io import StringIO
_old_stdout = sys.stdout
sys.stdout = _capture_buffer = StringIO()
${code}
_output = _capture_buffer.getvalue()
sys.stdout = _old_stdout
_output
`;

      const result = await pyodideRef.current.runPythonAsync(captureCode);

      // Convert result to string if needed
      let outputStr = '';
      if (result !== undefined && result !== null) {
        if (typeof result === 'string') {
          outputStr = result;
        } else if (typeof result === 'object' && result !== null) {
          try {
            outputStr = JSON.stringify(result, null, 2);
          } catch {
            outputStr = String(result);
          }
        } else {
          outputStr = String(result);
        }
      }

      return { output: outputStr, error: null };
    } catch (err) {
      return {
        output: '',
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  }, []);

  return {
    pyodide,
    isLoading,
    error,
    runCode,
  };
}
