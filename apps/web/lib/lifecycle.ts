export type LifecycleStatus =
  | "NEW_LEAD"
  | "HOT_LEAD"
  | "PAYMENT"
  | "CUSTOMER"
  | "COLD_LEAD";

export interface LifecycleStage {
  value: LifecycleStatus;
  label: string;
  emoji: string;
  group: "active" | "lost";
  badgeClass: string;
}

export const LIFECYCLE_STAGES: LifecycleStage[] = [
  { value: "NEW_LEAD",  label: "New Lead",  emoji: "🆕", group: "active", badgeClass: "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900/60"              },
  { value: "HOT_LEAD",  label: "Hot Lead",  emoji: "🔥", group: "active", badgeClass: "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-900/60" },
  { value: "PAYMENT",   label: "Payment",   emoji: "💰", group: "active", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/60" },
  { value: "CUSTOMER",  label: "Customer",  emoji: "🤩", group: "active", badgeClass: "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-900/60" },
  { value: "COLD_LEAD", label: "Cold Lead", emoji: "🧊", group: "lost",   badgeClass: "bg-stone-50 text-stone-500 border-stone-200 dark:bg-stone-900/50 dark:text-stone-400 dark:border-stone-800/60"    },
];


export function getLifecycleStage(status?: string | null): LifecycleStage {
  return LIFECYCLE_STAGES.find((s) => s.value === status) ?? LIFECYCLE_STAGES[0];
}
