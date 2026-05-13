import React from 'react';
import { motion } from 'framer-motion';
import { AXIOMS, Axiom, getAxiomsByCategory } from '../lib/axioms';
import { Tex } from '../lib/math';
import { BookOpen, Scale, Calculator } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AxiomPanelProps {
  activeAxiomId: string | null;
  useFormal: boolean;
  onAxiomClick?: (axiom: Axiom) => void;
}

const categoryIcons = {
  field: Calculator,
  equality: Scale,
  operation: BookOpen
};

const categoryLabels = {
  field: 'Field Axioms',
  equality: 'Equality Properties',
  operation: 'Operations'
};

const categoryColors = {
  field: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
  equality: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  operation: 'text-amber-400 border-amber-500/30 bg-amber-500/10'
};

const AxiomCard = ({ 
  axiom, 
  isActive, 
  useFormal,
  onClick 
}: { 
  axiom: Axiom; 
  isActive: boolean;
  useFormal: boolean;
  onClick: () => void;
}) => {
  return (
    <motion.div
      layout
      onClick={onClick}
      animate={{
        backgroundColor: isActive ? "rgba(99, 102, 241, 0.2)" : "rgba(30, 41, 59, 0.6)",
        borderColor: isActive ? "rgba(99, 102, 241, 0.8)" : "rgba(71, 85, 105, 0.5)",
        scale: isActive ? 1.02 : 1,
        boxShadow: isActive ? "0 0 25px rgba(99, 102, 241, 0.3)" : "none"
      }}
      whileHover={{ scale: 1.01, borderColor: "rgba(99, 102, 241, 0.4)" }}
      className={cn(
        "p-4 rounded-xl border backdrop-blur-sm transition-all cursor-pointer",
        "hover:bg-slate-800/60"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className={cn(
          "font-bold text-sm uppercase tracking-wider",
          isActive ? "text-indigo-300" : "text-slate-400"
        )}>
          {useFormal ? axiom.formalName : axiom.intuitiveName}
        </h4>
        {isActive && (
          <motion.span 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }}
            className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full font-bold border border-indigo-500/40"
          >
            ACTIVE
          </motion.span>
        )}
      </div>
      
      <div className="text-lg text-slate-200 mb-2 overflow-x-auto">
        <Tex latex={axiom.latex} />
      </div>
      
      <p className="text-xs text-slate-400 leading-relaxed">
        {axiom.description}
      </p>
      
      <div className="mt-2 flex items-center gap-2">
        <span className={cn(
          "text-[10px] px-2 py-0.5 rounded-full border",
          categoryColors[axiom.category]
        )}>
          {categoryLabels[axiom.category]}
        </span>
      </div>
    </motion.div>
  );
};

export const AxiomPanel: React.FC<AxiomPanelProps> = ({ 
  activeAxiomId, 
  useFormal,
  onAxiomClick 
}) => {
  const categories: Axiom['category'][] = ['field', 'equality', 'operation'];
  
  return (
    <div className="w-full">
      <h3 className="text-center uppercase tracking-widest font-bold mb-6 text-slate-500 text-xs">
        Field Axioms & Equality Properties
      </h3>
      
      <div className="space-y-6">
        {categories.map(category => {
          const axioms = getAxiomsByCategory(category);
          const Icon = categoryIcons[category];
          
          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <Icon className={cn("w-4 h-4", 
                  category === 'field' ? 'text-cyan-400' :
                  category === 'equality' ? 'text-emerald-400' : 'text-amber-400'
                )} />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {categoryLabels[category]}
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {axioms.map(axiom => (
                  <AxiomCard
                    key={axiom.id}
                    axiom={axiom}
                    isActive={activeAxiomId === axiom.id}
                    useFormal={useFormal}
                    onClick={() => onAxiomClick?.(axiom)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AxiomPanel;
