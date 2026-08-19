"use client";

import React from "react";
import NotificationIconToggle from "@/app/components/NotificationIconToggle";
import { ThemeToggle } from "@/app/components/ThemeToggle";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-stone-50 dark:bg-neutral-950">
      {/* Main Content View (Your active dashboard page renders here) */}
      <main className="flex-1 flex flex-col min-w-0">{children}</main>

      {/* Global Fixed Control Sidebar (Written once, shared globally) */}
      <aside className="w-20 border-l border-stone-200 dark:border-white/10 bg-white dark:bg-neutral-900 flex flex-col items-center justify-between py-6 sticky top-0 h-screen">
        <div className="font-bold text-xs tracking-tighter text-emerald-600">SORTEX</div>

        {/* The Notification Bell + Theme Toggle stacked together */}
        <div className="flex flex-col items-center gap-4 w-full px-3">
          <NotificationIconToggle />
          <ThemeToggle variant="sidebar" />
        </div>

        <div className="text-[10px] text-stone-400">v1.0</div>
      </aside>
    </div>
  );
}