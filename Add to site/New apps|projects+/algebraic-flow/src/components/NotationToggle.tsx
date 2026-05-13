import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NotationToggleProps {
  useFormal: boolean;
  onToggle: () => void;
}

export const NotationToggle: React.FC<NotationToggleProps> = ({ 
  useFormal, 
  onToggle 
}) => {
  return (
    <motion.button
      onClick={onToggle}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2 rounded-full border transition-all",
        "backdrop-blur-sm",
        useFormal 
          ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300" 
          : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        initial={false}
        animate={{ x: useFormal ? 0 : 0 }}
        className="flex items-center gap-2"
      >
        {useFormal ? (
          <>
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium">Formal Notation</span>
          </>
        ) : (
          <>
            <GraduationCap className="w-4 h-4" />
            <span className="text-sm font-medium">Intuitive Mode</span>
          </>
        )}
      </motion.div>
      
      {/* Toggle indicator */}
      <div className={cn(
        "ml-2 w-10 h-5 rounded-full relative transition-colors",
        useFormal ? "bg-indigo-500/40" : "bg-emerald-500/40"
      )}>
        <motion.div
          className={cn(
            "absolute top-0.5 w-4 h-4 rounded-full shadow-md",
            useFormal ? "bg-indigo-400" : "bg-emerald-400"
          )}
          initial={false}
          animate={{ 
            left: useFormal ? 'calc(100% - 18px)' : '2px' 
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </motion.button>
  );
};

export default NotationToggle;
