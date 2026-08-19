import { useState } from 'react';

export default function Navbar() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <nav
      className="sticky top-0 z-50 h-[40px] flex items-center justify-between px-6"
      style={{
        background: 'transparent',
        borderBottom: '1px solid rgba(26, 34, 72, 0.5)',
      }}
    >
      <div className="flex items-center gap-2 font-body text-[13px]">
        <a
          href="https://dennisjcarroll.com/apps/"
          className="transition-colors duration-200 inline-flex items-center"
          style={{
            color: hovered === 'back' ? '#22d3ee' : '#94a3b8',
            minHeight: 44,
          }}
          onMouseEnter={() => setHovered('back')}
          onMouseLeave={() => setHovered(null)}
        >
          ← Back to Projects
        </a>
        <span style={{ color: '#64748b' }}>|</span>
        <span className="font-medium" style={{ color: '#e2e8f0' }}>
          Calculus Flow
        </span>
      </div>
      <a
        href="https://dennisjcarroll.com/"
        className="font-body text-[13px] font-semibold transition-colors duration-200 inline-flex items-center justify-center px-2"
        style={{
          color: '#22d3ee',
          letterSpacing: '0.05em',
          minHeight: 44,
          minWidth: 44,
        }}
        onMouseEnter={() => setHovered('djc')}
        onMouseLeave={() => setHovered(null)}
      >
        DJC
      </a>
    </nav>
  );
}
