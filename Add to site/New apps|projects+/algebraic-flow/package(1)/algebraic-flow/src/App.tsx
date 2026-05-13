import React from 'react';
import InteractiveEquation from './components/InteractiveEquation';
import ConstellationBackground from './components/ConstellationBackground';

function App() {
  return (
    <div className="w-full min-h-screen relative text-slate-100 font-sans overflow-x-hidden selection:bg-cyan-500/30">
      <ConstellationBackground />
      <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center min-h-screen">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 mb-2 filter drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
            ALGEBRAIC FLOW
          </h1>
          <p className="text-slate-400 text-lg font-light tracking-wide">Interactive Equation Solver</p>
        </header>
        <InteractiveEquation />
      </div>
    </div>
  );
}

export default App;
