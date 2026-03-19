import { useRouter } from "next/navigation";
import { contactsService } from "@/services/contacts/contacts.service";
import type { ContactRow } from "@/services/contacts/contacts.types";
import { exportContactsToXlsx } from "@/lib/exportContacts";
import type { useContactsState } from "./useContactsState";

type ContactsState = ReturnType<typeof useContactsState>;

export function useContactsActions(state: ContactsState) {
  const router = useRouter();

  const {
    sorted,
    selectedIds,
    setSelectedIds,
    paginated,
    allOnPage,
    allContacts,
    selectedCategory,
    setExportToast,
    setDeleteConfirmOpen,
    setIsDeleting,
    editingId,
    editDraft,
    setEditingId,
    setEditDraft,
    setIsSaving,
    setPlatformFilter,
    setPage,
    refetch,
  } = state;

  function showExportToast(msg: string) {
    setExportToast(msg);
    setTimeout(() => setExportToast(null), 2500);
  }

  function handleExportAll() {
    if (!sorted.length) return;
    exportContactsToXlsx(sorted, selectedCategory);
    showExportToast(
      `Exported ${sorted.length} contact${sorted.length !== 1 ? "s" : ""} to Excel`
    );
  }

  function handleExportSelected() {
    const rows = sorted.filter((c) => selectedIds.has(c.id));
    if (!rows.length) return;
    exportContactsToXlsx(rows, "selected");
    showExportToast(
      `Exported ${rows.length} selected contact${rows.length !== 1 ? "s" : ""} to Excel`
    );
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

  function toggleAll() {
    const next = new Set(selectedIds);
    if (allOnPage) paginated.forEach((c) => next.delete(c.id));
    else           paginated.forEach((c) => next.add(c.id));
    setSelectedIds(next);
  }

  function toggleOne(id: number) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
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

  function handleRowClick(row: ContactRow) {
    sessionStorage.setItem("pendingConvId", String(row.id));
    router.push("/inbox");
  }

  return {
    handleExportAll,
    handleExportSelected,
    handleDeleteSelected,
    startEditing,
    cancelEditing,
    saveEditing,
    toggleAll,
    toggleOne,
    togglePlatform,
    clearPlatformFilter,
    handleRowClick,
  };
}
