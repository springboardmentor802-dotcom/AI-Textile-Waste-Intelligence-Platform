"use client";

import React, { useState, useRef } from "react";
import { Bell, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition focus:outline-none"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            <span className="text-xs text-gray-500">{unreadCount} unread</span>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-sm text-gray-500">No notifications found.</p>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-4 transition hover:bg-gray-50 flex gap-3 ${
                    !n.read ? "bg-emerald-50/40" : ""
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {n.severity === "warning" || n.severity === "critical" ? (
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    ) : n.severity === "success" ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Info className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{n.message}</p>
                    {n.link && (
                      <a
                        href={n.link}
                        className="text-xs font-semibold text-emerald-600 hover:underline mt-1 inline-block"
                      >
                        View details &rarr;
                      </a>
                    )}
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="self-center text-xs text-gray-400 hover:text-emerald-600"
                      title="Mark as read"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}