import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProgress } from '../types';

interface UserState extends UserProgress {
  // View tracking
  markAsViewed: (functionId: string) => void;
  hasViewed: (functionId: string) => boolean;
  
  // Completion tracking
  markAsCompleted: (functionId: string) => void;
  unmarkAsCompleted: (functionId: string) => void;
  hasCompleted: (functionId: string) => boolean;
  
  // Favorites
  addToFavorites: (functionId: string) => void;
  removeFromFavorites: (functionId: string) => void;
  isFavorite: (functionId: string) => boolean;
  
  // Notes
  addNote: (functionId: string, note: string) => void;
  getNote: (functionId: string) => string;
  
  // Streak
  updateStreak: () => void;
  
  // Stats
  getStats: () => {
    totalViewed: number;
    totalCompleted: number;
    totalFavorites: number;
    completionRate: number;
    currentStreak: number;
  };
  
  // Reset
  resetProgress: () => void;
}

const initialState: UserProgress = {
  viewedFunctions: [],
  completedFunctions: [],
  favoriteFunctions: [],
  lastVisited: new Date().toISOString(),
  streak: 0,
  totalTimeSpent: 0,
  notes: {},
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      markAsViewed: (functionId: string) => {
        set((state) => {
          if (state.viewedFunctions.includes(functionId)) {
            return state;
          }
          return {
            viewedFunctions: [...state.viewedFunctions, functionId],
            lastVisited: new Date().toISOString(),
          };
        });
      },
      
      hasViewed: (functionId: string) => {
        return get().viewedFunctions.includes(functionId);
      },
      
      markAsCompleted: (functionId: string) => {
        set((state) => {
          if (state.completedFunctions.includes(functionId)) {
            return state;
          }
          return {
            completedFunctions: [...state.completedFunctions, functionId],
          };
        });
      },
      
      unmarkAsCompleted: (functionId: string) => {
        set((state) => ({
          completedFunctions: state.completedFunctions.filter(id => id !== functionId),
        }));
      },
      
      hasCompleted: (functionId: string) => {
        return get().completedFunctions.includes(functionId);
      },
      
      addToFavorites: (functionId: string) => {
        set((state) => {
          if (state.favoriteFunctions.includes(functionId)) {
            return state;
          }
          return {
            favoriteFunctions: [...state.favoriteFunctions, functionId],
          };
        });
      },
      
      removeFromFavorites: (functionId: string) => {
        set((state) => ({
          favoriteFunctions: state.favoriteFunctions.filter(id => id !== functionId),
        }));
      },
      
      isFavorite: (functionId: string) => {
        return get().favoriteFunctions.includes(functionId);
      },
      
      addNote: (functionId: string, note: string) => {
        set((state) => ({
          notes: {
            ...state.notes,
            [functionId]: note,
          },
        }));
      },
      
      getNote: (functionId: string) => {
        return get().notes[functionId] || '';
      },
      
      updateStreak: () => {
        set((state) => {
          const lastVisit = new Date(state.lastVisited);
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          // Check if last visit was yesterday
          const isConsecutive = 
            lastVisit.getDate() === yesterday.getDate() &&
            lastVisit.getMonth() === yesterday.getMonth() &&
            lastVisit.getFullYear() === yesterday.getFullYear();
          
          // Check if already visited today
          const alreadyToday =
            lastVisit.getDate() === today.getDate() &&
            lastVisit.getMonth() === today.getMonth() &&
            lastVisit.getFullYear() === today.getFullYear();
          
          if (alreadyToday) {
            return state;
          }
          
          return {
            streak: isConsecutive ? state.streak + 1 : 1,
            lastVisited: today.toISOString(),
          };
        });
      },
      
      getStats: () => {
        const state = get();
        const totalFunctions = 50; // Approximate total
        return {
          totalViewed: state.viewedFunctions.length,
          totalCompleted: state.completedFunctions.length,
          totalFavorites: state.favoriteFunctions.length,
          completionRate: Math.round((state.completedFunctions.length / totalFunctions) * 100),
          currentStreak: state.streak,
        };
      },
      
      resetProgress: () => {
        set(initialState);
      },
    }),
    {
      name: 'pyday-user-progress',
      version: 1,
    }
  )
);
