import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFunctionById } from '../data/pythonFunctionsExpanded';
import { useUserStore } from '../store/userStore';
import { 
  ChevronLeft, 
  Check, 
  Star, 
  BookOpen, 
  Play, 
  Copy, 
  CheckCheck,
  Lightbulb,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import CodePlayground from '../components/CodePlayground';

export default function FunctionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'example' | 'playground'>('example');
  
  const func = id ? getFunctionById(id) : undefined;
  
  const { 
    markAsViewed, 
    markAsCompleted, 
    unmarkAsCompleted,
    hasCompleted,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    addNote,
    getNote,
  } = useUserStore();
  
  const [note, setNote] = useState('');
  
  useEffect(() => {
    if (func) {
      markAsViewed(func.id);
      setNote(getNote(func.id));
    }
  }, [func, markAsViewed, getNote]);
  
  if (!func) {
    return (
      <div className="min-h-screen bg-[#B7C4E8] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display font-black text-4xl text-black mb-4">
            Function Not Found
          </h1>
          <button
            onClick={() => navigate('/')}
            className="btn-primary px-6 py-3"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }
  
  const handleCopy = () => {
    navigator.clipboard.writeText(func.example);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleNoteSave = () => {
    addNote(func.id, note);
  };
  
  const relatedFunctions = func.relatedFunctions
    ?.map(rid => getFunctionById(rid))
    .filter(Boolean) || [];
  
  const difficultyColor = {
    beginner: '#C9E8D8',
    intermediate: '#FFD166',
    advanced: '#F4A6C3',
  }[func.difficulty];
  
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
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => hasCompleted(func.id) 
                ? unmarkAsCompleted(func.id) 
                : markAsCompleted(func.id)
              }
              className={`flex items-center gap-2 px-4 py-2 border-3 border-black rounded-xl transition-all ${
                hasCompleted(func.id) 
                  ? 'bg-[#C9E8D8]' 
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <Check className={`w-5 h-5 ${hasCompleted(func.id) ? 'text-black' : 'text-gray-400'}`} />
              {hasCompleted(func.id) ? 'Learned' : 'Mark as Learned'}
            </button>
            
            <button
              onClick={() => isFavorite(func.id)
                ? removeFromFavorites(func.id)
                : addToFavorites(func.id)
              }
              className={`flex items-center gap-2 px-4 py-2 border-3 border-black rounded-xl transition-all ${
                isFavorite(func.id)
                  ? 'bg-[#FFD166]'
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <Star className={`w-5 h-5 ${isFavorite(func.id) ? 'fill-black' : ''}`} />
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Hero */}
        <div className="card-main mb-8">
          <div 
            className="card-header text-white"
            style={{ backgroundColor: difficultyColor, color: 'black' }}
          >
            <BookOpen className="w-5 h-5 mr-2" />
            {func.category} • {func.difficulty}
          </div>
          
          <div className="p-8">
            <h1 className="font-display font-black text-[clamp(32px,5vw,56px)] text-black mb-4">
              {func.name}
            </h1>
            
            <p className="text-[clamp(16px,1.5vw,20px)] text-[#2A2A2A] max-w-3xl mb-6">
              {func.longDescription || func.description}
            </p>
            
            <div className="code-block inline-block">
              <code>{func.signature}</code>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('example')}
            className={`px-6 py-3 border-3 border-black rounded-xl font-display font-bold transition-all ${
              activeTab === 'example' ? 'bg-[#E94E77] text-white' : 'bg-white'
            }`}
          >
            Example
          </button>
          <button
            onClick={() => setActiveTab('playground')}
            className={`px-6 py-3 border-3 border-black rounded-xl font-display font-bold transition-all ${
              activeTab === 'playground' ? 'bg-[#E94E77] text-white' : 'bg-white'
            }`}
          >
            <Play className="w-4 h-4 inline mr-2" />
            Try It
          </button>
        </div>
        
        {/* Content */}
        {activeTab === 'example' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Code Example */}
            <div className="card-main">
              <div className="card-header bg-[#FFD166] text-black flex justify-between items-center">
                <span>Example Code</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 text-sm"
                >
                  {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="p-6">
                <pre className="code-block bg-[#F6D7C3]">
                  <code>{func.example}</code>
                </pre>
                
                {func.output && (
                  <div className="mt-4">
                    <p className="font-display font-bold text-sm mb-2">Output:</p>
                    <pre className="code-block bg-[#C9E8D8]">
                      <code>{func.output}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
            
            {/* Details */}
            <div className="space-y-6">
              {/* Use Cases */}
              <div className="card-main">
                <div className="card-header bg-[#4B6BFB] text-white">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Use Cases
                </div>
                <div className="p-6">
                  <ul className="space-y-2">
                    {func.useCases.map((useCase, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 text-[#E94E77] mt-0.5 flex-shrink-0" />
                        <span>{useCase}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Common Mistakes */}
              {func.commonMistakes && (
                <div className="card-main">
                  <div className="card-header bg-[#F4A6C3] text-black">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Common Mistakes
                  </div>
                  <div className="p-6">
                    <ul className="space-y-2">
                      {func.commonMistakes.map((mistake, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <AlertTriangle className="w-5 h-5 text-[#E94E77] mt-0.5 flex-shrink-0" />
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Personal Notes */}
              <div className="card-main">
                <div className="card-header bg-[#C9E8D8] text-black">
                  Your Notes
                </div>
                <div className="p-6">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onBlur={handleNoteSave}
                    placeholder="Add your personal notes about this function..."
                    className="input-field w-full h-32 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <CodePlayground initialCode={func.example} />
        )}
        
        {/* Related Functions */}
        {relatedFunctions.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display font-black text-2xl text-black mb-6">
              Related Functions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedFunctions.map(related => related && (
                <button
                  key={related.id}
                  onClick={() => navigate(`/function/${related.id}`)}
                  className="archive-card text-left"
                >
                  <h3 className="font-display font-bold text-lg">{related.name}</h3>
                  <p className="text-sm text-[#2A2A2A] mt-2 line-clamp-2">
                    {related.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
