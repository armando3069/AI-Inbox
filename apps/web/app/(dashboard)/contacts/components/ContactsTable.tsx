import { ChevronDown, Check } from "lucide-react";
import * as Checkbox from "@radix-ui/react-checkbox";
import type { ContactRow } from "@/services/contacts/contacts.types";
import { cn } from "@/lib/cn";
import type { EditDraft } from "../hooks/useContactsState";
import { ContactsTableRow } from "./ContactsTableRow";
import { ContactsEditRow } from "./ContactsEditRow";

// ── Shared cell classes ────────────────────────────────────────────────────────
const thCell =
  "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] border-b border-[var(--border-default)]";

// ── PremiumCheckbox (local, header usage) ──────────────────────────────────────

function PremiumCheckbox({
  checked,
  onCheckedChange,
  indeterminate,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  indeterminate?: boolean;
}) {
  return (
    <Checkbox.Root
      checked={indeterminate ? "indeterminate" : checked}
      onCheckedChange={(v) => onCheckedChange(v === true)}
      className={cn(
        "flex h-[15px] w-[15px] items-center justify-center rounded-[4px] border transition-all duration-120 ease-out",
        checked || indeterminate
          ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]"
          : "border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--text-tertiary)]"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <Checkbox.Indicator>
        {indeterminate ? (
          <div className="h-[1.5px] w-2 rounded-full bg-white" />
        ) : (
          <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
        )}
      </Checkbox.Indicator>
    </Checkbox.Root>
  );
}

// ── ContactsTable ──────────────────────────────────────────────────────────────

export interface ContactsTableProps {
  paginated: ContactRow[];
  allOnPage: boolean;
  someOnPage: boolean;
  sortDir: "asc" | "desc";
  onToggleAll: () => void;
  onSort: () => void;
  editingId: number | null;
  editDraft: EditDraft;
  isSaving: boolean;
  selectedIds: Set<number>;
  onToggleOne: (id: number) => void;
  onEditDraftChange: (draft: EditDraft) => void;
  onSaveEditing: () => void;
  onCancelEditing: () => void;
  onRowClick: (row: ContactRow) => void;
}

export function ContactsTable({
  paginated,
  allOnPage,
  someOnPage,
  sortDir,
  onToggleAll,
  onSort,
  editingId,
  editDraft,
  isSaving,
  selectedIds,
  onToggleOne,
  onEditDraftChange,
  onSaveEditing,
  onCancelEditing,
  onRowClick,
}: ContactsTableProps) {
  return (
    <div className="overflow-x-auto flex-1">
      <table className="w-full text-[13px]">
        <thead className="sticky top-0 z-10 bg-[var(--bg-surface)]">
          <tr>
            <th className={cn(thCell, "w-11 text-center")}>
              <PremiumCheckbox
                checked={allOnPage}
                indeterminate={someOnPage}
                onCheckedChange={onToggleAll}
              />
            </th>
            <th className={thCell}>Name</th>
            <th className={thCell}>Platform</th>
            <th className={thCell}>Lifecycle</th>
            <th className={thCell}>Email</th>
            <th className={thCell}>Phone</th>
            <th className={thCell}>
              <button
                onClick={onSort}
                className="flex items-center gap-1 hover:text-[var(--text-secondary)] transition-colors duration-120 uppercase tracking-wider"
              >
                Added
                <ChevronDown
                  className={cn(
                    "w-3 h-3 transition-transform duration-200",
                    sortDir === "asc" && "rotate-180"
                  )}
                />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((row) => {
            const isSelected = selectedIds.has(row.id);
            const isEditing  = row.id === editingId;

            if (isEditing) {
              return (
                <ContactsEditRow
                  key={row.id}
                  row={row}
                  isSelected={isSelected}
                  editDraft={editDraft}
                  isSaving={isSaving}
                  onToggle={onToggleOne}
                  onEditDraftChange={onEditDraftChange}
                  onSave={onSaveEditing}
                  onCancel={onCancelEditing}
                />
              );
            }

            return (
              <ContactsTableRow
                key={row.id}
                row={row}
                isSelected={isSelected}
                onToggle={onToggleOne}
                onClick={onRowClick}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
