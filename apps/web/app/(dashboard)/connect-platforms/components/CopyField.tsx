"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopyFieldProps {
  label: string;
  value: string;
}

export function CopyField({ label, value }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1.5">
      <p className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.06em]">
        {label}
      </p>
      <div className="flex items-center gap-2 rounded-[var(--radius-input)] border border-[var(--border-default)] bg-[var(--bg-page)] px-3.5 py-2.5">
        <code className="flex-1 min-w-0 truncate text-[12px] font-mono text-[var(--text-primary)] leading-snug">
          {value}
        </code>
        <button
          type="button"
          onClick={copy}
          className={[
            "shrink-0 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-all duration-150 ease-out",
            copied
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
              : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]",
          ].join(" ")}
        >
          {copied ? (
            <><Check className="h-3 w-3" />Copiat</>
          ) : (
            <><Copy className="h-3 w-3" />Copiază</>
          )}
        </button>
      </div>
    </div>
  );
}
