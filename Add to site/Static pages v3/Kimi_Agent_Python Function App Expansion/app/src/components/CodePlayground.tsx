import { useState, useEffect } from 'react';
import { Play, RotateCcw, Loader2 } from 'lucide-react';
import { usePyodide } from '../hooks/usePyodide';

interface CodePlaygroundProps {
  initialCode?: string;
}

export default function CodePlayground({ initialCode = '' }: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  
  const { runCode, isLoading, error } = usePyodide();
  
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);
  
  const handleRun = async () => {
    setIsRunning(true);
    setOutput('');
    
    const result = await runCode(code);
    
    if (result.error) {
      setOutput(`Error: ${result.error}`);
    } else {
      setOutput(result.output || '(No output)');
    }
    
    setIsRunning(false);
  };
  
  const handleReset = () => {
    setCode(initialCode);
    setOutput('');
  };
  
  if (isLoading) {
    return (
      <div className="card-main">
        <div className="p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#E94E77]" />
          <p className="font-display font-bold text-lg">Loading Python interpreter...</p>
          <p className="text-[#2A2A2A] mt-2">This may take a few seconds</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="card-main">
        <div className="p-8 text-center">
          <p className="text-[#E94E77] font-bold mb-2">Failed to load Python interpreter</p>
          <p className="text-[#2A2A2A]">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Code Editor */}
      <div className="card-main">
        <div className="card-header bg-[#FFD166] text-black flex justify-between items-center">
          <span>Code Editor</span>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-1 bg-white border-2 border-black rounded-lg text-sm hover:bg-gray-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-1 bg-[#E94E77] text-white border-2 border-black rounded-lg text-sm hover:bg-[#d43d66] transition-colors disabled:opacity-50"
            >
              {isRunning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Run
            </button>
          </div>
        </div>
        <div className="p-4">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-80 font-mono text-sm bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#E94E77]"
            spellCheck={false}
          />
        </div>
      </div>
      
      {/* Output */}
      <div className="card-main">
        <div className="card-header bg-[#C9E8D8] text-black">
          Output
        </div>
        <div className="p-4">
          <pre className="w-full h-80 bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl overflow-auto font-mono text-sm">
            <code>{output || '(Click Run to see output)'}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
