"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle, AlertTriangle, Info, Check } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { useTheme } from "./ThemeProvider";

interface NotificationIconToggleProps {
  className?: string;
  variant?: "sidebar" | "compact";
}

export default function NotificationIconToggle({
  className = "",
  variant = "sidebar",
}: NotificationIconToggleProps) {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (variant === "compact") {
    return (
      <div className={`relative flex flex-col items-center w-full ${className}`} ref={dropdownRef}>
        <span className="text-[10px] font-bold text-stone-400 dark:text-neutral-500 uppercase tracking-wider mb-1">
          Alerts
        </span>

        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="relative w-full flex items-center justify-center p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-stone-700 dark:text-neutral-300 transition-all border border-stone-200 dark:border-white/10 shadow-sm"
          title="Notifications"
        >
          <Bell className="w-4 h-4 text-orange-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4.5 h-4.5 flex items-center justify-center rounded-full font-bold shadow-sm animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute left-full ml-3 bottom-0 w-80 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-white/10 z-[9999] overflow-hidden text-left">
            <div className="flex items-center justify-between px-4 py-3 bg-stone-50 dark:bg-neutral-800 border-b border-stone-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-orange-400" />
                <h3 className="font-semibold text-stone-800 dark:text-white text-xs">Notifications</h3>
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
                {unreadCount} unread
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 dark:divide-neutral-800">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="w-8 h-8 text-stone-300 dark:text-neutral-600 mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-stone-500 dark:text-neutral-400 font-medium">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 transition-all flex gap-3 ${
                      !n.read
                        ? "bg-amber-500/5 dark:bg-orange-500/10"
                        : "hover:bg-stone-50 dark:hover:bg-neutral-800/40"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {n.severity === "warning" || n.severity === "critical" ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      ) : n.severity === "success" ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Info className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold text-stone-900 dark:text-white truncate">{n.title}</p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />}
                      </div>
                      <p className="text-[11px] text-stone-600 dark:text-neutral-300 mt-1 leading-relaxed">{n.message}</p>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-100 dark:border-white/5">
                        {n.link ? (
                          <a
                            href={n.link}
                            className="text-[10px] font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 hover:underline flex items-center gap-1"
                          >
                            View details &rarr;
                          </a>
                        ) : <span />}
                        {!n.read && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="text-[10px] font-medium text-stone-400 hover:text-emerald-500 dark:text-neutral-400 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Sidebar variant matching ThemeToggle sidebar style
  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border shadow-sm ${
          theme === "light"
            ? "bg-amber-100/80 text-amber-950 border-amber-300/80 hover:bg-amber-200/80"
            : "bg-neutral-900 text-neutral-300 border-white/10 hover:bg-neutral-800 hover:text-white"
        }`}
        title="View Notifications"
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Bell className="w-4 h-4 text-orange-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold shadow-sm animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <span className="font-medium text-xs sm:text-sm">Notifications</span>
        </div>

        {unreadCount > 0 ? (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
            {unreadCount} New
          </span>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-500 border border-orange-500/20">
            Alerts
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-white/10 z-[9999] overflow-hidden text-left">
          <div className="flex items-center justify-between px-4 py-3 bg-stone-50 dark:bg-neutral-800/80 border-b border-stone-100 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-400" />
              <h3 className="font-semibold text-stone-800 dark:text-white text-xs">Notifications</h3>
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
              {unreadCount} unread
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 dark:divide-neutral-800/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 text-stone-300 dark:text-neutral-600 mx-auto mb-2 opacity-50" />
                <p className="text-xs text-stone-500 dark:text-neutral-400 font-medium">No notifications found</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 transition-all flex gap-3 ${
                    !n.read
                      ? "bg-amber-500/5 dark:bg-orange-500/10"
                      : "hover:bg-stone-50 dark:hover:bg-neutral-800/40"
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {n.severity === "warning" || n.severity === "critical" ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : n.severity === "success" ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Info className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-stone-900 dark:text-white truncate">{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />}
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-neutral-300 mt-1 leading-relaxed">{n.message}</p>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-100 dark:border-white/5">
                      {n.link ? (
                        <a
                          href={n.link}
                          className="text-[10px] font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 hover:underline flex items-center gap-1"
                        >
                          View details &rarr;
                        </a>
                      ) : <span />}
                      {!n.read && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="text-[10px] font-medium text-stone-400 hover:text-emerald-500 dark:text-neutral-400 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}