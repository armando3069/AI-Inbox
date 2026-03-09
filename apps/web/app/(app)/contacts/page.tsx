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
  SlidersHorizontal,
  Settings2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
} from "lucide-react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { contactsQueryKeys } from "@/services/contacts/contacts.service";
import type { ContactRow } from "@/services/contacts/contacts.types";
import { LIFECYCLE_STAGES, getLifecycleStage } from "@/lib/lifecycle";
import { AvatarWithPlatformBadge } from "@/components/chat/AvatarWithPlatformBadge";
import { cn } from "@/lib/cn";

// ── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

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

function getCategoryCount(contacts: ContactRow[], cat: Category): number {
  if (cat.lifecycles === null) return contacts.length;
  if (cat.lifecycles.length === 0) return contacts.filter((c) => !c.lifecycle_status).length;
  return contacts.filter((c) => cat.lifecycles!.includes(c.lifecycle_status)).length;
}

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
    telegram: "bg-sky-50 text-sky-600 border-sky-100",
    whatsapp: "bg-emerald-50 text-emerald-600 border-emerald-100",
    teams:    "bg-violet-50 text-violet-600 border-violet-100",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-medium capitalize",
        styles[platform] ?? "bg-stone-50 text-stone-500 border-stone-200"
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
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium",
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
        "flex h-4 w-4 items-center justify-center rounded border transition-all",
        checked || indeterminate
          ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]"
          : "border-[var(--border-default)] bg-white hover:border-[var(--text-tertiary)]"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <Checkbox.Indicator>
        {indeterminate ? (
          <div className="h-0.5 w-2 rounded-full bg-white" />
        ) : (
          <Check className="h-3 w-3 text-white" strokeWidth={3} />
        )}
      </Checkbox.Indicator>
    </Checkbox.Root>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ContactsPage() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const [search, setSearch]                     = useState("");
  const [debouncedSearch, setDebouncedSearch]   = useState("");
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get("category") ?? "all");
  const [page, setPage]                         = useState(1);
  const [selectedIds, setSelectedIds]           = useState<Set<number>>(new Set());
  const [sortDir, setSortDir]                   = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const id = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 300);
    return () => clearTimeout(id);
  }, [search]);

  // Sync category from URL (when clicking from sidebar)
  useEffect(() => {
    const cat = searchParams.get("category") ?? "all";
    setSelectedCategory(cat);
    setPage(1);
  }, [searchParams]);

  useEffect(() => { setPage(1); }, [selectedCategory]);

  const { data: allContacts = [], isLoading, isError, refetch } = useQuery(
    contactsQueryKeys.list({ search: debouncedSearch || undefined })
  );

  const category = CATEGORIES.find((c) => c.id === selectedCategory) ?? CATEGORIES[0];

  const filtered = useMemo(
    () => filterByCategory(allContacts, category),
    [allContacts, category]
  );

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

  const handleRowClick = (row: ContactRow) => {
    sessionStorage.setItem("pendingConvId", String(row.id));
    router.push("/");
  };

  // shared cell class
  const cell = "px-4 py-3 border border-[var(--border-subtle)]";

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--sidebar-bg)] ">
      <div className="flex-1 overflow-y-auto">
        <div className="h-full flex flex-col  w-full">

          {/* /!*── Toolbar ─────────────────────────────────────────────── *!/*/}
          {/* /!* <div className="flex items-center gap-3 px-4">*!/*/}
          {/* /!*   <div className="relative w-[280px]">*!/*/}
          {/* /!*     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-tertiary)]" />*!/*/}
          {/* /!*     <input*!/*/}
          {/* /!*       type="text"*!/*/}
          {/* /!*       value={search}*!/*/}
          {/* /!*       onChange={(e) => setSearch(e.target.value)}*!/*/}
          {/* /!*       placeholder="Search..."*!/*/}
          {/* /!*       className="w-full pl-9 pr-3 py-2 text-[13px] border border-[var(--border-default)] rounded-[var(--radius-input)] bg-white text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/10 focus:border-[var(--accent-primary)]/30 transition-colors"*!/*/}
          {/* /!*     />*!/*/}
          {/* /!*   </div>*!/*/}
          {/* /!*   <div className="flex-1" />*!/*/}
          {/* /!*   <button className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium rounded-[var(--radius-input)] border border-[var(--border-default)] text-[var(--text-secondary)] bg-white hover:bg-[var(--bg-surface-hover)] transition-colors">*!/*/}
          {/* /!*     <SlidersHorizontal className="w-3.5 h-3.5" />*!/*/}
          {/* /!*     Filters*!/*/}
          {/* /!*   </button>*!/*/}
          {/* /!*   <button className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium rounded-[var(--radius-input)] border border-[var(--border-default)] text-[var(--text-secondary)] bg-white hover:bg-[var(--bg-surface-hover)] transition-colors">*!/*/}
          {/* /!*     <Settings2 className="w-3.5 h-3.5" />*!/*/}
          {/* /!*     View settings*!/*/}
          {/* /!*   </button>*!/*/}
          {/* /!* </div>*!/*/}

          {/*</div>*/}

          <div className="flex flex-1 flex-col min-h-0 rounded-xl border py-3 border-[var(--border-default)] bg-white shadow-[var(--shadow-card)]  ">

            <div className="flex items-center justify-between px-4 pb-4 ">
              <h1 className="text-[20px] font-semibold text-[var(--text-primary)] tracking-tight">
                Contacts
              </h1>
              <div className="flex items-center gap-2">
                {selectedIds.size > 0 && (
                    <span className="text-[12px] text-[var(--text-secondary)] mr-1">
                    {selectedIds.size} selected
                  </span>
                )}
                <button className="px-4 py-2 text-[13px] font-medium rounded-[var(--radius-button)] border border-[var(--border-default)] text-[var(--text-secondary)] bg-white hover:bg-[var(--bg-surface-hover)] transition-colors">
                  Actions
                </button>
                <button className="px-4 py-2 text-[13px] font-medium rounded-[var(--radius-button)] bg-[var(--accent-primary)] text-white hover:bg-[#222] shadow-sm transition-colors">
                  New contact
                </button>
              </div>
            </div>

            {/* ── Table card ───────────────────────────────────────── */}
            <div className="flex-1 min-w-2 py-2  bg-white  flex flex-col overflow-hidden ">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 flex-1 text-[13px] text-[var(--text-tertiary)]">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading contacts...
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center flex-1 gap-2">
                  <p className="text-[13px] text-red-500">Failed to load contacts.</p>
                  <button onClick={() => refetch()} className="text-[13px] text-[var(--accent-blue)] hover:underline">
                    Try again
                  </button>
                </div>
              ) : sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-[var(--bg-surface-hover)] flex items-center justify-center">
                    <Users className="h-6 w-6 text-[var(--text-tertiary)]" />
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
                    <table className="w-full text-[13px] border-collapse ">
                      <thead>
                        <tr className="bg-[var(--bg-surface-hover)]/60">
                          <th className={cn(cell, "w-10")}>
                            <PremiumCheckbox
                              checked={allOnPage}
                              indeterminate={someOnPage}
                              onCheckedChange={toggleAll}
                            />
                          </th>
                          <th className={cn(cell, "text-left text-[12px] font-semibold text-[var(--text-secondary)]")}>Name</th>
                          <th className={cn(cell, "text-left text-[12px] font-semibold text-[var(--text-secondary)]")}>Platform</th>
                          <th className={cn(cell, "text-left text-[12px] font-semibold text-[var(--text-secondary)]")}>Lifecycle</th>
                          <th className={cn(cell, "text-left text-[12px] font-semibold text-[var(--text-secondary)]")}>Email</th>
                          <th className={cn(cell, "text-left text-[12px] font-semibold text-[var(--text-secondary)]")}>Phone</th>
                          <th className={cn(cell, "text-left text-[12px] font-semibold text-[var(--text-secondary)]")}>
                            <button
                              onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
                              className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
                            >
                              Added
                              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", sortDir === "asc" && "rotate-180")} />
                            </button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginated.map((row) => {
                          const isSelected = selectedIds.has(row.id);
                          return (
                            <tr
                              key={row.id}
                              onClick={() => handleRowClick(row)}
                              className={cn(
                                "cursor-pointer transition-colors",
                                isSelected ? "bg-[var(--accent-primary)]/[0.03]" : "hover:bg-[var(--bg-surface-hover)]"
                              )}
                            >
                              <td className={cn(cell, "w-10")}>
                                <PremiumCheckbox checked={isSelected} onCheckedChange={() => toggleOne(row.id)} />
                              </td>

                              {/* Name */}
                              <td className={cell}>
                                <div className="flex items-center gap-2.5">
                                  <AvatarWithPlatformBadge
                                    name={displayName(row)}
                                    avatar={row.contact_avatar}
                                    platform={row.platform}
                                    size="sm"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-medium text-[var(--text-primary)] truncate max-w-[160px]">
                                      {displayName(row)}
                                    </p>
                                    {row.contact_username && row.contact_name && (
                                      <p className="text-[11px] text-[var(--text-tertiary)] truncate max-w-[160px]">
                                        @{row.contact_username}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Platform */}
                              <td className={cell}>
                                <PlatformBadge platform={row.platform} />
                              </td>

                              {/* Lifecycle */}
                              <td className={cell}>
                                {row.lifecycle_status ? (
                                  <LifecycleBadge status={row.lifecycle_status} />
                                ) : (
                                  <span className="text-[var(--text-tertiary)] text-[12px]">—</span>
                                )}
                              </td>

                              {/* Email */}
                              <td className={cn(cell, "text-[var(--text-secondary)]")}>
                                {row.contact_email ? (
                                  <div className="flex items-center gap-1.5 max-w-[200px]">
                                    <Mail className="w-3 h-3 text-[var(--text-tertiary)] flex-shrink-0" />
                                    <span className="truncate">{row.contact_email}</span>
                                  </div>
                                ) : (
                                  <span className="text-[var(--text-tertiary)]">—</span>
                                )}
                              </td>

                              {/* Phone */}
                              <td className={cn(cell, "text-[var(--text-secondary)]")}>
                                {row.contact_phone ? (
                                  <div className="flex items-center gap-1.5">
                                    <Phone className="w-3 h-3 text-[var(--text-tertiary)] flex-shrink-0" />
                                    <span>{row.contact_phone}</span>
                                  </div>
                                ) : (
                                  <span className="text-[var(--text-tertiary)]">—</span>
                                )}
                              </td>

                              {/* Added date */}
                              <td className={cn(cell, "text-[12px] text-[var(--text-tertiary)] whitespace-nowrap")}>
                                {formatDate(row.created_at)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border-subtle)]">
                    <p className="text-[12px] text-[var(--text-tertiary)]">
                      {sorted.length} records
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex items-center justify-center h-7 w-7 rounded border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[12px] text-[var(--text-secondary)] px-2 tabular-nums">
                        {page} / {totalPages}
                      </span>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="flex items-center justify-center h-7 w-7 rounded border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
