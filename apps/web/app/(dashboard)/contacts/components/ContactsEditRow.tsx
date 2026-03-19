import { Check, X, Loader2 } from "lucide-react";
import * as Checkbox from "@radix-ui/react-checkbox";
import type { ContactRow } from "@/services/contacts/contacts.types";
import { LIFECYCLE_STAGES } from "@/lib/lifecycle";
import { AvatarWithPlatformBadge } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import type { EditDraft } from "../hooks/useContactsState";
import { displayName } from "../utils/contacts.utils";

// ── Shared cell classes ────────────────────────────────────────────────────────
const tdCell = "px-4 py-3 border-b border-[var(--border-subtle)]";

// ── PlatformBadge (local) ──────────────────────────────────────────────────────

function PlatformBadge({ platform }: { platform: string }) {
  const styles: Record<string, string> = {
    telegram: "bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900/60",
    whatsapp: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/60",
    teams:    "bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-900/60",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-[3px] rounded-[var(--radius-badge)] border text-[11px] font-medium capitalize leading-none",
        styles[platform] ?? "bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-900/50 dark:text-gray-400 dark:border-gray-800/60"
      )}
    >
      {platform}
    </span>
  );
}

// ── PremiumCheckbox (local) ────────────────────────────────────────────────────

function PremiumCheckbox({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <Checkbox.Root
      checked={checked}
      onCheckedChange={(v) => onCheckedChange(v === true)}
      className={cn(
        "flex h-[15px] w-[15px] items-center justify-center rounded-[4px] border transition-all duration-120 ease-out",
        checked
          ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]"
          : "border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--text-tertiary)]"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <Checkbox.Indicator>
        <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
      </Checkbox.Indicator>
    </Checkbox.Root>
  );
}

// ── ContactsEditRow ────────────────────────────────────────────────────────────

export interface ContactsEditRowProps {
  row: ContactRow;
  isSelected: boolean;
  editDraft: EditDraft;
  isSaving: boolean;
  onToggle: (id: number) => void;
  onEditDraftChange: (draft: EditDraft) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function ContactsEditRow({
  row,
  isSelected,
  editDraft,
  isSaving,
  onToggle,
  onEditDraftChange,
  onSave,
  onCancel,
}: ContactsEditRowProps) {
  const inputClass =
    "w-full h-8 px-2.5 rounded-[var(--radius-input)] border border-[var(--accent-primary)]/30 bg-[var(--bg-surface)] text-[13px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-primary)]/50 transition-all duration-120";

  return (
    <tr className="bg-[var(--accent-primary)]/[0.03]">
      {/* Checkbox */}
      <td className={cn(tdCell, "w-11 text-center")}>
        <PremiumCheckbox checked={isSelected} onCheckedChange={() => onToggle(row.id)} />
      </td>

      {/* Name — editable */}
      <td className={tdCell}>
        <div className="flex items-center gap-2.5">
          <AvatarWithPlatformBadge
            name={editDraft.contactName || displayName(row)}
            avatar={row.contact_avatar}
            platform={row.platform}
            size="sm"
          />
          <input
            type="text"
            value={editDraft.contactName}
            onChange={(e) =>
              onEditDraftChange({ ...editDraft, contactName: e.target.value })
            }
            className={cn(inputClass, "max-w-[180px]")}
            placeholder="Name"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </td>

      {/* Platform — read-only */}
      <td className={tdCell}>
        <PlatformBadge platform={row.platform} />
      </td>

      {/* Lifecycle — select */}
      <td className={tdCell}>
        <select
          value={editDraft.lifecycleStatus}
          onChange={(e) =>
            onEditDraftChange({ ...editDraft, lifecycleStatus: e.target.value })
          }
          onClick={(e) => e.stopPropagation()}
          className={cn(inputClass, "pr-7 appearance-none cursor-pointer bg-[length:16px] bg-[right_6px_center] bg-no-repeat")}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          }}
        >
          {LIFECYCLE_STAGES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.emoji} {s.label}
            </option>
          ))}
        </select>
      </td>

      {/* Email — editable */}
      <td className={tdCell}>
        <input
          type="email"
          value={editDraft.contactEmail}
          onChange={(e) =>
            onEditDraftChange({ ...editDraft, contactEmail: e.target.value })
          }
          className={inputClass}
          placeholder="email@example.com"
          onClick={(e) => e.stopPropagation()}
        />
      </td>

      {/* Phone — editable */}
      <td className={tdCell}>
        <input
          type="tel"
          value={editDraft.contactPhone}
          onChange={(e) =>
            onEditDraftChange({ ...editDraft, contactPhone: e.target.value })
          }
          className={inputClass}
          placeholder="+40 ..."
          onClick={(e) => e.stopPropagation()}
        />
      </td>

      {/* Actions: Save + Cancel */}
      <td className={cn(tdCell, "whitespace-nowrap")}>
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              void onSave();
            }}
            disabled={isSaving}
            className="flex items-center justify-center h-7 w-7 rounded-md bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] disabled:opacity-50 transition-all duration-120 shadow-[var(--shadow-xs)]"
            title="Save"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            disabled={isSaving}
            className="flex items-center justify-center h-7 w-7 rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] disabled:opacity-50 transition-all duration-120"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
