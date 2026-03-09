"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Inbox,
  Users,
  Bot,
  Cable,
  TrendingUp,
  LogOut,
  Bell,
  BellOff,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import { requestNotificationPermission, getNotificationPermission } from "@/lib/notify";
import { contactsQueryKeys } from "@/services/contacts/contacts.service";
import type { ContactRow } from "@/services/contacts/contacts.types";

// ── Navigation config ─────────────────────────────────────────────────────────

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: typeof Inbox;
}

const PRIMARY_NAV: NavItem[] = [
  { id: "inbox",    label: "Inbox",       href: "/",             icon: Inbox },
  { id: "contacts", label: "Contacts",    href: "/contacts",     icon: Users },
  { id: "ai",       label: "AI Assistant", href: "/ai-assistant", icon: Bot },
];

const SECONDARY_NAV: NavItem[] = [
  { id: "sentiment", label: "Sentiment Analysis", href: "#",                          icon: TrendingUp },
  { id: "platforms", label: "Manage Platforms",   href: "/connect-platforms?manage=1", icon: Cable },
];

// ── Contacts accordion categories ────────────────────────────────────────────

type ContactCategory = { id: string; label: string; lifecycles: string[] | null };

const CONTACT_CATEGORIES: ContactCategory[] = [
  { id: "all",       label: "All",       lifecycles: null },
  { id: "new_leads", label: "New leads", lifecycles: ["NEW_LEAD"] },
  { id: "pitching",  label: "Pitching",  lifecycles: ["HOT_LEAD"] },
  { id: "active",    label: "Active",    lifecycles: ["PAYMENT", "CUSTOMER"] },
  { id: "past",      label: "Past",      lifecycles: ["COLD_LEAD"] },
];

function getCatCount(contacts: ContactRow[], cat: ContactCategory): number {
  if (cat.lifecycles === null) return contacts.length;
  if (cat.lifecycles.length === 0) return contacts.filter((c) => !c.lifecycle_status).length;
  return contacts.filter((c) => cat.lifecycles!.includes(c.lifecycle_status)).length;
}

// ── NavItemButton ─────────────────────────────────────────────────────────────

function NavItemButton({
  item,
  isActive,
  expanded,
}: {
  item: NavItem;
  isActive: boolean;
  expanded: boolean;
}) {
  const content = (
    <Link
      href={item.href}
      className={`relative flex items-center gap-2.5 rounded-[var(--radius-badge)] transition-colors ${
        expanded ? "px-2.5 py-2" : "justify-center p-2.5"
      } ${
        isActive
          ? "bg-[var(--bg-surface-hover)] text-[var(--text-primary)] font-medium"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-[var(--accent-primary)]" />
      )}
      <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
      {expanded && <span className="text-[13px]">{item.label}</span>}
    </Link>
  );

  if (!expanded) {
    return (
      <Tooltip.Root delayDuration={0}>
        <Tooltip.Trigger asChild>{content}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="right"
            sideOffset={8}
            className="z-50 rounded-[var(--radius-badge)] bg-[var(--accent-primary)] px-2.5 py-1.5 text-[12px] font-medium text-white shadow-[var(--shadow-dropdown)] animate-in fade-in-0 zoom-in-95"
          >
            {item.label}
            <Tooltip.Arrow className="fill-[var(--accent-primary)]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  }

  return content;
}

// ── AppSidebar ────────────────────────────────────────────────────────────────

export function AppSidebar() {
  const pathname    = usePathname();
  const router      = useRouter();
  const searchParams = useSearchParams();
  const { user, logout }  = useAuth();
  const { expanded, toggle } = useSidebar();

  const onContacts = pathname === "/contacts" || pathname.startsWith("/contacts/");
  const currentCategory = searchParams.get("category") ?? "all";

  const [contactsOpen, setContactsOpen] = useState(onContacts);
  const [notifPermission, setNotifPermission] = useState<string>("default");

  // Auto-open accordion when navigating to /contacts
  useEffect(() => {
    if (onContacts) setContactsOpen(true);
  }, [onContacts]);

  useEffect(() => {
    setNotifPermission(getNotificationPermission());
  }, []);

  // Fetch contacts for category counts (uses shared React Query cache)
  const { data: contacts = [] } = useQuery({
    ...contactsQueryKeys.list({}),
    staleTime: 30_000,
  });

  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermission();
    setNotifPermission(result);
  };

  const handleLogout = () => {
    logout();
    router.replace("/auth/login");
  };

  const isActive = (item: NavItem) => {
    if (item.href === "/") return pathname === "/";
    return pathname.startsWith(item.href.split("?")[0]);
  };

  const initials = user?.name
    ? user.name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <Tooltip.Provider>
      <div
        className={`flex flex-col bg-[var(--sidebar-bg)]  transition-[width] duration-200 ease-in-out ${
          expanded ? "w-[240px]" : "w-[60px]"
        }`}
      >
        {/* ── Logo + Toggle ──────────────────────────────────────── */}
        <div className={`flex items-center ${expanded ? "justify-between px-4" : "justify-center px-2"} pt-4 pb-3`}>
          {expanded ? (
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" width={100} height={100} alt="logo" className="w-8 h-8 rounded-[var(--radius-badge)]" />
              <span className="text-[15px] font-semibold text-[var(--text-primary)]">AI Inbox</span>
            </Link>
          ) : (
            <Link href="/">
              <Image src="/logo.png" width={100} height={100} alt="logo" className="w-8 h-8 rounded-[var(--radius-badge)]" />
            </Link>
          )}
          {expanded && (
            <button onClick={toggle} className="p-1.5 rounded-[var(--radius-badge)] text-[var(--text-tertiary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-secondary)] transition-colors">
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed toggle */}
        {!expanded && (
          <div className="flex justify-center pb-2">
            <button onClick={toggle} className="p-1.5 rounded-[var(--radius-badge)] text-[var(--text-tertiary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-secondary)] transition-colors">
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Primary Nav ────────────────────────────────────────── */}
        <div className={`flex-1 overflow-y-auto ${expanded ? "px-3" : "px-1.5"} pb-3`}>
          <div className="space-y-0.5">
            {PRIMARY_NAV.map((item) => {

              // ── Contacts accordion (only when sidebar is expanded) ──
              if (item.id === "contacts" && expanded) {
                return (
                  <div key="contacts">
                    {/* Contacts header row */}
                    <button
                      onClick={() => {
                        if (!onContacts) router.push("/contacts");
                        setContactsOpen((o) => !o);
                      }}
                      className={`relative w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-badge)] transition-colors ${
                        onContacts
                          ? "bg-[var(--bg-surface-hover)] text-[var(--text-primary)] font-medium"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {onContacts && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-[var(--accent-primary)]" />
                      )}
                      <Users className="w-[18px] h-[18px] flex-shrink-0" />
                      <span className="text-[13px] flex-1 text-left">Contacts</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-[var(--text-tertiary)] transition-transform duration-200 ${
                          contactsOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Sub-categories accordion */}
                    {contactsOpen && (
                      <div className="mt-0.5 space-y-0.5">
                        {CONTACT_CATEGORIES.map((cat) => {
                          const count      = getCatCount(contacts, cat);
                          const isActiveCat = onContacts && currentCategory === cat.id;
                          return (
                            <Link
                              key={cat.id}
                              href={`/contacts?category=${cat.id}`}
                              className={`flex items-center justify-between gap-2 pl-9 pr-2.5 py-1.5 rounded-[var(--radius-badge)] text-[13px] transition-colors ${
                                isActiveCat
                                  ? "bg-[var(--bg-surface-hover)] text-[var(--text-primary)] font-medium"
                                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
                              }`}
                            >
                              <span>{cat.label}</span>
                              {count > 0 && (
                                <span className={`text-[12px] tabular-nums font-medium ${
                                  isActiveCat ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"
                                }`}>
                                  {count}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // ── Regular nav item ──
              return (
                <NavItemButton
                  key={item.id}
                  item={item}
                  isActive={isActive(item)}
                  expanded={expanded}
                />
              );
            })}
          </div>

          {/* ── Secondary Nav ──────────────────────────────────────── */}
          <div className="mt-5 pt-5 border-t border-[var(--border-subtle)]">
            {expanded && (
              <div className="px-2.5 mb-2">
                <h3 className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                  Tools
                </h3>
              </div>
            )}
            <div className="space-y-0.5">
              {SECONDARY_NAV.map((item) => (
                <NavItemButton key={item.id} item={item} isActive={isActive(item)} expanded={expanded} />
              ))}
            </div>

            {/* Notification status */}
            {expanded && (
              <div className="mt-3">
                <div className="border-t border-[var(--border-subtle)] pt-3">
                  {notifPermission === "unavailable" ? null : notifPermission === "granted" ? (
                    <div className="flex items-center gap-2.5 px-2.5 py-2 text-emerald-600">
                      <Bell className="w-4 h-4" />
                      <span className="text-[12px]">Notificări active</span>
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </div>
                  ) : notifPermission === "denied" ? (
                    <div className="flex items-center gap-2.5 px-2.5 py-2 text-[var(--text-tertiary)]">
                      <BellOff className="w-4 h-4" />
                      <span className="text-[12px]">Notificări blocate</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleEnableNotifications}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-badge)] text-[var(--accent-blue)] hover:bg-blue-50/60 transition-colors"
                    >
                      <Bell className="w-4 h-4" />
                      <span className="text-[12px] font-medium">Activează notificările</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {!expanded && (
              <div className="mt-3 border-t border-[var(--border-subtle)] pt-3 flex justify-center">
                {notifPermission === "unavailable" ? null : notifPermission === "granted" ? (
                  <Tooltip.Root delayDuration={0}>
                    <Tooltip.Trigger asChild>
                      <div className="relative p-2.5 text-emerald-600">
                        <Bell className="w-[18px] h-[18px]" />
                        <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </div>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content side="right" sideOffset={8} className="z-50 rounded-[var(--radius-badge)] bg-[var(--accent-primary)] px-2.5 py-1.5 text-[12px] font-medium text-white shadow-[var(--shadow-dropdown)]">
                        Notificări active
                        <Tooltip.Arrow className="fill-[var(--accent-primary)]" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                ) : notifPermission === "denied" ? (
                  <Tooltip.Root delayDuration={0}>
                    <Tooltip.Trigger asChild>
                      <div className="p-2.5 text-[var(--text-tertiary)]">
                        <BellOff className="w-[18px] h-[18px]" />
                      </div>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content side="right" sideOffset={8} className="z-50 rounded-[var(--radius-badge)] bg-[var(--accent-primary)] px-2.5 py-1.5 text-[12px] font-medium text-white shadow-[var(--shadow-dropdown)]">
                        Notificări blocate
                        <Tooltip.Arrow className="fill-[var(--accent-primary)]" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                ) : (
                  <Tooltip.Root delayDuration={0}>
                    <Tooltip.Trigger asChild>
                      <button onClick={handleEnableNotifications} className="p-2.5 rounded-[var(--radius-badge)] text-[var(--accent-blue)] hover:bg-blue-50/60 transition-colors">
                        <Bell className="w-[18px] h-[18px]" />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content side="right" sideOffset={8} className="z-50 rounded-[var(--radius-badge)] bg-[var(--accent-primary)] px-2.5 py-1.5 text-[12px] font-medium text-white shadow-[var(--shadow-dropdown)]">
                        Activează notificările
                        <Tooltip.Arrow className="fill-[var(--accent-primary)]" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── User profile ───────────────────────────────────────── */}
        <div className={` ${expanded ? "px-3 py-3" : "px-1.5 py-3"}`}>
          {expanded ? (
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              {user?.avatar ? (
                <Image src={user.avatar} width={32} height={32} alt={user?.name ?? ""} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-semibold text-white">{initials}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">{user?.name ?? "—"}</p>
                <p className="text-[11px] text-[var(--text-tertiary)] truncate">{user?.email ?? ""}</p>
              </div>
              <button onClick={handleLogout} className="p-1.5 rounded-[var(--radius-badge)] text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-50/60 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Tooltip.Root delayDuration={0}>
                <Tooltip.Trigger asChild>
                  <div>
                    {user?.avatar ? (
                      <Image src={user.avatar} width={32} height={32} alt={user?.name ?? ""} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] flex items-center justify-center">
                        <span className="text-[10px] font-semibold text-white">{initials}</span>
                      </div>
                    )}
                  </div>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content side="right" sideOffset={8} className="z-50 rounded-[var(--radius-badge)] bg-[var(--accent-primary)] px-2.5 py-1.5 text-[12px] font-medium text-white shadow-[var(--shadow-dropdown)]">
                    {user?.name ?? "—"}
                    <Tooltip.Arrow className="fill-[var(--accent-primary)]" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
              <Tooltip.Root delayDuration={0}>
                <Tooltip.Trigger asChild>
                  <button onClick={handleLogout} className="p-1.5 rounded-[var(--radius-badge)] text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-50/60 transition-colors">
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content side="right" sideOffset={8} className="z-50 rounded-[var(--radius-badge)] bg-[var(--accent-primary)] px-2.5 py-1.5 text-[12px] font-medium text-white shadow-[var(--shadow-dropdown)]">
                    Deconectare
                    <Tooltip.Arrow className="fill-[var(--accent-primary)]" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </div>
          )}
        </div>
      </div>
    </Tooltip.Provider>
  );
}
