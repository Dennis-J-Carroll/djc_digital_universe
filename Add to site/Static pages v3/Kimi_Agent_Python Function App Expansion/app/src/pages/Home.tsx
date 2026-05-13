import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { getTodaysFunction, pythonFunctions } from '../data/pythonFunctionsExpanded';
import { 
  Zap, 
  Heart, 
  Star, 
  ArrowRight, 
  BookOpen,
  Flame,
  Search,
  ChevronRight,
  Trophy,
  HelpCircle,
  Target
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const navigate = useNavigate();
  const updateStreak = useUserStore(state => state.updateStreak);
  const totalCompleted = useUserStore(state => state.completedFunctions.length);
  const totalFavorites = useUserStore(state => state.favoriteFunctions.length);
  const currentStreak = useUserStore(state => state.streak);
  const completionRate = useUserStore(state => Math.round((state.completedFunctions.length / 50) * 100));
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const todaysFunction = getTodaysFunction();
  
  useEffect(() => {
    updateStreak();
  }, [updateStreak]);
  
  // Use useMemo for search results instead of useEffect to avoid setState in effect
  const searchResults = searchQuery.length > 1 
    ? pythonFunctions.filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];
  
  // Hero animations
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-card', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });
      
      gsap.from('.hero-stat', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        delay: 0.3,
        ease: 'power3.out',
      });
      
      gsap.from('.decorative-block', {
        scale: 0,
        rotation: -20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        delay: 0.5,
        ease: 'back.out(1.7)',
      });
    }, heroRef);
    
    return () => ctx.revert();
  }, []);
  
  return (
    <div className="min-h-screen bg-[#B7C4E8]" ref={heroRef}>
      {/* Navigation */}
      <nav className="bg-white border-b-3 border-black px-8 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button 
            onClick={() => navigate('/')}
            className="font-display font-black text-2xl hover:text-[#E94E77] transition-colors"
          >
            PyDay
          </button>
          
          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/progress')}
              className="nav-link hidden md:block"
            >
              Progress
            </button>
            <button 
              onClick={() => navigate('/favorites')}
              className="nav-link hidden md:block"
            >
              Favorites
            </button>
            <button 
              onClick={() => navigate('/archive')}
              className="nav-link hidden md:block"
            >
              Archive
            </button>
          </div>
        </div>
        
        {/* Search Bar */}
        {showSearch && (
          <div className="mt-4 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search functions..."
              className="input-field w-full"
              autoFocus
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-3 border-black rounded-xl overflow-hidden z-50">
                {searchResults.map(func => (
                  <button
                    key={func.id}
                    onClick={() => {
                      navigate(`/function/${func.id}`);
                      setShowSearch(false);
                      setSearchQuery('');
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-200 last:border-0"
                  >
                    <p className="font-display font-bold">{func.name}</p>
                    <p className="text-sm text-[#2A2A2A] line-clamp-1">{func.description}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>
      
      {/* Hero Section */}
      <section className="relative px-8 py-12 max-w-7xl mx-auto">
        {/* Decorative Blocks */}
        <div className="decorative-block absolute left-[5%] top-[10%] w-12 h-12 bg-[#FFD166] border-3 border-black rounded-lg" />
        <div className="decorative-block absolute right-[10%] top-[20%] w-16 h-16 bg-[#4B6BFB] border-3 border-black rounded-lg" />
        <div className="decorative-block absolute left-[8%] bottom-[20%] w-14 h-14 bg-[#F4A6C3] border-3 border-black rounded-lg" />
        <div className="decorative-block absolute right-[5%] bottom-[10%] w-10 h-10 bg-[#C9E8D8] border-3 border-black rounded-lg" />
        
        {/* Stamps */}
        <div className="absolute left-[15%] top-[30%]">
          <Zap className="w-10 h-10 text-[#FFD166] fill-[#FFD166]" strokeWidth={3} />
        </div>
        <div className="absolute right-[15%] top-[40%]">
          <Heart className="w-10 h-10 text-[#E94E77] fill-[#E94E77]" strokeWidth={3} />
        </div>
        <div className="absolute left-[20%] bottom-[30%]">
          <Star className="w-10 h-10 text-[#FFD166] fill-[#FFD166]" strokeWidth={3} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Function Card */}
          <div className="lg:col-span-2">
            <div className="hero-card card-main">
              <div className="card-header bg-[#E94E77] text-white">
                <BookOpen className="w-5 h-5 mr-2" />
                Today's Function
              </div>
              
              <div className="p-8">
                <h1 className="font-display font-black text-[clamp(32px,5vw,56px)] text-black mb-4">
                  {todaysFunction.name}
                </h1>
                
                <p className="text-[clamp(16px,1.5vw,20px)] text-[#2A2A2A] max-w-2xl mb-6">
                  {todaysFunction.description}
                </p>
                
                <div className="code-block inline-block mb-6">
                  <code>{todaysFunction.signature}</code>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => navigate(`/function/${todaysFunction.id}`)}
                    className="btn-primary px-6 py-3 flex items-center gap-2"
                  >
                    Learn More
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => navigate('/archive')}
                    className="px-6 py-3 border-3 border-black rounded-xl font-display font-bold hover:bg-black hover:text-white transition-colors"
                  >
                    Browse Archive
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Sidebar */}
          <div className="space-y-4">
            <div className="hero-stat card-main p-6">
              <div className="flex items-center gap-3 mb-2">
                <Flame className="w-6 h-6 text-[#E94E77]" />
                <span className="text-sm text-[#2A2A2A]">Current Streak</span>
              </div>
              <p className="font-display font-black text-4xl">{currentStreak} days</p>
            </div>
            
            <div className="hero-stat card-main p-6">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-6 h-6 text-[#4B6BFB]" />
                <span className="text-sm text-[#2A2A2A]">Functions Learned</span>
              </div>
              <p className="font-display font-black text-4xl">{totalCompleted}</p>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#4B6BFB] transition-all"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
            
            <div className="hero-stat card-main p-6">
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-6 h-6 text-[#FFD166]" />
                <span className="text-sm text-[#2A2A2A]">Favorites</span>
              </div>
              <p className="font-display font-black text-4xl">{totalFavorites}</p>
              <button
                onClick={() => navigate('/favorites')}
                className="text-sm text-[#E94E77] flex items-center gap-1 mt-2 hover:gap-2 transition-all"
              >
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Quick Actions */}
      <section className="px-8 py-12 max-w-7xl mx-auto">
        <h2 className="font-display font-black text-2xl mb-6">Practice & Learn</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/challenges')}
            className="card-main p-6 text-left hover:shadow-lg transition-shadow border-l-6 border-[#FFD166]"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-[#FFD166] rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">Daily Challenges</h3>
                <p className="text-sm text-[#2A2A2A]">Practice with coding exercises</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/quiz')}
            className="card-main p-6 text-left hover:shadow-lg transition-shadow border-l-6 border-[#4B6BFB]"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-[#4B6BFB] rounded-xl flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">Quiz</h3>
                <p className="text-sm text-[#2A2A2A]">Test your knowledge</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/archive')}
            className="card-main p-6 text-left hover:shadow-lg transition-shadow border-l-6 border-[#E94E77]"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-[#E94E77] rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg">Browse Archive</h3>
                <p className="text-sm text-[#2A2A2A]">Explore all {pythonFunctions.length}+ functions</p>
              </div>
            </div>
          </button>
        </div>
      </section>
      
      {/* Quick Categories */}
      <section className="px-8 py-12 max-w-7xl mx-auto">
        <h2 className="font-display font-black text-2xl mb-6">Explore by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Built-in', count: 12, color: '#4B6BFB' },
            { name: 'Strings', count: 8, color: '#FFD166' },
            { name: 'Itertools', count: 6, color: '#C9E8D8' },
            { name: 'Datetime', count: 4, color: '#F4A6C3' },
            { name: 'Math', count: 5, color: '#F6D7C3' },
            { name: 'Random', count: 4, color: '#9B5DE5' },
            { name: 'NumPy', count: 10, color: '#4B8BBE' },
            { name: 'Pandas', count: 6, color: '#E70488' },
          ].map(cat => (
            <button
              key={cat.name}
              onClick={() => navigate('/archive')}
              className="card-main p-4 text-left hover:shadow-lg transition-shadow"
              style={{ borderLeftWidth: '6px', borderLeftColor: cat.color }}
            >
              <h3 className="font-display font-bold">{cat.name}</h3>
              <p className="text-sm text-[#2A2A2A]">{cat.count} functions</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
