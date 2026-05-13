import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { getFunctionById } from '../data/pythonFunctionsExpanded';
import type { PythonFunction } from '../types';
import { ChevronLeft, Star, Trash2, BookOpen } from 'lucide-react';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { favoriteFunctions, removeFromFavorites } = useUserStore();
  
  const favoriteFuncs = favoriteFunctions
    .map(id => getFunctionById(id))
    .filter((f): f is PythonFunction => f !== undefined);
  
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
          
          <h1 className="font-display font-black text-2xl">Your Favorites</h1>
          
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-8 py-8">
        {favoriteFuncs.length === 0 ? (
          <div className="text-center py-16">
            <Star className="w-16 h-16 mx-auto mb-4 text-[#FFD166]" />
            <h2 className="font-display font-bold text-2xl text-black mb-2">
              No Favorites Yet
            </h2>
            <p className="text-[#2A2A2A] mb-6">
              Star functions you want to remember and they'll appear here.
            </p>
            <button
              onClick={() => navigate('/archive')}
              className="btn-primary px-6 py-3"
            >
              Browse Functions
            </button>
          </div>
        ) : (
          <>
            <p className="text-[#2A2A2A] mb-6">
              {favoriteFuncs.length} function{favoriteFuncs.length !== 1 ? 's' : ''} saved
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteFuncs.map(func => (
                <div key={func.id} className="archive-card relative group">
                  <button
                    onClick={() => removeFromFavorites(func.id)}
                    className="absolute top-4 right-4 p-2 bg-white border-2 border-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#F4A6C3]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => navigate(`/function/${func.id}`)}
                    className="text-left w-full"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                        style={{
                          backgroundColor: 
                            func.difficulty === 'beginner' ? '#C9E8D8' :
                            func.difficulty === 'intermediate' ? '#FFD166' : '#F4A6C3'
                        }}
                      >
                        {func.difficulty}
                      </span>
                      <span className="text-xs text-[#2A2A2A] capitalize">
                        {func.category}
                      </span>
                    </div>
                    
                    <h3 className="font-display font-bold text-xl mb-2">
                      {func.name}
                    </h3>
                    
                    <p className="text-sm text-[#2A2A2A] line-clamp-2 mb-4">
                      {func.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-[#E94E77] text-sm font-medium">
                      <BookOpen className="w-4 h-4" />
                      View Details
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
