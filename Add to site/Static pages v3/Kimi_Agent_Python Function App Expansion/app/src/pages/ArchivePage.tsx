import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  pythonFunctions, 
  categories, 
  libraries 
} from '../data/pythonFunctionsExpanded';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  BookOpen, 
  Star,
  Code,
  Package
} from 'lucide-react';
import { useUserStore } from '../store/userStore';

export default function ArchivePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLibrary, setSelectedLibrary] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const { isFavorite } = useUserStore();
  
  // Filter functions
  const filteredFunctions = useMemo(() => {
    return pythonFunctions.filter(func => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          func.name.toLowerCase().includes(query) ||
          func.description.toLowerCase().includes(query) ||
          func.tags.some(tag => tag.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      
      // Category filter
      if (selectedCategory !== 'all' && func.category !== selectedCategory) {
        return false;
      }
      
      // Library filter
      if (selectedLibrary !== 'all' && func.library !== selectedLibrary) {
        return false;
      }
      
      // Difficulty filter
      if (selectedDifficulty !== 'all' && func.difficulty !== selectedDifficulty) {
        return false;
      }
      
      return true;
    });
  }, [searchQuery, selectedCategory, selectedLibrary, selectedDifficulty]);
  
  // Group by category for display
  const groupedFunctions = useMemo(() => {
    const groups: Record<string, typeof pythonFunctions> = {};
    filteredFunctions.forEach(func => {
      if (!groups[func.category]) {
        groups[func.category] = [];
      }
      groups[func.category].push(func);
    });
    return groups;
  }, [filteredFunctions]);
  
  const getCategoryLabel = (id: string) => {
    return categories.find(c => c.id === id)?.label || id;
  };
  
  const getCategoryColor = (id: string) => {
    return categories.find(c => c.id === id)?.color || '#E94E77';
  };
  
  return (
    <div className="min-h-screen bg-[#B7C4E8]">
      {/* Header */}
      <header className="bg-white border-b-3 border-black px-8 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-black hover:text-[#E94E77] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            
            <h1 className="font-display font-black text-2xl">Function Archive</h1>
            
            <div className="w-20" />
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2A2A2A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search functions by name, description, or tags..."
              className="input-field w-full pl-12 pr-12"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-[#E94E77] text-white' : 'hover:bg-gray-100'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 border-3 border-black rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Library Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Library</label>
                  <select
                    value={selectedLibrary}
                    onChange={(e) => setSelectedLibrary(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="all">All Libraries</option>
                    {libraries.map(lib => (
                      <option key={lib.id} value={lib.id}>
                        {lib.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="all">All Categories</option>
                    {categories
                      .filter(c => selectedLibrary === 'all' || c.library === selectedLibrary || c.id === 'all')
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                  </select>
                </div>
                
                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {/* Results Count */}
          <p className="mt-4 text-sm text-[#2A2A2A]">
            Showing {filteredFunctions.length} of {pythonFunctions.length} functions
          </p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-8 py-8">
        {filteredFunctions.length === 0 ? (
          <div className="text-center py-16">
            <Code className="w-16 h-16 mx-auto mb-4 text-[#4B6BFB]" />
            <h2 className="font-display font-bold text-2xl text-black mb-2">
              No Functions Found
            </h2>
            <p className="text-[#2A2A2A]">
              Try adjusting your search or filters
            </p>
          </div>
        ) : searchQuery ? (
          // Search results - flat list
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFunctions.map(func => (
              <FunctionCard 
                key={func.id} 
                func={func} 
                isFav={isFavorite(func.id)}
              />
            ))}
          </div>
        ) : (
          // Grouped by category
          <div className="space-y-12">
            {Object.entries(groupedFunctions).map(([category, funcs]) => (
              <section key={category}>
                <div 
                  className="flex items-center gap-3 mb-4"
                  style={{ borderLeftWidth: '6px', borderLeftColor: getCategoryColor(category), paddingLeft: '12px' }}
                >
                  <h2 className="font-display font-black text-2xl">
                    {getCategoryLabel(category)}
                  </h2>
                  <span className="text-sm text-[#2A2A2A]">
                    {funcs.length} functions
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {funcs.map(func => (
                    <FunctionCard 
                      key={func.id} 
                      func={func}
                      isFav={isFavorite(func.id)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Function Card Component
interface FunctionCardProps {
  func: typeof pythonFunctions[0];
  isFav: boolean;
}

function FunctionCard({ func, isFav }: FunctionCardProps) {
  const navigate = useNavigate();
  
  const difficultyColor = {
    beginner: '#C9E8D8',
    intermediate: '#FFD166',
    advanced: '#F4A6C3',
  }[func.difficulty];
  
  return (
    <button
      onClick={() => navigate(`/function/${func.id}`)}
      className="archive-card text-left relative group"
    >
      {/* Favorite indicator */}
      {isFav && (
        <Star className="absolute top-4 right-4 w-5 h-5 text-[#FFD166] fill-[#FFD166]" />
      )}
      
      {/* Library badge */}
      {func.library === 'third-party' && (
        <div className="absolute top-4 right-12 px-2 py-1 bg-[#E94E77] text-white text-xs font-bold rounded-full flex items-center gap-1">
          <Package className="w-3 h-3" />
          {func.package}
        </div>
      )}
      
      <div className="flex items-center gap-2 mb-3">
        <span 
          className="px-2 py-1 rounded-full text-xs font-medium capitalize"
          style={{ backgroundColor: difficultyColor }}
        >
          {func.difficulty}
        </span>
        {func.interactive && (
          <span className="px-2 py-1 bg-[#4B6BFB] text-white text-xs font-medium rounded-full flex items-center gap-1">
            <Code className="w-3 h-3" />
            Interactive
          </span>
        )}
      </div>
      
      <h3 className="font-display font-bold text-xl mb-2 group-hover:text-[#E94E77] transition-colors">
        {func.name}
      </h3>
      
      <p className="text-sm text-[#2A2A2A] line-clamp-2 mb-4">
        {func.description}
      </p>
      
      <div className="code-block py-2 px-3 text-xs mb-4">
        <code className="line-clamp-1">{func.signature}</code>
      </div>
      
      <div className="flex items-center gap-2 text-[#E94E77] text-sm font-medium">
        <BookOpen className="w-4 h-4" />
        Learn More
      </div>
    </button>
  );
}
