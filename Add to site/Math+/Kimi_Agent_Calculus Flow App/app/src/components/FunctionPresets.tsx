import { useMemo } from 'react';
import { getFunctionPresets } from '@/lib/mathFunctions';

interface FunctionPresetsProps {
  mode: string;
  activeFunction: string;
  onFunctionChange: (key: string) => void;
}

export default function FunctionPresets({
  mode,
  activeFunction,
  onFunctionChange,
}: FunctionPresetsProps) {
  const presets = useMemo(() => getFunctionPresets(mode), [mode]);

  if (presets.length === 0) return null;

  return (
    <div
      className="flex flex-wrap justify-center gap-2 mx-auto"
      style={{ maxWidth: 900, marginBottom: 16 }}
    >
      {presets.map((preset) => {
        const isActive = activeFunction === preset.key;
        return (
          <button
            key={preset.key}
            onClick={() => onFunctionChange(preset.key)}
            className="outline-none select-none"
            style={{
              background: isActive
                ? 'rgba(34, 211, 238, 0.1)'
                : 'rgba(17, 24, 53, 0.6)',
              border: isActive ? '1px solid #22d3ee' : '1px solid #1a2248',
              color: isActive ? '#22d3ee' : '#94a3b8',
              borderRadius: 9999,
              padding: '8px 14px',
              fontFamily: '"Inter", sans-serif',
              fontSize: 12,
              fontWeight: isActive ? 500 : 400,
              cursor: 'pointer',
              transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              whiteSpace: 'nowrap',
              minHeight: 44,
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = '#22d3ee';
                e.currentTarget.style.color = '#22d3ee';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = '#1a2248';
                e.currentTarget.style.color = '#94a3b8';
              }
            }}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}
