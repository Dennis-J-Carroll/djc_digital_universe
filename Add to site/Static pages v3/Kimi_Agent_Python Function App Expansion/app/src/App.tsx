import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './pages/Home';
import FunctionPage from './pages/FunctionPage';
import FavoritesPage from './pages/FavoritesPage';
import ProgressPage from './pages/ProgressPage';
import ArchivePage from './pages/ArchivePage';
import ChallengesPage from './pages/ChallengesPage';
import QuizPage from './pages/QuizPage';
import './App.css';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Page transition wrapper
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

function App() {
  return (
    <Router basename="/apps/python-function-a-day">
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path="/"
            element={
              <PageTransition>
                <Home />
              </PageTransition>
            }
          />
          <Route
            path="/function/:id"
            element={
              <PageTransition>
                <FunctionPage />
              </PageTransition>
            }
          />
          <Route
            path="/favorites"
            element={
              <PageTransition>
                <FavoritesPage />
              </PageTransition>
            }
          />
          <Route
            path="/progress"
            element={
              <PageTransition>
                <ProgressPage />
              </PageTransition>
            }
          />
          <Route
            path="/archive"
            element={
              <PageTransition>
                <ArchivePage />
              </PageTransition>
            }
          />
          <Route
            path="/challenges"
            element={
              <PageTransition>
                <ChallengesPage />
              </PageTransition>
            }
          />
          <Route
            path="/quiz"
            element={
              <PageTransition>
                <QuizPage />
              </PageTransition>
            }
          />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;
