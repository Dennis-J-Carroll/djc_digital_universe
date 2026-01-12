import { useState, useEffect } from 'react';
import { THEMES } from '../constants';

/**
 * Custom hook for managing theme state and persistence
 * @returns {Object} Theme state and controls
 * @returns {string} currentTheme - The currently active theme ID
 * @returns {Function} changeTheme - Function to change the active theme
 * @returns {Array} themes - Array of available theme configurations
 */
export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState('dark');

  // Initialize theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') || 'dark';
      setCurrentTheme(savedTheme);
      document.body.classList.add(`${savedTheme}-theme`);
    }
  }, []);

  /**
   * Change the active theme
   * @param {string} themeId - The ID of the theme to activate
   */
  const changeTheme = (themeId) => {
    if (typeof window !== 'undefined') {
      // Validate theme ID
      const validTheme = THEMES.find(t => t.id === themeId);
      if (!validTheme) {
        console.warn(`Invalid theme ID: ${themeId}`);
        return;
      }

      // Remove all theme classes
      THEMES.forEach(theme => {
        document.body.classList.remove(`${theme.id}-theme`);
      });

      // Add new theme class
      document.body.classList.add(`${themeId}-theme`);
      setCurrentTheme(themeId);
      localStorage.setItem('theme', themeId);
    }
  };

  return {
    currentTheme,
    changeTheme,
    themes: THEMES
  };
};

export default useTheme;
