import { Check } from "lucide-react";
import type { StepState } from "../utils/platforms.constants";

interface StepItemProps {
  number: number;
  label:  string;
  state:  StepState;
}

export function StepItem({ number, label, state }: StepItemProps) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={[
          "h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold transition-all duration-200",
          state === "active"
            ? "bg-[var(--accent-primary)] text-white"
            : "",
          state === "completed"
            ? "bg-emerald-500 text-white dark:bg-emerald-600"
            : "",
          state === "upcoming"
            ? "bg-[var(--bg-surface-hover)] text-[var(--text-tertiary)] border border-[var(--border-default)]"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {state === "completed" ? <Check className="h-3 w-3" /> : number}
      </span>

      <span
        className={[
          "text-[13px] transition-colors duration-200",
          state === "active"    ? "font-semibold text-[var(--text-primary)]"              : "",
          state === "completed" ? "font-medium text-emerald-600 dark:text-emerald-400"   : "",
          state === "upcoming"  ? "text-[var(--text-tertiary)]"                           : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {label}
      </span>
    </div>
  );
}
