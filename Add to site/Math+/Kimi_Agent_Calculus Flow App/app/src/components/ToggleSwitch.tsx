interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export default function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <div className="flex items-center gap-2">
      {label && (
        <span
          className="font-body text-[13px] font-medium select-none"
          style={{ color: '#e2e8f0' }}
        >
          {label}
        </span>
      )}
      <button
        onClick={() => onChange(!checked)}
        className="relative cursor-pointer outline-none inline-flex items-center justify-center"
        style={{
          width: 52,
          height: 28,
          borderRadius: 9999,
          background: '#111835',
          border: '1px solid #1a2248',
          transition: 'all 200ms ease',
          minHeight: 44,
        }}
        aria-checked={checked}
        role="switch"
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 9999,
            background: checked ? '#10b981' : '#64748b',
            position: 'absolute',
            top: 1,
            left: checked ? 25 : 2,
            transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), background 200ms',
          }}
        />
      </button>
    </div>
  );
}
