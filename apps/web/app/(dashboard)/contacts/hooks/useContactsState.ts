import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { contactsQueryKeys } from "@/services/contacts/contacts.service";
import { CATEGORIES, PAGE_SIZE } from "../utils/contacts.constants";
import { filterByCategory } from "../utils/contacts.utils";

export type EditDraft = {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  lifecycleStatus: string;
};

export function useContactsState() {
  const searchParams = useSearchParams();

  const [search, setSearch]                         = useState("");
  const [debouncedSearch, setDebouncedSearch]       = useState("");
  const [selectedCategory, setSelectedCategory]     = useState(() => searchParams.get("category") ?? "all");
  const [page, setPage]                             = useState(1);
  const [selectedIds, setSelectedIds]               = useState<Set<number>>(new Set());
  const [sortDir, setSortDir]                       = useState<"asc" | "desc">("desc");
  const [platformFilter, setPlatformFilter]         = useState<Set<string>>(new Set());
  const [exportToast, setExportToast]               = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen]   = useState(false);
  const [isDeleting, setIsDeleting]                 = useState(false);

  // Inline edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft>({
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    lifecycleStatus: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
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

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page]);

  const allOnPage  = paginated.length > 0 && paginated.every((c) => selectedIds.has(c.id));
  const someOnPage = paginated.some((c) => selectedIds.has(c.id)) && !allOnPage;

  return {
    // search
    search,
    setSearch,
    // category
    selectedCategory,
    setSelectedCategory,
    // pagination
    page,
    setPage,
    totalPages,
    // selection
    selectedIds,
    setSelectedIds,
    // sort
    sortDir,
    setSortDir,
    // platform filter
    platformFilter,
    setPlatformFilter,
    // toast
    exportToast,
    setExportToast,
    // delete dialog
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    isDeleting,
    setIsDeleting,
    // inline edit
    editingId,
    setEditingId,
    editDraft,
    setEditDraft,
    isSaving,
    setIsSaving,
    // query
    allContacts,
    isLoading,
    isError,
    refetch,
    // derived
    filtered,
    sorted,
    paginated,
    allOnPage,
    someOnPage,
  };
}
