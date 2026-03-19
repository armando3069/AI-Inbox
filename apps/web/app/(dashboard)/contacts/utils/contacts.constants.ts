export const PAGE_SIZE = 20;

export type PlatformOption = { id: string; label: string; icon: string };

export const PLATFORM_OPTIONS: PlatformOption[] = [
  { id: "telegram", label: "Telegram", icon: "✈️" },
  { id: "whatsapp", label: "WhatsApp", icon: "💬" },
  { id: "email",    label: "Email",    icon: "📧" },
];

export type Category = {
  id: string;
  label: string;
  lifecycles: string[] | null;
};

export const CATEGORIES: Category[] = [
  { id: "all",       label: "All",       lifecycles: null },
  { id: "unknown",   label: "Unknown",   lifecycles: [] },
  { id: "new_leads", label: "New leads", lifecycles: ["NEW_LEAD"] },
  { id: "pitching",  label: "Pitching",  lifecycles: ["HOT_LEAD"] },
  { id: "active",    label: "Active",    lifecycles: ["PAYMENT", "CUSTOMER"] },
  { id: "past",      label: "Past",      lifecycles: ["COLD_LEAD"] },
];
