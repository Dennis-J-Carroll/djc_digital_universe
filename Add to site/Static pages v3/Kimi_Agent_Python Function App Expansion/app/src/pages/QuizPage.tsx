import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizQuestions, calculateScore } from '../data/quiz';
import { 
  ChevronLeft, 
  Check, 
  X, 
  Trophy, 
  ArrowRight,
  RotateCcw,
  HelpCircle
} from 'lucide-react';

export default function QuizPage() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const questions = quizQuestions.slice(0, 10); // Take first 10 questions
  const currentQuestion = questions[currentIndex];
  
  const handleAnswer = (optionIndex: number) => {
    setAnswers({ ...answers, [currentQuestion.id]: optionIndex });
    setShowExplanation(true);
  };
  
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowExplanation(false);
    } else {
      setShowResult(true);
    }
  };
  
  const handleRestart = () => {
    setStarted(false);
    setCurrentIndex(0);
    setAnswers({});
    setShowResult(false);
    setShowExplanation(false);
  };
  
  const score = calculateScore(answers);
  
  if (!started) {
    return (
      <div className="min-h-screen bg-[#B7C4E8] flex items-center justify-center">
        <div className="card-main max-w-lg w-full mx-4">
          <div className="card-header bg-[#E94E77] text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Python Function Quiz
          </div>
          
          <div className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-[#FFD166]" />
            
            <h1 className="font-display font-black text-3xl mb-4">
              Test Your Knowledge
            </h1>
            
            <p className="text-[#2A2A2A] mb-6">
              {questions.length} questions to test your understanding of Python functions.
              Can you get a perfect score?
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-[#C9E8D8] p-3 rounded-xl">
                <p className="font-display font-bold text-2xl">{questions.filter(q => q.difficulty === 'easy').length}</p>
                <p className="text-xs">Easy</p>
              </div>
              <div className="bg-[#FFD166] p-3 rounded-xl">
                <p className="font-display font-bold text-2xl">{questions.filter(q => q.difficulty === 'medium').length}</p>
                <p className="text-xs">Medium</p>
              </div>
              <div className="bg-[#F4A6C3] p-3 rounded-xl">
                <p className="font-display font-bold text-2xl">{questions.filter(q => q.difficulty === 'hard').length}</p>
                <p className="text-xs">Hard</p>
              </div>
            </div>
            
            <button
              onClick={() => setStarted(true)}
              className="btn-primary w-full py-4 text-lg"
            >
              Start Quiz
            </button>
            
            <button
              onClick={() => navigate(-1)}
              className="mt-4 text-[#2A2A2A] hover:text-[#E94E77] transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (showResult) {
    return (
      <div className="min-h-screen bg-[#B7C4E8] flex items-center justify-center p-4">
        <div className="card-main max-w-lg w-full">
          <div className="card-header bg-[#E94E77] text-white">
            Quiz Results
          </div>
          
          <div className="p-8 text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: score.percentage >= 80 ? '#C9E8D8' : score.percentage >= 60 ? '#FFD166' : '#F4A6C3'
              }}
            >
              <Trophy className="w-12 h-12" />
            </div>
            
            <h2 className="font-display font-black text-4xl mb-2">
              {score.correct}/{score.total}
            </h2>
            
            <p className="text-2xl font-display font-bold mb-4">
              {score.percentage}%
            </p>
            
            <p className="text-[#2A2A2A] mb-8">
              {score.percentage === 100 
                ? 'Perfect! You\'re a Python master!' 
                : score.percentage >= 80 
                  ? 'Great job! Keep learning!' 
                  : score.percentage >= 60 
                    ? 'Good effort! Review and try again.' 
                    : 'Keep practicing! You\'ll get better.'}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleRestart}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Try Again
              </button>
              
              <button
                onClick={() => navigate('/archive')}
                className="w-full py-3 border-3 border-black rounded-xl font-display font-bold hover:bg-black hover:text-white transition-colors"
              >
                Study More Functions
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const isCorrect = answers[currentQuestion.id] === currentQuestion.correctAnswer;
  
  return (
    <div className="min-h-screen bg-[#B7C4E8]">
      {/* Header */}
      <header className="bg-white border-b-3 border-black px-8 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-black hover:text-[#E94E77] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Exit
          </button>
          
          <div className="flex items-center gap-4">
            <span className="font-display font-bold">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
          
          <div className="w-20" />
        </div>
        
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mt-4">
          <div className="h-3 bg-gray-200 border-2 border-black rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#E94E77] transition-all"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-8 py-8">
        <div className="card-main">
          <div className="p-8">
            {/* Question */}
            <h2 className="font-display font-bold text-xl mb-6">
              {currentQuestion.question}
            </h2>
            
            {/* Code if present */}
            {currentQuestion.code && (
              <pre className="code-block bg-[#F6D7C3] mb-6">
                <code>{currentQuestion.code}</code>
              </pre>
            )}
            
            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => {
                const isSelected = answers[currentQuestion.id] === index;
                const showCorrect = showExplanation && index === currentQuestion.correctAnswer;
                const showWrong = showExplanation && isSelected && !isCorrect;
                
                return (
                  <button
                    key={index}
                    onClick={() => !showExplanation && handleAnswer(index)}
                    disabled={showExplanation}
                    className={`w-full p-4 border-3 border-black rounded-xl text-left transition-all ${
                      showCorrect 
                        ? 'bg-[#C9E8D8]' 
                        : showWrong 
                          ? 'bg-[#F4A6C3]' 
                          : isSelected 
                            ? 'bg-[#FFD166]' 
                            : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                      {showCorrect && <Check className="w-5 h-5 text-green-600 ml-auto" />}
                      {showWrong && <X className="w-5 h-5 text-red-600 ml-auto" />}
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Explanation */}
            {showExplanation && (
              <div className={`p-4 rounded-xl mb-6 ${isCorrect ? 'bg-[#C9E8D8]' : 'bg-[#F4A6C3]'}`}>
                <p className="font-display font-bold mb-2">
                  {isCorrect ? 'Correct!' : 'Not quite!'}
                </p>
                <p className="text-sm">{currentQuestion.explanation}</p>
              </div>
            )}
            
            {/* Next Button */}
            {showExplanation && (
              <button
                onClick={handleNext}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {currentIndex < questions.length - 1 ? (
                  <>
                    Next Question
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  'See Results'
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
