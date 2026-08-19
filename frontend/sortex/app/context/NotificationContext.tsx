"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, startTransition } from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  severity: "info" | "warning" | "critical" | "success";
  read: boolean;
  created_at: string;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export function NotificationProvider({ token, children }: { token: string; children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activePopup, setActivePopup] = useState<Notification | null>(null);

  const getActiveToken = useCallback(() => {
    if (token) return token;
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token") || "";
    }
    return "";
  }, [token]);

  const fetchNotifications = useCallback(async () => {
    const activeToken = getActiveToken();
    if (!activeToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (res.ok) {
        const data: Notification[] = await res.json();
        
        startTransition(() => {
          setNotifications(prev => {
            if (prev.length > 0 && data.length > prev.length) {
              const latest = data[0];
              if (!latest.read) {
                setActivePopup(latest);
              }
            } else if (prev.length === 0 && data.length > 0) {
              const latest = data[0];
              if (!latest.read) {
                setActivePopup(latest);
              }
            }
            return data;
          });
        });
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  }, [getActiveToken]);

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      const activeToken = getActiveToken();
      if (!activeToken) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/notifications/`, {
          headers: { Authorization: `Bearer ${activeToken}` },
        });
        if (res.ok && isMounted) {
          const data: Notification[] = await res.json();
          startTransition(() => {
            setNotifications(data);
          });
        }
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    loadInitialData();
    const interval = setInterval(fetchNotifications, 10000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [token, fetchNotifications, getActiveToken]);

  const markAsRead = async (id: string) => {
    // Optimistic UI state update in React
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    if (activePopup?.id === id) {
      setActivePopup(null);
    }

    const activeToken = getActiveToken();
    if (!activeToken) return;

    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${activeToken}` },
      });
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, refreshNotifications: fetchNotifications }}>
      {children}

      {/* Real-Time Toast Popup when user is on the dashboard */}
      {activePopup && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 animate-slide-up flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {activePopup.severity === "warning" || activePopup.severity === "critical" ? (
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            ) : activePopup.severity === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            ) : (
              <Info className="w-5 h-5 text-blue-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{activePopup.title}</p>
            <p className="text-xs text-gray-600 mt-0.5">{activePopup.message}</p>
            {activePopup.link && (
              <a
                href={activePopup.link}
                onClick={() => setActivePopup(null)}
                className="text-xs font-medium text-emerald-600 hover:underline mt-1 inline-block"
              >
                View details &rarr;
              </a>
            )}
          </div>
          <button
            onClick={() => setActivePopup(null)}
            className="text-gray-400 hover:text-gray-600 self-start"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}