"use client";

export interface ConfidenceSliderProps {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}

export function ConfidenceSlider({ value, onChange, disabled }: ConfidenceSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-[var(--text-secondary)]">Confidence threshold</span>
        <span className="rounded-full bg-[var(--bg-surface-hover)] border border-[var(--border-default)] px-2.5 py-0.5 text-[12px] font-semibold text-[var(--text-primary)] tabular-nums">
          {value}%
        </span>
      </div>

      <div className="relative">
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="slider-premium h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[var(--border-default)] disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            background: `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-primary) ${value}%, var(--border-default) ${value}%, var(--border-default) 100%)`,
          }}
        />
      </div>

      <div className="flex justify-between text-[11px] text-[var(--text-tertiary)]">
        <span>0% — always respond</span>
        <span>100% — very strict</span>
      </div>
    </div>
  );
}
