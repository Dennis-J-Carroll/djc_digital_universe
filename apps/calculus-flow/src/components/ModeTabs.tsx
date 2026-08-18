import { useIsMobile } from '@/hooks/use-mobile';

interface Mode {
  key: string;
  label: string;
  shortLabel: string;
  icon: string;
}

const MODES: Mode[] = [
  { key: 'riemann', label: 'Riemann Sums', shortLabel: 'Sums', icon: '\u229E' },
  { key: 'tangent', label: 'Tangent Line', shortLabel: 'Slope', icon: '\u2197' },
  { key: 'derivative', label: 'Derivative Lab', shortLabel: 'Chain', icon: 'd/dx' },
  { key: 'area', label: 'Area Under Curve', shortLabel: 'Area', icon: '\u222B' },
  { key: 'ftc', label: 'Fundamental Theorem', shortLabel: 'FTC', icon: '\u21C4' },
  { key: 'limits', label: 'Limits', shortLabel: 'Limits', icon: 'lim' },
];

interface ModeTabsProps {
  activeMode: string;
  onModeChange: (mode: string) => void;
}

export default function ModeTabs({ activeMode, onModeChange }: ModeTabsProps) {
  const isMobile = useIsMobile();

  return (
    <div
      className="flex flex-wrap justify-center gap-2 mx-auto"
      style={{
        maxWidth: 900,
        marginBottom: 20,
        padding: 4,
        background: 'rgba(12, 16, 48, 0.6)',
        border: '1px solid #1a2248',
        borderRadius: 9999,
      }}
    >
      {MODES.map((mode) => {
        const isActive = activeMode === mode.key;
        return (
          <button
            key={mode.key}
            onClick={() => onModeChange(mode.key)}
            className="flex items-center gap-1.5 select-none focus-ring"
            aria-label={mode.label}
            aria-pressed={isActive}
            style={{
              background: isActive ? 'rgba(34, 211, 238, 0.1)' : 'transparent',
              border: isActive ? '1px solid #22d3ee' : '1px solid transparent',
              color: isActive ? '#22d3ee' : '#94a3b8',
              borderRadius: 9999,
              padding: isMobile ? '8px 14px' : '10px 16px',
              fontFamily: '"Inter", sans-serif',
              fontSize: isMobile ? 13 : 14,
              fontWeight: isActive ? 500 : 400,
              boxShadow: isActive ? '0 0 12px rgba(34, 211, 238, 0.2)' : 'none',
              cursor: 'pointer',
              transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              whiteSpace: 'nowrap',
              minHeight: 44,
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = '#e2e8f0';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = '#94a3b8';
              }
            }}
          >
            <span aria-hidden="true" style={{ fontSize: isMobile ? 13 : 13 }}>{mode.icon}</span>
            <span className="sm:hidden">{mode.shortLabel}</span>
            <span className="hidden sm:inline">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
