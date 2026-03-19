import type { ContactRow } from "@/services/contacts/contacts.types";
import type { Category } from "./contacts.constants";

export function displayName(row: ContactRow): string {
  return row.contact_name || row.contact_username || `Chat #${row.id}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function filterByCategory(contacts: ContactRow[], cat: Category): ContactRow[] {
  if (cat.lifecycles === null) return contacts;
  if (cat.lifecycles.length === 0) return contacts.filter((c) => !c.lifecycle_status);
  return contacts.filter((c) => cat.lifecycles!.includes(c.lifecycle_status));
}
