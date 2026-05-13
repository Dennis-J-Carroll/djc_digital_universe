import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePyodide } from '../hooks/usePyodide';
import { getDailyChallenge, getAllChallenges, type Challenge } from '../data/challenges';
import { 
  ChevronLeft, 
  Play, 
  RotateCcw, 
  Check, 
  X, 
  Lightbulb,
  Trophy,
  Clock,
  Code,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function ChallengesPage() {
  const navigate = useNavigate();
  const dailyChallenge = getDailyChallenge();
  const allChallenges = getAllChallenges();
  
  const [activeTab, setActiveTab] = useState<'daily' | 'all'>('daily');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(dailyChallenge);
  
  return (
    <div className="min-h-screen bg-[#B7C4E8]">
      {/* Header */}
      <header className="bg-white border-b-3 border-black px-8 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-black hover:text-[#E94E77] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          
          <h1 className="font-display font-black text-2xl flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#FFD166]" />
            Coding Challenges
          </h1>
          
          <div className="w-20" />
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => {
              setActiveTab('daily');
              setSelectedChallenge(dailyChallenge);
            }}
            className={`px-6 py-3 border-3 border-black rounded-xl font-display font-bold transition-all flex items-center gap-2 ${
              activeTab === 'daily' ? 'bg-[#E94E77] text-white' : 'bg-white'
            }`}
          >
            <Clock className="w-5 h-5" />
            Daily Challenge
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 border-3 border-black rounded-xl font-display font-bold transition-all flex items-center gap-2 ${
              activeTab === 'all' ? 'bg-[#E94E77] text-white' : 'bg-white'
            }`}
          >
            <Code className="w-5 h-5" />
            All Challenges ({allChallenges.length})
          </button>
        </div>
        
        {activeTab === 'all' && !selectedChallenge && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allChallenges.map(challenge => (
              <ChallengeCard 
                key={challenge.id} 
                challenge={challenge}
                onClick={() => setSelectedChallenge(challenge)}
              />
            ))}
          </div>
        )}
        
        {selectedChallenge && (
          <ChallengeEditor 
            challenge={selectedChallenge}
            onBack={() => activeTab === 'all' && setSelectedChallenge(null)}
          />
        )}
      </main>
    </div>
  );
}

// Challenge Card Component
function ChallengeCard({ challenge, onClick }: { challenge: Challenge; onClick: () => void }) {
  const difficultyColor = {
    easy: '#C9E8D8',
    medium: '#FFD166',
    hard: '#F4A6C3',
  }[challenge.difficulty];
  
  return (
    <button
      onClick={onClick}
      className="archive-card text-left"
    >
      <div className="flex items-center gap-2 mb-3">
        <span 
          className="px-2 py-1 rounded-full text-xs font-medium capitalize"
          style={{ backgroundColor: difficultyColor }}
        >
          {challenge.difficulty}
        </span>
        <span className="text-sm text-[#2A2A2A]">{challenge.points} points</span>
      </div>
      
      <h3 className="font-display font-bold text-lg mb-2">{challenge.title}</h3>
      <p className="text-sm text-[#2A2A2A] line-clamp-2">{challenge.description}</p>
    </button>
  );
}

// Challenge Editor Component
function ChallengeEditor({ challenge, onBack }: { challenge: Challenge; onBack?: () => void }) {
  const [code, setCode] = useState(challenge.starterCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  
  const { runCode, isLoading } = usePyodide();
  
  const handleRun = async () => {
    setIsRunning(true);
    setOutput('');
    setIsCorrect(null);
    
    const result = await runCode(code);
    
    if (result.error) {
      setOutput(`Error: ${result.error}`);
      setIsCorrect(false);
    } else {
      setOutput(result.output);
      // Check if output matches expected (with some flexibility)
      const normalizedOutput = result.output.trim().replace(/\r\n/g, '\n');
      const normalizedExpected = challenge.expectedOutput.trim().replace(/\r\n/g, '\n');
      const correct = normalizedOutput === normalizedExpected;
      setIsCorrect(correct);
      
      if (correct && !completedChallenges.includes(challenge.id)) {
        setCompletedChallenges([...completedChallenges, challenge.id]);
      }
    }
    
    setIsRunning(false);
  };
  
  const handleReset = () => {
    setCode(challenge.starterCode);
    setOutput('');
    setIsCorrect(null);
  };
  
  const difficultyColor = {
    easy: '#C9E8D8',
    medium: '#FFD166',
    hard: '#F4A6C3',
  }[challenge.difficulty];
  
  const isCompleted = completedChallenges.includes(challenge.id);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Panel - Instructions */}
      <div className="space-y-6">
        <div className="card-main">
          <div 
            className="card-header flex justify-between items-center"
            style={{ backgroundColor: difficultyColor, color: 'black' }}
          >
            <span>{challenge.title}</span>
            <div className="flex items-center gap-4">
              <span className="text-sm capitalize">{challenge.difficulty}</span>
              <span className="text-sm">{challenge.points} pts</span>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-[#2A2A2A] mb-6">{challenge.description}</p>
            
            <div className="mb-6">
              <p className="font-display font-bold text-sm mb-2">Expected Output:</p>
              <pre className="code-block bg-[#C9E8D8] text-sm">
                <code>{challenge.expectedOutput}</code>
              </pre>
            </div>
            
            {/* Hints */}
            <div className="border-3 border-black rounded-xl overflow-hidden">
              <button
                onClick={() => setShowHints(!showHints)}
                className="w-full px-4 py-3 bg-[#FFD166] flex items-center justify-between font-display font-bold"
              >
                <span className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Hints ({challenge.hints.length})
                </span>
                {showHints ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              {showHints && (
                <div className="p-4 bg-white">
                  <ul className="space-y-2">
                    {challenge.hints.map((hint, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="font-bold text-[#E94E77]">{i + 1}.</span>
                        {hint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {onBack && (
          <button
            onClick={onBack}
            className="btn-primary w-full"
          >
            Back to Challenges
          </button>
        )}
      </div>
      
      {/* Right Panel - Code Editor */}
      <div className="space-y-6">
        {/* Code Editor */}
        <div className="card-main">
          <div className="card-header bg-[#4B6BFB] text-white flex justify-between items-center">
            <span className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Your Code
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-1 bg-white text-black border-2 border-black rounded-lg text-sm hover:bg-gray-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleRun}
                disabled={isRunning || isLoading}
                className="flex items-center gap-2 px-4 py-1 bg-[#E94E77] text-white border-2 border-black rounded-lg text-sm hover:bg-[#d43d66] transition-colors disabled:opacity-50"
              >
                {isRunning ? (
                  <Clock className="w-4 h-4 animate-spin" />
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
              className="w-full h-64 font-mono text-sm bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#E94E77]"
              spellCheck={false}
            />
          </div>
        </div>
        
        {/* Output */}
        <div className="card-main">
          <div className="card-header bg-[#2A2A2A] text-white flex justify-between items-center">
            <span>Output</span>
            {isCorrect !== null && (
              <span className={`flex items-center gap-2 ${isCorrect ? 'text-[#C9E8D8]' : 'text-[#F4A6C3]'}`}>
                {isCorrect ? (
                  <>
                    <Check className="w-5 h-5" />
                    Correct!
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5" />
                    Try Again
                  </>
                )}
              </span>
            )}
          </div>
          
          <div className="p-4">
            <pre className="w-full h-32 bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-xl overflow-auto font-mono text-sm">
              <code>{output || '(Click Run to see output)'}</code>
            </pre>
          </div>
        </div>
        
        {/* Success Message */}
        {isCompleted && (
          <div className="card-main p-6 bg-[#C9E8D8] border-3 border-black">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-[#FFD166]" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">Challenge Completed!</h3>
                <p className="text-sm">You earned {challenge.points} points</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
