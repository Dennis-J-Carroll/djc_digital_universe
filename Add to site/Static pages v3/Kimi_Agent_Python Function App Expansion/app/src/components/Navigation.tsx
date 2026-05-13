import { useState, useEffect } from 'react';

export default function Navigation() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > window.innerHeight * 0.5);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-full opacity-0'
      }`}
    >
      <div className="bg-white/90 backdrop-blur-md border-b-3 border-black">
        <div className="flex items-center justify-between px-8 py-4">
          {/* Logo */}
          <button
            onClick={() => scrollToSection('hero')}
            className="font-display font-black text-2xl text-black hover:text-[#E94E77] transition-colors"
          >
            PyDay
          </button>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('hero')}
              className="nav-link"
            >
              Today
            </button>
            <button
              onClick={() => scrollToSection('archive')}
              className="nav-link"
            >
              Archive
            </button>
            <button
              onClick={() => scrollToSection('collections')}
              className="nav-link"
            >
              Collections
            </button>
            <button
              onClick={() => scrollToSection('footer')}
              className="nav-link"
            >
              About
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
