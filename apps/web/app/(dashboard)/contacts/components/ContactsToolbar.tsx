import { Search, SlidersHorizontal, Check, X } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/cn";
import { PLATFORM_OPTIONS } from "../utils/contacts.constants";

export interface ContactsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  platformFilter: Set<string>;
  onTogglePlatform: (platform: string) => void;
  onClearFilter: () => void;
}

export function ContactsToolbar({
  search,
  onSearchChange,
  platformFilter,
  onTogglePlatform,
  onClearFilter,
}: ContactsToolbarProps) {
  return (
    <div className="flex items-center gap-3 px-6 pb-4">
      {/* Search input */}
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[var(--text-tertiary)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search contacts..."
          className="w-full h-10 pl-9 pr-3 text-[13px] border border-[var(--border-default)] rounded-[var(--radius-input)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--border-default)] transition-all duration-120 ease-out"
        />
      </div>

      {/* Platform filter popover */}
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            className={cn(
              "h-10 px-3.5 text-[13px] font-medium rounded-[var(--radius-button)] border transition-all duration-120 ease-out inline-flex items-center gap-2 active:scale-[0.98]",
              platformFilter.size > 0
                ? "border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/[0.06] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/[0.10]"
                : "border-[var(--border-default)] text-[var(--text-secondary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {platformFilter.size > 0 && (
              <span className="flex items-center justify-center h-[18px] min-w-[18px] px-1 rounded-full bg-[var(--accent-primary)] text-white text-[10px] font-semibold leading-none">
                {platformFilter.size}
              </span>
            )}
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={6}
            className="w-56 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl shadow-[var(--shadow-dropdown)] z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 p-1.5"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-2.5 pt-1.5 pb-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                Platform
              </p>
              {platformFilter.size > 0 && (
                <button
                  onClick={onClearFilter}
                  className="text-[11px] text-[var(--accent-primary)] hover:underline font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Platform options */}
            {PLATFORM_OPTIONS.map((opt) => {
              const isActive = platformFilter.has(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => onTogglePlatform(opt.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors duration-120 cursor-pointer",
                    isActive
                      ? "bg-[var(--accent-primary)]/[0.06] text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {/* Checkbox indicator */}
                  <div
                    className={cn(
                      "flex items-center justify-center h-4 w-4 rounded-[4px] border transition-all duration-120 shrink-0",
                      isActive
                        ? "bg-[var(--accent-primary)] border-[var(--accent-primary)]"
                        : "border-[var(--border-default)] bg-[var(--bg-surface)]"
                    )}
                  >
                    {isActive && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </div>

                  <span className="text-[14px] leading-none">{opt.icon}</span>
                  <span className="flex-1 text-left">{opt.label}</span>
                </button>
              );
            })}

            <Popover.Arrow className="fill-[var(--bg-surface)]" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Active platform filter pills */}
      {platformFilter.size > 0 && (
        <div className="flex items-center gap-1.5">
          {Array.from(platformFilter).map((p) => {
            const opt = PLATFORM_OPTIONS.find((o) => o.id === p);
            return (
              <span
                key={p}
                className="inline-flex items-center gap-1 pl-2 pr-1 py-1 rounded-md bg-[var(--accent-primary)]/[0.06] border border-[var(--accent-primary)]/15 text-[12px] text-[var(--text-secondary)] font-medium"
              >
                <span className="text-[11px]">{opt?.icon}</span>
                {opt?.label}
                <button
                  onClick={() => onTogglePlatform(p)}
                  className="ml-0.5 p-0.5 rounded hover:bg-[var(--accent-primary)]/10 transition-colors"
                >
                  <X className="w-3 h-3 text-[var(--text-tertiary)]" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
