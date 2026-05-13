import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { getFunctionById, pythonFunctions, learningPaths } from '../data/pythonFunctionsExpanded';
import { 
  ChevronLeft, 
  Trophy, 
  Flame, 
  Eye, 
  CheckCircle, 
  Star,
  Clock,
  Target
} from 'lucide-react';

export default function ProgressPage() {
  const navigate = useNavigate();
  const stats = useUserStore(state => state.getStats());
  const { viewedFunctions, completedFunctions, streak } = useUserStore();
  
  const recentFunctions = viewedFunctions
    .slice(-5)
    .map(id => getFunctionById(id))
    .filter(Boolean);
  
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
          
          <h1 className="font-display font-black text-2xl">Your Progress</h1>
          
          <div className="w-20" />
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="card-main p-6 text-center">
            <Flame className="w-8 h-8 mx-auto mb-2 text-[#E94E77]" />
            <p className="font-display font-black text-3xl">{streak}</p>
            <p className="text-sm text-[#2A2A2A]">Day Streak</p>
          </div>
          
          <div className="card-main p-6 text-center">
            <Eye className="w-8 h-8 mx-auto mb-2 text-[#4B6BFB]" />
            <p className="font-display font-black text-3xl">{stats.totalViewed}</p>
            <p className="text-sm text-[#2A2A2A]">Functions Viewed</p>
          </div>
          
          <div className="card-main p-6 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-[#C9E8D8]" />
            <p className="font-display font-black text-3xl">{stats.totalCompleted}</p>
            <p className="text-sm text-[#2A2A2A]">Functions Learned</p>
          </div>
          
          <div className="card-main p-6 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-[#FFD166]" />
            <p className="font-display font-black text-3xl">{stats.totalFavorites}</p>
            <p className="text-sm text-[#2A2A2A]">Favorites</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="card-main p-6 mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-[#FFD166]" />
              <h2 className="font-display font-bold text-xl">Overall Progress</h2>
            </div>
            <span className="font-display font-bold text-2xl">{stats.completionRate}%</span>
          </div>
          <div className="h-4 bg-gray-200 border-2 border-black rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#E94E77] transition-all duration-500"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          <p className="text-sm text-[#2A2A2A] mt-2">
            {stats.totalCompleted} of {pythonFunctions.length} functions learned
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Learning Paths */}
          <div>
            <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-[#E94E77]" />
              Learning Paths
            </h2>
            <div className="space-y-4">
              {learningPaths.map(path => {
                const completedInPath = path.functions.filter(id => 
                  completedFunctions.includes(id)
                ).length;
                const progress = Math.round((completedInPath / path.functions.length) * 100);
                
                return (
                  <div key={path.id} className="card-main p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{path.emoji}</span>
                      <div className="flex-1">
                        <h3 className="font-display font-bold">{path.name}</h3>
                        <p className="text-xs text-[#2A2A2A]">{path.estimatedHours} hours</p>
                      </div>
                      <span className="font-display font-bold">{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 border border-black rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500"
                        style={{ 
                          width: `${progress}%`,
                          backgroundColor: path.color 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Recently Viewed */}
          <div>
            <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-[#4B6BFB]" />
              Recently Viewed
            </h2>
            {recentFunctions.length === 0 ? (
              <div className="card-main p-6 text-center">
                <p className="text-[#2A2A2A]">No functions viewed yet</p>
                <button
                  onClick={() => navigate('/archive')}
                  className="btn-primary mt-4 px-4 py-2"
                >
                  Start Learning
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentFunctions.map(func => func && (
                  <button
                    key={func.id}
                    onClick={() => navigate(`/function/${func.id}`)}
                    className="card-main p-4 w-full text-left hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display font-bold">{func.name}</h3>
                        <p className="text-sm text-[#2A2A2A] line-clamp-1">
                          {func.description}
                        </p>
                      </div>
                      {completedFunctions.includes(func.id) && (
                        <CheckCircle className="w-5 h-5 text-[#C9E8D8]" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
