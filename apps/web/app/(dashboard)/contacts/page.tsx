"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Loader2,
  Users,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  Pencil,
  FileSpreadsheet,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  SlidersHorizontal,
} from "lucide-react";
import * as Checkbox from "@radix-ui/react-checkbox";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import * as Popover from "@radix-ui/react-popover";
import { contactsQueryKeys, contactsService } from "@/services/contacts/contacts.service";
import type { ContactRow } from "@/services/contacts/contacts.types";
import { getLifecycleStage, LIFECYCLE_STAGES } from "@/lib/lifecycle";
import { AvatarWithPlatformBadge } from "@/app/(dashboard)/inbox/components/chat/AvatarWithPlatformBadge";
import { cn } from "@/lib/cn";
import { exportContactsToXlsx } from "@/lib/exportContacts";

// ── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

// ── Platform filter options ─────────────────────────────────────────────────

type PlatformOption = { id: string; label: string; icon: string };

const PLATFORM_OPTIONS: PlatformOption[] = [
  { id: "telegram",  label: "Telegram",  icon: "✈️" },
  { id: "whatsapp",  label: "WhatsApp",  icon: "💬" },
  { id: "email",     label: "Email",     icon: "📧" },
];

// ── Sidebar categories ───────────────────────────────────────────────────────

type Category = {
  id: string;
  label: string;
  lifecycles: string[] | null;
};

const CATEGORIES: Category[] = [
  { id: "all",       label: "All",       lifecycles: null },
  { id: "unknown",   label: "Unknown",   lifecycles: [] },
  { id: "new_leads", label: "New leads", lifecycles: ["NEW_LEAD"] },
  { id: "pitching",  label: "Pitching",  lifecycles: ["HOT_LEAD"] },
  { id: "active",    label: "Active",    lifecycles: ["PAYMENT", "CUSTOMER"] },
  { id: "past",      label: "Past",      lifecycles: ["COLD_LEAD"] },
];

function filterByCategory(contacts: ContactRow[], cat: Category): ContactRow[] {
  if (cat.lifecycles === null) return contacts;
  if (cat.lifecycles.length === 0) return contacts.filter((c) => !c.lifecycle_status);
  return contacts.filter((c) => cat.lifecycles!.includes(c.lifecycle_status));
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function displayName(row: ContactRow): string {
  return row.contact_name || row.contact_username || `Chat #${row.id}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Platform badge ────────────────────────────────────────────────────────────

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

// ── Lifecycle badge ───────────────────────────────────────────────────────────

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

// ── Checkbox ──────────────────────────────────────────────────────────────────

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

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ContactsPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch]                     = useState("");
  const [debouncedSearch, setDebouncedSearch]   = useState("");
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get("category") ?? "all");
  const [page, setPage]                         = useState(1);
  const [selectedIds, setSelectedIds]           = useState<Set<number>>(new Set());
  const [sortDir, setSortDir]                   = useState<"asc" | "desc">("desc");
  const [platformFilter, setPlatformFilter]     = useState<Set<string>>(new Set());
  const [exportToast, setExportToast]           = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting]             = useState(false);

  // ── Inline edit state ─────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState({ contactName: "", contactEmail: "", contactPhone: "", lifecycleStatus: "" });
  const [isSaving, setIsSaving]   = useState(false);

  useEffect(() => {
    const id = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 300);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    const cat = searchParams.get("category") ?? "all";
    setSelectedCategory(cat);
    setPage(1);
  }, [searchParams]);

  const { data: allContacts = [], isLoading, isError, refetch } = useQuery(
    contactsQueryKeys.list({ search: debouncedSearch || undefined })
  );

  const category = CATEGORIES.find((c) => c.id === selectedCategory) ?? CATEGORIES[0];

  const filtered = useMemo(() => {
    let result = filterByCategory(allContacts, category);
    if (platformFilter.size > 0) {
      result = result.filter((c) => platformFilter.has(c.platform));
    }
    return result;
  }, [allContacts, category, platformFilter]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const da = new Date(a.created_at).getTime();
        const db = new Date(b.created_at).getTime();
        return sortDir === "desc" ? db - da : da - db;
      }),
    [filtered, sortDir]
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated  = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page]);

  const allOnPage  = paginated.length > 0 && paginated.every((c) => selectedIds.has(c.id));
  const someOnPage = paginated.some((c) => selectedIds.has(c.id)) && !allOnPage;

  function toggleAll() {
    const next = new Set(selectedIds);
    if (allOnPage) paginated.forEach((c) => next.delete(c.id));
    else           paginated.forEach((c) => next.add(c.id));
    setSelectedIds(next);
  }

  function toggleOne(id: number) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  }

  // ── Export handlers ────────────────────────────────────────────────────────

  function showExportToast(msg: string) {
    setExportToast(msg);
    setTimeout(() => setExportToast(null), 2500);
  }

  function handleExportAll() {
    if (!sorted.length) return;
    exportContactsToXlsx(sorted, selectedCategory);
    showExportToast(`Exported ${sorted.length} contact${sorted.length !== 1 ? "s" : ""} to Excel`);
  }

  function handleExportSelected() {
    const rows = sorted.filter((c) => selectedIds.has(c.id));
    if (!rows.length) return;
    exportContactsToXlsx(rows, "selected");
    showExportToast(`Exported ${rows.length} selected contact${rows.length !== 1 ? "s" : ""} to Excel`);
  }

  async function handleDeleteSelected() {
    if (!selectedIds.size) return;
    setIsDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      await contactsService.deleteContacts(ids);
      setSelectedIds(new Set());
      setDeleteConfirmOpen(false);
      await refetch();
      showExportToast(`Deleted ${ids.length} contact${ids.length !== 1 ? "s" : ""}`);
    } catch {
      // keep dialog open on error
    } finally {
      setIsDeleting(false);
    }
  }

  // ── Inline edit handlers ──────────────────────────────────────────────────

  function startEditing() {
    if (selectedIds.size !== 1) return;
    const id = Array.from(selectedIds)[0];
    const row = allContacts.find((c) => c.id === id);
    if (!row) return;
    setEditingId(id);
    setEditDraft({
      contactName: row.contact_name ?? "",
      contactEmail: row.contact_email ?? "",
      contactPhone: row.contact_phone ?? "",
      lifecycleStatus: row.lifecycle_status ?? "NEW_LEAD",
    });
  }

  function cancelEditing() {
    setEditingId(null);
  }

  async function saveEditing() {
    if (editingId === null) return;
    setIsSaving(true);
    try {
      await contactsService.updateContact(editingId, {
        contactName: editDraft.contactName || null,
        contactEmail: editDraft.contactEmail || null,
        contactPhone: editDraft.contactPhone || null,
        lifecycleStatus: editDraft.lifecycleStatus,
      });
      setEditingId(null);
      await refetch();
      showExportToast("Contact updated");
    } catch {
      // keep editing on error
    } finally {
      setIsSaving(false);
    }
  }

  function togglePlatform(platform: string) {
    setPlatformFilter((prev) => {
      const next = new Set(prev);
      if (next.has(platform)) next.delete(platform);
      else next.add(platform);
      return next;
    });
    setPage(1);
  }

  function clearPlatformFilter() {
    setPlatformFilter(new Set());
    setPage(1);
  }

  const handleRowClick = (row: ContactRow) => {
    sessionStorage.setItem("pendingConvId", String(row.id));
    router.push("/inbox");
  };

  // ── Shared table cell classes ──────────────────────────────────────────────
  const thCell = "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] border-b border-[var(--border-default)]";
  const tdCell = "px-4 py-3 border-b border-[var(--border-subtle)]";

  return (
    <div className="flex-1 flex flex-col overflow-hidden rounded-xl bg-[var(--bg-surface)] shadow-[var(--shadow-card)] border border-[var(--border-default)]">

      {/* ── Export / action toast ─────────────────────────────────── */}
      {exportToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-medium text-emerald-700 shadow-[var(--shadow-dropdown)] dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {exportToast}
        </div>
      )}

      {/* ── Delete confirmation dialog ────────────────────────────── */}
      <Dialog.Root open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] animate-in fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-[400px] rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-dropdown)] p-6 animate-in fade-in-0 zoom-in-95">
            {/* Icon + title */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <Dialog.Title className="text-[16px] font-semibold text-[var(--text-primary)] leading-tight">
                Delete {selectedIds.size} contact{selectedIds.size !== 1 ? "s" : ""}?
              </Dialog.Title>
              <Dialog.Description className="text-[13px] text-[var(--text-tertiary)] leading-relaxed">
                This will permanently delete the selected conversation{selectedIds.size !== 1 ? "s" : ""} and all associated messages. This action cannot be undone.
              </Dialog.Description>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex gap-3">
              <Dialog.Close asChild>
                <button
                  disabled={isDeleting}
                  className="flex-1 h-10 rounded-[var(--radius-button)] border border-[var(--border-default)] text-[13px] font-medium text-[var(--text-secondary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] transition-colors duration-120 disabled:opacity-50"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="flex-1 h-10 rounded-[var(--radius-button)] bg-red-600 hover:bg-red-700 text-[13px] font-medium text-white transition-colors duration-120 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <div>
          <h1 className="text-[18px] font-semibold text-[var(--text-primary)] tracking-tight leading-none">
            Contacts
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <span className="text-[11px] text-[var(--text-tertiary)] font-medium mr-1 tabular-nums">
              {selectedIds.size} selected
            </span>
          )}

          {/* ── Actions dropdown ───────────────────────────────────── */}
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
                  onSelect={handleExportAll}
                  disabled={sorted.length === 0}
                  className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] cursor-pointer outline-none transition-colors duration-120 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <FileSpreadsheet className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-500" />
                  <span className="flex-1">Export to Excel</span>
                  {sorted.length > 0 && (
                    <span className="text-[11px] text-[var(--text-tertiary)] tabular-nums">
                      {sorted.length}
                    </span>
                  )}
                </DropdownMenu.Item>

                {/* Export selected — only shown when rows are checked */}
                {selectedIds.size > 0 && (
                  <DropdownMenu.Item
                    onSelect={handleExportSelected}
                    className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] cursor-pointer outline-none transition-colors duration-120"
                  >
                    <FileSpreadsheet className="h-4 w-4 shrink-0 text-[var(--accent-primary)]" />
                    <span className="flex-1">Export Selected</span>
                    <span className="text-[11px] text-[var(--text-tertiary)] tabular-nums">
                      {selectedIds.size}
                    </span>
                  </DropdownMenu.Item>
                )}

                {sorted.length === 0 && (
                  <p className="px-3 py-1.5 pb-2 text-[12px] text-[var(--text-tertiary)]">
                    No contacts to export
                  </p>
                )}

                {/* Delete section — only when rows are checked */}
                {selectedIds.size > 0 && (
                  <>
                    <DropdownMenu.Separator className="my-1 h-px bg-[var(--border-default)]" />
                    <div className="px-3 pt-2 pb-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                        Danger
                      </p>
                    </div>
                    <DropdownMenu.Item
                      onSelect={() => setDeleteConfirmOpen(true)}
                      className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer outline-none transition-colors duration-120"
                    >
                      <Trash2 className="h-4 w-4 shrink-0" />
                      <span className="flex-1">Delete Selected</span>
                      <span className="text-[11px] tabular-nums opacity-70">
                        {selectedIds.size}
                      </span>
                    </DropdownMenu.Item>
                  </>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <button
            onClick={startEditing}
            disabled={selectedIds.size !== 1}
            className="h-9 px-3.5 text-[13px] font-medium rounded-[var(--radius-button)] bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none transition-all duration-120 ease-out shadow-[var(--shadow-xs)] inline-flex items-center gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit contact
          </button>
        </div>
      </div>

      {/* ── Search toolbar + filters ────────────────────────────────── */}
      <div className="flex items-center gap-3 px-6 pb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="w-full h-10 pl-9 pr-3 text-[13px] border border-[var(--border-default)] rounded-[var(--radius-input)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/8 focus:border-[var(--border-default)] transition-all duration-120 ease-out"
          />
        </div>

        {/* ── Platform filter ─────────────────────────────────────── */}
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
                    onClick={clearPlatformFilter}
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
                    onClick={() => togglePlatform(opt.id)}
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
                    onClick={() => togglePlatform(p)}
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

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2.5 flex-1 text-[13px] text-[var(--text-tertiary)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading contacts...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-2">
            <p className="text-[13px] text-red-500">Failed to load contacts.</p>
            <button onClick={() => refetch()} className="text-[13px] text-[var(--accent-blue)] hover:underline">
              Try again
            </button>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center py-16">
            <div className="h-11 w-11 rounded-xl bg-[var(--bg-surface-hover)] flex items-center justify-center">
              <Users className="h-5 w-5 text-[var(--text-tertiary)]" />
            </div>
            <div>
              <p className="text-[14px] font-medium text-[var(--text-secondary)]">No contacts found</p>
              <p className="text-[13px] text-[var(--text-tertiary)] mt-1">
                {search ? "Try adjusting your search." : "No contacts in this category."}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-[13px]">
                <thead className="sticky top-0 z-10 bg-[var(--bg-surface)]">
                  <tr>
                    <th className={cn(thCell, "w-11 text-center")}>
                      <PremiumCheckbox
                        checked={allOnPage}
                        indeterminate={someOnPage}
                        onCheckedChange={toggleAll}
                      />
                    </th>
                    <th className={thCell}>Name</th>
                    <th className={thCell}>Platform</th>
                    <th className={thCell}>Lifecycle</th>
                    <th className={thCell}>Email</th>
                    <th className={thCell}>Phone</th>
                    <th className={thCell}>
                      <button
                        onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
                        className="flex items-center gap-1 hover:text-[var(--text-secondary)] transition-colors duration-120 uppercase tracking-wider"
                      >
                        Added
                        <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", sortDir === "asc" && "rotate-180")} />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((row) => {
                    const isSelected = selectedIds.has(row.id);
                    const isEditing  = row.id === editingId;

                    /* ── EDITING ROW ─────────────────────────────────────── */
                    if (isEditing) {
                      const inputClass =
                        "w-full h-8 px-2.5 rounded-[var(--radius-input)] border border-[var(--accent-primary)]/30 bg-[var(--bg-surface)] text-[13px] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/12 focus:border-[var(--accent-primary)]/50 transition-all duration-120";

                      return (
                        <tr
                          key={row.id}
                          className="bg-[var(--accent-primary)]/[0.03]"
                        >
                          {/* Checkbox */}
                          <td className={cn(tdCell, "w-11 text-center")}>
                            <PremiumCheckbox checked={isSelected} onCheckedChange={() => toggleOne(row.id)} />
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
                                onChange={(e) => setEditDraft((d) => ({ ...d, contactName: e.target.value }))}
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
                              onChange={(e) => setEditDraft((d) => ({ ...d, lifecycleStatus: e.target.value }))}
                              onClick={(e) => e.stopPropagation()}
                              className={cn(inputClass, "pr-7 appearance-none cursor-pointer bg-[length:16px] bg-[right_6px_center] bg-no-repeat")}
                              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
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
                              onChange={(e) => setEditDraft((d) => ({ ...d, contactEmail: e.target.value }))}
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
                              onChange={(e) => setEditDraft((d) => ({ ...d, contactPhone: e.target.value }))}
                              className={inputClass}
                              placeholder="+40 ..."
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>

                          {/* Actions: Save + Cancel */}
                          <td className={cn(tdCell, "whitespace-nowrap")}>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => { e.stopPropagation(); void saveEditing(); }}
                                disabled={isSaving}
                                className="flex items-center justify-center h-7 w-7 rounded-md bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary-hover)] disabled:opacity-50 transition-all duration-120 shadow-[var(--shadow-xs)]"
                                title="Save"
                              >
                                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); cancelEditing(); }}
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

                    /* ── NORMAL ROW ──────────────────────────────────────── */
                    return (
                      <tr
                        key={row.id}
                        onClick={() => handleRowClick(row)}
                        className={cn(
                          "cursor-pointer transition-colors duration-120 ease-out group",
                          isSelected
                            ? "bg-[var(--accent-primary)]/[0.02]"
                            : "hover:bg-[var(--bg-surface-hover)]"
                        )}
                      >
                        <td className={cn(tdCell, "w-11 text-center")}>
                          <PremiumCheckbox checked={isSelected} onCheckedChange={() => toggleOne(row.id)} />
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
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ──────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border-subtle)]">
              <p className="text-[12px] text-[var(--text-tertiary)] tabular-nums">
                {sorted.length} record{sorted.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center justify-center h-7 w-7 rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all duration-120 ease-out"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[12px] text-[var(--text-secondary)] px-2 tabular-nums min-w-[40px] text-center">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center justify-center h-7 w-7 rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all duration-120 ease-out"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
