import { Mail, Phone } from "lucide-react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import type { ContactRow } from "@/services/contacts/contacts.types";
import { AvatarWithPlatformBadge } from "@/components/ui/Avatar";
import { getLifecycleStage } from "@/lib/lifecycle";
import { cn } from "@/lib/cn";
import { displayName, formatDate } from "../utils/contacts.utils";

// ── Shared cell classes ────────────────────────────────────────────────────────
const tdCell = "px-4 py-3 border-b border-[var(--border-subtle)]";

// ── PremiumCheckbox (local) ────────────────────────────────────────────────────

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

// ── PlatformBadge ──────────────────────────────────────────────────────────────

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

// ── LifecycleBadge ─────────────────────────────────────────────────────────────

function LifecycleBadge({ status }: { status: string }) {
  const stage = getLifecycleStage(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-[3px] rounded-[var(--radius-badge)] border text-[11px] font-medium leading-none",
        stage.badgeClass
      )}
    >
      <span className="text-[10px]">{stage.emoji}</span>
      {stage.label}
    </span>
  );
}

// ── ContactsTableRow ───────────────────────────────────────────────────────────

export interface ContactsTableRowProps {
  row: ContactRow;
  isSelected: boolean;
  onToggle: (id: number) => void;
  onClick: (row: ContactRow) => void;
}

export function ContactsTableRow({ row, isSelected, onToggle, onClick }: ContactsTableRowProps) {
  return (
    <tr
      key={row.id}
      onClick={() => onClick(row)}
      className={cn(
        "cursor-pointer transition-colors duration-120 ease-out group",
        isSelected
          ? "bg-[var(--accent-primary)]/[0.02]"
          : "hover:bg-[var(--bg-surface-hover)]"
      )}
    >
      <td className={cn(tdCell, "w-11 text-center")}>
        <PremiumCheckbox checked={isSelected} onCheckedChange={() => onToggle(row.id)} />
      </td>

      <td className={tdCell}>
        <div className="flex items-center gap-2.5">
          <AvatarWithPlatformBadge
            name={displayName(row)}
            avatar={row.contact_avatar}
            platform={row.platform}
            size="sm"
          />
          <div className="min-w-0">
            <p className="font-medium text-[var(--text-primary)] truncate max-w-[180px] leading-tight">
              {displayName(row)}
            </p>
            {row.contact_username && row.contact_name && (
              <p className="text-[11px] text-[var(--text-tertiary)] truncate max-w-[180px] mt-0.5 leading-tight">
                @{row.contact_username}
              </p>
            )}
          </div>
        </div>
      </td>

      <td className={tdCell}>
        <PlatformBadge platform={row.platform} />
      </td>

      <td className={tdCell}>
        {row.lifecycle_status ? (
          <LifecycleBadge status={row.lifecycle_status} />
        ) : (
          <span className="text-[var(--text-tertiary)] text-[12px]">—</span>
        )}
      </td>

      <td className={cn(tdCell, "text-[var(--text-secondary)]")}>
        {row.contact_email ? (
          <div className="flex items-center gap-1.5 max-w-[200px]">
            <Mail className="w-3.5 h-3.5 text-[var(--text-tertiary)] flex-shrink-0" strokeWidth={1.5} />
            <span className="truncate">{row.contact_email}</span>
          </div>
        ) : (
          <span className="text-[var(--text-tertiary)]">—</span>
        )}
      </td>

      <td className={cn(tdCell, "text-[var(--text-secondary)]")}>
        {row.contact_phone ? (
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-[var(--text-tertiary)] flex-shrink-0" strokeWidth={1.5} />
            <span>{row.contact_phone}</span>
          </div>
        ) : (
          <span className="text-[var(--text-tertiary)]">—</span>
        )}
      </td>

      <td className={cn(tdCell, "text-[12px] text-[var(--text-tertiary)] whitespace-nowrap tabular-nums")}>
        {formatDate(row.created_at)}
      </td>
    </tr>
  );
}
