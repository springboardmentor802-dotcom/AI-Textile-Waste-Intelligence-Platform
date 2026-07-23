import {
  LayoutDashboard,
  Package,
  Recycle,
  Brain,
  BarChart3,
  Users,
  Settings,
  ClipboardList,
} from "lucide-react";

export const sidebarMenus = {
  administrator: [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin",
    },
    {
      label: "Users",
      icon: Users,
      path: "/users",
    },
    {
      label: "Analytics",
      icon: BarChart3,
      path: "/analytics",
    },
    {
      label: "Inventory",
      path: "/inventory",
      icon: Package,
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ],

  manufacturer: [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/manufacturer",
    },
    {
      label: "Inventory",
      icon: Package,
      path: "/inventory",
    },
    {
      label: "Waste Upload",
      icon: Recycle,
      path: "/waste-upload",
    },
    {
      label: "AI Detection",
      icon: Brain,
      path: "/ai-detection",
    },
    {
      label: "Reports",
      icon: ClipboardList,
      path: "/reports",
    },
  ],

  recycler: [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/recycler",
    },
    {
      label: "Collections",
      icon: Recycle,
      path: "/collections",
    },
    {
      label: "Processing",
      icon: Package,
      path: "/processing",
    },
    {
      label: "Reports",
      icon: ClipboardList,
      path: "/reports",
    },
  ],

  manager: [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/manager",
    },
    {
      label: "Analytics",
      icon: BarChart3,
      path: "/analytics",
    },
    {
      label: "AI Insights",
      icon: Brain,
      path: "/ai-insights",
    },
    {
      label: "Reports",
      icon: ClipboardList,
      path: "/reports",
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ],
};