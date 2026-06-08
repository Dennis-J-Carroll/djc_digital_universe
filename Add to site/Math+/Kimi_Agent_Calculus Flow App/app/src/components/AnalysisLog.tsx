import { useRef, useEffect } from 'react';

export interface LogEntry {
  id: string;
  mode: string;
  text: string;
  math?: string;
  timestamp: number;
}

interface AnalysisLogProps {
  entries: LogEntry[];
}

export default function AnalysisLog({ entries }: AnalysisLogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only auto-scroll the container's INTERNAL scrollbar, never the whole page
    if (containerRef.current && entries.length > 0) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [entries.length]);

  const isEmpty = entries.length === 0;

  return (
    <div
      id="analysis-log"
      ref={containerRef}
      className="mx-auto"
      style={{
        maxWidth: 900,
        marginTop: 16,
        marginBottom: 32,
        background: '#0d1230',
        border: '1px solid #1a2248',
        borderRadius: 12,
        padding: '16px 20px',
        minHeight: 48,
        maxHeight: 300,
        overflowY: 'auto',
      }}
    >
      {isEmpty ? (
        <p
          className="text-center italic font-body text-sm"
          style={{ color: '#64748b' }}
        >
          Start exploring to see your analysis log here...
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="font-math text-[13px] leading-relaxed"
              style={{
                color: '#94a3b8',
                animation: 'fade-in-up 250ms ease-out',
              }}
            >
              <span
                className="text-[11px] font-body uppercase mr-2"
                style={{ color: '#22d3ee', letterSpacing: '0.04em' }}
              >
                [{entry.mode}]
              </span>
              <span>{entry.text}</span>
              {entry.math && (
                <span className="ml-1" style={{ color: '#22d3ee' }}>
                  {entry.math}
                </span>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>
      )}
    </div>
  );
}
