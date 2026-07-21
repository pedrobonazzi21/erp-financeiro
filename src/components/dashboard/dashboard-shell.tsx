"use client";

import { SettingsProvider } from "@/lib/settings-context";
import { ThemeApplier } from "@/lib/theme-provider";
import { DashboardSidebar } from "./sidebar";
import { DashboardHeader } from "./header";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ThemeApplier>
        <div className="flex h-screen overflow-hidden">
          <DashboardSidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <DashboardHeader />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
      </ThemeApplier>
    </SettingsProvider>
  );
}
