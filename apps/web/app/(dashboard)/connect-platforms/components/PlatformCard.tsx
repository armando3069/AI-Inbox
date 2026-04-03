import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { PlatformConfig } from "../utils/platforms.constants";

interface PlatformCardProps {
  platform:    PlatformConfig;
  isSelected:  boolean;
  isConnected: boolean;
  onClick:     () => void;
}

export function PlatformCard({ platform, isSelected, isConnected, onClick }: PlatformCardProps) {
  const clickable = platform.status === "available";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={[
        "group relative w-full rounded-2xl border p-5 text-left transition-all duration-150 ease-out overflow-hidden",
        "bg-[var(--bg-surface)] border-[var(--border-warm)]",
        clickable && !isSelected
          ? "cursor-pointer hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-default)] hover:shadow-[var(--shadow-sm)]"
          : "",
        isSelected
          ? "border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/10 shadow-[var(--shadow-sm)] cursor-default"
          : "",
        isConnected && !isSelected ? "opacity-90" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Selected top accent bar */}
      {isSelected && (
        <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl bg-[var(--accent-primary)]" />
      )}

      {/* Connected top accent bar */}
      {isConnected && !isSelected && (
        <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl bg-emerald-500 dark:bg-emerald-600" />
      )}

      {/* Connected badge */}
      {isConnected && (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-400">
          <CheckCircle2 className="h-3 w-3" />
          Conectat
        </span>
      )}

      {/* Icon box */}
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-surface-hover)] transition-colors duration-200 group-hover:bg-[var(--border-subtle)]">
        <span className={platform.iconClass}>{platform.icon}</span>
      </div>

      {/* Content */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-[var(--text-primary)] leading-tight">
            {platform.label}
          </p>
          <p className="mt-1 text-[12px] text-[var(--text-secondary)] leading-relaxed">
            {platform.description}
          </p>
        </div>

        {clickable && (
          <ArrowRight
            className={[
              "h-4 w-4 shrink-0 mt-0.5 transition-all duration-200 text-[var(--text-tertiary)]",
              isSelected
                ? "opacity-70"
                : "opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5",
            ].join(" ")}
          />
        )}
      </div>
    </button>
  );
}
