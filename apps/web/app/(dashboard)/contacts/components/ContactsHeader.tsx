import { ChevronDown, Pencil, FileSpreadsheet, Trash2 } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export interface ContactsHeaderProps {
  selectedCount: number;
  sortedCount: number;
  onStartEditing: () => void;
  onExportAll: () => void;
  onExportSelected: () => void;
  onOpenDeleteConfirm: () => void;
}

export function ContactsHeader({
  selectedCount,
  sortedCount,
  onStartEditing,
  onExportAll,
  onExportSelected,
  onOpenDeleteConfirm,
}: ContactsHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 pt-5 pb-4">
      <div>
        <h1 className="text-[18px] font-semibold text-[var(--text-primary)] tracking-tight leading-none">
          Contacts
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {selectedCount > 0 && (
          <span className="text-[11px] text-[var(--text-tertiary)] font-medium mr-1 tabular-nums">
            {selectedCount} selected
          </span>
        )}

        {/* Actions dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="h-9 px-3.5 text-[13px] font-medium rounded-[var(--radius-button)] border border-[var(--border-default)] text-[var(--text-secondary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] active:scale-[0.98] transition-all duration-120 ease-out inline-flex items-center gap-1.5 data-[state=open]:bg-[var(--bg-surface-hover)]">
              Actions
              <ChevronDown className="h-3.5 w-3.5 text-[var(--text-tertiary)] transition-transform duration-150 [[data-state=open]_&]:rotate-180" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              className="w-56 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-button)] shadow-[var(--shadow-dropdown)] z-50 overflow-hidden py-1 animate-in fade-in-0 zoom-in-95"
            >
              {/* Section label */}
              <div className="px-3 pt-2 pb-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Export
                </p>
              </div>

              {/* Export all filtered contacts */}
              <DropdownMenu.Item
                onSelect={onExportAll}
                disabled={sortedCount === 0}
                className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] cursor-pointer outline-none transition-colors duration-120 disabled:opacity-40 disabled:pointer-events-none"
              >
                <FileSpreadsheet className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-500" />
                <span className="flex-1">Export to Excel</span>
                {sortedCount > 0 && (
                  <span className="text-[11px] text-[var(--text-tertiary)] tabular-nums">
                    {sortedCount}
                  </span>
                )}
              </DropdownMenu.Item>

              {/* Export selected — only shown when rows are checked */}
              {selectedCount > 0 && (
                <DropdownMenu.Item
                  onSelect={onExportSelected}
                  className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] cursor-pointer outline-none transition-colors duration-120"
                >
                  <FileSpreadsheet className="h-4 w-4 shrink-0 text-[var(--accent-primary)]" />
                  <span className="flex-1">Export Selected</span>
                  <span className="text-[11px] text-[var(--text-tertiary)] tabular-nums">
                    {selectedCount}
                  </span>
                </DropdownMenu.Item>
              )}

              {sortedCount === 0 && (
                <p className="px-3 py-1.5 pb-2 text-[12px] text-[var(--text-tertiary)]">
                  No contacts to export
                </p>
              )}

              {/* Delete section — only when rows are checked */}
              {selectedCount > 0 && (
                <>
                  <DropdownMenu.Separator className="my-1 h-px bg-[var(--border-default)]" />
                  <div className="px-3 pt-2 pb-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                      Danger
                    </p>
                  </div>
                  <DropdownMenu.Item
                    onSelect={onOpenDeleteConfirm}
                    className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer outline-none transition-colors duration-120"
                  >
                    <Trash2 className="h-4 w-4 shrink-0" />
                    <span className="flex-1">Delete Selected</span>
                    <span className="text-[11px] tabular-nums opacity-70">
                      {selectedCount}
                    </span>
                  </DropdownMenu.Item>
                </>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <button
          onClick={onStartEditing}
          disabled={selectedCount !== 1}
          className="h-9 px-3.5 text-[13px] font-medium rounded-[var(--radius-button)] bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none transition-all duration-120 ease-out shadow-[var(--shadow-xs)] inline-flex items-center gap-1.5"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit contact
        </button>
      </div>
    </div>
  );
}
