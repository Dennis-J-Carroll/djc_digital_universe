import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function GlassCard({ children, className = '', hover = true, onClick }: GlassCardProps) {
  return (
    <div
      className={`${className}`}
      onClick={onClick}
      style={{
        background: 'rgba(17, 24, 53, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid #1a2248',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
        cursor: onClick ? 'pointer' : 'default',
        transition: hover ? 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)' : undefined,
      }}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.borderColor = '#22d3ee';
          e.currentTarget.style.boxShadow = '0 4px 24px rgba(34, 211, 238, 0.08)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.borderColor = '#1a2248';
          e.currentTarget.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.2)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {children}
    </div>
  );
}
