"use client";

import { SidebarProvider } from "@/context/SidebarContext";
import { AppSidebar } from "./AppSidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <div className="h-screen bg-[var(--under-bg)] p-3">
        <div className="h-full bg-[var(--sidebar-bg)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] overflow-hidden flex">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden py-2 pr-2">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
