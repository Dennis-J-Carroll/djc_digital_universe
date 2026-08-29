import { useState } from 'react';

export default function Navbar() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <nav
      className="sticky top-0 z-50 h-[44px] flex items-center justify-between px-4"
      style={{
        background: 'rgba(15, 15, 26, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(34, 211, 238, 0.15)',
      }}
    >
      <div className="flex items-center gap-3 font-sans text-[13px] overflow-hidden">
        <a
          href="/apps/"
          className="transition-colors duration-200 inline-flex items-center flex-shrink-0"
          style={{ color: hovered === 'back' ? '#67e8f9' : '#22d3ee' }}
          onMouseEnter={() => setHovered('back')}
          onMouseLeave={() => setHovered(null)}
        >
          ← Back to Projects
        </a>
        <span style={{ color: '#4b5563' }} className="flex-shrink-0">|</span>
        <span
          className="font-medium overflow-hidden text-ellipsis whitespace-nowrap"
          style={{ color: '#d1d5db', maxWidth: '50vw' }}
        >
          Algebraic Flow
        </span>
      </div>
      <a
        href="/"
        className="font-sans text-[13px] font-bold transition-colors duration-200 flex-shrink-0"
        style={{ color: '#22d3ee', letterSpacing: '0.05em' }}
        onMouseEnter={() => setHovered('djc')}
        onMouseLeave={() => setHovered(null)}
      >
        DJC
      </a>
    </nav>
  );
}
