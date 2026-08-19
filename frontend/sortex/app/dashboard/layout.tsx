"use client";

import React, { useState } from "react";
import { NotificationProvider } from "../context/NotificationContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [token] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token") || "";
    }
    return "";
  });

  return (
    <NotificationProvider token={token}>
      <div className="min-h-screen bg-stone-50 flex flex-col">
        {/* Main Content Area (Dashboards handle their own internal nav/sidebars) */}
        <main className="flex-1">{children}</main>
      </div>
    </NotificationProvider>
  );
}